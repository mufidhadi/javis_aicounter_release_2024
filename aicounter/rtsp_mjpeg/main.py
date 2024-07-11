import argparse
import cv2
from flask import Flask, Response, request

app = Flask(__name__)

target_height = 480
target_height = 360

# Function to generate MJPEG frames from RTSP stream
def generate_frames(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        f_w = frame.shape[1]
        f_h = frame.shape[0]

        resize_ratio = target_height / f_h
        new_width = int(f_w * resize_ratio)
        frame = cv2.resize(frame, (new_width, target_height))

        # Convert the frame to JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    cap.release()

@app.route('/video_feed')
def video_feed():
    rtsp_url = request.args.get('rtsp_url')
    if rtsp_url is None:
        rtsp_url = request.args.get('video_path')
        if rtsp_url is None:
            return "Missing 'rtsp_url' parameter", 400
    print('~~>>rtsp_url:',rtsp_url)
    return Response(generate_frames(rtsp_url),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the Flask app to stream RTSP video.')
    parser.add_argument('-p', '--port', type=int, default=5000, help='Port number for the Flask app')
    args = parser.parse_args()
    
    app.run(host='0.0.0.0', port=args.port)
