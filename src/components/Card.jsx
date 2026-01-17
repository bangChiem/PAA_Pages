import React from 'react';
import './Card.css';

const Card = ({ imageUrl, caption, altText, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-image-container">
        <img 
          src={imageUrl} 
          alt={altText || caption} 
          className="card-image"
          loading="lazy"
        />
      </div>
      <div className="card-caption">
        <p>{caption}</p>
      </div>
    </div>
  );
};

export default Card;