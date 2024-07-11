import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"


const setting = require('../setting.json')

export function SettingDevice({ }) {
    const windowIP = (window.location.hostname == 'localhost') ? '127.0.0.1' : window.location.hostname
    const navigate = useNavigate()
    const { device_id } = useParams()

    const [isNew, setIsNew] = useState((device_id == null))

    return (
        <>
            <Hero />
            <FormDevice />
        </>
    )

    function FormDevice({ }) {
        const [deviceID, setDeviceID] = useState(device_id)
        const [deviceName, setDeviceName] = useState('')
        const [deviceProcessor, setDeviceProcessor] = useState('jetson')
        const [deviceIP, setDeviceIP] = useState(windowIP)
        const [deviceYoloModel, setDeviceYoloModel] = useState('jv_indo_m_640.engine')
        const [devicePresenceDetector, setDevicePresenceDetector] = useState(false)

        const [pdID, setPdID] = useState(null)
        const [pdHost, setPdHost] = useState('127.0.0.1')
        const [pdTreshold, setPdTreshold] = useState(0.5)

        const [deviceIPDesc, setDeviceIPDesc] = useState('')
        const [deviceIpisValid, setDeviceIpisValid] = useState(false)
        const [yoloModelDesc, setYoloModelDesc] = useState('')

        const [pdHostIsValid, setPdHostIsValid] = useState(false)
        const [pdHostDesc, setPdHostDesc] = useState('')

        const [confirmTextCorrect, setConfirmTextCorrect] = useState(false)

        const [deviceCameraIDs, setDeviceCameraIDs] = useState([])
        const [cameraListIDs, setCameraListIDs] = useState([])
        const [presenceDetectorIDs, setPresenceDetectorIDs] = useState([])

        function onConfirmTextUpdate(e) {
            const confirmText = e.target.value
            setConfirmTextCorrect(confirmText == deviceName)
        }

        const yolo_model_list = [
            { name: 'jv_indo_n_320.engine', desc: '(kecepatan tinggi) cocok untuk vga kecil seperti jetson orin nano dan orin NX' },
            // { name: 'jv_indo_m_320.engine', desc: '(akurasi cukup baik dan cepat) cocok untuk vga kecil seperti jetson orin nano dan orin NX' },
            // { name: 'jv_indo_n_640.engine', desc: '(akurasi lebih baik dan cukup cepat) cocok untuk vga sedang seperti jetson orin NX' },
            { name: 'jv_indo_m_640.engine', desc: '(akurasi terbaik) cocok untuk vga sedang dan besar seperti jetson orin NX atau perangkat gpu dekstop seperti RTX' },
            { name: 'jv_indo_n_320.onnx', desc: '(kecepatan tinggi) cocok untuk perangkat cpu' },
            // { name: 'jv_indo_m_320.onnx', desc: '(akurasi cukup baik) cocok untuk perangkat cpu' },
            // { name: 'jv_indo_n_640.onnx', desc: '(akurasi lebih baik) cocok untuk perangkat cpu' },
            { name: 'jv_indo_m_640.onnx', desc: '(akurasi terbaik) cocok untuk perangkat cpu' },
            { name: 'jv_indo_n.pt', desc: '(kecepatan tinggi dan akurasi cukup baik) cocok untuk perangkat gpu seperti RTX' },
            { name: 'jv_indo_m.pt', desc: '(akurasi terbaik) cocok untuk perangkat gpu seperti RTX' },
        ]

        useEffect(() => {
            function getDevice() {
                if (!isNew) {
                    const url = 'http://'+window.location.hostname+':3000' + '/tabel_where/device/id/' + deviceID
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            const res = data.result
                            if (res.length > 0) {
                                setDeviceName(res[0].name)
                                setDeviceProcessor(res[0].processor)
                                setDeviceIP(res[0].ip)
                                setDeviceYoloModel(res[0].yolo_model)
                            }
                        })
                }
            }
            getDevice()

            function getPresenceDetectorDevice() {
                if (!isNew) {
                    const url = 'http://'+window.location.hostname+':3000' + '/tabel_where/presence_detector_device/device_id/' + deviceID
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            const res = data.result
                            setDevicePresenceDetector(res.length > 0)
                            if (res.length > 0) {
                                setPdID(res[0].id)
                                setPdHost(res[0].host)
                                setPdTreshold(res[0].treshold)
                            }
                        })
                }
            }
            getPresenceDetectorDevice()

            function getDeviceCamera() {
                if (!isNew) {
                    const url = 'http://'+window.location.hostname+':3000' + '/tabel_where/device_camera/device_id/' + deviceID
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            const res = data.result
                            if (res.length > 0) {
                                let newDeviceCameraIDs = []
                                let newCameraListIDs = []
                                res.forEach(r => {
                                    newDeviceCameraIDs.push(r.id)
                                    newCameraListIDs.push(r.camera_id)
                                })
                                setDeviceCameraIDs(newDeviceCameraIDs)
                                setCameraListIDs(newCameraListIDs)
                            }
                        })
                }
            }
            getDeviceCamera()

        }, [])

        useEffect(() => {
            async function getCameraPresenceDetectorID() {
                if (!isNew) {
                    let getPresenceDetectorPromises = []
                    cameraListIDs.forEach(cID => {
                        getPresenceDetectorPromises.push(new Promise((resolve, reject) => {
                            const url = 'http://'+window.location.hostname+':3000' + '/tabel_where/presence_detector/id_camera/' + cID
                            fetch(url)
                                .then(response => response.json())
                                .then(data => {
                                    const res = data.result
                                    if (res.length > 0) {
                                        resolve(res[0].id)
                                    }else{
                                        console.log('kosong resnya cID'+cID,data)
                                        reject(res)
                                    }
                                })
                                .catch(error=>{
                                    console.log('error:',error)
                                    reject(error)
                                })
                        }))
                    })

                    if (getPresenceDetectorPromises.length > 0) {
                        const newPresenceDetectorIDs = await Promise.all(getPresenceDetectorPromises).catch(e=>console.log('error cuk',e))
                        setPresenceDetectorIDs(newPresenceDetectorIDs)
                    }
                }
            }
            getCameraPresenceDetectorID()
        }, [cameraListIDs])

        useEffect(() => {
            function getDesc() {
                const idx = yolo_model_list.findIndex(x => x.name == deviceYoloModel)
                if (idx >= 0) {
                    setYoloModelDesc(yolo_model_list[idx].desc)
                }
            }

            getDesc()
        }, [deviceYoloModel])

        useEffect(() => {
            setIsNew((deviceID == null))
        }, [deviceID])

        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(e.target)
            const { presence_detector, pd_host, pd_treshold, ...data } = Object.fromEntries(formData)
            console.log(data)

            const url_query = '?' + new URLSearchParams(data).toString()
            let url = 'http://'+window.location.hostname+':3000' + '/tabel/device/insert' + url_query
            if (!isNew) {
                url = 'http://'+window.location.hostname+':3000' + '/tabel/device/update/' + deviceID + url_query
            }
            // fetch get then redirect
            fetch(url)
                .then(response => response.json())
                .then(data2 => {
                    console.log(data2)

                    const newDeviceId = data2.insertId

                    const pdData = {
                        device_id: newDeviceId,
                        host: (pd_host == undefined) ? 'localhost' : pd_host,
                        treshold: (pd_treshold == undefined) ? 0.5 : pd_treshold
                    }

                    // setDeviceID(newDeviceId)

                    let pdUrl = 'http://'+window.location.hostname+':3000' + '/tabel/presence_detector_device/insert'
                    if (pdID != null) {
                        pdUrl = 'http://'+window.location.hostname+':3000' + '/tabel/presence_detector_device/update/' + pdID
                    }
                    pdUrl += '?' + new URLSearchParams(pdData).toString()

                    fetch(pdUrl)
                        .then(response => response.json())
                        .then(data3 => {
                            console.log(data3)

                            navigate('/')
                        })
                        .catch(error => {
                            console.error('Error:', error)
                        })

                    // navigate('/')
                })
                .catch(error => {
                    console.error('Error:', error)
                })
        }

        function onYoloModelChange(e) {
            setDeviceYoloModel(e.target.value)
        }

        function onIPChange(e) {
            // check ip format
            const ip = e.target.value
            const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
            setDeviceIpisValid(ipRegex.test(ip))
            if (ipRegex.test(ip)) {
                setDeviceIP(ip)
                setDeviceIPDesc('✅ format IP address benar')
            } else {
                setDeviceIPDesc('❌ format IP address salah')
            }
        }

        function onPresenceDetectorChange(e) {
            setDevicePresenceDetector(e.target.checked)
        }

        function onPdHostChange(e) {
            const ip = e.target.value
            const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
            setPdHostIsValid(ipRegex.test(ip))
            if (ipRegex.test(ip)) {
                setPdHost(ip)
                setPdHostDesc('✅ format IP address benar')
            } else {
                setPdHostDesc('❌ format IP address salah')
            }
        }

        async function onDeleteDevice() {
            let camera_id_list = cameraListIDs
            let device_camera_id_list = deviceCameraIDs
            let presence_detector_id_list = presenceDetectorIDs
            let presence_detector_device_id = pdID

            let promises_delete_presence_detector = []
            let promises_delete_device_camera = []
            let promises_delete_camera_list = []

            for (let i = 0; i < presence_detector_id_list.length; i++) {
                const pdID = presence_detector_id_list[i]
                const dcID = device_camera_id_list[i]
                const cID = camera_id_list[i]

                promises_delete_presence_detector.push(deletePresenceDetector(pdID))
                promises_delete_device_camera.push(deleteDeviceCamera(dcID))
                promises_delete_camera_list.push(deleteCameraList(cID))
            }

            await Promise.all(promises_delete_presence_detector)
            await Promise.all(promises_delete_device_camera)
            await Promise.all(promises_delete_camera_list)
            await deletePresenceDetectorDevice(presence_detector_device_id)
            await deleteDevice()

            // navigate('/')
            window.location = '/'
        }

        async function deleteDevice() {
            const url = 'http://'+window.location.hostname+':3000' + '/tabel/device/delete/' + deviceID

            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        resolve(data)
                    })
                    .catch(error => {
                        console.log('error:', error)
                        reject(error)
                    })
            })

        }


        async function deletePresenceDetectorDevice(presenceDetectorDeviceID) {
            const url = 'http://'+window.location.hostname+':3000' + '/tabel/presence_detector_device/delete/' + presenceDetectorDeviceID

            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        resolve(data)
                    })
                    .catch(error => {
                        console.log('error:', error)
                        reject(error)
                    })
            })
        }

        async function deletePresenceDetector(presenceDetectorID) {
            const url = 'http://'+window.location.hostname+':3000' + '/tabel/presence_detector/delete/' + presenceDetectorID

            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        resolve(data)
                    })
                    .catch(error => {
                        console.log('error:', error)
                        reject(error)
                    })
            })
        }

        async function deleteDeviceCamera(deviceCameraID) {
            const url = 'http://'+window.location.hostname+':3000' + '/tabel/device_camera/delete/' + deviceCameraID

            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        resolve(data)
                    })
                    .catch(error => {
                        console.log('error:', error)
                        reject(error)
                    })
            })
        }

        async function deleteCameraList(camera_id) {
            const url = 'http://'+window.location.hostname+':3000' + '/tabel/camera_list/delete/' + camera_id

            return new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        resolve(data)
                    })
                    .catch(error => {
                        console.log('error:', error)
                        reject(error)
                    })
            })
        }

        return (
            <>
                {/* <pre>{JSON.stringify({cameraListIDs,deviceCameraIDs,presenceDetectorIDs,pdID,deviceID},null,2)}</pre> */}
                <div className="container my-4">
                    <div className="row">
                        <div className="col-md-10 offset-1 offset-xs-0 col-xs-12">
                            <div className="card">
                                <form action="" onSubmit={onSubmit}>
                                    <div className="card-body">

                                        <SubJudul judul="Identitas" />

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="name">Nama Perangkat</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="text" id="name" name="name" className="form-control" defaultValue={deviceName} onChange={e => setDeviceName(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="processor">Jenis Processor</label>
                                            </div>
                                            <div className="col-md-9">
                                                <select name="processor" id="processor" className="form-control text-uppercase" defaultValue={deviceProcessor} onChange={e => setDeviceProcessor(e.target.value)}>
                                                    <option value="vga">vga</option>
                                                    <option value="cpu">cpu</option>
                                                    <option value="jetson">jetson</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="ip">IP Address</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="text" id="ip" name="ip" className="form-control" defaultValue={deviceIP} onChange={onIPChange} />
                                                <div className={"badge bg-" + (deviceIpisValid ? "success" : "danger")}>{deviceIPDesc}</div>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="yolo_model">Model AI</label>
                                            </div>
                                            <div className="col-md-9">
                                                <select name="yolo_model" id="yolo_model" class="form-control text-uppercase" defaultValue={deviceProcessor} onChange={onYoloModelChange}>
                                                    {yolo_model_list.map((model) => <option value={model.name}>{model.name}</option>)}
                                                </select>
                                                <div className="badge bg-secondary">{yoloModelDesc}</div>
                                            </div>
                                        </div>

                                        <div className={"row" + (devicePresenceDetector ? " mb-5" : " mb-3")}>
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="presence_detector">Aktifkan Presence Detector</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="checkbox" id="presence_detector" name="presence_detector" className="form-check-input" defaultChecked={devicePresenceDetector} onChange={onPresenceDetectorChange} />
                                            </div>
                                        </div>

                                        {(devicePresenceDetector) ? <>
                                            <SubJudul judul="Presence Detector" />

                                            <div className="row mb-3">
                                                <div className="col-md-3 text-end">
                                                    <label htmlFor="pd_host">IP Server Directs</label>
                                                </div>
                                                <div className="col-md-9">
                                                    <input type="text" className="form-control text-uppercase" id="pd_host" name="pd_host" defaultValue={pdHost} onChange={onPdHostChange} />
                                                    <div className={"badge bg-" + (pdHostIsValid ? "success" : "danger")}>{pdHostDesc}</div>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-3 text-end">
                                                    <label htmlFor="pd_treshold">Treshold Gap Kendaraan</label>
                                                </div>
                                                <div className="col-md-9">
                                                    <div className="input-group">
                                                        <input type="number" className="form-control text-uppercase" id="pd_treshold" name="pd_treshold" step={0.1} defaultValue={pdTreshold} onChange={(e) => setPdTreshold(e.target.value)} />
                                                        <div className="input-group-text">Detik</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </> : <></>}

                                    </div>
                                    <div className="card-footer">
                                        <div className="d-grid gap-2">
                                            <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                        {(!isNew) ? <>
                                            <div className="d-grid gap-2 mt-3">
                                                <button type="button" className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modalDelete">Hapus Perangakat</button>
                                            </div>
                                        </> : <></>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="modalDelete" tabindex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h1 className="modal-title fs-5">PENTING!</h1>
                            </div>
                            <div className="modal-body">
                                <p className="text-danger">
                                    Anda akan <b>menghapus data perangkat {deviceName}</b> dan semua kamera yang terdaftar disitu. Pastikan anda mengetahui bahwa tindakan ini akan <b>menghapus semua data yang terkait dengan perangkat {deviceName} dan semua kamera yang terdaftar disitu</b>.
                                </p>
                                <p className="text-danger fw-semibold">
                                    Silahkan ketik nama perangkat ({deviceName}) pada form di bawah untuk memastikan anda melakukan tindakan ini dengan kesadaran penuh. Lalu klik tombol "hapus data".
                                </p>
                            </div>
                            <div className="modal-footer">
                                <input type="text" className="form-control" placeholder={deviceName} onChange={onConfirmTextUpdate} />
                                <button type="button" className="btn btn-danger" disabled={!confirmTextCorrect} onClick={onDeleteDevice}>Hapus Data</button>
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function Hero({ }) {
        return (
            <>
                <div className="bg-light">
                    <div className="container">
                        <div className="row">
                            <div className="col my-3">
                                <Link to='/' className="btn btn-lg btn-outline-success float-end text-uppercase bebasnue">Kembali</Link>
                                <h1 className="display-1 anton text-uppercase">
                                    {isNew ? <>
                                        tambah perangkat baru
                                    </> : <>
                                        edit perangkat
                                    </>}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function SubJudul({ judul = '' }) {
        return <div className="row mb-3 align-items-center">
            <div className="col-auto">
                <h3 className="display-5 bebasnue">{judul}</h3>
            </div>
            <div className="col">
                <hr />
            </div>
        </div>
    }
}