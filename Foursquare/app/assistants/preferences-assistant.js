function PreferencesAssistant(ps) {
	this.prevScene=ps;
}

PreferencesAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly'});

	this.controller.setupWidget("sliderGPS",
    	this.slideattributes = {
        	minValue: -1000,
			maxValue: 0,
        	round: true,
        	updateInterval: 0.5
	    },
 
		this.slidemodel = {
        	value: 0,
	        disabled: false
    	});

    this.cookieData=new Mojo.Model.Cookie("notifications");
	var credentials=this.cookieData.get();
	var notifs=(credentials)? credentials.notifs: '0';

    this.cookieData=new Mojo.Model.Cookie("alert");
	var credentials=this.cookieData.get();
	var alerts=(credentials)? credentials: {type:"bounce",ringtone:"",file:""};

	if(alerts.type=="ringtone"){
		var dp=true;
		this.controller.get("ringtone").innerHTML=alerts.ringtone;
	}else{
		var dp=false;
		this.controller.get("alert-row").addClassName("last");
	}
    this.controller.setupWidget('ringtone-drawer', this.Attributes={unstyled:true}, this.drawerModel={open:dp});  
          
    this.controller.setupWidget('alert-type', {label:'Alert', choices: [
		{label:$L('None'), value:"off"}
		,{label:$L('Vibrate Only'), value:"vibrate"}
		,{label:$L('System Sound'), value:"system_sound"}
		,{label:$L('Ringtone'), value:"ringtone"}
		,{label:$L('Bounce'), value:"bounce"}
		], modelProperty:'value'}, this.alertModel={value:alerts.type});
    
    
    this.controller.setupWidget("chkNotifications",
         this.notifsAttributes = {
             trueValue: '1',
             trueLabel: 'Yes',
             falseValue: '0',
             falseLabel: 'No'
         },
         this.notifsModel = {
             value: notifs,
             disabled: false
         });

          
          
          
    this.controller.setupWidget("units",
        this.unitsattributes = {
            choices: [
                {label: "Miles", value: "si"},
                {label: "Meters", value: "metricb"},
                {label: "Kilometers", value: "metric"}
                ]},

        this.unitsmodel = {
        value: "si",
        disabled: false
        }
    );

    this.controller.setupWidget("sendstats",
        this.statsattributes = {
            choices: [
                {label: "Sure! I'll Help!", value: "true"},
                {label: "No, thanks.", value: "false"}
                ]},

        this.statsmodel = {
        value: "true",
        disabled: false
        }
    );
    this.controller.setupWidget("autoclose",
        this.autocloseattributes = {
        	label: 'Auto-Close',
            choices: [
                {label: "Never", value: "never"},
                {label: "5mins", value: 300000},
                {label: "10mins", value: 600000},
                {label: "15mins", value: 900000},
                {label: "20mins", value: 1200000},
                {label: "25mins", value: 1500000}
                ]},

        this.autoclosemodel = {
        value: "never",
        disabled: false
        }
    );

    this.controller.setupWidget("twitter",
        this.twitterattributes = {
            choices: [
                {label: "Web Browser", value: "web",secondaryIconPath: "images/web_32.png"},
                {label: "Bad Kitty", value: "badkitty",secondaryIconPath: "images/bad_kitty_32.png"},
                {label: "TweetMe", value: "tweetme",secondaryIconPath: "images/tweetme_32.png"}
                ]},

        this.twittermodel = {
        value: "web",
        disabled: false
        }
    );


    this.controller.setupWidget("houses",
        this.housesattributes = {
            choices: [
                {label: "Yes", value: "yes"},
                {label: "No", value: "no"}
                ]},

        this.housesmodel = {
        value: "no",
        disabled: false
        }
    );
    this.controller.setupWidget("numVenuesPicker",
        this.numattributes = {
            choices: [
                {label: "15", value: 15},
                {label: "20", value: 20},
                {label: "25", value: 25},
                {label: "30", value: 30},
                {label: "35", value: 35},
                {label: "40", value: 40},
                {label: "45", value: 45},
                {label: "50", value: 50}
                ]},

        this.nummodel = {
        value: 15,
        disabled: false
        }
    );
    
    this.onLoginTappedBound=this.onLoginTapped.bind(this);
    this.chooseRingtoneBound=this.chooseRingtone.bind(this);
    this.onFlickrTappedBound=this.onFlickrTapped.bind(this);
    this.onFBTwitterTappedBound=this.onFBTwitterTapped.bind(this);
    this.handleSliderBound=this.handleSlider.bind(this);
    this.handleNumPickerBound=this.handleNumPicker.bind(this);
    this.handleUnitsBound=this.handleUnits.bind(this);
    this.handleStatsBound=this.handleStats.bind(this);
    this.handleAutocloseBound=this.handleAutoclose.bind(this);
    this.handleTwitterBound=this.handleTwitter.bind(this);
    this.handleHousesBound=this.handleHouses.bind(this);
    this.handleAlertTypeBound=this.handleAlertType.bind(this);
    this.handleNotifsBound=this.handleNotifs.bind(this);
    
         
	Mojo.Event.listen(this.controller.get("fsq-account-row"), Mojo.Event.tap, this.onLoginTappedBound);
	Mojo.Event.listen(this.controller.get("ringtone-select"), Mojo.Event.tap, this.chooseRingtoneBound);
	Mojo.Event.listen(this.controller.get("flickr-account-row"), Mojo.Event.tap, this.onFlickrTappedBound);
	Mojo.Event.listen(this.controller.get("twitter-account-row"), Mojo.Event.tap, this.onFBTwitterTappedBound);
	Mojo.Event.listen(this.controller.get("facebook-account-row"), Mojo.Event.tap, this.onFBTwitterTappedBound);
	Mojo.Event.listen(this.controller.get("sliderGPS"), Mojo.Event.propertyChange, this.handleSliderBound);
	Mojo.Event.listen(this.controller.get("numVenuesPicker"), Mojo.Event.propertyChange, this.handleNumPickerBound);
	Mojo.Event.listen(this.controller.get("units"), Mojo.Event.propertyChange, this.handleUnitsBound);
	Mojo.Event.listen(this.controller.get("sendstats"), Mojo.Event.propertyChange, this.handleStatsBound);
	Mojo.Event.listen(this.controller.get("autoclose"), Mojo.Event.propertyChange, this.handleAutocloseBound);
	Mojo.Event.listen(this.controller.get("twitter"), Mojo.Event.propertyChange, this.handleTwitterBound);
	Mojo.Event.listen(this.controller.get("houses"), Mojo.Event.propertyChange, this.handleHousesBound);
	Mojo.Event.listen(this.controller.get("alert-type"), Mojo.Event.propertyChange, this.handleAlertTypeBound);
	Mojo.Event.listen(this.controller.get("chkNotifications"), Mojo.Event.propertyChange, this.handleNotifsBound);

	var slideval=(_globals.gpsAccuracy != undefined)? Math.abs(_globals.gpsAccuracy)*-1: 0;
	this.slidemodel.value=slideval;
	this.controller.modelChanged(this.slidemodel);
	this.handleSlider("setup-routine");

	var numval=(_globals.venueCount != undefined)? _globals.venueCount: 15;
	this.nummodel.value=numval;
	this.controller.modelChanged(this.nummodel);
	this.handleNumPicker("setup-routine");

	var unitsval=(_globals.units != undefined)? _globals.units: "si";
	this.unitsmodel.value=unitsval;
	this.controller.modelChanged(this.unitsmodel);
	this.handleUnits("setup-routine");

	var statsval=(_globals.sendstats != undefined)? _globals.sendstats: true;
	this.statsmodel.value=statsval;
	this.controller.modelChanged(this.statsmodel);
	this.handleStats("setup-routine");

	var acval=(_globals.autoclose != undefined)? _globals.autoclose: "never";
	this.autoclosemodel.value=acval;
	this.controller.modelChanged(this.autoclosemodel);
	this.handleAutoclose("setup-routine");


	var twitterval=(_globals.twitter != undefined)? _globals.twitter: "web";
	this.twittermodel.value=twitterval;
	this.controller.modelChanged(this.twittermodel);
	this.handleTwitter("setup-routine");

	var housesval=(_globals.houses != undefined)? _globals.houses: "no";
	this.housesmodel.value=housesval;
	this.controller.modelChanged(this.housesmodel);
	this.handleHouses("setup-routine");

	if(_globals.flickr_username != undefined){
		this.controller.get("flickrInfo").innerHTML=""+_globals.flickr_username+"";
	}
	this.controller.get("fsq-account").innerHTML=_globals.username;
}

