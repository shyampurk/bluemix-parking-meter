/*********************************************************************************
SMART PARKING LOT SYSTEM
*********************************************************************************/
//Import the Libraries Required 
#include <stdio.h> 
#include <stdlib.h> 
#include <string.h> 
#include <unistd.h> 
#include <fcntl.h> 
#include <termios.h> 
#include <pthread.h>
#include "pubnub_sync.h"

//Pubnub Publish and Subscribe Keys
const char *pub_key = "pub-c-a1f796fb-1508-4c7e-9a28-9645035eee90";
const char *sub_key = "sub-c-d4dd77a4-1e13-11e5-9dcf-0619f8945a4f";

//Individual Parking ID's for the Parking LOT's 
char *g_lot1 = "001";
char *g_lot2 = "002";
char *g_lot3 = "003";

/*Characted String used to form the json data to be sent 
to the app using json_data function */
char g_jsonResponse[26] = "";

int g_uart0_filestream = -1;
int g_firstChar = 0,g_secondChar = 0,g_thirdChar = 0;

//Function Prototypes used in this program
void prepare_json_data(char *p_lot,int p_status);
int pubnub_send(char *p_data);

/**************************************************************************************

Function Name 	:	uartInit
Description		:	Initialize the UART Serial Communication between the 
					Raspberry Pi and the Atmega 8a Microcontroller
Parameters 		:	void
Return 			:	int - when uart connection fails returns -1 else 0

**************************************************************************************/

int uartInit(char *port)
{
	g_uart0_filestream = open(port, O_RDWR | O_NOCTTY | O_NDELAY);
	if(g_uart0_filestream == -1)
	{
		printf("Error Connecting with the Device \n");
		return -1;
	}
	//Setting the Baud Rate and No. of the Stop Bits for the UART
	struct termios options;
	tcgetattr(g_uart0_filestream,&options);
	//BAUD Rate Initialized to 9600 bps
	options.c_cflag = B9600 | CS8 | CLOCAL | CREAD;
	options.c_iflag = IGNPAR;
	options.c_oflag = 0;
	options.c_lflag = 0;
	tcflush(g_uart0_filestream, TCIFLUSH);
	tcsetattr(g_uart0_filestream,TCSANOW,&options);
	return 0;
}

/******************************************************************************************

Function Name 	:	pubnub_send
Description		:	Publish the present status of the parking lots to the 
					Requested App
Parameters 		:	p_data
		p_data  :	Parameter is the char pointer holds the data has to be 
					sent to the Requested App
Return 			:	int, if error in sent thr function returns -1 else 0

*****************************************************************************************/

int pubnub_send(char *p_data)
{
	enum pubnub_res l_response;
	char const *l_responseChannel = "parkingdevice-resp";
	struct Pubnub_UUID uuid;
	struct Pubnub_UUID_String str_uuid;
	pubnub_t *l_publish = pubnub_alloc();
	if (NULL == l_publish) 
	{
		printf("Failed to allocate Pubnub context!\n");
		return -1;
	}
	pubnub_init(l_publish, pub_key, sub_key);

	if (0 != pubnub_generate_uuid_v4_random(&uuid)) 
	{
		pubnub_set_uuid(l_publish, "zeka-peka-iz-jendeka");
	}
	else 
	{
		str_uuid = pubnub_uuid_to_string(&uuid);
		pubnub_set_uuid(l_publish, str_uuid.uuid);
		printf("Generated UUID: %s\n", str_uuid.uuid);
	}

	pubnub_set_auth(l_publish, "danaske");
	puts("Publishing...");
	l_response = pubnub_publish(l_publish, l_responseChannel, p_data);
	if(l_response != PNR_STARTED) 
	{
		printf("pubnub_publish() returned unexpected: %d\n", l_response);
		pubnub_free(l_publish);
		return -1;
	}
	l_response = pubnub_await(l_publish);
	if (l_response == PNR_STARTED) 
	{
		printf("pubnub_await() returned unexpected: PNR_STARTED(%d)\n", l_response);
		pubnub_free(l_publish);
		return -1;
	}
	if (PNR_OK == l_response) {
	printf("Published! Response from Pubnub: %s\n", pubnub_last_publish_result(l_publish));
	return 0;
	}
	else if (PNR_PUBLISH_FAILED == l_response) {
	printf("Published failed on Pubnub, description: %s\n", pubnub_last_publish_result(l_publish));
	}
	else {
	printf("Publishing failed with code: %d\n", l_response);
	}
	pubnub_free(l_publish);
	return 0;
}

