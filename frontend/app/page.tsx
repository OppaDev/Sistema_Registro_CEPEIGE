// app/page.tsx

import RegisterForm from '@/components/RegisterForm';

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <RegisterForm />
    </main>
  );
}