function goToCadastro(){
document.getElementById("home").classList.remove("active");
document.getElementById("cadastro").classList.add("active");
}

function addVeiculo(tipo){
let div = document.createElement("div");
div.innerHTML=`
<input placeholder="Nome Veículo">
<input type="number" class="valor" placeholder="Valor Diária">
<input type="number" class="dias" placeholder="Dias Utilizados">
`;
document.getElementById(tipo==="SL"?"veiculosSL":"veiculosCV").appendChild(div);
}

function somar(container){
let valores=container.querySelectorAll(".valor");
let dias=container.querySelectorAll(".dias");
let total=0;
let totalDias=0;

for(let i=0;i<valores.length;i++){
let v=parseFloat(valores[i].value)||0;
let d=parseFloat(dias[i].value)||0;
total+=v*d;
totalDias+=d;
}
return{total,totalDias};
}

function calcular(){

let auxTotal=parseFloat(auxilio.value)||0;

let SL=somar(document.getElementById("veiculosSL"));
let CV=somar(document.getElementById("veiculosCV"));

let totalDias=SL.totalDias+CV.totalDias;

let auxPorDia=auxTotal/totalDias;

let auxSL=0;
let auxCV=0;

if(SL.totalDias>CV.totalDias){
let diff=SL.totalDias-CV.totalDias;
auxSL+=(diff*auxPorDia*0.7);
auxCV+=(diff*auxPorDia*0.3);
}

if(CV.totalDias>SL.totalDias){
let diff=CV.totalDias-SL.totalDias;
auxCV+=(diff*auxPorDia*0.7);
auxSL+=(diff*auxPorDia*0.3);
}

let comum=Math.min(SL.totalDias,CV.totalDias);
auxSL+=(comum*auxPorDia*0.5);
auxCV+=(comum*auxPorDia*0.5);

let liquidoSL=SL.total-auxSL-(parseFloat(passSL.value)||0);
let liquidoCV=CV.total-auxCV-(parseFloat(passCV.value)||0);

let valorIntegralSL=liquidoSL/(parseFloat(intSL.value)||1);
let valorIntegralCV=liquidoCV/(parseFloat(intCV.value)||1);

let valorDescSL=valorIntegralSL-(valorIntegralSL*(parseFloat(descSL.value)||0)/100);
let valorDescCV=valorIntegralCV-(valorIntegralCV*(parseFloat(descCV.value)||0)/100);

document.getElementById("cadastro").classList.remove("active");
document.getElementById("resultado").classList.add("active");

document.getElementById("resultadoTexto").innerHTML=`
<table>
<tr><th></th><th>Sete Lagoas</th><th>Curvelo</th></tr>
<tr><td>Dias Rodados</td><td>${SL.totalDias}</td><td>${CV.totalDias}</td></tr>
<tr><td>Valor Bruto</td><td>R$ ${SL.total.toFixed(2)}</td><td>R$ ${CV.total.toFixed(2)}</td></tr>
<tr><td>Auxílio Recebido</td><td>R$ ${auxSL.toFixed(2)}</td><td>R$ ${auxCV.toFixed(2)}</td></tr>
<tr><td>Valor Integral</td><td>R$ ${valorIntegralSL.toFixed(2)}</td><td>R$ ${valorIntegralCV.toFixed(2)}</td></tr>
<tr><td>Valor com Desconto</td><td>R$ ${valorDescSL.toFixed(2)}</td><td>R$ ${valorDescCV.toFixed(2)}</td></tr>
</table>
`;

new Chart(grafico,{
type:"bar",
data:{
labels:["Sete Lagoas","Curvelo"],
datasets:[{
label:"Valor por Aluno Integral",
data:[valorIntegralSL,valorIntegralCV]
}]
}
});
}

function gerarPDF(){
const { jsPDF } = window.jspdf;
let doc=new jsPDF();
doc.text("Relatório Transporte Universitário",10,10);
doc.text(document.getElementById("resultadoTexto").innerText,10,20);
doc.save("relatorio.pdf");
}
