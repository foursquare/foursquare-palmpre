function CheckInDialogAssistant(sceneAssistant, checkinJSON) {
  this.sceneAssistant = sceneAssistant;
  this.data = checkinJSON;
}
CheckInDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  this.initData(this.data);
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("okButton",
    this.attributes = {},
    this.OKButtonModel = {
      buttonLabel: "Sweet",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('okButton'), Mojo.Event.tap, this.okTapped.bindAsEventListener(this));
};

CheckInDialogAssistant.prototype.initData = function(checkinJSON) {
	//set the title message
	$('checkin-title').innerHTML = checkinJSON.checkin.message;
	
	//set the total score
	var totalPts = '0 pts';
	if(checkinJSON.checkin.scoring.total.message != undefined) {
		totalPts = checkinJSON.checkin.scoring.total.message;
	}
	$('score-title').innerHTML = "Score! That's " + totalPts;
	
	//set the individual scores - right now scores are not an array, this needs to be fixed for this to work right
	/*
	for(var i = 0; i < checkinJSON.checkin.scoring.length; i++) {
		if (checkinJSON.checkin.scoring[i].icon != undefined) { //this is the only way I know how to tell if it's a score rather than the total
			var imgpath = checkinJSON.checkin.scoring[i].icon;
			var msg = '+' + checkinJSON.checkin.scoring[i].points + ' ' +checkinJSON.checkin.scoring[i].message;
			$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /><span>'+msg+'</span></div></div>';
		}
	}
	*/
	//temporary fix until multiple scores are stored in a json array instead of 2 same-named objects
	var imgpath = checkinJSON.checkin.scoring.score.icon;
	var msg = '+' + checkinJSON.checkin.scoring.score.points + ' ' +checkinJSON.checkin.scoring.score.message;
	$('scores-box').innerHTML += '<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /><span>'+msg+'</span></div></div>';


};

CheckInDialogAssistant.prototype.okTapped = function() {
	this.widget.mojo.close();
};