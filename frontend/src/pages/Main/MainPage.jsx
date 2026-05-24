import React from 'react';
import Sidebar from '../../components/Sidebar/sidebar'; // Σωστό import του Sidebar σου
import style from './main-page.module.css';

function MainPage() {
  return (
    <div className={style.layoutContainer}>
      {/* Το Sidebar μένει σταθερά αριστερά */}
      <Sidebar />
      
      {/* Το κύριο περιεχόμενο ξεκινάει ΜΕΤΑ τα 260px του sidebar */}
      <main className={style.mainContent}>
        <h1>Welcome to your Dashboard</h1>
        <p>Εδώ θα μπουν τα charts και τα metrics σου...</p>
      </main>
    </div>
  );
}

export default MainPage;
