function NearbyVenuesMapAssistant(lat,long,v,u,p,uid,ps) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.lat=lat;
	   this.long=long;
	   this.venues=v;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
}

NearbyVenuesMapAssistant.prototype.setup = function() {
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
   
    this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'map.png', command: 'venue-map', label: "  "},
                { label: "Venues", width: 200,command: 'nearby-venues' },
                { iconPath: 'search.png', command: 'venue-search', label: "  "}]
            }]
        });

	/* add event handlers to listen to events from widgets */
	
	
	


}

NearbyVenuesMapAssistant.prototype.initMap = function(event) {
    try
    {
        this.map = Maps.createMap('map_canvas');

        /*GEvent.addListener(this.map, "click",
        function(clickable) {
            this.controller.stageController.pushScene("StopInfo", clickable.oba_stop);
        }.bind(this));*/
		this.map.setCenter(new GLatLng(this.lat, this.long), 15);
		
		
		//set up venue markers
		// Create our "cafe" marker icon
		var cafeIcon = new GIcon();
		cafeIcon.image = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|62195D";
		cafeIcon.shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow";
		cafeIcon.iconSize = new GSize(30, 38);
		cafeIcon.shadowSize = new GSize(40, 38);
		cafeIcon.iconAnchor = new GPoint(24, 38);
		cafeIcon.infoWindowAnchor = new GPoint(5, 1);
		/*var cafeIcon = new GIcon();
		cafeIcon.image = "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe|62195D";
		cafeIcon.shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow";
		cafeIcon.iconSize = new GSize(25, 33);
		cafeIcon.shadowSize = new GSize(35, 33);
		cafeIcon.iconAnchor = new GPoint(19, 33);
		cafeIcon.infoWindowAnchor = new GPoint(5, 1);*/

		var airportIcon = new GIcon();
		airportIcon.image = "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=airport|62195D";
		airportIcon.shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow";
		airportIcon.iconSize = new GSize(25, 33);
		airportIcon.shadowSize = new GSize(35, 33);
		airportIcon.iconAnchor = new GPoint(19, 33);
		airportIcon.infoWindowAnchor = new GPoint(5, 1);
		
		
		
		// Set up our GMarkerOptions object literal
		markerOptions = { icon:cafeIcon };


		for(var v=0;v<this.venues.length;v++) {
			var point = new GLatLng(this.venues[v].geolat,this.venues[v].geolong);
			
			
			var marker=new GMarker(point, markerOptions);
			marker.venue=this.venues[v];
			marker.vindex=v;
			marker.username=this.username;
			marker.password=this.password;
			marker.uid=this.uid;
  			this.map.addOverlay(marker);
			/*GEvent.addListener(marker, "click",function() {
				NearbyVenuesMapAssistant.showVenue(NearbyVenuesMapAssistant.vvv);
			});*/
			


		}


		/*Set up an Event on the clicking of the map itself.
			Adding events to the markers themselves udner Mojo is a pain,
			So we add the evnt to the map, then we get the instance of the clickable object
			Under the user's finger, if any. If it's a marker, sho the info window
			and attach an event to the Venue Info link to show the Venue Detail scene
		*/
		GEvent.addListener(this.map, "click",
        function(clickable,noideawhatthisargumentis,point) {
           if(clickable.venue != undefined) {
           var iw=this.map.openInfoWindowHtml(point, '<div id="iw-'+clickable.venue.id+'"><b>'+clickable.venue.name+"</b><br/>"+
           										clickable.venue.address+"<br/></div>"+
           										'<a href="javascript:;" id="venue-'+clickable.venue.id+'" class="venueLink" data="'+clickable.vindex+'">Venue Info</a>'
           										,{onOpenFn: function(){
													var eid="venue-"+clickable.venue.id;
													Mojo.Log.error("#########adding event to "+eid)
													Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.showVenueInfo); //avoid conflicts
													Mojo.Event.listen($(eid),Mojo.Event.tap,this.showVenueInfo.bind(this));
													Mojo.Log.error("#########added event to "+eid)
           										
           										
           										
           										
           										}.bind(this)
           										});
           										
        }}.bind(this));
		

		
		
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

NearbyVenuesMapAssistant.prototype.showVenueInfo = function(event) {
	Mojo.Log.error("trying venue info!!!!!");
	var v=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},this.venues[v],this.username,this.password,this.uid);
}


NearbyVenuesMapAssistant.prototype.activate = function(event) {
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

NearbyVenuesMapAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	Mojo.Log.error("===========venue search clicked");
					//get the scroller for your scene
					var scroller = this.prevScene.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.prevScene.controller.get("drawerId").mojo.toggleState();
					this.prevScene.controller.modelChanged(this.prevScene.drawerModel);
					this.controller.stageController.popScene("nearby-venues-map");
                	break;
				case "nearby-venues":
					this.controller.stageController.popScene("nearby-venues-map");
					break;
				case "venue-map":
					this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.crossFade},this.lat,this.long,this.resultsModel.items);
					break;
				case "do-Venues":
                	var thisauth=auth;
					this.controller.stageController.pushScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,uid);
					break;
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                	var checkinDialog = this.controller.showDialog({
						template: 'listtemplates/do-shout',
						assistant: new DoShoutDialogAssistant(this,auth)
					});

                	break;
            }
        }
    }


NearbyVenuesMapAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyVenuesMapAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}






