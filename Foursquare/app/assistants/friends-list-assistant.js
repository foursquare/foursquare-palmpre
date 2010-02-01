function FriendsListAssistant(a, ud, un, pw,i,la,lo,ps,ss) {
	 this.auth = _globals.auth;
	 this.userData = ud;
	 this.username=un;
	 this.password=pw;
	 this.uid=i;
	 this.lat=la;
	 this.long=lo;
	 this.prevScene=ps;
	 this.showSearch=ss;
}

FriendsListAssistant.prototype.setup = function() {
	//Create the attributes for the textfield
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
	//Create the model for the text field
	this.textModel = {
		value : ''
	};
	
	this.resultsModel = {items: [], listTitle: $L('Results')};
	//Setup the textfield widget and observer
	this.controller.setupWidget('sendField', this.textFieldAtt, this.textModel);
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('results-friends-list', 
					      {itemTemplate:'listtemplates/friendItems',dividerTemplate: 'listtemplates/dividertemplate'},
					      this.resultsModel);

	//Set up button handlers
	this.buttonModel1 = {
		buttonLabel : 'Find Friends',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_button',this.buttonAtt1,this.buttonModel1);
	
	//Set up button handlers
	this.buttonModelT = {
		buttonLabel : 'Find Friends via Twitter',
		buttonClass : '',
		disable : false
	}
	this.buttonAttT = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_twitter_button',this.buttonAttT,this.buttonModelT);

	//Set up button handlers
	this.buttonModelP = {
		buttonLabel : 'Show Pending Requests',
		buttonClass : '',
		disable : false
	}
	this.buttonAttP = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_pending_button',this.buttonAttP,this.buttonModelP);


	this.avbuttonModel1 = {
		buttonLabel : 'Add New Venue',
		buttonClass : '',
		disable : false
	}
	this.avbuttonAtt1 = {
	}
	

	
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.onSearchFriends.bind(this));
	Mojo.Event.listen(this.controller.get('go_twitter_button'),Mojo.Event.tap, this.onSearchTwitterFriends.bind(this));
	Mojo.Event.listen(this.controller.get('go_pending_button'),Mojo.Event.tap, this.onPendingFriends.bind(this));
	Mojo.Event.listen(this.controller.get('results-friends-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));


    this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'blue-view-nope'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'map.png', command: 'friend-map', label: "  "},
                { label: "Friends", width: 200 ,command: 'friends-list'},
                { iconPath: 'search.png', command: 'friend-search', label: "  "}]
            }]
        });
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
        
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'blue-command-nope'
        },
     _globals.cmmodel);
    
    
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


    
    _globals.ammodel.items[0].disabled=false;
this.controller.modelChanged(_globals.ammodel);

    $("message").hide();
   // this.requestList=[];
    	       this.getFriends();

}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

FriendsListAssistant.prototype.getFriends = function() {
	$('message').innerHTML += '<br/>Friends Venues...';
	
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
		Mojo.Log.error("friends exist!");
		this.resultsModel.items=_globals.friendList;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}
}



/*
this funciton gets called when the getfriendslist ajax is successful.
it loads the friend names and icons into the list, then sets the global var for total count of friends
and the fires off the loop that gets the details of each friend
*/
FriendsListAssistant.prototype.getFriendsSuccess = function(response) {
	//var mybutton = $('go_button');
	//mybutton.mojo.deactivate();

	if (response.responseJSON == undefined) {
		$('message').innerHTML = 'No Results Found';
	}
	else {
		//$("spinnerId").mojo.stop();
		//$("spinnerId").hide();
		//$('resultListBox').style.display = 'block';
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
		
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';


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
					   requestHeaders: {"user-agent":"Foursquare for webOS/"+Mojo.appInfo.version,Authorization: auth}, //Not doing a search with auth due to malformed JSON results from it
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
							//$('whenfield'+uresponse.responseJSON.user.id).each(function(date) { new RelativeDate(date) });
							this.onfriend++;
							this.getFriendsInfo();
					   }.bind(this),
					   onFailure: this.getUserInfoFailed.bind(this)
					 });
					 
	}else{
	
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';

	}
}
FriendsListAssistant.prototype.getUserInfoFailed = function(event) {
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';

}
FriendsListAssistant.prototype.getFriendsFailed = function(event) {
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		mybutton = $('go_twitter_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';

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
	   requestHeaders: {Authorization: auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: what,
	   onSuccess: this.searchFriendsSuccess.bind(this),
	   onFailure: this.getFriendsFailed.bind(this)
	 });

	
}

