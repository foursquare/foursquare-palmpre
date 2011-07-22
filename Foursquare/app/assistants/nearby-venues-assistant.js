function NearbyVenuesAssistant(a, ud, un, pw,i,ss,q,what) {
	 this.getApproxAddress=true;
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
	 this.metatap=false;
	 this.reverseGeos=[];
	 
	// _globals.userData=ud;
	// _globals.username=un;
	// _globals.password=pw;
	// _globals.uid=i;
	 _globals.gpsLoop=0;
	 	 
	 
	 switch(what) {
	 	case "list":
	 		this.showList=true;
	 		break;
	 	default:
	 		this.showList=true;
	 		break;
	 }
	 
	 this.searchDelay=undefined;

	if(_globals.fromSearch){
		
		this.query=_globals.jtQuery;
		_globals.fromSearch=false;
	}

	 if(_globals.lat==undefined){
		foursquareGet(this,{
		 	endpoint: 'users/self',
		 	requiresAuth: true,
		 	ignoreErrors: true,
		 	parameters: {},
		 	onSuccess: _globals.userSuccess.bind(this),
		 	onFailure: _globals.userFailed.bind(this),
		 	requiresAuth: true
		});	 
	 }

}
NearbyVenuesAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

NearbyVenuesAssistant.prototype.setup = function() {

		NavMenu.setup(this,{buttons: 'venues'});

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
			hintText: '',
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
			requiresEnterKey: false,
			autoFocus:		true
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
					      this.resultsAttributes={itemTemplate:'listtemplates/venueItems',dividerFunction: this.groupVenues,dividerTemplate: 'listtemplates/dividertemplate',filterFunction: this.filterFunction.bind(this),swipeToDelete: false,onItemRendered:this.fixItem.bind(this),addItemLabel:$L("Add Venue...")},
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
		this.doc=this.controller.document;

	this.onGetNearbyVenueSearchBound=this.onGetNearbyVenuesSearch.bind(this);
	//this.doRecommendBound=this.doRecommend.bind(this);
	this.listWasTappedBound=this.listWasTapped.bind(this);
	//this.listHideItemBound=this.listHideItem.bind(this);
	this.addNewVenueBound=this.addNewVenue.bind(this);
	this.onKeyPressHandlerBound= this.onKeyPressHandler.bindAsEventListener(this);
	this.keyDownHandlerBound=this.keyDownHandler.bindAsEventListener(this);
	this.refreshVenuesBound=this.refreshVenues.bind(this);
	this.keyUpHandlerBound=this.keyUpHandler.bindAsEventListener(this);
	//this.handleShakeBound=this.handleShake.bind(this);
	//this.showMenuBound=this.showMenu.bind(this);
	this.gotLocationBound=this.gotLocation.bind(this);
	this.showRefreshBound=this.showRefresh.bind(this);
	this.hideRetryBannerBound=this.hideRetryBanner.bind(this);
	this.gotLocationAgainBound=this.gotLocationAgain.bind(this);
	this.loadVenuesBound=this.loadVenues.bind(this);
	this.venuelessCheckinBound=this.venuelessCheckin.bind(this);
	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);
	Mojo.Event.listen(this.controller.get('search-checkin'),Mojo.Event.tap, this.venuelessCheckinBound);
	Mojo.Event.listen(this.controller.get('search-add-venue'),Mojo.Event.tap, this.addNewVenueBound);
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listAdd, this.addNewVenueBound);
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandlerBound);
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
	Mojo.Event.listen(this.controller.get('refresh-venues'),Mojo.Event.tap, this.refreshVenuesBound);
    Mojo.Event.listen(this.doc,"keyup", this.keyUpHandlerBound, true);
	Mojo.Event.listen(this.controller.get('gotloc'),"handleit", this.gotLocationBound);
	Mojo.Event.listen(this.controller.get('gotloc'),"showrefresh", this.showRefreshBound);
	Mojo.Event.listen(this.controller.get('gotloc'),"gaveup", this.hideRetryBannerBound);
	Mojo.Event.listen(this.controller.get('gotlocagain'),"handleit", this.gotLocationAgainBound);
	Mojo.Event.listen(this.controller.get('retryloc'),"handleit", this.loadVenuesBound);
