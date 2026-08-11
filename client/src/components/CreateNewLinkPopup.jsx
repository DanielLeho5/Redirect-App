import { useState } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import api from '../lib/api'

const CreateNewLinkPopup = ({ setIsCreating, onCreated }) => {
    const [title, setTitle] = useState("")
    const [redirectTo, setRedirectTo] = useState("")

    const onSaveHandler = async (e) => {
        e.preventDefault()

        try {
            const { data } = await api.post("/api/links", { name: title, redirectTo })

            if (data.success) {
                toast.success(data.message)
                setTitle("")
                setRedirectTo("")
                setIsCreating(false)
                onCreated?.()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

    const onCancelHandler = () => {
        setTitle("")
        setRedirectTo("")
        setIsCreating(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center backdrop-blur-xs">
            <form onSubmit={onSaveHandler} className="w-100 bg-white rounded-lg py-10 px-4 border border-gray-300">
                <h1 className='text-2xl font-bold mb-3'>Add a new link</h1>
                <div>
                    <span className="font-semibold text-lg">Title</span>
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3 mb-5">
                        <input onChange={e => setTitle(e.target.value)} value={title} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Title of the link"/>
                    </div>
                </div>
                <div className='mb-10'>
                    <span className="font-semibold text-lg">Redirect To</span>
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3 mb-5">
                        <input onChange={e => setRedirectTo(e.target.value)} value={redirectTo} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="https://destination-url.com"/>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                    <button
                        type="button"
                        onClick={onCancelHandler}
                        className="bg-gray-600 py-1 rounded-lg text-white font-bold hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-nowrap justify-center">
                        <img src={assets.plus} className="w-5 rotate-45"/>
                        <p>Cancel</p>
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 py-2 rounded-lg text-white font-bold hover:bg-green-700 cursor-pointer flex items-center gap-2 text-nowrap justify-center">
                        <img src={assets.check} className="w-5"/>
                        <p>Save</p>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateNewLinkPopup
