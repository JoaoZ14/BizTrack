import React, { useEffect, useState } from "react";
import { listarVendas } from "../services/firebaseVendas";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch, FiShoppingBag, FiCalendar, FiDollarSign, FiUser } from "react-icons/fi";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

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

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  input {
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    width: 200px;
  }
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
  }
`;

const DateFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  .react-datepicker-wrapper {
    width: 120px;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
  }
`;

const VendaListContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const VendaCard = styled.div`
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

const VendaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const VendaId = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const VendaContent = styled.div`
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

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  svg {
    color: #27ae60;
  }
`;
const VendaList = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchVendas = async (usuarioId) => {
    try {
      const data = await listarVendas(usuarioId);
      setVendas(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.produtos.some(p => p.produtoId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const saleDate = venda.dataVenda ? new Date(venda.dataVenda) : new Date();
    const matchesDate = (!startDate || saleDate >= startDate) && 
                       (!endDate || saleDate <= endDate);
    
    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    const fetchClientes = async (usuarioId) => {
      const q = query(
        collection(db, "clientes"),
        where("usuarioId", "==", usuarioId)
      );
      const querySnapshot = await getDocs(q);
      const clientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
    };

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) fetchClientes(user.uid);
    });
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchVendas(user.uid);
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getNomeCliente = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : "Cliente não encontrado";
  };
  

  if (loading) return <Loading>Carregando vendas...</Loading>;

  return (
    <Container>
      <Header>
        <Title>Histórico de Vendas</Title>
        <Filters>
          <SearchInput>
            <FiSearch />
            <input
              type="text"
              placeholder="Pesquisar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
          
          <DateFilter>
            <FiCalendar />
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Data inicial"
              dateFormat="dd/MM/yyyy"
            />
            <span>-</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="Data final"
              dateFormat="dd/MM/yyyy"
            />
          </DateFilter>
        </Filters>
      </Header>

      {filteredVendas.length === 0 ? (
        <EmptyState>
          <FiShoppingBag />
          <p>Nenhuma venda encontrada</p>
        </EmptyState>
      ) : (
        <VendaListContainer>
          {filteredVendas.map((venda) => (
            <VendaCard key={venda.id}>
              <VendaHeader>
                <VendaId>#{venda.id.slice(0, 8)}</VendaId>
                <div>
                  {venda.dataVenda && new Date(venda.dataVenda.seconds * 1000).toLocaleDateString()}
                </div>
              </VendaHeader>
              
              <VendaContent>
              <InfoItem>
  <FiUser />
  <div>
    <strong>Cliente</strong>
    <ClientInfo>
      <FiUser size={14} />
      <span>{getNomeCliente(venda.clienteId)}</span>
    </ClientInfo>
  </div>
</InfoItem>
                <InfoItem>
                  <FiShoppingBag />
                  <div>
                    <strong>Produtos</strong>
                    <ProductList>
                      {venda.produtos.map((produto, index) => (
                        <li key={index}>
                          <span>{produto.produtoId}</span>
                          <span>x{produto.quantidade}</span>
                        </li>
                      ))}
                    </ProductList>
                  </div>
                </InfoItem>

                <InfoItem>
                  <FiDollarSign />
                  <div>
                    <strong>Total</strong>
                    <div>R$ {venda.total.toFixed(2)}</div>
                  </div>
                </InfoItem>

                <InfoItem>
                  <FiCalendar />
                  <div>
                    <strong>Data/Hora</strong>
                    <div>
                      {venda.dataVenda
                        ? new Date(venda.dataVenda.seconds * 1000).toLocaleString()
                        : "N/D"}
                    </div>
                  </div>
                </InfoItem>
              </VendaContent>
            </VendaCard>
          ))}
        </VendaListContainer>
      )}
    </Container>
  );
};

export default VendaList;