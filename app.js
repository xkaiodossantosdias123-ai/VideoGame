const games=[
{id:"flappy",name:"Flappy Sky",icon:"🐦",price:"Grátis",file:"games/flappy-sky/index.html"},
{id:"click",name:"Click Master",icon:"🖱️",price:"Grátis",file:"games/click-master/index.html"},
{id:"neon",name:"Neon Runner",icon:"🏃",price:"Demo grátis",file:"games/neon-runner/index.html"}
];
let pad=null,current=localStorage.getItem("gp_user");
const $=x=>document.getElementById(x);

setTimeout(()=>{$("boot").classList.add("hidden");$("login").classList.remove("hidden");renderProfiles()},1900);

function renderProfiles(){
 const ps=JSON.parse(localStorage.getItem("gp_profiles")||"[]");
 $("profiles").innerHTML=ps.map(p=>`<div class="profile" onclick="enter('${p.replaceAll("'","\\'")}')"><div class="avatar">🙂</div>${p}</div>`).join("");
}
function enter(name){current=name;localStorage.setItem("gp_user",name);$("login").classList.add("hidden");$("console").classList.remove("hidden");$("user").textContent=name;renderAll()}
$("guest").onclick=()=>enter("Convidado");
$("newProfile").onclick=()=>{let n=prompt("Nome do usuário:");if(!n)return;let p=JSON.parse(localStorage.getItem("gp_profiles")||"[]");if(!p.includes(n))p.push(n);localStorage.setItem("gp_profiles",JSON.stringify(p));renderProfiles()};

function card(g){
 return `<article class="card"><div class="cover">${g.icon}</div><div class="info"><h3>${g.name}</h3><div class="meta">${g.price}</div><div class="actions"><button class="play" onclick="playGame('${g.file}','${g.name}')">Jogar</button><button class="download" onclick="downloadGame('${g.file}','${g.name}')">Baixar</button></div></div></article>`;
}
function renderAll(){
 $("featured").innerHTML=games.map(card).join("");
 $("storeGrid").innerHTML=games.map(card).join("");
 let installed=JSON.parse(localStorage.getItem("gp_installed")||'["flappy","click"]');
 $("libraryGrid").innerHTML=games.filter(g=>installed.includes(g.id)).map(card).join("");
 $("downloadList").innerHTML=installed.map(id=>games.find(g=>g.id===id)).filter(Boolean).map(g=>`<div class="download-card" style="margin:15px 0"><b>${g.icon} ${g.name}</b><br><small>Disponível na biblioteca.</small></div>`).join("");
}
function playGame(file,name){
 if($("requirePad").checked && !pad){showToast("Conecte um controle para jogar.");return}
 window.location.href=file;
}
function downloadGame(file,name){
 const a=document.createElement("a");a.href=file;a.download=name.toLowerCase().replaceAll(" ","-")+".html";document.body.appendChild(a);a.click();a.remove();
 let g=games.find(x=>x.file===file);let installed=JSON.parse(localStorage.getItem("gp_installed")||"[]");if(g&&!installed.includes(g.id)){installed.push(g.id);localStorage.setItem("gp_installed",JSON.stringify(installed))}
 showToast(name+" baixado/adicionado à biblioteca");
 renderAll();
}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
 $(id).classList.remove("hidden");
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$("search").oninput=e=>{$("storeGrid").innerHTML=games.filter(g=>g.name.toLowerCase().includes(e.target.value.toLowerCase())).map(card).join("")};
$("logout").onclick=()=>{localStorage.removeItem("gp_user");location.reload()};
window.addEventListener("gamepadconnected",e=>{pad=e.gamepad;$("pad").textContent="Controle conectado";showToast("Controle conectado")});
window.addEventListener("gamepaddisconnected",()=>{pad=null;$("pad").textContent="Controle não conectado"});
function showToast(t){$("toast").textContent=t;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",1800)}
if(current) { /* login screen will still show until selection; choose existing user manually */ }
