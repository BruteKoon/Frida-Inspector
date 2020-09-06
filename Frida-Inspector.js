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

			//var binder_write_Read = parse_struct_binder_write_read(data);

			console.log("ioctl called, fd = " +fd);
		}
	})
	console.log("test finished")
});
