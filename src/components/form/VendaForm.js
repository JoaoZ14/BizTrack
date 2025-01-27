import React, { useState, useEffect } from "react";
import { listarProdutos } from "../../services/firebaseProdutos";
import { registrarVenda } from "../../services/firebaseVendas";

const VendaForm = ({ onVendaRegistrada }) => {
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState(0);
  const [total, setTotal] = useState(0);

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
      await registrarVenda({ produtoId, quantidade, total });
      // Aqui estamos chamando onVendaRegistrada corretamente
      if (typeof onVendaRegistrada === 'function') {
        onVendaRegistrada(); // Isso deve funcionar agora
      } else {
        console.error("onVendaRegistrada não é uma função");
      }
    } catch (error) {
      console.error("Erro ao registrar venda: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Produto</label>
        <select value={produtoId} onChange={handleProdutoChange} required>
          <option value="" disabled>Selecione um produto</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome} (R$ {produto.preco.toFixed(2)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Quantidade</label>
        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={handleQuantidadeChange}
          required
        />
      </div>
      <div>
        <strong>Total: R$ {total.toFixed(2)}</strong>
      </div>
      <button type="submit">Registrar Venda</button>
    </form>
  );
};

export default VendaForm;
