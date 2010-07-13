//Handle Global Vars 
_globals = {};
window.maps = window.maps || {};
fsq = {}; //Global Object
fsq.Metrix = new Metrix(); //Instantiate Metrix Library

_globals.db = new Mojo.Depot({name:"feed"}, function(){Mojo.Log.error("depot OK");}, function(){Mojo.Log.error("depot FAIL");}); 
_globals.rdb = new Mojo.Depot({name:"rec"}, function(){Mojo.Log.error("recdepot OK");}, function(){Mojo.Log.error("recdepot FAIL");}); 

var webconnection=false;

_globals.debugMode=true;
_globals.hasWeb=false;
//_globals.db.discard("feed");

_globals.interval="00:30:00";
//_globals.interval="00:05:00";

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


function getElementsByClassName(classname,node){
	//function from: http://snipplr.com/view.php?codeview&id=1696
    if(!node) node = document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}


_globals.categoryFailed = function(event) {
	Mojo.Log.error("category failed");
}

_globals.categorySuccess = function(r) {
	//Mojo.Log.error("got categories");
	//Mojo.Log.error(Object.toJSON(r.responseJSON.categories));
	if(r.responseJSON.categories){
		_globals.categories=r.responseJSON.categories;
	}
}

_globals.loadPrefs = function() {
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();


	if (credentials/* && 1==2*//*uncomment the comment before this to force the login dialog*/){
		this.username=credentials.username;
		_globals.swf=credentials.swf || "1";
		//Mojo.Log.error("swf="+_globals.swf);

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

		this.sendstats=new Mojo.Model.Cookie("sendstats");
		var un=this.sendstats.get();
		_globals.sendstats=(un)? un.sendstats: "true";

		this.houses=new Mojo.Model.Cookie("houses");
		var un=this.houses.get();
		_globals.houses=(un)? un.houses: "yes";

		this.twitter=new Mojo.Model.Cookie("twitter");
		var un=this.twitter.get();
		_globals.twitter=(un)? un.twitter: "web";

		this.autoclose=new Mojo.Model.Cookie("autoclose");
		var un=this.autoclose.get();
		_globals.autoclose=(un)? un.autoclose: "never";

		/*this.hv=new Mojo.Model.Cookie("hiddenVenues");
		var hv=this.hv.get();
		_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];*/


		this.flickr=new Mojo.Model.Cookie("flickr");
		var flickrinfo=this.flickr.get();
		_globals.flickr_token=(flickrinfo)? flickrinfo.token: undefined;
		_globals.flickr_username=(flickrinfo)? flickrinfo.username: undefined;
		_globals.flickr_fullname=(flickrinfo)? flickrinfo.fullname: undefined;
		_globals.flickr_nsid=(flickrinfo)? flickrinfo.nsid: undefined;

	    _globals.getFriendRequests();
		return true;
	}else{
		return false;
	}

};



function AppAssistant() {

}

AppAssistant.prototype.setup = function() {
	this.sendstats=new Mojo.Model.Cookie("sendstats");
	var un=this.sendstats.get();
	_globals.sendstats=(un)? un.sendstats: "true";

	if(_globals.sendstats=="true"){fsq.Metrix.postDeviceData(true);logthis("sent Metrix stats");}
    var cardStageController = this.controller.getStageController("mainStage");
    var dashboardStageController = this.controller.getStageController("fsqDash");

	_globals.appController=this.controller;
	var r=new Mojo.Service.Request('palm://com.palm.connectionmanager', {
     method: 'getstatus',
     parameters: {},
     onSuccess: function(response){
     	if(response.isInternetConnectionAvailable){
			setWeb("true");
			webconnection=true;
			logthis("good");
		}
		}.bind(this),
     onFailure: function(response){
	     setWeb("false");
	     webconnection=false;
	     logthis("bad");
     }.bind(this)
 	});


    // Set up first timeout alarm
    this.setWakeup();
  
	_globals.GPS = new Location(_globals.gotLocation);
	_globals.GPS.start();
	var now=(new Date().getTime());
	_globals.gpsStart=now;
};

