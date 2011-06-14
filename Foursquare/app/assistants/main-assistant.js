function MainAssistant(expressLogin,credentials,fp) {
	   
	   this.expressLogin=expressLogin;
	   this.credentials=credentials;
	   this.fromPrefs=fp;
	   this.gpsDone=false;
	   this.loginDone=false;

        this.cookieData=new Mojo.Model.Cookie("oauth");
		var credentials=this.cookieData.get();

		if(credentials){
			logthis("creds="+credentials.token);
			this.token=credentials.token;
			_globals.token=this.token;
			this.expressLogin=true;
		}else{
			logthis("no creds");
			this.token='';
			this.expressLogin=false;
		}

	   
	   this.gotGPS=false;
	   this.loggedIn=false;
	   _globals.firstLoad=true;
	   this.wrongcreds=false;
	   this.gpsCount=0;
	   
	   this.gettingGPS=false;
	   
};
MainAssistant.prototype.gpsTimedOut = function(){
	logthis("gps timed out. trying one final time");
	this.controller.get("gps-message").update("GPS timed out! Trying again...");
	this.controller.window.clearTimeout(this.gpsTimeout);

    this.getLocationClearAll();

	logthis("cleared gps trackers");
	
	this.failedLocationBound=this.failedLocation.bind(this);

	logthis("trying one-off request");
	fsq.Metrix.ServiceRequest.request('palm://com.palm.location', {
		method: "getCurrentPosition",
		parameters: {accuracy: 1, maximumAge:0, responseTime: 1},
		onSuccess: this.gpsSuccessBound,
		onFailure: this.failedLocationBound
	});

};

MainAssistant.prototype.getLocation = function(event){
logthis("getting location...");
	this.gettingGPS=true;
	this.controller.get("gps-message").update("Initiating GPS...");
	//set up the timeout timer
	this.gpsTimeout=this.controller.window.setTimeout(function(){this.gpsTimedOut();}.bind(this),17000);
	
	this.trackGPSObjA = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			logthis("gps ok!");
			logthis(Object.toJSON(event));
			this.gpsCount++;
			if (event.errorCode==undefined){
				//--> This is simply our 'returnValue: true' call. No data here.
				logthis("true call");
				this.controller.get("gps-message").update("Finding your location...");

			}else{
				if (event.errorCode != 0){
					logthis("location error");
					this.failedLocationBound=this.failedLocation.bind(this);
					this.failedLocationBound(event);
					if (event.errorCode == 5){
						//--> Alert user that location services are off	
						this.controller.get("gps-message").update("Location services not enabled!");
						this.controller.window.clearTimeout(this.gpsTimeout);

					}else if (event.errorCode == 4){
						//--> Alert user that GPS Permanent Failure (reboot device is the advice).
						this.controller.get("gps-message").update("Permanent GPS Failure! Restart device.");
						this.controller.window.clearTimeout(this.gpsTimeout);

					}
				}else{
					logthis("location  OK!");
					//--> Got a GPS Response, cache it for later!
					_globals.gps = event;
					
					var acc=(_globals.gpsAccuracy != undefined)? Math.abs(_globals.gpsAccuracy): 750;
					logthis("acc="+acc);
					if(this.gpsCount<4){
						if(acc>=event.horizAccuracy || acc==0){
							this.controller.get("gps-message").update("Found you!");

							this.gpsSuccessBound(event);
							
							//--> Stop tracking
							this.trackGPSObjA.cancel();							
						}else{
							this.controller.get("gps-message").update("Getting better accuracy...");
						}
					}else{
					
						//--> Do your other stuff here and give up
						/*		... code	
							*/
						this.controller.get("gps-message").update("Found you!");

						this.gpsSuccessBound(event);
						
						//--> Stop tracking
						this.trackGPSObjA.cancel();
					
					}
				}
			}
		}.bind(this),
		onFailure: function(event){
			this.controller.get("gps-message").update("GPS Failure! Error: "+event.errorCode);
			this.controller.window.clearTimeout(this.gpsTimeout);

			//Mojo.Log.error("*** trackGPSObj FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
		}.bind(this)
	});
	
	logthis("gettting location b");

	//--> Launch a second tracking to 'unstick' GPS
	this.trackGPSObjB = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			if (event.errorCode){
				logthis("tracker b canceled");
				this.trackGPSObjB.cancel();		//--> Stop tracking
			}
		}.bind(this),
		onFailure: function(event){
			//logthis("*** trackGPSObjB FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
			logthis("tracker b failed: "+event.errorCode);
		}.bind(this)
	});
	
	logthis("getting location c");
	//--> Launch a third tracking to 'unstick' GPS
	this.trackGPSObjC = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			if (event.errorCode){
				logthis("tracker c canceled");
				this.trackGPSObjC.cancel();		//--> Stop tracking
			}
		}.bind(this),
		onFailure: function(event){
			logthis("tracker c failed: "+event.errorCode);
			//logthis("*** trackGPSObjC FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
		}.bind(this)
	});
}
MainAssistant.prototype.getLocationClearAll = function(event){
	logthis("clearing all trackers");

	try{
		this.trackGPSObjC.cancel();
	}catch(e){logthis("tracker c failed clear");}
	try{
		this.trackGPSObjA.cancel();
	}catch(e){logthis("tracker a failed clear");}
	try{
		this.trackGPSObjB.cancel();
	}catch(e){logthis("tracker b failed clear");}
};

