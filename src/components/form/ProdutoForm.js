import React, { useState } from "react";
import { criarProduto, atualizarProduto } from "../../services/firebaseProdutos";
import { getAuth } from "firebase/auth";

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
      <div>
        <label>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={carregando}
        />
      </div>
      <div>
        <label>Preço</label>
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
          min="0"
          step="0.01"
          disabled={carregando}
        />
      </div>
      <div>
        <label>Estoque</label>
        <input
          type="number"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
          required
          min="0"
          disabled={carregando}
        />
      </div>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <button type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : produtoAtual ? "Atualizar" : "Criar"} Produto
      </button>
      <button type="button" onClick={onCancel} disabled={carregando}>
        Cancelar
      </button>
    </form>
  );
};

export default ProdutoForm;
