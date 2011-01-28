function UserInfoAssistant(a,u,ps,ff) {
	   this.auth=_globals.auth;
	   this.uid=u;
	 	if(this.uid==_globals.uid){
	 		//this.uid='';
	 	}
	   this.prevScene=ps;
	   this.fromFriends=ff;

		if(this.uid=="" || this.uid==undefined || this.uid==_globals.uid){
			this.isself=true;
			this.uid=_globals.uid;
		}else{
			this.isself=false;
		}
		
		this.inOverview=true;


		this.userDone=false;
		this.friendsDone=false;
		this.tipsDone=false;
		this.metatap=false;
}

UserInfoAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

UserInfoAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});


	if(!this.fromFriends){
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
         
         
    this.controller.setupWidget("friendToggle",
        this.tabAttributes = {

        },
        this.tabModel = {
            value: 1,
            disabled: false,
            choices: [
                {label: "Friends", value: 1}
            ]        }
    );
    
    if(this.fromFriends){
    	var cm_items=[
           	{},
	         { label: "Info", command: "show-Info"},
	         { label: "Friends", command: "show-Friends"},
		    {}

    	];
    	var tog="show-Info";
    }else{
    	var cm_items=[
           	{},
	         { label: "History", command: "show-History"},
	         { label: "Friends", command: "show-Friends"},
		    {}

    	];
    	var tog="show-History";
    }
    
    
	this.mayorshipModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('mayorshipList', 
					      {itemTemplate:'listtemplates/venueItemsLimited', formatter:{primarycategory:this.fixIcon.bind(this)}},
					      this.mayorshipModel);
	
	this.historyModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('checkinHistory', 
					      {itemTemplate:'listtemplates/venueItemsShout'},
					      this.historyModel);
	this.tipsModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('user-tips', 
					      {itemTemplate:'listtemplates/userTips'},
					      this.tipsModel);


	this.listWasTappedBound=this.listWasTapped.bind(this);
	this.historyListWasTappedBound=this.historyListWasTapped.bind(this);
	this.showMayorInfoBound=this.showMayorInfo.bind(this);
	this.showBadgeInfoBound=this.showBadgeInfo.bind(this);
	this.showTipInfoBound=this.showTipInfo.bind(this);
	this.friendTappedBound=this.friendTapped.bindAsEventListener(this);
	this.infoTappedBound=this.infoTapped.bindAsEventListener(this);
	this.tipTappedBound=this.tipTapped.bindAsEventListener(this);
	this.addFriendsBound=this.addFriends.bind(this);
	this.enlargeAvatarBound=this.enlargeAvatar.bind(this);
	this.toggleFriendsBound=this.toggleFriends.bind(this);
	this.showHistoryBound=this.showHistory.bind(this);
	this.showFriendsBound=this.showFriends.bind(this);
	this.showInfoBound=this.showInfo.bind(this);
	this.showLeaderboardBound=this.showLeaderboard.bind(this);
	this.showBadgeTipBound=this.showBadgeTip.bind(this);
	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.get('mayorshipList'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.listen(this.controller.get('checkinHistory'),Mojo.Event.listTap, this.historyListWasTappedBound);
	Mojo.Event.listen(this.controller.get('user-mayorinfo'),Mojo.Event.tap, this.showMayorInfoBound);
	Mojo.Event.listen(this.controller.get('user-badgeinfo'),Mojo.Event.tap, this.showBadgeInfoBound);
	Mojo.Event.listen(this.controller.get('user-tipinfo'),Mojo.Event.tap, this.showTipInfoBound);
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.listen(this.controller.get('friendsResultsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.listen(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTappedBound);
	Mojo.Event.listen(this.controller.get('user-tips'),Mojo.Event.listTap, this.tipTappedBound);
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listAdd, this.addFriendsBound);
	Mojo.Event.listen(this.controller.get("userPic"),Mojo.Event.tap, this.enlargeAvatarBound);
	Mojo.Event.listen(this.controller.get("friendToggle"), Mojo.Event.propertyChange, this.toggleFriendsBound);
	Mojo.Event.listen(this.controller.get("checkins-row"),Mojo.Event.tap, this.showHistoryBound);
	Mojo.Event.listen(this.controller.get("friends-row"),Mojo.Event.tap, this.showFriendsBound);
	Mojo.Event.listen(this.controller.get("more-row"),Mojo.Event.tap, this.showInfoBound);
	Mojo.Event.listen(this.controller.get("leaderboard-row"),Mojo.Event.tap, this.showLeaderboardBound);
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);


	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	this.keyUpHandlerBound=this.keyUpHandler.bind(this);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
	this.doc=this.controller.document;
    this.doc.addEventListener("keyup", this.keyUpHandlerBound, true);

	this.controller.get("uhistory").hide();
	if(this.fromFriends){
		//this.controller.get("uinfo").show();
	}

	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);
	
	if (this.fromFriends){
		//this.controller.get("tooltip").style.bottom="10px";
	}
	
	
	if(this.isself){
		this.controller.get("more-row").hide();
		this.controller.get("leaderboard-row").show();
	}else{
		if(this.uid!=_globals.uid){
			
			this.controller.get("checkins-row").hide();
		}
	}
	
	//this.controller.document.querySelector(".navbar-menu").addClassName("trans");
	
	logthis("friends="+Object.toJSON(_globals.friendList));
}

