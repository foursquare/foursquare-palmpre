function FriendsMapAssistant(lat,long,f,u,p,uid,ps,what) {
	   this.lat=lat;
	   this.long=long;
	   this.friends=f;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
	   this.what=what;
	   
	   _globals.curmap=this;

}

FriendsMapAssistant.prototype.setup = function() {
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
       _globals.ammodel
    );

   
    Mojo.Event.listen(this.controller.get('friend-feed'),"mousedown", function(){this.controller.get('friend-feed').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-feed'),"mouseup", function(){this.controller.get('friend-feed').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-feed'),Mojo.Event.tap, function(){this.controller.stageController.popScene("friends-map");}.bind(this));


    Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
    Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
    Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
	//Mojo.Event.listen(this.controller.get('fmenu'),Mojo.Event.tap, this.showMenu.bind(this));


	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);
	this.lastScale=0;
	this.inGesture=false;
	this.zoom=15;
	this.origZoom=15;


}
FriendsMapAssistant.prototype.handleGestureStart = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 1;
		this.cntr=this.map.getCenter();

}
FriendsMapAssistant.prototype.handleGestureChange = function(event) {
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
FriendsMapAssistant.prototype.handleGestureEnd = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 0;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);

}

FriendsMapAssistant.prototype.setMarkers = function(map) {
	var cimage = new google.maps.MarkerImage('http://google-maps-icons.googlecode.com/files/leftthendown.png',
    new google.maps.Size(32, 37),
    new google.maps.Point(0,0),
    new google.maps.Point(0, 27));

	var friendsfaces=[];

	var cmarker = new google.maps.Marker({
  		position: new google.maps.LatLng(_globals.lat,_globals.long),
	  	map: map,
	  	icon: cimage
	});
  
    var shadow = new google.maps.MarkerImage('images/map-marker-bg.png',
    new google.maps.Size(58, 65),
    new google.maps.Point(0,0),
    new google.maps.Point(22, 45));

	for(var v=0;v<this.friends.length;v++) {
		if(this.friends[v].geolat!=0 && this.friends[v].geolat!=undefined) { //don't show friends that haven't done anything
  			friendsfaces[v] = new google.maps.MarkerImage(this.friends[v].photo,
      		new google.maps.Size(43, 43),
      		new google.maps.Point(0,0),
		    new google.maps.Point(17, 40));
			
			var point = new google.maps.LatLng(this.friends[v].geolat,this.friends[v].geolong);
			
			var marker=new google.maps.Marker({
				position: point,
				map: map,
				icon: friendsfaces[v],
				shadow: shadow,
				friend: this.friends[v],
				vindex: v,
				username: this.username,
				password: this.password,
				uid: this.uid
			});
			this.attachBubble(marker, v);

		}
	}

	this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
	this.controller.get("mapSpinner").hide();
}


FriendsMapAssistant.prototype.attachBubble = function(marker,i) {
	var infowindow = new google.maps.InfoWindow(
    	{ content: '<div id="iw-'+this.friends[i].id+'"><b>'+this.friends[i].firstname+"</b><br/>"+
           			this.friends[i].checkin+"<br/></div>"+
					'<a href="javascript:;" id="friend-'+this.friends[i].id+'" class="friendLink" data="'+i+'">Friend Info</a>'
		}
	);
  
	google.maps.event.addListener(marker, 'click', 
  		function() {
    		infowindow.open(this.map,marker);
		}
	);
	google.maps.event.addListener(infowindow,"domready",
		function(){	
			Mojo.Event.listen(this.controller.get('iw-'+this.venuesfriends.id),Mojo.Event.tap, this.showFriendInfo.bind(this));
		}.bind(this)
	);
}

FriendsMapAssistant.prototype.initMap = function(event) {
	var myOptions = {
    	zoom: 15,
	    center: new google.maps.LatLng(_globals.lat, _globals.long),
    	mapTypeId: google.maps.MapTypeId.ROADMAP
	  }
	this.map = new google.maps.Map(this.controller.get("map_canvas"), myOptions);

	this.setMarkers(this.map);
}

var auth;
function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}


FriendsMapAssistant.prototype.showFriendInfo = function(event) {
	var v=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade, disableSceneScroller: false},make_base_auth(this.username,this.password),this.friends[v].id,null,true);
}


FriendsMapAssistant.prototype.activate = function(event) {
	if (this.map === undefined) {
		// Kick off google maps initialization
		if(!Maps.isLoaded()) {
			this.spinnerModel.spinning = true;
		    this.controller.modelChanged(this.spinnerModel);

		    this.controller.get("statusinfo").update("Loading Google Maps...");
					
			Maps.loadedCallback(this.initMap.bind(this));
			initLoader();
		}else{
			this.initMap();
		}
	}
}

FriendsMapAssistant.prototype.popupChoose = function(event) {
	switch(event){
		case "friend-search":
        	var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "friends-list",
				transition: Mojo.Transition.crossFade},
				thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,true,this.what);
           	break;
		case "friend-map":
			this.oldCaption="Map";
			break;
		case "friends-list":
           	var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "friends-list",
				transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"list");
			break;
		case "friends-pending":
           	var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "friends-list",
				transition: Mojo.Transition.crossFade},
				thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"pending");
			break;
		case "friends-feed":
          	var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},
				thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"feed");
			break;
	}
}

FriendsMapAssistant.prototype.showMenu = function(event){
	this.controller.popupSubmenu({
		onChoose:this.popupChoose,
        placeNear:this.controller.get('menuhere'),
		items: [{secondaryIconPath: 'images/feed.png',label: 'Feed', command: 'friends-feed'},
		       {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'friend-map'},
               {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'friend-search'},
               {secondaryIconPath: 'images/friends-black.png',label: 'Friends List', command: 'friends-list'},
           	   {secondaryIconPath: 'images/clock.png',label: 'Pending Requests', command: 'friends-pending'}]
	});
}



FriendsMapAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "friends-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},
						thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,true);
                	break;
				case "friends-list":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
				case "friend-map":
					break;
				case "do-Friends":
					break;
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
            }
        }else if(event.type===Mojo.Event.back) {
			event.preventDefault();
			var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},
				thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);

		}
}


FriendsMapAssistant.prototype.deactivate = function(event) {
}

FriendsMapAssistant.prototype.cleanup = function(event) {
}
