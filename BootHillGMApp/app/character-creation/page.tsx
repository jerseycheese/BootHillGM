'use client';

   import React, { useState, useEffect } from 'react';
   import { useGame } from '../utils/gameEngine';
   import { getCharacterCreationStep } from '../utils/aiService';

   // Character interface defines the structure of our character object
   interface Character {
     name: string;
     attributes: {
       strength: number;
       agility: number;
       intelligence: number;
     };
     skills: {
       shooting: number;
       riding: number;
       brawling: number;
     };
   }

   export default function CharacterCreation() {
     const { state, dispatch } = useGame();
     // Initialize character state with default values
     const [character, setCharacter] = useState<Character>({
       name: '',
       attributes: { strength: 0, agility: 0, intelligence: 0 },
       skills: { shooting: 0, riding: 0, brawling: 0 },
     });
     const [currentStep, setCurrentStep] = useState(0);
     const [aiPrompt, setAiPrompt] = useState('');
     const [userResponse, setUserResponse] = useState('');
     const [isLoading, setIsLoading] = useState(true);

     // Define steps based on character structure
     const steps = [
       { key: 'name', type: 'string' },
       ...Object.keys(character.attributes).map(attr => ({ key: attr, type: 'number' })),
       ...Object.keys(character.skills).map(skill => ({ key: skill, type: 'number' }))
     ];

     // Fetch new AI prompt when step changes or loading state is true
     useEffect(() => {
       if (isLoading) {
         getNextAIPrompt();
       }
     }, [currentStep, isLoading]);

     // Fetch AI prompt for the current step
     const getNextAIPrompt = async () => {
       try {
         const prompt = await getCharacterCreationStep(currentStep, steps[currentStep].key);
         setAiPrompt(prompt);
       } catch (error) {
         console.error('Error getting AI prompt:', error);
         setAiPrompt('An error occurred. Please try again.');
       } finally {
         setIsLoading(false);
       }
     };

     // Handle user input changes
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setUserResponse(e.target.value);
     };

     // Process form submission
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       updateCharacter();
       setUserResponse('');
       if (currentStep < steps.length - 1) {
         setCurrentStep(prev => prev + 1);
         setIsLoading(true);
       } else {
         finishCharacterCreation();
       }
     };

     // Update character state based on current step and user response
     const updateCharacter = () => {
       const { key, type } = steps[currentStep];
       const value = type === 'number' ? parseInt(userResponse) || 0 : userResponse;
       
       setCharacter(prev => {
         if (key === 'name') {
           return { ...prev, name: value as string };
         } else if (key in prev.attributes) {
           return { ...prev, attributes: { ...prev.attributes, [key]: value } };
         } else {
           return { ...prev, skills: { ...prev.skills, [key]: value } };
         }
       });
     };

     // Finalize character creation and update game state
     const finishCharacterCreation = () => {
       dispatch({ type: 'SET_CHARACTER', payload: character });
       // TODO: Add navigation to game session page
       console.log('Character created:', character);
     };

     // Render the character creation form
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Create Your Character</h1>
         <div className="mb-4">
           <p className="font-bold">Step {currentStep + 1}: {steps[currentStep].key}</p>
           {isLoading ? <p>Loading...</p> : <p>{aiPrompt}</p>}
         </div>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label htmlFor="userResponse" className="block mb-2">Your Response:</label>
             <input
               type={steps[currentStep].type}
               id="userResponse"
               value={userResponse}
               onChange={handleInputChange}
               className="w-full p-2 border rounded"
               required
             />
           </div>
           <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
             {currentStep < steps.length - 1 ? 'Next Step' : 'Finish Character Creation'}
           </button>
         </form>
       </div>
     );
   }