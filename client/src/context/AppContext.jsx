import {createContext, useEffect, useState} from "react"
import {toast} from "react-toastify"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const navigate = useNavigate()

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(null)
    const [authReady, setAuthReady] = useState(false)

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev)
    }

    const logoutHandler = async () => {
        try {
            const {data} = await api.post(backendUrl + "/api/auth/logout")

            if (data.success) {
                toast.success("Logged out successfully!")
                setIsLoggedIn(false)
                setUserData(null)
                navigate("/")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            )
        }
    }

    const initializeAuth = async () => {
        try {
            const {data} = await api.get("/api/auth/is-auth")

            if (data.success) {
                setIsLoggedIn(true)
                setUserData(data.user || null)
                return
            }

            setIsLoggedIn(false)
            setUserData(null)
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || error.message)
            }
            setIsLoggedIn(false)
            setUserData(null)
        } finally {
            setAuthReady(true)
        }
    }

    useEffect(() => {
        initializeAuth()
    }, [])

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        authReady,
        logoutHandler,
        toggleSidebar, isSidebarOpen,
        initializeAuth
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}