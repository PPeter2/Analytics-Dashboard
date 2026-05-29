import React from 'react';
import style from './main-page.module.css';

function MainPage() {
  return (
    <div className={style.layoutContainer}>
      <main className={style.mainContent}>
        <h1>Welcome to your Dashboard</h1>
        <p>Εδώ θα μπουν τα charts και τα metrics σου...</p>
      </main>
    </div>
  );
}

export default MainPage;
