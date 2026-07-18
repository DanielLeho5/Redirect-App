import { useEffect, useState, useContext } from "react"
import { assets } from "../assets/assets"
import QRCode from "qrcode"
import { AppContext } from "../context/AppContext"
import api from "../lib/api"
import { toast } from "react-toastify"
import DeletePopup from "./DeletePopup"

export default function LinkCard({link, setIsLinkUpdated}) {

    const {backendUrl} = useContext(AppContext)
    const [qr, setQr] = useState()

    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [title, setTitle] = useState(link.name)

    const [isEditingUrl, setIsEditingUrl] = useState(false)
    const [url, setUrl] = useState(link.redirectTo)

    const [isDeleting, setIsDeleting] = useState(false)

    const onSaveTitleHandler = async () => {
        try {
            const {data} = await api.put("/api/links/" + link._id, {name: title})

            if (data.success) {
                toast.success(data.message)
                setIsEditingTitle(false)
                setIsLinkUpdated(prev => prev + 1)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

    const onSaveUrlHandler = async () => {
        try {
            const {data} = await api.put("/api/links/" + link._id, {redirectTo: url})

            if (data.success) {
                toast.success(data.message)
                setIsEditingUrl(false)
                setIsLinkUpdated(prev => prev + 1)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong!")
        }
    }

    useEffect(() => {
        const renderQR = async () => {
            try {
                const url = "https://redirect-app.duckdns.org" + "/api/links/redirect/" + link._id
                const qrDataUrl = await QRCode.toDataURL(url)
                setQr(qrDataUrl)
            } catch (error) {
                console.error(error)
            }
        }

        renderQR()
    }, [backendUrl, link._id])


    return <div className="bg-gray-100 w-full overflow-hidden rounded-xl p-5 flex gap-5 flex-col md:flex-row border border-gray-300 shadow-sm">
        <div className="flex flex-col justify-center items-center gap-2 shrink-0">
            <img src={qr} className="w-40 max-w-full" />
            <div className="flex items-center justify-center gap-2">
                <img src={assets.cursor} className="w-5 shrink-0" />
                <p className="text-blue-500 text-lg font-semibold whitespace-nowrap">{link.visited} Scan{link.visited !== 1 ? "s" : ""}</p>
            </div>
        </div>
        <div className="flex flex-col gap-3 justify-center min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 min-w-0">
                {!isEditingTitle ? 
                <div className="flex min-w-0 gap-3 items-center flex-1 flex-wrap">
                    <p className="text-xl font-semibold min-w-0 text-nowrap">{link.name}</p>
                    <button onClick={() => setIsEditingTitle(prev => true)} className="bg-blue-500 p-1.5 rounded-xl hover:bg-blue-600 cursor-pointer shrink-0">
                        <img src={assets.pen} className="w-5" />
                    </button>
                </div>
                :
                <div className="flex items-center flex-wrap justify-center gap-2">
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3">
                        <img src={assets.hash} className="w-4"/>
                        <input onChange={e => setTitle(e.target.value)} value={title} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Title of the link"/>
                    </div>
                    <button onClick={onSaveTitleHandler} className="bg-green-600 p-1.5 rounded-xl hover:bg-green-700 cursor-pointer shrink-0">
                        <img src={assets.check} className="w-5" />
                    </button>
                    <button onClick={() => setIsEditingTitle(prev => false)}  className="bg-gray-600 p-1.5 rounded-xl hover:bg-gray-700 cursor-pointer shrink-0">
                        <img src={assets.plus} className="w-5 rotate-45" />
                    </button>
                </div>
                }
                <button onClick={() => {setIsDeleting(true)}} className="bg-red-200 p-1.5 rounded-xl hover:bg-red-300 cursor-pointer shrink-0 text-red-800 px-5 border border-red-300">
                    Delete
                </button>
                {isDeleting && <DeletePopup link={link} setIsLinkUpdated={setIsLinkUpdated} setIsDeleting={setIsDeleting}/>}
            </div>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                <p className="text-lg shrink-0">Redirect to: </p>
                {!isEditingUrl ? 
                <div className="flex flex-row gap-3 items-center">
                    <p className="text-lg min-w-0 break-all">{link.redirectTo}</p>
                    <button onClick={() => setIsEditingUrl(true)} className="bg-blue-500 p-1.5 rounded-xl hover:bg-blue-600 cursor-pointer shrink-0">
                        <img src={assets.pen} className="w-5" />
                    </button>
                </div>
                :
                <div className="flex items-center justify-center gap-2">
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3">
                        <img src={assets.hash} className="w-4"/>
                        <input onChange={e => setUrl(e.target.value)} value={url} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Title of the link"/>
                    </div>
                    <button onClick={onSaveUrlHandler} className="bg-green-600 p-1.5 rounded-xl hover:bg-green-700 cursor-pointer shrink-0">
                        <img src={assets.check} className="w-5" />
                    </button>
                    <button onClick={() => setIsEditingUrl(prev => false)} className="bg-gray-600 p-1.5 rounded-xl hover:bg-gray-700 cursor-pointer shrink-0">
                        <img src={assets.plus} className="w-5 rotate-45" />
                    </button>
                </div>
                }
            </div>
            <p onClick={() => {
                navigator.clipboard.writeText(backendUrl + "/api/links/redirect/" + link._id);
                toast.success("Copied to clipboard")
            }}  
            className="mb-2 max-w-full min-w-0 truncate text-blue-700 cursor-pointer">{link._id}</p>
            <button 
            onClick={() => {
                const link = document.createElement("a")
                link.href = qr
                link.download = `${link.name || "qr-code"}.png`
                link.click()
            }}
            className="bg-blue-600 px-6 sm:px-8 h-10 rounded-lg text-white font-bold hover:bg-blue-700 cursor-pointer flex justify-center items-center gap-3 w-full sm:w-auto">
                <img src={assets.download} className="w-5"/>
                <p>Download</p>
            </button>
        </div>
    </div>
}