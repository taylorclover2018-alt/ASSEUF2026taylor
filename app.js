function gerarVeiculos(rota, qtd){
    let container = document.getElementById("veiculos"+rota);
    container.innerHTML="";
    for(let i=0;i<qtd;i++){
        container.innerHTML+=`
        <div>
        <h4>Veículo ${i+1}</h4>
        Nome: <input type="text"><br>
        Diária: <input type="number"><br>
        Nº Diárias: <input type="number"><br><br>
        </div>
        `;
    }
}

function calcularTotalRota(rota){
    let container = document.getElementById("veiculos"+rota);
    let inputs = container.querySelectorAll("input");
    let total=0;
    for(let i=0;i<inputs.length;i+=3){
        let diaria=parseFloat(inputs[i+1].value)||0;
        let qtd=parseFloat(inputs[i+2].value)||0;
        total+=diaria*qtd;
    }
    return total;
}

let grafico;

function calcular(){

let bruto0=calcularTotalRota(0);
let bruto1=calcularTotalRota(1);
let brutoGeral=bruto0+bruto1;

let auxTotal=parseFloat(document.getElementById("auxilioTotal").value)||0;

let passagens0=parseFloat(document.getElementById("passagens0").value)||0;
let passagens1=parseFloat(document.getElementById("passagens1").value)||0;

let aux0=(bruto0/brutoGeral)*auxTotal;
let aux1=(bruto1/brutoGeral)*auxTotal;

let rateio0=bruto0 - aux0 - passagens0;
let rateio1=bruto1 - aux1 - passagens1;

let integral0=parseInt(document.getElementById("integral0").value)||0;
let desc0=parseInt(document.getElementById("desc0").value)||0;

let integral1=parseInt(document.getElementById("integral1").value)||0;
let desc1=parseInt(document.getElementById("desc1").value)||0;

let peso0 = integral0 + (desc0*0.5);
let peso1 = integral1 + (desc1*0.5);

let valorInt0 = rateio0/peso0;
let valorDesc0 = valorInt0/2;

let valorInt1 = rateio1/peso1;
let valorDesc1 = valorInt1/2;

let tbody=document.querySelector("#tabelaResultado tbody");
tbody.innerHTML=`
<tr>
<td>7 Lagoas</td>
<td>R$ ${bruto0.toFixed(2)}</td>
<td>R$ ${aux0.toFixed(2)}</td>
<td>R$ ${passagens0.toFixed(2)}</td>
<td>R$ ${rateio0.toFixed(2)}</td>
<td>R$ ${valorInt0.toFixed(2)}</td>
<td>R$ ${valorDesc0.toFixed(2)}</td>
</tr>
<tr>
<td>Curvelo</td>
<td>R$ ${bruto1.toFixed(2)}</td>
<td>R$ ${aux1.toFixed(2)}</td>
<td>R$ ${passagens1.toFixed(2)}</td>
<td>R$ ${rateio1.toFixed(2)}</td>
<td>R$ ${valorInt1.toFixed(2)}</td>
<td>R$ ${valorDesc1.toFixed(2)}</td>
</tr>
`;

if(grafico) grafico.destroy();

grafico=new Chart(document.getElementById("graficoRateio"),{
type:"bar",
data:{
labels:["7 Lagoas","Curvelo"],
datasets:[{
label:"Total a Ratear",
data:[rateio0,rateio1]
}]
}
});
}

async function gerarPDF(){
const { jsPDF } = window.jspdf;
let doc=new jsPDF();
doc.text("Relatório Oficial - Transporte",20,20);

let texto=document.querySelector("#tabelaResultado").innerText;
doc.text(texto,20,40);

doc.save("Relatorio_Transporte.pdf");
}

gerarVeiculos(0,1);
gerarVeiculos(1,1);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
