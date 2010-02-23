function FriendsMapAssistant(lat,long,f,u,p,uid,ps,what) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.lat=lat;
	   this.long=long;
	   this.friends=f;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
	   this.what=what;
}

FriendsMapAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
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
   
   /* this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'map.png', command: 'friends-map', label: "  "},
                { label: "Friends", width: 200,command: 'friends-list' },
                { iconPath: 'search.png', command: 'friends-search', label: "  "}]
            }]
        });*/

	   /* this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },*/
        /*this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Nothing"/*"do-Venues"*//*},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing",
            checkEnabled: true
            }]
    }*//*_globals.cmmodel
);*/

            Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStart.bindAsEventListener(this), false);
            Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChange.bindAsEventListener(this), false);
            Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEnd.bindAsEventListener(this), false);
	Mojo.Event.listen(this.controller.get('fmenu'),Mojo.Event.tap, this.showMenu.bind(this));


_globals.ammodel.items[0].disabled=true;
this.controller.modelChanged(_globals.ammodel);
this.lastScale=0;
this.inGesture=false;
this.zoom=15;
this.origZoom=15;

	/* add event handlers to listen to events from widgets */
}
FriendsMapAssistant.prototype.handleGestureStart = function(event) {
        this.origZoom = this.zoom;
        this.inGesture = 1;
		this.cntr=this.map.getCenter();

}
FriendsMapAssistant.prototype.handleGestureChange = function(event) {
	/*Mojo.Log.error("scale:"+(event.scale)+", type="+event.type);
	var cntr=this.map.getCenter();
	
	if (event.scale>this.lastScale) { //getting bigger
		var zlevel=this.map.getZoom()+Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}
	}else{ //getting smaller
		var zlevel=this.map.getZoom()-Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}	
	}
	this.map.panTo(cntr);
	this.lastScale=event.scale;*/
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
/*	Mojo.Log.error("scale:"+(event.scale)+", type="+event.type);
	var cntr=this.map.getCenter();
	
	if (event.scale>this.lastScale) { //getting bigger
		var zlevel=this.map.getZoom()+Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}
	}else{ //getting smaller
		var zlevel=this.map.getZoom()-Math.round(event.scale);
		if(this.map.getZoom()!=zlevel) {this.map.setZoom(zlevel);}	
	}
	this.map.panTo(cntr);
	this.lastScale=event.scale;*/
	        this.origZoom = this.zoom;
        this.inGesture = 0;
        this.map.setZoom(Math.round(this.zoom));
        this.map.panTo(this.cntr);

}


