function FriendsListAssistant(a, ud, un, pw,i,la,lo,ps,ss,what) {
	 this.auth = _globals.auth;
	 this.userData = ud;
	 this.username=un;
	 this.password=pw;
	 this.uid=i;
	 this.lat=la;
	 this.long=lo;
	 this.prevScene=ps;
	 
	 switch(what) {
	 	case "feed":
	 		this.showFeed=true;
	 		break;
	 	case "list":
	 		this.showList=true;
	 		break;
	 	case "pending":
	 		this.showPending=true;
	 		break;
	 	default:
	 		this.showFeed=true;
	 		break;
	 }
	 this.showSearch=ss;
}

FriendsListAssistant.prototype.setup = function() {
	zBar.activeScene=this;
	this.textFieldAtt = {
			hintText: 'Find some friends!',
			textFieldName:	'name', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			true, 
			modifierState: 	Mojo.Widget.capsLock,
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 30,
			requiresEnterKey: false
	};
	this.textModel = {
		value : ''
	};
	
	this.resultsModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('sendField', this.textFieldAtt, this.textModel);
    
	this.controller.setupWidget('results-friends-list', 
					      {itemTemplate:'listtemplates/friendItems',dividerFunction: this.groupVenues,dividerTemplate: 'listtemplates/dividertemplate'},
					      this.resultsModel);

	this.buttonModel1 = {
		buttonLabel : 'Find Friends',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_button',this.buttonAtt1,this.buttonModel1);
	
	this.buttonModelT = {
		buttonLabel : 'Find Friends via Twitter',
		buttonClass : '',
		disable : false
	}
	this.buttonAttT = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_twitter_button',this.buttonAttT,this.buttonModelT);

	this.buttonModelP = {
		buttonLabel : 'Show Pending Requests',
		buttonClass : '',
		disable : false
	}
	this.buttonAttP = {
		type : Mojo.Widget.activityButton
	}
	


	this.avbuttonModel1 = {
		buttonLabel : 'Add New Venue',
		buttonClass : '',
		disable : false
	}
	this.avbuttonAtt1 = {
	}
	
	
	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onSearchFriends.bind(this));
	Mojo.Event.listen(this.controller.get('go_twitter_button'),Mojo.Event.tap, this.onSearchTwitterFriends.bind(this));
	Mojo.Event.listen(this.controller.get('fmenu'),Mojo.Event.tap, this.showMenu.bind(this));
//	Mojo.Event.listen(this.controller.get('results-friends-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),"mousedown", function(){this.controller.get('friend-refresh').addClassName("pressed");}.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),"mouseup", function(){this.controller.get('friend-refresh').removeClassName("pressed");}.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),Mojo.Event.tap, this.hardRefresh.bind(this));

	Mojo.Event.listen(this.controller.get('friend-shout'),"mousedown", function(){this.controller.get('friend-shout').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-shout'),"mouseup", function(){this.controller.get('friend-shout').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-shout'),Mojo.Event.tap, this.doShout.bind(this));



	Mojo.Event.listen(this.controller.get('mainfeed'),Mojo.Event.tap, this.hardRefresh.bind(this));

	Mojo.Event.listen(this.controller.get('friend-map'),"mousedown", function(){this.controller.get('friend-map').addClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-map'),"mouseup", function(){this.controller.get('friend-map').removeClassName("pressed");}.bind(this));
	Mojo.Event.listen(this.controller.get('friend-map'),Mojo.Event.tap, this.showMap.bind(this));

	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
		this.doc=cardStageController.document;

    this.doc.addEventListener("shaking",this.handleShake.bind(this), true);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandler.bindAsEventListener(this));
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandler.bindAsEventListener(this));
    this.doc.addEventListener("keyup", this.keyUpHandler.bind(this), true);


	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
        
    
        this.controller.setupWidget("drawerId",
         this.drawerAttributes = {
             modelProperty: 'open',
             unstyled: false
         },
         this.drawerModel = {
             open: false
         });


    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
	    _globals.cmmodel
	);

    
    _globals.ammodel.items[0].disabled=false;
	this.controller.modelChanged(_globals.ammodel);

    this.controller.get("message").hide();
    this.controller.get("fsearchgroup").show();
    this.getFeed();

}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}
FriendsListAssistant.prototype.groupVenues = function(data){
	return data.grouping;
}

