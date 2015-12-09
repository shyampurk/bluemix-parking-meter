# Build and Install Steps

##Assumptions

1. The Arduino YUN is upgraded with the Latest OpenWRT-YUN update 
	- Download the update package YunSysupgradeImage_v1.5.3.zip from the following link,
				
				https://www.arduino.cc/en/Main/Software#toc8

2. The Arduino YUN has Enough space to install the required enviroinment, if not follow the steps on the following link
 
				https://www.arduino.cc/en/Tutorial/ExpandingYunDiskSpace

3. The application has been tested and verified with the following software versions
				
	DEVICE:
	
		Arduino IDE v 1.6.4
		PubNub Python SDK v 3.7.4
		PubNub POSIX C SDK v 2.1.0

	ANDROID APP:

		CORDOVA v 5.4.1
		ANT v 1.9.6
		Android-SDK v 24.4.1
		JAVA v 1.8.0_66
		nodejs v 0.10.25

3. Before preceeding for build and install steps, the users are expected update the PubNub publish and subscribe keys as per their PubNub subscription, in the following source files. 
		
		server/server.py
		MobileApp/www/js/index.js

If you do not have a PubNub subscription, [Click here](https://www.pubnub.com/get-started/#get-started) to create your free PubNub account.
 

## Setting up the ARDUINO YUN

### Configuring WiFi network and SSH access 

Step 1 : Check for SSID ARDUINO-YUN90XXXXXX and connect to the device hotspot

Step 2 : Once connected to the network,open the browser visit arduino/local or 192.168.240.1 with default password arduino to configure the settings and setup the YUN to run on users Wifi network. 

	(i)  	Modify the Name of the device and Password which is used for the network login and uploading the 	
		programs from the Arduino IDE

	(ii)	Change the Wireless Parameters SSID and Password to the local wirless network.

	(iii)	When all the setting are made, click on Configure & Restart. When you are waiting for the device to 
			restart switch on to the your laptop to local wifi network.

Step 3 : Open up the terminal and follow the commands, make sure you know the IP address of the Arduino-YUN
			
				ssh root@yourname/local or ssh root@192.168.XX.XX	

Once you started the ssh connection with the YUN install the requirements for project

### Build Setup

We will be using the Adruino YUN environment itself for building the software

Step 1 : Install yun-gcc to Arduino YUN 

	(i)		Before installing yun-gcc, install the 	following 

				opkg update
				opkg install binutils
				opkg install make
				opkg install tar

	(ii)	Now we are ready to install the yun-gcc,

				opkg -t /root install yun-gcc

This package will take about 20 minutes or more to install so be patient, once it finishes you will be ready to compile simple c or c++ programs.I prefer to download and install this package separately so I can see what is going on:
				
				cd /mnt/sda1
				wget http://downloads.arduino.cc/openwrtyun/1/packages/yun-gcc_4.6.2-2_ar71xx.ipk
				opkg install yun-gcc_4.6.2-2_ar71xx.ipk

Step 2 : Installing the glibc 

	(i)		Download the Package glibc-source_2.19-18+deb8u1_all.deb in your laptop from the following link 

				https://packages.debian.org/jessie/all/glibc-source/download

	(ii)	Once the package is downloaded SCP the file to the YUN using the following command running on the 	
			new terminal(modify the filename and IP address)

				scp -r Downloads/(filename).deb root@192.168.XX.XX:/root/

	(iii)	Once done install the glibc,

				opkg -f /etc/opkg.conf -d ram update 
				opkg -f /etc/opkg.conf -d ram install <package-name>

Now Arduino-YUN is ready to compile and run the C Programs.

Step 3: Edit the /etc/inittab file for UART Communication

				nano /etc/inittab
				
Comment out the ttyATH0 line by adding # as prefix and save the file.				

## Master Controller Build

Steps to be followed to build the Master Controller software of Smart Parking System on Arduino YUN

Step 1: Clone this repository bluemix-parking-meter from the github in your laptop/PC

    			git clone https://github.com/shyampurk/bluemix-parking-meter.git

Step 2: Change the directory to the bluemix-parking-meter 

    			cd bluemix-parking-meter

Step 3: Clone the c-core library from the pubnub

    			git clone https://github.com/pubnub/c-core.git

Step 4: Copy bluemix-parking-meter folder using SCP to the YUN

				scp -r bluemix-parking-meter root@192.168.XX.XX:/root/

Step 5: Open up the terminal and follow the commands, make sure you know the IP address of the Arduino-YUN
			
				ssh root@yourname/local or ssh root@192.168.XX.XX	

Step 6: Change the directory to the bluemix-parking-meter 

    			cd bluemix-parking-meter 

Step 7:	Modify the Pubnub Publish and Subscribe Keys in the yun_pubnub/pubnub_hc04.c

Step 8: To Build using the Makefile, just run

    			make

Step 9: You should see the executable file named ./pubnub_hc04. You can execute the file to test if it executes without any error.

## Sensor Controller Build

Before preceeding, we need to install Arduino IDE 

Installing the Arduino IDE

	- Download and Install Latest Version of Arduino IDE from 

                [https://www.arduino.cc/en/Main/Software]

	- Start Arduino IDE and Plug the Development Board

Step 1: Open the device/hcsr04.ino from this repo in Arduino IDE

Step 2: Select the Board from Tools - > Board - > Arduino YUN

Step 3: Select the USB Port from Tools - > Port - > yourname @ ipaddress [Arduino-YUN]

Step 4: Upload the Code


## Installing and Building Android App Using Cordova


Step 1: Install GIT using the following command using your terminal,
			
					sudo apt-get install git

Step 2: Change the directory to $HOME
				
					cd $HOME

Step 3: Install nodejs using the following,
					
					sudo apt-get install nodejs
					sudo apt-get install nodejs-legacy

Step 4: Creating a symbolic link for the nodejs

					sudo ln -s /usr/bin/nodejs /usr/bin/node

**check install : nodejs --version

Step 5: Install npm 

					sudo apt-get instal npm

**check install : npm --version

Step 6: Update & install gcc-multilib
					
					sudo apt-get update
					sudo apt-get install gcc-multilib

Step 7: Install cordova latest version,

					sudo su -c "npm install -g cordova"

(Step 8, 9 , 10 - if bplist-parser,path-is-absolute,inflight files are missing)

Step 8: sudo npm install -g bplist-parser

Step 9: sudo npm install -g path-is-absolute

Step 10:sudo npm install -g inflight

**check install: cordova --version


Step 11: Install Java

The Android SDK needs the Java Development Kit (JDK) to be installed (minimum version 1.6). Note that the Java Runtime Environment (JRE) is not sufficient, you will need the JDK. To check if you have the JDK installed already, type this in a terminal window:

java -version
javac -version

If version info is displayed, you have Java installed, but you may want to use the Oracle JDK, rather than the OpenJDK that comes with many Linux distributions. The Oracle JDK is needed for signing Android apps.

If you wish to install the Oracle JDK, proceed as follows (the steps below are based on a guide from wikiHow):

    Start by removing the OpenJDK:

    sudo apt-get purge openjdk-\*
    sudo apt-get autoremove

    Find out if you have a 32-bit och 64-bit Linux version:

    file /sbin/init

    If you run 64-bit Linux, you should install 32-bit libraries (Android SDK will need this):

    sudo apt-get install ia32-libs

    Download the JDK (Java SE Development Kit). The download file ends with .tar.gz. For 32-bit systems get the "Linux x86" download, for 64-bit systems get the "Linux x64" download.

    The downloaded file is typically saved to the folder "Download" in your home directory. The following steps create an installation directory and unpack the JDK files there. You can pick any directory for the install, we will use the directory "java" in the home folder. Replace "jdk-8u11-linux-i586.tar.gz" with the name of the file you just downloaded.

    mkdir -p ~/java
    cd  ~/Downloads
    mv jdk-8u11-linux-i586.tar.gz ~/java
    cd ~/java
    tar xvzf jdk-8u11-linux-i586.tar.gz
    rm jdk-8u11-linux-i586.tar.gz

    Check the name of the JDK install directory with:

    ls

    The path to the JDK becomes "~/java/jdk1.8.0_11" where "jdk1.8.0_11" is the name displayed by the ls command.

    Add the path to the JDK by editing .bashrc in your home directory. You can use for example nano or gedit for this:

    nano ~/.bashrc

    or:

    gedit ~/.bashrc

    Add the following to the end of the file (replace "jdk1.8.0_11" with the actual folder name!):

	JAVA_HOME=~/java/jdk1.8.0_66
	PATH=$PATH:~/java/jdk1.8.0_66/bin
	export JAVA_HOME

    Edit the .bash_profile file to load .bashrc. Opening a terminal windows runs .bash_profile, and we want our path settings to be available in the terminal. If not already present, add the following lines to .bash_profile (se nano or gedit as above):

    if [ -f ~/.bashrc ]; then
       source ~/.bashrc
    fi

    Now you are ready to test the install. Close any open terminal windows, open a new terminal and type:

    javac -version
    java -version

    If version info is displayed you are done with the JDK install!

Step 12: Install Ant

Apache Ant is a build system for Java, which is used by Cordova and the Android SDK. To install Ant, follow these steps:

    Download Ant from here: ant.apache.org/bindownload.cgi. Get the zip download available at the page. Click the zip-file link for the most recent release, e.g. apache-ant-1.9.4-bin.zip, and save the file to your machine.

    Unpack the zip file to the directory on your machine where you want Ant to be installed. You can pick any directory for the install, we will use the directory "ant" in the home folder. Here are the commands (make sure you use the actual name of the downloaded zip file):

    mkdir -p ~/ant
    cd ~/ant
    unzip apache-ant-1.9.4-bin.zip
    rm apache-ant-1.9.4-bin.zip

    To add Ant to the system path, edit .bashrc to contain the following lines at the end. Again, be careful to use the actual names of the files and folders on your system:

	JAVA_HOME=~/java/jdk1.8.0_66
	PATH=$PATH:~/java/jdk1.8.0_66/bin
	export JAVA_HOME

	ANT_HOME=~/ant/apache-ant-1.9.6
	PATH=$PATH:~/ant/apache-ant-1.9.6/bin
	export ANT_HOME

    export PATH

    Now test the install. Close the terminal window, open a new terminal (to make settings take effect) and type:

    ant -version

    If you see a version number you have installed Ant successfully!

Step 13: Install the Android SDK Tools

The SDK Tools for Android are used by Cordova to build Android apps. Follow these steps to install the SDK Tools:

    Go to the page developer.android.com/sdk scroll down the page and click "VIEW ALL DOWNLOADS AND SIZES". Under "SDK Tools Only", click the windows installer file for Linux and download it (this file is named e.g. android-sdk_r23.0.2-linux.tgz).

    When downloaded, unpack the files. Here are commands for unpacking the Android SDK folder into your home directory:

    cd
    mv ~/Downloads/android-sdk_r23.0.2-linux.tgz .
    tar zxvf android-sdk_r23.0.2-linux.tgz
    rm android-sdk_r23.0.2-linux.tgz

    The unpacked folder is named "android-sdk-linux" as of the release used in this example.

    The Android SDK Tools need to be added to the system path. Edit .bashrc to contain the following lines at the end. Make sure you use the actual names of the files and folders on your system:

	JAVA_HOME=~/java/jdk1.8.0_66
	PATH=$PATH:~/java/jdk1.8.0_66/bin
	export JAVA_HOME

	ANT_HOME=~/ant/apache-ant-1.9.6
	PATH=$PATH:~/ant/apache-ant-1.9.6/bin
	export ANT_HOME

	PATH=$PATH:~/android-sdk-linux/platform-tools
	PATH=$PATH:~/android-sdk-linux/tools

	export PATH

    You need to have the specific Android SDK version used by Cordova. This is done by running the Android SDK Manager by typing the command:

    android

    This launches a window where you can select to install specific Android SDKs.

    First time you launch the Android SDK Manager there will be preset selections. It is recommended to leave these untouched. Also select the entry "Android 4.4.2 (API 19)" is not installed already. This is the version used by the current Cordova 3.5 version. Note that the Android SDK required by Cordova will change in the future, as new versions of Cordova and Android are released. When this happens, open the Android SDK Manager again, and install the required API version(s).

    To test the install, close the terminal window, open a new terminal and type:

    adb version

    This should display version info for the Android Debug Bridge.

### If You Get Stuck

If you get stuck, consult the documentation at the respective web sites for Cordova, Java, Ant, and Android. The Cordova documentation specific for Android is found here: cordova.apache.org/docs/en/3.6.0/guide_platforms_android_index.md.html. You are also welcome to ask for help at the Evothings Forum.

One thing to do is to inspect all the environment variables. You can do this from a command window (note that you have to open a new command window after updating environment variables for updated values to be available). This displays the system PATH:

echo $PATH

Here is how to inspect the values of JAVA_HOME and ANT_HOME:

echo $JAVA_HOME
echo $ANT_HOME

## MOBILE APP BUILD

Steps to be followed to Build and Run the Android App for Smart Parking System

Step 1 : Change the directory to the bluemix-parking-meter/MobileApp

     			cd bluemix-parking-meter/MobileApp

Step 2 : Modify the pubnub publish and subscribe keys at www/js/index.js

Step 3 : Build the .apk file using,

     			cordova build android

Step 4 : Once the .apk file is build successfully, you will find the app at this path

     			./platforms/android/ant-build/AutoPark-debug.apk

Step 5 : Install the App on an Android Phone. Follow the steps in [README file](README.md) to use the app. 



