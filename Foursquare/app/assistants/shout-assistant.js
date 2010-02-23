function ShoutAssistant(a) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.auth=a;
}

ShoutAssistant.prototype.setup = function() {
  Mojo.Log.error("################shouting?");
  //this.initData(this.data);
  
  // Setup button and event handler
  this.controller.setupWidget("okButtonShout",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Shout!",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShout.bindAsEventListener(this));
  Mojo.Event.listen(this.controller.get('attach_image'), Mojo.Event.tap, this.attachImage.bindAsEventListener(this));

  
  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	var pings=(credentials.ping=="on")? '0': '1';
	var stt=(credentials.savetotwitter==true)? '1': '0';
	var stf=(credentials.savetofacebook==true || credentials.savetofacebook=='true')? '1': '0';
  
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    this.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             falseValue: '0', 
             trueLabel: 'On',
             falseLabel: 'Off'
         },
         this.twmodel = {
             value: stt,
             disabled: false
         });
    this.controller.setupWidget("chkFacebook",
         this.fbattributes = {
             trueValue: '1',
             falseValue: '0',
             trueLabel: 'On',
             falseLabel: 'Off'
         },
         this.fbmodel = {
             value: stf,
             disabled: false
         });
	Mojo.Log.error("twittersave:"+credentials.savetotwitter);
  
	this.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true}, this.tipModel = {value:'', disabled:false});

    /*this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Nothing"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing"
            }]
    }_globals.cmmodel);*/
_globals.ammodel.items[0].disabled=true;
this.controller.modelChanged(_globals.ammodel);

//	this.init();
}

ShoutAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	$('shout').mojo.focus();
}

ShoutAssistant.prototype.okTappedShout = function() {

	Mojo.Log.error("###check in please??");
	if (_globals.auth) {
		Mojo.Log.error("###trying to shout");
	
		//before doing the actual shout, see if we have a photo. if so, handle that
		if(this.hasPhoto){
			//do nothing yet...
		}
	
	
	
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				shout: this.tipModel.value,
				twitter: this.twmodel.value,
				facebook: this.fbmodel.value
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
	} else {
		Mojo.Controller.getAppController().showBanner("Not logged in!", {source: 'notification'});
	}
	//this.widget.mojo.close();
}
ShoutAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
		$("okButtonShout").mojo.deactivate();
	this.tipModel.value="";
	this.controller.modelChanged(this.tipModel);
	Mojo.Controller.getAppController().showBanner("Sent your shout to your friends!", {source: 'notification'});
}

ShoutAssistant.prototype.checkInFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error sending your shout.", {source: 'notification'});
}




ShoutAssistant.prototype.tipSuccess = function() {
	$("okButtonShout").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

ShoutAssistant.prototype.tipFailed = function() {

}
ShoutAssistant.prototype.cancelTappedShout = function() {
	this.widget.mojo.close();
}

ShoutAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	//var thisauth=auth;
				//	this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Nothing":
                	break;
            }
        }
    }

ShoutAssistant.prototype.attachImage = function(event) {
	Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
	this.fileName=fn.fullPath;
	this.hasPhoto=true;
	$("img_preview").innerHTML='<img src="'+this.fileName+'" width="100"/>';
	}.bind(this)},this.controller.stageController);
}

ShoutAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ShoutAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
