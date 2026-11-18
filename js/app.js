/* Escólio Theory · interface inicial · licença a definir */
(function(){
"use strict";
const E=window.Escolio, $=s=>document.querySelector(s);
const svg=$("#map"), toast=$("#toast");
let selecionado=null, arestaSelecionada=null, origemConexao=null, projeto=E.exemplos.aprendizagemSignificativa();
let arraste=null, conexao=null, linhaTemporaria=null, redimensionamento=null, bloquearCliqueAte=0, gruposNos=new Map(), elementosArestas=[];
const centro={x:600,y:380};
let areaAtiva="mapa", zoomAtual=1;
function aviso(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(aviso.t);aviso.t=setTimeout(()=>toast.classList.remove("show"),2400)}
function atual(){return E.nucleo.estado.obterProjeto()}
function salvarLocal(){try{localStorage.setItem("escolio-projeto",JSON.stringify(atual()))}catch(e){aviso("Não foi possível salvar automaticamente.")}}
function carregar(p){E.nucleo.estado.substituirProjeto(p);selecionado=null;render()}
function pos(n){return {x:centro.x+n.pos.x,y:centro.y+n.pos.y}}
const lados=["esquerda","direita","cima","baixo"];
function conectoresSugeridos(){
 const base=["é","define","é definido como","é um tipo de","é composto por","faz parte de","depende de","causa","produz","permite","utiliza","é utilizado por","exemplifica","explica","fundamenta","contradiz","complementa","influencia","resulta em","ocorre antes de","ocorre depois de"];
 const pacotes=E.pacotes.listar().flatMap(p=>p.relacoes||[]);
 return Array.from(new Set(base.concat(pacotes))).sort((a,b)=>a.localeCompare(b,"pt-BR"));
}
function alturaAutomatica(no){const w=Math.max(120,Number(no.dimensoes&&no.dimensoes.largura)||280),chars=Math.max(12,Math.floor((w-24)/7)),linhas=String(no.corpo||"").split("\n").reduce((s,l)=>s+Math.max(1,Math.ceil(l.length/chars)),0);return Math.max(48,linhas*22+16);}
function dimensoesNo(no){return no.tipo==="texto"?{w:Math.max(120,Number(no.dimensoes&&no.dimensoes.largura)||280),h:no.dimensoes&&no.dimensoes.modoAltura==="manual"&&Number(no.dimensoes.altura)?Number(no.dimensoes.altura):alturaAutomatica(no)}:{w:188,h:70};}
function coordenadaPorta(no,lado,p){p=p||pos(no);const d=dimensoesNo(no),x=d.w/2,y=d.h/2;if(lado==="esquerda")return {x:p.x-x,y:p.y};if(lado==="direita")return {x:p.x+x,y:p.y};if(lado==="cima")return {x:p.x,y:p.y-y};return {x:p.x,y:p.y+y};}
function ladoAutomatico(a,b){const p=pos(a),q=pos(b),dx=q.x-p.x,dy=q.y-p.y;return Math.abs(dx)/94>=Math.abs(dy)/35?(dx>=0?"direita":"esquerda"):(dy>=0?"baixo":"cima");}
function extremidadesAresta(a,noDe,noPara,pDe,pPara){const ld=a.pontos&&lados.includes(a.pontos.de)?a.pontos.de:ladoAutomatico(noDe,noPara);const lp=a.pontos&&lados.includes(a.pontos.para)?a.pontos.para:ladoAutomatico(noPara,noDe);return {de:coordenadaPorta(noDe,ld,pDe),para:coordenadaPorta(noPara,lp,pPara)};}
function pontoNoMapa(ev){
 const matriz=svg.getScreenCTM();
 if(!matriz) return null;
 const ponto=svg.createSVGPoint();ponto.x=ev.clientX;ponto.y=ev.clientY;
 const convertido=ponto.matrixTransform(matriz.inverse());
 return {x:convertido.x,y:convertido.y};
}
function atualizarArestas(){
 elementosArestas.forEach(item=>{
  const a=item.dados,noDe=atual().nos.find(n=>n.id===a.de),noPara=atual().nos.find(n=>n.id===a.para);
  if(!noDe||!noPara)return;
  const pDe=arraste&&arraste.id===a.de?arraste.pos:pos(noDe),pPara=arraste&&arraste.id===a.para?arraste.pos:pos(noPara);
  const pts=extremidadesAresta(a,noDe,noPara,pDe,pPara),de=pts.de,para=pts.para;
  item.linha.setAttribute("x1",de.x);item.linha.setAttribute("y1",de.y);item.linha.setAttribute("x2",para.x);item.linha.setAttribute("y2",para.y);
  item.rotulo.setAttribute("x",(de.x+para.x)/2);item.rotulo.setAttribute("y",(de.y+para.y)/2-9);
 });
}
function iniciarArraste(ev,id,n){
 if(ev.button!==0||ev.target.classList.contains('connection-port')||ev.target.classList.contains('text-resize-handle')||ev.target.closest('foreignObject'))return;
 const ponto=pontoNoMapa(ev);if(!ponto)return;
 arraste={id,no:n,grupo:gruposNos.get(id),inicio:ponto,pos:pos(n),original:{x:n.pos.x,y:n.pos.y},moveu:false};
 ev.currentTarget.setPointerCapture(ev.pointerId);
}
window.addEventListener("pointermove",ev=>{
 if(redimensionamento){const p=pontoNoMapa(ev);if(!p)return;const dx=p.x-redimensionamento.inicio.x,dy=p.y-redimensionamento.inicio.y;redimensionamento.largura=Math.max(120,Math.min(1200,redimensionamento.original.largura+dx));redimensionamento.altura=Math.max(48,Math.min(1600,redimensionamento.original.altura+dy));const fo=redimensionamento.grupo.querySelector("foreignObject"),fr=redimensionamento.grupo.querySelector(".text-node-frame");if(fo){fo.setAttribute("x",-redimensionamento.largura/2);fo.setAttribute("width",redimensionamento.largura);fo.setAttribute("height",redimensionamento.altura);}if(fr){fr.setAttribute("x",-redimensionamento.largura/2);fr.setAttribute("y",-redimensionamento.altura/2);fr.setAttribute("width",redimensionamento.largura);fr.setAttribute("height",redimensionamento.altura);}atualizarArestas();return;}
 if(conexao){if(ev.pointerId!==conexao.pointerId)return;const p=pontoNoMapa(ev);if(p&&linhaTemporaria){linhaTemporaria.setAttribute("x2",p.x);linhaTemporaria.setAttribute("y2",p.y);}return;}
 if(!arraste)return;
 const ponto=pontoNoMapa(ev);if(!ponto)return;
 const dx=ponto.x-arraste.inicio.x,dy=ponto.y-arraste.inicio.y;
 if(!arraste.moveu&&Math.hypot(dx,dy)<3)return;
 arraste.moveu=true;arraste.pos={x:centro.x+arraste.original.x+dx,y:centro.y+arraste.original.y+dy};
 arraste.grupo.setAttribute("transform","translate("+arraste.pos.x+" "+arraste.pos.y+")");
 atualizarArestas();
});
function finalizarArraste(ev,cancelado){
 if(redimensionamento){const r=redimensionamento;redimensionamento=null;if(!cancelado){try{E.nucleo.estado.atualizarNo(r.id,{dimensoes:{largura:Math.round(r.largura),altura:Math.round(r.altura),modoAltura:"manual"}})}catch(e){aviso(e.message)}}else render();return;}
 if(conexao){
  if(ev.pointerId!==conexao.pointerId)return;
  const inicio=conexao,ponto=pontoNoMapa(ev);conexao=null;
  if(linhaTemporaria){linhaTemporaria.remove();linhaTemporaria=null;}
  if(cancelado||!ponto)return;
  const candidatos=atual().nos.filter(x=>x.id!==inicio.id).flatMap(no=>lados.map(lado=>({no,lado,p:coordenadaPorta(no,lado)}))).map(item=>({...item,distancia:Math.hypot(item.p.x-ponto.x,item.p.y-ponto.y)})).sort((a,b)=>a.distancia-b.distancia);
  const alvo=candidatos[0];
  if(!alvo||alvo.distancia>24){aviso("Solte sobre um dos pontos de conexão do conceito.");return;}
  try{const criada=E.nucleo.estado.adicionarAresta(inicio.id,alvo.no.id,{rotulo:"",modo:"livre",pontos:{de:inicio.lado,para:alvo.lado}});selecionado=null;arestaSelecionada=criada.id;render();aviso("Conexão criada. Configure o tipo e o conector no painel Propriedades.");}catch(err){aviso(err.message);}
  return;
 }
 if(!arraste)return;
 const a=arraste;arraste=null;
 if(a.moveu){
  bloquearCliqueAte=Date.now()+250;
  if(cancelado){render();return}
  try{E.nucleo.estado.atualizarNo(a.id,{pos:{x:a.pos.x-centro.x,y:a.pos.y-centro.y}})}
  catch(err){aviso("Não foi possível mover: "+err.message);render()}
 }
}
window.addEventListener("pointerup",ev=>finalizarArraste(ev,false));
window.addEventListener("pointercancel",ev=>finalizarArraste(ev,true));
svg.addEventListener("click",ev=>{if(ev.target===svg){selecionado=null;arestaSelecionada=null;origemConexao=null;gruposNos.forEach(grupo=>grupo.classList.remove("selected"));renderInspector(atual());}});
function criarSvg(tag,attrs,parent){const el=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));(parent||svg).appendChild(el);return el}

