Java.perform(function(){
	console.log("test start")
	var socket = Module.findExportByName("libc.so", "socket");
	
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
	console.log("test finished")
});

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