FriendsListAssistant.prototype.getFriends = function() {
	this.controller.get('message').innerHTML += '<br/>Friends Venues...';
	
	if(_globals.friendList==undefined || _globals.reloadFriends==true) {
		_globals.reloadFriends=false;
		_globals.friendList=undefined;
		var url = 'http://api.foursquare.com/v1/friends.json';
		auth = _globals.auth;
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: auth}, 
		   parameters: {},
		   onSuccess: this.getFriendsSuccess.bind(this),
		   onFailure: this.getFriendsFailed.bind(this)
		 });
	}else{
		if(this.showList){
			var l=_globals.friendList;
			this.controller.get("fmenu-caption").update("List");
		}
		if(this.showPending){
			var l=_globals.requestList;
			this.controller.get("fmenu-caption").update("Pending");
			if(l==undefined){this.onPendingFriends();}
		}
		if(this.showFeed){
			var l=_globals.feedList;
			this.controller.get("fmenu-caption").update("Feed");
			if(l==undefined){this.getFeed();}
		}
		this.resultsModel.items=l;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}
}



FriendsListAssistant.prototype.onKeyPressHandler = function(event) {
	var char = String.fromCharCode(event.originalEvent.keyCode);
	this.firstChar=char;
	Mojo.Log.error("press keycode="+event.originalEvent.keyCode+", value="+this.textModel.value);
	if(!this.searchShowing){
		Mojo.Log.error("notshowing yet");
		this.searchShowing=true;
		this.controller.get("sendField").show();
		this.controller.get("sendField").mojo.focus();		
		if(!this.searchHasShown){
		//	this.textModel.value=char;
		//	this.controller.modelChanged(this.textModel);
		}
		this.searchHasShown=true;
	}else{
		Mojo.Log.error("showing");
	}
}

FriendsListAssistant.prototype.keyDownHandler = function(event) {
	var char = String.fromCharCode(event.originalEvent.keyCode);
	Mojo.Log.error("down keycode="+event.originalEvent.keyCode+", value="+this.textModel.value);
	if(this.controller.get("sendField").mojo.getValue()==char){
		event.stop();
		Mojo.Log.error("stopped");
	}

}	
FriendsListAssistant.prototype.keyUpHandler = function(event) {
	var code=event.keyCode; //event.originalEvent.keyCode;
	Mojo.Log.error("up keycode="+event.keyCode+", value="+this.textModel.value);
	if(this.textModel.value.length<2 && code==8){
		this.searchShowing=false;
		this.controller.get("sendField").mojo.blur();
    	setTimeout(function(){this.controller.get("sendField").hide();}.bind(this),5);
	}
    if(Mojo.Char.isEnterKey(code)) {
        if(event.srcElement.parentElement.id=="sendField") {
	   		setTimeout(this.onSearchFriends.bind(this), 10);
   			this.controller.get("sendField").hide();
   			this.searchShowing=false;
   			this.searchHasShown=false;
        }
     }

}



/*
this funciton gets called when the getfriendslist ajax is successful.
it loads the friend names and icons into the list, then sets the global var for total count of friends
and the fires off the loop that gets the details of each friend
*/
FriendsListAssistant.prototype.getFriendsSuccess = function(response) {

	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.friendList = [];
		this.looping=false;
		
		if(response.responseJSON.friends != undefined) {
			for(var f=0;f<response.responseJSON.friends.length;f++) {
				this.friendList.push(response.responseJSON.friends[f]);
			}
		}
		_globals.friendList=this.friendList;
		this.resultsModel.items =this.friendList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		
		
		//now start that loop!
		this.totalfriends=response.responseJSON.friends.length;
		this.onfriend=0;
		
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';


		this.getFriendsInfo();
		

	}
	

}