//	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenueSearchBound);
	//Mojo.Event.listen(this.controller.get('recommend'),Mojo.Event.tap, this.doRecommendBound);
	//Mojo.Event.listen(this.controller.get('results-venue-list'),Mojo.Event.listDelete, this.listHideItemBound);
    //this.doc.addEventListener("shaking",this.handleShakeBound, true);
	//Mojo.Event.listen(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenuBound);

	_globals.ammodel.items[0].disabled=false;
	_globals.ammodel.items[1].disabled=false;

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    zBar.activeScene=this;

    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
		{
          	visible: true,
        	items: [ 
                 {items:[
                 	{ iconPath: "images/map-pin.png", command: "venue-map"},
                 	{ iconPath: "images/specials-button.png", command: "nearby-specials"},
               	 ]},
                 {},
                 {items: [
    	             { icon: "refresh", command: "do-Refresh"}
    	         ]}
                 
                 ]
    });
    
    

/*    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });*/
  	this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('spinnerId', this.spinnerAttr, this.spinnerModel);
	this.controller.get("spinnerId").show();

         
    this.controller.setupWidget("smallSpinner",
         this.attributes = {
             spinnerSize: 'small'
         },
         this.model = {
             spinning: true 
         });

	_globals.onVenues=true;
	if(!_globals.reloadVenues && _globals.nearbyVenues==undefined){
		this.gotLocation(_globals.gps);
	}else{
		logthis("venues: not loading venues");
		if(_globals.nearbyVenues==undefined && _globals.reloadVenues){
		   	if(this.query!="" && this.query!=undefined){
		   		logthis("it has a query: '"+this.query+"'");
		   		this.textModel.value=this.query;
		   		this.controller.modelChanged(this.textModel);
		   		this.onGetNearbyVenuesSearch();
		   	}else{
		   		logthis("no query");
			   	this.onGetNearbyVenues();
			}
		}else{
			this.venueList=_globals.nearbyVenues;
			this.resultsModel.items =this.venueList;
			this.controller.modelChanged(this.resultsModel);
			this.controller.get("accuracy").innerHTML=_globals.nearness+" ("+_globals.accuracy+")";
		}
	}

	this.controller.get("fakefield").focus(); //focuses a hidden field so the real search field doesn't double-type the first letter

    _globals.firstLoad=false;
	
	//are we still trying to get better gps accuracy in the bg?
	if(_globals.retryingGPS==true){
		this.controller.get("gps_banner").show();
		this.controller.get("smallSpinner").show();
		this.controller.get("banner_text").update("Getting better accuracy... ("+roundNumber(_globals.hacc,2)+"m)");
	}else{
		this.controller.get("gps_banner").hide();
		this.controller.get("smallSpinner").hide();
	}
	this.controller.get("refresh-venues").hide();
    this.controller.get("message").hide();
   	
	
	_globals.checkUpdate(this);
	
	if(_globals.showShout==true){
    	var thisauth="";
		this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this,_globals.jtShout);
	}

}


var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

NearbyVenuesAssistant.prototype.stageActivate = function(event) {
			NavMenu.setup(this,{buttons: 'venues'});
			this.metatap=false;
	if(_globals.showShout==true){
    	var thisauth="";
    	_globals.showShout=false;
		this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this,_globals.jtShout);
	}

};

NearbyVenuesAssistant.prototype.showRefresh = function(event) {
	this.controller.get("smallSpinner").hide();
	this.controller.get("banner_text").update("Better accuracy! ("+roundNumber(_globals.hacc,2)+"m)");
	this.controller.get("refresh-venues").show();
}

NearbyVenuesAssistant.prototype.hideRetryBanner = function(event) {
	this.controller.get("smallSpinner").hide();
	this.controller.get("banner_text").update("Couldn't get better accuracy. :(");
	this.controller.get("refresh-venues").hide();
	setTimeout(function(){
		this.controller.get("gps_banner").hide();	
	}.bind(this),3000);
}


NearbyVenuesAssistant.prototype.onGetNearbyVenuesSearch = function(event) {
	_globals.nearbyVenues=undefined;
	this.dosearch=true;
	this.controller.get("spinnerId").show();
	this.controller.get("spinnerId").mojo.start();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();
	
	this.controller.get("searchfailed").show();
	try{
		this.controller.get("results-venue-list").mojo.showAddItem(true);
	}catch(e){
	
	}

	this.onGetNearbyVenues();
}

