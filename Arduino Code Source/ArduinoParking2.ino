#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <Servo.h> 

LiquidCrystal_I2C lcd(0x27,16,2);
Servo myservo;

int IR = 5;  // Capteur IR connecté à la broche 5
int totalSlots = 10; // Nombre total de places dans le parking
int occupiedSlots = 0; // Nombre de places occupées
int lastState = HIGH;
bool openSignal = false;

void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  pinMode(IR, INPUT);
  myservo.attach(9);
  myservo.write(100); // Position initiale de la barrière (fermée)

  lcd.setCursor(0,0);
  lcd.print("     WELCOME!   ");
  delay(4000);
  lcd.clear();  
  updateLCD();
}

void loop() { 
  int sensorState = digitalRead(IR);
  
  // Vérifier si un signal est reçu depuis le port série
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "OPEN") {
      openSignal = true;
    }
  }
  
  // Vérification des conditions pour ouvrir la barrière
  if ((sensorState == LOW && lastState == HIGH) || openSignal) {
    myservo.write(0); // Ouvre la barrière
    delay(5000); // Attente 5 secondes
    myservo.write(100); // Ferme la barrière
    
    if (occupiedSlots < totalSlots) {
      occupiedSlots++;
    }
    updateLCD();
    openSignal = false; // Réinitialiser le signal d'ouverture
  }
  
  lastState = sensorState;
}

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0,0);
  if (occupiedSlots < totalSlots) {
    lcd.print(" total slots: ");
    lcd.print(occupiedSlots);
    lcd.setCursor(0,1);
    lcd.print("  Available: ");
    lcd.print(totalSlots - occupiedSlots);
  } else {
    lcd.print("  Parking Full!  ");
  }
}