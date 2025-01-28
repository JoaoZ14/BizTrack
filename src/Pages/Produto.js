import React, { useEffect, useState } from "react";
import ProdutoForm from "../components/form/ProdutoForm";
import { deletarProduto, listarProdutos } from "../services/firebaseProdutos";
import styled from "styled-components";

// Container para o componente
const ProdutoListContainer = styled.div`
  padding: 20px;
  background-color: #f4f4f9;
  margin-left: 40px;
`;

// Título da lista
const ListaTitulo = styled.h2`
  font-size: 24px;
  color: #34495e;
  margin-bottom: 20px;
`;

// Container para os cards
const ProdutoCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin-top: 100px;
  margin-bottom: 100px;

  justify-content: center;
`;

// Estilo para cada card de produto
const ProdutoCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 350px;  // Largura maior para o card horizontal
  display: flex;
  flex-direction: row;  // Alinha os itens na horizontal
  padding: 5px 20px;
  align-items: center;  // Alinha os itens verticalmente no centro
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

// Estilo para as informações do produto dentro do card
const ProdutoInfo = styled.div`
  margin-bottom: 2px;
  margin-left: 10px;
  width: 70%;
  
`;

const ProdutoNome = styled.h3`
  font-size: 18px;
  color: #34495e;
  margin-bottom: 2px;
`;

const ProdutoPreco = styled.p`
  font-size: 16px;
  color: #1c2833;
  margin-bottom: 2px;
`;

const ProdutoEstoque = styled.p`
  font-size: 14px;
  color: #7f8c8d;
`;

// Botões de ação
const AcoesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProdutoButtonEdit = styled.button`
  background-color: #3498db;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const ProdutoButtonDelete = styled.button`
  background-color:rgb(219, 52, 52);
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color:rgb(185, 41, 41);
  }
`;

const ProdutoList = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState(null);

  const fetchProdutos = async () => {
    const data = await listarProdutos();
    setProdutos(data);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este produto?")) {
      await deletarProduto(id);
      fetchProdutos();
    }
  };

  return (
    <ProdutoListContainer>
      <ListaTitulo>Lista de Produtos</ListaTitulo>
      <ProdutoForm produtoAtual={produtoAtual} onProdutoSalvo={fetchProdutos} />
      
      <ProdutoCardContainer>
        {produtos.map((produto) => (
          <ProdutoCard key={produto.id}>
            <ProdutoInfo>
              <ProdutoNome>{produto.nome}</ProdutoNome>
              <ProdutoPreco>R$ {produto.preco.toFixed(2)}</ProdutoPreco>
              <ProdutoEstoque>Estoque: {produto.estoque}</ProdutoEstoque>
            </ProdutoInfo>

            <AcoesContainer>
              <ProdutoButtonEdit onClick={() => setProdutoAtual(produto)}>Editar</ProdutoButtonEdit>
              <ProdutoButtonDelete onClick={() => handleDelete(produto.id)}>Excluir</ProdutoButtonDelete>
            </AcoesContainer>
          </ProdutoCard>
        ))}
      </ProdutoCardContainer>
    </ProdutoListContainer>
  );
};

export default ProdutoList;
