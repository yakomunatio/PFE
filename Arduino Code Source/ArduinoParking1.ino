#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>

#define SS_PIN 10
#define RST_PIN 9
#define IR_SENSOR_PIN 7

MFRC522 rfid(SS_PIN, RST_PIN); // RFID instance
MFRC522::MIFARE_Key key;

SoftwareSerial toArduino2(2, 3); // RX, TX (Send to Arduino 2 via pin 3)

// Replace this with your actual card UID
byte validUID[] = {0x60, 0x54, 0x54, 0x59};
const int uidLength = 4;

void setup() {
    Serial.begin(9600);       // Debugging
    toArduino2.begin(9600);   // Communication to Arduino 2
    SPI.begin();              
    rfid.PCD_Init();          
    pinMode(IR_SENSOR_PIN, INPUT);

    Serial.println("System Ready. Scan your card...");
}

void loop() {
    bool carDetected = digitalRead(IR_SENSOR_PIN) == LOW;

    if (carDetected) {
        Serial.println("Car detected! Waiting for RFID...");

        if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
            if (checkValidCard(rfid.uid.uidByte, rfid.uid.size)) {
                Serial.println("Access Granted!");
                toArduino2.println("OPEN");
            } else {
                Serial.println("Access Denied!");
                toArduino2.println("DENIED");
            }

            rfid.PICC_HaltA();
            rfid.PCD_StopCrypto1();
        }
    } else {
        Serial.println("No car detected.");
    }

    delay(1000);
}

bool checkValidCard(byte *readUID, byte length) {
    if (length != uidLength) return false;
    for (byte i = 0; i < uidLength; i++) {
        if (readUID[i] != validUID[i]) return false;
    }
    return true;
}