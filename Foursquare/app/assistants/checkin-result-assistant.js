function CheckinResultAssistant( checkinJSON,i,isshout) {
	this.json=checkinJSON;
	this.uid=i;	
	this.isShout=isshout;
}

CheckinResultAssistant.prototype.aboutToActivate = function(callback){
	callback.defer();
};

CheckinResultAssistant.prototype.setup = function() {
		NavMenu.setup(this,{buttons:'empty'});

  this.controller.setupWidget("okButtonCheckin",
    this.attributes = {},
    this.OKButtonModel = {
      buttonLabel: "Sweet!",
      disabled: false
    }
  );
  
  	this.okTappedCheckinBound=this.okTappedCheckin.bindAsEventListener(this);
  	this.specialTappedBound=this.specialTapped.bindAsEventListener(this);
  	
	Mojo.Event.listen(this.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckinBound);
	Mojo.Event.listen(this.controller.get('special-unlocked'), Mojo.Event.tap, this.specialTappedBound);
/*	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("checkin-widgets").style.minHeight="247px;";
	}
	else{
	   this.controller.get("checkin-widgets").style.minHeight="327px"; //372
	}*/
	
	if(this.isShout){this.controller.get("result-header").update("SHOUTED!");}

	this.initData(this.json);
	
};

CheckinResultAssistant.prototype.specialTapped = function(event) {
	this.controller.get("special_overlay").show();
};

