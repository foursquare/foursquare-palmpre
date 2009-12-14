function AddVenueAssistant(a) {
  this.auth=a;
}
AddVenueAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  //Mojo.Log.error("################checkin: "+this.data);
  //this.initData(this.data);
  Mojo.Log.error("setup starting");

  // Setup button and event handler
  this.controller.setupWidget("okButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Add",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('okButton'), Mojo.Event.tap, this.okTapped.bindAsEventListener(this));

  this.controller.setupWidget("cancelButton",
    this.attributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTapped.bindAsEventListener(this));
  Mojo.Log.error("setup buttons");

  
	this.controller.setupWidget('venue-name', this.nameAttributes = {hintText:'Venue Name',multiline:false,focus:true}, this.nameModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-address', this.addressAttributes = {hintText:'Address',multiline:false,focus:false}, this.addressModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-crossstreet', this.crossstreetAttributes = {hintText:'Cross Street',multiline:false,focus:false}, this.crossstreetModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-city', this.cityAttributes = {hintText:'City',multiline:false,focus:false}, this.cityModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-zip', this.zipAttributes = {hintText:'Zip',multiline:false,focus:false}, this.zipModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-phone', this.phoneAttributes = {hintText:'Phone',multiline:false,focus:false}, this.phoneModel = {value:'', disabled:false});

Mojo.Log.error("setup textbxes");


    this.controller.setupWidget("venue-state",
        this.stateattributes = {
            choices: [
                {label: "AL", value: "AL"},
                {label: "AK", value: "AK"},
                {label: "AR", value: "AR"},
                {label: "AZ", value: "AZ"},
                {label: "CA", value: "CA"},
                {label: "CO", value: "CO"},
                {label: "CT", value: "CT"},
                {label: "DC", value: "DC"},
                {label: "DE", value: "DE"},
                {label: "FL", value: "FL"},
                {label: "GA", value: "GA"},
                {label: "HI", value: "HI"},
                {label: "IA", value: "IA"},
                {label: "ID", value: "ID"},
                {label: "IL", value: "IL"},
                {label: "IN", value: "IN"},
                {label: "KS", value: "KS"},
                {label: "KY", value: "KY"},
                {label: "LA", value: "LA"},
                {label: "MA", value: "MA"},
                {label: "MD", value: "MD"},
                {label: "ME", value: "ME"},
                {label: "MI", value: "MI"},
                {label: "MN", value: "MN"},
                {label: "MO", value: "MO"},
                {label: "MS", value: "MS"},
                {label: "MT", value: "MT"},
                {label: "NC", value: "NC"},
                {label: "ND", value: "ND"},
                {label: "NE", value: "NE"},
                {label: "NH", value: "NH"},
                {label: "NJ", value: "NJ"},
                {label: "NM", value: "NM"},
                {label: "NV", value: "NV"},
                {label: "NY", value: "NY"},
                {label: "OH", value: "OH"},
                {label: "OK", value: "OK"},
                {label: "OR", value: "OR"},
                {label: "PA", value: "PA"},
                {label: "RI", value: "RI"},
                {label: "SC", value: "SC"},
                {label: "SD", value: "SD"},
                {label: "TN", value: "TN"},
                {label: "TX", value: "TX"},
                {label: "UT", value: "UT"},
                {label: "VA", value: "VA"},
                {label: "VT", value: "VT"},
                {label: "WA", value: "WA"},
                {label: "WI", value: "WI"},
                {label: "WV", value: "WV"},
                {label: "WY", value: "WY"}
                ]},

        this.statemodel = {
        value: "AL",
        disabled: false
        }
    );



Mojo.Log.error("setuplist");
//	this.init();
}

AddVenueAssistant.prototype.activate = function() {
	$('venue-name').mojo.focus();
}


AddVenueAssistant.prototype.okTapped = function() {
Mojo.Log.error("### we got not auth!");
	if (this.auth) {
		Mojo.Log.error("############trying to add venue");
  		this.cookieData=new Mojo.Model.Cookie("credentials");
		var credentials=this.cookieData.get();

		var url = 'http://api.foursquare.com/v1/addvenue.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: this.auth
			},
			parameters: {
				name: this.nameModel.value,
				address: this.addressModel.value,
				crossstreet: this.crossstreetModel.value,
				city: this.cityModel.value,
				state: this.statemodel.value,
				zip: this.zipModel.value,
				cityid: credentials.cityid,
				phone: this.phoneModel.value
			},
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
	

//	this.widget.mojo.close();
}

AddVenueAssistant.prototype.venueSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("New venue added to Foursquare!", {source: 'notification'});
	Mojo.Log.error(response.responseText);
	$("okButton").mojo.deactivate();
	this.controller.stageController.popScene("add-venue");
}

AddVenueAssistant.prototype.venueFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error saving your new venue.", {source: 'notification'});
}
AddVenueAssistant.prototype.cancelTapped = function() {
	this.controller.stageController.popScene("add-venue");
}