var auth;
function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}
UserInfoAssistant.prototype.keyDownHandler = function(event) {
		var key=event.originalEvent.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = true;
		}
}

UserInfoAssistant.prototype.keyUpHandler = function(event) {
		var key=event.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = false;
		}
}
UserInfoAssistant.prototype.stageActivate = function(event) {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});
	if(_globals.showShout){
    	var thisauth="";
		this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this,_globals.jtShout);
	}


};

UserInfoAssistant.prototype.showLeaderboard = function(event) {
	this.controller.stageController.pushScene({name: "leaderboard", transition: Mojo.Transition.crossFade},_globals.auth,"",this);

};

UserInfoAssistant.prototype.enlargeAvatar = function(event) {
	this.controller.get("userPic").toggleClassName("bigavatar");
	logthis("has="+this.controller.get("userPic").hasClassName("bigavatar"));
};

UserInfoAssistant.prototype.fixIcon = function(value,model) {
	if(value==undefined){
		return {iconurl:"images/no-cat.png"};
	}else{
		return value;
	}
}
UserInfoAssistant.prototype.getUserInfo = function() {
	 	
	 	foursquareGet(this,{
	 		endpoint: 'user.json',
	 		requiresAuth: true,
	 		parameters: {uid:this.uid,badges: '1', mayor: '1',stats: '1'},
	   		onSuccess: this.getUserInfoSuccess.bind(this),
	   		onFailure: this.getUserInfoFailed.bind(this)
	 	});
	 	
	/* 	var uid=this.uid;
	 	if(this.uid=='' || this.uid==undefined){
	 		uid=_globals.uid;
	 	}

	 	foursquareGet(this,{
	 		endpoint: 'tips.json?uid='+uid+'&sort=recent',
	 		requiresAuth: true,
	 		debug:true,
	 		parameters: {},
	   		onSuccess: this.getTipsSuccess.bind(this),
	   		onFailure: this.getTipsFailed.bind(this)
	 	});

		 foursquareGet(this,{
		 	endpoint: 'friends.json',
		 	requiresAuth: true,
		 	parameters: {uid:uid},
			onSuccess: this.getFriendsSuccess.bind(this),
		    onFailure: this.getFriendsFailed.bind(this)		 	
		 });*/

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
};

UserInfoAssistant.prototype.getTipsSuccess = function(r){
	this.tipsResponse=r;
	var j=r.responseJSON;
	var tarray=j.tips;
	
	this.controller.get("tipcount").update(tarray.length);

	this.tipsList=[];
	this.tipsItems=[];
	
	for(var t=0;t<tarray.length;t++){
		logthis("in array");
		this.tipsList.push(tarray[t]);
		var dist=this.tipsList[this.tipsList.length-1].distance;
		logthis("got distance");
		if(_globals.units=="si") {					
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
		}else if(_globals.units=="metric"){
			dist=roundNumber(dist/1000,1);
			var unit="";
			if(dist==1){unit="KM";}else{unit="KM";}						
		}else{
			if(dist==1){unit="m";}else{unit="m";}						
		}
		logthis("converted distance");
		this.tipsList[this.tipsList.length-1].distance=dist;
		this.tipsList[this.tipsList.length-1].unit=unit;
		
		var created=this.tipsList[this.tipsList.length-1].created;
		if(this.tipsList[this.tipsList.length-1].created != undefined) {
			var now = new Date;
			var later = new Date(this.tipsList[this.tipsList.length-1].created);
			var offset = later.getTime() - now.getTime();
			var when=this.relativeTime(offset) + " ago";
		}else{
		   	var when="";
		}
		this.tipsList[this.tipsList.length-1].when=when;
		
		logthis("handled time");
		
		this.tipsList[this.tipsList.length-1].user=this.user;
		
		
		if(this.tipsList[this.tipsList.length-1].status){
			if(this.tipsList[this.tipsList.length-1].status=="todo"){
				this.tipsList[this.tipsList.length-1].dogear="block";
			}else{
				this.tipsList[this.tipsList.length-1].dogear="none";
			}
		}else{
			this.tipsList[this.tipsList.length-1].dogear="none";
		}
		logthis("handled status");

		
			this.tipsList[this.tipsList.length-1].candelete=false;	
			this.tipsItems.push(this.tipsList[this.tipsList.length-1]);
	}
	
	this.tipsModel.items=this.tipsItems;
	this.controller.modelChanged(this.tipsModel);
	this.tipsDone=true;
	this.checkDone();
};

