import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
