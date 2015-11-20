/*********************************************************************************
SMART PARKING LOT SYSTEM
*********************************************************************************/
//Reference Value to Get The Status of Parking
#define g_parked 100
#define g_fault 4500

//Pin Setting for the 3 Ultrasonic Sensors
#define g_trigPin 13
#define g_echoPin 12
#define g_trigPin2 4
#define g_echoPin2 5
#define g_trigPin3 8
#define g_echoPin3 9

/**************************************************************************************
Function Name 		:	setup
Description		    :	Initialize the Sensor Trigger Pin as Output and 
                    echo pin as Input and begin the serial communication
                    with 9600 BAUD
Parameters 		    :	void
Return 			      :	void
**************************************************************************************/
//Initialize the Pins and BAUD rate 
void setup(void) {
        Serial1.begin (9600);
        Serial.begin(9600);
        pinMode(g_trigPin, OUTPUT);
        pinMode(g_echoPin, INPUT);
        pinMode(g_trigPin2, OUTPUT);
        pinMode(g_echoPin2, INPUT);
        pinMode(g_trigPin3, OUTPUT);
        pinMode(g_echoPin3, INPUT);
}

/**************************************************************************************
Function Name 		:	loop
Description		    :	Generate a Trigger signal and wait for the echo on 
                    HC-SR04 Ultrasonic Sensor and calculate the distance.
Parameters 		    :	void
Return 			      :	void
**************************************************************************************/
void loop(void) {
  //Variables to calculate the distance using the duration taken for 1 cycle of trigger and echo      
  long l_duration,l_distance,l_duration2,l_distance2,l_duration3,l_distance3;
  //Distance form the Ultrasonic Sensor 1
  //Generate a high pulse on Trigger Pin with 10 micro seconds delay and wait for the echo
  digitalWrite(g_trigPin, LOW);
  delayMicroseconds(2); 
  digitalWrite(g_trigPin, HIGH);
  delayMicroseconds(10); 
  digitalWrite(g_trigPin, LOW);
  //Once received the Echo calculate the distance from the duration
  l_duration = pulseIn(g_echoPin, HIGH);
  l_distance = (l_duration/2) / 29.1;
  delay(300);
  
  //Distance form the Ultrasonic Sensor 2
  digitalWrite(g_trigPin2, LOW);
  delayMicroseconds(2); 
  digitalWrite(g_trigPin2, HIGH);
  delayMicroseconds(10); 
  digitalWrite(g_trigPin2, LOW);
  l_duration2 = pulseIn(g_echoPin2, HIGH);
  l_distance2 = (l_duration2/2) / 29.1;
  delay(300);
  
  //Distance form the Ultrasonic Sensor 3
  digitalWrite(g_trigPin3, LOW);
  delayMicroseconds(2); 
  digitalWrite(g_trigPin3, HIGH);
  delayMicroseconds(10); 
  digitalWrite(g_trigPin3, LOW);
  l_duration3 = pulseIn(g_echoPin3, HIGH);
  l_distance3 = (l_duration3/2) / 29.1;
  delay(300);
  Serial.println(l_distance);
  Serial.println(l_distance2);
  Serial.println(l_distance3);
  Serial.println("\n\n\n");
  //Check if the Sensor has any fault 
  /*DATA SENT by UART to RPi is  1,2,3
		1	-	Parking LOT is Free
		2	-	Parking LOT is Filled
		3	-	Fault in the Sensor	*/
  if(l_distance < g_fault && l_distance2 < g_fault && l_distance3 < g_fault) 
  {
        if(l_distance <= g_parked && l_distance2 <= g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("222");
        }
        else if(l_distance <= g_parked && l_distance2 <= g_parked && l_distance3 > g_parked)
        {
                Serial1.write("221");
        }
        else if(l_distance <= g_parked && l_distance2 > g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("212");
        }
        else if(l_distance <= g_parked && l_distance2 > g_parked && l_distance3 > g_parked)
        {
                Serial1.write("211");
        }
        else if(l_distance > g_parked && l_distance2 <= g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("122");
        }
        else if(l_distance > g_parked && l_distance2 <= g_parked && l_distance3 > g_parked)
        {
                Serial1.write("121");
        }
        else if(l_distance > g_parked && l_distance2 > g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("112");
        }
        else if(l_distance > g_parked && l_distance2 > g_parked && l_distance3 > g_parked)
        {
                Serial1.write("111");
        }
  }
  else
  {
        if(l_distance > g_fault && l_distance2 <= g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("322");
        }
        else if(l_distance > g_fault && l_distance2 <= g_parked && l_distance3 > g_parked)
        {
                Serial1.write("321");
        }
        else if(l_distance > g_fault && l_distance2 > g_parked && l_distance3 <= g_parked)
        {
                Serial1.write("312");
        }
        else if(l_distance > g_fault && l_distance2 > g_parked && l_distance3 > g_parked)
        {
                Serial1.write("311");
        }
        else if(l_distance <= g_parked && l_distance2 > g_fault && l_distance3 <= g_parked)
        {
                Serial1.write("232");
        }
        else if(l_distance <= g_parked && l_distance2 > g_fault && l_distance3 > g_parked)
        {
                Serial1.write("231");
        }
        else if(l_distance > g_parked && l_distance2 > g_fault && l_distance3 <= g_parked)
        {
                Serial1.write("132");
        }
        else if(l_distance > g_parked && l_distance2 > g_fault && l_distance3 > g_parked)
        {
                Serial1.write("131");
        }
        else if(l_distance <= g_parked && l_distance2 <= g_parked && l_distance3 > g_fault)
        {
                Serial1.write("223");
        }
        else if(l_distance <= g_parked && l_distance2 > g_parked && l_distance3 > g_fault)
        {
                Serial1.write("213");
        }
        else if(l_distance > g_parked && l_distance2 <= g_parked && l_distance3 > g_fault)
        {
                Serial1.write("123");
        }
        else if(l_distance > g_parked && l_distance2 > g_parked && l_distance3 > g_fault)
        {
                Serial1.write("113");
        }
        else if(l_distance > g_fault && l_distance2 > g_fault && l_distance3 <= g_parked)
        {
                Serial1.write("332");
        }
        else if(l_distance > g_fault && l_distance2 > g_fault && l_distance3 > g_parked)
        {
                Serial1.write("331");
        }
        else if(l_distance <= g_parked && l_distance2 > g_fault && l_distance3 > g_fault)
        {
                Serial1.write("233");
        }
        else if(l_distance > g_parked && l_distance2 > g_fault && l_distance3 > g_fault)
        {
                Serial1.write("133");
        }
        else if(l_distance > g_fault && l_distance2 <= g_parked && l_distance3 > g_fault)
        {
                Serial1.write("323");
        }
        else if(l_distance > g_fault && l_distance2 > g_parked && l_distance3 > g_fault)
        {
                Serial1.write("313");
        }
        else if(l_distance > g_fault && l_distance2 > g_fault && l_distance3 > g_fault)
        {
                Serial1.write("333");
        }
  }
  //Provide a Delay for every 5 Seconds once data sent to the RPi
  delay(500);
}

//End of the Program
/***************************************************************************************************/
