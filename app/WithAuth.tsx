"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'

const WithAuth = () => {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace("/SignUp")
    }
  }, []);
  return ""
};

export default WithAuth;
