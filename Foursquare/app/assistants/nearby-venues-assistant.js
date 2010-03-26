function NearbyVenuesAssistant(a, ud, un, pw,i,ss,q,what) {
	  
	 this.auth = a;
	 this.userData = ud;
	 this.username=un;
	 this.password=pw;
	 this.uid=i;
	 this.showSearch=ss;
	 this.retryingGPS=false;
	 this.query=q;
	 this.dosearch=false;
	 this.oldCaption="Nearby";
	 
	 _globals.userData=ud;
	 _globals.username=un;
	 _globals.password=pw;
	 _globals.uid=i;
	 
	 
	 switch(what) {
	 	case "list":
	 		this.showList=true;
	 		break;
	 	default:
	 		this.showList=true;
	 		break;
	 }

}

NearbyVenuesAssistant.prototype.setup = function() {
	
       this.controller.setupWidget("drawerId",
         this.drawerAttributes = {
             modelProperty: 'open',
             unstyled: false
         },
         this.drawerModel = {
             open: false
         });


	//Create the attributes for the textfield
	this.textFieldAtt = {
			hintText: 'Search Places',
			textFieldName:	'name', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			false, 
			modifierState: 	Mojo.Widget.capsLock,
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 30,
			requiresEnterKey: false,
			autoFocus:		false
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
					      {itemTemplate:'listtemplates/venueItems',dividerFunction: this.groupVenues,dividerTemplate: 'listtemplates/dividertemplate',filterFunction: this.filterFunction.bind(this),swipeToDelete: false,onItemRendered:this.fixItem.bind(this),addItemLabel:$L("Add Venue...")},
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
	
	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
		this.doc=cardStageController.document;

	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenuesSearch.bind(this));
	Mojo.Event.listen(this.controller.get('venue-refresh'),"mousedown", function(){this.controller.get('venue-refresh').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-refresh'),"mouseup", function(){this.controller.get('venue-refresh').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-refresh'),Mojo.Event.tap, this.hardRefresh.bind(this));

	Mojo.Event.listen(this.controller.get('venue-map'),"mousedown", function(){this.controller.get('venue-map').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-map'),"mouseup", function(){this.controller.get('venue-map').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('venue-map'),Mojo.Event.tap, this.showMap.bind(this));

	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listDelete, this.listHideItem.bind(this));
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listAdd, this.addNewVenue.bind(this));
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandler.bindAsEventListener(this));
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandler.bindAsEventListener(this));
	//this.controller.listen(this.controller.sceneElement, Mojo.Event.keyup, this.keyUpHandler.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('refresh-venues'),Mojo.Event.tap, this.refreshVenues.bind(this));
    this.doc.addEventListener("keyup", this.keyUpHandler.bind(this), true);
    this.doc.addEventListener("shaking",this.handleShake.bind(this), true);
    //this.doc.addEventListener(Mojo.Event.keypress, this.onKeyPressHandler.bind(this), true);
	Mojo.Event.listen(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenu.bind(this));
	Mojo.Event.listen(this.controller.get('gotloc'),"handleit", this.gotLocation.bind(this));
	Mojo.Event.listen(this.controller.get('gotlocagain'),"handleit", this.gotLocationAgain.bind(this));
	Mojo.Event.listen(this.controller.get('retryloc'),"handleit", this.loadVenues.bind(this));

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    zBar.activeScene=this;
    //zBar.render("main","venues");
    
    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
	    _globals.cmmodel
	);
    
    

    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
    this.controller.setupWidget("smallSpinner",
         this.attributes = {
             spinnerSize: 'small'
         },
         this.model = {
             spinning: true 
         });

	_globals.onVenues=true;
	if(!_globals.reloadVenues && _globals.nearbyVenues==undefined){
		//_globals.GPS.stop(); //we just needed it until now
		_globals.gotLocation(_globals.GPS.get());
		_globals.GPS.stop();
	}else{
		if(_globals.nearbyVenues==undefined && _globals.reloadVenues){
			this.onGetNearbyVenues();
		}else{
			this.venueList=_globals.nearbyVenues;
			this.resultsModel.items =this.venueList;
			this.controller.modelChanged(this.resultsModel);
			this.controller.get("accuracy").innerHTML=_globals.nearness+" ("+_globals.accuracy+")";
		}
	}

    
    _globals.ammodel.items[0].disabled=false;
	this.controller.modelChanged(_globals.ammodel);
	this.controller.get("gps_banner").hide();
	this.controller.get("smallSpinner").hide();
	this.controller.get("refresh-venues").hide();
	//this.controller.get("debuginfo").show();
    this.controller.get("message").hide();
   	
   	if(this.query!="" && this.showSearch){
   		this.textModel.value=this.query;
   		this.controller.modelChanged(this.textModel);
   		this.onGetNearbyVenuesSearch();
   	}else{
	   	//this.onGetNearbyVenues();
	}
}


