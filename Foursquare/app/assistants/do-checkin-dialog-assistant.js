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
    this.attributes = {type : Mojo.Widget.activityButton},
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
  
  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	var pings=(credentials.ping=="on")? '0': '1';
	Mojo.Log.error("pings="+pings);
	var stt=(credentials.savetotwitter==true)? '1': '0';
	var stf=(credentials.savetofacebook==true || credentials.savetofacebook=='true')? '1': '0';
  
  
      this.sceneAssistant.controller.setupWidget("chkShowFriends",
         this.sfattributes = {
             trueValue: '0',
             trueLabel: 'Yes',
             falseValue: '1',
             falseLabel: 'No'
         },
         this.sfmodel = {
             value: pings,
             disabled: false
         });
    this.sceneAssistant.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             trueLabel: 'On',
             falseLabel: 'Off',
             falseValue: '0' 
         },
         this.twmodel = {
             value: stt,
             disabled: false
         });
    this.sceneAssistant.controller.setupWidget("chkFacebook",
         this.fbattributes = {
             trueValue: '1',
             trueLabel: 'On',
             falseLabel: 'Off',
             falseValue: '0' 
         },
         this.fbmodel = {
             value: stf,
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
	this.sceneAssistant.checkIn(this.vid,this.vname,this.tipModel.value,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);
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
