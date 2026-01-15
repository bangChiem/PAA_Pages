import React, { useEffect, useState } from "react";
import Card from "./Card";
import "./CardContainer.css";

const CardContainer = ({ title }) => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card-container-wrapper">
      {title && <h2 className="container-title">{title}</h2>}
      <div className="card-container">
        {cards.map((card) => (
          <Card
            key={card.id}
            imageUrl={card.imageUrl}
            caption={card.caption}
            altText={card.altText}
          />
        ))}
      </div>
    </div>
  );
};

export default CardContainer;
