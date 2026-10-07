// Shared character sheets. Outfit palettes are applied to the existing girl suit art.
const BOY_HAIRSTYLES = [
  {id:'bangs',name:'Bangs'},
  {id:'short-spiky',name:'Spiky hair'},
  {id:'tapered-afro',name:'Afro'},
  {id:'close-crop',name:'Cropped'},
  {id:'bald',name:'Bald',bald:true}
];
const GIRL_HAIRSTYLES = [
  {id:'high-curly-ponytail',name:'Ponytail'},
  {id:'curly-braids',name:'Curly braids'},
  {id:'long-straight',name:'Long straight'},
  {id:'short-straight',name:'Short straight'},
  {id:'half-up-curls',name:'Half-up curls'}
];
function hairstylesFor(gender){return gender==='girl'?GIRL_HAIRSTYLES:BOY_HAIRSTYLES;}
// Index 0 keeps the artwork's own brown. Others remap hair brightness onto a dark→light ramp.
const HAIR_COLORS=[{name:'Brown',color:'#4a2e1f'},{name:'Black',color:'#151110',ramp:['#060505','#2a2422','#5a524e']},{name:'Blonde',color:'#e2bd6e',ramp:['#7a5526','#d9b062','#fbe7b0']}];
function hairRecolor(d,i,idx){const c=HAIR_COLORS[idx];if(!c?.ramp)return;const L=Math.min(1,(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/110);const r=c.ramp.map(hexRgb);const a=L<.5?r[0]:r[1],b=L<.5?r[1]:r[2],t=L<.5?L*2:(L-.5)*2;for(let k=0;k<3;k++)d[i+k]=a[k]+(b[k]-a[k])*t;}
const sheetCache = new Map();
const imageCache = new Map();
function loadCharacterImage(path){
  if(!imageCache.has(path))imageCache.set(path,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=path;}));
  return imageCache.get(path);
}
function hairstylePath(gender,i){const s=hairstylesFor(gender)[i]||hairstylesFor(gender)[0];return (window.CHARACTER_ROOT||'')+(gender==='girl'?'turnarounds/girl/':'turnarounds/boy-hairstyles/')+s.id+'.webp';}
function hexRgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function variantPath(gender,item,hair){
  const root=window.CHARACTER_ROOT||'';
  const folder=root+(gender==='girl'?'turnarounds/girl/':'turnarounds/');
  if(item&&(gender==='boy'||item.type!=='outfit'))return folder+item.id+'.webp';
  const style=hairstylesFor(gender)[hair]?.id||'base-character';
  if(gender==='girl')return folder+style+'.webp';
  return root+'turnarounds/boy-hairstyles/'+style+'.webp';
}
function recolorSheetPixels(data,width,height,skin,outfit,recolorSkin=false,hairColorIndex=0,gender='boy'){
  const targetSkin=hexRgb(skin),baseSkin=hexRgb(typeof SKINS!=='undefined'?SKINS[2]:'#bb835d');
  const targetHair=hexRgb(HAIR_COLORS[hairColorIndex]?.color||HAIR_COLORS[0].color);
  const primary=outfit?hexRgb(outfit.colors[0]):null,secondary=outfit?hexRgb(outfit.colors[1]):null;
  const cellW=width/4,cellH=height/2;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;if(data[i+3]<32)continue;
    let r=data[i],g=data[i+1],b=data[i+2];const localX=x%cellW,localY=y%cellH,angle=Math.floor(x/cellW)+4*Math.floor(y/cellH);
    const face=localY>45&&localY<200&&localX>55&&localX<270;
    const hands=localY>250&&localY<450&&(localX<105||localX>225);
    if(recolorSkin&&(face||hands)&&r>125&&g>54&&r>g*1.18&&g>b*1.04&&b<175){
      data[i]=Math.max(0,Math.min(255,r+(targetSkin[0]-baseSkin[0])*.7));data[i+1]=Math.max(0,Math.min(255,g+(targetSkin[1]-baseSkin[1])*.7));data[i+2]=Math.max(0,Math.min(255,b+(targetSkin[2]-baseSkin[2])*.7));
      r=data[i];g=data[i+1];b=data[i+2];
    }
    if(outfit&&localY>190&&localY<545&&localX>75&&localX<265){
      const cream=r>155&&g>135&&b>105&&Math.abs(r-g)<64&&Math.abs(g-b)<70;
      const coral=r>120&&g>55&&b>45&&r>g*1.35&&r>b*1.35&&g<175;
      if(cream||coral){const target=cream?secondary:primary;const shade=Math.max(.43,Math.min(1.3,(r+g+b)/(cream?590:360)));data[i]=Math.min(255,target[0]*shade);data[i+1]=Math.min(255,target[1]*shade);data[i+2]=Math.min(255,target[2]*shade);}
    }
    if(hairColorIndex){
      const upper=localY<108&&localX>40&&localX<295;
      const longHair=gender==='girl'&&localY<300&&(localX<112||localX>218||angle===4);
      const hair=upper||longHair;
      if(hair&&r>12&&r<140&&g>8&&g<92&&b<85&&r>g*1.05&&g>=b*.72)hairRecolor(data,i,hairColorIndex);
    }
  }
}
// Per-angle body offsets of every turnaround sheet relative to the base sheet (computed offline).
const SHEET_ANCHORS={"boy": {"style:bangs": [[-2, -1], [1, -1], [3, -2], [8, 0], [-1, 1], [2, 2], [3, 2], [4, 1]], "style:short-spiky": [[-1, -1], [3, -2], [7, -2], [10, -2], [-2, -1], [2, -2], [7, -2], [9, -2]], "style:tapered-afro": [[0, -1], [-1, 0], [-1, -1], [-1, -1], [0, -1], [-1, 0], [0, 0], [-1, -1]], "style:close-crop": [[0, -1], [1, -1], [1, -2], [7, 0], [1, 0], [2, 0], [3, 0], [6, -1]], "style:bald": [[0, -2], [-1, -1], [-2, -3], [-3, -3], [0, -1], [-1, -1], [-1, -1], [-2, -1]], "sun-cap": [[0, 1], [0, 1], [0, 1], [0, 1], [0, 0], [0, 0], [0, 0], [0, 1]], "star-dust": [[-1, -3], [-5, -5], [-1, -3], [-1, -1], [-2, -1], [-3, -1], [-1, 0], [-2, -1]], "classic-pack": [[0, -1], [-1, -1], [-1, -2], [0, -1], [0, -1], [-1, 0], [-2, -2], [-1, -1]], "coral-scout": [[0, -2], [0, -1], [1, -3], [0, -1], [0, 0], [1, -1], [-2, -1], [-1, -2]], "aviator-goggles": [[1, -1], [2, -1], [2, -2], [2, -2], [1, 0], [2, 0], [3, 1], [2, 0]], "sky-bolt": [[0, -1], [0, -1], [-1, -2], [-1, -2], [1, 0], [0, 0], [-1, 0], [-1, 0]], "twin-rockets": [[0, -1], [-1, -1], [-1, -2], [1, -2], [0, 0], [0, 0], [-3, -1], [-2, -1]], "sky-pilot": [[-1, -2], [-1, -1], [-2, -1], [-2, -2], [0, 0], [0, 0], [-2, 1], [-2, -1]], "gold-crown": [[0, 14], [-3, 12], [-2, 13], [-6, 14], [-1, 25], [1, 25], [-1, 24], [-5, 25]], "cloud-puffs": [[0, -1], [-1, -1], [-1, -2], [-2, -1], [0, -1], [-1, -2], [-1, 0], [-3, -1]], "butterfly-wings": [[-2, -5], [-2, -4], [2, -5], [11, -4], [-1, -6], [-1, -5], [-2, -4], [-3, -5]], "forest-ranger": [[0, -2], [-1, 0], [-1, -2], [-4, 0], [-1, 0], [-1, 0], [-1, 0], [-3, 0]], "star-visor": [[0, -1], [1, -1], [2, -2], [2, -1], [0, -1], [1, -1], [2, -1], [1, -1]], "heart-sparks": [[0, -1], [-1, -1], [-1, -1], [-1, -2], [0, -2], [0, -2], [-1, -2], [-1, -2]], "cloud-jet": [[-1, -5], [-1, -4], [1, -6], [3, -5], [-1, -8], [0, -9], [1, -8], [0, -9]], "royal-adventurer": [[-1, -3], [0, -3], [3, -3], [9, -3], [0, -3], [2, -3], [4, -2], [7, -4]], "leaf-wreath": [[0, -1], [-1, -1], [0, -2], [-1, -1], [-1, -2], [0, -1], [-1, -2], [-2, -2]], "page-flutter": [[1, -1], [2, -1], [4, -1], [5, -1], [1, -1], [3, -1], [5, -1], [5, -1]], "comet-engine": [[0, -2], [0, -1], [-1, -3], [1, -2], [1, -1], [-1, -1], [0, 0], [0, -1]], "sunset-surfer": [[-1, -2], [-2, -1], [-1, -3], [-2, -2], [-1, -2], [-1, -2], [-1, -2], [-3, -3]], "cloud-headphones": [[-1, -4], [-2, -5], [-2, -5], [-2, -5], [-2, -7], [-2, -6], [-2, -6], [-2, -6]], "golden-guardian": [[-1, -2], [-1, -2], [-1, -1], [0, -1], [0, -2], [0, -1], [-1, -1], [-1, -2]], "sunburst-band": [[0, -1], [0, -1], [0, -2], [-1, -1], [0, -1], [0, -1], [0, -1], [-1, -1]], "night-explorer": [[-1, -2], [-4, 0], [-2, -1], [-7, -1], [-1, -1], [0, -1], [-4, -1], [-7, -2]], "moon-helmet": [[0, -1], [6, 1], [0, -1], [-7, 0], [0, 4], [3, 4], [-6, 4], [7, 3]], "ocean-voyager": [[-1, -1], [-1, 0], [1, -1], [3, -1], [0, -1], [-1, -1], [1, 0], [2, -2]], "compass-badge": [[0, -4], [0, -4], [2, -5], [2, -4], [0, -7], [0, -7], [3, -7], [1, -7]], "winged-helmet": [[0, -3], [3, -4], [3, -5], [1, -3], [-1, -3], [3, -3], [5, -3], [6, -2]]}, "girl": {"style:high-curly-ponytail": [[0, -1], [1, -1], [2, -1], [0, -1], [-2, -1], [-15, -1], [-19, -2], [8, -1]], "style:curly-braids": [[0, -1], [-1, -1], [2, -1], [1, -1], [0, 0], [0, 0], [2, 0], [0, 0]], "style:long-straight": [[0, -2], [-1, -2], [-1, -3], [0, -2], [0, -2], [-1, -3], [-1, -2], [-1, -2]], "style:short-straight": [[0, -1], [-3, -1], [-3, -2], [-6, -2], [-1, -2], [-2, -2], [-3, -1], [-7, -2]], "style:half-up-curls": [[-1, -4], [0, -4], [5, -4], [-1, -4], [-1, -6], [0, -6], [2, -5], [0, -5]], "sun-cap": [[7, -2], [5, -3], [8, -2], [-17, -1], [2, -2], [-7, 0], [-4, 0], [-11, 2]], "star-dust": [[0, -2], [-5, -11], [18, -7], [8, -5], [-2, -9], [-7, -12], [-24, -7], [9, -8]], "classic-pack": [[0, 0], [0, -1], [4, -1], [0, -1], [1, 0], [0, 0], [-1, 0], [-2, -1]], "aviator-goggles": [[9, 8], [6, 8], [11, 10], [-4, 10], [3, 11], [-7, 11], [-12, 12], [-3, 14]], "sky-bolt": [[6, -3], [-11, -2], [25, -3], [-4, -2], [2, -3], [-9, -4], [-11, -3], [-10, -1]], "twin-rockets": [[-1, -2], [-2, -2], [-1, -3], [3, -2], [0, -1], [0, -1], [0, -3], [-2, 0]], "gold-crown": [[1, 4], [-6, 3], [-9, 6], [-20, 5], [-1, 14], [-4, 11], [-15, 11], [-4, 14]], "cloud-puffs": [[0, -2], [-1, -3], [10, -4], [-1, -3], [0, -2], [-2, -6], [1, -1], [-4, -3]], "butterfly-wings": [[1, -4], [2, -5], [14, -6], [0, -3], [1, -3], [3, -5], [0, -9], [0, -5]], "star-visor": [[0, -2], [-2, -3], [12, -2], [2, -2], [0, -4], [-3, -2], [5, 0], [0, -3]], "heart-sparks": [[0, -2], [-2, -1], [18, -1], [-3, -1], [-4, -4], [-1, -5], [-9, -3], [-7, -5]], "cloud-jet": [[0, -3], [-4, -2], [21, -7], [2, -6], [0, -2], [-4, -5], [-11, -4], [-7, -3]], "leaf-wreath": [[1, -2], [-1, -2], [-2, -3], [-3, -3], [0, 0], [0, -1], [-2, -1], [-3, -1]], "page-flutter": [[-2, -2], [-6, -1], [31, -1], [-1, -1], [-4, 0], [-8, 0], [-9, -1], [-10, 0]], "comet-engine": [[-1, -2], [-2, -2], [-3, -5], [-6, -3], [0, -3], [-1, -3], [-1, -3], [-7, -3]], "cloud-headphones": [[0, -1], [-4, -3], [-2, -1], [-8, -2], [0, -2], [-2, -2], [-10, -1], [-7, -3]], "sunburst-band": [[0, -1], [-4, -1], [4, 1], [1, -2], [0, -2], [-2, -3], [-9, -3], [0, -2]], "moon-helmet": [[0, -2], [-4, -2], [11, -2], [7, 1], [-1, 8], [-5, 6], [-16, 7], [5, 10]], "compass-badge": [[0, -5], [-4, -4], [4, -4], [-24, -5], [-2, -7], [-3, -6], [2, -6], [-9, -5]], "winged-helmet": [[2, -5], [-4, -5], [3, -2], [-9, -4], [3, -1], [-5, -2], [-9, -1], [-7, -2]]}};
const NECK_Y=160;
function isHairPx(r,g,b){const mx=Math.max(r,g,b);return mx<125&&r>=g&&g>=b-6&&r-b<70;}
// Put the chosen hairstyle's head onto an item sheet (outfits, jetpacks, trails), angle by angle.
function swapHead(itemIm,styleIm,gender,itemId,styleId){
  const W=itemIm.naturalWidth,H=itemIm.naturalHeight,cw=W/4,ch=H/2;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(itemIm,0,0);const it=x.getImageData(0,0,W,H),d=it.data;
  const s=document.createElement('canvas');s.width=W;s.height=H;const sx=s.getContext('2d',{willReadFrequently:true});sx.drawImage(styleIm,0,0);const sd=sx.getImageData(0,0,W,H).data;
  const A=SHEET_ANCHORS[gender]||{},io=A[itemId],so=A['style:'+styleId];
  const longHair=gender==='girl',lowY=longHair?330:NECK_Y+14;
  for(let a=0;a<8;a++){
    const ox=(a%4)*cw,oy=Math.floor(a/4)*ch,dx=(io?.[a]?.[0]||0)-(so?.[a]?.[0]||0),dy=(io?.[a]?.[1]||0)-(so?.[a]?.[1]||0);
    // 1) remove the sheet's own hair around the head
    for(let y=0;y<lowY;y++)for(let X=0;X<cw;X++){const i=((oy+y)*W+ox+X)*4;if(d[i+3]>10&&(y<NECK_Y-40||isHairPx(d[i],d[i+1],d[i+2])))d[i+3]=0;}
    // 2) copy the hairstyle head (and long hair below the neck for girls)
    for(let y=0;y<lowY;y++){const ty=y+dy;if(ty<0||ty>=ch)continue;for(let X=0;X<cw;X++){const tx=X+dx;if(tx<0||tx>=cw)continue;
      const si=((oy+y)*W+ox+X)*4,sa=sd[si+3];if(sa<8)continue;
      if(y>=NECK_Y&&!isHairPx(sd[si],sd[si+1],sd[si+2]))continue;
      const ti=((oy+ty)*W+ox+tx)*4,k=sa/255,ta=d[ti+3]/255,oa=k+ta*(1-k);
      d[ti]=(sd[si]*k+d[ti]*ta*(1-k))/oa;d[ti+1]=(sd[si+1]*k+d[ti+1]*ta*(1-k))/oa;d[ti+2]=(sd[si+2]*k+d[ti+2]*ta*(1-k))/oa;d[ti+3]=oa*255;}}
  }
  x.putImageData(it,0,0);return c;
}
function characterSheet(gender,item,hair=0,skinIndex=2,hairColorIndex=0,accId=''){
  const skin=typeof SKINS!=='undefined'?SKINS[skinIndex]||SKINS[2]:'#bd8058';
  const style=hairstylesFor(gender)[hair]||hairstylesFor(gender)[0];
  // Accessories are separate layers placed on top of the explorer, so the chosen hairstyle stays.
  if(item?.type==='accessory'){accId=item.id;item=null;}
  const path=variantPath(gender,item,hair);
  const color=style.bald?0:hairColorIndex;
  const swap=item&&!(gender==='girl'&&item.type==='outfit');
  if(!swap&&!accId&&skinIndex===2&&color===0&&(gender==='boy'||item?.type!=='outfit'))return Promise.resolve(path);
  const key=[path,skinIndex,color,item?.type==='outfit'?item.id:'',swap?style.id:'',accId].join('|');
  const root=window.CHARACTER_ROOT||'';
  if(!sheetCache.has(key))sheetCache.set(key,Promise.all([loadCharacterImage(path),swap?loadCharacterImage(hairstylePath(gender,hair)):null,accId?loadCharacterImage(root+'turnarounds/layers/'+gender+'-'+accId+'.webp'):null]).then(([im,styleIm,layer])=>{
    const src=swap?swapHead(im,styleIm,gender,item.id,style.id):im;
    const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(src,0,0);
    if(skinIndex!==2||color!==0||(gender==='girl'&&item?.type==='outfit')){
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
      recolorSheetPixels(pixels.data,canvas.width,canvas.height,skin,gender==='girl'&&item?.type==='outfit'?item:null,skinIndex!==2,color,gender);
      ctx.putImageData(pixels,0,0);
    }
    if(layer){
      const A=SHEET_ANCHORS[gender]||{},to=A[item?item.id:'style:'+style.id],fo=A[accId],cw=canvas.width/4,ch=canvas.height/2;
      for(let a=0;a<8;a++){const ox=(a%4)*cw,oy=Math.floor(a/4)*ch,dx=(to?.[a]?.[0]||0)-(fo?.[a]?.[0]||0),dy=(to?.[a]?.[1]||0)-(fo?.[a]?.[1]||0);
        ctx.save();ctx.beginPath();ctx.rect(ox,oy,cw,ch);ctx.clip();ctx.drawImage(layer,ox,oy,cw,ch,ox+dx,oy+dy,cw,ch);ctx.restore();}
    }
    return canvas.toDataURL('image/png');
  }));
  return sheetCache.get(key);
}
// Flying sprites with the explorer's own hairstyle (built offline) + runtime skin / hair colour from a mask.
// Mask PNG: red = hair pixels, green = skin pixels.
const runnerCache=new Map();
function buildRunnerSheet(p){
  const style=hairstylesFor(p.gender)[p.hair]||hairstylesFor(p.gender)[0];
  const base=(window.CHARACTER_ROOT||'')+'turnarounds/flight/'+p.gender+'-'+style.id;
  const hairColor=style.bald?0:(p.hairColor||0),skin=p.skin??2,key=[base,skin,hairColor].join('|');
  if(!runnerCache.has(key))runnerCache.set(key,Promise.all([loadCharacterImage(base+'.webp'),skin===2&&hairColor===0?null:loadCharacterImage(base+'-mask.webp')]).then(([im,mask])=>{
    im.padded=true;if(!mask)return im;
    const W=im.naturalWidth,H=im.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;c.padded=true;
    const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(mask,0,0,W,H);const md=x.getImageData(0,0,W,H).data;
    x.clearRect(0,0,W,H);x.drawImage(im,0,0);const id=x.getImageData(0,0,W,H),d=id.data;
    const ts=hexRgb(SKINS[skin]||SKINS[2]),bs=hexRgb(SKINS[2]);
    for(let i=0;i<d.length;i+=4){
      if(d[i+3]<20)continue;
      if(md[i+1]>127&&skin!==2){for(let k=0;k<3;k++)d[i+k]=Math.max(0,Math.min(255,d[i+k]+(ts[k]-bs[k])*.7));}
      else if(md[i]>127&&hairColor)hairRecolor(d,i,hairColor);
    }
    x.putImageData(id,0,0);return c;
  }));
  return runnerCache.get(key);
}
window.buildRunnerSheet=buildRunnerSheet;
