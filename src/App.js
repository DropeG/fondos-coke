// src/App.js
import React, { useState } from 'react';
import './App.css'
import FileUploader from './FileUploader';

const App = () => {
  return (
    <div>
      <h1 className='titulo'>ARCHIVOS EXCEL</h1>
      <FileUploader/>

    </div>
  );
};

export default App;
