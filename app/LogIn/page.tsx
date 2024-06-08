"use client"
import React, { useRef, useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation'

const LogIn = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const nameInput = useRef({});
  const passwordInput = useRef({});
  const [error, setError] = useState("");

  const onSubmit = () => {

    const username = nameInput.current.value;
    const password = passwordInput.current.value;

    let userData = {
      name: username,
      password: password,
    };

    try {
      setError("");
      setIsLoading(true);
      axios.post("http://localhost:5000/login", userData)
        .then(function (response) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          router.replace("/");
        })
        .catch((error) =>  {
          setError("Failed to submit form");
          console.log(error);
        });
    } catch {
      setError("Failed to submit form");
    };
  }

  return (
    <form className="flex flex-col gap-2">
      {error && <div className="p-2 border-blue-500 border-2 w-2/5 m-auto">{error}</div>}
      <input placeholder="Username" ref={nameInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto" type="text" name="name" autoComplete="username"/>
      <input placeholder="Password" ref={passwordInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto mb-9" type="password" name="name" autoComplete="password"/>
      <button className="border-blue-700 border-2 w-2/5 m-auto" onClick={onSubmit} type="button" disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}

export default LogIn;
