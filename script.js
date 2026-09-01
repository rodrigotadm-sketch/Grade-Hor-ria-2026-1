
let DATA=null;
const $=s=>document.querySelector(s);
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

function docenteHTML(ds=[]){
  if(!ds.length) return "Não informado";
  return ds.map(d=>d.lattes?`<a href="${d.lattes}" target="_blank" rel="noopener">${d.nome}</a>`:d.nome).join(", ");
}
function aulaCard(a){
  return `<article class="card">
    <span class="code">${a.codigo}</span>
    <h3>${a.disciplina || "Disciplina sem denominação"}</h3>
    <div class="meta">
      <div>📅 <strong>${a.dia}</strong>${a.inicio?` · ${a.inicio}–${a.fim}`:""}</div>
      ${a.turma?`<div>👥 ${a.turma}</div>`:""}
      <div class="docentes">👨‍🏫 ${docenteHTML(a.docentes)}</div>
      <div>📍 ${a.sala || "Sala não informada"}</div>
    </div>
  </article>`;
}
function render(){
  const q=norm($("#busca").value);
  const periodo=$("#periodo").value;
  const dia=$("#dia").value;
  const aulas=DATA.aulas.filter(a=>{
    const blob=norm([a.codigo,a.disciplina,a.turma,a.dia,a.sala,...(a.docentes||[]).map(d=>d.nome)].join(" "));
    return (!q||blob.includes(q)) && (!periodo||a.periodo===periodo) && (!dia||a.dia===dia);
  });
  $("#contador").textContent=`${aulas.length} aula(s) encontrada(s)`;
  const grupos={};
  aulas.forEach(a=>(grupos[a.periodo]??=[]).push(a));
  $("#resultado").innerHTML=Object.entries(grupos).map(([p,arr])=>
    `<section class="section"><h2>${p}</h2><div class="cards">${arr.map(aulaCard).join("")}</div></section>`
  ).join("") || `<div class="empty">Nenhum resultado para os filtros selecionados.</div>`;
}
function renderOpt(){
  $("#optativas tbody").innerHTML=DATA.optativas.map(o=>`<tr>
    <td><strong>${o.codigo}</strong></td><td>${o.disciplina}</td><td>${o.turma||""}</td>
    <td>${(o.horario||"").replace(/\n/g,"<br>")}</td>
    <td class="docentes">${docenteHTML(o.docentes)}</td><td>${o.observacoes||""}</td>
  </tr>`).join("");
}
fetch("dados.json").then(r=>r.json()).then(d=>{
 DATA=d;
 d.periodos.forEach(p=>$("#periodo").insertAdjacentHTML("beforeend",`<option>${p}</option>`));
 ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira"].forEach(x=>$("#dia").insertAdjacentHTML("beforeend",`<option>${x}</option>`));
 ["busca","periodo","dia"].forEach(id=>$("#"+id).addEventListener(id==="busca"?"input":"change",render));
 $("#limpar").onclick=()=>{$("#busca").value="";$("#periodo").value="";$("#dia").value="";render()};
 $("#versao").textContent=d.meta.versao;
 render(); renderOpt();
}).catch(e=>{$("#resultado").innerHTML='<div class="empty">Não foi possível carregar dados.json.</div>';console.error(e)});
