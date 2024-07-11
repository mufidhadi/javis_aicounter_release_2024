const express = require('express')
const cors = require('cors')
const YAML = require('yaml')
const generate_dockerfile = require('./dockerfile_template')
const excel = require('node-excel-export')
const { MYSQLcon } = require('./MYSQLcon')

MYSQLcon.connect(function (err) {
    if (err) throw err
    console.log("MYSQL Connected!")
})

const app = express()
const port = 3000
// const port = 3300

app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!<br>' + JSON.stringify(req.query))
})

app.get('/sql/', (req, res) => {

    const sql_query = req.query.query

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/tabel/:nama_tabel', (req, res) => {

    const nama_tabel = req.params.nama_tabel
    const sql_query = "SELECT * FROM " + nama_tabel

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/tabel_limited/:nama_tabel', (req, res) => {

    const nama_tabel = req.params.nama_tabel

    let limit = (req.query.limit) ? req.query.limit : 100
    let offset = (req.query.offset) ? req.query.offset : 0

    const sql_query = "SELECT * FROM " + nama_tabel + " LIMIT " + limit + " OFFSET " + offset

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/tabel_lenght/:nama_tabel', (req, res) => {

    const nama_tabel = req.params.nama_tabel

    let sql_query = "SELECT COUNT(*) as count FROM " + nama_tabel

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else
            res.json({ result: result[0] })
    })

})

app.get('/tabel_where/:nama_tabel/:id_key/:id_value', (req, res) => {

    const nama_tabel = req.params.nama_tabel
    const id_key = req.params.id_key
    const id_value = req.params.id_value

    // check url GET query
    // limit=100&offset=0
    let limit = (req.query.limit) ? req.query.limit : 100
    let offset = (req.query.offset) ? req.query.offset : 0

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " ORDER BY id DESC" + " LIMIT " + limit + " OFFSET " + offset

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else
            res.json({ result })
    })

})

app.get('/tabel_where_lenght/:nama_tabel/:id_key/:id_value', (req, res) => {

    const nama_tabel = req.params.nama_tabel
    const id_key = req.params.id_key
    const id_value = req.params.id_value

    // check url GET query
    // limit=100&offset=0
    let limit = (req.query.limit) ? req.query.limit : 100
    let offset = (req.query.offset) ? req.query.offset : 0

    let sql_query = "SELECT COUNT(*) as count FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " LIMIT " + limit + " OFFSET " + offset

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else
            res.json({ result: result[0] })
    })

})

app.get('/tabel_where_excel/:nama_tabel/:id_key/:id_value', (req, res) => {

    const nama_tabel = req.params.nama_tabel
    const id_key = req.params.id_key
    const id_value = req.params.id_value

    // check url GET query
    // limit=100&offset=0
    let limit = (req.query.limit) ? req.query.limit : 100
    let offset = (req.query.offset) ? req.query.offset : 0

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " ORDER BY id DESC" + " LIMIT " + limit + " OFFSET " + offset

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else {
            const dataset = result
            let specification = {}
            const data_keys = Object.keys(dataset[0])
            for (let i = 0; i < data_keys.length; i++) {
                specification[data_keys[i]] = {
                    displayName: data_keys[i],
                    headerStyle: {
                        fontSize: 12,
                        hAlign: 'center',
                        wrapText: true
                    },
                    width: 120
                }
            }
            const report = excel.buildExport(
                [
                    {
                        name: nama_tabel.replace(/\./g, '_'),
                        specification: specification,
                        data: dataset,
                    }
                ]
            )
            // console.log(specification)
            res.attachment(nama_tabel + '.xlsx')
            res.send(report)
        }
    })
})

app.get('/tabel/:nama_tabel/insert', (req, res) => {

    const keys = Object.keys(req.query)
    const vals = Object.values(req.query)
    const nama_tabel = req.params.nama_tabel

    for (let i = 0; i < vals.length; i++) {
        const val = vals[i];
        if (isNotNumber(val) || isIpFormat(val)) {
            vals[i] = '"' + val + '"'
        }
    }

    const sql_query = 'insert into ' + nama_tabel + ' (' + keys.join(',') + ') values (' + vals.join(',') + ');'

    // res.send('query '+sql_query)

    MYSQLcon.query(sql_query, function (err, result) {
        if (err) res.send('error insert ' + nama_tabel + ': ' + sql_query + '<pre>' + JSON.stringify(err.message) + '</pre>')
        res.json(result)
    })

})

app.get('/tabel/:nama_tabel/update/:id', (req, res) => {

    const keys = Object.keys(req.query)
    const vals = Object.values(req.query)
    const nama_tabel = req.params.nama_tabel
    const id_tabel = req.params.id

    let val_key_pairs = []
    for (let i = 0; i < vals.length; i++) {
        const key = keys[i];
        const val = vals[i];
        let pair = key + '='
        if (isNotNumber(val) || isIpFormat(val)) {
            pair += '"' + val + '"'
        } else {
            pair += val
        }
        val_key_pairs.push(pair)
    }
    let sql_query = 'update ' + nama_tabel + ' set ' + val_key_pairs.join(',') + ' where id=' + id_tabel


    // res.send('query '+sql_query)

    MYSQLcon.query(sql_query, function (err, result) {
        if (err) res.send('error update ' + nama_tabel + ': ' + sql_query + '<pre>' + JSON.stringify(err.message) + '</pre>')
        res.json(result)
    })

})

app.get('/tabel/:nama_tabel/delete/:id', (req, res) => {

    const nama_tabel = req.params.nama_tabel
    const id_tabel = req.params.id

    const sql_query = 'delete from ' + nama_tabel + ' where id=' + id_tabel


    // res.send('query '+sql_query)

    MYSQLcon.query(sql_query, function (err, result) {
        if (err) res.send('error delete ' + nama_tabel + ': ' + sql_query + '<pre>' + JSON.stringify(err.message) + '</pre>')
        res.json(result)
    })

})

app.get('/average_last_hour/:id_kamera', (req, res) => {

    const id_kamera = req.params.id_kamera
    // const sql_query = "SELECT sum(sm) as sm, sum(mp) as mp, sum(ks) as ks, sum(bb) as bb, sum(tb) as tb, sum(smp) as smp, sum(smp_in) as smp_in, sum(smp_out) as smp_out FROM camera_log WHERE  waktu >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND camera_id = " + id_kamera
    const sql_query = "SELECT sum(sm) as sm, sum(sm_in) as sm_in, sum(sm_out) as sm_out, sum(mp) as mp, sum(mp_in) as mp_in, sum(mp_out) as mp_out, sum(ks) as ks, sum(ks_in) as ks_in, sum(ks_out) as ks_out, sum(ks_b_in) as ks_b_in, sum(ks_b_out) as ks_b_out, sum(ks_t_in) as ks_t_in, sum(ks_t_out) as ks_t_out, sum(bb) as bb, sum(bb_in) as bb_in, sum(bb_out) as bb_out, sum(tb) as tb, sum(tb_in) as tb_in, sum(tb_out) as tb_out, sum(smp) as smp, sum(smp_in) as smp_in, sum(smp_out) as smp_out FROM camera_log WHERE  waktu >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND camera_id = " + id_kamera

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/average_last_hour_rasio_kaki_simpang/:id_kaki_simpang', (req, res) => {

    const id_kaki_simpang = req.params.id_kaki_simpang
    const sql_query = "select sum(smp_out) as smp_out, sum(smp_kiri) as smp_kiri, sum(smp_kanan) as smp_kanan, sum(smp_out) + sum(smp_kiri) + sum(smp_kanan) as smp_total, sum(smp_kiri) / sum(smp_out) as rasio_kiri1, sum(smp_kanan) / sum(smp_out) as rasio_kanan1, sum(smp_kiri) / (sum(smp_out) + sum(smp_kiri) + sum(smp_kanan)) as rasio_kiri, sum(smp_kanan) / (sum(smp_out) + sum(smp_kiri) + sum(smp_kanan)) as rasio_kanan from simpang_kaki_hitung WHERE  waktu >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND id_kaki_simpang = " + id_kaki_simpang

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kaki_simpang + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/simpang_kaki_data/:id_simpang_kaki', (req, res) => {

    const id_simpang = req.params.id_simpang_kaki
    const sql_query = "SELECT * from simpang_kaki_data where id_simpang_kaki = " + id_simpang

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/ruas_data/:id_ruas', (req, res) => {

    const id_ruas = req.params.id_ruas
    const sql_query = "SELECT * from ruas_data where id_ruas = " + id_ruas

    // res.send('Hello tabel '+nama_tabel)

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        res.json({ result })
    })

})

