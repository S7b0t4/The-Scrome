"use client"
import React, { useRef, useState } from 'react'
import axios from "axios"
 
const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false)
  const nameInput = useRef("")
  const passwordInput = useRef("")
 
  const onSubmit = () => {
    setIsLoading(true)
    axios.post('http://localhost:5000/', {
      name: nameInput.current.value,
      password: passwordInput.current.value,
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
 
  return (
    <form className="flex flex-col">
      <input ref={nameInput} className="border-red-500 border-2 w-2/5 m-auto" type="text" name="name" />
      <input ref={passwordInput} className="border-red-500 border-2 w-2/5 m-auto mb-9" type="text" name="name" />
      <button className="border-blue-700 border-2 w-2/5 m-auto" onClick={onSubmit} type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  )
}
 
export default SignUp;