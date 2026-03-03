let rotas = [];

function adicionarRota() {
    const id = rotas.length;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
        <h3>Rota ${id + 1}</h3>
        <label>Nome da Rota</label>
        <input type="text" id="nome${id}">

        <label>Valor da Diária (R$)</label>
        <input type="number" id="diaria${id}">

        <label>Quantidade de Diárias</label>
        <input type="number" id="dias${id}">

        <label>Total de Alunos</label>
        <input type="number" id="alunos${id}">

        <label>Número de Alunos com Desconto 1</label>
        <input type="number" id="alunosDesc1_${id}">

        <label>Percentual Desconto 1 (%)</label>
        <input type="number" id="desc1_${id}">

        <label>Possui segundo desconto?</label>
        <input type="checkbox" id="temDesc2_${id}" onchange="toggleDesc2(${id})">

        <div id="desc2Area_${id}" style="display:none;">
            <label>Número de Alunos com Desconto 2</label>
            <input type="number" id="alunosDesc2_${id}">
            
            <label>Percentual Desconto 2 (%)</label>
            <input type="number" id="desc2_${id}">
        </div>
    `;

    document.getElementById("rotas").appendChild(div);
    rotas.push(id);
}

function toggleDesc2(id){
    const area = document.getElementById(`desc2Area_${id}`);
    const check = document.getElementById(`temDesc2_${id}`);
    area.style.display = check.checked ? "block" : "none";
}

function calcular(){

    const auxilio = parseFloat(document.getElementById("auxilio").value);
    let totalGeral = 0;
    let dados = [];

    rotas.forEach(id => {

        const nome = document.getElementById(`nome${id}`).value;
        const diaria = parseFloat(document.getElementById(`diaria${id}`).value) || 0;
        const dias = parseFloat(document.getElementById(`dias${id}`).value) || 0;

        const valorTotal = diaria * dias;

        totalGeral += valorTotal;

        dados.push({
            nome,
            valorTotal
        });
    });

    if(totalGeral === 0){
        alert("Erro: Total geral não pode ser zero.");
        return;
    }

    let resultadoHTML = "<h2>Resultado Oficial</h2>";

    dados.forEach(ro => {

        const percentual = ro.valorTotal / totalGeral;
        const valorAuxilio = percentual * auxilio;

        resultadoHTML += `
            <p><strong>${ro.nome}</strong><br>
            Valor Financeiro: R$ ${ro.valorTotal.toFixed(2)}<br>
            Percentual: ${(percentual*100).toFixed(2)}%<br>
            Auxílio Recebido: R$ ${valorAuxilio.toFixed(2)}</p>
        `;
    });

    document.getElementById("resultado").innerHTML = resultadoHTML;

    gerarGraficos(dados, totalGeral);
}

function gerarGraficos(dados, totalGeral){

    const nomes = dados.map(d => d.nome);
    const valores = dados.map(d => d.valorTotal);
    const percentuais = dados.map(d => (d.valorTotal / totalGeral) * 100);

    new Chart(document.getElementById("graficoFinanceiro"), {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [{
                label: "Valor Financeiro por Rota",
                data: valores
            }]
        }
    });

    new Chart(document.getElementById("graficoPercentual"), {
        type: 'pie',
        data: {
            labels: nomes,
            datasets: [{
                label: "Percentual",
                data: percentuais
            }]
        }
    });
}

function gerarPDF(){
    const elemento = document.body;
    html2pdf().from(elemento).save("Prestacao_de_Contas_Oficial.pdf");
}
