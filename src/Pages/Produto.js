import React, { useEffect, useState } from "react";
import ProdutoForm from "../components/form/ProdutoForm";
import { deletarProduto, listarProdutos } from "../services/firebaseProdutos";

const ProdutoList = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const userId = localStorage.getItem('userId'); // Recupera o userId do localStorage


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
    <div>
      <h2>Lista de Produtos</h2>
      <ProdutoForm produtoAtual={produtoAtual} onProdutoSalvo={fetchProdutos} />
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>R$ {produto.preco}</td>
              <td>{produto.estoque}</td>
              <td>
                <button onClick={() => setProdutoAtual(produto)}>Editar</button>
                <button onClick={() => handleDelete(produto.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProdutoList;
