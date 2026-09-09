/* Zahra Birthday Run — mini platformer ala Mario Bros (canvas, no dependency) */
(function(){
"use strict";
var cv = document.getElementById("gameCanvas");
if(!cv) return;
var ctx = cv.getContext("2d");
var W = cv.width, H = cv.height, WORLD_W = 2600, GROUND_Y = 356;
// ===== ASSET MUSUH DARAT & TERBANG (dari folder assetgame) =====
var ENEMY_PNG = { darat: new Image(), terbang: new Image() };
var ENEMY_LOADING = 2;
function enemyLoaded(){ if(ENEMY_LOADING>0) ENEMY_LOADING--; }
ENEMY_PNG.darat.onload = enemyLoaded;
ENEMY_PNG.terbang.onload = enemyLoaded;
ENEMY_PNG.darat.src = "assetgame/musuh darat.png";
ENEMY_PNG.terbang.src = "assetgame/musuh terbang.png";

// foto melayang di langit — pakai foto mylove
var PHOTO_SRC = [
  "mylove/WhatsApp%20Image%202026-09-06%20at%2010.13.19.jpeg",
  "mylove/WhatsApp%20Image%202026-09-06%20at%2010.13.19%20(1).jpeg",
  "mylove/WhatsApp%20Image%202026-09-06%20at%2010.13.19%20(2).jpeg",
  "mylove/WhatsApp%20Image%202026-09-06%20at%2010.13.19%20(3).jpeg",
  "mylove/WhatsApp%20Image%202026-09-06%20at%2010.13.19%20(4).jpeg"
];
var photos = PHOTO_SRC.map(function(s){ var im=new Image(); im.src=s; return im; });
// audio mungil via WebAudio
var AC=null;
function beep(f,d,type,v){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); var o=AC.createOscillator(),g=AC.createGain(); o.type=type||"square"; o.frequency.value=f; g.gain.value=v||0.06; o.connect(g); g.connect(AC.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime+(d||0.15)); o.stop(AC.currentTime+(d||0.15)); }catch(e){} }
function sndJump(){ beep(520,0.14,"square",0.05); }
function sndCoin(){ beep(880,0.1,"square",0.05); setTimeout(function(){beep(1320,0.16,"square",0.05);},90); }
function sndHurt(){ beep(180,0.3,"sawtooth",0.07); }
function sndWin(){ [523,659,784,1046,784,1046].forEach(function(f,i){ setTimeout(function(){beep(f,0.22,"triangle",0.08);}, i*160); }); }
function sndPower(){ beep(660,0.12,"triangle",0.08); setTimeout(function(){beep(990,0.2,"triangle",0.08);},110); }
function sndStomp(){ beep(300,0.1,"square",0.07); setTimeout(function(){beep(600,0.14,"square",0.06);},70); }
function sndShot(){ beep(720,0.07,"square",0.04); setTimeout(function(){beep(420,0.1,"square",0.03);},80); }
// input
var keys={};
window.addEventListener("keydown",function(e){ if(["ArrowLeft","ArrowRight","ArrowUp"," "].indexOf(e.key)>-1) e.preventDefault(); keys[e.key.toLowerCase()]=true; if(e.key===" "||e.key==="ArrowUp") keys.jump=true; });
window.addEventListener("keyup",function(e){ keys[e.key.toLowerCase()]=false; if(e.key===" "||e.key==="ArrowUp") keys.jump=false; });
function bindHold(id,prop){ var el=document.getElementById(id); if(!el) return; var on=function(e){e.preventDefault(); keys[prop]=true;}; var off=function(e){e.preventDefault(); keys[prop]=false;}; el.addEventListener("pointerdown",on); el.addEventListener("pointerup",off); el.addEventListener("pointerleave",off); el.addEventListener("pointercancel",off); }
bindHold("btnLeft","left"); bindHold("btnRight","right"); bindHold("btnJump","jump");
window.addEventListener("keydown",function(e){ if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A") keys.left=true; if(e.key==="ArrowRight"||e.key==="d"||e.key==="D") keys.right=true; if(e.key==="ArrowUp"||e.key==="w"||e.key==="W") keys.jump=true; });
window.addEventListener("keyup",function(e){ if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A") keys.left=false; if(e.key==="ArrowRight"||e.key==="d"||e.key==="D") keys.right=false; if(e.key==="ArrowUp"||e.key==="w"||e.key==="W") keys.jump=false; });
var state;
// ===== LEVEL CONFIG: tiap level beda tempat + beda misi + beda tingkat sulit =====
var MAX_LEVEL = 3;
var LEVELS = [
  { name:"Taman Biru Pagi", sub:"Misi: kumpulkan 3 kue & 3 kartu",
    sky:["#a8d0f7","#d8e9ff","#ffe9f2"], ground:"#7fb5ef", groundTop:"#4a90d9", groundDeco:"#ffd6e7",
    platA:"#ffffff", platB:"#8fc1f5", platLine:"#4a90d9",
    needCake:3, needCard:3, needPhoto:0, needStomp:0, time:0, photoY:[98,138],
    nEnemy:4, eSpeed:[50,90], world:2900, gaps:[85,150], platY:[205,295], platH:[18,20], enemyWalkDrain:0,
    powerups:["shield","star"], goal:"Kumpulkan 3 🎂 + 3 💌 → FINISH" },
  { name:"Danau Pink Senja", sub:"Misi: 3 kue + 3 kartu + 2 foto + injak 2 musuh",
    sky:["#f9b8d4","#ffd6e7","#d8e9ff"], ground:"#f4a7c3", groundTop:"#d96a97", groundDeco:"#ffffff",
    platA:"#ffffff", platB:"#f4a7c3", platLine:"#d96a97",
    needCake:3, needCard:3, needPhoto:2, needStomp:2, time:0, photoY:[98,138],
    nEnemy:7, eSpeed:[70,130], world:3200, gaps:[95,165], platY:[185,290], platH:[18,20], enemyWalkDrain:0,
    powerups:["shield","star","heart"], goal:"3 🎂 + 3 💌 + 2 📸 + injak 2 👾 → FINISH" },
  { name:"Langit Malam Berbintang", sub:"Misi: 4 kue + 4 kartu + 3 foto + injak 4 musuh + kejar waktu 180 detik!",
    sky:["#1c2a52","#3a4a7d","#f4a7c3"], ground:"#3a4a7d", groundTop:"#1c2a52", groundDeco:"#8fc1f5",
    platA:"#d8e9ff", platB:"#4a6fa5", platLine:"#bcd9ff",
    needCake:4, needCard:4, needPhoto:3, needStomp:4, time:180, photoY:[98,138],
    nEnemy:10, eSpeed:[95,170], world:3700, gaps:[100,185], platY:[160,285], platH:[18,20], enemyWalkDrain:0,
    powerups:["shield","star","heart","clock"], goal:"4 🎂 + 4 💌 + 3 📸 + injak 4 👾 sebelum waktu habis!" }
];
function rand(a,b){ return a+Math.random()*(b-a); }
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
// Semua obstacle di-generate RANDOM sesuai config level
function genLevel(lv){
  var C=LEVELS[lv-1], worldW=C.world;
  var plats=[{x:0,y:GROUND_Y,w:worldW,h:64}];
  var x=260, py=rand(C.platY[0]+40,C.platY[1]), guard=0;
  while(x < worldW-480 && guard<48){
    guard++;
    var w=Math.round(rand(110,180));
    py=Math.max(C.platY[0],Math.min(C.platY[1], py+rand(-55,55)));
    var ph=Math.round(rand(C.platH[0],C.platH[1])); if(Math.random()<0.3) ph=12;
    plats.push({x:Math.round(x),y:Math.round(py),w:w,h:ph});
    x += w + rand(C.gaps[0],C.gaps[1]);
  }
  var floaters=shuffle(plats.slice(1));
  while(floaters.length<10){ var fp={x:Math.round(rand(300,worldW-400)),y:Math.round(rand(C.platY[0],C.platY[1])),w:130,h:Math.round(rand(C.platH[0],C.platH[1]))}; plats.push(fp); floaters.push(fp); }
  var cakes=[], cards=[], i, j;
  for(i=0;i<C.needCake;i++){ var p=floaters[i%floaters.length]; cakes.push({x:Math.round(p.x+p.w/2),y:Math.round(p.y-52),taken:false}); }
  for(j=0;j<C.needCard;j++){ var q=floaters[(j+C.needCake)%floaters.length]; cards.push({x:Math.round(q.x+q.w/2),y:Math.round(q.y-52),taken:false}); }
  var enemies=[];
  for(var e=0;e<C.nEnemy;e++){ var ex=Math.round(rand(480,worldW-320)); var sp=rand(C.eSpeed[0],C.eSpeed[1]);
    var fly = (lv>=2 && Math.random()<0.3); // level 2+: ada musuh terbang!
    var type = fly ? "fly" : (lv>=2 && Math.random()<0.2 ? "bomber" : "walker");
    if(lv===3 && !fly && Math.random()<0.25) type="patrol";
    var ew=fly?44:42, eh=fly?40:42; // ukuran seimbang (tidak terlalu kecil/besar)
    enemies.push({x:ex,y:fly?Math.round(rand(205,295)):GROUND_Y-eh,w:ew,h:eh,vx:(Math.random()<0.5?-1:1)*sp,alive:true,type:type,fly:fly,ph:rand(0,6),min:Math.max(60,ex-150),max:Math.min(worldW-60,ex+150),turnT:(type==="patrol"?rand(1.2,2.2):0),shootT:fly?rand(1.2,2.2):0});
  }
  var skyPhotos=[];
  for(var s=0;s<5;s++){ skyPhotos.push({x:Math.round(280+s*((worldW-560)/4)+rand(-60,60)),y:Math.round(rand(C.photoY[0],C.photoY[1])),img:s%5,taken:false,ph:rand(0,6)}); }
  // powerup random: shield=anti luka, star=kebal+cepat, heart=+nyawa, clock=+waktu
  var powerups=[];
  var kinds=shuffle(C.powerups.slice());
  for(var k=0;k<kinds.length;k++){ var pp=floaters[(k+2)%floaters.length]; powerups.push({kind:kinds[k],x:Math.round(pp.x+pp.w/2),y:Math.round(pp.y-52),taken:false}); }
  return {cfg:C,plats:plats,cakes:cakes,cards:cards,enemies:enemies,skyPhotos:skyPhotos,powerups:powerups,worldW:worldW,flagX:worldW-120};
}
function loadLevel(lv, keepScore, keepLives){
  var L=genLevel(lv);
  WORLD_W=L.worldW;
  state.level=lv; state.cfg=L.cfg;
  state.score=(typeof keepScore==="number")?keepScore:0;
  state.lives=(typeof keepLives==="number")?keepLives:3;
  state.entryScore=state.score; // skor saat masuk level — untuk reset saat Ulangi
  state.running=false; state.over=false; state.win=false; state.pausedPortrait=false;
  state.resumeOnly=false; state.pendingNext=false; state.warned=false; state.nextLv=lv; state.parts=null;
  state.camX=0; state.t=0; state.cakeN=0; state.cardN=0; state.photoN=0; state.stompN=0;
  state.needCake=L.cfg.needCake; state.needCard=L.cfg.needCard; state.needPhoto=L.cfg.needPhoto; state.needStomp=L.cfg.needStomp;
  state.timeLeft=L.cfg.time; state.timeUp=false;
  state.shieldT=0; state.starT=0; // powerup timers
  state.shots=[]; // tembakan musuh terbang
  state.player={x:40,y:200,vx:0,vy:0,w:34,h:46,onGround:false,face:1,inv:0};
  state.plats=L.plats; state.cakeItems=L.cakes; state.cardItems=L.cards;
  state.skyPhotos=L.skyPhotos; state.enemies=L.enemies; state.powerups=L.powerups;
  state.flags=[{x:L.flagX,y:GROUND_Y-150,w:10,h:150}];
  updateHUD(); hideReward();
}
function reset(){
  state={score:0,level:1,lives:3,entryScore:0};
  loadLevel(1, 0, 3);
}
function setTextSafe(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
function fmtTime(s){ s=Math.max(0,Math.ceil(s)); var m=Math.floor(s/60), r=s%60; return m+":"+((r<10?"0":"")+r); }
function updateHUD(){
  setTextSafe("gScore",state.score);
  setTextSafe("gCake",state.cakeN+"/"+state.needCake);
  setTextSafe("gCard",state.cardN+"/"+state.needCard);
  setTextSafe("gPhoto",state.photoN+(state.needPhoto?"/"+state.needPhoto:""));
  setTextSafe("gStomp",state.stompN+(state.needStomp?"/"+state.needStomp:""));
  setTextSafe("gLevel",state.level+"/"+MAX_LEVEL);
  setTextSafe("goalLevel",state.level);
  setTextSafe("gMission",state.cfg?state.cfg.goal:"");
  setTextSafe("gPlace",state.cfg?state.cfg.name:"");
  var tEl=document.getElementById("gTime");
  if(state.cfg && state.cfg.time>0){ setTextSafe("gTime",fmtTime(state.timeLeft)); if(tEl) tEl.parentNode.classList.add("timer"); }
  else { setTextSafe("gTime","—"); if(tEl) tEl.parentNode.classList.remove("timer"); }
  // powerup aktif tampil di HUD
  var pw=[];
  if(state.shieldT>0) pw.push("🛡 "+Math.ceil(state.shieldT)+"s");
  if(state.starT>0) pw.push("⭐ "+Math.ceil(state.starT)+"s");
  setTextSafe("gPower",pw.length?pw.join(" "):"—");
  setTextSafe("gLives","♥".repeat(Math.max(0,state.lives))+"♡".repeat(Math.max(0,3-state.lives)));
}
function hideReward(){ var r=document.getElementById("gameReward"); if(r) r.style.display="none"; }
function overlap(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
function hurt(){
  var p=state.player;
  if(p.inv>0||state.over||state.win) return;
  state.lives--; p.inv=2; sndHurt(); updateHUD();
  if(state.lives<=0){ state.over=true; state.running=false; showOverlay("Yaah, Jatuh!","Nyawamu habis. Tenang, cinta Zahra tidak ada habisnya — coba lagi ya!","↻ Coba Lagi"); }
  else { p.x=Math.max(10,state.camX+80); p.y=150; p.vx=0; p.vy=0; }
}
function step(dt){
  var p=state.player; state.t+=dt;
  var acc=1600, maxV=250;
  if(keys.left){ p.vx=Math.max(-maxV,p.vx-acc*dt); p.face=-1; }
  else if(keys.right){ p.vx=Math.min(maxV,p.vx+acc*dt); p.face=1; }
  else { p.vx*= (p.onGround?0.80:0.96); if(Math.abs(p.vx)<4) p.vx=0; }
  var GRAV=1500;
  if(keys.jump && p.onGround){ p.vy=-560; p.onGround=false; sndJump(); }
  if(!keys.jump && p.vy<-220) p.vy=-220;
  p.vy+=GRAV*dt;
  p.x+=p.vx*dt;
  if(p.x<0) p.x=0; if(p.x>WORLD_W-p.w) p.x=WORLD_W-p.w;
  p.y+=p.vy*dt; p.onGround=false;
  for(var i=0;i<state.plats.length;i++){ var pl=state.plats[i];
    if(p.x+p.w>pl.x && p.x<pl.x+pl.w){
      if(p.vy>=0 && (p.y+p.h)>=pl.y && (p.y+p.h)<=pl.y+26){ p.y=pl.y-p.h; p.vy=0; p.onGround=true; }
      else if(p.vy<0 && p.y>=pl.y+pl.h-26 && p.y<=pl.y+pl.h+10){ p.y=pl.y+pl.h; p.vy=0; }
    }
  }
  if(p.inv>0) p.inv-=dt;
  for(var e=0;e<state.enemies.length;e++){ var en=state.enemies[e]; if(!en.alive) continue;
    en.x+=en.vx*dt;
    if(en.min!==undefined){ if(en.x<en.min){en.x=en.min;en.vx=Math.abs(en.vx);} if(en.x>en.max){en.x=en.max;en.vx=-Math.abs(en.vx);} }
    else { if(en.x<50||en.x>WORLD_W-60) en.vx*=-1; }
    var pb={x:p.x-4,y:p.y-4,w:p.w+8,h:p.h+8}, eb={x:en.x,y:en.y,w:en.w,h:en.h};
    // musuh terbang: ability menembak ke arah pemain
    if(en.fly){ en.shootT-=dt; if(en.shootT<=0){ en.shootT=rand(2.2,3.4);
      var dr = p.x >= en.x ? 1 : -1;
      state.shots.push({x:en.x+(dr>0?en.w:0), y:en.y+en.h*0.4, vx:dr*260, r:6});
      sndShot();
    } }
    if(overlap(pb,eb)){
      if(p.vy>120 && (p.y+p.h-en.y)<24){ en.alive=false; p.vy=-380; state.score+=150; sndCoin(); updateHUD(); }
      else hurt();
    }
  }
  // update tembakan musuh + collision dgn pemain
  for(var z=state.shots.length-1;z>=0;z--){ var sh=state.shots[z];
    sh.x+=sh.vx*dt;
    if(sh.x<state.camX-120||sh.x>state.camX+W+120||sh.y<-60||sh.y>H+60){ state.shots.splice(z,1); continue; }
    if(overlap({x:p.x,y:p.y,w:p.w,h:p.h},{x:sh.x-7,y:sh.y-7,w:14,h:14})){ state.shots.splice(z,1); hurt(); }
  }
  function grab(list,cb){ for(var k=0;k<list.length;k++){ var it=list[k]; if(it.taken) continue; var b={x:it.x-24,y:it.y-24,w:48,h:48}; if(overlap({x:p.x,y:p.y,w:p.w,h:p.h},b)){ it.taken=true; cb(it); } } }
  grab(state.cakeItems,function(){ state.cakeN++; state.score+=100; sndCoin(); flash("🎂 +100"); updateHUD(); });
  grab(state.cardItems,function(){ state.cardN++; state.score+=100; sndCoin(); flash("💌 +100"); updateHUD(); });
  grab(state.skyPhotos,function(){ state.photoN++; state.score+=50; sndCoin(); flash("📸 +50"); updateHUD(); });
  var fl=state.flags[0];
  var needCake = state.needCake, needCard = state.needCard;
  if(p.x+p.w>=fl.x){
    if(state.cakeN>=needCake && state.cardN>=needCard){ levelClear(); }
    else if(!state.warned){ state.warned=true; flash("Butuh "+needCake+" kue & "+needCard+" kartu!"); sndHurt(); setTimeout(function(){ state.warned=false; },2500); }
  }
  if(p.y>H+80) hurt();
  state.camX=Math.max(0,Math.min(WORLD_W-W, p.x-W*0.38));
}
// popup teks kecil di canvas (feedback ambil item)
function flash(msg){ state.flashMsg=msg; state.flashT=1.4; }
function levelClear(){
  if(state.win) return; state.win=true; state.running=false;
  var bonus = 300 + state.level*200 + state.lives*100;
  state.score+=bonus; updateHUD(); sndWin();
  try{ if(window.gameConfetti) window.gameConfetti(80); else if(window.confettiBurst) window.confettiBurst(60); }catch(e){}
  if(state.level < MAX_LEVEL){
    state.pendingNext=true; state.nextLv=state.level+1;
    setTextSafe("rewardTitle","Level "+state.level+" Selesai! ♥");
    setTextSafe("rewardText","Hebat! Kue & kartu level "+state.level+" terkumpul (+"+bonus+" bonus). Siap lanjut ke Level "+state.nextLv+" yang lebih menantang?");
    var rb=document.getElementById("rewardBtn"); if(rb) rb.textContent="▶ Lanjut ke Level "+state.nextLv;
    showReward();
    showOverlay("Level "+state.level+" Selesai!","Skor: "+state.score+" • Nyawa tersisa: "+state.lives+". Lanjut ke level berikutnya?","▶ Lanjut ke Level "+state.nextLv);
    state.resumeOnly=false;
  } else {
    // LEVEL TERAKHIR → kartu ucapan rahasia (ini yang kemarin tak muncul karena confettiBurst tak ada di game.html)
    setTextSafe("rewardTitle","Untuk Zahra Aulia Fitri ♥");
    setTextSafe("rewardText","Yeay! Semua "+MAX_LEVEL+" level selesai dengan skor "+state.score+"! Ini bukti kamu pantang menyerah — sama seperti Zahra yang selalu kuat. Selamat ulang tahun, Zahra! 05 November milikmu ♥");
    var rb2=document.getElementById("rewardBtn"); if(rb2) rb2.textContent="← Kembali ke Kejutan Utama";
    state.pendingNext=false; state.resumeOnly=false;
    showReward();
    showOverlay("Misi Selesai! ♥","Semua level tamat! Kartu ucapan rahasia sudah terbuka di bawah. Skor akhir: "+state.score,"♥ Main Lagi dari Level 1");
    setTimeout(function(){ var r=document.getElementById("gameReward"); if(r) r.scrollIntoView({behavior:"smooth",block:"center"}); },600);
  }
}
function showReward(){ var r=document.getElementById("gameReward"); if(r) r.style.display="block"; }
function showOverlay(t,s,btn){ document.getElementById("goTitle").textContent=t; document.getElementById("goSub").textContent=s; document.getElementById("gameStartBtn").textContent=btn; document.getElementById("gameOverlay").classList.remove("hidden"); }
function hideOverlay(){ document.getElementById("gameOverlay").classList.add("hidden"); }
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawCake(x,y,s){ var bob=Math.sin(state.t*4+x*0.05)*3; y+=bob;
  ctx.save(); ctx.shadowColor="rgba(74,144,217,.5)"; ctx.shadowBlur=12;
  ctx.fillStyle="#7fb5ef"; rr(x-14*s,y+6*s,28*s,12*s,4); ctx.fill();
  ctx.fillStyle="#ffd6e7"; rr(x-14*s,y+6*s,28*s,5*s,4); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle="#4a90d9";
  for(var i=-1;i<=1;i++){ var fx=x+i*8*s; ctx.fillRect(fx-1,y-4*s,2,8*s); ctx.beginPath(); ctx.arc(fx,y-5*s,3*s,0,7); ctx.fillStyle=i===0?"#f06a9b":"#4a90d9"; ctx.fill(); ctx.fillStyle="#4a90d9"; }
  ctx.fillStyle="#fff"; ctx.font="bold "+Math.round(11*s)+"px sans-serif"; ctx.textAlign="center"; ctx.fillText("🎂",x,y+2*s);
  ctx.restore();
}
function drawCard(x,y,s){ var bob=Math.sin(state.t*4+x*0.07+1)*3; y+=bob;
  ctx.save(); ctx.shadowColor="rgba(244,167,195,.8)"; ctx.shadowBlur=12;
  ctx.fillStyle="#ffffff"; rr(x-13*s,y-14*s,26*s,30*s,4); ctx.fill(); ctx.shadowBlur=0;
  ctx.strokeStyle="#8fc1f5"; ctx.lineWidth=2; rr(x-13*s,y-14*s,26*s,30*s,4); ctx.stroke();
  ctx.fillStyle="#f06a9b"; ctx.font="bold "+Math.round(14*s)+"px serif"; ctx.textAlign="center"; ctx.fillText("♥",x,y+1*s);
  ctx.fillStyle="#4a90d9"; ctx.font=Math.round(6*s)+"px sans-serif"; ctx.fillText("ZAHRA",x,y+9*s);
  ctx.restore();
}
function drawSkyPhoto(it){
  var y=it.y+Math.sin(state.t*2+it.ph)*8, x=it.x, S=56;
  ctx.save(); ctx.shadowColor="rgba(0,0,0,.5)"; ctx.shadowBlur=8;
  ctx.fillStyle="#fff"; rr(x-4,y-4,S+8,S+8,10); ctx.fill(); ctx.shadowBlur=0;
  var im=photos[it.img];
  if(im&&im.complete&&im.naturalWidth){ ctx.save(); rr(x,y,S,S,8); ctx.clip(); ctx.drawImage(im,x,y,S,S); ctx.restore(); }
  else { ctx.fillStyle="#bcd9ff"; rr(x,y,S,S,8); ctx.fill(); ctx.fillStyle="#1e3a5f"; ctx.font="bold 22px serif"; ctx.textAlign="center"; ctx.fillText("Z",x+S/2,y+S/2+8); }
  ctx.fillStyle="#4a90d9"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText("+50",x+S/2,y+S+18);
  ctx.restore();
}
function drawPlayer(){
  var p=state.player, x=p.x-state.camX, y=p.y;
  if(p.inv>0 && Math.floor(state.t*10)%2===0) ctx.globalAlpha=0.35;
  ctx.save(); ctx.shadowColor="rgba(74,144,217,.4)"; ctx.shadowBlur=6;
  var bob=p.onGround?Math.abs(Math.sin(state.t*10))* (Math.abs(p.vx)>20?3:0):0;
  ctx.fillStyle="#1e3a5f"; rr(x,y+38,34,8,4); ctx.fill();
  ctx.fillStyle="#f4a7c3"; rr(x+3,y+8-bob,28,32,10); ctx.fill();
  ctx.fillStyle="#ffe9d6"; ctx.beginPath(); ctx.arc(x+17,y+8-bob,11,0,7); ctx.fill();
  ctx.fillStyle="#5b7a9e"; ctx.beginPath(); ctx.arc(x+17,y+1-bob,11,Math.PI,0); ctx.fill();
  ctx.fillStyle="#4a90d9"; rr(x+2,y-12-bob,30,10,5); ctx.fill();
  ctx.fillStyle="#fff"; ctx.font="bold 9px sans-serif"; ctx.textAlign="center"; ctx.fillText("♥ Z",x+17,y-4-bob);
  ctx.fillStyle="#1e3a5f";
  var ex=p.face>0?2:-2; ctx.beginPath(); ctx.arc(x+12+ex,y+8-bob,2,0,7); ctx.arc(x+22+ex,y+8-bob,2,0,7); ctx.fill();
  ctx.strokeStyle="#f06a9b"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x+17,y+12-bob,4,0.2,Math.PI-0.2); ctx.stroke();
  ctx.restore(); ctx.globalAlpha=1;
}
function drawEnemy(en){
  var img = en.fly ? ENEMY_PNG.terbang : ENEMY_PNG.darat;
  var x=en.x-state.camX, y=en.y, wob=Math.sin(state.t*8+en.x*0.05)*2;
  ctx.save();
  // shadow
  ctx.fillStyle="rgba(30,58,95,.25)"; ctx.beginPath(); ctx.ellipse(x+en.w/2,y+en.h+3,en.w/2,4,0,0,7); ctx.fill();
  var ready = img && img.complete && img.width>0 && img.height>0;
  if(ready){
    // ASSET: pakai gambar asli dari folder assetgame (musuh darat.png / musuh terbang.png)
    if(en.fly){
      // musuh terbang: float + flip sesuai arah gerak
      ctx.save();
      ctx.translate(x+en.w/2, y+en.h/2 + wob*0.3);
      ctx.scale(en.vx<0?-1:1, 1);
      ctx.drawImage(img, 0,0,img.width,img.height, -en.w/2, -en.h/2, en.w, en.h);
      ctx.restore();
      ctx.fillStyle="#f06a9b"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center";
      ctx.fillText("✈", x+en.w/2, y-6);
    } else {
      // musuh darat: flip sesuai arah gerak (tidak berjalan mundur)
      ctx.save();
      ctx.translate(x+en.w/2, y+en.h/2);
      ctx.scale(en.vx<0?-1:1, 1);
      ctx.drawImage(img, 0,0,img.width,img.height, -en.w/2, -en.h/2, en.w, en.h);
      ctx.restore();
      ctx.fillStyle="#1e3a5f"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center";
      ctx.fillText("✕", x+en.w/2, y-6);
    }
  } else {
    // FALLBACK: gambar prosedur warna biru-pink (kalau asset belum loading / gagal)
    ctx.globalAlpha=0.9;
    var g=ctx.createLinearGradient(x,y,x,y+en.h); g.addColorStop(0,"#8fc1f5"); g.addColorStop(1,"#4a6fa5");
    ctx.fillStyle=g; rr(x,y+wob*0.3,en.w,en.h,9); ctx.fill();
    var ex1=x+en.w*0.27, ex2=x+en.w*0.73, ey=y+en.h*0.28;
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(ex1,ey,en.w*0.11,0,7); ctx.arc(ex2,ey,en.w*0.11,0,7); ctx.fill();
    ctx.fillStyle="#f06a9b"; ctx.beginPath(); ctx.arc(ex1,ey,en.w*0.055,0,7); ctx.arc(ex2,ey,en.w*0.055,0,7); ctx.fill();
    ctx.strokeStyle="#1e3a5f"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+6,y+en.h-7); ctx.lineTo(x+en.w-6,y+en.h-7); ctx.stroke();
    ctx.fillStyle="#f06a9b"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText(en.fly ? "✈" : "✕",x+en.w/2,y-6);
  }
  ctx.restore();
}
function drawShots(){
  for(var s=0;s<state.shots.length;s++){ var sh=state.shots[s], x=sh.x-state.camX;
    ctx.save();
    ctx.shadowColor="rgba(240,106,155,.9)"; ctx.shadowBlur=10;
    ctx.fillStyle="#f4a7c3"; ctx.beginPath(); ctx.arc(x,sh.y,sh.r,0,7); ctx.fill();
    ctx.fillStyle="#ffd6e7"; ctx.beginPath(); ctx.arc(x-sh.vx*0.02,sh.y-sh.r*0.15,sh.r*0.5,0,7); ctx.fill();
    ctx.restore();
  }
}
function render(){
  var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#a8d0f7"); g.addColorStop(0.55,"#d8e9ff"); g.addColorStop(1,"#ffe9f2");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fff";
  for(var i=0;i<70;i++){ var sx=((i*173-state.camX*0.25)%(W+100)+W+100)%(W+100)-50, sy=(i*97)%240; ctx.globalAlpha=0.35+(i%5)*0.12; ctx.fillRect(sx,sy,2.5,2.5); }
  ctx.globalAlpha=1;
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(W-90-state.camX*0.05,70,32,0,7); ctx.fill();
  ctx.fillStyle="#ffd6e7"; ctx.beginPath(); ctx.arc(W-78-state.camX*0.05,62,26,0,7); ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.85)";
  for(var m=0;m<6;m++){ var mx=((m*480-state.camX*0.4)%(WORLD_W+400))-100; ctx.beginPath(); ctx.arc(mx,300,90,Math.PI,0); ctx.arc(mx+70,300,70,Math.PI,0); ctx.fill(); }
  var fl=state.flags[0];
  ctx.fillStyle="#4a90d9"; ctx.fillRect(fl.x-state.camX,fl.y,fl.w,fl.h);
  ctx.fillStyle="#f06a9b"; ctx.beginPath(); ctx.moveTo(fl.x-state.camX+10,fl.y); ctx.lineTo(fl.x-state.camX+70,fl.y+18); ctx.lineTo(fl.x-state.camX+10,fl.y+36); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif"; ctx.textAlign="left"; ctx.fillText("FINISH ♥ Z",fl.x-state.camX+14,fl.y+22);
  var k; for(k=0;k<state.skyPhotos.length;k++){ var sp=state.skyPhotos[k]; if(sp.taken) continue; drawSkyPhoto({x:sp.x-state.camX,y:sp.y,img:sp.img,ph:sp.ph}); }
  for(k=0;k<state.plats.length;k++){ var pl=state.plats[k], px=pl.x-state.camX;
    if(px+pl.w<-50||px>W+50) continue;
    if(pl.y>=GROUND_Y){ ctx.fillStyle="#7fb5ef"; ctx.fillRect(px,pl.y,pl.w,pl.h);
      ctx.fillStyle="#4a90d9"; ctx.fillRect(px,pl.y,pl.w,14);
      ctx.fillStyle="#ffd6e7"; for(var bx=px+8;bx<px+pl.w;bx+=44) ctx.fillRect(bx,pl.y+22,20,8);
    } else { var pg=ctx.createLinearGradient(0,pl.y,0,pl.y+pl.h); pg.addColorStop(0,"#ffffff"); pg.addColorStop(1,"#8fc1f5");
      ctx.fillStyle=pg; rr(px,pl.y,pl.w,pl.h,9); ctx.fill();
      ctx.strokeStyle="#4a90d9"; ctx.lineWidth=1.5; rr(px,pl.y,pl.w,pl.h,9); ctx.stroke();
      ctx.fillStyle="rgba(74,144,217,.2)" ; rr(px,pl.y+pl.h-6,pl.w,6,4); ctx.fill();
    }
  }
  for(k=0;k<state.cakeItems.length;k++) if(!state.cakeItems[k].taken) drawCake(state.cakeItems[k].x-state.camX,state.cakeItems[k].y,1.15);
  for(k=0;k<state.cardItems.length;k++) if(!state.cardItems[k].taken) drawCard(state.cardItems[k].x-state.camX,state.cardItems[k].y,1.15);
  for(k=0;k<state.enemies.length;k++) if(state.enemies[k].alive) drawEnemy(state.enemies[k]);
  drawShots();
  drawPlayer();
  if(state.flashMsg && state.flashT>0){
    state.flashT-=0.016;
    ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,state.flashT));
    ctx.fillStyle="#2f6cb3"; ctx.font="bold 22px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.flashMsg, W/2, 90);
    ctx.restore();
  }
  drawParts();
  ctx.fillStyle="#1e3a5f"; ctx.font="bold 12px sans-serif"; ctx.textAlign="left";
  var hint="LEVEL "+state.level+"/"+MAX_LEVEL+" • ← → bergerak • SPASI lompat • Kue "+state.cakeN+"/"+state.needCake+" • Kartu "+state.cardN+"/"+state.needCard+" → FINISH";
  ctx.fillText(hint,12,H-12);
}
// partikel confetti internal khusus game.html (tidak tergantung script.js)
var parts=[];
function spawnGameConfetti(n){
  for(var i=0;i<n;i++) parts.push({x:Math.random()*W,y:-10-Math.random()*120,vy:rand(60,180),vx:rand(-40,40),s:rand(3,7),c:["#8fc1f5","#f4a7c3","#4a90d9","#ffffff"][i%4],r:rand(0,6)});
}
window.gameConfetti=spawnGameConfetti;
function drawParts(){
  for(var i=parts.length-1;i>=0;i--){ var q=parts[i];
    q.y+=q.vy*0.016; q.x+=q.vx*0.016+Math.sin(q.y*0.05)*0.6; q.r+=0.08;
    if(q.y>H+20){ parts.splice(i,1); continue; }
    ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(q.r); ctx.fillStyle=q.c; ctx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.6); ctx.restore();
  }
}
var last=0;
function loop(ts){
  requestAnimationFrame(loop);
  if(!state) return;
  var dt=Math.min(0.033,(ts-last)/1000||0.016); last=ts;
  if(state.running){ step(dt); }
  render();
}
reset(); requestAnimationFrame(loop);
// Tombol START punya 3 mode: mulai / lanjut level / ulangi
function onStartBtn(){
  tryLockLandscape();
  if(isPortraitPhone()){ showRotate(true); try{ navigator.vibrate && navigator.vibrate(60); }catch(e){} return; }
  showRotate(false);
  if(state.pendingNext){ // lanjut ke level berikutnya — skor & nyawa dibawa
    var keepScore=state.score, keepLives=state.lives, nl=state.nextLv;
    loadLevel(nl, keepScore, keepLives); updateHUD();
    state.running=true; state.resumeOnly=false; state.pendingNext=false; hideOverlay(); hideReward();
    flash("LEVEL "+nl+" — Semangat, Zahra!");
    return;
  }
  if(state.resumeOnly){ // lanjut setelah pause portrait
    state.resumeOnly=false; state.running=true; hideOverlay(); return;
  }
  startGame();
}
document.getElementById("gameStartBtn").addEventListener("click",onStartBtn);
document.getElementById("gameRestartBtn").addEventListener("click",function(){ state.over=false; state.win=false; state.pendingNext=false; state.resumeOnly=false; startGame(); });
var topRestart=document.getElementById("gameRestartBtnTop"); if(topRestart) topRestart.addEventListener("click",function(){ state.over=false; state.win=false; state.pendingNext=false; state.resumeOnly=false; startGame(); });
// tombol kartu reward: lanjut level ATAU kembali ke index (level terakhir)
var rewardBtn=document.getElementById("rewardBtn");
if(rewardBtn) rewardBtn.addEventListener("click",function(){
  if(state.pendingNext){ onStartBtn(); var w=document.querySelector(".game-wrap"); if(w) w.scrollIntoView({behavior:"smooth",block:"center"}); }
  else if(state.level>=MAX_LEVEL){ window.location.href="index.html"; }
  else { onStartBtn(); }
});
function startGame(){
  showRotate(false);
  if(state.over){ state.score=0; state.lives=3; loadLevel(1); } // mati total → dari awal
  else if(state.win){ state.score=0; state.lives=3; loadLevel(1); } // tamat → main lagi dari level 1
  else { loadLevel(state.level||1, state.entryScore||0, state.lives); } // ulangi level → skor kembali ke awal level
  state.running=true; state.resumeOnly=false; state.pendingNext=false; hideOverlay(); hideReward();
}
// cegah scroll/zoom saat main di HP
cv.addEventListener("touchmove",function(e){ e.preventDefault(); },{passive:false});
document.addEventListener("touchmove",function(e){ if(state && state.running) e.preventDefault(); },{passive:false});
document.addEventListener("dblclick",function(e){ e.preventDefault(); },{passive:false});
// LANDSCAPE LOCK
function isPortraitPhone(){
  var portrait = window.matchMedia("(orientation: portrait)").matches;
  var small = Math.min(window.innerWidth, window.innerHeight) < 820;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  return portrait && (small || coarse);
}
function showRotate(show){
  var el=document.getElementById("rotateHint"); if(!el) return;
  el.style.display = show ? "flex" : "none";
  // pause game saat portrait agar tidak curang / tidak glitch
  if(show && state && state.running){ state.running=false; state.pausedPortrait=true; state.resumeOnly=true;
    showOverlay("Tunggu, putar dulu!","Putar HP ke landscape lalu tekan tombol untuk lanjut.","▶ Lanjut Setelah Landscape");
  } else if(!show && state && state.pausedPortrait && !state.over && !state.win){
    state.pausedPortrait=false;
  }
}
window.addEventListener("resize",function(){ if(isPortraitPhone()) showRotate(true); else showRotate(false); });
// coba kunci landscape otomatis (didukung Android Chrome)
function tryLockLandscape(){ try{ if(screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function(){}); }catch(e){} }
window.addEventListener("orientationchange",function(){ setTimeout(function(){ if(isPortraitPhone()) showRotate(true); else showRotate(false); },300); });
// tampilkan rotate-hint sejak awal jika dibuka portrait di HP
if(isPortraitPhone()) showRotate(true);
// pause saat tab tidak terlihat agar tidak glitch
document.addEventListener("visibilitychange",function(){ last=performance.now(); });
})();