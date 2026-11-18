/*
 * Escólio Theory
 * Pacote disciplinar de filosofia.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  global.Escolio.pacotes.registrar({
    pacote: "filosofia", versao: "1.0", nome: "Filosofia",
    tipos: [
      { id: "autor", nome: "Autor", cor: "#2b4c7e", campos: [{ id: "periodo", tipo: "texto" }, { id: "obras", tipo: "lista" }] },
      { id: "corrente", nome: "Corrente filosófica", cor: "#72548c", campos: [{ id: "periodo", tipo: "texto" }, { id: "principios", tipo: "lista" }, { id: "contexto", tipo: "texto" }] },
      { id: "argumento", nome: "Argumento", cor: "#8a5b35", campos: [{ id: "premissas", tipo: "lista" }, { id: "conclusao", tipo: "texto" }] },
      { id: "tese", nome: "Tese", cor: "#47745b", campos: [{ id: "enunciado", tipo: "texto" }, { id: "fundamentacao", tipo: "texto" }] }
    ],
    relacoes: ["defende", "refuta", "influencia", "critica", "fundamenta", "contradiz"],
    modelos: ["argumento-silogistico", "comparacao-de-correntes", "analise-de-tese"],
    visoes: ["mapa-conceitual", "linha-do-tempo"]
  });
})(window);
