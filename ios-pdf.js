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
function fitImage(ctx,img,x,y,w,h) {
 if(!img)return;
 const ratio=Math.min(w/img.width,h/img.height);
 const wi=img.width*ratio,hi=img.height*ratio;
 ctx.drawImage(img,x+(w-wi)/2,y+(h-hi)/2,wi,hi);
}
function roundRect(ctx,x,y,w,h,r,fill,stroke) {
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
 if(fill){ctx.fillStyle=fill;ctx.fill()}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
}
function text(ctx,s,x,y,font,color='#142219',align='left') {
 ctx.fillStyle=color;ctx.font=font;ctx.textAlign=align;
 ctx.fillText(String(s||''),x,y);
 ctx.textAlign='left';
}
function wrapText(ctx,str,x,y,maxWidth,lineHeight,maxLines,font,color='#2d4132') {
 ctx.font=font;ctx.fillStyle=color;
 const words=String(str||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
 if(!words.length)return 0;
 let line='',lines=[];
 for(const word of words){const trial=line?line+' '+word:word;
  if(ctx.measureText(trial).width>maxWidth&&line){lines.push(line);line=word}else{line=trial}
 }
 if(line)lines.push(line);
 if(lines.length>maxLines){lines=lines.slice(0,maxLines);let s=lines.at(-1);
  while(s&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);
  lines[lines.length-1]=s+'…';
 }
 lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
 return lines.length*lineHeight;
}
function safePrice(ctx,price,x,y,maxWidth){
 let size=39;
 while(size>23){ctx.font=`bold ${size}px Arial`;if(ctx.measureText(price).width<=maxWidth)break;size-=2}
 text(ctx,price,x,y,`bold ${size}px Arial`,'#1d882d','right');
}
function photoLayout(ctx,images,x,y,w,h){
 if(!images.length)return;
 const rounded=(img,bx,by,bw,bh)=>{
  roundRect(ctx,bx,by,bw,bh,10,'#f3f7f3','#e1ece2');
  ctx.save();ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.clip();fitImage(ctx,img,bx+6,by+6,bw-12,bh-12);ctx.restore();
 };
 if(images.length===1){rounded(images[0],x,y,w,h);return}
 if(images.length===2){const gap=14;const pw=(w-gap)/2;rounded(images[0],x,y,pw,h);rounded(images[1],x+pw+gap,y,pw,h);return}
 const gap=14,left=Math.round(w*.64),right=w-left-gap;
 rounded(images[0],x,y,left,h);rounded(images[1],x+left+gap,y,right,(h-gap)/2);rounded(images[2],x+left+gap,y+(h+gap)/2,right,(h-gap)/2);
}
function cardHeight(it,imgs,large){
 if(!imgs.length)return 326+(it.wholesale?.length?54:0);
 return (large?960:638)+(it.wholesale?.length?54:0);
}
function card(ctx,it,y,images,large){
 const x=58,w=1074,h=cardHeight(it,images,large);
 roundRect(ctx,x,y,w,h,22,'#ffffff','#d9e7db');
 roundRect(ctx,x+25,y+27,6,49,3,'#3edb52');
 wrapText(ctx,it.name||'Produto Nova Prime 3D',x+50,y+61,w-100,37,2,'bold 32px Arial','#15291a');
 let cursor=y+100;
 if(images.length){
  const photoHeight=large?610:345;
  photoLayout(ctx,images,x+28,cursor,w-56,photoHeight);
  cursor+=photoHeight+29;
 }
 const desc=String(it.description||'').trim();
 if(desc){const lh=29;const used=wrapText(ctx,desc,x+30,cursor+8,w-60,lh,large?5:3,'24px Arial','#36513d');cursor+=Math.max(used+19,45)}
 const price=String(it.price||'').trim();
 const status='Disponibilidade: '+(it.status||'Consultar');
 const priceSpace=price?290:0;
 wrapText(ctx,status,x+30,cursor+38,w-66-priceSpace,25,2,'21px Arial','#5d7664');
 if(price)safePrice(ctx,price,x+w-30,cursor+43,Math.min(360,w*.4));
 cursor+=78;
 const lines=(it.wholesale||[]).map(t=>String(t||'').replace(/\s+/g,' ').trim()).filter(Boolean);
 if(lines.length){
  wrapText(ctx,'ATACADO  •  '+lines.join('   |   '),x+30,cursor+15,w-60,24,2,'bold 21px Arial','#23843b');
 }
 return h;
}
async function renderPage(entries,pageNum,totalPages,config,logo) {
 const c=document.createElement('canvas');c.width=PAGE_W;c.height=PAGE_H;
 const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,PAGE_W,PAGE_H);
 roundRect(ctx,44,39,1102,117,17,'#0d2617');
 if(logo)fitImage(ctx,logo,65,51,91,91);
 text(ctx,'NOVA PRIME 3D',181,97,'bold 43px Arial','#ffffff');
 text(ctx,'CATÁLOGO DE PRODUTOS   •   '+config.date,181,129,'21px Arial','#b9eec1');
 let y=185;
 for(const entry of entries){const ht=card(ctx,entry.item,y,entry.images,entry.large);y+=ht+22}
 ctx.strokeStyle='#d3e3d6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(61,1585);ctx.lineTo(1128,1585);ctx.stroke();
 wrapText(ctx,config.contact||'Nova Prime 3D',63,1618,870,27,2,'20px Arial','#31563a');
 text(ctx,`Página ${pageNum} de ${totalPages}`,1120,1638,'18px Arial','#5c7863','right');
 return c.toDataURL('image/jpeg',0.92).split(',')[1];
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
 const logo=await loadImage('./logo.png');
 const expanded=[];
 for(const item of items){
  const all=await Promise.all((item.photos||[]).slice(0,3).filter(Boolean).map(loadImage));
  expanded.push({item,images:all.filter(Boolean),large:false});
 }
 // Diagramação automática: até dois produtos com fotos ou mais produtos sem fotos,
 // sempre respeitando a área livre do rodapé do A4.
 const pages=[],maxY=1550,startY=185,gap=22;
 let current=[],y=startY;
 for(const entry of expanded){
  const h=cardHeight(entry.item,entry.images,false);
  if(current.length&&y+h>maxY){pages.push(current);current=[];y=startY}
  current.push(entry);y+=h+gap;
 }
 if(current.length)pages.push(current);
 // Um único produto com foto ocupa mais espaço útil, sem capa vazia.
 for(const page of pages){
  if(page.length===1&&page[0].images.length){page[0].large=true}
 }
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
