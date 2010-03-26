function UserInfoAssistant(a,u,ps,ff) {
	   this.auth=_globals.auth;
	   this.uid=u;
	   this.prevScene=ps;
	   this.fromFriends=ff;
}

UserInfoAssistant.prototype.setup = function() {
	if(!this.fromFriends){
    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
	    _globals.cmmodel
	);
    
	}
	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	// Set up the attributes & model for the List widget:
	if(this.fromFriends){
		this.controller.setupWidget('friendsList', 
					      {itemTemplate:'listtemplates/friendItems-tap',dividerFunction: this.groupFriends,dividerTemplate: 'listtemplates/dividertemplate'},
					      this.resultsModel);
	}else{
		this.controller.setupWidget('friendsList', 
					      {itemTemplate:'listtemplates/friendItems-tap',addItemLabel:$L("Add Friend..."),dividerFunction: this.groupFriends,dividerTemplate: 'listtemplates/dividertemplate'},
					      this.resultsModel);
	}

	this.friendresultsModel = {items: [], listTitle: $L('Results')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('friendsResultsList', 
					      {itemTemplate:'listtemplates/friendItems-tap',dividerFunction: this.groupFriends,dividerTemplate: 'listtemplates/dividertemplate'},
					      this.friendresultsModel);


	this.infoModel = {items: [], listTitle: $L('Info')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('infoList', 
					      {itemTemplate:'listtemplates/infoItems'},
					      this.infoModel);


	this.getUserInfo();

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
         
         
 	if(this.fromFriends){
    this.controller.setupWidget("tabButtons",
        this.tabAttributes = {
            choices: [
                {label: "Info", value: 3},
                {label: "Friends", value: 2}
            ]
        },
        this.tabModel = {
            value: 3,
            disabled: false
        }
    );
    }else{
    this.controller.setupWidget("tabButtons",
        this.tabAttributes = {
            choices: [
                {label: "History", value: 1},
                {label: "Friends", value: 2}
            ]
        },
        this.tabModel = {
            value: 1,
            disabled: false
        }
    );    
    }
	

	this.mayorshipModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('mayorshipList', 
					      {itemTemplate:'listtemplates/venueItemsLimited'},
					      this.mayorshipModel);
	
	this.historyModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('checkinHistory', 
					      {itemTemplate:'listtemplates/venueItemsShout'},
					      this.historyModel);


	Mojo.Event.listen(this.controller.get('mayorshipList'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('checkinHistory'),Mojo.Event.listTap, this.historyListWasTapped.bind(this));

	Mojo.Event.listen(this.controller.get('user-mayorinfo'),Mojo.Event.tap, this.showMayorInfo.bind(this));
	Mojo.Event.listen(this.controller.get('user-badgeinfo'),Mojo.Event.tap, this.showBadgeInfo.bind(this));
	Mojo.Event.listen(this.controller.get("tabButtons"), Mojo.Event.propertyChange, this.handleTabs.bind(this));
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listTap, this.friendTapped.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('friendsResultsList'),Mojo.Event.listTap, this.friendTapped.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTapped.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listAdd, this.addFriends.bind(this));

	this.controller.get("uhistory").hide();
	if(this.fromFriends){
		this.controller.get("uinfo").show();
	}

	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);
}

var auth;
function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

