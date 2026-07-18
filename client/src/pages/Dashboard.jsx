import LinkCard from "../components/LinkCard"
import { assets } from "../assets/assets"
import { toast } from "react-toastify"
import { useContext, useEffect, useState, useRef } from "react"
import { AppContext } from "../context/AppContext"
import CreateNewLinkPopup from "../components/CreateNewLinkPopup"
import api from "../lib/api"

import {Html5QrcodeScanner} from "html5-qrcode";

export default function Dashboard() {

    const {authReady, isLoggedIn} = useContext(AppContext)
    const [links, setLinks] = useState([])
    const [search, setSearch] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [linkUpdated, setIsLinkUpdated] = useState(0)
    const [isScanning, setIsScanning] = useState(false)

    const getLinks = async () => {
        try {
            const {data} = await api.get("/api/links")
            if (data.success) {
                setLinks(data.links || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            setLinks([])
            const er = error.response?.data?.message
            if (er === "No links found for this user!") {
                toast.warning(er)
            } else {
                toast.error(er || error.message)
            }
        }
    }

    const filteredLinks = [...links]
        .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }))
        .filter(
            (link) =>
            link.name.toLowerCase().includes(search.toLowerCase()) ||
            link._id.toLowerCase().includes(search.toLowerCase()) ||
            link.redirectTo.toLowerCase().includes(search.toLowerCase())
        )

    const scannerRef = useRef(null);
    const startScanner = () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 20,
                    qrbox: { width: 250, height: 250 }
                },
                false
            );
        }

        scannerRef.current.render(onScanSuccess, onScanError);
    };

    
    const onScanSuccess = (data) => {
        setSearch(data.split("/").pop())

        scannerRef.current
        ?.clear()
        .then(() => {
            scannerRef.current = null;
            setIsScanning(false);
        });
    }

    const onScanError = () => {}

    useEffect(() => {
        if (!isScanning) return

        startScanner()

        return () => {
           scannerRef.current?.clear().catch(console.error)
        }
    }, [isScanning])

    useEffect(() => {
        if (authReady && isLoggedIn) {
            getLinks()
        }
    }, [authReady, isLoggedIn, linkUpdated])

    return <div className='flex flex-col px-10 lg:px-20 gap-5 items-center'>
        <div className="flex flex-wr justify-between items-center w-full lg:flex-row gap-3 pt-10 sm:flex-nowrap flex-wrap">
            <div className="flex w-full gap-3">
                <div className="bg-white rounded-lg flex items-center pl-3 pr-1 gap-3 w-full h-10">
                    <img src={assets.search_gray} className="w-5"/>
                    <input onChange={e => setSearch(e.target.value)} value={search} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Search ..."/>
                    <div onClick={() => setSearch("")} className="aspect-square flex items-center justify-center rounded-full active:bg-gray-300 hover:bg-gray-200 cursor-pointer p-2 transition-colors duration-300">
                        <img src={assets.plus_black} className="w-5 rotate-45"/>
                    </div>
                </div>
                <button 
                    onClick={() => setIsScanning(true)}
                    className="bg-blue-600 p-2.5 h-10 aspect-square rounded-lg text-white font-bold hover:bg-blue-700 cursor-pointer flex items-center justify-center">
                    <img src={assets.camera} className="w-4"/>
                </button>
            </div>
            <button 
                onClick={() => (setIsCreating(prev => !prev))}
                className="bg-green-600 px-12 py-2 rounded-lg text-white font-bold hover:bg-green-700 cursor-pointer flex items-center gap-2 text-nowrap justify-center w-full sm:w-auto">
                <img src={assets.plus} className="w-5"/>
                <p>Create new QR Code</p>
            </button>
        </div>
        {isCreating && <CreateNewLinkPopup setIsCreating={setIsCreating} onCreated={getLinks}/>} 
        {filteredLinks.length > 0 ?
            <div className="grid lg:grid-cols-2 gap-5 grid-cols-1 w-full">
                {filteredLinks.map((link) => (
                    <LinkCard setIsLinkUpdated={setIsLinkUpdated} key={link._id} link={link}/>
                ))}
            </div>
            :
            <p className="w-full flex justify-center text-3xl text-white/70 font-semibold">No links found ...</p>
        }
        {isScanning && <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6">
                <div id="reader" className="w-80 h-80"></div>

                <button
                    onClick={() => setIsScanning(false)}
                    className="mt-4 p-4 w-full bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
                >
                    <img src={assets.plus} className="rotate-45 w-5" />
                    Close
                </button>
            </div>
        </div>}
    </div>
}