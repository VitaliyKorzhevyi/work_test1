import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Menu from './menu.jsx';
import ListEmail from './pages/ListEmail.jsx';
import Proxy from './pages/Proxy.jsx';
import Reserv from './pages/Reserv.jsx';
// import CheckEmail from './pages/CheckEmail.js';

import './menu.css';

function App() {
  return (
    <>
      <Menu />
      <div className="container">
        <Routes>
          <Route path="/" element={<ListEmail />} /> 
          <Route path="/contact" element={<Proxy />} />
          <Route path="/about" element={<Reserv />} />
          {/* <Route path="/check-email" element={<CheckEmail />} /> */}
        </Routes>
      </div>
    </>
  );
}

export default App;