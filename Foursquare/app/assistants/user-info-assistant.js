function UserInfoAssistant(a,u) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.auth=a;
	   this.uid=u;
}

UserInfoAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
			this.getUserInfo();

	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	    this.controller.setupWidget("userSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

	/* add event handlers to listen to events from widgets */
}

UserInfoAssistant.prototype.getUserInfo = function() {
	var url = 'http://api.foursquare.com/v1/user.json';
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:this.uid,badges: '1', mayor: '1'},
	   onSuccess: this.getUserInfoSuccess.bind(this),
	   onFailure: this.getUserInfoFailed.bind(this)
	 });
}

UserInfoAssistant.prototype.getUserInfoSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	var j=response.responseJSON;
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();

	
	//user info
	$("userPic").src=j.user.photo;
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	var tw=(j.user.twitter != undefined)? '<img src="images/bird.png" width="16" height="16" /> <a href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a>': "";
	$("userName").innerHTML=j.user.firstname+" "+lname+"<br class=\"breaker\"/>";
	$("userInfo").innerHTML+=j.user.city.name+"<br/>";
	$("userInfo").innerHTML+=tw+"<br/>";

	//user's mayorships
	if(j.user.mayor != null) {
		for(var m=0;m<j.user.mayor.length;m++) {
			$("mayor-box").innerHTML+='<div class="palm-row single"><div class="checkin-score truncating-text"><span>'+j.user.mayor[m].name+'</span></div></div>';
		}
	}else{
		$("mayor-box").innerHTML='<div class="palm-row single"><div class="checkin-score"><span>'+j.user.firstname+' isn\'t the mayor of anything yet.</span></div></div>';
	}

	//user's badges
	if(j.user.badges != null && credentials.cityid==j.user.city.id) {
		for(var m=0;m<j.user.badges.length;m++) {
			$("badges-box").innerHTML+='<div class="palm-row single"><div class="checkin-badge"><img src="'+j.user.badges[m].icon+'" width="48" height="48" style="float:left" /> <span>'+j.user.badges[m].name+'</span><br/><span class="palm-info-text" style="margin-left:0;padding-left:0">'+j.user.badges[m].description+'</span></div></div>';
		}
	}else{
		$("badges-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' doesn\'t have any badges in '+credentials.city+' yet.</span></div></div>';
	}
		
	$("userScrim").hide();
	$("userSpinner").mojo.stop();
	$("userSpinner").hide();

}

UserInfoAssistant.prototype.getUserInfoFailed = function(response) {

}

UserInfoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


UserInfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

UserInfoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
