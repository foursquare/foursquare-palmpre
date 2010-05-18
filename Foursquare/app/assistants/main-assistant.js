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
		   Mojo.Log.error("auth="+this.auth);
	   }
	   
	   this.gotGPS=false;
	   this.loggedIn=false;
	   _globals.firstLoad=false;
	   
}

MainAssistant.prototype.setup = function() {
	_globals.mainLoaded=true;
	if (this.expressLogin) {
		Mojo.Log.error("expresslogin");
		this.controller.get("loginfields").style.visibility="hidden";
		this.controller.get("main").removeClassName("palm-hasheader");
		this.controller.get("message").style.marginTop="70px";
		this.controller.get("main").style.background="url(SPLASH_boy_transparent.png) no-repeat left top";

		this.login(this.username,this.password);
	}
	this.controller.setupWidget('username', this.attributes = {hintText:'Email/Phone',textCase: Mojo.Widget.steModeLowerCase}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	
	this.controller.setupWidget('goLogin', this.attributes = {}, this.loginBtnModel = {label:'Log In', disabled:false});
	this.controller.setupWidget('goSignup', this.attributes = {}, this.signupBtnModel = {label:'Need an account? Sign up!', disabled:false});
	
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTapped.bind(this));
	Mojo.Event.listen(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTapped.bind(this));
    this.controller.document.addEventListener("keyup", this.keyDownHandler.bind(this), true);
}

MainAssistant.prototype.onLoginTapped = function(event){
	this.controller.get('message').innerHTML = 'logging in';
	
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
 
	var url = "http://api.foursquare.com/v1/user.json";
	//var url="http://192.168.1.141/user.json"; //use this to test server being down
	auth = (this.expressLogin)? _globals.auth: make_base_auth(uname, pass);
	//this.timeout=this.controller.window.setTimeout(this.connectionTimedOut.bindAsEventListener(this),5000);
	
	this.controller.get('signupbutton').hide();
	
	this.controller.get('message').innerHTML = '<br/><br/>Logging <b>'+uname+'</b> in to Foursquare... <div class="small-text">Getting location...</div>';
	
	this.request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth},
	   onSuccess: this.loginRequestSuccess.bind(this),
	   onFailure: this.loginRequestFailed.bind(this,false),
	   onCreate: function(request){
			this.timeout=this.controller.window.setTimeout(function(){
		   		if(this.callInProgress(request.transport)){
		   			request.transport.abort();
		   			this.loginRequestFailed(request.transport,true);	
		   		}			
			}.bind(this),10000);
	   }.bind(this)
	 });
}

var userData;

MainAssistant.prototype.loginRequestSuccess = function(response) {
logthis("complete: "+response.status);
	if(response.status!=0){
		this.controller.window.clearTimeout(this.timeout);
		userData = response.responseJSON.user;
		var disp=(response.responseJSON.user.checkin != undefined)? response.responseJSON.user.checkin.display: "Logged in!";
		this.controller.get('message').innerHTML = '<br/>' + disp;
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
				Mojo.Log.error("waiting on GPS");
				this.gpscheck=this.controller.window.setInterval(function(){
					Mojo.Log.error("checking gps");
					if(_globals.gotGPS){
						Mojo.Log.error("got gps finally!");
						_globals.firstLoad=true;
						this.controller.stageController.swapScene('nearby-venues',auth,userData,this.username,this.password,uid);
					}
				}.bind(this),200);
				this.controller.get('message').innerHTML+='<div class="small-text">Getting location...</div>';
			}
		
		}
	}else{
		this.loginRequestFailed(response,true);
	}
}
MainAssistant.prototype.connectionTimedOut = function() {
	//this.request.abort();
};

MainAssistant.prototype.loginRequestFailed = function(response,timeout) {
	auth = undefined;
	this.controller.get('main').style.background="";
	this.controller.get("loginfields").style.visibility="visible";
	var msg="";
	if(response.responseJSON != undefined){
		if(response.responseJSON.ratelimited != undefined) {
			msg="Rate-limited. Try again later.";
		}else{
			msg='Login Failed... Try Again';
		}
	}
	var eauth=_globals.auth.replace("Basic ","");
	var plaintext=Base64.decode(eauth);
	var creds=plaintext.split(":");
	var un=creds[0];
	var pw=creds[1];

	this.usernameModel.value=un;
	this.passwordModel.value=pw;
	this.controller.modelChanged(this.usernameModel);
	this.controller.modelChanged(this.passwordModel);

	if(timeout){
		msg='Foursquare appears to be down. Try again later.<br/><a href="http://m.twitter.com/foursquare">Check @foursquare on Twitter for Status</a>';
	}
	this.controller.window.clearInterval(this.gpscheck);
	this.controller.get('message').innerHTML = "<br/><br/>"+msg;

}

		
MainAssistant.prototype.keyDownHandler = function(event) {
      if(Mojo.Char.isEnterKey(event.keyCode)) {
         if(event.srcElement.parentElement.id=="password") {
    		this.controller.get('username').mojo.blur();
    		setTimeout(this.onLoginTapped.bind(this), 10);
         }
      }
}	



MainAssistant.prototype.activate = function(event) {
	//sneakily grab coords in the background...
   	if(!this.fromPrefs) {
   	/*	this.controller.serviceRequest('palm://com.palm.location', {
			method: "getCurrentPosition",
			parameters: {accuracy: 1, maximumAge:0, responseTime: 1},
			onSuccess: this.gotLocation.bind(this),
			onFailure: this.failedLocation.bind(this)
		});*/
		
//		_globals.GPS = new Location(_globals.gotLocation);
//		_globals.GPS.start();
		
		_globals.main=this;
	}
}












MainAssistant.prototype.failedLocation = function(event) {
	this.controller.get('message').innerHTML = 'failed to get location: ' + event.errorCode;
	Mojo.Log.error('failed to get location: ' + event.errorCode);
	Mojo.Controller.getAppController().showBanner("Location services required!", {source: 'notification'});

}


MainAssistant.prototype.deactivate = function(event) {
}

MainAssistant.prototype.cleanup = function(event) {
	this.controller.window.clearInterval(this.gpscheck);
}



