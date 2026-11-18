/* Gerenciador de temas · Escólio Theory */
(function(global){
"use strict";
const KEY="escolio-themes-v1", catalog=global.EscolioTemasCatalogo||[], $=s=>document.querySelector(s);
const tokenKeys=["bg","panel","panel2","line","text","muted","accent","accent2","danger"];
const groups=[
 {id:"surfaces",name:"Fundos e superfícies",keys:["bg","panel","panel2","canvas","menu"]},
 {id:"text",name:"Textos e tipografia",keys:["text","muted","icon"]},
 {id:"controls",name:"Botões e controles",keys:["accent","accent2","buttonHover","selection","focus"]},
 {id:"structure",name:"Bordas e divisórias",keys:["line","borderStrong"]},
 {id:"map",name:"Canvas e diagramas",keys:["canvas","node","edge","selection"]},
 {id:"feedback",name:"Destaques e estados",keys:["danger","success","warning"]}
];
const defaults={canvas:"#111821",menu:"#202a38",icon:"#aebbd0",buttonHover:"#26364a",selection:"#8fb8ec",focus:"#8fb8ec",borderStrong:"#52647a",node:"#202f43",edge:"#8fb8ec",success:"#5ba982",warning:"#d6a24b"};
const labels={bg:"Fundo geral",panel:"Painéis",panel2:"Superfícies e cartões",line:"Bordas",text:"Texto principal",muted:"Texto secundário",accent:"Cor de destaque",accent2:"Ação principal",danger:"Erro / perigo",canvas:"Fundo do canvas",menu:"Menus e popovers",icon:"Ícones",buttonHover:"Hover dos botões",selection:"Seleção",focus:"Foco de teclado",borderStrong:"Divisórias fortes",node:"Blocos do mapa",edge:"Conexões",success:"Sucesso",warning:"Avisos"};
let data={global:"midnight",custom:[],favorites:[],project:null,scope:"global"},active=null,draft=null,filter="all";
function clone(v){return JSON.parse(JSON.stringify(v))}
function read(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&Array.isArray(x.custom))data=Object.assign(data,x)}catch(_){}}
function write(){localStorage.setItem(KEY,JSON.stringify(data))}
function find(id){return catalog.find(t=>t.id===id)||data.custom.find(t=>t.id===id)||null}
function tokens(t){return Object.assign({},defaults,t?.tokens||{})}
function path(t){const dir=t.categoria==="color"?"colors":t.categoria==="special"?"special":t.categoria;return "themes/"+dir+"/"+t.id+".css"}
function apply(t,save=true){
 if(!t)return;active=clone(t);const root=document.documentElement;
 const all=tokens(t);Object.keys(all).forEach(k=>root.style.setProperty("--"+k,all[k]));
 const link=$("#escolio-theme-stylesheet");if(link){if(catalog.some(x=>x.id===t.id)){link.href=path(t);link.disabled=false}else link.disabled=true}
 root.dataset.theme=t.id;root.style.colorScheme=t.modo==="claro"?"light":"dark";
 if(save){if(data.scope==="project")data.project=clone(t);else data.global=t.id;write();if(data.scope==="project")global.EscolioProjetos?.salvar()}
 renderLibrary();renderScope();
}
function applySaved(){const t=data.project||find(data.global)||catalog[0];apply(t,false)}
function setScope(){data.scope=$("#theme-project-scope")?.checked?"project":"global";if(data.scope==="project"&&active)data.project=clone(active);if(data.scope==="global"&&active)data.global=active.id;write();renderScope();global.EscolioProjetos?.salvar()}
function renderScope(){const c=$("#theme-project-scope");if(c)c.checked=data.scope==="project"}
function categoryOf(t){return t.categoria==="dark"?"dark":t.categoria==="light"?"light":t.categoria==="color"?"colors":t.categoria==="special"?"special":"custom"}
function card(t){
 const el=document.createElement("article");el.className="theme-card"+(active?.id===t.id?" active":"");
 const sw=document.createElement("div");sw.className="theme-swatches";const v=tokens(t);["bg","panel","panel2","accent","accent2"].forEach(k=>{const s=document.createElement("i");s.style.background=v[k];sw.append(s)});
 const info=document.createElement("div");info.className="theme-card-info";const name=document.createElement("strong");name.textContent=t.nome;const meta=document.createElement("small");meta.textContent=(t.modo==="claro"?"Claro":"Escuro")+" · "+(t.categoria==="special"?"Especial":t.categoria==="color"?"Colorido":t.categoria==="custom"?"Personalizado":t.categoria==="light"?"Light":"Dark");info.append(name,meta);
 const fav=document.createElement("button");fav.className="theme-favorite";fav.type="button";fav.textContent=data.favorites.includes(t.id)?"★":"☆";fav.title="Favoritar tema";fav.onclick=e=>{e.stopPropagation();data.favorites=data.favorites.includes(t.id)?data.favorites.filter(x=>x!==t.id):data.favorites.concat(t.id);write();renderLibrary()};
 el.append(sw,info,fav);el.onclick=()=>{draft=clone(t);apply(t);renderEditor();};return el;
}
function renderLibrary(){
 const host=$("#theme-library");if(!host)return;host.replaceChildren();
 const q=($("#theme-search")?.value||"").toLocaleLowerCase("pt-BR");
 const all=catalog.concat(data.custom).filter(t=>{
  const cat=categoryOf(t);const ok=filter==="all"||filter===cat||(filter==="favorites"&&data.favorites.includes(t.id));
  return ok&&(!q||t.nome.toLocaleLowerCase("pt-BR").includes(q));
 });
 all.forEach(t=>host.append(card(t)));
 const count=$("#theme-count");if(count)count.textContent=all.length+" temas";
 const empty=$("#theme-empty");if(empty)empty.hidden=all.length>0;
}
function rgb(hex){const h=hex.replace("#","");const n=parseInt(h.length===3?h.split("").map(x=>x+x).join(""):h,16);return {r:n>>16&255,g:n>>8&255,b:n&255}}
function hsl(hex){let {r,g,b}=rgb(hex);r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60}return {h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)}}
function colorRow(key){
 const row=document.createElement("div");row.className="theme-color-row";
 const label=document.createElement("label");label.textContent=labels[key]||key;label.htmlFor="theme-color-"+key;
 const picker=document.createElement("input");picker.type="color";picker.id="theme-color-"+key;picker.value=draft.tokens[key]||defaults[key]||"#777777";
 const hex=document.createElement("input");hex.type="text";hex.value=picker.value;hex.maxLength=7;hex.setAttribute("aria-label","HEX "+label.textContent);
 const rgbOut=document.createElement("small"),hslOut=document.createElement("small");
 function update(v){if(!/^#[0-9a-f]{6}$/i.test(v))return;draft.tokens[key]=v.toLowerCase();picker.value=v;hex.value=v;const c=rgb(v),s=hsl(v);rgbOut.textContent="RGB "+c.r+", "+c.g+", "+c.b;hslOut.textContent="HSL "+s.h+"°, "+s.s+"%, "+s.l+"%";apply(draft,false)}
 picker.oninput=()=>update(picker.value);hex.onchange=()=>update(hex.value.trim());
 const values=document.createElement("div");values.className="theme-color-values";values.append(hex,rgbOut,hslOut);row.append(label,picker,values);update(picker.value);return row;
}
function renderEditor(){
 const host=$("#theme-editor-fields"),name=$("#theme-name");if(!host||!draft)return;
 name.value=draft.nome;const mode=$("#theme-mode");if(mode)mode.value=draft.modo==="claro"?"light":"dark";host.replaceChildren();
 groups.forEach(g=>{const section=document.createElement("section");section.className="theme-editor-group";const h=document.createElement("h3");h.textContent=g.name;section.append(h);[...new Set(g.keys)].forEach(k=>section.append(colorRow(k)));host.append(section)});
}
function renderScope(){const c=$("#theme-project-scope");if(c)c.checked=data.scope==="project"}
function saveCustom(){
 if(!draft)return;const name=$("#theme-name").value.trim();if(!name){alert("Informe um nome para o tema.");return}
 draft.nome=name;draft.categoria="custom";draft.modo=($("#theme-mode").value==="light"?"claro":"escuro");draft.id=draft.id?.startsWith("custom-")?draft.id:"custom-"+Date.now().toString(36);
 const i=data.custom.findIndex(t=>t.id===draft.id);if(i>=0)data.custom[i]=clone(draft);else data.custom.push(clone(draft));
 if(data.scope==="project")data.project=clone(draft);else data.global=draft.id;
 write();apply(draft,false);renderLibrary();global.EscolioProjetos?.salvar();alert("Tema personalizado salvo.");
}
function newTheme(){draft={id:"custom-"+Date.now().toString(36),nome:"Meu tema",categoria:"custom",modo:"escuro",tokens:Object.assign({},defaults,tokens(active))};apply(draft,false);renderEditor();$("#theme-name")?.focus()}
function duplicateTheme(){if(!active)return;draft=clone(active);draft.id="custom-"+Date.now().toString(36);draft.nome=active.nome+" (cópia)";draft.categoria="custom";data.custom.push(clone(draft));write();apply(draft,false);renderLibrary();renderEditor()}
function deleteTheme(){if(!active||!data.custom.some(t=>t.id===active.id))return alert("Somente temas personalizados podem ser excluídos.");if(!confirm("Excluir o tema "+active.nome+"?"))return;data.custom=data.custom.filter(t=>t.id!==active.id);data.favorites=data.favorites.filter(x=>x!==active.id);if(data.project?.id===active.id)data.project=null;draft=clone(find(data.global)||catalog[0]);write();apply(draft);renderLibrary();renderEditor()}
function exportTheme(){if(!active)return;const blob=new Blob([JSON.stringify({format:"escolio-theme",version:1,theme:active},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(active.nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9-_]+/gi,"-")||"tema")+".escolio-theme.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function importTheme(file){if(!file)return;file.text().then(s=>{const x=JSON.parse(s),t=x.theme;if(x.format!=="escolio-theme"||!t?.tokens)throw Error("Arquivo de tema inválido.");draft=clone(t);draft.id="custom-"+Date.now().toString(36);draft.categoria="custom";data.custom.push(clone(draft));write();apply(draft,false);renderLibrary();renderEditor()}).catch(e=>alert("Não foi possível importar o tema: "+e.message))}
function bind(){
 document.querySelectorAll("[data-theme-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.themeFilter;document.querySelectorAll("[data-theme-filter]").forEach(x=>x.classList.toggle("active",x===b));renderLibrary()});
 $("#theme-search")?.addEventListener("input",renderLibrary);$("#theme-project-scope")?.addEventListener("change",setScope);
 $("#theme-new")?.addEventListener("click",newTheme);$("#theme-duplicate")?.addEventListener("click",duplicateTheme);$("#theme-delete")?.addEventListener("click",deleteTheme);$("#theme-save")?.addEventListener("click",saveCustom);$("#theme-export")?.addEventListener("click",exportTheme);
 $("#theme-import")?.addEventListener("click",()=>$("#theme-import-file").click());$("#theme-import-file")?.addEventListener("change",e=>{importTheme(e.target.files[0]);e.target.value=""});
 $("#theme-mode")?.addEventListener("change",()=>{if(draft){draft.modo=$("#theme-mode").value==="light"?"claro":"escuro";apply(draft,false)}});
 $("#theme-restore")?.addEventListener("click",()=>{draft=clone(find(active?.id)||catalog[0]);apply(draft,false);renderEditor()});
}
function exportarTemaProjeto(){return data.scope==="project"&&data.project?clone(data.project):null}
function restaurarTemaProjeto(t){data.project=t?clone(t):null;if(t){data.scope="project";apply(t,false)}else{data.scope="global";apply(find(data.global)||catalog[0],false)}write();renderScope()}
function init(){read();bind();applySaved();renderLibrary();renderEditor();renderScope()}
global.EscolioThemes={inicializar:init,aplicar:apply,exportarTemaProjeto,restaurarTemaProjeto,obterAtivo:()=>clone(active),obterGlobal:()=>data.global};
init();
})(window);
