function DoShoutDialogAssistant(sceneAssistant,a) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
}
DoShoutDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  this.sceneAssistant.controller.setupWidget("okButtonShout",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Shout!",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShout.bindAsEventListener(this));

  this.sceneAssistant.controller.setupWidget("cancelButtonShout",
    this.attributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('cancelButtonShout'), Mojo.Event.tap, this.cancelTappedShout.bindAsEventListener(this));
  
  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	var pings=(credentials.ping=="on")? '0': '1';
	var stt=(credentials.savetotwitter==true)? '1': '0';
  
  
    this.sceneAssistant.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             falseValue: '0' 
         },
         this.twmodel = {
             value: stt,
             disabled: false
         });
//	Mojo.Log.error("twittersave:"+credentials.savetotwitter);
  
	this.sceneAssistant.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true}, this.tipModel = {value:'', disabled:false});

}

DoShoutDialogAssistant.prototype.activate = function() {
	$('shout').mojo.focus();
}


DoShoutDialogAssistant.prototype.okTappedShout = function() {

//	Mojo.Log.error("###check in please??");
	if (this.auth) {
//		Mojo.Log.error("###trying to shout");
	
		var url = 'https://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				shout: this.tipModel.value,
				twitter: this.twmodel.value
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		Mojo.Controller.getAppController().showBanner("Not logged in!", {source: 'notification'});
	}
}


DoShoutDialogAssistant.prototype.checkInSuccess = function(response) {
	//Mojo.Log.error(response.responseText);
		$("okButtonShout").mojo.deactivate();

	Mojo.Controller.getAppController().showBanner("Sent your shout to your friends!", {source: 'notification'});
	this.widget.mojo.close();
}

DoShoutDialogAssistant.prototype.checkInFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error sending your shout.", {source: 'notification'});
	this.widget.mojo.close();
}




DoShoutDialogAssistant.prototype.tipSuccess = function() {
	$("okButtonShout").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

DoShoutDialogAssistant.prototype.tipFailed = function() {

}
DoShoutDialogAssistant.prototype.cancelTappedShout = function() {
	this.widget.mojo.close();
}
DoShoutDialogAssistant.prototype.cleanup = function() {
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShout.bindAsEventListener(this));
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('cancelButtonShout'), Mojo.Event.tap, this.cancelTappedShout.bindAsEventListener(this));

}