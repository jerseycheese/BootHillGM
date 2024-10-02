import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to BootHillGM</h1>
      <Link href="/character-creation" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Character
      </Link>
    </main>
  );
}