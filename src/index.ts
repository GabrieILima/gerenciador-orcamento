import express from "express";
import cors from "cors"

import * as fs from "fs/promises";
import { it } from "node:test";

const app = express();
const PORTA = 3000

app.use(cors());
app.use(express.json());



type Transacao = {
    id: number;
    descricao: string;
    valor: number;
    tipo: "ganho" | "despesa";
    recorrente: "unica" | "fixa" | "parcelada";
    parcelaAtual?: number;
    totalParcelas?: number;
    statusAtual: "ativo" | "concluido";
    data: Date;



};


const CAMINHO_ARQUIVO = "./banco.json";
let extrato: Transacao[] = [];

function adicionarTransacao(novaTransacao: Transacao) {
    extrato.push(novaTransacao);
}

async function carregarDados(){
    let dadosTexto = await fs.readFile(CAMINHO_ARQUIVO, "utf-8");
    extrato = JSON.parse(dadosTexto)
    console.log("Dados Carregados com sucesso")
}

async function processarRecorrencia() {
    const hoje = new Date;
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    let novasTransacoes: Transacao[] = [];

    extrato.forEach((item) => {
        if (item.statusAtual === "ativo" && item.recorrente === "fixa" || item.recorrente === "parcelada"){


            const jaExisteEsteMes = extrato.some((t) => {
                const datatT = new Date(t.data);
                return t.descricao === item.descricao &&
                        datatT.getMonth() === mesAtual &&
                        datatT.getFullYear() === anoAtual;
            })

            if (!jaExisteEsteMes){

                
            const copiaTransacao: Transacao = {
                id: Date.now() + Math.random(),
                descricao: item.descricao,
                valor: item.valor,
                tipo: item.tipo,
                recorrente: item.recorrente,
                statusAtual: item.statusAtual,
                data: new Date()
            }


                if(item.recorrente == "parcelada" && item.parcelaAtual && item.totalParcelas){
                    const proximaParcela = item.parcelaAtual +1;
                    
                    copiaTransacao.parcelaAtual = proximaParcela;
                    copiaTransacao.totalParcelas = item.totalParcelas

                    if (proximaParcela >= item.totalParcelas){
                        copiaTransacao.statusAtual = "concluido"
                    }
                }
                

            novasTransacoes.push(copiaTransacao)

            }
        }
            

        });

        if(novasTransacoes.length > 0){
            extrato = [...extrato, ...novasTransacoes];
            await salvarDados();
            console.log(`Automação: ${novasTransacoes.length} contas recorrentes geradas para este mês.`)
        }
    }
    




function calcularSaldo(): number {
    let ganhos: number = 0;
    let devedor: number = 0;
    extrato.forEach((item) => {
        if (item.tipo === "despesa") {
            devedor = devedor + item.valor;
        } else {
            ganhos = ganhos + item.valor;
        }     
    });
    return ganhos - devedor;
}

async function deletarTransacao(idDeletar: number) {
    extrato = extrato.filter((item) => item.id !== idDeletar);
    await salvarDados();
    
}

async function salvarDados() {

    let texto = JSON.stringify(extrato, null,2)
    await fs.writeFile(CAMINHO_ARQUIVO,texto)
    console.log("Salvo com sucesso")
    

}



async function iniciarSistema() {
    await carregarDados()
}

app.get("/transacoes", (req, res) => {
    res.json(extrato);
})

app.post("/transacoes", async (req, res) => {

    const novaTransacao = req.body;

    adicionarTransacao(novaTransacao);
    await salvarDados();

    res.status(201).json({mensagem: "Transação adicionada com sucesso!"});

})
app.delete("/transacoes/:id", async (req, res)=> {
    const idDeletar = Number(req.params.id);
    await deletarTransacao(idDeletar);
    res.json({mensagem: "Transação deletada com sucesso!"})
})


app.listen(PORTA, async () => {
    await carregarDados();
    await processarRecorrencia()
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
    iniciarSistema();
});

