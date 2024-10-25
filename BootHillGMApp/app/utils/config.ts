export const getEnvConfig = () => {
  return {
    GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  };
};