UserInfoAssistant.prototype.tipTapped = function(event){
	event.item.user=this.user;
	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item}],undefined,true);
};

UserInfoAssistant.prototype.getTipsFailed = function(r){
	this.tipsDone=true;
	this.checkDone();

};

UserInfoAssistant.prototype.getUserInfoSuccess = function(response) {
	var j=response.responseJSON;
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();

logthis("uid="+this.uid);
//logthis(response.responseText);

	this.user=j.user;
	this.info=[];
	//user info
	this.controller.get("userPic").src=j.user.photo;
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	this.firstname=j.user.firstname;
	var tw=(j.user.twitter != undefined)? '<span class="linefix"><img src="images/bird.png" width="16" height="16" /> <a id="twitter_button" class="vtag" href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a></span><br/>': "";
	if(j.user.twitter != undefined && !this.isself){//show twitter
		var itm={};
		itm.icon="images/twitter_32.png";
		itm.caption="Twitter ("+j.user.twitter+")";
		itm.action="twitter";
		itm.url='http://mobile.twitter.com/'+j.user.twitter;
		itm.username=j.user.twitter;
		this.info.push(itm);
	}
		
	var fb=(j.user.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a id="facebook_button" class="vtag" href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a></span><br/>': "";
		logthis("facebook html stuff done");
	if(j.user.facebook != undefined && !this.isself){//show facebook
		var itm={};
		itm.icon="images/facebook_32.png";
		itm.caption="Facebook";
		itm.action="url";
		itm.url='http://touch.facebook.com/#/profile.php?id='+j.user.facebook;
		this.info.push(itm);
	}

	var ph=(j.user.phone != undefined)? '<span class="linefix"><img src="images/phone.png" width="16" height="16" /> <a id="phone_button" class="vtag" href="tel://'+j.user.phone+'">'+j.user.phone+'</a></span><br/>': "";
	if(j.user.phone != undefined && !this.isself){//show phone
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
	
	logthis("fiend status grabbed");

	switch (friendstatus) {
		case "friend":
			//var fs="You're friends!"
			this.controller.get("checkins-row").hide();
			break;
		case "pendingthem":
			//var fs='<img src="images/pending.png" width="108" height="42" id="pendingfriend" alt="Pending" />';
			var itm={};
			itm.icon="images/pending_32.png";
			itm.caption="Friendship Pending";
			itm.action="";
			itm.url='';
			this.info.push(itm);
			this.controller.get("checkins-row").hide();
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
			this.controller.get("checkins-row").hide();
			this.controller.get("friendshipinfo").innerHTML="Approve/Deny Friendship, ";
			this.controller.get("friendshipinfo").show();
			break;
		case "self":
			this.controller.get("checkins-row").show();
			break;
		default:
			//var fs='<img src="images/addfriend.png" width="108" height="42" id="addfriend" alt="Add Friend" />';					
			var itm={};
			itm.icon="images/addfriend_32.png";
			itm.caption="Add as a Friend";
			itm.action="addfriend";
			this.info.push(itm);
			this.addIndex=this.info.length-1;
			this.controller.get("checkins-row").hide();
			this.controller.get("friendshipinfo").innerHTML="Add as Friend, ";
			this.controller.get("friendshipinfo").show();
			break;
	}
	}else{
		var fs="";
	}	
	
	logthis("handled f status");
	//fs='<span id="friend_button">'+fs+'</span>';
	if(j.user.settings!=undefined){
	this.getpings=j.user.settings.get_pings;
	if(this.getpings != undefined){
		if(this.getpings=="true"){
			var itm={};
			itm.icon="images/pings_32.png";
			itm.caption="Receiving Pings";
			itm.action="pings";
			this.info.push(itm);
			this.pingIndex=this.info.length-1;
		}else{
			var itm={};
			itm.icon="images/pings_32.png";
			itm.caption="Not Receiving Pings";
			itm.action="pings";
			this.info.push(itm);
			this.pingIndex=this.info.length-1;
		}
	}
	}

logthis("handled pings");


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
	
		logthis("checkin info set");
		
	if(j.user.checkin != undefined) {
	}

	//user's mayorships
	if(j.user.mayor != null && j.user.mayor != undefined && j.user.mayor.length>0) {
		//this.controller.get("mayor-title").innerHTML=j.user.mayor.length+" Mayorships";
		logthis("mayor="+Object.toJSON(j.user.mayor));
		this.controller.get("mayorcount").innerHTML=j.user.mayor.length;

		this.mayorshipModel.items=j.user.mayor;
		this.controller.modelChanged(this.mayorshipModel);
	}else{
		this.controller.get("mayor-notice").innerHTML=j.user.firstname+' isn\'t the mayor of anything yet.';
		this.controller.get("mayor-notice").show();
		this.controller.get("mayorshipList").hide();
		this.controller.get("mayorcount").innerHTML="0";	
	}


	//user's badges
	if(j.user.badges != null && j.user.badges != undefined && j.user.badges.length>0) {
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
			
			//pick a random class for the badge
			var classes=['paperclip','tape','sticker'];
			var rn=Math.floor(Math.random()*3);
			var bclass=classes[rn];
			
			var imgclasses=['slight-left','left','slight-right','right'];
			var rn=Math.floor(Math.random()*4);
			var iclass=imgclasses[rn];

			var peelclasses=['slight-left','left','slight-right','right'];
			var rn=Math.floor(Math.random()*4);
			var pclass=peelclasses[rn];
			
			
			o+='<div class="badge sticker"><div class="badgeoverlay '+pclass+'"></div><div class="badgecontent"><img data="'+j.user.badges[m].description+'" id="badge-'+m+'" src="'+j.user.badges[m].icon+'" width="48" height="48" class="'+iclass+'"/><br/>'+j.user.badges[m].name+'</div></div>';
			if(id==4) {
				o += '<br class="breaker-small">';
				id=0;
			}
		}
		this.controller.get("badges-box").innerHTML=o+"</table>";
		
		//hook tooltip event to each badge
		this.badges_len=j.user.badges.length;
		for(var b=0;b<j.user.badges.length;b++){
			Mojo.Event.listen(this.controller.get('badge-'+b),Mojo.Event.tap, this.showBadgeTipBound);
		}
	}else{
		this.controller.get("badges-notice").innerHTML=j.user.firstname+' doesn\'t have any badges yet.';
		this.controller.get("badges-notice").show();
		this.controller.get("badgecount").innerHTML="0";	
	}




	//handle extra stats
	this.controller.get("checkin-count").update(j.user.checkincount+" check-ins");
	var friendcount=j.user.friendcount;
	var ficcount=0;
	var avatars='';
	if(j.user.friendsincommon){
		ficcount=j.user.friendsincommon.length;
		for(var f=0;f<ficcount;f++){
			avatars+='<img width="32" height="32" src="'+j.user.friendsincommon[f].photo+'" class="friend-avatar">';
		}
	}
	var	friendtext=friendcount+" friends";
	if(ficcount>0){
		friendtext+=" ("+ficcount+" in common)";
	}
	this.controller.get("friends-count").update(friendtext);
	this.controller.get("friends-avatars").update(avatars);
	this.controller.get("tipcount").update(j.user.tipcount);

	//if logged in user, show checkin history
	if(this.uid == "") {
		this.getHistory();
	}else{
		this.userDone=true;
		this.checkDone();

	}

}

