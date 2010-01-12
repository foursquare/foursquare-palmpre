function MainAssistant(expressLogin,credentials,fp) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
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
	   }
	   
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	if (this.expressLogin) {
		$("loginfields").style.visibility="hidden";
		$("main").removeClassName("palm-hasheader");
		$("message").style.marginTop="70px";
		$("main").style.background="url(SPLASH_boy_transparent.png) no-repeat left top";
	
		this.login(this.username,this.password);
	}
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	this.controller.setupWidget('username', this.attributes = {hintText:'Email/Phone',textCase: Mojo.Widget.steModeLowerCase}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	
	this.controller.setupWidget('goLogin', this.attributes = {}, this.loginBtnModel = {label:'Log In', disabled:false});
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTapped.bind(this));
    this.controller.document.addEventListener("keyup", this.keyDownHandler.bind(this), true);
}

MainAssistant.prototype.onLoginTapped = function(event){
	$('message').innerHTML = 'logging in';
	
	this.username=this.usernameModel.value;
	this.password=this.passwordModel.value;
	Mojo.Log.error(this.username + ":" + this.password);
	
	this.login(this.usernameModel.value, this.passwordModel.value)
}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  _globals.auth="Basic " + hash;
  return "Basic " + hash;
}

MainAssistant.prototype.login = function(uname, pass){
 
	var url = "http://api.foursquare.com/v1/user.json";
	
	Mojo.Log.error("######express? "+this.expressLogin+", auth="+_globals.auth);
	
	
	
	
	auth = (this.expressLogin)? _globals.auth: make_base_auth(uname, pass);
	
	$('signupbutton').hide();
	
	$('message').innerHTML = '<br/>Logging <b>'+uname+'</b> in to Foursquare...';
	
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth},
	   onSuccess: this.loginRequestSuccess.bind(this),
	   onFailure: this.loginRequestFailed.bind(this)
	 });
	 Mojo.Log.error("tried login.");
}

var userData;

MainAssistant.prototype.loginRequestSuccess = function(response) {
	userData = response.responseJSON.user;
	var disp=(response.responseJSON.user.checkin != undefined)? response.responseJSON.user.checkin.display: "Logged in!";
	$('message').innerHTML = '<br/>' + disp;
	var uid=response.responseJSON.user.id;
	var savetw=response.responseJSON.user.settings.sendtotwitter;
	var savefb=response.responseJSON.user.settings.sendtofacebook;
 	var ping=response.responseJSON.user.settings.pings;
	var cityid=response.responseJSON.user.city.id;
	var city=response.responseJSON.user.city.name;
	_globals.uid=uid;
	_globals.username=this.username;
	_globals.password=this.password;
	_globals.city=city;

	this.cookieData=new Mojo.Model.Cookie("credentials");
	this.cookieData.put({
		username: this.username,
		password: "",
		auth: auth,
		uid: uid,
		savetotwitter: savetw,
		savetofacebook: savefb,
		ping: ping,
		cityid: cityid,
		city: city
	});
	if(this.fromPrefs){
		_globals.reloadVenues=true;
		_globals.reloadFriends=true;
		_globals.reloadTips=true;
		
		this.controller.stageController.popScene('preferences');
		this.controller.stageController.popScene('main');
	}else{
		setTimeout(this.controller.stageController.swapScene('nearby-venues',auth,userData,this.username,this.password,uid),3000);
	}
}

MainAssistant.prototype.loginRequestFailed = function(response) {
	auth = undefined;
	$('main').style.background="";
	Mojo.Log.error(response.responseText);
	$("loginfields").style.visibility="visible";
	$('message').innerHTML = 'Login Failed... Try Again';
}

		
MainAssistant.prototype.keyDownHandler = function(event) {
      if(Mojo.Char.isEnterKey(event.keyCode)) {
         if(event.srcElement.parentElement.id=="password") {
    		$('username').mojo.blur();
    		setTimeout(this.onLoginTapped.bind(this), 10);
         }
      }
}	



MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
