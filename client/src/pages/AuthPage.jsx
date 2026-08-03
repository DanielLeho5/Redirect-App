import AuthForm from "../components/AuthForm"
import { useLocation } from "react-router-dom"

function AuthPage() {

    const location = useLocation()
    const type = location.pathname.split("/").pop() || "login"

    return <div className='flex items-center justify-center pt-10'>
        <AuthForm type={type} />
    </div>
}

export default AuthPage