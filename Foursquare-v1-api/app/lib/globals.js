//Set up global vars and functions
var _globals = {};
window.maps = window.maps || {};
fsq = {};
logthis("globals started launch");
fsq.Metrix = new Metrix();
_globals.db = new Mojo.Depot({name:"feed"}, function(){logthis("depot OK");}, function(){logthis("depot FAIL");}); 
_globals.rdb = new Mojo.Depot({name:"rec"}, function(){logthis("recdepot OK");}, function(){logthis("recdepot FAIL");}); 
_globals.debugMode=true;
_globals.hasWeb=false;
_globals.interval="00:20:00";
//_globals.interval="00:05:00";
_globals.onVenues=false;
_globals.retryingGPS=false;
_globals.hiddenVenues=[];
_globals.userData={};
_globals.rec={};
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
    };  //cmmodel no longer used, but retained here for reference
_globals.main=_globals.main || {};


_globals.whatsnew={
	"caption":"What's New",
	"id":"whatsnew",
	"icon":"",
	"pages":[
		"Here's what's new in foursquare webOS <b>v2.0.17</b>! Follow me on Twitter: <a href=\"http://mobile.twitter.com/zhephree\">@zhephree</a><ul><li>[VENUE DETAIL] Fixed bug that prevented venues with lots of tips from loading</li><li>[GENERAL] Changed GPS method. Faster than old way</li><li>[ALL SCENES] Enlarged tappable area for Help menu item</li><li>[USER INFO] Fixed a bug that prevented loading spinner from going away when viewing a user's friends</li><li>[ADD TO-DO] Fixed wording of the title</li><li>[VENUE DETAIL] Removed option to upload photos for a venue until it is fixed. You can still upload photos during a shout or check-in</li></ul>",
		"Here's what's new in foursquare webOS <b>v2.0.14</b>! Follow me on Twitter: <a href=\"http://mobile.twitter.com/zhephree\">@zhephree</a><ul><li>[NEARBY VENUES] Fixed a bug where even with the option to push houses to the bottom of the Venue list turned off, some houses would still be pushed to the bottom of the list. Feature behaves as expected.</li><li>[USER INFO] Fixed a bug that prevented Facebook and Twitter links from appearing on a user's profile if the profile was accessed from the friends list.</li><li>Fixed a bug that would display a GPS error if the errorCode returned was undefined</li><li>[VENUE INFO] Fixed a bug where if you added a new tip to a venue that previously had no tips, the new tip would display, but the sad face message would remain. Sad face message now hides.</li><li>The app now check for updates automatically.</li></ul>",
		"Here's what's new in foursquare webOS <b>v2.0.12</b>! Follow me on Twitter: <a href=\"http://mobile.twitter.com/zhephree\">@zhephree</a><ul><li>[NEARBY VENUES / LOGIN] Fixed bug that prevented \"Getting Better Accuracy\" feature from ever actually working.</li><li>[NEARBY VENUES] Places list no longer displays approximate addresses for venues without addresses. You can see approximate addresses for individual  venues when you view the actual venue. This change was made because when the phone had poor signal, reverse-geolocating each venue in the Places list created a lot of lag and made scrolling and typing jumpy.</li></ul>"
	]
};


//--------------functions-------------
_globals.categoryFailed = function(event) {
	logthis("category download failed");
	_globals.categories = [];
};

_globals.categorySuccess = function(r) {
	if(r.responseJSON.categories){
		_globals.categories=r.responseJSON.categories;
	}
};

_globals.categorySort = function(a, b){
	return (b.count - a.count) //causes an array to be sorted numerically and descending
};

_globals.doDonate =function(){
	        Mojo.Controller.getAppController().getActiveStageController().activeScene().serviceRequest('palm://com.palm.applicationManager', {
	            method:'open',
	               parameters:{
		               target: "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=QGN8Q924DXP82&lc=US&item_name=foursquare%20for%20webOS&item_number=foursquare%2dwebos&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted"
	                    }
	         });

};
_globals.getFriendRequests = function(c){
		var url = "https://api.foursquare.com/v1/friend/requests.json";
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
		
		if(c!=undefined){
			c.innerHTML=_globals.requests;
		}
	}
};

_globals.requestsFailed = function(r){
	logthis("Failed getting friend requests");
};


_globals.locationFailed = function(e){
	logthis("loc failed func: "+e);
	var msg;
	switch(e){
		case 1:
			msg="Your GPS timed-out. Try relaunching the app. If this problem persists, try restarting your phone.";
			break;
		case 2:
			msg="Your GPS says that your position is unavailable. Try relaunching the app. If this problem persists, try restarting your phone.";
			break;
		case 3:
		case 4:
		case -1:
			msg="An unknown error has occurred with your GPS. Try relaunching the app. If this problem persists, try restarting your phone.";
			break;
		case 5:
			msg="You have Location Services turned off. Please launch the Location Services app and turn on GPS and/or Google Services for location.";
			break;
		case 6:
			msg="You have denied permission to foursquare to use your phone's GPS. Please launch the Location Services app and turn on GPS and Google Services and accept the Terms of Use for Google.";
			break;
		case 7:
			msg="foursquare is already attempting to get GPS coordinates.";
			break;
		case 8:
			msg="foursquare has been temporarily blacklisted from receiving GPS positions. This means you disallowed foursquare access to your GPS when your phone asked you.";
			break;
	}
	logthis(msg);
	_globals.gpsError=msg;
	logthis("mainloaded="+_globals.mainLoaded);
	var appController = Mojo.Controller.getAppController();
	var stageController = appController.getStageController("mainStage");
	var activeScene = stageController.getScenes()[0];
	logthis("showing Dialog Helper");
	//activeScene.controller.errorDialog(_globals.gpsError);

		activeScene.showAlertDialog({
		    onChoose: function(value) {_globals.loginFail({responseJSON:"nothing"});}.bind(this),
		    title: $L("GPS Failure"),
		    message: _globals.gpsError,
		    choices:[
		        {label:$L("OK"), value:"med"}
		    ]
		}); 
		

};

