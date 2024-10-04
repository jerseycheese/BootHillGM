export interface Character {
  name: string;
  attributes: {
    speed: number;
    gunAccuracy: number;
    throwingAccuracy: number;
    strength: number;
    bravery: number;
    experience: number;
  };
  skills: {
    shooting: number;
    riding: number;
    brawling: number;
  };
}