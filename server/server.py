from pubnub import Pubnub
import json
import datetime
from threading import Thread
import time
pubnub = Pubnub(publish_key="pub-c-a1f796fb-1508-4c7e-9a28-9645035eee90", subscribe_key="sub-c-d4dd77a4-1e13-11e5-9dcf-0619f8945a4f")
# Holds the Present Status of all the Parking Lots Updated
g_orginalStatus = dict()
g_parkingStatus = dict()			
# Notifies the App about Session Start and End
g_sessionStatus = dict()
# Starts the Reservation and Meterting of the Particular Slot
g_smartMeter = dict()
# Handles the Reservation Slot 
g_lotReserved = dict()
g_lotNumberList = list()

def checkList(p_lotNumber):
	l_count = 0
	for i in range(len(g_lotNumberList)):
		if (p_lotNumber == g_lotNumberList[i]):
			l_count+=1
	return l_count

def closeReservation():
	l_endTime = datetime.datetime.now()
	time.sleep(1)
	print len(g_lotNumberList)
	if(len(g_lotNumberList) > 0):
		for i in range(len(g_lotNumberList)):
			if (g_orginalStatus.has_key(g_lotNumberList[i]) and g_orginalStatus[g_lotNumberList[i]] != 1 and len(g_lotNumberList) > 0):
				l_totalTime = l_endTime - g_lotReserved[g_lotNumberList[i]]
				l_totalMin = divmod(l_totalTime.days * 86400 + l_totalTime.seconds, 60)[0]
				if(l_totalMin >= 1):
					sessionEnd(g_lotNumberList[i],g_orginalStatus[g_lotNumberList[i]])
					g_parkingStatus[g_lotNumberList[i]] = g_orginalStatus[g_lotNumberList[i]]
					pubnub.publish(channel='parkingapp-resp', message={g_lotNumberList[i]:g_orginalStatus[g_lotNumberList[i]]})
					del g_lotReserved[g_lotNumberList[i]]
					del g_lotNumberList[i]
					break
			elif(g_orginalStatus.has_key(g_lotNumberList[i]) and g_orginalStatus[g_lotNumberList[i]] == 1):
				del g_lotReserved[g_lotNumberList[i]]
				del g_lotNumberList[i]
				break 
	else:
		pass

def sessionEnd(p_deviceid,p_status):
	if(g_smartMeter.has_key(p_deviceid) and p_status == 0):
		l_endTime = datetime.datetime.now()
		g_smartMeter[p_deviceid][2] = l_endTime
		l_etimeStr = str(l_endTime.hour) + ":" + str(l_endTime.minute) + ":" + str(l_endTime.second)
		l_parsedEndTime = datetime.datetime.strptime(l_etimeStr,'%H:%M:%S').strftime('%H:%M:%S')
		g_sessionStatus["sessionType"] = 1
		g_sessionStatus["carNum"] = g_smartMeter[p_deviceid][0]
		g_sessionStatus["lotNumber"] = p_deviceid
		g_sessionStatus["endTime"] = l_parsedEndTime
		totalTime = g_smartMeter[p_deviceid][2] - g_smartMeter[p_deviceid][1]
		l_totalMin = divmod(totalTime.days * 86400 + totalTime.seconds, 60)[0]
		g_sessionStatus["totalTime"] = l_totalMin
		if(l_totalMin < 60):
			g_sessionStatus["totalAmt"] = 20
		elif(l_totalMin > 60 and l_totalMin < 120):
			g_sessionStatus["totalAmt"] = 40
		elif(l_totalMin > 120 and l_totalMin < 180):
			g_sessionStatus["totalAmt"] = 60
		elif(l_totalMin > 180 and l_totalMin < 240):
			g_sessionStatus["totalAmt"] = 80
		elif(l_totalMin > 240 and l_totalMin < 300):
			g_sessionStatus["totalAmt"] = 100
		elif(l_totalMin > 300 and l_totalMin < 360):
			g_sessionStatus["totalAmt"] = 120
		elif(l_totalMin > 360 and l_totalMin < 420):
			g_sessionStatus["totalAmt"] = 140
		elif(l_totalMin > 420 and l_totalMin < 480):
			g_sessionStatus["totalAmt"] = 160
		elif(l_totalMin > 480 and l_totalMin < 540):
			g_sessionStatus["totalAmt"] = 180
		elif(l_totalMin > 540 and l_totalMin < 600):
			g_sessionStatus["totalAmt"] = 200
		elif(l_totalMin > 600 and l_totalMin < 660):
			g_sessionStatus["totalAmt"] = 220
		elif(l_totalMin > 660 and l_totalMin < 720):
			g_sessionStatus["totalAmt"] = 240
		print pubnub.publish(channel=g_smartMeter[p_deviceid][0], message=g_sessionStatus)
		del g_smartMeter[p_deviceid]
	else:
		pass

