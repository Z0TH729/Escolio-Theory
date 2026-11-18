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
    const tipo = dados.tipo || "conceito";
    const estiloPadrao = tipo === "imagem" ? { cor: "#e8edf4", fundo: "transparent", contorno: "none" } : tipo === "texto" ? { cor: "#e8edf4", fundo: "transparent", contorno: "none", tamanhoFonte: 14, familiaFonte: null } : { cor: "#2b4c7e" };
    return {
      id: dados.id || id("no"),
      tipo: tipo,
      titulo: dados.titulo || "Novo elemento",
      corpo: dados.corpo || "",
      campos: modelo.clonar(dados.campos || {}),
      pastaId: dados.pastaId || null,
      pos: { x: Number(dados.pos && dados.pos.x) || 0, y: Number(dados.pos && dados.pos.y) || 0 },
      estilo: Object.assign(estiloPadrao, modelo.clonar(dados.estilo || {})),
      dimensoes: (tipo === "texto" || tipo === "imagem" || tipo === "formula") ? Object.assign(tipo === "imagem" ? { largura: 300, altura: 230, modoAltura: "manual" } : tipo === "formula" ? { largura: 440, altura: 360, modoAltura: "manual" } : { largura: 280, altura: null, modoAltura: "auto" }, modelo.clonar(dados.dimensoes || {})) : undefined,
      ancoras: (tipo === "texto" || tipo === "imagem") ? Object.assign({ esquerda: true, direita: true, cima: true, baixo: true }, modelo.clonar(dados.ancoras || {})) : undefined
    };
  };
  modelo.criarAresta = function (de, para, dados) {
    dados = dados || {};
    return {
      id: dados.id || id("aresta"), de: de, para: para,
      rotulo: typeof dados.rotulo === "string" ? dados.rotulo : "",
      modo: dados.modo === "proposicao" ? "proposicao" : "livre",
      tipo: dados.tipo || "relacao",
      pontos: dados.pontos ? modelo.clonar(dados.pontos) : null,
      cor: dados.cor || null,
      estilo: Object.assign({ geometria: "reta", tracado: "continuo", extremidadeInicial: "nenhuma", extremidadeFinal: "nenhuma", cor: null, espessura: 2, opacidade: 1 }, modelo.clonar(dados.estilo || {})),
      curvatura: Object.assign({ modo: "automatico", arqueamento: 48, controle1: null, controle2: null, pontos: [] }, modelo.clonar(dados.curvatura || {}))
    };
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
