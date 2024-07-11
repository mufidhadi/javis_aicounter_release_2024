# TODO: kirim video ke ws by request

import base64
import cv2
from ultralytics import YOLO
import supervision as sv
import onnx, ast
import json
import time
import paho.mqtt.client as mqtt
import websocket
import camera_list as cl
import config as cf
import subprocess as sp
import os
from prettytable import PrettyTable
import argparse

TITLE_TEXT = 'AI COUNTER PT. JAVIS TEKNOLOGI ALBAROKAH'
model_path = 'jv_indo_m.onnx'
model_path = cf.config['yolo']['model']

video_stream_media = 'window' # 'rtsp' | 'mqtt' | 'ws' | 'ws_by_request' | 'none' | 'window'

mqtt_broker_address = cf.config['mqtt']['host']
mqtt_pub_topic = cf.config['mqtt']['base_topic_pub']

ws_server = cf.config['ws']['host']
ws_server2 = cf.config['ws']['host2']


# id = 13
# id = 999
parser = argparse.ArgumentParser()
parser.add_argument('--id', '-i', type=int, default=0)
parser.add_argument('--media', '-m', type=str, default='ws',help='rtsp | mqtt | ws | ws_by_request | none | window')
parser.add_argument('--no_print', '-np', action='store_true')
parser.add_argument('--debug_mode', '-debug', action='store_true')
args = parser.parse_args()

print('args', args)

debug_mode = args.debug_mode
no_print = args.no_print
is_print = not no_print
if not debug_mode: is_print = False

id = args.id
video_stream_media = args.media

if id == 0:
    print('camera list: ')
    table = PrettyTable(['id', 'nama', 'jenis lokasi','pakai presence detector (PD)','id PD','fase'])
    for cam in cl.cam_list:
        # table.add_row([cam['id'], cam['name'], cam['rtsp']])
        table.add_row([cam['id'], cam['name'], cam['jenis_lokasi'], ('ya' if cam['presence_detector']['active'] else 'tidak'), cam['presence_detector']['id'], cam['presence_detector']['fase']])
    print(table)
    id = input('select camera id: ')

if no_print: print('no print mode active')

cam = cl.cam_from_id(id)

model = YOLO(model_path)

START = sv.Point(320, 0)
END = sv.Point(320, 480)

video = 'rtsp://cctv:AtmsJavis22@10.21.32.11/Streaming/Channels/102'
video = cam['rtsp']

# ambil ukuran video
cap = cv2.VideoCapture(video)
video_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
video_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
size_str = str(video_w)+'x'+str(video_h)
fps = cap.get(cv2.CAP_PROP_FPS)
cap.release()


# START = sv.Point(0, int(video_h/2))
# END = sv.Point(int(video_w), int(video_h/2))

line_start_x = cam['line']['start']['x']
line_start_y = cam['line']['start']['y']
line_end_x = cam['line']['end']['x']
line_end_y = cam['line']['end']['y']

START = sv.Point(int(video_w * line_start_x), int(video_h * line_start_y))
END = sv.Point(int(video_w * line_end_x), int(video_h * line_end_y))


last_line_states = []

default_names = ['truck',  'motor',  'mobil',  'truck besar',  'bus',  'pickup',  'bus besar']

names = []
# check model is pt
try:
    if model_path.endswith('.pt'):
        if is_print: print('model is pt')
        names = model.model.names
    elif model_path.endswith('.onnx'):
        if is_print: print('model is onnx')
        onnx_model = onnx.load(model_path)
        props = { p.key: p.value for p in onnx_model.metadata_props}
        names = ast.literal_eval(props['names'])
    elif model_path.endswith('.engine'):
        if is_print: print('model is tensorrt')
        onnx_model = onnx.load(model_path)
        props = { p.key: p.value for p in onnx_model.metadata_props}
        names = ast.literal_eval(props['names'])
except:
    if is_print: print('model type not recognized, using default class names')

if len(names) == 0:
    names = default_names

if is_print: print('names', names)

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


start_time = time.time()

line_zone = sv.LineZone(start=START, end=END)
line_zone_annotator = sv.LineZoneAnnotator(
    thickness=1,
    text_thickness=1,
    text_scale=0.5
)

# bounding_box_anotator = sv.BoundingBoxAnnotator(
#     thickness=2
# )

# label_anotator = sv.LabelAnnotator(
#     text_thickness=0.5,
#     text_scale=0.5
# )

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

rtsp_server = cf.config['rtsp']['base_url']
# check rtsp_server ended with /
if not rtsp_server.endswith('/'):
    rtsp_server = rtsp_server + '/'
