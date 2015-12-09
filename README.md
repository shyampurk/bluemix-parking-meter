# IoT enabled Smart Parking Meter with IBM Bluemix & PubNub

Smart Parking System based on IBM Buemix hosted Parking Meter & hardware controlled by an Arduino YUN along with PubNub as the communication middleware.

## OVERVIEW

This project demonstrates how we can build an application seever on IBM Bluemix for allowing users to reserve parking bays and automatically handle their parking bills as well. The Hardware for this is based on Arduino YUN which can control a set of HC-SR04 ultrasonic sensors, to detect the availability of a parking slot and update this information on a mobile app using the PubNub's realtime data stream network.  

## INTRODUCTION

This application is assumed to be installed in a public parking space where each parking bay is monitored using a HC-SR04 ultrsonic sensor connected to Arduino YUN board.

Refer [Circuit Diagram](schematic.png)

The application has three parts

1) Parking management Server - This is the application server written in Python which manages the parking reservations, billing and broadcasts parking status updates to all Apps. For hosting this on IBM Bluemix, refer the "APPLICATION SERVER HOSTING" section below.

2) Hardware - This is the master controller module which runs on Arduino YUN. It periodically gets the status of parking slots within its jurisdiction, from the ultrasonic sensors.

3) Mobile App - This is a cordova based simple mobile app which displays a map of the entire parking lot with color coded status indicators. It provides an instant update to the driver about the current availablity of free parking slots. It also allows the user to reserve a vacant parking bay and additionally handles the parking billing. 

## BUILD AND INSTALL

Refer [Build & Install](BUILD.md) Steps

## APPLICATION SERVER HOSTING

For hosting the Parking management Server on IBM Bluemix, follow the steps as given below


1. Signup to create your trial [IBM Bluemix account](https://developer.ibm.com/bluemix/#gettingstarted).
 
3. Follow the [Bluemix Documentation](https://www.ng.bluemix.net/docs/) to create your bluemix container 

4. Install the [PubNub service](https://www.pubnub.com/blog/2015-09-09-getting-started-pubnub-ibm-bluemix/) and attach it to your comtainer.
 
5. Install and initialize the [python application runtime](https://www.ng.bluemix.net/docs/starters/python/index.html) 

6. Deploy the application server package under "server" folder on your Bluemix container and start the application from Bluemix console.



## WORKING

1) Deploy the Parking management Server application on IBM Bluemix

2) Install the Mobile app in an android phone and ensure that the phone has access to internet.

3) Power up the hardware setup and make sure that Arduino YUN has access to internet.

4) Make sure that the ultrasonic sensors are not obstructed 

5) Launch the mobile app. Upon launching, it will ask the user for entering his vehicle registration ( license plate ) number. Feed in the number and proceed. 

6) Check that the initial status of all the parking bays is green, which indicates that all parking bays are free.

7) Obstruct one or more ultrasonic sensors with a object to simulate the presence of a vehicle. 

8) Observe the display of mobile app. After a few seconds the color for the corrosponding slot numbers should turn red to indicate that the slots have been occupied. If the mobile app indicates grey status for any of the parking slot then this means that the sensor has a fault or is malfunctioning and the slot is currently unavailable. 

9) For reserving a parking bay, tap on a vacant (green) parking bay on the mobile app. The app will display a message indicating that the parking bay has been reserved for you. Also the color of the bay will change to red.

10) Subsequently, obstruct the corrosponding sensor to simulate the parking of car. 

11) After sometime , remove the obstruction from the ultrasonic sensor to simulate pulling out of the car from the parking bay.

12) The mobile app should automatically detect this and display a message to user providing the details of his parking session along with the bill.



