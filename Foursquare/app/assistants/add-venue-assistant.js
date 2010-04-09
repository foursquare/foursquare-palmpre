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

  // Setup button and event handler
    this.controller.setupWidget("setCategory",
    this.attributes = {},
    this.catButtonModel = {
      buttonLabel: "Choose Category...",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('setCategory'), Mojo.Event.tap, this.categoryTapped.bindAsEventListener(this));

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
	this.controller.setupWidget('venue-zip', this.zipAttributes = {hintText:'Zip',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, this.zipModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-phone', this.phoneAttributes = {hintText:'Phone',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, this.phoneModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-twitter', this.twitterAttributes = {hintText:'Twitter Username',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, this.twitterModel = {value:'', disabled:false});


	this.catsmainAttributes={choices:[{label:'',value:'-1'}]};
	this.catsmainModel={value:'-1'};
	for (var c=0;c<_globals.categories.length;c++) {
		this.catsmainAttributes.choices.push({label:_globals.categories[c].nodename,value:c});
	}

	/*this.catssub1Attributes={choices:[]};
	this.catssub1Model={value:''};
	this.controller.setupWidget("venue-cat-sub1",
		this.catssub1Attributes,this.catssub1Model
	);

	this.catssub2Attributes={choices:[]};
	this.catssub2Model={value:''};
	this.controller.setupWidget("venue-cat-sub2",
		this.catssub2Attributes,this.catssub2Model
	);*/

    this.controller.setupWidget("venue-state",
        this.stateattributes = {
            choices: [
                {label: "  ", value: ""},
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
        value: "",
        disabled: false
        }
    );

	Mojo.Event.listen(this.controller.get("venue-cat-sub1"),Mojo.Event.propertyChange,this.loadSubSubCat.bindAsEventListener(this));

	//zBar.hideToolbar();
}

AddVenueAssistant.prototype.activate = function() {
	this.controller.get('venue-name').mojo.focus();
	
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

		this.twitterModel.value=this.venue.twitter;
		this.controller.modelChanged(this.twitterModel);

		this.statemodel.value=this.venue.state;
		this.controller.modelChanged(this.statemodel);
		
		this.controller.get("addvenue-header").innerHTML="Edit Venue";
		
	}else{
		Mojo.Log.error("trying to get addy...lat="+_globals.lat+", long="+_globals.long);
		//try and get the reverse location...
		this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: _globals.lat, longitude:_globals.long},
			onSuccess: this.gotLocation.bind(this),
			onFailure: this.failedLocation.bind(this)
		});

	}
}

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}


AddVenueAssistant.prototype.gotLocation = function(event) {
	//example response: 123 Abc Street ; Your Town, ST 12345 ; USA 
	//we're worried about the middle line, so we get to do some fun parsing.
	//no, seriously, parsing's the most fun part of programming.
	//i wish this whole app was just parsing text. boresquare, some would call it.
	if (event.address){
		var addylines=event.address.split(";");
		if(addylines.length>1) {
			var loca=addylines[1].split(", ");
			var city=trim(loca[0]);
			var country=trim(addylines[2]);
			if(country!="USA"){this.controller.get("venue-state").hide();}
		
			var statezip=loca[1].split(" ");
			var state=trim(statezip[0]);
			var zip=trim(statezip[1]);
			if(zip.indexOf("A")){zip=zip.replace("A","");}
	
			this.cityModel.value=city;
			this.controller.modelChanged(this.cityModel);

			this.zipModel.value=zip;
			this.controller.modelChanged(this.zipModel);
		
			this.statemodel.value=state;
			this.controller.modelChanged(this.statemodel);

		}
	}
}
AddVenueAssistant.prototype.failedLocation = function(event) {
	//don't worry about it. make them manually enter the info in.
	Mojo.Log.error("error getting addy: "+event.errorCode);
}

AddVenueAssistant.prototype.okTapped = function() {
  		this.cookieData=new Mojo.Model.Cookie("credentials");
		var credentials=this.cookieData.get();

		if(!this.editing) {
			pcat=_globals.selectedCat;
			var url = 'http://api.foursquare.com/v1/addvenue.json';
			var params={
				name: this.nameModel.value,
				address: this.addressModel.value,
				crossstreet: this.crossstreetModel.value,
				city: this.cityModel.value,
				state: this.statemodel.value,
				zip: this.zipModel.value,
				geolat: _globals.lat,
				geolong: _globals.long,
				phone: this.phoneModel.value,
				twitter: this.twitterModel.value,
				primarycategoryid: pcat
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
				twitter: this.twitterModel.value,
				geolat: _globals.lat,
				geolong: _globals.long,
				vid: this.venue.id
			};
		}
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: params,
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this)
		});
}

