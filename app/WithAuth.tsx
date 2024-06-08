import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const WithAuth = () => {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      router.replace("/SignUp");
      return;
    }

    const verifyToken = async () => {
      try {
        axios.post('http://localhost:5000/verify', { name: username, token })
        .then((response)=>{
          console.log(response.data.verified)
          if (!response.data.verified) {
            router.replace("/SignUp");
          }
        })
        .catch((err)=>{
          console.log(err);
          router.replace("/SignUp");
        })
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        router.replace("/SignUp");
      }
    };

    verifyToken();
  }, [router]);

  return null;
};

export default WithAuth;