function setWeb(v){
	logthis("v="+v);
	if(v=="true"){
		_globals.hasWeb=true;	
		logthis("set true");
	}else{
		_globals.hasWeb=false;
		logthis("set false");
	}

}
/********HANDLE NOTIFICATIONS****************/
AppAssistant.prototype.setWakeup = function() {    
    this.cookieData=new Mojo.Model.Cookie("notifications");
	var notifdata=this.cookieData.get();
	if(notifdata){
		var notifs=(notifdata.notifs=="1")? '1': '0';
		//Mojo.Log.error("got cookie");
		_globals.notifs=notifs;
	}



    if (_globals.notifs == "1") {
    	//Mojo.Log.error("setting alarm");
	    try{
	        this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
	            method: "set",
	            parameters: {
	                "key": "com.foursquare.foursquare.update",
	                "in": _globals.interval,
	                "wakeup": true,
	                "uri": "palm://com.palm.applicationManager/open",
	                "params": {
	                    "id": Mojo.appInfo.id,
	                    "params": {"action": "feedUpdate"}
	                }
	            },
	            onSuccess: function(response) {
	               // Mojo.Log.error("Alarm Set Success", response.returnValue);
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
   // Mojo.Log.error("ReLaunch");
 
    var cardStageController = this.controller.getStageController("mainStage");
    var appController = Mojo.Controller.getAppController();
    
    if(!cardStageController){
    	_globals.cardstage=false;
    }else{
    	_globals.cardstage=true;
    }

    var dashStageController = this.controller.getStageController("dashboard");
    
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
		 this.getHistory();
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
            //if(dashStageController){
            logthis("loading shit");
            	//if(_globals.GPS){_globals.GPS.stop();_globals.GPS={};}
      			//_globals.GPS = new Location(_globals.gotLocation);
      			
      			logthis("webcon"+webconnection);
      			
				//_globals.GPS.start();
				var now=(new Date().getTime());
				_globals.gpsStart=now;
				//logthis("here");
				_globals.nearbyVenues=undefined;
				_globals.reloadVenues=true;
				_globals.userData={};
				_globals.firstLoad=false; //////////////
				_globals.gpsokay=true;
				_globals.retryingGPS=false;
				
				//logthis("here now");
				//also grab user settings in bg

/*				var url = "http://api.foursquare.com/v1/user.json";
				var request = new Ajax.Request(url, {
				   method: 'get',
				   evalJSON: 'true',
				   requestHeaders: {Authorization:_globals.auth},
				   onSuccess: this.userSuccess.bind(this),
				   onFailure: this.userFailed.bind(this)
				 });*/
				 
				 foursquareGet({
				 	endpoint: 'user.json',
				 	onSuccess: this.userSuccess.bind(this),
				 	onFailure: this.userFailed.bind(this),
				 	requiresAuth: true
				 });
	
	
            //}
            
            
            var pushMainScene = function(stageController) {
				this.cookieData=new Mojo.Model.Cookie("credentials");
				var credentials=this.cookieData.get();
	
	
				if (_globals.loadPrefs()){		
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
					_globals.swf=credentials.swf || "1";
				}
				this.username=credentials.username;
				_globals.auth=credentials.auth;
		
		
		        // Update the feed list
		       // Mojo.Log.error("Update FeedList");
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
	            //Mojo.Log.error("com.foursquare.foursquare -- Notification Tap");
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
					_globals.swf=credentials.swf || "1";
				}
				
				_globals.loadPrefs();
				
				 var url = "http://api.foursquare.com/v1/categories.json";
				 var request = new Ajax.Request(url, {
				   method: 'get',
				   evalJSON: 'force',
				   onSuccess: _globals.categorySuccess.bind(this),
				   onFailure: _globals.categoryFailed.bind(this)
				 });
	
	
				//also grab user settings in bg
				var url = "http://api.foursquare.com/v1/user.json";
				var request = new Ajax.Request(url, {
				   method: 'get',
				   evalJSON: 'true',
				   requestHeaders: {Authorization:_globals.auth},
				   onSuccess: this.userSuccess.bind(this),
				   onFailure: this.userFailed.bind(this)
				 });
	
	
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
	                //Mojo.Log.error("Main Stage Exists");
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
	                //Mojo.Log.error("Create Main Stage");
	                var stageArguments2 = {name: "mainStage", lightweight: true};
	                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");
	            }
	        	break;
	        
	        case "saveAlertFile":
				var appController = Mojo.Controller.getAppController();
				var fn=launchParams.alertFile;
				var fname=launchParams.alertName;
				
				this.cookieData=new Mojo.Model.Cookie("alert");
				this.cookieData.put(
					{"type":'ringtone',"ringtone":fname,"file":fn}
				)
				_globals.alerttype='ringtone';
			 	if(!_globals.cardstage){
					Mojo.Controller.getAppController().showBanner("Set notification ringtone!", {source: 'notification'});
			 		logthis("nope");
			 	 	appController.createStageWithCallback({name: "mainStage", lightweight: true}, function(){
			 	 		//Mojo.Controller.getAppController().removeAllBanners();
			 	 		Mojo.Controller.getAppController().closeAllStages();
			 	 		}.bind(this), "card");
			 	}

	        	break;
	        
	        case "url":
				var shorturl=launchParams.url;
				var appController = Mojo.Controller.getAppController();

				if(shorturl.indexOf("foursquare.com/venue")>-1){
		   			var s=shorturl.indexOf("venue/")+6;
		   			var vid=shorturl.substr(s);
					appController.launch("com.foursquare.foursquare",{action: 'venue',venue: vid},
						function(){logthis("launched");}.bind(this),
						function(){logthis("launch failed");}.bind(this)
					);				
				}else if(shorturl.indexOf("4sq.com")>-1){
					var url="http://api.bit.ly/v3/expand?shortUrl="+encodeURIComponent(shorturl)+"&login=sirgeoph&apiKey=R_6c499814739b04b067e6df774addba3b&format=json";
					var request = new Ajax.Request(url, {
					   method: 'get',
					   evalJSON: 'true',
					   onSuccess: function(r){
					   		var longurl=r.responseJSON.data.expand[0].long_url;
	
					   		if(longurl.indexOf("foursquare.com/venue")>-1){
					   			var s=longurl.indexOf("venue/")+6;
					   			var vid=longurl.substr(s);
								appController.launch("com.foursquare.foursquare",{action: 'venue',venue: vid},
									function(){logthis("launched");}.bind(this),
									function(){logthis("launch failed");}.bind(this)
								);
					   		}else{				   			
								 appController.open({target: longurl},function(){
									 	_globals.GPS.stop();
									 	if(!_globals.cardstage){
									 		logthis("nope");
									 	 	appController.createStageWithCallback({name: "mainStage", lightweight: true}, function(){
									 	 		logthis("created");
									 	 		Mojo.Controller.getAppController().closeAllStages();
									 	 		}.bind(this), "card");
									 	}
									 	}.bind(this)); 
					   		}
					   }.bind(this),
					   onFailure: function(r){
					   	logthis("fail: "+Object.toJSON(r.responseJSON));
					   }.bind(this)
					 });
				}else{
					 appController.open({target: shorturl},function(){
					 	_globals.GPS.stop();
					 	if(!_globals.cardstage){
					 		logthis("nope");
					 	 	appController.createStageWithCallback({name: "mainStage", lightweight: true}, function(){
					 	 		logthis("created");
					 	 		Mojo.Controller.getAppController().closeAllStages();
					 	 		}.bind(this), "card");
					 	}
					 	}.bind(this)); 
					 				
				}
				

				
	        	break;
	        case "user":
	        case "venue":
	        	//logthis("vid="+launchParams.venue);
	            //Mojo.Log.error("com.foursquare.foursquare -- Notification Tap");
					
	            //_globals.cmmodel.items.toggleCmd="do-Friends";
	            if (cardStageController) {
	                
	                // If it exists, find the appropriate story list and activate it.
	                //Mojo.Log.error("Main Stage Exists");
	                //cardStageController.popScenesTo("feedList");
	                _globals.onVenues=true;
					if(launchParams.action=="venue"){
						cardStageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade},{id:launchParams.venue},_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
					}else if(launchParams.action=="user"){
						cardStageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},{id:launchParams.user},_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
					}
	                cardStageController.activate();
	            } else {
	                
	                // Create a callback function to set up a new main stage,
	                // push the feedList scene and then the appropriate story list
	                var pushMainScene2 = function(stageController) {
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
						
						_globals.loadPrefs();
						

						 var url = "http://api.foursquare.com/v1/categories.json";
						 var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'force',
						   onSuccess: _globals.categorySuccess.bind(this),
						   onFailure: _globals.categoryFailed.bind(this)
						 });
			
			
						//also grab user settings in bg
						var url = "http://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: this.userSuccess.bind(this),
						   onFailure: this.userFailed.bind(this)
						 });
			
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
			                    //stageController.pushScene("feedList", this.feeds);
	                    //stageController.pushScene("storyList", this.feeds.list, launchParams.index);
						if(launchParams.action=="venue"){
							stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade},{id:launchParams.venue},_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
						}else if(launchParams.action=="user"){
							stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade},{id:launchParams.user},_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);

						}
	                };
	                //Mojo.Log.error("Create Main Stage");
	                var stageArguments2 = {name: "mainStage", lightweight: true};
	                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");
	            }
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
//Mojo.Log.error("got feed");
	this.r=r;
	//see if we've got a stored list of old checkins
	_globals.db.get("feed",function(d){
		//found an old feed
		if(d) {var f=d.checkins;}
		if(!f){
		
			var f=[];
		}
		//Mojo.Log.error("f="+Object.toJSON(f));
		this.doFeedData(f,this.r);
	}.bind(this),function(d){
		//no feed found
		this.doFeedData([],this.r);
	}.bind(this));
}