CheckinResultAssistant.prototype.initData = function(checkinJSON) {
//	checkinJSON.checkin.created="";
//logthis(Object.toJSON(checkinJSON.checkin));
	//set the title message
	this.controller.get('scores-box').innerHTML=" ";
	this.noscores=true;
	this.nomayor=true;
	this.notip=true;
	this.badgeHTML='';
	this.scoresHTML='';
	this.mayorHTML='';
	this.leaderboardHTML='';

	//parse array
	var notifs=checkinJSON.notifications;
	
	//var notifs=[{"type":"message","item":{"message":"OK! We've got you @ Test Venue. You've been here 10 times."}},{"type":"mayorship","item":{"type":"nochange","checkins":3,"message":"You're still the Mayor of Test Venue! (3 check-ins in the past two months)","image":"http://foursquare.com/img/crown.png"}},{"type":"badge","item":{"badge":{"id":"4c4f08667a0803bbb0202ab7","name":"Local","description":"You've been at the same place 3x in one week!","image":{"prefix":"http://foursquare.com/img/badge/","sizes":[57,114,300],"name":"/local.png"}}}},{"type":"score","item":{"scores":[{"points":1,"icon":"/img/scoring/2.png","message":"First stop tonight"}],"total":1}}];
	
	
	//{"type": "special", "item": {"special": {"id": "4d792ed14def2c0f79cd7780", "type": "count", "message": "Check-in to my boutique store and mention foursquare to me and\r\n I will give you a sample of my best hand made soap absolutely free!", "description": "It's your first time checking in here; you unlocked the Newbie Special!", "finePrint": "Unlocked 5/5/2011 4:23 AM", "unlocked": true, "icon": "newbie", "title": "Newbie Special", "state": "unlocked", "provider": "foursquare", "redemption": "standard"}}}


	for(var n=0;n<notifs.length;n++){
		logthis(Object.toJSON(notifs[n]));
		switch(notifs[n].type){
			case "special":
				if(notifs[n].item.special.state=="unlocked"){
					this.controller.get("specials-wrapper").show();
					this.specialUnlocked=notifs[n].item.special;
					
					this.controller.get("special-title").update(this.specialUnlocked.title+' <img src="https://foursquare.com/img/specials/'+this.specialUnlocked.icon+'.png">');
					this.controller.get("special-description").update(this.specialUnlocked.description);
					this.controller.get("special-message").update(this.specialUnlocked.message);
					this.controller.get("special-fine-print").update(this.specialUnlocked.finePrint);
				}
				break;
			case "message":
				this.controller.get('checkin-display').innerHTML=notifs[n].item.message;
				break;
			case "mayorship":
				this.nomayor=false;
				//handle different mayrship notification types
				switch(notifs[n].item.type){
					case "nochange":
												
						break;
					case "new":
						break;
					case "stolen":
						break;
				}
				//test days behind
				//notifs[n].item.daysBehind=10;
				
				this.mayorHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><div style="float: left;margin-left: 3px; width: 250px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+notifs[n].item.message+'</div><img src="'+notifs[n].item.image+'" width="48" height="48" style="float: right; padding-top:0px;margin-left: 5px;margin-right:2px"/><br class="breaker"/></div>';
				if(notifs[n].item.daysBehind){
					this.mayorHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><div style="float: left;margin-left: 3px; width: 250px; padding-top: 0px; padding-bottom:0px;font-size:16px;">You are now '+notifs[n].item.daysBehind+' days away from becoming the Mayor!</div><div class="days-away" style="float: right; padding-top:18px;margin-left: 5px;margin-right: 2px;width:48px;height:30px;font-size: 20px;color:#000;text-align:center;background:url(images/calendar.png) no-repeat left top;">'+notifs[n].item.daysBehind+'</div><br class="breaker"/></div>';
				}
				break;
			case "score": //{"type":"score","item":{"scores":[{"points":1,"icon":"/img/scoring/2.png","message":"First stop today"}],"total":1}}
				//var scores=notifs[n].item.scores;
				//var totalpoints=notifs[n].item.total;
				//this.noscores=false;
				break;
			case "badge":
				var badge=notifs[n].item.badge;
				var badge_name=badge.name;
				var badge_icon=badge.image.prefix+badge.image.sizes[0]+badge.image.name;
				var badge_text=badge.description;
				this.badgeHTML += 	'<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><div style="float: left;margin-left: 3px; width: 250px; padding-top: 0px; padding-bottom:0px;font-size:16px;"><b>You just unlocked the '+badge_name+' badge</b><br>'+badge_text+'</div><img src="'+badge_icon+'" width="48" height="48"  style="float: right; padding-top:0px;margin-left: 5px; margin-right" 2px;"/><br class="breaker"/></div>';
				
				break;
			case "tipAlert":
				this.notip=false;
				this.tip=notifs[n].item.tip;
				break;
			case "leaderboard":
				var msg=notifs[n].item.message;
				var lboard=notifs[n].item.leaderboard;
				logthis(Object.toJSON(lboard));
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
					
					this.leaderboardHTML+='<div class="result row" style="padding:0;padding-bottom:7px; padding-top: 3px;"><div class="lb-rank '+rankClass+'">#'+rank+'</div><div class="lb-photo"><img src="'+photo+'" width="32" height="32" class="friend-avatar"></div><div class="lb-name '+rankClass+'">'+uname+'</div><div class="lb-score '+rankClass+'">'+score+'</div><br class="breaker"></div>';
				}
				
				this.controller.get("leaderboard-note").innerHTML=msg;
				
				
				var scores=notifs[n].item.scores;
				var totalpoints=notifs[n].item.total;
				this.noscores=false;

				break;
		}
	}

	
	//set the individual scores - handle changes in JSON response...
	if(scores != undefined) {
		this.controller.get("scores-wrapper").show();
		//var totalpoints=0;
		for(var i = 0; i < scores.length; i++) {
			if (scores[i] != undefined) { 
				var imgpath = scores[i].icon; //(scores[i].icon.indexOf("http://")!=-1)? scores[i].icon: "http://foursquare.com"+scores[i].icon;
				var msg = '+' + scores[i].points + ' ' +scores[i].message;
				this.scoresHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+imgpath+'" width="20" height="20" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 240px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+scores[i].message+'</div><div style="float: left;margin-left: 3px; width: 40px; padding-right: 2px; font-size: 14px; font-weight: bold;text-align:right;">+'+scores[i].points+'</div><br class="breaker"/></div>';
//'<div class="palm-row single"><div class="checkin-score-item"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>';
			}
		}
		var totalPts = (totalpoints != 1)? totalpoints+' pts': totalpoints+' pt';
		//this.controller.get('score-title').innerHTML = "Score! That's " + totalPts+"!";
		this.controller.get('scores-total').innerHTML = "+" + totalpoints;
	}else{
		this.noscores=true;
		this.controller.get("scores-wrapper").hide();
	}
	
	this.controller.get("scores-box").update(this.scoresHTML);
	
	if(this.badgeHTML!=""){
		this.controller.get("badges-wrapper").show();
		this.controller.get("badges-box").update(this.badgeHTML);
	}

	if(this.mayorHTML!=""){
		this.controller.get("mayor-wrapper").show();
		this.controller.get("mayor-box").update(this.mayorHTML);
	}

	if(this.leaderboardHTML!=""){
		this.controller.get("leaderboard-wrapper").show();
		this.controller.get("leaderboard-box").update(this.leaderboardHTML);
	}

	


	//specials!
