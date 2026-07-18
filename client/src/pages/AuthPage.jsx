import { useContext, useEffect, useState } from "react"
import AuthForm from "../components/AuthForm"
import { useLocation } from "react-router-dom"

function AuthPage() {

    const location = useLocation()
    const [state, setState] = useState("login")

    useEffect(() => {
        const type = location.pathname.split("/").pop()
        setState(type)
    }, [location.pathname])

    return <div className='flex items-center justify-center pt-10'>
        <AuthForm type={state} />
    </div>
}

export default AuthPage