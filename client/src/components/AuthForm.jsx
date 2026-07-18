import axios from "axios";
import { assets } from "../assets/assets";
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { toast } from "react-toastify";
import api from "../lib/api";

export default function AuthForm({type}) {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const {backendUrl, setIsLoggedIn, setUserData} = useContext(AppContext)
    
    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            if (type === "register") {
                const {data} = await api.post("/api/auth/register", {name, email, password})

                if (data.success) {
                    toast.success("Registered successfully!")
                    navigate("/login")
                } else {
                    toast.error(data.mesage)
                }

            } else if (type === "login") {
                const {data} = await api.post("/api/auth/login", {email, password})

                if (data.success) {
                    toast.success("Logged in successfully!")
                    setIsLoggedIn(true)
                    setUserData(data.user || null)
                    navigate("/dashboard")
                } else {
                    toast.error(data.mesage)
                }
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    return <form onSubmit={onSubmitHandler} className="w-100 h-min bg-blue-400/25 backdrop-blur-xs  border border-blue-400 sm:rounded-xl shadow-md">
        <div className="w-full bg-blue-500 text-white flex justify-center sm:rounded-t-xl p-4 font-bold text-xl">{type === "register" ? "Register" : "Login"}</div>
        <div className="flex justify-center flex-col p-10">
            {type === "register" && <>
                <span className="font-semibold text-lg text-white">Name</span>
                <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-5">
                    <img src={assets.profile} className="w-4"/>
                    <input onChange={e => setName(e.target.value)} value={name} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Name"/>
                </div>
                </>
            }
            <span className="font-semibold text-lg text-white">Email address</span>
            <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3 mb-5">
                <img src={assets.mail} className="w-5"/>
                <input onChange={e => setEmail(e.target.value)} value={email} type="email" className="w-full outline-none bg-transparent text-gray-800" placeholder="Email address"/>
            </div>
            <span className="font-semibold text-lg text-white">Password</span>
            <div className="bg-white/85 p-2 rounded-lg flex items-center px-3 gap-3">
                <img src={assets.lock} className="w-5"/>
                <input onChange={e => setPassword(e.target.value)} value={password} type="password" minLength={5} className="w-full outline-none bg-transparent text-gray-800" placeholder="Password"/>
            </div>
            {type !== "register" && <p onClick={() => navigate("/reset-password")} className="text-sm text-white font-semibold cursor-pointer underline">Forgot password?</p>}
            {type === "register" ?  
            <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold mb-2 mt-5 hover:bg-blue-700 cursor-pointer">Register</button>
            :
            <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold mb-2 mt-5 hover:bg-blue-700 cursor-pointer">Login</button>}
            {type === "register" ?  
            <p className="text-sm text-white">Already have an account? <span className="text-white font-semibold cursor-pointer" onClick={() => navigate("/login")}>Login here!</span></p>
            :
            <p className="text-sm text-white">Don't have an account yet? <span className="text-white font-semibold cursor-pointer" onClick={() => navigate("/register")}>Register here!</span></p>}
        </div>
    </form>
}