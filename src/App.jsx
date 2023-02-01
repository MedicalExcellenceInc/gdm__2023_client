import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Starting from "./components/Starting";
import Main from "./components/Main";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Starting />} />
        <Route path="/:id" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
