const mqtt = require("mqtt")

const hitungSMP = require('./hitung_smp')
const { MYSQLcon } = require("./MYSQLcon")

var dataSimpang = []
var lastMinute = -1
var dataSmpMenit = []

// const mqtt_host = "mqtt://mqtt.eclipseprojects.io"
const mqtt_host = "mqtt://localhost"
const mqtt_topic_sub = 'cam_log'

const client = mqtt.connect(mqtt_host)

MYSQLcon.connect(function (err) {
    if (err) throw err
    console.log("MYSQL Connected!")
    getDataSimpang()
})


client.on("connect", () => {
    client.subscribe(mqtt_topic_sub, (err) => {
        if (!err) {
            console.log('MQTT connected!')
            // client.publish("presence", "Hello mqtt")
        }
    })
})

client.on("message", (topic, message) => {
    // message is Buffer
    // console.log(message.toString())
    // client.end()
    const msg_str = message.toString()
    const msg_json = JSON.parse(msg_str)
    if (msg_json.id_kamera) {
        const dataMinute = new Date(parseFloat(msg_json.waktu) * 1000).getMinutes()
        // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        // console.log('menitLast:', lastMinute)
        // console.log('menit:', dataMinute)
        // console.log('id   :', msg_json.id_kamera)
        // console.log({
        //     in: msg_json.objek_in,
        //     out: msg_json.objek_out,
        // })
        const smp = {
            utama: (msg_json.smp) ? msg_json.smp : 0.0,
            in: (msg_json.smp_in) ? msg_json.smp_in : 0.0,
            out: (msg_json.smp_out) ? msg_json.smp_out : 0.0,
        }
        
        if (dataMinute != lastMinute) {
            for (let i = 0; i < dataSmpMenit.length; i++) {
                const id = dataSmpMenit[i].id_kamera
                const smp_kaki = hitungSmpKakiSimpang(id)
                // console.log('smp kaki simpang:',smp_kaki)

                if (smp_kaki!=null) {
                    const queryKaki = 'insert into simpang_kaki_hitung (id_kaki_simpang,smp_out,smp_kiri,smp_kanan,waktu) values ('
                        + parseFloat(smp_kaki.id_kaki_simpang)
                        + ','
                        + parseFloat(smp_kaki.smp_out)
                        + ','
                        + parseFloat(smp_kaki.smp_kiri)
                        + ','
                        + parseFloat(smp_kaki.smp_kanan)
                        + ','
                        + '"'
                        + smp_kaki.waktu
                        + '"'
                        + ')'
                    // console.log('query smp kaki simpang:',queryKaki)
                    insertToDB(queryKaki)
                }
            }
            lastMinute = dataMinute
            dataSmpMenit = []
        }
        dataSmpMenit.push({ ...smp, id_kamera: msg_json.id_kamera, waktu: new Date(parseFloat(msg_json.waktu) * 1000).toISOString().replace('T',' ').replace('Z','').split('.')[0] })
        console.log('SMP:', smp)
        const klasifikasi = {
            in: {
                sm: objekAiCount(msg_json.objek_in, 'mobil'),
                mp: objekAiCount(msg_json.objek_in, 'motor'),
                ks: objekAiCount(msg_json.objek_in, 'truck') + objekAiCount(msg_json.objek_in, 'bus'),
                ks_b: objekAiCount(msg_json.objek_in, 'bus'),
                ks_t: objekAiCount(msg_json.objek_in, 'truck'),
                bb: objekAiCount(msg_json.objek_in, 'truck besar'),
                tb: objekAiCount(msg_json.objek_in, 'bus besar'),
            },
            out: {
                sm: objekAiCount(msg_json.objek_out, 'mobil'),
                mp: objekAiCount(msg_json.objek_out, 'motor'),
                ks: objekAiCount(msg_json.objek_out, 'truck') + objekAiCount(msg_json.objek_out, 'bus'),
                ks_b: objekAiCount(msg_json.objek_out, 'bus'),
                ks_t: objekAiCount(msg_json.objek_out, 'truck'),
                bb: objekAiCount(msg_json.objek_out, 'truck besar'),
                tb: objekAiCount(msg_json.objek_out, 'bus besar'),
            },
        }
        // console.log('klasifikasi', klasifikasi)
        
        const smp_hitung_in = hitungSMP.hitung_smp_perkotaan(klasifikasi.in.sm, klasifikasi.in.mp, klasifikasi.in.ks, klasifikasi.in.bb, klasifikasi.in.tb)
        const smp_hitung_out = hitungSMP.hitung_smp_perkotaan(klasifikasi.out.sm, klasifikasi.out.mp, klasifikasi.out.ks, klasifikasi.out.bb, klasifikasi.out.tb)
        const smp_hitung_all = smp_hitung_in + smp_hitung_out

        const SQLquery = 'insert into camera_log (camera_id,sm,sm_in,sm_out,mp,mp_in,mp_out,ks,ks_in,ks_out,ks_b_in,ks_b_out,ks_t_in,ks_t_out,bb,bb_in,bb_out,tb,tb_in,tb_out,smp,smp_in,smp_out) values ('
            + msg_json.id_kamera
            + ','
            + parseFloat(klasifikasi.in.sm + klasifikasi.out.sm)
            + ','
            + parseFloat(klasifikasi.in.sm)
            + ','
            + parseFloat(klasifikasi.out.sm)
            + ','
            + parseFloat(klasifikasi.in.mp + klasifikasi.out.mp)
            + ','
            + parseFloat(klasifikasi.in.mp)
            + ','
            + parseFloat(klasifikasi.out.mp)
            + ','
            + parseFloat(klasifikasi.in.ks + klasifikasi.out.ks)
            + ','
            + parseFloat(klasifikasi.in.ks)
            + ','
            + parseFloat(klasifikasi.out.ks)
            + ','
            + parseFloat(klasifikasi.in.ks_b)
            + ','
            + parseFloat(klasifikasi.out.ks_b)
            + ','
            + parseFloat(klasifikasi.in.ks_t)
            + ','
            + parseFloat(klasifikasi.out.ks_t)
            + ','
            + parseFloat(klasifikasi.in.bb + klasifikasi.out.bb)
            + ','
            + parseFloat(klasifikasi.in.bb)
            + ','
            + parseFloat(klasifikasi.out.bb)
            + ','
            + parseFloat(klasifikasi.in.tb + klasifikasi.out.tb)
            + ','
            + parseFloat(klasifikasi.in.tb)
            + ','
            + parseFloat(klasifikasi.out.tb)
            + ','
            // + parseFloat(smp.in + smp.out)
            + smp_hitung_all
            + ','
            // + parseFloat(smp.in)
            + smp_hitung_in
            + ','
            // + parseFloat(smp.out)
            + smp_hitung_out
            + ')'
        // console.log('query:', SQLquery)
        insertToDB(SQLquery)
    }
})

