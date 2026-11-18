# Escólio ⌬ Theory

**Um ambiente para representar, organizar e ensinar teorias.**

O **Escólio Theory** é uma aplicação web de estudo universal que reúne mapas mentais, mapas conceituais, planos de aplicação de teorias e modelagem de bancos de dados em um único ambiente.

Seu conceito central vem do *escólio*: uma anotação marginal que explica, contextualiza ou amplia um texto. No Escólio Theory, a teoria ou o conceito ocupa o lugar principal, enquanto aplicações, exemplos, exercícios, referências, dúvidas e comentários ficam vinculados a ele como escólios.

> A teoria é o texto principal. Os escólios ampliam sua compreensão e mostram suas relações com a prática.

---

## Estado do projeto

**Versão:** 0.1.0 — implementação inicial  
**Estágio:** pré-alfa  
**Status:** interface inicial publicada em pré-alfa; núcleo de dados e mapa conceitual básico disponíveis para testes.

O núcleo inicial inclui configuração, modelo de dados, histórico, migração, validação, pacotes disciplinares e projeto demonstrativo. A interface inicial permite criar e editar conceitos, estabelecer relações, adicionar escólios e importar ou exportar projetos JSON. Esta versão é pré-alfa e ainda não representa o conjunto completo de funcionalidades planejadas.

## Aplicação\n\n**Acessar:** [Escólio Theory — GitHub Pages](https://z0th729.github.io/Escolio-Theory/)\n\nO endereço público usa o nome técnico do repositório (`Escolio-Theory`), sem acentos.\n\n## Objetivos

- Representar teorias e conceitos por meio de nós tipados e relações nomeadas.
- Organizar conhecimento em diferentes visualizações, usando um modelo de dados comum.
- Associar anotações explicativas a elementos do projeto.
- Apoiar o ensino, o estudo e a aplicação prática de teorias.
- Permitir salvar, abrir, compartilhar e exportar projetos em formatos comuns.
- Funcionar localmente, sem depender de contas, servidores ou conexão com a internet.

## Funcionalidades planejadas

| Módulo | Finalidade |
| --- | --- |
| Mapa mental | Organizar conceitos em estruturas hierárquicas. |
| Mapa conceitual | Representar relações nomeadas entre conceitos. |
| Plano de teoria aplicada | Converter fundamentos teóricos em objetivos, etapas, atividades e avaliações. |
| Designer de banco de dados | Modelar entidades, atributos, chaves e relacionamentos. |
| Escólios | Anexar aplicações, exemplos, exercícios, referências, dúvidas e comentários. |
| Pacotes de disciplina | Adaptar tipos, campos, relações e modelos a diferentes áreas de estudo. |

### Ferramentas transversais previstas

- Busca no projeto e filtros de escólios.
- Histórico de desfazer e refazer.
- Zoom, deslocamento, minimapa e seleção de elementos.
- Modo de apresentação e modo de impressão.
- Temas claro e escuro.
- Atalhos de teclado e recursos de acessibilidade.

## Estudo universal

O Escólio Theory não é limitado a uma disciplina. A proposta é oferecer um núcleo comum para diferentes áreas, como:

- Matemática e física.
- Filosofia e sociologia.
- Programação e ciência de dados.
- Língua portuguesa e literatura.
- Ciências naturais e humanas.

Os **pacotes de disciplina** poderão acrescentar tipos de elementos, campos específicos, relações e modelos sem alterar o núcleo da aplicação.

## Modelo de dados

Cada projeto será armazenado como um documento JSON. Esse documento será a fonte principal dos dados, da qual as diferentes visualizações e exportações serão geradas.

O modelo conceitual reúne:

- **Nós:** teorias, conceitos, aplicações, etapas, entidades e notas.
- **Arestas:** relações entre nós, como hierarquia, sequência e referência.
- **Escólios:** anotações vinculadas aos elementos do projeto.
- **Visões:** configurações para apresentar o mesmo conteúdo de maneiras diferentes.

O formato nativo deverá possuir versionamento e mecanismos de migração para preservar a compatibilidade entre versões.

## Tecnologias e arquitetura

O desenvolvimento está planejado com:

- **HTML** para a estrutura da aplicação.
- **CSS** para apresentação, layout e temas.
- **JavaScript** para o núcleo, a interface e as ferramentas.
- **SVG** para renderização vetorial dos mapas e diagramas.
- **JSON** como formato nativo dos projetos.
- **IndexedDB** para armazenamento local e recuperação de projetos.

A aplicação não terá backend. Os dados permanecerão no dispositivo do usuário. Bibliotecas externas necessárias deverão ser incluídas localmente no repositório, evitando dependências de CDN e permitindo o funcionamento offline.

A arquitetura será modular, separando o núcleo de dados, as visualizações, a interface, o armazenamento e a exportação.

## Exportação planejada

| Formato | Uso |
| --- | --- |
| JSON | Salvar e abrir projetos no formato nativo. |
| SVG | Exportar mapas e diagramas vetoriais. |
| PNG e JPEG | Exportar imagens. |
| PDF | Gerar documentos para leitura e impressão. |
| Markdown | Converter a estrutura em texto organizado. |
| HTML autônomo | Compartilhar uma versão independente em um único arquivo. |
| SQL | Gerar estruturas de tabelas a partir dos modelos de dados. |

## Roadmap

O roadmap é uma proposta de evolução e poderá ser ajustado conforme os testes e as decisões técnicas.

| Versão | Objetivos |
| --- | --- |
| v0.1 — Núcleo | Em andamento: núcleo, interface inicial, mapa conceitual básico, edição de nós, relações, escólios e importação/exportação JSON implementados; recursos avançados, armazenamento persistente robusto e exportações adicionais pendentes. |
| v0.2 — Visões | Mapa mental, mapa conceitual, busca, filtros e exportações adicionais. |
| v0.3 — Ensino | Planos aplicados, apresentação, HTML autônomo e pacotes de disciplina. |
| v0.4 — Dados | Designer de banco de dados e exportação SQL. |
| v0.5 — Distribuição | PWA, funcionamento offline e revisão de acessibilidade. |
| v1.0 — Estável | Formato de arquivo estabilizado, migrações, testes e distribuição para desktop e Android. |

## Princípios do projeto

1. **Local primeiro:** os dados pertencem ao usuário e permanecem no dispositivo.
2. **Um modelo, várias visões:** diferentes ferramentas trabalham sobre a mesma estrutura de conhecimento.
3. **Clareza:** a interface prioriza leitura, hierarquia e baixa distração.
4. **Foco:** cada recurso deve contribuir para representar, organizar ou ensinar teorias.
5. **Portabilidade:** o mesmo núcleo deverá atender à versão web, à experiência offline e a futuros empacotamentos.
6. **Segurança:** arquivos importados serão tratados como dados não confiáveis e validados antes do uso.

## Desenvolvedor

**Zoth**  
GitHub: [@Z0TH729](https://github.com/Z0TH729)

## Licença

A licença ainda não foi definida. Até que uma licença seja adicionada ao repositório, todos os direitos autorais permanecem reservados por padrão. Consulte o responsável pelo projeto antes de reutilizar, modificar ou distribuir o código.
