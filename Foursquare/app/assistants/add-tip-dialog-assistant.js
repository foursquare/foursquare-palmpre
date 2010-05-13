function AddTipDialogAssistant(sceneAssistant,a,vid,t) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
  this.vid=vid;
  this.type=t;
}
AddTipDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("tipokButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Add",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTapped.bindAsEventListener(this));

  this.sceneAssistant.controller.setupWidget("cancelButton",
    this.cancelattributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTapped.bindAsEventListener(this));
  
  
	this.sceneAssistant.controller.setupWidget('newtip', this.tipAttributes = {hintText:'Enter '+this.type+' here...',multiline:true,focus:true}, 		this.tipModel = {value:'', disabled:false});

	this.sceneAssistant.controller.get("addtip-title").innerHTML="Add a "+this.type;
}

AddTipDialogAssistant.prototype.activate = function() {
	this.sceneAssistant.controller.get('newtip').mojo.focus();
}


AddTipDialogAssistant.prototype.tipokTapped = function() {
Mojo.Log.error("oktapped");
		var url = 'http://api.foursquare.com/v1/addtip.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.vid,
				text: this.tipModel.value,
				type: this.type
			},
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
		});
}

AddTipDialogAssistant.prototype.tipSuccess = function() {
	Mojo.Controller.getAppController().showBanner("Successfully added your "+this.type+"!", {source: 'notification'});
	//this.sceneAssistant.controller.get("okButton").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.tipFailed = function() {
	Mojo.Controller.getAppController().showBanner("Error adding your "+this.type, {source: 'notification'});

}
AddTipDialogAssistant.prototype.cancelTapped = function() {
	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.cleanup = function() {
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTapped.bindAsEventListener(this));
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTapped.bindAsEventListener(this));

}
