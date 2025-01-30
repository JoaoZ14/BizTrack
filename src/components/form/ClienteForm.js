import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ClienteForm = () => {
  const { currentUser } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'clientes'), {
        nome,
        email,
        telefone,
        endereco,
        criadoEm: new Date(),
        usuarioId: currentUser.uid, // Vincula o cliente ao usuário logado
      });
      setSuccess('Cliente cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setTelefone('');
      setEndereco('');
    } catch (error) {
      setError('Erro ao cadastrar cliente: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Cadastrar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
        <button type="submit">Cadastrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default ClienteForm;