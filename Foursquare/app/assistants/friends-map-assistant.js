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
    NavMenu.setup(this,{buttons:'navOnly'});
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
	Mojo.Event.listen(this.controller.get("map_info"),Mojo.Event.tap, this.showFriendInfo.bind(this));


	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);
	this.lastScale=0;
	this.inGesture=false;
	this.zoom=15;
	this.origZoom=15;


}
FriendsMapAssistant.prototype.handleGestureStart = function(e) {
/*        this.origZoom = this.zoom;
        this.inGesture = 1;
		this.cntr=this.map.getCenter();*/
	this.map.setOptions({draggable:false});
	this.previousScale=e.scale;

}
FriendsMapAssistant.prototype.handleGestureChange = function(e) {
/*	    s = event.scale;
        if (s>2) s=2;
        if (s<0.5) s=0.5;
        s2 = 2*Math.log(s)/Math.log(2);
        this.zoom = this.origZoom + s2;
	    if (this.zoom > 18) this.zoom = 18;
        if (this.zoom < 7) this.zoom = 7;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);*/
	e.stop();
	var d=this.previousScale-e.scale;
	if(Math.abs(d)>0.25){
		var z=this.map.getZoom()+(d>0?-1:+1);
		this.map.setZoom(z);
		this.previousScale=e.scale;
	}

}
FriendsMapAssistant.prototype.handleGestureEnd = function(e) {
/*        this.origZoom = this.zoom;
        this.inGesture = 0;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);*/
	e.stop();
	this.map.setOptions({draggable:true});     

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
    	/*{ content: '<div id="iw-'+this.friends[i].id+'" style="min-height: 200px !important;"><b>'+this.friends[i].firstname+"</b><br/>"+
           			this.friends[i].checkin+"<br/></div>"+
					'<a href="javascript:;" id="friend-'+this.friends[i].id+'" class="friendLink" data="'+i+'">Friend Info</a>'
		}*/
		{content: 'khjfhjkdshgfkjhg dsfgh fjksd gfds ghjfdsjkgf gfsdhgkjlsdfhg sdfkg fjkg dfsjk ghkjsdfgh fkjsg dskljhgjksfdg sfg fghkjfdhgkjsdf gkljfdhs'
		
		}
	);
  
	google.maps.event.addListener(marker, 'click', 
  		function(e) {
    		//infowindow.open(this.map,marker);
    		//logthis(this.getMarkerPixels(marker));
			 //var infoBox = new InfoBubble(this.controller.document,this.getMarkerPixels(marker),{content:'here\'s some content!'});
			 var html='<div class="mi-left"><img src="'+this.friends[i].photo+'" width="48" height="48"></div>';
			 html+='<div class="mi-right"><b>'+this.friends[i].firstname+'</b><br/>@ '+this.friends[i].checkin+'</div>';
			 
			 this.controller.get("map_info").innerHTML=html;
			 this.controller.get("map_info").writeAttribute("data",i);
			 this.controller.get("map_info").style.opacity=1;
			 this.controller.get("map_info").show();
			 window.clearTimeout(this.infoTimer);
			 this.infoTimer=window.setTimeout(function(){this.fadeInfo();}.bind(this),5000);
		}.bind(this)
	);
	google.maps.event.addListener(infowindow,"domready",
		function(){	
			//Mojo.Event.listen(this.controller.get('iw-'+this.friends[i].id),Mojo.Event.tap, this.showFriendInfo.bind(this));
		}.bind(this)
	);
}

FriendsMapAssistant.prototype.fadeInfo = function(){
	Mojo.Animation.animateStyle(this.controller.get("map_info"),'opacity','bezier',{from:100,
																	to:0,
																	duration:1,
																	curve:Mojo.Animation.easeIn,
																	styleSetter:function(value){
																		this.controller.get("map_info").style.opacity=value/100;
																	
																	}.bind(this),
																	onComplete:function(el){
																		el.hide();
																	}
																	
																	});
};

FriendsMapAssistant.prototype.getMarkerPixels = function(marker) {
	var map=marker.getMap();
	var scale = Math.pow(2, map.getZoom());
	var nw = new google.maps.LatLng(
	    map.getBounds().getNorthEast().lat(),
	    map.getBounds().getSouthWest().lng()
	);
	var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
	var worldCoordinate = map.getProjection().fromLatLngToPoint(marker.getPosition());
	var pixelOffset = new google.maps.Point(
	    Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
	    Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
	);
	
	var po=pixelOffset;
	pixelOffset=pixelOffset.toString().replace("(","").replace(")","");
	pixelOffset=pixelOffset.split(",");
	//logthis("poa="+pixelOffset);
	//logthis("x="+po.x+", y="+po.y);
	
	var ret={
		left: pixelOffset[0],
		top: pixelOffset[1]
	};
	return po;

};

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
	var v=this.controller.get("map_info").readAttribute("data");
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},make_base_auth(this.username,this.password),this.friends[v].id,null,true);
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
					this.controller.stageController.popScene();
					break;
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.prevScene.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
            }
        }else if(event.type===Mojo.Event.back) {
			event.preventDefault();
			this.controller.stageController.popScene();

		}
}


FriendsMapAssistant.prototype.deactivate = function(event) {
}

FriendsMapAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('friend-feed'),"mousedown", function(){this.controller.get('friend-feed').addClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-feed'),"mouseup", function(){this.controller.get('friend-feed').removeClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-feed'),Mojo.Event.tap, function(){this.controller.stageController.popScene("friends-map");}.bind(this));


    Mojo.Event.stopListening(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
    Mojo.Event.stopListening(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
    Mojo.Event.stopListening(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
}







/*info window stuff*/
function InfoBubble(doc,anchor,params) {
	
	var bubble=doc.createElement("div");
	bubble.addClassName("info-bubble");
	bubble.innerHTML=params.content;
	logthis("ax="+anchor.x);
	bubble.style.left=anchor.x+'px';
	bubble.style.top=anchor.y+'px';
	
	var mc=doc.getElementById("map_canvas");
	
	mc.appendChild(bubble);
}