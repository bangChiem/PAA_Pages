// components/CardContainer.js
import React from 'react';
import Card from './Card';
import './CardContainer.css';

const CardContainer = ({ cards, title }) => {
  return (
    <div className="card-container-wrapper">
      {title && <h2 className="container-title">{title}</h2>}
      <div className="card-container">
        {cards.map((card, index) => (
          <Card
            key={index}
            imageUrl={card.imageUrl}
            caption={card.caption}
            altText={card.altText}
            onClick={card.onClick}
          />
        ))}
      </div>
    </div>
  );
};

// Default props
CardContainer.defaultProps = {
  cards: [],
  title: ''
};

export default CardContainer;