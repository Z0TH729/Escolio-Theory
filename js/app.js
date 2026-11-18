/* Escólio Theory · interface inicial · licença a definir */
(function(){
"use strict";
const E=window.Escolio, $=s=>document.querySelector(s);
const svg=$("#map"), toast=$("#toast");
let selecionado=null, origemConexao=null, projeto=E.exemplos.aprendizagemSignificativa();
let arraste=null, bloquearCliqueAte=0, gruposNos=new Map(), elementosArestas=[];
const centro={x:600,y:380};
function aviso(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(aviso.t);aviso.t=setTimeout(()=>toast.classList.remove("show"),2400)}
function atual(){return E.nucleo.estado.obterProjeto()}
function salvarLocal(){try{localStorage.setItem("escolio-projeto",JSON.stringify(atual()))}catch(e){aviso("Não foi possível salvar automaticamente.")}}
function carregar(p){E.nucleo.estado.substituirProjeto(p);selecionado=null;render()}
function pos(n){return {x:centro.x+n.pos.x,y:centro.y+n.pos.y}}
function pontoNoMapa(ev){
 const matriz=svg.getScreenCTM();
 if(!matriz) return null;
 const ponto=svg.createSVGPoint();ponto.x=ev.clientX;ponto.y=ev.clientY;
 const convertido=ponto.matrixTransform(matriz.inverse());
 return {x:convertido.x,y:convertido.y};
}
function atualizarArestas(){
 elementosArestas.forEach(item=>{
  const a=item.dados,de=arraste&&arraste.id===a.de?arraste.pos:pos(atual().nos.find(n=>n.id===a.de));
  const para=arraste&&arraste.id===a.para?arraste.pos:pos(atual().nos.find(n=>n.id===a.para));
  if(!de||!para)return;
  item.linha.setAttribute("x1",de.x);item.linha.setAttribute("y1",de.y);
  item.linha.setAttribute("x2",para.x);item.linha.setAttribute("y2",para.y);
  item.rotulo.setAttribute("x",(de.x+para.x)/2);item.rotulo.setAttribute("y",(de.y+para.y)/2-9);
 });
}
function iniciarArraste(ev,id,n){
 if(ev.button!==0||ev.shiftKey)return;
 const ponto=pontoNoMapa(ev);if(!ponto)return;
 arraste={id,no:n,grupo:gruposNos.get(id),inicio:ponto,pos:pos(n),original:{x:n.pos.x,y:n.pos.y},moveu:false};
 svg.setPointerCapture(ev.pointerId);
}
svg.addEventListener("pointermove",ev=>{
 if(!arraste)return;
 const ponto=pontoNoMapa(ev);if(!ponto)return;
 const dx=ponto.x-arraste.inicio.x,dy=ponto.y-arraste.inicio.y;
 if(!arraste.moveu&&Math.hypot(dx,dy)<3)return;
 arraste.moveu=true;arraste.pos={x:centro.x+arraste.original.x+dx,y:centro.y+arraste.original.y+dy};
 arraste.grupo.setAttribute("transform","translate("+arraste.pos.x+" "+arraste.pos.y+")");
 atualizarArestas();
});
function finalizarArraste(ev,cancelado){
 if(!arraste)return;
 const a=arraste;arraste=null;
 if(a.moveu){
  bloquearCliqueAte=Date.now()+250;
  if(cancelado){render();return}
  try{E.nucleo.estado.atualizarNo(a.id,{pos:{x:a.pos.x-centro.x,y:a.pos.y-centro.y}})}
  catch(err){aviso("Não foi possível mover: "+err.message);render()}
 }
}
svg.addEventListener("pointerup",ev=>finalizarArraste(ev,false));
svg.addEventListener("pointercancel",ev=>finalizarArraste(ev,true));
function criarSvg(tag,attrs,parent){const el=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));(parent||svg).appendChild(el);return el}
function render(){
 const p=atual();svg.replaceChildren();
 gruposNos=new Map();elementosArestas=[];
 const camadaA=criarSvg("g",{"aria-label":"Relações"}),camadaN=criarSvg("g",{"aria-label":"Conceitos"});
 p.arestas.forEach(a=>{const de=p.nos.find(n=>n.id===a.de),para=p.nos.find(n=>n.id===a.para);if(!de||!para)return;const d=pos(de),q=pos(para),linha=criarSvg("line",{x1:d.x,y1:d.y,x2:q.x,y2:q.y,class:"edge"},camadaA);const t=criarSvg("text",{x:(d.x+q.x)/2,y:(d.y+q.y)/2-9,class:"edge-label"},camadaA);t.textContent=a.rotulo;elementosArestas.push({dados:a,linha,rotulo:t})});
 p.nos.forEach(n=>{const xy=pos(n),g=criarSvg("g",{class:"node"+(n.id===selecionado?" selected":""),transform:"translate("+xy.x+" "+xy.y+")","data-id":n.id,role:"button","aria-label":n.titulo},camadaN);criarSvg("rect",{x:-94,y:-35,width:188,height:70,stroke:n.estilo.cor},g);const t=criarSvg("text",{x:0,y:-2},g);t.textContent=n.titulo.length>24?n.titulo.slice(0,22)+"…":n.titulo;const s=criarSvg("text",{x:0,y:18,class:"sub"},g);s.textContent=n.tipo;gruposNos.set(n.id,g);g.addEventListener("pointerdown",ev=>iniciarArraste(ev,n.id,n));g.addEventListener("click",ev=>{ev.stopPropagation();if(Date.now()<bloquearCliqueAte)return;if(ev.shiftKey){if(!origemConexao){origemConexao=n.id;selecionado=n.id;aviso("Origem selecionada. Shift+clique no destino.");render()}else if(origemConexao!==n.id){try{E.nucleo.estado.adicionarAresta(origemConexao,n.id,{rotulo:"relaciona"});origemConexao=null;selecionado=n.id;render();aviso("Relação criada.")}catch(err){aviso(err.message)}}}else{selecionado=n.id;origemConexao=null;render()}})});
 $("#empty").hidden=p.nos.length>0;$("#count-nodes").textContent=p.nos.length;$("#count-edges").textContent=p.arestas.length;$("#project-title").textContent=p.projeto.titulo;
 renderInspector(p);
}
function renderInspector(p){
 const area=$("#inspector"),n=p.nos.find(x=>x.id===selecionado);
 if(!n){area.innerHTML='<p class="hint">Selecione um elemento no mapa para editar suas propriedades. Use Shift + clique em dois elementos para criar uma relação.</p>';return}
 area.innerHTML='<div class="field"><label for="node-title">Título</label><input id="node-title" maxlength="500"></div><div class="field"><label for="node-type">Tipo</label><select id="node-type"><option>conceito</option><option>teoria</option><option>aplicacao</option><option>etapa</option><option>entidade</option><option>nota</option></select></div><div class="field"><label for="node-body">Descrição</label><textarea id="node-body"></textarea></div><div class="inspector-actions"><button id="add-note">Adicionar escólio</button><button id="delete-node" class="danger">Excluir elemento</button></div><p class="hint" id="note-count"></p>';
 $("#node-title").value=n.titulo;$("#node-type").value=n.tipo;$("#node-body").value=n.corpo;
 const persist=()=>{try{E.nucleo.estado.atualizarNo(n.id,{titulo:$("#node-title").value,tipo:$("#node-type").value,corpo:$("#node-body").value});}catch(e){aviso(e.message)}};
 $("#node-title").addEventListener("change",persist);$("#node-type").addEventListener("change",persist);$("#node-body").addEventListener("change",persist);
 $("#delete-node").onclick=()=>{E.nucleo.estado.removerNo(n.id);selecionado=null;render();aviso("Elemento removido.")};
 $("#add-note").onclick=()=>{const texto=prompt("Texto do escólio:");if(texto&&texto.trim()){E.nucleo.estado.adicionarEscolio(n.id,texto.trim(),"comentario");render();aviso("Escólio adicionado.")}};
 $("#note-count").textContent=p.escolios.filter(e=>e.alvo===n.id).length+" escólio(s) vinculado(s).";
}
function novoNo(){const p=atual(),i=p.nos.length;const ang=i*2.399,raio=130+Math.floor(i/7)*65;const n=E.nucleo.estado.adicionarNo({titulo:"Novo conceito",tipo:"conceito",corpo:"",pos:{x:Math.round(Math.cos(ang)*raio),y:Math.round(Math.sin(ang)*raio)}});selecionado=n.id;render();$("#node-title")?.focus();aviso("Elemento criado.")}
function baixar(nome,conteudo,tipo){const blob=new Blob([conteudo],{type:tipo}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=nome;a.click();URL.revokeObjectURL(url)}
$("#add-node").onclick=novoNo;$("#add-node-top").onclick=novoNo;$("#save-json-copy").onclick=()=>$("#save-json").click();
$("#new-project").onclick=()=>{if(!confirm("Criar um projeto vazio? As alterações atuais já estão salvas neste navegador."))return;const p=E.nucleo.modelo.criarProjeto("Novo projeto");carregar(p);aviso("Novo projeto criado.")};
$("#load-example").onclick=()=>{carregar(E.exemplos.aprendizagemSignificativa());aviso("Exemplo carregado.")};
$("#save-json").onclick=()=>baixar("escolio-projeto.json",JSON.stringify(atual(),null,2),"application/json");
$("#open-json").onclick=()=>$("#file-open").click();
$("#file-open").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{if(f.size>E.config.tamanhoMaximoArquivo)throw Error("Arquivo excede o limite de 5 MB.");const p=JSON.parse(await f.text());carregar(p);aviso("Projeto aberto.")}catch(e){aviso("Falha ao abrir: "+e.message)}ev.target.value=""};
$("#undo").onclick=()=>{if(E.nucleo.estado.desfazer())render()};$("#redo").onclick=()=>{if(E.nucleo.estado.refazer())render()};
$("#export-md").onclick=()=>{const p=atual();let md="# "+p.projeto.titulo+"\n\n";p.nos.forEach(n=>{md+="## "+n.titulo+"\n\n"+n.corpo+"\n\n";p.escolios.filter(e=>e.alvo===n.id).forEach(e=>md+="- **Escólio ("+e.tipo+"):** "+e.texto+"\n")});md+="\n## Relações\n\n";p.arestas.forEach(a=>{const x=p.nos.find(n=>n.id===a.de),y=p.nos.find(n=>n.id===a.para);if(x&&y)md+="- "+x.titulo+" — "+a.rotulo+" → "+y.titulo+"\n"});baixar("escolio-projeto.md",md,"text/markdown")};
$("#clear-selection").onclick=()=>{selecionado=null;origemConexao=null;render()};
E.nucleo.estado.assinar(()=>{salvarLocal();render()});
try{const salvo=localStorage.getItem("escolio-projeto");if(salvo)carregar(JSON.parse(salvo));else carregar(projeto)}catch(e){carregar(projeto);aviso("Foi usado o projeto de demonstração.")}
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();$("#save-json").click()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();$("#undo").click()}});
})();
