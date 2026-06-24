import React from 'react';
import style from './main-page.module.css';

function MainPage() {
  return (
    <div className={style.layoutContainer}>
      <main className={style.mainContent}>
        <h1>Welcome to your Dashboard</h1>
        <p>Charts..</p>
      </main>
    </div>
  );
}

export default MainPage;
