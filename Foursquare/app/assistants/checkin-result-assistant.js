function CheckinResultAssistant( checkinJSON,i) {
	this.json=checkinJSON;
	this.uid=i;	
}

CheckinResultAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
  this.controller.setupWidget("okButtonCheckin",
    this.attributes = {},
    this.OKButtonModel = {
      buttonLabel: "Sweet",
      disabled: false
    }
  );
	Mojo.Event.listen(this.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckin.bindAsEventListener(this));
	
	/* add event handlers to listen to events from widgets */
	this.initData(this.json);

}

CheckinResultAssistant.prototype.initData = function(checkinJSON) {

	Mojo.Log.error("^^^^^^^^^^^^checkin dialog");
	//set the title message
	$('checkin-display').innerHTML = checkinJSON.checkin.message;
	$('scores-box').innerHTML=" ";
	
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
				$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>';
			}
		}
		var totalPts = (totalpoints != 1)? totalpoints+' pts': totalpoints+' pt';
		$('score-title').innerHTML = "Score! That's " + totalPts;
	}else{
		this.noscores=true;
	}
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - scores done");

	
	//badges? we need stinkin' badges!
	if(checkinJSON.checkin.badges != undefined) {
		for(var b = 0; b < checkinJSON.checkin.badges.length;b++) {
			var badge_name=checkinJSON.checkin.badges[b].name;
			var badge_icon=checkinJSON.checkin.badges[b].icon;
			var badge_text=checkinJSON.checkin.badges[b].description;
			$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-badge"><img src="'+badge_icon+'" width="32" height="32" /> <span>'+badge_name+': '+badge_text+'</span></div></div>';
		}
	}
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - badges done");

	
	//handle mayorship. this is a cheap way to detect it, but it works.... for now
	if(checkinJSON.checkin.mayor != undefined) {
		/*var type=checkinJSON.checkin.mayor.type;
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - got a mayor");
		if(type=="nochange") { //same ol' mayor
			Mojo.Log.error("^^^^^^^^^^^^checkin dialog - same mayor");

			if(checkinJSON.checkin.mayor.user== undefined) {  //we're the mayor still
				$('checkin-mayorship').innerHTML = '<div class="palm-row single"><div class="checkin-badge"><span>'+checkinJSON.checkin.mayor.message+'</span></div></div>';
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - same mayor");
			}
		}else{ //we're the new mayor!
			$('checkin-mayorship').innerHTML = '<div class="palm-row single"><div class="checkin-badge"><span>'+checkinJSON.checkin.mayor.message+'</span></div></div>';	
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - new mayor");
		}*/
		$('checkin-mayorship').innerHTML = '<div class="palm-row single"><div class="checkin-badge"><span>'+checkinJSON.checkin.mayor.message+'</span></div></div>';

	}else{
		this.nomayor=true;
	}
	
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - mayor done");


	//specials!
	if(checkinJSON.checkin.specials != undefined) {
		for(var b = 0; b < checkinJSON.checkin.specials.length;b++) {
			var special_type=checkinJSON.checkin.specials[b].type;
			var special_msg=checkinJSON.checkin.specials[b].message;
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="Mayor Special";
					break;
				default:
					var spt="Foursquare Special";
					break;
			}
			$('checkin_specials').innerHTML += '<div class="palm-group"><div class="palm-group-title" x-mojo-loc="">'+spt+'</div><div class="palm-list"><div class="listWhiteBox">'+special_msg+'</div></div></div>';
		}
	}
		Mojo.Log.error("^^^^^^^^^^^^checkin dialog - badges done");

	
	//make sure the next stays in the white box!
	$('scores-box').innerHTML+='<br class="breaker"/>';

	

}

CheckinResultAssistant.prototype.okTappedCheckin = function() {
	Mojo.Log.error("##############trying to close");
	this.controller.stageController.popScene("checkin-result");
}



CheckinResultAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   if(this.noscores) {$("checkin-scores").hide();}
	   if(this.nomayor) {$("mayor-group").hide();}
}


CheckinResultAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

CheckinResultAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
