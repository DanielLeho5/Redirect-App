import React, { useState } from 'react'
import { assets } from '../assets/assets'
import api from '../lib/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const PasswordResetPage = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const sendEmailHandler = async (e) => {
    e.preventDefault()
    try {
        const {data} = await api.post("/api/auth/send-reset-otp", {userEmail: email})

        if (data.success) {
            toast.success(data.message)
        } else {
            console.log(data.message)
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Something went wrong!")
    }
  }

  const resetPasswordHandler = async (e) => {
    e.preventDefault()
    try {
        const {data} = await api.post("/api/auth/reset-password", {otp, newPassword, userEmail: email})

        if (data.success) {
            toast.success(data.message)
            navigate("/login")
        } else {
            console.log(data.message)
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Something went wrong!")
    }
  }

  return (
    <div className='flex items-center w-full justify-center pt-10'>
      <form className="w-100 h-min bg-blue-400/25 backdrop-blur-xs  border border-blue-400 sm:rounded-xl shadow-md">
        <div className="w-full bg-blue-500 text-white flex justify-center sm:rounded-t-xl p-4 font-bold text-xl">Reset your password</div>
        <div className="flex justify-center flex-col p-10">
          <span className="font-semibold text-lg text-white">Send reset otp email</span>
          <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-3">
              <img src={assets.hash} className="w-4"/>
              <input 
              value={email} onChange={e => setEmail(e.target.value)}
              type="email" className="w-full outline-none bg-transparent text-gray-800" placeholder="Email address"/>
          </div>
          <button 
          onClick={e => sendEmailHandler(e)}
          className="bg-blue-600 px-6 sm:px-8 h-10 rounded-lg text-white mb-5 font-bold hover:bg-blue-700 cursor-pointer flex justify-center items-center gap-2 w-full sm:w-auto">
              <img src={assets.send} className="w-7"/>
              <p>Send</p>
          </button>
          <span className="font-semibold text-lg text-white">6-digit verification code</span>
          <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-3">
              <img src={assets.hash} className="w-4"/>
              <input 
              value={otp} onChange={e => setOtp(e.target.value)}
              type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Verification code"/>
          </div>
          <span className="font-semibold text-lg text-white">New password</span>
          <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-3">
              <img src={assets.hash} className="w-4"/>
              <input 
              value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={5}
              type="password" className="w-full outline-none bg-transparent text-gray-800" placeholder="New password"/>
          </div>
          <button 
          onClick={e => resetPasswordHandler(e)}
          className="bg-green-600 px-8 h-10 rounded-lg text-white font-bold hover:bg-green-700 cursor-pointer">Change password</button>
        </div>
      </form>
    </div>
  )
}

export default PasswordResetPage
