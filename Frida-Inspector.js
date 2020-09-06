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


}


function handle_write(write_buffer, write_size, write_consumed){

}
