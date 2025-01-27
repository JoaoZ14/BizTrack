import React, { useEffect, useState } from "react";
import { listarVendas, listarVendasPorUsuario } from "../services/firebaseVendas";
import { listarProdutos } from "../services/firebaseProdutos"; // Supondo que exista uma função listarProdutos


const VendaList = ({ userId }) => {
    const [vendas, setVendas] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchVendas = async () => {
      try {
        const data = await listarVendasPorUsuario(userId);
        setVendas(data);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      }
    };
  
    const fetchProdutos = async () => {
      try {
        const data = await listarProdutos();
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
  
    // UseEffect para carregar as vendas e produtos assim que o userId estiver disponível
    useEffect(() => {
      if (userId) {
        fetchVendas();
        fetchProdutos();
      }
    }, [userId]);
  
    const getProdutoNome = (produtoId) => {
      const produto = produtos.find((p) => p.id === produtoId);
      return produto ? produto.nome : "Produto não encontrado";
    };
  
    return (
      <div>
        <h2>Vendas Registradas</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id}>
                  <td>{getProdutoNome(venda.produtoId)}</td>
                  <td>{venda.quantidade}</td>
                  <td>{venda?.cliente?.nome || "Cliente desconhecido"}</td>
                  <td>R$ {venda.total.toFixed(2)}</td>
                  <td>
                    {venda.dataVenda
                      ? new Date(venda.dataVenda.seconds * 1000).toLocaleString()
                      : "Data não disponível"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

export default VendaList;
