var parkingCodes = {0: "available", 1: "occupied",2: "unavailable"}

var app = {
    initialize: function() {
        this.bindEvents();
        this.pubNubInit();
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
        $('.container').on('click', '.available', app.startParking)
        $('body').on('click', '.close-bill', app.closeBill)
    },
    onDeviceReady: function() {
        if(window.localStorage.getItem('ui')) {
            window.localStorage.setItem('ui', 'DEFAULT');
        }
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
            case 'PROGRESS': 
            app.infoDialog('#status-template', 'parking');
            break;
            case 'BILL': 
            app.infoDialog('#bill-template', 'bill');
            break;

            default: 
            app.default();
        }
    },

    register: function() {
        $.mobile.changePage("#register", {
            role: "dialog"
        });
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
        app.subscribeToSelf();
        app.status(app.getStatusMessage);
        app.showLoading();
    },

    infoDialog: function(template, key) {
        var data = JSON.parse(window.localStorage.getItem(key))
        $('.status-content').empty()
        $('.status-content').append(Mustache.render($(template).html(), data))
        $(":mobile-pagecontainer").pagecontainer("change", $('#parking-status'));
    },

    startParking: function(e) {
        var lot = $(e.target).data().lot
        window.localStorage.setItem('ui', 'PROGRESS');
        window.localStorage.setItem('parking', JSON.stringify({lot: lot, startTime:moment().format("h:mm A")}))
        app.status(
           {"requester":"APP","lotNumber":lot,"requestType":2,"requestValue":window.localStorage.getItem('number')}
           )
        app.render();        
    },

    showLoading: function() {
        $.mobile.loading("show", {
            text: "Fetching Current Status",
            textVisible: true,
            textonly: false
        });
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
                $.mobile.loading("hide");
                Object.keys(message).forEach(function(lot){
                    $("div[data-lot="+lot+"]")
                    .removeClass("available unavailable occupied")
                    .addClass(parkingCodes[message[lot]])
                })
            },
            connect: app.status(app.getStatusMessage)
        })
    },

    subscribeToSelf: function() {
      pubnub.subscribe({
        channel: window.localStorage.getItem('number'),
        message: function(message) {
            window.localStorage.setItem('ui', 'BILL');
            window.localStorage.setItem('bill', JSON.stringify(message));
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
        }
    })

}

};

app.initialize();