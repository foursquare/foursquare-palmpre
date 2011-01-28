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


    // Set up first timeout alarm
    this.setWakeup();
  
	
};

/********HANDLE NOTIFICATIONS****************/
AppAssistant.prototype.setWakeup = function() {    
    this.cookieData=new Mojo.Model.Cookie("notifications");
	var notifdata=this.cookieData.get();
	if(notifdata){
		var notifs=(notifdata.notifs=="1")? '1': '0';
		_globals.notifs=notifs;
	}



    if (_globals.notifs == "1") {
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
	                _globals.wakeupTaskId = Object.toJSON(response.taskId);
	            },
	            onFailure: function(response) {
	                logthis("Alarm Set Failure "+
	                    response.returnValue+" "+ response.errorText);
	            }
	        });
	      }catch (e) {
			logthis('AppAssistant.clearSystemTimeout(): ' + e);
		}
       logthis("Set Update Timeout");
    }
};



/***********HANDLE LAUNCH**************/
AppAssistant.prototype.handleLaunch = function (launchParams) {
    logthis("ReLaunch");
    logthis("launchParams: "+Object.toJSON(launchParams));
 
    var cardStageController = this.controller.getStageController("mainStage");
    var appController = Mojo.Controller.getAppController();

    if(!cardStageController){
    	_globals.cardstage=false;
    }else{
    	_globals.cardstage=true;
    }

    var dashStageController = this.controller.getStageController("dashboard");
    
	 foursquareGet(this,{
	 	endpoint: 'categories.json',
	 	requiresAuth: false,
	 	parameters: {},
	 	onSuccess: _globals.categorySuccess.bind(this),
	 	onFailure: _globals.categoryFailed.bind(this)
	 });

	this.getHistory();

		 		        this.cookieData=new Mojo.Model.Cookie("credentials");
				var credentials=this.cookieData.get();

				if(credentials){

					_globals.auth=credentials.auth;
					_globals.uid=credentials.uid;
					_globals.swf=credentials.swf || "1";
				}else{
				
					credentials={username:'',auth:''};
				}
				
				this.username=credentials.username;
				_globals.auth=credentials.auth;


    if (!launchParams) {
        // FIRST LAUNCH
        // Look for an existing main stage by name.
        	   //grab categories in the background...
        if (cardStageController) {
            // If it exists, just bring it to the front by focusing its window.
            logthis("Main Stage Exists");
            cardStageController.activate();
        } else {
        
            // Create a callback function to set up the new main stage
            // once it is done loading. It is passed the new stage controller
            // as the first parameter.
            logthis("mainstage doesn't exist; first run");
				var now=(new Date().getTime());
				_globals.gpsStart=now;
				_globals.nearbyVenues=undefined;
				_globals.reloadVenues=true;
				_globals.userData={};
				_globals.firstLoad=false; //////////////
				_globals.gpsokay=true;
				_globals.retryingGPS=false;
				
			/*	 foursquareGet(this,{
				 	endpoint: 'user.json',
				 	parameters: {},
				 	onSuccess: _globals.userSuccess.bind(this),
				 	onFailure: _globals.userFailed.bind(this),
				 	requiresAuth: true
				 });     */
						var url = "https://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: _globals.userSuccess.bind(this),
						   onFailure: _globals.userFailed.bind(this)
						 });
				    
				 
				 
				 this.loadScene('main');    
        }
    }
    else {
        logthis("com.foursquare.foursquare -- Wakeup Call", launchParams.action);

	    switch (launchParams.action) {
			case "search":   //JUST TYPE
				logthis("search request");
				 _globals.fromSearch=true;
				 _globals.jtQuery=launchParams.query;
				 
		
		        if (cardStageController) {
		            // If it exists, just bring it to the front by focusing its window.
		            logthis("search: Main Stage Exists");
		            cardStageController.activate();
		        } else {
		        
		            // Create a callback function to set up the new main stage
		            // once it is done loading. It is passed the new stage controller
		            // as the first parameter.
			            logthis("mainstage doesn't exist; search request");
						var now=(new Date().getTime());
						_globals.gpsStart=now;
						_globals.nearbyVenues=undefined;
						_globals.reloadVenues=true;
						_globals.userData={};
						_globals.firstLoad=false; //////////////
						_globals.gpsokay=true;
						_globals.retryingGPS=false;
						
						/* foursquareGet({
						 	endpoint: 'user.json',
						 	onSuccess: _globals.userSuccess.bind(this),
						 	onFailure: _globals.userFailed.bind(this),
						 	requiresAuth: true
						 });*/
						var url = "https://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: _globals.userSuccess.bind(this),
						   onFailure: _globals.userFailed.bind(this)
						 });
			
			
		            this.loadScene('main');
		            
		        }
				
				break;
	                      
			case "shout":   //JUST TYPE
				logthis("shout request");
				 _globals.showShout=true;
				 _globals.jtShout=launchParams.text;
				 
		        if (cardStageController) {
		            // If it exists, just bring it to the front by focusing its window.
		           logthis("Main Stage Exists");
		            cardStageController.activate();
		        } else {
		        
		            // Create a callback function to set up the new main stage
		            // once it is done loading. It is passed the new stage controller
		            // as the first parameter.
		            logthis("loading shit");
						var now=(new Date().getTime());
						_globals.gpsStart=now;
						//logthis("here");
						_globals.nearbyVenues=undefined;
						_globals.reloadVenues=true;
						_globals.userData={};
						_globals.firstLoad=false; //////////////
						_globals.gpsokay=true;
						_globals.retryingGPS=false;
						 
						 /*foursquareGet({
						 	endpoint: 'user.json',
						 	onSuccess: _globals.userSuccess.bind(this),
						 	onFailure: _globals.userFailed.bind(this),
						 	requiresAuth: true
						 });*/
						var url = "https://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: _globals.userSuccess.bind(this),
						   onFailure: _globals.userFailed.bind(this)
						 });
						 
					
					this.loadScene('main');			
			
		        }
				
				break;
	                      
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
				foursquareGet(this,{
					endpoint: 'checkins.json',
					requiresAuth: true,
					parameters: {geolat:_globals.lat, 
						geolong:_globals.long, 
						geohacc:_globals.hacc,
						geovacc:_globals.vacc, 
						geoalt:_globals.altitude},
					onSuccess: this.feedSuccess.bind(this),
					onFailure: this.feedFailed.bind(this)
				});
		    	break;
	        
	        // NOTIFICATION
	        case "notification" :
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
				
				//also grab user settings in bg
				/* foursquareGet({
				 	endpoint: 'user.json',
				 	onSuccess: this.userSuccess.bind(this),
				 	onFailure: this.userFailed.bind(this),
				 	requiresAuth: true
				 });*/
				 
						var url = "https://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: _globals.userSuccess.bind(this),
						   onFailure: _globals.userFailed.bind(this)
						 });

	
	
	            if (cardStageController) {
	                
	                // If it exists, find the appropriate story list and activate it.
	                _globals.onVenues=true;
					cardStageController.swapScene({name: "friends-list",
						transition: Mojo.Transition.crossFade},
						_globals.thisauth,
						_globals.userData,
						_globals.username,
						_globals.password,
						_globals.uid,
						_globals.lat,
						_globals.long,
						this);
	                cardStageController.activate();
	            } else {
	                
	                // Create a callback function to set up a new main stage,
	                // push the feedList scene and then the appropriate story list
	                var pushMainScene2 = function(stageController) {
						stageController.swapScene({name: "friends-list", 
							transition: Mojo.Transition.crossFade},
							_globals.auth,
							_globals.userData,
							_globals.username,
							_globals.password,
							_globals.uid,
							_globals.lat,
							_globals.long,
							this);
	                };
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
	            //_globals.cmmodel.items.toggleCmd="do-Friends";
	            if (cardStageController) {
	                
	                // If it exists, find the appropriate story list and activate it.
	                //cardStageController.popScenesTo("feedList");
	                _globals.onVenues=true;
					if(launchParams.action=="venue"){
						cardStageController.pushScene({name: "venuedetail", 
							transition: Mojo.Transition.crossFade},{id:launchParams.venue},
							_globals.username,
							_globals.password,
							_globals.uid,
							false,
							undefined,
							undefined,
							this,
							false,
							true);
					}else if(launchParams.action=="user"){
						cardStageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},
						{id:launchParams.user},_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
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
						

						 var url = "https://api.foursquare.com/v1/categories.json";
						 var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'force',
						   onSuccess: _globals.categorySuccess.bind(this),
						   onFailure: _globals.categoryFailed.bind(this)
						 });
			
			
						//also grab user settings in bg
						var url = "https://api.foursquare.com/v1/user.json";
						var request = new Ajax.Request(url, {
						   method: 'get',
						   evalJSON: 'true',
						   requestHeaders: {Authorization:_globals.auth},
						   onSuccess: _globals.userSuccess.bind(this),
						   onFailure: _globals.userFailed.bind(this)
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
	                var stageArguments2 = {name: "mainStage", lightweight: true};
	                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");
	            }
	        	break;
	        case "leaderboard":
	        
	        	break;
	        }
    }
};


