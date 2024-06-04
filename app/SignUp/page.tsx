"use client"
import React, { useRef, useState } from "react"
import axios from "axios"
import { useRouter } from 'next/navigation'
 
const SignUp = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const nameInput = useRef({})
  const emailInput = useRef({})
  const passwordInput = useRef({})
  const [error, setError] = useState("");
 
  const onSubmit = (event) => {
    event.preventDefault();
    const username = nameInput.current.value;
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
  
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setError("Имя пользователя должно содержать только английские буквы и цифры");
      return;
    }
  
    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов");
      return;
    }
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]+$/;
    if (!passwordRegex.test(password)) {
      setError("Пароль должен содержать только английские буквы, цифры и следующие символы: !@#$%^&*");
      return;
    }
  
    let userData = {
      name: username,
      email: email,
      password: password,
    };
  
    try {
      setError("");
      setIsLoading(true);
      axios.post("http://localhost:5000/register", userData)
        .then(function (response) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          router.replace("/");
        })
        .catch((error) => {
          setError("Failed to submit form");
          console.log(error);
        });
    } catch {
      setError("Failed to submit form");
    }
  }
  
 
  return (
    <form className="flex flex-col gap-2">
      {error && <div className="p-2 border-blue-500 border-2 w-2/5 m-auto">{error}</div>}
      <input placeholder="Username" ref={nameInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto" type="text" name="username" autoComplete="username"/>
      <input placeholder="Email" ref={emailInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto" type="text" name="email" autoComplete="email"/>
      <input placeholder="Password" ref={passwordInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto mb-9" type="password" name="password" autoComplete="new-password"/>
      <button className="border-blue-700 border-2 w-2/5 m-auto" onClick={onSubmit} type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </button>
    </form>
  )
}
 
export default SignUp;