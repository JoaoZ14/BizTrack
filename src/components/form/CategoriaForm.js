import React, { useState } from "react";
import { criarCategoria } from "../../services/firebaseCategorias";
import { getAuth } from "firebase/auth";
import styled from "styled-components";

const CategoryPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const CategoryForm = ({ onClose, onCategoriaCriada }) => {
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      setErro("O nome da categoria é obrigatório");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setErro("Usuário não autenticado");
      return;
    }
  
    setCarregando(true);
    
    try {
        console.log("Dados enviados:", {
          nome: nome.trim(),
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        
        await criarCategoria({
          nome: nome.trim(),
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        
        // ... resto do código
      } catch (error) {
        console.error("Erro completo:", error);
        setErro(error.message);
      }
  };
  return (
    <CategoryPopup>
      <h3>Nova Categoria</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da categoria"
        />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <div style={{ marginTop: '10px' }}>
          <button type="submit" disabled={carregando}>
            {carregando ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancelar
          </button>
        </div>
      </form>
    </CategoryPopup>
  );
};

export default CategoryForm;