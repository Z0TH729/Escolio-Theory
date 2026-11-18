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

  function emitir(tipo) {
    ouvintes.forEach(fn => {
      try { fn(tipo, obterProjeto()); }
      catch (erro) { console.error("Falha em ouvinte do estado:", erro); }
    });
  }
  function alterar(comando) {
    const antes = E.nucleo.modelo.clonar(projeto);
    try {
      comando(projeto);
      projeto.projeto.atualizadoEm = new Date().toISOString();
      const validado = E.nucleo.validacao.validarProjeto(projeto);
      if (!validado.valido) throw new Error(validado.erros.join("\n"));
      E.nucleo.historico.registrar(pilha, antes);
    } catch (erro) {
      projeto = antes;
      throw erro;
    }
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
  estado.assinar = function (ouvinte) {
    if (typeof ouvinte !== "function") throw new TypeError("O ouvinte precisa ser uma função.");
    ouvintes.add(ouvinte);
    return () => ouvintes.delete(ouvinte);
  };
  estado.executar = alterar;
  estado.adicionarNo = function (dados) {
    let criado;
    alterar(p => { criado = E.nucleo.modelo.criarNo(dados); p.nos.push(criado); });
    return E.nucleo.modelo.clonar(criado);
  };
  estado.adicionarAresta = function (de, para, dados) {
    let criada;
    alterar(p => {
      if (de === para) throw new Error("Uma relação não pode conectar um nó a ele mesmo.");
      if (!p.nos.some(n => n.id === de) || !p.nos.some(n => n.id === para)) {
        throw new Error("Não é possível relacionar nós inexistentes.");
      }
      const tipo = dados && dados.tipo || "relacao";
      if (p.arestas.some(a => a.de === de && a.para === para && a.tipo === tipo)) {
        throw new Error("Esta relação já existe.");
      }
      criada = E.nucleo.modelo.criarAresta(de, para, dados);
      p.arestas.push(criada);
    });
    return E.nucleo.modelo.clonar(criada);
  };
  estado.adicionarEscolio = function (alvo, texto, tipo) {
    let criado;
    alterar(p => {
      if (!E.nucleo.modelo.buscarAlvo(p, alvo)) throw new Error("Alvo do escólio não encontrado.");
      criado = E.nucleo.modelo.criarEscolio(alvo, texto, tipo);
      p.escolios.push(criado);
    });
    return E.nucleo.modelo.clonar(criado);
  };
  estado.atualizarNo = function (identificador, dados) {
    alterar(p => {
      const no = p.nos.find(n => n.id === identificador);
      if (!no) throw new Error("Nó não encontrado.");
      if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new TypeError("Dados do nó inválidos.");
      ["tipo", "titulo", "corpo", "campos", "pos", "estilo", "pastaId"].forEach(chave => {
        if (Object.prototype.hasOwnProperty.call(dados, chave)) {
          if (chave === "pos" || chave === "estilo") no[chave] = Object.assign({}, no[chave], dados[chave]);
          else no[chave] = E.nucleo.modelo.clonar(dados[chave]);
        }
      });
    });
  };
  estado.removerNo = function (identificador) {
    alterar(p => {
      if (!p.nos.some(n => n.id === identificador)) throw new Error("Nó não encontrado.");
      E.nucleo.modelo.removerNo(p, identificador);
    });
  };
  estado.atualizarAresta = function (identificador, dados) {
    alterar(p => {
      const aresta = p.arestas.find(a => a.id === identificador);
      if (!aresta) throw new Error("Aresta não encontrada.");
      if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new TypeError("Dados da aresta inválidos.");
      if (Object.prototype.hasOwnProperty.call(dados, "rotulo")) aresta.rotulo = dados.rotulo;
      if (Object.prototype.hasOwnProperty.call(dados, "modo")) aresta.modo = dados.modo;
      if (Object.prototype.hasOwnProperty.call(dados, "cor")) aresta.cor = dados.cor;
    });
  };
  estado.removerAresta = function (identificador) {
    alterar(p => {
      if (!p.arestas.some(a => a.id === identificador)) throw new Error("Aresta não encontrada.");
      p.arestas = p.arestas.filter(a => a.id !== identificador);
      p.escolios = p.escolios.filter(e => e.alvo !== identificador);
    });
  };
  estado.desfazer = function () {
    const restaurado = E.nucleo.historico.desfazer(pilha, projeto);
    if (!restaurado) return false;
    projeto = restaurado;
    emitir("desfazer");
    return true;
  };
  estado.refazer = function () {
    const restaurado = E.nucleo.historico.refazer(pilha, projeto);
    if (!restaurado) return false;
    projeto = restaurado;
    emitir("refazer");
    return true;
  };
  estado.podeDesfazer = () => E.nucleo.historico.podeDesfazer(pilha);
  estado.podeRefazer = () => E.nucleo.historico.podeRefazer(pilha);
  E.nucleo.estado = estado;
})(window);
