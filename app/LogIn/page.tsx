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
    let userData = {
      name: nameInput.current.value,
      password: passwordInput.current.value,
    };

    try {
      setError("");
      setIsLoading(true);
      axios.post("http://localhost:5000/login", userData)
        .then(function (response) {
          const token = response.data.token;
          localStorage.setItem('token', token);
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
    <form className="flex flex-col">
      {error && <div className="p-2 border-blue-500 border-2 w-2/5 m-auto">{error}</div>}
      <input placeholder="Username" ref={nameInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto" type="text" name="name" />
      <input placeholder="Password" ref={passwordInput} className="p-2 border-blue-500 border-2 w-2/5 m-auto mb-9" type="password" name="name" />
      <button className="border-blue-700 border-2 w-2/5 m-auto" onClick={onSubmit} type="button" disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}

export default LogIn;