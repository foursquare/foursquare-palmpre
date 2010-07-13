function AddVenueAssistant(a,ed,v) {
  this.auth=a;
  this.editing=ed;
  this.venue=v;
  
  if(ed) {
  	this.bl="Save";
	this.lat=this.venue.geolat;
	this.long=this.venue.geolong;
  }else{
  	this.bl="Add";
    this.lat=_globals.lat;
	this.long=_globals.long;
  }
  this.refresh=true;
  	   _globals.curmap=this;

  this.searchKey='ABQIAAAAfKBxdZJp1ib9EdLiKILvVxS4B8uQk1auvfDbWvr0_ixC2Gr77hQW9SPsdN9MwAhpcUfQWOQ0VzxxaA';
  
  this.categoryName="";
  this.categoryIcon="";
  if(ed){
    if(this.venue.primarycategory.id){
	for(var i =0; i<_globals.categories.length; i++){
		if(_globals.categories[i].id==this.venue.primarycategory.id){
			this.categoryName=_globals.categories[i].nodename;
			this.categoryIcon=_globals.categories[i].iconurl;
			break;
		}
		for(var s=0;s<_globals.categories[i].categories.length;s++){
			if(_globals.categories[i].categories[s].id==this.venue.primarycategory.id){
				this.categoryName=_globals.categories[i].categories[s].nodename;
				this.categoryIcon=_globals.categories[i].categories[s].iconurl;
				break;
			}
			
			if(_globals.categories[i].categories[s].categories != undefined){
				for(var t=0; t<_globals.categories[i].categories[s].categories.length; t++){
					if(_globals.categories[i].categories[s].categories[t].id==this.venue.primarycategory.id){
						this.categoryName=_globals.categories[i].categories[t].nodename;
						this.categoryIcon=_globals.categories[i].categories[t].iconurl;
						break;
					}
				}		
			}
		}
	}
	_globals.selectedCat=this.venue.primarycategory.id;
	}
  }
	

  
}

