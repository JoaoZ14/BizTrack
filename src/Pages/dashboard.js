import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
 YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { db, auth } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { listarVendas } from '../services/firebaseVendas';
import { useAuth } from '../context/AuthContext';
import { listarProdutos } from '../services/firebaseProdutos';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  margin-left: 40px;
  background: #f5f6fa;
`;

const Sidebar = styled.div`
  width: 240px;
  background: #ffffff;
  padding: 30px 20px;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
`;

const MainContent = styled.div`
  flex: 1;
  padding: 40px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  h1 {
    font-size: 24px;
    color: #2c3e50;
    font-weight: 600;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  button {
    background: #4cd964;
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  h3 {
    color: #a3a6b9;
    font-size: 14px;
    margin-bottom: 10px;
    
  }

  ul{
    display: flex;
    flex-direction: column;
    gap: 5px;

    li{
      list-style: none;
      background-color:rgb(241, 241, 241);
      font-size: 12px;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
      border-radius: 16px;
      padding: 0px 10px;
      display: flex;
      align-items: center;
      gap: 5px;



      p{
        font-weight: bold;
        color: #2c3e50;
      }
    }

  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 15px;
  }

  .progress {
    height: 8px;
    background: #f0f1f5;
    border-radius: 4px;
    overflow: hidden;

    div {
      height: 100%;
      background: #4cd964;
      width: ${props => props.percentage}%;
    }
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;

  h2 {
    color: #2c3e50;
    margin-bottom: 25px;
  }
`;

const RecentSales = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  h2 {
    color: #2c3e50;
    margin-bottom: 25px;
  }
`;

const SalesList = styled.div`
  .sale-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .info {
      .product {
        font-weight: 600;
        color: #2c3e50;
      }
      .time {
        color: #a3a6b9;
        font-size: 12px;
      }
    }

    .amount {
      font-weight: 700;
      color: #4cd964;
    }
  }
`;

const Dashboard = () => {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Estado para abrir/fechar a sidebar
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth(); // Usar o contexto para pegar o usuário

  useEffect(() => {
    if (currentUser) {
      const fetchVendas = async () => {
        try {
          const vendasList = await listarVendas(currentUser.uid); // Passar o userId para listarVendas
          setVendas(vendasList);

          // Calcular o total de vendas
          const total = vendasList.reduce((acc, venda) => acc + venda.total, 0);
          setTotalVendas(total);

          // Calcular produtos mais vendidos
          const produtosVendidos = {};
          vendasList.forEach((venda) => {
            if (!produtosVendidos[venda.produtoId]) {
              produtosVendidos[venda.produtoId] = { total: 0, quantidade: 0 };
            }
            produtosVendidos[venda.produtoId].total += venda.total;
            produtosVendidos[venda.produtoId].quantidade += venda.quantidade;
          });

          const produtosMaisVendidosList = Object.entries(produtosVendidos)
            .map(([produtoId, data]) => ({
              produtoId,
              ...data,
            }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5);

          setProdutosMaisVendidos(produtosMaisVendidosList);
        } catch (error) {
          console.error('Erro ao buscar vendas:', error);
        }
      };

      const fetchProdutos = async () => {
        try {
          const produtosList = await listarProdutos();
          setProdutos(produtosList);
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        }
      };

      fetchProdutos();
      fetchVendas();
    }
  }, [currentUser]);

  // Preparar dados para o gráfico de vendas
  const salesData = vendas.map((venda) => ({
    name: venda.data
      ? new Date(venda.data.seconds * 1000).toLocaleDateString()
      : 'Data desconhecida',
    vendas: venda.total || 0,
  }));

  // Últimas transações
  const ultimasVendas = [...vendas]
    .sort((a, b) => (b.data?.seconds || 0) - (a.data?.seconds || 0))
    .slice(0, 5);

    const chartData = [
      { name: 'Jan', value: 24000 },
      { name: 'Fev', value: 35600 },
      { name: 'Mar', value: 42150 },
      { name: 'Abr', value: 38900 },
      { name: 'Mai', value: 46700 },
      { name: 'Jun', value: 53400 },
    ];

  return (
    <Container>

      <MainContent>
        <Header>
          <h1>Welcome Back, Mark Johnson</h1>
         {/* <UserInfo>
            <button>Pro Plan</button>
            <button onClick={handleLogout}>Logout</button>
          </UserInfo>*/}
        </Header>

        <StatsGrid>
          <StatCard percentage={60}>
            <h3>Total Vendas</h3>
            <div className="value">R$ {totalVendas.toFixed(2)}</div>
            <div className="progress">
              <div></div>
            </div>
          </StatCard>

          <StatCard percentage={40}>
            <h3>Monthly Sales</h3>
            <div className="value">$24,575</div>
            <div className="progress">
              <div></div>
            </div>
          </StatCard>

          <StatCard percentage={80}>
            <h3>Estoque de produtos</h3>
            <ul>
              {produtos.map((produto) => (
                <li key={produto.id}>
                  <p>{produto.nome}:</p> {produto.estoque || 0} unidades
                </li>
              ))}
            </ul>
          </StatCard>
        </StatsGrid>

        <ChartContainer>
          <h2>Grafico de Vendas</h2>
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
        </ChartContainer>

        <RecentSales>
          <h2>Ultimas Vendas</h2>
          <SalesList>
            {ultimasVendas.map((venda, index) => (
              <div className="sale-item" key={index}>
                <div className="info">
                  <div className="product">{venda.produtoId}</div>
                </div>
                <div className="amount">+R${venda.total.toFixed(2)}</div>
              </div>
            ))}
          </SalesList>
        </RecentSales>
      </MainContent>
    </Container>
  );
};

export default Dashboard;
