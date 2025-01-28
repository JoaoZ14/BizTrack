// components/Navigation.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaTachometerAlt, FaBox, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa'; // Importando ícones

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.isOpen ? '0' : '-240px')};  /* Controla a visibilidade da barra */
  width: 240px;
  height: 100vh;
  background-color: #1c2833;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  z-index: 1000;
  transition: left 0.3s ease;  /* Anima a transição de abertura e fechamento */
  
  /* Quando o mouse passar por cima, abrir a barra */
  &:hover {
    left: 0;  /* Barra se abre quando o mouse está sobre ela */
  }
`;

const MainContent = styled.div`
  margin-left: ${(props) => (props.sidebarOpen ? '240px' : '0')};  /* Ajusta o conteúdo conforme a barra lateral */
  padding: 20px;
  transition: margin-left 0.3s ease;
`;

const NavLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LinkStyled = styled(Link)`
  color: #dcdcdc;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 10px 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    background-color: #34495e;
    color: #fff;
  }
`;

const LogoutButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 50px;
  cursor: pointer;
  align-self: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;

const Navigation = ({ handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false); // Barra começa fechada

  return (
    <>
      <Sidebar isOpen={isOpen}>
        <NavLinks>
          <LinkStyled to="/dashboard">
            <FaTachometerAlt /> Visão Geral
          </LinkStyled>
          <LinkStyled to="/produtos">
            <FaBox /> Produtos
          </LinkStyled>
          <LinkStyled to="/vendas">
            <FaShoppingCart /> Vendas
          </LinkStyled>
          <LinkStyled to="/registrar-venda">
            <FaBox /> Registrar Venda
          </LinkStyled>
        </NavLinks>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </LogoutButton>
      </Sidebar>

      <MainContent sidebarOpen={isOpen}>
        {/* Aqui você pode renderizar o conteúdo principal das páginas */}
      </MainContent>
    </>
  );
};

export default Navigation;
