function NearbyVenuesMapAssistant(lat,long,v) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.lat=lat;
	   this.long=long;
	   this.venues=v;
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
                items: [{ icon: "", command: "", label: "  "},
                { icon: "", command: "", label: "  "},
                { label: "Venues", width: 100 },
                { iconPath: 'map.png', command: 'venue-map', label: "  "},
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
		cafeIcon.iconSize = new GSize(25, 33);
		cafeIcon.shadowSize = new GSize(35, 33);
		cafeIcon.iconAnchor = new GPoint(19, 33);
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
  			this.map.addOverlay(new GMarker(point, markerOptions));

		}


		
		
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

NearbyVenuesAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	Mojo.Log.error("===========venue search clicked");
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					$("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
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