UserInfoAssistant.prototype.getUserInfoFailed = function(response) {
	logthis(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the user's info.", {source: 'notification'});

	this.userDone=true;
	this.checkDone();

}


UserInfoAssistant.prototype.showMayorInfo = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	this.controller.get("mayorof").show();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}

UserInfoAssistant.prototype.showBadgeInfo = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").show();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}

UserInfoAssistant.prototype.showTipInfo = function(event) {
	this.startLoader();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").show();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	
	if(!this.tipsList){
	 	foursquareGet(this,{
	 		endpoint: 'tips.json?uid='+this.uid+'&sort=recent',
	 		requiresAuth: true,
	 		debug:true,
	 		parameters: {},
	   		onSuccess: this.getTipsSuccess.bind(this),
	   		onFailure: this.getTipsFailed.bind(this)
	 	});
	}else{
		this.getTipsSuccess(this.tipsResponse);
	}
}

UserInfoAssistant.prototype.showOverview = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=true;
	this.controller.get("overview").show();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}

UserInfoAssistant.prototype.showHistory = function(event) {
	this.startLoader();
	this.getHistory();

	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").show();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}
UserInfoAssistant.prototype.showFriends = function(event) {
	this.startLoader();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").show();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	if(!this.friendList){
		 foursquareGet(this,{
		 	endpoint: 'friends.json',
		 	requiresAuth: true,
		 	parameters: {uid:this.uid},
			onSuccess: this.getFriendsSuccess.bind(this),
		    onFailure: this.getFriendsFailed.bind(this)		 	
		 });
	}else{
		this.getFriendsSuccess(this.friendsResponse);
	}
}
UserInfoAssistant.prototype.showInfo = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").show();
	this.controller.get("utips").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}



