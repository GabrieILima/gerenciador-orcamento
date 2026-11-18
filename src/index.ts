import express from "express";
import cors from "cors"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as fs from "fs/promises";
import { it } from "node:test";

const app = express();
const PORTA = 3000

app.use(cors());
app.use(express.json());


type Usuario = {
    id: string;
    email: string;
    senhaCriptografada: string;
}



type Transacao = {
    id: number;
    usuarioId: string;
    descricao: string;
    valor: number;
    tipo: "ganho" | "despesa";
    recorrente: "unica" | "fixa" | "parcelada";
    parcelaAtual?: number;
    totalParcelas?: number;
    statusAtual: "ativo" | "concluido";
    pago: Boolean;
    categoria: "Alimentação" | "Compras" | "Educação" | "Lazer" | "Moradia" | "Rendimento" | "Serviços"
    data: Date;
    


};


const CAMINHO_ARQUIVO = "./banco.json";
let extrato: Transacao[] = [];
let usuarios: Usuario[] = [];

function adicionarTransacao(novaTransacao: Transacao) {
    extrato.push(novaTransacao);
}

async function carregarDados(){

    try{
    let dadosTexto = await fs.readFile(CAMINHO_ARQUIVO, "utf-8");
    const banco = JSON.parse(dadosTexto);
    extrato = banco.transacoes || [];
    usuarios =  banco.usuarios || [];
    console.log("Dados Carregados com sucesso")
    } catch(erro){
        extrato = [];
        usuarios = [];
    }
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
                usuarioId: item.usuarioId,
                descricao: item.descricao,
                valor: item.valor,
                tipo: item.tipo,
                recorrente: item.recorrente,
                statusAtual: item.statusAtual,
                pago: false,
                categoria: item.categoria,
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

    let estruturaBanco ={
        transacoes: extrato,
        usuarios: usuarios
    }

    let texto = JSON.stringify(estruturaBanco, null, 2); 
    await fs.writeFile(CAMINHO_ARQUIVO,texto)
    console.log("Banco de dados salvo com sucesso!")
    

}




async function iniciarSistema() {
    await carregarDados()
}

app.get("/transacoes", (req, res) => {
    res.json(extrato);
})

app.patch("/transacoes/:id", async (req, res) =>{
    const idTransacao = Number(req.params.id)
    const newPago = req.body.pago
      

    const transacaoEncontrada = extrato.find((item) => item.id === idTransacao)

    if(transacaoEncontrada){
        transacaoEncontrada.pago = newPago;

        await salvarDados()

        res.json({ mensagem: "Status de pagamento atualizado!" });
    }else{
        res.status(404).json({ mensagem: "Transação não encontrada" });
    }
    
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

app.put("/transacoes/:id", async (req,res) =>{

    const idTransacao = Number(req.params.id);
    const transacaoAtualizada = req.body;

    const indexAntigo = extrato.findIndex((item) => item.id === idTransacao);

    if (indexAntigo !== -1) {
        
        extrato[indexAntigo] = transacaoAtualizada;

        await salvarDados();

        res.json({ mensagem: "Transação atualizada com sucesso!" });
    } else {
        res.status(404).json({ mensagem: "Transação não encontrada." });
    }

}

)

app.post("/auth/cadastro", async(req, res) =>{
    const email = req.body.email
    const senhaLimpa = req.body.senha

    if(!email || !senhaLimpa){
        res.status(400).json({ mensagem: "Email e senha são obrigados"});
    }

    const usuarioExiste = usuarios.some((u) => u.email === email);
    if (usuarioExiste) {
        res.status(400).json({ mensagem: "Este e-mail já está cadastrado." });
        return;
    }

    const custoCripto = 10;
    const hashGerado = await bcrypt.hash(senhaLimpa, custoCripto);

    const novoUsuario: Usuario ={
        id: String(Date.now()+Math.random()),
        email: email,
        senhaCriptografada: hashGerado
    };

    usuarios.push(novoUsuario);

    await salvarDados();

    res.status(201).json({
        mensagem: "Usuário registrado com sucesso!",
        usuarioId: novoUsuario.id
    })
})

app.post("/auth/login", async(req, res) =>{
    const email = req.body.email;
    const senhaLimpa = req.body.senha;

    const usuarioEncontrado = usuarios.find((u) => u.email === email);

    if(!usuarioEncontrado){
        res.status(401).json({mensagem: "Email ou senha incorretos"});
        return;
    }


    const senhaValida = await bcrypt.compare(senhaLimpa, usuarioEncontrado.senhaCriptografada);

    if(!senhaValida){
        res.status(401).json({mensagem: "E-mail ou senha incorretos."});
        return;
    }

    const token = jwt.sign(
        {id: usuarioEncontrado.id},
        "chave_secreta_temporaria_bolsa_rupias",
        {expiresIn: "1d"}
    );

    res.json({
        mensagem:"Login realizado com sucesso!",
        token: token
    })
})