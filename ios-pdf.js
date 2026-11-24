/* Nova Prime 3D — catálogo PDF para Safari/iPhone, sem impressão nativa.
   Desenho A4 renderizado no aparelho e convertido em PDF de imagens JPEG. */
(() => {
'use strict';
const PAGE_W = 1190, PAGE_H = 1684;
const $ = (x) => document.getElementById(x);
const currency = (s) => String(s || '').trim();
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
function fitImage(ctx, img, x, y, w, h) {
  ctx.fillStyle = '#f2f6f3';ctx.fillRect(x,y,w,h);
  if(!img) return;
  const ratio = Math.min(w/img.width,h/img.height);
  const wi = Math.max(1,img.width*ratio),hi = Math.max(1,img.height*ratio);
  ctx.drawImage(img,x+(w-wi)/2,y+(h-hi)/2,wi,hi);
}
function roundRect(ctx,x,y,w,h,r,fill,stroke) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
}
function text(ctx,s,x,y,font,color='#152419') {
  ctx.fillStyle=color;ctx.font=font;ctx.fillText(String(s||''),x,y);
}
function wrapText(ctx, str, x, y, maxWidth, lineHeight, maxLines, font, color='#2d4132') {
  ctx.font=font;ctx.fillStyle=color;
  const words=String(str||'').replace(/\s+/g,' ').trim().split(' ');
  let line='',lines=[];
  for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else{line=test}}
  if(line)lines.push(line);
  if(lines.length>maxLines){lines=lines.slice(0,maxLines);let s=lines.at(-1);while(s&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);lines[lines.length-1]=s+'…'}
  lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
  return lines.length*lineHeight;
}
function card(ctx,p,y,idx,photoImages){
  const x=57,w=1076,h=673;
  roundRect(ctx,x,y,w,h,24,'#fff','#d7e7da');
  roundRect(ctx,x+24,y+25,5,49,2,'#3fca38');
  wrapText(ctx,p.name||'Produto Nova Prime 3D',x+50,y+59,w-80,37,2,'bold 32px Arial','#142219');
  const py=y+91,imgh=346;
  const pics=photoImages.length?photoImages:[null];
  fitImage(ctx,pics[0],x+25,py,650,imgh);
  const smw=355,smh=167;
  fitImage(ctx,pics[1]||null,x+696,py,smw,smh);
  fitImage(ctx,pics[2]||null,x+696,py+179,smw,smh);
  ctx.strokeStyle='#d6e6d9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+26,y+455);ctx.lineTo(x+w-26,y+455);ctx.stroke();
  wrapText(ctx,p.description||'',x+26,y+485,w-52,26,3,'23px Arial','#314637');
  text(ctx,'Disponibilidade: '+(p.status||'Consultar'),x+26,y+580,'21px Arial','#536d59');
  if(p.price) text(ctx,currency(p.price),x+w-30,y+584,'bold 36px Arial','#207e2d');
  const tiers=(p.wholesale||[]).slice(0,3);
  if(tiers.length){
    const lines=tiers.map(s=>String(s).replace(/\s+/g,' ').trim()).filter(Boolean);
    wrapText(ctx,'ATACADO  •  '+lines.join('     |     '),x+26,y+631,w-52,23,2,'bold 19px Arial','#2f7437');
  }
}
async function renderPage(items, pageNum, totalPages, config, logo) {
  const c=document.createElement('canvas');c.width=PAGE_W;c.height=PAGE_H;
  const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,PAGE_W,PAGE_H);
  roundRect(ctx,40,35,1110,120,18,'#0f2015');
  if(logo)fitImage(ctx,logo,60,47,90,94);
  text(ctx,'NOVA PRIME 3D',175,98,'bold 42px Arial','#ffffff');
  text(ctx,'CATÁLOGO DE PRODUTOS  •  '+config.date,175,133,'20px Arial','#b1edbb');
  for(let i=0;i<items.length;i++){
    const it=items[i];
    const images=await Promise.all((it.photos||[]).slice(0,3).map(loadImage));
    card(ctx,it,i===0?185:879,i,images.filter(Boolean));
  }
  ctx.strokeStyle='#d4e7d5';ctx.beginPath();ctx.moveTo(55,1590);ctx.lineTo(1135,1590);ctx.stroke();
  wrapText(ctx,config.contact||'Nova Prime 3D',60,1622,950,26,2,'19px Arial','#3d5745');
  text(ctx,`Página ${pageNum} de ${totalPages}`,1128,1642,'18px Arial','#607864');
  return c.toDataURL('image/jpeg',0.88).split(',')[1];
}
function base64ToBytes(str) {
  const binary=atob(str),a=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)a[i]=binary.charCodeAt(i);
  return a;
}
function makePDF(images) {
  const encoder=new TextEncoder(),pieces=[],offsets=[0];let pos=0;
  function put(bytes){pieces.push(bytes);pos+=bytes.length}
  function txt(s){put(encoder.encode(s))}
  const pageCount=images.length;
  const objCount=2+pageCount*3;
  txt('%PDF-1.4\n%NovaPrime3D\n');
  function objStart(n){offsets[n]=pos;txt(n+' 0 obj\n')}
  function objEnd(){txt('\nendobj\n')}
  objStart(1);txt('<< /Type /Catalog /Pages 2 0 R >>');objEnd();
  objStart(2);txt(`<< /Type /Pages /Count ${pageCount} /Kids [${images.map((_,i)=>3+i*3+' 0 R').join(' ')}] >>`);objEnd();
  images.forEach((im,i)=>{
    const page=3+i*3, imageId=page+1, contentId=page+2;
    objStart(page);txt(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);objEnd();
    const jpg=base64ToBytes(im);
    objStart(imageId);txt(`<< /Type /XObject /Subtype /Image /Width ${PAGE_W} /Height ${PAGE_H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);put(jpg);txt('\nendstream');objEnd();
    const stream='q 595 0 0 842 0 0 cm /Im0 Do Q\n';
    objStart(contentId);txt(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);objEnd();
  });
  const start=pos;
  txt(`xref\n0 ${objCount+1}\n0000000000 65535 f \n`);
  for(let i=1;i<=objCount;i++)txt(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  txt(`trailer\n<< /Size ${objCount+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  return new Blob(pieces,{type:'application/pdf'});
}
async function create(payload){
 const items=payload.products||[];
 if(!items.length)throw Error('Selecione produtos para o catálogo.');
 const pages=[];
 for(let i=0;i<items.length;i+=2)pages.push(items.slice(i,i+2));
 const logo=await loadImage('./logo.png');
 const images=[];
 for(let i=0;i<pages.length;i++)images.push(await renderPage(pages[i],i+1,pages.length,payload,logo));
 return makePDF(images);
}
async function deliver(blob,action){
 const date=new Date().toISOString().slice(0,10);
 const filename='Nova_Prime_3D_Catalogo_'+date+'.pdf';
 const file=new File([blob],filename,{type:'application/pdf'});
 if(action==='share'&&navigator.canShare?.({files:[file]})&&navigator.share){
   try {await navigator.share({files:[file],title:'Catálogo Nova Prime 3D'});return}
   catch(e){if(e.name==='AbortError')return;}
 }
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=filename;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
window.NovaPrimeWebPDF={create,deliver};
})();
