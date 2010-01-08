function CheckInDialogAssistant(sceneAssistant, checkinJSON,i) {
  this.sceneAssistant = sceneAssistant;
  this.data = checkinJSON;
  this.uid=i;
}
CheckInDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  //Mojo.Log.error("################checkin: "+this.data);
  this.initData(this.data);
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("okButtonCheckin",
    this.attributes = {},
    this.OKButtonModel = {
      buttonLabel: "Sweet",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('okButtonCheckin'), Mojo.Event.tap, this.okTappedCheckin.bindAsEventListener(this));
};

CheckInDialogAssistant.prototype.initData = function(checkinJSON) {

	//set the title message
	$('checkin-title').innerHTML = checkinJSON.checkin.message;
	
	
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
	}
	
	
	//badges? we need stinkin' badges!
	if(checkinJSON.checkin.badges != undefined) {
		for(var b = 0; b < checkinJSON.checkin.badges.length;b++) {
			var badge_name=checkinJSON.checkin.badges[b].name;
			var badge_icon=checkinJSON.checkin.badges[b].icon;
			var badge_text=checkinJSON.checkin.badges[b].description;
			$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-badge"><img src="'+badge_icon+'" width="32" height="32" /> <span>'+badge_name+': '+badge_text+'</span></div></div>';
		}
	}
	
	
	//handle mayorship. this is a cheap way to detect it, but it works.... for now
	if(checkinJSON.checkin.mayor != undefined) {
		var type=checkinJSON.checkin.mayor.type;
		if(type=="nochange") { //same ol' mayor
			if(checkinJSON.checkin.mayor.user== undefined) {  //we're the mayor still
				$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-badge"><span>'+checkinJSON.checkin.mayor.message+'</span></div></div>';
			}
		}else{ //we're the new mayor!
			$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-badge"><span>'+checkinJSON.checkin.mayor.message+'</span></div></div>';	
		}
	}
	
	
	
	//make sure the next stays in the white box!
	$('scores-box').innerHTML+='<br class="breaker"/>';

	
	//set the total score
	/*
	var totalPts = '0 pts';
	if(checkinJSON.checkin.scoring.total.message != undefined) {
		totalPts = checkinJSON.checkin.scoring.total.message;
	}
	$('score-title').innerHTML = "Score! That's " + totalPts;
	*/
	
	
	//temporary fix until multiple scores are stored in a json array instead of 2 same-named objects
	/*
	var imgpath = checkinJSON.checkin.scoring.score.icon;
	var msg = '+' + checkinJSON.checkin.scoring.score.points + ' ' +checkinJSON.checkin.scoring.score.message;
	$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /><span>'+msg+'</span></div></div>';
	*/

};

CheckInDialogAssistant.prototype.okTappedCheckin = function() {
	this.widget.mojo.close();
};