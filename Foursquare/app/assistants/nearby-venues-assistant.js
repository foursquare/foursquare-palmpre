function NearbyVenuesAssistant(a, ud, un, pw,i) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	 this.auth = a;
	 this.userData = ud;
	 this.username=un;
	 this.password=pw;
	 this.uid=i;
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
					      {itemTemplate:'listtemplates/venueItems',dividerFunction: this.groupVenues,dividerTemplate: 'listtemplates/dividertemplate'},
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


	this.avbuttonModel1 = {
		buttonLabel : 'Add New Venue',
		buttonClass : '',
		disable : false
	}
	this.avbuttonAtt1 = {
	}
	
	this.controller.setupWidget('add_venue_button',this.avbuttonAtt1,this.avbuttonModel1);

	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenues.bind(this));
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('add_venue_button'),Mojo.Event.tap, this.addNewVenue.bind(this));


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
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { icon: "back", command: "do-Venues"},
                 { icon: "back", command: "do-Friends"},
                 { icon: "back", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Venues"
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


    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });


    
    Mojo.Log.error("#########setup nearby");
    
    $("message").hide();
    
    	       this.onGetNearbyVenues();

}


var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}







NearbyVenuesAssistant.prototype.onGetNearbyVenues = function(event) {
	Mojo.Log.error("trying to get location..");
	
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
			Mojo.Log.error("gps error: " + event.errorCode);

	if(event.errorCode == 0) {
		$('message').innerHTML = 'Found Location...';
		Mojo.Log.error("got location");
		//we got the location so now query it against 4square for a venue list
		this.getVenues(event.latitude, event.longitude);
	} else {
		$('message').innerHTML = "gps error: " + event.errorCode;
		Mojo.Log.error("gps error: " + event.errorCode);
		Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
	}
}

NearbyVenuesAssistant.prototype.failedLocation = function(event) {
	$('message').innerHTML = 'failed to get location: ' + event.errorCode;
	Mojo.Log.error('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
}

NearbyVenuesAssistant.prototype.getVenues = function(latitude, longitude) {
	$('message').innerHTML += '<br/>Searching Venues...';
	Mojo.Log.error("--------lat="+latitude+", long="+longitude);
	
	var query = this.textModel.value;
	//$('message').innerHTML += "("+query+")";
	//var query='';
	var url = 'http://api.foursquare.com/v1/venues.json';
	auth = make_base_auth(this.username, this.password);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {geolat:latitude, geolong:longitude, r:.5, l:50, q:query},
	   onSuccess: this.nearbyVenueRequestSuccess.bind(this),
	   onFailure: this.nearbyVenueRequestFailed.bind(this)
	 });
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestSuccess = function(response) {
	var mybutton = $('go_button');
	mybutton.mojo.deactivate();
	
	Mojo.Log.error("----------------got venues");
	$('message').innerHTML = '';
	Mojo.Log.error(response.responseText);
	
	if (response.responseJSON == undefined) {
		$('message').innerHTML = 'No Results Found';
	}
	else {
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
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
		
		/*if(response.responseJSON.venues[0] != undefined) {
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
		}*/
		
		if(response.responseJSON.groups[0] != undefined) { //actually got some venues
			for(var g=0;g<response.responseJSON.groups.length;g++) {
				Mojo.Log.error("##########in the loop");
				var varray=response.responseJSON.groups[g].venues;
				Mojo.Log.error("#######got venues");
				var grouping=response.responseJSON.groups[g].type;
				Mojo.Log.error("########grouping="+grouping);
				for(var v=0;v<varray.length;v++) {
					venueList.push(varray[v]);
					venueList[venueList.length-1].grouping=grouping;
				}
			}
		}
		
		
			//$('message').innerHTML = response.responseText;

		
		//now set the result list to the list's model
		this.resultsModel.items =venueList;// $A(venueList);
		this.controller.modelChanged(this.resultsModel);
	}
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestFailed = function(response) {
	$('message').innerHTML = 'Failed to get Venues';
}


NearbyVenuesAssistant.prototype.listWasTapped = function(event) {
	
	/*this.controller.showAlertDialog({
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
	*/
	
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item,this.username,this.password,this.uid);
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
	Mojo.Log.error(response.responseText);
	
	//this fixes the fact that the scoring isn't an array.
	//we'll probably have to do this for badges as well
	//or, you know, foursquare could fix it...
	//it'll first check if the JSON is whacked or not. this 
	//prevents our app from breaking if 4S fixes the JSON in the future
	var json=response.responseJSON;
		Mojo.Log.error("^^^^^^^^^^^^^^^^made it here...");
	var txt=response.responseText;

	/*if(txt.indexOf('"scoring":')>-1) {
		Mojo.Log.error("^^^^^^^^^^^^^^^^not working...");
		txt=txt.replace('{"score":','[{"score":');
		txt=txt.replace('pts "}}','pts "}}]')
		txt=txt.replace('"},"score":','"}},{"score":');
		txt=txt.replace('},"total":{','}},{"total":{');
		var json=eval('(' + txt + ')');
	}*/
	
	var dialog = this.controller.showDialog({
		template: 'listtemplates/checkin-info',
		assistant: new CheckInDialogAssistant(this, json)
	});
}

NearbyVenuesAssistant.prototype.checkInFailed = function(response) {
	$('message').innerHTML = 'Check In Failed: ' + repsonse.responseText;
}


//{"checkin":{"message":"OK! We've got you @ Se–or jalape–o.","id":2318912,"created":"Thu, 12 Nov 09 21:42:10 +0000","venue":{"id":172322,"name":"Se–or jalape–o","address":"415 n. Mary","crossstreet":null,"city":"Sunnyvale","state":"CA","zip":null,"cityid":23},"badges":{"badge":{"id":179914,"name":"Newbie","icon":"http://foursquare.com/images/badges/newbie_on.png","text":"Congrats on your first check-in!"}},"scoring":{"score":{"points":5,"icon":"http://foursquare.com/images/scoring/1.png","message":"First time @ Se–or jalape–o!"},"score":{"points":1,"icon":"http://foursquare.com/images/scoring/2.png","message":"First stop tonight"},"total":{"points":6,"message":"6 pts "}}}}




NearbyVenuesAssistant.prototype.groupVenues = function(data){
	return data.grouping;
}

NearbyVenuesAssistant.prototype.addNewVenue = function(){
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-venue',
		assistant: new AddVenueDialogAssistant(this,auth)
	});

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


NearbyVenuesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	     //  this.onGetNearbyVenues();

}


NearbyVenuesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyVenuesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
