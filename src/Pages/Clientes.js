import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import styled from 'styled-components';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Container = styled.div`
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

const ClienteForm = styled.form`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2980b9;
  }
`;

const ClienteListContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const ClienteCard = styled.div`
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

const ClienteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ClienteName = styled.span`
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 600;
`;

const ClienteContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const Loading = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const ClienteList = () => {
  const { currentUser } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const q = query(collection(db, 'clientes'), where('usuarioId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const clientesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(clientesData);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'clientes'), {
        nome,
        email,
        telefone,
        endereco,
        criadoEm: new Date(),
        usuarioId: currentUser.uid,
      });
      setSuccess('Cliente cadastrado com sucesso!');
      setClientes([...clientes, { nome, email, telefone, endereco }]);
      setNome('');
      setEmail('');
      setTelefone('');
      setEndereco('');
    } catch (error) {
      setError('Erro ao cadastrar cliente: ' + error.message);
    }
  };

  if (loading) return <Loading>Carregando clientes...</Loading>;

  return (
    <Container>
      <Header>
        <Title>Clientes</Title>
      </Header>

      <ClienteForm onSubmit={handleSubmit}>
        <Input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <Button type="submit">Cadastrar</Button>
      </ClienteForm>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <ClienteListContainer>
        {clientes.map((cliente) => (
          <ClienteCard key={cliente.id}>
            <ClienteHeader>
              <ClienteName>{cliente.nome}</ClienteName>
            </ClienteHeader>
            <ClienteContent>
              <InfoItem>
                <FiMail />
                <span>{cliente.email}</span>
              </InfoItem>
              <InfoItem>
                <FiPhone />
                <span>{cliente.telefone}</span>
              </InfoItem>
              <InfoItem>
                <FiMapPin />
                <span>{cliente.endereco}</span>
              </InfoItem>
            </ClienteContent>
          </ClienteCard>
        ))}
      </ClienteListContainer>
    </Container>
  );
};

export default ClienteList;