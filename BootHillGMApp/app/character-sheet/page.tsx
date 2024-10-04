'use client';

import { useGame } from '../utils/gameEngine';

export default function CharacterSheet() {
  const { state } = useGame();
  const { character } = state;

  if (!character) {
    return <div className="wireframe-container">No character found. Please create a character first.</div>;
  }

  return (
    <div className="wireframe-container">
      <h1 className="wireframe-title">Character Sheet</h1>
      <div className="wireframe-section">
        <h2 className="wireframe-subtitle">Name: {character.name}</h2>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Attributes</h3>
        <ul className="wireframe-list">
          {Object.entries(character.attributes).map(([key, value]) => (
            <li key={key} className="wireframe-text">
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="wireframe-section">
        <h3 className="wireframe-subtitle">Skills</h3>
        <ul className="wireframe-list">
          {Object.entries(character.skills).map(([key, value]) => (
            <li key={key} className="wireframe-text">
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}