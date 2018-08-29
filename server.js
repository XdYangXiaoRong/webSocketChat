//引入http模块
// var http = require('http'),
//     //创建一个服务器
//     server = http.createServer(function(req, res) {
//         res.writeHead(200, {
//             'Content-Type': 'text/html'
//         });
//         res.write('<h1>hello world!</h1>');//返回html标签
//         res.end();
//     });
// //监听8090端口
// server.listen(8090);
// console.log('server started');

//使用express（使用express模块返回静态页面）
var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app);
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/www')); //指定静态HTML文件的位置
server.listen(8090);
console.log('listening:http://127.0.0.1:8090')
var users = [];//保存所有在线用户的昵称

//socket部分
io.on('connection',function(socket){
	console.log("connected!")
	socket.on('login',function(nickname){
		if(users.indexOf(nickname)>-1){
			socket.emit('nickExisted')//昵称已经存在
		}else{
			socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system',nickname,users.length,'login');//向所有连接到服务器的客户端发送当前登陆用户的昵称 
		}
		console.log("users",users)
	})
	//断开连接的事件
	socket.on('disconnect', function() {
		console.log("disconnect！")
	    //将断开连接的用户从users中删除
	    console.log("socket",socket)
	    users.splice(socket.userIndex, 1);
	    //通知除自己以外的所有人
	    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	})
	//接收新消息
	socket.on('postMsg',function(msg,color){
		console.log(33333,msg,color)
		//将消息发送给除自己以外的所有用户
		console.log(2222,socket.nickname)
		socket.broadcast.emit('newMsg',socket.nickname,msg,color)
	})
	//接收用户发来的新图片
	socket.on('img',function(imgData){
		//通过一个newImg时间分发到出自己以外的每个用户
		socket.broadcast.emit('newImg',socket.nickname,imgData)
	})
})