'use client';

   import React, { useState } from 'react';
   import { useGame } from '../utils/gameEngine';

   export default function CharacterCreation() {
     // Access the game state and dispatch function from our game engine
     const { state, dispatch } = useGame();
     // Local state for the character name input
     const [characterName, setCharacterName] = useState('');

     // Handle form submission
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       // Update the game state with the new character name
       dispatch({ type: 'SET_PLAYER', payload: characterName });
       // TODO: Add navigation to game session page
     };

     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Create Your Character</h1>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label htmlFor="characterName" className="block mb-2">Character Name:</label>
             <input
               type="text"
               id="characterName"
               value={characterName}
               onChange={(e) => setCharacterName(e.target.value)}
               className="w-full p-2 border rounded"
               required
             />
           </div>
           <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
             Create Character
           </button>
         </form>
       </div>
     );
   }