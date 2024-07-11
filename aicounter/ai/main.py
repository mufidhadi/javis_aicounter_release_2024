import cv2
from ultralytics import YOLO
import supervision as sv
import subprocess as sp
import config as cf
import camera_list as cl
import argparse
import os
import json
import requests
import time
import numpy
import websocket
import paho.mqtt.client as mqtt
import base64

yolo_imgsz = 640
yolo_imgsz = 320
yolo_half = False

allowed_cls = cf.config['yolo']['allowed_cls']
allowed_cls_str = ', '.join(allowed_cls)

rtsp_server = cf.config['rtsp']['base_url']
video_source = 'rtsp://cctv:AtmsJavis22@10.21.32.11/Streaming/Channels/102'
yolo_model_name = cf.config['yolo']['model']
ws_server = cf.config['ws']['host']
ws_server2 = cf.config['ws']['host2']

# check if the yolo model name has _640 on it
if '_640' in yolo_model_name or yolo_model_name=='jv_indo_m.pt':
    yolo_imgsz = 640

print('yolo_model_name', yolo_model_name)
print('yolo_imgsz', yolo_imgsz)

START = sv.Point(320, 0)
END = sv.Point(320, 480)

if yolo_imgsz == 640:
    START = sv.Point(640, 0)
    END = sv.Point(640, 960)


mqtt_broker_address = cf.config['mqtt']['host']
mqtt_pub_topic = cf.config['mqtt']['base_topic_pub']

smp_list = [
    {'name':'motor','smp':0.5},
    {'name':'mobil','smp':1},
    {'name':'bus','smp':3},
    {'name':'truck','smp':3},
    {'name':'bus besar','smp':5},
    {'name':'truck besar','smp':5},
]

size_str = '320x240'
if yolo_imgsz == 640:
    size_str = '640x480'
fps = 24

FOLDER_OTPUT = 'video_out'

rekaman = None

model_names = ['truck',  'motor',  'mobil',  'truck besar',  'bus',  'pickup',  'bus besar']

pd_active = False
pd_id = '1'
pd_fase = '1'

pd_mqtt_host = 'localhost'
pd_mqtt_username = 'javis'
pd_mqtt_password = '#MqttJavis313'
pd_mqtt_pub_topic = 'its-link/server/'
pd_mqtt_sub_topic = 'its-link/client/'
pd_mode = 'gap'
pd_threshold = 0.5

pd_mqtt_pub_topic = pd_mqtt_pub_topic + str(pd_id)
pd_mqtt_sub_topic = pd_mqtt_sub_topic + str(pd_id)

pd_mqttc = None
pd_mqttc_pub = None

pd_ordered_to_send = False
pd_gap = 0.0
pd_gap_in = 0.0
pd_gap_out = 0.0
pd_gap_time = time.time()

