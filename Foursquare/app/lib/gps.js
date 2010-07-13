/******Location-related Functions*******/

function GPS(obj) {
	this.location=obj;
	this.going=false;
    this.ServiceRequest = new ServiceRequestWrapper();
}

GPS.prototype.go = function() {
	this.request = new Mojo.Service.Request("palm://com.palm.location", { //new Mojo.Service.Request
    	method: 'startTracking',
	    parameters: { subscribe: true },
    	onSuccess: function(response) {
	    	if (response.errorCode==0) {
	    		Mojo.Log.error("gps success");
	    		this.going=true;
	        	this.location.set(response);
	     	}
	    }.bind(this),
    	onFailure: function(response) {
	    	Mojo.Log.error("gps failure");
    		this.going=false;
      		this.location.oops();
    	}.bind(this)
  	});
};

GPS.prototype.stop = function() {
	this.going=false;
	logthis("got request to stop() GPS");
	if(this.request!=undefined){
		this.request.cancel();
		window.setTimeout(function(){delete this.request;}.bind(this),600);
	}
};

function Location(callback) {
	this.GPS=new GPS(this);
	this.callback=callback;
	Mojo.Log.error("created location");
}

Location.prototype.set = function(resp) {
	Mojo.Log.error("setting...");
	if(((this.lat!=resp.latitude || this.long!=resp.longitude) && this.radius>resp.horizAccuracy) || !this.radius){  //new coords
		Mojo.Log.error("new coords");
		this.lat=resp.latitude;
		this.long=resp.longitude;
		this.radius=resp.horizAccuracy;
		this.alt=resp.altitude;
		this.vacc=resp.vertAccuracy;
		this.error=resp.errorCode;
		this.when=new Date().getTime();
		
		if(this.callback) {
			Mojo.Log.error("doing callback");
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
	Mojo.Log.error("starting...");
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
	Mojo.Log.error("oops");
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