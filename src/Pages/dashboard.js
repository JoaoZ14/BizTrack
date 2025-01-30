import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  BarChart, // Substituir LineChart por BarChart
  Bar,      // Adicionar o componente Bar
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { db, auth } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { listarVendas } from '../services/firebaseVendas';
import { useAuth } from '../context/AuthContext';
import { listarProdutos } from '../services/firebaseProdutos';
import { atualizarMetasUsuario, buscarMetasUsuario } from '../services/firebaseUser';
import { listarCategorias } from '../services/firebaseCategorias';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  margin-left: 40px;
  background: #f5f6fa;
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

  .progress {
    height: 8px;
    background: #f0f1f5;
    border-radius: 4px;
    overflow: hidden;

  div {
      height: 100%;
      background: #4cd964;
      width: ${props => props.percentage}%;
      transition: width 0.3s ease;
    }
  }


  h3 {
    color: #a3a6b9;
    font-size: 14px;
    margin-bottom: 10px;
    
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 150px; /* Altura máxima */
    overflow-y: auto; /* Permite scroll vertical */
    padding-right: 10px; /* Espaço para o scroll */

    /* Estilização do scrollbar */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    li {
  list-style: none;
  background: linear-gradient(135deg, #fdfbfb,rgb(171, 211, 231));
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 3px 12px;
  display: flex;
  color: #2c3e50;

  align-items: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;




      p{
        color: #2c3e50;

        font-weight: bold;
      }
    }
    li:hover {
  background: linear-gradient(135deg,rgb(249, 251, 255),rgb(180, 240, 168));
  transform: translateY(-1px);
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
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Estado para abrir/fechar a sidebar
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth(); // Usar o contexto para pegar o usuário
  const [metaMensal, setMetaMensal] = useState(10000); // Valor padrão inicial
  const [timeFilter, setTimeFilter] = useState('monthly'); // daily, weekly, monthly, annual
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState([]); // Estado para armazenar as categorias


  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasList = await listarCategorias();
        setCategorias(categoriasList);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategorias();
  }, []);


  useEffect(() => {
    if (currentUser) {
      const fetchVendas = async () => {
        try {
          const vendasList = await listarVendas(currentUser.uid);
          setVendas(vendasList);

          const total = vendasList.reduce((acc, venda) => acc + venda.total, 0);
          setTotalVendas(total);

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
          setProdutosFiltrados(produtosList); // Inicialmente, todos os produtos são exibidos
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        }
      };

      fetchProdutos();
      fetchVendas();
    }
  }, [currentUser]);

  useEffect(() => {
    if (categoriaFiltro) {
      const filtered = produtos.filter(produto => produto.categoriaNome === categoriaFiltro);
      setProdutosFiltrados(filtered);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [categoriaFiltro, produtos]);

  const handleAtualizarMeta = async () => {
    if (!currentUser || !inputValue) return;

    try {
      const metasSalvas = await buscarMetasUsuario(currentUser.uid);
      const metaExistente = metasSalvas[timeFilter];

      await atualizarMetasUsuario(
        currentUser.uid,
        timeFilter,
        Number(inputValue),
        metaExistente?.id
      );

      // Atualiza estado local
      setMetas(prev => ({
        ...prev,
        [timeFilter]: Number(inputValue)
      }));
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  useEffect(() => {
    const carregarMetas = async () => {
      if (currentUser) {
        const metasSalvas = await buscarMetasUsuario(currentUser.uid);
        const formattedMetas = Object.entries(metasSalvas).reduce((acc, [tipo, meta]) => ({
          ...acc,
          [tipo]: meta.valor
        }), {});
        setMetas(formattedMetas);

        // Atualiza valor inicial do input
        setInputValue(formattedMetas[timeFilter] || '');
      }
    };
    carregarMetas();
  }, [currentUser, timeFilter]);

  const filterSalesByTime = (vendas, filter) => {
    const now = selectedDate; // Usar a data selecionada em vez de new Date()

    return vendas.filter(venda => {
      const saleDate = venda.dataVenda;
      if (!saleDate) return false;

      switch (filter) {
        case 'daily':
          return (
            saleDate.getDate() === now.getDate() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        case 'weekly':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);

          return saleDate >= startOfWeek && saleDate < endOfWeek;
        case 'monthly':
          return (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    });
  };
  const vendasFiltradas = filterSalesByTime(vendas, timeFilter);
  const totalFiltrado = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0);

  const groupDataByFilter = (vendas, filter) => {
    const grouped = {};
    const now = new Date();

    vendas.forEach(venda => {
      const date = venda.dataVenda;
      if (!date) return;

      let key, name;
      const year = date.getFullYear();
      const month = date.getMonth();

      switch (filter) {
        case 'daily':
          // Agrupar por hora do dia
          key = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          name = key;
          break;
        case 'weekly':
          // Agrupar por dia da semana
          key = date.toLocaleDateString('pt-BR', { weekday: 'short' });
          name = key;
          break;
        case 'monthly':
          // Agrupar por dia do mês
          key = date.getDate().toString();
          name = `Dia ${key}`;
          break;
        case 'annual':
          // Agrupar por mês/ano
          key = `${year}-${month}`;
          name = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          break;
        default:
          key = 'Geral';
          name = key;
      }

      if (!grouped[key]) {
        grouped[key] = {
          name,
          vendas: 0,
          date: new Date(date) // Mantém a data original para ordenação
        };
      }
      grouped[key].vendas += venda.total;
    });

    // Ordenar os dados conforme o período
    let sortedData = Object.values(grouped).sort((a, b) => a.date - b.date);

    // Preencher dados faltantes para períodos sem vendas
    if (filter === 'daily') {
      sortedData = fillMissingHours(sortedData, now);
    } else if (filter === 'monthly') {
      sortedData = fillMissingDays(sortedData, now);
    } else if (filter === 'annual') {
      sortedData = fillMissingMonths(sortedData);
    }

    return sortedData.map(item => ({
      name: item.name,
      vendas: item.vendas
    }));
  };

  // Funções auxiliares para preencher períodos sem vendas
  const fillMissingHours = (data, date) => {
    const filledData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      const found = data.find(d => d.name === `${hourStr}:00`);
      filledData.push(found || {
        name: `${hourStr}:00`,
        vendas: 0
      });
    }
    return filledData;
  };

  const fillMissingDays = (data, date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const filledData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const found = data.find(d => d.name === `Dia ${day}`);
      filledData.push(found || {
        name: `Dia ${day}`,
        vendas: 0
      });
    }
    return filledData;
  };

  const fillMissingMonths = (data) => {
    const months = [];
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      const found = data.find(d => d.name.includes(monthName));
      months.push(found || {
        name: `${monthName} ${currentYear}`,
        vendas: 0
      });
    }
    return months;
  };
  // Preparar dados para o gráfico de vendas
  const salesData = groupDataByFilter(vendasFiltradas, timeFilter);


  // Últimas transações
  const ultimasVendas = [...vendas]
    .sort((a, b) => b.dataVenda - a.dataVenda)
    .slice(0, 5);

  const chartData = [
    { name: 'Jan', value: 24000 },
    { name: 'Fev', value: 35600 },
    { name: 'Mar', value: 42150 },
    { name: 'Abr', value: 38900 },
    { name: 'Mai', value: 46700 },
    { name: 'Jun', value: 53400 },
  ];

  const [metas, setMetas] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    annual: 0
  });

  const porcentagem = metas[timeFilter] > 0
    ? (totalFiltrado / metas[timeFilter] * 100).toFixed(0)
    : 0;

  const getProductName = (productId) => {
    const produto = produtos.find(p => p.id === productId);
    return produto?.nome || 'Produto não encontrado';
  };

  return (
    <Container>

      <MainContent>
        <Header>
          <h1>Bem-vindo, {currentUser?.displayName || 'Usuário'}</h1>
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ marginRight: '10px' }}
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="annual">Anual</option>
            </select>

            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleAtualizarMeta}
              onKeyDown={(e) => e.key === 'Enter' && handleAtualizarMeta()}
              placeholder="Defina sua meta"
            />
          </div>
        </Header>
        <StatsGrid>
          <StatCard percentage={60}>
            <h3>Total Vendas</h3>
            <div className="value">R$ {totalVendas.toFixed(2)}</div>
            <div className="progress">
              <div></div>
            </div>
          </StatCard>

          <StatCard percentage={porcentagem}>
            <h3>Progresso de Vendas</h3>
            <div className="value">R$ {totalFiltrado.toFixed(2)}</div>
            <small>Meta: R$ {(metas[timeFilter] || 0).toFixed(2)}</small>
            <div className="progress">
              <div></div>
            </div>
          </StatCard>

          <StatCard percentage={80}>
            <h3>Estoque de produtos</h3>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              style={{ marginBottom: '10px', width: '100%', padding: '5px' }}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <ul>
              {produtosFiltrados.map((produto) => (
                <li key={produto.id}>
                  <p>{produto.nome}:</p> {produto.estoque || 0} unidades
                </li>
              ))}
            </ul>
          </StatCard>
        </StatsGrid>

        <ChartContainer>
          <h2>Gráfico de Vendas</h2>
          <ResponsiveContainer width="100%" height={300}>
            {timeFilter === 'annual' ? (
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar
                  dataKey="vendas"
                  fill="#4cd964"
                  radius={[4, 4, 0, 0]}
                  onClick={(data, index) => {
                    const monthDate = new Date(salesData[index].date);
                    setTimeFilter('monthly');
                    setSelectedDate(monthDate);
                  }}
                />
              </BarChart>
            ) : (
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vendas"
                  stroke="#4cd964"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>

        <RecentSales>
          <h2>Últimas Vendas</h2>
          <SalesList>
            {ultimasVendas.map((venda) => {
              const dataFormatada = venda.dataVenda.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div className="sale-item" key={venda.id}>
                  <div className="info">
                    <div className="product">
                      {venda.produtos?.map(p => getProductName(p.produtoId)).join(', ') || 'Produto não encontrado'}
                    </div>
                    <div className="time">{dataFormatada}</div>
                  </div>
                  <div className="amount">+R${venda?.total.toFixed(2)}</div>
                </div>
              );
            })}
          </SalesList>
        </RecentSales>
      </MainContent>
    </Container>
  );
};

export default Dashboard;
