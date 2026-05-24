import React, { useState } from 'react' // 1. Προσθήκη useState για τα inputs
import { Link, useNavigate } from 'react-router-dom'
import style from './signup.module.css'

function Signup() {
  const navigate = useNavigate();

  // 2. State για την αποθήκευση των στοιχείων της φόρμας
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Για την εμφάνιση σφαλμάτων στην οθόνη

  const handleSubmit = async (e) => {
    e.preventDefault(); // Σταματάει το refresh της σελίδας
    setError(''); // Μηδενισμός παλιών σφαλμάτων

    try {
      // 3. Κλήση του API στο backend (χρησιμοποιούμε relative path για τον Nginx)
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Αν το backend επιστρέψει σφάλμα (π.χ. 400), το εμφανίζουμε (θα καταγραφεί και στα metrics!)
        throw new Error(data.error || 'Κάτι πήγε στραβά κατά την εγγραφή');
      }

      // 4. Αν η εγγραφή πετύχει, αποθηκεύουμε το token (αν επιστρέφει το signup) ή ανακατευθύνουμε στο login
      console.log('Επιτυχής εγγραφή:', data.message);
      
      // Προαιρετικά: Αν το signup κάνει αυτόματα login και επιστρέφει token, το σώζεις εδώ:
      // localStorage.setItem('userToken', data.token);
      
      // 5. Μεταφορά στη σελίδα σύνδεσης ή στο dashboard
      navigate('/login'); 
      
    } catch (err) {
      setError(err.message); // Εμφάνιση του μηνύματος σφάλματος στο χρήστη
    }
  }

  return (
    <section className={style.signupPage}>
        <div className={style.signupContainer}>
            <h1>Sign up</h1>
            <h2>Join us and start your journey!</h2>
            
            {/* Εμφάνιση σφάλματος αν υπάρχει */}
            {error && <div className={style.errorMessage}>{error}</div>}
            
            <form className={style.signupForm} onSubmit={handleSubmit}>
                {/* Το input του ονόματος μπορεί να μείνει αν το προσθέσεις αργότερα στη βάση */}
                <input type="text" placeholder='John Doe' />
                
                {/* 6. Σύνδεση των inputs με το React State */}
                <input 
                  type="email" 
                  placeholder='example@email.com' 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder='Secret Password' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <button type='submit'>Sign Up</button>
            </form>
            
            <p className={style.loginLink}>
              Have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    </section>
  )
}

export default Signup;
