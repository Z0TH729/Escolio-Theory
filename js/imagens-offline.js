/* Escólio Theory · biblioteca global de imagens offline */
(function () {
  "use strict";
  const KEY = "escolio-biblioteca-imagens-v1";
  const $ = (s, r = document) => r.querySelector(s);
  const uid = () => "img-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const allowed = new Set(["image/png","image/jpeg","image/webp","image/svg+xml"]);
  const maxBytes = 2 * 1024 * 1024;
  let items = load(), modal = null;
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:[]}catch(_){return []}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(items));return true}catch(_){alert("A biblioteca atingiu o limite de armazenamento deste navegador. Exporte o projeto ou remova imagens antigas.");return false}}
  function sanitizeSvg(source){
    const doc=new DOMParser().parseFromString(source,"image/svg+xml");
    if(doc.querySelector("parsererror"))throw Error("SVG inválido.");
    doc.querySelectorAll("script,style,foreignObject,iframe,object,embed,audio,video").forEach(n=>n.remove());
    doc.querySelectorAll("*").forEach(el=>Array.from(el.attributes).forEach(a=>{
      if(/^on/i.test(a.name))el.removeAttribute(a.name);
      if((a.name==="href"||a.name==="xlink:href")&&!/^#/.test(a.value))el.removeAttribute(a.name);
      if(/url\s*\(\s*['"]?(https?:|data:|javascript:)/i.test(a.value))el.removeAttribute(a.name);
    }));
    return new XMLSerializer().serializeToString(doc.documentElement);
  }
  async function readFile(file){
    if(!file)throw Error("Selecione uma imagem.");
    const ext=(file.name.split(".").pop()||"").toLowerCase();
    if(!allowed.has(file.type)&&!(ext==="jpg"||ext==="jpeg"||ext==="png"||ext==="webp"||ext==="svg"))throw Error("Formato não suportado. Use PNG, JPG, WEBP ou SVG.");
    if(file.size>maxBytes)throw Error("A imagem excede o limite de 2 MB.");
    if(file.type==="image/svg+xml"||ext==="svg"){
      const clean=sanitizeSvg(await file.text());
      return "data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(clean)));
    }
    return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error("Falha ao ler a imagem."));r.readAsDataURL(file)});
  }
  function notify(message){const t=$("#toast");if(t){t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}}
  function addToMap(item, position){
    if(!window.Escolio?.nucleo?.estado){notify("O editor visual não está disponível nesta área.");return}
    const i=window.Escolio.nucleo.estado.obterProjeto().nos.length;
    const node=window.Escolio.nucleo.estado.adicionarNo({
      tipo:"imagem",titulo:item.name,corpo:"",
      campos:{imagem:{assetId:item.id,legenda:item.caption||"",posicaoTexto:item.captionPosition||"baixo",textoSeparado:false,largura:item.width||300,altura:item.height||210,ajuste:"conter",rotacao:0,opacidade:1,brilho:100,contraste:100,borda:"none",raio:2}},
      pos:position&&Number.isFinite(position.x)&&Number.isFinite(position.y)?{x:position.x,y:position.y}:{x:((i%4)-1.5)*190,y:(Math.floor(i/4)-1)*145},
      dimensoes:{largura:item.width||300,altura:item.height||210},
      ancoras:{esquerda:true,direita:true,cima:true,baixo:true}
    });
    if(document.querySelector(".workspace.pt-active,.workspace.es-active"))document.querySelector('.nav-item[data-area="mapa"]')?.click();
    notify("Imagem adicionada ao espaço de trabalho. Conecte pelos pontos laterais.");
    window.dispatchEvent(new CustomEvent("escolio:image-added",{detail:{id:node.id}}));
  }
  function close(){if(modal){modal.remove();modal=null}}
  function render(){
    if(!modal)return;
    const list=$("#image-library-list",modal);list.replaceChildren();
    if(!items.length){const p=document.createElement("p");p.className="hint";p.textContent="Biblioteca vazia. Importe uma imagem para começar.";list.appendChild(p);return}
    items.forEach(item=>{
      const card=document.createElement("article");card.className="image-library-card";
      const img=document.createElement("img");img.src=item.data;img.alt=item.name;
      const meta=document.createElement("div"),name=document.createElement("strong"),size=document.createElement("small");
      name.textContent=item.name;size.textContent=Math.round(item.bytes/1024)+" KB";
      const actions=document.createElement("div"),use=document.createElement("button"),del=document.createElement("button");
      use.textContent="Adicionar ao espaço";use.className="primary";use.onclick=()=>addToMap(item);
      del.textContent="Remover";del.onclick=()=>{if(confirm("Remover esta imagem da biblioteca? Elementos que já a utilizam mantêm sua cópia no projeto.")){items=items.filter(x=>x.id!==item.id);save();render()}};
      meta.append(name,size);actions.append(use,del);card.append(img,meta,actions);list.append(card);
    });
  }
  function open(){
    if(modal){render();return}
    modal=document.createElement("div");modal.className="image-library-overlay";
    modal.innerHTML='<section class="image-library-modal" role="dialog" aria-modal="true" aria-labelledby="image-library-title"><header><div><small>BIBLIOTECA LOCAL</small><h2 id="image-library-title">Imagens do projeto</h2></div><button type="button" id="image-library-close" aria-label="Fechar">×</button></header><p class="hint">Imagens ficam neste navegador. Ao adicionar ao espaço de trabalho, uma cópia é incorporada ao projeto para manter as exportações portáteis.</p><div class="image-library-import"><label class="action primary" for="image-library-file">＋ Importar imagens</label><input id="image-library-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg" multiple></div><div id="image-library-list" class="image-library-list"></div></section>';
    document.body.append(modal);$("#image-library-close",modal).onclick=close;modal.addEventListener("click",e=>{if(e.target===modal)close()});
    $("#image-library-file",modal).onchange=async e=>{for(const file of Array.from(e.target.files||[])){try{const data=await readFile(file);const item={id:uid(),name:file.name,bytes:file.size,type:file.type||"image/svg+xml",data,createdAt:new Date().toISOString(),width:300,height:210,caption:"",captionPosition:"baixo"};items.push(item)}catch(err){alert(file.name+": "+err.message)}}save();e.target.value="";render()};
    render();
  }
  function isImageFile(file){
    const ext=(file.name.split(".").pop()||"").toLowerCase();
    return (file.type&&file.type.startsWith("image/"))||["png","jpg","jpeg","webp","svg"].includes(ext);
  }
  function installDragDrop(){
    const target=document.querySelector(".canvas-wrap");
    if(!target||target.dataset.imageDropReady==="true")return;
    target.dataset.imageDropReady="true";
    let dragDepth=0;
    const hasFiles=ev=>Array.from(ev.dataTransfer?.types||[]).includes("Files");
    target.addEventListener("dragenter",ev=>{
      if(!hasFiles(ev))return;
      ev.preventDefault();dragDepth++;target.classList.add("image-drop-active");
    });
    target.addEventListener("dragover",ev=>{
      if(!hasFiles(ev))return;
      ev.preventDefault();if(ev.dataTransfer)ev.dataTransfer.dropEffect="copy";
      target.classList.add("image-drop-active");
    });
    target.addEventListener("dragleave",ev=>{
      if(!hasFiles(ev))return;
      ev.preventDefault();dragDepth=Math.max(0,dragDepth-1);
      if(dragDepth===0)target.classList.remove("image-drop-active");
    });
    target.addEventListener("drop",async ev=>{
      if(!hasFiles(ev))return;
      ev.preventDefault();ev.stopPropagation();dragDepth=0;target.classList.remove("image-drop-active");
      const files=Array.from(ev.dataTransfer?.files||[]).filter(isImageFile);
      if(!files.length){notify("Solte arquivos PNG, JPG, WEBP ou SVG.");return;}
      let added=0,failed=0;
      for(let index=0;index<files.length;index++){
        const file=files[index];
        try{
          const data=await readFile(file);
          const item={id:uid(),name:file.name,bytes:file.size,type:file.type||"image/svg+xml",data,createdAt:new Date().toISOString(),width:300,height:210,caption:"",captionPosition:"baixo"};
          items.push(item);
          const base=window.EscolioCamera?.posicaoNaTela?.(ev.clientX,ev.clientY)||{x:0,y:0};
          addToMap(item,{x:base.x+(index%4)*34,y:base.y+Math.floor(index/4)*34});
          added++;
        }catch(err){failed++;console.warn("Falha ao importar imagem arrastada:",file.name,err);notify(file.name+": "+err.message);}
      }
      save();
      if(added)notify(added===1?"Imagem importada e adicionada ao mapa.":added+" imagens importadas e adicionadas ao mapa.");
      if(failed&&!added)notify("Não foi possível importar as imagens selecionadas.");
    });
  }
  function installButton(){
    const toolbar=$(".toolbar");if(!toolbar||$("#global-images-button"))return;
    const b=document.createElement("button");b.id="global-images-button";b.type="button";b.textContent="Imagens";b.title="Abrir biblioteca global de imagens";b.onclick=open;toolbar.insertBefore(b,toolbar.querySelector("#save-json"));
  }
  document.addEventListener("DOMContentLoaded",()=>{installButton();installDragDrop()});
  window.EscolioImagens={lerArquivo:readFile,importarArquivo:async file=>{const data=await readFile(file),item={id:uid(),name:file.name,bytes:file.size,type:file.type||"image/svg+xml",data,createdAt:new Date().toISOString()};items.push(item);save();return item},version:"1.0.0",offline:true,open,addToMap,listar:()=>items.map(({data,...x})=>x),obter:id=>items.find(x=>x.id===id)||null,exportar:()=>items.map(x=>({...x})),importar:lista=>{if(!Array.isArray(lista))return;lista.forEach(x=>{if(x&&x.id&&typeof x.data==="string"&&!items.some(y=>y.id===x.id))items.push(x)});save()},substituir:lista=>{items=Array.isArray(lista)?lista.filter(x=>x&&x.id&&typeof x.data==="string").map(x=>({...x})):[];save();render()}};
  installButton();
})();