var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}



NearbyVenuesAssistant.prototype.onGetNearbyVenuesSearch = function(event) {
	_globals.nearbyVenues=undefined;
	this.dosearch=true;
		this.controller.get("spinnerId").show();
		this.controller.get("spinnerId").mojo.start();

	this.onGetNearbyVenues();
}



NearbyVenuesAssistant.prototype.onGetNearbyVenues = function(event) {
	this.controller.get('getting-gps-alert').hide();
	if(_globals.nearbyVenues==undefined || _globals.reloadVenues==true) {
		_globals.reloadVenues=false;
		_globals.nearbyVenues=undefined;

		//hide the result list box and clear out it's model
		this.controller.get("resultListBox").style.display = 'none';

		this.controller.get('message').innerHTML = 'Calculating Location';

		if(!this.dosearch) {
		//get the location. set the maximum age to 0 if we're reloading the list so we dont reuse the coords
		var ma=(_globals.reloadVenues)? 0: 30;
		  if(_globals.firstLoad==false){
			this.controller.get('getting-gps-alert').show();
			this.controller.serviceRequest('palm://com.palm.location', {
				method: "getCurrentPosition",
				parameters: {accuracy: 1, maximumAge:0, responseTime: 1},
				onSuccess: this.gotLocation.bind(this),
				onFailure: this.failedLocation.bind(this)
			});
		  }else{
			  _globals.firstLoad=false;
			  this.gotLocation(_globals.gps);
		  }
		}else{
			this.gotLocation(_globals.gps);
		}
	}else{
		this.controller.get('getting-gps-alert').hide();
		this.resultsModel.items = _globals.nearbyVenues;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}

}

NearbyVenuesAssistant.prototype.refreshVenues = function(event) {
		this.controller.get("gps_banner").hide();
		this.controller.get("smallSpinner").hide();
		this.controller.get("smallSpinner").mojo.stop();
		this.controller.get("refresh-venues").hide();
		this.controller.get("spinnerId").mojo.start();
		this.controller.get("spinnerId").show();
		this.controller.get("resultListBox").style.display = 'none';

		this.getVenues(this.lat, this.long,this.hacc,this.vacc,this.altitude);
}

NearbyVenuesAssistant.prototype.gotLocation = function(event) {
	Mojo.Log.error("doing gotlocation");
	event=_globals.GPS.get();
	if(event.errorCode == 0) {
		//check their prefs. if the results are good enough, carry on
		//otherwise, repoll the gps
		this.controller.get('getting-gps-alert').hide();
		this.controller.get('message').innerHTML = 'Found Location...';
		//we got the location so now query it against 4square for a venue list
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		_globals.lat=this.lat;
		_globals.long=this.long;
		_globals.hacc=this.hacc;
		_globals.vacc=this.vacc;
		_globals.altitude=this.altitude;
		_globals.gps=event;
		_globals.GPS.stop();            
		_globals.accuracy="&plusmn;"+roundNumber(this.hacc,2)+"m";
		this.controller.get("accuracy").innerHTML="Accuracy: "+_globals.accuracy;

		this.getVenues(event.latitude, event.longitude,event.horizAccuracy,event.vertAccuracy,event.altitude);
	} else {
		this.controller.get('getting-gps-alert').hide();
		this.controller.get('message').innerHTML = "gps error: " + event.errorCode;
		Mojo.Log.error("gps error: " + event.errorCode);
		Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
	}
}

