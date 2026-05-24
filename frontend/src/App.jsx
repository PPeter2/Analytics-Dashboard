import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom' // 1. Εισαγωγή του Router
import './App.css'
import Signup from '../src/pages/Signup/signup.jsx'
import Login from '../src/pages/Login/login.jsx'
import MainPage from '../src/pages/Main/MainPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App