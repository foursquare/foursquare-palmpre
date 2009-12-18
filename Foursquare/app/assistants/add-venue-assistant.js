function AddVenueAssistant(a,ed,v) {
  this.auth=a;
  this.editing=ed;
  this.venue=v;
  
  if(ed) {
  	this.bl="Save";
  }else{
  	this.bl="Add";
  }
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
      buttonLabel: this.bl,
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
	
	//if we're proposing an edit to a venue, populate the fields
	if(this.editing) {
		this.nameModel.value=this.venue.name;
		this.controller.modelChanged(this.nameModel);

		this.addressModel.value=this.venue.address;
		this.controller.modelChanged(this.addressModel);

		this.crossstreetModel.value=this.venue.crossstreet;
		this.controller.modelChanged(this.crossstreetModel);

		this.cityModel.value=this.venue.city;
		this.controller.modelChanged(this.cityModel);

		this.zipModel.value=this.venue.zip;
		this.controller.modelChanged(this.zipModel);

		this.phoneModel.value=this.venue.phone;
		this.controller.modelChanged(this.phoneModel);

		this.statemodel.value=this.venue.state;
		this.controller.modelChanged(this.statemodel);
		
		$("addvenue-header").innerHTML="Edit Venue";
		
	}
}


AddVenueAssistant.prototype.okTapped = function() {
Mojo.Log.error("### we got not auth!");
	if (this.auth) {
		Mojo.Log.error("############trying to add venue");
  		this.cookieData=new Mojo.Model.Cookie("credentials");
		var credentials=this.cookieData.get();

		if(!this.editing) {
			var url = 'http://api.foursquare.com/v1/addvenue.json';
			var params={
				name: this.nameModel.value,
				address: this.addressModel.value,
				crossstreet: this.crossstreetModel.value,
				city: this.cityModel.value,
				state: this.statemodel.value,
				zip: this.zipModel.value,
				cityid: credentials.cityid,
				phone: this.phoneModel.value
			};
		}else{
			var url = 'http://api.foursquare.com/v1/venue/proposeedit.json';
			var params={
				name: this.nameModel.value,
				address: this.addressModel.value,
				crossstreet: this.crossstreetModel.value,
				city: this.cityModel.value,
				state: this.statemodel.value,
				zip: this.zipModel.value,
				cityid: credentials.cityid,
				phone: this.phoneModel.value,
				geolat: _globals.lat,
				geolong: _globals.long,
				vid: this.venue.id
			};
		}
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: this.auth
			},
			parameters: params,
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this)
		});
	} else {
		//$('message').innerHTML = 'Not Logged In';
	}
	

//	this.widget.mojo.close();
}

AddVenueAssistant.prototype.venueSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue saved to Foursquare!", {source: 'notification'});
	Mojo.Log.error(response.responseText);
	$("okButton").mojo.deactivate();
	this.controller.stageController.popScene("add-venue");
}

AddVenueAssistant.prototype.venueFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error saving your venue.", {source: 'notification'});
}
AddVenueAssistant.prototype.cancelTapped = function() {
	this.controller.stageController.popScene("add-venue");
}
