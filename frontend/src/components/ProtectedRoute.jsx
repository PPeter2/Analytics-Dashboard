import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Ελέγχει αν υπάρχει το token σύνδεσης στο localStorage
  const isAuthenticated = localStorage.getItem('userToken'); 

  // Αν δεν είναι συνδεδεμένος, τον στέλνει στο /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Αν είναι συνδεδεμένος, του επιτρέπει να δει τη σελίδα
  return children;
};

export default ProtectedRoute;
