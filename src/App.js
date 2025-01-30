import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  Navigate,
  Routes,
} from "react-router-dom";
import Login from "./Pages/Login/login";
import { auth } from "./config/firebase";
import Dashboard from "./Pages/dashboard";
import Signup from "./Pages/Login/Signup";
import Produtos from "./Pages/Produto";
import VendaList from "./Pages/Vendas";
import VendaForm from "./components/form/VendaForm";
import ProtectedRoute from "./config/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import ClienteForm from "./components/form/ClienteForm";
import ClienteList from "./Pages/Clientes";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <Signup />}
          />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rotas Protegidas com Navegação */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Navigation handleLogout={handleLogout} /> {/* Exibe a navegação apenas nas rotas protegidas */}
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute user={user}>
                <Navigation handleLogout={handleLogout} />
                <Produtos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendas"
            element={
              <ProtectedRoute user={user}>
                <Navigation handleLogout={handleLogout} />
                <VendaList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute user={user}>
                <Navigation handleLogout={handleLogout} />
                <ClienteList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-venda"
            element={
              <ProtectedRoute user={user}>
                <Navigation handleLogout={handleLogout} />
                <VendaForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