NearbyVenuesAssistant.prototype.getSpecials = function(event){
	//basically fake it out tot hink we're doing a normal search
//	_globals.nearbyVenues=undefined;
//	this.dosearch=true;

	if(this.resultsModel.items==this.specialsItems){
		this.resultsModel.items=this.venueList;
		this.controller.modelChanged(this.resultsModel);
	}else{
		//this.controller.get("spinnerId").show();
		//this.controller.get("spinnerId").mojo.start();
		var scroller=this.controller.getSceneScroller();
		scroller.mojo.revealTop();
		//this.controller.get("resultListBox").style.display = 'none';

		this.resultsModel.items=this.specialsItems;
		this.controller.modelChanged(this.resultsModel);
		//this.controller.get("spinnerId").hide();
		//this.controller.get("resultListBox").style.display = 'block';

		/* foursquareGet(this, {
		 	endpoint: 'specials/search',
		 	requiresAuth: true,
		   parameters: {ll:_globals.lat+","+_globals.long, llAcc:_globals.hacc, altAcc:_globals.vacc, alt:_globals.altitutde, limit:50},
		   onSuccess: this.specialsSuccess.bind(this),
		   onFailure: this.specialsFailed.bind(this)	,
		   debug: true	
		 });	*/
		 
		 
	}		
};

NearbyVenuesAssistant.prototype.specialsSuccess = function(r){
	if(r.meta.code==200){
		logthis("specials ok");
		var specials=r.response.specials;
		var varray=[];
		if(specials.count>0){
			this.controller.get("special-number").update(specials.count);
			this.controller.get("specials-count").show();
			for(var v=0;v<specials.items.length;v++){
				var venue=specials.items[v].venue;
				console.log("special venue="+venue);
				if(venue.categories.length==0){
					venue.primarycategory={};
					venue.primarycategory.icon="images/no-cat.png";
				}else{
					venue.primarycategory=venue.categories[0];
				}
				venue.specialimage='<img src="images/small-special.png" class="small-special">';

				if(venue.location.crossStreet!=undefined){
					if(venue.location.crossStreet!=""){
						venue.crossstreet=" ("+venue.location.crossStreet+")";
					}
				}

				var dist=venue.location.distance;
				var rawdist=venue.location.distance;
				
				if(_globals.units=="si") {					
					var amile=0.000621371192;
					dist=roundNumber(dist*amile,2);
					var unit="";
					if(dist==1){unit="miles";}else{unit="miles";}
				}else if(_globals.units=="metric") {
					dist=roundNumber(dist/1000,2);
					var unit="";
					if(dist==1){unit="km";}else{unit="km";}						
				}else{
					if(dist==1){unit="meters";}else{unit="meters";}						
				}
				
				venue.distance=dist;
				venue.unit=unit;
				venue.rawdist=rawdist;
				venue.dogear="none";

				venue.grouping="Nearby Specials";
				varray.push(venue);
			}
			
			this.specialsItems=varray;
			//this.resultsModel.items=varray;
			//this.controller.modelChanged(this.resultsModel);
			//this.controller.get("spinnerId").hide();
			//this.controller.get("resultListBox").style.display = 'block';
		}else{
			this.specialsFailed(r);
		}
	}else{
		this.specialsFailed(r);
	}
};

NearbyVenuesAssistant.prototype.specialsFailed = function(r){
	this.resultsModel.items=_globals.nearbyVenues;
	this.controller.modelChanged(this.resultsModel);
	this.controller.get("spinnerId").hide();
	this.controller.get("resultListBox").style.display = 'block';
	Mojo.Controller.getAppController().showBanner("No nearby specials found!", {source: 'notification'});
};

NearbyVenuesAssistant.prototype.doRecommend = function(event) {
	if(this.resultsModel.items.length==50){
		this.controller.stageController.pushScene("recommend",this.resultsModel.items);
	}else{
		this.controller.stageController.pushScene("recommend",[]);	
	}
}


