function VenuedetailAssistant(venue,u,p,i) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.venue=venue;
	   this.username=u;
	   this.password=p;
	   this.uid=i;
}

VenuedetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	$("snapMayor").hide();
	//$("snapTips").hide(); //keep it visible -- that way the Add Tip button can be there
	$("checkinVenueName").innerHTML=this.venue.name;
	$("checkinVenueAddress").innerHTML=this.venue.address;
	if (this.venue.crossstreet) {
	 $("checkinVenueAddress").innerHTML += "<br/>(at "+this.venue.crossstreet+")";
	}
	var query=encodeURIComponent(this.venue.address+' '+this.venue.city+', '+this.venue.state);
	$("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+this.venue.geolat+","+this.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	
	
	
	
	
	
	
	
	this.getVenueInfo();
	
			/* setup widgets here */
	    this.controller.setupWidget("detailScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
             snapElements: {'y': [$("snapMap"),$("snapMayor"),$("snapTips"),$("snapTags"),$("snapInfo")]}
         });

	
    this.controller.setupWidget("venueSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

    this.controller.setupWidget("buttonAddTip",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add Tip",
            disabled: false
        });
    this.controller.setupWidget("buttonAddTodo",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add To-do",
            disabled: false
        });

	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen($("docheckin"),Mojo.Event.tap,this.promptCheckin.bind(this));
	
	/*var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
	}*/
	
	Mojo.Event.listen($("buttonAddTip"),Mojo.Event.tap, this.handleAddTip.bind(this));
	Mojo.Event.listen($("buttonAddTodo"),Mojo.Event.tap, this.handleAddTodo.bind(this));

}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

