/*
 * Escólio Theory
 * Testes automatizados do núcleo.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const E = global.Escolio;
  const resultados = [];

  function afirmar(condicao, mensagem) {
    if (!condicao) throw new Error(mensagem || "Condição não atendida.");
  }
  function testar(nome, funcao) {
    try {
      funcao();
      resultados.push({ nome: nome, estado: "aprovado" });
    } catch (erro) {
      resultados.push({ nome: nome, estado: "reprovado", mensagem: erro.message });
    }
  }
  function deveFalhar(funcao, trecho) {
    let falhou = false;
    try { funcao(); }
    catch (erro) {
      falhou = true;
      if (trecho) afirmar(erro.message.includes(trecho), "Mensagem inesperada: " + erro.message);
    }
    afirmar(falhou, "Era esperado que a operação fosse rejeitada.");
  }

  function executar() {
    const m = E.nucleo.modelo;
    const h = E.nucleo.historico;
    const mig = E.nucleo.migracao;
    const v = E.nucleo.validacao;
    const estado = E.nucleo.estado;

    testar("Criação de projeto", function () {
      const p = m.criarProjeto("Projeto de teste");
      afirmar(p.escolio === E.config.versaoFormato && p.projeto.titulo === "Projeto de teste");
      afirmar(Array.isArray(p.nos) && Array.isArray(p.pacotes));
    });
    testar("Criação de nó", function () {
      const n = m.criarNo({ tipo: "conceito", titulo: "Teste" });
      afirmar(n.id && n.titulo === "Teste" && n.pos.x === 0);
      afirmar(n.estilo.cor === "#2b4c7e");
    });
    testar("Criação de aresta e escólio", function () {
      const a = m.criarAresta("a", "b", { rotulo: "relaciona" });
      const e = m.criarEscolio("a", "Anotação", "comentario");
      afirmar(a.de === "a" && a.para === "b" && e.alvo === "a");
    });
    testar("Histórico de desfazer e refazer", function () {
      const p = h.criar(), antes = { valor: 1 }, depois = { valor: 2 };
      h.registrar(p, antes);
      afirmar(h.desfazer(p, depois).valor === 1);
      afirmar(h.refazer(p, antes).valor === 2);
      afirmar(!h.podeRefazer(p));
    });
    testar("Clonagem sem compartilhar referências", function () {
      const original = { itens: [{ valor: 1 }] };
      const copia = m.clonar(original);
      copia.itens[0].valor = 9;
      afirmar(original.itens[0].valor === 1);
    });
    testar("Migração do formato 0.1", function () {
      const antigo = {
        escolio: "0.1",
        projeto: { id: "p", titulo: "Antigo", autor: "", criadoEm: "2026-01-01", atualizadoEm: "2026-01-01" },
        visoes: [{ id: "v", tipo: "mapa-conceitual" }]
      };
      const novo = mig.paraVersaoAtual(antigo);
      afirmar(Array.isArray(novo.pacotes) && Array.isArray(novo.nos));
      afirmar(!!novo.visoes[0].configuracao);
      afirmar(antigo.pacotes === undefined, "A migração não deve alterar o objeto de entrada.");
    });
    testar("Migração rejeita listas com tipo incorreto", function () {
      deveFalhar(() => mig.paraVersaoAtual({
        escolio: "0.1",
        projeto: { id: "p", titulo: "Inválido" },
        nos: "não é lista"
      }), "nos precisa ser uma lista");
    });
    testar("Validação de projeto válido", function () {
      const p = m.criarProjeto("Válido");
      const r = v.validarProjeto(p);
      afirmar(r.valido, r.erros.join(" "));
    });
    testar("Validação não quebra com pacote malformado", function () {
      const r = v.validarPacote({
        pacote: "quebrado", versao: "1", nome: "Quebrado",
        tipos: [null], relacoes: [], modelos: [], visoes: []
      });
      afirmar(!r.valido);
    });
    testar("Validação não quebra com itens nulos", function () {
      const p = m.criarProjeto("Inválido");
      p.nos.push(null);
      p.arestas.push(null);
      p.escolios.push(null);
      const r = v.validarProjeto(p);
      afirmar(!r.valido);
    });
    testar("Rejeição de referência inexistente", function () {
      const p = m.criarProjeto("Inválido");
      p.arestas.push({ id: "a1", de: "ausente1", para: "ausente2", rotulo: "liga", tipo: "relacao" });
      afirmar(!v.validarProjeto(p).valido);
    });
    testar("Rejeição de autorrelação", function () {
      const p = m.criarProjeto("Autorrelação");
      p.nos.push(m.criarNo({ id: "n1" }));
      p.arestas.push(m.criarAresta("n1", "n1", { id: "a1" }));
      afirmar(!v.validarProjeto(p).valido);
    });
    testar("Rejeição de relação duplicada", function () {
      const p = m.criarProjeto("Duplicidade");
      p.nos.push(m.criarNo({ id: "n1" }), m.criarNo({ id: "n2" }));
      p.arestas.push(
        m.criarAresta("n1", "n2", { id: "a1" }),
        m.criarAresta("n1", "n2", { id: "a2" })
      );
      afirmar(!v.validarProjeto(p).valido);
    });
    testar("Operações de estado e histórico", function () {
      const original = estado.obterProjeto();
      try {
        estado.substituirProjeto(m.criarProjeto("Teste de estado"));
        const a = estado.adicionarNo({ id: "estado-a", titulo: "A" });
        const b = estado.adicionarNo({ id: "estado-b", titulo: "B" });
        estado.adicionarAresta(a.id, b.id);
        afirmar(estado.obterProjeto().arestas.length === 1);
        afirmar(estado.desfazer());
        afirmar(estado.obterProjeto().arestas.length === 0);
        afirmar(estado.refazer());
        afirmar(estado.obterProjeto().arestas.length === 1);
      } finally {
        estado.substituirProjeto(original);
      }
    });
    testar("Estado rejeita relação duplicada e autorrelação", function () {
      const original = estado.obterProjeto();
      try {
        estado.substituirProjeto(m.criarProjeto("Teste de relações"));
        estado.adicionarNo({ id: "rel-a" });
        estado.adicionarNo({ id: "rel-b" });
        estado.adicionarAresta("rel-a", "rel-b");
        deveFalhar(() => estado.adicionarAresta("rel-a", "rel-b"), "já existe");
        deveFalhar(() => estado.adicionarAresta("rel-a", "rel-a"), "ele mesmo");
        afirmar(estado.obterProjeto().arestas.length === 1);
      } finally {
        estado.substituirProjeto(original);
      }
    });
    testar("Comando com exceção restaura o estado", function () {
      const original = estado.obterProjeto();
      try {
        estado.substituirProjeto(m.criarProjeto("Teste transacional"));
        const antes = JSON.stringify(estado.obterProjeto());
        deveFalhar(() => estado.executar(p => {
          p.nos.push(m.criarNo({ id: "nao-deve-permanecer" }));
          throw new Error("falha simulada");
        }), "falha simulada");
        afirmar(JSON.stringify(estado.obterProjeto()) === antes, "O estado foi alterado após a falha.");
      } finally {
        estado.substituirProjeto(original);
      }
    });
    testar("Pacotes geral e filosofia", function () {
      afirmar(E.pacotes.existe("geral") && E.pacotes.existe("filosofia"));
      const f = E.pacotes.obter("filosofia");
      afirmar(f.tipos.some(t => t.id === "argumento"));
    });
    testar("Projeto de exemplo", function () {
      const p = E.exemplos.aprendizagemSignificativa();
      const r = v.validarProjeto(p);
      afirmar(r.valido, r.erros.join(" "));
      afirmar(p.nos.length >= 4 && p.escolios.length >= 1);
    });

    exibir();
  }

  function exibir() {
    const area = document.getElementById("esc-resultados");
    const resumo = document.getElementById("esc-resumo");
    area.textContent = "";
    let aprovados = 0;
    let reprovados = 0;
    resultados.forEach(r => {
      const item = document.createElement("article");
      const titulo = document.createElement("strong");
      const detalhe = document.createElement("p");
      item.className = "esc-resultado esc-" + r.estado;
      titulo.textContent = r.nome;
      detalhe.textContent = r.mensagem || "Verificação concluída.";
      item.append(titulo, detalhe);
      area.appendChild(item);
      if (r.estado === "aprovado") aprovados++;
      else reprovados++;
    });
    resumo.textContent = aprovados + " aprovados · " + reprovados + " reprovados";
  }

  executar();
})(window);