NearbyVenuesAssistant.prototype.onGetNearbyVenues = function(event) {
	this.controller.get('getting-gps-alert').hide();
	if(_globals.nearbyVenues==undefined || _globals.reloadVenues==true) {
		logthis("here1");
		_globals.reloadVenues=false;
		_globals.nearbyVenues=undefined;
	//logthis("reloading venues");
		//hide the result list box and clear out it's model
		this.controller.get("resultListBox").style.display = 'none';

		this.controller.get('message').innerHTML = 'Calculating Location';

		if(!this.dosearch) {
			logthis("not doing search2");
			this.controller.get("searchfailed").hide();
			try{
				this.controller.get("results-venue-list").mojo.showAddItem(true);
			}catch(e){
			
			}

		//get the location. set the maximum age to 0 if we're reloading the list so we dont reuse the coords
			var ma=(_globals.reloadVenues)? 0: 30;
		  if(_globals.firstLoad==false){
		  
		  	logthis("getting new coords3");
			this.controller.get('getting-gps-alert').show();
			this.controller.serviceRequest('palm://com.palm.location', {
				method: "getCurrentPosition",
				parameters: {accuracy: 1, maximumAge:0, responseTime: 1},
				onSuccess: this.gotLocation.bind(this),
				onFailure: this.failedLocation.bind(this)
			});
		  }else{
		  		logthis("is first load3");
			  _globals.firstLoad=false;
			  logthis("gps="+Object.toJSON(_globals.gps));
			  this.gotLocation(_globals.gps);
		  }
		}else{
			logthis("is dosearch2");
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

		this.getVenues(_globals.lat, _globals.long,_globals.hacc,_globals.vacc,_globals.altitude);
}

NearbyVenuesAssistant.prototype.gotLocation = function(event) {
	logthis("doing gotlocation");
	logthis(Object.toJSON(event));
	//event=(event)? event:  _globals.GPS.get();
	if(event.latitude==null && _globals.gpsLoop<4){
		_globals.GPS=undefined;
		_globals.GPS = new Location(this.gotLocation.bind(this));
		_globals.GPS.start();
		_globals.gpsLoop++;
		return;
	}else if(event.latitude!=null && !_globals.retryingGPS){
		//logthis("stopping gps 999");
		//_globals.GPS.stop();
	}
	if(_globals.gpsLoop>=4){
		logthis("stopping gps 000");
		_globals.GPS.stop();
		this.controller.showAlertDialog({
			onChoose: function(value) {opts.onFailure(r);},
			title: $L("Error"),
			message: $L("Your phone's GPS seems to be malfunctioning and is returning null values for its position. Try turning Airport Mode on and then off and retrying. If that doesn't fix things, try restarting your phone."),
			allowHTMLMessage: true,
			choices:[
				{label:$L('D\'oh!'), value:"OK", type:'primary'}
			]
		});

	}
	logthis(Object.toJSON(event));
	if(event.errorCode == 0) {
		//check their prefs. if the results are good enough, carry on
		//otherwise, repoll the gps
		this.controller.get('getting-gps-alert').hide();
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
		_globals.accuracy="&plusmn;"+roundNumber(this.hacc,2)+"m";
		this.controller.get("accuracy").innerHTML="Accuracy: "+_globals.accuracy;

		this.getVenues(event.latitude, event.longitude,event.horizAccuracy,event.vertAccuracy,event.altitude);
	} else {
		this.controller.get('getting-gps-alert').hide();
		Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
	}
}

NearbyVenuesAssistant.prototype.loadVenues = function() {
	event=_globals.gps;
		this.lat=event.latitude;
		this.long=event.longitude;
		this.hacc=event.horizAccuracy;
		this.vacc=event.vertAccuracy;
		this.altitude=event.altitude;
		this.getVenues(event.latitude, event.longitude,event.horizAccuracy,event.vertAccuracy,event.altitude);
}

NearbyVenuesAssistant.prototype.gotLocationAgain = function(event) {
	//only do something if we got a better accuracy
	logthis("getting again");
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
	logthis('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});
}

NearbyVenuesAssistant.prototype.getVenues = function(latitude, longitude,hacc,vacc,alt) {
	//	logthis("getvenues");

	//this.controller.get('message').innerHTML += '<br/>Searching Venues...';
		//logthis("msg");
		//logthis("lat=%i, long=%i",_globals.lat,_globals.long);

	this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: _globals.lat, longitude:_globals.long},
			onSuccess: function(address){
				//logthis("reversing loc");
				_globals.nearness="Near "+address.substreet+" "+address.street+" "+address.city+", "+address.state;
				this.controller.get("accuracy").innerHTML=_globals.nearness+" ("+_globals.accuracy+")";
			}.bind(this),
			onFailure: function(){		logthis("reverse loc failed");}.bind(this)
		});

	var query = this.textModel.value;
	this.query=query;
	var vlimit=_globals.venueCount || 25;
	 
	 foursquareGetMulti(this, {
	 	endpoints: '/venues/search?ll='+encodeURIComponent(latitude+','+longitude)+'&llAcc='+hacc+'&altAcc='+vacc+'&alt='+alt+'&limit='+vlimit+'&query='+encodeURIComponent(query)+'&intent=checkin,/specials/search?ll='+encodeURIComponent(latitude+','+longitude)+'&llAcc='+hacc+'&altAcc='+vacc+'&alt='+alt+'&limit=50',
	 	requiresAuth: true,
	   onSuccess: this.nearbyVenueRequestSuccess.bind(this),
	   onFailure: this.nearbyVenueRequestFailed.bind(this)	,
	   debug: true	
	 });
}

