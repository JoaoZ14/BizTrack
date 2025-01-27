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

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <Router>
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

      {/* Rotas Protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtos"
        element={
          <ProtectedRoute user={user}>
            <Produtos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendas"
        element={
          <ProtectedRoute user={user}>
            <VendaList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrar-venda"
        element={
          <ProtectedRoute user={user}>
            <VendaForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
  );
};

export default App;
