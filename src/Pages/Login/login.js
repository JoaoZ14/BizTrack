import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      setError(formatFirebaseError(error));
    }
  };

  const formatFirebaseError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        return "Usuário não encontrado";
      case "auth/wrong-password":
        return "Senha incorreta";
      default:
        return "Erro ao fazer login";
    }
  };

  return (
    <Container>
      <Card>
        <Title>Login</Title>
        <Form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Entrar</Button>
          <SecondaryLink onClick={() => navigate("/reset-password")}>
            Esqueceu sua senha?
          </SecondaryLink>
          <SecondaryLink onClick={() => navigate("/signup")}>
            Ainda não tem uma conta? Clique aqui
          </SecondaryLink>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Card>
    </Container>
  );
};

export default Login;

// Estilização com Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
`;

const Card = styled.div`
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  text-align: center;
  margin: 1rem;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: #2d3436;
  letter-spacing: -0.5px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Input = styled.input`
  padding: 0.9rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8f9fa;

  &::placeholder {
    color: #adb5bd;
  }

  &:focus {
    border-color: #4dabf7;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.2);
    background: #ffffff;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 1rem;
  background: #4dabf7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #339af0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(77, 171, 247, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.8rem;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #ffd6d6;
`;

// Adicione este componente para links secundários
const SecondaryLink = styled.a`
  color: #6c757d;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #4dabf7;
    text-decoration: underline;
  }
`;