def run(id,all_cls=False,rekam=False,cam_id=1,durasi_rekam=10,show_window=False):
    global pd_active, pd_id, pd_fase, pd_mqtt_host, pd_mqtt_username, pd_mqtt_password, pd_mqtt_pub_topic, pd_mqtt_sub_topic, pd_mode, pd_threshold, pd_mqtt_pub_topic, pd_mqtt_sub_topic, pd_ordered_to_send, pd_gap, pd_gap_in, pd_gap_out, pd_gap_time, pd_mqttc, pd_mqttc_pub

    ids = []
    counter_objek = {}
    counter_objek_in = {}
    counter_objek_out = {}
    counter_objek_in_keys = []
    counter_objek_out_keys = []
    detected_obj = list()

    last_min = 0
    
    counter_objek = {
        'motor':0,
        'mobil':0,
        'bus':0,
        'truck':0,
        'bus besar':0,
        'truck besar':0,
    }
    counter_objek_in = {
        'motor':0,
        'mobil':0,
        'bus':0,
        'truck':0,
        'bus besar':0,
        'truck besar':0,
    }
    counter_objek_out = {
        'motor':0,
        'mobil':0,
        'bus':0,
        'truck':0,
        'bus besar':0,
        'truck besar':0,
    }

    start_time = time.time()
    start_time_rekaman = time.time()
    past_time_rekaman = start_time_rekaman
    nomor_frame = 0
    
    print(cam_id)
    redis_topic = 'cam/'+str(id)

    counter_in = 0
    counter_out = 0
    last_line_states = []

    last_in = 0
    last_out = 0
    last_time = start_time

    id = str(id)
    rtsp_server_run = rtsp_server+str(id)
    cam = cl.cam_from_id(id)
    video_source = cam['rtsp']

    cap = cv2.VideoCapture(video_source)
    video_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    size_str = str(video_w)+'x'+str(video_h)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()

    # START = sv.Point(0, int(video_h/2))
    # END = sv.Point(int(video_w), int(video_h/2))

    output_h = 240
    output_w = 426

    output_res = '240p'
    output_res = cam['output_res']

    if output_res == '240p':
        output_h = 240
        output_w = 426
    if output_res == '360p':
        output_h = 360
        output_w = 640
    if output_res == '480p':
        output_h = 480
        output_w = 854
    if output_res == '720p':
        output_h = 720
        output_w = 1280

    line_start_x = cam['line']['start']['x']
    line_start_y = cam['line']['start']['y']
    line_end_x = cam['line']['end']['x']
    line_end_y = cam['line']['end']['y']

    START = sv.Point(int(video_w * line_start_x), int(video_h * line_start_y))
    END = sv.Point(int(video_w * line_end_x), int(video_h * line_end_y))

    model = YOLO(yolo_model_name)

    line_zone = sv.LineZone(start=START, end=END)
    line_zone_annotator = sv.LineZoneAnnotator(
        thickness=1,
        text_thickness=1,
        text_scale=0.5
    )

    box_anotator = sv.BoxAnnotator(
        thickness=1,
        text_thickness=1,
        text_scale=0.5
    )

    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    ###########################
    # PRESENCE DETECTOR (start)
    ###########################\
    pd = cf.config['presence_detector']
    pd_cam = cam['presence_detector']

    pd_active = (pd_cam['active'] == 'Y' or pd_cam['active'] == 'y' or pd_cam['active'] == True)
    pd_id = pd_cam['id']
    pd_fase = pd_cam['fase']

    pd_mqtt_host = pd['mqtt']['host']
    pd_mqtt_username = pd['mqtt']['username']
    pd_mqtt_password = pd['mqtt']['password']
    pd_mqtt_pub_topic = pd['mqtt']['topic']['send']
    pd_mqtt_sub_topic = pd['mqtt']['topic']['receive']
    pd_mode = pd['mode']
    pd_threshold = pd['threshold']

    pd_mqtt_pub_topic = pd_mqtt_pub_topic + str(pd_id)
    pd_mqtt_sub_topic = pd_mqtt_sub_topic + str(pd_id)

    # pd_ordered_to_send = False
    # pd_gap = 0.0
    # pd_gap_time = time.time()
    

    pd_mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    pd_mqttc_pub = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    if pd_mqtt_host != 'localhost':
        pd_mqttc.username_pw_set(pd_mqtt_username, pd_mqtt_password)
        pd_mqttc_pub.username_pw_set(pd_mqtt_username, pd_mqtt_password)

    def on_pd_mqtt_message(client, userdata, msg):
        global pd_ordered_to_send, pd_threshold

        # check if message is not empty and message is json
        # if is_print: print('on_pd_mqtt_message', msg.topic, msg.payload)
        if len(msg.payload) > 0 :
            try:
                # read json message
                message = json.loads(msg.payload)
                if str(message['id']) == str(pd_id):
                    if str(message['fase']) == str(pd_fase):
                        if message['perintah'] == 'mulai':
                            pd_ordered_to_send = True
                            pd_threshold = message['gap']
                        elif message['perintah'] == 'selesai':
                            pd_ordered_to_send = False
            except Exception as e:
                # if is_print: print('message is not json, it causes error', e)
                pass

    if pd_active:
        # if is_print: print('PD ACTIVE')
        pd_mqttc.connect(pd_mqtt_host)
        # subscribe
        pd_mqttc.subscribe(pd_mqtt_sub_topic)
        pd_mqttc.on_message = on_pd_mqtt_message
        pd_mqttc_pub.connect(pd_mqtt_host)
        pd_mqttc_pub.publish(pd_mqtt_pub_topic, 'presence detector online')
        pd_mqttc_pub.disconnect()
        print('presence detector online', pd_mqtt_pub_topic, pd_mqtt_sub_topic)

    print('source',video_source)
    
    # for result in model.track(source=video_source, show=False, stream=True, tracker="bytetrack.yaml",imgsz=yolo_imgsz,verbose=False, half=yolo_half):
    for result in model.track(source=video_source, show=False, stream=True, imgsz=yolo_imgsz,verbose=False, half=yolo_half):
        if pd_active:
            pd_mqttc.loop_start()

        frame = result.orig_img

        detections = sv.Detections.from_yolov8(result)

        if result.boxes.id is not None:
            detections.tracker_id = result.boxes.id.cpu().numpy().astype(int)
            labels = []

            temp_detections = []
            for det in detections:
                track_id = int(det[3])
                cls_id = int(det[2])
                # name = model.model.names[cls_id]
                name = model_names[cls_id]
                if track_id not in ids:
                    count_tmp = 0
                    ids.append(track_id)
                    if name not in counter_objek:
                        if not all_cls:
                            if name in allowed_cls:
                                counter_objek[name] = 1
                        else:
                            counter_objek[name] = 1
                    else:
                        count_tmp = counter_objek[name] + 1
                        if not all_cls:
                            if name in allowed_cls:
                                counter_objek[name] += 1
                        else:
                            counter_objek[name] += 1

                if not all_cls:
                    if name in allowed_cls:
                        temp_detections.append(det)

            if not all_cls:
                
                tmp_xyxy = []
                tmp_confidence = []
                tmp_class_id = []
                tmp_tracker_id = []
                
                tmp_xyxy_idx = 0
                tmp_confidence_idx = 2
                tmp_class_id_idx = 3
                tmp_tracker_id_idx = 4

                if len(temp_detections) > 1:
                    if len(temp_detections[0]) < 5:
                        tmp_xyxy_idx = 0
                        tmp_confidence_idx = 1
                        tmp_class_id_idx = 2
                        tmp_tracker_id_idx = 3
                
                    for tmp_det in temp_detections:
                        tmp_xyxy.append(tmp_det[tmp_xyxy_idx])
                        tmp_confidence.append(tmp_det[tmp_confidence_idx])
                        tmp_class_id.append(tmp_det[tmp_class_id_idx])
                        tmp_tracker_id.append(tmp_det[tmp_tracker_id_idx])
                        # labels.append('id:'+str(tmp_det[tmp_tracker_id_idx])+' '+str(model.model.names[int(tmp_det[tmp_class_id_idx])])+f' ({tmp_det[tmp_confidence_idx]:0.2f})')
                        labels.append('id:'+str(tmp_det[tmp_tracker_id_idx])+' '+str(model_names[int(tmp_det[tmp_class_id_idx])])+f' ({tmp_det[tmp_confidence_idx]:0.2f})')
                    
                    tmp_xyxy = numpy.array(tmp_xyxy)
                    tmp_confidence = numpy.array(tmp_confidence)
                    tmp_class_id = numpy.array(tmp_class_id)
                    tmp_tracker_id = numpy.array(tmp_tracker_id)

                    detections = sv.Detections(xyxy=tmp_xyxy,confidence=tmp_confidence,class_id=tmp_class_id,tracker_id=tmp_tracker_id)
            else:
                labels = [
                    # f'id:{tracker_id} {model.model.names[class_id]} ({confidence:0.2f})'
                    # f'id:{tracker_id} {model_names[class_id]} ({confidence:0.2f})'
                    f'id:{tracker_id}'
                    for _, confidence, class_id, tracker_id
                    in detections
                ]

            try:
                labels_ori = [
                    # f'id:{tracker_id} {model.model.names[class_id]} ({confidence:0.2f})'
                    # f'id:{tracker_id} {model_names[class_id]} ({confidence:0.2f})'
                    # f'{model_names[class_id]} (id:{tracker_id})'
                    f'{model_names[class_id]}'
                    for _, confidence, class_id, tracker_id
                    in detections
                ]
                labels = labels_ori

            except Exception as e4:
                print('error labels', e4)

            frame = box_anotator.annotate(scene=frame, detections=detections, labels=labels)

            last_line_states = line_zone.tracker_state.copy()

        line_zone.trigger(detections=detections)
        line_zone_annotator.annotate(frame=frame, line_counter=line_zone)

        # pd_mqttc_pub.connect(pd_mqtt_host)
        # pd_mqttc_pub.publish(pd_mqtt_pub_topic, 'in:' + str(counter_in) + ' out:' + str(counter_out) + '', qos=2)
        # pd_mqttc_pub.disconnect()

        mqttc.connect(mqtt_broker_address)
        mqttc.publish(mqtt_pub_topic+'/tes', json.dumps({
            'id': pd_id,
            'in': counter_in,
            'out': counter_out,
            # 'curr_gap_time':curr_gap_time,
            # 'curr_gap':curr_gap,
            'pd_gap_time':pd_gap_time,
            'pd_gap':pd_gap, 
        }))
        mqttc.disconnect()

        if len(line_zone.tracker_state) > 0 and len(last_line_states) > 0:
            keys = list(line_zone.tracker_state.keys())

            if line_zone.in_count > counter_in or line_zone.out_count > counter_out:
                for k in keys:
                    if k in last_line_states and last_line_states[k] != line_zone.tracker_state[k] :

                        obj_name = ''
                        for det in detections:
                            if det[3] is not None:
                                track_id = int(det[3])
                                cls_id = int(det[2])
                                # name = model.model.names[cls_id]
                                name = model_names[cls_id]
                                if int(track_id) == int(k):
                                    obj_name = name

                        if obj_name != '':

                            if line_zone.tracker_state[k] :
                                counter_in += 1
                                counter_objek_in_keys.append(k)
                                if obj_name not in counter_objek_in:
                                    counter_objek_in[obj_name] = 1
                                else:
                                    counter_objek_in[obj_name] += 1
                            else :
                                counter_out += 1
                                counter_objek_out_keys.append(k)
                                if obj_name not in counter_objek_out:
                                    counter_objek_out[obj_name] = 1
                                else:
                                    counter_objek_out[obj_name] += 1
                                # presence detecor process
                                # if pd_active and pd_mode == 'gap':
                                #     curr_gap_time = time.time()
                                #     curr_gap = curr_gap_time - pd_gap_time
                                #     pd_gap_time = curr_gap_time
                                #     pd_gap = curr_gap
                                #     # if pd_gap > pd_threshold and pd_ordered_to_send:
                                #     if True:
                                #         pd_mqttc_pub.connect(pd_mqtt_host)
                                #         pd_mqttc_pub.publish(pd_mqtt_pub_topic, json.dumps({
                                #             'id': pd_id,
                                #             'sistem':'presence',
                                #             'menu':'gap', 
                                #             'fase': pd_fase, 
                                #             'status': 'terpenuhi'
                                #         }))
                                #         pd_mqttc_pub.disconnect()
                            break

        smp_count = 0
        smp_count_in = 0
        smp_count_out = 0
        for smp in smp_list:
            smp_name = smp['name']
            if smp_name not in counter_objek:
                pass
            else:
                smp_count += counter_objek[smp_name] * smp['smp']
            if smp_name not in counter_objek_in:
                pass
            else:
                smp_count_in += counter_objek_in[smp_name] * smp['smp']
            if smp_name not in counter_objek_out:
                pass
            else:
                smp_count_out += counter_objek_out[smp_name] * smp['smp']
        counter_objek['smp'] = smp_count
        counter_objek_in['smp'] = smp_count_in
        counter_objek_out['smp'] = smp_count_out

        current_time = time.time()
        delta_time = current_time - start_time

        if last_out != line_zone.out_count:
            last_out = line_zone.out_count
            pd_gap = current_time - last_time
            pd_gap_out = current_time - last_time
            last_time = current_time

        if last_in != line_zone.in_count:
            last_in = line_zone.in_count
            # pd_gap = current_time - last_time
            pd_gap_in = current_time - last_time
            last_time = current_time

        if pd_gap < pd_threshold and pd_ordered_to_send:
            pd_mqttc_pub.connect(pd_mqtt_host)
            pd_mqttc_pub.publish(pd_mqtt_pub_topic, json.dumps({
                'id': pd_id,
                'sistem':'line',
                'menu':'gap', 
                'fase': pd_fase, 
                'status': 'terpenuhi'
            }))
            pd_mqttc_pub.disconnect()

        if int(delta_time) != last_min:
            last_min = int(delta_time)
            try:
                # to_json = {
                #     'id_kamera':int(id),
                #     'mobil':counter_objek['mobil'],
                #     'motor':counter_objek['motor'],
                #     'bus':counter_objek['bus'],
                #     'truck':counter_objek['truck'],
                #     'bus besar':counter_objek['bus besar'],
                #     'truck besar':counter_objek['truck besar'],
                #     'smp':smp_count,
                #     'smp_in':smp_count_in,
                #     'smp_out':smp_count_out,
                #     'waktu':current_time,
                #     'objek':[
                #         {'name':'mobil','count':counter_objek['mobil']},
                #         {'name':'motor','count':counter_objek['motor']},
                #         {'name':'bus','count':counter_objek['bus']},
                #         {'name':'truck','count':counter_objek['truck']},
                #         {'name':'bus besar','count':counter_objek['bus besar']},
                #         {'name':'truck besar','count':counter_objek['truck besar']},
                #     ],
                #     'objek_in':[
                #         {'name':'mobil','count':counter_objek_in['mobil']},
                #         {'name':'motor','count':counter_objek_in['motor']},
                #         {'name':'bus','count':counter_objek_in['bus']},
                #         {'name':'truck','count':counter_objek_in['truck']},
                #         {'name':'bus besar','count':counter_objek_in['bus besar']},
                #         {'name':'truck besar','count':counter_objek_in['truck besar']},
                #     ],
                #     'objek_out':[
                #         {'name':'mobil','count':counter_objek_out['mobil']},
                #         {'name':'motor','count':counter_objek_out['motor']},
                #         {'name':'bus','count':counter_objek_out['bus']},
                #         {'name':'truck','count':counter_objek_out['truck']},
                #         {'name':'bus besar','count':counter_objek_out['bus besar']},
                #         {'name':'truck besar','count':counter_objek_out['truck besar']},
                #     ],
                #     'presence_detector':{
                #         'id':pd_id,
                #         'fase':pd_fase,
                #         'gap':pd_gap,
                #         'active':pd_active,
                #         'ordered_to_send':pd_ordered_to_send
                #     }
                # }
                # json_data = json.dumps(to_json)
                # ws = websocket.WebSocket()
                # ws.connect(ws_server)
                # ws.send(json_data)
                # ws.close()
                pass
            except Exception as e7:
                print('error kirim json ke ws',e7)

        if delta_time >= 60:
            kirimKeMQTT(id, counter_objek, counter_objek_in, counter_objek_out, mqttc, smp_count, smp_count_in, smp_count_out, current_time)
            start_time = current_time
            counter_objek = {
                'motor':0,
                'mobil':0,
                'bus':0,
                'truck':0,
                'bus besar':0,
                'truck besar':0,
            }
            counter_objek_in = {
                'motor':0,
                'mobil':0,
                'bus':0,
                'truck':0,
                'bus besar':0,
                'truck besar':0,
            }
            counter_objek_out = {
                'motor':0,
                'mobil':0,
                'bus':0,
                'truck':0,
                'bus besar':0,
                'truck besar':0,
            }
            smp_count = 0
            smp_count_in = 0
            smp_count_out = 0
        
        # resize image
        # frame = cv2.resize(frame, (640, 360))
        frame = cv2.resize(frame, (output_w, output_h))
        # reduce color
        # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        ret2, frame2 = cv2.imencode('.png',frame)
        try:

            data = base64.b64encode(frame2)
            json_data = json.dumps({
                'id_kamera':int(id),
                'mobil':counter_objek['mobil'],
                'motor':counter_objek['motor'],
                'bus':counter_objek['bus'],
                'truck':counter_objek['truck'],
                'bus besar':counter_objek['bus besar'],
                'truck besar':counter_objek['truck besar'],
                'smp':smp_count,
                'smp_in':smp_count_in,
                'smp_out':smp_count_out,
                'waktu':current_time,
                'objek':[
                    {'name':'mobil','count':counter_objek['mobil']},
                    {'name':'motor','count':counter_objek['motor']},
                    {'name':'bus','count':counter_objek['bus']},
                    {'name':'truck','count':counter_objek['truck']},
                    {'name':'bus besar','count':counter_objek['bus besar']},
                    {'name':'truck besar','count':counter_objek['truck besar']},
                ],
                'objek_in':[
                    {'name':'mobil','count':counter_objek_in['mobil']},
                    {'name':'motor','count':counter_objek_in['motor']},
                    {'name':'bus','count':counter_objek_in['bus']},
                    {'name':'truck','count':counter_objek_in['truck']},
                    {'name':'bus besar','count':counter_objek_in['bus besar']},
                    {'name':'truck besar','count':counter_objek_in['truck besar']},
                ],
                'objek_out':[
                    {'name':'mobil','count':counter_objek_out['mobil']},
                    {'name':'motor','count':counter_objek_out['motor']},
                    {'name':'bus','count':counter_objek_out['bus']},
                    {'name':'truck','count':counter_objek_out['truck']},
                    {'name':'bus besar','count':counter_objek_out['bus besar']},
                    {'name':'truck besar','count':counter_objek_out['truck besar']},
                ],
                'presence_detector':{
                    'id':pd_id,
                    'fase':pd_fase,
                    'gap':pd_gap,
                    'gap_in':pd_gap_in,
                    'gap_out':pd_gap_out,
                    'active':pd_active,
                    'ordered_to_send':pd_ordered_to_send
                },
                'streams_cam'+str(id):data.decode('utf-8')
            })
            ws = websocket.WebSocket()
            ws.connect(ws_server2)
            ws.send(json_data)
            ws.close()
            pass
        except Exception as e8:
            print('error kirim ke WS',e8)
            pass
        
        if pd_active:
            pd_mqttc.loop_stop()

