/*
 * Escólio Theory
 * Estado da sessão e comandos transacionais do projeto.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const E = global.Escolio;
  const estado = {};
  let projeto = E.nucleo.modelo.criarProjeto();
  const pilha = E.nucleo.historico.criar();
  const ouvintes = new Set();
  function emitir(tipo) { ouvintes.forEach(fn => fn(tipo, obterProjeto())); }
  function alterar(comando) {
    const antes = E.nucleo.modelo.clonar(projeto);
    comando(projeto);
    projeto.projeto.atualizadoEm = new Date().toISOString();
    const validado = E.nucleo.validacao.validarProjeto(projeto);
    if (!validado.valido) {
      projeto = antes;
      throw new Error(validado.erros.join("\n"));
    }
    E.nucleo.historico.registrar(pilha, antes);
    emitir("alteracao");
  }
  function obterProjeto() { return E.nucleo.modelo.clonar(projeto); }
  estado.obterProjeto = obterProjeto;
  estado.substituirProjeto = function (novo) {
    const migrado = E.nucleo.migracao.paraVersaoAtual(novo);
    const r = E.nucleo.validacao.validarProjeto(migrado);
    if (!r.valido) throw new Error(r.erros.join("\n"));
    projeto = E.nucleo.modelo.clonar(migrado);
    E.nucleo.historico.limpar(pilha);
    emitir("substituicao");
  };
  estado.assinar = function (ouvinte) { ouvintes.add(ouvinte); return () => ouvintes.delete(ouvinte); };
  estado.executar = alterar;
  estado.adicionarNo = function (dados) {
    let criado;
    alterar(p => { criado = E.nucleo.modelo.criarNo(dados); p.nos.push(criado); });
    return E.nucleo.modelo.clonar(criado);
  };
  estado.adicionarAresta = function (de, para, dados) {
    let criada;
    alterar(p => { criada = E.nucleo.modelo.criarAresta(de, para, dados); p.arestas.push(criada); });
    return E.nucleo.modelo.clonar(criada);
  };
  estado.adicionarEscolio = function (alvo, texto, tipo) {
    let criado;
    alterar(p => { criado = E.nucleo.modelo.criarEscolio(alvo, texto, tipo); p.escolios.push(criado); });
    return E.nucleo.modelo.clonar(criado);
  };
  estado.atualizarNo = function (identificador, dados) {
    alterar(p => {
      const no = p.nos.find(n => n.id === identificador);
      if (!no) throw new Error("Nó não encontrado.");
      Object.assign(no, dados);
    });
  };
  estado.removerNo = function (identificador) { alterar(p => E.nucleo.modelo.removerNo(p, identificador)); };
  estado.removerAresta = function (identificador) {
    alterar(p => { p.arestas = p.arestas.filter(a => a.id !== identificador); p.escolios = p.escolios.filter(e => e.alvo !== identificador); });
  };
  estado.desfazer = function () {
    const restaurado = E.nucleo.historico.desfazer(pilha, projeto);
    if (!restaurado) return false;
    projeto = restaurado; emitir("desfazer"); return true;
  };
  estado.refazer = function () {
    const restaurado = E.nucleo.historico.refazer(pilha, projeto);
    if (!restaurado) return false;
    projeto = restaurado; emitir("refazer"); return true;
  };
  estado.podeDesfazer = () => E.nucleo.historico.podeDesfazer(pilha);
  estado.podeRefazer = () => E.nucleo.historico.podeRefazer(pilha);
  E.nucleo.estado = estado;
})(window);