def carReserved(p_lotNumber,p_status):
	g_orginalStatus[p_lotNumber] = p_status
	if(checkList(p_lotNumber) != 0 and p_status == 0):
		g_parkingStatus[p_lotNumber] = 1
	else:
		sessionEnd(p_lotNumber,p_status)
		g_parkingStatus[p_lotNumber] = p_status
		print pubnub.publish(channel='parkingapp-resp', message={p_lotNumber:p_status})

def checking (p_requester,p_reqtype,p_deviceid,p_carNum):
	if (p_requester == "APP"):
		if (p_reqtype == 1):
			pubnub.publish(channel='parkingapp-resp', message=g_parkingStatus)
		elif (p_reqtype == 2):
			g_smartMeter[p_deviceid] = [p_carNum,0,0,0]
			if(g_smartMeter.has_key(p_deviceid)):
				l_startTime = datetime.datetime.now()
				l_dateStr = str(l_startTime.day) + "." + str(l_startTime.month) + "." + str(l_startTime.year)
				l_stimeStr = str(l_startTime.hour) + ":" + str(l_startTime.minute) + ":" + str(l_startTime.second)
				l_parsedDate = datetime.datetime.strptime(l_dateStr,'%d.%m.%Y').strftime('%m-%d-%Y')
				l_parsedStartTime = datetime.datetime.strptime(l_stimeStr,'%H:%M:%S').strftime('%H:%M:%S')
				g_smartMeter[p_deviceid][1] = l_startTime
				g_sessionStatus["sessionType"] = 0
				g_sessionStatus["carNum"] = p_carNum
				g_sessionStatus["lotNumber"] = p_deviceid
				g_sessionStatus["parkingDate"] = l_parsedDate
				g_sessionStatus["startTime"] = l_parsedStartTime
				g_sessionStatus["endTime"] = 0
				g_sessionStatus["totalTime"] = 0
				g_sessionStatus["totalAmt"] = 0
				pubnub.publish(channel=p_carNum, message=g_sessionStatus)
				g_parkingStatus[p_deviceid] = 1
				g_lotReserved[p_deviceid] = l_startTime 
				if(checkList(p_deviceid)==0):
					g_lotNumberList.append(p_deviceid)
				pubnub.publish(channel='parkingapp-resp', message=g_parkingStatus)
			else:
				print "CAR NOT PARKED SUCCESSFULLY"

def callback(message, channel):
	print message
	carReserved(message["deviceID"],message["value"])
	
def appcallback(message, channel):
	print message
	checking(message["requester"],message["requestType"],message["deviceID"],message["requestValue"])
         
def error(message):
    print("ERROR : " + str(message))
   
def reconnect(message):
    print("RECONNECTED")
  
def disconnect(message):
    print("DISCONNECTED")

pubnub.subscribe(channels='parkingdevice-resp', callback=callback, error=callback,
                 reconnect=reconnect, disconnect=disconnect)

pubnub.subscribe(channels='parkingapp-req', callback=appcallback, error=appcallback,
                 reconnect=reconnect, disconnect=disconnect)

if __name__ == '__main__':
	while True:
		l_timeout = Thread(target=closeReservation)
		l_timeout.start()
		l_timeout.join()
#End of the Script 
##*****************************************************************************************************##