app.get('/device_settings/:id_device', (req, res) => {
    const id_device = req.params.id_device
    const sql_query = 'select * from device where id=' + id_device

    let device_settings = {
        config: {
            rtsp: {
                base_url: 'rtsp://localhost:8554/ai/'
            },
            yolo: {
                model: 'jv_indo_m.pt',
                allowed_cls: ['mobil', 'motor', 'bus', 'truck', 'bus besar', 'truck besar']
            },
            mqtt: {
                host: 'mqtt.eclipseprojects.io',
                base_topic_pub: 'cam_log'
            },
            ws: {
                host: 'ws://localhost:8080/',
                host2: 'ws://localhost:8081/',
            },
            smp: [
                {
                    name: 'mobil',
                    smp: 1
                },
                {
                    name: 'motor',
                    smp: 0.5
                },
                {
                    name: 'bus',
                    smp: 3
                },
                {
                    name: 'truck',
                    smp: 3
                },
                {
                    name: 'bus besar',
                    smp: 5
                },
                {
                    name: 'truck besar',
                    smp: 5
                },
            ]
        },
        camera_list: [],
    }

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        if (result.length > 0) {
            device_settings.config.yolo.model = result[0].yolo_model

            const sql_query_2 = 'select camera_id,camera_list.name,rtsp,jenis_jalan,id_simpang,simpang_kaki.id as id_kaki_simpang,ruas.id as id_ruas,is_set_to_run from device_camera  join camera_list on device_camera.camera_id=camera_list.id left join simpang_kaki on camera_list.id=simpang_kaki.id_camera_utama left join ruas on camera_list.id=ruas.id_camera where device_camera.device_id=' + id_device

            MYSQLcon.query(sql_query_2, function (err2, result2, fields) {
                if (err2) res.send('error select ' + id_kamera + ': ' + sql_query_2)
                if (result2.length > 0) {
                    for (let i = 0; i < result2.length; i++) {
                        const camera = result2[i];
                        device_settings.camera_list.push({
                            id: camera.camera_id,
                            name: camera.name,
                            rtsp: camera.rtsp,
                            id_key: (camera.jenis_jalan == 'simpang') ? camera.id_kaki_simpang : camera.id_ruas,
                            jenis_lokasi: camera.jenis_jalan,
                            is_set_to_run: (camera.is_set_to_run == 'Y')
                        })
                    }
                }
                res.json(device_settings)
            })
        }
    })
})

app.get('/config_yaml/:id_device', (req, res) => {
    const id_device = req.params.id_device
    // const sql_query = 'select * from device where id=' + id_device
    const sql_query = 'select device.*,pd_id,host,`mode`,treshold from device left join presence_detector_device on presence_detector_device.device_id=device.id where device.id=' + id_device

    let config = {
        rtsp: {
            base_url: 'rtsp://localhost:8554/ai/'
        },
        yolo: {
            model: 'jv_indo_m.pt',
            allowed_cls: ['mobil', 'motor', 'bus', 'truck', 'bus besar', 'truck besar']
        },
        mqtt: {
            // host: 'mqtt.eclipseprojects.io',
            host: 'localhost',
            base_topic_pub: 'cam_log'
        },
        ws: {
            host: 'ws://localhost:8080/',
            host2: 'ws://localhost:8081/',
        },
        smp: [
            {
                name: 'mobil',
                smp: 1
            },
            {
                name: 'motor',
                smp: 0.5
            },
            {
                name: 'bus',
                smp: 3
            },
            {
                name: 'truck',
                smp: 3
            },
            {
                name: 'bus besar',
                smp: 3
            },
            {
                name: 'truck besar',
                smp: 3
            },
        ],
        presence_detector: {
            active: true,
            id: 1,
            fase: 1,
            mqtt: {
                host: 'localhost',
                username: 'javis',
                password: '#MqttJavis313',
                topic: {
                    send: 'its-link/server/',
                    receive: 'its-link/client/'
                }
            },
            mode: 'gap',
            threshold: 0.5
        }
    }

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_device + ': ' + sql_query)
        if (result.length > 0) {
            config.yolo.model = result[0].yolo_model
            res.send(YAML.stringify(config))
        }
    })
})

app.get('/camera_list_json/:id_device', (req, res) => {
    const id_device = req.params.id_device

    let camera_list = []

    // const sql_query = 'select camera_id,camera_list.name,rtsp,jenis_jalan,id_simpang,simpang_kaki.id as id_kaki_simpang,ruas.id as id_ruas,is_set_to_run from device_camera  join camera_list on device_camera.camera_id=camera_list.id left join simpang_kaki on camera_list.id=simpang_kaki.id_camera_utama left join ruas on camera_list.id=ruas.id_camera where device_camera.device_id=' + id_device

    const sql_query = 'select camera_id, camera_list.name, rtsp, output_res, ln_st_x, ln_st_y, ln_en_x, ln_en_y, jenis_jalan, id_simpang, simpang_kaki.id as id_kaki_simpang, ruas.id as id_ruas, is_set_to_run, active, direct_pd_id, fase from device_camera join camera_list on device_camera.camera_id=camera_list.id left join simpang_kaki on camera_list.id=simpang_kaki.id_camera_utama left join ruas on camera_list.id=ruas.id_camera left join presence_detector on camera_list.id=presence_detector.id_camera where device_camera.device_id=' + id_device

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_device + ': ' + sql_query)
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                const camera = result[i];
                camera_list.push({
                    id: camera.camera_id,
                    name: camera.name,
                    rtsp: camera.rtsp,
                    output_res: camera.output_res,
                    id_key: (camera.jenis_jalan == 'simpang') ? camera.id_kaki_simpang : camera.id_ruas,
                    jenis_lokasi: camera.jenis_jalan,
                    is_set_to_run: (camera.is_set_to_run == 'Y'),
                    line: {
                        start: {
                            x: parseFloat(camera.ln_st_x),
                            y: parseFloat(camera.ln_st_y)
                        },
                        end: {
                            x: parseFloat(camera.ln_en_x),
                            y: parseFloat(camera.ln_en_y)
                        }
                    },
                    presence_detector: {
                        active: camera.active,
                        id: camera.direct_pd_id,
                        fase: camera.fase
                    }
                })
            }
        }
        res.json(camera_list)
    })
})

app.get('/build_docker_sh/:id_device', (req, res) => {
    const id_device = req.params.id_device

    let build_docker_sh = '#!/bin/bash' + "\n"

    const sql_query = 'select * from device where id=' + id_device

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        if (result.length > 0) {
            // build_docker_sh += 'sudo docker build -t aicounter -f ./dockerfile-' + result[0].processor + ' .'
            build_docker_sh += 'sudo docker build -t aicounter -f ./dockerfile .'
            res.send(build_docker_sh)
        }
    })
})

