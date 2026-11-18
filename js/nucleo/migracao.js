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
    if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
      throw new Error("Projeto inválido: era esperado um objeto JSON.");
    }
    let projeto;
    try {
      projeto = modelo.clonar(entrada);
    } catch (erro) {
      throw new Error("Não foi possível copiar os dados do projeto: " + erro.message);
    }
    if (!projeto || typeof projeto !== "object" || Array.isArray(projeto)) {
      throw new Error("Projeto inválido.");
    }

    if (projeto.escolio === "0.1") {
      if (!projeto.projeto || typeof projeto.projeto !== "object" || Array.isArray(projeto.projeto)) {
        throw new Error("Metadados do projeto ausentes ou inválidos.");
      }
      ["pacotes", "nos", "arestas", "escolios", "visoes"].forEach(chave => {
        if (projeto[chave] === undefined) projeto[chave] = [];
        else if (!Array.isArray(projeto[chave])) {
          throw new Error("O campo " + chave + " precisa ser uma lista.");
        }
      });
      if (!Array.isArray(projeto.pastas)) projeto.pastas = [];
      if (!Array.isArray(projeto.paletas)) projeto.paletas = [];
      projeto.nos.forEach(no => { if (no.pastaId === undefined) no.pastaId = null; });
      projeto.visoes = projeto.visoes.map((visao, indice) => {
        if (!visao || typeof visao !== "object" || Array.isArray(visao)) {
          throw new Error("Visão inválida na posição " + indice + ".");
        }
        return Object.assign({ configuracao: {} }, visao);
      });
      projeto.escolio = global.Escolio.config.versaoFormato;
      return projeto;
    }

    if (projeto.escolio !== global.Escolio.config.versaoFormato) {
      throw new Error("Versão de arquivo não suportada: " + String(projeto.escolio));
    }
    if (!Array.isArray(projeto.pastas)) projeto.pastas = [];
    if (!Array.isArray(projeto.paletas)) projeto.paletas = [];
    projeto.nos.forEach(no => { if (no.pastaId === undefined) no.pastaId = null; });
    return projeto;
  };

  global.Escolio.nucleo.migracao = migracao;
})(window);
