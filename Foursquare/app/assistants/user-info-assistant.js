function UserInfoAssistant(a,u,ps,ff) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.auth=_globals.auth;
	   this.uid=u;
	   this.prevScene=ps;
	   this.fromFriends=ff;
}

UserInfoAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	if(this.fromFriends){
		zBar.render("user","");
	}
	
	
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
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
         
   /* this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'blue-command-nope'
        },
    _globals.cmmodel);*/

		this.mayorshipModel = {items: [], listTitle: $L('Results')};
	   
	this.controller.setupWidget('mayorshipList', 
					      {itemTemplate:'listtemplates/venueItemsLimited'},
					      this.mayorshipModel);
		this.historyModel = {items: [], listTitle: $L('Results')};
	   
	this.controller.setupWidget('checkinHistory', 
					      {itemTemplate:'listtemplates/venueItemsShout'},
					      this.historyModel);

	/* add event handlers to listen to events from widgets */
		Mojo.Event.listen(this.controller.get('mayorshipList'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('checkinHistory'),Mojo.Event.listTap, this.historyListWasTapped.bind(this));

	$("uhistory").hide();

_globals.ammodel.items[0].disabled=true;
this.controller.modelChanged(_globals.ammodel);

}
var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

UserInfoAssistant.prototype.getUserInfo = function() {
	//check if we have chached userinfo first
	//if(_globals.userCache[this.uid]!=undefined){
	//	this.getUserInfoSuccess(_globals.userCache[this.uid]);
	//}else{
	
		var url = 'http://api.foursquare.com/v1/user.json';
		auth=_globals.auth;
		var request = new Ajax.Request(url, {
	   		method: 'get',
	   		evalJSON: 'force',
	   		requestHeaders: {Authorization:auth}, //Not doing a search with auth due to malformed JSON results from it
	   		parameters: {uid:this.uid,badges: '1', mayor: '1'},
	   		onSuccess: this.getUserInfoSuccess.bind(this),
	   		onFailure: this.getUserInfoFailed.bind(this)
	 	});
	 //}
}

UserInfoAssistant.prototype.relativeTime = function(offset){
	// got this from: http://github.com/trek/thoughtbox/blob/master/js_relative_dates/src/relative_date.js
    var distanceInMinutes = (offset.abs() / 60000).round();
    if (distanceInMinutes == 0) { return 'less than a minute'; }
    else if ($R(0,1).include(distanceInMinutes)) { return 'about a minute'; }
    else if ($R(2,44).include(distanceInMinutes)) { return distanceInMinutes + ' minutes';}
    else if ($R(45,89).include(distanceInMinutes)) { return 'about 1 hour';}
    else if ($R(90,1439).include(distanceInMinutes)) { return 'about ' + (distanceInMinutes / 60).round() + ' hours'; }
    else if ($R(1440,2879).include(distanceInMinutes)) {return '1 day'; }
    else if ($R(2880,43199).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 1440).round() + ' days'; }
    else if ($R( 43200,86399).include(distanceInMinutes)) {return 'about a month' }
    else if ($R(86400,525599).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 43200).round() + ' months'; }
    else if ($R(525600,1051199).include(distanceInMinutes)) {return 'about a year';}
    else return 'over ' + (distanceInMinutes / 525600).round() + ' years';
  }


