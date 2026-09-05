import './App.css'
import React, {useState, useEffect} from 'react'

type Transacao = {
    id: number;
    descricao: string;
    valor: number;
    tipo: "ganho" | "despesa";
    data: Date;
};

function App() {

  async function buscarTransacao() {
    const reposta = await fetch("http://localhost:3000/transacoes");
    const dados = await reposta.json();

    setExtrato(dados);
  }

  useEffect(() =>{
    buscarTransacao();
  }, []);

  const [extrato, setExtrato] = useState<Transacao[]>([])

  const [descricaoInput, setDescricaoInput] = useState<string>("")
  const [valorInput, setValorInput] = useState<number>(0)
  const [tipoInput, setTipoInput] = useState<"ganho" | "despesa">("ganho")

  let ganhos = 0
  let perdas = 0

  async function lidarAdicionar(e: React.FormEvent){
    e.preventDefault();

    const novaTransacao: Transacao ={
      id: Date.now(),
      descricao: descricaoInput,
      valor: valorInput,
      tipo: tipoInput,
      data: new Date()
    };

    await fetch("http://localhost:3000/transacoes", {
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(novaTransacao)
    })

    buscarTransacao();

    setDescricaoInput("");
    setValorInput(0);
  };

  async function lidarDeletar(idDeletar: number){
    await fetch (`http://localhost:3000/transacoes/${idDeletar}`, {
      method: "DELETE"
    });

    buscarTransacao()
  }

  extrato.forEach((item) =>{
    if (item.tipo === "despesa"){
      perdas = perdas + item.valor
    }else{
      ganhos = ganhos + item.valor
    }
  })

  const saldoAtual = ganhos - perdas

  
    


  return(
    <div className="container-app">

      <div className="card-titulo">
        <h1>Meu Gerenciador Financeiro</h1>
      </div>
      

      <div className="card-saldo">
        <h2>Saldo atual R${saldoAtual}</h2>
      </div>
      

      <form onSubmit={lidarAdicionar} className="formulario-financas">
        <input type="text" placeholder="Ex: Salário" value={descricaoInput} onChange={(e) => setDescricaoInput(e.target.value)}/>
        <input type="number" placeholder="Ex: 1500" value={valorInput === 0 ? "": valorInput} onChange={(e) => setValorInput(Number(e.target.value))} />
        <select name="tipo" id="tipoTransacao" value={tipoInput} onChange={(e) => setTipoInput(e.target.value as "ganho" | "despesa")}>
          <option value="ganho">Ganhos</option>
          <option value="despesa">Despesas</option>
        </select>
        <button type= "submit">Adicionar</button>
      </form>

      <ul className="lista-extrato">
        {extrato.map((item) => (
            <li key={item.id} className={`item-descricao ${item.tipo}`}>
              {item.descricao} - R$ {item.valor} ({item.tipo})
            <button onClick={() => lidarDeletar(item.id)}>Deletar</button>
            </li>
          ))}
      </ul>
    </div>
  
  )
}
export default App
