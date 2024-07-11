import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
const setting = require('../setting.json')

export function SettingKamera({ }) {
    const navigate = useNavigate()

    const { camera_id, device_id } = useParams()
    const windowIP = (window.location.hostname == 'localhost') ? '127.0.0.1' : window.location.hostname

    const isNew = (camera_id == null)

    const [cameraID, setCameraID] = useState(camera_id)
    const [deviceID, setDeviceID] = useState(device_id)

    return (
        <>
            <Hero />
            <FormCamera />
        </>
    )

    function FormCamera({ }) {
        const [nama, setNama] = useState('')
        const [rtsp, setRtsp] = useState('')
        const [rtspPreviewUrl, setRtspPreviewUrl] = useState('')
        const [presenceDetector, setPresenceDetector] = useState(true)

        const [outputRes, setOutputRes] = useState('240p')

        const [line_start_x, set_line_start_x] = useState(0.0)
        const [line_start_y, set_line_start_y] = useState(0.0)
        const [line_end_x, set_line_end_x] = useState(0.0)
        const [line_end_y, set_line_end_y] = useState(0.0)

        const [directPdID, setDirectPdID] = useState(null)
        const [pdFase, setPdFase] = useState(0)

        const [deviceCameraID, setDeviceCameraID] = useState(null)
        const [presenceDetectorID, setPresenceDetectorID] = useState(null)

        const [showLineEdit, setShowLineEdit] = useState(false)

        const [confirmTextCorrect, setConfirmTextCorrect] = useState(false)

        const [jenisJalan, setJenisJalan] = useState('simpang')

        useEffect(() => {
            const newRtspPreviewUrl = 'http://' + windowIP + ':5000/video_feed?rtsp_url=' + rtsp
            setRtspPreviewUrl(newRtspPreviewUrl)
        }, [rtsp])

        useEffect(() => {
            function getPresenceDetectorID() {
                const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/presence_detector/id_camera/' + camera_id
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        const res = data.result
                        res.forEach((item) => {
                            if (item.device_id == device_id) {
                                setPresenceDetectorID(item.id)
                                setDirectPdID(item.direct_pd_id)
                                setPdFase(item.fase)
                            }
                        })
                    })
                    .catch(error => {
                        console.error('Error:', error)
                    })
            }
            function getDeviceCameraID() {
                const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device_camera/camera_id/' + camera_id
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        const res = data.result
                        res.forEach((item) => {
                            if (item.device_id == device_id) {
                                setDeviceCameraID(item.id)
                            }
                        })
                    })
                    .catch(error => {
                        console.error('Error:', error)
                    })
            }
            function getCamera() {
                const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/camera_list/id/' + camera_id
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        const res = data.result
                        if (res.length > 0) {
                            setCameraID(res[0].id)
                            setDeviceID(res[0].device_id)
                            setNama(res[0].name)
                            setRtsp(res[0].rtsp)
                            set_line_start_x(res[0].ln_st_x)
                            set_line_start_y(res[0].ln_st_y)
                            set_line_end_x(res[0].ln_en_x)
                            set_line_end_y(res[0].ln_en_y)
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error)
                    })
            }
            if (!isNew) {
                getCamera()
                getDeviceCameraID()
                getPresenceDetectorID()
            }
        }, [])

        function onConfirmTextUpdate(e) {
            const confirmText = e.target.value
            setConfirmTextCorrect(confirmText == nama)
        }

        function onDeleteKamera() {
            console.log('delete PD');
            deletePresenceDetector(
                (data1) => {
                    console.log('delete Device camera');
                    deleteDeviceCamera((data2) => {
                        console.log('delete camera');
                        deleteCameraList((data3) => {
                            // alert('terhapus!')
                            // navigate('/')
                            window.location = '/'
                        })
                    })
                }
            )
        }


        function deletePresenceDetector(callback = (data) => { console.log(data) }) {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel/presence_detector/delete/' + presenceDetectorID

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    callback(data)
                })
                .catch(error => {
                    console.log('error:', error)
                    callback({ error })
                })
        }

        function deleteDeviceCamera(callback = (data) => { console.log(data) }) {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel/device_camera/delete/' + deviceCameraID

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    callback(data)
                })
                .catch(error => {
                    console.log('error:', error)
                    callback({ error })
                })
        }

        function deleteCameraList(callback = (data) => { console.log(data) }) {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel/camera_list/delete/' + camera_id

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    callback(data)
                })
                .catch(error => {
                    console.log('error:', error)
                    callback({ error })
                })
        }

        function onSubmit(e) {
            e.preventDefault()

            const formData = new FormData(e.target)
            let { direct_pd_id, pdFase, presence_detector, jenis_jalan, ...data } = Object.fromEntries(formData)
            if (directPdID == undefined) {
                direct_pd_id = 0
            }
            if (pdFase == undefined) {
                pdFase = 0
            }
            if (presence_detector == undefined) {
                presence_detector = 'N'
            }

            let url = 'http://' + window.location.hostname + ':3000' + '/tabel/camera_list/insert'
            if (!isNew) {
                url = 'http://' + window.location.hostname + ':3000' + '/tabel/camera_list/update/' + camera_id
            }
            url += '?' + new URLSearchParams(data).toString()

            fetch(url)
                .then(response => response.json())
                .then(data2 => {
                    console.log(data2)

                    const newCameraID = data2.insertId

                    let deviceCameraData = {
                        device_id: device_id,
                        camera_id: newCameraID,
                        is_set_to_run: 'Y',
                        jenis_jalan: 'ruas_dalam_kota'
                    }

                    let deviceCameraUrl = 'http://' + window.location.hostname + ':3000' + '/tabel/device_camera/insert'
                    deviceCameraUrl += '?' + new URLSearchParams(deviceCameraData).toString()

                    if (!isNew) {
                        deviceCameraUrl = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device_camera/camera_id/' + camera_id
                    }

                    fetch(deviceCameraUrl)
                        .then(response => response.json())
                        .then(data3 => {
                            console.log(data3)
                            let presenceDetectorUrl = 'http://' + window.location.hostname + ':3000' + '/tabel/presence_detector/insert'
                            let presenceDetectorData = {
                                id_camera: newCameraID,
                                active: presence_detector ? 'Y' : 'N',
                                direct_pd_id: (direct_pd_id == undefined) ? 0 : direct_pd_id,
                                fase: (pdFase == undefined) ? 1 : pdFase
                            }

                            if (!isNew) {
                                presenceDetectorUrl = 'http://' + window.location.hostname + ':3000' + '/tabel/presence_detector/update/' + presenceDetectorID
                                presenceDetectorData = {
                                    active: presence_detector ? 'Y' : 'N',
                                    direct_pd_id: (direct_pd_id == undefined) ? 0 : direct_pd_id,
                                    fase: (pdFase == undefined) ? 1 : pdFase
                                }
                            }

                            presenceDetectorUrl += '?' + new URLSearchParams(presenceDetectorData).toString()

                            fetch(presenceDetectorUrl)
                                .then(response => response.json())
                                .then(data4 => {
                                    console.log(data4)

                                    // const url_prepare = 'http://' + window.location.hostname + ':9000' + '/prepare_ai_docker/' + newCameraID
                                    // fetch(url_prepare)
                                    //     .then(response => {
                                    //         if (isNew) {
                                    //             const url_run = 'http://' + window.location.hostname + ':9000' + '/run_ai_docker/' + newCameraID
                                    //             fetch(url_run)
                                    //                 .then(response => {
                                    //                     console.log('success')
                                    //                     // redirect
                                    //                     navigate('/')
                                    //                 })
                                    //                 .catch(error => {
                                    //                     console.error('Error:', error)
                                    //                 })
                                    //         } else {
                                    //             const url_build = 'http://' + window.location.hostname + ':9000' + '/build_ai_docker/'
                                    //             fetch(url_build)
                                    //                 .then(response => {
                                    //                     const url_run = 'http://' + window.location.hostname + ':9000' + '/run_ai_docker/' + newCameraID
                                    //                     fetch(url_run)
                                    //                         .then(response => {
                                    //                             console.log('success')
                                    //                             // redirect
                                    //                             navigate('/')
                                    //                         })
                                    //                         .catch(error => {
                                    //                             console.error('Error:', error)
                                    //                             navigate('/')
                                    //                         })
                                    //                 })
                                    //                 .catch(error => {
                                    //                     console.error('Error:', error)
                                    //                     navigate('/')
                                    //                 })
                                    //         }
                                    //     })

                                    // redirect
                                    navigate('/')
                                })
                                .catch(error => {
                                    console.error('Error:', error)
                                    navigate('/')
                                })

                            // redirect
                            // navigate('/')
                        })
                        .catch(error => {
                            console.log('Error:', error)
                            navigate('/')
                        })
                    // redirect
                    // navigate('/')
                })
                .catch(error => {
                    console.error('Error:', error)
                    navigate('/')
                })
        }

        return (
            <>
                <div className="container my-4">
                    <div className="row">
                        <div className="col-md-10 offset-1 offset-xs-0 colxs-12">
                            <div className="card">
                                <form action="" onSubmit={onSubmit}>
                                    <div className="card-body container-fluid">

                                        <SubJudul judul="Identitas Kamera" />

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="name">Nama Kamera</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="text" className="form-control" id="name" name="name" onChange={(e) => setNama(e.target.value)} value={nama} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="rtsp">Alamat RTSP</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="text" className="form-control" id="rtsp" name="rtsp" onChange={(e) => setRtsp(e.target.value)} value={rtsp} />
                                            </div>
                                        </div>

                                        {/* <div className="row mb-3">
                                            <div className="col-md-9 offset-3 mt-3">
                                                <img src={rtspPreviewUrl} alt="" className="img-fluid img-thumbnail rounded" />
                                            </div>
                                        </div> */}

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="">Garis Deteksi</label>
                                            </div>
                                            <div className="col-md-9">
                                                <CanvasCameraLine mjpeg_url={rtspPreviewUrl} line_start_x={line_start_x} line_start_y={line_start_y} line_end_x={line_end_x} line_end_y={line_end_y} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="output_res">Resolusi Ouput</label>
                                            </div>
                                            <div className="col-md-9">
                                                <select name="output_res" id="output_res" className="form-control" onChange={(e) => setOutputRes(e.target.value)} value={outputRes}>
                                                    <option value="240p">240p (320x240)</option>
                                                    <option value="360p">360p (640x360)</option>
                                                    <option value="480p">480p (854x480)</option>
                                                    <option value="720p">720p (1280x720)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={presenceDetector ? "row mb-5" : "row mb-3"}>
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="presence_detector">Aktifkan Presence Detector</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="checkbox" name="presence_detector" id="presence_detector" onChange={(e) => setPresenceDetector(e.target.checked)} checked={presenceDetector} />
                                            </div>
                                        </div>

                                        {(presenceDetector) ? <>
                                            <SubJudul judul="Presence Detector" />

                                            <div className="row mb-3">
                                                <div className="col-md-3 text-end">
                                                    <label htmlFor="direct_pd_id">ID Presence Detector</label>
                                                </div>
                                                <div className="col-md-9">
                                                    <input type="number" className="form-control" id="direct_pd_id" name="direct_pd_id" min={1} value={directPdID} onChange={(e) => setDirectPdID(e.target.value)} />
                                                    <div className="badge bg-secondary">
                                                        * Sesuaikan dengan Aplikasi Directs
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-3 text-end">
                                                    <label htmlFor="pdFase">
                                                        Nomor Fase ({pdFase})
                                                    </label>
                                                </div>
                                                <div className="col-md-9">
                                                    <input type="number" className="form-control" id="pdFase" name="pdFase" min={1} max={8} value={pdFase} onChange={(e) => setPdFase(e.target.value)} />
                                                    <div className="badge bg-secondary">
                                                        * Sesuaikan dengan Aplikasi Directs
                                                    </div>
                                                </div>
                                            </div>
                                        </> : <></>}

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="jenis_jalan">
                                                    Jenis Jalan
                                                </label>
                                            </div>
                                            <div className="col-mb-9">
                                                <select name="jenis_jalan" id="jenis_jalan" className="form-control">
                                                    <option value="simpang">Simpang</option>
                                                    <option value="ruas_dalam_kota">Ruas dalam kota</option>
                                                    <option value="ruas_luar_kota">Ruas luar kota</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* TODO: bikin input data lokasi */}
                                        {(jenisJalan == 'simpang') ? <SubJudul judul="Simpang" /> : <></>}
                                        {(jenisJalan == 'ruas_dalam_kota') ? <SubJudul judul="Ruas Dalam Kota" /> : <></>}
                                        {(jenisJalan == 'ruas_luar_kota') ? <SubJudul judul="Ruas Luar Kota" /> : <></>}

                                    </div>
                                    <div className="card-footer">
                                        <div className="d-grid gap-2">
                                            <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                        {(!isNew) ? <>
                                            <div className="d-grid gap-2 mt-3">
                                                <button type="button" className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modalDelete">Hapus Kamera</button>
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
                                    Anda akan <b>menghapus data kamera {nama}</b>. Pastikan anda mengetahui bahwa tindakan ini akan <b>menghapus semua data yang terkait dengan kamera {nama}</b>.
                                </p>
                                <p className="text-danger fw-semibold">
                                    Silahkan ketik nama kamera ({nama}) pada form di bawah untuk memastikan anda melakukan tindakan ini dengan kesadaran penuh. Lalu klik tombol "hapus data".
                                </p>
                            </div>
                            <div className="modal-footer">
                                <input type="text" className="form-control" placeholder={nama} onChange={onConfirmTextUpdate} />
                                <button type="button" className="btn btn-danger" disabled={!confirmTextCorrect} onClick={onDeleteKamera}>Hapus Data</button>
                                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )

    }

    function CanvasCameraLine({ mjpeg_url = '', line_start_x = 0.0, line_start_y = 0.5, line_end_x = 1.0, line_end_y = 0.5 }) {
        // console.log('canvas camera line',{line_start_x, line_start_y, line_end_x, line_end_y})

        const canvas_ref = useRef(null)
        const [ln_st_x, set_ln_st_x] = useState(line_start_x)
        const [ln_st_y, set_ln_st_y] = useState(line_start_y)
        const [ln_en_x, set_ln_en_x] = useState(line_end_x)
        const [ln_en_y, set_ln_en_y] = useState(line_end_y)

        useEffect(() => {
            set_ln_st_x(line_start_x)
            set_ln_st_y(line_start_y)
            set_ln_en_x(line_end_x)
            set_ln_en_y(line_end_y)
        }, [line_start_x, line_start_y, line_end_x, line_end_y])

        let last_click_time = new Date()
        let last_flag_time = new Date()
        let last_flag = null

        let _ln_st_x = line_start_x
        let _ln_st_y = line_start_y
        let _ln_en_x = line_end_x
        let _ln_en_y = line_end_y

        function draw(ctx, canvas) {
            let full_w = ctx.canvas.width
            let full_h = ctx.canvas.height
            const w = (val) => full_w / 100 * val
            const h = (val) => full_h / 100 * val
            const line_width = 5

            let mouse_x = 0
            let mouse_y = 0

            const NETRAL = 0
            const START = 1
            const END = 2
            let mouse_flag = END

            let text_mouse = 'klik untuk hapus garis'

            // bg
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, w(100), h(100))
            teks('memuat gambar...', w(50), h(50), h(7.5))

            if (mjpeg_url == '') {
                console.log('no url')
                return
            }

            const image = new Image()
            image.src = mjpeg_url


            image.onload = () => {
                canvas.width = image.width
                canvas.height = image.height

                full_w = image.width
                full_h = image.height

                // const scale_factor = Math.min(canvas.width / image.width, canvas.height / image.height)

                // const lebar = image.width * scale_factor
                // const tinggi = image.height * scale_factor


                setInterval(() => {
                    renderGambar()
                }, 1000 / 30)
                renderGambar()
            }

            canvas.addEventListener('mousemove', (event) => {
                const { y, x } = posisiMouse(event)

                mouse_x = x
                mouse_y = y
                if (mouse_flag == START) {
                    _ln_en_x = mouse_x / full_w
                    _ln_en_y = mouse_y / full_h
                }
            })

            canvas.addEventListener('mousedown', (event) => {
                let new_click_time = new Date()
                const time_diff = new_click_time - last_click_time
                last_click_time = new_click_time

                // console.log('click time diff', time_diff);
                if (time_diff < 1000) {
                    return
                }

                const { y, x } = posisiMouse(event)

                mouse_flag++
                if (mouse_flag > END) mouse_flag = NETRAL

                let _x = x / full_w
                let _y = y / full_h

                switch (mouse_flag) {
                    case START:
                        _ln_st_x = _x
                        _ln_st_y = _y
                        _ln_en_x = mouse_x / full_w
                        _ln_en_y = mouse_y / full_h
                        text_mouse = 'klik titik akhir garis'
                        break;
                    case END:
                        _ln_en_x = _x
                        _ln_en_y = _y
                        // set_ln_st_x(_ln_st_x)
                        // set_ln_st_y(_ln_st_y)
                        // set_ln_en_x(_ln_en_x)
                        // set_ln_en_y(_ln_en_y)
                        text_mouse = 'klik untuk hapus garis'
                        setLine()
                        break;
                    case NETRAL:
                        _ln_st_x = 0
                        _ln_st_y = 0
                        _ln_en_x = 0
                        _ln_en_y = 0
                        text_mouse = 'klik titik awal garis'
                        break;

                    default:
                        break;
                }
            })

            function renderGambar() {
                const lebar = image.width
                const tinggi = image.height

                // clear
                ctx.clearRect(0, 0, w(100), h(100))

                // bg
                ctx.fillStyle = '#000'
                ctx.fillRect(0, 0, w(100), h(100))

                // gambar
                ctx.drawImage(image, w(50) - (lebar / 2), h(50) - (tinggi / 2), lebar, tinggi)

                if (last_flag != mouse_flag) {
                    const new_flag_time = new Date()
                    const time_diff = new_flag_time - last_flag_time
                    // console.log('flag time diff', time_diff);
                    if (time_diff > 3000) {
                        last_flag = mouse_flag
                        last_flag_time = new_flag_time
                    }
                }

                teks(text_mouse, mouse_x, mouse_y - h(3), h(3))
                ctx.fillStyle = '#fff'
                ctx.beginPath()
                ctx.arc(mouse_x, mouse_y, line_width / 2, 0, 2 * Math.PI)
                ctx.fill()

                ctx.strokeStyle = '#fff'
                garis(w(_ln_st_x * 100), h(_ln_st_y * 100), w(_ln_en_x * 100), h(_ln_en_y * 100))
            }

            function posisiMouse(event) {
                const rect = canvas.getBoundingClientRect()
                const scale_factor = Math.min(canvas.width / rect.width, canvas.height / rect.height)

                const y = (event.clientY - rect.top) * scale_factor
                const x = (event.clientX - rect.left) * scale_factor
                return { y, x }
            }

            function teks(tks, x, y, size = null) {
                ctx.font = ((size == null) ? h(10) : size) + 'px monospace'
                ctx.fillStyle = 'white'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                const txt_w = ctx.measureText(tks).width + (((size == null) ? h(10) : size) / 2)
                const txt_h = ((size == null) ? h(10) : size)
                ctx.fillStyle = '#fa4b2a'
                ctx.fillRect((x - (txt_w / 2)), (y - (txt_h / 2)), txt_w, txt_h)

                ctx.beginPath()

                ctx.fillStyle = '#fff'
                ctx.fillText(tks, x, y)
            }

            function garis(x0, y0, x1, y1) {
                ctx.beginPath()
                ctx.moveTo(x0, y0)
                ctx.lineTo(x1, y1)
                ctx.lineWidth = line_width
                ctx.stroke()
            }
        }

        const setupDraw = useCallback(() => {
            console.log('setup draw')
            const canvas = canvas_ref.current
            const context = canvas.getContext('2d')

            draw(context, canvas)
        })

        useEffect(() => {
            setupDraw()
        }, [mjpeg_url])
        // }, [draw, mjpeg_url, ln_st_x])

        function setLine() {
            set_ln_st_x(_ln_st_x)
            set_ln_st_y(_ln_st_y)
            set_ln_en_x(_ln_en_x)
            set_ln_en_y(_ln_en_y)
        }

        return (
            <>
                <canvas ref={canvas_ref} className="canvas" width={1920} height={1080} />
                <input type="hidden" name="ln_st_x" value={ln_st_x} />
                <input type="hidden" name="ln_st_y" value={ln_st_y} />
                <input type="hidden" name="ln_en_x" value={ln_en_x} />
                <input type="hidden" name="ln_en_y" value={ln_en_y} />
            </>
        )
    }

    function Hero({ }) {
        return (
            <>
                <div className="bg-light">
                    <div className="container">
                        <div className="row">
                            <div className="col mt-3 mb-3">
                                {/* <Link  className="ms-2 btn btn-lg btn-outline-success float-end text-uppercase bebasnue">Setting Kamera</Link> */}
                                <Link to={"/"} className="ms-2 btn btn-lg btn-outline-success float-end text-uppercase bebasnue">Kembali</Link>
                                <h1 className="display-1 anton text-uppercase">
                                    {isNew ? "Tambah Kamera" : "Setting Kamera " + camera_id}
                                </h1>
                                <nav className="breadcrumb">
                                    <span className="breadcrumb-item text-uppercase">192.168.0.1</span>
                                    <span className="breadcrumb-item text-uppercase" aria-current="page">Mitra 10 (Ruas)</span>
                                    <span className="breadcrumb-item text-uppercase text-success active" aria-current="page">
                                        {isNew ? "Tambah" : "Setting " + camera_id}
                                    </span>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
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