AppAssistant.prototype.doFeedData = function(data,r){
	//Mojo.Log.error("checkins="+Object.toJSON(data));
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
	
	//Mojo.Log.error("setup arrays");
	//run through array of newly downloaded checkins
	var newfeed=r.responseJSON.checkins;
	if(newfeed){
		//Mojo.Log.error("has newfeed. oldfeed.length="+oldfeed.length);
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
					//Mojo.Log.error("checkin for %i is new (ping=%i)",newfeed[f].user.firstname,newfeed[f].ping);
					//Mojo.Log.error("old id=%i, new id=%i",oldfeed[of].id,newfeed[f].id);					
				} //if the checkin is really new, add it to the newitems array
				else{
				}
			}
		}else{
			newitems=newfeed;
		}
		//Mojo.Log.error("added new items to newer array");
		//Mojo.Log.error("newitems="+Object.toJSON(newitems));

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
	//Mojo.Log.error("dodashboard");

	var newitems=this.newitems;
	//Mojo.Log.error("copied newitems");
	if(newitems && newitems.length>0){
		//Mojo.Log.error("in dashboard if");
		try{
			var appController = Mojo.Controller.getAppController();
			//Mojo.Log.error("got appcontroller");
		}catch(e){
			Mojo.Log.error(Object.toJSON(e));
		}
        var stageController = appController.getStageController("mainStage");
        //Mojo.Log.error("gotmainstage");
        var dashboardStageController = appController.getStageProxy("fsqDash");
        

		//Mojo.Log.error("got controllers");
		
		
		//handle sound settings
	    this.cookieData=new Mojo.Model.Cookie("alert");
		var credentials=this.cookieData.get();
		var alerts=(credentials)? credentials: {type:"bounce",ringtone:"",file:""};
		
		var sound={};
		//Mojo.Log.error("alert type="+alerts.type);
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
				//Mojo.Log.error("no active scenes");
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
            		//Mojo.Log.error("New Dashboard Stage");
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	//Mojo.Log.error("Existing Dashboard Stage");
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
            }
		}else{
				//Mojo.Log.error("no mainstage");
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
            		//Mojo.Log.error("New Dashboard Stage");
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	//Mojo.Log.error("Existing Dashboard Stage");
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
		
		}
		//Mojo.Log.error("done feed stuff");
	}
	else{
		//Mojo.Log.error("done feed stuff with no new ones");
	}
}

