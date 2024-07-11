import { Link } from 'react-router-dom'
import { useEffect, useState } from "react"
import axios from "axios"
import '../Hero.css'

const setting = require('../setting.json')

export function Home({ }) {
    const [deviceDataList, setDeviceDataList] = useState([])

    useEffect(() => {
        async function getDevices() {
            let url = 'http://' + window.location.hostname + ':3000'
            if (setting.isLocal) {
                url = url + '/tabel_where/device/id/' + setting.device_id
            } else {
                url = url + '/tabel/device'
            }
            const response = await axios.get(url)
            if (response.data.result) {
                let newDeviceDataList = response.data.result
                newDeviceDataList.forEach(async (deviceData, i) => {
                    const device_cam_url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device_camera/device_id/' + deviceData.id
                    console.log(device_cam_url)
                    const device_cam_response = await axios.get(device_cam_url)
                    let device_camera_list = []
                    if (device_cam_response.data.result) {
                        device_cam_response.data.result.forEach(async device_camera => {
                            let { device_id, ...device_cam_data } = device_camera
                            console.log(device_cam_data)

                            // const cam_url = 'http://'+window.location.hostname+':3000' + '/tabel_where/camera_list/id/' + device_cam_data.camera_id
                            // console.log(cam_url)
                            // const cam_response = await axios.get(cam_url)
                            // if (cam_response.data.result) {
                            //     if (cam_response.data.result.length > 0) {
                            //         device_cam_data = { ...device_cam_data, ...cam_response.data.result[0] }

                            //         console.log(device_cam_data)
                            //     }
                            // }

                            device_camera_list.push(device_cam_data)
                        })
                    }
                    newDeviceDataList[i].camera = device_camera_list
                    setDeviceDataList(newDeviceDataList)
                })
            }

        }
        getDevices()
    }, [])

    return (
        <>
            {/* <pre>{JSON.stringify(setting, null, 2)}</pre>
            <pre>{JSON.stringify(deviceDataList, null, 2)}</pre> */}
            <Hero />
            {deviceDataList.map((deviceData, i) => (
                <DeviceList nama_perangkat={deviceData.name} id_perangkat={deviceData.id} ip_perangkat={deviceData.ip} jenis_processor={deviceData.processor} model_ai={deviceData.yolo_model} jenis_lokasi={deviceData.camera && deviceData.camera.length > 0 ? (deviceData.camera[0].jenis_jalan ? deviceData.camera[0].jenis_jalan.replace(/_/g, ' ') : '') : ''} />
            ))}
        </>
    )

    function Hero() {
        return (
            <>
                <div className="hero py-3">
                    <div className='container'>
                        <div className="row my1">
                            <div className="col">
                                <Link to={"add_device"} className="btn btn-lg btn-outline-success float-end btn-add">
                                    <i className="fa-solid fa-plus"></i>
                                    <span className="text">Tambah Perangakat</span>
                                </Link>
                            </div>
                        </div>
                        <div className='row mt-5 mb-4'>
                            <div className='col text-center'>
                                <h1 className='display-1 anton text-uppercase'>
                                    AI Streamer
                                    <small className='lead d-block opensans'>Dashboard Data Perangkat AI Detektor Kendaraan</small>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function DeviceList({ nama_perangkat = '', id_perangkat = 1, ip_perangkat = '192.168.0.1', jenis_processor = 'jetson', model_ai = 'jv_indo_m.pt', jenis_lokasi = '', nama_lokasi = '' }) {
        const [cameraListData, setCameraListData] = useState([])

        const [dockerSudahRunning, setDockerSudahRunning] = useState(false)
        const [dockerBtnIsLoading, setDockerbtnIsLoading] = useState(false)
        const [dockerBtnStatus, setDockerBtnStatus] = useState('')

        async function activateDocker() {
            setDockerbtnIsLoading(true)
            setDockerBtnStatus('Preparing docker...')
            const url_prepare = 'http://' + window.location.hostname + ':9000' + '/prepare_ai_docker/' + id_perangkat
            const response_prepare = await axios.get(url_prepare)
            setDockerBtnStatus('Building docker...')
            const url_build = 'http://' + window.location.hostname + ':9000' + '/build_ai_docker/'
            const response_build = await axios.get(url_build)
            setDockerBtnStatus('Running docker...')
            const url_run = 'http://' + window.location.hostname + ':9000' + '/run_ai_docker/' + id_perangkat
            const response_run = await axios.get(url_run)
            setDockerbtnIsLoading(false)
            setDockerSudahRunning(true)
        }

        async function restartDocker() {
            setDockerbtnIsLoading(true)
            setDockerBtnStatus('Preparing docker...')
            const url_prepare = 'http://' + window.location.hostname + ':9000' + '/prepare_ai_docker/' + id_perangkat
            const response_prepare = await axios.get(url_prepare)
            setDockerBtnStatus('Running docker...')
            const url_run = 'http://' + window.location.hostname + ':9000' + '/run_ai_docker/' + id_perangkat
            const response_run = await axios.get(url_run)
            setDockerbtnIsLoading(false)
            setDockerSudahRunning(true)
        }

        useEffect(() => {
            async function getCameraList() {
                let url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device_camera/device_id/' + id_perangkat
                const response = await axios.get(url)
                if (response.data.result) {
                    let newCameraListData = []

                    const cam_promises = response.data.result.map(async device_camera => {
                        const cam_url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/camera_list/id/' + device_camera.camera_id
                        return axios.get(cam_url)
                    })

                    const cam_responses = await Promise.all(cam_promises)

                    cam_responses.forEach(cam_response => {
                        if (cam_response.data.result) {
                            if (cam_response.data.result.length > 0) {
                                newCameraListData.push(cam_response.data.result[0])
                            }
                        }
                    })

                    setCameraListData(newCameraListData)
                }
            }
            getCameraList()
        }, [])

        return (
            <>
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-auto">
                            <h3 className='display-4 bebasnue'>{nama_perangkat}</h3>
                        </div>
                        <div className="col align-self-center">
                            <hr />
                        </div>
                        <div className="col-auto align-self-center">
                            <Link to={'add_kamera/' + id_perangkat} className="ms-2 btn btn-outline-success float-end bebasnue">Tambah Kamera</Link>
                            <Link to={'setting/' + id_perangkat} className="btn btn-outline-success float-end bebasnue">Setting Perangkat</Link>

                            <button className="btn btn-outline-success float-end bebasnue me-2" onClick={(dockerSudahRunning ? restartDocker : activateDocker)} disabled={dockerBtnIsLoading}>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={!dockerBtnIsLoading}></span>
                                {dockerBtnIsLoading ? dockerBtnStatus : (dockerSudahRunning ? 'Restart' : 'Start') + ' Program AI'}
                            </button>
                        </div>
                    </div>
                    <div className="row mt-1">
                        <div className="col">
                            <p>
                                <span className="me-2">
                                    <b>ID Perangkat:</b> {id_perangkat}
                                </span>
                                |
                                <span className="mx-2">
                                    <b>IP Perangkat:</b> {ip_perangkat}
                                </span>
                                |
                                <span className="mx-2">
                                    <b>Jenis Processor:</b> {jenis_processor}
                                </span>
                                |
                                <span className="mx-2">
                                    <b>Model AI:</b> {model_ai}
                                </span>
                                |
                                <span className="mx-2">
                                    <b>Jenis Lokasi:</b> {jenis_lokasi}
                                </span>
                                |
                                <span className="mx-2">
                                    <b>Nama Lokasi:</b> {nama_lokasi}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row mt-3">
                        {cameraListData.map((cam, j) => (
                            <div className="col-md-6 mb-4">
                                <CameraList id_camera={cam.id} online={/*(j != 1)*/ true} />
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )

        function CameraList({ id_camera = 1, online = true }) {
            const [name, setName] = useState('')

            const [mpIN, setMpIN] = useState(0)
            const [mpOUT, setMpOUT] = useState(0)
            const [smIN, setSmIN] = useState(0)
            const [smOUT, setSmOUT] = useState(0)
            const [ksbIN, setKsbIN] = useState(0)
            const [ksbOUT, setKsbOUT] = useState(0)
            const [kstIN, setKstIN] = useState(0)
            const [kstOUT, setKstOUT] = useState(0)
            const [bbIN, setBbIN] = useState(0)
            const [bbOUT, setBbOUT] = useState(0)
            const [tbIN, setTbIN] = useState(0)
            const [tbOUT, setTbOUT] = useState(0)

            const [startDate, setStartDate] = useState(new Date().toISOString().substr(0, 10))
            const [endDate, setEndDate] = useState(new Date().toISOString().substr(0, 10))


            const [downloadUrl, setDownloadUrl] = useState('')
            const [isWaitingDownload, setIswaitingDownload] = useState(false)
            const [downloadPercentage, setDownloadPercentage] = useState(0)

            async function downloadExcel() {
                setIswaitingDownload(true)
                setDownloadPercentage(0)
                try {
                    const response = await axios.get(downloadUrl, {
                        responseType: 'blob',
                        onDownloadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            setDownloadPercentage(percentCompleted)
                        }
                    })

                    const blob = new Blob([response.data])
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'data.xlsx'
                    link.click()

                    setIswaitingDownload(false)
                } catch (error) {
                    setIswaitingDownload(false)
                    setDownloadPercentage(0)
                    alert('Maaf terjadi kesalahan saat men-download file excel')
                }
            }

            useEffect(() => {
                setDownloadUrl('http://' + window.location.hostname + ':3000' + '/report_excel/' + id_camera + '?start_date=' + startDate + '&end_date=' + endDate)
            }, [startDate, endDate])

            useEffect(() => {
                setDownloadUrl('http://' + window.location.hostname + ':3000' + '/report_excel/' + id_camera + '?start_date=' + startDate + '&end_date=' + endDate)
            }, [])


            useEffect(() => {
                async function getStatistik() {
                    const url = 'http://' + window.location.hostname + ':3000' + '/report_jam/' + id_camera
                    const response = await axios.get(url)
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            response.data.result.forEach(stat => {
                                setMpIN(mpIN + stat.mp_in)
                                setMpOUT(mpOUT + stat.mp_out)
                                setSmIN(smIN + stat.sm_in)
                                setSmOUT(smOUT + stat.sm_out)
                                setKsbIN(ksbIN + stat.ks_b_in)
                                setKsbOUT(ksbOUT + stat.ks_b_out)
                                setKstIN(kstIN + stat.ks_t_in)
                                setKstOUT(kstOUT + stat.ks_t_out)
                                setBbIN(bbIN + stat.bb_in)
                                setBbOUT(bbOUT + stat.bb_out)
                                setTbIN(tbIN + stat.tb_in)
                                setTbOUT(tbOUT + stat.tb_out)
                            })
                        }
                    }
                }
                getStatistik()

                async function getName() {
                    const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/camera_list/id/' + id_camera
                    const response = await axios.get(url)
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            setName(response.data.result[0].name)
                        }
                    }
                }
                getName()
            }, [])
            return <div className="card">
                <div className="card-body">
                    {/* {(online) ? (
                        <>
                            <span className="badge bg-success float-end px-2 py-1">
                                <span className='blinking me-1'>
                                    &#9898;
                                </span>
                                ONLINE
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="badge bg-danger float-end px-2 py-1">
                                <span className='blinking me-1'>
                                    &#9888;
                                </span>
                                OFFLINE
                            </span>
                        </>
                    )} */}
                    <span className="badge bg-dark mx-2 opensans float-end">id: {id_camera}</span>
                    <h2 className={"card-title text-uppercase anton" + (online ? '' : ' text-danger')}>
                        {name}
                        <small>
                        </small>
                    </h2>
                    {(online) ? (
                        <></>
                    ) : (<>
                        <div className='d-grid gap-2 my-3'>
                            <span className='badge bg-danger py-2'>Terakhir online: {new Date(Date.now() - (3 * 60 * 60 * 1000)).toLocaleString()}</span>
                        </div>
                    </>)}
                    <p className="card-text">🚘 Jumlah rata-rata kendaraan per-jam hari ini:</p>
                    <div className="row mb-4">
                        {[
                            { nama: '🚙 Mobil', in: mpIN, out: mpOUT },
                            { nama: '🏍️ Motor', in: smIN, out: smOUT },
                            { nama: '🚐 Bus', in: ksbIN, out: ksbOUT },
                            { nama: '🚚 Truck', in: kstIN, out: kstOUT },
                            { nama: '🚌 Bus Besar', in: bbIN, out: bbOUT },
                            { nama: '🚛 Truck Besar', in: tbIN, out: tbOUT },
                        ].map((kendaraan, k) => (
                            <div className="col-4 mb-3">
                                <div className={"card text-white " + (online ? 'bg-primary' : 'bg-danger')}>
                                    <div className="card-header small">{kendaraan.nama}</div>
                                    <ul className="list-group list-group-flush">
                                        <li className={"list-group-item bg-light " + (online ? 'text-primary' : 'text-danger')}>In: {kendaraan.in}</li>
                                        <li className={"list-group-item bg-light " + (online ? 'text-primary' : 'text-danger')}>Out: {kendaraan.out}</li>
                                        <li className={"list-group-item bg-light " + (online ? 'text-primary' : 'text-danger')}><b>Total: {kendaraan.in + kendaraan.out}</b></li>
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="d-grid gap-2">
                        <Link to={'view/' + id_perangkat + '/' + id_camera} className="btn btn-dark">
                            Buka Kamera
                            <b className="mx-2">
                                📷
                            </b>
                        </Link>
                    </div>
                    <div className="row align-items-center mt-3">
                        <div className="col">
                            <div className="d-grid gap-2">
                                <Link to={'setting_kamera/' + id_camera} className="btn btn-outline-dark">
                                    Setting Kamera
                                    <b className="mx-2">
                                        ⚙️
                                    </b>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="d-grid gap-2">
                                <Link to={'chart/' + id_perangkat + '/' + id_camera} className="btn btn-outline-dark">
                                    Lihat Data
                                    <b className="mx-2">
                                        📰
                                    </b>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="d-grid gap-2">
                                {/* <a href="#" className="btn btn-outline-dark" target='_blank'>
                                    Download Data
                                    <b className="mx-2">
                                        📥
                                    </b>
                                </a> */}
                                <button type="button" className={"btn btn-outline-dark" + (isWaitingDownload ? ' disabled' : '')} onClick={downloadExcel}>
                                    {
                                        (isWaitingDownload) ?
                                            <>
                                                ⏳Downloading... ({downloadPercentage}%)
                                            </>
                                            :
                                            <>
                                                Download Data
                                                <b className="mx-2">
                                                    📥
                                                </b>
                                            </>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        }
    }

}