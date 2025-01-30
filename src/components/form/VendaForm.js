import React, { useState, useEffect } from "react";
import { listarProdutos } from "../../services/firebaseProdutos";
import { registrarVenda } from "../../services/firebaseVendas";
import { useAuth } from "../../context/AuthContext";
import styled, { keyframes } from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { db } from "../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// 1. Primeiro declaramos todas as animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const FormContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
`;

const FormGroup = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const Label = styled.label`
    font-size: 16px;
    color: #34495e;
`;

const Input = styled.input`
    padding: 5px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 16px;
    outline: none;
    &:focus {
        border-color: #1c2833;
    }
`;

const Select = styled.select`
    padding: 5px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 16px;
    outline: none;
    &:focus {
        border-color: #1c2833;
    }
`;

const Button = styled.button`
    background-color: #3498db;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #2980b9;
    }
`;

const Total = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: #34495e;
`;

const ItemProduto = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin: 8px 0;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  animation: ${slideIn} 0.3s ease-out;

  &.item-exit-active {
    opacity: 0;
    transform: translateX(-20px);
    transition: all 0.3s ease-out;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
  margin-left: 10px;
`;

const BotoesControle = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const BotaoAnimado = styled(Button)`
  transition: transform 0.1s ease;
  
  &:active {
    transform: scale(0.95);
  }
`;

const BotaoSecundario = styled(Button)`
    background-color: #e74c3c;
    &:hover {
        background-color: #c0392b;
    }
`;

const BotaoPequeno = styled(Button)`
    padding: 3px 8px;
    font-size: 14px;
`;

const MensagemAviso = styled.div`
  color: #e67e22;
  font-size: 14px;
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const MensagemStatus = styled.div`
  padding: 15px;
  margin: 20px 0;
  border-radius: 8px;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
  background: ${props => props.tipo === 'sucesso' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.tipo === 'sucesso' ? '#155724' : '#721c24'};
`;

const GridForm = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 800px;
`;




const VendaForm = () => {
    const [produtos, setProdutos] = useState([]);
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState("");
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

    const [clientes, setClientes] = useState([]);
    const [mostrarAviso, setMostrarAviso] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensagemStatus, setMensagemStatus] = useState(null);
    const [clienteId, setClienteId] = useState("");
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const data = await listarProdutos();
                setProdutos(data);
            } catch (error) {
                console.error("Erro ao buscar produtos: ", error);
            }
        };

        const fetchClientes = async () => {
            const q = query(
                collection(db, "clientes"),
                where("usuarioId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const clientesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setClientes(clientesData);
        };

        fetchClientes();
        fetchProdutos();
    }, [currentUser.uid]);

    const adicionarProduto = (produtoId, quantidade) => {
        const produto = produtos.find((p) => p.id === produtoId);
        if (produto) {
            setProdutosSelecionados((prev) => [
                ...prev,
                { produtoId, quantidade, preco: produto.preco },
            ]);
        }
    };

    const removerProduto = (produtoId) => {
        setProdutosSelecionados((prev) =>
            prev.filter((item) => item.produtoId !== produtoId)
        );
    };

    const atualizarQuantidade = (produtoId, novaQuantidade) => {
        setProdutosSelecionados((prev) =>
            prev.map((item) =>
                item.produtoId === produtoId
                    ? { ...item, quantidade: novaQuantidade }
                    : item
            )
        );
    };

    const calcularTotal = () => {
        return produtosSelecionados.reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0
        );
    };



    const handleAdicionarProduto = () => {
      if (!produtoSelecionado || quantidadeSelecionada < 1) {
          setMostrarAviso(true);
          setTimeout(() => setMostrarAviso(false), 3000);
          return;
      }
      
      setMostrarAviso(false);
      adicionarProduto(produtoSelecionado, quantidadeSelecionada);
      setProdutoSelecionado("");
      setQuantidadeSelecionada(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await registrarVenda({
            clienteId,
            usuarioId: currentUser.uid,
            produtos: produtosSelecionados,
            total: calcularTotal(),
        });
        setMensagemStatus({ tipo: 'sucesso', texto: 'Venda registrada com sucesso!' });
        setTimeout(() => {
            setMensagemStatus(null);
        }, 1000);
    } catch (error) {
        console.error("Erro ao registrar venda:", error);
        setMensagemStatus({ tipo: 'erro', texto: 'Erro ao registrar venda. Tente novamente.' });
        setTimeout(() => setMensagemStatus(null), 3000);
    } finally {
        setIsSubmitting(false);
    }
};

    return (
      <form onSubmit={handleSubmit}>
      <FormContainer>
          <GridForm>
              <FormGroup>
                  <Label>Selecione o Cliente *</Label>
                  <Select
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      required
                      aria-label="Selecionar cliente"
                  >
                      <option value="">Selecione um cliente</option>
                      {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                          </option>
                      ))}
                  </Select>
              </FormGroup>

              <FormGroup>
                  <Label>Selecione o Produto *</Label>
                  <Select
                      value={produtoSelecionado}
                      onChange={(e) => setProdutoSelecionado(e.target.value)}
                      aria-label="Selecionar produto"
                  >
                      <option value="">Selecione um produto</option>
                      {produtos.map((produto) => (
                          <option key={produto.id} value={produto.id}>
                              {produto.nome} (R$ {produto.preco.toFixed(2)})
                          </option>
                      ))}
                  </Select>
              </FormGroup>

              <FormGroup>
                  <Label>Quantidade *</Label>
                  <Input
                      type="number"
                      min="1"
                      value={quantidadeSelecionada}
                      onChange={(e) => setQuantidadeSelecionada(Math.max(1, parseInt(e.target.value) || 1))}
                      aria-label="Quantidade do produto"
                  />
              </FormGroup>
          </GridForm>

          {mostrarAviso && (
              <MensagemAviso>
                  Selecione um produto e quantidade antes de adicionar!
              </MensagemAviso>
          )}

          <BotaoPequeno 
              type="button" 
              onClick={handleAdicionarProduto}
              disabled={!produtoSelecionado}
          >
              ➕ Adicionar Produto
          </BotaoPequeno>

          <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
    <TransitionGroup component={null}>
        {produtosSelecionados.map((item) => (
            <CSSTransition
                key={item.produtoId}
                timeout={300}
                classNames="item"
            >
                <ItemProduto>
                    <div style={{ flex: 1 }}>
                        <strong>
                            {produtos.find((p) => p.id === item.produtoId)?.nome}
                        </strong>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            R$ {item.preco.toFixed(2)} unidade
                        </div>
                    </div>
                    
                    <BotoesControle>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarQuantidade(
                                item.produtoId,
                                Math.max(1, parseInt(e.target.value) || 1)
                            )}
                            style={{ width: '70px' }}
                        />
                        <BotaoSecundario 
                            type="button"
                            onClick={() => removerProduto(item.produtoId)}
                        >
                            🗑️
                        </BotaoSecundario>
                    </BotoesControle>
                </ItemProduto>
            </CSSTransition>
        ))}
    </TransitionGroup>
</div>
         

          <Total style={{ margin: '20px 0', fontSize: '1.5em' }}>
              Total: R$ {calcularTotal().toFixed(2)}
          </Total>

          <Button 
              type="submit" 
              disabled={produtosSelecionados.length === 0}
              style={{ padding: '10px 30px', fontSize: '1.1em' }}
          >
              ✅ Registrar Venda
          </Button>
      </FormContainer>
  </form>
    );
};

export default VendaForm;