/*
 * Escólio Theory
 * Validação de projetos e pacotes importados.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const cfg = global.Escolio.config;
  const validacao = {};
  const tiposNo = new Set(cfg.tiposNoNucleo);
  const tiposAresta = new Set(cfg.tiposAresta);
  const tiposEscolio = new Set(cfg.tiposEscolio);
  const tiposCampo = new Set(cfg.tiposCampo);
  function resultado(erros) { return { valido: erros.length === 0, erros: erros }; }
  function texto(valor, nome, erros, max) {
    if (typeof valor !== "string") erros.push(nome + " deve ser texto.");
    else if (valor.length > (max || cfg.tamanhoMaximoTexto)) erros.push(nome + " excede o limite de tamanho.");
  }
  function idsUnicos(lista, nome, erros) {
    const vistos = new Set();
    lista.forEach(item => {
      if (!item || typeof item.id !== "string" || !item.id) erros.push(nome + " contém identificador inválido.");
      else if (vistos.has(item.id)) erros.push("Identificador duplicado em " + nome + ": " + item.id);
      else vistos.add(item.id);
    });
  }
  validacao.validarPacote = function (p) {
    const erros = [];
    if (!p || typeof p !== "object") return resultado(["Pacote precisa ser um objeto."]);
    texto(p.pacote, "Identificador do pacote", erros, 80);
    texto(p.versao, "Versão do pacote", erros, 30);
    texto(p.nome, "Nome do pacote", erros, 120);
    ["tipos", "relacoes", "modelos", "visoes"].forEach(k => { if (!Array.isArray(p[k])) erros.push(k + " precisa ser uma lista."); });
    if (Array.isArray(p.tipos)) {
      idsUnicos(p.tipos, "tipos do pacote", erros);
      p.tipos.forEach(t => {
        texto(t.nome, "Nome do tipo", erros, 120);
        if (!Array.isArray(t.campos)) erros.push("Campos do tipo " + t.id + " precisam ser uma lista.");
        else t.campos.forEach(c => {
          texto(c.id, "Identificador de campo", erros, 80);
          if (!tiposCampo.has(c.tipo)) erros.push("Tipo de campo inválido: " + c.tipo);
        });
      });
    }
    return resultado(erros);
  };
  validacao.validarProjeto = function (p) {
    const erros = [];
    if (!p || typeof p !== "object") return resultado(["Projeto precisa ser um objeto."]);
    if (p.escolio !== cfg.versaoFormato) erros.push("Versão do formato incompatível.");
    if (!p.projeto || typeof p.projeto !== "object") erros.push("Metadados do projeto ausentes.");
    else texto(p.projeto.titulo, "Título do projeto", erros, 500);
    ["pacotes", "nos", "arestas", "escolios", "visoes"].forEach(k => {
      if (!Array.isArray(p[k])) erros.push(k + " precisa ser uma lista.");
    });
    if (erros.length) return resultado(erros);
    p.pacotes.forEach(pkg => {
      const r = validacao.validarPacote(pkg);
      if (!r.valido) erros.push.apply(erros, r.erros);
    });
    idsUnicos(p.nos, "nós", erros);
    idsUnicos(p.arestas, "arestas", erros);
    idsUnicos(p.escolios, "escólios", erros);
    const nos = new Set(p.nos.map(n => n.id));
    const arestas = new Set(p.arestas.map(a => a.id));
    const tiposPersonalizados = new Set();
    p.pacotes.forEach(pkg => pkg.tipos.forEach(t => tiposPersonalizados.add(t.id)));
    p.nos.forEach(n => {
      if (!tiposNo.has(n.tipo) && !tiposPersonalizados.has(n.tipo)) erros.push("Tipo de nó não declarado: " + n.tipo);
      texto(n.titulo, "Título do nó", erros, 500);
      texto(n.corpo, "Corpo do nó", erros);
      if (!n.pos || !Number.isFinite(n.pos.x) || !Number.isFinite(n.pos.y)) erros.push("Posição inválida no nó " + n.id);
      if (!n.estilo || typeof n.estilo.cor !== "string" || !/^#[0-9a-f]{6}$/i.test(n.estilo.cor)) erros.push("Cor inválida no nó " + n.id);
    });
    p.arestas.forEach(a => {
      if (!nos.has(a.de) || !nos.has(a.para)) erros.push("Aresta " + a.id + " aponta para nó inexistente.");
      if (!tiposAresta.has(a.tipo)) erros.push("Tipo de aresta inválido: " + a.tipo);
      texto(a.rotulo, "Rótulo da aresta", erros, 300);
    });
    p.escolios.forEach(e => {
      if (!nos.has(e.alvo) && !arestas.has(e.alvo)) erros.push("Escólio " + e.id + " aponta para alvo inexistente.");
      if (!tiposEscolio.has(e.tipo)) erros.push("Tipo de escólio inválido: " + e.tipo);
      texto(e.texto, "Texto do escólio", erros);
    });
    p.visoes.forEach(v => { if (typeof v.tipo !== "string") erros.push("Visão com tipo inválido."); });
    return resultado(erros);
  };
  global.Escolio.nucleo.validacao = validacao;
})(window);
