function NearbyVenuesAssistant(a, ud, un, pw,i,ss,q) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	 this.auth = a;
	 this.userData = ud;
	 this.username=un;
	 this.password=pw;
	 this.uid=i;
	 this.showSearch=ss;
	 this.retryingGPS=false;
	 this.query=q;
	 this.dosearch=false;
	 
	 _globals.userData=ud;
	 _globals.username=un;
	 _globals.password=pw;
	 _globals.uid=i;
}

NearbyVenuesAssistant.prototype.setup = function() {
	//Create the attributes for the textfield
	this.textFieldAtt = {
			hintText: 'Leave Blank to Search All Nearby',
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
					      {itemTemplate:'listtemplates/venueItems',dividerFunction: this.groupVenues,dividerTemplate: 'listtemplates/dividertemplate',filterFunction: this.filterFunction.bind(this)},
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

	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenuesSearch.bind(this));
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('add_venue_button'),Mojo.Event.tap, this.addNewVenue.bind(this));
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandler.bind(this));
	Mojo.Event.listen(this.controller.get('refresh-venues'),Mojo.Event.tap, this.refreshVenues.bind(this));
    this.controller.document.addEventListener("keyup", this.keyDownHandler.bind(this), true);

    this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'blue-view-not'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'map.png', command: 'venue-map', label: "  "},
                { label: "Venues", width: 200 ,command: 'nearby-venues'},
                { iconPath: 'search.png', command: 'venue-search', label: "  "}]
            }]
        });
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'blue-command-not'
        },
    _globals.cmmodel
);
    
    
    
    
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
    this.controller.setupWidget("smallSpinner",
         this.attributes = {
             spinnerSize: 'small'
         },
         this.model = {
             spinning: true 
         });


    
    _globals.ammodel.items[0].disabled=false;
this.controller.modelChanged(_globals.ammodel);
		$("gps_banner").hide();
		$("smallSpinner").hide();
		//$("smallSpinner").mojo.stop();
		$("refresh-venues").hide();
$("debuginfo").show();
    $("message").hide();
   	
   	if(this.query!="" && this.showSearch){
   		this.textModel.value=this.query;
   		this.controller.modelChanged(this.textModel);
   		this.onGetNearbyVenuesSearch();
   	}else{
	   	this.onGetNearbyVenues();
	}

}


var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

NearbyVenuesAssistant.prototype.keyDownHandler = function(event) {
      if(Mojo.Char.isEnterKey(event.keyCode)) {
         if(event.srcElement.parentElement.id=="sendField") {
    		setTimeout(this.onGetNearbyVenuesSearch.bind(this), 10);
         }
      }
}	


NearbyVenuesAssistant.prototype.onGetNearbyVenuesSearch = function(event) {
	_globals.nearbyVenues=undefined;
	//if(_globals.actualVenues==undefined){_globals.actualVenues=this.resultsModel.items;}
	this.dosearch=true;
		$("spinnerId").show();
		$("spinnerId").mojo.start();

	this.onGetNearbyVenues();
}



