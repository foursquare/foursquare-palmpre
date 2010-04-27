//Handle Global Vars 
_globals = {};
window.maps = window.maps || {};


_globals.db = new Mojo.Depot({name:"feed"}, function(){Mojo.Log.error("depot OK");}, function(){Mojo.Log.error("depot FAIL");}); 

//_globals.db.discard("feed");

_globals.onVenues=false;
_globals.retryingGPS=false;
_globals.hiddenVenues=[];
_globals.userData={};
_globals.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
          		{},
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/user_info.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'},
                 {}
                 ],
            toggleCmd: "do-Venues",
            checkEnabled: true
            }]
    };
_globals.main=_globals.main || {};

//function for callback on gps return
_globals.gotLocation = function(event) {
	Mojo.Log.error("appassistant: doing got location");
	
	if(_globals.mainLoaded){ //only continue if the main scene is loaded
		//set globals values
		_globals.lat=event.latitude;
		_globals.long=event.longitude;
		_globals.hacc=event.horizAccuracy;
		_globals.vacc=event.vertAccuracy;
		_globals.altitude=event.altitude;
		_globals.gps=event;
		
		//hang on to stage instance
		var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
				
		//get accuracy
		var acc=(_globals.gpsAccuracy != undefined)? Math.abs(_globals.gpsAccuracy): 750;
		Mojo.Log.error("acc="+acc);
		
		//check radius
		if(_globals.retryingGPS==false){
			if(acc>=_globals.hacc || acc==0){ 									//if requested radius is larger than 
				Mojo.Log.error("got it on first try");
				_globals.GPS.stop();											//actual or user doesn't care, AND first check, continue
				_globals.gotGPS=true;
			}else{																//if user cares and radius is larger than requested
				Mojo.Log.error("bad radius; retrying");
				_globals.retryingGPS=true;										//AND first check, restart GPS and let main push
				//_globals.GPS.restart();											//venues and alert user of crappy accuracy
				_globals.gotGPS=true;
			}
		}else{ //if _globals.retryingGPS==true...
			if(acc>=_globals.hacc && _globals.onVenues==true){
				Mojo.Log.error("got it second try");
				_globals.GPS.stop();
				_globals.retryingGPS=false;
				Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"showrefresh");
			}
			if(acc<_globals.hacc && _globals.onVenues==true){
				Mojo.Log.error("still bad radius");
				var now=(new Date().getTime());
				var diff=(now-_globals.gpsStart)/1000; //in seconds
				if(dff>=10){
					Mojo.Log.error("giving up");
					_globals.GPS.stop();
					_globals.retryingGPS=false;
					Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"gaveup");				
				}
			}
		}
		
	}
}

