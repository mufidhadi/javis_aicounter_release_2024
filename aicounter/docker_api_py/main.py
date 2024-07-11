import docker
from flask import Flask, Response, request
from flask_cors import CORS
import subprocess
import requests
import json

client = docker.from_env()
app = Flask(__name__)

CORS(app)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/containers', methods=['GET'])
def get_containers():
    containers = client.containers.list()
    container_list = []
    for con in containers:
        con_obj = {
            'id': con.id,
            'name': con.name,
            'image': con.image.tags[0],
            'state': con.status,
            'status': con.status
        }
        container_list.append(con_obj)
    # return json
    return str(json.dumps(container_list))


@app.route('/restart', methods=['POST'])
def restart_container():
    container_id = request.form.get('container_id')
    container = client.containers.get(container_id)
    container.restart()
    return 'Container restarted'

@app.route('/prepare_ai_docker/<id>', methods=['GET'])
def prepare_container(id):
    try:
        # Assuming the script is located at /home/ubuntu/aicounter/ai/0_prepare.sh
        result = subprocess.run(['./ai/0_prepare.sh', id], check=True, capture_output=True, text=True)
        return f'Container preparation started. Output: {result.stdout}', 200
    except subprocess.CalledProcessError as e:
        return f'An error occurred: {e.stderr}', 500

@app.route('/build_ai_docker/', methods=['GET'])
def build_ai_docker():
    path_to_dockerfile = '/home/ubuntu/aicounter/ai'  # Ensure this is the correct path
    path_to_dockerfile = './ai'  # Ensure this is the correct path
    try:
        image = client.images.build(path=path_to_dockerfile, tag='aicounter')
        return 'Docker image built: ' + str(image[0].tags)
    except TypeError as e:
        return f'An error occurred: {str(e)}', 400
    except docker.errors.BuildError as e:
        return f'Build error: {str(e)}', 500
    except Exception as e:
        return f'An unexpected error occurred: {str(e)}', 500

@app.route('/run_ai_docker/<id>', methods=['GET'])
def run_ai_docker(id):
    # get camera_list from http://localhost:3000/camera_list_json/$id
    camera_list = []
    container_list = []
    # http request
    response = requests.get('http://localhost:3000/camera_list_json/' + str(id))
    if response.status_code == 200:
        camera_list = response.json()
    else:
        return f'An error occurred: {response.status_code}', 500

    for camera in camera_list:
        cam_id = camera['id']

        # get container id that has name 'cam' + str(cam_id)
        containers = client.containers.list()
        for con in containers:
            if con.name == 'cam' + str(cam_id):
                # delete container
                con.stop()
                con.remove()

        container = client.containers.run(
            'aicounter', 
            str(cam_id), 
            detach=True, 
            name='cam' + str(cam_id), 
            network_mode='host',
            restart_policy={'Name': 'unless-stopped'}, 
            # gpus='all', 
            device_requests=[
                docker.types.DeviceRequest(count=-1, capabilities=[['gpu']])
            ],
            runtime='nvidia', 
            mounts=[{'type': 'bind', 'source': '/home/ubuntu/aicounter/ai/', 'target': '/tes'}]
        )
        container_list.append({
            'id': container.id,
            'name': container.name
        })

    return str(json.dumps(container_list))
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)