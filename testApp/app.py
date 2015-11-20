from pubnub import Pubnub
from threading import Thread
import sys
pubnub = Pubnub(publish_key="pub-c-a1f796fb-1508-4c7e-9a28-9645035eee90", subscribe_key="sub-c-d4dd77a4-1e13-11e5-9dcf-0619f8945a4f")
g_userData = dict()
g_myCar = dict()
g_lotNumber = sys.argv[1]
g_carNumber = sys.argv[2]

def callback(message, channel):
	g_userData.update(message)

def caRcallback(message, channel):
	g_myCar.update(message)

def dataHandling(stdin):
		l_action = int(stdin.readline().strip())
		if(l_action == 1):
			pubnub.publish(channel='parkingapp-req', message={"requester":"APP","deviceID":0,"requestType":1,"requestValue":0})
		elif(l_action == 2):
			pubnub.publish(channel='parkingapp-req', message={"requester":"APP","deviceID":g_lotNumber,"requestType":2,"requestValue":g_carNumber})
		elif(l_action == 3):
			pubnub.publish(channel='parkingapp-req', message={"requester":"APP","deviceID":g_lotNumber,"requestType":3,"requestValue":g_carNumber})
		elif(l_action == 4):
			print "\n\n", g_userData
			print "\n\n", g_myCar
			
def error(message):
    print("ERROR : " + str(message))
  
def connect(message):
    print "CONNECTED"
  
def reconnect(message):
	print("RECONNECTED")
  
def disconnect(message):
	print("DISCONNECTED")

pubnub.subscribe(channels='parkingapp-resp', callback=callback, error=callback,
                 connect=connect, reconnect=reconnect, disconnect=disconnect)
pubnub.subscribe(channels=g_carNumber, callback=caRcallback, error=caRcallback,
                 connect=connect, reconnect=reconnect, disconnect=disconnect)

if __name__ == '__main__':
	while True:
		t1 = Thread(target=dataHandling, args=(sys.stdin,))
		t1.start()
		t1.join()
	