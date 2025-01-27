import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const NavBar = styled.div`
  text-align: center;
  position: fixed;
  height: 80px;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(33, 33, 33, 0.95);
  z-index: 20;

  @media (max-width: 768px) {
    justify-content: space-around;
  }
`;

const Logo = styled.h1`
  font-family: Georgia, serif;
  font-size: 40px;

  img {
    width: 60px;
  }
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 50px;
  font-family: Times, Times New Roman, serif;
  text-align: center;
  font-size: 20px;
  font-weight: 100;

  a {
    text-decoration: none;
    color: white;
  }

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")}; /* Esconde/mostra no dropdown */
    position: absolute;
    top: 60px;
    right: 0;
    background-color: rgba(33, 33, 33, 0.95);
    width: 100%;
    text-align: center;
    padding: 20px 0;

    li {
      margin: 10px 0;
    }
  }
`;

const Hamburger = styled.div`
  display: none; /* Esconde o botão de hambúrguer no desktop */

  @media (max-width: 768px) {
    display: block;
    cursor: pointer;
  }

  div {
    width: 25px;
    height: 3px;
    background-color: white;
    margin: 5px 0;
    transition: 0.4s;
  }
`;

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);


  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <NavBar ref={navRef}>
      <Logo>
        <a href="#home">
          <img src="J (1)-Photoroom.png" alt="Logo" />
        </a>
      </Logo>
      <Hamburger onClick={toggleMenu}>
        <div />
        <div />
        <div />
      </Hamburger>
      <NavLinks isOpen={isOpen}>
        <li>
          <a href="#about">Sobre</a>
        </li>
        <li>
          <a href="#projects">Projetos</a>
        </li>
        <li>
          <a href="#contact">Contato</a>
        </li>
      </NavLinks>
    </NavBar>
  );
};

export default Navigation;