MainAssistant.prototype.setup = function() {
	_globals.mainLoaded=true;

	
	this.gpsSuccessBound=this.gpsSuccess.bind(this);
//	this.controller.serviceRequest('palm://com.palm.location', {
	
	
	/*fsq.Metrix.ServiceRequest.request('palm://com.palm.location', {
	    method:"getCurrentPosition",
	    parameters:{accuracy:1, maximumAge: 0, responseTime: 1},
	    onSuccess: this.gpsSuccessBound,
	    onFailure: this.failedLocation.bind(this)
	    }
	);*/ 
	
/*    this.controller.setupWidget("loginSpinner",
        this.attributes = {
            spinnerSize: "small"
        },
        this.model = {
            spinning: true 
        }
    ); 

	this.controller.get("loginSpinner").hide();*/

  	this.spinnerAttr = {
		superClass: 'fsq_spinner_hidden',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('loginSpinner', this.spinnerAttr, this.spinnerModel);
//	this.controller.get("loginSpinner").hide();

 
/*	this.controller.setupWidget('username', this.attributes = {hintText:'Email/Phone',textCase: Mojo.Widget.steModeLowerCase}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	
	this.controller.setupWidget('goLogin', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Log In', disabled:false});*/

//	this.controller.setupWidget('goSignup', this.attributes = {}, this.signupBtnModel = {label:'Need an account? Sign up!', disabled:false});
//	this.controller.setupWidget('goHelp', this.attributes = {}, this.helpBtnModel = {label:'Help and Info', disabled:false});
	
	this.onLoginTappedBound=this.onLoginTapped.bind(this);
	this.onSignupTappedBound=this.onSignupTapped.bind(this);
	this.onHelpTappedBound=this.onHelpTapped.bind(this);
	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	
	Mojo.Event.listen(this.controller.get("login-button"), Mojo.Event.tap, this.onLoginTappedBound);
	Mojo.Event.listen(this.controller.get("login-signup"), Mojo.Event.tap, this.onSignupTappedBound);
	Mojo.Event.listen(this.controller.get("login-help"), Mojo.Event.tap, this.onHelpTappedBound);
//    this.controller.document.addEventListener("keyup", this.keyDownHandlerBound, true);

	_globals.gpsStatus=this.controller.get("gps-status");

	_globals.loginFail=this.loginRequestFailed.bind(this);

	if (this.expressLogin && this.fromPrefs!=true) {
		this.controller.get("login-button").style.visibility="hidden";

		 foursquareGet(this,{
		 	endpoint: 'venues/categories',
		 	requiresAuth: true,
		 	ignoreErrors: true,
		 	parameters: {},
		 	onSuccess: _globals.categorySuccess.bind(this),
		 	onFailure: _globals.categoryFailed.bind(this)
		 });
		this.login();
	}else{
		logthis("spinner should hide");
/*		if(this.controller.get("loginSpinner").hide()){
			logthis("yay!");
		}else{
			logthis("booo!");
		}*/
	} 	

}

MainAssistant.prototype.onLoginTapped = function(event){
	this.controller.stageController.pushScene("oauth",this.fromPrefs);
}

MainAssistant.prototype.onSignupTapped = function(event){
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				 method: 'open',
				 parameters: {
					 target: "http://foursquare.com/mobile/signup"
				 }
			});

}

MainAssistant.prototype.onHelpTapped = function(event){
     var stageArguments = {name: "helpStage", lightweight: true};
     var pushMainScene=function(stage){
     	this.metatap=false;
		stage.pushScene({name:"help",transition:Mojo.Transition.zoomFade});
     
     };
    var appController = Mojo.Controller.getAppController();
	appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");

};

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  _globals.auth="Basic " + hash;
  return "Basic " + hash;
}
MainAssistant.prototype.callInProgress = function(xmlhttp) {
	switch (xmlhttp.readyState) {
		case 1: case 2: case 3:
			return true;
			break;
		// Case 4 and 0
		default:
			return false;
			break;
	}
}