AppAssistant.prototype.loadScene = function(scene) {
            var pushMainScene = function(stageController) {
				this.cookieData=new Mojo.Model.Cookie("credentials");
				var credentials=this.cookieData.get();
	
	
				if (_globals.loadPrefs()){		
					zBar.stageController=stageController;		
					stageController.pushScene(scene,true,credentials);
				}else{
					zBar.stageController=stageController;
					stageController.pushScene(scene,false);
				}
	
            };
            var stageArguments = {name: "mainStage", lightweight: true,splashBackgroundName:Mojo.appPath+'images/splash.png'};
            this.controller.createStageWithCallback(stageArguments,
                pushMainScene.bind(this), "card");

};

AppAssistant.prototype.feedFailed = function(r) {
	logthis("failed: "+r.responseText);
}



AppAssistant.prototype.feedSuccess = function(r) {
	this.r=r;
	//see if we've got a stored list of old checkins
	_globals.db.get("feed",function(d){
		//found an old feed
		if(d) {var f=d.checkins;}
		if(!f){
		
			var f=[];
		}
		this.doFeedData(f,this.r);
	}.bind(this),function(d){
		//no feed found
		this.doFeedData([],this.r);
	}.bind(this));
}


AppAssistant.prototype.doFeedData = function(data,r){
	var oldfeed=(data)? data: [];
	
	//setup array to hold actually new checkins
	var newitems=[];
	
	//run through array of newly downloaded checkins
	var newfeed=r.responseJSON.checkins;
	if(newfeed){
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
				} //if the checkin is really new, add it to the newitems array
				else{
				}
			}
		}else{
			newitems=newfeed;
		}

		//store the new feed in a cookie
		/*this.cookieData=new Mojo.Model.Cookie("feed");
		this.cookieData.put({
			feed: newfeed
		});*/
		this.newitems=newitems;
		_globals.db.add("feed",r.responseJSON,function(r){logthis("add OK");this.doDashboard();}.bind(this),function(r){logthis("add FAIL");this.doDashboard();}.bind(this));
	}
}	
	
	
AppAssistant.prototype.doDashboard = function(){

	var newitems=this.newitems;
	if(newitems && newitems.length>0){
		try{
			var appController = Mojo.Controller.getAppController();
		}catch(e){
			logthis(Object.toJSON(e));
		}
        var stageController = appController.getStageController("mainStage");
        var dashboardStageController = appController.getStageProxy("fsqDash");
        

		
		
		//handle sound settings
	    this.cookieData=new Mojo.Model.Cookie("alert");
		var credentials=this.cookieData.get();
		var alerts=(credentials)? credentials: {type:"bounce",ringtone:"",file:""};
		
		var sound={};
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
				logthis("path="+sound.soundFile);
				sound.soundDuration=1500;
				break;
		}
		
		if(stageController){
			if(!stageController.isActiveAndHasScenes()){
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
            }
		}else{
				var s=(newitems.length==1)? "":"s";
				sound.messageText=newitems.length+" New Check-in"+s;

				appController.showBanner(sound, {action: "notification"});
				if(!dashboardStageController) {
                	var pushDashboard = function(stageController){
                		stageController.pushScene("dashboard", newitems);
                	};
                	appController.createStageWithCallback({name: "fsqDash", lightweight: true}, pushDashboard, "dashboard");
            	}else {
                	dashboardStageController.delegateToSceneAssistant("updateDashboard",newitems);
            	}
		
		}
	}
	else{
	}
}








AppAssistant.prototype.getHistory = function(r) {
	this.r=r;
	//see if we've got a stored list of old checkins
	_globals.rdb.get("venues",function(d){
		//found an history list
		if(d) {var f=d;}
		if(!f){
		
			var f=[];
		}
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
		_globals.rdb.add("venues",_globals.rec.venues,function(r){logthis("add v OK");}.bind(this),function(r){logthis("add v FAIL");}.bind(this));
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



AppAssistant.prototype.historyFailed = function(r) {
	logthis("hfail="+Object.toJSON(r));
}