UserInfoAssistant.prototype.handleTabs = function(what) {
	this.controller.get("uinfo").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();
	switch(what){
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

UserInfoAssistant.prototype.toggleFriends = function(event){
	switch(event.value){
		case 1: //friends
			this.resultsModel.items=this.friendList;
			this.controller.modelChanged(this.resultsModel);
			break;
		case 2: //mutual
			this.resultsModel.items=this.isfriends;
			this.controller.modelChanged(this.resultsModel);
			break;
		case 3: //requests
			this.resultsModel.items=this.requestList;
			this.controller.modelChanged(this.resultsModel);
			break;
	}
};

UserInfoAssistant.prototype.groupFriends = function(data){
	return data.grouping;
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		curwidth = obj.offsetWidth;
		curheight = obj.offsetHeight;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	return {'left': curleft,'top':curtop,'width':curwidth,'height':curheight};
}


UserInfoAssistant.prototype.showBadgeTip = function(event){
	if(this.tipto){
		clearTimeout(this.tipto);
	}
	var descr=event.target.readAttribute("data");
	var tip=this.controller.get("tooltip");
	tip.update(descr);	
	
	tip.show();
	this.tipto=setTimeout(function(){tip.hide();},3000);
}

UserInfoAssistant.prototype.getFriendsSuccess = function(response) {
logthis(response.responseText);
logthis("friends success");

	this.friendsResponse=response;
	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
		logthis("no json");
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.friendList = [];
		
		if(response.responseJSON.friends != undefined) {
			logthis("got friends array");
			var fc=response.responseJSON.friends.length;
			var f=" friends";
			if(fc==1){f=" friend";}
			this.controller.get("friends-count").update(fc+f);
			
			this.isfriends=[];
		
			var isself=false;
			if(this.uid!="" && this.uid!=undefined){ //uid has been passed, so from friends list or elsewhere
				if(this.uid==_globals.uid){ //uid passed is not auth'd user, so we load mutual friends
					isself=true;
				}
			}else{
				isself=true;
			}
			logthis("found isself");
			for(var f=0;f<response.responseJSON.friends.length;f++) {
				if(response.responseJSON.friends[f].friendstatus=="friend" && !isself){
					this.isfriends.push(response.responseJSON.friends[f]);
					this.isfriends[this.isfriends.length-1].grouping="Mutual Friends";
				}
				this.friendList.push(response.responseJSON.friends[f]);
				//logthis(Object.toJSON(response.responseJSON.friends[f]));
				this.friendList[f].grouping="Friends";
			}
			logthis("looped throughf riends");
		}
		_globals.friendList=this.friendList;
		_globals.friendList2=this.friendList;
		this.resultsModel.items =this.friendList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		logthis("updated friends list model");

		var avatars='';
		var max=(this.isfriends.length>=6)? 6: this.isfriends.length;
		
		if(this.isfriends.length>0){ //we have mutual friends
			logthis("has mutual");
			var mutualthere=false;
			for(var t=0;t<this.tabModel.choices.length;t++){
				if(this.tabModel.choices[t].label=="Mutual"){
					mutualthere=true;
				}
			}
			if(!mutualthere){this.tabModel.choices.push({label:"Mutual",value:2});}
			logthis("added to model");
			this.controller.modelChanged(this.tabModel);
			logthis("modelchanged");

			for(var f=0;f<max;f++){
			logthis("in mutual loop");
				avatars+='<img width="32" height="32" src="'+this.isfriends[f].photo+'" class="friend-avatar">';
			}
			logthis("out of mutual loop");
			this.controller.get("friends-count").innerHTML+=' ('+this.isfriends.length+' in common)';
		}
		
		if(max<6){
			logthis("in max if");
			var fmax=6-max;
			if(fmax>this.friendList.length){fmax=this.friendList.length;}
			logthis("set max");
			for(var f=0;f<fmax;f++){
				logthis("in other loop");
				if(this.friendList[f].friendstatus!="friend" && this.friendList[f].friendstatus!="self"){
					avatars+='<img width="32" height="32" src="'+this.friendList[f].photo+'" class="friend-avatar">';
				}
			}
			logthis("out of other loop");
		}
		logthis("going to update div");
				
		this.controller.get("friends-avatars").update(avatars);
	}
	
	//load pending friends
	var getpending=false;
	logthis("set getpending");
	if(this.user){
		logthis("user exists");
		if(this.user.status!=undefined){
			if(this.user.status.friendrequests!=undefined && this.user.status.friendrequests>0){
			logthis("set pending true");
				getpending=true;
			}
		}else{
			getpending=false;
		}
	}else{
		logthis("no user, setting true");
		getpending=true; //get pending even if user info isnt downloaded as a safety
	}
	logthis("fgured out pending");
	
	this.tabModel.value=1;
	this.controller.modelChanged(this.tabModel);
	
	if(getpending && !this.requestList){
		this.requestList=[];
		 logthis("getting pending");
		this.tabModel.choices.push({label:"Requests",value:3});
		this.controller.modelChanged(this.tabModel);
		 foursquareGet(this,{
		 	endpoint: 'friend/requests.json',
		 	requiresAuth: true,
		 	debug: true,
			onSuccess: this.requestFriendsSuccess.bind(this),
		    onFailure: this.getFriendsFailed.bind(this)
		 });
	}else if(getpending && this.requestList){
		this.requestList=[];
		this.requestFriendsSuccess(this.requestsResponse);
	}else{
		//this.controller.get("userSpinner").hide();
		logthis("not getting pending; done friends");
		this.friendsDone=true;
		this.checkDone();


	}
}


UserInfoAssistant.prototype.requestFriendsSuccess = function(response){
logthis("got requests");
	this.requestsResponse=response;
		if(response.responseJSON.requests != undefined && response.responseJSON.requests != null && response.responseJSON.requests.length>0) {
			logthis("in request if");
			for(var f=0;f<response.responseJSON.requests.length;f++) {
				logthis("request loop");
				this.requestList.push(response.responseJSON.requests[f]);
				this.requestList[this.requestList.length-1].grouping=" Pending Friend Requests";
			}
			logthis("out of loop");
			//this.controller.get('resultListBox').style.display = 'block';
			logthis("unhid box");
		}else{
		}

	this.friendsDone=true;
	this.checkDone();


}

UserInfoAssistant.prototype.getFriendsFailed = function(response) {
logthis(response.responseText);
logthis("friends failed");
	this.friendsDone=true;
	this.checkDone();

}

UserInfoAssistant.prototype.approveFriend = function(event) {
	foursquarePost(this,{
		endpoint: 'friend/approve.json',
		parameters: {uid:this.uid},
		requiresAuth: true,
		debug: false,
		onSuccess: this.approveSuccess.bind(this),
		onFailure: this.approveFailed.bind(this)
	});

/*
	var url = 'https://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:this.uid},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });*/
}


UserInfoAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='You\'re Friends!';
		this.controller.stageController.swapScene("user-info",this.auth,this.uid,this.prevScene,this.fromFriends);
	}else{
		Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.approveFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
}

