import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import api from '../lib/api'
import { toast } from 'react-toastify'

const DeletePopup = ({link, setIsDeleting, setIsLinkUpdated}) => {

    const { } = useContext(AppContext)

    const [title, setTitle] = useState("")

    const onDeleteHandler = async (e) => {
        e.preventDefault()
        try {

            const { data } = await api.delete("/api/links/" + link._id)

            if (data.success) {
                toast.success(data.message)
                setTitle("")
                setIsDeleting(false)
                setIsLinkUpdated(prev => prev + 1)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center backdrop-blur-xs">
      <div className=' bg-white rounded-lg p-10 border border-gray-300'>
        <p>Are you sure you want to delete the following link: <span className='font-bold'>{link.name}</span>?</p>
        <p className='mb-5 text-lg'>Type "<span className='font-bold'>{link.name}</span>" and hit delete to permanently remove the link.</p>
        <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3 mb-1">
            <img src={assets.hash} className="w-4"/>
            <input value={title} onChange={(e) => {setTitle(e.target.value)}} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Title of the link"/>
        </div>
        {title !== link.name && title !== "" && <p className="text-red-700 text-sm">The input doesn't match the title!</p>}
        <div className='flex gap-3 mt-5'>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    setTitle("")
                    setIsDeleting(false)
                }}
                className="bg-gray-600 py-1 rounded-lg text-white font-bold hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-nowrap justify-center w-full">
                <img src={assets.plus} className="w-5 rotate-45"/>
                <p>Cancel</p>
            </button>
            <button
                disabled={link.name !== title}
                onClick={onDeleteHandler}
                className="bg-red-600 py-2 rounded-lg text-white font-bold hover:bg-red-700 cursor-pointer flex items-center gap-2 text-nowrap justify-center w-full
                disabled:bg-red-300 disabled:hover:bg-red-300 disabled:cursor-not-allowed">
                <img src={assets.check} className="w-5"/>
                <p>Delete forever</p>
            </button>
        </div>
      </div>
    </div>
  )
}

export default DeletePopup