NearbyVenuesAssistant.prototype.loadVenues = function() {
	event=_globals.GPS.get();
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		this.getVenues(event.latitude, event.longitude,event.horizAccuracy,event.vertAccuracy,event.altitude);
}

NearbyVenuesAssistant.prototype.gotLocationAgain = function(event) {
	//only do something if we got a better accuracy
	event=_globals.GPS.get();
	if(event.horizAccuracy<this.hacc){
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		_globals.lat=this.lat;
		_globals.long=this.long;
		_globals.hacc=this.hacc;
		_globals.vacc=this.vacc;
		_globals.altitude=this.altitude;
		_globals.gps=event;
		this.controller.get("gps_banner").show();
		this.controller.get("smallSpinner").hide();
		this.controller.get("banner_text").innerHTML="Hey! Upped the accuracy! ";
		this.controller.get("refresh-venues").show();
		_globals.retryingGPS=false;
	}else{
		this.controller.get("gps_banner").hide();
		this.controller.get("smallSpinner").mojo.stop();
		this.controller.get("smallSpinner").hide();
		this.controller.get("refresh-venues").hide();
		_globals.retryingGPS=false;

	}
}

NearbyVenuesAssistant.prototype.failedLocation = function(event) {
	this.controller.get('message').innerHTML = 'failed to get location: ' + event.errorCode;
	Mojo.Log.error('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
}

NearbyVenuesAssistant.prototype.getVenues = function(latitude, longitude,hacc,vacc,alt) {
	this.controller.get('message').innerHTML += '<br/>Searching Venues...';
			this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: _globals.lat, longitude:_globals.long},
			onSuccess: function(address){
				_globals.nearness="Near "+address.substreet+" "+address.street+" "+address.city+", "+address.state;
				this.controller.get("accuracy").innerHTML=_globals.nearness+" ("+_globals.accuracy+")";
			}.bind(this),
			onFailure: function(){}.bind(this)
		});

	var query = this.textModel.value;
	this.query=query;
	var url = 'http://api.foursquare.com/v1/venues.json';
	auth = _globals.auth;
	var radius=(query!="")? 1.5: 0.5;
	var vlimit=_globals.venueCount;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth}, 
	   parameters: {geolat:latitude, geolong:longitude, geohacc:hacc,geovacc:vacc, geoalt:alt,r:radius, l:vlimit, q:query},
	   onSuccess: this.nearbyVenueRequestSuccess.bind(this),
	   onFailure: this.nearbyVenueRequestFailed.bind(this)
	 });
}

NearbyVenuesAssistant.prototype.fixItem = function(list,item,dom){
	if(item.address!=undefined && item.address != "" && item.address!=null) {
	}else{
		var idx=item.id; //store the venue id
		this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: item.geolat, longitude:item.geolong},
			onSuccess: function(address){
				item.address="Near "+address.substreet+" "+address.street;
				//this.controller.modelChanged(this.resultsModel);
				//this.controller.get("results-venue-list").mojo.noticeUpdatedItems(0, this.resultsModel.items);
				//this.controller.get("results-venue-list").mojo.setCount(this.venueList.length);
				var addy=zBar.getElementsByClassName("venue-address",dom)[0];
				addy.innerHTML="Near "+address.substreet+" "+address.street;
			}.bind(this),
			onFailure: function(){}.bind(this)
		});
	}

}