function logthis(str){
	if(_globals.debugMode){
		Mojo.Log.error(str);
	}
}




AppAssistant.prototype.userSuccess = function(response){
	logthis("user okay");
	var uid=response.responseJSON.user.id;
	var savetw=response.responseJSON.user.settings.sendtotwitter;
	var savefb=response.responseJSON.user.settings.sendtofacebook;
 	var ping=_globals.swf; //response.responseJSON.user.settings.pings;
	_globals.uid=uid;
	
	this.cookieData=new Mojo.Model.Cookie("credentials");
	this.cookieData.put({
		username: _globals.username,
		password: "",
		auth: _globals.auth,
		uid: uid,
		savetotwitter: savetw,
		savetofacebook: savefb,
		ping: ping,
		cityid: 0,
		city: ""
	});


}

AppAssistant.prototype.userFailed = function(r){
	logthis("ufail="+r.responseText);
}


_globals.rec={};


AppAssistant.prototype.getHistory = function(r) {
	this.r=r;
	//see if we've got a stored list of old checkins
	_globals.rdb.get("venues",function(d){
		//found an history list
		if(d) {var f=d;}
		if(!f){
		
			var f=[];
		}
		//Mojo.Log.error("history="+Object.toJSON(f));
		_globals.rec.venues=f;

	    this.cookieData=new Mojo.Model.Cookie("lastHID");
		var credentials=this.cookieData.get();
		_globals.lastHID=(credentials)? credentials.lastHID: '0';

		this.loadHistory(_globals.lastHID);
	}.bind(this),function(d){
		//no feed found
		_globals.rec.venues=[];

	    this.cookieData=new Mojo.Model.Cookie("lastHID");
		var credentials=this.cookieData.get();
		_globals.lastHID=(credentials)? credentials.lastHID: '0';

		this.loadHistory(_globals.lastHID);
	}.bind(this));
}