FriendsListAssistant.prototype.relativeTime = function(offset){
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


FriendsListAssistant.prototype.getFriendsInfo = function() {
	if(this.onfriend < this.totalfriends){ //array is zero-based, so it'll never equal total number. 
		
		
					var url = 'http://api.foursquare.com/v1/user.json';
					auth = _globals.auth;
					var theuser=this.friendList[this.onfriend].id;
					var request = new Ajax.Request(url, {
					   method: 'get',
					   evalJSON: 'force',
					   requestHeaders: {"user-agent":"Foursquare for webOS/"+Mojo.appInfo.version,Authorization: auth}, 
					   parameters: {uid: theuser,badges: '1', mayor: '1'},
					   onSuccess: function(uresponse){
					   	//here's an idea -- let's cache user info so it doesn't kill our rate limit
					   	//gonna store the response object in a global array.
					   	//all user-related methods will then check the array and only download
					   	//if necessary. this should have been a multiline comment.
					   //	_globals.userCache[this.friendList[this.onfriend].id]=uresponse;
					   //to be continued...more of a pain in the ass than expected
					   
						if(uresponse.responseJSON.user.checkin != undefined) {
							this.friendList[this.onfriend].checkin=(uresponse.responseJSON.user.checkin.venue != undefined)? "@ "+uresponse.responseJSON.user.checkin.venue.name: "";
							this.friendList[this.onfriend].shout=(uresponse.responseJSON.user.checkin.shout != undefined)? "\n"+uresponse.responseJSON.user.checkin.shout: "";
							this.friendList[this.onfriend].geolat=(uresponse.responseJSON.user.checkin.venue != undefined)? uresponse.responseJSON.user.checkin.venue.geolat: "0";
							this.friendList[this.onfriend].geolong=(uresponse.responseJSON.user.checkin.venue != undefined)? uresponse.responseJSON.user.checkin.venue.geolong: "0";
							
							//handle time
						   if(uresponse.responseJSON.user.checkin.created != undefined) {
						    var now = new Date;
						    var later = new Date(uresponse.responseJSON.user.checkin.created);
						    var offset = later.getTime() - now.getTime();
							this.friendList[this.onfriend].when=this.relativeTime(offset) + " ago";
						   }else{
						   	this.friendList[this.onfriend].when="";
						   }
							
			   				_globals.friendList=this.friendList;
							this.resultsModel.items =this.friendList;// $A(venueList);
							this.controller.modelChanged(this.resultsModel);
						}
							this.onfriend++;
							this.getFriendsInfo();
					   }.bind(this),
					   onFailure: this.getUserInfoFailed.bind(this)
					 });
					 
	}else{
	
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';

	}
}
FriendsListAssistant.prototype.getUserInfoFailed = function(event) {
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';

}
FriendsListAssistant.prototype.getFriendsFailed = function(event) {
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		mybutton = this.controller.get('go_twitter_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';

}

FriendsListAssistant.prototype.onSearchFriends = function(event) {
  //gotta figure out how we're searching
  //text/mixed-data string means username search. numeric string means phone number search
  var how;
  if (this.textModel.value == parseFloat(this.textModel.value)) {
  	//it's numeric
  	how="phone";
  }else{
  	//not numeric
  	how="name";
  }
  
  this.searchFriends(how);
}

FriendsListAssistant.prototype.handleShake = function(event) {
	if(event.magnitude>2){
		this.hardRefresh();
	}
}


FriendsListAssistant.prototype.onSearchTwitterFriends = function(event) {
  this.searchFriends("twitter");
}

FriendsListAssistant.prototype.searchFriends = function(how) {
	var what=(how=="twitter")? {}: {q: this.textModel.value};
	var url = 'http://api.foursquare.com/v1/findfriends/by'+how+'.json';
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

FriendsListAssistant.prototype.onPendingFriends = function(event) {
	if(this.requestList==undefined) {
	
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
		this.resultsModel.items =this.requestList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		var mybutton = this.controller.get('go_pending_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';
	}
	
}

FriendsListAssistant.prototype.searchFriendsSuccess = function(response) {

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
			}
		}
		this.resultsModel.items =this.searchList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		this.controller.get('mainfeed').show();
		
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		mybutton = this.controller.get('go_twitter_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';
			var userlinks=zBar.getElementsByClassName(".userLink",this.controller.get("resultListBox"));
			for(var e=0;e<userlinks.length;e++) {
				var eid=userlinks[e].id;
				Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo);
				Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
			}

	}
		

}

FriendsListAssistant.prototype.requestFriendsSuccess = function(response) {
	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.requestList = [];
		this.looping=false;
		
		if(response.responseJSON.requests != undefined && response.responseJSON.requests != null && response.responseJSON.requests.length>0) {
			for(var f=0;f<response.responseJSON.requests.length;f++) {
				this.requestList.push(response.responseJSON.requests[f]);
			}
			_globals.requestList=this.requestList;
			this.resultsModel.items =this.requestList; //update list with basic user info
			this.controller.modelChanged(this.resultsModel);
			this.controller.get('resultListBox').style.display = 'block';
		}else{
			this.controller.get("search-msg").innerHTML="No pending friend requests.";
			this.controller.get('resultListBox').style.display = 'none';
		}
		
		
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		mybutton = this.controller.get('go_twitter_button');
		mybutton.mojo.deactivate();
		mybutton = this.controller.get('go_pending_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();

	}
		

}

FriendsListAssistant.prototype.showMap = function(event) {
		this.controller.stageController.pushScene({name: "friends-map", transition: Mojo.Transition.crossFade,disableSceneScroller:true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this);

}
FriendsListAssistant.prototype.hardRefresh = function(event) {
	_globals.friendList=undefined;
	this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},this.auth,_globals.userData,this.username,this.password,this.uid,this.lat,this.long,this);
}

