import { useContext, useState } from 'react'
import { assets } from "../assets/assets"
import api from '../lib/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const EmailVerificationPage = () => {

    const [otp, setOtp] = useState("")
    const navigate = useNavigate()
    const {setUserData} = useContext(AppContext)

    const sendEmailHandler = async (e) => {
        e.preventDefault()
        try {
            const {data} = await api.post("/api/auth/send-verify-email")

            if (data.success) {
                toast.success(data.message)
            } else {
                console.log(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

    const verifyEmailHandler = async (e) => {
        e.preventDefault()
        try {
            const {data} = await api.post("/api/auth/verify-email", {otp})
            await api.post("/api/auth/refresh-token")

            if (data.success) {
                toast.success(data.message)
                setUserData(prev => ({...prev, isVerified: true}))
                navigate("/dashboard")
            } else {
                console.log(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

  return (
    <div className='flex items-center w-full justify-center pt-10'>
        <form className="w-100 h-min  bg-blue-400/25 backdrop-blur-xs  border border-blue-400 sm:rounded-xl shadow-md">
          <div className="w-full bg-blue-500 text-white flex justify-center sm:rounded-t-xl p-4 font-bold text-xl">Email Verification Code</div>
          <div className="flex justify-center flex-col p-10">
              <span className="font-semibold text-lg text-white">Send email verification code</span>
              <button 
              onClick={e => sendEmailHandler(e)}
              className="bg-blue-600 px-6 sm:px-8 h-10 rounded-lg text-white mb-5 font-bold hover:bg-blue-700 cursor-pointer flex justify-center items-center gap-2 w-full sm:w-auto">
                  <img src={assets.send} className="w-7"/>
                  <p>Send</p>
              </button>
              <span className="font-semibold text-lg text-white">Verification 6-digit code</span>
              <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-3">
                  <img src={assets.hash} className="w-4"/>
                  <input 
                    onChange={(e) => setOtp(e.target.value)} value={otp}
                  type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Verification code"/>
              </div>
              <button 
              onClick={e => verifyEmailHandler(e, otp, setUserData, navigate)}
              className="bg-green-600 px-8 h-10 rounded-lg text-white font-bold hover:bg-green-700 cursor-pointer">Verify email</button>
          </div>
      </form>
    </div>
  )
}

export default EmailVerificationPage