AppAssistant.prototype.loadHistory = function(hid){
	if(hid==0){
		var params={l: 250};
	}else{
		var params={sinceid: hid};
	}
/*	var url = "http://api.foursquare.com/v1/history.json";
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   parameters: params,
	   requestHeaders: {Authorization:_globals.auth},
	   onSuccess: this.historySuccess.bind(this),
	   onFailure: this.historyFailed.bind(this)
	 });*/
	 
	 

}

AppAssistant.prototype.historySuccess = function(r) {
	var j=r.responseJSON;
	if(j.checkins != undefined){
		//check if venues in array are already visited in the past
		for(var c=0;c<j.checkins.length;c++){
			if(c==0){
				var lhid=j.checkins[c].id;
			}
			if(j.checkins[c].venue != undefined){
				var venue=j.checkins[c].venue;
				if(venue.primarycategory!=undefined){
					var inarray=false;
					for(var v=0;v<_globals.rec.venues.length;v++){
						if(_globals.rec.venues[v].id==venue.id){
							inarray=true;
						}
					}
					if(!inarray){
						_globals.rec.venues.push(venue);
					}
				}
			}
		}
		
		//save new venue array
		_globals.rdb.add("venues",_globals.rec.venues,function(r){Mojo.Log.error("add v OK");}.bind(this),function(r){Mojo.Log.error("add v FAIL");}.bind(this));
		this.cookieData=new Mojo.Model.Cookie("lastHID");
		this.cookieData.put({
			lastHID: lhid
		});

		
		//now loop through new array of venues and calculate top 5 categories
		_globals.topCategories=[];
		for(var v=0;v<_globals.rec.venues.length;v++){
			var pc=_globals.rec.venues[v].primarycategory;
			if(pc!=undefined){
				var catid=-1;
				var foundid=false;
				
				for(var d=0;d<_globals.topCategories.length;d++){
					if(_globals.topCategories[d].id==pc.id){
						catid=d;
						foundid=true;
						//break;
					}
				}
				
				if(foundid){
					_globals.topCategories[catid].count=_globals.topCategories[catid].count+1;
				}else{
					var itm={
						id: pc.id,
						name: pc.nodename,
						path: pc.fullpathname,
						count: 1
					};
					_globals.topCategories.push(itm);
				}
			}
		}
		
		//categories are now in an array.
		//sort by count, descending
		_globals.topCategories.sort(_globals.categorySort);
		
	}
}

