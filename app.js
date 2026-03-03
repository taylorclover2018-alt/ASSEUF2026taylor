let rotas = [];
let graficoBarra;
let graficoPizza;

function proximaEtapa(atual){
    document.getElementById("etapa"+atual).classList.remove("ativa");
    document.getElementById("etapa"+(atual+1)).classList.add("ativa");
}

function validarEtapa2(){
    const auxilio = document.getElementById("auxilio").value;
    if(auxilio <= 0){
        alert("Informe um valor válido de auxílio.");
        return;
    }
    proximaEtapa(2);
}

function adicionarRota(){

    const id = rotas.length;

    const div = document.createElement("div");
    div.className = "rota";

    div.innerHTML = `
        <h4>Rota ${id+1}</h4>
        <input type="text" id="nome${id}" placeholder="Nome da rota">
        <input type="number" id="diaria${id}" placeholder="Valor da diária">
        <input type="number" id="dias${id}" placeholder="Quantidade de dias">
    `;

    document.getElementById("rotas").appendChild(div);
    rotas.push(id);
}

function calcular(){

    const auxilio = parseFloat(document.getElementById("auxilio").value);
    let totalGeral = 0;
    let nomes = [];
    let valores = [];

    rotas.forEach(id=>{
        const nome = document.getElementById("nome"+id).value;
        const diaria = parseFloat(document.getElementById("diaria"+id).value)||0;
        const dias = parseFloat(document.getElementById("dias"+id).value)||0;

        const total = diaria*dias;

        totalGeral += total;
        nomes.push(nome);
        valores.push(total);
    });

    if(totalGeral===0){
        alert("Total geral não pode ser zero.");
        return;
    }

    let resultadoHTML = "";

    valores.forEach((valor,i)=>{
        const percentual = valor/totalGeral;
        const aux = percentual*auxilio;

        resultadoHTML+=`
        <p><strong>${nomes[i]}</strong><br>
        Total Financeiro: R$ ${valor.toFixed(2)}<br>
        Percentual: ${(percentual*100).toFixed(2)}%<br>
        Auxílio: R$ ${aux.toFixed(2)}</p>
        `;
    });

    document.getElementById("resultado").innerHTML=resultadoHTML;

    gerarGraficos(nomes,valores);
}

function gerarGraficos(nomes,valores){

    if(graficoBarra) graficoBarra.destroy();
    if(graficoPizza) graficoPizza.destroy();

    graficoBarra=new Chart(
        document.getElementById("graficoBarra"),
        {
            type:'bar',
            data:{
                labels:nomes,
                datasets:[{data:valores}]
            }
        }
    );

    graficoPizza=new Chart(
        document.getElementById("graficoPizza"),
        {
            type:'pie',
            data:{
                labels:nomes,
                datasets:[{data:valores}]
            }
        }
    );
}
