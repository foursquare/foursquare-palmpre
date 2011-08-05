function AddVenueAssistant(a,ed,v,vn) {
  this.auth=a;
  this.editing=ed;
  this.venue=v;
  if(vn!="" && vn!=undefined){
  	this.fakeVenue=vn;
  	this.venueless=true;
  }else{
  	this.fakeVenue='';
  	this.venueless=false;
  }
  
  if(ed) {
  	this.bl="Save";
	this.lat=this.venue.location.lat;
	this.long=this.venue.location.lng;
  }else{
  	this.bl="Add";
    this.lat=_globals.lat;
	this.long=_globals.long;
  }
  this.lat=_globals.lat;
  this.long=_globals.long;
  
  this.refresh=true;
  _globals.curmap=this;
  
  this.categoryName="";
  this.categoryIcon="";
  if(ed){
    if(this.venue.categories.length>0){
	for(var i =0; i<_globals.categories.length; i++){
		if(_globals.categories[i].id==this.venue.categories[0].id){
			this.categoryName=_globals.categories[i].name;
			this.categoryIcon=_globals.categories[i].icon;
			break;
		}
		for(var s=0;s<_globals.categories[i].categories.length;s++){
			if(_globals.categories[i].categories[s].id==this.venue.categories[0].id){
				this.categoryName=_globals.categories[i].categories[s].name;
				this.categoryIcon=_globals.categories[i].categories[s].icon;
				break;
			}
			
			if(_globals.categories[i].categories[s].categories != undefined){
				for(var t=0; t<_globals.categories[i].categories[s].categories.length; t++){
					if(_globals.categories[i].categories[s].categories[t].id==this.venue.categories[0].id){
						this.categoryName=_globals.categories[i].categories[t].name;
						this.categoryIcon=_globals.categories[i].categories[t].icon;
						break;
					}
				}		
			}
		}
	}
	_globals.selectedCat=this.venue.categories[0].id;
	}
  }
	

  
}

AddVenueAssistant.prototype.setup = function(widget) {
  this.widget = widget;

  NavMenu.setup(this,{buttons:'empty'});

  this.categoryTappedBound=this.categoryTapped.bindAsEventListener(this);
  this.okTappedBound=this.okTapped.bindAsEventListener(this);
  this.cancelTappedBound=this.cancelTapped.bindAsEventListener(this);
  this.toggleMapBound=this.toggleMap.bindAsEventListener(this);
  this.searchTappedBound=this.searchTapped.bindAsEventListener(this);
  

  this.controller.setupWidget("okButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: this.bl,
      disabled: false
    }
  );
  

  this.controller.setupWidget("cancelButton",
    this.attributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );


  this.controller.setupWidget("searchGoogle",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.SearchButtonModel = {
      buttonLabel: 'Search Google',
      disabled: false
    }
  );
  
      this.controller.setupWidget("mapDrawer",
        this.attributes = {
            modelProperty: 'open',
            unstyled: false
        },
        this.model = {
            open: false
        }
    );
  this.controller.setupWidget("toggleMapButton",
    this.attributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Edit Map Position",
      disabled: false
    }
  );
  
  Mojo.Event.listen(this.controller.get('okButton'), Mojo.Event.tap, this.okTappedBound);
  Mojo.Event.listen(this.controller.get('setCategory'), Mojo.Event.tap, this.categoryTappedBound);
  Mojo.Event.listen(this.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTappedBound);
  Mojo.Event.listen(this.controller.get('map'), Mojo.Event.tap, this.toggleMapBound);  
  Mojo.Event.listen(this.controller.get('searchGoogle'), Mojo.Event.tap, this.searchTappedBound);

  logthis("setup buttons");

  
	this.controller.setupWidget('venue-name', this.nameAttributes = {hintText:'Type here to Google Search',multiline:false,focus:true}, 
			this.nameModel = {value:this.fakeVenue, disabled:false});
	this.controller.setupWidget('venue-address', this.addressAttributes = {hintText:'',multiline:false,focus:false}, 
			this.addressModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-crossstreet', this.crossstreetAttributes = {hintText:'',multiline:false,focus:false}, 
			this.crossstreetModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-city', this.cityAttributes = {hintText:'',multiline:false,focus:false}, 
			this.cityModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-zip', this.zipAttributes = {hintText:'',multiline:false,focus:false,modifierState:Mojo.Widget.numLock},
			 this.zipModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-phone', this.phoneAttributes = {hintText:'',multiline:false,focus:false,modifierState:Mojo.Widget.numLock}, 
			this.phoneModel = {value:'', disabled:false});
	this.controller.setupWidget('venue-twitter', this.twitterAttributes = {hintText:'',multiline:false,focus:false}, 
			this.twitterModel = {value:'', disabled:false});


	this.catsmainAttributes={choices:[{label:'',value:'-1'}]};
	this.catsmainModel={value:'-1'};
	for (var c=0;c<_globals.categories.length;c++) {
		this.catsmainAttributes.choices.push({label:_globals.categories[c].nodename,value:c});
	}


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

}