_globals.categorySort = function(a, b){
	return (b.count - a.count) //causes an array to be sorted numerically and descending
};


AppAssistant.prototype.historyFailed = function(r) {
	logthis("hfail="+Object.toJSON(r));
}


_globals.getFriendRequests = function(){
//	    this.cookieData=new Mojo.Model.Cookie("lastHID");
//		var credentials=this.cookieData.get();
//		_globals.lastHID=(credentials)? credentials.lastHID: '0';
		var url = "http://api.foursquare.com/v1/friend/requests.json";
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'true',
		   requestHeaders: {Authorization:_globals.auth},
		   onSuccess: _globals.requestsSuccess.bind(this),
		   onFailure: _globals.requestsFailed.bind(this)
		 });

};

_globals.requestsSuccess = function(r){
	if(r.responseJSON.requests != undefined && r.responseJSON.requests != null && r.responseJSON.requests.length>0){
		_globals.requests='';
		for(var f=0;f<r.responseJSON.requests.length;f++){
			var html=Mojo.View.render({template:'listtemplates/friend-requests',object:r.responseJSON.requests[f]});
			_globals.requests+=html;
		}
	}
};

_globals.requestsFailed = function(r){

}

/*
foursquare AJAX Wrappers
@param	that			Object		pass the this object of the current scene
@param	obj				Object		Contains various parameters for the GET request

		endpoint		String		Foursquare API endpoint (not full URL)
		parameters		Object		Key:value pairs of parameters to be sent
		requiresAuth	Boolean		If true, with provide HTTP Basic Auth header
		onSuccess		Function	Callback function to fire on successful response
		onFailure		Function	Callback function to fire on failed response

		debug			Boolean		If true, logs the responseText to the console
*/
function foursquareGet(that,opts){
	var headers={};
	if(opts!=undefined){
		if(opts.endpoint==undefined){
			logthis("Foursquare API Fail: Missing endpoint");
			return false;
		}else{
			if(opts.requiresAuth){
				headers={Authorization: _globals.auth};
			}
			if(opts.parameters==undefined){
				opts.parameters={};
			}
			
			var url = "http://api.foursquare.com/v1/"+opts.endpoint;
			var request = new Ajax.Request(url, {
			   method: 'get',
			   evalJSON: 'true',
			   parameters: opts.parameters,
			   requestHeaders: headers,
			   onSuccess: function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.error==undefined && r.responseJSON.ratelimited==undefined && r.responseJSON.unauthorized==undefined){
			   				opts.onSuccess(r);
			   			}else if(r.responseJSON.error!=undefined){
							if(opts.ignoreErrors!=false){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   },
			   onFailure:  function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.error!=undefined){
							if(opts.ignoreErrors!=false){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   }
			 });
			
			
		}
	}
};

function foursquarePost(that,opts){
	var headers={};
	if(opts!=undefined){
		if(opts.endpoint==undefined){
			logthis("Foursquare API Fail: Missing endpoint");
			return false;
		}else{
			if(opts.requiresAuth){
				headers={Authorization: _globals.auth};
			}
			if(opts.parameters==undefined){
				opts.parameters={};
			}
			
			var url = "http://api.foursquare.com/v1/"+opts.endpoint;
			var request = new Ajax.Request(url, {
			   method: 'post',
			   evalJSON: 'true',
			   parameters: opts.parameters,
			   requestHeaders: headers,
			   onSuccess: function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.error==undefined && r.responseJSON.ratelimited==undefined && r.responseJSON.unauthorized==undefined){
			   				opts.onSuccess(r);
			   			}else if(r.responseJSON.error!=undefined){
							if(r.responseJSON.error.indexOf("Possible Duplicate")==-1){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   },
			   onFailure:  function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.error!=undefined){
							if(r.responseJSON.error.indexOf("Possible Duplicate")==-1){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   }
			 });
			
			
		}
	}

};