UserInfoAssistant.prototype.getUserInfo = function() {
		var url = 'http://api.foursquare.com/v1/user.json';
		auth=_globals.auth;
		var request = new Ajax.Request(url, {
	   		method: 'get',
	   		evalJSON: 'force',
	   		requestHeaders: {Authorization:auth},
	   		parameters: {uid:this.uid,badges: '1', mayor: '1'},
	   		onSuccess: this.getUserInfoSuccess.bind(this),
	   		onFailure: this.getUserInfoFailed.bind(this)
	 	});
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
	var j=response.responseJSON;
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();

Mojo.Log.error("uid="+this.uid);
//Mojo.Log.error(response.responseText);

	this.info=[];
	//user info
	this.controller.get("userPic").src=j.user.photo;
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	this.firstname=j.user.firstname;
	var tw=(j.user.twitter != undefined)? '<span class="linefix"><img src="images/bird.png" width="16" height="16" /> <a id="twitter_button" class="vtag" href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a></span><br/>': "";
	if(j.user.twitter != undefined && this.fromFriends){//show twitter
		var itm={};
		itm.icon="images/twitter_32.png";
		itm.caption="Twitter ("+j.user.twitter+")";
		itm.action="url";
		itm.url='http://twitter.com/'+j.user.twitter;
		this.info.push(itm);
	}
		
	var fb=(j.user.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a id="facebook_button" class="vtag" href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a></span><br/>': "";
		Mojo.Log.error("facebook html stuff done");
	if(j.user.facebook != undefined && this.fromFriends){//show facebook
		var itm={};
		itm.icon="images/facebook_32.png";
		itm.caption="Facebook";
		itm.action="url";
		itm.url='http://touch.facebook.com/#/profile.php?id='+j.user.facebook;
		this.info.push(itm);
	}

	var ph=(j.user.phone != undefined)? '<span class="linefix"><img src="images/phone.png" width="16" height="16" /> <a id="phone_button" class="vtag" href="tel://'+j.user.phone+'">'+j.user.phone+'</a></span><br/>': "";
	if(j.user.phone != undefined && this.fromFriends){//show phone
		var itm={};
		itm.icon="images/call_32.png";
		itm.caption="Call";
		itm.action="url";
		itm.url='tel://'+j.user.phone;
		this.info.push(itm);

		var itm={};
		itm.icon="images/sms_32.png";
		itm.caption="Text Message";
		itm.action="url";
		itm.url='sms:'+j.user.phone;
		this.info.push(itm);
	}

	var em=(j.user.email != undefined)? '<span class="linefix"><img src="images/mail.png" width="16" height="16" /> <a id="email_button" class="vtag" href="mailto:'+j.user.email+'">Send E-mail</a></span><br/>': "";
	if(j.user.email != undefined){//show email
		var itm={};
		itm.icon="images/email_32.png";
		itm.caption="E-mail";
		itm.action="url";
		itm.url='mailto:'+j.user.email;
		this.info.push(itm);
	}

	
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if(this.uid != "") { //only show friending options if it's not yourself
	var friendstatus=(j.user.friendstatus != undefined)? j.user.friendstatus: "";
	
	Mojo.Log.error("fiend status grabbed");

	switch (friendstatus) {
		case "friend":
			//var fs="You're friends!"
			break;
		case "pendingthem":
			//var fs='<img src="images/pending.png" width="108" height="42" id="pendingfriend" alt="Pending" />';
			var itm={};
			itm.icon="images/pending_32.png";
			itm.caption="Friendship Pending";
			itm.action="";
			itm.url='';
			this.info.push(itm);
			break;
		case "pendingyou":
//			var fs='<img src="images/approve.png" width="108" height="42" id="approvefriend" alt="Approve" /> <img src="images/deny.png" width="108" height="42" id="denyfriend" alt="Deny" />';		
			var itm={};
			itm.icon="images/approve_32.png";
			itm.caption="Approve Friend Request";
			itm.action="approve";
			this.info.push(itm);
			this.approveIndex=this.info.length-1;
			
			var itm={};
			itm.icon="images/deny_32.png";
			itm.caption="Deny Friend Request";
			itm.action="deny";
			this.info.push(itm);
			this.denyIndex=this.info.length-1;

			break;
		default:
			//var fs='<img src="images/addfriend.png" width="108" height="42" id="addfriend" alt="Add Friend" />';					
			var itm={};
			itm.icon="images/addfriend_32.png";
			itm.caption="Add as a Friend";
			itm.action="addfriend";
			this.info.push(itm);
			this.addIndex=this.info.length-1;
			break;
	}
	}else{
		var fs="";
	}	
	
	Mojo.Log.error("handled f status");
	//fs='<span id="friend_button">'+fs+'</span>';
	if(j.user.settings!=undefined){
	this.getpings=j.user.settings.get_pings;
	if(this.getpings != undefined){
		if(this.getpings=="true"){
			var itm={};
			itm.icon="images/pings_on.png";
			itm.caption="Receiving Pings";
			itm.action="pings";
			//this.info.push(itm);
			this.pingIndex=this.info.length-1;
		}else{
			var itm={};
			itm.icon="images/pings_off.png";
			itm.caption="Not Receiving Pings";
			itm.action="pings";
			//this.info.push(itm);
			this.pingIndex=this.info.length-1;
		}
	}
	}

Mojo.Log.error("handled pings");


	this.infoModel.items=this.info;
	this.controller.modelChanged(this.infoModel);

	
	this.controller.get("userName").innerHTML=j.user.firstname+" "+lname+"";
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		var urlmatch=/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		s.match(urlmatch);
		var url=RegExp['$&'];
		s=s.replace(url,'<a href="'+url+'" class="headlink">'+url+'</a>');
		this.controller.get("userCity").innerHTML = s + v;
	}
	
		Mojo.Log.error("checkin info set");
		
	//this.controller.get("userInfo").innerHTML+=em+ph+tw+fb+fs;
	if(j.user.checkin != undefined) {
	}
	//assign events to the new button(s)
/*	if(friendstatus=="pendingyou") {
		Mojo.Event.listen(this.controller.get("approvefriend"),Mojo.Event.tap,this.approveFriend.bind(this));
		Mojo.Event.listen(this.controller.get("denyfriend"),Mojo.Event.tap,this.denyFriend.bind(this));
	}
	if(friendstatus=="") {
		Mojo.Event.listen(this.controller.get("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}


	Mojo.Log.error("###handled friendship buttons");*/

	//user's mayorships
	if(j.user.mayor != null && j.user.mayor != undefined) {
		//this.controller.get("mayor-title").innerHTML=j.user.mayor.length+" Mayorships";
		this.controller.get("mayorcount").innerHTML=j.user.mayor.length;

		this.mayorshipModel.items=j.user.mayor;
		this.controller.modelChanged(this.mayorshipModel);
	}else{
		this.controller.get("mayorshipList").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' isn\'t the mayor of anything yet.</span></div></div>';
	}


	//user's badges
	if(j.user.badges != null) {
		this.controller.get("badgecount").innerHTML=j.user.badges.length;
		var o='';
		o += '<table border=0 cellspacing=0 cellpadding=2 width="100%">';
		o += '<tr><td></td><td></td><td></td><td></td></tr>';
		var id=0
		for(var m=0;m<j.user.badges.length;m++) {
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
		this.controller.get("badges-box").innerHTML=o+"</table>";
	}else{
		this.controller.get("badges-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>'+j.user.firstname+' doesn\'t have any badges in '+credentials.city+' yet.</span></div></div>';
	}


	//if logged in user, show checkin history
	if(this.uid == "") {
		this.getHistory();
	}else{
		this.controller.get("userScrim").hide();
		this.controller.get("userSpinner").mojo.stop();
		this.controller.get("userSpinner").hide();
	}

}

UserInfoAssistant.prototype.getUserInfoFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the user's info.", {source: 'notification'});

}


UserInfoAssistant.prototype.showMayorInfo = function(event) {
	this.controller.get("uinfo").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	this.controller.get("mayorof").show();
	this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}
UserInfoAssistant.prototype.showBadgeInfo = function(event) {
	this.controller.get("uinfo").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").show();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}
UserInfoAssistant.prototype.handleTabs = function(event) {
	this.controller.get("uinfo").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	switch(this.tabModel.value){
		case 1: //history
			this.controller.get("uhistory").show();			
			break;
		case 2: //friends
			this.controller.get("ufriends").show();			
			this.showFriends();
			break;
		case 3: //info
			this.controller.get("uinfo").show();			
			break;
	}
}
UserInfoAssistant.prototype.groupFriends = function(data){
	return data.grouping;
}

UserInfoAssistant.prototype.showFriends = function(){
		this.controller.get("userSpinner").mojo.start();
		this.controller.get("userSpinner").show();

		var url = 'http://api.foursquare.com/v1/friends.json';
		auth = _globals.auth;
		var u=this.uid || _globals.uid;
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: auth}, 
		   parameters: {uid:u},
		   onSuccess: this.getFriendsSuccess.bind(this),
		   onFailure: this.getFriendsFailed.bind(this)
		 });
}
UserInfoAssistant.prototype.getFriendsSuccess = function(response) {
Mojo.Log.error(response.responseText);

	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.friendList = [];
		
		if(response.responseJSON.friends != undefined) {
			for(var f=0;f<response.responseJSON.friends.length;f++) {
				this.friendList.push(response.responseJSON.friends[f]);
				this.friendList[f].grouping="Friends";
			}
		}
		_globals.friendList=this.friendList;
		this.resultsModel.items =this.friendList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
	}
	
	//load pending friends
	if(!this.fromFriends){
		var url = 'http://api.foursquare.com/v1/friend/requests.json';
		auth = _globals.auth;
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: auth}, 
		   parameters: {},
		   onSuccess: this.requestFriendsSuccess.bind(this),
		   onFailure: this.getFriendsFailed.bind(this)
		 });
	}else{
		this.controller.get("userSpinner").hide();

	}
}


