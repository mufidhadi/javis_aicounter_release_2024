import os
import json

default_cam_list = [
    {
        'id':1,
        'name':'palimanan1',
        'rtsp':'rtsp://cctv:AtmsJavis22@10.21.32.11/Streaming/Channels/102',
        'output_res':'240p',
        'id_key':1,
        'jenis_lokasi':'simpang',
        'is_set_to_run':True,
        'presence_detector':{
            'active':True,
            'id':1,
            'fase':1
        }
    },
    {
        'id':2,
        'name':'palimanan2',
        'rtsp':'rtsp://cctv:AtmsJavis22@10.21.32.9/Streaming/Channels/102',
        'output_res':'240p',
        'id_key':2,
        'jenis_lokasi':'simpang',
        'is_set_to_run':True,
        'presence_detector':{
            'active':True,
            'id':1,
            'fase':2
        }
    },
    {
        'id':3,
        'name':'palimanan3',
        'rtsp':'rtsp://cctv:AtmsJavis22@10.21.32.8/Streaming/Channels/102',
        'output_res':'240p',
        'id_key':3,
        'jenis_lokasi':'simpang',
        'is_set_to_run':True,
        'presence_detector':{
            'active':True,
            'id':1,
            'fase':3
        }
    },
    {
        'id':4,
        'name':'palimanan4',
        'rtsp':'rtsp://cctv:AtmsJavis22@10.21.32.10/Streaming/Channels/102',
        'output_res':'240p',
        'id_key':4,
        'jenis_lokasi':'simpang',
        'is_set_to_run':True,
        'presence_detector':{
            'active':True,
            'id':1,
            'fase':4
        }
    },
    {
        'id':5,
        'name':'bulakambaA',
        'rtsp':'rtsp://cctv:AtmsJavis22@10.21.33.53/Streaming/Channels/102',
        'output_res':'240p',
        'id_key':1,
        'jenis_lokasi':'ruas',
        'is_set_to_run':False,
        'presence_detector':{
            'active':False,
            'id':1,
            'fase':1
        }
    },
]

cam_list_json_path = 'camera_list.json'

if os.path.exists(cam_list_json_path):
    with open(cam_list_json_path, 'r') as file:
        cam_list = json.load(file)
else:
    with open(cam_list_json_path, 'w') as file:
        json.dump(default_cam_list,file,indent=4)
    cam_list = default_cam_list

def cam_from_id(id):
    selected_cam = cam_list[0]
    for cam in cam_list:
        if str(cam['id']) == str(id):
            selected_cam = cam
    return selected_cam