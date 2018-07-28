var net = require('net')

var HOST = '0.0.0.0'
var PORT = 18323
const lamps = []

var noop = () => {
}

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
}

lamps.get = (id) => {
    for (let lamp of lamps)
        if (lamp.id == id) {
            return lamp
            break;
        }
}

lamps.onInfo = noop
lamps.onResult = noop
lamps.onLogin = noop
lamps.onWarning = noop
lamps.onMessage = noop
lamps.onError = noop

function Lamp(msg, socket) {
    for (var i in msg) {
        this[i] = msg[i]
    }
    this.socket = socket
    this.eventListeners = []
    this.waitingEventQueue = []
    this.eventListeners['info'] = []
    this.eventListeners['warning'] = []
    this.eventListeners['error'] = []
    this.resultHandler = (msg) => {
        let handler = this.waitingEventQueue.shift()
        if (handler)
            handler(msg)
    }
}

Lamp.prototype.print = function(){
    return {
        id:this.id,
        blue: this.blue,
        red: this.red,
        green: this.green,
        userLevel: this.userLevel,
        name: this.name,
        brightness: this.brightness,
        voltage: this.voltage,
        position: this.position,
        IP: this.IP
    }
}

Lamp.prototype.send = function(msg){
    if (typeof msg == 'string')
        this.socket.write(msg)
    else if (typeof msg == 'object')
        this.socket.write(JSON.stringify(msg))
}

Lamp.prototype.cmd = function(cmd, arg, callback) {
    this.send({cmd: cmd, arg: arg})
    switch (cmd){
        case 'setBrightness':
            this.brightness = arg
            break
        case 'setColor':
            this.red = arg.r
            this.green = arg.g
            this.blue = arg.b
            break
        case 'setName':
            this.name = arg
            break
        case 'setPosition':
            this.position = arg
            break
    }
    if (callback)
        this.waitingEventQueue.push(callback)
    else
        this.waitingEventQueue.push(noop)
}

Lamp.prototype.addListener = function(eventType, listener) {
    if (eventType == 'result') {
        console.log('permission denied!')
        return
    }
    this.eventListeners[eventType].push(listener)
}


net.createServer(function (socket) {
    console.log('CONNECTED: ' +
        socket.remoteAddress + ':' + socket.remotePort)

    socket.on('data', function (data) {
        let msg = JSON.parse(data)
        console.log(msg)
        if (msg.type) {
            dispatch[msg.type](msg, socket)
            lamps.onMessage(msg, socket.lamp)
        }
    });

    socket.on('close', function (data) {
        console.log('CLOSED: ' +
            socket.remoteAddress + ' ' + socket.remotePort)
    });

}).listen(PORT, HOST);

var dispatch = []

function activeListeners(msg, socket, eventType) {
    for (let listeners of socket.lamp.eventListeners[eventType])
        listeners(msg, socket)
}

dispatch['login'] = (msg, socket) => {
    let lamp = new Lamp(msg, socket)
    let repeatCheck = lamps.get(lamp.id)
    if(repeatCheck){
        repeatCheck.socket.destroy()
        lamps.remove(repeatCheck)
    }
    lamps.push(lamp)
    socket.lamp = lamp
    lamps.onLogin(msg, lamp)
    lamp.addListener('warning', function (msg) {
        lamp.voltage = msg.voltage
    })
}

dispatch['info'] = (msg, socket) => {
    activeListeners(msg, socket, 'info')
    lamps.onInfo(msg, socket.lamp)
}

dispatch['result'] = (msg, socket) => {
    socket.lamp.resultHandler(msg, socket)
    lamps.onResult(msg, socket.lamp)
}

dispatch['warning'] = (msg, socket) => {
    activeListeners(msg, socket, 'warning')
    lamps.onWarning(msg, socket.lamp)
}
dispatch['error'] = (msg, socket) => {
    activeListeners(msg, socket, 'error')
    lamps.onError(msg, socket.lamp)
}

module.exports = lamps
