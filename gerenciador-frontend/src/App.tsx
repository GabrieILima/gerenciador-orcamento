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

  const [extrato, setExtrato] = useState<Transacao[]>([
    { id: 1, descricao: "Salário", valor: 1500, tipo: "ganho", data: new Date() },
    { id: 2, descricao: "Luz", valor: 185, tipo: "despesa", data: new Date() },
    { id: 3, descricao: "Internt", valor: 130, tipo: "despesa", data: new Date() }
  ])

  const [descricaoInput, setDescricaoInput] = useState<string>("")
  const [valorInput, setValorInput] = useState<number>(0)
  const [tipoInput, setTipoInput] = useState<"ganho" | "despesa">("ganho")

  let ganhos = 0
  let perdas = 0

  function lidarAdicionar(e: React.FormEvent){
    e.preventDefault();

    const novaTransacao: Transacao ={
      id: Date.now(),
      descricao: descricaoInput,
      valor: valorInput,
      tipo: tipoInput,
      data: new Date()
    }
    setExtrato([...extrato,novaTransacao]);

    setDescricaoInput("");
    setValorInput(0);
  };

  function lidarDeletar(idDeletar: number){
    const listaFiltrada = extrato.filter((item) => item.id !== idDeletar);
    setExtrato(listaFiltrada);
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
    <div>
      <h1>Meu Gerenciador Financeiro</h1>
      <h2>Saldo atual R${saldoAtual}</h2>
      <form onSubmit={lidarAdicionar}>
        <input type="text" placeholder="Ex: Salário" value={descricaoInput} onChange={(e) => setDescricaoInput(e.target.value)}/>
        <input type="number" placeholder="EX: 1500" value={valorInput} onChange={(e) => setValorInput(Number(e.target.value))} />
        <select name="tipo" id="tipoTransacao" value={tipoInput} onChange={(e) => setTipoInput(e.target.value as "ganho" | "despesa")}>
          <option value="ganho">Ganhos</option>
          <option value="despesa">Despesas</option>
        </select>
        <button type= "submit">Adicionar</button>
      </form>

      <ul>
        {extrato.map((item) => (
            <li key={item.id}>
              {item.descricao} - R$ {item.valor} ({item.tipo})
            <button onClick={() => lidarDeletar(item.id)}>Deletar</button>
            </li>
          ))}
      </ul>
    </div>
  
  )
}
export default App
