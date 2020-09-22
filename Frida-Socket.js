Java.perform(function(){
	console.log("test start")

	var recv = Module.findExportByName("libc.so", "recv");

	var send = Module.findExportByName("libc.so", "send");
	var sendto = Module.findExportByName("libc.so", "sendto");
	var sendmsg = Module.findExportByName("libc.so", "sendmsg");
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
			log("test1", test1)
			log("test2", test2)
                }
        })


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