_globals.gotLocation2 = function(event) {
	Mojo.Log.error("doing got location2");
		_globals.lat=event.latitude;
		_globals.long=event.longitude;
		_globals.hacc=event.horizAccuracy;
		_globals.vacc=event.vertAccuracy;
		_globals.altitude=event.altitude;
		_globals.gps=event;
		_globals.gotGPS=true;
		Mojo.Log.error("li2="+_globals.loggedIn+", ov2="+_globals.onVenues);
		if(_globals.loggedIn && !_globals.onVenues){
			Mojo.Log.error("doing nothing...");
			_globals.firstLoad=true;
//			var appController = Mojo.Controller.getAppController();
//	  	  	var cardStageController = appController.getStageController("mainStage");
//			cardStageController.swapScene('nearby-venues',auth,userData,_globals.main.username,_globals.main.password,_globals.uid);
		}
		
		if(_globals.onVenues){
			Mojo.Log.error("onvenues2");
			var appController = Mojo.Controller.getAppController();
	  	  	var cardStageController = appController.getStageController("mainStage");
	  	  	cardStageController.delegateToSceneAssistant(NearbyVenuesAssistant.gotLocation,event);
			var stage = Mojo.Controller.getAppController().getStageProxy("mainStage");
		
			
			var acc=(_globals.gpsAccuracy != undefined)? Math.abs(_globals.gpsAccuracy): 0;
			Mojo.Log.error("acc="+acc);
			if((acc>_globals.GPS.get().horizAccuracy || acc==0) && _globals.retryingGPS==false){
				Mojo.Log.error("okay on first try2");
				_globals.GPS.stop();
				_globals.gpsokay=true;
				//Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"handleit");
				_globals.accuracy="&plusmn;"+roundNumber(_globals.hacc,2)+"m";
			}
			if((acc<_globals.GPS.get().horizAccuracy && acc!=0) && _globals.retryingGPS==false) {
					Mojo.Log.error("bad radius; retrying2");
					/*cardStageController.document.getElementById("gps_banner").show();
					cardStageController.document.getElementById("smallSpinner").hide();
					cardStageController.document.getElementById("banner_text").innerHTML="Getting better accuracy... ";
					cardStageController.document.getElementById("refresh-venues").show();
					cardStageController.document.getElementById("accuracy").innerHTML="Accuracy: &plusmn;"+roundNumber(this.hacc,2)+"m";
					Mojo.Event.send(cardStageController.document.getElementById("retryloc"),"handleit");*/


					_globals.GPS.stop();
					_globals.retryingGPS=true;
					_globals.GPS.restart();
			}
					
			if((acc>_globals.GPS.get().horizAccuracy && acc!=0) && _globals.retryingGPS==true){
						Mojo.Log.error("got it on second try2");
						_globals.GPS.stop();
						_globals.gpsokay=true;
						//Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"handleit");
						_globals.accuracy="&plusmn;"+roundNumber(_globals.hacc,2)+"m";
			}
					
			if((acc<_globals.GPS.get().horizAccuracy && acc!=0) && _globals.retryingGPS==true && _globals.gpsokay==false){
						Mojo.Log.error("giving up2");
						_globals.GPS.stop();
						_globals.gpsokay=true;
						_globals.retryingGPS=false;
						_globals.accuracy="&plusmn;"+roundNumber(_globals.hacc,2)+"m";

						//Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"handleit");
			}
			
		}


}



_globals.categoryFailed = function(event) {
	Mojo.Log.error("category failed");
}

_globals.categorySuccess = function(r) {
	Mojo.Log.error("got categories");
	Mojo.Log.error(Object.toJSON(r.responseJSON.categories));
	if(r.responseJSON.categories){
		_globals.categories=r.responseJSON.categories;
	}
}



function AppAssistant() {
	
}

AppAssistant.prototype.setup = function() {

    var cardStageController = this.controller.getStageController("mainStage");
    var dashboardStageController = this.controller.getStageController("fsqDash");

	/*if(!cardStageController && !dashboardStageController){ //no dash but no normal stage
	
    Mojo.Log.error("starting appassistant");
		
	   //grab categories in the background...
	 var url = "http://api.foursquare.com/v1/categories.json";
	 var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   onSuccess: _globals.categorySuccess.bind(this),
	   onFailure: _globals.categoryFailed.bind(this)
	 });
	}*/
//		_globals.GPS = new Location(_globals.gotLocation);
//		_globals.GPS.start();



    // Set up first timeout alarm
    this.setWakeup();
  
  _globals.GPS = new Location(_globals.gotLocation);
		_globals.GPS.start();
		var now=(new Date().getTime());
		_globals.gpsStart=now;
};


/********HANDLE NOTIFICATIONS****************/
AppAssistant.prototype.setWakeup = function() {    
    this.cookieData=new Mojo.Model.Cookie("notifications");
	var notifdata=this.cookieData.get();
	if(notifdata){
		var notifs=(notifdata.notifs=="1")? '1': '0';
		Mojo.Log.error("got cookie");
		_globals.notifs=notifs;
	}



    if (_globals.notifs == "1") {
    	Mojo.Log.error("setting alarm");
    try{
        this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
            method: "set",
            parameters: {
                "key": "com.foursquare.foursquare.update",
                "in": "00:30:00",
                "wakeup": true,
                "uri": "palm://com.palm.applicationManager/open",
                "params": {
                    "id": "com.foursquare.foursquare",
                    "params": {"action": "feedUpdate"}
                }
            },
            onSuccess: function(response) {
                Mojo.Log.error("Alarm Set Success", response.returnValue);
                _globals.wakeupTaskId = Object.toJSON(response.taskId);
            },
            onFailure: function(response) {
                Mojo.Log.error("Alarm Set Failure",
                    response.returnValue, response.errorText);
            }
        });
      }catch (e) {
Mojo.Log.error ('AppAssistant.clearSystemTimeout(): ' + e);
}
        Mojo.Log.error("Set Update Timeout");
    }
};



