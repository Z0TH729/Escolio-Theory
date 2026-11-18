/*
 * Escólio Theory
 * Projeto demonstrativo: Aprendizagem significativa.
 * Desenvolvedor: Zoth
 * Licença a definir.
 */
(function (global) {
  "use strict";
  const E = global.Escolio;
  const m = E.nucleo.modelo;
  const projeto = {
    escolio: E.config.versaoFormato,
    projeto: {
      id: "projeto-aprendizagem-significativa",
      titulo: "Aprendizagem significativa",
      autor: "Exemplo demonstrativo",
      criadoEm: "2026-11-18T12:00:00.000Z",
      atualizadoEm: "2026-11-18T12:00:00.000Z"
    },
    pacotes: [E.pacotes.obter("geral")],
    nos: [
      m.criarNo({ id: "teoria-aprendizagem", tipo: "teoria", titulo: "Aprendizagem significativa", corpo: "A aprendizagem significativa relaciona novas informações a conhecimentos relevantes já presentes na estrutura cognitiva do estudante.", pos: { x: 0, y: 0 }, estilo: { cor: "#2b4c7e" }, campos: { autor: "David Ausubel", ano: 1963 } }),
      m.criarNo({ id: "conhecimento-previo", tipo: "conceito", titulo: "Conhecimento prévio", corpo: "Conhecimentos que o estudante já possui e que podem servir de base para novas aprendizagens.", pos: { x: -260, y: -150 }, estilo: { cor: "#47745b" } }),
      m.criarNo({ id: "subsuncores", tipo: "conceito", titulo: "Subsunçores", corpo: "Conceitos relevantes que permitem ancorar e organizar novas informações.", pos: { x: 260, y: -150 }, estilo: { cor: "#47745b" } }),
      m.criarNo({ id: "material-potencial", tipo: "conceito", titulo: "Material potencialmente significativo", corpo: "O material precisa apresentar organização lógica e possibilidade de relação com conhecimentos do estudante.", pos: { x: -260, y: 160 }, estilo: { cor: "#8a6b35" } }),
      m.criarNo({ id: "aplicacao-aula", tipo: "aplicacao", titulo: "Aplicação em sala de aula", corpo: "O professor investiga conhecimentos prévios e usa esse diagnóstico para apresentar novos conceitos.", pos: { x: 260, y: 160 }, estilo: { cor: "#47745b" }, campos: { contexto: "Aula introdutória", publico: "Estudantes" } })
    ],
    arestas: [
      m.criarAresta("teoria-aprendizagem", "conhecimento-previo", { id: "relacao-conhecimento", rotulo: "considera" }),
      m.criarAresta("teoria-aprendizagem", "subsuncores", { id: "relacao-subsuncores", rotulo: "utiliza" }),
      m.criarAresta("teoria-aprendizagem", "material-potencial", { id: "relacao-material", rotulo: "depende de" }),
      m.criarAresta("teoria-aprendizagem", "aplicacao-aula", { id: "relacao-aplicacao", rotulo: "orienta" })
    ],
    escolios: [
      m.criarEscolio("teoria-aprendizagem", "A teoria está associada aos trabalhos de David Ausubel sobre aprendizagem e organização cognitiva.", "referencia", { id: "escolio-referencia-ausubel" }),
      m.criarEscolio("conhecimento-previo", "Uma atividade diagnóstica pode revelar ideias que os estudantes já associam ao tema.", "aplicacao", { id: "escolio-diagnostico" }),
      m.criarEscolio("subsuncores", "O conceito de subsunçor ajuda a compreender a integração de novas informações.", "comentario", { id: "escolio-subsuncores" }),
      m.criarEscolio("aplicacao-aula", "Exercício: peça aos estudantes que relacionem o conteúdo novo a uma situação conhecida.", "exercicio", { id: "escolio-exercicio" })
    ],
    visoes: [{ id: "visao-aprendizagem", tipo: "mapa-conceitual", raiz: "teoria-aprendizagem", configuracao: {} }]
  };
  E.exemplos = E.exemplos || {};
  E.exemplos.aprendizagemSignificativa = () => m.clonar(projeto);
})(window);