UserInfoAssistant.prototype.getUserInfoSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	var j=response.responseJSON;
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();

	
	//user info
	$("userPic").src=j.user.photo;
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	var tw=(j.user.twitter != undefined)? '<span class="linefix"><img src="images/bird.png" width="16" height="16" /> <a id="twitter_button" class="vtag" href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a></span><br/>': "";
	if(j.user.twitter == undefined){zBar.hideButton("twitter");}
	
	var fb=(j.user.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a id="facebook_button" class="vtag" href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a></span><br/>': "";
	if(j.user.facebook == undefined){zBar.hideButton("facebook");}


	var ph=(j.user.phone != undefined)? '<span class="linefix"><img src="images/phone.png" width="16" height="16" /> <a id="phone_button" class="vtag" href="tel://'+j.user.phone+'">'+j.user.phone+'</a></span><br/>': "";
	if(j.user.phone == undefined){zBar.hideButton("phone");}

	var em=(j.user.email != undefined)? '<span class="linefix"><img src="images/mail.png" width="16" height="16" /> <a id="email_button" class="vtag" href="mailto:'+j.user.email+'">Send E-mail</a></span><br/>': "";
	if(j.user.email == undefined){zBar.hideButton("email");}

	
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if(this.uid != "") { //only show friending options if it's not yourself
	var friendstatus=(j.user.friendstatus != undefined)? j.user.friendstatus: "";

	switch (friendstatus) {
		case "friend":
			var fs="You're friends!"
			break;
		case "pendingthem":
			var fs='<img src="images/pending.png" width="108" height="42" id="pendingfriend" alt="Pending" />';
			break;
		case "pendingyou":
			var fs='<img src="images/approve.png" width="108" height="42" id="approvefriend" alt="Approve" /> <img src="images/deny.png" width="108" height="42" id="denyfriend" alt="Deny" />';		
			break;
		default:
			var fs='<img src="images/addfriend.png" width="108" height="42" id="addfriend" alt="Add Friend" />';					
			break;
	}
	}else{
		var fs="";
	}	
	
	fs='<span id="friend_button">'+fs+'</span>';
	
	$("userName").innerHTML=j.user.firstname+" "+lname+"";
	//$("userCity").innerHTML=j.user.city.name+"<br class=\"breaker\"/>";
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		$("userCity").innerHTML = s + v;
	}
	
	$("userInfo").innerHTML+=em+ph+tw+fb+fs;
	if(j.user.checkin != undefined) {
		//$("userInfo").innerHTML+="<br/>"+j.user.checkin.display;
	}
	Mojo.Log.error("###set user info");
	//assign events to the new button(s)
	if(friendstatus=="pendingyou") {
		Mojo.Event.listen($("approvefriend"),Mojo.Event.tap,this.approveFriend.bind(this));
		Mojo.Event.listen($("denyfriend"),Mojo.Event.tap,this.denyFriend.bind(this));
	}
	if(friendstatus=="") {
		Mojo.Event.listen($("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}


	Mojo.Log.error("###handled friendship buttons");

	//user's mayorships
	if(j.user.mayor != null && j.user.mayor != undefined) {
		/*for(var m=0;m<j.user.mayor.length;m++) {
			$("mayor-box").innerHTML+='<div class="palm-row single"><div class="checkin-score truncating-text"><span>'+j.user.mayor[m].name+'</span></div></div>';
		}*/
		Mojo.Log.error("###got mayorships");
		$("mayor-title").innerHTML=j.user.mayor.length+" Mayorships";

		this.mayorshipModel.items=j.user.mayor;
		this.controller.modelChanged(this.mayorshipModel);
	}else{
		Mojo.Log.error("###no mayorships");

		$("mayorshipList").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' isn\'t the mayor of anything yet.</span></div></div>';
	}

	Mojo.Log.error("###finished mayorships");

	//user's badges
	if(j.user.badges != null) {
		var o='';
		o += '<table border=0 cellspacing=0 cellpadding=2 width="100%">';
		o += '<tr><td></td><td></td><td></td><td></td></tr>';
		var id=0
		for(var m=0;m<j.user.badges.length;m++) {
//			$("badges-box").innerHTML+='<div class="palm-row single"><div class="checkin-badge"><img src="'+j.user.badges[m].icon+'" width="48" height="48" style="float:left" /> <span>'+j.user.badges[m].name+'</span><br/><span class="palm-info-text" style="margin-left:0;padding-left:0">'+j.user.badges[m].description+'</span></div></div>';
			id++;
			
			if(id==1) {
				o += '<tr>';
			}
			o += '<td align="center" width="25%" class="medium-text"><img src="'+j.user.badges[m].icon+'" width="48" height="48"/><br/>'+j.user.badges[m].name+'</td>';
			if(id==4) {
				o += '</tr>';
				id=0;
			}
		}
		$("badges-box").innerHTML=o+"</table>";
	}else{
		$("badges-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' doesn\'t have any badges in '+credentials.city+' yet.</span></div></div>';
	}


	//if logged in user, show checkin history
	if(this.uid == "") {
		this.getHistory();
	}else{
		$("userScrim").hide();
		$("userSpinner").mojo.stop();
		$("userSpinner").hide();
	}

}

UserInfoAssistant.prototype.getUserInfoFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the user's info.", {source: 'notification'});

}

UserInfoAssistant.prototype.approveFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:this.uid},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		$("friend_button").innerHTML='You\'re Friends!';
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
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
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

UserInfoAssistant.prototype.listWasTapped = function(event) {
	
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item,_globals.username,_globals.password,_globals.uid,true);
}


