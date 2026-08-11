import LinkCard from "../components/LinkCard"
import { assets } from "../assets/assets"
import { toast } from "react-toastify"
import { useContext, useEffect, useState, useRef } from "react"
import { AppContext } from "../context/AppContext"
import CreateNewLinkPopup from "../components/CreateNewLinkPopup"
import api from "../lib/api"

import {Html5QrcodeScanner} from "html5-qrcode";
import jsQR from "jsqr";

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
    const scanIntervalRef = useRef(null);
    const startScanner = () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 260, height: 260 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    videoConstraints: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                },
                false
            );
        }

        scannerRef.current.render(onScanSuccess, onScanError);
    };

    const tryDecodeFrame = () => {
        try {
            const video = document.querySelector('#reader video');
            if (!video || video.readyState !== 4) return;

            const w = video.videoWidth || 640;
            const h = video.videoHeight || 480;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);

            // try normal decode
            let code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
                onScanSuccess(code.data);
                return;
            }

            // invert and retry
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = 255 - imageData.data[i];
                imageData.data[i + 1] = 255 - imageData.data[i + 1];
                imageData.data[i + 2] = 255 - imageData.data[i + 2];
            }
            const invertedCode = jsQR(imageData.data, imageData.width, imageData.height);
            if (invertedCode && invertedCode.data) {
                onScanSuccess(invertedCode.data);
                return;
            }
        } catch (err) {
            console.error('frame decode error', err);
        }
    };

    
    const onScanSuccess = (data) => {
        // clear any background frame-decoding attempts
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        setSearch(data.split("/").pop())

        scannerRef.current
        ?.clear()
        .then(() => {
            scannerRef.current = null;
            setIsScanning(false);
        });
    }

    const handleStartScanning = async () => {
        // Request camera permission first so we can give clearer feedback
        const constraints = {
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('Camera API not supported in this browser.')
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            // immediately stop the stream (we only wanted to prompt/verify permission)
            stream.getTracks().forEach(t => t.stop())
            setIsScanning(true)
        } catch (err) {
            console.error('camera permission error', err)
            const name = err?.name || ''
            if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                toast.error('Camera permission denied. Allow camera access in your browser settings and retry.')
            } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
                toast.error('No suitable camera found. Try a different device.')
            } else {
                toast.error(err?.message || 'Unable to access camera')
            }
        }
    }

    const onScanError = (err) => {
        // handle permission/errors during scanner lifecycle
        if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
            toast.error('Camera permission denied. Allow camera access in your browser settings and retry.')
            scannerRef.current?.clear().catch(() => {})
            setIsScanning(false)
        }
    }

    useEffect(() => {
        if (!isScanning) return

        startScanner()
        // start a background attempt to decode frames (normal + inverted)
        if (!scanIntervalRef.current) {
            scanIntervalRef.current = setInterval(tryDecodeFrame, 800);
        }

        return () => {
           scannerRef.current?.clear().catch(console.error)
           if (scanIntervalRef.current) {
               clearInterval(scanIntervalRef.current)
               scanIntervalRef.current = null
           }
        }
    }, [isScanning])

    useEffect(() => {
        if (authReady && isLoggedIn) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            getLinks()
        }
    }, [authReady, isLoggedIn, linkUpdated])

    return <div className='flex flex-col sm:px-10 lg:px-20 gap-5 items-center'>
        <div className="flex px-5 justify-between items-center w-full lg:flex-row gap-3 pt-10 sm:flex-nowrap flex-wrap">
            <div className="flex w-full gap-3">
                <div className="bg-white border-gray-300 border rounded-lg flex items-center pl-3 pr-1 gap-3 w-full h-10">
                    <img src={assets.search_gray} className="w-5"/>
                    <input onChange={e => setSearch(e.target.value)} value={search} type="text" className="w-full outline-none bg-transparent text-gray-800" placeholder="Search ..."/>
                    <div onClick={() => setSearch("")} className="aspect-square flex items-center justify-center rounded-full active:bg-gray-300 hover:bg-gray-200 cursor-pointer p-2 transition-colors duration-300">
                        <img src={assets.plus_black} className="w-5 rotate-45"/>
                    </div>
                </div>
                <button 
                    onClick={handleStartScanning}
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
            <div className="grid xl:grid-cols-2 gap-3 grid-cols-1 w-full">
                {filteredLinks.map((link) => (
                    <LinkCard setIsLinkUpdated={setIsLinkUpdated} key={link._id} link={link}/>
                ))}
            </div>
            :
            <p className="w-full flex justify-center text-3xl text-gray-500 font-semibold">No links found ...</p>
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