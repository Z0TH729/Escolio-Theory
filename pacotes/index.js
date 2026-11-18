/*
 * Escólio Theory
 * Registro central dos pacotes disciplinares.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const E = global.Escolio;
  const armazenados = new Map();
  const registro = {};
  registro.registrar = function (pacote) {
    const r = E.nucleo.validacao.validarPacote(pacote);
    if (!r.valido) throw new Error("Pacote rejeitado: " + r.erros.join(" "));
    if (armazenados.has(pacote.pacote)) throw new Error("Pacote duplicado: " + pacote.pacote);
    armazenados.set(pacote.pacote, E.nucleo.modelo.clonar(pacote));
    return true;
  };
  registro.obter = id => armazenados.has(id) ? E.nucleo.modelo.clonar(armazenados.get(id)) : null;
  registro.listar = () => Array.from(armazenados.values()).map(E.nucleo.modelo.clonar);
  registro.existe = id => armazenados.has(id);
  registro.adicionarAoProjeto = function (projeto, id) {
    const pacote = registro.obter(id);
    if (!pacote) throw new Error("Pacote não encontrado: " + id);
    if (!projeto.pacotes.some(p => p.pacote === id)) projeto.pacotes.push(pacote);
    return pacote;
  };
  E.pacotes = registro;
})(window);
