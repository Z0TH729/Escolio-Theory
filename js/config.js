/*
 * Escólio Theory
 * Configuração central da aplicação.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const Escolio = global.Escolio || {};
  Escolio.config = Object.freeze({
    nome: "Escólio Theory",
    nomeCurto: "Escólio",
    versao: "0.1.0",
    versaoFormato: "0.1",
    tamanhoMaximoArquivo: 5 * 1024 * 1024,
    tamanhoMaximoTexto: 100000,
    tiposNoNucleo: ["conceito", "teoria", "aplicacao", "etapa", "entidade", "nota", "imagem", "formula"],
    tiposAresta: ["relacao", "hierarquia", "sequencia", "referencia"],
    tiposEscolio: ["aplicacao", "exemplo", "exercicio", "referencia", "duvida", "comentario"],
    tiposCampo: ["texto", "lista", "numero", "data", "formula", "codigo", "citacao", "link"]
  });
  global.Escolio = Escolio;
})(window);
