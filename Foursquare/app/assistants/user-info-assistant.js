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

/*    this.controller.setupWidget("userSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });*/
  	this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('userSpinner', this.spinnerAttr, this.spinnerModel);

         
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
/*    this.controller.setupWidget("venuehistoryToggle",
        this.vhtabAttributes = {

        },
        this.vhtabModel = {
            value: 1,
            disabled: false,
            choices: [
                {label: "Visits", value: 1},
                {label: "Last There", value: 2}
            ]        }
    );*/
    
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
					      {itemTemplate:'listtemplates/mayorVenues'/*,formatters:{categories:this.fixIcon.bind(this)}*/},
					      this.mayorshipModel);
	this.venuehistoryModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('venueHistory', 
					      {itemTemplate:'listtemplates/venueItemsHistory', formatters:{categories:this.fixIconVH.bind(this)}},
					      this.venuehistoryModel);
//					      {itemTemplate:'listtemplates/venueItemsShout'},
	//,onItemRendered: this.loadMoreHistory.bind(this)
	
	this.historyModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('checkinHistory', 
					      {itemTemplate:'listtemplates/historyItems'},
					      this.historyModel);
	this.tipsModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('user-tips', 
					      {itemTemplate:'listtemplates/userTips', formatters:{photo: this.fmtTipPhoto.bind(this)}},
					      this.tipsModel);

	this.todosModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('user-todos', 
					      {itemTemplate:'listtemplates/userTodos', formatters:{photo: this.fmtTipPhoto.bind(this)}},
					      this.todosModel);


	this.listWasTappedBound=this.listWasTapped.bind(this);
	this.historyListWasTappedBound=this.historyListWasTapped.bind(this);
	this.showVenueHistoryBound=this.showVenueHistory.bind(this);
	this.showMayorInfoBound=this.showMayorInfo.bind(this);
	this.showBadgeInfoBound=this.showBadgeInfo.bind(this);
	this.showTipInfoBound=this.showTipInfo.bind(this);
	this.friendTappedBound=this.friendTapped.bindAsEventListener(this);
	this.infoTappedBound=this.infoTapped.bindAsEventListener(this);
	this.tipTappedBound=this.tipTapped.bindAsEventListener(this);
	this.todoTappedBound=this.todoTapped.bindAsEventListener(this);
	this.venueHistoryTappedBound=this.venueHistoryTapped.bindAsEventListener(this);
	this.addFriendsBound=this.addFriends.bind(this);
	this.enlargeAvatarBound=this.enlargeAvatar.bind(this);
	this.toggleFriendsBound=this.toggleFriends.bind(this);
	this.toggleVenueHistoryBound=this.toggleVenueHistory.bind(this);
	this.showHistoryBound=this.showHistory.bind(this);
	this.showTodosBound=this.showTodos.bind(this);
	this.showFriendsBound=this.showFriends.bind(this);
	this.showInfoBound=this.showInfo.bind(this);
	this.showLeaderboardBound=this.showLeaderboard.bind(this);
	this.showPointsInfoBound=this.showPointsInfo.bind(this);
	this.showBadgeTipBound=this.showBadgeTip.bind(this);
	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.get('mayorshipList'),Mojo.Event.listTap, this.listWasTappedBound);
	if(this.isself){
		Mojo.Event.listen(this.controller.get('checkinHistory'),Mojo.Event.listTap, this.historyListWasTappedBound);
		Mojo.Event.listen(this.controller.get("user-checkininfo"),Mojo.Event.tap, this.showHistoryBound);
	}else{
		this.controller.get("checkin-title").update("CHECK-INS");
	}
	Mojo.Event.listen(this.controller.get('venueHistory'),Mojo.Event.listTap, this.venueHistoryTappedBound);
//	Mojo.Event.listen(this.controller.getSceneScroller(),Mojo.Event.scrollStarting, this._scrollStart.bind(this));
	Mojo.Event.listen(this.controller.get('user-mayorinfo'),Mojo.Event.tap, this.showMayorInfoBound);
	Mojo.Event.listen(this.controller.get('user-badgeinfo'),Mojo.Event.tap, this.showBadgeInfoBound);
	//Mojo.Event.listen(this.controller.get('user-tipinfo'),Mojo.Event.tap, this.showTipInfoBound);
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.listen(this.controller.get('friendsResultsList'),Mojo.Event.listTap, this.friendTappedBound);
	Mojo.Event.listen(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTappedBound);
	Mojo.Event.listen(this.controller.get('user-tips'),Mojo.Event.listTap, this.tipTappedBound);
	Mojo.Event.listen(this.controller.get('user-todos'),Mojo.Event.listTap, this.todoTappedBound);
	Mojo.Event.listen(this.controller.get('friendsList'),Mojo.Event.listAdd, this.addFriendsBound);
	Mojo.Event.listen(this.controller.get("userPic"),Mojo.Event.tap, this.enlargeAvatarBound);
	Mojo.Event.listen(this.controller.get("friendToggle"), Mojo.Event.propertyChange, this.toggleFriendsBound);
	Mojo.Event.listen(this.controller.get("venuehistoryToggle"), Mojo.Event.propertyChange, this.toggleVenueHistoryBound);
	Mojo.Event.listen(this.controller.get("venuehistory-row"),Mojo.Event.tap, this.showVenueHistoryBound);
	Mojo.Event.listen(this.controller.get("todos-row"),Mojo.Event.tap, this.showTodosBound);
	Mojo.Event.listen(this.controller.get("friends-row"),Mojo.Event.tap, this.showFriendsBound);
	Mojo.Event.listen(this.controller.get("more-row"),Mojo.Event.tap, this.showInfoBound);
	Mojo.Event.listen(this.controller.get("leaderboard-glimpse"),Mojo.Event.tap, this.showLeaderboardBound);
	Mojo.Event.listen(this.controller.get("points-section"),Mojo.Event.tap, this.showPointsInfoBound);
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
		this.controller.get("leaderboard-glimpse").show();
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
UserInfoAssistant.prototype.fmtTipPhoto = function(value,model){
	if(value!=undefined){
		logthis("has photo");
		model.hasphoto='inline';
		return value;
	}else{
		logthis("no photo");
		model.hasphoto='none';
		return value;
	}
};