NearbyVenuesAssistant.prototype.nearbyVenueRequestSuccess = function(response) {
	var mybutton = this.controller.get('go_button');
	mybutton.mojo.deactivate();
	
	this.controller.get('message').innerHTML = '';
	
	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
	}
	else {
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get("resultListBox").style.display = 'block';
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.venueList = [];

		
		if(response.responseJSON.groups[0] != undefined) { //actually got some venues
			this.setvenues=true;
			for(var g=0;g<response.responseJSON.groups.length;g++) {
				var varray=response.responseJSON.groups[g].venues;
				var grouping=response.responseJSON.groups[g].type;
				for(var v=0;v<varray.length;v++) {
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
					
					//handle people here
					var herenow=(this.venueList[this.venueList.length-1].stats)? this.venueList[this.venueList.length-1].stats.herenow: 0;
					if(herenow>0){
						this.venueList[this.venueList.length-1].peopleicon="on";
					}else{
						this.venueList[this.venueList.length-1].peopleicon="off";
					}
					
					//handle empty category
					if(this.venueList[this.venueList.length-1].primarycategory==undefined){
						this.venueList[this.venueList.length-1].primarycategory={};
						this.venueList[this.venueList.length-1].primarycategory.iconurl="images/no-cat.png";
					}
					
					this.venueList[this.venueList.length-1].distance=dist;
					this.venueList[this.venueList.length-1].unit=unit;
					if(_globals.hiddenVenues.inArray(varray[v].id)){
				  		//hide it!
				  		this.venueList[this.venueList.length-1].grouping="Hidden";
					}else{
						this.venueList[this.venueList.length-1].grouping=grouping;
					}
					
					if(grouping.indexOf("Matching")>-1) {  //searching
						this.setvenues=false;
					}
				}
			}
			this.lastId=this.venueList[this.venueList.length-1].id;
		}
		
		

		
		//now set the result list to the list's model
		if(this.setvenues==true || this.setvenues==undefined){
			_globals.actualVenues=this.venueList;
			this.setvenues=false;
		}
		_globals.nearbyVenues=this.venueList;
		this.resultsModel.items =this.venueList;
		this.controller.modelChanged(this.resultsModel);

	}
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestFailed = function(response) {
	this.controller.get('message').innerHTML = 'Failed to get Venues';
}

NearbyVenuesAssistant.prototype.performSearch = function(query) {


}
NearbyVenuesAssistant.prototype.listWasTapped = function(event) {
	
	this.controller.stageController.swapScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item,this.username,this.password,this.uid,false,this);
}

NearbyVenuesAssistant.prototype.listHideItem = function(event) {
	var venue=event.item;
	_globals.hiddenVenues.push(venue.id);
	this.resultsModel.items[event.index].grouping="Hidden";
	this.controller.modelChanged(this.resultsModel);
	
	this.controller.get("results-venue-list").mojo.noticeUpdatedItems(0, this.resultsModel.items);
	this.controller.get("results-venue-list").mojo.setCount(this.resultsModel.items.length);

}

NearbyVenuesAssistant.prototype.checkIn = function(id, n) {
	
	if (_globals.auth) {
		this.controller.get('message').innerHTML = 'Checking into ' + n;
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: id
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		this.controller.get('message').innerHTML = 'Not Logged In';
	}
}

NearbyVenuesAssistant.prototype.checkInSuccess = function(response) {
	//this fixes the fact that the scoring isn't an array.
	//we'll probably have to do this for badges as well
	//or, you know, foursquare could fix it...
	//it'll first check if the JSON is whacked or not. this 
	//prevents our app from breaking if 4S fixes the JSON in the future
	var json=response.responseJSON;
	var txt=response.responseText;

	var dialog = this.controller.showDialog({
		template: 'listtemplates/checkin-info',
		assistant: new CheckInDialogAssistant(this, json)
	});
}

NearbyVenuesAssistant.prototype.checkInFailed = function(response) {
	this.controller.get('message').innerHTML = 'Check In Failed: ' + repsonse.responseText;
}






NearbyVenuesAssistant.prototype.groupVenues = function(data){
	return data.grouping;
}

