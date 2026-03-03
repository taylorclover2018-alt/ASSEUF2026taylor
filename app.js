function irCadastro(){
document.getElementById("home").classList.remove("active");
document.getElementById("cadastro").classList.add("active");
}

function voltar(){
document.getElementById("resultado").classList.remove("active");
document.getElementById("cadastro").classList.add("active");
}

function addVeiculo(tipo){
let div=document.createElement("div");
div.innerHTML=`
<input placeholder="Nome do veículo">
<input type="number" class="valor" placeholder="Valor da diária">
<input type="number" class="dias" placeholder="Dias utilizados">
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

let maiorDias=Math.max(SL.totalDias,CV.totalDias);

if(maiorDias===0){
alert("Informe pelo menos uma diária.");
return;
}

let valorBaseDia=auxTotal/maiorDias;

let diasComuns=Math.min(SL.totalDias,CV.totalDias);
let diasExSL=SL.totalDias-diasComuns;
let diasExCV=CV.totalDias-diasComuns;

let auxSL=0;
let auxCV=0;

auxSL+=diasComuns*(valorBaseDia*0.5);
auxCV+=diasComuns*(valorBaseDia*0.5);

auxSL+=diasExSL*(valorBaseDia*0.7);
auxCV+=diasExSL*(valorBaseDia*0.3);

auxCV+=diasExCV*(valorBaseDia*0.7);
auxSL+=diasExCV*(valorBaseDia*0.3);

let liquidoSL=SL.total-auxSL-(parseFloat(passSL.value)||0);
let liquidoCV=CV.total-auxCV-(parseFloat(passCV.value)||0);

let alunosSL=parseFloat(intSL.value)||1;
let alunosCV=parseFloat(intCV.value)||1;

let valorIntegralSL=liquidoSL/alunosSL;
let valorIntegralCV=liquidoCV/alunosCV;

let descontoSL=parseFloat(descSL.value)||0;
let descontoCV=parseFloat(descCV.value)||0;

let valorDescSL=valorIntegralSL-(valorIntegralSL*descontoSL/100);
let valorDescCV=valorIntegralCV-(valorIntegralCV*descontoCV/100);

document.getElementById("cadastro").classList.remove("active");
document.getElementById("resultado").classList.add("active");

document.getElementById("relatorio").innerHTML=`

<h3>1) Cálculo Base</h3>
Auxílio Total ÷ Maior número de diárias<br>
${auxTotal} ÷ ${maiorDias} = ${valorBaseDia.toFixed(2)}

<h3>2) Dias</h3>
Dias em comum: ${diasComuns}<br>
Excedentes SL: ${diasExSL}<br>
Excedentes CV: ${diasExCV}

<h3>3) Auxílio Final</h3>
Sete Lagoas: R$ ${auxSL.toFixed(2)}<br>
Curvelo: R$ ${auxCV.toFixed(2)}

<h3>4) Valor Bruto</h3>
SL: R$ ${SL.total.toFixed(2)}<br>
CV: R$ ${CV.total.toFixed(2)}

<h3>5) Valor Líquido</h3>
SL: R$ ${liquidoSL.toFixed(2)}<br>
CV: R$ ${liquidoCV.toFixed(2)}

<h3>6) Valor por Aluno</h3>
Integral SL: R$ ${valorIntegralSL.toFixed(2)}<br>
Integral CV: R$ ${valorIntegralCV.toFixed(2)}<br>
Com desconto SL: R$ ${valorDescSL.toFixed(2)}<br>
Com desconto CV: R$ ${valorDescCV.toFixed(2)}
`;
}

function gerarPDF(){
const { jsPDF }=window.jspdf;
let doc=new jsPDF();
doc.text("Relatório Completo de Transparência",10,10);
doc.text(document.getElementById("relatorio").innerText,10,20);
doc.save("relatorio_transporte.pdf");
}
