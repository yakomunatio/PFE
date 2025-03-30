import json
import sqlite3
import paho.mqtt.client as mqtt

# Database setup
db_file = 'backend/hotel.db'  # Replace with your database file path if needed

# MQTT setup
broker = "localhost"  # Change this if your broker is on a different server
port = 1883
topic_sensors = "hotel/room/sensors"  # Topic for sensor data
topic_control = "hotel/room/1/control"  # Topic for control data

# Global variables to store the latest control data
light_state = None
fan_state = None
curtain_state = None
window_state = None

# MQTT callbacks
def on_connect(client, userdata, flags, rc, reason_code=None):
    print("Connected with result code " + str(rc))
    client.subscribe(topic_sensors)
    client.subscribe(topic_control)

def on_message(client, userdata, msg):
    print(f"Message received on topic {msg.topic}")
    
    if msg.topic == topic_sensors:
        # Parse the received sensor data
        sensor_data = json.loads(msg.payload.decode())
        print("Received sensor data:", sensor_data)
        
        # Insert sensor data into SQLite along with the latest control values
        insert_data(sensor_data)
    
    elif msg.topic == topic_control:
        # Parse the control data
        control_data = json.loads(msg.payload.decode())
        print("Received control data:", control_data)
        
        # Update the control values
        global light_state, fan_state, curtain_state, window_state
        light_state = control_data['li']
        fan_state = control_data['f']
        curtain_state = control_data['c']
        window_state = control_data['w']

# Function to insert sensor data into SQLite
def insert_data(sensor_data):
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Insert sensor data along with the control data (light, fan, curtain, window)
        cursor.execute("""
        INSERT INTO sensors 
        (room_no, temperature, humidity, co, butane_gas, co2, smoke, light, motion, lights, fan, curtain, window)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sensor_data['rn'], 
            sensor_data['t'], 
            sensor_data['h'], 
            sensor_data['co'], 
            sensor_data['g'], 
            sensor_data['c2'], 
            sensor_data['s'], 
            sensor_data['l'], 
            sensor_data['m'], 
            light_state, 
            fan_state, 
            curtain_state, 
            window_state
        ))

        conn.commit()
        print("Data inserted into the database.")
    except Exception as e:
        print(f"Error inserting data into the database: {e}")
    finally:
        conn.close()

# MQTT client setup
client = mqtt.Client(protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.on_message = on_message

# Connect to the broker and start the loop
client.connect(broker, port, 60)
client.loop_start()