NearbyVenuesAssistant.prototype.fixItem = function(list,item,dom){
	if(item.address!=undefined && item.address != "" && item.address!=null && !this.getApproxAddress) {
	}else{
		var idx=item.id; //store the venue id
		/*this.reverseGeos.push(this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: item.geolat, longitude:item.geolong},
			onSuccess: function(address){
				item.address="Near "+address.substreet+" "+address.street;
				var addy=zBar.getElementsByClassName("venue-address",dom)[0];
				addy.innerHTML="Near "+address.substreet+" "+address.street;
			}.bind(this),
			onFailure: function(){}.bind(this)
		}));*/
	}

}


NearbyVenuesAssistant.prototype.nearbyVenueRequestSuccess = function(response) {
logthis("got venues");
//	var mybutton = this.controller.get('go_button');
//	mybutton.mojo.deactivate();
	
		//logthis(response.responseText);
	var j=response.responseJSON;
	var r=j.response.responses;
	var venuesResponse=r[0].response;
	var specialsResponse=r[1];
	
	
	if (j == undefined || (response.responseText=='{"venues":null}') || (response.responseText=='{"venues":[]}')) {
		logthis("no results");
		this.controller.get('message').innerHTML = 'No Results Found';
		//logthis("no results");
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get("resultListBox").style.display = 'block';
		this.controller.get("noresults").show();
	}
	else {
		logthis("results");
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get("resultListBox").style.display = 'block';
		this.controller.get("noresults").hide();
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.venueList = [];
		this.housesList=[];

//		logthis(Object.toJSON(venuesResponse.groups[0]));
		var grouping="Nearby";
//		if(venuesResponse.groups[0] != undefined) { //actually got some venues
			this.setvenues=true;
			/*for(var g=0;g<venuesResponse.groups.length;g++) {
				var varray=venuesResponse.groups[g].items;
				var grouping=venuesResponse.groups[g].name;
				if(venuesResponse.groups[g].type=="trending" || venuesResponse.groups[g].type=="pollingplaces"){
					var bgcolor="#f7f7f7";
				}else{
					var bgcolor="transparent";
				}*/
				
				varray=venuesResponse.venues;
				logthis("butts");
				logthis("venues="+Object.toJSON(varray));

				//varray.sort(function(a, b){return (a.location.distance - b.location.distance);});

				for(var v=0;v<varray.length;v++) {
					logthis("in venue array");
					var tmp_venue=varray[v];
					logthis("tmp_venue="+Object.toJSON(tmp_venue));
					//tmp_venue.bgcolor=bgcolor;
					//this.venueList.push(varray[v]);
					var dist=tmp_venue.location.distance;
					var rawdist=tmp_venue.location.distance;
					
					logthis("1");
					
					if(_globals.units=="si") {					
						var amile=0.000621371192;
						dist=roundNumber(dist*amile,2);
						var unit="";
						if(dist==1){unit="miles";}else{unit="miles";}
					}else if(_globals.units=="metric") {
						dist=roundNumber(dist/1000,2);
						var unit="";
						if(dist==1){unit="km";}else{unit="km";}						
					}else{
						if(dist==1){unit="meters";}else{unit="meters";}						
					}
					logthis("2");
					
					//handle people here
					var herenow=(tmp_venue.hereNow)? tmp_venue.hereNow.count: 0;
					if(herenow>0){
						tmp_venue.peopleicon="on";
					}else{
						tmp_venue.peopleicon="off";
					}
					logthis("3");
					
					tmp_venue.herepeople=(herenow==1)? "person": "people";
					
					//handle ismayor
					if(tmp_venue.ismayor){
						tmp_venue.mayoricon='<img src="images/crown_smallgrey.png"/>';
					}
					
					tmp_venue.grouping=grouping;

					logthis("4");


					//handle empty category
					if(tmp_venue.categories.length==0){
						tmp_venue.primarycategory={};
						tmp_venue.primarycategory.icon="images/no-cat.png";
					}else{
						tmp_venue.primarycategory=tmp_venue.categories[0];
						
					}
					logthis("5");
					
					if(tmp_venue.todos){
						if(tmp_venue.todos.count>0){
							tmp_venue.dogear="block";
						}else{
							tmp_venue.dogear="none";
						}
					}else{
						tmp_venue.dogear="none";
					}

					logthis("6");
					
					if(tmp_venue.specials!=undefined){
						if(tmp_venue.specials.length>0){
							tmp_venue.specialimage='<img src="images/small-special.png" class="small-special">';
						}
					}
					logthis("7");
					
					if(tmp_venue.location.crossStreet!=undefined){
						if(tmp_venue.location.crossStreet!=""){
							tmp_venue.crossstreet=" ("+tmp_venue.location.crossStreet+")";
						}
					}
					logthis("8");
					
					tmp_venue.distance=dist;
					tmp_venue.unit=unit;
					tmp_venue.rawdistance=rawdist;
					/*if(_globals.hiddenVenues.inArray(varray[v].id)){
				  		//hide it!
				  		this.venueList[this.venueList.length-1].grouping="Hidden";
					}else{*/
					//}
					logthis("9");
					
					var ar="main";
					if(tmp_venue.primarycategory.id!=undefined){
						if(tmp_venue.primarycategory.id=="4bf58dd8d48988d103941735" && _globals.houses=="yes"){
							tmp_venue.grouping="Houses";
							ar="houses";
						}else{
							ar="main";
						}				
					}else{
						var vname=tmp_venue.name.toLowerCase();
						if((vname.indexOf("'s house")!=-1 || vname.indexOf("my house")!=-1 || vname.indexOf("my bed")!=-1 || vname.indexOf("my bathroom")!=-1 || vname.indexOf("'s bed")!=-1 || vname=="home" || vname.indexOf("'s home")!=-1) && _globals.houses=="yes"){
							tmp_venue.grouping="Houses";
							ar="houses";
						}else{
							ar="main";
						}
					}
					logthis("10");
					
					switch(ar){
						case "main":
							this.venueList.push(tmp_venue);
							break;
						case "houses":
							this.housesList.push(tmp_venue);
							break;
					}

					logthis("11");
					
					
			//		this.venueList.push(varray[v]);
					if(grouping.indexOf("Matching")>-1) {  //searching
						this.setvenues=false;
					}
					logthis("12");
					
				}
			//}
					logthis("13");
			
			this.lastId=this.venueList[this.venueList.length-1].id;
		//}
		logthis("rawdist="+tmp_venue.rawdistance);
		this.venueList=this.venueList.concat(this.housesList); //append houses to bottom of the list

		
		//now set the result list to the list's model
		if(this.setvenues==true || this.setvenues==undefined){
			_globals.actualVenues=this.venueList;
			this.setvenues=false;
		}
		_globals.nearbyVenues=this.venueList;
		this.resultsModel.items =this.venueList;
		this.controller.modelChanged(this.resultsModel);
		

	}
	logthis("done venues stuff");
	
	logthis("handle specials");
	this.specialsSuccess(specialsResponse);
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
	this.controller.get("sendField").hide();
	this.searchShowing=false;	
	this.getApproxAddress=false;	
	
	if(!this.metatap){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},event.item,this.username,this.password,this.uid,false,this);
	}else{
         var stageArguments = {name: "mainStage"+event.item.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},event.item,this.username,this.password,this.uid,false,this);
         
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");

	}
}

