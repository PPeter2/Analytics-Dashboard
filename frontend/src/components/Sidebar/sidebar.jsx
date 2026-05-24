import React from 'react'
import style from './sidebar.module.css'

function sidebar() {
  return (
    <section className={style.sidebar}>
        <h1>Analytics Dashboard</h1>
        <nav className={style.nav}>
            <ul>
               <li>
                <a href="#">Dashboard</a>
                <a href="#">Reports</a>
                <a href="#">Settings</a>
               </li>
            </ul>
        </nav>
    </section>
  )
}

export default sidebar