let rotas = [];
let graficoBarra;
let graficoPizza;

function adicionarRota() {

    const id = rotas.length;

    const div = document.createElement("div");
    div.className = "rotaCard";

    div.innerHTML = `
        <h3>Rota ${id+1}</h3>
        <input type="text" id="nome${id}" placeholder="Nome da rota">
        <input type="number" id="diaria${id}" placeholder="Valor da diária">
        <input type="number" id="dias${id}" placeholder="Qtd diárias">
    `;

    document.getElementById("rotas").appendChild(div);
    rotas.push(id);

    document.getElementById("kpiRotas").innerText = rotas.length;
}

function calcular(){

    const auxilio = parseFloat(document.getElementById("auxilio").value) || 0;
    let totalGeral = 0;
    let nomes = [];
    let valores = [];

    rotas.forEach(id => {

        const nome = document.getElementById(`nome${id}`).value || `Rota ${id+1}`;
        const diaria = parseFloat(document.getElementById(`diaria${id}`).value) || 0;
        const dias = parseFloat(document.getElementById(`dias${id}`).value) || 0;

        const valor = diaria * dias;

        totalGeral += valor;
        nomes.push(nome);
        valores.push(valor);
    });

    if(totalGeral === 0){
        alert("Total geral não pode ser zero.");
        return;
    }

    document.getElementById("kpiTotal").innerText =
        "R$ " + totalGeral.toFixed(2);

    document.getElementById("kpiAuxilio").innerText =
        "R$ " + auxilio.toFixed(2);

    atualizarGraficos(nomes, valores);
}

function atualizarGraficos(nomes, valores){

    if(graficoBarra) graficoBarra.destroy();
    if(graficoPizza) graficoPizza.destroy();

    graficoBarra = new Chart(
        document.getElementById("graficoBarra"),
        {
            type: 'bar',
            data: {
                labels: nomes,
                datasets: [{
                    label: "Valor Financeiro",
                    data: valores
                }]
            },
            options: {
                animation: {
                    duration: 1500
                }
            }
        }
    );

    graficoPizza = new Chart(
        document.getElementById("graficoPizza"),
        {
            type: 'pie',
            data: {
                labels: nomes,
                datasets: [{
                    data: valores
                }]
            },
            options: {
                animation: {
                    animateScale: true
                }
            }
        }
    );
}Com desconto CV: R$ ${valorDescCV.toFixed(2)}
`;
}

function gerarPDF(){
const { jsPDF }=window.jspdf;
let doc=new jsPDF();
doc.text("Relatório Completo de Transparência",10,10);
doc.text(document.getElementById("relatorio").innerText,10,20);
doc.save("relatorio_transporte.pdf");
}
