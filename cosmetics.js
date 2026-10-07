// Visual wardrobe. One new look unlocks with each Matthew chapter.
const COSMETICS = [
  {id:'sun-cap',type:'accessory',name:'Sunrise Cap',icon:'🧢',chapter:1,colors:['#f29a65','#fff2bf']},
  {id:'star-dust',type:'trail',name:'Stardust Trail',icon:'✦',chapter:2,colors:['#f7d269','#fff4bc']},
  {id:'classic-pack',type:'jetpack',name:'Explorer Jetpack',icon:'🚀',chapter:3,colors:['#5a9c95','#f4b760']},
  {id:'coral-scout',type:'outfit',name:'Coral Scout',icon:'◆',chapter:4,colors:['#dc795f','#ffe4bb']},
  {id:'aviator-goggles',type:'accessory',name:'Aviator Goggles',icon:'🥽',chapter:5,colors:['#72bccc','#f9d27f']},
  {id:'sky-bolt',type:'trail',name:'Sky Bolt Trail',icon:'⚡',chapter:6,colors:['#22cbff','#0035e3']},
  {id:'twin-rockets',type:'jetpack',name:'Twin Rockets',icon:'🚀',chapter:7,colors:['#e88b68','#ffe0a6']},
  {id:'sky-pilot',type:'outfit',name:'Sky Pilot',icon:'◆',chapter:8,colors:['#69a8ca','#e8f8ee']},
  {id:'gold-crown',type:'accessory',name:'Golden Crown',icon:'👑',chapter:9,colors:['#efc35b','#fff2b8']},
  {id:'cloud-puffs',type:'trail',name:'Cloud Puffs',icon:'☁',chapter:10,colors:['#c9e7ed','#ffffff']},
  {id:'butterfly-wings',type:'jetpack',name:'Butterfly Wings',icon:'🦋',chapter:11,colors:['#a984cf','#efb4cf']},
  {id:'forest-ranger',type:'outfit',name:'Forest Ranger',icon:'◆',chapter:12,colors:['#70a58a','#e6d591']},
  {id:'star-visor',type:'accessory',name:'Star Visor',icon:'✦',chapter:13,colors:['#8781c7','#f8d979']},
  {id:'heart-sparks',type:'trail',name:'Heart Sparks',icon:'♥',chapter:14,colors:['#ef92a4','#ffd5ba']},
  {id:'cloud-jet',type:'jetpack',name:'Cloud Jet',icon:'☁',chapter:15,colors:['#8bc9d2','#f1f7e9']},
  {id:'royal-adventurer',type:'outfit',name:'Royal Adventurer',icon:'◆',chapter:16,colors:['#ad83c2','#f5d88a']},
  {id:'leaf-wreath',type:'accessory',name:'Leaf Wreath',icon:'🌿',chapter:17,colors:['#7eaf79','#dfe9a2']},
  {id:'page-flutter',type:'trail',name:'Fluttering Pages',icon:'📖',chapter:18,colors:['#f4e5b5','#91bec1']},
  {id:'comet-engine',type:'jetpack',name:'Comet Engine',icon:'☄',chapter:19,colors:['#d288b5','#ffcb76']},
  {id:'sunset-surfer',type:'outfit',name:'Sunset Surfer',icon:'◆',chapter:20,colors:['#f2a66c','#ec7c80']},
  {id:'cloud-headphones',type:'accessory',name:'Cloud Headphones',icon:'☁',chapter:21,colors:['#93c9d2','#efffff']},
  {id:'golden-guardian',type:'outfit',name:'Golden Guardian',icon:'◆',chapter:22,colors:['#e9c15a','#fff0b5']},
  {id:'sunburst-band',type:'accessory',name:'Sunburst Band',icon:'☀️',chapter:23,colors:['#f95600','#fbc92c']},
  {id:'night-explorer',type:'outfit',name:'Night Explorer',icon:'◆',chapter:24,colors:['#344f78','#f1ce83']},
  {id:'moon-helmet',type:'accessory',name:'Moon Helmet',icon:'☾',chapter:25,colors:['#7a87be','#e5eaff']},
  {id:'ocean-voyager',type:'outfit',name:'Ocean Voyager',icon:'◆',chapter:26,colors:['#4faaa9','#d7f2d7']},
  {id:'compass-badge',type:'accessory',name:'Compass Badge',icon:'✧',chapter:27,colors:['#d69b65','#f7df9b']},
  {id:'winged-helmet',type:'accessory',name:'Winged Helmet',icon:'🪽',chapter:28,colors:['#c8a7cf','#f6edcf']}
];
const COSMETIC_TYPES = ['accessory','trail','jetpack','outfit'];
const COSMETIC_LABELS = {accessory:'Accessories',trail:'Trails',jetpack:'Jetpacks',outfit:'Outfits'};
function cosmeticById(id){return COSMETICS.find(item=>item.id===id)||null;}
function cosmeticArt(item){
 const [a,b]=item.colors, dark='#29464a', id=item.id;
 const gradientId=`g-${id}`;
 const start=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${gradientId}" x2="100%" y2="100%"><stop stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>`;
 const end='</svg>';
 const stroke=`stroke="${dark}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
 let s='';
 if(item.type==='outfit'){
  s=`<path d="M29 19 L40 13 Q50 24 60 13 L71 19 L88 44 L75 55 L69 47 L68 88 L32 88 L31 47 L25 55 L12 44 Z" fill="url(#g)" ${stroke}/><path d="M40 14 L50 32 L60 14 M50 32 L50 84" fill="none" stroke="${b}" stroke-width="4"/><path d="M34 66 H66" stroke="${dark}" stroke-width="5"/><circle cx="50" cy="48" r="10" fill="${b}" ${stroke}/>`;
  if(id==='forest-ranger')s+=`<path d="M50 42 Q57 50 50 55 Q43 50 50 42" fill="#65a978"/>`;
  else if(id==='royal-adventurer')s+=`<path d="M43 46 L46 41 L50 45 L54 41 L57 46 L55 52 H45 Z" fill="#efca65"/>`;
  else if(id==='sky-pilot')s+=`<path d="M42 49 H58 M50 41 V56" stroke="#4a87b5" stroke-width="3"/>`;
  else if(id==='night-explorer')s+=`<path d="M50 41 L52 47 L58 48 L53 51 L54 57 L50 53 L46 57 L47 51 L42 48 L48 47 Z" fill="#f9dd86"/>`;
  else if(id==='sunset-surfer')s+=`<path d="M40 49 Q50 38 60 49" fill="none" stroke="#fff0ba" stroke-width="3"/>`;
  else if(id==='ocean-voyager')s+=`<path d="M40 49 Q45 45 50 49 Q55 53 60 49" fill="none" stroke="#d8f3d4" stroke-width="3"/>`;
  else if(id==='golden-guardian')s+=`<path d="M50 41 L58 46 L56 55 L50 59 L44 55 L42 46 Z" fill="#fff5cc" stroke="#b77846" stroke-width="2"/>`;
  else s+=`<path d="M43 45 L50 39 L57 45 L50 55 Z" fill="#fff1ca"/>`;
 } else if(item.type==='jetpack'){
  if(id==='butterfly-wings')s=`<path d="M50 48 Q16 3 9 35 Q4 54 42 57 Q17 77 33 88 Q44 93 50 61 Q56 93 67 88 Q83 77 58 57 Q96 54 91 35 Q84 3 50 48" fill="url(#g)" ${stroke}/><path d="M50 38 V75" stroke="${dark}" stroke-width="7"/>`;
  else if(id==='cloud-jet')s=`<path d="M20 57 Q10 47 19 38 Q25 32 31 36 Q35 18 51 21 Q66 21 69 36 Q87 31 88 47 Q90 59 76 63 H25 Z" fill="url(#g)" ${stroke}/><path d="M38 65 L30 85 M62 65 L70 85" stroke="#f6bd66" stroke-width="8"/>`;
  else if(id==='comet-engine')s=`<path d="M48 15 Q76 25 76 59 L61 78 L36 78 L25 59 Q25 25 48 15" fill="url(#g)" ${stroke}/><circle cx="50" cy="44" r="10" fill="#e6f5f2" ${stroke}/><path d="M40 77 L50 98 L60 77" fill="#ffc87a"/>`;
  else s=`<rect x="${id==='twin-rockets'?19:30}" y="19" width="${id==='twin-rockets'?25:40}" height="58" rx="12" fill="url(#g)" ${stroke}/>${id==='twin-rockets'?`<rect x="56" y="19" width="25" height="58" rx="12" fill="url(#g)" ${stroke}/>`:''}<circle cx="50" cy="44" r="7" fill="${b}"/><path d="M30 78 L37 95 L44 78 M56 78 L63 95 L70 78" fill="#ffca71"/>`;
 } else if(item.type==='trail'){
  if(id==='sky-bolt')s=`<path d="M55 8 L24 51 H48 L40 92 L82 39 H56 Z" fill="url(#g)" ${stroke}/><path d="M17 20 L10 31 M88 67 L80 81" stroke="${b}" stroke-width="5"/>`;
  else if(id==='cloud-puffs')s=`<path d="M14 69 Q3 58 15 50 Q22 45 27 51 Q31 34 45 39 Q57 40 59 51 Q75 47 80 58 Q86 72 68 74 H25 Z" fill="url(#g)" ${stroke}/><circle cx="80" cy="34" r="10" fill="${b}"/><circle cx="21" cy="26" r="6" fill="${b}"/>`;
  else if(id==='heart-sparks')s=`<path d="M50 81 C14 54 12 29 30 24 Q44 20 50 33 Q56 20 70 24 C88 29 86 54 50 81" fill="url(#g)" ${stroke}/><circle cx="18" cy="72" r="5" fill="${a}"/><circle cx="81" cy="19" r="5" fill="${a}"/>`;
  else if(id==='page-flutter')s=`<path d="M18 25 Q37 21 49 29 V76 Q34 68 18 73 Z M82 25 Q63 21 51 29 V76 Q66 68 82 73 Z" fill="url(#g)" ${stroke}/><path d="M26 40 H42 M58 40 H74 M27 50 H42 M58 50 H72" stroke="${dark}" stroke-width="2"/>`;
  else s=`<path d="M50 12 L57 40 L85 49 L57 56 L50 85 L43 56 L15 49 L43 40 Z" fill="url(#g)" ${stroke}/><circle cx="20" cy="22" r="4" fill="${a}"/><circle cx="78" cy="79" r="5" fill="${b}"/>`;
 } else {
  if(id==='sun-cap')s=`<path d="M17 52 Q18 21 50 20 Q82 21 83 52 Z" fill="url(#g)" ${stroke}/><path d="M14 52 Q52 43 88 54 Q68 68 18 60 Z" fill="${a}" ${stroke}/>`;
  else if(id==='aviator-goggles')s=`<path d="M15 44 Q50 29 85 44" fill="none" stroke="${dark}" stroke-width="8"/><rect x="17" y="42" width="28" height="22" rx="8" fill="url(#g)" ${stroke}/><rect x="55" y="42" width="28" height="22" rx="8" fill="url(#g)" ${stroke}/><path d="M45 50 H55" stroke="${dark}" stroke-width="6"/>`;
  else if(id==='gold-crown')s=`<path d="M13 67 L9 26 L30 42 L50 16 L70 42 L91 26 L87 67 Z" fill="url(#g)" ${stroke}/><circle cx="50" cy="50" r="6" fill="#e88189"/><path d="M14 75 H86" stroke="${dark}" stroke-width="6"/>`;
  else if(id==='star-visor')s=`<path d="M12 51 Q50 29 88 51 L82 64 Q50 54 18 64 Z" fill="url(#g)" ${stroke}/><path d="M50 40 L53 47 L61 48 L55 53 L56 60 L50 56 L44 60 L45 53 L39 48 L47 47 Z" fill="${b}"/>`;
  else if(id==='leaf-wreath')s=`<path d="M16 63 Q49 26 84 63" fill="none" stroke="#5a8f6b" stroke-width="7"/><path d="M26 51 Q17 34 32 33 Q39 42 26 51 M45 41 Q39 24 53 24 Q60 34 45 41 M69 48 Q69 31 82 36 Q82 49 69 48" fill="${a}" ${stroke}/>`;
  else if(id==='cloud-headphones')s=`<path d="M18 58 Q18 19 50 18 Q82 19 82 58" fill="none" stroke="${dark}" stroke-width="8"/><rect x="11" y="50" width="24" height="27" rx="11" fill="url(#g)" ${stroke}/><rect x="65" y="50" width="24" height="27" rx="11" fill="url(#g)" ${stroke}/>`;
  else if(id==='sunburst-band')s=`<path d="M13 61 Q50 25 87 61" fill="none" stroke="${dark}" stroke-width="12"/><path d="M13 61 Q50 25 87 61" fill="none" stroke="${a}" stroke-width="8"/><circle cx="50" cy="38" r="9" fill="${b}" ${stroke}/><path d="M50 21 V16 M35 26 L31 22 M65 26 L69 22" stroke="${b}" stroke-width="4"/>`;
  else if(id==='moon-helmet')s=`<path d="M18 57 Q16 18 50 16 Q84 18 82 57 L73 72 H27 Z" fill="url(#g)" ${stroke}/><path d="M38 32 Q29 50 47 59 Q35 59 32 48 Q29 37 38 32" fill="#fff5cf"/>`;
  else if(id==='compass-badge')s=`<circle cx="50" cy="50" r="30" fill="url(#g)" ${stroke}/><path d="M50 24 L59 50 L50 76 L41 50 Z" fill="#fff4c7" ${stroke}/><circle cx="50" cy="50" r="5" fill="${a}"/>`;
  else s=`<path d="M25 65 Q12 39 32 25 L50 37 L68 25 Q88 39 75 65 Z" fill="url(#g)" ${stroke}/><path d="M22 43 Q5 21 9 59 L30 61 M78 43 Q95 21 91 59 L70 61" fill="${b}" ${stroke}/>`;
 }
 return start+s.replaceAll('url(#g)',`url(#${gradientId})`)+end;
}
function cosmeticDataUrl(item){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(cosmeticArt(item));}
