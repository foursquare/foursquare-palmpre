function CheckinResultAssistant( checkinJSON,i) {
	this.json=checkinJSON;
	this.uid=i;	
}

CheckinResultAssistant.prototype.setup = function() {
//	zBar.hideToolbar();
	
  this.controller.setupWidget("okButtonCheckin",
    this.attributes = {},
    this.OKButtonModel = {
      buttonLabel: "Sweet!",
      disabled: false
    }
  );
	Mojo.Event.listen(this.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckin.bindAsEventListener(this));
	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("checkin-widgets").style.minHeight="247px;";
	}
	else{
	   this.controller.get("checkin-widgets").style.minHeight="327px"; //372
	}

	this.initData(this.json);
	
}

CheckinResultAssistant.prototype.initData = function(checkinJSON) {

	//set the title message
	this.controller.get('checkin-display').innerHTML = checkinJSON.checkin.message;
	this.controller.get('scores-box').innerHTML=" ";
	
	//set the individual scores - handle changes in JSON response...
	if(checkinJSON.checkin.scoring != undefined){
		var scores=checkinJSON.checkin.scoring.score;
	}else if(checkinJSON.checkin.scores != undefined){
		var scores=checkinJSON.checkin.scores;
	}else{
		var scores=undefined;
	}
	if(scores != undefined) {
		var totalpoints=0;
		for(var i = 0; i < scores.length; i++) {
			if (checkinJSON.checkin.scores[i] != undefined) { 
				var imgpath = scores[i].icon;
				totalpoints+=parseInt(scores[i].points);
				var msg = '+' + scores[i].points + ' ' +scores[i].message;
				this.controller.get('scores-box').innerHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+imgpath+'" width="20" height="20" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 210px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+msg+'	</div><br class="breaker"/></div>';
//'<div class="palm-row single"><div class="checkin-score-item"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>';
			}
		}
		var totalPts = (totalpoints != 1)? totalpoints+' pts': totalpoints+' pt';
		this.controller.get('score-title').innerHTML = "Score! That's " + totalPts+"!";
	}else{
		this.noscores=true;
	}

	
	//badges? we need stinkin' badges!
	if(checkinJSON.checkin.badges != undefined) {
		for(var b = 0; b < checkinJSON.checkin.badges.length;b++) {
			var badge_name=checkinJSON.checkin.badges[b].name;
			var badge_icon=checkinJSON.checkin.badges[b].icon;
			var badge_text=checkinJSON.checkin.badges[b].description;
			this.controller.get('scores-box').innerHTML += 	'<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+badge_icon+'" width="32" height="32"  class="friend-avatar" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 195px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+badge_name+': '+badge_text+'	</div><br class="breaker"/></div>';
//'<div class="palm-row single"><div class="checkin-badge-item"><img align="absmiddle" src="'+badge_icon+'" width="32" height="32" /> <span>'+badge_name+': '+badge_text+'</span></div></div>';
		}
	}

	
	//handle mayorship. the response lets us know whether we're the new mayor, still the mayor, or some other dork still is the mayor.
	//the response also already has some language for this information ("Congrats! You're still the mayor!") so
	//I don't see the need to handle the different mayorships. maybe in the future if we make the check-in result super bad-ass.
	if(checkinJSON.checkin.mayor != undefined) {
		this.controller.get('checkin-mayorship').innerHTML = '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="images/crown_50x50.png" width="50" height="50"  class="friend-avatar" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 180px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+checkinJSON.checkin.mayor.message+'	</div><br class="breaker"/></div>';
	//'<div class="palm-row single"><span>'+checkinJSON.checkin.mayor.message+'</span></div>';


	}else{
		this.nomayor=true;
	}
	


	//specials!
	if(checkinJSON.checkin.specials != undefined) {
		for(var b = 0; b < checkinJSON.checkin.specials.length;b++) {
			var special_type=checkinJSON.checkin.specials[b].type;
			var special_msg=checkinJSON.checkin.specials[b].message;
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/crown_30x30.png\" width=\"22\" height=\"22\" /> Mayor Special";
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			var special_venue="";
			
			if(checkinJSON.checkin.specials[b].venue != undefined) { //not at this venue, but nearby
				spt=spt+" Nearby";
				special_venue="@ "+checkinJSON.checkin.specials[b].venue.name;
			}
			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
			this.controller.get('checkin_specials').innerHTML += '<div class="checkin-special"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class="palm-list special-list"><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>';
		}
	}

	

	

}

CheckinResultAssistant.prototype.okTappedCheckin = function() {
	this.controller.stageController.popScene("checkin-result");
}



CheckinResultAssistant.prototype.activate = function(event) {
	   if(this.noscores) {this.controller.get("checkin-scores").hide();}
	   if(this.nomayor) {this.controller.get("mayor-group").hide();}
}


CheckinResultAssistant.prototype.deactivate = function(event) {
}

CheckinResultAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckin.bindAsEventListener(this));
}