UserInfoAssistant.prototype.requestFriendsSuccess = function(response){
		if(response.responseJSON.requests != undefined && response.responseJSON.requests != null && response.responseJSON.requests.length>0) {
			for(var f=0;f<response.responseJSON.requests.length;f++) {
				this.friendList.push(response.responseJSON.requests[f]);
				this.friendList[this.friendList.length-1].grouping=" Pending Friend Requests";
			}
			this.controller.get("userSpinner").hide();
			this.resultsModel.items =this.friendList; //update list with basic user info
			this.controller.modelChanged(this.resultsModel);
			this.controller.get('resultListBox').style.display = 'block';
		}else{
			//this.controller.get("search-msg").innerHTML="No pending friend requests.";
			this.controller.get("userSpinner").hide();
			this.controller.get('resultListBox').style.display = 'none';
		}
//		this.controller.get("userSpinner").mojo.stop();

}

UserInfoAssistant.prototype.getFriendsFailed = function(response) {
Mojo.Log.error(response.responseText);
}

UserInfoAssistant.prototype.approveFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:this.uid},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='You\'re Friends!';
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
	   requestHeaders: {Authorization:_globals.auth},
	   parameters: {uid:this.uid},
	   onSuccess: this.denySuccess.bind(this),
	   onFailure: this.denyFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.denySuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request denied!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='<img src="images/addfriend.png" width="100" height="35" id="addfriend" alt="Add Friend" />';
		this.controller.get("infoList").noticeRemovedItems(this.denyIndex,1);
		this.controller.modelChanged(this.infoItems);
		//Mojo.Event.listen(this.controller.get("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
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

