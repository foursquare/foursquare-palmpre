function PreferencesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	zBar.hideToolbar();		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */

	this.controller.setupWidget('goLogin', this.accattributes = {}, this.loginBtnModel = {label:'Set up account...', disabled:false});
	this.controller.setupWidget('goFlickr', this.flickrattributes = {}, this.flickrBtnModel = {label:'Set Up Flickr Account', disabled:false});
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

    this.controller.setupWidget("numVenuesPicker",
          this.numattributes = {
              label: 'Number',
              modelProperty: 'value',
              min: 10,
              max: 50
 
          },
          this.nummodel = {
              value: 15
          });
    this.controller.setupWidget("units",
        this.unitsattributes = {
            choices: [
                {label: "SI", value: "si"},
                {label: "Metric", value: "metric"}
                ]},

        this.unitsmodel = {
        value: "si",
        disabled: false
        }
    );
         
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTapped.bind(this));
	Mojo.Event.listen(this.controller.get("goFlickr"), Mojo.Event.tap, this.onFlickrTapped.bind(this));
	Mojo.Event.listen(this.controller.get("sliderGPS"), Mojo.Event.propertyChange, this.handleSlider.bind(this));
	Mojo.Event.listen(this.controller.get("numVenuesPicker"), Mojo.Event.propertyChange, this.handleNumPicker.bind(this));
	Mojo.Event.listen(this.controller.get("units"), Mojo.Event.propertyChange, this.handleUnits.bind(this));

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
		$("flickrInfo").innerHTML="Account: <b>"+_globals.flickr_username+"</b>";
	}
}

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

}
PreferencesAssistant.prototype.handleSlider = function(event) {
	if(event.type===Mojo.Event.propertyChange || event=="setup-routine") {
		var v=this.slidemodel.value*-1; //make it positive
		if(v==0) {
			$("gps-description").innerHTML="Don't Care";
			$("gps-longdesc").innerHTML="Accept the first GPS result regardless of how accurate it is.";
		}else if(v>0 && v<150) {
			$("gps-description").innerHTML="Super Accurate (up to 150m)";
			$("gps-longdesc").innerHTML="Only accept results that are accurate up to 150 meters. Will probably be slow indoors.";
			v=150;
		}else if(v>150 && v<500) {
			$("gps-description").innerHTML="Accurate (up to 500m)";
			$("gps-longdesc").innerHTML="Only accept results that are accurate up to 500 meters. May be slow indoors.";
			v=500;
		}else if(v>500 && v<750) {
			$("gps-description").innerHTML="Mostly Accurate (up to 750m)";
			$("gps-longdesc").innerHTML="Only accept results that are accurate up to 750 meters. Will work most anywhere.";
			v=750;
		}else if(v>750 && v<1001) {
			$("gps-description").innerHTML="Not So Accurate (up to 1000m)";
			$("gps-longdesc").innerHTML="Only accept results that are accurate up to 1000 meters. Might say you're several blocks away if cloudy or indoors.";
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
		
		Mojo.Log.error("###saving venueCount: "+v);
		
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

PreferencesAssistant.prototype.saveVenueCount = function(event) {

}
PreferencesAssistant.prototype.onLoginTapped = function() {
			this.controller.stageController.pushScene('main',false,undefined,true);

}
PreferencesAssistant.prototype.onFlickrTapped = function() {
			this.controller.stageController.pushScene('flickr-auth',this);

}

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   zBar.showToolbar();
}
