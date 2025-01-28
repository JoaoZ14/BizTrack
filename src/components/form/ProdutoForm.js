import React, { useState } from "react";
import { criarProduto, atualizarProduto } from "../../services/firebaseProdutos";
import { getAuth } from "firebase/auth";
import styled from "styled-components";

const ProdutoFormContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const ProdutoFormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProdutoLabel = styled.label`
  font-size: 16px;
  color: #34495e;
`;

const ProdutoInput = styled.input`
  padding: 5px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 16px;
  outline: none;
  &:focus {
    border-color: #1c2833;
  }
`;

const ProdutoButton = styled.button`
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

const ProdutoError = styled.p`
  color: red;
  font-size: 14px;
`;


const ProdutoForm = ({ produtoAtual, onProdutoSalvo, onCancel }) => {
  const [nome, setNome] = useState(produtoAtual?.nome || "");
  const [preco, setPreco] = useState(produtoAtual?.preco || 0);
  const [estoque, setEstoque] = useState(produtoAtual?.estoque || 0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validação extra
    if (preco <= 0 || estoque < 0) {
      setErro("Preço deve ser maior que zero e estoque não pode ser negativo.");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setErro("Erro: Usuário não autenticado. Faça login novamente.");
      return;
    }
  
    const userId = user.uid; // Obtém o ID do usuário autenticado
    const novoProduto = {
      nome: nome.trim(),
      preco: parseFloat(preco),
      estoque: parseInt(estoque),
      userId, // Adiciona o userId
      createdAt: produtoAtual?.createdAt || new Date().toISOString(), // Usa data atual para novos produtos
    };
  
    setCarregando(true);
    setErro("");
  
    try {
      if (produtoAtual?.id) {
        // Atualizar produto existente
        await atualizarProduto(produtoAtual.id, novoProduto);
      } else {
        // Criar novo produto
        await criarProduto(novoProduto);
      }
      onProdutoSalvo(); // Callback para atualizar a lista
    } catch (error) {
      console.error("Erro ao salvar produto: ", error);
      setErro("Ocorreu um erro ao salvar o produto. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <ProdutoFormContainer>
      <ProdutoFormGroup>
        <ProdutoLabel>Nome</ProdutoLabel>
        <ProdutoInput
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={carregando}
        />
      </ProdutoFormGroup>

      <ProdutoFormGroup>
        <ProdutoLabel>Preço</ProdutoLabel>
        <ProdutoInput
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
          min="0"
          step="0.01"
          disabled={carregando}
        />
      </ProdutoFormGroup>

      <ProdutoFormGroup>
        <ProdutoLabel>Estoque</ProdutoLabel>
        <ProdutoInput
          type="number"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
          required
          min="0"
          disabled={carregando}
        />
      </ProdutoFormGroup>

      {erro && <ProdutoError>{erro}</ProdutoError>}

      <ProdutoFormGroup>
        <ProdutoButton type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : produtoAtual ? "Atualizar" : "Criar"} Produto
        </ProdutoButton>
      </ProdutoFormGroup>

      <ProdutoFormGroup>
        <ProdutoButton type="button" onClick={onCancel} disabled={carregando}>
          Cancelar
        </ProdutoButton>
      </ProdutoFormGroup>
    </ProdutoFormContainer>
  </form>
  );
};

export default ProdutoForm;
