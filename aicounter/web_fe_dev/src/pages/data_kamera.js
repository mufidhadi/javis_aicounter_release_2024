import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { MultiDataChart } from "../components/chart"

export function DataKamera({ }) {
    const { camera_id } = useParams()
    const { device_id } = useParams()

    const [startDate, setStartDate] = useState(new Date().toISOString().substr(0, 10))
    const [endDate, setEndDate] = useState(new Date().toISOString().substr(0, 10))

    const [showPermenit, setShowPermenit] = useState(true)


    const [downloadUrl, setDownloadUrl] = useState('')
    const [isWaitingDownload, setIswaitingDownload] = useState(false)
    const [downloadPercentage, setDownloadPercentage] = useState(0)

    const [chartData, setChartData] = useState([])
    const [chartDataSMP, setChartDataSMP] = useState([])



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

    function getChartData() {
        const url = 'http://' + window.location.hostname + ':3000/report' + (showPermenit ? '' : '_jam') + '/' + camera_id + '/?start_date=' + startDate + '&end_date=' + endDate

        axios.get(url)
            .then(response => {
                setChartData(response.data.result)
            })
            .catch(error => {
                console.log(error)
            })
    }

    useEffect(() => {
        setDownloadUrl('http://' + window.location.hostname + ':3000' + '/report_excel/' + camera_id + '?start_date=' + startDate + '&end_date=' + endDate)

        getChartData()
    }, [startDate, endDate, showPermenit])


    return (
        <>
            <div className="container">
                <div className="row mt-5">
                    <div className="col-auto">
                        <Link to={'/'} className="btn btn-dark me-2">Beranda</Link>
                        <Link to={'/view/' + device_id + '/' + camera_id} className="btn btn-dark">Live View</Link>
                    </div>
                    <div className="col">
                        <div className="row">
                            <div className="col-3 text-end">
                                <h5>Range Data:</h5>
                            </div>
                            <div className="col">
                                <div className="input-group">
                                    <span className="input-group-text">Mulai</span>
                                    <input type="date" name="" id="" className="form-control" onChange={(e) => setStartDate(e.target.value)} value={startDate} />
                                    <span className="input-group-text">Hingga:</span>
                                    <input type="date" name="" id="" className="form-control" onChange={(e) => setEndDate(e.target.value)} value={endDate} />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-3 text-end"></div>
                            <div className="col d-flex">
                                <div className="d-grid gap-2">
                                    <div className="btn-group mb-3">
                                        <button className="btn btn-dark" onClick={() => setShowPermenit(true)} disabled={showPermenit}>Permenit</button>
                                        <button className="btn btn-dark" onClick={() => setShowPermenit(false)} disabled={!showPermenit}>Per-jam</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col">
                        <hr />
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col">
                        <div className="card text-bg-success">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col">
                                        <h5>Download Laporan Excel</h5>
                                    </div>
                                    <div className="col text-end">
                                        <button className="btn btn-dark" onClick={downloadExcel} disabled={isWaitingDownload}>
                                            {isWaitingDownload ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Download'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col">
                        <hr />
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col">
                        <h1 className="display-5 bebasnue text-center">
                            Chart Data Lengkap {showPermenit?'Per-menit':'Per-jam'}
                        </h1>
                        {/* <pre>{JSON.stringify(chartData, null, 2)}</pre> */}
                    </div>
                </div>

                <div className="row mt-5 mb-2">
                    <div className="col">
                        <h3 className="mb-3">Data Counting {showPermenit?'Per-menit':'Per-jam'}</h3>
                        <MultiDataChart data={chartData} data_label="waktu" data_values={['mp_in', 'mp_out', 'sm_in', 'sm_out', 'ks_b_in', 'ks_b_out', 'ks_t_in', 'ks_t_out', 'bb_in', 'bb_out', 'tb_in', 'tb_out']} />
                    </div>
                </div>

                <div className="row mt-5 mb-2">
                    <div className="col">
                        <h3 className="mb-3">Data SMP {showPermenit?'Per-menit':'Per-jam'}</h3>
                        <MultiDataChart data={chartData} data_label="waktu" data_values={['smp_in', 'smp_out']} />
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col">
                        <h1 className="display-5 bebasnue text-center">
                            Tabel Data Lengkap {showPermenit?'Per-menit':'Per-jam'}
                        </h1>
                        {/* <pre>{JSON.stringify(chartData,null,2)}</pre> */}
                    </div>
                </div>

                <div className="row mt-5 mb-5">
                    <table className="table table-stripped table-hover">
                        <thead>
                            <tr>
                                <th rowspan="2">waktu</th>
                                <th colspan="2">Sepeda Motor</th>
                                <th colspan="2">mobil Penumpang</th>
                                <th colspan="4">Bus dan Truk</th>
                                <th colspan="2">Bus Besar</th>
                                <th colspan="2">Truk Besar</th>
                                <th colspan="2">SMP/Menit</th>
                            </tr>
                            <tr>
                                {/* SM */}
                                <th>in</th>
                                <th>out</th>

                                {/* MP */}
                                <th>in</th>
                                <th>out</th>

                                {/* KS */}
                                <th>Bus in</th>
                                <th>Bus out</th>
                                <th>Truck in</th>
                                <th>Truck out</th>

                                {/* TB */}
                                <th>in</th>
                                <th>out</th>

                                {/* BB */}
                                <th>in</th>
                                <th>out</th>

                                {/* SMP */}
                                <th>in</th>
                                <th>out</th>
                            </tr>
                        </thead>
                        <tbody id="data">
                            {chartData.map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.waktu}</td>
                                        <td>{data.sm_in}</td>
                                        <td>{data.sm_out}</td>
                                        <td>{data.mp_in}</td>
                                        <td>{data.mp_out}</td>
                                        <td>{data.ks_b_in}</td>
                                        <td>{data.ks_b_out}</td>
                                        <td>{data.ks_t_in}</td>
                                        <td>{data.ks_t_out}</td>
                                        <td>{data.tb_in}</td>
                                        <td>{data.tb_out}</td>
                                        <td>{data.bb_in}</td>
                                        <td>{data.bb_out}</td>
                                        <td>{data.smp_in}</td>
                                        <td>{data.smp_out}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}