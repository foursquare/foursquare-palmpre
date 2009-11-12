function NearbyVenuesAssistant(a, ud) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	 this.auth = a;
	 this.userData = ud;
}

NearbyVenuesAssistant.prototype.setup = function() {
	Mojo.Log.error("#####setting up nearby");
	//Create the attributes for the textfield
	this.textFieldAtt = {
			hintText: 'Leave Blank to Search All Nearby',
			textFieldName:	'name', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			true, 
			modifierState: 	Mojo.Widget.capsLock,
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 30,
			requiresEnterKey: false
	};
	//Create the model for the text field
	this.textModel = {
		value : ''
	};
	
	this.resultsModel = {items: [], listTitle: $L('Results')};
	//Setup the textfield widget and observer
	this.controller.setupWidget('sendField', this.textFieldAtt, this.textModel);
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('results-venue-list', 
					      {itemTemplate:'listtemplates/venueItems'},
					      this.resultsModel);

	//Set up button handlers
	this.buttonModel1 = {
		buttonLabel : 'Find Venues',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_button',this.buttonAtt1,this.buttonModel1);
	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenues.bind(this));
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));

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
        
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.attributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.model = {
          visible: true,
          items: [{
          	items: [ 
                 { icon: "back", command: "do-Previous"},
                 { icon: "back", command: "do-Previous2"},
                 { icon: "back", command: "do-Previous3"},
                 { icon: "back", command: "do-Previous4"},
                 { icon: 'forward', command: 'do-Next'}
                 ],
            toggleCmd: "do-Previous"
            }]
    });
    
    
        this.controller.setupWidget("drawerId",
         this.drawerAttributes = {
             modelProperty: 'open',
             unstyled: false
         },
         this.drawerModel = {
             open: false
         });

    
    Mojo.Log.error("#########setup nearby");
    
}










NearbyVenuesAssistant.prototype.onGetNearbyVenues = function(event) {
	
	
	//hide the result list box an clear out it's model
	$(resultListBox).style.display = 'none';
	this.resultsModel.items = $A([]);
	this.controller.modelChanged(this.resultsModel);
	
	$('message').innerHTML = 'Calculating Location';
	
	//get the location
	this.controller.serviceRequest('palm://com.palm.location', {
		method: "getCurrentPosition",
		parameters: {},
		onSuccess: this.gotLocation.bind(this),
		onFailure: this.failedLocation.bind(this)
	});

}

NearbyVenuesAssistant.prototype.gotLocation = function(event) {
	
	if(event.errorCode == 0) {
		$('message').innerHTML = 'Found Location...';
		//we got the location so now query it against 4square for a venue list
		this.getVenues(event.latitude, event.longitude);
	} else {
		$('message').innerHTML = "gps error: " + event.errorCode;
	}
}

NearbyVenuesAssistant.prototype.failedLocation = function(event) {
	$('message').innerHTML = 'failed to get location: ' + event.errorCode;
}

NearbyVenuesAssistant.prototype.getVenues = function(latitude, longitude) {
	$('message').innerHTML += '<br/>Searching Venues...';
	Mojo.Log.error("--------lat="+latitude+", long="+longitude);
	
	var query = this.textModel.value;
	$('message').innerHTML += "("+query+")";
	//var query='';
	var url = 'http://api.foursquare.com/v1/venues.json';
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {geolat:latitude, geolong:longitude, r:.5, l:50, q:query},
	   onSuccess: this.nearbyVenueRequestSuccess.bind(this),
	   onFailure: this.nearbyVenueRequestFailed.bind(this)
	 });
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestSuccess = function(response) {
	var mybutton = $('go_button');
	mybutton.mojo.deactivate();
	
	//$('message').innerHTML = response.responseText;
	Mojo.Log.error("----------------got venues");
	$('message').innerHTML = '';
	
	
	if (response.responseJSON == undefined) {
		$('message').innerHTML = 'No Results Found';
	}
	else {
		$(resultListBox).style.display = 'block';
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		var venueList = [];

		/*if (response.responseJSON.venues.group != undefined) { //If there is only 1 result it falls into this structure
			$('message').innerHTML = response.responseJSON.venues.group;
			venueList = [response.responseJSON.venues.group.venue];
		} else { //Otherwise multiple results are stuffed into an array of arrays, so I go 
				 //through each array of arrays and just build 1 giant array of results to provide to the list component
			
			for(var i = 0; i < response.responseJSON.venues.length; i++) {
				for(var j = 0; j < response.responseJSON.venues[i].length; j++) {
						venueList.push(response.responseJSON.venues[i][j]);
				}
			}
				
		}*/
		
		if(response.responseJSON.venues[0] != undefined) {
			$('message').innerHTML='venues[0] is not undefined';
			if(response.responseJSON.venues[0].length > 0) {
				for (var i = 0; i < response.responseJSON.venues[0].length; i++) {
					venueList[i] = response.responseJSON.venues[0][i];
					venueList[i].grouping = "Nearby Favorites";
				}
			}else{
				venueList[0]=response.responseJSON.venues[0].venue;
				venueList[0].grouping="Nearby Favorites";
			}
		}else if(response.responseJSON.venues.group != undefined){
			$('message').innerHTML='group is not undefined';
			Mojo.Log.error(response.responseText);
			if(response.responseJSON.venues.group.length>1) {
				for (var i = 0; i < response.responseJSON.venues.group.length; i++) {
					venueList[i] = response.responseJSON.venues.group[i];
					venueList[i].grouping = "Nearby";
				}
			}else{
				venueList[0] = response.responseJSON.venues.group.venue;
				venueList[0].grouping="Nearby";
			}
		}
		
		if(response.responseJSON.venues.group == undefined) {
			for (var i = venueList.length; i < response.responseJSON.venues[1].length; i++) {
				venueList[i] = response.responseJSON.venues[1][i];
				venueList[i].grouping = "Nearby";
			}
		}
		
		
		
		
		//now set the result list to the list's model
		this.resultsModel.items =venueList;// $A(venueList);
		this.controller.modelChanged(this.resultsModel);
	}
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestFailed = function(response) {
	$('message').innerHTML = 'Failed to get Venues';
}


NearbyVenuesAssistant.prototype.listWasTapped = function(event) {
	
	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.checkIn(event.item.id, event.item.name);
			}
		},
		title:"Foursquare Check In",
		message:"Do you want to check in here?",
		cancelable:true,
		choices:[ {label:'Yes', value:true, type:'affirmative'}, {label:'No', value:false, type:'negative'} ]
	});
	
}

NearbyVenuesAssistant.prototype.checkIn = function(id, n) {
	
	if (auth) {
		$('message').innerHTML = 'Checking into ' + n;
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: auth
			},
			parameters: {
				vid: id
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		$('message').innerHTML = 'Not Logged In';
	}
}

NearbyVenuesAssistant.prototype.checkInSuccess = function(response) {
	//$(resultListBox).style.display = 'none';
	//this.resultsModel.items = $A([]);
	//this.controller.modelChanged(this.resultsModel);
	
	//$('message').innerHTML = response.responseText;
	
	var dialog = this.controller.showDialog({
		template: 'listtemplates/checkin-info',
		assistant: new CheckInDialogAssistant(this, response.responseJSON)
	});
}

NearbyVenuesAssistant.prototype.checkInFailed = function(response) {
	$('message').innerHTML = 'Check In Failed: ' + repsonse.responseText;
}











NearbyVenuesAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	Mojo.Log.error("===========venue search clicked");
                	$("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel)
                	break;
            }
        }
    }


NearbyVenuesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	       this.onGetNearbyVenues();

}


NearbyVenuesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyVenuesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