PreferencesAssistant.prototype.activate = function(event) {
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.scrollTo(this.controller.get('prefs-main'));

}
PreferencesAssistant.prototype.handleSlider = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		logthis("ok");
		var v=this.slidemodel.value*-1; //make it positive
		logthis("v="+v);
		if(v==0) {
			this.controller.get("gps-description").innerHTML="Don't Care";
			this.controller.get("gps-longdesc").innerHTML="Accept the first GPS result regardless of how accurate it is.";
		}else if(v>0 && v<=150) {
			this.controller.get("gps-description").innerHTML="Super Accurate (up to 150m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 150 meters. Will probably be slow indoors.";
			v=150;
		}else if(v>150 && v<=500) {
			logthis("500'd frst");
			this.controller.get("gps-description").innerHTML="Accurate (up to 500m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 500 meters. May be slow indoors.";
			logthis("500'd");
			v=500;
		}else if(v>500 && v<=750) {
			this.controller.get("gps-description").innerHTML="Mostly Accurate (up to 750m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 750 meters. Will work most anywhere.";
			v=750;
		}else if(v>750 && v<=1001) {
			this.controller.get("gps-description").innerHTML="Not So Accurate (up to 1000m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 1000 meters. Might say you're several blocks away if cloudy or indoors.";
			v=1001;
		}
		
		this.slidemodel.value=v*-1;
		this.controller.modelChanged(this.slidemodel);

		this.cookieData=new Mojo.Model.Cookie("gpsdata");
		this.cookieData.put(
			{"gpsAccuracy":v*-1}
		)
		_globals.gpsAccuracy=v;

	}
}


