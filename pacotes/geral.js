/*
 * Escólio Theory
 * Pacote disciplinar geral.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  global.Escolio.pacotes.registrar({
    pacote: "geral", versao: "1.0", nome: "Conhecimento geral",
    tipos: [
      { id: "definicao", nome: "Definição", cor: "#2b4c7e", campos: [{ id: "termo", tipo: "texto" }, { id: "definicao", tipo: "texto" }] },
      { id: "exemplo", nome: "Exemplo", cor: "#47745b", campos: [{ id: "contexto", tipo: "texto" }, { id: "observacao", tipo: "texto" }] },
      { id: "hipotese", nome: "Hipótese", cor: "#8a6b35", campos: [{ id: "enunciado", tipo: "texto" }, { id: "evidencias", tipo: "lista" }] }
    ],
    relacoes: ["define", "exemplifica", "explica", "depende de", "contradiz", "complementa"],
    modelos: ["estudo-de-conceito", "investigacao", "resumo-teorico"],
    visoes: ["mapa-conceitual", "mapa-mental"]
  });
})(window);
