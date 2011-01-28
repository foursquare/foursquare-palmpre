function MainAssistant(expressLogin,credentials,fp) {
	   
	   this.expressLogin=expressLogin;
	   this.credentials=credentials;
	   this.fromPrefs=fp;

	   if(credentials) {
		   this.username=this.credentials.username;
		   this.auth=this.credentials.auth;
		   if(this.auth==undefined) { //using old plaintext version of the app...
		   	this.password=this.credentials.password;
		   	this.auth=make_base_auth(this.username,this.password);
		   }
		//   logthis("auth="+this.auth);
	   }
	   
	   this.gotGPS=false;
	   this.loggedIn=false;
	   _globals.firstLoad=false;
	   this.wrongcreds=false;
	   
}

MainAssistant.prototype.setup = function() {
	_globals.mainLoaded=true;
		_globals.GPS = new Location(_globals.gotLocation, _globals.locationFailed);
	_globals.GPS.start();
	var now=(new Date().getTime());
	_globals.gpsStart=now;

	
 
 
	this.controller.setupWidget('username', this.attributes = {hintText:'Email/Phone',textCase: Mojo.Widget.steModeLowerCase}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	
	this.controller.setupWidget('goLogin', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Log In', disabled:false});
	this.controller.setupWidget('goSignup', this.attributes = {}, this.signupBtnModel = {label:'Need an account? Sign up!', disabled:false});
	this.controller.setupWidget('goHelp', this.attributes = {}, this.helpBtnModel = {label:'Help and Info', disabled:false});
	
	this.onLoginTappedBound=this.onLoginTapped.bind(this);
	this.onSignupTappedBound=this.onSignupTapped.bind(this);
	this.onHelpTappedBound=this.onHelpTapped.bind(this);
	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTappedBound);
	Mojo.Event.listen(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTappedBound);
	Mojo.Event.listen(this.controller.get("goHelp"), Mojo.Event.tap, this.onHelpTappedBound);
    this.controller.document.addEventListener("keyup", this.keyDownHandlerBound, true);

		logthis("hasweb="+_globals.hasWeb);
		if (this.expressLogin) {
			this.controller.get("loginfields").style.visibility="hidden";
			this.controller.get("main").removeClassName("palm-hasheader");
			this.controller.get("main").style.background="url(SPLASH_boy_transparent.png) no-repeat left top";
	
			this.login(this.username,this.password);
		}     	
	_globals.gpsStatus=this.controller.get("gps-status");

	/*logthis("gps error="+_globals.gpsError);
	if(_globals.gpsError!=undefined){
		logthis("has gps error");
		Mojo.Controller.errorDialog(_globals.gpsError);
	}*/

	_globals.loginFail=this.loginRequestFailed.bind(this);
}

MainAssistant.prototype.onLoginTapped = function(event){
	
	this.username=this.usernameModel.value;
	this.password=this.passwordModel.value;
	
	this.login(this.usernameModel.value, this.passwordModel.value)
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
 
	var url = "https://api.foursquare.com/v1/user.json";
	//var url="http://192.168.1.141/user.json"; //use this to test server being down
	if(this.wrongcreds){
		auth=make_base_auth(uname, pass);
	}else{
		auth = (this.expressLogin)? _globals.auth: make_base_auth(uname, pass);
	}
	
	
	this.controller.get('signupbutton').hide();
	
	this.controller.get('message').innerHTML = 'Logging <b>'+uname+'</b> in to Foursquare...';
	this.controller.get("gps-status").innerHTML="Getting location...";
	
	this.request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth},
	   onSuccess: this.loginRequestSuccess.bind(this),
	   onFailure: this.loginRequestFailed.bindAsEventListener(this,false),
	   onCreate: function(request){
			this.timeout=this.controller.window.setTimeout(function(){
		   		if(this.callInProgress(request.transport)){
		   			request.transport.abort();
		   			this.loginRequestFailed(request.transport,true);	
		   		}			
			}.bind(this),15000);
	   }.bind(this)
	 });
}

var userData;

MainAssistant.prototype.loginRequestSuccess = function(response) {
	if(response.status!=0){
		if(response.responseJSON.error==undefined){
			this.controller.window.clearTimeout(this.timeout);
			userData = response.responseJSON.user;
			var disp=(response.responseJSON.user.checkin != undefined)? response.responseJSON.user.checkin.display: "Logged in!";
			this.controller.get('message').innerHTML = disp;
			var uid=response.responseJSON.user.id;
			var savetw=response.responseJSON.user.settings.sendtotwitter;
			var savefb=response.responseJSON.user.settings.sendtofacebook;
		 	var ping=_globals.swf; //response.responseJSON.user.settings.pings;
			_globals.uid=uid;
			_globals.username=this.username;
			_globals.password=this.password;
			_globals.city="";//city;
		
			this.cookieData=new Mojo.Model.Cookie("credentials");
			this.cookieData.put({
				username: this.username,
				password: "",
				auth: auth,
				uid: uid,
				savetotwitter: savetw,
				savetofacebook: savefb,
				ping: ping,
				cityid: 0,
				city: ""
			});
			this.loggedIn=true;
			if(this.fromPrefs){
				_globals.reloadVenues=true;
				_globals.reloadFriends=true;
				_globals.reloadTips=true;
				
				this.controller.stageController.popScene('preferences');
				this.controller.stageController.popScene('main');
			}else{
				if(_globals.gotGPS){
					_globals.firstLoad=true;
					this.controller.stageController.swapScene('nearby-venues',auth,userData,this.username,this.password,uid);
				}else{
					this.gpscheck=this.controller.window.setInterval(function(){
						if(_globals.gotGPS){
							_globals.firstLoad=true;
							this.controller.stageController.swapScene('nearby-venues',auth,userData,this.username,this.password,uid);
						}
					}.bind(this),200);
				}
			
			}
		}else{
			this.loginRequestFailed(response,true);
		}
	}else{
		this.loginRequestFailed(response,true);
	}
}
MainAssistant.prototype.connectionTimedOut = function() {
};

MainAssistant.prototype.loginRequestFailed = function(response,timeout,noConnection) {
	auth = undefined;
	try{
		this.controller.get('goLogin').mojo.deactivate();
	}
	catch(e){
		
	}
	this.controller.get('main').style.background="";
	this.controller.get("loginfields").style.visibility="visible";
	var msg="";
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
	}
	if(resetcredentials){
		var eauth=_globals.auth.replace("Basic ","");
		var plaintext=Base64.decode(eauth);
		var creds=plaintext.split(":");
		var un=creds[0];
		var pw=creds[1];
	
		this.usernameModel.value=un;
		this.passwordModel.value=pw;
		this.controller.modelChanged(this.usernameModel);
		this.controller.modelChanged(this.passwordModel);
	}
	
	if(timeout){
		this.wrongcreds=false;
		msg='Foursquare appears to be down. Try again later.<br/><a href="http://status.foursquare.com/">Check Status of foursquare</a>';
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
	
}












MainAssistant.prototype.failedLocation = function(event) {
	this.controller.get('gps-status').innerHTML = 'failed to get location: ' + event.errorCode;
	logthis('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});

}


MainAssistant.prototype.deactivate = function(event) {
}

MainAssistant.prototype.cleanup = function(event) {
	this.controller.window.clearInterval(this.gpscheck);
	Mojo.Event.stopListening(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTappedBound);
	Mojo.Event.stopListening(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTappedBound);
    this.controller.document.removeEventListener("keyup", this.keyDownHandlerBound, true);
}



