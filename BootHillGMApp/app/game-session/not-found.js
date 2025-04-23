// app/game-session/not-found.js
// This file prevents the Next.js build process from attempting to statically generate 
// the game-session page during build time

export default function NotFound() {
  return {
    notFound: true
  };
}
