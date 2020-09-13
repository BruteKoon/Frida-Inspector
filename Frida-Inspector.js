Java.perform(function(){
	console.log("test start")
	var ioctl = Module.findExportByName("libbinder.so", "ioctl");
	
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
	console.log("test finished")
});
var PYMODE = false;
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


var binder_driver_command_protocol = {
	"BC_TRANSACTION" : 0,
	"BC_REPLY" : 1,
	"BC_ACQUIRE_RESULT" : 2,
	"BC_FREE_BUFFER" : 3,
	"BC_INCREFS": 4,
	"BC_ACQUIRE": 5,
	"BC_RELEASE": 6,
	"BC_DECREFS": 7,
	"BC_INCREFS_DONE": 8,
	"BC_ACQUIRE_DONE": 9,
	"BC_ATTEMPT_ACQUIRE": 10,
	"BC_REGISTER_LOOPER": 11,
	"BC_ENTER_LOOPER": 12,
	"BC_EXIT_LOOPER": 13,
	"BC_REQUEST_DEATE_NOTIFICATION": 14,
	"BC_CLEAR_DEAT_NOTIFICATION": 15,
	"BC_DEAD_BINDER_DONE": 16,
};


function parse_struct_binder_write_read(binder_write_read){
	var offset = 8; //64bit 기준
	
	return {
		"write_size": binder_write_read.readU64(),
		"write_consumed": binder_write_read.add(offset).readU64(),
		"write_buffer": binder_write_read.add(offset*2).readPointer(),
		"read_size": binder_write_read.add(offset*3).readU64(),
		"read_consumed": binder_write_read.add(offset*4).readU64(),
		"read_buffer": binder_write_read.add(offset*5).readPointer()
	}

}

function parse_binder_transaction_data(binder_transaction_data){
	return{
		"target": {
			"handle": binder_transaction_data.readU32(),
			"ptr": binder_transaction_data.readPointer()
		},
		"cookie": binder_transaction_data.add(8).readPointer(),
		"code": binder_transaction_data.add(16).readU32(),
		"flags": binder_transaction_data.add(20).readU32(),
		"sender_pid": binder_transaction_data.add(24).readU32(),
		"sender_euid": binder_transaction_data.add(28).readU32(),
		"data_size": binder_transaction_data.add(32).readU32(),
		"offsets_size": binder_transaction_data.add(40).readU64(),
		"data": {
			"ptr": {
				"buffer": binder_transaction_data.add(48).readPointer(),
				"offsets": binder_transaction_data.add(56).readPointer()
			},
			"buf": binder_transaction_data.add(48).readByteArray(8)

		}

	}

}


function handle_write(write_buffer, write_size, write_consumed){
	var cmd = write_buffer.readU32() & 0xff;
	var ptr = write_buffer.add(write_consumed + 4);
	var end = write_buffer.add(write_size);

	switch(cmd) {
		case binder_driver_command_protocol.BC_TRANSACTION:
		case binder_driver_command_protocol.BC_REPLY:
			var binder_transaction_data = parse_binder_transaction_data(ptr);
			
			log("INFO", "\n" + hexdump(binder_transaction_data.data.ptr.buffer, {
                		length: binder_transaction_data.data_size,
                		ansi: true,}) + "\n"
			);
			break;
		default:
			log('ERR', 'NOOP Handler')
	}
}
