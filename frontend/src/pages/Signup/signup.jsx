import React from 'react'
import { Link, useNavigate } from 'react-router-dom' // 1. Εισαγωγή Link και useNavigate
import style from './signup.module.css'
import MainPage from '../../pages/Main/main-page.jsx' // 2. Εισαγωγή του MainPage για πλοήγηση μετά την εγγραφή

function Signup() { // Κεφαλαίο "S" για τα React components
  const navigate = useNavigate() // 2. Αρχικοποίηση του hook πλοήγησης

  const handleSubmit = (e) => {
    e.preventDefault() // Σταματάει το refresh της σελίδας

    // 3. Αποθήκευση του token για να περάσει το ProtectedRoute
    localStorage.setItem('userToken', 'active_session_token')

    // 4. Μεταφορά στο main/dashboard (Βάλε το path ακριβώς όπως το έχεις στο App.jsx)
    navigate('/dashboard'); 
  }

  return (
    <section className={style.signupPage}>
        <div className={style.signupContainer}>
            <h1>Sign up</h1>
            <h2>Join us and start your journey!</h2>
            
            {/* 5. Σύνδεση της συνάρτησης handleSubmit με τη φόρμα */}
            <form className={style.signupForm} onSubmit={handleSubmit}>
                <input type="text" placeholder='John Doe' required/>
                <input type="email" placeholder='example@email.com' required/>
                <input type="password" placeholder='Secret Password' required/>
                <button type='submit'>Sign Up</button>
            </form>
            
            {/* 6. Χρήση του Link αντί για <a> για smooth πλοήγηση */}
            <p className={style.loginLink}>
              Have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    </section>
  )
}

export default Signup
