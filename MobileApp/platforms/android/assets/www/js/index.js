// Codes represented as array i.e. codeColor[0] corresponds to "available"
var codeColor = ["available", "occupied", "unavailable"]

var app = {
    initialize: function() {
        this.bindEvents();
        this.pubNubInit();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('.container').on('click', '.available', app.confirmParking)
    },
    onDeviceReady: function() {
        app.initRegister()
        app.receivedEvent('deviceready')
    },
    initRegister: function() {
        $('#vehicle-num-submit').on('click', function() {
            window.localStorage.setItem('number', $('#number').val())
            app.subscribeToSelf()
            $(".ui-dialog").dialog("close")
            app.showLoading()
        })
        if (!window.localStorage.getItem('number')) {
            $.mobile.changePage("#register", {
                role: "dialog"
            });
        } else {
            app.showLoading()
        }
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

    subscribeToStatus: function() {
        console.log("Subscribing..");
        pubnub.subscribe({
            channel: "parkingapp-resp",
            message: function(message) {
                $.mobile.loading("hide");
                var currentStatus = Object.keys(message).reverse().map(function(key) {
                    return codeColor[message[key]]
                })
                $('.parking-spot').each(function(i, elem) {
                    $(elem).removeClass("available unavailable occupied").addClass(currentStatus[i])
                })

            },
            connect: app.status({
                "Requester": "APP",
                "Device ID": 0,
                "Request Type": 4,
                "Request Value": 0
            })
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