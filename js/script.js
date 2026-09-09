var sf = null;
try { sf = new Snowflakes({ color: "#8fc1f5", count: 12, minSize: 6, maxSize: 14 }); } catch(e){}
var BIRTHDAY = { name: "Zahra Aulia Fitri", day: 5, month: 10, year: 2026, label: "Kamis, 5 November 2026" };
// month is 0-indexed: 10 = November
function getTargetDate(){
  var now = new Date();
  var t = new Date(BIRTHDAY.year, BIRTHDAY.month, BIRTHDAY.day, 0, 0, 0);
  if (t.getTime() < now.getTime() - 24*3600*1000) {
    t = new Date(now.getFullYear()+1, BIRTHDAY.month, BIRTHDAY.day, 0, 0, 0);
    if (now.getMonth()===BIRTHDAY.month && now.getDate()>=BIRTHDAY.day) t = new Date(now.getFullYear()+1, BIRTHDAY.month, BIRTHDAY.day, 0, 0, 0);
  }
  // if this year's Nov 5 is still ahead, use it
  var thisYear = new Date(now.getFullYear(), BIRTHDAY.month, BIRTHDAY.day, 0, 0, 0);
  if (thisYear.getTime() >= now.getTime() - 24*3600*1000) {
    // prefer upcoming Nov 5 (2026 if now before it)
    if (now.getTime() <= thisYear.getTime() + 24*3600*1000) t = thisYear;
  }
  return t;
}
var url_string = window.location.href;
var url = new URL(url_string);
var c = url.searchParams.get("name");
var displayName = (c && c.trim() !== "") ? c.trim() : BIRTHDAY.name;
document.getElementById("name").textContent = displayName;
var naeEl = document.getElementById("nae");
if (naeEl) naeEl.textContent = displayName;
document.querySelectorAll(".js-name").forEach(function(el){ el.textContent = displayName; });
// countdown to 5 November
function pad(n){ return (n<10?"0":"")+n; }
function tickCountdown(){
  var target = getTargetDate();
  var now = new Date();
  var diff = target.getTime() - now.getTime();
  var label = document.getElementById("countdownLabel");
  var isToday = now.getFullYear()===target.getFullYear() && now.getMonth()===target.getMonth() && now.getDate()===target.getDate();
  if (diff <= 0 && !isToday) diff = 0;
  if (isToday) {
    if(label) label.textContent = "Hari ini — 5 November. Selamat ulang tahun, Zahra!";
    setText("cdD","00"); setText("cdH","00"); setText("cdM","00"); setText("cdS","00");
    return;
  }
  if (diff < 0) diff = 0;
  var d = Math.floor(diff/86400000), h = Math.floor(diff%86400000/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
  setText("cdD", pad(d)); setText("cdH", pad(h)); setText("cdM", pad(m)); setText("cdS", pad(s));
  if(label){
    var opts = { day:"numeric", month:"long", year:"numeric" };
    try{ label.textContent = "Menghitung mundur menuju " + target.toLocaleDateString("id-ID", opts) + " — hari Ulang Tahun Zahra Aulia Fitri."; }catch(e){}
  }
}
function setText(id, v){ var el=document.getElementById(id); if(el) el.textContent=v; }
tickCountdown(); setInterval(tickCountdown, 1000);
$(".main").hide();
var musicOn = false;
function setMusic(on){
  var audio = $(".song")[0];
  musicOn = on;
  var label = $("#musicToggle span");
  if(on){ try{ audio.play(); }catch(e){} if(label.length) label.text("Music: On"); }
  else { audio.pause(); if(label.length) label.text("Music: Off"); }
}
$("#play").on("click", function(){
  $("#gate").fadeOut(800, function(){ $(this).hide(); });
  $(".main").fadeIn("slow");
  try{ if(sf) sf.destroy(); }catch(e){}
  setMusic(true);
  setTimeout(function(){ if(window.confettiBurst) window.confettiBurst(35); }, 600);
  observeReveals();
});
$("#musicToggle").on("click", function(){ setMusic(!musicOn); });
// thumbs
$(document).on("click", ".thumb", function(){
  $(".thumb").removeClass("active"); $(this).addClass("active");
  var full = $(this).attr("data-full");
  var hero = $("#heroPhoto"); hero.css("opacity",0);
  setTimeout(function(){ hero.attr("src", full); hero.on("load", function(){ hero.css("opacity",1); }); setTimeout(function(){ hero.css("opacity",1); },600); },200);
});
var typedStarted=false;
function startTyped(){
  if(typedStarted) return; typedStarted=true;
  try{
    new Typed("#typed", { stringsElement:"#typed-strings", typeSpeed:38, backSpeed:12, backDelay:1600, loop:true });
  }catch(e){}
}
var _revealObs=null;
function observeReveals(){
  startTyped();
  var els=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    if(_revealObs) _revealObs.disconnect();
    _revealObs=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("visible"); _revealObs.unobserve(en.target); } });
    },{threshold:.12});
    els.forEach(function(el){ _revealObs.observe(el); });
  } else { els.forEach(function(el){ el.classList.add("visible"); }); }
}
observeReveals();
// lightbox
function openLB(src,cap){ $("#lbImg").attr("src",src); $("#lbCap").text(cap||""); $("#lightbox").addClass("open").attr("aria-hidden","false"); }
function closeLB(){ $("#lightbox").removeClass("open").attr("aria-hidden","true"); }
$(document).on("click",".g-card img",function(){ var fig=$(this).closest(".g-card").find("figcaption span").text(); openLB($(this).attr("src"),fig); });
$(document).on("click",".photo-main img",function(){ openLB($(this).attr("src"),"My Favorite Person"); });
$(document).on("click",".lb-close, #lightbox",function(e){ if(e.target===this || $(e.target).hasClass("lb-close")) closeLB(); });
$(document).on("keydown",function(e){ if(e.key==="Escape") closeLB(); });
$("#celebrateBtn").on("click",function(){ if(window.confettiBurst) window.confettiBurst(45); });
$("#replayBtn").on("click",function(){ if(window.confettiBurst) window.confettiBurst(45); window.scrollTo({top:0,behavior:"smooth"}); });
var retina = window.devicePixelRatio,

    // Math shorthands
    PI = Math.PI,
    sqrt = Math.sqrt,
    round = Math.round,
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,

    // Local WindowAnimationTiming interface
    rAF = window.requestAnimationFrame,
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
    _now = Date.now || function () {
        return new Date().getTime();
    };

