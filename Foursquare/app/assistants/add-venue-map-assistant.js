function AddVenueMapAssistant(lat,long,av) {
	this.lat=lat;
	this.long=long;
	this.addVenueScene=av;
	  	   _globals.curmap=this;

	logthis("lat="+this.lat+", long="+this.long);
}

AddVenueMapAssistant.prototype.setup = function() {
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
};
AddVenueMapAssistant.prototype.initMap = function(event) {
	var myOptions = {
    	zoom: 15,
	    center: new google.maps.LatLng(this.lat, this.long),
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
    	draggable: true,
    	mapTypeControl: false,
    	navigationControl: false
	  }
	this.map = new google.maps.Map(this.controller.get("map_canvas"), myOptions);

	this.setMarkers(this.map);
}
AddVenueMapAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();
};

AddVenueMapAssistant.prototype.setMarkers = function(map){
	this.cmarker = new google.maps.Marker({
  		position: new google.maps.LatLng(this.lat,this.long),
	  	map: map,
	  	draggable: true
	});
	google.maps.event.addListener(this.map, 'click', 
  		function(e) {
			logthis("map clicked yes");
			var pos=e.latLng;
						
			this.cmarker.setPosition(pos);
			logthis("clicked coords: lat="+pos.lat()+", long="+pos.lng());
			
			this.lat=pos.lat();
			this.long=pos.lng();			

			this.map.panTo(pos);
		}.bind(this)
	);


	//this.controller.stageController.activeScene().disableSceneScroller = true;
};

AddVenueMapAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

AddVenueMapAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AddVenueMapAssistant.prototype.cleanup = function(event) {
	logthis("cleaning up");
	logthis("lat="+this.lat+", long="+this.long);
	this.addVenueScene.lat=this.lat;
	this.addVenueScene.long=this.long;
	
	this.addVenueScene.controller.get("map").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x150&sensor=false&markers=color:blue|"+this.lat+","+this.long+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";
	logthis("finished cleaning up");
};