NearbyVenuesAssistant.prototype.listHideItem = function(event) {
	var venue=event.item;
	_globals.hiddenVenues.push(venue.id);
	this.resultsModel.items[event.index].grouping="Hidden";
	this.controller.modelChanged(this.resultsModel);
	
	this.controller.get("results-venue-list").mojo.noticeUpdatedItems(0, this.resultsModel.items);
	this.controller.get("results-venue-list").mojo.setCount(this.resultsModel.items.length);

}



NearbyVenuesAssistant.prototype.groupVenues = function(data){
	return data.grouping;
}

NearbyVenuesAssistant.prototype.addNewVenue = function(){
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},auth, undefined, undefined, this.controller.get("sendField").mojo.getValue());

}

NearbyVenuesAssistant.prototype.venuelessCheckin = function(){
	this.controller.stageController.pushScene({name: "checkin", transition: Mojo.Transition.zoomFade},{name:this.controller.get("sendField").mojo.getValue()});
}

NearbyVenuesAssistant.prototype.keyDownHandler = function(event) {
	//show search field when a key is pressed that isn't delete
	window.clearTimeout(this.searchDelay);
	var key=event.originalEvent.keyCode;
	//logthis("key="+key);
//logthis("kd="+key);
	if(!this.searchShowing && key!=8 && key!=57575 && key != 27){
		this.searchShowing=true;
		this.controller.get("sendField").show();
		this.controller.get("sendField").mojo.focus();
		if(this.searchHasShown){
			//this.controller.setupWidget('sendField', this.textFieldAtt, this.textModel);
			var char=String.fromCharCode(event.originalEvent.keyCode);
			this.controller.get("sendField").mojo.setValue("");
		}
		this.searchHasShown=true;
	}
	
	if(key==8 && this.controller.get("sendField").mojo.getValue().length==0){
		this.controller.get("sendField").hide();
		this.searchShowing=false;		
	
	}
	
	
		if (key == 57575) {
			logthis("meta down");
			this.metatap = true;
		}
		
		logthis(event.metaKey);
		
}