VenuedetailAssistant.prototype.getVenueInfo = function() {
	var url = 'http://api.foursquare.com/v1/venue.json';
	auth = make_base_auth(this.username, this.password);
	Mojo.Log.error("un="+this.username);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {vid:this.venue.id},
	   onSuccess: this.getVenueInfoSuccess.bind(this),
	   onFailure: this.getVenueInfoFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	
	//mayorial stuff
	if(response.responseJSON.venue.stats.mayor != undefined) { //venue has a mayor
		$("snapMayor").show();
		$("mayorPic").src=response.responseJSON.venue.stats.mayor.user.photo;
		$("mayorPic").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		$("mayorPicBorder").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		
		var lname=(response.responseJSON.venue.stats.mayor.user.lastname != undefined)? response.responseJSON.venue.stats.mayor.user.lastname: '';
		$("mayorName").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		$("mayorName").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		var mInfo;
		switch(response.responseJSON.venue.stats.mayor.user.gender) {
			case "male":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="He's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			case "female":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="She's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			default:
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="They've checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
		}
		$("mayorInfo").innerHTML=mInfo;
		
	}
	
	
	//tips stuff
	if(response.responseJSON.venue.tips != undefined) {
		$("snapTips").show();
		var tips='';
		for (var t=0;t<response.responseJSON.venue.tips.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var tip=response.responseJSON.venue.tips[t].text;
			var created=response.responseJSON.venue.tips[t].created;
			var tlname=(response.responseJSON.venue.tips[t].user.lastname != undefined)? response.responseJSON.venue.tips[t].user.lastname : '';
			var username=response.responseJSON.venue.tips[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.tips[t].user.photo;
			var uid=response.responseJSON.venue.tips[t].user.id;

			tips+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink" data="'+uid+'"/> <span class="venueTipUser userLink" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+tip+'</span></div>'+"\n";
		}
		$("venueTips").update(tips);
	}

	//who's here? stuff
	if(response.responseJSON.venue.checkins != undefined) {
		$("snapUsers").show();
		var users='';
		for (var t=0;t<response.responseJSON.venue.checkins.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var shout=(response.responseJSON.venue.checkins[t].shout != undefined)? response.responseJSON.venue.checkins[t].shout: "";
			var created=response.responseJSON.venue.checkins[t].created;
			var tlname=(response.responseJSON.venue.checkins[t].user.lastname != undefined)? response.responseJSON.venue.checkins[t].user.lastname : '';
			var username=response.responseJSON.venue.checkins[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.checkins[t].user.photo;
			var uid=response.responseJSON.venue.checkins[t].user.id;

			users+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink" data="'+uid+'"/> <span class="venueTipUser userLink" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+shout+'</span></div>'+"\n";
		}
		$("venueUsers").update(users);
	}else{
		$("snapUsers").hide();
	}
	
	
	//venue info stuff
	var totalcheckins=response.responseJSON.venue.stats.checkins;
	var beenhere=response.responseJSON.venue.stats.beenhere.me;
	var twitter=response.responseJSON.venue.twitter;
	var phone=response.responseJSON.venue.phone;
	var tags=response.responseJSON.venue.tags;
		Mojo.Log.error("phone="+phone);

	var vinfo='';
	var s=(totalcheckins != 1)? "s" :"";
	if (totalcheckins>0) {
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has been visited '+totalcheckins+' time'+s+' ';
		vinfo+=(beenhere)? 'and you\'ve been here before': 'but you\'ve never been here';
		vinfo+='.<br/>';
	}else{
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has never been visited! Be the first to check-in!<br/>';	
	}
	vinfo+=(twitter != undefined)? '<img src="images/bird.png" width="20" height="20" /> <a href="http://twitter.com/'+twitter+'">@'+twitter+'</a><br/>': '';
	vinfo+=(phone != undefined)? '<img src="images/phone.png" width="20" height="20" /> <a href="tel://'+phone+'">'+phone+'</a><br/>': '';
	Mojo.Log.error("vnfo="+vinfo);
	$("venueInfo").innerHTML=vinfo;
	
	//tags
	if(tags != undefined) {
		var vtags='';
		for(var t=0;t<tags.length;t++) {
			vtags+='<span class="vtag">'+tags[t]+'</span> ';
		}
		$("venueTags").innerHTML=vtags;
	}else{
		$("snapTags").hide();
	}
	
	
	$("venueScrim").hide();
	$("venueSpinner").mojo.stop();
	$("venueSpinner").hide();
	
	
	
	//atatch events to any new user links
	var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.showUserInfo);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

}



VenuedetailAssistant.prototype.getVenueInfoFailed = function(response) {
	Mojo.Log.error("############error!");
	Mojo.Controller.getAppController().showBanner("Error getting the venue's info", {source: 'notification'});
}
var checkinDialog;


VenuedetailAssistant.prototype.promptCheckin = function(event) {
/*	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				Mojo.Log.error("#######click yeah");
				this.checkIn(this.venue.id, this.venue.name,'','','0');
			}
		},
		title:"Foursquare Check In",
		message:"Go ahead and check-in here?",
		cancelable:true,
		choices:[ {label:'Yeah!', value:true, type:'affirmative'}, {label:'Eh, nevermind.', value:false, type:'negative'} ]
	});*/
		checkinDialog = this.controller.showDialog({
		template: 'listtemplates/do-checkin',
		assistant: new DoCheckinDialogAssistant(this,this.venue.id,this.venue.name)
	});

}

VenuedetailAssistant.prototype.checkIn = function(id, n, s, sf, t) {
	Mojo.Log.error("###check in please??");
	if (auth) {
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: auth
			},
			parameters: {
				vid: id,
				shout: s,
				private: sf,
				twitter: t
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
}

VenuedetailAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	
	var json=response.responseJSON;
		Mojo.Log.error("^^^^^^^^^^^^^^^^made it here...");
	checkinDialog.mojo.close();
	//checkinDialog=null;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/checkin-info',
		assistant: new CheckInDialogAssistant(this, json,this.uid)
	});
}

VenuedetailAssistant.prototype.checkInFailed = function(response) {
	Mojo.Log.error('Check In Failed: ' + repsonse.responseText);
	Mojo.Controller.getAppController().showBanner("Error checking in!", {source: 'notification'});
}


VenuedetailAssistant.prototype.handleAddTip=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"tip")
	});

}
VenuedetailAssistant.prototype.handleAddTodo=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"todo")
	});

}

VenuedetailAssistant.prototype.showUserInfo = function(event) {
	Mojo.Log.error("############user info! the uid="+event.target.readAttribute("data")+",target="+event.target.id);
	var thisauth=auth;
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,event.target.readAttribute("data"));

}

VenuedetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	
}


VenuedetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

VenuedetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
