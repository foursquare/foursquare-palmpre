    Mojo.Log.error("starting appassistant11111");

_globals = {};
//$=function (id){return document.getElementById(id);}

function AppAssistant() {
	
}

AppAssistant.prototype.setup = function() {
    Mojo.Log.error("starting appassistant");
//   	zBar.activeScene=this.controller.activeScene();

    // Set up first timeout alarm
    this.setWakeup();
    
};


/*APP.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Venues",
            checkEnabled: true
            }]
    }*/

//function _globals() {
//}



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
                Mojo.Log.info("Alarm Set Success", response.returnValue);
                _globals.wakeupTaskId = Object.toJSON(response.taskId);
            },
            onFailure: function(response) {
                Mojo.Log.info("Alarm Set Failure",
                    response.returnValue, response.errorText);
            }
        });
        Mojo.Log.info("Set Update Timeout");
    }
};



AppAssistant.prototype.handleLaunch = function (launchParams) {
    Mojo.Log.info("ReLaunch");
 
    var cardStageController = this.controller.getStageController("mainStage");
    var appController = Mojo.Controller.getAppController();
    
    if (!launchParams) {
        // FIRST LAUNCH
        // Look for an existing main stage by name.
        if (cardStageController) {
            // If it exists, just bring it to the front by focusing its window.
            Mojo.Log.info("Main Stage Exists");
            //cardStageController.popScenesTo("feedList");
            cardStageController.activate();
        } else {
            // Create a callback function to set up the new main stage
            // once it is done loading. It is passed the new stage controller
            // as the first parameter.
            var pushMainScene = function(stageController) {
				this.cookieData=new Mojo.Model.Cookie("credentials");
				var credentials=this.cookieData.get();
	
	
				if (credentials /*&& 1==2*//*uncomment the comment before this to force the login dialog*/){
					this.username=credentials.username;
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

					this.hv=new Mojo.Model.Cookie("hiddenVenues");
					var hv=this.hv.get();
					_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];


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
            Mojo.Log.info("Create Main Stage");
            var stageArguments = {name: "mainStage", lightweight: true};
            this.controller.createStageWithCallback(stageArguments,
                pushMainScene.bind(this), "card");
        }
    }
    else {
        Mojo.Log.info("com.foursquare.foursquare -- Wakeup Call", launchParams.action);
        switch (launchParams.action) {
                      
    // UPDATE FEEDS
    case "feedUpdate" :
        // Set next wakeup alarm
        this.setWakeup();
        
        // Update the feed list
        Mojo.Log.info("Update FeedList");
		var url = 'http://api.foursquare.com/v1/checkins.json';
		auth = _globals.auth;
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: auth}, //Not doing a search with auth due to malformed JSON results from it
		   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude},
		   onSuccess: this.feedSuccess.bind(this),
		   onFailure: this.feedFailed.bind(this)
		 });
    break;
        
        // NOTIFICATION
        case "notification" :
             Mojo.Log.info("com.foursquare.foursquare -- Notification Tap");
         /*   if (cardStageController) {
                
                // If it exists, find the appropriate story list and activate it.
                Mojo.Log.info("Main Stage Exists");
                cardStageController.popScenesTo("feedList");
                cardStageController.pushScene("storyList", this.feeds.list, launchParams.index);
                cardStageController.activate();
            } else {
                
                // Create a callback function to set up a new main stage,
                // push the feedList scene and then the appropriate story list
                var pushMainScene2 = function(stageController) {
                    stageController.pushScene("feedList", this.feeds);
                    stageController.pushScene("storyList", this.feeds.list, launchParams.index);
                };
                Mojo.Log.info("Create Main Stage");
                var stageArguments2 = {name: News.MainStageName, lightweight: true};
                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");
            }*/
        break;
        
        }
    }
};





_globals.loadGoogleMaps = function() {
   	var appController = Mojo.Controller.getAppController();
  	var cardStageController = appController.getStageController("mainStage");
	var doc=cardStageController.document;

    Mojo.Log.error("Initializing Google Loader");
    // Code from Google Sample
    var script = doc.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ";
    script.type = "text/javascript";
    doc.getElementsByTagName("head")[0].appendChild(script);

}

window.maps = window.maps || {};






AppAssistant.prototype.feedSuccess = function(r) {

}