FriendsListAssistant.prototype.listWasTapped = function(event) {
	
	//see if there's a link in the shout
	var shout=event.item.shout || "";
	var urlmatch=/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	
	

	if(shout.match(urlmatch)) {
		var url=RegExp['$&'];
					this.controller.popupSubmenu({
			             onChoose:function(choice){
			             	switch(choice){
			             		case "url":
			             			this.controller.serviceRequest('palm://com.palm.applicationManager', {
										 method: 'open',
										 parameters: {
											 target: url
										 }
									 });
			             			break;
			             		case "profile":
			             			this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade, disableSceneScroller: false},this.auth,event.item.id,null,true);
			             			break;
			             	}
			             }.bind(this),
            			 placeNear:this.controller.get(event.target),
			             items: [{label: event.item.firstname+"'s Profile", command: 'profile'},
				           {label: url.substr(0,20)+"...", command: 'url'}]
		             });
			
	}else{
		this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade, disableSceneScroller: false},this.auth,event.item.id,null,true);
	}
}

FriendsListAssistant.prototype.popupChoose = function(event) {
		var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
	switch(event){
	            case "friend-search":
	            	var os=this.controller.get("drawerId").mojo.getOpenState();
	            	if(os){
		            	this.controller.get("fmenu-caption").update(this.oldCaption);
	            	}else{
	            		this.controller.get("fmenu-caption").update("Search");
	            	}
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.controller.get("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
                	break;
				case "friend-map":
					this.oldCaption="Map";
					var what=this.controller.get("fmenu-caption").innerHTML;
	            	this.controller.get("fmenu-caption").update("Map");
					this.controller.stageController.swapScene({name: "friends-map", transition: Mojo.Transition.crossFade,disableSceneScroller:true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this,what);
					break;
				case "friends-list":
					this.oldCaption="List";
					this.setBools("list");
	            	this.controller.get("fmenu-caption").update("List");
					this.controller.get("drawerId").mojo.setOpenState(false);
					if(_globals.friendList==undefined) {
						this.getFriends();
					}else{
					
						this.resultsModel.items =_globals.friendList;
						this.controller.modelChanged(this.resultsModel);
						this.controller.get('resultListBox').style.display = 'block';
					}
					this.controller.get("search-msg").innerHTML="";
					break;
				case "friends-pending":
					this.oldCaption="Pending";
					this.setBools("pending");
	            	this.controller.get("fmenu-caption").update("Pending");
	            	this.controller.get("search-msg").innerHTML="";
	            	this.onPendingFriends();
					break;
				case "friends-feed":
					this.oldCaption="Feed";
					this.setBools("feed");
	            	this.controller.get("fmenu-caption").update("Feed");
					this.controller.get('resultListBox').style.display = 'block';
					this.controller.get("search-msg").innerHTML="";
					this.getFeed();
					break;
	}
}

FriendsListAssistant.prototype.setBools = function(what) {
	this.showFeed=(what=="feed")? true: false;
	this.showList=(what=="list")? true: false;
	this.showPending=(what=="pending")? true: false;
	this.showSearch=(what=="search")? true: false;
}

FriendsListAssistant.prototype.getFeed = function(event) {
	if(this.feedList==undefined) {
		_globals.reloadFriends=false;
		_globals.friendList=undefined;
	var url = 'http://api.foursquare.com/v1/checkins.json';
	auth = _globals.auth;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth},
	   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude},
	   onSuccess: this.feedSuccess.bind(this),
	   onFailure: this.getFriendsFailed.bind(this)
	 });
	}else{
		if(this.showList){
			var l=_globals.friendList;
			this.controller.get("fmenu-caption").update("List");
			if(l==undefined){this.getFriends();}
		}
		if(this.showPending){
			var l=_globals.requestList;
			this.controller.get("fmenu-caption").update("Pending");
			if(l==undefined){this.onPendingFriends();}
		}
		if(this.showFeed){
			var l=_globals.feedList;
			this.controller.get("fmenu-caption").update("Feed");
		}
		this.resultsModel.items=l;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;

		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';
	}
	
}

