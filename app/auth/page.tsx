'use client';

import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <AuthForm />
    </div>
  );
}
