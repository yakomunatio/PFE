import "./customer.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import mqtt from "mqtt";

const Customer = () => {
  const location = useLocation();
  const roomNumber = location.state?.roomNumber || "unknown";
  const [sensorData, setSensorData] = useState(null);

  // State to track the status of each feature
  const [lightsOn, setLightsOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [windowsOpen, setWindowsOpen] = useState(false);


  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(`http://192.168.137.155:5000/sensors/${roomNumber}`);
        setSensorData(response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    // Fetch data initially
    fetchSensorData();

    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchSensorData, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [roomNumber]);

  useEffect(() => {
    const fetchControlStates = async () => {
      try {
        const response = await axios.get(`http://192.168.137.155:5000/controls/${roomNumber}`);
        setLightsOn(response.data.lights == "1");
        setFanOn(response.data.fan == "1");
        setCurtainsOpen(response.data.curtains == "1");
        setWindowsOpen(response.data.windows == "1");
      } catch (error) {
        console.error("Error fetching control states:", error);
      }
    };

    fetchControlStates();
  }, [roomNumber]);

  const updateControlState = async (control, value) => {
    try {
      const updatedStates = {
        lights: control === 'lights' ? value : lightsOn ? "1" : "0",
        fan: control === 'fan' ? value : fanOn ? "1" : "0",
        curtains: control === 'curtains' ? value : curtainsOpen ? "1" : "0",
        windows: control === 'windows' ? value : windowsOpen ? "1" : "0",
      };
      await axios.post(`http://192.168.137.155:5000/controls/${roomNumber}`, updatedStates);
    } catch (error) {
      console.error("Error updating control state:", error);
    }
  };

  const handleButtonClick = (control, currentState) => {
    const newState = !currentState;
    if (control === 'lights') setLightsOn(newState);
    if (control === 'fan') setFanOn(newState);
    if (control === 'curtains') setCurtainsOpen(newState);
    if (control === 'windows') setWindowsOpen(newState);
    updateControlState(control, newState ? "1" : "0");
  };

  return (
    <div className="customer-container">
      <h2 className="room-title">Control Your Room, Number: {roomNumber}</h2>
      
      <div className="sensor-container">
        <h3 className="sensor-title">Sensor Data</h3>
        {sensorData ? (
          <div className="sensor-grid">
            <div className="sensor-item">
              <span>Temperature</span>
              <span className="sensor-value">{sensorData.temperature} °C</span>
            </div>
            <div className="sensor-item">
              <span>Humidity</span>
              <span className="sensor-value">{sensorData.humidity} %</span>
            </div>
            <div className="sensor-item">
              <span>CO</span>
              <span className="sensor-value">{sensorData.co} ppm</span>
            </div>
            <div className="sensor-item">
              <span>Butane Gas</span>
              <span className="sensor-value">{sensorData.butane_gas} ppm</span>
            </div>
            <div className="sensor-item">
              <span>CO2</span>
              <span className="sensor-value">{sensorData.co2} ppm</span>
            </div>
            <div className="sensor-item">
              <span>Smoke</span>
              <span className="sensor-value">{sensorData.smoke} ppm</span>
            </div>
            <div className="sensor-item">
              <span>Light</span>
              <span className="sensor-value">{sensorData.light} lux</span>
            </div>
            <div className="sensor-item">
              <span>Motion</span>
              <span className="sensor-value">
                {sensorData.motion ? "Detected" : "Not Detected"}
              </span>
            </div>
          </div>
        ) : (
          <p>Loading sensor data...</p>
        )}
      </div>

      <div className="controls-container">
        <button 
          className={`control-button ${lightsOn ? 'active' : ''}`}
          onClick={() => handleButtonClick('lights', lightsOn)}
        >
          {lightsOn ? "Turn off Lights" : "Turn on Lights"}
        </button>
        
        <button 
          className={`control-button ${fanOn ? 'active' : ''}`}
          onClick={() => handleButtonClick('fan', fanOn)}
        >
          {fanOn ? "Turn off Fan" : "Turn on Fan"}
        </button>
        
        <button 
          className={`control-button ${curtainsOpen ? 'active' : ''}`}
          onClick={() => handleButtonClick('curtains', curtainsOpen)}
        >
          {curtainsOpen ? "Close Curtains" : "Open Curtains"}
        </button>
        
        <button 
          className={`control-button ${windowsOpen ? 'active' : ''}`}
          onClick={() => handleButtonClick('windows', windowsOpen)}
        >
          {windowsOpen ? "Close Windows" : "Open Windows"}
        </button>
      </div>
      <footer className="customer-footer">
        <p>Copyright &copy; 2025 YARB company - Yassine Achhachar</p>
      </footer>
    </div>
  );
};

export default Customer;