/*	if(checkinJSON.checkin.specials != undefined) {
	logthis("has specials");
		for(var b = 0; b < checkinJSON.checkin.specials.length;b++) {
			logthis("in loop");
			var special_type=checkinJSON.checkin.specials[b].type;
			var special_msg=checkinJSON.checkin.specials[b].message;
			var special_kind=checkinJSON.checkin.specials[b].kind;
			logthis("kind="+special_kind);
			var unlock_msg="";
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/crown_30x30.png\" width=\"22\" height=\"22\" /> Mayor Special";
					//detect if user is mayor
					if(!this.nomayor && special_kind!="nearby"){
						if(checkinJSON.checkin.mayor.message.indexOf('You')>-1 || checkinJSON.checkin.mayor.message.indexOf('Congratulations')>-1){
							//user is or just became the mayor
							this.ismayor=true;
							unlock_msg='<div class="special-unlocked">You\'ve unlocked this special!</div>';
						}else{
							this.ismayor=false;
							unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
						}
					}else{
						this.ismayor=false;
						unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
					}
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			var special_venue="";
			
			/*if(checkinJSON.checkin.specials[b].venue != undefined) { //not at this venue, but nearby
				spt=spt+" Nearby";
				special_venue="@ "+checkinJSON.checkin.specials[b].venue.name;
			}*/
			/*logthis("im here");
			if(special_kind=="nearby"){
				logthis("is nearby");
				spt=spt+" Nearby";
				special_venue="@ "+checkinJSON.checkin.specials[b].venue.name;
				logthis("set vars");
				this.controller.get("checkin_specials").hide();
				this.controller.get("nearby-special").show();
				logthis("set visibility");
				Mojo.Event.listen(this.controller.get("nearby-special"),Mojo.Event.tap,function(){
					this.controller.get("checkin_specials").toggle();
				}.bind(this));
				logthis("listening");
				Mojo.Animation.animateStyle(this.controller.get("nearby-special"),"top","linear",{from: -53, to: 0, duration: 1});
				logthis("animated");
			}

			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
			this.controller.get('checkin_specials').innerHTML += '<div class="checkin-special"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class="palm-list special-list"><div class="">'+special_msg+unlock_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>';
		}
	}*/

	
	//some checkins have a tips block. we should handle that
	//i'm guessing that this works... can't find a checkin in at all that handles this.
	//but @naveen insists a tips block is returned sometimes
	/*checkinJSON.checkin.tips=[
		{
			text: "This is a sample tip that pops-up when you check-in, if one of your friends was the one who created the tip.",
			user: {
				firstname: "Geoff",
				lastname: "G",
				photo: "http://playfoursquare.s3.amazonaws.com/userpix/74127_1256147747191.jpg"
			},
			id: 468853
		}
	];*/
