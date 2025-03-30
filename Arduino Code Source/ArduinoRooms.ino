#include <SPI.h>
#include <MFRC522.h>
   // Red LED for incorrect access

#define FAN_PIN 3      
#define LIGHT_PIN 5    
#define WINDOW_PIN 6   
#define CURTAIN_PIN 9  


void setup() {
    Serial.begin(9600);  
    Serial.println("done");
    SPI.begin();
    

    pinMode(FAN_PIN, OUTPUT);
    pinMode(LIGHT_PIN, OUTPUT);
    pinMode(WINDOW_PIN, OUTPUT);
    pinMode(CURTAIN_PIN, OUTPUT);

    digitalWrite(FAN_PIN, LOW);
    digitalWrite(LIGHT_PIN, LOW);
    digitalWrite(WINDOW_PIN, LOW);
    digitalWrite(CURTAIN_PIN, LOW);
}

void loop() {
    if (Serial.available()) {
        char command = Serial.read();
        if (command == '\n' || command == '\r') return;
        Serial.print(command);
        delay(3);

        if (Serial.available()) { 
            char state = Serial.read();
            if (state == '\n' || state == '\r') return;

            switch (command) {
                case 'F': 
                    digitalWrite(FAN_PIN, state == '1' ? HIGH : LOW);
                    Serial.println(state == '1' ? "an ON" : "an OFF");
                    break;
                case 'L': 
                    digitalWrite(LIGHT_PIN, state == '1' ? HIGH : LOW);
                    Serial.println(state == '1' ? "ight ON" : "ight OFF");
                    break;
                case 'W': 
                    digitalWrite(WINDOW_PIN, state == '1' ? HIGH : LOW);
                    Serial.println(state == '1' ? "indow Open" : "indow Closed");
                    break;
                case 'C': 
                    digitalWrite(CURTAIN_PIN, state == '1' ? HIGH : LOW);
                    Serial.println(state == '1' ? "urtain Open" : "urtain Closed");
                    break;
                default:
                    Serial.println("Unknown command received.");
                    break;
            }
        }
    }

    // Check RFID for door access
}