function objekAiCount(objek, nama) {
    let count = 0
    objek.forEach(obj => {
        if (obj.name == nama) {
            count = obj.count
        }
    })
    return count
}

function insertToDB(SQLquery) {
    MYSQLcon.query(SQLquery, function (err, result) {
        if (err) throw err
        // console.log("1 record inserted")
    })
}

function getDataSimpang() {
    MYSQLcon.query("SELECT * FROM simpang_kaki", function (err, result, fields) {
        if (err) throw err
        result.forEach(res => {
            const simpang = {
                id_simpang: res.id_simpang,
                id_camera_utama: res.id_camera_utama,
                id_camera_kanan: res.id_camera_kanan,
                id_camera_kiri: res.id_camera_kiri,
            }
            dataSimpang.push(simpang)
        })
        // console.log(dataSimpang)
    })
}

function smpDataSimpangMenit(id_kamera) {
    let smp = {
        utama:0.0,
        in:0.0,
        out:0.0,
        // waktu: new Date().toISOString().replace('T',' ').replace('Z','').split('.')[0]
        waktu: getStrWaktuWIB()
    }
    dataSmpMenit.forEach(smpMenit => {
        if (smpMenit.id_kamera == id_kamera) {
            smp = smpMenit
        }
    })
    return smp
}

function hitungSmpKakiSimpang(id_camera_utama) {
    let smp_kaki = null
    for (let i = 0; i < dataSimpang.length; i++) {
        const simpang = dataSimpang[i];
        if (simpang.id_camera_utama == id_camera_utama) {
            smp_kaki = {
                id_kaki_simpang : id_camera_utama,
                smp_out: smpDataSimpangMenit(id_camera_utama).out,
                smp_kiri: smpDataSimpangMenit(simpang.id_camera_kiri).in,
                smp_kanan: smpDataSimpangMenit(simpang.id_camera_kanan).in,
                waktu: smpDataSimpangMenit(simpang.id_kamera).waktu
            }
        }
    }
    return smp_kaki
}

function getStrWaktuWIB() {
    let waktu = new Date()
    waktu.setHours(waktu.getHours() + 7)
    waktu = waktu.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]
    return waktu
}