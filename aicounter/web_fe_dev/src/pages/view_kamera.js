import { Link, useParams } from "react-router-dom"
import '../View.css'
import { createContext, memo, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import useWebSocket from "react-use-websocket"
import { LineChart, MultiDataChart } from "../components/chart"
import { hitung as hitung_c_ruas_dalkot } from "../utils/c_ruas_dalam_kota"
import { hitung_smp_perkotaan } from "../utils/hitung_smp"
import { hitung as hitung_c_apill } from "../utils/c_simpang_apill"

const setting = require('../setting.json')

const MsgContext = createContext()

function MsgProvider({ children }) {
    console.log('MsgProvider aaaaa')

    const { lastJsonMessage } = useWebSocket('ws://' + window.location.hostname + ':8081', {
        onOpen: () => {
            console.log('ws gambar connected')
        },
        onMessage: (e) => {
            // console.log('ws gambar message', e)
        },
        onError: (e) => {
            console.log('ws gambar error', e)
        },
        onClose: () => {
            console.log('ws gambar disconnected')
        },
        shouldReconnect: (closeEvent) => {
            console.log('ws gambar reconnect', closeEvent)
            return true
        }
    })

    const msgContextValue = useMemo(() => ({ lastJsonMessage }), [lastJsonMessage])

    return (
        <MsgContext.Provider value={msgContextValue}>
            {children}
        </MsgContext.Provider>
    )
}

export function ViewKamera({ }) {
    console.log('viewKamera')

    const { camera_id, device_id } = useParams()

    const [cameraName, setCameraName] = useState('')
    const [cameraRTSP, setCameraRTSP] = useState('')

    const [deviceName, setDeviceName] = useState('')
    const [deviceIP, setDeviceIP] = useState('localhost')
    const [deviceProcessor, setDeviceProcessor] = useState('')
    const [deviceYoloModel, setDeviceYoloModel] = useState('')

    const [jenisJalan, setJenisJalan] = useState('')
    const [namaLokasi, setNamaLokasi] = useState('')

    const [WSforImgUrl, setWSforImgUrl] = useState('')
    const [WSforStatUrl, setWSforStatUrl] = useState('')

    useEffect(() => {
        async function getCamera() {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/camera_list/id/' + camera_id
            const response = await axios.get(url)
            if (response.data.result) {
                if (response.data.result.length > 0) {
                    setCameraName(response.data.result[0].name)
                    setCameraRTSP(response.data.result[0].rtsp)
                }
            }
        }

        async function getDevice() {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device/id/' + device_id
            const response = await axios.get(url)
            if (response.data.result) {
                if (response.data.result.length > 0) {
                    setDeviceName(response.data.result[0].name)
                    setDeviceIP(response.data.result[0].ip)
                    setDeviceProcessor(response.data.result[0].processor)
                    setDeviceYoloModel(response.data.result[0].yolo_model)
                }
            }
        }

        async function getJenisJalan() {
            let url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/device_camera/device_id/' + camera_id

            const response = await axios.get(url)
            if (response.data.result) {
                if (response.data.result.length > 0) {
                    setJenisJalan(response.data.result[0].jenis_jalan)
                }
            }
        }

        getCamera()
        getDevice()
        getJenisJalan()
    }, [])

    useEffect(() => {
        async function getLokasi() {
            if (jenisJalan == 'simpang') {
                getSimpang()
            } else {
                getRuas()
            }
        }

        async function getSimpang() {

        }

        async function getRuas() {
            const url = 'http://' + window.location.hostname + ':3000' + '/tabel_where/ruas/id_camera/' + camera_id

            const response = await axios.get(url)
            if (response.data.result) {
                if (response.data.result.length > 0) {
                    setNamaLokasi(response.data.result[0].nama)
                }
            }
        }

        getLokasi()
    }, [jenisJalan])

    useEffect(() => {
        async function getWS() {
            let ws_ip = window.location.hostname
            // let ws_ip = deviceIP
            // if (setting.isLocal) {
            //     // current window ip
            //     ws_ip = window.location.hostname
            // }

            setWSforImgUrl('ws://' + ws_ip + ':8081/')
            setWSforStatUrl('ws://' + ws_ip + ':8080/')
        }

        getWS()
    }, [deviceIP])

    const LiveImage = memo(() => {

        console.log('liveImage')
        const [imgDataIsLoading, setImgDataIsLoading] = useState(false)
        const [imgDataBase64, setImgDataBase64] = useState('')

        // const { lastJsonMessage, readyState } = useWebSocket(WSforImgUrl, {
        //     onOpen: () => {
        //         console.log('ws gambar connected')
        //     },
        //     onMessage: (e) => {
        //         // console.log('ws gambar message', e)
        //     },
        //     onError: (e) => {
        //         console.log('ws gambar error', e)
        //     },
        //     onClose: () => {
        //         console.log('ws gambar disconnected')
        //     },
        //     shouldReconnect: (closeEvent) => {
        //         console.log('ws gambar reconnect', closeEvent)
        //         return true
        //     }
        // })

        const { lastJsonMessage } = useContext(MsgContext)

        useEffect(() => {
            if (lastJsonMessage) {
                // setImgDataBase64(lastJsonMessage)
                if (lastJsonMessage['streams_cam' + camera_id]) {
                    setImgDataBase64('data:image/jpeg;base64,' + lastJsonMessage['streams_cam' + camera_id])
                }
            }
        }, [lastJsonMessage])

        return (
            <>
                {(imgDataIsLoading) ?
                    <>
                        <div className="bg-primary rounded text-center text-white w-100 h-100">
                            <div className="row align-items-center h-100">
                                <div className="col-12 align-self-center text-center">
                                    <div className="spinner-border" role="status" aria-hidden="true"></div>
                                    <div className="mt-3 h3 bebasnue">Memuat data video...</div>
                                </div>
                            </div>
                        </div>
                    </>
                    :
                    <>
                    </>
                }
                <img src={imgDataBase64} alt="live" className={"img-fluid w-100 rounded" + ((imgDataIsLoading) ? " d-none" : "")} onLoad={() => {
                    setImgDataIsLoading(false)
                }} />
            </>
        )
    })

    // function LiveImage() {
    // }

    const LiveData = memo(() => {

        console.log('liveData')
        const [rtData, setRtData] = useState({})
        const [rtDataIsLoading, setRtDataIsLoading] = useState(false)

        // const { lastJsonMessage, readyState } = useWebSocket(WSforStatUrl, {
        //     onOpen: () => {
        //         console.log('ws realtime connected')
        //         setRtDataIsLoading(false)
        //     },
        //     onMessage: (e) => {
        //         // console.log('ws realtime message', e)
        //         setRtData(JSON.parse(e.data))
        //         // setRtDataIsLoading(false)
        //     },
        //     onError: (e) => {
        //         console.log('ws realtime error', e)
        //         setRtDataIsLoading(true)
        //     },
        //     onClose: () => {
        //         console.log('ws realtime disconnected')
        //         setRtDataIsLoading(true)
        //     },
        //     shouldReconnect: (closeEvent) => {
        //         console.log('ws realtime reconnect', closeEvent)
        //         return true
        //     }
        // })

        const { lastJsonMessage } = useContext(MsgContext)

        useEffect(() => {
            if (lastJsonMessage) {
                // setRtDataIsLoading(false)
                setRtData(lastJsonMessage)
            }
        }, [lastJsonMessage])

        return (
            <>
                <RealtimeCount rtData={rtData} rtDataIsLoading={rtDataIsLoading} />
                <HistoricalCount rtData={rtData} rtDataIsLoading={rtDataIsLoading} />
                {/* TODO: bikin kinerja simpang */}
                {/* TODO: bikin kinerja ruas luar kota */}
                {/* <KinerjaRuas rtData={rtData} rtDataIsLoading={rtDataIsLoading} /> */}
            </>
        )
    })
    // function LiveData({ }) {
    // }

    return (
        <>
            <MsgProvider WSforImgUrl={WSforImgUrl}>
                <Hero />
                <div className="container">
                    <div className="row mt-5 mb-5">
                        <div className="col-6">
                            <LiveImage />
                        </div>
                        <div className="col-6 side-data mb-5">
                            <LiveData />
                        </div>
                    </div>
                </div>
            </MsgProvider>
        </>
    )

    function KinerjaSimpang({ rtData = {}, rtDataIsLoading = true }) {

        const [smpTotal, setSmpTotal] = useState(0)
        const [j, setJ] = useState(0)
        const [c, setC] = useState(0)
        const [smpBki, setSmpBki] = useState(0)
        const [smpBka, setSmpBka] = useState(0)
        const [ds, setDs] = useState(0)

        const [waktuHijau, setWaktuHijau] = useState(400)
        const [totalSiklus, setTotalSiklus] = useState(440)
        const [lebarEfektifPendekat, setLebarEfektifPendekat] = useState(6)
        const [tipeLingkungan, setTipeLingkungan] = useState('permukiman')
        const [tipeHambatanSamping, setTipeHambatanSamping] = useState('sedang')
        const [tipeFase, setTipeFase] = useState('terlawan')
        const [jumlahKendaraanTakBermotor, setJumlahKendaraanTakBermotor] = useState(0)
        const [jumlahJutaPendudukKota, setJumlahJutaPendudukKota] = useState(0.5)

        function hitung_c_apill() {
            const newHitung = hitung_c_apill(
                waktuHijau,
                totalSiklus,
                lebarEfektifPendekat,
                tipeLingkungan,
                tipeHambatanSamping,
                tipeFase,
                jumlahKendaraanTakBermotor,
                jumlahJutaPendudukKota
            )
        }

        return (
            <>
                <div className="row mb-3 align-items-ceter">
                    <div className="col-auto">
                        <h3 className="display-5 bebasnue">Kinerja Simpang</h3>
                    </div>
                    <div className="col">
                        <hr />
                    </div>
                </div>
                <div className="row mb-1">

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">SMP/<small>Jam</small> Total</div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{smpTotal}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">J</div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{j}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">C</div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{c}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">SMP <small>bki</small></div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{smpBki}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">SMP <small>bka</small></div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{smpBka}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-success">
                            <div className="card-header small">DS</div>
                            <div className="card-body">
                                <h3 className="card-title bebasnue">{ds}</h3>
                            </div>
                        </div>
                    </div>

                </div>
            </>
        )
    }

    function KapasitasSimpang() {
        return (
            <></>
        )
    }

    function KinerjaRuas({ rtData = {}, rtDataIsLoading = true }) {
        const [textDataIsLoading, setTextDataIsLoading] = useState(true)

        const [smpTotal, setSmpTotal] = useState(0)
        const [c0, setC0] = useState(0)
        const [fcLj, setFcLj] = useState(0)
        const [fcPa, setFcPa] = useState(0)
        const [fcHs, setFcHs] = useState(0)
        const [fcUk, setFcUk] = useState(0)
        const [c, setC] = useState(0)
        const [dJ, setDj] = useState(0)

        const [ruasId, setRuasId] = useState('1')
        const [tipeJalan, setTipeJalan] = useState('2/2-t')
        const [lebarJalur, setLebarJalur] = useState('5.00')
        const [pemisahArah, setPemisahArah] = useState('50-50')
        const [kelasHambatan, setKelasHambatan] = useState('rendah')
        const [lebarBahuEfeketif, setLebarBahuEfeketif] = useState('1.00')
        const [jenisBahuKereb, setJenisBahuKereb] = useState('berbahu')
        const [ukuranKota, setUkuranKota] = useState('kecil')

        useEffect(() => {
            async function fetchData() {
                const url_ruas = 'http://' + window.location.hostname + ':3000' + '/tabel_where/ruas/id_camera/' + camera_id

                const response = await axios.get(url_ruas)
                try {
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            setRuasId(response.data.result[0].id)
                        }
                    }
                } catch (e) {
                    console.log('error', e)
                }
            }

            fetchData()
        }, [])

        useEffect(() => {
            async function fetchData() {
                const url_data_ruas = 'http://' + window.location.hostname + ':3000' + '/ruas_data/' + ruasId

                try {
                    const response = await axios.get(url_data_ruas)
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            setTipeJalan(response.data.result[0].tipe_jalan)
                            setLebarJalur(response.data.result[0].lebar_jalur)
                            setPemisahArah(response.data.result[0].pemisah_arah)
                            setKelasHambatan(response.data.result[0].kelas_hambatan_samping)
                            setLebarBahuEfeketif(response.data.result[0].lebar_bahu_efeketif)
                            setJenisBahuKereb(response.data.result[0].jenis_bahu_atau_kereb)
                            setUkuranKota(response.data.result[0].ukuran_kota)
                        }
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }

            fetchData()
        }, [ruasId])

        // update each minute
        function getSMP() {
            const startDate = new Date().toISOString().substr(0, 10)
            const endDate = startDate

            const url = 'http://' + window.location.hostname + ':3000' + '/report_jam/' + camera_id + '/?start_date=' + startDate + '&end_date=' + endDate

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (!data.result) {
                        return
                    }
                    if (data.result.length == 0) {
                        return
                    }
                    const dt = data.result[0]
                    const sm_in = dt.sm_in
                    const sm_out = dt.sm_out
                    const mp_in = dt.mp_in
                    const mp_out = dt.mp_out
                    const ks_in = dt.ks_in
                    const ks_out = dt.ks_out
                    const tb_in = dt.tb_in
                    const tb_out = dt.tb_out
                    const bb_in = dt.bb_in
                    const bb_out = dt.bb_out

                    let smp = hitung_smp_perkotaan(
                        sm_in + sm_out,
                        mp_in + mp_out,
                        ks_in + ks_out,
                        tb_in + tb_out,
                        bb_in + bb_out,
                        tipeJalan
                    )

                    setSmpTotal(parseFloat(smp).toFixed(2))

                    console.log('smp', smp)
                    return smp
                })
                .catch(error => {
                    console.error('Error:', error)
                })
        }

        function hitung_c_ruas_dalam_kota() {
            // console.log('tipeJalan',tipeJalan)
            // console.log('lebarJalur',lebarJalur)
            // console.log('pemisahArah',pemisahArah)
            // console.log('kelasHambatan',kelasHambatan)
            // console.log('lebarBahuEfeketif',lebarBahuEfeketif)
            // console.log('jenisBahuKereb',jenisBahuKereb)
            // console.log('ukuranKota',ukuranKota)
            // console.log('smpTotal',smpTotal)

            const newHitung = hitung_c_ruas_dalkot(
                tipeJalan,
                lebarJalur,
                pemisahArah,
                kelasHambatan,
                lebarBahuEfeketif,
                jenisBahuKereb,
                ukuranKota,
                smpTotal
            )

            console.log('newHitung', newHitung)
            setC0(parseFloat(newHitung.c_0).toFixed(2))
            setFcLj(parseFloat(newHitung.fc_lj).toFixed(2))
            setFcPa(parseFloat(newHitung.fc_pa).toFixed(2))
            setFcHs(parseFloat(newHitung.fc_hs).toFixed(2))
            setFcUk(parseFloat(newHitung.fc_uk).toFixed(2))
            setC(parseFloat(newHitung.c).toFixed(2))
            setDj(parseFloat(newHitung.d_j).toFixed(2))
        }

        useEffect(() => {
            getSMP()
        }, [])

        useEffect(() => {
            const interval = setInterval(() => {
                getSMP()
            }, 60000)
            return () => clearInterval(interval)
        })

        useEffect(() => {
            console.log('smp total effect', smpTotal)
            hitung_c_ruas_dalam_kota()
        }, [smpTotal])

        useEffect(() => {
            setTextDataIsLoading(rtDataIsLoading)
        }, [rtDataIsLoading])

        return (
            <>
                <div className="row mb-3 align-items-center">
                    <div className="col-auto">
                        <h3 className='display-5 bebasnue'>Kinerja Ruas</h3>
                    </div>
                    <div className="col">
                        <hr />
                    </div>
                </div>
                <KapasitasRuas />
                <div className="row mb-1">

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">SMP/<sub>Jam</sub> Total</div>
                            <div className="card-body">
                                {/* {(textDataIsLoading) ? */}
                                {(false) ?
                                    <>
                                        <div className="text-center">
                                            <div className="spinner-border text-primary"></div>
                                            <div className="">Memuat data...</div>
                                        </div>
                                    </>
                                    :
                                    <h3 className="card-title bebasnue">{smpTotal}</h3>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">C<sub>0</sub></div>
                            <div className="card-body">
                                {/* {(textDataIsLoading) ? */}
                                {(false) ?
                                    <>
                                        <div className="text-center">
                                            <div className="spinner-border text-primary"></div>
                                            <div className="">Memuat data...</div>
                                        </div>
                                    </>
                                    :
                                    <h3 className="card-title bebasnue">{c0}</h3>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">Faktor Koreksi</div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-3">
                                        <span>
                                            FC <sub>LJ</sub>
                                        </span>
                                        {/* {(textDataIsLoading) ? */}
                                        {(false) ?
                                            <>
                                                <div className="text-center mt-2">
                                                    <div className="spinner-border text-primary"></div>
                                                    <div className="">Memuat data...</div>
                                                </div>
                                            </>
                                            :
                                            <h3 className="card-title bebasnue">{fcLj}</h3>
                                        }
                                    </div>
                                    <div className="col-3">
                                        <span>
                                            FC <sub>PA</sub>
                                        </span>
                                        {/* {(textDataIsLoading) ? */}
                                        {(false) ?
                                            <>
                                                <div className="text-center mt-2">
                                                    <div className="spinner-border text-primary"></div>
                                                    <div className="">Memuat data...</div>
                                                </div>
                                            </>
                                            :
                                            <h3 className="card-title bebasnue">{fcPa}</h3>
                                        }
                                    </div>
                                    <div className="col-3">
                                        <span>
                                            FC <sub>HS</sub>
                                        </span>
                                        {/* {(textDataIsLoading) ? */}
                                        {(false) ?
                                            <>
                                                <div className="text-center mt-2">
                                                    <div className="spinner-border text-primary"></div>
                                                    <div className="">Memuat data...</div>
                                                </div>
                                            </>
                                            :
                                            <h3 className="card-title bebasnue">{fcHs}</h3>
                                        }
                                    </div>
                                    <div className="col-3">
                                        <span>
                                            FC <sub>UK</sub>
                                        </span>
                                        {/* {(textDataIsLoading) ? */}
                                        {(false) ?
                                            <>
                                                <div className="text-center mt-2">
                                                    <div className="spinner-border text-primary"></div>
                                                    <div className="">Memuat data...</div>
                                                </div>
                                            </>
                                            :
                                            <h3 className="card-title bebasnue">{fcUk}</h3>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-light">
                            <div className="card-header small">C</div>
                            <div className="card-body">
                                {/* {(textDataIsLoading) ? */}
                                {(false) ?
                                    <>
                                        <div className="text-center">
                                            <div className="spinner-border text-primary"></div>
                                            <div className="">Memuat data...</div>
                                        </div>
                                    </>
                                    :
                                    <h3 className="card-title bebasnue">{c}</h3>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="col-6 mb-4">
                        <div className="card bg-primary text-white">
                            <div className="card-header small">D<sub>J</sub></div>
                            <div className="card-body">
                                {/* {(textDataIsLoading) ? */}
                                {(false) ?
                                    <>
                                        <div className="text-center">
                                            <div className="spinner-border text-white"></div>
                                            <div className="">Memuat data...</div>
                                        </div>
                                    </>
                                    :
                                    <h3 className="card-title bebasnue">{dJ}</h3>
                                }
                            </div>
                        </div>
                    </div>

                </div>
            </>
        )

    }

    function KapasitasRuas() {
        const [showKapasitas, setShowKapasitas] = useState(false)
        const [varKapasitasIsLoading, setVarKapasitasIsLoading] = useState(false)

        const [ruasId, setRuasId] = useState('1')
        const [tipeJalan, setTipeJalan] = useState('2/2-t')
        const [lebarJalur, setLebarJalur] = useState('2.00')
        const [pemisahArah, setPemisahArah] = useState('50-50')
        const [kelasHambatan, setKelasHambatan] = useState('rendah')
        const [lebarBahuEfeketif, setLebarBahuEfeketif] = useState('1.00')
        const [jenisBahuKereb, setJenisBahuKereb] = useState('berbahu')
        const [ukuranKota, setUkuranKota] = useState('kecil')

        useEffect(() => {
            if (showKapasitas && varKapasitasIsLoading) {
                setShowKapasitas(false)
            }
        }, [varKapasitasIsLoading])

        useEffect(() => {
            async function fetchData() {
                const url_ruas = 'http://' + window.location.hostname + ':3000' + '/tabel_where/ruas/id_camera/' + camera_id

                const response = await axios.get(url_ruas)
                try {
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            setRuasId(response.data.result[0].id)
                        }
                    }
                } catch (e) {
                    console.log('error', e)
                }
            }

            fetchData()
        }, [])

        useEffect(() => {
            async function fetchData() {
                const url_data_ruas = 'http://' + window.location.hostname + ':3000' + '/ruas_data/' + ruasId

                try {
                    const response = await axios.get(url_data_ruas)
                    if (response.data.result) {
                        if (response.data.result.length > 0) {
                            setTipeJalan(response.data.result[0].tipe_jalan)
                            setLebarJalur(response.data.result[0].lebar_jalur)
                            setPemisahArah(response.data.result[0].pemisah_arah)
                            setKelasHambatan(response.data.result[0].kelas_hambatan_samping)
                            setLebarBahuEfeketif(response.data.result[0].lebar_bahu_efeketif)
                            setJenisBahuKereb(response.data.result[0].jenis_bahu_atau_kereb)
                            setUkuranKota(response.data.result[0].ukuran_kota)
                        }
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }

            fetchData()
        }, [ruasId])

        return (
            <div className="row mb-4">
                <div className="col">
                    <div className="card">
                        <div className="card-header text-white bg-dark">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    Variabel Kapasitas Ruas
                                </div>
                                <div className="col">
                                    {(varKapasitasIsLoading) ?
                                        <>
                                            <span className="badge bg-warning text-dark float-end">
                                                <span className="spinner-border spinner-border-sm align-self-center" role="status" aria-hidden="true"></span>
                                                <span className="ms-2 align-self-center">Memuat data...</span>
                                            </span>
                                        </>
                                        :
                                        <>
                                            <button type="button" className="btn btn-sm btn-outline-light float-end" onClick={() => setShowKapasitas(!showKapasitas)}>{showKapasitas ? "Tutup" : "Buka"}</button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                        <ul className={"list-group list-group-flush" + (showKapasitas ? "" : " d-none")}>
                            <ItemKapasitas label_text="Tipe Jalan" value_text={tipeJalan} save_function={setTipeJalan} input_type="select" select_options={[
                                { value: "searah", text: "Searah" },
                                { value: "1/1", text: "1/1" },
                                { value: "2/1", text: "2/1" },
                                { value: "2/2-t", text: "2/2-t" },
                                { value: "2/2-tt", text: "2/2-tt" },
                                { value: "4/2-t", text: "4/2-t" },
                                { value: "4/2-tt", text: "4/2-tt" },
                                { value: "6/2-t", text: "6/2-t" },
                                { value: "8/2-t", text: "8/2-t" },
                            ]} />
                            <ItemKapasitas label_text="Lebar Jalur Efektif" value_text={lebarJalur} save_function={setLebarJalur} addon_text="m" input_type="number" />
                            <ItemKapasitas label_text="Pemisah Arah" value_text={pemisahArah} save_function={setPemisahArah} input_type="select" select_options={[
                                { value: "50-50", text: "50-50" },
                                { value: "55-45", text: "55-45" },
                                { value: "60-40", text: "60-40" },
                                { value: "65-35", text: "65-35" },
                                { value: "70-30", text: "70-30" },
                            ]} />
                            <ItemKapasitas label_text="Kelas Hambatan Samping" value_text={kelasHambatan} save_function={setKelasHambatan} input_type="select" select_options={[
                                { value: "sangat_rendah", text: "Sangat Rendah" },
                                { value: "rendah", text: "Rendah" },
                                { value: "sedang", text: "Sedang" },
                                { value: "tinggi", text: "Tinggi" },
                                { value: "sangat_tinggi", text: "Sangat Tinggi" },
                            ]} />
                            <ItemKapasitas label_text="Lebar Bahu Efektif" value_text={lebarBahuEfeketif} save_function={setLebarBahuEfeketif} addon_text="m" input_type="number" />
                            <ItemKapasitas label_text="Jenis Batas Jalan" value_text={jenisBahuKereb} save_function={setJenisBahuKereb} input_type="select" select_options={[
                                { value: "berbahu", text: "Ber-Bahu" },
                                { value: "berkereb", text: "Ber-Kereb" },
                            ]} />
                            <ItemKapasitas label_text="Ukuran Kota" value_text={ukuranKota} save_function={setUkuranKota} input_type="select" select_options={[
                                { value: "sangat_kecil", text: "Sangat Kecil" },
                                { value: "kecil", text: "Kecil" },
                                { value: "sedang", text: "Sedang" },
                                { value: "besar", text: "Besar" },
                                { value: "sangat_besar", text: "Sangat Besar" },
                            ]} />
                        </ul>
                        <div className="card-footer small bg-dark"></div>
                    </div>
                </div>
            </div>
        )
    }

    function ItemKapasitas({ label_text = "Kapasitas Ruas", value_text = "2/2-t", addon_text = "", input_type = "text", select_options = [{ value: "1", text: "1" }, { value: "2", text: "2" }, { value: "3", text: "3" }], save_function = (newVal) => { } }) {
        const [newValue, setNewValue] = useState(value_text)
        useEffect(() => {
            setNewValue(value_text)
        }, [value_text])
        return (
            <li className="list-group-item form-kapasitas">
                <div className="row align-items-center">
                    <div className="col-auto">
                        <label htmlFor="" className="form-label my-2">
                            {label_text}:
                        </label>
                    </div>
                    <div className="col">
                        <span className="preview">
                            {value_text} {addon_text}
                            {(newValue != value_text) ?
                                <span className="badge bg-secondary ms-2">
                                    ✏️ diubah jadi {newValue} (belum disimpan)
                                </span>
                                : <></>}
                        </span>
                        <div className="input-form input-group">
                            {(input_type == 'select') ? <>
                                <select className="form-select form-select-sm" defaultValue={value_text} onChange={UpdateInputValue} value={newValue}>
                                    {select_options.map((item, index) =>
                                        <option key={index} value={item.value}>
                                            {item.text}
                                        </option>
                                    )}
                                </select>
                            </> : <>
                                <input type={input_type} {...(input_type == 'number') ? { step: '0.01' } : {}} className="form-control-sm" defaultValue={value_text} onChange={UpdateInputValue} value={newValue} />
                            </>}
                            {(addon_text != '') ? <span className="input-group-text">{addon_text}</span> : <></>}
                            {(newValue != value_text) ? <button type="button" className="btn btn-sm btn-danger" onClick={cancelUpdate}>Reset</button> : <></>}
                            <button type="button" className="btn btn-sm btn-dark" onClick={SaveValue}>Simpan</button>
                        </div>
                    </div>
                </div>
            </li>
        )

        function UpdateInputValue(e) {
            const _value = e.target.value
            setNewValue(_value)
        }

        function cancelUpdate() {
            setNewValue(value_text)
        }

        function SaveValue() {
            value_text = newValue
            save_function(newValue)
        }
    }

    function HistoricalCount({ rtData = {}, rtDataIsLoading = true }) {
        const [textDataIsLoading, setTextDataIsLoading] = useState(true)
        const [chartDataIsLoading, setChartDataIsLoading] = useState(true)

        const [startDate, setStartDate] = useState(new Date().toISOString().substr(0, 10))
        const [endDate, setEndDate] = useState(new Date().toISOString().substr(0, 10))

        const [textData, setTextData] = useState([
            { nama: '🚙 Mobil', in: 0, out: 0 },
            { nama: '🏍️ Motor', in: 0, out: 0 },
            { nama: '🚐 Bus', in: 0, out: 0 },
            { nama: '🚚 Truck', in: 0, out: 0 },
            { nama: '🚌 Bus Besar', in: 0, out: 0 },
            { nama: '🚛 Truck Besar', in: 0, out: 0 },
        ])

        const [chartData, setChartData] = useState([])

        useEffect(() => {
            async function getChartData() {
                setChartDataIsLoading(true)

                const url = 'http://' + window.location.hostname + ':3000' + '/report_jam/' + camera_id + '/?start_date=' + startDate + '&end_date=' + endDate

                const response = await axios.get(url)
                if (response.data.result) {
                    console.log('response.data.result', response.data.result)
                    setChartData(response.data.result)
                    setChartDataIsLoading(false)
                }
            }

            getChartData()

            async function getTextData() {
                setTextDataIsLoading(true)
                const url = 'http://' + window.location.hostname + ':3000' + '/average_last_hour/' + camera_id

                const response = await axios.get(url)
                if (response.data.result) {
                    console.log('response.data.result', response.data.result)
                    if (response.data.result.length > 0) {
                        const _avg_smp_in = response.data.result[0].smp_in
                        const _avg_smp_out = response.data.result[0].smp_out
                        const _avg_smp = response.data.result[0].smp_in + response.data.result[0].smp_out

                        const _avg_mp_in = response.data.result[0].mp_in
                        const _avg_mp_out = response.data.result[0].mp_out
                        const _avg_mp = response.data.result[0].mp_in + response.data.result[0].mp_out

                        const _avg_sm_in = response.data.result[0].sm_in
                        const _avg_sm_out = response.data.result[0].sm_out
                        const _avg_sm = response.data.result[0].sm_in + response.data.result[0].sm_out

                        const _avg_ksb_in = response.data.result[0].ks_b_in
                        const _avg_ksb_out = response.data.result[0].ks_b_out
                        const _avg_ksb = response.data.result[0].ks_b_in + response.data.result[0].ks_b_out

                        const _avg_kst_in = response.data.result[0].ks_t_in
                        const _avg_kst_out = response.data.result[0].ks_t_out
                        const _avg_kst = response.data.result[0].ks_t_in + response.data.result[0].ks_t_out

                        const _avg_bb_in = response.data.result[0].bb_in
                        const _avg_bb_out = response.data.result[0].bb_out
                        const _avg_bb = response.data.result[0].bb_in + response.data.result[0].bb_out

                        const _avg_tb_in = response.data.result[0].tb_in
                        const _avg_tb_out = response.data.result[0].tb_out
                        const _avg_tb = response.data.result[0].tb_in + response.data.result[0].tb_out

                        const _textData = [
                            { nama: '🚙 Mobil', in: _avg_mp_in, out: _avg_mp_out },
                            { nama: '🏍️ Motor', in: _avg_sm_in, out: _avg_sm_out },
                            { nama: '🚐 Bus', in: _avg_ksb_in, out: _avg_ksb_out },
                            { nama: '🚚 Truck', in: _avg_kst_in, out: _avg_kst_out },
                            { nama: '🚌 Bus Besar', in: _avg_bb_in, out: _avg_bb_out },
                            { nama: '🚛 Truck Besar', in: _avg_tb_in, out: _avg_tb_out }
                        ]

                        setTextData(_textData)

                        setTextDataIsLoading(false)
                    }
                }
            }

            getTextData()

        }, [])

        return (
            <>
                <div className="row mb-3 align-items-center">
                    <div className="col-auto">
                        <h3 className='display-5 bebasnue'>Historical Count <small className="lead">(jumlah/jam)</small></h3>
                    </div>
                    <div className="col">
                        <hr />
                    </div>
                </div>
                <div className="row mb-1">
                    {textData.map((item, i) => (
                        <div className="col-6 mb-4">
                            <CountItem item_name={item.nama} item_in={item.in} item_out={item.out} />
                        </div>
                    ))}
                </div>
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card bg-light">
                            <div className="card-header">Chart</div>
                            <div className="card-body">
                                <div className="row text-center">
                                    {(chartDataIsLoading) ?
                                        <>
                                            <div className="col-12">
                                                <div className="spinner-border text-primary"></div>
                                                <div className="mt-3">Memuat data...</div>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className="col-12">
                                                <MultiDataChart data={chartData} data_label="jam" data_values={['sm_in', 'sm_out', 'mp_in', 'mp_out', 'ks_b_in', 'ks_b_out', 'ks_t_in', 'ks_t_out', 'bb_in', 'bb_out', 'tb_in', 'tb_out']} />
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mb-2">
                    <div className="col-12 d-grid gap-2">
                        <Link to={'/chart/' + device_id + '/' + camera_id} className="btn btn-lg btn-outline-success text-uppercase bebasnue">Lihat data lengkap</Link>
                    </div>
                </div>
                <div className="row mb-5">
                    <div className="col-12">
                        <DownloadExcel />
                    </div>
                </div>
            </>
        )

        function CountItem({ item_name = 0, item_in = 0, item_out = 0 }) {
            return <div className="card bg-light">
                <div className="card-header small">{item_name}</div>
                <div className="card-body">
                    <div className="row text-center">
                        {(textDataIsLoading) ?
                            <>
                                <div className="col-12">
                                    <div className="spinner-border text-primary"></div>
                                    <div className="mt-3">Memuat data...</div>
                                </div>
                            </> : <>
                                <div className="col-6">⬇️ In: <span>{Math.round(item_in)}</span></div>
                                <div className="col-6">⬆️ Out: <span>{Math.round(item_out)}</span></div>
                            </>}
                    </div>
                </div>
                <div className="card-footer small"><b>Total: <span>{Math.round(item_in) + Math.round(item_out)}</span></b></div>
            </div>
        }

    }

    function DownloadExcel() {
        const [downloadUrl, setDownloadUrl] = useState('')
        const [isWaitingDownload, setIswaitingDownload] = useState(false)
        const [downloadPercentage, setDownloadPercentage] = useState(0)

        const [startDate, setStartDate] = useState(new Date().toISOString().substr(0, 10))
        const [endDate, setEndDate] = useState(new Date().toISOString().substr(0, 10))

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
            setDownloadUrl('http://' + window.location.hostname + ':3000' + '/report_excel/' + camera_id + '?start_date=' + startDate + '&end_date=' + endDate)
        }, [startDate, endDate])

        return (
            <>
                <div className="card bg-primary">
                    <div className="card-header text-white">Download Laporan Excel</div>
                    <div className="card-body">
                        <div className="input-group">
                            <div className="input-group">
                                <span className="input-group-text">Mulai:</span>
                                <input type="date" className="form-control" onChange={(e) => setStartDate(e.target.value)} value={startDate} />
                                <span className="input-group-text">Hingga:</span>
                                <input type="date" className="form-control" onChange={(e) => setEndDate(e.target.value)} value={endDate} />
                                <button type="button" className={"btn btn-dark" + (isWaitingDownload ? ' disabled' : '')} onClick={downloadExcel}>
                                    {
                                        (isWaitingDownload) ?
                                            <>
                                                ⏳Downloading... ({downloadPercentage}%)
                                            </>
                                            :
                                            <>
                                                💾Donwload
                                            </>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    function RealtimeCount({ rtData = {}, rtDataIsLoading = true }) {
        const [textDataIsLoading, setTextDataIsLoading] = useState(true)
        const [chartDataIsLoading, setChartDataIsLoading] = useState(true)

        const [mpIn, setMpIn] = useState(0)
        const [mpOut, setMpOut] = useState(0)
        const [smIn, setSmIn] = useState(0)
        const [smOut, setSmOut] = useState(0)
        const [ksbIn, setKsbIn] = useState(0)
        const [ksbOut, setKsbOut] = useState(0)
        const [kstIn, setKstIn] = useState(0)
        const [kstOut, setKstOut] = useState(0)
        const [bbIn, setBbIn] = useState(0)
        const [bbOut, setBbOut] = useState(0)
        const [tbIn, setTbIn] = useState(0)
        const [tbOut, setTbOut] = useState(0)

        const [gapIn, setGapIn] = useState(0)
        const [gapOut, setGapOut] = useState(0)

        const [chartGap, setChartGap] = useState([])

        const [smpIn, setSmpIn] = useState(0)
        const [smpOut, setSmpOut] = useState(0)

        const [chartSmp, setChartSmp] = useState([])

        const [chartData, setChartData] = useState([])

        const [textData, setTextData] = useState([
            { nama: '🚙 Mobil', in: 0, out: 0 },
            { nama: '🏍️ Motor', in: 0, out: 0 },
            { nama: '🚐 Bus', in: 0, out: 0 },
            { nama: '🚚 Truck', in: 0, out: 0 },
            { nama: '🚌 Bus Besar', in: 0, out: 0 },
            { nama: '🚛 Truck Besar', in: 0, out: 0 },
        ])

        useEffect(() => {
            let _mpIn = 0
            let _mpOut = 0
            let _smIn = 0
            let _smOut = 0
            let _ksbIn = 0
            let _ksbOut = 0
            let _kstIn = 0
            let _kstOut = 0
            let _bbIn = 0
            let _bbOut = 0
            let _tbIn = 0
            let _tbOut = 0

            if (rtData.objek_in == undefined) return
            if (rtData.id_kamera != camera_id) return

            rtData.objek_in.forEach((item, index) => {
                if (item.name == 'mobil') {
                    setMpIn(item.count)
                    _mpIn = item.count
                } else if (item.name == 'motor') {
                    setSmIn(item.count)
                    _smIn = item.count
                } else if (item.name == 'bus') {
                    setKsbIn(item.count)
                    _ksbIn = item.count
                } else if (item.name == 'truck') {
                    setKstIn(item.count)
                    _kstIn = item.count
                } else if (item.name == 'busbesar') {
                    setBbIn(item.count)
                    _bbIn = item.count
                } else if (item.name == 'truckbesar') {
                    setTbIn(item.count)
                    _tbIn = item.count
                }
            })

            rtData.objek_out.forEach((item, index) => {
                if (item.name == 'mobil') {
                    setMpOut(item.count)
                    _mpOut = item.count
                } else if (item.name == 'motor') {
                    setSmOut(item.count)
                    _smOut = item.count
                } else if (item.name == 'bus') {
                    setKsbOut(item.count)
                    _ksbOut = item.count
                } else if (item.name == 'truck') {
                    setKstOut(item.count)
                    _kstOut = item.count
                } else if (item.name == 'busbesar') {
                    setBbOut(item.count)
                    _bbOut = item.count
                } else if (item.name == 'truckbesar') {
                    setTbOut(item.count)
                    _tbOut = item.count
                }
            })

            const smp_in = hitung_smp_perkotaan(_smIn, _mpIn, _ksbIn + _kstIn, _bbIn, _tbIn)
            const smp_out = hitung_smp_perkotaan(_smOut, _mpOut, _ksbOut + _kstOut, _bbOut, _tbOut)

            setSmpIn(smp_in)
            setSmpOut(smp_out)

            let gap_in = 0
            let gap_out = 0

            if (rtData.presence_detector.gap_in) {
                gap_in = rtData.presence_detector.gap_in
                setGapIn(gap_in)
            }

            if (rtData.presence_detector.gap_out) {
                gap_out = rtData.presence_detector.gap_out
                setGapOut(gap_out)
            }

            const curr_time = new Date().getTime()
            const hh_mm = new Date(curr_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            const hh_mm_ss = new Date(curr_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

            let newChartData = chartData
            newChartData.push({
                mp_in: _mpIn,
                mp_out: _mpOut,
                sm_in: _smIn,
                sm_out: _smOut,
                ksb_in: _ksbIn,
                ksb_out: _ksbOut,
                kst_in: _kstIn,
                kst_out: _kstOut,
                bb_in: _bbIn,
                bb_out: _bbOut,
                tb_in: _tbIn,
                tb_out: _tbOut,
                time: hh_mm_ss,
            })

            if (newChartData.length > 60) newChartData.shift()

            setChartData(newChartData)

            let newChartSmp = chartSmp
            newChartSmp.push({
                smp_in: smp_in,
                smp_out: smp_out,
                time: hh_mm_ss,
            })

            if (newChartSmp.length > 60) newChartSmp.shift()

            setChartSmp(newChartSmp)

            let newChartGap = chartGap
            newChartGap.push({
                gap_in: gap_in,
                gap_out: gap_out,
                time: hh_mm_ss,
            })

            if (newChartGap.length > 60) newChartGap.shift()

            setChartGap(newChartGap)
        }, [rtData])


        useEffect(() => {
            setTextData([
                { nama: '🚙 Mobil (MP)', in: mpIn, out: mpOut },
                { nama: '🏍️ Motor (SM)', in: smIn, out: smOut },
                { nama: '🚐 Bus (KSB)', in: ksbIn, out: ksbOut },
                { nama: '🚚 Truck (KST)', in: kstIn, out: kstOut },
                { nama: '🚌 Bus Besar (BB)', in: bbIn, out: bbOut },
                { nama: '🚛 Truck Besar (TB)', in: tbIn, out: tbOut },
            ])
        }, [mpIn, mpOut, smIn, smOut, ksbIn, ksbOut, kstIn, kstOut, bbIn, bbOut, tbIn, tbOut,])

        useEffect(() => {
            setTextDataIsLoading(rtDataIsLoading)
            setChartDataIsLoading(rtDataIsLoading)
        }, [rtDataIsLoading])
        return (
            <>
                <div className="row mb-3 align-items-center">
                    <div className="col-auto">
                        <h3 className='display-5 bebasnue'>Realtime Count <small className="lead">(jumlah/menit)</small></h3>
                    </div>
                    <div className="col">
                        <hr />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="card bg-success text-white">
                            <div className="card-header">Data Singkat</div>
                            <div className="card-body">
                                <div className="row mb-2">
                                    <div className="col-4">
                                        <h5 className="bebasnue">GAP <small>(detik)</small></h5>
                                        <div className="row text-center">
                                            <div className="col">⬆️ In: <br /><b>{parseFloat(gapIn).toFixed(2)}</b></div>
                                            <div className="col">⬇️ Out: <br /><b>{parseFloat(gapOut).toFixed(2)}</b></div>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="card bg-white">
                                            <div className="card-body">
                                                <MultiDataChart data_values={['gap_in', 'gap_out']} data={chartGap} data_label="time" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4">
                                        <h5 className="bebasnue">SMP <small>(permenit)</small></h5>
                                        <div className="row text-center">
                                            <div className="col">⬆️ In: <br /><b>{parseFloat(smpIn).toFixed(2)}</b></div>
                                            <div className="col">⬇️ Out: <br /><b>{parseFloat(smpOut).toFixed(2)}</b></div>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="card bg-white">
                                            <div className="card-body">
                                                <MultiDataChart data_values={['smp_in', 'smp_out']} data={chartSmp} data_label="time" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    {textData.map((item, i) => (
                        <div className="col-6 mb-4">
                            <div className="card bg-light">
                                <div className="card-header small">{item.nama}</div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        {/* {(textDataIsLoading) ? */}
                                        {(false) ?
                                            <>
                                                <div className="col-12">
                                                    <div className="spinner-border text-primary"></div>
                                                    <div className="">Memuat data...</div>
                                                </div>
                                            </> : <>
                                                <div className="col-6">⬆️ In: <span>{item.in}</span></div>
                                                <div className="col-6">⬇️ Out: <span>{item.out}</span></div>
                                            </>
                                        }
                                    </div>
                                </div>
                                <div className="card-footer small"><b>Total: <span>{item.in + item.out}</span></b></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card bg-light">
                            <div className="card-header">Chart</div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-12">
                                        <MultiDataChart data={chartData} data_label="time" data_values={['mp_in', 'mp_out', 'sm_in', 'sm_out', 'ksb_in', 'ksb_out', 'kst_in', 'kst_out', 'bb_in', 'bb_out', 'tb_in', 'tb_out']} />
                                    </div>
                                </div>
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
                            <div className="col mt-3 mb-3">
                                <Link to={'/'} className="btn btn-lg btn-outline-success float-end text-uppercase bebasnue">Kembali</Link>
                                <Link to={'/setting_kamera/' + camera_id} className="btn btn-lg btn-outline-success float-end text-uppercase bebasnue me-2">Setting Kamera</Link>
                                {(namaLokasi != '') ? <>
                                    <div>
                                        📍 {namaLokasi}
                                    </div>
                                </> : <></>}
                                <h1 className="display-1 anton text-uppercase">{cameraName}</h1>
                                <nav className="breadcrumb">
                                    <span className="breadcrumb-item text-uppercase">{deviceName}</span>
                                    <span className="breadcrumb-item text-uppercase text-success active" aria-current="page">{cameraName} ({(jenisJalan == 'simpang') ? 'Simpang' : 'Ruas'})</span>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}