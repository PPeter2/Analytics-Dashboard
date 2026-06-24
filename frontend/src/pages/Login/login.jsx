import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import style from '../Login/login.module.css'

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fail to login');
      }
      localStorage.setItem('userToken', data.token);
      console.log('Succefully logged in:', data.message);
      navigate('/dashboard'); 

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className={style.loginPage}>
      <div className={style.loginContainer}>
        <h1>Login</h1>
        <h2>Welcome back!</h2>
        {error && <div className={style.errorMessage} style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
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

export default Login;
