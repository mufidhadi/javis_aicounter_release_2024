import os
import yaml

default_config = {
    'rtsp':{
        'base_url':'rtsp://localhost:8554/ai/'
    },
    'yolo':{
        'model':'jv_indo_m.onnx',
        'allowed_cls': ['truck',  'motor',  'mobil',  'truck besar',  'bus',  'pickup',  'bus besar']
    },
    'mqtt':{
        'host':'localhost',
        'base_topic_pub':'cam_log'
    },
    'ws':{
        'host':'ws://localhost:8080/',
        'host2':'ws://localhost:8081/',
    },
    'smp':[
        {'name':'mobil','smp':1},
        {'name':'motor','smp':0.5},
        {'name':'bus','smp':3},
        {'name':'truck','smp':3},
        {'name':'bus besar','smp':5},
        {'name':'truck besar','smp':5},
    ],
    'presence_detector':{
        'active':True,
        'id':1,
        'fase':1,
        'mqtt':{
            'host':'localhost',
            'username':'javis',
            'password':'#MqttJavis313',
            'topic':{
                'send':'its-link/server/',
                'receive':'its-link/client/'
            }
        },
        'mode':'gap',
        'threshold':0.5
    }
}

config_yaml_path = 'config.yaml'

# config = default_config
if os.path.exists(config_yaml_path):
    config = yaml.safe_load(open(config_yaml_path))
else :
    yaml.dump(default_config, open(config_yaml_path, 'w'))
    config = default_config