UserInfoAssistant.prototype.denyFriend = function(event) {
	foursquarePost(this, {
		endpoint: 'friend/deny.json',
		requiresAuth: true,
		parameters: {uid: this.uid},
		debug: false,
		onSuccess: this.denySuccess.bind(this),
		onFailure: this.denyFailed.bind(this)
	});

/*
	var url = 'https://api.foursquare.com/v1/friend/deny.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth},
	   parameters: {uid:this.uid},
	   onSuccess: this.denySuccess.bind(this),
	   onFailure: this.denyFailed.bind(this)
	 });*/
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
	if(!this.metatap){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: false},event.item,_globals.username,_globals.password,_globals.uid,true);
	}else{
         var stageArguments = {name: "mainStage"+event.item.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene(false,event.item,_globals.username,_globals.password,_globals.uid,true);         
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");		
	}
}


UserInfoAssistant.prototype.historyListWasTapped = function(event) {
	if(!this.metatap){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: false},event.item.venue,_globals.username,_globals.password,_globals.uid,true);
	}else{
         var stageArguments = {name: "mainStage"+event.item.venue.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: false},event.item.venue,_globals.username,_globals.password,_globals.uid,true);   
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");				
	}
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
		case "twitter":
			switch(_globals.twitter){
				case "web":
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						 method: 'open',
						 parameters: {
							 target: event.item.url
						 }
					});
					break;				
				case "badkitty":
				   try{
				      this.controller.serviceRequest("palm://com.palm.applicationManager", {
				         method: 'launch',
				         parameters: {
				            id: 'com.superinhuman.badkitty',
				            params: {action: 'user', name: event.item.username}
				         },
				         onSuccess:function(){
				            /*
				              INSERT ANY CODE YOU WANT EXECUTED UPON SUCCESS OF LAUNCHING BADKITTY
				            */
				         }.bind(this),
				         onFailure:function(){
				            this.controller.serviceRequest('palm://com.palm.applicationManager', {
				                method:'open',
				                   parameters:{
				                   target: event.item.url
				                        }
				             });
				         }.bind(this)
				      })
				   }catch(e){
				      /*
				       INSERT ANY ERROR HANDLING CODE HERE
				     */
				   }
				
					break;
				case "tweetme":
				   try{
				      this.controller.serviceRequest("palm://com.palm.applicationManager", {
				         method: 'launch',
				         parameters: {
				            id: 'com.catalystmediastudios.tweetme',
				            params: {action: 'user', name: event.item.username}
				         },
				         onSuccess:function(){
				            /*
				              INSERT ANY CODE YOU WANT EXECUTED UPON SUCCESS OF LAUNCHING TWEETME
				            */
				         }.bind(this),
				         onFailure:function(){
				            this.controller.serviceRequest('palm://com.palm.applicationManager', {
				                method:'open',
				                   parameters:{
				                   target: event.item.url
				                        }
				             });
				         }.bind(this)
				      })
				   }catch(e){
				      /*
				       INSERT ANY ERROR HANDLING CODE HERE
				     */
				   }
				
					break;
			}
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

	
	var url = 'https://api.foursquare.com/v1/settings/setpings.json';
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
			this.infoModel.items[this.pingIndex].icon="images/pings_32.png";
			this.controller.modelChanged(this.infoModel);
		}else{
			this.infoModel.items[this.pingIndex].caption="Not Receiving Pings";
			this.infoModel.items[this.pingIndex].icon="images/pings_32.png";
			this.controller.modelChanged(this.infoModel);		
		}
	}else{
		Mojo.Controller.getAppController().showBanner("Error setting pings", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.pingFailed = function(response) {
	logthis(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error setting pings", {source: 'notification'});
}


UserInfoAssistant.prototype.addFriend = function(event) {
	foursquarePost(this, {
		endpoint: 'friend/sendrequest.json',
		parameters: {uid: this.uid},
		requiresAuth: true,
		debug: false,
		onSuccess: this.addSuccess.bind(this),
		onFailure: this.addFailed.bind(this)
	});

/*
	var url = 'https://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:this.uid},
	   onSuccess: this.addSuccess.bind(this),
	   onFailure: this.addFailed.bind(this)
	 });*/
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
	if(!this.checkinlist){
	 foursquareGet(this, {
	 	endpoint: 'history.json',
	 	parameters: {l:'250'},
	 	requiresAuth: true,
	    onSuccess: this.historySuccess.bind(this),
	    onFailure: this.historyFailed.bind(this)
	 });
	}else{
		 	this.historySuccess(this.historyResponse);
	}
}

UserInfoAssistant.prototype.historySuccess = function(response) {

	this.historyResponse=response;
	var j=response.responseJSON;
	
	if(j.checkins != null) {
	//this.controller.get("uhistory").show();
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

		this.userDone=true;
		this.checkDone();


}

UserInfoAssistant.prototype.historyFailed = function(response) {
		logthis("error getting history");
		
	this.userDone=true;
	this.checkDone();

}

UserInfoAssistant.prototype.checkDone = function(){
	logthis("ud="+this.userDone);
	logthis("td="+this.tipsDone);
	logthis("fd="+this.friendsDone);
//	if(this.userDone && this.tipsDone && this.friendsDone){
		this.controller.get("userScrim").hide();
		this.controller.get("userSpinner").mojo.stop();
		this.controller.get("userSpinner").hide();
		
		if(this.tabModel.choices.length==1){
			this.controller.get("friendToggle").hide();
		}else{
			this.controller.get("friendToggle").show();
		}
//	}
};

UserInfoAssistant.prototype.startLoader = function(){
		//this.controller.get("userScrim").show();
		this.controller.get("userSpinner").mojo.start();
		this.controller.get("userSpinner").show();

};

UserInfoAssistant.prototype.friendTapped = function(event) {
	if(!this.metatap){
		this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,event.item.id,this,false);
	}else{
         var stageArguments = {name: "mainStage"+event.item.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,event.item.id,this,true);
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");					
	}
}

UserInfoAssistant.prototype.searchFriends = function(how,query) {
	var what=(how=="twitter")? {}: {q: query};
	var url = 'https://api.foursquare.com/v1/findfriends/by'+how+'.json';
	this.query=query;
	this.how=how;
	 foursquareGet(this, {
	 	endpoint: 'findfriends/by'+how+'.json',
	 	requiresAuth: true,
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
                	if(this.fromFriends){
                		this.controller.stageController.popScene();
                		this.prevScene.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);
                	}else{
						this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);
					}
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
                	if(this.fromFriends){
						this.controller.stageController.popScene();                	
						this.prevScene.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);						
                	}else{
						this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,this.uid);
					}
					break;
                case "do-Badges":
                	break;
                case "do-Shout":
                	var thisauth=this.auth;
					if(this.fromFriends){
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					if(this.fromFriends){
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
                	break;
                case "do-Todos":
                	var thisauth=_globals.auth;
					if(this.fromFriends){
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade},this);
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.zoomFade},this);
                	break;
                case "do-Donate":
                	_globals.doDonate();
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
      			case "show-Info":
      				this.handleTabs(3);
      				break;
      			case "show-Friends":
      				this.handleTabs(2);
      				break;
      			case "show-History":
      				this.handleTabs(1);
      				break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.scrollTo(0,0,true);
					break;
            }
            var scenes=this.controller.stageController.getScenes();
        }else if(event.type===Mojo.Event.back && this.inOverview==false) {
        	logthis("back");
			event.preventDefault();
			event.stopPropagation();
			event.stop();
	        this.showOverview();
	    }
}


