import React from 'react'
import style from '../Login/login.module.css'
import { Link } from 'react-router-dom'

function login() {
  return (
    <section className={style.loginPage}>
        <div className={style.loginContainer}>
      <h1>Login</h1>
      <h2>Welcome back!</h2>
      <form className={style.loginForm}>
        <input type="email" placeholder='Email' required />
        <input type="password" placeholder='Password' required />
        <button type='submit'>Login</button>
      </form>
      <p className={style.signupLink}>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
    </section>
  )
}

export default login