function DupeVenueAssistant(sceneAssistant,q) {
  this.sceneAssistant = sceneAssistant;
  this.query=q;
}

DupeVenueAssistant.prototype.setup = function(widget) {
	this.widget=widget;
	this.resultsModel = {items: [], listTitle: $L('Results')};
	//Setup the textfield widget and observer
    
	// Set up the attributes & model for the List widget:
	this.sceneAssistant.controller.setupWidget('results-venue-list', 
					      {itemTemplate:'listtemplates/venueItemsThin'},
					      this.resultsModel);
	Mojo.Event.listen(this.sceneAssistant.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));

	var url = 'http://api.foursquare.com/v1/venues.json';
	var auth = _globals.auth;
	
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth}, 
	   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude, q:this.query},
	   onSuccess: this.venueSuccess.bind(this),
	   onFailure: this.venueFailed.bind(this)
	 });

};

DupeVenueAssistant.prototype.listWasTapped = function(event) {
	this.sceneAssistant.controller.stageController.swapScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item,_globals.username,_globals.password,_globals.uid,false,this);
	this.widget.mojo.close();

};

DupeVenueAssistant.prototype.venueSuccess = function(response) {
	Mojo.Log.error("Venue success");
	Mojo.Log.error(response.responseText);
	if (response.responseJSON == undefined || (response.responseText=='{"venues":null}')) {
		//this.controller.get('message').innerHTML = 'No Results Found';
		Mojo.Log.error("no results");
		//this.controller.get("spinnerId").mojo.stop();
		//this.controller.get("spinnerId").hide();
		//this.controller.get("resultListBox").style.display = 'block';
		//this.controller.get("noresults").show();
	}
	else {
		Mojo.Log.error("got some results!");
		//this.controller.get("spinnerId").mojo.stop();
		//this.controller.get("spinnerId").hide();
		//this.sceneAssistant.controller.get("resultListBox").style.display = 'block';
		//this.controller.get("noresults").hide();
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.venueList = [];

		
		if(response.responseJSON.groups[0] != undefined) { //actually got some venues
			Mojo.Log.error("gonna loop groups");
			this.setvenues=true;
			for(var g=0;g<response.responseJSON.groups.length;g++) {
				var varray=response.responseJSON.groups[g].venues;
				var grouping=response.responseJSON.groups[g].type;
				Mojo.Log.error("in group loop");
				for(var v=0;v<varray.length;v++) {
					Mojo.Log.error("in venue group");
					this.venueList.push(varray[v]);
					var dist=this.venueList[this.venueList.length-1].distance;
					
					if(_globals.units=="si") {					
						var amile=0.000621371192;
						dist=roundNumber(dist*amile,2);
						var unit="";
						if(dist==1){unit="Mi.";}else{unit="Mi.";}
					}else{
						dist=roundNumber(dist/1000,2);
						var unit="";
						if(dist==1){unit="KM";}else{unit="KM";}						
					}
					Mojo.Log.error("did distance");
					
					//handle people here
					var herenow=(this.venueList[this.venueList.length-1].stats)? this.venueList[this.venueList.length-1].stats.herenow: 0;
					if(herenow>0){
						this.venueList[this.venueList.length-1].peopleicon="on";
					}else{
						this.venueList[this.venueList.length-1].peopleicon="off";
					}
					Mojo.Log.error("did people here");
					
					//handle empty category
					if(this.venueList[this.venueList.length-1].primarycategory==undefined){
						this.venueList[this.venueList.length-1].primarycategory={};
						this.venueList[this.venueList.length-1].primarycategory.iconurl="images/no-cat.png";
					}
					Mojo.Log.error("did no category");
					
					this.venueList[this.venueList.length-1].distance=dist;
					this.venueList[this.venueList.length-1].unit=unit;
				}
			}
			Mojo.Log.error("done looping");
			this.resultsModel.items =this.venueList;
			this.sceneAssistant.controller.modelChanged(this.resultsModel);
			Mojo.Log.error("set items");
		}
	}

};
DupeVenueAssistant.prototype.venueFailed = function(event) {
Mojo.Log.error("venue failed");
}

DupeVenueAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

DupeVenueAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DupeVenueAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.sceneAssistant.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
};
