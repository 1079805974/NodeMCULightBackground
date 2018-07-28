var webSocketServer = require('socket.io')(8080);
var webs = {
    clients: [],
    callback: [],
    push(val){
        this.clients.push(val)
    },
    broadcast(message){
        this.clients.forEach(client => {
            client.send(message)
        })
    },
    addMessageListener(func){
        this.callback.push(func)
        console.log(this.callback)
    },
    emitOnMessage(message){
        this.callback.forEach(
            ele => ele(message)
        )
    }
}

webSocketServer.on('connection', function (socket) {
    webs.push(socket)
    console.log('connect!')
    socket.on('message', function incoming(message) {
        console.log(new Date().toLocaleString() + ' 网页传来消息: ' + message)
        //触发来消息事件, 不用看懂...
        //只要知道在LampServer中怎么用就行了
        webs.emitOnMessage(message)
        //回传消息
        socket.send('收到你的消息啦!!!')
    });
    socket.on('disconnect', function () { });
});

console.log('服务器启动成功')

module.exports = webs