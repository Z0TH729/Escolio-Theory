/* Escólio Theory · Planos Teóricos offline */
(function () {
  "use strict";
  const KEY = "escolio-planos-teoricos-v1";
  const $ = (s, r = document) => r.querySelector(s);
  const uid = p => p + "-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const clone = x => JSON.parse(JSON.stringify(x));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const now = () => new Date().toISOString();
  const initial = () => ({schema:1,plans:[],folders:[],references:[],links:[],versions:[],preferences:{left:245,right:285,activePlan:null,style:"ABNT"}});
  let db = load(), active = null, selected = new Set(), panel = "properties", dirtyTimer = null, versionTimer = null, lastSaved = "";
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.schema===1?Object.assign(initial(),x):initial()}catch(_){return initial()}}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));lastSaved=now();const s=$("#pt-save-state");if(s)s.textContent="Salvo localmente";return true}catch(e){const s=$("#pt-save-state");if(s)s.textContent="Falha ao salvar";return false}}
  function changed(){const s=$("#pt-save-state");if(s)s.textContent="Alterações pendentes";clearTimeout(dirtyTimer);dirtyTimer=setTimeout(()=>{persist();scheduleVersion()},350)}
  function scheduleVersion(){clearTimeout(versionTimer);versionTimer=setTimeout(()=>{if(!active)return;const p=plan();if(!p)return;const snap=clone(p),prev=db.versions.filter(v=>v.planId===p.id).at(-1);if(prev&&JSON.stringify(prev.snapshot)===JSON.stringify(snap))return;db.versions.push({id:uid("ver"),planId:p.id,createdAt:now(),label:"Salvamento automático",snapshot:snap});if(db.versions.length>300)db.versions=db.versions.slice(-300);persist()},1800)}
  function plan(){return db.plans.find(p=>p.id===active)||null}
  function createPlan(){const p={id:uid("plano"),title:"Novo plano teórico",description:"",author:"",category:"",status:"Rascunho",tags:[],folderId:null,createdAt:now(),updatedAt:now(),blocks:[{id:uid("bloco"),type:"heading",level:1,parentId:null,content:"Problema central"},{id:uid("bloco"),type:"text",parentId:null,content:"Descreva o problema que sua investigação pretende examinar."}],settings:{citationStyle:db.preferences.style||"ABNT"}};db.plans.push(p);active=p.id;selected.clear();changed();render()}
  function makeBlock(type){const labels={text:"",heading:"Nova seção",hypothesis:"",argument:"",objection:"",reference:"",citation:"",note:"",image:"",map:"",diagram:"",evidence:"",question:""};return {id:uid("bloco"),type,parentId:null,content:labels[type]??"",level:type==="heading"?2:undefined,referenceId:null,metadata:{}}}
  const blockNames={text:"Texto",heading:"Título",hypothesis:"Hipótese",argument:"Argumento",objection:"Objeção",reference:"Referência",citation:"Citação",note:"Nota",image:"Imagem / material",map:"Mapa conceitual vinculado",diagram:"Diagrama vinculado",evidence:"Evidência",question:"Questão em aberto"};
  function render(){
    const host=$("#planos-workspace");if(!host)return;
    host.innerHTML='<div class="pt-shell"><aside class="pt-left" id="pt-left"><div class="pt-brand"><span>PLANOS TEÓRICOS</span><button id="pt-new" title="Novo plano">＋</button></div><input id="pt-search" class="pt-input" placeholder="Pesquisar planos e conteúdo"><div class="pt-library-tools"><button id="pt-folder">＋ Pasta</button><button id="pt-filter">Filtros</button></div><div id="pt-library" class="pt-library"></div><div class="pt-left-foot"><button id="pt-import">Importar plano</button><button id="pt-export-library">Exportar biblioteca</button></div></aside><div class="pt-resizer" data-resize="left"></div><section class="pt-main"><header class="pt-top"><div><small>Biblioteca / Plano teórico</small><h1 id="pt-title-head">Planos Teóricos</h1></div><div class="pt-top-actions"><button id="pt-back" type="button" title="Voltar à tela principal">← Voltar</button><span id="pt-save-state">Salvo localmente</span><button id="pt-history">Histórico</button><button id="pt-export">Exportar</button><button id="pt-more">•••</button></div></header><div id="pt-editor" class="pt-editor"><div class="pt-welcome"><h2>Desenvolvimento teórico</h2><p>Crie um plano para estruturar problemas, hipóteses, argumentos, fontes e objeções.</p><button class="pt-primary" id="pt-create-first">Criar plano teórico</button></div></div></section><div class="pt-resizer" data-resize="right"></div><aside class="pt-right" id="pt-right"><div class="pt-tabs"><button data-panel="properties" class="active">Propriedades</button><button data-panel="references">Referências</button><button data-panel="analysis">Análise</button></div><div id="pt-inspector" class="pt-inspector"><p class="pt-muted">Selecione um bloco ou plano para visualizar suas propriedades.</p></div></aside></div><input id="pt-file" type="file" accept=".json,application/json" hidden>';
    bindShell();renderLibrary();renderEditor();renderInspector();
  }
  function bindShell(){
    $("#pt-new").onclick=createPlan;$("#pt-create-first").onclick=createPlan;
    const back=$("#pt-back");if(back)back.onclick=()=>{const home=document.querySelector('.nav-item[data-area="mapa"]');if(home){home.click();return}const workspace=document.querySelector(".workspace");if(workspace)workspace.classList.remove("pt-active");const host=$("#planos-workspace");if(host)host.hidden=true;};
    $("#pt-search").oninput=renderLibrary;
    $("#pt-folder").onclick=()=>{const name=prompt("Nome da pasta:");if(!name||!name.trim())return;db.folders.push({id:uid("pasta"),name:name.trim(),parentId:null});changed();renderLibrary()};
    $("#pt-import").onclick=()=>$("#pt-file").click();
    $("#pt-file").onchange=importFile;
    $("#pt-export-library").onclick=()=>download("escolio-biblioteca-planos.json",JSON.stringify(db,null,2),"application/json");
    $("#pt-export").onclick=exportMenu;$("#pt-history").onclick=showHistory;
    $("#pt-more").onclick=()=>{const p=plan();if(!p)return;const a=prompt("Ação: renomear | arquivar | excluir | status", "renomear");if(a==="renomear"){const n=prompt("Novo título:",p.title);if(n){p.title=n;p.updatedAt=now();changed();render()}}else if(a==="arquivar"){p.status="Arquivado";changed();render()}else if(a==="status"){const s=prompt("Estado: Rascunho, Em desenvolvimento, Em revisão, Consolidado, Arquivado",p.status);if(s){p.status=s;changed();render()}}else if(a==="excluir"&&confirm("Excluir este plano e seu histórico?")){db.plans=db.plans.filter(x=>x.id!==p.id);db.versions=db.versions.filter(x=>x.planId!==p.id);active=null;changed();render()}};
    document.querySelectorAll(".pt-tabs button").forEach(b=>b.onclick=()=>{panel=b.dataset.panel;document.querySelectorAll(".pt-tabs button").forEach(x=>x.classList.toggle("active",x===b));renderInspector()});
    $("#pt-filter").onclick=()=>{const f=prompt("Filtrar por estado (deixe vazio para todos):");$("#pt-search").dataset.status=f||"";renderLibrary()};
    document.querySelectorAll(".pt-resizer").forEach(el=>el.addEventListener("pointerdown",resizeStart));
    const p=plan();if(p)$("#pt-title-head").textContent=p.title;
  }
  function renderLibrary(){
    const q=($("#pt-search")?.value||"").toLocaleLowerCase("pt-BR"),status=$("#pt-search")?.dataset.status||"",host=$("#pt-library");if(!host)return;
    const folders=db.folders.map(f=>'<div class="pt-folder"><span>▸ '+esc(f.name)+'</span><button data-del-folder="'+f.id+'" title="Excluir pasta">×</button></div>').join("");
    const items=db.plans.filter(p=>(!status||p.status.toLocaleLowerCase("pt-BR").includes(status.toLocaleLowerCase("pt-BR")))&&(!q||[p.title,p.description,p.category,(p.tags||[]).join(" "),p.blocks.map(b=>b.content).join(" ")].join(" ").toLocaleLowerCase("pt-BR").includes(q))).map(p=>'<button class="pt-plan-item '+(p.id===active?"active":"")+'" data-plan="'+p.id+'"><strong>'+esc(p.title)+'</strong><small>'+esc(p.category||"Sem categoria")+' · '+esc(p.status)+'</small><span>'+((p.tags||[]).map(t=>"#"+esc(t)).join(" "))+'</span></button>').join("");
    host.innerHTML=folders+(items||'<p class="pt-muted">Nenhum plano encontrado.</p>');
    host.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{active=b.dataset.plan;selected.clear();renderLibrary();renderEditor();renderInspector()});
    host.querySelectorAll("[data-del-folder]").forEach(b=>b.onclick=()=>{db.folders=db.folders.filter(f=>f.id!==b.dataset.delFolder);changed();renderLibrary()});
  }
  function renderEditor(){
    const p=plan(),host=$("#pt-editor");if(!host)return;
    if(!p){$("#pt-title-head").textContent="Planos Teóricos";host.innerHTML='<div class="pt-welcome"><h2>Desenvolvimento teórico</h2><p>Crie um plano para estruturar problemas, hipóteses, argumentos, fontes e objeções.</p><button class="pt-primary" id="pt-create-first">Criar plano teórico</button></div>';$("#pt-create-first").onclick=createPlan;return}
    $("#pt-title-head").textContent=p.title;
    const blocks=p.blocks.map((b,i)=>blockHTML(b,i,p)).join("");
    host.innerHTML='<div class="pt-doc-head"><input class="pt-doc-title" id="pt-doc-title" value="'+esc(p.title)+'" aria-label="Título do plano"><textarea id="pt-doc-description" placeholder="Descrição do plano">'+esc(p.description)+'</textarea><div class="pt-meta"><input id="pt-author" placeholder="Autor" value="'+esc(p.author)+'"><input id="pt-category" placeholder="Categoria" value="'+esc(p.category)+'"><select id="pt-status"><option>Rascunho</option><option>Em desenvolvimento</option><option>Em revisão</option><option>Consolidado</option><option>Arquivado</option></select><input id="pt-tags" placeholder="Etiquetas separadas por vírgula" value="'+esc((p.tags||[]).join(", "))+'"></div></div><div class="pt-block-toolbar"><button id="pt-add-block">＋ Adicionar bloco</button><span>Digite / no início de um bloco para inserir outro elemento</span><button id="pt-analyze-shortcut">Analisar plano</button></div><div id="pt-blocks">'+blocks+'</div><div class="pt-add-bottom"><button id="pt-add-bottom">＋ Adicionar bloco</button></div>';
    $("#pt-status").value=p.status;
    $("#pt-doc-title").oninput=e=>{p.title=e.target.value;$("#pt-title-head").textContent=p.title;changed();renderLibrary()};
    $("#pt-doc-description").onchange=e=>{p.description=e.target.value;changed()};
    $("#pt-author").onchange=e=>{p.author=e.target.value;changed()};
    $("#pt-category").onchange=e=>{p.category=e.target.value;changed();renderLibrary()};
    $("#pt-status").onchange=e=>{p.status=e.target.value;changed();renderLibrary()};
    $("#pt-tags").onchange=e=>{p.tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed();renderLibrary()};
    $("#pt-add-block").onclick=()=>insertMenu();$("#pt-add-bottom").onclick=()=>insertMenu();$("#pt-analyze-shortcut").onclick=()=>{panel="analysis";document.querySelector('[data-panel="analysis"]').click()};
    host.querySelectorAll("[data-block]").forEach(el=>bindBlock(el));
    host.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>blockAction(b.dataset.action,b.dataset.id));
    host.querySelectorAll("[data-move]").forEach(b=>b.onclick=()=>moveBlock(b.dataset.id,Number(b.dataset.move)));
  }
  function blockHTML(b,i,p){
    const chosen=selected.has(b.id),indent=b.parentId?24:0,content=esc(b.content);
    let body;
    if(b.type==="heading")body='<input class="pt-heading-input" data-content value="'+content+'" placeholder="Título da seção">';
    else if(["map","diagram","image"].includes(b.type))body='<textarea data-content placeholder="'+esc(blockNames[b.type])+' · descreva ou informe o identificador do material">'+content+'</textarea><small class="pt-muted">Vínculo local/manual. Não carrega conteúdo externo automaticamente.</small>';
    else if(b.type==="reference")body='<textarea data-content placeholder="Anote a referência ou selecione uma fonte no painel Referências">'+content+'</textarea>';
    else body='<textarea data-content placeholder="'+esc(blockNames[b.type])+'">'+content+'</textarea>';
    const ref=b.referenceId?db.references.find(r=>r.id===b.referenceId):null;
    return '<article class="pt-block '+(chosen?"selected":"")+'" data-block="'+b.id+'" style="margin-left:'+indent+'px"><div class="pt-block-head"><button class="pt-block-grip" data-action="select" data-id="'+b.id+'" title="Selecionar bloco">⠿</button><span>'+esc(blockNames[b.type]||b.type)+'</span><div class="pt-block-actions"><button data-action="up" data-id="'+b.id+'" title="Mover para cima">↑</button><button data-action="down" data-id="'+b.id+'" title="Mover para baixo">↓</button><button data-action="indent" data-id="'+b.id+'" title="Aninhar">→</button><button data-action="duplicate" data-id="'+b.id+'" title="Duplicar">⧉</button><button data-action="delete" data-id="'+b.id+'" title="Excluir">×</button></div></div>'+body+(ref?'<small class="pt-ref-chip">Fonte: '+esc(ref.title)+'</small>':'')+'<div class="pt-block-foot"><button data-action="convert" data-id="'+b.id+'">Converter tipo</button><button data-action="link" data-id="'+b.id+'">Criar conexão</button><button data-action="reference" data-id="'+b.id+'">Associar referência</button><button data-action="citation" data-id="'+b.id+'">Inserir citação</button></div></article>';
  }
  function bindBlock(el){
    const id=el.dataset.block,b=plan().blocks.find(x=>x.id===id);
    el.addEventListener("click",e=>{if(e.target.closest("textarea,input,button"))return;if(e.ctrlKey||e.metaKey){selected.has(id)?selected.delete(id):selected.add(id)}else{selected.clear();selected.add(id)}renderEditor();renderInspector()});
    const field=el.querySelector("[data-content]");
    field.addEventListener("focus",()=>{selected.clear();selected.add(id);renderInspector()});
    field.addEventListener("input",e=>{b.content=e.target.value;plan().updatedAt=now();changed()});
    field.addEventListener("keydown",e=>{if(e.key==="/"&&e.target.selectionStart===0&&e.target.value===""){e.preventDefault();insertMenu(id)}if(e.key==="Escape")e.target.blur()});
    el.querySelectorAll("[data-action]").forEach(x=>x.onclick=()=>blockAction(x.dataset.action,x.dataset.id));
  }
  function insertMenu(afterId){
    const options=Object.entries(blockNames).map(([k,v])=>'<button data-type="'+k+'">'+esc(v)+'</button>').join("");
    const wrap=document.createElement("div");wrap.className="pt-insert-menu";wrap.innerHTML='<div class="pt-insert-card"><strong>Inserir bloco</strong><div>'+options+'</div><button class="pt-menu-close">Cancelar</button></div>';
    document.body.appendChild(wrap);wrap.querySelectorAll("[data-type]").forEach(b=>b.onclick=()=>{const p=plan(),n=makeBlock(b.dataset.type),i=afterId?p.blocks.findIndex(x=>x.id===afterId)+1:p.blocks.length;p.blocks.splice(i,0,n);wrap.remove();selected.clear();selected.add(n.id);changed();renderEditor();renderInspector();const el=document.querySelector('[data-block="'+n.id+'"] [data-content]');if(el)el.focus()});wrap.querySelector(".pt-menu-close").onclick=()=>wrap.remove();
  }
  function blockAction(action,id){
    const p=plan(),i=p.blocks.findIndex(b=>b.id===id);if(i<0)return;const b=p.blocks[i];
    if(action==="select"){selected.clear();selected.add(id);renderEditor();renderInspector();return}
    if(action==="up"||action==="down"){moveBlock(id,action==="up"?-1:1);return}
    if(action==="indent"){b.parentId=p.blocks[i-1]?.id||null;changed();renderEditor();return}
    if(action==="duplicate"){const c=clone(b);c.id=uid("bloco");p.blocks.splice(i+1,0,c);selected.clear();selected.add(c.id)}
    if(action==="delete"){if(!confirm("Excluir este bloco?"))return;p.blocks=p.blocks.filter(x=>x.id!==id&&!isDescendant(x,id,p.blocks));selected.delete(id)}
    if(action==="convert"){const type=prompt("Novo tipo: "+Object.keys(blockNames).join(", "),b.type);if(type&&blockNames[type])b.type=type}
    if(action==="link")createLink(id);
    if(action==="reference")chooseReference(id);
    if(action==="citation")insertCitation(id);
    changed();renderEditor();renderInspector();
  }
  function isDescendant(b,id,blocks){let p=b.parentId;while(p){if(p===id)return true;p=blocks.find(x=>x.id===p)?.parentId}return false}
  function moveBlock(id,delta){const p=plan(),i=p.blocks.findIndex(b=>b.id===id),j=i+delta;if(j<0||j>=p.blocks.length)return;[p.blocks[i],p.blocks[j]]=[p.blocks[j],p.blocks[i]];changed();renderEditor()}
  function renderInspector(){
    const host=$("#pt-inspector");if(!host)return;
    if(panel==="references"){renderReferences(host);return}
    if(panel==="analysis"){renderAnalysis(host);return}
    const p=plan(),id=Array.from(selected).at(-1),b=p&&p.blocks.find(x=>x.id===id);
    if(!p){host.innerHTML='<p class="pt-muted">Crie ou selecione um plano.</p>';return}
    if(!b){host.innerHTML='<h3>Plano</h3><div class="pt-field"><label>Estado</label><select id="pt-prop-status"><option>Rascunho</option><option>Em desenvolvimento</option><option>Em revisão</option><option>Consolidado</option><option>Arquivado</option></select></div><div class="pt-field"><label>Estilo de citação</label><select id="pt-cite-style"><option>ABNT</option><option>APA</option><option>Chicago</option></select></div><div class="pt-field"><label>Última atualização</label><span>'+esc(p.updatedAt)+'</span></div><button id="pt-snapshot">Criar versão nomeada</button>';$("#pt-prop-status").value=p.status;$("#pt-prop-status").onchange=e=>{p.status=e.target.value;changed();renderEditor()};$("#pt-cite-style").value=p.settings.citationStyle;$("#pt-cite-style").onchange=e=>{p.settings.citationStyle=e.target.value;db.preferences.style=e.target.value;changed()};$("#pt-snapshot").onclick=()=>{const label=prompt("Nome da versão:","Versão manual");if(label){db.versions.push({id:uid("ver"),planId:p.id,createdAt:now(),label,snapshot:clone(p)});persist();alert("Versão registrada localmente.")}};return}
    host.innerHTML='<h3>Bloco selecionado</h3><p class="pt-muted">'+esc(blockNames[b.type])+'</p><div class="pt-field"><label>Tipo</label><select id="pt-block-type">'+Object.entries(blockNames).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join("")+'</select></div><div class="pt-field"><label>Hierarquia</label><select id="pt-block-level"><option value="0">Nível principal</option><option value="1">Subseção</option><option value="2">Sub-subseção</option></select></div><div class="pt-field"><label>Vínculo de referência</label><select id="pt-block-ref"><option value="">Nenhuma</option>'+db.references.map(r=>'<option value="'+r.id+'">'+esc(r.title)+'</option>').join("")+'</select></div><button id="pt-block-unlink">Remover associação</button><p class="pt-muted">A edição do conteúdo ocorre diretamente no documento.</p>';
    $("#pt-block-type").value=b.type;$("#pt-block-type").onchange=e=>{b.type=e.target.value;changed();renderEditor();renderInspector()};
    $("#pt-block-level").value=b.parentId?1:0;$("#pt-block-level").onchange=e=>{b.parentId=e.target.value==="0"?null:p.blocks[Math.max(0,p.blocks.indexOf(b)-1)]?.id||null;changed();renderEditor()};
    $("#pt-block-ref").value=b.referenceId||"";$("#pt-block-ref").onchange=e=>{b.referenceId=e.target.value||null;changed();renderEditor()};
    $("#pt-block-unlink").onclick=()=>{b.referenceId=null;changed();renderEditor();renderInspector()};
  }
  function renderReferences(host){
    host.innerHTML='<h3>Biblioteca bibliográfica</h3><p class="pt-muted">Cadastro e reutilização local de fontes.</p><button id="pt-ref-new" class="pt-primary">＋ Nova referência</button><div class="pt-ref-list">'+db.references.map(r=>'<div class="pt-ref-item"><strong>'+esc(r.title)+'</strong><small>'+esc(r.author)+' · '+esc(r.year||"s.d.")+'</small><button data-ref-edit="'+r.id+'">Editar</button><button data-ref-del="'+r.id+'">Excluir</button></div>').join("")+'</div><div class="pt-field"><label>Estilo bibliográfico</label><select id="pt-ref-style"><option>ABNT</option><option>APA</option><option>Chicago</option></select></div>';
    $("#pt-ref-new").onclick=()=>editReference();$("#pt-ref-style").value=plan()?.settings.citationStyle||"ABNT";$("#pt-ref-style").onchange=e=>{if(plan())plan().settings.citationStyle=e.target.value;changed()};
    host.querySelectorAll("[data-ref-edit]").forEach(b=>b.onclick=()=>editReference(b.dataset.refEdit));host.querySelectorAll("[data-ref-del]").forEach(b=>b.onclick=()=>{db.references=db.references.filter(r=>r.id!==b.dataset.refDel);db.plans.forEach(p=>p.blocks.forEach(x=>{if(x.referenceId===b.dataset.refDel)x.referenceId=null}));changed();renderReferences(host)});
  }
  function editReference(id){
    const r=db.references.find(x=>x.id===id)||{id:uid("ref"),author:"",title:"",year:"",publisher:"",edition:"",isbn:"",doi:"",url:"",notes:"",kind:"Livro"};
    const fields=[["author","Autor"],["title","Título"],["year","Ano"],["publisher","Editora / periódico"],["edition","Edição / volume"],["isbn","ISBN"],["doi","DOI"],["url","URL"],["notes","Notas"],["kind","Tipo de material"]];
    const vals=fields.map(([k,l])=>'<label>'+l+'<input data-ref-field="'+k+'" value="'+esc(r[k])+'"></label>').join("");
    const box=document.createElement("div");box.className="pt-insert-menu";box.innerHTML='<form class="pt-reference-form"><h3>Dados bibliográficos</h3>'+vals+'<div><button type="submit" class="pt-primary">Salvar referência</button><button type="button" class="pt-cancel">Cancelar</button></div></form>';document.body.appendChild(box);
    box.querySelector("form").onsubmit=e=>{e.preventDefault();fields.forEach(([k])=>r[k]=box.querySelector('[data-ref-field="'+k+'"]').value);if(!db.references.some(x=>x.id===r.id))db.references.push(r);box.remove();changed();renderInspector()};
    box.querySelector(".pt-cancel").onclick=()=>box.remove();
  }
  function chooseReference(blockId){if(!db.references.length){editReference();return}const r=prompt("Digite o número da referência:\n"+db.references.map((x,i)=>(i+1)+". "+x.title).join("\n"));const n=Number(r)-1;if(db.references[n]){const b=plan().blocks.find(x=>x.id===blockId);b.referenceId=db.references[n].id;changed()}}
  function insertCitation(blockId){
    if(!db.references.length){editReference();return}
    const choice=prompt("Referência (número):\\n"+db.references.map((r,i)=>(i+1)+". "+r.author+" — "+r.title).join("\\n"));
    const ref=db.references[Number(choice)-1];if(!ref)return;
    const mode=prompt("Tipo: autor-data | integrada | nota | direta","autor-data")||"autor-data";
    const author=ref.author||"Autor",year=ref.year||"s.d.",page=prompt("Página (opcional):","")||"";
    let citation;
    if(mode==="integrada")citation="Segundo "+author+" ("+year+(page?", p. "+page:"")+"), ";
    else if(mode==="nota")citation="[^"+(plan().blocks.filter(x=>x.type==="citation").length+1)+"]";
    else if(mode==="direta"){const quote=prompt("Trecho da fonte (insira apenas texto que você tem autorização para usar):","");if(quote===null)return;citation="“"+quote+"” ("+author+", "+year+(page?", p. "+page:"")+")"}
    else citation="("+author+", "+year+(page?", p. "+page:"")+")";
    const b=plan().blocks.find(x=>x.id===blockId);b.content=(b.content?b.content+" ":"")+citation;b.referenceId=ref.id;changed();renderEditor();renderInspector();
  }
  function createLink(blockId){
    const p=plan(),target=prompt("Identificador ou nome do material relacionado (mapa, diagrama, documento ou plano):");if(!target)return;
    const category=prompt("Categoria da conexão (fundamenta, exemplifica, contradiz, complementa, depende de, representa):","fundamenta")||"relaciona";
    const description=prompt("Descrição da conexão:","")||"",reason=prompt("Justificativa da relação:","")||"";
    db.links.push({id:uid("link"),planId:p.id,blockId,target,category,description,reason,createdAt:now()});changed();alert("Conexão registrada na biblioteca local.");
  }
  function renderAnalysis(host){
    const p=plan();if(!p){host.innerHTML='<p class="pt-muted">Selecione um plano.</p>';return}
    const blocks=p.blocks,issues=[],hyp=blocks.filter(b=>b.type==="hypothesis"),args=blocks.filter(b=>b.type==="argument"),obs=blocks.filter(b=>b.type==="objection"),evidence=blocks.filter(b=>b.type==="evidence"),questions=blocks.filter(b=>b.type==="question");
    if(!blocks.some(b=>b.type==="heading"))issues.push("O plano ainda não possui títulos para estruturar as seções.");
    if(hyp.length&&!args.length)issues.push("Há hipóteses registradas, mas nenhum bloco de argumento.");
    if(args.length&&!evidence.length)issues.push("Existem argumentos sem blocos classificados como evidência. Verifique se precisam de fundamentação.");
    if(!obs.length)issues.push("Nenhuma objeção foi registrada. Considere examinar explicações alternativas.");
    if(!questions.length)issues.push("Não há questões em aberto registradas.");
    const empty=blocks.filter(b=>!String(b.content||"").trim()).length;
    if(empty)issues.push(empty+" bloco(s) sem conteúdo.");
    const refsUsed=new Set(blocks.map(b=>b.referenceId).filter(Boolean)),unused=db.references.filter(r=>!refsUsed.has(r.id));
    host.innerHTML='<h3>Análise estrutural</h3><p class="pt-muted">Verificações locais e determinísticas. Não avaliam verdade, validade científica ou mérito filosófico.</p><div class="pt-metrics"><div><strong>'+blocks.length+'</strong><small>Blocos</small></div><div><strong>'+hyp.length+'</strong><small>Hipóteses</small></div><div><strong>'+args.length+'</strong><small>Argumentos</small></div><div><strong>'+evidence.length+'</strong><small>Evidências</small></div></div><h4>Pontos para revisão</h4>'+(issues.length?'<ul class="pt-issues">'+issues.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'<p>Nenhum alerta estrutural básico.</p>')+'<h4>Referências</h4><p>'+refsUsed.size+' utilizadas · '+unused.length+' não associadas a blocos.</p><h4>Conexões avançadas</h4><p>'+db.links.filter(x=>x.planId===p.id).length+' conexões registradas.</p><button id="pt-report">Gerar relatório de análise</button>';
    $("#pt-report").onclick=()=>download("analise-"+slug(p.title)+".txt",issues.join("\n")||"Nenhum alerta estrutural básico.", "text/plain;charset=utf-8");
  }
  function showHistory(){
    const p=plan();if(!p)return;const vs=db.versions.filter(v=>v.planId===p.id).slice().reverse();
    const box=document.createElement("div");box.className="pt-insert-menu";box.innerHTML='<div class="pt-history-box"><h3>Histórico de versões</h3><p>Versões armazenadas localmente neste navegador.</p><div>'+vs.map(v=>'<article><strong>'+esc(v.label)+'</strong><small>'+new Date(v.createdAt).toLocaleString("pt-BR")+'</small><button data-restore="'+v.id+'">Restaurar</button><button data-compare="'+v.id+'">Comparar com atual</button></article>').join("")+'</div><button class="pt-cancel">Fechar</button></div>';document.body.appendChild(box);
    box.querySelector(".pt-cancel").onclick=()=>box.remove();
    box.querySelectorAll("[data-restore]").forEach(b=>b.onclick=()=>{const v=vs.find(x=>x.id===b.dataset.restore);if(v&&confirm("Restaurar esta versão? A versão atual será preservada no histórico.")){db.versions.push({id:uid("ver"),planId:p.id,createdAt:now(),label:"Antes da restauração",snapshot:clone(p)});Object.assign(p,clone(v.snapshot));changed();box.remove();render()}});
    box.querySelectorAll("[data-compare]").forEach(b=>b.onclick=()=>{const v=vs.find(x=>x.id===b.dataset.compare),a=v.snapshot.blocks||[],c=p.blocks||[],diff=[];if(v.snapshot.title!==p.title)diff.push("Título alterado.");if(a.length!==c.length)diff.push("Quantidade de blocos: "+a.length+" → "+c.length);const map=new Map(a.map(x=>[x.id,x]));c.forEach(x=>{const old=map.get(x.id);if(!old)diff.push("Bloco novo: "+x.type);else if(old.content!==x.content)diff.push("Conteúdo alterado: "+(x.type||"bloco"))});alert(diff.join("\n")||"Nenhuma diferença estrutural detectada.")});
  }
  function exportMenu(){
    const p=plan();if(!p)return;const f=prompt("Formato: markdown | html | json | txt | imprimir", "markdown");if(!f)return;
    if(f==="json")download(slug(p.title)+".json",JSON.stringify(p,null,2),"application/json");
    else if(f==="markdown")download(slug(p.title)+".md",toMarkdown(p),"text/markdown;charset=utf-8");
    else if(f==="txt")download(slug(p.title)+".txt",toText(p),"text/plain;charset=utf-8");
    else if(f==="html"){const html="<!doctype html><html lang='pt-BR'><meta charset='utf-8'><title>"+esc(p.title)+"</title><body><h1>"+esc(p.title)+"</h1>"+p.blocks.map(b=>"<section><h2>"+esc(blockNames[b.type])+"</h2><p>"+esc(b.content).replace(/\n/g,"<br>")+"</p></section>").join("")+"</body></html>";download(slug(p.title)+".html",html,"text/html;charset=utf-8")}
    else if(f==="imprimir"){const w=window.open("","_blank");if(!w){alert("Permita a abertura da janela para imprimir em PDF.");return}w.document.write("<!doctype html><meta charset='utf-8'><title>"+esc(p.title)+"</title><h1>"+esc(p.title)+"</h1>"+p.blocks.map(b=>"<section><h2>"+esc(blockNames[b.type])+"</h2><p>"+esc(b.content).replace(/\n/g,"<br>")+"</p></section>").join(""));w.document.close();w.print()}
    else alert("Formato não reconhecido.");
  }
  function toMarkdown(p){return "# "+p.title+"\n\n"+(p.description||"")+"\n\n"+p.blocks.map(b=>(b.type==="heading"?"## ": "### "+blockNames[b.type]+"\n\n")+b.content).join("\n\n")+"\n\n## Referências\n"+db.references.map(r=>formatReference(r,p.settings.citationStyle)).join("\n")}
  function toText(p){return p.title+"\n"+p.description+"\n\n"+p.blocks.map(b=>blockNames[b.type]+"\n"+b.content).join("\n\n")}
  function formatReference(r,style){if(style==="APA")return [r.author,r.year?"("+r.year+").":"",r.title+".",r.publisher].filter(Boolean).join(" ");if(style==="Chicago")return [r.author+".",r.title+".",r.publisher,r.year].filter(Boolean).join(" ");return [r.author.toUpperCase()+".",r.title+".",r.publisher,r.year].filter(Boolean).join(" ")}
  function importFile(e){const file=e.target.files[0];if(!file)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);const p=x.schema===1&&x.plans?x.plans[0]:x;if(!p||!Array.isArray(p.blocks)||!p.title)throw Error("Arquivo de plano inválido.");p.id=uid("plano");db.plans.push(p);active=p.id;changed();render()}catch(err){alert("Não foi possível importar: "+err.message)}};rd.readAsText(file);e.target.value=""}
  function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function slug(s){return String(s||"plano").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"plano"}
  function resizeStart(e){const side=e.currentTarget.dataset.resize,start=e.clientX,old=side==="left"?db.preferences.left:db.preferences.right;e.currentTarget.setPointerCapture(e.pointerId);const move=ev=>{const delta=ev.clientX-start,val=Math.max(190,Math.min(440,old+(side==="left"?delta:-delta)));if(side==="left"){db.preferences.left=val;$(".pt-left").style.width=val+"px"}else{db.preferences.right=val;$(".pt-right").style.width=val+"px"}};const end=()=>{e.currentTarget.removeEventListener("pointermove",move);e.currentTarget.removeEventListener("pointerup",end);changed()};e.currentTarget.addEventListener("pointermove",move);e.currentTarget.addEventListener("pointerup",end)}
  document.addEventListener("click",e=>{
    const nav=e.target.closest('.nav-item[data-area="planos"]');if(nav){const es=document.querySelector("#escolios-workspace");if(es){es.hidden=true;document.querySelector(".workspace")?.classList.remove("es-active")}e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===nav));document.querySelector(".workspace").classList.add("pt-active");$("#planos-workspace").hidden=false;render();return}
    if(e.target.closest('.nav-item')&&document.querySelector(".workspace.pt-active")){document.querySelector(".workspace").classList.remove("pt-active");$("#planos-workspace").hidden=true}
  },true);
  document.addEventListener("keydown",e=>{if(!document.querySelector(".workspace.pt-active"))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();persist()}});
  window.addEventListener("beforeunload",persist);
  window.EscolioPlanos={version:"1.0.0",offline:true};
})();