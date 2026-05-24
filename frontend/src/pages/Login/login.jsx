import React, { useState } from 'react' // 1. Προσθήκη useState για τα inputs και σφάλματα
import { Link, useNavigate } from 'react-router-dom' // 2. Εισαγωγή useNavigate για την ανακατεύθυνση
import style from '../Login/login.module.css'

function Login() { // 3. Αλλαγή σε κεφαλαίο "L" για να είναι σωστό React Component
  const navigate = useNavigate(); // Αρχικοποίηση του hook πλοήγησης

  // 4. State για τις τιμές της φόρμας και τα σφάλματα
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Σταματάει το refresh της σελίδας
    setError(''); // Μηδενισμός προηγούμενων σφαλμάτων

    try {
      // 5. Κλήση του API σύνδεσης στον Express server μέσω Nginx
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Αν τα στοιχεία είναι λάθος (400) ή υπάρξει σφάλμα (500), το εμφανίζουμε στην οθόνη
        throw new Error(data.error || 'Αποτυχία σύνδεσης');
      }

      // 6. Αποθήκευση του πραγματικού JWT Token στο localStorage
      localStorage.setItem('userToken', data.token);
      console.log('Επιτυχής σύνδεση:', data.message);

      // 7. Μεταφορά στην αρχική σελίδα / dashboard
      // (Άλλαξε το '/dashboard' στο path που έχεις ορίσει για την κεντρική σου σελίδα στο App.jsx)
      navigate('/dashboard'); 

    } catch (err) {
      setError(err.message); // Εμφάνιση "Λάθος στοιχεία σύνδεσης" κλπ
    }
  };

  return (
    <section className={style.loginPage}>
      <div className={style.loginContainer}>
        <h1>Login</h1>
        <h2>Welcome back!</h2>
        
        {/* Εμφάνιση μηνύματος σφάλματος αν αποτύχει η σύνδεση */}
        {error && <div className={style.errorMessage} style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        {/* 8. Σύνδεση της συνάρτησης handleSubmit με τη φόρμα */}
        <form className={style.loginForm} onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder='Email' 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder='Password' 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type='submit'>Login</button>
        </form>
        
        <p className={style.signupLink}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </section>
  )
}

export default Login; // 9. Εξαγωγή με κεφαλαίο "Login"
