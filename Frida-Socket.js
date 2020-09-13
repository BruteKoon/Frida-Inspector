Java.perform(function(){
	console.log("test start")
	// var socket = Module.findExportByName("libc.so", "socket");
	var recv = Module.findExportByName("libc.so", "recv");
	/**
	Interceptor.attach(socket, {
		onEnter: function(args) {
			var domain = args[0]; //int
			var type = args[1]; //int
			var protocol = args[2];

			log("domain", domain)
			log("type", type)
			log("protocol", protocol)
		}
	})
	**/

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