MainAssistant.prototype.login = function(uname, pass){
	logthis("logging in");
 	this.controller.get("loginSpinner").style.visibility='visible';
	//this.controller.get("loginSpinner").mojo.start();
 
	var url="https://api.foursquare.com/v2/multi?requests="+encodeURIComponent("/users/self,/settings/all,/users/requests")+"&oauth_token="+this.token;
	
	//this.controller.get('signupbutton').hide();
		
	this.request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   onSuccess: this.loginRequestSuccess.bind(this),
	   onFailure: this.loginRequestFailed.bindAsEventListener(this,false),
	   onCreate: function(request){
			this.timeout=this.controller.window.setTimeout(function(){
		   		if(this.callInProgress(request.transport)){
		   			request.transport.abort();
		   			this.loginRequestFailed(request.transport,true);	
		   		}			
			}.bind(this),60000);
	   }.bind(this)
	 });
}

var userData;

MainAssistant.prototype.loginRequestSuccess = function(response) {
logthis("login ok");
logthis(response.responseText);
	var j=response.responseJSON;
	if(j.meta.code==200){
		this.controller.window.clearTimeout(this.timeout);
		userData = j.response.responses[0].response.user;
		var settings=j.response.responses[1].response.settings;
		var fname=userData.firstName;
		var lname=(userData.lastName)? ' '+userData.lastName: '';
		this.controller.get("message").update(fname + lname);
		
		var uid=userData.id;
		var savetw=settings.sendToTwitter;
		var savefb=settings.sendToFacebook;
		var getPings=settings.receivePings;
		logthis(Object.toJSON(settings));
		var getComments=settings.receiveCommentPings;
		
		
		//handle friend requests
		_globals.requests='';
		for(var f=0;f<j.response.responses[2].response.requests.length;f++){
			var html=Mojo.View.render({template:'listtemplates/friend-requests',object:j.response.responses[2].response.requests[f]});
			_globals.requests+=html;
		}
		logthis("reqs="+_globals.requests);
		
		_globals.uid=uid;
		_globals.settings=settings;
		_globals.userData=userData;
		_globals.username=fname + lname;
		this.loggedIn=true;
		
		this.loginDone=true;
		this.proceed();
	}else{
		this.loginRequestFailed(response,true);
	}
}
MainAssistant.prototype.connectionTimedOut = function() {
};

MainAssistant.prototype.loginRequestFailed = function(response,timeout,noConnection) {
	logthis(response.responseText);

	auth = undefined;
	try{
		this.controller.get('goLogin').mojo.deactivate();
	}
	catch(e){
		
	}
	
 	this.controller.get("loginSpinner").style.visibility='hidden';

	//this.controller.get('main').style.background="";
	//this.controller.get("loginfields").style.visibility="visible";
	/*var msg="";
	var resetcredentials=true;
	if(response.responseJSON != undefined){
		if(response.responseJSON.ratelimited != undefined) {
			msg="Rate-limited. Try again later.";
			this.wrongcreds=false;
		}else if(response.responseJSON.unauthorized != undefined){
			msg="Whoops! Wrong username or password!";
			resetcredentials=false;
			this.wrongcreds=true;
		}else{
			this.wrongcreds=false;
			msg='Couldn\'t log you in for some reason. Try again later.';
		}
	}*/
	if(!timeout){
		switch(response.responseJSON.meta.code){
			case 401:
				this.controller.get("login-button").style.visibility="visible";
				break;
			default:
				this.controller.showAlertDialog({
					onChoose: function(value) {
						if(value=="retry"){
							this.login();
						}
					}.bind(this),
					title: $L("Error"),
					message: $L(response.responseJSON.meta.errorDetail+"<br/>Endpoint: Login"),
					allowHTMLMessage: true,
					choices:[
						{label:$L('Try Again'), value:"retry", type:'primary'},
						{label:$L('D\'oh!'), value:"OK", type:'primary'}
					]
				});
				break;
		}
	}
/*	if(resetcredentials){
		var eauth=_globals.auth.replace("Basic ","");
		var plaintext=Base64.decode(eauth);
		var creds=plaintext.split(":");
		var un=creds[0];
		var pw=creds[1];
	
		this.usernameModel.value=un;
		this.passwordModel.value=pw;
		this.controller.modelChanged(this.usernameModel);
		this.controller.modelChanged(this.passwordModel);
	}*/
	
	if(timeout){
		this.wrongcreds=false;
		msg='Foursquare appears to be down. Try again later.<br/><a href="http://status.foursquare.com/">Check Status of foursquare</a>';
		this.controller.showAlertDialog({
			onChoose: function(value) {
				if(value=="retry"){
					this.login();
				}
			}.bind(this),
			title: $L("Error"),
			message: $L('Foursquare appears to be down. Try again later.<br/><a href="http://status.foursquare.com/">Check Status of foursquare</a>'),
			allowHTMLMessage: true,
			choices:[
				{label:$L('Try Again'), value:"retry", type:'primary'},
				{label:$L('D\'oh!'), value:"OK", type:'primary'}
			]
		});

	}
	if(noConnection){
		this.wrongcreds=false;
		msg='Your phone doesn\'t have an active Internet connection.';
	}
	this.controller.window.clearInterval(this.gpscheck);
	this.controller.get('message').innerHTML = ""+msg;
	

}

		
MainAssistant.prototype.keyDownHandler = function(event) {
      if(Mojo.Char.isEnterKey(event.keyCode)) {
         if(event.srcElement.parentElement.id=="password") {
    		setTimeout(this.onLoginTapped.bind(this), 10);
         }
      }
}	