function escaparHTML(valor){return String(valor).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function renderizarMarkdown(texto){
 let s=escaparHTML(texto||"");
 s=s.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+|mailto:[^\\s)]+)\\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
 s=s.replace(/\\*\\*(.+?)\\*\\*/g,"<strong>$1</strong>").replace(/\\*(.+?)\\*/g,"<em>$1</em>");
 s=s.replace(new RegExp("`([^`]+)`","g"),"<code>$1</code>");
 const linhas=s.split("\\n"),saida=[];let lista="",codigo=false,buffer=[];
 function fechar(){if(lista){saida.push("</"+lista+">");lista="";}}
 linhas.forEach(function(l){
  if(/^\\x60{3}/.test(l)){fechar();if(codigo){saida.push("<pre><code>"+buffer.join("\\n")+"</code></pre>");buffer=[];}codigo=!codigo;return;}
  if(codigo){buffer.push(l);return;}
  let m;
  if((m=l.match(/^(#{1,3})\\s+(.+)$/))){fechar();const n=m[1].length;saida.push("<h"+n+">"+m[2]+"</h"+n+">");}
  else if((m=l.match(/^>\\s?(.*)$/))){fechar();saida.push("<blockquote>"+m[1]+"</blockquote>");}
  else if((m=l.match(/^\\s*[-*]\\s+(.+)$/))){if(lista!=="ul"){fechar();lista="ul";saida.push("<ul>");}saida.push("<li>"+m[1]+"</li>");}
  else if((m=l.match(/^\\s*\\d+\\.\\s+(.+)$/))){if(lista!=="ol"){fechar();lista="ol";saida.push("<ol>");}saida.push("<li>"+m[1]+"</li>");}
  else if(/^---+$/.test(l)){fechar();saida.push("<hr>");}
  else{fechar();if(l.trim())saida.push("<p>"+l+"</p>");}
 });
 fechar();if(codigo)saida.push("<pre><code>"+buffer.join("\\n")+"</code></pre>");
 return saida.join("");
}
function editarTexto(no,grupo){
 if(grupo.dataset.editando==="1")return;grupo.dataset.editando="1";
 const div=grupo.querySelector(".text-node-content");if(!div)return;
 const ta=document.createElement("textarea");ta.value=no.corpo||"";ta.setAttribute("aria-label","Editar conteúdo Markdown");div.replaceChildren(ta);
 ta.addEventListener("pointerdown",function(e){e.stopPropagation();});let finalizado=false;
 function salvar(cancelar){if(finalizado)return;finalizado=true;if(!cancelar&&ta.value!==(no.corpo||"")){try{E.nucleo.estado.atualizarNo(no.id,{corpo:ta.value});}catch(e){aviso(e.message);}}grupo.dataset.editando="0";render();}
 ta.addEventListener("keydown",function(e){if(e.key==="Escape"){e.preventDefault();salvar(true);}else if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();salvar(false);}});
 ta.addEventListener("blur",function(){salvar(false);});ta.focus();
}
function novoTexto(){
 const p=atual(),i=p.nos.length;
 const n=E.nucleo.estado.adicionarNo({tipo:"texto",titulo:"Texto livre",corpo:"Escreva aqui em **Markdown**.",pos:{x:((i%4)-1.5)*180,y:(Math.floor(i/4)-1)*120},dimensoes:{largura:280,altura:null,modoAltura:"auto"},estilo:{cor:"#e8edf4",fundo:"transparent",contorno:"none",tamanhoFonte:14}});
 selecionado=n.id;arestaSelecionada=null;render();aviso("Texto livre criado. Dê duplo clique para editar.");
}
function render(){
 const p=atual();svg.replaceChildren();
 gruposNos=new Map();elementosArestas=[];
 const camadaA=criarSvg("g",{"aria-label":"Relações"}),camadaN=criarSvg("g",{"aria-label":"Conceitos"});
 p.arestas.forEach(a=>{const de=p.nos.find(n=>n.id===a.de),para=p.nos.find(n=>n.id===a.para);if(!de||!para)return;const pts=extremidadesAresta(a,de,para),d=pts.de,q=pts.para,linha=criarSvg("line",{x1:d.x,y1:d.y,x2:q.x,y2:q.y,class:"edge"+(a.modo==="proposicao"?" formal-proposition":"")+(a.id===arestaSelecionada?" selected-edge":""),tabindex:"0",role:"button","aria-label":"Relação: "+(a.rotulo||"sem rótulo")},camadaA);linha.setAttribute("stroke",a.cor||"#6e829d");
 const t=criarSvg("text",{x:(d.x+q.x)/2,y:(d.y+q.y)/2-9,class:"edge-label"+(a.modo==="proposicao"?" proposition-label":"")+(a.id===arestaSelecionada?" selected-edge-label":"")},camadaA);t.textContent=a.rotulo;const selecionar=ev=>{ev.stopPropagation();arestaSelecionada=a.id;selecionado=null;renderInspector(atual());camadaA.querySelectorAll(".edge").forEach(el=>el.classList.toggle("selected-edge",el===linha));camadaA.querySelectorAll(".edge-label").forEach(el=>el.classList.toggle("selected-edge-label",el===t));gruposNos.forEach(g=>g.classList.remove("selected"));};linha.addEventListener("click",selecionar);t.addEventListener("click",selecionar);elementosArestas.push({dados:a,linha,rotulo:t})});
 p.nos.forEach(n=>{const xy=pos(n),d=dimensoesNo(n),ehTexto=n.tipo==="texto",g=criarSvg("g",{class:"node"+(ehTexto?" text-node":"")+(n.id===selecionado?" selected":""),transform:"translate("+xy.x+" "+xy.y+")","data-id":n.id,role:"button","aria-label":ehTexto?"Texto livre":n.titulo},camadaN);if(ehTexto){const frame=criarSvg("rect",{x:-d.w/2,y:-d.h/2,width:d.w,height:d.h,class:"text-node-frame"},g);if(n.estilo.contorno&&n.estilo.contorno!=="none"){frame.style.stroke=n.estilo.contorno;frame.style.strokeDasharray="none";}if(n.estilo.fundo&&n.estilo.fundo!=="transparent")frame.style.fill=n.estilo.fundo;const fo=criarSvg("foreignObject",{x:-d.w/2,y:-d.h/2,width:d.w,height:d.h,class:"text-node-foreign"},g);const div=document.createElementNS("http://www.w3.org/1999/xhtml","div");div.className="text-node-content";div.style.color=n.estilo.cor||"var(--text)";div.style.fontSize=(n.estilo.tamanhoFonte||14)+"px";if(n.estilo.familiaFonte)div.style.fontFamily=n.estilo.familiaFonte;div.innerHTML=renderizarMarkdown(n.corpo||"");fo.appendChild(div);const h=criarSvg("circle",{cx:d.w/2,cy:d.h/2,r:6,class:"text-resize-handle"},g);h.addEventListener("pointerdown",ev=>{if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();redimensionamento={id:n.id,grupo:g,inicio:pontoNoMapa(ev),original:{largura:d.w,altura:d.h},largura:d.w,altura:d.h};});}else{const bloco=criarSvg("rect",{x:-94,y:-35,width:188,height:70,stroke:n.estilo.contorno||n.estilo.cor||"#56739b"},g);bloco.style.fill=n.estilo.fundo||"#1c2a3b";const t=criarSvg("text",{x:0,y:-2},g);t.textContent=n.titulo.length>24?n.titulo.slice(0,22)+"…":n.titulo;const s=criarSvg("text",{x:0,y:18,class:"sub"},g);s.textContent=n.tipo;}
  [["esquerda",-d.w/2,0],["direita",d.w/2,0],["cima",0,-d.h/2],["baixo",0,d.h/2]].forEach(([lado,x,y])=>{if(n.ancoras&&n.ancoras[lado]===false)return;const porta=criarSvg("circle",{cx:x,cy:y,r:5,class:"connection-port",tabindex:"0"},g);porta.addEventListener("pointerdown",ev=>{if(ev.button!==0)return;ev.preventDefault();ev.stopPropagation();ev.currentTarget.setPointerCapture(ev.pointerId);conexao={id:n.id,lado,pointerId:ev.pointerId};const base=pos(n);linhaTemporaria=criarSvg("line",{x1:base.x+x,y1:base.y+y,x2:base.x+x,y2:base.y+y,class:"edge edge-preview"},camadaA);});});
  gruposNos.set(n.id,g);g.addEventListener("pointerdown",ev=>iniciarArraste(ev,n.id,n));g.addEventListener("click",ev=>{ev.stopPropagation();if(Date.now()<bloquearCliqueAte)return;if(selecionado!==n.id){arestaSelecionada=null;selecionado=n.id;gruposNos.forEach((grupo,id)=>grupo.classList.toggle("selected",id===n.id));renderInspector(atual());}});
 g.addEventListener("dblclick",ev=>{ev.preventDefault();ev.stopPropagation();if(Date.now()<bloquearCliqueAte)return;selecionado=n.id;arestaSelecionada=null;origemConexao=null;gruposNos.forEach((grupo,id)=>grupo.classList.toggle("selected",id===n.id));renderInspector(atual());if(ehTexto){editarTexto(n,g);}else{$("#node-title")?.focus();$("#node-title")?.select();aviso("Edição aberta no painel de propriedades.");}});});
 $("#empty").hidden=p.nos.length>0;renderStructure(p);renderColorHistory(p);$("#count-nodes").textContent=p.nos.length;$("#count-edges").textContent=p.arestas.length;$("#project-title").textContent=p.projeto.titulo;
 renderInspector(p);
}
function renderInspector(p){
 const area=$("#inspector"),n=p.nos.find(x=>x.id===selecionado),a=p.arestas.find(x=>x.id===arestaSelecionada);
 if(a){area.innerHTML='<details class="inspector-section" open><summary>Relação</summary><div class="section-body"><div class="field"><label for="edge-mode-input">Representação</label><select id="edge-mode-input"><option value="livre">Relação livre</option><option value="proposicao">Proposição formal</option></select></div><div class="field"><label for="edge-label-input">Conector textual</label><input id="edge-label-input" list="relation-suggestions" maxlength="300" placeholder="Escolha uma sugestão ou escreva livremente"><datalist id="relation-suggestions"></datalist><p class="hint">Relação livre aceita texto vazio. Proposição formal exige um conector para formar uma afirmação entre os conceitos.</p></div></div></details><details class="inspector-section" open><summary>Aparência</summary><div class="section-body"><p class="hint">A cor da linha pode ser alterada no painel Cores.</p></div></details><details class="inspector-section"><summary>Avançado</summary><div class="section-body"><p class="hint">Origem: '+a.de+'<br>Destino: '+a.para+'</p></div></details><div class="inspector-actions"><button id="delete-edge" class="danger">Excluir conexão</button></div>';const campo=$("#edge-label-input"),modo=$("#edge-mode-input"),lista=$("#relation-suggestions");campo.value=a.rotulo;modo.value=a.modo||"livre";conectoresSugeridos().forEach(texto=>{const op=document.createElement("option");op.value=texto;lista.appendChild(op)});campo.addEventListener("change",()=>{try{E.nucleo.estado.atualizarAresta(a.id,{rotulo:campo.value});aviso(campo.value.trim()?"Conector atualizado.":"Texto removido da relação.")}catch(e){aviso(e.message)}});modo.addEventListener("change",()=>{try{if(modo.value==="proposicao"&&!campo.value.trim())throw Error("Informe um conector antes de transformar a relação em proposição formal.");E.nucleo.estado.atualizarAresta(a.id,{modo:modo.value});aviso(modo.value==="proposicao"?"Proposição formal ativada.":"Relação livre ativada.")}catch(e){modo.value=a.modo||"livre";aviso(e.message)}});$("#delete-edge").onclick=()=>{E.nucleo.estado.removerAresta(a.id);arestaSelecionada=null;render();aviso("Conexão removida.")};return}
 if(!n){area.innerHTML='<p class="hint">Selecione um elemento no mapa para editar suas propriedades. Arraste de um ponto de conexão até outro conceito para criar uma relação.</p>';return}
 if(n.tipo==="texto"){
  area.innerHTML='<p class="hint">Texto livre · Markdown. Dê duplo clique no conteúdo para editar no próprio mapa. Use Ctrl + Enter para concluir.</p><div class="field"><label for="text-width">Largura (px)</label><input id="text-width" type="number" min="120" max="1200" step="10"></div><div class="field"><label for="text-height">Altura manual (px)</label><input id="text-height" type="number" min="48" max="1600" step="10"></div><button class="action" id="text-auto-height">Voltar à altura automática</button><div class="field"><label for="text-color">Cor do texto</label><input id="text-color" type="color"></div><div class="field"><label for="text-bg">Fundo</label><input id="text-bg" type="color"></div><div class="field"><label for="text-border">Borda</label><select id="text-border"><option value="none">Sem borda</option><option value="#526d91">Discreta</option><option value="#8da9d0">Clara</option></select></div><div class="field"><label for="text-font-size">Tamanho da fonte</label><input id="text-font-size" type="number" min="8" max="48"></div><div class="inspector-actions"><button id="delete-node" class="danger">Excluir texto</button></div>';
  $("#text-width").value=n.dimensoes&&n.dimensoes.largura||280;$("#text-height").value=n.dimensoes&&n.dimensoes.altura||alturaAutomatica(n);
  $("#text-color").value=/^#[0-9a-f]{6}$/i.test(n.estilo.cor||"")?n.estilo.cor:"#e8edf4";
  $("#text-bg").value=/^#[0-9a-f]{6}$/i.test(n.estilo.fundo||"")?n.estilo.fundo:"#101720";
  $("#text-font-size").value=n.estilo.tamanhoFonte||14;$("#text-border").value=n.estilo.contorno||"none";
  const salvarDim=()=>{try{E.nucleo.estado.atualizarNo(n.id,{dimensoes:{largura:Math.max(120,Math.min(1200,Number($("#text-width").value)||280)),altura:Math.max(48,Math.min(1600,Number($("#text-height").value)||alturaAutomatica(n))),modoAltura:"manual"}});render();}catch(e){aviso(e.message);}};
  $("#text-width").addEventListener("change",salvarDim);$("#text-height").addEventListener("change",salvarDim);
  $("#text-auto-height").onclick=()=>{E.nucleo.estado.atualizarNo(n.id,{dimensoes:{altura:null,modoAltura:"auto"}});render();};
  const salvarEstilo=()=>{const bg=$("#text-bg").value;E.nucleo.estado.atualizarNo(n.id,{estilo:{cor:$("#text-color").value,fundo:bg==="#101720"?"transparent":bg,contorno:$("#text-border").value,tamanhoFonte:Math.max(8,Math.min(48,Number($("#text-font-size").value)||14))}});render();};
  ["text-color","text-bg","text-border","text-font-size"].forEach(id=>$("#"+id).addEventListener("change",salvarEstilo));
  $("#delete-node").onclick=()=>{E.nucleo.estado.removerNo(n.id);selecionado=null;render();aviso("Texto removido.");};return;
 }
 area.innerHTML='<details class="inspector-section" open><summary>Geral</summary><div class="section-body"><div class="field"><label for="node-title">Título</label><input id="node-title" maxlength="500"></div><div class="field"><label for="node-type">Tipo</label><select id="node-type"><option>conceito</option><option>teoria</option><option>aplicacao</option><option>etapa</option><option>entidade</option><option>nota</option></select></div><div class="field"><label for="node-body">Descrição</label><textarea id="node-body"></textarea></div></div></details><details class="inspector-section"><summary>Aparência</summary><div class="section-body"><p class="hint">Personalize a cor individualmente no painel Cores.</p></div></details><details class="inspector-section"><summary>Organização</summary><div class="section-body"><label class="field"><label for="node-folder">Pasta</label><select id="node-folder"><option value="">Sem pasta</option></select></label></div></details><details class="inspector-section"><summary>Avançado</summary><div class="section-body"><p class="hint">Identificador: '+n.id+'</p></div></details><div class="inspector-actions"><button id="add-note">Adicionar escólio</button><button id="delete-node" class="danger">Excluir elemento</button></div><p class="hint" id="note-count"></p>';
 $("#node-title").value=n.titulo;$("#node-type").value=n.tipo;$("#node-body").value=n.corpo;
 const pasta=$("#node-folder");atual().pastas.forEach(f=>{const op=document.createElement("option");op.value=f.id;op.textContent=f.nome;pasta.appendChild(op)});pasta.value=n.pastaId||"";
 pasta.addEventListener("change",()=>{try{E.nucleo.estado.atualizarNo(n.id,{pastaId:pasta.value||null});aviso("Localização atualizada.")}catch(e){aviso(e.message)}});
 const persist=()=>{try{E.nucleo.estado.atualizarNo(n.id,{titulo:$("#node-title").value,tipo:$("#node-type").value,corpo:$("#node-body").value});}catch(e){aviso(e.message)}};
 $("#node-title").addEventListener("change",persist);$("#node-type").addEventListener("change",persist);$("#node-body").addEventListener("change",persist);
 $("#delete-node").onclick=()=>{E.nucleo.estado.removerNo(n.id);selecionado=null;render();aviso("Elemento removido.")};
 $("#add-note").onclick=()=>{const texto=prompt("Texto do escólio:");if(texto&&texto.trim()){E.nucleo.estado.adicionarEscolio(n.id,texto.trim(),"comentario");render();aviso("Escólio adicionado.")}};
 $("#note-count").textContent=p.escolios.filter(e=>e.alvo===n.id).length+" escólio(s) vinculado(s).";
}
function renderStructure(p){
 const area=$("#project-tree");if(!area)return;area.replaceChildren();
 const raiz=p.pastas.filter(f=>!f.paiId),nosSoltos=p.nos.filter(n=>!n.pastaId);
 function itemNo(n){const b=document.createElement("button");b.className="tree-row"+(n.id===selecionado?" selected":"");b.innerHTML='<span class="tree-toggle">·</span><span class="tree-icon">◇</span>';const t=document.createElement("span");t.textContent=n.titulo;b.appendChild(t);b.onclick=()=>{selecionado=n.id;arestaSelecionada=null;render();};return b}
 function pasta(f,container){const linha=document.createElement("div"),b=document.createElement("button");b.className="tree-row";b.innerHTML='<span class="tree-toggle">▾</span><span class="tree-icon">▰</span>';const t=document.createElement("span");t.textContent=f.nome;b.appendChild(t);b.onclick=()=>{const filhos=linha.querySelector(".tree-children");filhos.hidden=!filhos.hidden;b.querySelector(".tree-toggle").textContent=filhos.hidden?"▸":"▾";};b.oncontextmenu=ev=>{ev.preventDefault();const acao=prompt("Pasta: "+f.nome+"\\n1 renomear\\n2 excluir\\n3 criar subpasta");if(acao==="1"){const nome=prompt("Novo nome:",f.nome);if(nome&&nome.trim())E.nucleo.estado.executar(pr=>{const alvo=pr.pastas.find(x=>x.id===f.id);if(alvo)alvo.nome=nome.trim()})}else if(acao==="2"&&confirm("Excluir a pasta? Os elementos serão movidos para a raiz.")){E.nucleo.estado.executar(pr=>{pr.pastas=pr.pastas.filter(x=>x.id!==f.id);pr.nos.forEach(n=>{if(n.pastaId===f.id)n.pastaId=null});pr.pastas.forEach(x=>{if(x.paiId===f.id)x.paiId=null})})}else if(acao==="3"){const nome=prompt("Nome da subpasta:");if(nome&&nome.trim())E.nucleo.estado.executar(pr=>{pr.pastas.push({id:"pasta-"+Date.now().toString(36),nome:nome.trim(),paiId:f.id})})}};linha.appendChild(b);const filhos=document.createElement("div");filhos.className="tree-children";linha.appendChild(filhos);container.appendChild(linha);p.pastas.filter(x=>x.paiId===f.id).forEach(x=>pasta(x,filhos));p.nos.filter(n=>n.pastaId===f.id).forEach(n=>filhos.appendChild(itemNo(n)))}
 raiz.forEach(f=>pasta(f,area));nosSoltos.forEach(n=>area.appendChild(itemNo(n)));
}
function renderColorHistory(p){
 const recent=$("#recent-colors"),saved=$("#saved-palette");if(!recent||!saved)return;recent.replaceChildren();saved.replaceChildren();
 const coresRecentes=(p.coresRecentes||[]).slice(-8).reverse();coresRecentes.forEach(c=>criarAmostra(recent,c));
 (p.paletas||[]).forEach(c=>criarAmostra(saved,c.cor,c.nome));
}
function criarAmostra(area,cor,nome){const b=document.createElement("button");b.className="palette-swatch";b.style.background=cor;b.title=(nome?nome+" · ":"")+cor;b.setAttribute("aria-label",b.title);b.onclick=()=>{$("#element-color").value=cor;};area.appendChild(b)}
function registrarCor(cor){E.nucleo.estado.executar(p=>{p.coresRecentes=p.coresRecentes||[];p.coresRecentes=p.coresRecentes.filter(x=>x!==cor);p.coresRecentes.push(cor);p.coresRecentes=p.coresRecentes.slice(-12)})}
function aplicarCor(){
 const cor=$("#element-color").value;
 try{
  if(selecionado){const n=atual().nos.find(x=>x.id===selecionado);E.nucleo.estado.atualizarNo(selecionado,{estilo:Object.assign({},n.estilo,{fundo:cor})});}
  else if(arestaSelecionada)E.nucleo.estado.atualizarAresta(arestaSelecionada,{cor});
  else{aviso("Selecione um conceito ou uma conexão antes de aplicar a cor.");return}
  registrarCor(cor);aviso("Cor aplicada ao elemento selecionado.");
 }catch(e){aviso(e.message)}
}
function criarPasta(){
 const nome=prompt("Nome da nova pasta:");if(!nome||!nome.trim())return;
 E.nucleo.estado.executar(p=>{p.pastas=p.pastas||[];p.pastas.push({id:"pasta-"+Date.now().toString(36),nome:nome.trim(),paiId:null})});aviso("Pasta criada.");
}
function novoNo(){const p=atual(),i=p.nos.length;const ang=i*2.399,raio=130+Math.floor(i/7)*65;const n=E.nucleo.estado.adicionarNo({titulo:"Novo conceito",tipo:"conceito",corpo:"",pos:{x:Math.round(Math.cos(ang)*raio),y:Math.round(Math.sin(ang)*raio)}});selecionado=n.id;render();$("#node-title")?.focus();aviso("Elemento criado.")}
function baixar(nome,conteudo,tipo){const blob=new Blob([conteudo],{type:tipo}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=nome;a.click();URL.revokeObjectURL(url)}
$("#add-node").onclick=novoNo;$("#add-node-top").onclick=novoNo;$("#add-text").onclick=novoTexto;$("#add-text-top").onclick=novoTexto;$("#save-json-copy").onclick=()=>$("#save-json").click();
$("#new-folder").onclick=criarPasta;$("#tool-add-folder").onclick=criarPasta;$("#tool-add-node").onclick=novoNo;
document.querySelectorAll(".panel-tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".panel-tab").forEach(x=>{x.classList.toggle("active",x===tab);x.setAttribute("aria-selected",x===tab?"true":"false")});document.querySelectorAll(".panel-content").forEach(x=>{const ativo=x.id==="panel-"+tab.dataset.panel;x.hidden=!ativo;x.classList.toggle("active",ativo)})}));
document.querySelectorAll(".nav-item").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===tab));areaAtiva=tab.dataset.area;const cabecalho=document.querySelector(".canvas-head b"),subtitulo=document.querySelector(".canvas-head small"),status=document.querySelector(".status");if(areaAtiva==="mapas"){cabecalho.textContent="Mapas conceituais";subtitulo.textContent="Conceitos conectados por relações explicativas";status.textContent="Crie conexões entre conceitos e configure cada relação no painel Propriedades.";aviso("Editor de mapas conceituais ativo.");}else if(areaAtiva==="mapa"){cabecalho.textContent="Visão geral";subtitulo.textContent="Estrutura do projeto atual";status.textContent="Arraste entre pontos dos conceitos: criar conexão · Ctrl + Z: desfazer";aviso("Visão geral do projeto.");}else aviso("Esta área está prevista na navegação e será desenvolvida em uma etapa própria.");}));
$("#apply-color").onclick=aplicarCor;
$("#save-color").onclick=()=>{const cor=$("#element-color").value,nome=prompt("Nome para esta cor na paleta (opcional):","");E.nucleo.estado.executar(p=>{p.paletas=p.paletas||[];if(!p.paletas.some(x=>x.cor===cor&&x.nome===(nome||"")))p.paletas.push({id:"cor-"+Date.now().toString(36),cor,nome:nome||""})});aviso("Cor guardada na paleta.")};
$("#tool-undo").onclick=()=>$("#undo").click();$("#tool-redo").onclick=()=>$("#redo").click();
$("#tool-duplicate").onclick=()=>{const n=atual().nos.find(x=>x.id===selecionado);if(!n){aviso("Selecione um conceito.");return}const copia=E.nucleo.estado.adicionarNo(Object.assign({},n,{id:undefined,titulo:n.titulo+" (cópia)",pos:{x:n.pos.x+45,y:n.pos.y+45}}));selecionado=copia.id;render();aviso("Conceito duplicado.")};
$("#tool-delete").onclick=()=>{if(selecionado)$("#delete-node")?.click();else if(arestaSelecionada)$("#delete-edge")?.click();else aviso("Selecione um elemento.")};
$("#zoom-in").onclick=()=>{zoomAtual=Math.min(1.8,zoomAtual+0.1);svg.style.transform="scale("+zoomAtual+")"};
$("#zoom-out").onclick=()=>{zoomAtual=Math.max(.5,zoomAtual-.1);svg.style.transform="scale("+zoomAtual+")"};
$("#zoom-reset").onclick=()=>{zoomAtual=1;svg.style.transform="scale(1)"};
$("#new-project").onclick=()=>{if(!confirm("Criar um projeto vazio? As alterações atuais já estão salvas neste navegador."))return;const p=E.nucleo.modelo.criarProjeto("Novo projeto");carregar(p);aviso("Novo projeto criado.")};
$("#load-example").onclick=()=>{carregar(E.exemplos.aprendizagemSignificativa());aviso("Exemplo carregado.")};
$("#save-json").onclick=()=>baixar("escolio-projeto.json",JSON.stringify(atual(),null,2),"application/json");
$("#open-json").onclick=()=>$("#file-open").click();
$("#file-open").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{if(f.size>E.config.tamanhoMaximoArquivo)throw Error("Arquivo excede o limite de 5 MB.");const p=JSON.parse(await f.text());carregar(p);aviso("Projeto aberto.")}catch(e){aviso("Falha ao abrir: "+e.message)}ev.target.value=""};
$("#undo").onclick=()=>{if(E.nucleo.estado.desfazer())render()};$("#redo").onclick=()=>{if(E.nucleo.estado.refazer())render()};
$("#export-md").onclick=()=>{const p=atual();let md="# "+p.projeto.titulo+"\n\n";p.nos.forEach(n=>{if(n.tipo==="texto"){md+=n.corpo+"\n\n";return;}md+="## "+n.titulo+"\n\n"+n.corpo+"\n\n";p.escolios.filter(e=>e.alvo===n.id).forEach(e=>md+="- **Escólio ("+e.tipo+"):** "+e.texto+"\n")});md+="\n## Relações\n\n";p.arestas.forEach(a=>{const x=p.nos.find(n=>n.id===a.de),y=p.nos.find(n=>n.id===a.para);if(x&&y)md+="- "+x.titulo+" — "+(a.rotulo||"relação sem rótulo")+" → "+y.titulo+(a.modo==="proposicao"?" *(proposição formal)*":" *(relação livre)*")+"\n"});baixar("escolio-projeto.md",md,"text/markdown")};
$("#clear-selection").onclick=()=>{selecionado=null;arestaSelecionada=null;origemConexao=null;render()};
E.nucleo.estado.assinar(()=>{salvarLocal();render()});
try{const salvo=localStorage.getItem("escolio-projeto");if(salvo)carregar(JSON.parse(salvo));else carregar(projeto)}catch(e){carregar(projeto);aviso("Foi usado o projeto de demonstração.")}
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();$("#save-json").click()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();$("#undo").click()}});
})();
