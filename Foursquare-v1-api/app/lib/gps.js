/******Location-related Functions*******/

function GPS(obj) {
	this.location=obj;
	this.going=false;
    this.ServiceRequest = new ServiceRequestWrapper();
}

GPS.prototype.go = function() {
	//verizon sucks. getCurrentPosition tends to fail for some reason. We'll fall back to the old
	//startTracking method for verizon users. It's slower, but it works. @Palm: I know that's not the 
	//recommended way to get GPS, but until Verizon uncripples their devices, this is the best method
	//i've found. The ONLY complaint emails I get are from Verizon users.
	/*var carrier=Mojo.Environment.DeviceInfo.carrierName;
	if(carrier.indexOf("erizon")>-1){
		var meth="startTracking";
		var params={subscribe: true};
		logthis("starting gps (verizon)...");
	}else{*/
		var meth="getCurrentPosition";
		var params={accuracy: 1, maximumAge:0, responseTime: 1};
		logthis("starting gps (normal)...");
	//}
	
	this.request = new Mojo.Service.Request("palm://com.palm.location", { //new Mojo.Service.Request
    	/*method: 'startTracking',
	    parameters: { subscribe: true },*/
	    method: meth,
	    parameters: params,
    	onSuccess: function(response) {
    		logthis("got gps response...");
	    	if (response.errorCode==0) {
	    		logthis("gps success");
	    		this.going=true;
	        	this.location.set(response);
	     	}else if(response.errorCode>0){
		    	logthis("gps failure");
	    		this.going=false;
	      		this.location.oops(response.errorCode);	     	
	     	}
	    }.bind(this),
    	onFailure: function(response) {
	    	logthis("gps failure");
    		this.going=false;
      		this.location.oops(response.errorCode);
    	}.bind(this)
  	});
};

GPS.prototype.stop = function() {
	this.going=false;
	logthis("got request to stop() GPS");
	if(this.request!=undefined){
		logthis("canceling");
		this.request.cancel();
		window.setTimeout(function(){logthis("deleting");delete this.request;}.bind(this),600);
	}
};

function Location(callback,onfail) {
	this.callback=callback;
	this.onfail=onfail;
	this.GPS=new GPS(this);
	logthis("created location");
}

Location.prototype.set = function(resp) {
	logthis("setting...");
	if(((this.lat!=resp.latitude || this.long!=resp.longitude) && this.radius>resp.horizAccuracy) || !this.radius){  //new coords
		logthis("new coords");
		this.lat=resp.latitude;
		this.long=resp.longitude;
		this.radius=resp.horizAccuracy;
		this.alt=resp.altitude;
		this.vacc=resp.vertAccuracy;
		this.error=resp.errorCode;
		this.when=new Date().getTime();
		
		if(this.callback) {
			logthis("doing callback");
			this.callback({latitude:this.lat,
							longitude:this.long,
							horizAccuracy: this.radius,
							altitude: this.alt,
							vertAccuracy: this.vacc,
							errorCode: this.error
							});
		}
	}
};

Location.prototype.start = function() {
	if(!this.going){
	logthis("starting...");
		this.GPS.go();
	}
};

Location.prototype.restart = function() {
	this.GPS.stop();
	this.lat=undefined;
	this.long=undefined;
	this.radius=undefined;
	this.when=undefined;
	this.GPS.go();

};

Location.prototype.stop = function() {
//	if(this.going){
		this.GPS.stop();
//	}
};

Location.prototype.oops = function(e) {
	logthis("oops");
	if(this.onfail){logthis("onfail");this.onfail(e);}
};

Location.prototype.get = function() {
	return {latitude:this.lat,
			longitude:this.long,
			horizAccuracy: this.radius,
			altitude: this.alt,
			vertAccuracy: this.vacc,
			errorCode: this.error
			};
};

Location.prototype.timePassed = function() {
	var now=(new Date().getTime());
	var diff=(now-this.when)/1000; //in seconds
	return (diff>=10);
};