UserInfoAssistant.prototype.historyListWasTapped = function(event) {
	
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},event.item.venue,_globals.username,_globals.password,_globals.uid,true);
}



UserInfoAssistant.prototype.addFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
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


UserInfoAssistant.prototype.getHistory = function(event) {
	Mojo.Log.error("##getting histroy...");
	var url = 'http://api.foursquare.com/v1/history.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {},
	   onSuccess: this.historySuccess.bind(this),
	   onFailure: this.historyFailed.bind(this)
	 });
}

UserInfoAssistant.prototype.historySuccess = function(response) {
Mojo.Log.error("##history:"+response.responseText);

	var j=response.responseJSON;
	
	if(j.checkins != null) {
	$("uhistory").show();
	Mojo.Log.error("##got history...");
		/*for(var c=0;c<j.checkins.length;c++) {
			var sh=(j.checkins[c].shout != undefined)? '<br/><span class="palm-info-text">'+j.checkins[c].shout+'</span>': "";
			$("history-box").innerHTML+='<div class="palm-row single"><div class="checkin-badge truncating-text"><span>'+j.checkins[c].venue.name+'</span>'+sh+'</div></div>';
		}*/
		//this.checkinlist=j.checkins;
		this.checkinlist=[];
		for(var c=0;c<j.checkins.length;c++){
			this.checkinlist.push(j.checkins[c]);
			if(j.checkins[c].venue != undefined) {
				this.checkinlist[c].checkin="@ " + j.checkins[c].venue.name;
				this.checkinlist[c].venue=j.checkins[c].venue;
			}
			this.checkinlist[c].shout=(j.checkins[c].shout != undefined)? j.checkins[c].shout: "";
			
			if(j.checkins[c].venue == undefined && j.checkins[c].shout != undefined && j.checkins[c].shout!="" && j.checkins[c].shout!=null) {
				this.checkinlist[c].icon="images/shout-icon.png";
			}else{
				this.checkinlist[c].icon="images/marker-icon.png";
			}
		//	
			//handle time
			var now = new Date;
			var later = new Date(j.checkins[c].created);
			var offset = later.getTime() - now.getTime();
			this.checkinlist[c].when=this.relativeTime(offset) + " ago";
			//Mojo.Log.error("ago="+this.checkinlist[this.checkinlist.length].when);
		
		//Mojo.Log.error("###in looop....");
		}
		Mojo.Log.error("checkin count="+this.checkinlist.length+", also="+j.checkins.length);
		
		this.historyModel.items=this.checkinlist;
		this.controller.modelChanged(this.historyModel);

	}else{
		$("history-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>No recent check-ins yet.</span></div></div>';
	}

		$("userScrim").hide();
		$("userSpinner").mojo.stop();
		$("userSpinner").hide();

}

UserInfoAssistant.prototype.historyFailed = function(response) {
	Mojo.Log.error("error getting history");
		$("userScrim").hide();
		$("userSpinner").mojo.stop();
		$("userSpinner").hide();

}

UserInfoAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,_globals.username,_globals.password,this.uid);
					//this.prevScene.cmmodel.items[0].toggleCmd="do-Nothing";
				    //this.prevScene.controller.modelChanged(this.prevScene.cmmodel);

					//this.controller.stageController.popScene("user-info");
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,_globals.username,_globals.password,this.uid);
					break;
                case "do-Badges":
                	//var thisauth=auth;
				//	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	var thisauth=this.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
					$("userInfo").innerHTML="";
					$("history-box").innerHTML="";
					$("badges-box").innerHTML="";
					$("mayor-box").innerHTML="";
					$("userScrim").show();
					$("userSpinner").mojo.start();
					$("userSpinner").show();
					this.getUserInfo();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
            }
            var scenes=this.controller.stageController.getScenes();
            //Mojo.Log.error("########this scene="+scenes[scenes.length-1].name+", below is "+scenes[scenes.length-2].name);
            //scenes[scenes.length-2].getSceneController().cmmodel.items[0].toggleCmd="do-Nothing";
            //scenes[scenes.length-2].getSceneController().modelChanged(scenes[scenes.length-2].getSceneController().cmmodel);
        }
    }


UserInfoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   //this.cmmodel.items[0].toggleCmd="do-Nothing";
	  // this.controller.modelChanged(this.cmmodel);
}

UserInfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

UserInfoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	 if(this.fromFriends){
	 	zBar.render("main","friends");
	 }
}
