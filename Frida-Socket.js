
Java.perform(function(){
	console.log("test start")

	// 후킹 리스트
	var recv = Module.findExportByName("libc.so", "recv");

	// send 호출시 => sendto로 넘어가는 것 확인(send 후킹할 필요 없음)
	//var send = Module.findExportByName("libc.so", "send");
	var sendto = Module.findExportByName("libc.so", "sendto");
	var sendmsg = Module.findExportByName("libc.so", "sendmsg");

	//send mmsg는 거의 호출될일 없음
	var sendmmsg = Module.findExportByName("libc.so", "sendmmsg");

	

        Interceptor.attach(recv, {
                onEnter: function(args) {
                        var fd = args[0]; //int
                        var buf = args[1]; //int
                        var len = args[2];
			var flags = args[3]; 

                        log("fd", fd)
                        log("buf", buf)
                        log("len", len)
			log("flags", flags)
                }
        })

	/**
	Interceptor.attach(send, {
                onEnter: function(args) {
                        var fd = args[0]; //int
                        var buf = args[1]; //int
                        var len = args[2];
                        var flags = args[3];

			console.log("*************************** send hook **************************")
                        log("fd", fd)
                        log("buf", buf)
                        log("len", len)
                        log("flags", flags)
                }
        })
	**/

	/**
        Interceptor.attach(sendto, {
                onEnter: function(args) {
                        var fd = args[0]; //int
                        var buf = args[1]; //int
                        var len = args[2];
                        var flags = args[3];
			var test1 = args[4];
			var test2 = args[5];

                        console.log("*************************** sendto hook **************************")
                        log("fd", fd)
                        log("buf", buf)
                        log("len", len)
                        log("flags", flags)
			//log("test1", test1) ==> 0
			//log("test2", test2) ==> 0
                }
        })
**/
	
        Interceptor.attach(sendmsg, {
                onEnter: function(args) {
                        var socket = args[0]; //int
                        var msg = args[1]; //int
                        var flags = args[2];

                        console.log("*************************** sendmsg hook **************************")
			var addr = Socket.peerAddress(socket.toInt32())
                        log("socket", socket)
			log("socket type", Socket.type(socket.toInt32()))
                        log("msg", msg)
			log("INFO", "\n" + hexdump(msg, {
                                length: 400,
                                ansi: true,}) + "\n"
                        );

                        log("flags", flags)
                }
        })
	

	/**
        Interceptor.attach(sendmmsg, {
                onEnter: function(args) {
                        var socket = args[0]; //int
                        var msg = args[1]; //int
			var vlen = args[2]
                        var flags = args[3];

                        console.log("*************************** sendmsg hook **************************")
                        var addr = Socket.peerAddress(socket.toInt32())
                        log("socket", socket)
                        log("socket type", Socket.type(socket.toInt32()))
                        log("msg", msg)
                        log("flags", flags)
                }
        })
	**/

	console.log("test finished")
});

const PYMODE = false;
var CACHE_LOG ="";

function log(type, message) {
    if(message.toString() == CACHE_LOG.toString()) return; // Let's hide duplicate logs...

    CACHE_LOG = message;
    if(PYMODE) {
        send({'type':type, 'message': message});
    } else {
        console.log('[' + type + '] ' + message);
    }
}



function parse_struct_msghdr(){


}