app.get('/dockerfile/:id_device', (req, res) => {
    const id_device = req.params.id_device

    let dockerfile = ''

    const sql_query = 'select * from device where id=' + id_device

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        if (result.length > 0) {
            dockerfile += 'sudo docker build -t aicounter -f ./dockerfile-' + result[0].processor + ' .'
            const processor = result[0].processor
            const model = result[0].yolo_model
            dockerfile = generate_dockerfile(processor, model)
            res.send(dockerfile)
        }
    })
})

app.get('/start_docker_sh/:id_device', (req, res) => {
    const id_device = req.params.id_device

    let start_docker_sh = '#!/bin/bash' + "\n"

    const sql_query = 'select camera_id,camera_list.name,rtsp,jenis_jalan,id_simpang,simpang_kaki.id as id_kaki_simpang,ruas.id as id_ruas,is_set_to_run from device_camera  join camera_list on device_camera.camera_id=camera_list.id left join simpang_kaki on camera_list.id=simpang_kaki.id_camera_utama left join ruas on camera_list.id=ruas.id_camera where device_camera.device_id=' + id_device

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                const camera = result[i];
                start_docker_sh += 'sudo docker stop cam' + camera.camera_id + "\n"
            }
            start_docker_sh += "\n"
            // start_docker_sh += 'sudo docker system prune -a -f'+"\n"
            start_docker_sh += 'sudo docker system prune -f' + "\n"
            start_docker_sh += "\n"
            for (let i = 0; i < result.length; i++) {
                const camera = result[i];
                start_docker_sh += 'sudo docker run -d --name cam' + camera.camera_id + ' --network host --restart unless-stopped --gpus all --runtime nvidia --mount type=bind,source="$(pwd)",target=/tes aicounter ' + camera.camera_id + "\n"
            }
            start_docker_sh += "\n"
            start_docker_sh += 'sudo docker ps -a'
            start_docker_sh += "\n" + '# delete all docker restart cron job' + "\n"
            start_docker_sh += 'crontab -r'
            start_docker_sh += "\n" + '# add cron job to restart every hour with sudo permission' + "\n"
            for (let i = 0; i < result.length; i++) {
                const camera = result[i];
                // start_docker_sh += '(crontab -l 2>/dev/null; echo "0 * * * * sudo docker restart cam' + camera.camera_id +'") | crontab -' + "\n"
                start_docker_sh += '(crontab -l 2>/dev/null; echo "0 * * * * docker restart cam' + camera.camera_id + '") | crontab -' + "\n"
            }
        }
        res.send(start_docker_sh)
    })
})

app.get('/prepare_sql/:id_device', (req, res) => {
    const id_device = req.params.id_device
    const sql_query1 = 'select * from device where id=' + id_device

    let device_sql_query = ''
    device_sql_query += 'USE aicounter_db;' + "\n" + "\n"
    device_sql_query += 'SET FOREIGN_KEY_CHECKS = 0;' + "\n" + "\n"
    device_sql_query += 'TRUNCATE TABLE camera_log;' + "\n"
    device_sql_query += 'TRUNCATE TABLE camera_list;' + "\n"
    device_sql_query += 'TRUNCATE TABLE device_camera;' + "\n"
    device_sql_query += 'TRUNCATE TABLE device;' + "\n"
    device_sql_query += 'TRUNCATE TABLE ruas_data;' + "\n"
    device_sql_query += 'TRUNCATE TABLE ruas;' + "\n"
    device_sql_query += 'TRUNCATE TABLE simpang_kaki_hitung;' + "\n"
    device_sql_query += 'TRUNCATE TABLE simpang_kaki_data;' + "\n"
    device_sql_query += 'TRUNCATE TABLE simpang_kaki;' + "\n"
    device_sql_query += 'TRUNCATE TABLE simpang;' + "\n"
    device_sql_query += "\n"
    device_sql_query += 'SET FOREIGN_KEY_CHECKS = 1;' + "\n" + "\n"

    MYSQLcon.query(sql_query1, function (err, result, fields) {
        if (err) res.send('error select ' + id_device + ': ' + sql_query1)

        if (result.length > 0) {
            device_sql_query += 'INSERT INTO device (id,name,processor,ip,yolo_model) VALUES (' + id_device + ',"' + result[0].name + '","' + result[0].processor + '","' + result[0].ip + '","' + result[0].yolo_model + '");' + "\n"
            // res.send(device_sql_query)

            const sql_query2 = 'select * from device_camera join camera_list on device_camera.camera_id=camera_list.id where device_id=' + id_device

            MYSQLcon.query(sql_query2, function (err, result2, fields) {
                if (err) res.send('error select ' + id_device + ': ' + sql_query2)

                if (result2.length > 0) {
                    let ruas_cams = []
                    let simpang_cams = []

                    for (let i = 0; i < result2.length; i++) {
                        const camera = result2[i];
                        device_sql_query += 'INSERT INTO camera_list (id,name,lat,lng,rtsp) VALUES ("' + camera.camera_id + '","' + camera.name + '","' + camera.lat + '","' + camera.lng + '","' + camera.rtsp + '");' + "\n"
                        device_sql_query += 'INSERT INTO device_camera (device_id,camera_id,is_set_to_run,jenis_jalan) VALUES (' + id_device + ',' + camera.camera_id + ',"' + camera.is_set_to_run + '","' + camera.jenis_jalan + '");' + "\n"
                        if (camera.jenis_jalan == 'simpang') {
                            simpang_cams.push(camera.camera_id)
                        } else {
                            ruas_cams.push(camera.camera_id)
                        }
                    }

                    // res.send(device_sql_query)

                    if (ruas_cams.length > 0) {
                        const sql_query3 = 'select * from ruas where id_camera in (' + ruas_cams.join(',') + ')'

                        MYSQLcon.query(sql_query3, function (err, result3, fields) {
                            if (err) res.send('error select ' + id_device + ': ' + sql_query3)
                            if (result3.length > 0) {
                                for (let i = 0; i < result3.length; i++) {
                                    const ruas = result3[i];
                                    device_sql_query += 'INSERT INTO ruas (id,id_camera,nama,lat,lng) VALUES ("' + ruas.id + '","' + ruas.id_camera + '","' + ruas.nama + '","' + ruas.lat + '","' + ruas.lng + '");' + "\n"
                                }
                                const sql_query4 = 'select * from ruas_data where id_ruas in (' + ruas_cams.join(',') + ')'

                                MYSQLcon.query(sql_query4, function (err, result4, fields) {
                                    if (err) res.send('error select ' + id_device + ': ' + sql_query4)
                                    if (result4.length > 0) {
                                        for (let i = 0; i < result4.length; i++) {
                                            const ruas_data = result4[i];
                                            device_sql_query += 'INSERT INTO ruas_data (id,id_ruas,tipe_jalan,lebar_jalur,pemisah_arah,kelas_hambatan_samping,lebar_bahu_efektif,jenis_bahu_atau_kereb,ukuran_kota) VALUES (' + ruas_data.id + ',' + ruas_data.id_ruas + ',"' + ruas_data.tipe_jalan + '",' + ruas_data.lebar_jalur + ',"' + ruas_data.pemisah_arah + '","' + ruas_data.kelas_hambatan_samping + '",' + ruas_data.lebar_bahu_efektif + ',"' + ruas_data.jenis_bahu_atau_kereb + '","' + ruas_data.ukuran_kota + '");' + "\n"
                                        }
                                    }
                                    if (simpang_cams.length <= 0) {
                                        res.send(device_sql_query)
                                    }
                                })
                            } else {
                                if (simpang_cams.length <= 0) {
                                    res.send(device_sql_query)
                                }
                            }
                        })
                    }
                    if (simpang_cams.length > 0) {
                        const sql_query3 = 'select *, simpang_kaki.id as id_simpang_kaki from simpang_kaki join simpang on simpang_kaki.id_simpang=simpang.id where id_camera_utama in (' + simpang_cams.join(',') + ') or id_camera_kanan in (' + simpang_cams.join(',') + ') or id_camera_kiri in (' + simpang_cams.join(',') + ')'

                        MYSQLcon.query(sql_query3, function (err, result3, fields) {
                            if (err) res.send('error select ' + id_device + ': ' + sql_query3)
                            if (result3.length > 0) {
                                let id_simpang_list = []
                                let id_simpang_kaki_list = []
                                for (let i = 0; i < result3.length; i++) {
                                    const simpang_kaki = result3[i];

                                    if (!id_simpang_list.includes(simpang_kaki.id_simpang)) {
                                        id_simpang_list.push(simpang_kaki.id_simpang)
                                        device_sql_query += 'INSERT INTO simpang (id,nama,lat,lng) VALUES ("' + simpang_kaki.id_simpang + '","' + simpang_kaki.nama + '","' + simpang_kaki.lat + '","' + simpang_kaki.lng + '");' + "\n"
                                    }

                                    device_sql_query += 'INSERT INTO simpang_kaki (id,id_simpang,id_camera_utama,id_camera_kanan,id_camera_kiri) VALUES (' + simpang_kaki.id_simpang_kaki + ',"' + simpang_kaki.id_simpang + '","' + simpang_kaki.id_camera_utama + '","' + simpang_kaki.id_camera_kanan + '","' + simpang_kaki.id_camera_kiri + '");' + "\n"
                                    id_simpang_kaki_list.push(simpang_kaki.id_simpang_kaki)
                                }
                                // res.send(device_sql_query)

                                const sql_query4 = 'select * from simpang_kaki_data where id_simpang_kaki in (' + id_simpang_kaki_list.join(',') + ')'

                                MYSQLcon.query(sql_query4, function (err, result4, fields) {
                                    if (err) res.send('error select ' + id_device + ': ' + sql_query4)
                                    if (result4.length > 0) {
                                        for (let i = 0; i < result4.length; i++) {
                                            const simpang_kaki_data = result4[i];
                                            device_sql_query += 'INSERT INTO simpang_kaki_data (id,id_simpang_kaki,waktu_hijau,total_siklus,tipe_lingkungan,tipe_fase,jumlah_juta_penduduk_kota,tipe_hambatan_samping,lebar_efektif_pendekat) VALUES (' + simpang_kaki_data.id + ',' + simpang_kaki_data.id_simpang_kaki + ',' + simpang_kaki_data.waktu_hijau + ',' + simpang_kaki_data.total_siklus + ',"' + simpang_kaki_data.tipe_lingkungan + '","' + simpang_kaki_data.tipe_fase + '",' + simpang_kaki_data.jumlah_juta_penduduk_kota + ',"' + simpang_kaki_data.tipe_hambatan_samping + '",' + simpang_kaki_data.lebar_efektif_pendekat + ');' + "\n"
                                        }
                                    }
                                    res.send(device_sql_query)
                                })
                            } else {
                                res.send(device_sql_query)
                            }
                        })
                    }
                    if (ruas_cams.length == 0 && simpang_cams.length == 0) {
                        res.send(device_sql_query)
                    }
                } else {
                    res.send(device_sql_query)
                }
            })
        } else {
            res.send(device_sql_query)
        }
    })

})