// Local WindowAnimationTiming interface polyfill
(function (w) {
    /**
     * Fallback implementation.
     */
    var prev = _now();

    function fallback(fn) {
        var curr = _now();
        var ms = Math.max(0, 16 - (curr - prev));
        var req = setTimeout(fn, ms);
        prev = curr;
        return req;
    }

    /**
     * Cancel.
     */
    var cancel = w.cancelAnimationFrame ||
        w.webkitCancelAnimationFrame ||
        w.clearTimeout;

    rAF = w.requestAnimationFrame ||
        w.webkitRequestAnimationFrame ||
        fallback;

    cAF = function (id) {
        cancel.call(w, id);
    };
}(window));

document.addEventListener("DOMContentLoaded", function () {
    var speed = 50,
        duration = (1.0 / speed),
        confettiRibbonCount = 2,
        ribbonPaperCount = 8,
        ribbonPaperDist = 8.0,
        ribbonPaperThick = 6.0,
        confettiPaperCount = 18,
        DEG_TO_RAD = PI / 180,
        RAD_TO_DEG = 180 / PI,
        colors = [
            ["#bcd9ff", "#4a90d9"],
            ["#ffc9dd", "#e87ba8"],
            ["#ffffff", "#8fc1f5"],
            ["#f4a7c3", "#4a90d9"]
        ];

    function Vector2(_x, _y) {
        this.x = _x, this.y = _y;
        this.Length = function () {
            return sqrt(this.SqrLength());
        }
        this.SqrLength = function () {
            return this.x * this.x + this.y * this.y;
        }
        this.Add = function (_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
        }
        this.Sub = function (_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
        }
        this.Div = function (_f) {
            this.x /= _f;
            this.y /= _f;
        }
        this.Mul = function (_f) {
            this.x *= _f;
            this.y *= _f;
        }
        this.Normalize = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                this.x *= factor;
                this.y *= factor;
            }
        }
        this.Normalized = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
        }
    }
    Vector2.Lerp = function (_vec0, _vec1, _t) {
        return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
    }
    Vector2.Distance = function (_vec0, _vec1) {
        return sqrt(Vector2.SqrDistance(_vec0, _vec1));
    }
    Vector2.SqrDistance = function (_vec0, _vec1) {
        var x = _vec0.x - _vec1.x;
        var y = _vec0.y - _vec1.y;
        return (x * x + y * y + z * z);
    }
    Vector2.Scale = function (_vec0, _vec1) {
        return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
    }
    Vector2.Min = function (_vec0, _vec1) {
        return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
    }
    Vector2.Max = function (_vec0, _vec1) {
        return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
    }
    Vector2.ClampMagnitude = function (_vec0, _len) {
        var vecNorm = _vec0.Normalized;
        return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
    }
    Vector2.Sub = function (_vec0, _vec1) {
        return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
    }

    function EulerMass(_x, _y, _mass, _drag) {
        this.position = new Vector2(_x, _y);
        this.mass = _mass;
        this.drag = _drag;
        this.force = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.AddForce = function (_f) {
            this.force.Add(_f);
        }
        this.Integrate = function (_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
        }
        this.CurrentForce = function (_pos, _vel) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
        }
    }

    function ConfettiPaper(_x, _y) {
        this.pos = new Vector2(_x, _y);
        this.rotationSpeed = (random() * 300 + 400);
        this.angle = DEG_TO_RAD * random() * 360;
        this.rotation = DEG_TO_RAD * random() * 360;
        this.cosA = 1.0;
        this.size = 3.5 + random() * 2.0;
        this.oscillationSpeed = (random() * 1.0 + 0.4);
        this.xSpeed = 18.0;
        this.ySpeed = (random() * 35 + 40.0);
        this.corners = new Array();
        this.time = random();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        for (var i = 0; i < 4; i++) {
            var dx = cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
        }
        this.Update = function (_dt) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = cos(DEG_TO_RAD * this.rotation);
            this.pos.x += cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y) {
                this.pos.x = random() * ConfettiPaper.bounds.x;
                this.pos.y = 0;
            }
        }
        this.Draw = function (_g) {
            if (this.cosA > 0) {
                _g.fillStyle = this.frontColor;
            } else {
                _g.fillStyle = this.backColor;
            }
            _g.beginPath();
            _g.moveTo((this.pos.x + this.corners[0].x * this.size) * retina, (this.pos.y + this.corners[0].y * this.size * this.cosA) * retina);
            for (var i = 1; i < 4; i++) {
                _g.lineTo((this.pos.x + this.corners[i].x * this.size) * retina, (this.pos.y + this.corners[i].y * this.size * this.cosA) * retina);
            }
            _g.closePath();
            _g.fill();
        }
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
        this.particleDist = _dist;
        this.particleCount = _count;
        this.particleMass = _mass;
        this.particleDrag = _drag;
        this.particles = new Array();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.xOff = (cos(DEG_TO_RAD * _angle) * _thickness);
        this.yOff = (sin(DEG_TO_RAD * _angle) * _thickness);
        this.position = new Vector2(_x, _y);
        this.prevPosition = new Vector2(_x, _y);
        this.velocityInherit = (random() * 2 + 4);
        this.time = random() * 100;
        this.oscillationSpeed = (random() * 2 + 2);
        this.oscillationDistance = (random() * 40 + 40);
        this.ySpeed = (random() * 40 + 80);
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
        this.Update = function (_dt) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
                var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                dirP.Normalize();
                dirP.Mul((delta / _dt) * this.velocityInherit);
                this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
                this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
                var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                rp2.Sub(this.particles[i - 1].position);
                rp2.Normalize();
                rp2.Mul(this.particleDist);
                rp2.Add(this.particles[i - 1].position);
                this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                this.Reset();
            }
        }
        this.Reset = function () {
            this.position.y = -random() * ConfettiRibbon.bounds.y;
            this.position.x = random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = random() * 2 + 4;
            this.time = random() * 100;
            this.oscillationSpeed = random() * 2.0 + 1.5;
            this.oscillationDistance = (random() * 40 + 40);
            this.ySpeed = random() * 40 + 80;
            var ci = round(random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
        };
        this.Draw = function (_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
                var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                    _g.fillStyle = this.frontColor;
                    _g.strokeStyle = this.frontColor;
                } else {
                    _g.fillStyle = this.backColor;
                    _g.strokeStyle = this.backColor;
                }
                if (i == 0) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else if (i == this.particleCount - 2) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                }
            }
        }
        this.Side = function (x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
        }
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);
    confetti = {};
    confetti.Context = function (id) {
        var i = 0;
        var canvas = document.getElementById(id);
        var canvasWidth = window.innerWidth;
        var canvasHeight = window.innerHeight;
        canvas.width = canvasWidth * retina;
        canvas.height = canvasHeight * retina;
        var context = canvas.getContext('2d');
        var interval = null;
        var confettiRibbons = new Array();
        ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(random() * canvasWidth, -random() * canvasHeight * 2, ribbonPaperCount, ribbonPaperDist, ribbonPaperThick, 45, 1, 0.05);
        }
        var confettiPapers = new Array();
        ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiPaperCount; i++) {
            confettiPapers[i] = new ConfettiPaper(random() * canvasWidth, random() * canvasHeight);
        }
        this.resize = function () {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.width = canvasWidth * retina;
            canvas.height = canvasHeight * retina;
            ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
            ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        }
        this.start = function () {
            this.stop()
            var context = this;
            this.update();
        }
        this.stop = function () {
            cAF(this.interval);
        }
        this.update = function () {
            var i = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < confettiPapers.length; i++) {
                confettiPapers[i].Update(duration);
                confettiPapers[i].Draw(context);
            }
            for (i = 0; i < confettiRibbonCount; i++) {
                confettiRibbons[i].Update(duration);
                confettiRibbons[i].Draw(context);
            }
            this.interval = rAF(function () {
                confetti.update();
            });
        }
    };
    var confetti = new confetti.Context('confetti');
    confetti.start();
    window.addEventListener('resize', function (event) {
        confetti.resize();
    });
    // burst API for buttons — subtle & elegant (few pieces, short life, slower fall)
    window.confettiBurst = function(n){
      try{
        var total = Math.min(n||40, 60);
        for(var k=0;k<total;k++){
          var c = new ConfettiPaper(Math.random()*window.innerWidth, -20 - Math.random()*120);
          c.size = 3.5 + Math.random()*2.5;
          c.ySpeed = 55 + Math.random()*60;
          c.xSpeed = 18;
          c.rotationSpeed = 300 + Math.random()*300;
          (function(p){ setTimeout(function(){ confettiPapers.push(p); setTimeout(function(){ var ix=confettiPapers.indexOf(p); if(ix>-1) confettiPapers.splice(ix,1); }, 3500); }, Math.random()*600); })(c);
        }
        window._papers = confettiPapers;
      }catch(e){}
    };
    // expose papers for burst
    var _papersRef = confettiPapers;
    window._papers = _papersRef;
});