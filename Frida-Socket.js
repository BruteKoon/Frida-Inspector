
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
			var destaddr = args[4];
			var destaddr_len = args[5];

                        console.log("*************************** sendto hook **************************")
                        log("fd", fd)
                        log("buf", buf)
			dump(buf.readPointer(),512) // access violation error ==> Specific rom ERror / That's too bad
                        log("len", len)
                        log("flags", flags)
			log("destaddr", destaddr)
			//log("test2", test2) ==> 0
                }
        })
**/
/**	
        Interceptor.attach(sendmsg, {
                onEnter: function(args) {
                        var socket = args[0]; //int
                        var msg = args[1]; //int
                        var flags = args[2];

                        console.log("*************************** sendmsg hook **************************")
			var addr = Socket.peerAddress(socket.toInt32())
                        log("socket", socket)
			log("socket type", Socket.type(socket.toInt32()))
                        log("msg", msg) // msghdr struct
			log("msg name", msg.readPointer())
			log("msg len", msg.add(8).readU64())
			log("ioven base", msg.add(8*2).readPointer())
			log("ioven base addr", msg.add(8*2).readPointer().readU64())

			log("INFO", "\n" + hexdump(msg.add(8*2).readPointer().readPointer(), {
                		length: 2048,
                		ansi: true,
            		}) + "\n");
			log("iovenc len", msg.add(8*3).readU64())
			log("msg controll", msg.add(8*4).readPointer())
			log("msg len", msg.add(8*5).readU64())

                        log("flags", flags)
                }
        })
	
**/
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


function dump(addr, size){
                        log("DUMP", "\n" + hexdump(addr, {
                                length: size,
                                ansi: true,
                        }) + "\n");

}


function parse_struct_msghdr(msghdr){

        var offset = 8; //64bit 기준

	/**
        return {
                "write_size": binder_write_read.readU64(),
                "write_consumed": binder_write_read.add(offset).readU64(),
                "write_buffer": binder_write_read.add(offset*2).readPointer(),
                "read_size": binder_write_read.add(offset*3).readU64(),
                "read_consumed": binder_write_read.add(offset*4).readU64(),
                "read_buffer": binder_write_read.add(offset*5).readPointer()
        }
	**/


}