NearbyVenuesAssistant.prototype.addNewVenue = function(){
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},auth);

}


NearbyVenuesAssistant.prototype.onKeyPressHandler = function(event) {
	var char = String.fromCharCode(event.originalEvent.keyCode);
	this.firstChar=char;
	Mojo.Log.error("press keycode="+event.originalEvent.keyCode+", value="+this.textModel.value);
	if(!this.searchShowing){
		Mojo.Log.error("notshowing yet");
		this.searchShowing=true;
		this.controller.get("sendField").show();
		this.controller.get("sendField").mojo.focus();		
		if(!this.searchHasShown){
			this.textModel.value=char;
			this.controller.modelChanged(this.textModel);
		}
		this.searchHasShown=true;
	}else{
		Mojo.Log.error("showing");
	}
}

NearbyVenuesAssistant.prototype.keyDownHandler = function(event) {
	var char = String.fromCharCode(event.originalEvent.keyCode);
	Mojo.Log.error("down keycode="+event.originalEvent.keyCode+", value="+this.textModel.value);
	if(this.controller.get("sendField").mojo.getValue()==char){
		event.stop();
		Mojo.Log.error("stopped");
	}

}	
NearbyVenuesAssistant.prototype.keyUpHandler = function(event) {
	var code=event.keyCode; //event.originalEvent.keyCode;
	Mojo.Log.error("up keycode="+event.keyCode+", value="+this.textModel.value);
	if(this.textModel.value.length<2 && code==8){
		this.searchShowing=false;
		this.controller.get("sendField").mojo.blur();
    	setTimeout(function(){this.controller.get("sendField").hide();}.bind(this),5);
	}
    if(Mojo.Char.isEnterKey(code)) {
        if(event.srcElement.parentElement.id=="sendField") {
	   		setTimeout(this.onGetNearbyVenuesSearch.bind(this), 10);
   			this.controller.get("sendField").hide();
   			this.searchShowing=false;
   			this.searchHasShown=false;
        }
     }

}

NearbyVenuesAssistant.prototype.hardRefresh = function(event) {
	
	_globals.nearbyVenues=undefined;
	_globals.reloadVenues=true;
	this.controller.stageController.swapScene('nearby-venues',_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid)

}

NearbyVenuesAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.controller.get("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
					var os=this.controller.get("drawerId").mojo.getOpenState();
					if(os) {
						this.controller.get("sendField").mojo.focus();
					}else{
						this.controller.get("sendField").mojo.blur();
					}
                	break;
                case "nearby-venues":
                	this.resultsModel.items=_globals.actualVenues;
                	this.controller.modelChanged(this.resultsModel);
					this.controller.get("results-venue-list").mojo.noticeUpdatedItems(0, _globals.actualVenues);
			  		this.controller.get("results-venue-list").mojo.setCount(_globals.actualVenues.length);
                	this.dosearch=false;
	                this.controller.get("drawerId").mojo.setOpenState(false);
                	break;
				case "venue-map":
					this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.crossFade, disableSceneScroller: true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this,this.query);
					break;
				case "do-Venues":
					break;
				case "do-Friends":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this,false);
                	break;
                case "do-Tips":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
					_globals.nearbyVenues=undefined;
					_globals.reloadVenues=true;
					this.controller.stageController.swapScene('nearby-venues',_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid)
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Nothing":
                	break;
            }
        }
    }
NearbyVenuesAssistant.prototype.filterFunction = function(filterString, widget, offset, limit) {
	var matches=Array();
	if(filterString=="") {
		matches=_globals.nearbyVenues;
	}else{
	  if(_globals.nearbyVenues!=undefined) {
		/*for(var m=0;m<_globals.nearbyVenues.length;m++) {
			var vname=_globals.nearbyVenues[m].name;
	  		if(vname.toLowerCase().indexOf(filterString.toLowerCase())>-1) {
	  			matches.push(_globals.nearbyVenues[m]);
	  		}
		}*/
		Mojo.Log.info('event.keyCode = ' + event.keyCode);

	  }
	}
	if(matches!=undefined){
		widget.mojo.noticeUpdatedItems(offset, matches);
  		widget.mojo.setCount(matches.length);
  	}	
}