PreferencesAssistant.prototype.handleNumPicker = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.nummodel.value;
		
		
		this.cookieData=new Mojo.Model.Cookie("venuecount");
		this.cookieData.put(
			{"venueCount":v}
		)
		_globals.venueCount=v;
	}
}
PreferencesAssistant.prototype.handleUnits = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.unitsmodel.value;
				
		this.cookieData=new Mojo.Model.Cookie("units");
		this.cookieData.put(
			{"units":v}
		)
		_globals.units=v;
	}
}
PreferencesAssistant.prototype.handleStats = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.statsmodel.value;
				
		this.cookieData=new Mojo.Model.Cookie("sendstats");
		this.cookieData.put(
			{"sendstats":v}
		)
		_globals.sendstats=v;
	}
}
PreferencesAssistant.prototype.handleAutoclose = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.autoclosemodel.value;
		logthis(v);
				
		this.cookieData=new Mojo.Model.Cookie("autoclose");
		this.cookieData.put(
			{"autoclose":v}
		)
		_globals.autoclose=v;
	}
}
PreferencesAssistant.prototype.handleTwitter = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.twittermodel.value;
				
		this.cookieData=new Mojo.Model.Cookie("twitter");
		this.cookieData.put(
			{"twitter":v}
		)
		_globals.twitter=v;
	}
}
PreferencesAssistant.prototype.handleHouses = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.housesmodel.value;
				
		this.cookieData=new Mojo.Model.Cookie("houses");
		this.cookieData.put(
			{"houses":v}
		)
		_globals.houses=v;
		
		logthis(v);
	}
}
PreferencesAssistant.prototype.handleAlertType = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.alertModel.value;
				
		this.cookieData=new Mojo.Model.Cookie("alert");
		this.cookieData.put(
			{"type":v,"ringtone":"","file":""}
		)
		_globals.alerttype=v;
		
		if(v=="ringtone"){
			this.controller.get("ringtone-drawer").mojo.setOpenState(true);
			this.controller.modelChanged(this.drawerModel);
			this.controller.get("alert-row").removeClassName("last");
		}else{
			this.controller.get("ringtone-drawer").mojo.setOpenState(false);
			this.controller.modelChanged(this.drawerModel);		
			this.controller.get("alert-row").addClassName("last");
		}
	}
}
PreferencesAssistant.prototype.handleNotifs = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.notifsModel.value;
				
		this.cookieData=new Mojo.Model.Cookie("notifications");
		this.cookieData.put(
			{"notifs":v}
		)
		_globals.notifs=v;
		
		if(v=="1"){
			this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
	            method: "set",
	            parameters: {
	                "key": "com.foursquare.foursquare.update",
	                "in": _globals.interval,
	                "wakeup": true,
	                "uri": "palm://com.palm.applicationManager/open",
	                "params": {
	                    "id": Mojo.appInfo.id,
	                    "params": {"action": "feedUpdate"}
	                }
	            },
	            onSuccess: function(response) {
	                Mojo.Log.error("Alarm Set Success", response.returnValue);
	                _globals.wakeupTaskId = Object.toJSON(response.taskId);
	            },
	            onFailure: function(response) {
	                Mojo.Log.error("Alarm Set Failure",
	                    response.returnValue, response.errorText);
	            }
	        });
		}else{
			this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
	            method: "clear",
	            parameters: {
	                "key": "com.foursquare.foursquare.update"
	            },
	            onSuccess: function(response) {
	            },
	            onFailure: function(response) {
	            }
	        });		
		}
	}
}