AppAssistant.prototype.handleLaunch = function (launchParams) {
    Mojo.Log.error("ReLaunch");
 
    var cardStageController = this.controller.getStageController("mainStage");
    var appController = Mojo.Controller.getAppController();
    
    if (!launchParams) {
        // FIRST LAUNCH
        // Look for an existing main stage by name.
        	   //grab categories in the background...
		 var url = "http://api.foursquare.com/v1/categories.json";
		 var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   onSuccess: _globals.categorySuccess.bind(this),
		   onFailure: _globals.categoryFailed.bind(this)
		 });
		/*taking this out while dash notifs aren't enabled
		_globals.GPS = new Location(_globals.gotLocation);
		_globals.GPS.start();
		var now=(new Date().getTime());
		_globals.gpsStart=now;*/

        if (cardStageController) {
            // If it exists, just bring it to the front by focusing its window.
            Mojo.Log.error("Main Stage Exists");
            //cardStageController.popScenesTo("feedList");
            cardStageController.activate();
        } else {
            // Create a callback function to set up the new main stage
            // once it is done loading. It is passed the new stage controller
            // as the first parameter.
            var pushMainScene = function(stageController) {
				this.cookieData=new Mojo.Model.Cookie("credentials");
				var credentials=this.cookieData.get();
	
	
				if (credentials/* && 1==2*//*uncomment the comment before this to force the login dialog*/){
					this.username=credentials.username;
					_globals.swf=credentials.swf || "1";
					Mojo.Log.error("swf="+_globals.swf);
					_globals.auth=credentials.auth;
					this.gpsdata=new Mojo.Model.Cookie("gpsdata");
					var gps=this.gpsdata.get();
					_globals.gpsAccuracy=(gps)? gps.gpsAccuracy*-1: 0;
		
					this.venuecount=new Mojo.Model.Cookie("venuecount");
					var vc=this.venuecount.get();
					_globals.venueCount=(vc)? vc.venueCount: 15;

					this.units=new Mojo.Model.Cookie("units");
					var un=this.units.get();
					_globals.units=(un)? un.units: "si";

					/*this.hv=new Mojo.Model.Cookie("hiddenVenues");
					var hv=this.hv.get();
					_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];*/


					this.flickr=new Mojo.Model.Cookie("flickr");
					var flickrinfo=this.flickr.get();
					_globals.flickr_token=(flickrinfo)? flickrinfo.token: undefined;
					_globals.flickr_username=(flickrinfo)? flickrinfo.username: undefined;
					_globals.flickr_fullname=(flickrinfo)? flickrinfo.fullname: undefined;
					_globals.flickr_nsid=(flickrinfo)? flickrinfo.nsid: undefined;
		
					zBar.stageController=stageController;		
					stageController.pushScene('main',true,credentials);


				}else{
					zBar.stageController=stageController;
					stageController.pushScene('main',false);
				}
	
            };
            var stageArguments = {name: "mainStage", lightweight: true,splashBackgroundName:Mojo.appPath+'images/splash.png'};
            this.controller.createStageWithCallback(stageArguments,
                pushMainScene.bind(this), "card");
        }
    }
    else {
        Mojo.Log.error("com.foursquare.foursquare -- Wakeup Call", launchParams.action);
		//_globals.GPS = new Location(_globals.gotLocation2);
		//_globals.GPS.start();
    switch (launchParams.action) {
                      
	    // UPDATE FEEDS
	    case "feedUpdate" :
	    	//turn off GPS:
	    	_globals.GPS.stop();
	        // Set next wakeup alarm
	        this.setWakeup();
	        
	        this.cookieData=new Mojo.Model.Cookie("credentials");
			var credentials=this.cookieData.get();
			if(credentials){
				_globals.auth=credentials.auth;
				_globals.uid=credentials.uid;
			}
			/*var gpsdata=_globals.GPS.get();
			_globals.lat=gpsdata.latitude;
			_globals.long=gpsdata.longitude;
			_globals.hacc=gpsdata.horizAccuracy;
			_globals.vacc=gpsdata.vertAccuracy;
			_globals.altitude=gpsdata.altitude;
			Mojo.Log.error("lat="+_globals.lat);
			_globals.userData={};
			_globals.firstLoad=true;
			_globals.gpsokay=true;
			_globals.retryingGPS=false;*/
						this.username=credentials.username;
						_globals.auth=credentials.auth;
						
						
						/*this.gpsdata=new Mojo.Model.Cookie("gpsdata");
						var gps=this.gpsdata.get();
						_globals.gpsAccuracy=(gps)? gps.gpsAccuracy*-1: 0;
			
						this.venuecount=new Mojo.Model.Cookie("venuecount");
						var vc=this.venuecount.get();
						_globals.venueCount=(vc)? vc.venueCount: 15;
	
						this.units=new Mojo.Model.Cookie("units");
						var un=this.units.get();
						_globals.units=(un)? un.units: "si";*/
	
						/*this.hv=new Mojo.Model.Cookie("hiddenVenues");
						var hv=this.hv.get();
						_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];*/
	
	
						/*this.flickr=new Mojo.Model.Cookie("flickr");
						var flickrinfo=this.flickr.get();
						_globals.flickr_token=(flickrinfo)? flickrinfo.token: undefined;
						_globals.flickr_username=(flickrinfo)? flickrinfo.username: undefined;
						_globals.flickr_fullname=(flickrinfo)? flickrinfo.fullname: undefined;
						_globals.flickr_nsid=(flickrinfo)? flickrinfo.nsid: undefined;
		_globals.cmmodel = {
	          visible: true,
	          items: [{
	          	items: [ 
	          		{},
	                 { iconPath: "images/venue_button.png", command: "do-Venues"},
	                 { iconPath: "images/friends_button.png", command: "do-Friends"},
	                 { iconPath: "images/todo_button.png", command: "do-Tips"},
	                 { iconPath: "images/user_info.png", command: "do-Badges"},
	                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'},
	                 {}
	                 ],
	            toggleCmd: "do-Friends",
	            checkEnabled: true
	            }]
	    };*/
	
	
	        // Update the feed list
	        Mojo.Log.error("Update FeedList");
			var url = 'http://api.foursquare.com/v1/checkins.json';
			auth = _globals.auth;
			var request = new Ajax.Request(url, {
			   method: 'get',
			   evalJSON: 'force',
			   requestHeaders: {Authorization: auth}, 
			   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude},
			   onSuccess: this.feedSuccess.bind(this),
			   onFailure: this.feedFailed.bind(this)
			 });
	    	break;
        
        // NOTIFICATION
        case "notification" :
            Mojo.Log.error("com.foursquare.foursquare -- Notification Tap");
			_globals.GPS = new Location(_globals.gotLocation);
			_globals.GPS.start();
			var now=(new Date().getTime());
			_globals.gpsStart=now;
			_globals.nearbyVenues=undefined;
			_globals.reloadVenues=true;
			_globals.userData={};
			_globals.firstLoad=false; //////////////
			_globals.gpsokay=true;
			_globals.retryingGPS=false;
	        this.cookieData=new Mojo.Model.Cookie("credentials");
			var credentials=this.cookieData.get();
			if(credentials){
				_globals.auth=credentials.auth;
				_globals.uid=credentials.uid;
			}
			this.username=credentials.username;
			_globals.auth=credentials.auth;
			
			
			this.gpsdata=new Mojo.Model.Cookie("gpsdata");
			var gps=this.gpsdata.get();
			_globals.gpsAccuracy=(gps)? gps.gpsAccuracy*-1: 750;

			this.venuecount=new Mojo.Model.Cookie("venuecount");
			var vc=this.venuecount.get();
			_globals.venueCount=(vc)? vc.venueCount: 15;

			this.units=new Mojo.Model.Cookie("units");
			var un=this.units.get();
			_globals.units=(un)? un.units: "si";

			/*this.hv=new Mojo.Model.Cookie("hiddenVenues");
			var hv=this.hv.get();
			_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];*/
			 var url = "http://api.foursquare.com/v1/categories.json";
			 var request = new Ajax.Request(url, {
			   method: 'get',
			   evalJSON: 'force',
			   onSuccess: _globals.categorySuccess.bind(this),
			   onFailure: _globals.categoryFailed.bind(this)
			 });


			this.flickr=new Mojo.Model.Cookie("flickr");
			var flickrinfo=this.flickr.get();
			_globals.flickr_token=(flickrinfo)? flickrinfo.token: undefined;
			_globals.flickr_username=(flickrinfo)? flickrinfo.username: undefined;
			_globals.flickr_fullname=(flickrinfo)? flickrinfo.fullname: undefined;
			_globals.flickr_nsid=(flickrinfo)? flickrinfo.nsid: undefined;
			_globals.cmmodel = {
		          visible: true,
		          items: [{
		          	items: [ 
		          		{},
		                 { iconPath: "images/venue_button.png", command: "do-Venues"},
		                 { iconPath: "images/friends_button.png", command: "do-Friends"},
		                 { iconPath: "images/todo_button.png", command: "do-Tips"},
		                 { iconPath: "images/user_info.png", command: "do-Badges"},
		                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'},
		                 {}
		                 ],
		            toggleCmd: "do-Friends",
		            checkEnabled: true
		            }]
		    };
				
            //_globals.cmmodel.items.toggleCmd="do-Friends";
            if (cardStageController) {
                
                // If it exists, find the appropriate story list and activate it.
                Mojo.Log.error("Main Stage Exists");
                //cardStageController.popScenesTo("feedList");
                _globals.onVenues=true;
				cardStageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},_globals.thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
                cardStageController.activate();
            } else {
                
                // Create a callback function to set up a new main stage,
                // push the feedList scene and then the appropriate story list
                var pushMainScene2 = function(stageController) {
                    //stageController.pushScene("feedList", this.feeds);
                    //stageController.pushScene("storyList", this.feeds.list, launchParams.index);
					stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},_globals.auth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
                };
                Mojo.Log.error("Create Main Stage");
                var stageArguments2 = {name: "mainStage", lightweight: true};
                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");
            }
        	break;
        
        
        
        case "user":
        
        	break;
        case "venue":
        
        	break;
        case "leaderboard":
        
        	break;
        }
    }
};



