const WebSocket = require('ws');
const lamps = require('./LampServer')
const sensors = require('./SensorServer')
const server = require('./www')
const wss = new WebSocket.Server({server:server, path:'/socket'});

lamps.onMessage = function(msg, lamp){
    msg.id = lamp.id
    msg.from = 'lamp'
    wss.broadcast(JSON.stringify(msg))
}

sensors.onInfo = function (msg,sensor) {
    msg.id = sensor.id
    msg.from = 'sensor'
    console.log('broadcast')
    wss.broadcast(JSON.stringify(msg))
}

wss.broadcast = data =>
    wss.clients.forEach(client =>{
        if (client.readyState === WebSocket.OPEN)
            client.send(data)
    }
)


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        wss.broadcast(message)
    });
});

