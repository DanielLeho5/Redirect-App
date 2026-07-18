import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
    
    const {isLoggedIn, authReady, toggleSidebar, logoutHandler, userData} = useContext(AppContext)
    const navigate = useNavigate()

  return (
    <div className='fixed inset-0 bg-gray-300/35 backdrop-blur-sm z-11'>
        <div className='w-75 h-full z-11 bg-blue-500 fixed top-0 right-0 flex gap-3 flex-col items-center p-5'>
            <button className="bg-blue-600 hover:bg-blue-700 p-2 self-start rounded-lg text-white font-bold cursor-pointer aspect-square flex items-center justify-center" onClick={toggleSidebar}>
                <img src={assets.plus} className="w-7 rotate-45"/>
            </button>
            {!authReady ? <div className="h-10 w-28" /> : isLoggedIn ?
            <>
                {!userData.isVerified && <button className="bg-blue-600 hover:bg-blue-700 px-8 h-10 rounded-lg text-white font-bold cursor-pointer w-full flex items-center justify-center" onClick={() => {
                    navigate("/verify-email")
                    toggleSidebar()
                }}>Verify email</button>}
                <button className="bg-blue-600 hover:bg-blue-700 px-8 h-10 rounded-lg text-white font-bold cursor-pointer w-full flex items-center justify-center" onClick={() => {
                    logoutHandler()
                    toggleSidebar()
                }}>Logout</button>
                </>
            :
            <div className="flex flex-col gap-3 w-full">
                <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold cursor-pointer flex justify-center items-center hover:bg-blue-700" onClick={() => {
                    toggleSidebar()
                    navigate("/login")
                }}>Login</button>
                <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold cursor-pointer flex justify-center items-center hover:bg-blue-700" onClick={() => {
                    toggleSidebar()
                    navigate("/register")
                }}>Register</button>
            </div>
            }
        </div>
    </div>
  )
}

export default Sidebar