def kirimKeMQTT(id, counter_objek, counter_objek_in, counter_objek_out, mqttc, smp_count, smp_count_in, smp_count_out, current_time):
    global pd_gap, pd_gap_in, pd_gap_out, pd_id, pd_fase, pd_active, pd_ordered_to_send, pd_mqttc_pub, pd_mqtt_host, pd_mqtt_username, pd_mqtt_password, pd_mqtt_pub_topic, pd_mqtt_sub_topic, pd_mode, pd_threshold
    try:
        to_json = {
            'id_kamera':int(id),
            'mobil':counter_objek['mobil'],
            'motor':counter_objek['motor'],
            'bus':counter_objek['bus'],
            'truck':counter_objek['truck'],
            'bus besar':counter_objek['bus besar'],
            'truck besar':counter_objek['truck besar'],
            'smp':smp_count,
            'smp_in':smp_count_in,
            'smp_out':smp_count_out,
            'waktu':current_time,
            'objek':[
                {'name':'mobil','count':counter_objek['mobil']},
                {'name':'motor','count':counter_objek['motor']},
                {'name':'bus','count':counter_objek['bus']},
                {'name':'truck','count':counter_objek['truck']},
                {'name':'bus besar','count':counter_objek['bus besar']},
                {'name':'truck besar','count':counter_objek['truck besar']},
            ],
            'objek_in':[
                {'name':'mobil','count':counter_objek_in['mobil']},
                {'name':'motor','count':counter_objek_in['motor']},
                {'name':'bus','count':counter_objek_in['bus']},
                {'name':'truck','count':counter_objek_in['truck']},
                {'name':'bus besar','count':counter_objek_in['bus besar']},
                {'name':'truck besar','count':counter_objek_in['truck besar']},
            ],
            'objek_out':[
                {'name':'mobil','count':counter_objek_out['mobil']},
                {'name':'motor','count':counter_objek_out['motor']},
                {'name':'bus','count':counter_objek_out['bus']},
                {'name':'truck','count':counter_objek_out['truck']},
                {'name':'bus besar','count':counter_objek_out['bus besar']},
                {'name':'truck besar','count':counter_objek_out['truck besar']},
            ],
            'presence_detector':{
                'id':pd_id,
                'fase':pd_fase,
                'gap':pd_gap,
                'gap_in':pd_gap_in,
                'gap_out':pd_gap_out,
                'active':pd_active,
                'ordered_to_send':pd_ordered_to_send
            }
        }
        json_data = json.dumps(to_json)
        topic = mqtt_pub_topic
        mqttc.connect(mqtt_broker_address)
        mqttc.publish(topic, payload=json_data, qos=1)
        mqttc.disconnect()
        if pd_mqttc_pub is not None:
            pd_mqttc_pub.connect(pd_mqtt_host)
            pd_mqttc_pub.publish(pd_mqtt_pub_topic, payload=json_data, qos=1)
            pd_mqttc_pub.disconnect()
    except Exception as e:
        print('error kirim MQTT:',e)
        pass

def opt_parse():
    parser = argparse.ArgumentParser(
        description='Program Object detection untuk mendeteksi, mengklasisfikasi, dan menghitung kendaraan dari tangkapan RTSP CCTV'
    )
    parser.add_argument('--id','-i',type=int,default=None,help='id kamera dari tabel kamera di database')
    parser.add_argument('--show','-s',type=bool,default=False,help='buka window hasil AI')
    parser.add_argument('--cam_id','-c',type=int,default=1,help='id kamera dari tabel kamera di server')
    parser.add_argument('--all','-a',type=bool,default=False,help='mendeteksi semua class, tidak hanya '+allowed_cls_str)
    parser.add_argument('--rekam','-r',type=bool,default=False,help='rekam hasil deteksi')
    parser.add_argument('--durasi_rekam','-dr',type=int,default=10,help='durasi rekaman video (jika direkam)')
    opt = parser.parse_args()
    return opt

def main():
    opt = opt_parse()
    if opt.id is not None:
        run(int(opt.id),opt.all,opt.rekam,opt.cam_id,opt.durasi_rekam,opt.show)

if __name__=='__main__':
    main()