FriendsListAssistant.prototype.feedSuccess = function(response) {
	if (response.responseJSON == undefined) {
		this.controller.get('message').innerHTML = 'No Results Found';
		Mojo.Log.error("undefined feed stuffs");
	}
	else {
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.feedList = [];
		this.looping=false;
		if(response.responseJSON.checkins != undefined && response.responseJSON.checkins != null && response.responseJSON.checkins.length>0) {
			for(var f=0;f<response.responseJSON.checkins.length;f++) {
				this.feedList.push(response.responseJSON.checkins[f]);
				this.feedList[f].id=response.responseJSON.checkins[f].user.id;
				this.feedList[f].idx=f;
				this.feedList[f].firstname=response.responseJSON.checkins[f].user.firstname;
				this.feedList[f].lastname=response.responseJSON.checkins[f].user.lastname;
				this.feedList[f].photo=response.responseJSON.checkins[f].user.photo;
				this.feedList[f].checkin=(response.responseJSON.checkins[f].venue != undefined)? response.responseJSON.checkins[f].venue.name: "";
				this.feedList[f].at=(response.responseJSON.checkins[f].venue != undefined)? "@ ": "";
				this.feedList[f].geolat=(response.responseJSON.checkins[f].venue != undefined)? response.responseJSON.checkins[f].venue.geolat: "";
				this.feedList[f].geolong=(response.responseJSON.checkins[f].venue != undefined)? response.responseJSON.checkins[f].venue.geolong: "";
				
				this.feedList[f].shout=(response.responseJSON.checkins[f].shout != undefined)? "\n"+response.responseJSON.checkins[f].shout: "";
				var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
				this.feedList[f].shout=this.feedList[f].shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
				
				this.feedList[f].mayorcrown=(response.responseJSON.checkins[f].ismayor=="true")? '<img src="images/crown_smallgrey.png"/> ': "";
				
				//handle time
				if(response.responseJSON.checkins[f].created != undefined) {
					var now = new Date;
					var later = new Date(response.responseJSON.checkins[f].created);
					var offset = later.getTime() - now.getTime();
					this.feedList[f].when=this.relativeTime(offset) + " ago";
					
					//group this based on time
					var minsago=(Math.abs(offset)/1000)/60;
					logthis("minsago="+minsago);
					if(minsago<=180){
						this.feedList[f].grouping="Recently";
					}else if(minsago>180 && later.getMonth()==now.getMonth() && later.getDate()==now.getDate()){
						this.feedList[f].grouping="Earlier Today";
					}else if((Math.abs(offset)/1000)/86400>30){ //more than 30 days ago
						this.feedList[f].grouping="A Long, Long Time Ago...";
					}else{
						this.feedList[f].grouping="Older";
					}
				}else{
					this.feedList[f].when="";
				}
				
				
			}
			_globals.feedList=this.feedList;
			this.resultsModel.items =this.feedList; //update list with basic user info
			this.controller.modelChanged(this.resultsModel);
			this.controller.get('resultListBox').style.display = 'block';
			
			
			var userlinks=zBar.getElementsByClassName(".userLink",this.controller.get("resultListBox"));
			for(var e=0;e<userlinks.length;e++) {
				var eid=userlinks[e].id;
				Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo);
				Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
			}
			var venuelinks=zBar.getElementsByClassName(".venueLink",this.controller.get("resultListBox"));
			for(var e=0;e<venuelinks.length;e++) {
				var eid=venuelinks[e].id;
				Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showVenueInfo);
				Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showVenueInfo.bind(this));
				Mojo.Log.error("#########added event to "+eid)
			}

		}else{
			this.controller.get("search-msg").innerHTML="No recent check-ins";
			this.controller.get('resultListBox').style.display = 'none';
		}
		
		
		var mybutton = this.controller.get('go_button');
		mybutton.mojo.deactivate();
		mybutton = this.controller.get('go_twitter_button');
		mybutton.mojo.deactivate();
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';

	}
		

}