NearbyVenuesAssistant.prototype.onKeyPressHandler = function(event) {
//	this.controller.get("sendField").mojo.focus();
}

NearbyVenuesAssistant.prototype.keyUpHandler = function(event) {
	logthis("keyup");
	var key=event.keyCode;
//logthis("ku="+key);
	if(this.textModel.value){
		if(this.textModel.value.length>1  && !Mojo.Char.isEnterKey(key) && key!=27){
			this.searchDelay=window.setTimeout(this.onGetNearbyVenuesSearch.bind(this),250);
		}
		//hide box if deleted last char; do search if key is enter key
		if(this.searchShowing && Mojo.Char.isEnterKey(key) && key!=27){
			window.clearTimeout(this.searchDelay);
			setTimeout(this.onGetNearbyVenuesSearch.bind(this), 10);
			this.controller.get("sendField").hide();
			this.searchShowing=false;		
		}
		if(this.searchShowing && key==8 && (this.textModel.value.length==1 || this.textModel.value.length==0)){
			this.controller.get("sendField").hide();
			this.searchShowing=false;		
		}
	}
	
		if (key==57575) {
			logthis("meta up");
			this.metatap = false;
		}

}


NearbyVenuesAssistant.prototype.hardRefresh = function(event) {
	
	_globals.nearbyVenues=undefined;
	_globals.reloadVenues=true;
	this.controller.stageController.swapScene('nearby-venues',_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid)

}

NearbyVenuesAssistant.prototype.handleCommand = function(event) {
		logthis("doingcommand");
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
				case "do-Profile":
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this,false);
                	break;
                case "do-Tips":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Explore":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "explore", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Todos":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
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
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.zoomFade},this);
                	break;
                case "do-Refresh":
                	if(this.searchShowing){
                		//clear search and load venues back
				   		this.textModel.value="";
				   		this.controller.modelChanged(this.textModel);
						this.controller.get("sendField").hide();
						this.searchShowing=false;		
				   		this.onGetNearbyVenuesSearch();
                	}else{
               			_globals.firstLoad=false;
						_globals.nearbyVenues=undefined;
						_globals.reloadVenues=true;
						this.controller.stageController.swapScene('nearby-venues',_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid)
					}
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Nothing":
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Search":
					if(this.searchShowing){						
						this.searchShowing=false;
						this.controller.get("sendField").hide();
					}else{
						this.searchShowing=true;
						this.controller.get("sendField").show();
						this.controller.get("sendField").mojo.focus();		
						this.searchHasShown=true;
					}
                	break;
                case "nearby-specials":
                	this.getSpecials();
                	break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.scrollTo(0,0,true);
					break;
            }
        }else if(event.type===Mojo.Event.forward){
			_globals.nearbyVenues=undefined;
			_globals.reloadVenues=true;
			_globals.firstLoad=false;
			this.controller.stageController.swapScene('nearby-venues',_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid)
        
        }else if(event.type===Mojo.Event.back){
			if(this.searchShowing){
				event.preventDefault();
				window.clearTimeout(this.searchDelay);
				this.controller.get("sendField").hide();
				this.searchShowing=false;		
			}  
			if(NavMenu.showing==true){
				event.preventDefault();
				NavMenu.hideMenu();
			}      
        }
    }
