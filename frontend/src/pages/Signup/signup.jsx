import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import style from './signup.module.css'

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something when wrong while creating account');
      }
      console.log('Succefully created account', data.message);
      navigate('/login'); 
      
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className={style.signupPage}>
        <div className={style.signupContainer}>
            <h1>Sign up</h1>
            <h2>Join us and start your journey!</h2>
            {error && <div className={style.errorMessage}>{error}</div>}
            
            <form className={style.signupForm} onSubmit={handleSubmit}>
                <input type="text" placeholder='John Doe' />
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
