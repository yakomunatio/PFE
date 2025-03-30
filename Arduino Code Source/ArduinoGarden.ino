const int moisturePin = A0; // Analog pin for soil moisture
const int moistureDO = 2;   // Digital pin for soil moisture (optional)
const int waterDetectorPin = 3; // Digital pin for water detection (optional)
const int relayPin = 7; // Relay module connected to Pin 7

void setup() {
  Serial.begin(9600); // Initialize serial communication
  pinMode(moistureDO, INPUT);
  pinMode(waterDetectorPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // Ensure the pump is off at startup
}

void loop() {
  int moistureValue = analogRead(moisturePin); // Read soil moisture (0-1023)
  int waterDetected = digitalRead(waterDetectorPin); // Read water detector status

  Serial.print("Soil Moisture (Analog): ");
  Serial.print(moistureValue);
  Serial.print(" | Pump Status: ");

  // Pump activation logic
  if (moistureValue < 700) { 
    digitalWrite(relayPin, HIGH); // Turn ON pump (relay activated)
    Serial.println("ON (Watering...)");
  } else {
    digitalWrite(relayPin, LOW); // Turn OFF pump
    Serial.println("OFF");
  }

  // Optional: Display water detector status
  if (waterDetected == HIGH) {
    Serial.println("Warning: Water Detected!");
  }

  delay(5000); // Wait 1 second before next reading
}