NearbyVenuesAssistant.prototype.filterFunction = function(filterString, widget, offset, limit) {
	var matches=Array();
	if(filterString=="") {
		matches=_globals.nearbyVenues;
	}else{
	  if(_globals.nearbyVenues!=undefined) {

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
   // this.controller.get("sendField").mojo.blur();
   logthis("activated");
   NavMenu.setThat(this);
   
   if(event!=undefined){
	   if(event.search!=undefined){
		   if(event.search){
			this.textModel.value=event.query;
			this.controller.modelChanged(this.textModel);
			this.onGetNearbyVenuesSearch();
		  }
	   }
	}

   // this.controller.get("vmenu-caption").update("Nearby");
   // this.controller.get("searchgroup").show();
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


	//display first run message
	this.cookie=new Mojo.Model.Cookie("firstrun");
	var cdata=this.cookie.get();
	var ver=(cdata)? cdata.version: "";
	if(ver!=Mojo.appInfo.version){
		/*var dialog = this.controller.showDialog({
			template: 'listtemplates/whatsnew',
			assistant: new WhatsNewDialogAssistant(this)
		});*/
		this.controller.stageController.pushScene({name:"view-walkthrough",transition:Mojo.Transition.zoomFade},_globals.whatsnew,true);

	}
	
	fsq.Metrix.checkBulletinBoard(this.controller, Mojo.appInfo.version);
	   //	this.controller.get("fakefield").focus(); //focuses a hidden field so the real search field doesn't double-type the first letter
	//this.controller.get("sendField").mojo.blur();
}

NearbyVenuesAssistant.prototype.deactivate = function(event) {
}

NearbyVenuesAssistant.prototype.cleanup = function(event) {
	_globals.onVenues=false;
    _globals.ammodel.items[1].disabled=true;
	this.controller.modelChanged(_globals.ammodel);

	Mojo.Event.stopListening(this.controller.get('results-venue-list'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.stopListening(this.controller.get('results-venue-list'),Mojo.Event.listAdd, this.addNewVenueBound);
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandlerBound);
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
	Mojo.Event.stopListening(this.controller.get('refresh-venues'),Mojo.Event.tap, this.refreshVenuesBound);
    Mojo.Event.stopListening(this.doc,"keyup", this.keyUpHandlerBound, true);
	Mojo.Event.stopListening(this.controller.get('gotloc'),"handleit", this.gotLocationBound);
	Mojo.Event.stopListening(this.controller.get('gotloc'),"showrefresh", this.showRefreshBound);
	Mojo.Event.stopListening(this.controller.get('gotloc'),"gaveup", this.hideRetryBannerBound);
	Mojo.Event.stopListening(this.controller.get('gotlocagain'),"handleit", this.gotLocationAgainBound);
	Mojo.Event.stopListening(this.controller.get('retryloc'),"handleit", this.loadVenuesBound);

	//Mojo.Event.stopListening(this.controller.get('results-venue-list'),Mojo.Event.listDelete, this.listHideItemBound);
//	Mojo.Event.stopListening(this.controller.get('go_button'),Mojo.Event.tap, this.onGetNearbyVenuesSearchBound);
	//Mojo.Event.stopListening(this.controller.get('recommend'),Mojo.Event.tap, this.doRecommendBound);
    //this.doc.removeEventListener("shaking",this.handleShakeBound, true);
	//Mojo.Event.stopListening(this.controller.get('vmenu'),Mojo.Event.tap, this.showMenuBound);

}