NearbyVenuesAssistant.prototype.handleShake = function(event) {
	if(event.magnitude>2){
		this.hardRefresh();
	}
}

NearbyVenuesAssistant.prototype.showMap = function(event) {
	this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.zoomFade,disableSceneScroller:true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this,this.query);

}

NearbyVenuesAssistant.prototype.popupChoose = function(event) {
	switch(event){
	            case "venue-search":
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.controller.get("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
					var os=this.controller.get("drawerId").mojo.getOpenState();
					if(!os) {
		            	this.controller.get("vmenu-caption").update(this.oldCaption);
						this.controller.get("sendField").mojo.blur();
					}else{
	            		this.controller.get("vmenu-caption").update("Search");
						this.controller.get("sendField").mojo.focus();
					}
                	break;
				case "venue-map":
					var what=this.controller.get("vmenu-caption").innerHTML;
	            	this.controller.get("vmenu-caption").update("Map");
					this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.crossFade,disableSceneScroller:true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this,this.query,what);
					break;
                case "nearby-venues":
					this.oldCaption="Nearby";
					this.setBools("list");
	            	this.controller.get("vmenu-caption").update("Nearby");
                	this.resultsModel.items=_globals.actualVenues;
                	this.controller.modelChanged(this.resultsModel);
					this.controller.get("results-venue-list").mojo.noticeUpdatedItems(0, _globals.actualVenues);
			  		this.controller.get("results-venue-list").mojo.setCount(_globals.actualVenues.length);
                	this.dosearch=false;
	                this.controller.get("drawerId").mojo.setOpenState(false);
	                break;
				case "venue-add":
					this.addNewVenue();
					break;
	}
}

NearbyVenuesAssistant.prototype.setBools = function(what) {
	this.showList=(what=="list")? true: false;
	this.showSearch=(what=="search")? true: false;
}

NearbyVenuesAssistant.prototype.showMenu = function(event){
					this.controller.popupSubmenu({
			             onChoose:this.popupChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [{secondaryIconPath: 'images/radar-dark.png',label: 'Nearby', command: 'nearby-venues'},
				           {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'venue-map'},
            	           {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'venue-search'},
                	       {secondaryIconPath: 'images/plus.png',label: 'Add Venue', command: 'venue-add'}]
		             });
}




NearbyVenuesAssistant.prototype.activate = function(event) {
    this.controller.get("sendField").mojo.blur();
    this.controller.get("vmenu-caption").update("Nearby");
    this.controller.get("searchgroup").show();
    this.controller.get("results-venue-list").mojo.showAddItem(true);

	   if(_globals.nearbyVenues!=undefined){
			this.controller.get("resultListBox").style.display = 'block';
	   		this.controller.get("spinnerId").mojo.stop();
			this.controller.get("spinnerId").hide();
	   }
	   
	   if(this.showSearch) {
			var scroller = this.controller.getSceneScroller();
			scroller.mojo.revealTop(0);
			this.controller.get("drawerId").mojo.setOpenState(true);
			this.controller.modelChanged(this.drawerModel);

	   }
	   
	   if(_globals.reloadVenues) {
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.nearbyVenues=undefined;
					this.onGetNearbyVenues();
	   }
	   
}

NearbyVenuesAssistant.prototype.deactivate = function(event) {
}

NearbyVenuesAssistant.prototype.cleanup = function(event) {
	_globals.onVenues=false;
	//this.doc.removeEventListener("keyup");
 //   this.doc.removeEventListener("shaking");
	
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandler);
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandler);
    this.doc.removeEventListener("keyup", this.keyUpHandler.bind(this), true);
    this.doc.removeEventListener("shaking",this.handleShake.bind(this), true);
}
