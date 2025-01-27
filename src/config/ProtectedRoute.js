import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // Redireciona para login se o usuário não está autenticado
    return <Navigate to="/login" replace />;
  }

  // Renderiza o componente filho se autenticado
  return children;
};

export default ProtectedRoute;