UserInfoAssistant.prototype.activate = function(event) {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});
}

UserInfoAssistant.prototype.deactivate = function(event) {
}

UserInfoAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('mayorshipList'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.stopListening(this.controller.get('checkinHistory'),Mojo.Event.listTap, this.historyListWasTappedBound);
	Mojo.Event.stopListening(this.controller.get('user-mayorinfo'),Mojo.Event.tap, this.showMayorInfoBound);
	Mojo.Event.stopListening(this.controller.get('user-badgeinfo'),Mojo.Event.tap, this.showBadgeInfoBound);
	Mojo.Event.stopListening(this.controller.get('user-tipinfo'),Mojo.Event.tap, this.showTipInfoBound);
	Mojo.Event.stopListening(this.controller.get('friendsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.stopListening(this.controller.get('friendsResultsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.stopListening(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTappedBound);
	Mojo.Event.stopListening(this.controller.get('user-tips'),Mojo.Event.listTap, this.tipTappedBound);
	Mojo.Event.stopListening(this.controller.get('friendsList'),Mojo.Event.listAdd, this.addFriendsBound);
	Mojo.Event.stopListening(this.controller.get("userPic"),Mojo.Event.tap, this.enlargeAvatarBound);
	Mojo.Event.stopListening(this.controller.get("friendToggle"), Mojo.Event.propertyChange, this.toggleFriendsBound);
	Mojo.Event.stopListening(this.controller.get("checkins-row"),Mojo.Event.tap, this.showHistoryBound);
	Mojo.Event.stopListening(this.controller.get("friends-row"),Mojo.Event.tap, this.showFriendsBound);
	Mojo.Event.stopListening(this.controller.get("more-row"),Mojo.Event.tap, this.showInfoBound);
	Mojo.Event.stopListening(this.controller.get("leaderboard-row"),Mojo.Event.tap, this.showLeaderboardBound);

	for(var b=0;b<this.badges_len;b++){
		Mojo.Event.stopListening(this.controller.get('badge-'+b),Mojo.Event.tap, this.showBadgeTipBound);
	}
}