UserInfoAssistant.prototype._scrollStart = function(event) {
//	logthis("scroll start");
	event.addListener(this);
};


UserInfoAssistant.prototype.moved = function(stopped,position) {
//	logthis("stopped="+Object.toJSON(stopped));
//	logthis("position="+Object.toJSON(position));

	var itemNode = this.controller.get("checkinHistory").mojo.getNodeByIndex(this.historyModel.items.length-1);
	if(itemNode){
//		logthis("item is there");
		var offset = Element.viewportOffset(itemNode);
//		logthis("offset="+offset);

		if(offset.toArray()[1]<400){
			this.loadMoreHistory();
		}
	}
};

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

UserInfoAssistant.prototype.showPointsInfo = function(event) {
	this.controller.showAlertDialog({
	  onChoose: function(value) {
	  },
      title: "What Are Points?",
      message: "You get points for every check-in, with more points for things like exploring and being out with friends. After each check-in, we add up what you've earned in the last 7 days. That number on the right is your best week ever. Well done!",
      choices:[
          {label:"That's rad! Thanks!", value:"med"}
      ]
	  }
	); 

};


UserInfoAssistant.prototype.enlargeAvatar = function(event) {
//	this.controller.get("userPic").toggleClassName("bigavatar");
     var stageArguments = {name: "photoStage"+this.user.id, lightweight: true};
     var pushMainScene=function(stage){
     	this.metatap=false;
		stage.pushScene("view-photo",{photo:this.controller.get("userPic").src, index:0, array:[{url:this.controller.get("userPic").src, user:this.user,hideFlag:true}]});        
     };
    var appController = Mojo.Controller.getAppController();
	appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");

	//this.controller.stageController.pushScene("view-photo",{photo:this.controller.get("userPic").src, index:0, array:[{url:this.controller.get("userPic").src, user:this.user,hideFlag:true}]});

	logthis("has="+this.controller.get("userPic").hasClassName("bigavatar"));
};

UserInfoAssistant.prototype.fixIcon = function(value,model) {
logthis("fix icon seriously:");
//logthis(Object.toJSON(model));
/*logthis("value="+Object.toJSON(value));
logthis("model="+Object.toJSON(model));

	if(model.venue.categories){
		if(model.venue.categories.length==0){
			model.primarycategory={icon:"images/no-cat.png"};
			return "images/no-cat.png";
		}else{
			model.primarycategory={icon:model.venue.categories[0].icon};
			return model.venue.categories[0].icon;
		}
	}else{
		model.primarycategory={icon:"images/no-cat.png"};
		return "images/no-cat.png";
	}*/
}
UserInfoAssistant.prototype.fixIconVH = function(value,model) {
logthis("fix icon vh:");
//logthis(Object.toJSON(model));
//logthis(Object.toJSON(value));
logthis(Object.toJSON(model));

/*	if(model.venue.categories){
		if(model.venue.categories.length==0){
			model.primarycategory={icon:"images/no-cat.png"};
			return "images/no-cat.png";
		}else{
			model.primarycategory={icon:model.venue.categories[0].icon};
			return model.venue.categories[0].icon;
		}
	}else{
		model.primarycategory={icon:"images/no-cat.png"};
		return "images/no-cat.png";
	}*/
}
UserInfoAssistant.prototype.getUserInfo = function() {
	 	foursquareGetMulti(this,{
	 		endpoints: '/users/'+this.uid+',/users/leaderboard?neighbors=2,/users/'+this.uid+'/mayorships',
	 		requiresAuth: true,
	 		parameters: {},
	 		debug: true,
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
	var j=r.responseJSON.response;
	var tarray=j.tips.items;
	
	this.controller.get("tipcount").update(tarray.length);

	this.tipsList=[];
	this.tipsItems=[];
	
	for(var t=0;t<tarray.length;t++){
		logthis("in array");
		this.tipsList.push(tarray[t]);
		/*var dist=this.tipsList[this.tipsList.length-1].distance;
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
		this.tipsList[this.tipsList.length-1].unit=unit;*/
		
		var created=this.tipsList[this.tipsList.length-1].createdAt;
		if(this.tipsList[this.tipsList.length-1].createdAt != undefined) {
			var now = new Date;
			var later = new Date(this.tipsList[this.tipsList.length-1].createdAt*1000);
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

UserInfoAssistant.prototype.getTodosSuccess = function(r){
	this.todosResponse=r;
	var j=r.responseJSON.response;
	var tarray=j.todos.items;
	
	//this.controller.get("tipcount").update(tarray.length);

	this.todosList=[];
	this.todosItems=[];
	
	for(var t=0;t<tarray.length;t++){
		logthis("in array");
		
		this.todosList.push(tarray[t]);
		/*var dist=this.tipsList[this.tipsList.length-1].distance;
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
		this.tipsList[this.tipsList.length-1].unit=unit;*/
		
		var created=this.todosList[this.todosList.length-1].createdAt;
		if(this.todosList[this.todosList.length-1].createdAt != undefined) {
			var now = new Date;
			var later = new Date(this.todosList[this.todosList.length-1].createdAt*1000);
			var offset = later.getTime() - now.getTime();
			var when=this.relativeTime(offset) + " ago";
		}else{
		   	var when="";
		}
		this.todosList[this.todosList.length-1].when=when;
		
		logthis("handled time");
		
		this.todosList[this.todosList.length-1].user=this.user;
		
		
		if(this.todosList[this.todosList.length-1].tip.status){
			if(this.todosList[this.todosList.length-1].tip.status=="todo"){
				this.todosList[this.todosList.length-1].dogear="block";
			}else{
				this.todosList[this.todosList.length-1].dogear="none";
			}
		}else{
			this.todosList[this.todosList.length-1].dogear="none";
		}
		logthis("handled status");

		
			this.todosList[this.todosList.length-1].candelete=false;	
			this.todosItems.push(this.todosList[this.todosList.length-1]);
	}
	
	this.todosModel.items=this.todosItems;
	this.controller.modelChanged(this.todosModel);
	this.todosDone=true;
	this.checkDone();
};

UserInfoAssistant.prototype.tipTapped = function(event){
	event.item.user=this.user;
	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item}],undefined,true);
};

UserInfoAssistant.prototype.todoTapped = function(event){
	event.item.user=this.user;
	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item.tip}],undefined,true);
};

