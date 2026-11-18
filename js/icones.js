/* Escólio Theory · sistema local e unificado de ícones */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const paths={
plus:'<path d="M12 5v14M5 12h14"/>',
minus:'<path d="M5 12h14"/>',
folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
undo:'<path d="M3 7v6h6"/><path d="M21 17a8 8 0 0 0-13.7-5.7L3 13"/>',
redo:'<path d="M21 7v6h-6"/><path d="M3 17a8 8 0 0 1 13.7-5.7L21 13"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
close:'<path d="m18 6-12 12M6 6l12 12"/>',
check:'<path d="m5 12 4 4L19 6"/>',
more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
zoomIn:'<circle cx="11" cy="11" r="7"/><path d="M11 8v6m-3-3h6m4 4 4 4"/>',
zoomOut:'<circle cx="11" cy="11" r="7"/><path d="M8 11h6m4 4 4 4"/>',
zoomFit:'<path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
link:'<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',
settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2z"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
calculator:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 16h.01M12 16h.01M16 16h.01"/>',
code:'<path d="m8 17-5-5 5-5m8 10 5-5-5-5m-2-7-4 20"/>',
filter:'<path d="M4 5h16M7 12h10m-7 7h4"/>',
refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/>',
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
};
function choose(label,id){
 const s=(label+" "+id).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 if(/[×✕✖]/.test(label)||/fechar|cancelar|remover da lista|sair/.test(s))return "close";
 if(/excluir|apagar|remover|deletar/.test(s))return "trash";
 if(/duplicar|copiar/.test(s))return "copy";
 if(/[↶⟲]/.test(label)||/desfazer/.test(s))return "undo";
 if(/[↷⟳]/.test(label)||/refazer/.test(s))return "redo";
 if(/aproximar|zoom in/.test(s))return "zoomIn";
 if(/afastar|zoom out/.test(s))return "zoomOut";
 if(/ajustar visualizacao|enquadrar|zoom reset/.test(s))return "zoomFit";
 if(/pesquisar|buscar|search/.test(s))return "search";
 if(/[⇧↑↗]/.test(label)||/importar|abrir arquivo|abrir projeto|abrir/.test(s))return "upload";
 if(/[⇩↓]/.test(label)||/exportar|baixar|download/.test(s))return "download";
 if(/salvar|guardar|save/.test(s))return "save";
 if(/imagem|foto/.test(s))return "image";
 if(/conexao|vinculo|relacao|link/.test(s))return "link";
 if(/configur/.test(s))return "settings";
 if(/formula|unidade|calculo|calcular/.test(s))return "calculator";
 if(/codigo|script|terminal/.test(s))return "code";
 if(/referencia|bibliografia|fonte|citacao|plano|escolio|documento|historico/.test(s))return "book";
 if(/pasta|diretorio/.test(s))return "folder";
 if(/[＋+]/.test(label)||/novo|adicionar|criar|inserir|elemento|conceito|bloco|forma|conexao/.test(s))return "plus";
 if(/atualizar|recarregar/.test(s))return "refresh";
 if(/filtro|filtrar/.test(s))return "filter";
 if(/inicio|voltar/.test(s))return "home";
 if(/renomear|editar|alterar/.test(s))return "edit";
 if(/[⋯…]/.test(label)||/mais|acoes|opcoes|menu/.test(s))return "more";
 if(/restaurar|confirmar|aplicar|usar|selecionar|concluir/.test(s))return "check";
 return "more";
}
function enhance(button){
 if(!(button instanceof HTMLButtonElement)||button.dataset.iconized||button.querySelector("svg,input,select,textarea")||button.classList.contains("nav-item")||button.classList.contains("home-action")||button.classList.contains("panel-tab")||button.classList.contains("diagram-shape-card")||button.classList.contains("palette-swatch")||button.matches(".home-nav button,.pt-plan-item,.pt-folder,.es-entry,.es-folder,.pt-tabs button,.es-tabs button,.fc-area-list button,.fc-entry,.tree-row")||button.querySelector("strong,small"))return;
 if(button.closest(".nav-item,.home-action,.panel-tab,.diagram-shape-card,.palette-swatch,.home-nav,.pt-plan-item,.pt-folder,.es-entry,.es-folder,.pt-tabs,.es-tabs,.fc-area-list,.fc-entry,.tree-row"))return;
 const label=(button.innerText||button.textContent||"").replace(/\s+/g," ").trim();
 if(!label)return;
 const icon=choose(label+" "+button.title,button.id);
 if(!button.title)button.title=label;
 if(!button.getAttribute("aria-label"))button.setAttribute("aria-label",label);
 const svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("width","16");svg.setAttribute("height","16");svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");svg.setAttribute("class","ui-icon");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.7");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");svg.innerHTML=paths[icon]||paths.more;
 const span=document.createElement("span");span.className="ui-icon-label";span.textContent=label;
 button.replaceChildren(svg,span);button.classList.add("icon-only-button");button.dataset.iconized="true";
}
function scan(root){if(root.nodeType===1&&root.matches("button"))enhance(root);root.querySelectorAll?.("button").forEach(enhance)}
function start(){scan(document);new MutationObserver(records=>records.forEach(r=>{r.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)});if(r.type==="characterData"){const b=r.target.parentElement?.closest("button");if(b&&!b.dataset.iconized)enhance(b)}})).observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EscolioIcones={atualizar:()=>scan(document)};
})();