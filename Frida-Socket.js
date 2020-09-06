Java.perform(function(){
	console.log("test start")
	var socket = Module.findExportByName("libc.so", "socket");
	console.log(socket)
	/**
	Interceptor.attach(ioctl, {
		onEnter: function(args) {
			var fd = args[0]; //int
			var cmd = args[1]; //int
			
			//binder_ioctl = 0xc0306201
			if(cmd != 0xc0306201) return;
			var data = args[2];

			var binder_write_read = parse_struct_binder_write_read(data);

			if(binder_write_read.write_size > 0){
				handle_write(binder_write_read.write_buffer, binder_write_read.write_size, binder_write_read.write_consumed);
			}
		}
	})
	**/
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