AddVenueAssistant.prototype.venueSuccess = function(response) {
	this.controller.get("okButton").mojo.deactivate();
	Mojo.Log.error(response.responseText);
	
	if(response.responseJSON.venue != undefined) {
		Mojo.Controller.getAppController().showBanner("Venue saved to Foursquare!", {source: 'notification'});
	
		var vid=response.responseJSON.venue.id;
		var vname=response.responseJSON.venue.name;
	
		this.controller.stageController.popScene("add-venue");

		this.controller.stageController.swapScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},response.responseJSON.venue,_globals.username,_globals.password,_globals.uid);
	
	}
	
	if(response.responseJSON.error != undefined){
		switch(response.responseJSON.error){
			case "Possible Duplicate Venue":
				this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: $L("Uh-oh!"),
					message: $L("This looks like it might be a duplicate venue."),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});
				break;
			default:
				this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: $L("Uh-oh!"),
					message: $L(response.responseJSON.error),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});
				break;
		}
	}
	
}


AddVenueAssistant.prototype.promptCheckin = function(vid,vname) {
	checkinDialog = this.controller.showDialog({
		template: 'listtemplates/do-checkin',
		assistant: new DoCheckinDialogAssistant(this,vid,vname)
	});

}

AddVenueAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: id,
				shout: s,
				private: sf,
				twitter: t,
				facebook: fb
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});
}

AddVenueAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	
	var json=response.responseJSON;
	this.controller.stageController.popScene("add-venue");
	this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);

}

AddVenueAssistant.prototype.checkInFailed = function(response) {
	this.controller.stageController.popScene("add-venue");
	Mojo.Log.error('Check In Failed: ' + repsonse.responseText);
	Mojo.Controller.getAppController().showBanner("Error checking in!", {source: 'notification'});
}


AddVenueAssistant.prototype.venueFailed = function(response) {
	Mojo.Log.error(response.responseText);
	Mojo.Controller.getAppController().showBanner("Error saving your venue.", {source: 'notification'});
}
AddVenueAssistant.prototype.cancelTapped = function() {
	this.controller.stageController.popScene("add-venue");
}

AddVenueAssistant.prototype.cleanup = function(event) {
	//zBar.showToolbar();
}

AddVenueAssistant.prototype.loadSubCat = function(event) {
	var i = this.catsmainModel.value;
	this.maincat=i;
	var subcats=_globals.categories[i].categories;
	this.catssub1Attributes.choices=[{label:"",value:"-1"}];
	for(var s=0;s<subcats.length;s++) {
		this.catssub1Attributes.choices.push({label:subcats[s].nodename,value:subcats[s].id});
	}
	this.controller.modelChanged(this.catssub1Model);
	this.controller.get("subcat1").show();
}

AddVenueAssistant.prototype.loadSubSubCat = function(event) {
	var v = event.value;
	var eff;
	for(var f=0;f<_globals.categories[this.maincat].categories.length;f++){
		if(_globals.categories[this.catsmainModel.value].categories[f].id==v){
			eff=f;
		}
	}
	var subcats=_globals.categories[this.catsmainModel.value].categories[eff].categories;



	if(subcats) {
		this.catssub2Attributes.choices=[{label:"",value:"-1"}];
		for(var s=0;s<subcats.length;s++) {
			this.catssub2Attributes.choices.push({label:subcats[s].nodename,value:subcats[s].id});
		}
		this.controller.modelChanged(this.catssub2Model);
		this.controller.get("subcat2").show();
	}else{
		this.catssub2Attributes.choices=[{label:"",value:"-1"}];
		this.controller.modelChanged(this.catssub2Model);
		this.controller.get("subcat2").hide();
	}
}

AddVenueAssistant.prototype.categoryTapped = function(event){
	//generate items list
	Mojo.Log.error("catlength="+_globals.categories.length);
	this.controller.stageController.pushScene("categories",this);
	
	
	/*
	var items=[];
	for(var i =0; i<_globals.categories.length; i++){
		var a={};
		a.label=$L(_globals.categories[i].nodename);
		a.command=_globals.categories[i].id;
		a.secondaryIconPath=_globals.categories[i].iconurl;
		
		var subitems=[];
		for(var s=0;s<_globals.categories[i].categories.length;s++){
			var b={};
			b.label=$L(_globals.categories[i].categories[s].nodename);
			b.command=b.label+"|||"+_globals.categories[i].categories[s].id;
			b.secondaryIconPath=_globals.categories[i].categories[s].iconurl;
			
			if(_globals.categories[i].categories[s].categories != undefined){
				var subsub=[{label:$L('Use: '+b.label), command: b.command}];
				for(var t=0; t<_globals.categories[i].categories[s].categories.length; t++){
					var c={};
					c.label=_globals.categories[i].categories[s].categories[t].nodename;
					c.command=c.label+"|||"+_globals.categories[i].categories[s].categories[t].id;
					c.secondaryIconPath=_globals.categories[i].categories[s].categories[t].iconurl;
					subsub.push(c);
				}
				
				b.items=subsub;
			}
			subitems.push(b);
		}
		
		a.items=subitems;
		items.push(a);

	}

	this.controller.popupSubmenu({
		onChoose:function(choice){
			var data=choice.split("|||");
			this.categoryId=data[1];
			this.catButtonModel.buttonLabel=data[0];
			this.controller.modelChanged(this.catButtonModel);
			
		}.bind(this),
       	placeNear:this.controller.get(event.target),
		items: items
	});
*/
}