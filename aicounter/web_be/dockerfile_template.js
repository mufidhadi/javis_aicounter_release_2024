const base_template = `
FROM ultralytics/ultralytics:latest{PROCESSOR}

# install supervision
WORKDIR /home
RUN git clone https://github.com/roboflow/supervision.git -b 0.3.1

WORKDIR /home/supervision
RUN cp setup.py setup.py.ori
RUN grep -v "'opencv-python'," setup.py > temp-setup.py && mv temp-setup.py setup.py
RUN python3 setup.py install

WORKDIR /tes

COPY ./main.py ./main.py
COPY ./config.py ./config.py
COPY ./config.yaml ./config.yaml
COPY ./camera_list.py ./camera_list.py
COPY ./camera_list.json ./camera_list.json
COPY ./requirements_tes.txt ./requirements_tes.txt
COPY  ./{MODEL} ./{MODEL}
COPY ./run_id.sh ./run_id.sh

# # install ffmpeg
# RUN apt update
# RUN apt install -y --no-install-recommends ffmpeg

# RUN pip install -r ./requirements_tes.txt
RUN pip install argparse
# supervision==0.3.1
RUN pip install paho-mqtt==2.0.0
RUN pip install lapx>=0.5.2
RUN pip install websocket-client

# ADD https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt /tes/

# CMD [ "python3","main.py","-i","1" ]

ENTRYPOINT [ "./run_id.sh" ]
`

function generate_dockerfile(device_processor,device_model){
    let dockerfile = base_template
    let _device_processor = device_processor
    _device_processor = '-'+device_processor
    if (device_processor == 'vga') _device_processor = ''
    dockerfile = dockerfile.replace('{PROCESSOR}',_device_processor)
    dockerfile = dockerfile.replace('{MODEL}',device_model)
    dockerfile = dockerfile.replace('{MODEL}',device_model)
    return dockerfile
}

module.exports = generate_dockerfile