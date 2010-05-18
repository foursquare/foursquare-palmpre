function PreferencesAssistant() {
}

PreferencesAssistant.prototype.setup = function() {

	//this.controller.setupWidget('goLogin', this.accattributes = {}, this.loginBtnModel = {label:'Set up account...', disabled:false});
	//this.controller.setupWidget('goFlickr', this.flickrattributes = {}, this.flickrBtnModel = {label:'Set Up Flickr Account', disabled:false});
	this.controller.setupWidget("sliderGPS",
    	this.slideattributes = {
        	minValue: -1000,
			maxValue: 0,
        	round: true
	    },
 
		this.slidemodel = {
        	value: 0,
	        disabled: false
    	});

 /*   this.controller.setupWidget("numVenuesPicker",
          this.numattributes = {

              modelProperty: 'value',
              min: 10,
              max: 50
 
          },
          this.nummodel = {
              value: 15
          });
          */
          
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
                {label: "Meters", value: "metric"}
                ]},

        this.unitsmodel = {
        value: "si",
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
         
	Mojo.Event.listen(this.controller.get("fsq-account-row"), Mojo.Event.tap, this.onLoginTapped.bind(this));
	Mojo.Event.listen(this.controller.get("ringtone-select"), Mojo.Event.tap, this.chooseRingtone.bind(this));
	Mojo.Event.listen(this.controller.get("flickr-account-row"), Mojo.Event.tap, this.onFlickrTapped.bind(this));
	Mojo.Event.listen(this.controller.get("sliderGPS"), Mojo.Event.propertyChange, this.handleSlider.bind(this));
	Mojo.Event.listen(this.controller.get("numVenuesPicker"), Mojo.Event.propertyChange, this.handleNumPicker.bind(this));
	Mojo.Event.listen(this.controller.get("units"), Mojo.Event.propertyChange, this.handleUnits.bind(this));
	Mojo.Event.listen(this.controller.get("alert-type"), Mojo.Event.propertyChange, this.handleAlertType.bind(this));
	Mojo.Event.listen(this.controller.get("chkNotifications"), Mojo.Event.propertyChange, this.handleNotifs.bind(this));

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
		var v=this.slidemodel.value*-1; //make it positive
		if(v==0) {
			this.controller.get("gps-description").innerHTML="Don't Care";
			this.controller.get("gps-longdesc").innerHTML="Accept the first GPS result regardless of how accurate it is.";
		}else if(v>0 && v<150) {
			this.controller.get("gps-description").innerHTML="Super Accurate (up to 150m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 150 meters. Will probably be slow indoors.";
			v=150;
		}else if(v>150 && v<500) {
			this.controller.get("gps-description").innerHTML="Accurate (up to 500m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 500 meters. May be slow indoors.";
			v=500;
		}else if(v>500 && v<750) {
			this.controller.get("gps-description").innerHTML="Mostly Accurate (up to 750m)";
			this.controller.get("gps-longdesc").innerHTML="Only accept results that are accurate up to 750 meters. Will work most anywhere.";
			v=750;
		}else if(v>750 && v<1001) {
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

PreferencesAssistant.prototype.deactivate = function(event) {
}

PreferencesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("fsq-account-row"), Mojo.Event.tap, this.onLoginTapped.bind(this));
	Mojo.Event.stopListening(this.controller.get("ringtone-select"), Mojo.Event.tap, this.chooseRingtone.bind(this));
	Mojo.Event.stopListening(this.controller.get("flickr-account-row"), Mojo.Event.tap, this.onFlickrTapped.bind(this));
	Mojo.Event.stopListening(this.controller.get("sliderGPS"), Mojo.Event.propertyChange, this.handleSlider.bind(this));
	Mojo.Event.stopListening(this.controller.get("numVenuesPicker"), Mojo.Event.propertyChange, this.handleNumPicker.bind(this));
	Mojo.Event.stopListening(this.controller.get("units"), Mojo.Event.propertyChange, this.handleUnits.bind(this));
	Mojo.Event.stopListening(this.controller.get("alert-type"), Mojo.Event.propertyChange, this.handleAlertType.bind(this));
	Mojo.Event.stopListening(this.controller.get("chkNotifications"), Mojo.Event.propertyChange, this.handleNotifs.bind(this));
}