MainAssistant.prototype.activate = function(event) {
   	if(!this.fromPrefs) {
		_globals.main=this;
	}
	
	if(!this.gettingGPS){
		this.getLocation();
	}

	
	if(event){
		if(event.token){
			//start logging in!
			_globals.token=event.token;
			this.token=event.token;
			this.controller.get("login-button").style.visibility='hidden';
			this.controller.get("loginSpinner").style.visibility='visible';
			this.login();
		}else{
//			this.controller.get("loginSpinner").hide();
		}
	}else{
//		this.controller.get("loginSpinner").hide();	
	}
}


MainAssistant.prototype.proceed = function(){
	if(this.loginDone && this.gpsDone){
		logthis("logged in and got gps");
		this.controller.get("loginSpinner").mojo.stop();
		this.controller.stageController.swapScene('nearby-venues');
	}
};








MainAssistant.prototype.gpsSuccess = function(event) {
	logthis("got gps response");
	this.controller.window.clearTimeout(this.gpsTimeout);

	if(event.errorCode==0){
		logthis("gps is ok");
		
		_globals.lat=event.latitude;
		_globals.long=event.longitude;
		_globals.hacc=event.horizAccuracy;
		_globals.vacc=event.vertAccuracy;
		_globals.altitude=event.altitude;
		_globals.gps=event;
		
		

		
		this.gpsDone=true;
		this.proceed();
	}else{
		this.failedLocation(event);
	}
};

MainAssistant.prototype.failedLocation = function(event) {
	logthis("location failed!");
	this.controller.window.clearTimeout(this.gpsTimeout);

	var msg='';
	switch(event.errorCode){
		case 1:
			msg='Your GPS timed out. Try using your phone outside or restarting your phone. (EC1)';
			break;
		case 2:
			msg="Your position is unavailable. Satellites could not be located. (EC2)";
			break;
		case 3:
			msg="Your GPS returned an unknown error. Try restarting your phone. (EC3)";
			break;
		case 5:
			msg="You have Location Services turned off. Please turn them on and restart foursquare. (EC5)";
			break;
		case 6:
			msg="GPS permission was denied. You have not accepted the terms of use for the Google Location Service. (EC6)";
			break;
		case 7:
			msg="foursquare is already awaiting a GPS response and asked for another. Try restarting your phone. (EC7)";
			break;
		case 8:
			msg="foursquare was denied GPS access for this session. Please restart your phone and allow foursquare access when prompted. (EC8)";
			break;
	}
	logthis("failure msg="+msg);

	this.controller.showAlertDialog({
		onChoose: function(value) {
			if(value=="retry"){
				fsq.Metrix.ServiceRequest.request('palm://com.palm.location', {
				    method:"getCurrentPosition",
				    parameters:{accuracy:1, maximumAge: 0, responseTime: 1},
				    onSuccess: this.gpsSuccessBound,
				    onFailure: this.failedLocation.bind(this)
				    }
				); 
			}
		}.bind(this),
		title: $L("GPS Error"),
		message: $L(msg),
		allowHTMLMessage: true,
		choices:[
			{label:$L('Try Again'), value:"retry", type:'primary'},
			{label:$L('D\'oh!'), value:"OK", type:'primary'}
		]
	});

//	this.controller.get('gps-status').innerHTML = 'failed to get location: ' + event.errorCode;
	logthis('failed to get location: ' + event.errorCode);
//	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});

}


MainAssistant.prototype.deactivate = function(event) {
}

MainAssistant.prototype.cleanup = function(event) {
	this.controller.window.clearInterval(this.gpscheck);
//	Mojo.Event.stopListening(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTappedBound);
//	Mojo.Event.stopListening(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTappedBound);
    this.controller.document.removeEventListener("keyup", this.keyDownHandlerBound, true);
    this.getLocationClearAll();
}