UserInfoAssistant.prototype.infoTapped = function(event) {
	switch(event.item.action){
		case "url":
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				 method: 'open',
				 parameters: {
					 target: event.item.url
				 }
			});
			break;
		case "addfriend":
			this.addFriend();
			break;
		case "approve":
			this.approveFriend();
			break;
		case "deny":
			this.denyFriend();
			break;
		case "pings":
			this.setPings();
			break;
	}
}
UserInfoAssistant.prototype.setPings = function(event) {
	if(this.getpings=="true"){
		this.getpings="false";
		var val="off";
	}else{
		this.getpings="true";
		var val="on";	
	}
	var params=this.uid+"="+val;

	
	var url = 'http://api.foursquare.com/v1/settings/setpings.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   postBody: params,
	   onSuccess: this.pingSuccess.bind(this),
	   onFailure: this.pingFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.pingSuccess = function(response) {
	if(response.responseJSON.settings != undefined) {
		Mojo.Controller.getAppController().showBanner("Saved ping settings!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
		if(this.getpings=="true"){
			this.infoModel.items[this.pingIndex].caption="Receiving Pings";
			this.infoModel.items[this.pingIndex].icon="images/ping_on.png";
			this.controller.modelChanged(this.infoModel);
		}else{
			this.infoModel.items[this.pingIndex].caption="Not Receiving Pings";
			this.infoModel.items[this.pingIndex].icon="images/ping_off.png";
			this.controller.modelChanged(this.infoModel);		
		}
	}else{
		Mojo.Controller.getAppController().showBanner("Error setting pings", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.pingFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error setting pings", {source: 'notification'});
}


UserInfoAssistant.prototype.addFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:this.uid},
	   onSuccess: this.addSuccess.bind(this),
	   onFailure: this.addFailed.bind(this)
	 });
}
UserInfoAssistant.prototype.addSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request sent!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
	}else{
		Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.addFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
}


