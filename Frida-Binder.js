Java.perform(function(){
	console.log("test start")

	var binder_proxy = Java.use("android.os.BinderProxy")
	var binder_stub = Java.use("android.os.Binder")

	var ioctl = Module.findExportByName("libbinder.so", "ioctl");

	binder_proxy.transact.overload('int','android.os.Parcel','android.os.Parcel','int').implementation = function(code, data, reply, flag){
		console.log("binder Proxy hooking")
		
		 // 20
		 // android.os.Parcel@74a795e
		 // android.os.Parcel@864813f
		 // 1
		 

		console.log(code)
		console.log(data)
		console.log(reply)
		console.log(flag)
		return this.transact(code,data,reply,flag)

	}
	

	/**
        binder_stub.onTransact.overload('int','android.os.Parcel','android.os.Parcel','int').implementation = function(code, data, reply, flag){
                console.log("binder Stub  hooking")

                 // 20
                 // android.os.Parcel@74a795e
                 // android.os.Parcel@864813f
                 // 1
                 
                console.log(code)
                console.log(data)
                console.log(reply)
                console.log(flag)
                return this.Ontransact(code,data,reply,flag)

        }
	**/
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
			

			if(binder_write_read.read_size > 0){
				handle_read(binder_write_read.read_buffer, binder_write_read.read_size, binder_write_read.read_consumed);
			}
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

var binder_driver_return_protocol ={
	"BR_ERROR" : 0,
	"BR_OK" : 1,
	"BR_TRANSACTION": 2,
	"BR_REPLY" : 3,
	"BR_ACQUIRE_RESULT" : 4,
	"BR_DEAD_REPLY" : 5,
	"BR_TRANSACTION_COMPLETE" : 6,
	"BR_INCREFS" : 7,
	"BR_ACQUIRE" : 8,
	"BR_RELEASE" : 9,
	"BR_DECREFS" : 10,
	"BR_ATTEMPT_ACQUIRE" :11,
	"BR_NOOP" : 12,
	"BR_SPAWN_LOOPER" : 13,
	"BR_FINISHED" : 14,
	"BR_DEAD_BINDER" : 15,
	"BR_CLEAR_DEATH_NOTIFICATION_DONE" : 16,
	"BR_FAILED_REPLY" : 17,
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
			log('ERR', 'Defualt Handler')
	}
}


function handle_read(read_buffer, read_size, read_consumed){
        var cmd = read_buffer.readU32() & 0xff;
        var ptr = read_buffer.add(read_consumed + 4);
        var end = read_buffer.add(read_size);
	
        switch(cmd) {
                case binder_driver_return_protocol.BR_TRANSACTION:
                case binder_driver_return_protocol.BR_REPLY:
                        var binder_transaction_data = parse_binder_transaction_data(ptr);

                        log("INFO", "\n" + hexdump(binder_transaction_data.data.ptr.buffer, {
                                length: binder_transaction_data.data_size,
                                ansi: true,}) + "\n"
                        );
                        break;
		case binder_driver_return_protocol.BR_NOOP:
			log('INFO', 'NOOP')
			break;
                default:
                        log('ERR', 'Default Handler')
        }
}

