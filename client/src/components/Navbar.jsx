import { assets } from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import { useContext } from "react"

export function Navbar() {

    const {isLoggedIn, authReady, userData, toggleSidebar, logoutHandler} = useContext(AppContext)
    const navigate = useNavigate()

    return <nav className="w-full z-10 flex bg-blue-900 items-center justify-between py-4 px-8 sticky top-0 gap-3">
        <button className="flex gap-5 items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={assets.qr_logo} className="w-15" />
            <h1 className="text-2xl font-bold text-white text-nowrap sm:flex items-center hidden">QR Code Redirect App</h1>
        </button>
        {!authReady ? <div className="h-10 w-28" /> : isLoggedIn ?
        <div className="flex gap-3">
            {!userData.isVerified && <button className="bg-blue-600 hover:bg-blue-700 px-8 h-10 rounded-lg text-white font-bold cursor-pointer hidden sm:flex items-center justify-center" onClick={() => navigate("/verify-email")}>Verify email</button>}
            {!userData.isVerified && <button className="bg-blue-600 hover:bg-blue-700 px-8 h-10 rounded-lg text-white font-bold cursor-pointer hidden sm:flex items-center justify-center" onClick={() => navigate("/dashboard")}>Dashboard</button>}
            <button className="bg-blue-600 hover:bg-blue-700 px-8 h-10 rounded-lg text-white font-bold cursor-pointer hidden sm:flex items-center justify-center" onClick={logoutHandler}>Logout</button>
        </div>
        :
        <div className="flex gap-4">
            <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold cursor-pointer sm:flex items-center hidden hover:bg-blue-700" onClick={() => navigate("/login")}>Login</button>
            <button className="bg-blue-600 px-8 h-10 rounded-lg text-white font-bold cursor-pointer sm:flex items-center hidden hover:bg-blue-700" onClick={() => navigate("/register")}>Register</button>
        </div>
        }
        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white flex font-bold cursor-pointer aspect-square sm:hidden items-center justify-center" onClick={toggleSidebar}>
            <img src={assets.hamburger} className="w-7"/>
        </button>
    </nav>
}