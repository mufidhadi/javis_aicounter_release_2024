import paho.mqtt.client as mqtt

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

# mqttc.connect("mqtt.eclipseprojects.io", 1883, 60)
# mqttc.connect("localhost", 1883, 60)
mqttc.connect("localhost")

mqttc.publish("tes", payload="mas mufid", qos=1)
mqttc.publish("tes", payload="ganteng", qos=1)