FriendsListAssistant.prototype.onPendingFriends = function(event) {
	if(this.requestList==undefined) {
	
	//var what=(how=="twitter")? {}: {q: this.textModel.value};
	var url = 'http://api.foursquare.com/v1/friend/requests.json';
	auth = _globals.auth;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization: auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {},
	   onSuccess: this.requestFriendsSuccess.bind(this),
	   onFailure: this.getFriendsFailed.bind(this)
	 });
	}else{
		this.resultsModel.items =this.requestList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		var mybutton = $('go_pending_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';
		//Mojo.Controller.getAppController().showBanner("No pending requests", {source: 'notification'});
	}
	
}

FriendsListAssistant.prototype.searchFriendsSuccess = function(response) {
	//var mybutton = $('go_button');
	//mybutton.mojo.deactivate();

	if (response.responseJSON == undefined) {
		$('message').innerHTML = 'No Results Found';
	}
	else {
		//$("spinnerId").mojo.stop();
		//$("spinnerId").hide();
		//$('resultListBox').style.display = 'block';
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
		
		
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		mybutton = $('go_twitter_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';

	}
		

}

FriendsListAssistant.prototype.requestFriendsSuccess = function(response) {
	//var mybutton = $('go_button');
	//mybutton.mojo.deactivate();

	if (response.responseJSON == undefined) {
		$('message').innerHTML = 'No Results Found';
	}
	else {
		//$("spinnerId").mojo.stop();
		//$("spinnerId").hide();
		//$('resultListBox').style.display = 'block';
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.requestList = [];
		this.looping=false;
		
		if(response.responseJSON.requests != undefined && response.responseJSON.requests != null) {
			for(var f=0;f<response.responseJSON.requests.length;f++) {
				this.requestList.push(response.responseJSON.requests[f]);
			}
			this.resultsModel.items =this.requestList; //update list with basic user info
			this.controller.modelChanged(this.resultsModel);
		}else{
			$("results-friends-list").innerHTML="No pending friend requests.";
		}
		
		
		var mybutton = $('go_button');
		mybutton.mojo.deactivate();
		mybutton = $('go_twitter_button');
		mybutton.mojo.deactivate();
		mybutton = $('go_pending_button');
		mybutton.mojo.deactivate();
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';

	}
		

}


FriendsListAssistant.prototype.listWasTapped = function(event) {
	
	/*this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.checkIn(event.item.id, event.item.name);
			}
		},
		title:"Foursquare Check In",
		message:"Do you want to check in here?",
		cancelable:true,
		choices:[ {label:'Yes', value:true, type:'affirmative'}, {label:'No', value:false, type:'negative'} ]
	});
	*/
	
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade, disableSceneScroller: false},this.auth,event.item.id);
}




FriendsListAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "friend-search":
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					$("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
                	break;
				case "friend-map":
					this.controller.stageController.swapScene({name: "friends-map", transition: Mojo.Transition.crossFade},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this);
					break;
				case "friends-list":
					$("drawerId").mojo.setOpenState(false);
					this.resultsModel.items =this.friendList;
					this.controller.modelChanged(this.resultsModel);
					break;
				case "do-Venues":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid);
					//this.prevScene.cmmodel.items[0].toggleCmd="do-Nothing";
				    //this.prevScene.controller.modelChanged(this.prevScene.cmmodel);

					//this.controller.stageController.popScene("friends-list");
					break;
				case "do-Friends":
                	//var thisauth=auth;
					//this.controller.stageController.pushScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid);
					break;
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
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
                	$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
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


FriendsListAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	 //  	   this.cmmodel.items[0].toggleCmd="do-Nothing";
	   //this.controller.modelChanged(this.cmmodel);
	if(_globals.friendList!=undefined) {
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$('resultListBox').style.display = 'block';
	}
	if(this.showSearch) {
		var scroller = this.controller.getSceneScroller();
		scroller.mojo.revealTop(0);
		this.controller.get("drawerId").mojo.setOpenState(true);
		this.controller.modelChanged(this.drawerModel);
	}
	
	if(_globals.reloadFriends) {
                	$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
                	_globals.friendList=undefined;
					this.getFriends();
	
	}
}


FriendsListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FriendsListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
