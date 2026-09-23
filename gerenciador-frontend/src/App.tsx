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
    pago: boolean;
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
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth());
  const [idSendoEditado, setIdSendoEditado] = useState<number | null> (null);

  
  


  let ganhos = 0
  let perdas = 0
  let perdasPagas = 0

  async function lidarAdicionar(e: React.FormEvent){
    e.preventDefault();

     if (idSendoEditado === null) {
      const novaTransacao: Transacao = {
        id: Date.now(),
        descricao: descricaoInput,
        valor: valorInput,
        tipo: tipoInput,
        recorrente: recorrenteInput,
        parcelaAtual: recorrenteInput === 'parcelada' ? 1 : undefined,
        totalParcelas: recorrenteInput === 'parcelada' ? totalParcelasInput : undefined,
        status: "ativo",
        pago: false,
        data: new Date()
      };

      await fetch("http://localhost:3000/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaTransacao)
      });

    } else {

      const itemOriginal = extrato.find(item => item.id === idSendoEditado);
      const mesOriginal = itemOriginal ? new Date(itemOriginal.data).getMonth() : mesSelecionado;

      const projecaoFuturo = mesOriginal < mesSelecionado;


      const transacaoEditada: Transacao = {
        id: projecaoFuturo ? Date.now() : idSendoEditado,
        descricao: descricaoInput,
        valor: valorInput,
        tipo: tipoInput,
        recorrente: recorrenteInput,
        parcelaAtual: recorrenteInput === 'parcelada' ? 1 : undefined,
        totalParcelas: recorrenteInput === 'parcelada' ? totalParcelasInput : undefined,
        status: "ativo",
        pago: false, 
        data: new Date(new Date().getFullYear(), mesSelecionado, 5)
      };

      const metodoRede = projecaoFuturo ? "POST" : "PUT";
      const urlRede = projecaoFuturo ? "http://localhost:3000/transacoes" : `http://localhost:3000/transacoes/${idSendoEditado}`;

      
      await fetch(urlRede, {
        method: metodoRede,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transacaoEditada)
      });

      setIdSendoEditado(null);
    }

    buscarTransacao();
    setDescricaoInput("");
    setValorInput(0);
  }

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

    if (item.status === "ativo" && dataItem.getMonth() < mesSelecionado) {
      
      const existeRealNoMes = extrato.some((t) => {
      const dataT = new Date(t.data);
        return t.descricao === item.descricao && (dataT.getMonth() === mesSelecionado || dataT.getMonth() > dataItem.getMonth());
      });

      if (existeRealNoMes) {
        return;
      }

      if (item.recorrente === "fixa") {
        transacoesExibidas.push({
          ...item, 
          data: new Date(new Date().getFullYear(), mesSelecionado, 5)
        });
      }

      if (item.recorrente === "parcelada") {
        const mesesPassados = mesSelecionado - dataItem.getMonth();
        const parcelaRestante = parcelaAtual + mesesPassados;

        if (parcelaRestante <= totalParcelas) {
          transacoesExibidas.push({
            ...item,
            parcelaAtual: parcelaRestante,
            data: new Date(new Date().getFullYear(), mesSelecionado, 5)
          });
        }
      }

    }

    
  })

  transacoesExibidas.forEach((item) =>{
    if (item.tipo === "despesa"){
      perdas = perdas + item.valor

      if(item.pago === true){
        perdasPagas = perdasPagas + item.valor
      }
    }else{
      ganhos = ganhos + item.valor
    }
  })

  const saldoAtual = ganhos - perdas
  const saldoReal = ganhos - perdasPagas
  

  
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
  
  async function lidarAlternarPago(idPago: number) {
    const itemEncontrado = extrato.find((item) =>
      item.id === idPago)

      if(itemEncontrado){
        const novoStatusPago = !itemEncontrado.pago

        await fetch (`http://localhost:3000/transacoes/${idPago}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({pago: novoStatusPago})
    
      });
        buscarTransacao();
      }
    }

    function prepararEdicao(item: Transacao) {
      setDescricaoInput(item.descricao);
      setValorInput(item.valor);
      setTipoInput(item.tipo);
      serRecorrenteInput(item.recorrente)

      if (item.recorrente === "parcelada" && item.totalParcelas){
        setTotalParcelasInput(item.totalParcelas)
      }
      setIdSendoEditado(item.id)
    }
  


  return(
    <div className="container-app">

      <div className="card-titulo">
        <h1>Bolsa de Rúpias</h1>
      </div>
      
      <div className="navegacao-mes">
        <button onClick={voltarMes} disabled ={mesSelecionado === 0} className="botao-nav">◄ Anterior</button>
        <span className="mes-atual">{NOMES_MESES[mesSelecionado]} / {new Date().getFullYear()}</span>
        <button onClick={avancarMes} disabled ={mesSelecionado === 11} className="botao-nav"> Próximo ►</button>
      </div>

      <div className="painel-saldos">
        <div className="card-saldo">
          <h2>Saldo Real (Hoje): <span className="valor">R$ {saldoReal}</span></h2>
        </div>
        <div className="card-saldo previsto">
          <h2>Saldo Previsto (Fim do Mês): <span className="valor">R$ {saldoAtual}</span></h2>
        </div>
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
        <button type= "submit">{idSendoEditado !== null ? "Salvar Alterações" : "Adicionar"}</button>
      </form>

      <ul className="lista-extrato">
        {transacoesExibidas.map((item) => (
            <li key={item.id} className={`item-descricao ${item.tipo}`}>
              <span>
              {item.tipo==="despesa"?( <input type="checkbox" checked ={item.pago} onChange={() => lidarAlternarPago(item.id)} className="checkbox-pago"/>):null}
              <span className={`texto-transacao ${item.pago ? 'paga' : ''}`}>
                {item.descricao} - R$ {item.valor} {}
                {item.recorrente === "fixa" && <span className="tag-recorrente">(Fixa) </span>}
                {item.recorrente === "parcelada" && <span className="tag-recorrente">({item.parcelaAtual}/{item.totalParcelas}) </span>}
              </span>
              </span>

            <div>
              <button className="botao-editar" onClick={() => prepararEdicao(item)}>Editar</button>
              <button onClick={() => lidarDeletar(item.id)} className="botao-deletar">Deletar</button>
            </div>
            

            </li>
          ))}
      </ul>
    </div>
  
  )
}
export default App
