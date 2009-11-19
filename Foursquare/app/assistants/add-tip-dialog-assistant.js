function AddTipDialogAssistant(sceneAssistant,a,vid) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
  this.vid=vid;
}
AddTipDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  //Mojo.Log.error("################checkin: "+this.data);
  //this.initData(this.data);
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("okButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Add",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('okButton'), Mojo.Event.tap, this.okTapped.bindAsEventListener(this));

  this.sceneAssistant.controller.setupWidget("cancelButton",
    this.attributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTapped.bindAsEventListener(this));
  
  
	this.sceneAssistant.controller.setupWidget('newtip', this.tipAttributes = {hintText:'Add a tip',multiline:true,focus:true}, this.tipModel = {value:'', disabled:false});

//	this.init();
}

AddTipDialogAssistant.prototype.activate = function() {
	$('newtip').mojo.focus();
}


AddTipDialogAssistant.prototype.okTapped = function() {
	if (this.auth) {
		var url = 'http://api.foursquare.com/v1/addtip.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: this.auth
			},
			parameters: {
				vid: this.vid,
				text: this.tipModel.value,
				type: "tip"
			},
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
	

//	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.tipSuccess = function() {
	$("okButton").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.tipFailed = function() {

}
AddTipDialogAssistant.prototype.cancelTapped = function() {
	this.widget.mojo.close();
}
