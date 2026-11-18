/*
 * Escólio Theory
 * Migração versionada do formato de projeto.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const modelo = global.Escolio.nucleo.modelo;
  const migracao = {};
  migracao.paraVersaoAtual = function (entrada) {
    const projeto = modelo.clonar(entrada);
    if (!projeto || typeof projeto !== "object") throw new Error("Projeto inválido.");
    if (projeto.escolio === "0.1") {
      projeto.pacotes = Array.isArray(projeto.pacotes) ? projeto.pacotes : [];
      projeto.nos = Array.isArray(projeto.nos) ? projeto.nos : [];
      projeto.arestas = Array.isArray(projeto.arestas) ? projeto.arestas : [];
      projeto.escolios = Array.isArray(projeto.escolios) ? projeto.escolios : [];
      projeto.visoes = Array.isArray(projeto.visoes) ? projeto.visoes : [];
      projeto.visoes = projeto.visoes.map(v => Object.assign({ configuracao: {} }, v));
      projeto.escolio = global.Escolio.config.versaoFormato;
      return projeto;
    }
    if (projeto.escolio !== global.Escolio.config.versaoFormato) {
      throw new Error("Versão de arquivo não suportada: " + projeto.escolio);
    }
    return projeto;
  };
  global.Escolio.nucleo.migracao = migracao;
})(window);
