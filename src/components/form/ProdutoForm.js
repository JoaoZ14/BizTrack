import React, { useEffect, useState } from "react";
import { criarProduto, atualizarProduto } from "../../services/firebaseProdutos";
import { getAuth } from "firebase/auth";
import styled from "styled-components";
import { listarCategorias } from "../../services/firebaseCategorias";
import CategoryForm from "./CategoriaForm";

const ProdutoFormContainer = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const ProdutoFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProdutoLabel = styled.label`
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
`;

const ProdutoInput = styled.input`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3498db;
  }
`;

const CategorySelect = styled.select`
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3498db;
  }
`;

const ProdutoButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const AddCategoryButton = styled.button`
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #219a52;
  }
`;

const ProdutoError = styled.p`
  color: #e74c3c;
  font-size: 12px;
  margin: 0;
`;

const ProdutoForm = ({ produtoAtual, onProdutoSalvo, onCancel }) => {
  const [nome, setNome] = useState(produtoAtual?.nome || "");
  const [preco, setPreco] = useState(produtoAtual?.preco || 0);
  const [estoque, setEstoque] = useState(produtoAtual?.estoque || 0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(produtoAtual?.categoriaId || "");

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const categorias = await listarCategorias();
        setCategorias(categorias);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    carregarCategorias();
  }, []);

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
      categoriaId,
      categoriaNome: categorias.find((c) => c.id === categoriaId)?.nome || "",
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
    <ProdutoFormContainer onSubmit={handleSubmit}>
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
        <ProdutoLabel>Categoria</ProdutoLabel>
        <CategorySelect
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </CategorySelect>
      </ProdutoFormGroup>

      {showCategoryForm && (
        <CategoryForm
          onClose={() => setShowCategoryForm(false)}
          onCategoriaCriada={async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const novasCategorias = await listarCategorias(user.uid);
            setCategorias(novasCategorias);
          }}
        />
      )}

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
        <ProdutoButton type="button" onClick={onCancel} disabled={carregando}>
          Cancelar
        </ProdutoButton>
      </ProdutoFormGroup>
    </ProdutoFormContainer>
  );
};

export default ProdutoForm;