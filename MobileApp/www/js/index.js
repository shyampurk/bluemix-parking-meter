var parkingCodes = {0: "available", 1: "occupied",2: "unavailable"}

var app = {
    initialize: function() {
        this.bindEvents();
        $(window).on("navigate", function (event, data) {          
          event.preventDefault();      
      })
    },

    getStatusMessage:{
        "requester": "APP",
        "lotNumber": 0,
        "requestType": 1,
        "requestValue": 0
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).on('resume', app.refreshStatus)
        $('.container').on('click', '.available', app.startParking)
        $('body').on('click', '.close-bill', app.closeBill)
    },
    onDeviceReady: function() {
        if(window.localStorage.getItem('ui')) {
            window.localStorage.setItem('ui', 'DEFAULT');
        }
        app.pubNubInit();
        app.render();
    },
    
    render: function() {
        if(!window.localStorage.getItem('ui')) {
            window.localStorage.setItem('ui', 'REGISTER');
        }
        switch(window.localStorage.getItem('ui')) {
            case 'REGISTER': 
            app.register();
            break;
            case 'START': 
            app.infoDialog('#status-template', 'parking');
            break;
            case 'END': 
            app.infoDialog('#bill-template', 'bill');
            break;

            default: 
            app.default();
        }
    },


    register: function() {
        $(":mobile-pagecontainer").pagecontainer("change", $('#register'));
        $('#vehicle-num-submit').on('click', function() {
            if ($('#number').val() != '') {
                window.localStorage.setItem('ui', 'DEFAULT')
                window.localStorage.setItem('number', $('#number').val())
                app.render()    
            }
            
        })
    },

    default: function() {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", $('#default'));
        app.showLoading("Fetching Current Status");
        app.subscribeToSelf();
        window.setTimeout(function() {
            app.status(app.getStatusMessage)},2000);
    },

    infoDialog: function(template, key) {
        var data = JSON.parse(window.localStorage.getItem(key))
        $('.status-content').empty()
        $('.status-content').append(Mustache.render($(template).html(), data))
        $(":mobile-pagecontainer").pagecontainer("change", $('#parking-status'));
    },

    startParking: function(e) {
        var lot = $(e.target).data().lot        
        app.status(
           {"requester":"APP","lotNumber":lot,"requestType":2,"requestValue":window.localStorage.getItem('number')}
           )
        app.showLoading("Waiting for confirmation...");
    },

    showLoading: function(text) {
        $.mobile.loading("show", {
            text: text,
            textVisible: true,
            textonly: false
        });
    },

    refreshStatus: function() {
        if (window.localStorage.getItem('ui') == 'DEFAULT') {
            app.status(app.getStatusMessage)
        }
    },

    pubNubInit: function() {
        pubnub = PUBNUB({publish_key: 'demo',subscribe_key: 'demo'})
        app.subscribeToStatus()                      
    },

    closeBill: function() {
        window.localStorage.setItem('ui', 'DEFAULT');
        app.render();
    },

    subscribeToStatus: function() {
        console.log("Subscribing..");
        pubnub.subscribe({
            channel: "parkingapp-resp",
            message: function(message) {
                console.log("Current Status", message);
                $.mobile.loading("hide");
                Object.keys(message).forEach(function(lot){
                    $("div[data-lot="+lot+"]")
                    .removeClass("available unavailable occupied")
                    .addClass(parkingCodes[message[lot]])
                })
            },
            connect: function(){
                console.log("connected")
                app.status(app.getStatusMessage)
            }
        })
    },

    subscribeToSelf: function() {
      pubnub.subscribe({
        channel: window.localStorage.getItem('number'),
        message: function(message) {
            $.mobile.loading("hide");
            if (message.sessionType == 0) {
                window.localStorage.setItem('ui', 'START');
                window.localStorage.setItem('parking', JSON.stringify(message));    
            } else {
                window.localStorage.setItem('ui', 'END');
                window.localStorage.setItem('bill', JSON.stringify(message));    
            }
            
            app.render();
        },            
    })  
  },

  status: function(message) {
    console.log("Requesting current parking status...");
    pubnub.publish({
        channel: "parkingapp-req",
        message: message,
        callback: function(m) {
            console.log(m)
        },
        error: function(err) {
            console.log(err)
        }
    })

}

};

app.initialize();