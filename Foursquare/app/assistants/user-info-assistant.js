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
	var tw=(j.user.twitter != undefined)? '<img src="images/bird.png" width="16" height="16" /> <a href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a><br/>': "";
	var fb=(j.user.facebook != undefined)? '<img src="images/facebook.gif" width="16" height="16" /> <a href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a><br/>': "";
	var ph=(j.user.phone != undefined)? '<img src="images/phone.png" width="16" height="16" /> <a href="tel://'+j.user.phone+'">'+j.user.phone+'</a><br/>': "";
	var em=(j.user.email != undefined)? '<img src="images/mail.png" width="16" height="16" /> <a href="mailto:'+j.user.email+'">'+j.user.email+'</a><br/>': "";
	var friendstatus=(j.user.friendstatus != undefined)? j.user.friendstatus: "";

	switch (friendstatus) {
		case "friend":
			var fs='<img src="images/friend.png" width="100" height="35" id="isfriend" alt="Friend" />';
			var fs="You're friends!"
			break;
		case "pendingthem":
			var fs='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
			break;
		case "pendingyou":
			var fs='<img src="images/approve.png" width="100" height="35" id="approvefriend" alt="Approve" /> <img src="images/deny.png" width="100" height="35" id="denyfriend" alt="Deny" />';		
			break;
		default:
			var fs='<img src="images/addfriend.png" width="100" height="35" id="addfriend" alt="Add Friend" />';					
			break;
	}
	
	fs='<span id="friend_button">'+fs+'</span>';
	
	$("userName").innerHTML=j.user.firstname+" "+lname+"<br class=\"breaker\"/>";
	$("userInfo").innerHTML+=j.user.city.name+"<br/>";
	$("userInfo").innerHTML+=em+ph+tw+fb+fs;
	if(j.user.checkin != undefined) {
		$("userInfo").innerHTML+="<br/>"+j.user.checkin.display;
	}
	
	//assign events to the new button(s)
	if(friendstatus=="pendingyou") {
		Mojo.Event.listen($("approvefriend"),Mojo.Event.tap,this.approveFriend.bind(this));
		Mojo.Event.listen($("denyfriend"),Mojo.Event.tap,this.denyFriend.bind(this));
	}
	if(friendstatus=="") {
		Mojo.Event.listen($("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}

	//user's mayorships
	if(j.user.mayor != null) {
		for(var m=0;m<j.user.mayor.length;m++) {
			$("mayor-box").innerHTML+='<div class="palm-row single"><div class="checkin-score truncating-text"><span>'+j.user.mayor[m].name+'</span></div></div>';
		}
	}else{
		$("mayor-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' isn\'t the mayor of anything yet.</span></div></div>';
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
	Mojo.Controller.getAppController().showBanner("Error getting the user's info.", {source: 'notification'});

}

UserInfoAssistant.prototype.approveFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:this.uid},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		$("friend_button").innerHTML='<img src="images/friend.png" width="100" height="35" id="isfriend" alt="Friend" />';
	}else{
		Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.approveFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
}

UserInfoAssistant.prototype.denyFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/deny.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:this.uid},
	   onSuccess: this.denySuccess.bind(this),
	   onFailure: this.denyFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.denySuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request denied!", {source: 'notification'});
		$("friend_button").innerHTML='<img src="images/addfriend.png" width="100" height="35" id="addfriend" alt="Add Friend" />';
		Mojo.Event.listen($("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.denyFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
}




UserInfoAssistant.prototype.addFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:this.uid},
	   onSuccess: this.addSuccess.bind(this),
	   onFailure: this.addFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.addSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request sent!", {source: 'notification'});
		$("friend_button").innerHTML='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
	}else{
		Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.addFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
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
