function NearbyVenuesMapAssistant(lat,long,v,u,p,uid,ps,q) {
	   this.lat=lat;
	   this.long=long;
	   this.venues=v;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
	   this.query=q;
	   //this.what=what;
	   
	   _globals.curmap=this;
	   
	   this.infowindows=[];
}


NearbyVenuesMapAssistant.prototype.setup = function() {
    var appController = Mojo.Controller.getAppController();
  	var cardStageController = appController.getStageController("mainStage");
	var doc=cardStageController.document;

    // Code from Google Sample
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);

	
	this.controller.setupWidget("mapSpinner",
         this.spinnerAttributes = {
             spinnerSize: 'large'
         },
         this.spinnerModel = {
             spinning: true 
    });
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
       
    Mojo.Event.listen(this.controller.get('venue-nearby'),"mousedown", function(){this.controller.get('venue-nearby').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-nearby'),"mouseup", function(){this.controller.get('venue-nearby').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-nearby'),Mojo.Event.tap, function(){this.controller.stageController.popScene("nearby-venues-map");}.bind(this));

   
	Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
    Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
    Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
	Mojo.Event.listen(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenu.bind(this));

	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);

	this.lastScale=0;
	this.inGesture=false;
	this.zoom=15;
	this.origZoom=15;
}

NearbyVenuesMapAssistant.prototype.handleGestureStart = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 1;
		this.cntr=this.map.getCenter();

}
NearbyVenuesMapAssistant.prototype.handleGestureChange = function(event) {
	    s = event.scale;
        if (s>2) s=2;
        if (s<0.5) s=0.5;
        s2 = 2*Math.log(s)/Math.log(2);
        this.zoom = this.origZoom + s2;
	    if (this.zoom > 18) this.zoom = 18;
        if (this.zoom < 7) this.zoom = 7;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);

}
NearbyVenuesMapAssistant.prototype.handleGestureEnd = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 0;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);
}


NearbyVenuesMapAssistant.prototype.showVenueInfo = function(event) {
	var v=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},this.venues[v],this.username,this.password,this.uid,false,this,true);
}






NearbyVenuesMapAssistant.prototype.initMap = function() {
  var myOptions = {
    zoom: 15,
    center: new google.maps.LatLng(_globals.lat, _globals.long),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  this.map = new google.maps.Map(this.controller.get("map_canvas"),
                                myOptions);

  this.setMarkers(this.map);
}



NearbyVenuesMapAssistant.prototype.setMarkers = function (map) {
	var cimage = new google.maps.MarkerImage('http://google-maps-icons.googlecode.com/files/leftthendown.png',
    new google.maps.Size(32, 37),
    new google.maps.Point(0,0),
    new google.maps.Point(0, 27));

	var shadow = new google.maps.MarkerImage('images/shadow.png',
    new google.maps.Size(51, 37),
    new google.maps.Point(0,0),
    new google.maps.Point(0, 37));
 
	var cmarker = new google.maps.Marker({
  		position: new google.maps.LatLng(_globals.lat,_globals.long),
	  	map: map,
	  	icon: cimage
	});
  
	for(var v=0;v<this.venues.length;v++) {
		var point = new google.maps.LatLng(this.venues[v].geolat,this.venues[v].geolong);
		if(this.venues[v].primarycategory==undefined){
			this.venues[v].primarycategory={};
			this.venues[v].primarycategory.iconurl="images/no-cat.png";
		}
		//'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|56739e'
		var image = new google.maps.MarkerImage(this.venues[v].primarycategory.iconurl,
	    new google.maps.Size(32, 32),
    	new google.maps.Point(0,0),
	    new google.maps.Point(0, 37));
			
			
		var marker=new google.maps.Marker({
			position: point,
			map: map,
			icon: image,
			shadow: shadow,
			venue: this.venues[v],
			vindex: v,
			username: this.username,
			password: this.password,
			uid: this.uid
		});
	
		this.attachBubble(marker, v);
	}



	Mojo.Event.listen(this.controller.get("map_canvas"),Mojo.Event.tap, function(){
		for(var i=0; i<this.venues.length;i++){
			this.infowindows[i].close();		
		}
	}.bindAsEventListener(this));
			    
	this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
	this.controller.get("mapSpinner").hide();

}


NearbyVenuesMapAssistant.prototype.attachBubble = function(marker,i) {


	this.infowindows[i] = new google.maps.InfoWindow(
      { content: '<div id="iw-'+this.venues[i].id+'" style="height:260px;font-size:16px;"  data="'+i+'"><b>'+this.venues[i].name+"</b><br/>" +
           					this.venues[i].address+"<br/>"/*+
           					'<a href="javascript:;" id="venue-'+this.venues[i].id+'" class="venueLink" data="'+i+'">Venue Info</a></div><br/>'*/
      });
  
	google.maps.event.addListener(marker, 'click', function() {
		
    	this.infowindows[i].open(this.map,marker);
	}.bind(this));
	google.maps.event.addListener(this.infowindows[i],"domready",function(){	
		Mojo.Event.listen(this.controller.get('iw-'+this.venues[i].id),Mojo.Event.tap, this.showVenueInfo.bind(this));
	}.bind(this));

}








NearbyVenuesMapAssistant.prototype.activate = function(event) {
}


NearbyVenuesMapAssistant.prototype.popupChoose = function(event) {
	switch(event){
	            case "venue-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,true,"",this.what);
                	break;
				case "friend-map":
					this.oldCaption="Map";
					break;
				case "nearby-venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,false,this.query,"", this.what);
					break;
				case "venue-add":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},thisauth);
					break;
				case "friends-feed":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"feed");
					break;
	}
}
NearbyVenuesMapAssistant.prototype.showMenu = function(event){
					this.controller.popupSubmenu({
			             onChoose:this.popupChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [{secondaryIconPath: 'images/radar-dark.png',label: 'Nearby', command: 'nearby-venues'},
				           {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'venue-map'},
            	           {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'venue-search'},
                	       {secondaryIconPath: 'images/plus.png',label: 'Add Venue', command: 'venue-add'}]
		             });
}



NearbyVenuesMapAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,true);
                	break;
				case "nearby-venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,false,this.query);
					break;
				case "venue-map":
					break;
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,uid);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
            }
        }
    }


NearbyVenuesMapAssistant.prototype.deactivate = function(event) {
}

NearbyVenuesMapAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('venue-nearby'),"mousedown", function(){this.controller.get('venue-nearby').addClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('venue-nearby'),"mouseup", function(){this.controller.get('venue-nearby').removeClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('venue-nearby'),Mojo.Event.tap, function(){this.controller.stageController.popScene("nearby-venues-map");}.bind(this));

   
	Mojo.Event.stopListening(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
    Mojo.Event.stopListening(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
    Mojo.Event.stopListening(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
	Mojo.Event.stopListening(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenu.bind(this));
}