Array.prototype.inArray = function (value){
	// Returns true if the passed value is found in the
	// array. Returns false if it is not.

	var i;
	for (i=0; i < this.length; i++) {
		// Matches identical (===), not just similar (==).
		if (this[i] === value) {
			return true;
		}
	}
	return false;
};




AppAssistant.prototype.feedFailed = function(r) {
	Mojo.Log.error("failed: "+r.responseText);
}



AppAssistant.prototype.feedSuccess = function(r) {
Mojo.Log.error("got feed");
	this.r=r;
	//see if we've got a stored list of old checkins
	_globals.db.get("feed",function(d){
		//found an old feed
		if(d) {var f=d.checkins;}
		if(!f){
		
			var f=[];
		}
		Mojo.Log.error("f="+Object.toJSON(f));
		this.doFeedData(f,this.r);
	}.bind(this),function(d){
		//no feed found
		this.doFeedData([],this.r);
	}.bind(this));
}

AppAssistant.prototype.doFeedData = function(data,r){
	Mojo.Log.error("checkins="+Object.toJSON(data));
	/*this.cookieData=new Mojo.Model.Cookie("feed");
	var feedcookie=this.cookieData.get();
	if(feedcookie){
		var oldfeed=feedcookie.feed;
	}else{
		var oldfeed=[];
	}
	
	
	oldfeed=[];*/
	
	var oldfeed=(data)? data: [];
	
	//setup array to hold actually new checkins
	var newitems=[];
	
	Mojo.Log.error("setup arrays");
	//run through array of newly downloaded checkins
	var newfeed=r.responseJSON.checkins;
	if(newfeed){
		Mojo.Log.error("has newfeed. oldfeed.length="+oldfeed.length);
		if(oldfeed.length>0){
			for(var f=0;f<newfeed.length;f++) {
				var inarray=false;
				for(var of=0;of<oldfeed.length;of++){
					if(oldfeed[of].id==newfeed[f].id){
						Mojo.Log.error("checkin for %i is old (ping=%i)",newfeed[f].user.firstname,newfeed[f].ping);
						Mojo.Log.error("old id=%i, new id=%i",oldfeed[of].id,newfeed[f].id);

						inarray=true;
						break;
					}else{
					}			
				}
				if(!inarray && newfeed[f].ping && (newfeed[f].venue || newfeed[f].shout)){
					newitems.push(newfeed[f]);
					inarray=false;
					Mojo.Log.error("checkin for %i is new (ping=%i)",newfeed[f].user.firstname,newfeed[f].ping);
					//Mojo.Log.error("old id=%i, new id=%i",oldfeed[of].id,newfeed[f].id);					
				} //if the checkin is really new, add it to the newitems array
				else{
				}
			}
		}else{
			newitems=newfeed;
		}
		Mojo.Log.error("added new items to newer array");
		Mojo.Log.error("newitems="+Object.toJSON(newitems));

		//store the new feed in a cookie
		/*this.cookieData=new Mojo.Model.Cookie("feed");
		this.cookieData.put({
			feed: newfeed
		});*/
		this.newitems=newitems;
		_globals.db.add("feed",r.responseJSON,function(r){Mojo.Log.error("add OK");this.doDashboard();}.bind(this),function(r){Mojo.Log.error("add FAIL");this.doDashboard();}.bind(this));
	}
}	
	
	
AppAssistant.prototype.doDashboard = function(){
	Mojo.Log.error("dodashboard");
	var newitems=this.newitems;
	Mojo.Log.error("copied newitems");
	if(newitems && newitems.length>0){
		Mojo.Log.error("in dashboard if");
		try{
			var appController = Mojo.Controller.getAppController();
			Mojo.Log.error("got appcontroller");
		}catch(e){
			Mojo.Log.error(Object.toJSON(e));
		}
        var stageController = appController.getStageController("mainStage");
        Mojo.Log.error("gotmainstage");
        var dashboardStageController = appController.getStageProxy("fsqDash");
        

		Mojo.Log.error("got controllers");
		
		
		//handle sound settings
	    this.cookieData=new Mojo.Model.Cookie("alert");
		var credentials=this.cookieData.get();
		var alerts=(credentials)? credentials: {type:"bounce",ringtone:"",file:""};
		
		var sound={};
		Mojo.Log.error("alert type="+alerts.type);
		switch(alerts.type){
			case "system_sound":
				sound.soundClass="notifications";
				break;
			case "ringtone":
				sound.soundClass="notifications";
				sound.soundFile=alerts.file;
				sound.soundDuration=5000;
				break;
			case "vibrate":
				sound.soundClass="vibrate";				
				break;
			case "bounce":
				sound.soundClass="notifications";
				sound.soundFile="bounce.mp3";
				Mojo.Log.error("path="+sound.soundFile);
				sound.soundDuration=1500;
				break;
		}
		
		if(stageController){
			if(!stageController.isActiveAndHasScenes()){
				Mojo.Log.error("no active scenes");
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
            		Mojo.Log.error("New Dashboard Stage");
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	Mojo.Log.error("Existing Dashboard Stage");
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
            }
		}else{
				Mojo.Log.error("no mainstage");
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
            		Mojo.Log.error("New Dashboard Stage");
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	Mojo.Log.error("Existing Dashboard Stage");
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
		
		}
		Mojo.Log.error("done feed stuff");
	}
	else{
		Mojo.Log.error("done feed stuff with no new ones");
	}
}

function logthis(str){
	Mojo.Log.error(str);
}