AddVenueAssistant.prototype.setup = function(widget) {
  this.widget = widget;

	NavMenu.setup(this,{buttons:'empty'});
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);

  // Setup button and event handler
 /*   this.controller.setupWidget("setCategory",
    this.attributes = {},
    this.catButtonModel = {
      buttonLabel: "Choose Category...",
      disabled: false
    }
  );*/
  


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


  this.controller.setupWidget("searchGoogle",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.SearchButtonModel = {
      buttonLabel: 'Search Google',
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('searchGoogle'), Mojo.Event.tap, this.searchTapped.bindAsEventListener(this));

  Mojo.Log.error("setup buttons");

  
	this.controller.setupWidget('venue-name', this.nameAttributes = {hintText:'Type here to Google Search',multiline:false,focus:true}, this.nameModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-address', this.addressAttributes = {hintText:'',multiline:false,focus:false}, this.addressModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-crossstreet', this.crossstreetAttributes = {hintText:'',multiline:false,focus:false}, this.crossstreetModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-city', this.cityAttributes = {hintText:'',multiline:false,focus:false}, this.cityModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-zip', this.zipAttributes = {hintText:'',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, this.zipModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-phone', this.phoneAttributes = {hintText:'',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, this.phoneModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-twitter', this.twitterAttributes = {hintText:'',multiline:false,focus:false}, this.twitterModel = {value:'', disabled:false});


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

//	Mojo.Event.listen(this.controller.get("venue-cat-sub1"),Mojo.Event.propertyChange,this.loadSubSubCat.bindAsEventListener(this));

	//zBar.hideToolbar();
}


AddVenueAssistant.prototype.initMap = function(event) {
	var myOptions = {
    	zoom: 15,
	    center: new google.maps.LatLng(this.lat, this.long),
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
    	draggable: true,
    	mapTypeControl: false,
    	navigationControl: false
	  }
	this.map = new google.maps.Map(this.controller.get("map_canvas"), myOptions);

	this.setMarkers(this.map);
}

AddVenueAssistant.prototype.setMarkers = function(map){
	this.cmarker = new google.maps.Marker({
  		position: new google.maps.LatLng(this.lat,this.long),
	  	map: map,
	  	draggable: true
	});
	//cmarker.setDraggable(true);
	
	/*google.maps.event.addListener(cmarker, 'mousedown', 
  		function(e) {
			logthis("mousedown");
			var scroller=this.controller.getSceneScroller();
			scroller.mojo.setMode("horizontal");
		}.bind(this)
	);
	google.maps.event.addListener(cmarker, 'mouseup', 
  		function(e) {
			logthis("mouseup");
			var scroller=this.controller.getSceneScroller();
			scroller.mojo.setMode("vertical");
		}.bind(this)
	);
	google.maps.event.addListener(cmarker, "dragstart", 
  		function(e) {
			logthis("drag start");
		}.bind(this)
	);
	google.maps.event.addListener(cmarker, 'drag', 
  		function(e) {
			logthis("dragging");
		}.bind(this)
	);*/
	google.maps.event.addListener(this.map, 'click', 
  		function(e) {
			logthis("map clicked");
			
			var pos=e.latLng;
			
			this.cmarker.setPosition(pos);
			
			this.lat=pos.lat();
			this.long=pos.lng();			

			this.map.panTo(pos);
		}.bind(this)
	);


	//this.controller.stageController.activeScene().disableSceneScroller = true;
};

AddVenueAssistant.prototype.activate = function() {
/*	if (this.map === undefined) {
		// Kick off google maps initialization
		if(Maps==undefined){
			if(!Maps.isLoaded()) {
	//			this.spinnerModel.spinning = true;
	//		    this.controller.modelChanged(this.spinnerModel);
	
	//		    this.controller.get("statusinfo").update("Loading Google Maps...");
						
				Maps.loadedCallback(this.initMap.bind(this));
				initLoader();
			}else{
				this.initMap();
			}
		}
	}*/

	this.controller.get('venue-name').mojo.focus();
	
	//if we're proposing an edit to a venue, populate the fields
	if(this.editing && this.refresh) {
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

		this.controller.get("selectedCat").update('<img src="'+this.categoryIcon+'" align="top"/> '+this.categoryName);

		
		this.controller.get("addvenue-header").innerHTML="SUGGEST AN EDIT";
		this.refresh=false;
		
		
	}else{
		Mojo.Log.error("trying to get addy...lat="+_globals.lat+", long="+_globals.long);
		//try and get the reverse location...
		this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: this.lat, longitude:this.long},
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
			var ep="addvenue.json";
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
			pcat=_globals.selectedCat;
			var url = 'http://api.foursquare.com/v1/venue/proposeedit.json';
			var ep="venue/proposeedit.json";
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
				vid: this.venue.id,
				primarycategoryid: pcat
			};
		}
		/*var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: params,
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this)
		});*/
		foursquarePost(this,{
			endpoint: ep,
			requiresAuth: true,
			parameters: params,
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this),
			ignoreErrors: true
			
		});
}