FriendsMapAssistant.prototype.initMap = function(event) {
    try
    {
        this.map = Maps.createMap('map_canvas');

        /*GEvent.addListener(this.map, "click",
        function(clickable) {
            this.controller.stageController.pushScene("StopInfo", clickable.oba_stop);
        }.bind(this));*/
        var the_center=new GLatLng(_globals.lat, _globals.long);
		this.map.setCenter(the_center, 15);
		var yahIcon = new GIcon();
		yahIcon.image = "http://google-maps-icons.googlecode.com/files/leftthendown.png";
		yahIcon.shadow = "http://google-maps-icons.googlecode.com/files/shadow.png";
		yahIcon.iconSize = new GSize(32, 37);
		yahIcon.shadowSize = new GSize(51, 35);
		yahIcon.iconAnchor = new GPoint(24, 38);
		yahIcon.infoWindowAnchor = new GPoint(5, 1);

		markerOptions = { icon:yahIcon };

		var yahmarker=new GMarker(the_center, markerOptions);
		this.map.addOverlay(yahmarker);
		
		
		//set up venue markers
		// Create our "cafe" marker icon
		var cafeIcon = new GIcon();
		cafeIcon.image = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|62195D";
		cafeIcon.shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow";
		cafeIcon.iconSize = new GSize(30, 38);
		cafeIcon.shadowSize = new GSize(40, 38);
		cafeIcon.iconAnchor = new GPoint(24, 38);
		cafeIcon.infoWindowAnchor = new GPoint(5, 1);

		var friendsfaces=[];
	/*	for (var f=0;f<this.friends.length;f++) {
			friendsfaces[f] = new GIcon();
			friendsfaces[f].image = this.friends[f].photo;
			friendsfaces[f].shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow";
			friendsfaces[f].iconSize = new GSize(32, 32);
			friendsfaces[f].shadowSize = new GSize(40, 38);
			friendsfaces[f].iconAnchor = new GPoint(24, 38);
			friendsfaces[f].infoWindowAnchor = new GPoint(5, 1);
		}*/

		
		
		
		// Set up our GMarkerOptions object literal
		markerOptions = { icon:cafeIcon };


		for(var v=0;v<this.friends.length;v++) {
		  if(this.friends[v].geolat!=0 && this.friends[v].geolat!=undefined) { //don't show friends that haven't done anything
			friendsfaces[f] = new GIcon();
			friendsfaces[f].image = this.friends[v].photo;
			friendsfaces[f].shadow = "images/map-marker-bg.png";
			friendsfaces[f].iconSize = new GSize(43, 43);
			friendsfaces[f].shadowSize = new GSize(58, 65);
			friendsfaces[f].iconAnchor = new GPoint(22, 45);
			friendsfaces[f].infoWindowAnchor = new GPoint(5, 1);

			
			
			var point = new GLatLng(this.friends[v].geolat,this.friends[v].geolong);
			
			
			var marker=new GMarker(point, {icon:friendsfaces[f]});
			marker.friend=this.friends[v];
			marker.vindex=v;
			marker.username=this.username;
			marker.password=this.password;
			marker.uid=this.uid;
  			this.map.addOverlay(marker);
			/*GEvent.addListener(marker, "click",function() {
				NearbyVenuesMapAssistant.showVenue(NearbyVenuesMapAssistant.vvv);
			});*/
		  }


		}


		/*Set up an Event on the clicking of the map itself.
			Adding events to the markers themselves udner Mojo is a pain,
			So we add the evnt to the map, then we get the instance of the clickable object
			Under the user's finger, if any. If it's a marker, sho the info window
			and attach an event to the Venue Info link to show the Venue Detail scene
		*/
		GEvent.addListener(this.map, "click",
        function(clickable,noideawhatthisargumentis,point) {
           if(clickable.friend != undefined) {
           var iw=this.map.openInfoWindowHtml(point, '<div id="iw-'+clickable.friend.id+'"><b>'+clickable.friend.firstname+"</b><br/>"+
           										clickable.friend.checkin+"<br/></div>"+
           										'<a href="javascript:;" id="friend-'+clickable.friend.id+'" class="friendLink" data="'+clickable.vindex+'">Friend Info</a>'
           										,{onOpenFn: function(){
													var eid="friend-"+clickable.friend.id;
													Mojo.Log.error("#########adding event to "+eid)
													Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.showFriendInfo); //avoid conflicts
													Mojo.Event.listen($(eid),Mojo.Event.tap,this.showFriendInfo.bind(this));
													Mojo.Log.error("#########added event to "+eid)
           										
           										
           										
           										
           										}.bind(this)
           										});
           										
        }}.bind(this));
		
// A TextualZoomControl is a GControl that displays textual "Zoom In"
// and "Zoom Out" buttons (as opposed to the iconic buttons used in
// Google Maps).

// We define the function first
function TextualZoomControl() {
}

// To "subclass" the GControl, we set the prototype object to
// an instance of the GControl object
TextualZoomControl.prototype = new GControl();

// Creates a one DIV for each of the buttons and places them in a container
// DIV which is returned as our control element. We add the control to
// to the map container and return the element for the map class to
// position properly.
TextualZoomControl.prototype.initialize = function(map) {
  var container = document.createElement("div");

  var zoomInDiv = document.createElement("div");
  this.setButtonStyle_(zoomInDiv);
  container.appendChild(zoomInDiv);
  zoomInDiv.appendChild(document.createTextNode("+"));
  GEvent.addDomListener(zoomInDiv, "click", function() {
    map.zoomIn();
  });
  GEvent.addDomListener(zoomInDiv, "mousedown", function() {
    zoomInDiv.style.backgroundPosition="-4px -54px"
  });
  GEvent.addDomListener(zoomInDiv, "mouseup", function() {
    zoomInDiv.style.backgroundPosition="-4px -4px"
  });

  var zoomOutDiv = document.createElement("div");
  this.setButtonStyle_(zoomOutDiv);
  container.appendChild(zoomOutDiv);
  zoomOutDiv.appendChild(document.createTextNode("-"));
  GEvent.addDomListener(zoomOutDiv, "click", function() {
    map.zoomOut();
  });
  GEvent.addDomListener(zoomOutDiv, "mousedown", function() {
    zoomOutDiv.style.backgroundPosition="-4px -54px"
  });
  GEvent.addDomListener(zoomOutDiv, "mouseup", function() {
    zoomOutDiv.style.backgroundPosition="-4px -4px"
  });

  map.getContainer().appendChild(container);
  return container;
}

// By default, the control will appear in the top left corner of the
// map with 7 pixels of padding.
TextualZoomControl.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(9, 60));
}

