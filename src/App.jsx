import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./homepage";
import Chat from './Chat';
function App(){
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/chat" element={<Chat/>} />
      
    </Routes>
    </BrowserRouter>
   
  );
}
export default App;