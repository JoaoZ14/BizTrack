import React, { useState, useEffect, useContext } from "react";
import { listarProdutos } from "../../services/firebaseProdutos";
import { registrarVenda } from "../../services/firebaseVendas";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";


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

const VendaForm = ({ onVendaRegistrada }) => {
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState(0);
  const [total, setTotal] = useState(0);
  const { currentUser } = useAuth(); // Use o hook useAuth


  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const data = await listarProdutos();
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
      }
    };
    fetchProdutos();
  }, []);

  const handleProdutoChange = (e) => {
    const produtoSelecionado = produtos.find((p) => p.id === e.target.value);
    setProdutoId(produtoSelecionado.id);
    setPreco(produtoSelecionado.preco);
    setTotal(produtoSelecionado.preco * quantidade);
  };

  const handleQuantidadeChange = (e) => {
    const novaQuantidade = e.target.value;
    setQuantidade(novaQuantidade);
    setTotal(preco * novaQuantidade);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registrarVenda({ 
        produtoId, 
        quantidade, 
        total,
        usuarioId: currentUser.uid // Adicionar o ID do usuário logado
      });
      
      if (typeof onVendaRegistrada === 'function') {
        onVendaRegistrada();
      }
    } catch (error) {
      console.error("Erro ao registrar venda: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        <FormGroup>
          <Label>Produto</Label>
          <Select value={produtoId} onChange={handleProdutoChange} required>
            <option value="" disabled>Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} (R$ {produto.preco.toFixed(2)})
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={quantidade}
            onChange={handleQuantidadeChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Total>Total: R$ {total.toFixed(2)}</Total>
        </FormGroup>

        <FormGroup>
          <Button type="submit">Registrar Venda</Button>
        </FormGroup>
      </FormContainer>
    </form>
  );
};

export default VendaForm;
