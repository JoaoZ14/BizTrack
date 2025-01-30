import React, { useEffect, useState } from "react";
import ProdutoForm from "../components/form/ProdutoForm";
import { deletarProduto, listarProdutos } from "../services/firebaseProdutos";
import styled from "styled-components";
import { FaEdit, FaTag, FaTrash } from "react-icons/fa";
import { FiDollarSign, FiPackage } from "react-icons/fi";

const ProdutoListContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
`;

const ProdutoFormContainer = styled.div`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const ProdutoCardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const ProdutoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProdutoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProdutoName = styled.h3`
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
`;

const ProdutoContent = styled.div`
  display: grid;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg {
    color: #3498db;
  }
`;

const PrecoEstoqueContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProdutoPreco = styled.span`
  font-size: 1.1rem;
  color: #00b894;
  font-weight: 700;
`;

const ProdutoEstoque = styled.span`
  font-size: 0.9rem;
  color: #636e72;
  background: #f1f2f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
`;

const CategoryBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #0984e3;
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  width: fit-content;
`;

const AcoesContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  background-color: ${({ variant }) =>
    variant === "edit" ? "#74b9ff" : "#ff7675"};
  color: white;

  &:hover {
    background-color: ${({ variant }) =>
      variant === "edit" ? "#0984e3" : "#d63031"};
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.9rem;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
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
      <Header>
        <Title>Gerenciamento de Produtos</Title>
        <ProdutoForm
          produtoAtual={produtoAtual}
          onProdutoSalvo={() => {
            fetchProdutos();
            setProdutoAtual(null);
          }}
        />
      </Header>

      <ProdutoCardContainer>
        {produtos.map((produto) => (
          <ProdutoCard key={produto.id}>
            <ProdutoHeader>
              <ProdutoName>{produto.nome}</ProdutoName>
            </ProdutoHeader>
            <ProdutoContent>
              <PrecoEstoqueContainer>
                <InfoItem>
                  <FiDollarSign />
                  <ProdutoPreco>R$ {produto.preco.toFixed(2)}</ProdutoPreco>
                </InfoItem>
                <InfoItem>
                  <FiPackage />
                  <ProdutoEstoque>{produto.estoque} em estoque</ProdutoEstoque>
                </InfoItem>
              </PrecoEstoqueContainer>

              {produto.categoriaNome && (
                <CategoryBadge>
                  <FaTag />
                  {produto.categoriaNome}
                </CategoryBadge>
              )}
            </ProdutoContent>

            <AcoesContainer>
              <IconButton
                variant="edit"
                onClick={() => setProdutoAtual(produto)}
              >
                <FaEdit /> Editar
              </IconButton>

              <IconButton
                variant="delete"
                onClick={() => handleDelete(produto.id)}
              >
                <FaTrash /> Excluir
              </IconButton>
            </AcoesContainer>
          </ProdutoCard>
        ))}
      </ProdutoCardContainer>
    </ProdutoListContainer>
  );
};

export default ProdutoList;