rtsp_server = rtsp_server + str(id)

if is_print: print('rtsp_server:', rtsp_server)

###########################
# PRESENCE DETECTOR (start)
###########################\
pd = cf.config['presence_detector']
pd_cam = cam['presence_detector']

# pd_active = pd['active']
# pd_id = pd['id']
# pd_fase = pd['fase']

pd_active = pd_cam['active']
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

pd_ordered_to_send = False
pd_gap = 0.0
pd_gap_time = time.time()

pd_mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

if pd_mqtt_host != 'localhost':
    pd_mqttc.username_pw_set(pd_mqtt_username, pd_mqtt_password)

def on_pd_mqtt_message(client, userdata, msg):
    global pd_ordered_to_send, pd_threshold

    # check if message is not empty and message is json
    if is_print: print('on_pd_mqtt_message', msg.topic, msg.payload)
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
            if is_print: print('message is not json, it causes error', e)
            pass

###########################
# PRESENCE DETECTOR (end)
###########################

def reset_counter():
    counter_objek['motor'] = 0
    counter_objek['mobil'] = 0
    counter_objek['bus'] = 0
    counter_objek['truck'] = 0
    counter_objek['bus besar'] = 0
    counter_objek['truck besar'] = 0
    
    counter_objek_in['motor'] = 0
    counter_objek_in['mobil'] = 0
    counter_objek_in['bus'] = 0
    counter_objek_in['truck'] = 0
    counter_objek_in['bus besar'] = 0
    counter_objek_in['truck besar'] = 0
    
    counter_objek_out['motor'] = 0
    counter_objek_out['mobil'] = 0
    counter_objek_out['bus'] = 0
    counter_objek_out['truck'] = 0
    counter_objek_out['bus besar'] = 0
    counter_objek_out['truck besar'] = 0

def line_detection_process(last_line_states, names, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, line_zone, classes, ids):
    global pd_threshold, pd_ordered_to_send, pd_gap_time, pd_gap, pd_mqttc, pd_id, pd_fase, pd_mqtt_pub_topic


    if len(line_zone.tracker_state) > 0:
        # true di atas, false di bawah
        # true ke false = in
        # false ke true = out
        sv_ids = list(line_zone.tracker_state.keys())

        for i in sv_ids:
            if i not in last_line_states:
                continue
            if last_line_states[i] != line_zone.tracker_state[i]:
                # search id index in ids list
                id_index = ids.tolist().index(i)
                class_name = names[int(classes[id_index])]
                
                counter_objek[class_name] += 1
                smp_count += 1

                # TODO: copy this code to ../ai/main.py
                if pd_active and pd_mode == 'gap':
                    curr_gap_time = time.time()
                    if is_print: print('pd_gap_time', pd_gap_time, 'curr_gap_time', curr_gap_time)
                    # curr_gap = curr_gap_time - pd_gap_time in second
                    curr_gap = curr_gap_time - pd_gap_time
                    pd_gap_time = curr_gap_time
                    pd_gap = curr_gap
                    # pd_mqttc.publish('tes', json.dumps({
                    #     'id': pd_id,
                    #     'sistem':'presence',
                    #     'menu':'gap',
                    #     'fase': pd_fase,
                    #     'gap': pd_gap
                    # }))
                    # visual = cv2.putText(visual, 'gap:'+str(curr_gap), (5, int(video_h * 0.8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
                    if pd_gap > pd_threshold and pd_ordered_to_send:
                        pd_mqttc.publish(pd_mqtt_pub_topic, json.dumps({
                            'id': pd_id,
                            'sistem':'presence',
                            'menu':'gap', 
                            'fase': pd_fase, 
                            'status': 'terpenuhi'
                        }))

                if line_zone.tracker_state[i]:
                    counter_objek_out[class_name] += 1
                    smp_count_out += 1
                else:
                    counter_objek_in[class_name] += 1
                    smp_count_in += 1

