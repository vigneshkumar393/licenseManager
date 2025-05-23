'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoginPage from '@/components/LoginPage';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    toast.success('Login successful! Welcome back.');
    router.push('/user-listing'); // navigate to /user-listing
  };

  return (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}
