// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardContainer from "./components/CardContainer";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<CardContainer title="PAA Pages" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