def kirimMQTT(mqtt_broker_address, mqtt_pub_topic, id, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, mqttc, current_time):
    try:
        to_json = {
            'id_kamera': int(id),
            'mobil': counter_objek['mobil'],
            'motor': counter_objek['motor'],
            'bus': counter_objek['bus'],
            'truck': counter_objek['truck'],
            'bus besar': counter_objek['bus besar'],
            'truck besar': counter_objek['truck besar'],
            'smp': smp_count,
            'smp_in': smp_count_in,
            'smp_out': smp_count_out,
            'waktu': current_time,
            'objek': [
                {'name':'mobil','count':counter_objek['mobil']},
                {'name':'motor','count':counter_objek['motor']},
                {'name':'bus','count':counter_objek['bus']},
                {'name':'truck','count':counter_objek['truck']},
                {'name':'bus besar','count':counter_objek['bus besar']},
                {'name':'truck besar','count':counter_objek['truck besar']},
            ],
            'objek_in': [
                {'name':'mobil','count':counter_objek_in['mobil']},
                {'name':'motor','count':counter_objek_in['motor']},
                {'name':'bus','count':counter_objek_in['bus']},
                {'name':'truck','count':counter_objek_in['truck']},
                {'name':'bus besar','count':counter_objek_in['bus besar']},
                {'name':'truck besar','count':counter_objek_in['truck besar']},
            ],
            'objek_out': [
                {'name':'mobil','count':counter_objek_out['mobil']},
                {'name':'motor','count':counter_objek_out['motor']},
                {'name':'bus','count':counter_objek_out['bus']},
                {'name':'truck','count':counter_objek_out['truck']},
                {'name':'bus besar','count':counter_objek_out['bus besar']},
                {'name':'truck besar','count':counter_objek_out['truck besar']},
            ],
        }
        json_data = json.dumps(to_json)
        mqttc.connect(mqtt_broker_address)
        mqttc.publish(mqtt_pub_topic, json_data,qos=1)
        mqttc.disconnect()
    except Exception as e:
        if is_print: print(e)

def kirimWS(ws_server, id, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, mqttc, current_time):
    try:
        to_json = {
            'id_kamera': int(id),
            'mobil': counter_objek['mobil'],
            'motor': counter_objek['motor'],
            'bus': counter_objek['bus'],
            'truck': counter_objek['truck'],
            'bus besar': counter_objek['bus besar'],
            'truck besar': counter_objek['truck besar'],
            'smp': smp_count,
            'smp_in': smp_count_in,
            'smp_out': smp_count_out,
            'waktu': current_time,
            'objek': [
                {'name':'mobil','count':counter_objek['mobil']},
                {'name':'motor','count':counter_objek['motor']},
                {'name':'bus','count':counter_objek['bus']},
                {'name':'truck','count':counter_objek['truck']},
                {'name':'bus besar','count':counter_objek['bus besar']},
                {'name':'truck besar','count':counter_objek['truck besar']},
            ],
            'objek_in': [
                {'name':'mobil','count':counter_objek_in['mobil']},
                {'name':'motor','count':counter_objek_in['motor']},
                {'name':'bus','count':counter_objek_in['bus']},
                {'name':'truck','count':counter_objek_in['truck']},
                {'name':'bus besar','count':counter_objek_in['bus besar']},
                {'name':'truck besar','count':counter_objek_in['truck besar']},
            ],
            'objek_out': [
                {'name':'mobil','count':counter_objek_out['mobil']},
                {'name':'motor','count':counter_objek_out['motor']},
                {'name':'bus','count':counter_objek_out['bus']},
                {'name':'truck','count':counter_objek_out['truck']},
                {'name':'bus besar','count':counter_objek_out['bus besar']},
                {'name':'truck besar','count':counter_objek_out['truck besar']},
            ],
        }
        json_data = json.dumps(to_json)
        ws = websocket.WebSocket()
        ws.connect(ws_server)
        ws.send(json_data)
        ws.close()
    except Exception as e:
        if is_print: print(e)

##############################################
# START MAIN PROGRAM
##############################################

if video_stream_media == 'mqtt':
    mqttc.connect(mqtt_broker_address)

if pd_active:
    if is_print: print('PD ACTIVE')
    pd_mqttc.connect(pd_mqtt_host)
    # subscribe
    pd_mqttc.subscribe(pd_mqtt_sub_topic)
    pd_mqttc.on_message = on_pd_mqtt_message
    pd_mqttc.publish(pd_mqtt_pub_topic, 'presence detector online')

# prepare RTSP
command = ['ffmpeg',
    '-re',
    '-s', size_str,
    '-r', str(fps),  # rtsp fps (from input server)
    '-i', '-',
        
    # You can change ffmpeg parameter after this item.
    '-pix_fmt', 'yuv420p',
    '-r', '24',  # output fps
    # '-r', str(fps),  # output fps
    '-g', '50',
    '-c:v', 'libx264',
    '-b:v', '2M',
    '-bufsize', '64M',
    '-maxrate', "4M",
    '-preset', 'veryfast',
    '-rtsp_transport', 'tcp',
    '-segment_times', '5',
    '-f', 'rtsp',
    rtsp_server
]