app.get('/report/:id', (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "'" + " ORDER BY id DESC"

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else
            res.json({ result })
    })

})

app.get('/report_jam/:id', (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let sql_query = `SELECT any_value(DATE_FORMAT(waktu, '%Y-%m-%d %H:00')) AS jam, any_value(waktu) as waktu, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=` + id_value + ` AND waktu BETWEEN '` + start_date + `' AND '` + end_date + `' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d %H') ORDER BY jam DESC`

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err)
            res.send('error select ' + nama_tabel + ': ' + sql_query)
        else
            res.json({ result })
    })

})

app.get('/report_jam_15_old/:id', async (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    const jam_min00 = await sql_report_perjam_15an('00', id_value, start_date, end_date)
    const jam_min15 = await sql_report_perjam_15an('15', id_value, start_date, end_date)
    const jam_min30 = await sql_report_perjam_15an('30', id_value, start_date, end_date)
    const jam_min45 = await sql_report_perjam_15an('45', id_value, start_date, end_date)

    let result = {
        'menit_00': jam_min00,
        'menit_15': jam_min15,
        'menit_30': jam_min30,
        'menit_45': jam_min45
    }

    result = []
    for (let i = 0; i < jam_min00.length; i++) {
        let jam00 = jam_min00[i];
        let jam15 = jam_min15[i];
        let jam30 = jam_min30[i];
        let jam45 = jam_min45[i];

        jam00['interval'] = waktu_interval(jam00['jam'])
        jam00['interval_tanggal'] = jam00['interval'].split(' ')[0]
        jam00['interval_jam'] = jam00['interval'].split(' ')[1] + ' - ' + jam00['interval'].split(' ')[3]
        jam15['interval'] = waktu_interval(jam15['jam'])
        jam15['interval_tanggal'] = jam15['interval'].split(' ')[0]
        jam15['interval_jam'] = jam15['interval'].split(' ')[1] + ' - ' + jam15['interval'].split(' ')[3]
        jam30['interval'] = waktu_interval(jam30['jam'])
        jam30['interval_tanggal'] = jam30['interval'].split(' ')[0]
        jam30['interval_jam'] = jam30['interval'].split(' ')[1] + ' - ' + jam30['interval'].split(' ')[3]
        jam45['interval'] = waktu_interval(jam45['jam'])
        jam45['interval_tanggal'] = jam45['interval'].split(' ')[0]
        jam45['interval_jam'] = jam45['interval'].split(' ')[1] + ' - ' + jam45['interval'].split(' ')[3]


        result.push(jam00)
        result.push(jam15)
        result.push(jam30)
        result.push(jam45)
    }

    res.json({ result })

})

app.get('/report_jam_15/:id', async (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    const result = await report_interval15(id_value, start_date, end_date)

    res.json({ result })
})

function waktu_interval(jam) {
    let waktu = new Date(jam)
    // make to yy-mm-dd hh:mm - hh+1:mm
    let next = new Date(waktu.getTime() + 60 * 60 * 1000)
    let waktu_interval = waktu.getFullYear() + '-' + (waktu.getMonth() + 1) + '-' + waktu.getDate() + ' ' + waktu.getHours() + ':' + ((waktu.getMinutes() < 10 ? '0' : '') + waktu.getMinutes()) + ' - ' + next.getHours() + ':' + ((next.getMinutes() < 10 ? '0' : '') + next.getMinutes())
    return waktu_interval
}

async function sql_report_perjam_15an(menit = '00', id, start_date, end_date) {
    return new Promise((resolve, reject) => {
        let sql_query = `SELECT DATE_FORMAT(waktu, '%Y-%m-%d %H:` + menit + `') AS jam, any_value(waktu), SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=` + id + ` AND waktu BETWEEN '` + start_date + `' AND '` + end_date + `' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d %H') ORDER BY jam DESC`

        MYSQLcon.query(sql_query, function (err, result, fields) {
            if (err) reject([])
            else resolve(result)
        })
    })
}

