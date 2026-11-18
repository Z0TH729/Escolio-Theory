/*
 * Escólio Theory
 * Validação defensiva de projetos e pacotes importados.
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

  function objeto(valor) {
    return valor !== null && typeof valor === "object" && !Array.isArray(valor);
  }
  function resultado(erros) {
    return { valido: erros.length === 0, erros: erros };
  }
  function texto(valor, nome, erros, max) {
    if (typeof valor !== "string") erros.push(nome + " deve ser texto.");
    else if (valor.length > (max || cfg.tamanhoMaximoTexto)) erros.push(nome + " excede o limite de tamanho.");
  }
  function lista(valor, nome, erros) {
    if (!Array.isArray(valor)) {
      erros.push(nome + " precisa ser uma lista.");
      return false;
    }
    return true;
  }
  function idsUnicos(itens, nome, erros) {
    const vistos = new Set();
    itens.forEach((item, indice) => {
      if (!objeto(item)) {
        erros.push(nome + " contém um item inválido na posição " + indice + ".");
        return;
      }
      if (typeof item.id !== "string" || !item.id.trim()) {
        erros.push(nome + " contém identificador inválido.");
      } else if (vistos.has(item.id)) {
        erros.push("Identificador duplicado em " + nome + ": " + item.id);
      } else {
        vistos.add(item.id);
      }
    });
  }

  validacao.validarPacote = function (p) {
    const erros = [];
    if (!objeto(p)) return resultado(["Pacote precisa ser um objeto."]);

    texto(p.pacote, "Identificador do pacote", erros, 80);
    texto(p.versao, "Versão do pacote", erros, 30);
    texto(p.nome, "Nome do pacote", erros, 120);

    ["tipos", "relacoes", "modelos", "visoes"].forEach(k => lista(p[k], k, erros));

    if (Array.isArray(p.tipos)) {
      idsUnicos(p.tipos, "tipos do pacote", erros);
      p.tipos.forEach((t, indice) => {
        if (!objeto(t)) return;
        texto(t.nome, "Nome do tipo na posição " + indice, erros, 120);
        if (t.cor !== undefined && (typeof t.cor !== "string" || !/^#[0-9a-f]{6}$/i.test(t.cor))) {
          erros.push("Cor inválida no tipo " + (t.id || indice) + ".");
        }
        if (!lista(t.campos, "Campos do tipo " + (t.id || indice), erros)) return;
        idsUnicos(t.campos, "campos do tipo " + (t.id || indice), erros);
        t.campos.forEach((c, campoIndice) => {
          if (!objeto(c)) return;
          texto(c.id, "Identificador do campo " + campoIndice, erros, 80);
          if (typeof c.tipo !== "string" || !tiposCampo.has(c.tipo)) {
            erros.push("Tipo de campo inválido: " + c.tipo);
          }
        });
      });
    }
    return resultado(erros);
  };

  validacao.validarProjeto = function (p) {
    const erros = [];
    if (!objeto(p)) return resultado(["Projeto precisa ser um objeto."]);
    if (p.escolio !== cfg.versaoFormato) erros.push("Versão do formato incompatível.");

    if (!objeto(p.projeto)) {
      erros.push("Metadados do projeto ausentes ou inválidos.");
    } else {
      texto(p.projeto.id, "Identificador do projeto", erros, 120);
      texto(p.projeto.titulo, "Título do projeto", erros, 500);
      if (p.projeto.autor !== undefined) texto(p.projeto.autor, "Autor do projeto", erros, 300);
      ["criadoEm", "atualizadoEm"].forEach(k => {
        if (p.projeto[k] !== undefined) texto(p.projeto[k], k + " do projeto", erros, 40);
      });
    }

    const chaves = ["pacotes", "nos", "arestas", "escolios", "visoes"];
    const listasValidas = {};
    chaves.forEach(k => { listasValidas[k] = lista(p[k], k, erros); });
    if (erros.length) return resultado(erros);

    p.pacotes.forEach((pkg, indice) => {
      const r = validacao.validarPacote(pkg);
      if (!r.valido) r.erros.forEach(e => erros.push("Pacote " + indice + ": " + e));
    });

    idsUnicos(p.nos, "nós", erros);
    idsUnicos(p.arestas, "arestas", erros);
    idsUnicos(p.escolios, "escólios", erros);
    idsUnicos(p.visoes, "visões", erros);

    const nos = new Set(p.nos.filter(objeto).map(n => n.id));
    const arestas = new Set(p.arestas.filter(objeto).map(a => a.id));
    const tiposPersonalizados = new Set();
    p.pacotes.forEach(pkg => {
      if (objeto(pkg) && Array.isArray(pkg.tipos)) {
        pkg.tipos.forEach(t => { if (objeto(t) && typeof t.id === "string") tiposPersonalizados.add(t.id); });
      }
    });

    p.nos.forEach(n => {
      if (!objeto(n)) return;
      if (typeof n.tipo !== "string" || (!tiposNo.has(n.tipo) && !tiposPersonalizados.has(n.tipo))) {
        erros.push("Tipo de nó não declarado: " + n.tipo);
      }
      texto(n.titulo, "Título do nó " + n.id, erros, 500);
      texto(n.corpo, "Corpo do nó " + n.id, erros);
      if (!objeto(n.campos)) erros.push("Campos inválidos no nó " + n.id + ".");
      if (!objeto(n.pos) || !Number.isFinite(n.pos.x) || !Number.isFinite(n.pos.y)) {
        erros.push("Posição inválida no nó " + n.id + ".");
      }
      if (!objeto(n.estilo) || typeof n.estilo.cor !== "string" || !/^#[0-9a-f]{6}$/i.test(n.estilo.cor)) {
        erros.push("Cor inválida no nó " + n.id + ".");
      }
    });

    const pares = new Set();
    p.arestas.forEach(a => {
      if (!objeto(a)) return;
      if (!nos.has(a.de) || !nos.has(a.para)) erros.push("Aresta " + a.id + " aponta para nó inexistente.");
      if (a.de === a.para) erros.push("Aresta " + a.id + " não pode conectar um nó a ele mesmo.");
      if (typeof a.tipo !== "string" || !tiposAresta.has(a.tipo)) erros.push("Tipo de aresta inválido: " + a.tipo);
      texto(a.rotulo, "Rótulo da aresta " + a.id, erros, 300);
      if (a.cor !== undefined && (typeof a.cor !== "string" || !/^#[0-9a-f]{6}$/i.test(a.cor))) erros.push("Cor inválida na aresta " + a.id + ".");
      if (a.pontos !== undefined && a.pontos !== null) {
        const lados = new Set(["esquerda", "direita", "cima", "baixo"]);
        if (!objeto(a.pontos) || !lados.has(a.pontos.de) || !lados.has(a.pontos.para)) erros.push("Pontos de conexão inválidos na aresta " + a.id + ".");
      }
      const chave = JSON.stringify([a.de, a.para, a.tipo]);
      if (pares.has(chave)) erros.push("Relação duplicada entre " + a.de + " e " + a.para + ".");
      pares.add(chave);
    });

    p.escolios.forEach(e => {
      if (!objeto(e)) return;
      if (!nos.has(e.alvo) && !arestas.has(e.alvo)) erros.push("Escólio " + e.id + " aponta para alvo inexistente.");
      if (typeof e.tipo !== "string" || !tiposEscolio.has(e.tipo)) erros.push("Tipo de escólio inválido: " + e.tipo);
      texto(e.texto, "Texto do escólio " + e.id, erros);
    });

    p.visoes.forEach(v => {
      if (!objeto(v) || typeof v.tipo !== "string" || !v.tipo.trim()) erros.push("Visão com tipo inválido.");
      else if (v.configuracao !== undefined && !objeto(v.configuracao)) erros.push("Configuração de visão inválida: " + v.id);
    });
    return resultado(erros);
  };

  global.Escolio.nucleo.validacao = validacao;
})(window);