FriendsListAssistant.prototype.showUserInfo = function(event) {
	var uid=event.target.readAttribute("data");
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},this.auth,uid,null,true);
}

FriendsListAssistant.prototype.showVenueInfo = function(event){
	var vid=event.target.readAttribute("data");
	Mojo.Log.error("venue clicked: "+vid);
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},this.feedList[vid].venue,_globals.username,_globals.password,_globals.uid,true);

}

FriendsListAssistant.prototype.showMenu = function(event){
					this.controller.popupSubmenu({
			             onChoose:this.popupChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [{secondaryIconPath: 'images/feed.png',label: 'Feed', command: 'friends-feed'},
				           {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'friend-map'},
            	           {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'friend-search'},
                	       {secondaryIconPath: 'images/friends-black.png',label: 'Friends List', command: 'friends-list'},
                    	   {secondaryIconPath: 'images/clock.png',label: 'Pending Requests', command: 'friends-pending'}]
		             });
}


FriendsListAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "friend-search":
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.controller.get("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
                	break;
				case "friend-map":
					this.controller.stageController.swapScene({name: "friends-map", transition: Mojo.Transition.crossFade},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this);
					break;
				case "friends-list":
					this.controller.get("drawerId").mojo.setOpenState(false);
					this.resultsModel.items =this.friendList;
					this.controller.modelChanged(this.resultsModel);
					break;
				case "do-Venues":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
					break;
				case "do-Friends":
					break;
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.friendList=undefined;
					this.getFriends();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
            }
        }
    }

FriendsListAssistant.prototype.doShout = function(event) {
	this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},_globals.auth,"",this);
}

FriendsListAssistant.prototype.activate = function(event) {
    this.controller.get("sendField").mojo.blur();
	this.controller.window.setTimeout(function(){_globals.GPS.stop();}.bind(this),5000);

	if(_globals.friendList!=undefined) {
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get('resultListBox').style.display = 'block';
	}
	if(this.showSearch) {
		var scroller = this.controller.getSceneScroller();
		scroller.mojo.revealTop(0);
		this.controller.get("drawerId").mojo.setOpenState(true);
		this.controller.modelChanged(this.drawerModel);
	}
	
	if(_globals.reloadFriends) {
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.friendList=undefined;
					this.getFriends();
	
	}
}


FriendsListAssistant.prototype.deactivate = function(event) {
}

FriendsListAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('go_button'),Mojo.Event.tap, this.onSearchFriends.bind(this));
	Mojo.Event.stopListening(this.controller.get('go_twitter_button'),Mojo.Event.tap, this.onSearchTwitterFriends.bind(this));
	Mojo.Event.stopListening(this.controller.get('fmenu'),Mojo.Event.tap, this.showMenu.bind(this));
//	Mojo.Event.listen(this.controller.get('results-friends-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),"mousedown", function(){this.controller.get('friend-refresh').addClassName("pressed");}.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),"mouseup", function(){this.controller.get('friend-refresh').removeClassName("pressed");}.bind(this));
//	Mojo.Event.listen(this.controller.get('friend-refresh'),Mojo.Event.tap, this.hardRefresh.bind(this));

	Mojo.Event.stopListening(this.controller.get('friend-shout'),"mousedown", function(){this.controller.get('friend-shout').addClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-shout'),"mouseup", function(){this.controller.get('friend-shout').removeClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-shout'),Mojo.Event.tap, this.doShout.bind(this));



	Mojo.Event.stopListening(this.controller.get('mainfeed'),Mojo.Event.tap, this.hardRefresh.bind(this));

	Mojo.Event.stopListening(this.controller.get('friend-map'),"mousedown", function(){this.controller.get('friend-map').addClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-map'),"mouseup", function(){this.controller.get('friend-map').removeClassName("pressed");}.bind(this));
	Mojo.Event.stopListening(this.controller.get('friend-map'),Mojo.Event.tap, this.showMap.bind(this));
    this.doc.removeEventListener("shaking",this.handleShake.bind(this), true);
	this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.onKeyPressHandler.bindAsEventListener(this));
	this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandler.bindAsEventListener(this));
    this.doc.removeEventListener("keyup", this.keyUpHandler.bind(this), true);
}
