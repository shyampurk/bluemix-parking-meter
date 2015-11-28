var parkingCodes = {0: "available", 1: "occupied",2: "unavailable"}

var app = {
    initialize: function() {
        this.bindEvents();
        this.pubNubInit();
        $(window).on("navigate", function (event, data) {
          var direction = data.state.direction;
          event.preventDefault();      
      })
    },

    getStatusMessage: {
        "Requester": "APP",
        "Device ID": 0,
        "Request Type": 4,
        "Request Value": 0
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('.container').on('click', '.available', app.confirmParking)
        $('body').on('click', '.close-bill', app.closeBill)
    },
    onDeviceReady: function() {
        app.initRegister()
        app.receivedEvent('deviceready')
    },
    initRegister: function() {
        /*$('#vehicle-num-submit').on('click', function() {
            window.localStorage.setItem('number', $('#number').val())
            app.subscribeToSelf();
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "index.html" );
            app.status(app.getStatusMessage)
            app.showLoading()
        })
        if (!window.localStorage.getItem('number')) {
            $.mobile.changePage("#register", {
                role: "dialog"
            });
        } else {
            app.showLoading()
        }*/

        if(!window.localStorage.getItem('ui')) {
            window.localStorage.setItem('ui', 'REGISTER');
        }

        switch(window.localStorage.getItem('ui')) {
            case 'REGISTER': 
            app.register();
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
            window.localStorage.setItem('ui', 'DEFAULT')
            window.localStorage.setItem('number', $('#number').val())
            app.initRegister()
        })
    },

    default: function() {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", $('#default'));
        app.status(app.getStatusMessage);
        app.showLoading();
    },

    confirmParking: function(e) {
        var lot = $(e.target).data().lot
        $('.status-content').empty()
        $('.status-content').append(Mustache.render($('#status-template').html(), {
            lotNumber: lot,
            time: moment().format("h:mm A")
        })
        )
        $.mobile.changePage("#parking-status", {
            role: "dialog"
        });
        app.status(
         {"requester":"APP","lotNumber":lot,"requestType":2,"requestValue":window.localStorage.getItem('number')}
         )
        console.log("Testing")
    },

    showLoading: function() {
        $.mobile.loading("show", {
            text: "Fetching Current Status",
            textVisible: true,
            textonly: false
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    pubNubInit: function() {
        pubnub = PUBNUB({publish_key: 'demo',subscribe_key: 'demo'})
        app.subscribeToStatus() 
        app.subscribeToSelf()              
    },

    closeBill: function() {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "index.html" );
        app.showLoading();
        app.status(app.getStatusMessage);
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
            $.mobile.changePage("#parking-status", {
                role: "dialog"
            });
            app.renderBill(message)
        },            
    })  
  },

  renderBill: function(message) {
    $(".status-content").html(Mustache.render($('#bill-template').html(), message));      
    console.log("Session ended")
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

},

};

app.initialize();