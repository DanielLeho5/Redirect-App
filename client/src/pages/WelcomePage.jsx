import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const WelcomePage = () => {

  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center justify-center pt-10 px-5 gap-5'>
      <h1 className='text-white font-bold text-4xl'>Welcome!</h1>
      <div className='flex flex-col md:flex-row gap-10 items-center backdrop-blur-xs bg-blue-500/60 shadow-2xl border border-blue-800 p-10 rounded-3xl w-full h-min md:w-200'>
        <img src={assets.qr_logo} className='w-50' />
        <div className='flex flex-col justify-center'>
          <h1 className='font-bold text-3xl text-white'>Create your dynamic QR codes and redirect links!</h1>
          <p className='text-white'>If you want to start creating, you have to {" "}
            <span className='underline font-bold cursor-pointer' onClick={() => navigate("/login")}>login</span> or {" "}
            <span className='underline font-bold cursor-pointer' onClick={() => navigate("/register")}>create an account</span>!</p>
          <p className='text-white'>After that you will can verify your email address, and you can start creating your QR codes and redirect links!</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