UserInfoAssistant.prototype.getTipsFailed = function(r){
	this.tipsDone=true;
	this.checkDone();

};
function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}


UserInfoAssistant.prototype.getUserInfoSuccess = function(response) {
	var j=response.responseJSON.response.responses;
	logthis(response.responseText);
	logthis("user info OK");
	var userResponse=j[0].response;
	logthis("user ok");
	var lboardResponse=j[1].response;
	logthis("lboard ok");
	var mayorResponse=j[2].response;
	//userResponse.user.mayorships=j[3].response.mayorships;
	logthis("mayor ok");
	logthis(Object.toJSON(mayorResponse));

	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();

logthis("uid="+this.uid);
//logthis(response.responseText);

	this.user=userResponse.user;
	this.info=[];
	//user info
	this.controller.get("userPic").src=userResponse.user.photo;
	var lname=(userResponse.user.lastName != undefined)? userResponse.user.lastName: "";
	this.firstname=userResponse.user.firstName;
logthis("1");	
	var tw=(userResponse.user.contact.twitter != undefined)? '<span class="linefix"><img src="images/bird.png" width="16" height="16" /> <a id="twitter_button" class="vtag" href="http://twitter.com/'+userResponse.user.contact.twitter+'">'+userResponse.user.contact.twitter+'</a></span><br/>': "";
	if(userResponse.user.contact.twitter != undefined && !this.isself){//show twitter
		var itm={};
		itm.icon="images/twitter_32.png";
		itm.caption="Twitter ("+userResponse.user.contact.twitter+")";
		itm.action="twitter";
		itm.url='http://mobile.twitter.com/'+userResponse.user.contact.twitter;
		itm.username=userResponse.user.contact.twitter;
		this.info.push(itm);
	}
logthis("2");	
		
//	var fb=(j.user.contac.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a id="facebook_button" class="vtag" href="http://facebook.com/profile.php?id='+j.user.contact.facebook+'">Facebook Profile</a></span><br/>': "";
		logthis("facebook html stuff done");
	if(userResponse.user.contact.facebook != undefined && !this.isself){//show facebook
		var itm={};
		itm.icon="images/facebook_32.png";
		itm.caption="Facebook";
		itm.action="url";
		itm.url='http://touch.facebook.com/#/profile.php?id='+userResponse.user.contact.facebook;
		this.info.push(itm);
	}
logthis("3");	

	var ph=(userResponse.user.contact.phone != undefined)? '<span class="linefix"><img src="images/phone.png" width="16" height="16" /> <a id="phone_button" class="vtag" href="tel://'+userResponse.user.contact.phone+'">'+userResponse.user.contact.phone+'</a></span><br/>': "";
	if(userResponse.user.contact.phone != undefined && !this.isself){//show phone
		var itm={};
		itm.icon="images/call_32.png";
		itm.caption="Call";
		itm.action="url";
		itm.url='tel://'+userResponse.user.contact.phone;
		this.info.push(itm);

		var itm={};
		itm.icon="images/sms_32.png";
		itm.caption="Text Message";
		itm.action="url";
		itm.url='sms:'+userResponse.user.contact.phone;
		this.info.push(itm);
	}
logthis("4");	

	var em=(userResponse.user.contact.email != undefined)? '<span class="linefix"><img src="images/mail.png" width="16" height="16" /> <a id="email_button" class="vtag" href="mailto:'+userResponse.user.contact.email+'">Send E-mail</a></span><br/>': "";
	if(userResponse.user.email != undefined){//show email
		var itm={};
		itm.icon="images/email_32.png";
		itm.caption="E-mail";
		itm.action="url";
		itm.url='mailto:'+userResponse.user.contact.email;
		this.info.push(itm);
	}
logthis("5");	

	
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if(this.uid != "") { //only show friending options if it's not yourself
	var friendstatus=(userResponse.user.relationship != undefined)? userResponse.user.relationship: "";
	
	logthis("fiend status grabbed");

	switch (friendstatus) {
		case "friend":
		case "followingThem":
			//var fs="You're friends!"
			//this.controller.get("checkins-row").hide();
			this.controller.get("venuehistory-row").hide();
			var itm={};
			itm.icon="images/deny_32.png";
			itm.caption="Remove Friend";
			itm.action="unfriend";
			this.info.push(itm);
			this.unfriendIndex=this.info.length-1;

			break;
		case "pendingThem":
			//var fs='<img src="images/pending.png" width="108" height="42" id="pendingfriend" alt="Pending" />';
			var itm={};
			itm.icon="images/pending_32.png";
			itm.caption="Friendship Pending";
			itm.action="";
			itm.url='';
			this.info.push(itm);
			//this.controller.get("checkins-row").hide();
			this.controller.get("venuehistory-row").hide();
			break;
		case "pendingMe":
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
			//this.controller.get("checkins-row").hide();
			this.controller.get("friendshipinfo").innerHTML="Approve/Deny Friendship, ";
			this.controller.get("friendshipinfo").show();
			this.controller.get("venuehistory-row").hide();
			break;
		case "self":
			//this.controller.get("checkins-row").show();
			this.controller.get("venuehistory-row").show();
			break;
		default:
			//var fs='<img src="images/addfriend.png" width="108" height="42" id="addfriend" alt="Add Friend" />';
			logthis("not a friend");
			var itm={};
			switch(userResponse.user.type){
				case "user":
					itm.caption="Add as a Friend";
					break;
				case "brand":
					itm.caption="Follow";
					break;
				case "celebrity":
					itm.caption="Follow";
					break;
			}		
			itm.icon="images/addfriend_32.png";
			itm.action="addfriend";
			this.info.push(itm);
			this.addIndex=this.info.length-1;
			//this.controller.get("checkins-row").hide();
			this.controller.get("friendshipinfo").innerHTML="Add as Friend, ";
			this.controller.get("friendshipinfo").show();
			break;
	}
	}else{
		var fs="";
	}	
	
	logthis("handled f status");
	//fs='<span id="friend_button">'+fs+'</span>';
	if(userResponse.user.pings!=undefined){
	this.getpings=userResponse.user.pings;
	if(this.getpings != undefined){
		if(this.getpings==true){
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

	
	this.controller.get("userName").innerHTML=userResponse.user.firstName+" "+lname+"";
	if(userResponse.user.checkins.items){
		if(userResponse.user.checkins.items.length != 0) {
			var v=(userResponse.user.checkins.items[0].venue != undefined)? " @ "+userResponse.user.checkins.items[0].venue.name: "";
			var s=(userResponse.user.checkins.items[0].shout)? userResponse.user.checkins.items[0].shout: "";
			var urlmatch=/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			s.match(urlmatch);
			var url=RegExp['$&'];
			s=s.replace(url,'<a href="'+url+'" class="headlink">'+url+'</a>');
			this.controller.get("userCity").innerHTML = s + v;
		}
	}	
		logthis("checkin info set");
		
	if(userResponse.user.checkins != undefined) {
	}


	//todo list
	if(userResponse.user.todos){
		if(userResponse.user.todos.count>0){
			this.controller.get("todo-count").update(userResponse.user.todos.count+" items on To-Do list");
			this.controller.get("todos-row").show();
		}
	}


	//user's mayorships
	if(userResponse.user.mayorships != null && userResponse.user.mayorships != undefined) {
		if(userResponse.user.mayorships.count>0){
			//this.controller.get("mayor-title").innerHTML=j.user.mayor.length+" Mayorships";
			logthis("mayor="+Object.toJSON(userResponse.user.mayorships));
			this.controller.get("mayorcount").innerHTML=userResponse.user.mayorships.count;
			
			var mayorships=[];
			
			for(var m=0;m<mayorResponse.mayorships.items.length;m++){
				var itm=mayorResponse.mayorships.items[m].venue;
				//logthis("itm="+Object.toJSON(itm));
				if(itm.todos){
					if(itm.todos.count>0){
						itm.dogear="block";
					}else{
						itm.dogear="none";
					}
				}else{
					itm.dogear="none";
				}
				
				//handle empty category
				if(itm.categories.length==0){
					itm.primarycategory={};
					itm.primarycategory.icon="images/no-cat.png";
				}else{
					itm.primarycategory=itm.categories[0];
					
				}

				
				mayorships.push(itm);
			}
	
			logthis("mayorhsip count="+mayorships.length);
			this.mayorshipModel.items=mayorships;
			this.controller.modelChanged(this.mayorshipModel);
		}else{
			this.controller.get("mayor-notice").innerHTML=userResponse.user.firstName+' isn\'t the mayor of anything yet.';
			this.controller.get("mayor-notice").show();
			this.controller.get("mayorshipList").hide();
			this.controller.get("mayorcount").innerHTML="0";			
		}
	}else{
		this.controller.get("mayor-notice").innerHTML=userResponse.user.firstName+' isn\'t the mayor of anything yet.';
		this.controller.get("mayor-notice").show();
		this.controller.get("mayorshipList").hide();
		this.controller.get("mayorcount").innerHTML="0";	
	}

logthis("here0");
	//user's badges
	this.controller.get("badgecount").innerHTML=userResponse.user.badges.count;	
/*	if(j.user.badges != null && j.user.badges != undefined && j.user.badges.length>0) {
		
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
	}*/

	logthis("here0.5");


	//handle extra stats
	this.controller.get("checkin-count").update(userResponse.user.checkins.count);
	var friendcount=userResponse.user.friends.count;
	var ficcount=0;
	var avatars='';
	
	logthis("here1");
	
	
	var friendstuff=userResponse.user.friends;
	var friendText='';
	var friendAvatars='';
	var thumbCount=0;
	
	if(userResponse.user.requests){
		if(userResponse.user.requests.count>0){
			if(userResponse.user.requests==1){
				friendstuff.groups.push({type:'requests',name:'friend request',count:userResponse.user.requests.count,items:[]});	
			}else{
				friendstuff.groups.push({type:'requests',name:'friend requests',count:userResponse.user.requests.count,items:[]});	
			}
		}
	}
	
	logthis("here2");
	
	for(var fg=0;fg<friendstuff.groups.length;fg++){
		var count=friendstuff.groups[fg].count;
		var name=(count!=1)? friendstuff.groups[fg].name: friendstuff.groups[fg].name.replace('friends','friend');

		if(fg==0 && count>0){ //first group
			logthis("first group");
			friendText+=count+" "+name;
		}else if(fg==friendstuff.groups.length-1 && count>0){ //last group
			logthis("last group");
			friendText+=' and '+count+" "+name;
		}else{ 
			logthis("middle group");
			if(count>0){friendText+=", "+count+" "+name;}
		}
		logthis("friendtext="+friendText);
		logthis(friendText.substring(0,5));
		if(friendText.substring(0,5)==" and "){
			friendText=friendText.replace(" and ","");
		}
		if(friendText.substring(0,1)==", "){
			friendText=friendText.replace(", ","");
		}
		


		//create thumbnails
		if(thumbCount<6){
			logthis("thumbCount<6");
			for(var f=0;f<friendstuff.groups[fg].items.length;f++){
				logthis("in friend loop");
				if(thumbCount<6){
					logthis("building thumbs");
					var user=friendstuff.groups[fg].items[f];
					logthis(Object.toJSONuser);
					var purl=user.photo;
					friendAvatars+='<img src="'+purl+'" width="32" height="32" class="venue-photo-thumb"/>';
					thumbCount++;
					
					logthis("pt="+friendAvatars);
				}			
			}
		}
		
	}
	if(friendstuff.groups.length==1){friendText=friendText.replace('other ','')}
	this.controller.get("friends-count").update(friendText);
	this.controller.get("friends-avatars").update(friendAvatars);

	
/*	if(j.user.friendsincommon){
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
	this.controller.get("friends-avatars").update(avatars);*/
	this.controller.get("tipcount").update(userResponse.user.tips.count);

	//if logged in user, show checkin history
	if(this.uid == "") {
		this.getHistory();
	}else{
		this.userDone=true;
		this.checkDone();

	}


	//handle scores
	this.controller.get("points-bar-progress").update(userResponse.user.scores.recent);
	var s=userResponse.user.scores.recent;
	if(userResponse.user.scores.goal!=undefined){
		this.controller.get("points-end-title").update("GOAL");
		this.controller.get("points-max").update(userResponse.user.scores.goal);
		var e=userResponse.user.scores.goal;
	}else{
		this.controller.get("points-end-title").update("HIGH");
		this.controller.get("points-max").update(userResponse.user.scores.max);	
		var e=userResponse.user.scores.max;
	}
	var w=Math.round((s/e)*100);
	this.controller.get("points-bar-progress").style.width=w+"%";

	if(this.isself){
		var lboard=lboardResponse.leaderboard.items;
		logthis(Object.toJSON(lboard));
		var leaderboardHTML='';
		for(var u=0;u<lboard.length; u++){
			var rank=lboard[u].rank;
			var photo=lboard[u].user.photo;
			var fname=lboard[u].user.firstName;
			var lname=(lboard[u].user.lastName)? lboard[u].user.lastName: '';
			var uname=fname + " "+ lname;
			var relationship=lboard[u].user.relationship;
			var score=lboard[u].scores.recent;
			
			if(relationship=="self"){
				var rankClass="bright";
			}else{
				var rankClass="dim";
			}
			
			leaderboardHTML+='<div class="result row" style="padding:0;padding-bottom:7px; padding-top: 3px;"><div class="lb-rank '+rankClass+'">#'+rank+'</div><div class="lb-photo"><img src="'+photo+'" width="32" height="32" class="friend-avatar"></div><div class="lb-name '+rankClass+'">'+uname+'</div><div class="lb-score '+rankClass+'">'+score+'</div><br class="breaker"></div>';
		}
		
		this.controller.get("leaderboardWell").update(leaderboardHTML);
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
	this.controller.get("utodos").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	this.controller.get("venuehistory").hide();
	this.controller.get("mayorof").show();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
}

UserInfoAssistant.prototype.showBadgeInfo = function(event) {
/*	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").show();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);+*/
	
	this.controller.stageController.pushScene("badges",{username: this.user.firstName, id:this.uid});
}

UserInfoAssistant.prototype.showTipInfo = function(event) {
	this.startLoader();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").show();
	this.controller.get("utodos").show();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("venuehistory").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	
	if(!this.tipsList){
	 	foursquareGet(this,{
	 		endpoint: 'users/'+this.uid+'/tips',
	 		requiresAuth: true,
	 		debug:true,
	 		parameters: {sort:'recent'},
	   		onSuccess: this.getTipsSuccess.bind(this),
	   		onFailure: this.getTipsFailed.bind(this)
	 	});
	}else{
		this.getTipsSuccess(this.tipsResponse);
	}
}

UserInfoAssistant.prototype.showTodos = function(event) {
	this.startLoader();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("venuehistory").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").show();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	
//	if(!this.tipsList){
	 	foursquareGet(this,{
	 		endpoint: 'users/'+this.uid+'/todos',
	 		requiresAuth: true,
	 		debug:true,
	 		parameters: {sort:'recent'},
	   		onSuccess: this.getTodosSuccess.bind(this),
	   		onFailure: this.getTipsFailed.bind(this)
	 	});
/*	}else{
		this.getTipsSuccess(this.tipsResponse);
	}*/
}

UserInfoAssistant.prototype.showOverview = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=true;
	this.controller.get("overview").show();
	this.controller.get("venuehistory").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").hide();
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
	this.controller.get("venuehistory").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").hide();
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
	this.controller.get("utodos").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("venuehistory").hide();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").show();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	if(!this.friendList){
		 foursquareGet(this,{
		 	endpoint: 'users/'+this.uid+'/friends',
		 	requiresAuth: true,
		 	debug: true,
		 	parameters: {},
			onSuccess: this.getFriendsSuccess.bind(this),
		    onFailure: this.getFriendsFailed.bind(this)		 	
		 });
	}else{
		this.getFriendsSuccess(this.friendsResponse);
	}
}
UserInfoAssistant.prototype.showVenueHistory = function(event) {
	this.startLoader();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").hide();
	this.controller.get("uhistory").hide();
	this.controller.get("ubadges").hide();
	this.controller.get("venuehistory").show();
	this.controller.get("mayorof").hide();
	this.controller.get("ufriends").hide();
	this.controller.get("ufriendsresults").hide();
	//this.tabModel.value=0;
	this.controller.modelChanged(this.tabModel);
	if(!this.venuehistoryResponse){
		 foursquareGet(this,{
		 	endpoint: 'users/'+this.uid+'/venuehistory',
		 	requiresAuth: true,
		 	debug: true,
		 	parameters: {},
			onSuccess: this.getVenueHistorySuccess.bind(this),
		    onFailure: this.getVenueHistoryFailed.bind(this)		 	
		 });
	}else{
		this.getVenueHistorySuccess(this.venuehistoryResponse);
	}
}
UserInfoAssistant.prototype.showInfo = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();

	this.inOverview=false;
	this.controller.get("overview").hide();
	this.controller.get("uinfo").show();
	this.controller.get("venuehistory").hide();
	this.controller.get("utips").hide();
	this.controller.get("utodos").hide();
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
	this.controller.get("venuehistory").hide();
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

UserInfoAssistant.prototype.toggleVenueHistory = function(event){
	switch(event.value){
		case 1: //beenhere
			var vh=this.venuehistoryModel.items;
			vh.sort(function(a, b){return (b.beenHere - a.beenHere);});
			this.venuehistoryModel.items=vh;
			this.controller.modelChanged(this.venuehistoryModel);
			break;
		case 2: //lastthere
			var vh=this.venuehistoryModel.items;
			vh.sort(function(a, b){return (b.lastHereAt - a.lastHereAt);});
			this.venuehistoryModel.items=vh;
			this.controller.modelChanged(this.venuehistoryModel);
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

UserInfoAssistant.prototype.getVenueHistorySuccess = function(response){
	this.venuehistoryResponse=response;
	
	if(response.responseJSON.meta.code==200){
		var j=response.responseJSON.response;
		var venues=[];
				
		for(var v=0;v<j.venues.items.length;v++){
			if(j.venues.items[v].venue.categories){
				if(j.venues.items[v].venue.categories.length==0){
					j.venues.items[v].primarycategory={icon:"images/no-cat.png"};
				}else{
					j.venues.items[v].primarycategory={icon:j.venues.items[v].venue.categories[0].icon};
				}
			}else{
				j.venues.items[v].primarycategory={icon:"images/no-cat.png"};
			}
			
			if(j.venues.items[v].lastHereAt!=undefined){
		    	var ca=new Date(j.venues.items[v].lastHereAt*1000);
		    	var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
	    	
	    	
	    		var mins=(ca.getMinutes()<10)? "0"+ca.getMinutes(): ca.getMinutes();
	    		var hours=(ca.getHours()<10)? "0"+ca.getHours(): ca.getHours();
	    		
		    	var t=hours+':'+mins;
		    	var d=months[ca.getMonth()]+' '+ca.getDate()+', '+(ca.getYear()+1900);
				j.venues.items[v].lasthere='Last here: '+t+' '+d;
			}
			
			j.venues.items[v].times=(j.venues.items[v].beenHere==1)? '1 time': j.venues.items[v].beenHere+' times';
		
		}
		
		this.venuehistoryModel.items=j.venues.items.sort(function(a, b){return (b.beenHere - a.beenHere);});;
		this.controller.modelChanged(this.venuehistoryModel);
		this.controller.get("userSpinner").hide();
	}else{
		this.getVenueHistoryFailed(response);
	}
	
};
UserInfoAssistant.prototype.getVenueHistoryFailed = function(response){

};

UserInfoAssistant.prototype.getFriendsSuccess = function(response) {
logthis(response.responseText);
logthis("friends success");

	this.friendsResponse=response;
	if (response.responseJSON.response.friends.count == 0) {
		this.controller.get('message').innerHTML = 'No Results Found';
		logthis("no json");
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.friendList = [];
		
		if(response.responseJSON.response.friends != undefined) {
			logthis("got friends array");
			var fc=response.responseJSON.response.friends.items.length;
			var f=" friends";
			if(fc==1){f=" friend";}
//			this.controller.get("friends-count").update(fc+f);
			
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
			for(var f=0;f<response.responseJSON.response.friends.items.length;f++) {
				if(response.responseJSON.response.friends.items[f].relationship=="friend" && !isself){
					this.isfriends.push(response.responseJSON.response.friends.items[f]);
					this.isfriends[this.isfriends.length-1].grouping="Mutual Friends";
				}
				this.friendList.push(response.responseJSON.response.friends.items[f]);
				//logthis(Object.toJSON(response.responseJSON.friends[f]));
				this.friendList[f].grouping=response.responseJSON.response.friends.items[f].firstName.toUpperCase().substr(0,1);//"Friends";
			}
			logthis("looped throughf riends");
		}
		
		this.friendList=this.friendList.sort(function(a,b){
			var alname=(a.lastName)? " "+a.lastName.toLowerCase(): "";
			var blname=(b.lastName)? " "+b.lastName.toLowerCase(): "";
			
			var nameA = a.firstName.toLowerCase()+alname;
			var nameB = b.firstName.toLowerCase()+blname;
			if (nameA < nameB) {return -1}
			if (nameA > nameB) {return 1}
			return 0;
		});
		
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
				if(this.friendList[f].relationship!="friend" && this.friendList[f].relationship!="self"){
					avatars+='<img width="32" height="32" src="'+this.friendList[f].photo+'" class="friend-avatar">';
				}
			}
			logthis("out of other loop");
		}
		logthis("going to update div");
				
		//this.controller.get("friends-avatars").update(avatars);
	}
	
	//load pending friends
	var getpending=false;
	logthis("set getpending");
	if(this.user){
		logthis("user exists");
		if(this.user.relationship="self"){
			if(this.user.requests!=undefined && this.user.requests.count>0){
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
		 	endpoint: 'users/requests',
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
		if(response.responseJSON.response.requests != undefined && response.responseJSON.response.requests != null && response.responseJSON.response.requests.length>0) {
			logthis("in request if");
			for(var f=0;f<response.responseJSON.response.requests.length;f++) {
				logthis("request loop");
				this.requestList.push(response.responseJSON.response.requests[f]);
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
		endpoint: 'users/'+this.uid+'/approve',
		parameters: {},
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
	if(response.responseJSON.response.user != undefined) {
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
		endpoint: 'users/'+this.uid+'/deny',
		requiresAuth: true,
		parameters: {},
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
	if(response.responseJSON.response.user != undefined) {
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

UserInfoAssistant.prototype.removeFriend = function(event) {
	foursquarePost(this, {
		endpoint: 'users/'+this.uid+'/unfriend',
		requiresAuth: true,
		parameters: {},
		debug: false,
		onSuccess: this.removeSuccess.bind(this),
		onFailure: this.removeFailed.bind(this)
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
UserInfoAssistant.prototype.removeSuccess = function(response) {
	if(response.responseJSON.response.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Unfriended!", {source: 'notification'});
		//this.controller.get("friend_button").innerHTML='<img src="images/addfriend.png" width="100" height="35" id="addfriend" alt="Add Friend" />';
		this.controller.get("infoList").noticeRemovedItems(this.unfriendIndex,1);
		this.controller.modelChanged(this.infoItems);
		//Mojo.Event.listen(this.controller.get("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Error removing friend", {source: 'notification'});
	}
}
UserInfoAssistant.prototype.removeFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error removing friend", {source: 'notification'});
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
//		this.controller.stageController.pushScene({name: "view-checkin", transition: Mojo.Transition.crossFade, disableSceneScroller: false},event.item.venue,_globals.username,_globals.password,_globals.uid,true);
		this.controller.stageController.pushScene({name: "view-checkin", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},{checkin:event.item.checkinId});
	}else{
         var stageArguments = {name: "mainStage"+event.item.venue.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name: "view-checkin", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},{checkin:event.item.checkinId});   
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");				
	}
}


UserInfoAssistant.prototype.venueHistoryTapped = function(event){
	if(!this.metatap){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},event.item.venue,_globals.username,_globals.password,_globals.uid,true);
	}else{
         var stageArguments = {name: "mainStage"+event.item.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene(false,event.item.venue,_globals.username,_globals.password,_globals.uid,true);         
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");		
	}

};

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
		case "unfriend":
			this.removeFriend();
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
					_globals.openApp(this.controller, "Bad Kitty", "com.superinhuman.badkitty", {
										action: "user",
										name: event.item.username
									});
					break;
				case "spaz":
					_globals.openApp(this.controller, "Spaz", "com.funkatron.app.spaz", {
										action: "user",
										userid: event.item.username
									});
					break;
				case "spaz-sped":
					_globals.openApp(this.controller, "Spaz Special Edition", "com.funkatron.app.spaz-sped", {
										action: "user",
										userid: event.item.username
									});
					break;
				case "tweetme":
					_globals.openApp(this.controller, "TweetMe", "com.catalystmediastudios.tweetme", {
										action: "user",
										name: event.item.username
									});
					break;
			}
			break;
	}
}
UserInfoAssistant.prototype.setPings = function(event) {
	if(this.getpings=="true"){
		this.getpings="false";
		var val=false;
	}else{
		this.getpings="true";
		var val=true;	
	}
	var params={value: val};

	
	foursquarePost(this,{
		endpoint: 'users/'+this.uid+'/setpings',
		parameters: params,
		requiresAuth: true,
		debug: true,
		onSuccess: this.pingSuccess.bind(this),
		onFailure: this.pingFailed.bind(this)
	});
}
UserInfoAssistant.prototype.pingSuccess = function(response) {
	if(response.responseJSON.meta.code==200) {
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
		endpoint: 'users/'+this.uid+'/request',
		parameters: {},
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
	if(response.responseJSON.response.user != undefined) {
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
		var uid=this.uid;
		if(this.uid=_globals.uid){uid='self';}
		var now = new Date;
		var stamp =Math.round(now.getTime()/1000)-2592000; //add 30 days
	
		 foursquareGet(this, {
		 	endpoint: 'users/'+uid+'/checkins',
		 	parameters: {afterTimestamp:stamp,limit:500},
		 	debug: true,
		 	requiresAuth: true,
		    onSuccess: this.historySuccess.bind(this),
		    onFailure: this.historyFailed.bind(this)
		 });
	}else{
		 	this.historySuccess(this.historyResponse);
	}
}

UserInfoAssistant.prototype.loadMoreHistory = function(list,item,dom){
/*	var itemNode = this.controller.get("checkinHistory").mojo.getNodeByIndex(this.historyModel.items.length-1);
	if(itemNode){
		logthis("item is there");
		var offset = Element.viewportOffset(itemNode);
		logthis("offset="+offset);
	}*/

		this.startLoader();
		var uid=this.uid;
		if(this.uid=_globals.uid){uid='self';}
		foursquareGet(this, {
		 	endpoint: 'users/'+uid+'/checkins',
		 	parameters: {limit:'50',offset:this.historyModel.items.length},
		 	debug: true,
		 	requiresAuth: true,
		    onSuccess: this.historyMoreSuccess.bind(this),
		    onFailure: this.historyFailed.bind(this)
		});
};

UserInfoAssistant.prototype.historySuccess = function(response) {

	this.historyResponse=response;
	var j=response.responseJSON.response;
	
	if(j.checkins != null) {
	//this.controller.get("uhistory").show();
		this.checkinlist=[];
		for(var c=0;c<j.checkins.items.length;c++){
			this.checkinlist.push(j.checkins.items[c]);
			this.checkinlist[c].checkinId=j.checkins.items[c].id;
			this.checkinlist[c].idx=c;
			this.checkinlist[c].firstname=this.user.firstName;
			this.checkinlist[c].lastname=(this.user.lastName)? ' '+this.user.lastName: '';
			this.checkinlist[c].photo=this.user.photo;
			
			switch(j.checkins.items[c].type){
				case "checkin":
					this.checkinlist[c].checkin=j.checkins.items[c].venue.name;
					this.checkinlist[c].geolat=j.checkins.items[c].venue.location.lat;
					this.checkinlist[c].geolong=j.checkins.items[c].venue.location.lng;
					this.checkinlist[c].at="@ ";
					break;
				case "shout":
					this.checkinlist[c].checkin="";
					this.checkinlist[c].geolat=(j.checkins.items[c].location.lat)? j.checkins.items[c].location.lat: 0;
					this.checkinlist[c].geolong=(j.checkins.items[c].location.lng)? j.checkins.items[c].location.lng: 0;
					this.checkinlist[c].at="";
					break;
				case "venueless":
					this.checkinlist[c].checkin=j.checkins.items[c].location.name;
					this.checkinlist[c].geolat=(j.checkins.items[c].location.lat)? j.checkins.items[c].location.lat: 0;
					this.checkinlist[c].geolong=(j.checkins.items[c].location.lng)? j.checkins.items[c].location.lng: 0;
					this.checkinlist[c].at="@ ";
					break;
			}
			
			this.checkinlist[c].shout=(j.checkins.items[c].shout != undefined)? "\n"+j.checkins.items[c].shout: "";
			var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			this.checkinlist[c].shout=this.checkinlist[c].shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
			
			this.checkinlist[c].mayorcrown=(j.checkins.items[c].isMayor=="true" || j.checkins.items[c].isMayor==true)? '<img src="images/crown_smallgrey.png"/> ': "";
			
			if(j.checkins.items[c].source){
				if(j.checkins.items[c].source.name.indexOf('foursquare for')>-1){
					this.checkinlist[c].source=(j.checkins.items[c].source)? 'via '+j.checkins.items[c].source.name+'': '';			
				}else{
					this.checkinlist[c].source=(j.checkins.items[c].source)? 'via <a class="fakelink" href="'+j.checkins.items[c].source.url+'">'+j.checkins.items[c].source.name+'</a>': '';
				
				}
			}

			//handle photos and comments
			var html='';
			if(j.checkins.items[c].photos.count>0){
				html+='<img src="images/tip-hasphoto.png" width="16" height="13" align="middle">'+j.checkins.items[c].photos.count;
			}
			
			if(j.checkins.items[c].comments.count>0){
				html+='<img src="images/hascomments.png" width="15" height="14" align="middle">'+j.checkins.items[c].comments.count;
			}else{
				html+='<img src="images/nocomments.png" width="15" height="14" align="middle">+';				
			}
			
			this.checkinlist[c].comments=html;



		
			//handle time
			var now = new Date;
			var later = new Date(j.checkins.items[c].createdAt*1000);
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

UserInfoAssistant.prototype.historyMoreSuccess = function(response) {

	this.historyResponse=response;
	var j=response.responseJSON.response;
	
	if(j.checkins != null) {
	//this.controller.get("uhistory").show();
		this.checkinlist=[];
		for(var c=0;c<j.checkins.items.length;c++){
			this.checkinlist.push(j.checkins.items[c]);
			this.checkinlist[c].checkinId=j.checkins.items[c].id;
			this.checkinlist[c].idx=c;
			this.checkinlist[c].firstname=this.user.firstName;
			this.checkinlist[c].lastname=(this.user.lastName)? ' '+this.user.lastName: '';
			this.checkinlist[c].photo=this.user.photo;
			
			switch(j.checkins.items[c].type){
				case "checkin":
					this.checkinlist[c].checkin=j.checkins.items[c].venue.name;
					this.checkinlist[c].geolat=j.checkins.items[c].venue.location.lat;
					this.checkinlist[c].geolong=j.checkins.items[c].venue.location.lng;
					this.checkinlist[c].at="@ ";
					break;
				case "shout":
					this.checkinlist[c].checkin="";
					this.checkinlist[c].geolat=(j.checkins.items[c].location.lat)? j.checkins.items[c].location.lat: 0;
					this.checkinlist[c].geolong=(j.checkins.items[c].location.lng)? j.checkins.items[c].location.lng: 0;
					this.checkinlist[c].at="";
					break;
				case "venueless":
					this.checkinlist[c].checkin=j.checkins.items[c].location.name;
					this.checkinlist[c].geolat=(j.checkins.items[c].location.lat)? j.checkins.items[c].location.lat: 0;
					this.checkinlist[c].geolong=(j.checkins.items[c].location.lng)? j.checkins.items[c].location.lng: 0;
					this.checkinlist[c].at="@ ";
					break;
			}
			
			this.checkinlist[c].shout=(j.checkins.items[c].shout != undefined)? "\n"+j.checkins.items[c].shout: "";
			var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			this.checkinlist[c].shout=this.checkinlist[c].shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
			
			this.checkinlist[c].mayorcrown=(j.checkins.items[c].isMayor=="true" || j.checkins.items[c].isMayor==true)? '<img src="images/crown_smallgrey.png"/> ': "";
			
			if(j.checkins.items[c].source){
				if(j.checkins.items[c].source.name.indexOf('foursquare for')>-1){
					this.checkinlist[c].source=(j.checkins.items[c].source)? 'via '+j.checkins.items[c].source.name+'': '';			
				}else{
					this.checkinlist[c].source=(j.checkins.items[c].source)? 'via <a class="fakelink" href="'+j.checkins.items[c].source.url+'">'+j.checkins.items[c].source.name+'</a>': '';
				
				}
			}

			//handle photos and comments
			var html='';
			if(j.checkins.items[c].photos.count>0){
				html+='<img src="images/tip-hasphoto.png" width="16" height="13" align="middle">'+j.checkins.items[c].photos.count;
			}
			
			if(j.checkins.items[c].comments.count>0){
				html+='<img src="images/hascomments.png" width="15" height="14" align="middle">'+j.checkins.items[c].comments.count;
			}else{
				html+='<img src="images/nocomments.png" width="15" height="14" align="middle">+';				
			}
			
			this.checkinlist[c].comments=html;



		
			//handle time
			var now = new Date;
			var later = new Date(j.checkins.items[c].createdAt*1000);
			var offset = later.getTime() - now.getTime();
			this.checkinlist[c].when=this.relativeTime(offset) + " ago";
			
			
		}
		
		//this.historyModel.items.concat(this.checkinlist);
		//this.controller.modelChanged(this.historyModel);
		this.controller.get("checkinHistory").mojo.noticeAddedItems(this.historyModel.items.length,this.checkinlist);

	}else{
		//this.controller.get("history-box").innerHTML='<div class="palm-row single"><div class="checkin-badge"><span>No recent check-ins yet.</span></div></div>';
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
//	logthis("ud="+this.userDone);
//	logthis("td="+this.tipsDone);
//	logthis("fd="+this.friendsDone);
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
	var what={};
	this.startLoader();
	switch(how){
		case "twitter":
			query=this.user.contact.twitter;
			what={twitterSource: query};
			break;
		case "phone":
			what={phone: query};
			break;
		case "name":
			what={name: query};
			break;
	}
	this.query=query;
	this.how=how;
	 foursquareGet(this, {
	 	endpoint: 'users/search',
	 	requiresAuth: true,
	 	parameters: what,
	 	debug: true,
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
		
		this.controller.get("userSpinner").hide();
		
		if(response.responseJSON.response.results != undefined) {
			for(var f=0;f<response.responseJSON.response.results.length;f++) {
				this.searchList.push(response.responseJSON.response.results[f]);
				if(this.how=="name" || this.how=="phone"){
					this.searchList[f].grouping="Search Results for '"+this.query+"'";
				}else{
					this.searchList[f].grouping="Twitter Friends on Foursquare";				
				}
			}
		}
		if(response.responseJSON.response.results.length==0){
			Mojo.Controller.getAppController().showBanner("No results found!", {source: 'notification'});	
		}
		
		this.friendresultsModel.items =this.searchList; //update list with basic user info
		this.controller.modelChanged(this.friendresultsModel);
		this.controller.get("ufriendsresults").show();
		setTimeout(function(){this.controller.getSceneScroller().mojo.adjustBy(0,-100);}.bind(this),20);

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
                case "do-Explore":
                	var thisauth=auth;
                	if(this.fromFriends){
                		this.controller.stageController.popScene();
                		this.prevScene.controller.stageController.swapScene({name: "explore", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	}else{
						this.controller.stageController.swapScene({name: "explore", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
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