PreferencesAssistant.prototype.chooseRingtone = function(event) {
	Mojo.FilePicker.pickFile({
		actionType: "attach",
        defaultKind: 'ringtone',
		kinds: ["ringtone"],
		filePath: "", 
		actionName: $L("Okay"),
	    onSelect: function(r){
	    	this.controller.get("ringtone").update(r.name);
	    	_globals.alerttype="ringtone";
	    	_globals.alertfile=r.fullPath;
			this.cookieData=new Mojo.Model.Cookie("alert");
			this.cookieData.put(
				{"type":"ringtone","ringtone":r.name,"file":r.fullPath}
			)
	    	
	    }.bind(this)
	},this.controller.stageController);

}


PreferencesAssistant.prototype.saveVenueCount = function(event) {

}
PreferencesAssistant.prototype.onLoginTapped = function() {
			this.controller.stageController.pushScene('main',false,undefined,true);

}
PreferencesAssistant.prototype.onFlickrTapped = function() {
			this.controller.stageController.pushScene('flickr-auth',this);

}

PreferencesAssistant.prototype.onFBTwitterTapped = function() {
	this.controller.showAlertDialog({
	    onChoose: function(value) {},
	    title: $L("Facebook and Twitter"),
	    allowHTMLMessage: true,
	    message: $L("To link your Facebook and/or Twitter accounts with foursquare, you must do so by visiting <i>http://foursquare.com/settings</i> on your desktop (or laptop) computer."),
	    choices:[
	        {label:$L("OK"), value:"med"}
	    ]
	}); 
}

PreferencesAssistant.prototype.deactivate = function(event) {
}
PreferencesAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
                	
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Todos":
                	var thisauth=auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
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
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
			}
		}
}
PreferencesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("fsq-account-row"), Mojo.Event.tap, this.onLoginTappedBound);
	Mojo.Event.stopListening(this.controller.get("ringtone-select"), Mojo.Event.tap, this.chooseRingtoneBound);
	Mojo.Event.stopListening(this.controller.get("flickr-account-row"), Mojo.Event.tap, this.onFlickrTappedBound);
	Mojo.Event.stopListening(this.controller.get("twitter-account-row"), Mojo.Event.tap, this.onFBTwitterTappedBound);
	Mojo.Event.stopListening(this.controller.get("facebook-account-row"), Mojo.Event.tap, this.onFBTwitterTappedBound);
	Mojo.Event.stopListening(this.controller.get("sliderGPS"), Mojo.Event.propertyChange, this.handleSliderBound);
	Mojo.Event.stopListening(this.controller.get("numVenuesPicker"), Mojo.Event.propertyChange, this.handleNumPickerBound);
	Mojo.Event.stopListening(this.controller.get("units"), Mojo.Event.propertyChange, this.handleUnitsBound);
	Mojo.Event.stopListening(this.controller.get("sendstats"), Mojo.Event.propertyChange, this.handleStatsBound);
	Mojo.Event.stopListening(this.controller.get("autoclose"), Mojo.Event.propertyChange, this.handleAutocloseBound);
	Mojo.Event.stopListening(this.controller.get("twitter"), Mojo.Event.propertyChange, this.handleTwitterBound);
	Mojo.Event.stopListening(this.controller.get("houses"), Mojo.Event.propertyChange, this.handleHousesBound);
	Mojo.Event.stopListening(this.controller.get("alert-type"), Mojo.Event.propertyChange, this.handleAlertTypeBound);
	Mojo.Event.stopListening(this.controller.get("chkNotifications"), Mojo.Event.propertyChange, this.handleNotifsBound);
}