//function for callback on gps return
_globals.gotLocation = function(event) {
	logthis("appassistant: doing got location");
	
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
		logthis("acc="+acc);
		
		//check radius
		if(_globals.retryingGPS==false){
			if(acc>=_globals.hacc || acc==0){ 									//if requested radius is larger than 
				logthis("got it on first try");
				_globals.GPS.stop();											//actual or user doesn't care, AND first check, continue
				_globals.gotGPS=true;
				_globals.gpsStatus.innerHTML="Found your location!";
			}else{																//if user cares and radius is larger than requested
				logthis("bad radius; retrying");
				_globals.retryingGPS=true;										//AND first check, restart GPS and let main push
				//_globals.GPS.restart();											//venues and alert user of crappy accuracy
				_globals.GPS.stop();
				_globals.gotGPS=true;
				_globals.gpsStatus.innerHTML="Inaccurate location. Retrying...";
				_globals.newGPS= new Mojo.Service.Request('palm://com.palm.location', {
					method: "getCurrentPosition",
					parameters: {accuracy: 1, maximumAge:0, responseTime: 2},
					onSuccess: _globals.gotLocation,
					onFailure: _globals.locationFailed
				});

			}
		}else{ //if _globals.retryingGPS==true...
			logthis("retrying, yo...");
			if(acc>=_globals.hacc && _globals.onVenues==true){
				logthis("got it second try");
				_globals.GPS.stop();
				_globals.retryingGPS=false;
				_globals.gpsStatus.innerHTML="Found your location!";
				Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"showrefresh");
			}
			if(acc<_globals.hacc && _globals.onVenues==true){
				logthis("still bad radius");
				var now=(new Date().getTime());
				var diff=(now-_globals.gpsStart)/1000; //in seconds
				if(diff>=10){
					logthis("giving up");
					_globals.gpsStatus.innerHTML="Found good enough location.";
					_globals.GPS.stop();
					_globals.retryingGPS=false;
					Mojo.Event.send(cardStageController.document.getElementById("gotloc"),"gaveup");				
				}
			}
		}
		
	}
};

_globals.loadPrefs = function() {
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();


	if (credentials/* && 1==2*//*uncomment the comment before this to force the login dialog*/){
		this.username=credentials.username;
		_globals.swf=credentials.swf || "1";
		//logthis("swf="+_globals.swf);

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

function isFriend(uid){
	/*var inarray=false;

	if(_globals.friendList2){
		for(var f=0;f<_globals.friendList2.length;f++){
			logthis("in friend loop");
			logthis(Object.toJSON(_globals.friendList2[f]));
			if(_globals.friendList2[f].id==uid){
				inarray=true;
				break;
			}
		}
	}
	
	return inarray;*/
	
		return (_globals.friendsBlob.indexOf(uid+',')>-1);
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
			
			var url = "https://api.foursquare.com/v1/"+opts.endpoint;
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
			
			var url = "https://api.foursquare.com/v1/"+opts.endpoint;
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

function logthis(str){
	if(_globals.debugMode){
		Mojo.Log.error(str);
	}
}




_globals.userSuccess = function(response){
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

	/* foursquareGet(this,{
	 	endpoint: 'friends.json',
	 	requiresAuth: true,
	 	parameters: {},
		onSuccess: this.getFriendsSuccess.bind(this),
	    onFailure: this.getFriendsFailed.bind(this)		 	
	 });*/
	 
	 
	 var url = "https://api.foursquare.com/v1/friends.json";
	 var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: _globals.auth},
	   onSuccess: _globals.getFriendsSuccess.bind(this),
	   onFailure: _globals.getFriendsFailed.bind(this)
	 });


}

_globals.getFriendsSuccess = function(response){
logthis("friends ok");
	if (response.responseJSON == undefined) {
		_globals.getFriendsFailed(response);
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		_globals.friendList2 = [];
		_globals.friendsBlob='';
		
		if(response.responseJSON.friends != undefined) {
			for(var f=0;f<response.responseJSON.friends.length;f++) {
				_globals.friendList2.push(response.responseJSON.friends[f]);
				_globals.friendList2[f].grouping="Friends";
				
				_globals.friendsBlob+=response.responseJSON.friends[f].id+',';
			}
		}
		
	}
	
	logthis(Object.toJSON(_globals.friendList2));

};

_globals.getFriendsFailed = function(r){
	logthis("friendfail="+r.responseText);

};

_globals.userFailed = function(r){
	logthis("ufail="+r.responseText);
}

