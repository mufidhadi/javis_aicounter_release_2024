import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"


const setting = require('../setting.json')

export function SettingPdDevice({ }) {
    const navigate = useNavigate()
    const { device_id } = useParams()
    const isNew = (device_id == null)

    const [deviceName, setDeviceName] = useState('')
    const [deviceProcessor, setDeviceProcessor] = useState('jetson')
    const [deviceIP, setDeviceIP] = useState('localhost')
    const [deviceYoloModel, setDeviceYoloModel] = useState('jv_indo_n_320.engine')

    const [deviceIPDesc, setDeviceIPDesc] = useState('')
    const [deviceIpisValid, setDeviceIpisValid] = useState(false)
    const [yoloModelDesc, setYoloModelDesc] = useState('')

    const yolo_model_list = [
        { name: 'jv_indo_n_320.engine', desc: '(kecepatan tinggi) cocok untuk vga kecil seperti jetson orin nano dan orin NX' },
        { name: 'jv_indo_m_320.engine', desc: '(akurasi cukup baik dan cepat) cocok untuk vga kecil seperti jetson orin nano dan orin NX' },
        { name: 'jv_indo_n_640.engine', desc: '(akurasi lebih baik dan cukup cepat) cocok untuk vga sedang seperti jetson orin NX' },
        { name: 'jv_indo_m_640.engine', desc: '(akurasi terbaik) cocok untuk vga sedang dan besar seperti jetson orin NX atau perangkat gpu dekstop seperti RTX' },
        { name: 'jv_indo_n_320.onnx', desc: '(kecepatan tinggi) cocok untuk perangkat cpu' },
        { name: 'jv_indo_m_320.onnx', desc: '(akurasi cukup baik) cocok untuk perangkat cpu' },
        { name: 'jv_indo_n_640.onnx', desc: '(akurasi lebih baik) cocok untuk perangkat cpu' },
        { name: 'jv_indo_m_640.onnx', desc: '(akurasi terbaik) cocok untuk perangkat cpu' },
        { name: 'jv_indo_n.pt', desc: '(kecepatan tinggi dan akurasi cukup baik) cocok untuk perangkat gpu seperti RTX' },
        { name: 'jv_indo_m.pt', desc: '(akurasi terbaik) cocok untuk perangkat gpu seperti RTX' },
    ]

    useEffect(() => {
        function getDesc() {
            const idx = yolo_model_list.findIndex(x => x.name == deviceYoloModel)
            if (idx >= 0) {
                setYoloModelDesc(yolo_model_list[idx].desc)
            }
        }

        getDesc()
    }, [deviceYoloModel])

    return (
        <>
            <Hero />
            <FormDevice />
        </>
    )

    function FormDevice({ }) {
        function onSubmit(e) {
            e.preventDefault()
            const formData = new FormData(e.target)
            const data = Object.fromEntries(formData)
            console.log(data)

            const url_query = '?' + new URLSearchParams(data).toString()
            let url = 'http://'+window.location.hostname+':3000' + '/tabel/device/insert' + url_query
            if (!isNew) {
                url = 'http://'+window.location.hostname+':3000' + '/tabel/device/update' + url_query
            }
            // fetch get then redirect
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    // redirect
                    navigate('/')
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
        return (
            <>
                <div className="container mt-4">
                    <div className="row">
                        <div className="col-10 offset-1 offset-xs-0 col-xs-12">
                            <div className="card">
                                <form action="" onSubmit={onSubmit}>
                                    <div className="card-body">

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="name">Nama Perangkat</label>
                                            </div>
                                            <div className="col-md-9">
                                                <input type="text" id="name" name="name" className="form-control" defaultValue={deviceName} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-3 text-end">
                                                <label htmlFor="processor">Jenis Processor</label>
                                            </div>
                                            <div className="col-md-9">
                                                <select name="processor" id="processor" className="form-control text-uppercase" defaultValue={deviceProcessor}>
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

                                    </div>
                                    <div className="card-footer">
                                        <div className="d-grid gap-2">
                                            <button type="submit" className="btn btn-success">Simpan</button>
                                        </div>
                                    </div>
                                </form>
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
}