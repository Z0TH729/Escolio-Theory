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
  function afirmar(condicao, mensagem) { if (!condicao) throw new Error(mensagem || "Condição não atendida."); }
  function testar(nome, funcao) {
    try { funcao(); resultados.push({ nome: nome, estado: "aprovado" }); }
    catch (erro) { resultados.push({ nome: nome, estado: "reprovado", mensagem: erro.message }); }
  }
  function executar() {
    const m = E.nucleo.modelo, h = E.nucleo.historico, mig = E.nucleo.migracao, v = E.nucleo.validacao;
    testar("Criação de projeto", function () {
      const p = m.criarProjeto("Projeto de teste");
      afirmar(p.escolio === "0.1" && p.projeto.titulo === "Projeto de teste");
      afirmar(Array.isArray(p.nos) && Array.isArray(p.pacotes));
    });
    testar("Criação de nó", function () {
      const n = m.criarNo({ tipo: "conceito", titulo: "Teste" });
      afirmar(n.id && n.titulo === "Teste" && n.pos.x === 0);
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
    });
    testar("Migração do formato 0.1", function () {
      const antigo = { escolio: "0.1", projeto: { id: "p", titulo: "Antigo" }, nos: [], arestas: [], escolios: [], visoes: [{ id: "v", tipo: "mapa-conceitual" }] };
      const novo = mig.paraVersaoAtual(antigo);
      afirmar(Array.isArray(novo.pacotes));
      afirmar(!!novo.visoes[0].configuracao);
    });
    testar("Validação de projeto válido", function () {
      const p = m.criarProjeto("Válido");
      const r = v.validarProjeto(p);
      afirmar(r.valido, r.erros.join(" "));
    });
    testar("Rejeição de referência inexistente", function () {
      const p = m.criarProjeto("Inválido");
      p.arestas.push({ id: "a1", de: "ausente1", para: "ausente2", rotulo: "liga", tipo: "relacao" });
      afirmar(!v.validarProjeto(p).valido);
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
    const area = document.getElementById("esc-resultados"), resumo = document.getElementById("esc-resumo");
    area.textContent = "";
    let aprovados = 0, reprovados = 0;
    resultados.forEach(r => {
      const item = document.createElement("article"), titulo = document.createElement("strong"), detalhe = document.createElement("p");
      item.className = "esc-resultado esc-" + r.estado;
      titulo.textContent = r.nome;
      detalhe.textContent = r.mensagem || "Verificação concluída.";
      item.append(titulo, detalhe); area.appendChild(item);
      if (r.estado === "aprovado") aprovados++; else reprovados++;
    });
    resumo.textContent = aprovados + " aprovados · " + reprovados + " reprovados";
  }
  executar();
})(window);