UserInfoAssistant.prototype.getHistory = function(event) {
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

	var j=response.responseJSON;
	
	if(j.checkins != null) {
	this.controller.get("uhistory").show();
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
		
			//handle time
			var now = new Date;
			var later = new Date(j.checkins[c].created);
			var offset = later.getTime() - now.getTime();
			this.checkinlist[c].when=this.relativeTime(offset) + " ago";
		}
		
		this.historyModel.items=this.checkinlist;
		this.controller.modelChanged(this.historyModel);

	}else{
		this.controller.get("history-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>No recent check-ins yet.</span></div></div>';
	}

		this.controller.get("userScrim").hide();
		this.controller.get("userSpinner").mojo.stop();
		this.controller.get("userSpinner").hide();

}

UserInfoAssistant.prototype.historyFailed = function(response) {
		Mojo.Log.error("error getting history");
		this.controller.get("userScrim").hide();
		this.controller.get("userSpinner").mojo.stop();
		this.controller.get("userSpinner").hide();

}

UserInfoAssistant.prototype.friendTapped = function(event) {
	Mojo.Log.error("tapped!");
	this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,event.item.id,this,true);
}

UserInfoAssistant.prototype.searchFriends = function(how,query) {
	var what=(how=="twitter")? {}: {q: query};
	var url = 'http://api.foursquare.com/v1/findfriends/by'+how+'.json';
	this.query=query;
	this.how=how;
	auth = _globals.auth;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth}, 
	   parameters: what,
	   onSuccess: this.searchFriendsSuccess.bind(this),
	   onFailure: this.getFriendsFailed.bind(this)
	 });

	
}

UserInfoAssistant.prototype.searchFriendsSuccess = function(response) {
	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.searchList = [];
		this.looping=false;
		
		if(response.responseJSON.users != undefined) {
			for(var f=0;f<response.responseJSON.users.length;f++) {
				this.searchList.push(response.responseJSON.users[f]);
				if(this.how=="name" || this.how=="phone"){
					this.searchList[f].grouping="Search Results for '"+this.query+"'";
				}else{
					this.searchList[f].grouping="Twitter Friends on Foursquare";				
				}
			}
		}
		this.friendresultsModel.items =this.searchList; //update list with basic user info
		this.controller.modelChanged(this.friendresultsModel);
		this.controller.get("ufriendsresults").show();
	}
}


UserInfoAssistant.prototype.addFriends = function(event) {
     this.controller.showDialog({
           template: 'listtemplates/friendsearch',
           assistant: new FriendSearchDialogAssistant(this),
           preventCancel:false
     });
}



UserInfoAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);
					break;
                case "do-Badges":
                	break;
                case "do-Shout":
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
					this.controller.get("userInfo").innerHTML="";
					this.controller.get("history-box").innerHTML="";
					this.controller.get("badges-box").innerHTML="";
					this.controller.get("mayor-box").innerHTML="";
					//this.controller.get("userScrim").show();
					this.controller.get("userSpinner").mojo.start();
					this.controller.get("userSpinner").show();
					this.getUserInfo();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
            }
            var scenes=this.controller.stageController.getScenes();
        }
    }


UserInfoAssistant.prototype.activate = function(event) {
}

UserInfoAssistant.prototype.deactivate = function(event) {
}

UserInfoAssistant.prototype.cleanup = function(event) {
	 if(this.fromFriends){
	// 	zBar.render("main","friends");
	 }
}