/***************************************************************************************

Function Name 	:	prepare_json_data
Description		:	With the Present Status of the Parking Lots 
					this function makes a json data to be sent as Response
Parameters 		:	p_status
	p_status	:	Status of the first Parking Lot
Return 			:	void

***************************************************************************************/

void prepare_json_data(char *p_lot,int p_status)
{
	char l_buf [2] = "";
	strcat(g_jsonResponse,"{\"deviceID\":\"");
	strcat(g_jsonResponse,p_lot);
	strcat(g_jsonResponse,"\",\"value\":");
	snprintf(l_buf,sizeof(l_buf),"%d",p_status);
	strcat(g_jsonResponse,l_buf);
	strcat(g_jsonResponse,"}");
	memset(l_buf, 0, sizeof(l_buf));	
}

/****************************************************************************************

Function Name 	:	main
Description		:	Initalize UART, Thread and publish if any status change
					in the parking lots
Parameters 		:	void
Return 			:	int, if error in the function returns -1 else 0

****************************************************************************************/

int main(int argc,char *argv[])
{
	if((uartInit(argv[1])) == 0)
	{
		long l_status = 0;
		int l_tempFirst,l_tempSecond,l_tempThird;
		while(1)
	    	{
			if (g_uart0_filestream != -1)
			{
				char *l_ptr = NULL;
				char l_rxBuffer[4];
				int l_rxLength = read(g_uart0_filestream,(void*)l_rxBuffer, 3);
				if (l_rxLength > 0)
				{
					l_rxBuffer[l_rxLength] = '\0';
				}
				/*DATA RECEIVED by UART is 1,2,3
					1	-	Parking LOT is Free
					2	-	Parking LOT is Filled
					3	-	Fault in the Sensor	*/
				g_firstChar  = l_rxBuffer[0] - '0';
				g_secondChar = l_rxBuffer[1] - '0';
				g_thirdChar  = l_rxBuffer[2] - '0';
				l_status = strtol(l_rxBuffer,&l_ptr,10);
				printf("%ld\n",l_status);
				/*DATA SENT to the APP is Modified to 0,1,2
					0	-	Parking LOT is Free
					1	-	Parking LOT is Filled
					2	-	Fault in the Sensor */
				if(g_firstChar != l_tempFirst && g_firstChar > 0 && g_firstChar < 5)
				{
					l_tempFirst = g_firstChar;
					prepare_json_data(g_lot1,g_firstChar-1);
					pubnub_send(g_jsonResponse);
					memset(g_jsonResponse, 0, sizeof(g_jsonResponse));		
				}
				if(g_secondChar != l_tempSecond && g_secondChar > 0 && g_secondChar < 5)
				{
					l_tempSecond = g_secondChar;
					prepare_json_data(g_lot2,g_secondChar-1);
					pubnub_send(g_jsonResponse);		
					memset(g_jsonResponse, 0, sizeof(g_jsonResponse));
				}
				if(g_thirdChar != l_tempThird && g_thirdChar > 0 && g_thirdChar < 5)
				{
					l_tempThird = g_thirdChar;
					prepare_json_data(g_lot3,g_thirdChar-1);
					pubnub_send(g_jsonResponse);		
					memset(g_jsonResponse, 0, sizeof(g_jsonResponse));
				}
			}
        	usleep(500000);
		}
	    close(g_uart0_filestream);
	}
	else
	{
		printf("UART Initialization Failed, Aborting");
		return -1;
	}
	return 0;
}

//End of the Program
//********************************************************************************************//