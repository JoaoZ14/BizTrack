import React, { useEffect, useState } from "react";
import { listarVendas } from "../services/firebaseVendas";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const VendaList = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar vendas
  const fetchVendas = async (usuarioId) => {
    try {
      const data = await listarVendas(usuarioId); // Chama a função listarVendas com o usuário
      setVendas(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false); // Concluiu o carregamento
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchVendas(user.uid); // Passa o UID do usuário autenticado
      } else {
        console.error("Usuário não autenticado");
        setLoading(false); // Finaliza o loading caso não tenha usuário
      }
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar
  }, []);

  if (loading) {
    return <p>Carregando vendas...</p>;
  }

  return (
    <div>
      <h2>Vendas Registradas</h2>
      {vendas.length === 0 ? (
        <p>Nenhuma venda encontrada</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID da Venda</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.id}</td>
                <td>{venda.produtoId}</td>
                <td>{venda.quantidade}</td>
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
