import sqlite3
import paho.mqtt.client as mqtt
import json
import time

# Database file
DB_FILE = "backend/hotel.db"

# MQTT Configuration
MQTT_BROKER = "192.168.137.155"
MQTT_PORT = 1883
MQTT_TOPIC = "hotel/room/1/control"

# Store the last sent values
last_sent_data = None  

def get_latest_control_values():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT lights, fan, curtains, windows 
        FROM sensors 
        WHERE room_no = '1'
        ORDER BY id DESC 
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if row:
        lights, fan, curtains, windows = row
        return {"li": lights, "f": fan, "c": curtains, "w": windows}
    return None

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker successfully.")
    else:
        print(f"Failed to connect, return code {rc}")

def main():
    global last_sent_data

    # Setup MQTT client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()  # Start the MQTT loop

    while True:
        control_data = get_latest_control_values()

        # Check if data is available and has changed
        if control_data and control_data != last_sent_data:
            payload = json.dumps(control_data)
            print(f"Sending to {MQTT_TOPIC}: {payload}")
            client.publish(MQTT_TOPIC, payload)
            last_sent_data = control_data  # Update last sent data

        time.sleep(5)  # Adjust delay as needed

if __name__ == "__main__":
    main()