AddVenueAssistant.prototype.scrollTest = function(a,b,c,d,e){
/*	Mojo.Log.error("state="+Object.toJSON(this.controller.get('mojo-scene-add-venue-scene-scroller').mojo.getScrollPosition()));	
	
	var ss=this.controller.get('mojo-scene-add-venue-scene-scroller').mojo.getScrollPosition();
	
	if(ss.top < -132){
		this.controller.get("map_canvas").show();
		this.controller.get("map-info-banner").show();
	}else{
		this.controller.get("map_canvas").hide();
		this.controller.get("map-info-banner").hide();
	}
};

AddVenueAssistant.prototype.toggleMap = function(event) {
	this.controller.stageController.pushScene({name: "add-venue-map",disableSceneScroller: true},this.lat,this.long,this);
};

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
	logthis("addvenue: activated");
	logthis("av lat="+this.lat+", long="+this.long);

	this.controller.get("map").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x150&sensor=false&markers=color:blue|"+this.lat+","+this.long+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";

	this.controller.get('venue-name').mojo.focus();
	
	//if we're proposing an edit to a venue, populate the fields
	if(this.editing && this.refresh) {
		this.nameModel.value=this.venue.name;
		this.controller.modelChanged(this.nameModel);

		this.addressModel.value=this.venue.location.address;
		this.controller.modelChanged(this.addressModel);

		this.crossstreetModel.value=this.venue.location.crossStreet;
		this.controller.modelChanged(this.crossstreetModel);

		this.cityModel.value=this.venue.location.city;
		this.controller.modelChanged(this.cityModel);

		this.zipModel.value=this.venue.location.postalCoad;
		this.controller.modelChanged(this.zipModel);

		this.phoneModel.value=this.venue.contact.phone;
		this.controller.modelChanged(this.phoneModel);

		this.twitterModel.value=this.venue.contact.twitter;
		this.controller.modelChanged(this.twitterModel);

		this.statemodel.value=this.venue.location.state;
		this.controller.modelChanged(this.statemodel);

		this.controller.get("selectedCat").update('<img src="'+this.categoryIcon+'" align="top"/> '+this.categoryName);

		
		this.controller.get("addvenue-header").innerHTML="SUGGEST AN EDIT";
		this.refresh=false;
		
		
	}else{
		logthis("trying to get addy...lat="+_globals.lat+", long="+_globals.long);
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

AddVenueAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();
};
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
	logthis("error getting addy: "+event.errorCode);
}

AddVenueAssistant.prototype.okTapped = function() {
  		this.cookieData=new Mojo.Model.Cookie("credentials");
		var credentials=this.cookieData.get();

	if(_globals.selectedCat){
		if(!this.editing) {
			pcat=_globals.selectedCat;
			var url = 'https://api.foursquare.com/v1/addvenue.json';
			var ep="venues/add";
			
			var params={};
			if(this.nameModel.value!=''){params.name=this.nameModel.value;}
			if(this.addressModel.value!=''){params.address=this.addressModel.value;}
			if(this.crossstreetModel.value!=''){params.crossStreet=this.crossstreetModel.value;}
			if(this.cityModel.value!=''){params.city=this.cityModel.value;}
			if(this.statemodel.value!=''){params.state=this.statemodel.value;}
			if(this.zipModel.value!=''){params.zip=this.zipModel.value;}
			params.ll=this.lat+','+this.long;
			if(this.phoneModel.value!=''){params.phone=this.phoneModel.value;}
			if(this.twitterModel.value!=''){params.twitter=this.twitterModel.value;}
			if(pcat.length>0){params.primaryCategoryId=pcat;}
		}else{
			pcat=_globals.selectedCat;
			var url = 'https://api.foursquare.com/v1/venue/proposeedit.json';
			var ep="venues/"+this.venue.id+"/proposeedit";
			
			var params={};
			if(this.nameModel.value!=''){params.name= this.nameModel.value;}
			if(this.addressModel.value!=''){params.address=this.addressModel.value;}
			if(this.crossstreetModel.value!=''){params.crossStreet=this.crossstreetModel.value;}
			if(this.cityModel.value!=''){params.city=this.cityModel.value;}
			if(this.statemodel.value!=''){params.state=this.statemodel.value;}
			if(this.zipModel.value!=''){params.zip=this.zipModel.value;}
			if(this.phoneModel.value!=''){params.phone=this.phoneModel.value;}
			if(this.twitterModel.value!=''){params.twitter=this.twitterModel.value;}
			params.ll=this.lat+','+this.long;
			if(pcat.length>0){params.primaryCategoryId=pcat;}
		}
		foursquarePost(this,{
			endpoint: ep,
			requiresAuth: true,
			parameters: params,
			debug: true,
			onSuccess: this.venueSuccess.bind(this),
			onFailure: this.venueFailed.bind(this),
			ignoreErrors: true
			
		});
	}else{
		this.controller.get("okButton").mojo.deactivate();
		this.controller.showAlertDialog({
			onChoose: function(value) {},
			title: $L("Uh-oh!"),
			message: $L("Make sure you select a category before adding or editing a venue!"),
			choices:[
				{label:$L('OK'), value:"OK", type:'primary'}
			]
		});

	}
}

AddVenueAssistant.prototype.venueSuccess = function(response) {
	this.controller.get("okButton").mojo.deactivate();
	logthis(response.responseText);
	
	if(response.responseJSON.response.venue != undefined && !this.editing) {
		Mojo.Controller.getAppController().showBanner("Venue saved to Foursquare!", {source: 'notification'});
	
		var vid=response.responseJSON.response.venue.id;
		var vname=response.responseJSON.response.venue.name;
	
		this.controller.stageController.popScene("add-venue");

		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.crossFade, disableSceneScroller: true},response.responseJSON.response.venue,_globals.username,_globals.password,_globals.uid,true,this,false,false);
	
	}
	
	if(response.responseJSON.meta.errorType != undefined){
		switch(response.responseJSON.error){
			case "Possible Duplicate Venue":
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
	
	if(this.editing && response.responseJSON.meta.errorType == undefined){
				this.controller.showAlertDialog({
					onChoose: function(value) {
							this.controller.stageController.popScene("add-venue");
					}.bind(this),
					title: $L("Edit Received"),
					message: $L("Venue edits are sent to a queue for Super Users to approve, so your proposed changes will not be immediately seen. If a Super User approves your proposal, the changes will be incorporated."),
					choices:[
						{label:$L('OK'), value:"OK", type:'primary'}
					]
				});

	}
	
	
}




AddVenueAssistant.prototype.searchTapped = function(event) {

	if(this.nameModel.value.length>0){
		var url = 'http://ajax.googleapis.com/ajax/services/search/local';
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

AddVenueAssistant.prototype.venueFailed = function(response) {
	logthis(response.responseText);
	if(response.responseJSON.error != undefined){
		switch(response.responseJSON.error){
			case "Possible Duplicate Venue":
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
  Mojo.Event.stopListening(this.controller.get('okButton'), Mojo.Event.tap, this.okTappedBound);
  Mojo.Event.stopListening(this.controller.get('setCategory'), Mojo.Event.tap, this.categoryTappedBound);
  Mojo.Event.stopListening(this.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTappedBound);
  Mojo.Event.stopListening(this.controller.get('map'), Mojo.Event.tap, this.toggleMapBound);  
  Mojo.Event.stopListening(this.controller.get('searchGoogle'), Mojo.Event.tap, this.searchTappedBound);
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
	logthis("catlength="+_globals.categories.length);
	this.controller.stageController.pushScene("categories",this);
	
}