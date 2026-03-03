let graf1,graf2;

function toggleDesc2(i){
document.getElementById("desc2_"+i).classList.toggle("hidden");
}

function calcular(){

const auxilio=parseFloat(document.getElementById("auxilio").value)||0;
const usarRegra=document.getElementById("usarRegra").value==="sim";

let rotas=[];

for(let i=0;i<2;i++){

let passagem=parseFloat(document.getElementById("passagem"+i).value)||0;
let veiculos=parseFloat(document.getElementById("veiculos"+i).value)||0;
let diaria=parseFloat(document.getElementById("diaria"+i).value)||0;
let dias=parseFloat(document.getElementById("dias"+i).value)||0;

let integral=parseFloat(document.getElementById("integral"+i).value)||0;
let descAlunos=parseFloat(document.getElementById("descAlunos"+i).value)||0;
let descPerc=parseFloat(document.getElementById("descPerc"+i).value)||0;

let desc2Alunos=parseFloat(document.getElementById("desc2Alunos"+i).value)||0;
let desc2Perc=parseFloat(document.getElementById("desc2Perc"+i).value)||0;

let receitaAlunos=
(integral*passagem)+
(descAlunos*passagem*(1-descPerc/100))+
(desc2Alunos*passagem*(1-desc2Perc/100));

let custoOperacional=veiculos*diaria*dias;

rotas.push({
nome:i===0?"7 Lagoas":"Curvelo",
dias,
diaria,
valorFinanceiro:custoOperacional,
receita:receitaAlunos
});
}

let menorDias=Math.min(rotas[0].dias,rotas[1].dias);
let base0=rotas[0].diaria*menorDias;
let base1=rotas[1].diaria*menorDias;

let totalBase=base0+base1;

let excedente0=0,excedente1=0;

if(rotas[0].dias>rotas[1].dias){
excedente0=rotas[0].diaria*(rotas[0].dias-menorDias);
}
if(rotas[1].dias>rotas[0].dias){
excedente1=rotas[1].diaria*(rotas[1].dias-menorDias);
}

let totalFinanceiro=totalBase+excedente0+excedente1;
if(totalFinanceiro===0){alert("Total não pode ser zero");return;}

let auxBase0=(base0/totalFinanceiro)*auxilio;
let auxBase1=(base1/totalFinanceiro)*auxilio;

let auxEx0=0,auxEx1=0;

if(usarRegra && (excedente0>0 || excedente1>0)){
let parteEx=((excedente0+excedente1)/totalFinanceiro)*auxilio;
if(excedente0>0){auxEx0=parteEx*0.7;auxEx1=parteEx*0.3;}
if(excedente1>0){auxEx1=parteEx*0.7;auxEx0=parteEx*0.3;}
}else{
auxEx0=(excedente0/totalFinanceiro)*auxilio;
auxEx1=(excedente1/totalFinanceiro)*auxilio;
}

let final0=auxBase0+auxEx0;
let final1=auxBase1+auxEx1;

document.getElementById("resultado").innerHTML=
`<p><strong>7 Lagoas</strong><br>
Auxílio Final: R$ ${final0.toFixed(2)}</p>

<p><strong>Curvelo</strong><br>
Auxílio Final: R$ ${final1.toFixed(2)}</p>`;

if(graf1)graf1.destroy();
if(graf2)graf2.destroy();

graf1=new Chart(document.getElementById("graficoFinanceiro"),{
type:'bar',
data:{
labels:["7 Lagoas","Curvelo"],
datasets:[{label:"Valor Financeiro",data:[rotas[0].valorFinanceiro,rotas[1].valorFinanceiro]}]
}
});

graf2=new Chart(document.getElementById("graficoAuxilio"),{
type:'pie',
data:{
labels:["7 Lagoas","Curvelo"],
datasets:[{data:[final0,final1]}]
}
});
}

function gerarPDF(){
html2pdf().from(document.body).save("Prestacao_Contas_Oficial.pdf");
}
