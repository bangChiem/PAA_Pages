// App.js
import React from 'react';
import CardContainer from './components/CardContainer';
import cardData from './data/cardData.json';
import './App.css';

function App() {
  return (
    <div className="App">
      <CardContainer 
        cards={cardData.cards} 
        title="PAA Pages"
      />
    </div>
  );
}

export default App;