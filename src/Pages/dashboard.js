import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db, auth } from '../config/firebase'; // Importando funções do Firebase
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;

  nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  a {
    color: white;
    text-decoration: none;
    font-size: 18px;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

const Overview = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
`;

const Card = styled.div`
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const GraphSection = styled.section`
  margin-top: 40px;
`;

const LogoutButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c0392b;
  }
`;

const Dashboard = () => {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const navigate = useNavigate();

  const user = auth.currentUser; // Usuário autenticado

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirecionar para login se o usuário não estiver autenticado
      return;
    }

    const fetchData = async () => {
      const userId = user.uid; // ID do usuário atual

      // Buscar vendas específicas do usuário no Firestore
      const vendasRef = collection(db, 'vendas');
      const vendasQuery = query(vendasRef, where('userId', '==', userId));
      const vendasSnapshot = await getDocs(vendasQuery);
      const vendasList = vendasSnapshot.docs.map((doc) => doc.data());
      setVendas(vendasList);

      // Buscar produtos específicos do usuário no Firestore
      const produtosRef = collection(db, 'produtos');
      const produtosQuery = query(produtosRef, where('userId', '==', userId));
      const produtosSnapshot = await getDocs(produtosQuery);
      const produtosList = produtosSnapshot.docs.map((doc) => doc.data());
      setProdutos(produtosList);

      // Calcular total de vendas
      const total = vendasList.reduce((acc, venda) => acc + venda.total, 0);
      setTotalVendas(total);

      setEstoque(produtosList);
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Fazer logout
      navigate('/login'); // Redirecionar para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Organizar os dados para o gráfico
  const salesData = vendas.map((venda) => ({
    name: new Date(venda.data).toLocaleDateString(),
    vendas: venda.total,
  }));

  // Encontrar os produtos mais vendidos
  const produtosMaisVendidos = produtos
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 5); // Limitar a 5 produtos mais vendidos

  // Últimas transações
  const ultimasVendas = vendas.slice(0, 5);

  return (
    <Container>
      <Sidebar>
        <nav>
          <Link to="/dashboard">Visão Geral</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/pedidos">Pedidos</Link>
          <Link to="/relatorios">Relatórios</Link>
          <Link to="/vendas">Vendas</Link>
          <Link to="/registrar-venda">Registrar Venda</Link>
        </nav>
        <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
      </Sidebar>
      <MainContent>
        <Header>
          <h1>Dashboard - Mercado XYZ</h1>
        </Header>
        <Overview>
          <Card>
            <h3>Total de Vendas</h3>
            <p>R$ {totalVendas}</p>
          </Card>
          <Card>
            <h3>Estoque Disponível</h3>
            <ul>
              {estoque.map((produto, index) => (
                <li key={index}>
                  {produto.nome}: {produto.estoque} unidades
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3>Últimas Transações</h3>
            <ul>
              {ultimasVendas.map((venda, index) => (
                <li key={index}>
                  {venda.produto} - R$ {venda.total}
                </li>
              ))}
            </ul>
          </Card>
        </Overview>

        <GraphSection>
          <h3>Gráfico de Vendas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vendas" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </GraphSection>

        <GraphSection>
          <h3>Produtos Mais Vendidos</h3>
          <ul>
            {produtosMaisVendidos.map((produto, index) => (
              <li key={index}>
                {produto.nome}: {produto.vendas} unidades
              </li>
            ))}
          </ul>
        </GraphSection>
      </MainContent>
    </Container>
  );
};

export default Dashboard;