NearbyVenuesAssistant.prototype.onGetNearbyVenues = function(event) {
	Mojo.Log.error("trying to get location..");
	$('getting-gps-alert').hide();
	if(_globals.nearbyVenues==undefined || _globals.reloadVenues==true) {
		Mojo.Log.error("using new location..");

		_globals.reloadVenues=false;
		_globals.nearbyVenues=undefined;
			Mojo.Log.error("set globals");

		//hide the result list box and clear out it's model
		$("resultListBox").style.display = 'none';
			Mojo.Log.error("hid box");

		//this.resultsModel.items = $A([]);
		//this.controller.modelChanged(this.resultsModel);
					Mojo.Log.error("model changed..");

		$('message').innerHTML = 'Calculating Location';
			Mojo.Log.error("actually querying gps..");

		if(!this.dosearch) {
		//get the location. set the maximum age to 0 if we're reloading the list so we dont reuse the coords
		var ma=(_globals.reloadVenues)? 0: 30;
		Mojo.Log.error("###ma="+ma);
		  if(_globals.firstLoad==false){
			$('getting-gps-alert').show();
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
		Mojo.Log.error("using cached venues..");
		$('getting-gps-alert').hide();
		this.resultsModel.items = _globals.nearbyVenues;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}

}

NearbyVenuesAssistant.prototype.refreshVenues = function(event) {
		$("gps_banner").hide();
		$("smallSpinner").hide();
		$("smallSpinner").mojo.stop();
		$("refresh-venues").hide();
		$("spinnerId").mojo.start();
		$("spinnerId").show();
		$("resultListBox").style.display = 'none';

		this.getVenues(this.lat, this.long,this.hacc,this.vacc,this.altitude);
}

NearbyVenuesAssistant.prototype.gotLocation = function(event) {
			Mojo.Log.error("gps error: " + event.errorCode);

	if(event.errorCode == 0) {
		//check their prefs. if the results are good enough, carry on
		//otherwise, repoll the gps
		Mojo.Log.error("setting="+_globals.gpsAccuracy+", actual="+event.horizAccuracy);
  	 // if(_globals.gpsAccuracy==0 || _globals.gpsAccuracy>event.horizAccuracy){
		$('getting-gps-alert').hide();
		$('message').innerHTML = 'Found Location...';
		Mojo.Log.error("got location");
		//we got the location so now query it against 4square for a venue list
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		Mojo.Log.error("hacc="+this.hacc+", vacc="+this.vacc+", alt="+this.altitude);
		_globals.lat=this.lat;
		_globals.long=this.long;
		_globals.hacc=this.hacc;
		_globals.vacc=this.vacc;
		_globals.altitude=this.altitude;
		_globals.gps=event;
		
		//$("debuginfo").innerHTML="hacc: "+this.hacc+"; vacc="+this.vacc;
		Mojo.Log.error("retrying="+this.retryingGPS);
		$("accuracy").innerHTML="Accuracy: &plusmn;"+this.hacc+"m";
		
		if(!this.retryingGPS){
			this.getVenues(event.latitude, event.longitude,event.horizAccuracy,event.vertAccuracy,event.altitude);
		}
	  //}else{
	  if(_globals.gpsAccuracy!=0 && _globals.gpsAccuracy<event.horizAccuracy && !this.retryingGPS){
	  	  	//handle lame results
	  	$('getting-gps-alert').hide();
//		$('gpsmsg').innerHTML = 'Recalculating Location...';
		//$("log").innerHTML="setting up widgets";

		$("gps_banner").show();
		$("banner_text").innerHTML=" Accuracizing venues...";
		$("smallSpinner").show();
		//$("smallSpinner").mojo.start();
		$("refresh-venues").hide();
		//$("log").innerHTML="setup widgets";

		this.retryingGPS=true;
		//$("log").innerHTML="getting new accuracy...";
		this.controller.serviceRequest('palm://com.palm.location', {
			method: "getCurrentPosition",
			parameters: {accuracy: 1, maximumAge:0, responseTime: 2},
			onSuccess: this.gotLocationAgain.bind(this),
			onFailure: this.failedLocation.bind(this)
		});
	  }else{
	  	$('getting-gps-alert').hide();
//		$('gpsmsg').innerHTML = 'Recalculating Location...';
		this.retryingGPS=false;	  
	  }
	} else {
		$('getting-gps-alert').hide();
		$('message').innerHTML = "gps error: " + event.errorCode;
		Mojo.Log.error("gps error: " + event.errorCode);
		Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
	}
}

NearbyVenuesAssistant.prototype.gotLocationAgain = function(event) {
	//only do something if we got a better accuracy
	//$("log").innerHTML="got new accuracy...";

	if(event.horizAccuracy<this.hacc){
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		Mojo.Log.error("hacc="+this.hacc+", vacc="+this.vacc+", alt="+this.altitude);
		_globals.lat=this.lat;
		_globals.long=this.long;
		_globals.hacc=this.hacc;
		_globals.vacc=this.vacc;
		_globals.altitude=this.altitude;
		_globals.gps=event;
		$("gps_banner").show();
		//$("smallSpinner").mojo.stop();
		$("smallSpinner").hide();
		$("banner_text").innerHTML="Hey! Upped the accuracy! ";
		$("refresh-venues").show();
		this.retryingGPS=false;
	}else{
		$("gps_banner").hide();
		$("smallSpinner").mojo.stop();
		$("smallSpinner").hide();
		$("refresh-venues").hide();
			//$("log").innerHTML="gave up on gps";
		this.retryingGPS=false;

	}
}

NearbyVenuesAssistant.prototype.failedLocation = function(event) {
	$('message').innerHTML = 'failed to get location: ' + event.errorCode;
	Mojo.Log.error('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
}

NearbyVenuesAssistant.prototype.getVenues = function(latitude, longitude,hacc,vacc,alt) {
	$('message').innerHTML += '<br/>Searching Venues...';
	Mojo.Log.error("--------lat="+latitude+", long="+longitude);
	
	var query = this.textModel.value;
	this.query=query;
	//$('message').innerHTML += "("+query+")";
	//var query='';
	var url = 'http://api.foursquare.com/v1/venues.json';
	auth = _globals.auth;
	var radius=(query!="")? 1.5: 0.5;
	//var vlimit=(query!="")? 20: 15;
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

		
		if(response.responseJSON.groups[0] != undefined) { //actually got some venues
			Mojo.Log.error("groups="+response.responseJSON.groups.length);
			this.setvenues=true;
			for(var g=0;g<response.responseJSON.groups.length;g++) {
				Mojo.Log.error("##########in the loop");
				var varray=response.responseJSON.groups[g].venues;
				Mojo.Log.error("#######got venues="+varray.length);
				var grouping=response.responseJSON.groups[g].type;
				Mojo.Log.error("########grouping="+grouping);
				for(var v=0;v<varray.length;v++) {
					venueList.push(varray[v]);
					var dist=venueList[venueList.length-1].distance;
					
					if(_globals.units=="si") {					
						var amile=0.000621371192;
						dist=roundNumber(dist*amile,1);
						var unit="";
						if(dist==1){unit="mile";}else{unit="miles";}
					}else{
						dist=roundNumber(dist/1000,1);
						var unit="";
						if(dist==1){unit="KM";}else{unit="KM";}						
					}
					
					venueList[venueList.length-1].distance=dist;
					venueList[venueList.length-1].unit=unit;
					venueList[venueList.length-1].grouping=grouping;
					if(grouping.indexOf("Matching")>-1) {  //searching
						this.setvenues=false;
					}
				}
			}
		}
		
		
			//$('message').innerHTML = response.responseText;

		
		//now set the result list to the list's model
		Mojo.Log.error("search="+this.setvenues);
		if(this.setvenues==true || this.setvenues==undefined){
			_globals.actualVenues=venueList;
			this.setvenues=false;
		}
		_globals.nearbyVenues=venueList;
		this.resultsModel.items =venueList;// $A(venueList);
		this.controller.modelChanged(this.resultsModel);

	}
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

NearbyVenuesAssistant.prototype.nearbyVenueRequestFailed = function(response) {
	$('message').innerHTML = 'Failed to get Venues';
}

NearbyVenuesAssistant.prototype.performSearch = function(query) {


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
	
	this.controller.stageController.swapScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item,this.username,this.password,this.uid,false,this);
}

NearbyVenuesAssistant.prototype.checkIn = function(id, n) {
	
	if (_globals.auth) {
		$('message').innerHTML = 'Checking into ' + n;
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
	/*var dialog = this.controller.showDialog({
		template: 'listtemplates/add-venue',
		assistant: new AddVenueDialogAssistant(this,auth)
	});*/
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},auth);

}


NearbyVenuesAssistant.prototype.onKeyPressHandler = function(event) {
	/*$("sendField").mojo.focus();
	var scroller = this.controller.getSceneScroller();
	scroller.mojo.revealTop(0);
	$("drawerId").mojo.setOpenState(true);
	this.controller.modelChanged(this.drawerModel);
	//this.textModel.value=String.fromCharCode(event.originalEvent.keyCode);
	//wthis.controller.modelChanged(this.textModel);*/
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
					var os=$("drawerId").mojo.getOpenState();
					if(os) {
						$("sendField").mojo.focus();
					}else{
						$("sendField").mojo.blur();
					}
                	break;
                case "nearby-venues":
                	Mojo.Log.error("cache len="+_globals.actualVenues.length);
                	this.resultsModel.items=_globals.actualVenues;
                	Mojo.Log.error("items len="+this.resultsModel.items.length);
                	this.controller.modelChanged(this.resultsModel);
					$("results-venue-list").mojo.noticeUpdatedItems(0, _globals.actualVenues);
			  		$("results-venue-list").mojo.setCount(_globals.actualVenues.length);
                	this.dosearch=false;
	                $("drawerId").mojo.setOpenState(false);
                	break;
				case "venue-map":
					this.controller.stageController.pushScene({name: "nearby-venues-map", transition: Mojo.Transition.crossFade},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this,this.query);
					break;
				case "do-Venues":
                //	var thisauth=auth;
				// 	this.controller.stageController.pushScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid);
					break;
				case "do-Friends":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
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
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
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
                	/*$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
                	//_globals.nearbyVenues=$A([]);
                	_globals.reloadVenues=true;
					this.onGetNearbyVenues();*/
					_globals.nearbyVenues=undefined;
					_globals.reloadVenues=true;
					
					this.controller.stageController.swapScene('nearby-venues',auth,userData,_globals.username,_globals.password,_globals.uid)
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
 // var matchingSubset = this.getMatches(filterString, offset, limit);
 // listWidget.mojo.noticeUpdatedItems(offset, matchingSubset);
//  listWidget.mojo.setLength(matchingSubset.length);
Mojo.Log.error("###filter="+filterString+", offset="+offset+", limit="+limit+", widget="+widget.id);
	var matches=Array();
	if(filterString=="") {
		matches=_globals.nearbyVenues;
	}else{
	  if(_globals.nearbyVenues!=undefined) {
		for(var m=0;m<_globals.nearbyVenues.length;m++) {
			var vname=_globals.nearbyVenues[m].name;
	  		if(vname.toLowerCase().indexOf(filterString.toLowerCase())>-1) {
	  			//Mojo.Log.error("##This is one:"+_globals.nearbyVenues[m].name);
	  			matches.push(_globals.nearbyVenues[m]);
	  		}
		}
	  }
	}
	if(matches!=undefined){
		widget.mojo.noticeUpdatedItems(offset, matches);
  		widget.mojo.setCount(matches.length);
  	}	
}

NearbyVenuesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	     //  this.onGetNearbyVenues();
	//    this.cmmodel.items[0].toggleCmd="do-Nothing";
	  //  this.controller.modelChanged(this.cmmodel);
    $("sendField").mojo.blur();

	   if(_globals.nearbyVenues!=undefined){
			$("resultListBox").style.display = 'block';
	   		$("spinnerId").mojo.stop();
			$("spinnerId").hide();
	   }
	   
	   if(this.showSearch) {
			var scroller = this.controller.getSceneScroller();
			scroller.mojo.revealTop(0);
			this.controller.get("drawerId").mojo.setOpenState(true);
			this.controller.modelChanged(this.drawerModel);

	   }
	   
	   if(_globals.reloadVenues) {
                	$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
                	_globals.nearbyVenues=undefined;
					this.onGetNearbyVenues();
	   }
}


NearbyVenuesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyVenuesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
