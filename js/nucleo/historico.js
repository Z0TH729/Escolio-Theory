/*
 * Escólio Theory
 * Histórico de snapshots para desfazer e refazer.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const modelo = global.Escolio.nucleo.modelo;
  const historico = {};
  historico.criar = function (limite) {
    return { anterior: [], posterior: [], limite: limite || Infinity };
  };
  historico.registrar = function (pilha, estadoAnterior) {
    pilha.anterior.push(modelo.clonar(estadoAnterior));
    if (pilha.anterior.length > pilha.limite) pilha.anterior.shift();
    pilha.posterior.length = 0;
  };
  historico.desfazer = function (pilha, estadoAtual) {
    if (!historico.podeDesfazer(pilha)) return null;
    pilha.posterior.push(modelo.clonar(estadoAtual));
    return pilha.anterior.pop();
  };
  historico.refazer = function (pilha, estadoAtual) {
    if (!historico.podeRefazer(pilha)) return null;
    pilha.anterior.push(modelo.clonar(estadoAtual));
    return pilha.posterior.pop();
  };
  historico.podeDesfazer = pilha => pilha.anterior.length > 0;
  historico.podeRefazer = pilha => pilha.posterior.length > 0;
  historico.limpar = pilha => { pilha.anterior.length = 0; pilha.posterior.length = 0; };
  global.Escolio.nucleo.historico = historico;
})(window);
