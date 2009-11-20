function DoCheckinDialogAssistant(sceneAssistant,vid,n) {
  this.sceneAssistant = sceneAssistant;
  this.vname=n;
  this.vid=vid;
}
DoCheckinDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  //Mojo.Log.error("################checkin: "+this.data);
  //this.initData(this.data);
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("okButton",
    this.attributes = {/*type : Mojo.Widget.activityButton*/},
    this.OKButtonModel = {
      buttonLabel: "Check-in",
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
  
      this.sceneAssistant.controller.setupWidget("chkShowFriends",
         this.sfattributes = {
             trueValue: '1',
             falseValue: '0' 
         },
         this.sfmodel = {
             value: '0',
             disabled: false
         });
    this.sceneAssistant.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             falseValue: '0' 
         },
         this.twmodel = {
             value: '0',
             disabled: false
         });

  
	this.sceneAssistant.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true}, this.tipModel = {value:'', disabled:false});

//	this.init();
}

DoCheckinDialogAssistant.prototype.activate = function() {
	$('shout').mojo.focus();
}


DoCheckinDialogAssistant.prototype.okTapped = function() {
/*	if (this.auth) {
		var url = 'http://api.foursquare.com/v1/addtip.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: this.auth
			},
			parameters: {
				vid: this.vid,
				shout: this.tipModel.value,
				type: "tip"
			},
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
*/	

//	this.widget.mojo.close();

	this.sceneAssistant.checkIn(this.vid,this.vname,this.tipModel.value,this.sfmodel.value,this.twmodel.value);
	//this.widget.mojo.close();
}

DoCheckinDialogAssistant.prototype.tipSuccess = function() {
	$("okButton").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

DoCheckinDialogAssistant.prototype.tipFailed = function() {

}
DoCheckinDialogAssistant.prototype.cancelTapped = function() {
	this.widget.mojo.close();
}
