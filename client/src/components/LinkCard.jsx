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
    const shareUrl = `${backendUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")}/api/links/redirect/${link._id}`

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

    const onWriteNfcHandler = async () => {
        try {
            if (typeof window === "undefined" || !window.isSecureContext) {
                toast.error("NFC writing requires HTTPS or localhost")
                return
            }

            if (!("NDEFReader" in window)) {
                toast.error("NFC writing is not supported in this browser")
                return
            }

            const ndef = new window.NDEFReader()
            await ndef.write(shareUrl)

            toast.success("Wrote NFC tag")
        } catch (error) {
            toast.error(error?.message || "Could not write NFC tag")
        }
    }

    useEffect(() => {
        const renderQR = async () => {
            try {
                const qrDataUrl = await QRCode.toDataURL(shareUrl)
                setQr(qrDataUrl)
            } catch (error) {
                console.error(error)
            }
        }

        renderQR()
    }, [shareUrl])


    return <div className="bg-white w-full overflow-hidden sm:rounded-xl p-5 flex gap-5 flex-col md:flex-row border border-gray-300 shadow-sm">
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
                    <button onClick={() => setIsEditingTitle(true)} className="bg-blue-500 p-1.5 rounded-xl hover:bg-blue-600 cursor-pointer shrink-0">
                        <img src={assets.pen} className="w-5" />
                    </button>
                </div>
                :
                <div className="flex items-center justify-center gap-2 w-full">
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3 w-full">
                        <input onChange={e => setTitle(e.target.value)} value={title} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Title of the link"/>
                    </div>
                    <button onClick={onSaveTitleHandler} className="bg-green-600 p-1.5 rounded-xl hover:bg-green-700 cursor-pointer shrink-0">
                        <img src={assets.check} className="w-5" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)}  className="bg-gray-600 p-1.5 rounded-xl hover:bg-gray-700 cursor-pointer shrink-0">
                        <img src={assets.plus} className="w-5 rotate-45" />
                    </button>
                </div>
                }
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
                <div className="flex items-center justify-center gap-2 w-full">
                    <div className="bg-gray-200 p-2 rounded-lg flex items-center px-3 gap-3 w-full">
                        <input onChange={e => setUrl(e.target.value)} value={url} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="url"/>
                    </div>
                    <button onClick={onSaveUrlHandler} className="bg-green-600 p-1.5 rounded-xl hover:bg-green-700 cursor-pointer shrink-0">
                        <img src={assets.check} className="w-5" />
                    </button>
                    <button onClick={() => setIsEditingUrl(false)} className="bg-gray-600 p-1.5 rounded-xl hover:bg-gray-700 cursor-pointer shrink-0">
                        <img src={assets.plus} className="w-5 rotate-45" />
                    </button>
                </div>
                }
            </div>
            <p onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Copied to clipboard")
            }}  
            className="mb-2 max-w-full min-w-0 truncate text-blue-700 cursor-pointer">{link._id}</p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={onWriteNfcHandler}
                    className="bg-emerald-600 px-6 sm:px-8 h-10 rounded-lg text-white font-bold hover:bg-emerald-700 cursor-pointer flex justify-center items-center gap-3 w-full sm:w-auto">
                    <p>Write NFC</p>
                </button>
                <button 
                    onClick={() => {
                        const qrLink = document.createElement("a")
                        qrLink.href = qr
                        qrLink.download = `${link.name || "qr-code"}.png`
                        qrLink.click()
                    }}
                    className="bg-blue-600 px-6 sm:px-8 h-10 rounded-lg text-white font-bold hover:bg-blue-700 cursor-pointer flex justify-center items-center gap-3 w-full sm:w-auto">
                    <p>Download</p>
                </button>
                <button onClick={() => {setIsDeleting(true)}} className="bg-red-400 px-6 sm:px-8 h-10 rounded-lg text-white font-bold hover:bg-red-500 cursor-pointer flex justify-center items-center gap-3 w-full sm:w-auto">
                    Delete
                </button>
                {isDeleting && <DeletePopup link={link} setIsLinkUpdated={setIsLinkUpdated} setIsDeleting={setIsDeleting}/>}
            </div>
        </div>
    </div>
}