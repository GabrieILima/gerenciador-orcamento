import './App.css'
import React, {useState, useEffect} from 'react'

type Transacao = {
    id: number;
    descricao: string;
    valor: number;
    tipo: "ganho" | "despesa";
    recorrente: "unica" | "fixa" | "parcelada";
    parcelaAtual?: number;
    totalParcelas?: number;
    status: "ativo" | "concluido";
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
  const [recorrenteInput, serRecorrenteInput] = useState<"unica" | "fixa" | "parcelada">("unica")
  const [totalParcelasInput, setTotalParcelasInput] = useState<number>(1);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth())

  
  


  let ganhos = 0
  let perdas = 0

  async function lidarAdicionar(e: React.FormEvent){
    e.preventDefault();

    const novaTransacao: Transacao ={
      id: Date.now(),
      descricao: descricaoInput,
      valor: valorInput,
      tipo: tipoInput,
      recorrente: recorrenteInput,
      parcelaAtual: recorrenteInput === 'parcelada' ? 1 : undefined,
      totalParcelas: recorrenteInput ==='parcelada' ? totalParcelasInput:undefined,
      status: "ativo",
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

  let transacoesExibidas: Transacao[] = [];

  extrato.forEach((item) => {
    const dataItem = new Date(item.data);
    const parcelaAtual = item.parcelaAtual ?? 0 
    const totalParcelas = item.totalParcelas ?? 0
    

    if(dataItem.getMonth() === mesSelecionado){
      transacoesExibidas.push(item)}

    if(item.status === "ativo" && item.recorrente === "fixa" && dataItem.getMonth() < mesSelecionado){
        transacoesExibidas.push({...item, data:new Date( new Date().getFullYear(), mesSelecionado, 5)})
      }
    if(item.status === "ativo" && item.recorrente === "parcelada"&& dataItem.getMonth() < mesSelecionado){

      const mesesPassados = mesSelecionado - dataItem.getMonth();
      const parcelaRestante = parcelaAtual + mesesPassados;

      if (parcelaRestante <= totalParcelas){
        transacoesExibidas.push({...item,parcelaAtual:parcelaRestante,
           data:new Date( new Date().getFullYear(), mesSelecionado, 5)})
      }

    }

    
  })

  transacoesExibidas.forEach((item) =>{
    if (item.tipo === "despesa"){
      perdas = perdas + item.valor
    }else{
      ganhos = ganhos + item.valor
    }
  })

  const saldoAtual = ganhos - perdas

  
  const NOMES_MESES =[
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  function voltarMes(){
    if (mesSelecionado > 0){
      setMesSelecionado(mesSelecionado-1)
    }
  }

  function avancarMes(){
    if (mesSelecionado < 11){
      setMesSelecionado(mesSelecionado+1)
    }
  }
  


  return(
    <div className="container-app">

      <div className="card-titulo">
        <h1>Meu Gerenciador Financeiro</h1>
      </div>
      
      <div className="navegacao-mes">
        <button onClick={voltarMes} disabled ={mesSelecionado === 0} className="botao-nav">◄ Anterior</button>
        <span className="mes-atual">{NOMES_MESES[mesSelecionado]} / {new Date().getFullYear()}</span>
        <button onClick={avancarMes} disabled ={mesSelecionado === 11} className="botao-nav"> Próximo ►</button>
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
        <select name="recorrente" id="recorrenteInput" value={recorrenteInput} onChange={(e) => serRecorrenteInput(e.target.value as "unica" | "fixa" | "parcelada")}>
          <option value="unica">Única</option>
          <option value="fixa">Fixa</option>
          <option value="parcelada">Parcelada</option>
        </select>
        {recorrenteInput === "parcelada" && (
          <input type="number" placeholder="Qtd Parcelas" value={totalParcelasInput} onChange={(e) => setTotalParcelasInput(Number(e.target.value))}/>)}
        <button type= "submit">Adicionar</button>
      </form>

      <ul className="lista-extrato">
        {transacoesExibidas.map((item) => (
            <li key={item.id} className={`item-descricao ${item.tipo}`}>
              <span>
              {item.descricao} - R$ {item.valor} {}
              {item.recorrente === "fixa" && <span className="tag-recorrente">(Fixa) </span>}
              {item.recorrente === "parcelada" && <span className="tag-recorrente">({item.parcelaAtual}/{item.totalParcelas}) </span>}
              </span>
            <button onClick={() => lidarDeletar(item.id)} className="botao-deletar">Deletar</button>

            </li>
          ))}
      </ul>
    </div>
  
  )
}
export default App