if video_stream_media == 'rtsp':
    if is_print: print('command', command)
    # check os platform
    if os.name == 'nt':
        process = sp.Popen(command, stdin=sp.PIPE, shell=True)
        if is_print: print('process nt')
    else:
        process = sp.Popen(command, stdin=sp.PIPE)
        if is_print: print('process not nt')

for result in model.track(source=video, task='detect', stream=True, imgsz=640, verbose=False):
# for result in model.track(source=video, task='detect', stream=True, imgsz=320):
    if pd_active:
        pd_mqttc.loop_start()
    
    visual = result.orig_img

    # check if id is None
    if result.boxes.id is None:
        continue

    current_time = time.time()
    delta_time = current_time - start_time

    # detections = sv.Detections.from_ultralytics(result)
    detections = sv.Detections.from_yolov8(result)

    last_line_states = line_zone.tracker_state.copy()

    line_zone.trigger(detections)
    line_zone_annotator.annotate(visual, line_zone)

    classes, ids = result.boxes.cls, result.boxes.id
    boxes = result.boxes.xyxy.tolist()

    for i in range(len(ids)):
        visual = cv2.rectangle(visual, (int(boxes[i][0]), int(boxes[i][1])), (int(boxes[i][2]), int(boxes[i][3])), (255, 255, 255), 1)

        visual_text = names[int(classes[i])] 
        visual_text += ' ' 
        visual_text += str(int(ids[i]))

        visual = cv2.putText(visual, visual_text, (int(boxes[i][0]), (int(boxes[i][1]) - 2)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    visual = cv2.putText(visual, TITLE_TEXT, (5, 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    line_detection_process(last_line_states, names, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, line_zone, classes, ids)

    visual = cv2.putText(visual, 'gap:'+str(pd_gap), (5, int(video_h * 0.8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    visual = cv2.putText(visual, 'gaptime:'+str(pd_gap_time), (5, int(video_h * 0.8) + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    visual = cv2.putText(visual, 'ordered to send:'+str(pd_ordered_to_send), (5, int(video_h * 0.8) + 15 + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    visual = cv2.putText(visual, 'pd:'+str(json.dumps(pd['mqtt']['topic'])), (5, int(video_h * 0.8) + 15 + 15 + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    last_sec = 0
    curr_sec = int(delta_time)

    if curr_sec != last_sec:
        # if is_print: print('in', counter_objek_in)
        # if is_print: print('out', counter_objek_out)
        # if is_print: print('total', counter_objek)
        kirimWS(ws_server, id, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, mqttc, current_time)
        last_sec = curr_sec
    
    if delta_time > 60:
        start_time = current_time
        if is_print: print('in', counter_objek_in)
        if is_print: print('out', counter_objek_out)
        if is_print: print('total', counter_objek)
        # kirim ke mqtt
        kirimMQTT(mqtt_broker_address, mqtt_pub_topic, id, counter_objek, counter_objek_in, counter_objek_out, smp_count, smp_count_in, smp_count_out, mqttc, current_time)
        reset_counter()
        smp_count = 0
        smp_count_in = 0
        smp_count_out = 0

    if video_stream_media == 'rtsp':
        try:
            if is_print: print('rtsp process stdin write')
            ret2, visual2 = cv2.imencode('.png', visual)
            process.stdin.write(visual2.tobytes())
            process.stdin.flush()
        except Exception as e_rtsp:
            # if is_print: print('e_rtsp', e_rtsp)
            print('e_rtsp', e_rtsp)
            exit()
            pass
    
    if video_stream_media == 'window':
        cv2.imshow('frame', visual)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    if video_stream_media == 'mqtt':
        try:
            data = base64.b64encode(visual)
            visual_topic = mqtt_pub_topic + '/visual/' + str(id)
            visual_data = str(data.decode('utf-8'))
            # mqttc.connect(mqtt_broker_address)
            mqttc.publish(visual_topic, visual_data)
            # mqttc.disconnect()
            pass
        except Exception as e_mqtt:
            if is_print: print('e_mqtt', e_mqtt)
            pass
    
    if video_stream_media == 'ws':
        try:
            ret2, visual2 = cv2.imencode('.png', visual)
            data = base64.b64encode(visual2)
            json_data = json.dumps({
                'streams_cam'+str(id): data.decode('utf-8')
            })
            ws = websocket.WebSocket()
            ws.connect(ws_server2)
            ws.send(json_data)
            ws.close()
        except Exception as e_ws:
            if is_print: print('e_ws', e_ws)
        pass

    if pd_active:
        pd_mqttc.loop_stop()
