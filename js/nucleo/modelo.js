/*
 * Escólio Theory
 * Fábrica e operações básicas do modelo de dados.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const Escolio = global.Escolio;
  const modelo = {};
  function id(prefixo) {
    return (prefixo || "id") + "-" + (global.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10));
  }
  modelo.clonar = function (valor) {
    return JSON.parse(JSON.stringify(valor));
  };
  modelo.criarProjeto = function (titulo, autor) {
    const agora = new Date().toISOString();
    return {
      escolio: Escolio.config.versaoFormato,
      projeto: { id: id("projeto"), titulo: titulo || "Novo projeto", autor: autor || "", criadoEm: agora, atualizadoEm: agora },
      pacotes: [],
      pastas: [],
      paletas: [],
      nos: [],
      arestas: [],
      escolios: [],
      visoes: [{ id: id("visao"), tipo: "mapa-conceitual", raiz: null, configuracao: {} }]
    };
  };
  modelo.criarNo = function (dados) {
    dados = dados || {};
    return {
      id: dados.id || id("no"),
      tipo: dados.tipo || "conceito",
      titulo: dados.titulo || "Novo elemento",
      corpo: dados.corpo || "",
      campos: modelo.clonar(dados.campos || {}),
      pastaId: dados.pastaId || null,
      pos: { x: Number(dados.pos && dados.pos.x) || 0, y: Number(dados.pos && dados.pos.y) || 0 },
      estilo: { cor: dados.estilo && dados.estilo.cor || "#2b4c7e" }
    };
  };
  modelo.criarAresta = function (de, para, dados) {
    dados = dados || {};
    return { id: dados.id || id("aresta"), de: de, para: para, rotulo: typeof dados.rotulo === "string" ? dados.rotulo : "", modo: dados.modo === "proposicao" ? "proposicao" : "livre", tipo: dados.tipo || "relacao", pontos: dados.pontos ? modelo.clonar(dados.pontos) : null };
  };
  modelo.criarEscolio = function (alvo, texto, tipo, dados) {
    dados = dados || {};
    return { id: dados.id || id("escolio"), alvo: alvo, tipo: tipo || "comentario", texto: texto || "" };
  };
  modelo.buscarAlvo = function (projeto, alvo) {
    return projeto.nos.find(n => n.id === alvo) || projeto.arestas.find(a => a.id === alvo) || null;
  };
  modelo.removerNo = function (projeto, identificador) {
    projeto.nos = projeto.nos.filter(n => n.id !== identificador);
    const arestasRemovidas = projeto.arestas.filter(a => a.de === identificador || a.para === identificador).map(a => a.id);
    projeto.arestas = projeto.arestas.filter(a => a.de !== identificador && a.para !== identificador);
    const alvos = new Set([identificador].concat(arestasRemovidas));
    projeto.escolios = projeto.escolios.filter(e => !alvos.has(e.alvo));
    return arestasRemovidas;
  };
  Escolio.nucleo = Escolio.nucleo || {};
  Escolio.nucleo.modelo = modelo;
  global.Escolio = Escolio;
})(window);