app.get('/report_excel/:id', (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    const _start_date = (req.query.start_date) ? req.query.start_date : current_date
    const _end_date = (req.query.end_date) ? req.query.end_date : current_date

    const start_date = _start_date + ' 00:00:00'
    const end_date = _end_date + ' 23:59:59'

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "'" + " ORDER BY id DESC"

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else {
            // get camera name, then add to result
            const sql_query2 = 'select * from camera_list where id=' + id_value

            if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
            if (result.length > 0) {
                MYSQLcon.query(sql_query2, function (err2, result2, fields) {
                    if (err2) res.send('error select ' + id_kamera + ': ' + sql_query2)
                    if (result2.length > 0) {

                        const sql_query3 = `SELECT any_value(DATE_FORMAT(waktu, '%Y-%m-%d %H:00')) AS jam, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=` + id_value + ` AND waktu BETWEEN '` + start_date + `' AND '` + end_date + `' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d %H') ORDER BY jam DESC`

                        MYSQLcon.query(sql_query3, async function (err3, result3, fields) {
                            if (err3) res.send('error select ' + id_value + ': ' + sql_query3)

                            if (result3.length > 0) {
                                const camera_name = result2[0].name
                                const camera_rtsp = result2[0].rtsp
                                const camera_lat = result2[0].lat
                                const camera_lng = result2[0].lng

                                let dataset = result

                                let dataset2 = result3

                                let waktu_mulai = result[0].waktu
                                let waktu_selesai = result[result.length - 1].waktu

                                // split waktu into date and time
                                for (let i = 0; i < result.length; i++) {
                                    let waktu = result[i].waktu
                                    // convert waktu to dd-mm-yyyy hh:mm
                                    let date = new Date(waktu)
                                    let dd = date.getDate()
                                    let mm = date.getMonth() + 1
                                    let yyyy = date.getFullYear()
                                    let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                    let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                    dataset[i].tanggal = dd + '-' + mm + '-' + yyyy
                                    dataset[i].jam = hh + ':' + min

                                    if (i == 0) waktu_mulai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                                    if (i == result.length - 1) waktu_selesai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                                }

                                for (let i = 0; i < result3.length; i++) {
                                    let waktu = result3[i].jam
                                    // convert Waktu to dd-mm-yyyy hh:mm
                                    let date = new Date(waktu)
                                    let dd = date.getDate()
                                    let mm = date.getMonth() + 1
                                    let yyyy = date.getFullYear()
                                    let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                    let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                    dataset2[i].tanggal = dd + '-' + mm + '-' + yyyy
                                    dataset2[i].jam = hh + ':' + min
                                }

                                const result_jam15 = await report_interval15(id_value, _start_date, _end_date)

                                let dataset_jam15 = []

                                for (let i = 0; i < result_jam15.length; i++) {
                                    let res15 = result_jam15[i];
                                    const tanggal = res15.start.split(' ')[0]
                                    const jam_start = res15.start.split(' ')[1]
                                    const jam_end = res15.end.split(' ')[1]
                                    const jam = jam_start + ' s/d ' + jam_end

                                    Object.keys(res15).forEach(key15 => {
                                        const val15 = res15[key15]
                                        res15[key15] = (val15 != null) ? val15 : '-'
                                    });

                                    dataset_jam15.push({ ...res15, tanggal, jam })
                                }

                                const heading = [
                                    [{ value: 'Laporan Log Kamera', style: { font: { size: 16, bold: true, color: { rgb: '000000' } } } }],
                                    [''],
                                    ['Nama Kamera', ':', camera_name],
                                    ['Waktu Log Dari', ':', waktu_mulai],
                                    ['Waktu Log Hingga', ':', waktu_selesai],
                                    [''],
                                    [
                                        'Waktu', '',
                                        'Sepeda Motor (SM)', '',
                                        'Mobil Penumpang (MP)', '',
                                        'Kendaraan Sedang (KS)', '', '', '',
                                        'Bus Besar (BB)', '',
                                        'Truck Besar (TB)', '',
                                        'SMP/menit', '',
                                    ]
                                ]

                                const merges = [
                                    {
                                        start: { row: 1, column: 1 },
                                        end: { row: 1, column: 16 }
                                    },
                                    {
                                        // Waktu
                                        start: { row: 7, column: 1 },
                                        end: { row: 7, column: 2 }
                                    },
                                    {
                                        // Sepeda Motor (SM)
                                        start: { row: 7, column: 3 },
                                        end: { row: 7, column: 4 }
                                    },
                                    {
                                        // Mobil Penumpang (MP)
                                        start: { row: 7, column: 5 },
                                        end: { row: 7, column: 6 }
                                    },
                                    {
                                        // Kendaraan Sedang (KS)
                                        start: { row: 7, column: 7 },
                                        end: { row: 7, column: 10 }
                                    },
                                    {
                                        // Bus Besar (BB)
                                        start: { row: 7, column: 11 },
                                        end: { row: 7, column: 12 }
                                    },
                                    {
                                        // Truck Besar (TB)
                                        start: { row: 7, column: 13 },
                                        end: { row: 7, column: 14 }
                                    },
                                    {
                                        // SMP/menit
                                        start: { row: 7, column: 15 },
                                        end: { row: 7, column: 16 }
                                    }
                                ]

                                let specification = {
                                    tanggal: {
                                        displayName: 'tanggal',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    jam: {
                                        displayName: 'jam',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    sm_in: {
                                        displayName: 'Sepeda Motor (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    sm_out: {
                                        displayName: 'Sepeda Motor (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    mp_in: {
                                        displayName: 'Mobil (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    mp_out: {
                                        displayName: 'Mobil (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_b_in: {
                                        displayName: 'Bus (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_b_out: {
                                        displayName: 'Bus (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_t_in: {
                                        displayName: 'Truck (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_t_out: {
                                        displayName: 'Truck (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    bb_in: {
                                        displayName: 'Bus Besar (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    bb_out: {
                                        displayName: 'Bus Besar (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    tb_in: {
                                        displayName: 'Truck Besar (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    tb_out: {
                                        displayName: 'Truck Besar (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    smp_in: {
                                        displayName: 'SMP (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    smp_out: {
                                        displayName: 'SMP (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                }

                                const report = excel.buildExport(
                                    [
                                        {
                                            name: 'log smp per jam 15 menitan',
                                            specification: specification,
                                            heading: heading,
                                            data: dataset_jam15,
                                            merges: merges,
                                        },
                                        {
                                            name: 'log per-menit',
                                            specification: specification,
                                            heading: heading,
                                            data: dataset,
                                            merges: merges,
                                        },
                                        {
                                            name: 'log per-jam',
                                            specification: specification,
                                            heading: heading,
                                            data: dataset2,
                                            merges: merges,
                                        },
                                    ]
                                )
                                // console.log(specification)

                                // res.json(dataset_jam15)

                                res.attachment('Log ' + camera_name + ' ' + waktu_mulai + ' sd ' + waktu_selesai + '.xlsx')
                                res.send(report)
                            }
                        })
                    }
                })
            } else {
                res.send('no data found at ' + start_date + ' to ' + end_date)
            }
        }
    })
})

app.get('/report_excel_old/:id', (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "'" + " ORDER BY id DESC"

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else {
            // get camera name, then add to result
            const sql_query2 = 'select * from camera_list where id=' + id_value

            if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
            if (result.length > 0) {
                MYSQLcon.query(sql_query2, function (err2, result2, fields) {
                    if (err2) res.send('error select ' + id_kamera + ': ' + sql_query2)
                    if (result2.length > 0) {

                        const sql_query3 = `SELECT DATE_FORMAT(waktu, '%Y-%m-%d %H:00') AS jam, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=` + id_value + ` AND waktu BETWEEN '` + start_date + `' AND '` + end_date + `' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d %H') ORDER BY jam DESC`

                        MYSQLcon.query(sql_query3, function (err3, result3, fields) {
                            if (err3) res.send('error select ' + id_kamera + ': ' + sql_query3)

                            if (result3.length > 0) {
                                const camera_name = result2[0].name
                                const camera_rtsp = result2[0].rtsp
                                const camera_lat = result2[0].lat
                                const camera_lng = result2[0].lng

                                let dataset = result

                                let dataset2 = result3

                                let waktu_mulai = result[0].waktu
                                let waktu_selesai = result[result.length - 1].waktu

                                // split waktu into date and time
                                for (let i = 0; i < result.length; i++) {
                                    let waktu = result[i].waktu
                                    // convert waktu to dd-mm-yyyy hh:mm
                                    let date = new Date(waktu)
                                    let dd = date.getDate()
                                    let mm = date.getMonth() + 1
                                    let yyyy = date.getFullYear()
                                    let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                    let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                    dataset[i].tanggal = dd + '-' + mm + '-' + yyyy
                                    dataset[i].jam = hh + ':' + min

                                    if (i == 0) waktu_mulai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                                    if (i == result.length - 1) waktu_selesai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                                }

                                for (let i = 0; i < result3.length; i++) {
                                    let waktu = result3[i].jam
                                    // convert Waktu to dd-mm-yyyy hh:mm
                                    let date = new Date(waktu)
                                    let dd = date.getDate()
                                    let mm = date.getMonth() + 1
                                    let yyyy = date.getFullYear()
                                    let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                    let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                    dataset2[i].tanggal = dd + '-' + mm + '-' + yyyy
                                    dataset2[i].jam = hh + ':' + min
                                }


                                const heading = [
                                    [{ value: 'Laporan Log Kamera', style: { font: { size: 16, bold: true, color: { rgb: '000000' } } } }],
                                    [''],
                                    ['Nama Kamera', ':', camera_name],
                                    ['Waktu Log Dari', ':', waktu_mulai],
                                    ['Waktu Log Hingga', ':', waktu_selesai],
                                    [''],
                                    [
                                        'Waktu', '',
                                        'Sepeda Motor (SM)', '',
                                        'Mobil Penumpang (MP)', '',
                                        'Kendaraan Sedang (KS)', '', '', '',
                                        'Bus Besar (BB)', '',
                                        'Truck Besar (TB)', '',
                                        'SMP/menit', '',
                                    ]
                                ]

                                const merges = [
                                    {
                                        start: { row: 1, column: 1 },
                                        end: { row: 1, column: 16 }
                                    },
                                    {
                                        // Waktu
                                        start: { row: 7, column: 1 },
                                        end: { row: 7, column: 2 }
                                    },
                                    {
                                        // Sepeda Motor (SM)
                                        start: { row: 7, column: 3 },
                                        end: { row: 7, column: 4 }
                                    },
                                    {
                                        // Mobil Penumpang (MP)
                                        start: { row: 7, column: 5 },
                                        end: { row: 7, column: 6 }
                                    },
                                    {
                                        // Kendaraan Sedang (KS)
                                        start: { row: 7, column: 7 },
                                        end: { row: 7, column: 10 }
                                    },
                                    {
                                        // Bus Besar (BB)
                                        start: { row: 7, column: 11 },
                                        end: { row: 7, column: 12 }
                                    },
                                    {
                                        // Truck Besar (TB)
                                        start: { row: 7, column: 13 },
                                        end: { row: 7, column: 14 }
                                    },
                                    {
                                        // SMP/menit
                                        start: { row: 7, column: 15 },
                                        end: { row: 7, column: 16 }
                                    }
                                ]

                                let specification = {
                                    tanggal: {
                                        displayName: 'tanggal',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    jam: {
                                        displayName: 'jam',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    sm_in: {
                                        displayName: 'Sepeda Motor (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    sm_out: {
                                        displayName: 'Sepeda Motor (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    mp_in: {
                                        displayName: 'Mobil (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    mp_out: {
                                        displayName: 'Mobil (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_b_in: {
                                        displayName: 'Bus (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_b_out: {
                                        displayName: 'Bus (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_t_in: {
                                        displayName: 'Truck (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    ks_t_out: {
                                        displayName: 'Truck (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    bb_in: {
                                        displayName: 'Bus Besar (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    bb_out: {
                                        displayName: 'Bus Besar (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    tb_in: {
                                        displayName: 'Truck Besar (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    tb_out: {
                                        displayName: 'Truck Besar (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    smp_in: {
                                        displayName: 'SMP (in)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                    smp_out: {
                                        displayName: 'SMP (out)',
                                        headerStyle: {
                                            fontSize: 12,
                                            hAlign: 'center',
                                            wrapText: true
                                        },
                                        width: 100
                                    },
                                }
                                const report = excel.buildExport(
                                    [
                                        {
                                            name: 'log per-menit',
                                            specification: specification,
                                            heading: heading,
                                            data: dataset,
                                            merges: merges,
                                        },
                                        {
                                            name: 'log per-jam',
                                            specification: specification,
                                            heading: heading,
                                            data: dataset2,
                                            merges: merges,
                                        },
                                    ]
                                )
                                // console.log(specification)
                                res.attachment('Log ' + camera_name + ' ' + waktu_mulai + ' sd ' + waktu_selesai + '.xlsx')
                                res.send(report)
                            }
                        })
                    }
                })
            } else {
                res.send('no data found at ' + start_date + ' to ' + end_date)
            }
        }
    })
})

app.get('/report_excel_15/:id', (req, res) => {

    const nama_tabel = 'camera_log'
    const id_key = 'camera_id'
    const id_value = req.params.id

    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let sql_query = "SELECT * FROM " + nama_tabel + " WHERE " + id_key + "=" + id_value + " AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "'" + " ORDER BY id DESC"

    MYSQLcon.query(sql_query, function (err, result, fields) {
        if (err) res.send('error select ' + nama_tabel + ': ' + sql_query)
        else {
            // get camera name, then add to result
            const sql_query2 = 'select * from camera_list where id=' + id_value

            if (err) res.send('error select ' + id_kamera + ': ' + sql_query)
            if (result.length > 0) {
                MYSQLcon.query(sql_query2, async function (err2, result2, fields) {
                    if (err2) res.send('error select ' + id_kamera + ': ' + sql_query2)
                    if (result2.length > 0) {

                        const jam_min00 = await sql_report_perjam_15an('00', id_value, start_date, end_date)
                        const jam_min15 = await sql_report_perjam_15an('15', id_value, start_date, end_date)
                        const jam_min30 = await sql_report_perjam_15an('30', id_value, start_date, end_date)
                        const jam_min45 = await sql_report_perjam_15an('45', id_value, start_date, end_date)

                        const sql_query3 = `SELECT DATE_FORMAT(waktu, '%Y-%m-%d %H:00') AS jam, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=` + id_value + ` AND waktu BETWEEN '` + start_date + `' AND '` + end_date + `' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d %H') ORDER BY jam DESC`

                        let result3 = []
                        for (let i = 0; i < jam_min00.length; i++) {
                            const jam00 = jam_min00[i];
                            const jam15 = jam_min15[i];
                            const jam30 = jam_min30[i];
                            const jam45 = jam_min45[i];
                            let jam_str = jam00.jam
                            result3.push(jam00)
                            result3.push(jam15)
                            result3.push(jam30)
                            result3.push(jam45)
                        }

                        if (result3.length > 0) {
                            const camera_name = result2[0].name
                            const camera_rtsp = result2[0].rtsp
                            const camera_lat = result2[0].lat
                            const camera_lng = result2[0].lng

                            let dataset = result

                            let dataset2 = result3

                            let waktu_mulai = result[0].waktu
                            let waktu_selesai = result[result.length - 1].waktu

                            // split waktu into date and time
                            for (let i = 0; i < result.length; i++) {
                                let waktu = result[i].waktu
                                // convert waktu to dd-mm-yyyy hh:mm
                                let date = new Date(waktu)
                                let dd = date.getDate()
                                let mm = date.getMonth() + 1
                                let yyyy = date.getFullYear()
                                let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                dataset[i].tanggal = dd + '-' + mm + '-' + yyyy
                                dataset[i].jam = hh + ':' + min

                                if (i == 0) waktu_mulai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                                if (i == result.length - 1) waktu_selesai = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + min
                            }

                            for (let i = 0; i < result3.length; i++) {
                                let waktu = result3[i].jam
                                // convert Waktu to dd-mm-yyyy hh:mm
                                let date = new Date(waktu)
                                let dd = date.getDate()
                                let mm = date.getMonth() + 1
                                let yyyy = date.getFullYear()
                                let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours()
                                let min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()

                                dataset2[i].tanggal = dd + '-' + mm + '-' + yyyy
                                dataset2[i].jam = hh + ':' + min
                            }


                            const heading = [
                                [{ value: 'Laporan Log Kamera', style: { font: { size: 16, bold: true, color: { rgb: '000000' } } } }],
                                [''],
                                ['Nama Kamera', ':', camera_name],
                                ['Waktu Log Dari', ':', waktu_mulai],
                                ['Waktu Log Hingga', ':', waktu_selesai],
                                [''],
                                [
                                    'Waktu', '',
                                    'Sepeda Motor (SM)', '',
                                    'Mobil Penumpang (MP)', '',
                                    'Kendaraan Sedang (KS)', '', '', '',
                                    'Bus Besar (BB)', '',
                                    'Truck Besar (TB)', '',
                                    'SMP/menit', '',
                                ]
                            ]

                            const merges = [
                                {
                                    start: { row: 1, column: 1 },
                                    end: { row: 1, column: 16 }
                                },
                                {
                                    // Waktu
                                    start: { row: 7, column: 1 },
                                    end: { row: 7, column: 2 }
                                },
                                {
                                    // Sepeda Motor (SM)
                                    start: { row: 7, column: 3 },
                                    end: { row: 7, column: 4 }
                                },
                                {
                                    // Mobil Penumpang (MP)
                                    start: { row: 7, column: 5 },
                                    end: { row: 7, column: 6 }
                                },
                                {
                                    // Kendaraan Sedang (KS)
                                    start: { row: 7, column: 7 },
                                    end: { row: 7, column: 10 }
                                },
                                {
                                    // Bus Besar (BB)
                                    start: { row: 7, column: 11 },
                                    end: { row: 7, column: 12 }
                                },
                                {
                                    // Truck Besar (TB)
                                    start: { row: 7, column: 13 },
                                    end: { row: 7, column: 14 }
                                },
                                {
                                    // SMP/menit
                                    start: { row: 7, column: 15 },
                                    end: { row: 7, column: 16 }
                                }
                            ]

                            let specification = {
                                tanggal: {
                                    displayName: 'tanggal',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                jam: {
                                    displayName: 'jam',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                sm_in: {
                                    displayName: 'Sepeda Motor (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                sm_out: {
                                    displayName: 'Sepeda Motor (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                mp_in: {
                                    displayName: 'Mobil (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                mp_out: {
                                    displayName: 'Mobil (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                ks_b_in: {
                                    displayName: 'Bus (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                ks_b_out: {
                                    displayName: 'Bus (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                ks_t_in: {
                                    displayName: 'Truck (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                ks_t_out: {
                                    displayName: 'Truck (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                bb_in: {
                                    displayName: 'Bus Besar (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                bb_out: {
                                    displayName: 'Bus Besar (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                tb_in: {
                                    displayName: 'Truck Besar (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                tb_out: {
                                    displayName: 'Truck Besar (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                smp_in: {
                                    displayName: 'SMP (in)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                                smp_out: {
                                    displayName: 'SMP (out)',
                                    headerStyle: {
                                        fontSize: 12,
                                        hAlign: 'center',
                                        wrapText: true
                                    },
                                    width: 100
                                },
                            }
                            const report = excel.buildExport(
                                [
                                    {
                                        name: 'log per-menit',
                                        specification: specification,
                                        heading: heading,
                                        data: dataset,
                                        merges: merges,
                                    },
                                    {
                                        name: 'log per-jam',
                                        specification: specification,
                                        heading: heading,
                                        data: dataset2,
                                        merges: merges,
                                    },
                                ]
                            )
                            // console.log(specification)
                            res.attachment('Log ' + camera_name + ' ' + waktu_mulai + ' sd ' + waktu_selesai + '.xlsx')
                            res.send(report)
                        }
                    }
                })
            } else {
                res.send('no data found at ' + start_date + ' to ' + end_date)
            }
        }
    })
})

app.get('/jogja_kendaraan', async (req, res) => {
    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let kendaraan_total = {
        masuk: {
            mobil: 0,
            motor: 0,
            bus: 0,
            truck: 0,
        },
        keluar: {
            mobil: 0,
            motor: 0,
            bus: 0,
            truck: 0,
        },
    }

    let result = []
    result = await queryLebaranJogja(start_date, end_date).catch(err => {
        // console.log({ err })
        res.json(kendaraan_total)
        return
    })

    if (result !== undefined) {
        for (let i = 0; i < result.length; i++) {
            const data = result[i]
            kendaraan_total.masuk.mobil += data.mp_in
            kendaraan_total.masuk.motor += data.sm_in
            kendaraan_total.masuk.bus += data.ks_b_in
            kendaraan_total.masuk.truck += data.ks_t_in
            kendaraan_total.keluar.mobil += data.mp_out
            kendaraan_total.keluar.motor += data.sm_out
            kendaraan_total.keluar.bus += data.ks_b_out
            kendaraan_total.keluar.truck += data.ks_t_out
        }
        res.json(kendaraan_total)
    }
})

app.get('/jogja_timeline', async (req, res) => {
    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let kendaraan_timeline = []

    let result = []
    result = await queryLebaranJogja(start_date, end_date).catch(err => {
        // console.log({ err })
        res.json(kendaraan_timeline)
        return
    })

    if (result !== undefined) {
        for (let i = 0; i < result.length; i++) {
            const data = result[i]
            kendaraan_timeline.push({
                masuk: data.mp_in,
                keluar: data.mp_out,
                waktu: data.hari
            })
        }

        res.json(kendaraan_timeline)
    }
})

app.get('/jogja_excel', async (req, res) => {
    // check url GET query
    // start_date=current_date&end_date=current_date
    let current_date = new Date()
    // format date
    current_date = current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-' + current_date.getDate()

    let start_date = (req.query.start_date) ? req.query.start_date : current_date
    let end_date = (req.query.end_date) ? req.query.end_date : current_date

    start_date = start_date + ' 00:00:00'
    end_date = end_date + ' 23:59:59'

    let kendaraan_timeline = []

    let result = []
    // result = await queryLebaranJogja(start_date, end_date).catch(err => {
    //     // console.log({ err })
    //     res.json(kendaraan_timeline)
    //     return
    // })

    // if (result !== undefined) {
    //     res.json(result)
    // }
    res.json(result)
})

async function queryLebaranJogja_old(start_date, end_date) {
    return new Promise((resolve, reject) => {
        let sql_query = "SELECT any_value(DATE_FORMAT(waktu, '%Y-%m-%d')) AS hari, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=14  OR  camera_id=15 OR  camera_id=17 OR  camera_id=18 AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d') ORDER BY hari DESC;"

        // console.log(sql_query)

        MYSQLcon.query(sql_query, function (err, result, fields) {
            if (err) reject([])
            else resolve(result)
        })
    })
}

async function queryLebaranJogja(start_date, end_date) {
    // get all date between start_date and end_date
    let dates = []
    let currentDate = new Date(start_date)
    let stopDate = new Date(end_date)

    while (currentDate <= stopDate) {
        // yyyy-mm-dd
        dates.push(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate())
    }

    console.log({ dates })

    return dates
    // const promises = dates.map(date => queryLebaranJogjaHarian(date).catch(err => {
    //     // console.log({ err })
    //     return []
    // }))

    // let result = []

    // return Promise.all(promises).then(results => {
    //     result.push(...results)

    //     return result
    // })
}

async function queryLebaranJogjaHarian(_date) {
    const camera_list = [
        {
            id: 14,
            masuk: 'in',
            keluar: 'out'
        },
        {
            id: 15,
            masuk: 'out',
            keluar: 'in'
        },
        {
            id: 17,
            masuk: 'in',
            keluar: 'out'
        },
        {
            id: 18,
            masuk: 'in',
            keluar: 'out'
        },
    ]

    let result = {
        masuk: 0,
        keluar: 0,
        tanggal: _date
    }

    const promises = camera_list.map(camera => queryLebaranJogjaHarianKamera(_date, camera.id).catch(err => {
        // console.log({ err })
        return result
    }))

    return Promise.all(promises).then(results => {
        results.forEach(_result => {
            if (_result) {
                result.masuk += _result.masuk
                result.keluar += _result.keluar
            }
        })

        return result
    })

}

async function queryLebaranJogjaHarianKamera(_date, camera_id) {
    return new Promise((resolve, reject) => {
        let start_date = _date + ' 00:00:00'
        let end_date = _date + ' 23:59:59'

        let sql_query = "SELECT any_value(DATE_FORMAT(waktu, '%Y-%m-%d')) AS hari, SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id=' + camera_id + ' AND waktu BETWEEN '" + start_date + "' AND '" + end_date + "' GROUP BY DATE_FORMAT(waktu, '%Y-%m-%d') ORDER BY hari DESC;"

        // console.log(sql_query)

        MYSQLcon.query(sql_query, function (err, result, fields) {
            if (err) reject([])
            else resolve(result)
        })
    })
}

async function report_interval15(id_camera = 14, start_date_str = '2024-3-22', end_date_str = '2024-3-22') {
    let result = []

    const start_date = new Date(start_date_str)
    const end_date = new Date(end_date_str)
    const date_diff = (end_date - start_date) / (1000 * 60 * 60 * 24)

    let date_list = []
    for (let i = 0; i <= date_diff; i++) {
        const date = new Date(start_date)
        date.setDate(date.getDate() + i)
        const date_str = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        date_list.push(date_str)
    }

    for (let i = 0; i < date_list.length; i++) {
        const date = date_list[i]
        const intervals00 = getIntervalOneDay('00', date)
        const intervals15 = getIntervalOneDay('15', date)
        const intervals30 = getIntervalOneDay('30', date)
        const intervals45 = getIntervalOneDay('45', date)
        for (let j = 0; j < intervals00.length; j++) {
            const interval00 = intervals00[j]
            const interval15 = intervals15[j]
            const interval30 = intervals30[j]
            const interval45 = intervals45[j]

            await executeInterval(id_camera, interval00, result)
            await executeInterval(id_camera, interval15, result)
            await executeInterval(id_camera, interval30, result)
            await executeInterval(id_camera, interval45, result)
        }
    }

    // console.log(result)
    return result
}

async function executeInterval(id_camera, interval00, result) {
    const sql_data = await runQuery(queryTemplateLogSUM(id_camera, interval00['start'], interval00['end']))

    result.push(new Object({ start: interval00['start'], end: interval00['end'], ...sql_data[0] }))
}

function queryTemplateLogSUM(camera_id, waktu_start, waktu_end) {
    let sql_query = `SELECT SUM(sm) AS sm, SUM(sm_in) AS sm_in, SUM(sm_out) AS sm_out, SUM(mp) AS mp, SUM(mp_in) AS mp_in, SUM(mp_in) AS mp_in, SUM(mp_out) AS mp_out, SUM(ks) AS ks, SUM(ks_in) AS ks_in, SUM(ks_in) AS ks_in, SUM(ks_out) AS ks_out, SUM(ks) AS ks, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_in) AS ks_b_in, SUM(ks_b_out) AS ks_b_out, SUM(ks) AS ks, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_in) AS ks_t_in, SUM(ks_t_out) AS ks_t_out, SUM(tb) AS tb, SUM(tb_in) AS tb_in, SUM(tb_in) AS tb_in, SUM(tb_out) AS tb_out, SUM(bb) AS bb, SUM(bb_in) AS bb_in, SUM(bb_in) AS bb_in, SUM(bb_out) AS bb_out, SUM(smp) AS smp, SUM(smp_in) AS smp_in, SUM(smp_in) AS smp_in, SUM(smp_out) AS smp_out FROM camera_log WHERE camera_id = ${camera_id} AND waktu BETWEEN "${waktu_start}" AND "${waktu_end}"`
    return sql_query
}

function getIntervalOneDay(minute = '00', date) {
    let start_time = ((date == null) ? new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() : date) + ' 00:' + minute + ':00'
    let intervals = []
    // make to yy-mm-dd hh:mm - hh+1:mm
    for (let i = 0; i < 24; i++) {
        let start = new Date(start_time)
        start.setHours(start.getHours() + i)
        let end = new Date(start_time)
        end.setHours(start.getHours() + 1)
        // format date to yy-mm-dd hh:ii
        start = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate() + ' ' + (start.getHours() < 10 ? '0' : '') + start.getHours() + ':' + (start.getMinutes() < 10 ? '0' : '') + start.getMinutes()
        end = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate() + ' ' + (end.getHours() < 10 ? '0' : '') + end.getHours() + ':' + (end.getMinutes() < 10 ? '0' : '') + end.getMinutes()
        intervals.push({ start, end })
    }
    return intervals
}

async function runQuery(sql_query) {
    return new Promise((resolve, reject) => {
        MYSQLcon.query(sql_query, function (err, result, fields) {
            if (err) reject(err)
            resolve(result)
        })
    })
}

app.listen(port, () => {
    console.log(`BE app listening on port ${port}`)
})

function containsMathOperators(str) {
    // Define a regular expression pattern to match math operators
    var mathOperatorsPattern = /[+\-*\/^]/;

    // Test the string against the pattern
    return mathOperatorsPattern.test(str);
}

function containAlphabet(str) {
    // check if any character in the string is an alphabet
    return str.split('').some(char => /[a-zA-Z]/.test(char));
}

function isNotNumber(val) {
    return (isNaN(parseFloat(val)) || containsMathOperators(val)) || containAlphabet(val)
}

function isIpFormat(val) {
    return (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).test(val)
}