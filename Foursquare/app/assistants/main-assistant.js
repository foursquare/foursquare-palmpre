function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	this.controller.setupWidget('username', this.attributes = {hintText:'Email/Phone'}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	
	this.controller.setupWidget('goLogin', this.attributes = {}, this.loginBtnModel = {label:'Log In', disabled:false});
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTapped.bind(this));

}

MainAssistant.prototype.onLoginTapped = function(event){
	$('message').innerHTML = 'logging in';
	
	this.login(this.usernameModel.value, this.passwordModel.value)
}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

MainAssistant.prototype.login = function(uname, pass){
 
	var url = "http://api.foursquare.com/v1/user.json";
	auth = make_base_auth(uname, pass);
	
	$('message').innerHTML += '<br/>sending login request';
	
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth},
	   onSuccess: this.loginRequestSuccess.bind(this),
	   onFailure: this.loginRequestFailed.bind(this)
	 });
}

var userData;

MainAssistant.prototype.loginRequestSuccess = function(response) {
	userData = response.responseJSON.user;
	$('message').innerHTML += '<br/>' + response.responseJSON.user.checkin.display;
	
	this.controller.stageController.pushScene('nearby-venues', auth, userData);
}

MainAssistant.prototype.loginRequestFailed = function(response) {
	auth = undefined;
	$('message').innerHTML = 'Login Failed... Try Again';
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
