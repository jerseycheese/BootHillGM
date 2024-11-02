export function debugStorage() {
  if (typeof window !== 'undefined') {
    console.log('Session Storage:', sessionStorage.getItem('initializing_new_character'));
    console.log('Local Storage:', localStorage.getItem('campaignState'));
    console.log('Last Created Character:', localStorage.getItem('lastCreatedCharacter'));
  }
}