AddVenueAssistant.prototype.venueSuccess = function(response) {
	this.controller.get("okButton").mojo.deactivate();
	Mojo.Log.error(response.responseText);
	
	if(response.responseJSON.venue != undefined && !this.editing) {
		Mojo.Controller.getAppController().showBanner("Venue saved to Foursquare!", {source: 'notification'});
	
		var vid=response.responseJSON.venue.id;
		var vname=response.responseJSON.venue.name;
	
		this.controller.stageController.popScene("add-venue");

		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},response.responseJSON.venue,_globals.username,_globals.password,_globals.uid);
	
	}
	
	if(response.responseJSON.error != undefined){
		switch(response.responseJSON.error){
			case "Possible Duplicate Venue":
				/*this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: $L("Uh-oh!"),
					message: $L("This looks like it might be a duplicate venue."),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});*/
				var vname=this.nameModel.value;
				var dialog = this.controller.showDialog({
					template: 'listtemplates/dupeVenue',
					assistant: new DupeVenueAssistant(this,vname)
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
	
	if(this.editing && response.responseJSON.error == undefined){
				this.controller.showAlertDialog({
					onChoose: function(value) {		this.controller.stageController.popScene("add-venue");
}.bind(this),
					title: $L("Edit Received"),
					message: $L("Venue edits are sent to a queue for Super Users to approve, so your proposed changes will not be immediately seen. If a Super User approves your proposal, the changes will be incorporated."),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});

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

AddVenueAssistant.prototype.searchTapped = function(event) {
		//logthis("q="+encodeURIComponent(this.nameModel.value));
		//logthis("c="+_globals.lat+","+_globals.long);

	if(this.nameModel.value.length>0){
		var url = 'http://ajax.googleapis.com/ajax/services/search/local';
		//logthis(url);
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			parameters: {
				v: '1.0',
				q: encodeURIComponent(this.nameModel.value),
				rsz: 'small',
				near: _globals.lat+","+_globals.long
			},
			onSuccess: this.googleSuccess.bind(this),
			onFailure: this.googleFailed.bind(this)
		});
	}else{
		this.controller.get("searchGoogle").mojo.deactivate();
		Mojo.Controller.getAppController().showBanner("Enter a venue name to search", {source: 'notification'});		
	}
};

AddVenueAssistant.prototype.googleSuccess = function(r){
	//logthis("google ok");
	//logthis(Object.toJSON(r.responseJSON));
	this.controller.get("searchGoogle").mojo.deactivate();
	var data=r.responseJSON.responseData;
	if(data){
		if(data.results){
			if(data.results.length>0){
				var vr=data.results[0];
				logthis(vr.titleNoFormatting);
				this.addressModel.value=vr.streetAddress;
				this.controller.modelChanged(this.addressModel);
				this.cityModel.value=vr.city;
				this.controller.modelChanged(this.cityModel);
				this.statemodel.value=vr.region;
				this.controller.modelChanged(this.statemodel);
				this.nameModel.value=vr.titleNoFormatting;
				this.controller.modelChanged(this.nameModel);
				
				if(vr.phoneNumbers!=undefined){
					this.phoneModel.value=vr.phoneNumbers[0].number.replace("(","").replace(")","").replace(" ","").replace("-","");
					this.controller.modelChanged(this.phoneModel);
				}
			}
		}
	}
}
AddVenueAssistant.prototype.googleFailed = function(r){
	this.controller.get("searchGoogle").mojo.deactivate();
	Mojo.Controller.getAppController().showBanner("Error searching Google", {source: 'notification'});
	logthis("google fail");
	logthis(Object.toJSON(r.responseJSON));

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
	if(response.responseJSON.error != undefined){
		switch(response.responseJSON.error){
			case "Possible Duplicate Venue":
				/*this.controller.showAlertDialog({
					onChoose: function(value) {},
					title: $L("Uh-oh!"),
					message: $L("This looks like it might be a duplicate venue."),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});*/
				var vname=this.nameModel.value;
				var dialog = this.controller.showDialog({
					template: 'listtemplates/dupeVenue',
					assistant: new DupeVenueAssistant(this,vname)
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
	}else{
		Mojo.Controller.getAppController().showBanner("Error saving your venue.", {source: 'notification'});
	}
}
AddVenueAssistant.prototype.cancelTapped = function() {
	this.controller.stageController.popScene("add-venue");
}

AddVenueAssistant.prototype.cleanup = function(event) {
	//zBar.showToolbar();
  Mojo.Event.stopListening(this.controller.get('setCategory'), Mojo.Event.tap, this.categoryTapped.bindAsEventListener(this));
  Mojo.Event.stopListening(this.controller.get('okButton'), Mojo.Event.tap, this.okTapped.bindAsEventListener(this));
  Mojo.Event.stopListening(this.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTapped.bindAsEventListener(this));

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
	this.refresh=false;
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