import React from 'react';
import './App.css';
import helo from './giphy.gif';
import helo1 from './ashish-high-resolution-logo-white-transparent.png';

const Loading = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-container">
        <img src={helo} className="first-image" alt="Main" />
      </div>
      <div className="loading-container">
        <img src={helo1} className="second-image" alt="Secondary" />
      </div>
    </div>
  );
};

export default Loading;