// Sets the proper CSS for the given button element.
TextualZoomControl.prototype.setButtonStyle_ = function(button) {
  button.style.textDecoration = "none";
  button.style.color = "#fff";
  //button.style.backgroundColor = "white";
  button.style.background="transparent url(images/palm-menu-button.png) no-repeat -4px -4px"
  button.style.font = "22px Arial";
  button.style.fontWeight="bold";
  //button.style.border = "1px solid black";
  button.style.paddingTop = "5px";
  button.style.marginBottom = "3px";
  button.style.textAlign = "center";
  button.style.width = "43px";
  button.style.height="42px";
  button.style.cursor = "pointer";
}

this.map.addControl(new TextualZoomControl());
		
		
		this.spinnerModel.spinning = false;
	    this.controller.modelChanged(this.spinnerModel);

	    this.controller.get("statusinfo").update("");
	
        Mojo.Log.info("Map Created");
		
       // this.updateMap(true);
    }
    catch(error)
    {
        Mojo.Log.error("Error during setup: " + error);
    }
}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}


FriendsMapAssistant.prototype.showFriendInfo = function(event) {
	Mojo.Log.error("trying friend info!!!!!");
	var v=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade, disableSceneScroller: false},make_base_auth(this.username,this.password),this.friends[v].id);
}


FriendsMapAssistant.prototype.activate = function(event) {
Mojo.Log.error("protocol="+window.location.protocol);
                if (this.map === undefined)
                {
					// Kick off google maps initialization
					if(!Maps.isLoaded())
					{
						this.spinnerModel.spinning = true;
					    this.controller.modelChanged(this.spinnerModel);

					    this.controller.get("statusinfo").update("Loading Google Maps...");
					
						Maps.loadedCallback(this.initMap.bind(this));
						initLoader();
					}
					else
					{
						this.initMap();
					}
                }
}

FriendsMapAssistant.prototype.popupChoose = function(event) {
	switch(event){
	            case "friend-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,true,this.what);
                	break;
				case "friend-map":
					this.oldCaption="Map";
					break;
				case "friends-list":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"list");
					break;
				case "friends-pending":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"pending");
					break;
				case "friends-feed":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,false,"feed");
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
                	Mojo.Log.error("===========venue search clicked");
					//get the scroller for your scene
//					var scroller = this.prevScene.controller.getSceneScroller();
					//call the widget method for scrolling to the top
//					scroller.mojo.revealTop(0);
//					this.prevScene.controller.get("drawerId").mojo.toggleState();
//					this.prevScene.controller.modelChanged(this.prevScene.drawerModel);
//					this.controller.stageController.popScene("friends-map");
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this,true);

                	break;
				case "friends-list":
					//this.controller.stageController.popScene("friends-map");
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
				case "friend-map":
					break;
				case "do-Friends":
                	//var thisauth=auth;
					//this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
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
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
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
			this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);

		}
}


FriendsMapAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FriendsMapAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
