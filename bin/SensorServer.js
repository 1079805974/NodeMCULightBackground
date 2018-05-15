var net = require('net')

var HOST = '0.0.0.0'
var PORT = 18324
const sensors = []

sensors.get = (id) => {
    for (let sensor of sensors)
        if (sensor.id == id) {
            return sensor
            break;
        }
}

sensors.onInfo = (msg, sensor) => {
}
sensors.onResult = (msg, sensor) => {
}
sensors.onLogin = (msg, sensor) => {
}
sensors.onWarning = (msg, sensor) => {
}
sensors.onMessage = (msg, sensor) => {
}
sensors.onError = (msg, sensor) => {
}

function Sensor(msg, socket) {
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

Sensor.prototype.send = (msg) => {
    if (typeof msg == 'string')
        this.socket.write(msg)
    else if (typeof msg == 'object')
        this.socket.write(JSON.stringify(msg))
}

Sensor.prototype.cmd = (cmd, arg, callback) => {
    this.send({cmd: cmd, arg: arg})
    switch (cmd){
        case 'setInterval':
            this.interval = arg
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
        this.waitingEventQueue.push(null)
}

Sensor.prototype.addListener = (eventType, listener) => {
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
            sensors.onMessage(msg, socket.sensor)
        }
    });

    socket.on('close', function (data) {
        console.log('CLOSED: ' +
            socket.remoteAddress + ' ' + socket.remotePort)
    });

}).listen(PORT, HOST);

var dispatch = []

function activeListeners(msg, socket, eventType) {
    for (let listeners of socket.sensor.eventListeners[eventType])
        listeners(msg, socket)
}

dispatch['login'] = (msg, socket) => {
    let sensor = new Sensor(msg, socket)
    sensors.push(sensor)
    socket.sensor = sensor
    sensors.onLogin(msg, socket.sensor)
}

dispatch['info'] = (msg, socket) => {
    activeListeners(msg, socket, 'info')
    sensors.onInfo(msg, socket.sensor)
}

dispatch['result'] = (msg, socket) => {
    socket.sensor.resultHandler(msg, socket)
    sensors.onResult(msg, socket.sensor)
}

dispatch['warning'] = (msg, socket) => {
    activeListeners(msg, socket, 'warning')
    sensors.onWarning(msg, socket.sensor)
}
dispatch['error'] = (msg, socket) => {
    activeListeners(msg, socket, 'error')
    sensors.onError(msg, socket.sensor)
}

module.exports = sensors
