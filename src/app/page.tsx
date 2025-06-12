'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoginPage from '@/components/LoginPage';

export default function Login() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    toast.success('Login successful! Welcome back.');
    router.push('/home'); // go to dashboard after login
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