if(1==1){	
	//checkinJSON.checkin.created="";
	if(!this.notip){
		logthis("there's a tip!");
	    this.controller.setupWidget("tipScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
         });

		  this.controller.setupWidget("buttonRemove",
		    this.attributes = {type : Mojo.Widget.activityButton},
		    this.removeModel = {
		      buttonLabel: "Remove from My To-Do List",
		      disabled: false,
		      buttonClass: 'secondary'
		    }
		  );
		
		  this.controller.setupWidget("buttonDone",
		    this.attributes = {type : Mojo.Widget.activityButton},
		    this.doneModel = {
		      buttonLabel: "I've Done This!",
		      disabled: false,
		      buttonClass: 'fsq-button'
		    }
		  );

  this.tipRemoveBound=this.tipRemove.bind(this);
  this.tipDoneBound=this.tipDone.bind(this);
 	Mojo.Event.listen(this.controller.get("buttonRemove"),Mojo.Event.tap,this.tipRemoveBound);
	Mojo.Event.listen(this.controller.get("buttonDone"),Mojo.Event.tap,this.tipDoneBound);

		//logthis(Object.toJSON(checkinJSON.checkin.tips);
		//if(checkinJSON.checkin.tips.length != undefined){
			//var tip=checkinJSON.checkin.tips[0];
			//this.tip=tip;
			var tip=this.tip;
			var here=false;
			if(tip.venue != undefined){
				var tipvenuename=tip.venue.name;
				var tipvenueid=tip.venue.id;
				if(tipvenueid==checkinJSON.response.checkin.venue.id){
					here=true;
				}
			}else{
				here=true;
				var tipvenuename=checkinJSON.response.checkin.venue.name;
			}
			var tiptext=tip.text;
			if(here){
				tiptext="Since you're at "+tipvenuename+": "+tiptext;
			}else{
				tiptext="Since you're so close to "+tipvenuename+": "+tiptext;
			}
			var tipuserfn=tip.user.firstName;
			var tipuserln=(tip.user.lastName!=undefined)? tip.user.lastName: "";
			var tipuserpic=tip.user.photo;
			
			/*this.controller.showAlertDialog({
				onChoose: function(value) {},
				title: $L(tipuserfn+" "+tipuserln+" says..."),
				message: $L(tiptext),
				choices:[
					{label:$L('Gotcha!'), value:"OK", type:'primary'}
				]
			});*/

			if(tip.status!=undefined){ //from a tip
				switch(tip.status){
					case "done":
						this.doneModel.disabled=true;
						this.controller.modelChanged(this.doneModel);
						break;
					case "todo":
						break;
				}
			}else{
				  this.controller.get("buttonAdd").show();
				  this.controller.get("buttonRemove").hide();
				  this.controller.setupWidget("buttonAdd",
				    this.attributes = {type : Mojo.Widget.activityButton},
				    this.doneModel = {
				      buttonLabel: "Add to My To-Do List",
				      disabled: false,
				      buttonClass: 'primary'
				    }
				  );
				  
				  this.tipAddBound=this.tipAdd.bind(this);
				  Mojo.Event.listen(this.controller.get("buttonAdd"),Mojo.Event.tap,this.tipAddBound);
				
			}

			
			this.controller.get("userPic").src=tipuserpic;
			this.controller.get("userName").update(tipuserfn+" "+tipuserln+" says...");
			this.controller.get("popTipText").update(tiptext);
			this.controller.get("pop-tip").show();
			this.controller.get("userScrim").show();

			
		//}
	}
}//fake comment end	

}

CheckinResultAssistant.prototype.okTappedCheckin = function() {
	this.controller.stageController.popScene("checkin-result");
}

CheckinResultAssistant.prototype.tipDone = function() {
		foursquarePost(this,{
			endpoint: 'tips/'+this.tip.id+'/markdone',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				//var todo=j.meta.code;
				if(j.meta.code==200 || j.meta.code=="200"){
					this.controller.get("pop-tip").hide();
					this.controller.get("userScrim").hide();
				}else{
					Mojo.Controller.getAppController().showBanner("Error marking todo as done", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error marking todo as done", {source: 'notification'});
			}.bind(this)
		});
}
CheckinResultAssistant.prototype.tipRemove = function() {
		foursquarePost(this,{
			endpoint: 'tips/'+this.tip.id+'/unmark',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				//var todo=j.tip;
				if(j.meta.code==200 || j.meta.code=="200"){
					this.controller.get("pop-tip").hide();
					this.controller.get("userScrim").hide();
				}else{
					Mojo.Controller.getAppController().showBanner("Error removing todo", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error removing todo", {source: 'notification'});
			}.bind(this)
		});

}
CheckinResultAssistant.prototype.tipAdd = function() {
		foursquarePost(this,{
			endpoint: 'tips/'+this.tip.id+'/marktodo',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				//var todo=j.tip;
				if(j.meta.code==200 || j.meta.code=="200"){
					this.controller.get("pop-tip").hide();
					this.controller.get("userScrim").hide();
				}else{
					Mojo.Controller.getAppController().showBanner("Error marking as todo", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error marking as todo", {source: 'notification'});
			}.bind(this)
		});

}


CheckinResultAssistant.prototype.handleCommand = function(event) {
	if(event.type===Mojo.Event.back && this.controller.get("pop-tip").style.display!="none"){
		event.preventDefault();
		event.stopPropagation();
		event.stop();
		this.controller.get("pop-tip").hide();
		this.controller.get("userScrim").hide();
	}

	if(event.type===Mojo.Event.back && this.controller.get("special_overlay").style.display!="none"){
		event.preventDefault();
		event.stopPropagation();
		event.stop();
		this.controller.get("special_overlay").hide();
	}
};



CheckinResultAssistant.prototype.activate = function(event) {
	   //if(this.noscores) {this.controller.get("checkin-scores").hide();}
	  // if(this.nomayor) {this.controller.get("mayor-group").hide();}
}


CheckinResultAssistant.prototype.deactivate = function(event) {
}

CheckinResultAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckinBound);
}
