function VenuedetailAssistant(venue,u,p,i,fui,ps,fm,fl) {
	   this.venue=venue;
	   this.venue.name=(this.venue.name!=undefined)? this.venue.name.replace("✈","<img src=\"images/plane-large-white.png\">"): "";
	   this.username=_globals.username;
	   this.password=_globals.password;
	   this.uid=_globals.uid;
	   this.fromuserinfo=fui;
	   this.vgeolat=this.venue.geolat;
	   this.vgeolong=this.venue.geolong;
	   this.prevScene=ps;
	   this.fromMap=fm;
	   this.fromLaunch=fl;
	   this.inOverview=true;
	   this.metatap=false;
	   this.gotInfo=false;
}
VenuedetailAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

VenuedetailAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});
	this.controller.get("snapMayor").hide();
	this.controller.get("checkinVenueName").innerHTML=this.venue.name.replace("✈","<img src=\"images/plane-large-white.png\">");
	this.controller.get("checkinVenueAddress").innerHTML=this.venue.location.address ? this.venue.location.address: '';
	if (this.venue.location.crossStreet) {
		this.controller.get("checkinVenueAddress").innerHTML += " ("+this.venue.location.crossStreet+")";
	}

	var query=encodeURIComponent(this.venue.location.address+' '+this.venue.location.city+', '+this.venue.location.state);
	this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+this.venue.location.lat+","+this.venue.location.lng+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	//zBar.render("venue","");
	this.getVenueInfo();
	
   /* this.controller.setupWidget("detailScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
         });*/
	this.controller.setupWidget("overlayScroller",
         this.scroll2Attributes = {
             mode: 'vertical-snap'
         },
         this.scroll2Model = {
         });

	this.controller.setupWidget("specialScroller",
         this.scroll3Attributes = {
             mode: 'horizontal-snap'
         },
         this.scroll3Model = {
         	snapIndex: 0
         });


	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

/*    this.controller.setupWidget("venueSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });*/
  	this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('venueSpinner', this.spinnerAttr, this.spinnerModel);
	this.controller.get("venueSpinner").show();
         

    this.controller.setupWidget("checkinButton",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Check-in Here",
            disabled: false
        });
    this.controller.setupWidget("buttonMarkClosed",
        this.buttonAttributesClosed = {
            },
        this.buttonModelClosed = {
            label : "Flag Closed",
            disabled: false
        });
    this.controller.setupWidget("buttonProposeEdit",
        this.buttonAttributesEdit = {
            },
        this.buttonModelEdit = {
            label : "Propose Edit",
            disabled: false
        });
	this.controller.setupWidget("mayorDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
	this.controller.setupWidget("venueTipsContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });

	this.controller.setupWidget("tagsDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
	this.controller.setupWidget("venueInfoContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
	this.controller.setupWidget("mapDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
	this.controller.setupWidget("venueSpecialsContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: true
         });
    this.controller.setupWidget("overlaySpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('results-meta-list', 
					      {itemTemplate:'listtemplates/overlayItems'},
					      this.resultsModel);
    


	this.tipsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('tips-list', 
					      {
					      	itemTemplate:'listtemplates/vtipsitem',
					      	formatters: {
					      		"photo":this.fmtTipPhoto.bind(this),
					      		"user":this.fmtTipUser.bind(this),
					      		"createdAt":this.fmtTipWhen.bind(this)
					      		}
							},
					      this.tipsModel
					      );
    

    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
		this.cmModel={
          	visible: true,
        	items: [ 
                 {
                 items: [
	                	{},
    	             { label: "", command: "add-Photo",iconPath: 'images/add-photo.png'},
    	             { label: "", command: "add-Tip",iconPath: 'images/add-tip.png'},
    	             { label: "", command: "add-Todo", iconPath: 'images/add-todo.png'},
    	             { label: "", command: "flag-venue", iconPath: 'images/flag-venue.png'},
    	             { label: "", command: "share-venue", icon: 'send'},
    	             {}
    	         ]
    	             }
                 
                 ]
    });
    
    
		this.infoModel = {items: [], listTitle: $L('Info')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('infoList', 
					      {itemTemplate:'listtemplates/infoItems'},
					      this.infoModel);


	if(this.venue.location.address==undefined || this.venue.location.address==""){
		logthis("no addy:");
		logthis("at "+this.venue.location.lat+", "+this.venue.location.lng);
		this.controller.serviceRequest('palm://com.palm.location', {
				method: "getReverseLocation",
				parameters: {latitude: this.venue.location.lat, longitude:this.venue.location.lng},
				onSuccess: function(address){
					logthis("got approx addy");
					//logthis("addy="+Object.toJSON(address));
					this.controller.get("checkinVenueAddress").innerHTML="Near "+address.substreet+" "+address.street;
					logthis("set html addy thing");
					this.venue.location.address="Near "+address.substreet+" "+address.street;
				}.bind(this),
				onFailure: function(){}.bind(this)
			});
	}

	this.promptCheckinBound=this.promptCheckin.bind(this);
	//this.handleAddTipBound=this.handleAddTip.bind(this);
	//this.handleAddTodoBound=this.handleAddTodo.bind(this);
	this.showGoogleMapsBound=this.showGoogleMaps.bind(this);
	this.infoTappedBound=this.infoTapped.bindAsEventListener(this);
	this.flipMayorBound=this.flipMayor.bindAsEventListener(this);
	this.flipPeopleBound=this.flipPeople.bindAsEventListener(this);
	this.flipTipsBound=this.flipTips.bindAsEventListener(this);
	this.flipMoreBound=this.flipMore.bindAsEventListener(this);
	this.showPhotosBound=this.showPhotos.bindAsEventListener(this);
	this.specialScrollBound=this.specialScroll.bindAsEventListener(this);
	this.overlayCloserBound=function(){this.controller.get("docheckin-fields").hide();this.controller.get("overlay-content").innerHTML="";this.controller.get("meta-overlay").hide();}.bind(this);
	this.tipListTappedBound=this.tipListTapped.bind(this);
	this.showUserInfoBound=this.showUserInfo.bind(this);
	this.tagTappedBound=this.tagTapped.bind(this);
	this.showTodoBound=this.showTodo.bindAsEventListener(this);
	this.stageActivateBound=this.stageActivate.bind(this);

	Mojo.Event.listen(this.controller.get("checkinButton"),Mojo.Event.tap,this.promptCheckinBound);
//	Mojo.Event.listen(this.controller.get("buttonAddTip"),Mojo.Event.tap, this.handleAddTipBound);
//	Mojo.Event.listen(this.controller.get("buttonAddTodo"),Mojo.Event.tap, this.handleAddTodoBound);
 	Mojo.Event.listen(this.controller.get("venueMap"),Mojo.Event.tap, this.showGoogleMapsBound);
	Mojo.Event.listen(this.controller.get("overlay-closer"),Mojo.Event.tap, this.overlayCloserBound);
	Mojo.Event.listen(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTappedBound);


	Mojo.Event.listen(this.controller.get("mayor-row"),Mojo.Event.tap,this.flipMayorBound);
	Mojo.Event.listen(this.controller.get("whoshere-row"),Mojo.Event.tap,this.flipPeopleBound);
	Mojo.Event.listen(this.controller.get("tips-row"),Mojo.Event.tap,this.flipTipsBound);
	Mojo.Event.listen(this.controller.get("more-row"),Mojo.Event.tap,this.flipMoreBound);
	Mojo.Event.listen(this.controller.get("photos-row"),Mojo.Event.tap,this.showPhotosBound);

	Mojo.Event.listen(this.controller.get('tips-list'),Mojo.Event.listTap, this.tipListTappedBound);
	Mojo.Event.listen(this.controller.get("specialScroller"), Mojo.Event.propertyChange, this.specialScrollBound);

	Mojo.Event.listen(this.controller.get("todohere"),Mojo.Event.tap,this.showTodoBound);
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);


	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	this.keyUpHandlerBound=this.keyUpHandler.bind(this);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
    this.doc=this.controller.document;
    this.doc.addEventListener("keyup", this.keyUpHandlerBound, true);


	this.controller.get("meta-overlay").hide();
	this.controller.get("results-meta-list").hide();
	
	
	this.flickrUpload='<span id="flickrUploader" class="vtip-black" style="white-space:nowrap;">Upload</span>';
	//this.setupCheckin();
	
	this.info=[];
	
	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("special_middle").style.height="200px;";
	}
	else{
	   this.controller.get("special_middle").style.height="300px"; //372
	}

	this.inOverview=true;
	logthis("this.venue="+Object.toJSON(this.venue));

}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}
VenuedetailAssistant.prototype.keyDownHandler = function(event) {
		var key=event.originalEvent.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = true;
		}
}

VenuedetailAssistant.prototype.keyUpHandler = function(event) {
		var key=event.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = false;
		}
}

VenuedetailAssistant.prototype.stageActivate = function(event) {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});
	this.metatap=false;
	if(_globals.showShout){
    	var thisauth="";
		this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this,_globals.jtShout);
	}


};

VenuedetailAssistant.prototype.specialScroll = function(event) {
	if(this.scroll3Model.snapIndex==0){
		this.controller.get("triangle-left").hide();
		if(this.scroll3Model.snapElements.x.length>1){
			this.controller.get("triangle-right").show();
		}
	}
	
	if(this.scroll3Model.snapIndex>0){
		this.controller.get("triangle-left").show();
		if(this.scroll3Model.snapIndex<(this.scroll3Model.snapElements.x.length-1)){
			this.controller.get("triangle-right").show();
		}else{
			this.controller.get("triangle-right").hide();
		}
	}
};


VenuedetailAssistant.prototype.flipMayor = function(what) {
	if(this.metatap){
         var stageArguments = {name: "mainStage"+this.mayorId, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,this.mayorId,this,false);         
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
	}else{
		this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,this.mayorId,this,true);
	}
}
VenuedetailAssistant.prototype.flipPeople = function(what) {
	this.swapTabs(2);
}
VenuedetailAssistant.prototype.flipTips = function(what) {
	this.swapTabs(3);
}
VenuedetailAssistant.prototype.flipMore = function(what) {
	this.swapTabs(1);
}

VenuedetailAssistant.prototype.showTodo = function(event){
	logthis("show todo");
	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},this.todoArray,this.venue);
};


VenuedetailAssistant.prototype.tipListTapped = function(event){
	logthis("show tip");
	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item}]);
};

VenuedetailAssistant.prototype.showPhotos = function(event){
	logthis("show photos");
     var stageArguments = {name: "photoStage"+this.venue.id, lightweight: true};
     var pushMainScene=function(stage){
     	this.metatap=false;
		stage.pushScene({name:"venue-photos",transition:Mojo.Transition.zoomFade},{photos:this.venuePhotos});        
     };
    var appController = Mojo.Controller.getAppController();
	appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
};


VenuedetailAssistant.prototype.swapTabs = function(what) {
//	this.controller.get("detailScroller").mojo.revealTop();
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.revealTop();
	switch(what){
		case 0:
			this.controller.get("overview-group").show();
			this.controller.get("people-group").hide();
			this.controller.get("tips-group").hide();
			this.controller.get("details-group").hide();
			this.inOverview=true;
			break;
		case 1:
			this.controller.get("overview-group").hide();
			this.controller.get("people-group").hide();
			this.controller.get("tips-group").hide();
			this.controller.get("details-group").show();
			this.inOverview=false;
			break;
		case 2:
			this.controller.get("overview-group").hide();
			this.controller.get("people-group").show();
			this.controller.get("tips-group").hide();
			this.controller.get("details-group").hide();		
			this.inOverview=false;
			break;
		case 3:
			this.controller.get("overview-group").hide();
			this.controller.get("people-group").hide();
			this.controller.get("tips-group").show();
			this.controller.get("details-group").hide();
			this.inOverview=false;
			break;
	}
}

VenuedetailAssistant.prototype.showGoogleMaps = function() {
 this.controller.serviceRequest('palm://com.palm.applicationManager', {
 	method:'open',
 	parameters:{target: "maploc:("+this.vgeolat+","+this.vgeolong+")" }
     }
 ); 
}

VenuedetailAssistant.prototype.getVenueInfo = function() {
/*	var url = 'http://api.foursquare.com/v1/venue.json';
	auth = _globals.auth;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:auth},
	   parameters: {vid:this.venue.id},
	   onSuccess: this.getVenueInfoSuccess.bind(this),
	   onFailure: this.getVenueInfoFailed.bind(this)
	 });*/
	 logthis(encodeURIComponent('/venues/'+this.venue.id+',/venues/'+this.venue.id+'/tips'));
//	 Mojo.Log.error('/venues/'+this.venue.id+',/venues/'+this.venue.id+'/tips,/venues/'+this.venue.id+'/photos?group=venue,/venues/'+this.venue.id+'/photos?group=checkin,/venues/'+this.venue.id+'/herenow?limit=250');
	 foursquareGetMulti(this, {
	 	endpoints: '/venues/'+this.venue.id+',/venues/'+this.venue.id+'/tips,/venues/'+this.venue.id+'/photos?group=venue,/venues/'+this.venue.id+'/photos?group=checkin,/venues/'+this.venue.id+'/herenow?limit=250',
	 	requiresAuth: true,
	 	debug: true,
	 	ignoreErrors: false,
	    onSuccess: this.getVenueInfoSuccess.bind(this),
	    onFailure: this.getVenueInfoFailed.bind(this)
	 });
}
function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

VenuedetailAssistant.prototype.relativeTime = function(offset){
	// got this from: http://github.com/trek/thoughtbox/blob/master/js_relative_dates/src/relative_date.js
    var distanceInMinutes = (offset.abs() / 60000).round();
    if (distanceInMinutes == 0) { return 'less than a minute'; }
    else if ($R(0,1).include(distanceInMinutes)) { return 'about a minute'; }
    else if ($R(2,44).include(distanceInMinutes)) { return distanceInMinutes + ' minutes';}
    else if ($R(45,89).include(distanceInMinutes)) { return 'about 1 hour';}
    else if ($R(90,1439).include(distanceInMinutes)) { return 'about ' + (distanceInMinutes / 60).round() + ' hours'; }
    else if ($R(1440,2879).include(distanceInMinutes)) {return '1 day'; }
    else if ($R(2880,43199).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 1440).round() + ' days'; }
    else if ($R( 43200,86399).include(distanceInMinutes)) {return 'about a month' }
    else if ($R(86400,525599).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 43200).round() + ' months'; }
    else if ($R(525600,1051199).include(distanceInMinutes)) {return 'about a year';}
    else return 'over ' + (distanceInMinutes / 525600).round() + ' years';
  }

VenuedetailAssistant.prototype.infoTapped = function(event) {
	switch(event.item.action){
		case "url":
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				 method: 'open',
				 parameters: {
					 target: event.item.url
				 }
			});
			break;
		case "flagoredit":
		    this.controller.popupSubmenu({
                items: [{label: $L('Suggest an Edit'), command: 'edit', icon: 'status-available-dark'},
                    {label: $L('Flag as Closed'), command: 'closed'},
                    {label: $L('Flag as Mislocated'), command: 'mislocated'},
                    {label: $L('Flag as Duplicate'), command: 'duplicate'}
                ],
                onChoose: function(arg) {
                   switch(arg) {
                   		case "edit":
       						this.handleProposeEdit();
                   			break;
                   		case "closed":
                   			this.handleMarkClosed();
                   			break;
                   		case "mislocated":
                   			this.handleMarkMislocated();
                   			break;
                   		case "duplicate":
                   			this.handleMarkDupe();
                   			break;
                   }
                }.bind(this)
		    });
			break;
		case "flagclosed":
			this.handleMarkClosed();
			break;
		case "suggestedit":
			this.handleProposeEdit();
			break;
		case "todo":
			this.handleAddTodo();
			break;
		case "photos":
			this.showFlickr();
			break;
		case "banks":
			this.showBanks();
			break;
		case "parking":
			this.showParking();
			break;
		case "twitter":
			switch(_globals.twitter){
				case "web":
					this.controller.serviceRequest('palm://com.palm.applicationManager', {
						 method: 'open',
						 parameters: {
							 target: event.item.url
						 }
					});
					logthis("Web");
					break;				
				case "badkitty":
					logthis("badkitty");
					_globals.openApp(this.controller, "Bad Kitty", "com.superinhuman.badkitty", {
										action: "user",
										name: event.item.username
									});
					break;
				case "spaz":
					_globals.openApp(this.controller, "Spaz", "com.funkatron.app.spaz", {
										action: "user",
										userid: event.item.username
									});
					break;
				case "spaz-sped":
					_globals.openApp(this.controller, "Spaz Special Edition", "com.funkatron.app.spaz-sped", {
										action: "user",
										userid: event.item.username
									});
					break;
				case "tweetme":
					_globals.openApp(this.controller, "TweetMe", "com.catalystmediastudios.tweetme", {
										action: "user",
										name: event.item.username
									});
					break;
			}
			break;
	}
}

VenuedetailAssistant.prototype.fmtTipUser = function(value,model){
	if(value!=undefined){
		var tlname=(value.lastname != undefined)? value.lastname : '';
		var username=value.firstname+" "+tlname;
		
		value.username=username;

		
		return value;
	}
};

VenuedetailAssistant.prototype.fmtTipWhen = function(value,model){
	if(value!=undefined){
		var now = new Date;
		var cre=value;
		var later = new Date(cre*1000);
		var offset = later.getTime() - now.getTime();
		var when=this.relativeTime(offset) + " ago";
		return when;
	}else{
		return "";
	}
};

VenuedetailAssistant.prototype.fmtWhoShout = function(value,model){
	if(value!=undefined){
		return value;
	}else{
		return "";
	}
};

VenuedetailAssistant.prototype.fmtTipPhoto = function(value,model){
	logthis(Object.toJSON(value));
	logthis(Object.toJSON(model));
	if(value!=undefined){
		logthis("has photo");
		model.hasphoto='inline';
		return value;
	}else{
		logthis("no photo");
		model.hasphoto='none';
		return value;
	}
};


VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	logthis("success");
	var th=this;
	var j=response.responseJSON.response.responses[0].response;

	this.gotInfo=true;
	
	if((j.venue.todos.count>0)){
		this.infoFired=true;
		logthis("has todo");
		this.todoArray=j.venue.todos.items; //todoArray;
		this.controller.get("todohere").show();
	}

logthis("passed todo");

	//logthis("num specials="+response.responseJSON.venue.specials.length);
	this.controller.get("vcategory").innerHTML=(j.venue.categories[0])? 
		'<img src="'+j.venue.categories[0].icon+'"><br/>'+j.venue.categories[0].name: '';
	
	// this.controller.get("checkinVenueAddress").innerHTML=(this.controller.get("checkinVenueAddress").innerHTML=="")? j.venue.location.address: this.controller.get("checkinVenueAddress").innerHTML;
	var currentAddress = this.controller.get("checkinVenueAddress").innerHTML;
	if (currentAddress == "" && j.venue.location.address) {
		this.controller.get("checkinVenueAddress").innerHTML = j.venue.location.address;
	} else {
		this.controller.get("checkinVenueAddress").innerHTML = currentAddress;
	}
	
	this.vaddress=j.venue.location.address;
	this.vcity=j.venue.location.city;
	this.vstate=j.venue.location.state;
	this.vshorturl=j.venue.shortUrl;
	
	if(this.fromLaunch){
		this.controller.get("checkinVenueName").innerHTML=j.venue.name;
		this.controller.get("checkinVenueAddress").innerHTML=j.venue.location.address ? j.venue.location.address : '';
		if (j.venue.location.crossStreet && this.controller.get("checkinVenueAddress").innerHTML.indexOf(j.venue.location.crossStreet)==-1) {
			this.controller.get("checkinVenueAddress").innerHTML += " ("+j.venue.location.crossStreet+")";
		}
	
		var query=encodeURIComponent(j.venue.location.address+' '+j.venue.location.city+', '+j.venue.location.state);
		this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+j.venue.location.lat+","+j.venue.location.lng+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	}
	
	
//	Mojo.Log.error("vadd=%i, vcity=%i, vstate=%i",this.vaddress,this.vcity,this.vstate);
	
	if (j.venue.location.crossStreet && !this.venue.crossstreet && !this.fromLaunch && this.controller.get("checkinVenueAddress").innerHTML.indexOf(j.venue.location.crossStreet)==-1) {
	 this.controller.get("checkinVenueAddress").innerHTML += " ("+j.venue.location.crossStreet+")";
	}
	if(this.controller.get("venueMap").src!="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+j.venue.location.lat+","+j.venue.location.lng+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA") {
		this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+j.venue.location.lat+","+j.venue.location.lng+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";
		this.venue.geolat=j.venue.location.lat;
		this.venue.geolong=j.venue.location.lng;
	}
	
	//mayorial stuff
	if(j.venue.mayor != undefined) { //venue has a mayor
		if(j.venue.mayor.count>0){
			logthis("has mayor");
			this.controller.get("snapMayor").show();
			var lname=(j.venue.mayor.user.lastName != undefined)? j.venue.mayor.user.lastName: '';
			this.mayorId=j.venue.mayor.user.id;
	
			this.controller.get("mayorPic").src=j.venue.mayor.user.photo;
			this.controller.get("mayorPic").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorPic").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
			
			this.controller.get("mayorName").innerHTML=j.venue.mayor.user.firstName+" "+lname;
			this.controller.get("mayorName").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorName").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
	
	
	
			this.controller.get("mayorPic2").src=j.venue.mayor.user.photo;
			this.controller.get("mayorPic2").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorPic2").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
			this.controller.get("mayorPicBorder2").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorPicBorder2").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
			this.controller.get("mayorAvatar2").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorAvatar2").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
			
			this.controller.get("mayorName2").innerHTML=j.venue.mayor.user.firstName+" "+lname;
			this.controller.get("mayorName2").setAttribute("data",j.venue.mayor.user.id);
			this.controller.get("mayorName2").setAttribute("user",j.venue.mayor.user.firstName+" "+lname);
			var mInfo;
			switch(j.venue.mayor.user.gender) {
				case "male":
					var s=(j.venue.mayor.count!=1)? "s": ""; 
					mInfo="He's checked in here "+j.venue.mayor.count+" time"+s+".";
					break;
					
				case "female":
					var s=(j.venue.mayor.count!=1)? "s": ""; 
					mInfo="She's checked in here "+j.venue.mayor.count+" time"+s+".";
					break;
					
				default:
					var s=(j.venue.mayor.count!=1)? "s": ""; 
					mInfo="They've checked in here "+j.venue.mayor.count+" time"+s+".";
					break;
					
			}
			if(j.venue.mayor.user.id==_globals.uid){
					var s=(j.venue.mayor.count!=1)? "s": ""; 
					mInfo="You've checked in here "+j.venue.mayor.count+" time"+s+".";			
			}
			this.controller.get("mayorInfo").innerHTML=mInfo;
			this.controller.get("mayorInfo2").innerHTML=mInfo;
			this.nomayor=false;
		}else{
			logthis("no mayor");
			this.controller.get("snapMayor").show();
			this.controller.get("mayorPic").src='images/blank_boy.png';
			this.controller.get("mayorPic2").src='images/blank_boy.png';
			this.controller.get("mayorName").innerHTML="No mayor yet!";
			this.controller.get("mayorName").removeClassName("userlink");
			this.controller.get("mayorName2").innerHTML="No mayor yet!";
			this.controller.get("mayorName2").removeClassName("userlink");
			this.controller.get("mayorPic").removeClassName("userlink");
			this.controller.get("mayorPic2").removeClassName("userlink");
			this.controller.get("mayorPicBorder2").removeClassName("userlink");
			this.controller.get("mayorAvatar2").removeClassName("userlink");
			this.controller.get("mayorInfo").innerHTML="You could be the first!";
			this.controller.get("mayorInfo2").innerHTML="You could be the first!";
			this.nomayor=true;
			Mojo.Event.stopListening(this.controller.get("mayor-row"),Mojo.Event.tap,this.flipMayorBound);
		
		}
	}else{
		logthis("no mayor");
		this.controller.get("snapMayor").show();
		this.controller.get("mayorPic").src='images/blank_boy.png';
		this.controller.get("mayorPic2").src='images/blank_boy.png';
		this.controller.get("mayorName").innerHTML="No mayor yet!";
		this.controller.get("mayorName").removeClassName("userlink");
		this.controller.get("mayorName2").innerHTML="No mayor yet!";
		this.controller.get("mayorName2").removeClassName("userlink");
		this.controller.get("mayorPic").removeClassName("userlink");
		this.controller.get("mayorPic2").removeClassName("userlink");
		this.controller.get("mayorPicBorder2").removeClassName("userlink");
		this.controller.get("mayorAvatar2").removeClassName("userlink");
		this.controller.get("mayorInfo").innerHTML="You could be the first!";
		this.controller.get("mayorInfo2").innerHTML="You could be the first!";
		this.nomayor=true;
		Mojo.Event.stopListening(this.controller.get("mayor-row"),Mojo.Event.tap,this.flipMayorBound);

	}
	
logthis("done mayor");
	
		//specials!
	var showbutton=false;
	var specialWidth=0;
	this.controller.get('special_content').innerHTML='';		
	
	if(j.venue.specials.length>0){ //specials here
		var nearbyShown=false;
		this.nearbys=[];
		var lastHereSpecial=0;
		specialWidth=j.venue.specials.length*300;
		this.controller.get("special_content").style.width=(specialWidth)+"px";
		if(j.venue.specials.length+j.venue.specialsNearby.length>1){
			this.controller.get("triangle-right").show();
		}		
		for(var b = 0; b < j.venue.specials.length;b++) {
			var special_type=j.venue.specials[b].type;
			var special_msg=j.venue.specials[b].message;
			var special_description=j.venue.specials[b].description;
			var special_unlocked=(j.venue.specials[b].unlocked)? j.venue.specials[b].unlocked: false;
			var unlock_msg="";
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/smallcrown.png\" width=\"22\" height=\"22\" /> Mayor Special";
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			if(special_unlocked){
				unlock_msg='<div class="special-unlocked">You\'ve unlocked this special!</div>';
			}else{
				unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
			}


			var special_venue="";

			if(j.venue.specials[b].id!=lastHereSpecial){
				this.controller.get('special_content').innerHTML = '<div class="special-wrapper"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class=""><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div><div class="checkin-venue">'+unlock_msg+'</div></div></div></div>'+this.controller.get('special_content').innerHTML;			

				lastHereSpecial=j.venue.specials[b].id;
			}

			
			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
		}//end of for
		//this.controller.get('special_content').innerHTML+='<br class="breaker">';
		this.controller.get("nearby-special").addClassName("here-button");
		showbutton=true;
		this.controller.get("nearbySpecials").hide();
		this.controller.get("nearby-special").show();
		Mojo.Event.listen(this.controller.get("nearby-special"),Mojo.Event.tap,function(){
			this.controller.get("special_overlay").toggle();
		}.bind(this));
		Mojo.Animation.animateStyle(this.controller.get("nearby-special"),"top","linear",{from: -53, to: 0, duration: 1});
		nearbyShown=true;
	}
	
	logthis("**************finished with specials here");
	logthis(this.controller.get('special_content').innerHTML);

	if(j.venue.specialsNearby.length>0){ //specials nearby
		logthis("has enarby specials");
		this.nearbys=[];
		var lastNearbySpecial=0;
		logthis("specials1");
		this.controller.get("special_content").style.width=((j.venue.specialsNearby.length*300)+specialWidth)+"px";
		logthis("specials2");
		if(j.venue.specialsNearby.length+j.venue.specials.length>1){
			this.controller.get("triangle-right").show();
		}		
		logthis("specials3");
		for(var b = 0; b < j.venue.specialsNearby.length;b++) {
		logthis("specials4");
			var special_type=j.venue.specialsNearby[b].type;
			var special_msg=j.venue.specialsNearby[b].message;
			var special_description=j.venue.specialsNearby[b].description;
			var special_unlocked=(j.venue.specialsNearby[b].unlocked)? j.venue.specialsNearby[b].unlocked: false;
			var unlock_msg="";
		logthis("specials5");
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/smallcrown.png\" width=\"22\" height=\"22\" /> Mayor Special";
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			spt=spt+" Nearby";
		logthis("specials6");
			if(special_unlocked){
				unlock_msg='<div class="special-unlocked">You\'ve unlocked this special!</div>';
			}else{
				unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
			}

		logthis("specials7");

			var special_venue="@ "+j.venue.specialsNearby[b].venue.name;
			if(j.venue.specialsNearby[b].id!=lastNearbySpecial){
				this.controller.get('special_content').innerHTML += '<div class="special-wrapper" id="special'+j.venue.specialsNearby[b].id+'"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class=""><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div><div class="checkin-venue">'+unlock_msg+'</div></div></div></div>';//+this.controller.get('special_content').innerHTML;			

				lastNearbySpecial=j.venue.specialsNearby[b].id;
			}

		logthis("specials8");
			
			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
		}//end of for
		logthis("specials9");
		if(!nearbyShown){
			this.controller.get("nearby-special").addClassName("nearby-button2");
			showbutton=true;
			this.controller.get("nearbySpecials").hide();
			this.controller.get("nearby-special").show();
			Mojo.Event.listen(this.controller.get("nearby-special"),Mojo.Event.tap,function(){
				this.controller.get("special_overlay").toggle();
			}.bind(this));
			Mojo.Animation.animateStyle(this.controller.get("nearby-special"),"top","linear",{from: -53, to: 0, duration: 1});
			nearbyShown=true;
		}
				logthis("specials10");
		for(var g=0;g<j.venue.specialsNearby.length;g++){
				Mojo.Event.listen(this.controller.get('special'+j.venue.specialsNearby[g].id),Mojo.Event.tap,function(e,g){
					this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},j.venue.specialsNearby[g].venue,_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
				}.bindAsEventListener(this,g));		
		}


	}
	logthis("**************finished with specials nearby");
	logthis(this.controller.get('special_content').innerHTML);
		this.controller.get('special_content').innerHTML+='<br class="breaker">';

	
	if(nearbyShown){
		logthis("special-break11");
				
		var nodelist=this.controller.document.querySelectorAll(".special-wrapper");
		var elements=[];
		for(var i=0;i<nodelist.length;i++){
			elements.push(nodelist[i]);
		}
		logthis(elements);
		this.scroll3Model.snapElements={x:elements};
		this.controller.modelChanged(this.scroll3Model);
	}

/*	if(response.responseJSON.response.venue.specials.length>0) {
		logthis("specials="+Object.toJSON(response.responseJSON.venue.specials));
		var nearbyShown=false;
		this.nearbys=[];
		var lastHereSpecial=0;
		this.controller.get("special_content").style.width=(response.responseJSON.venue.specials.length*300)+"px";
		if(response.responseJSON.venue.specials.length>1){
			this.controller.get("triangle-right").show();
		}
		for(var b = 0; b < response.responseJSON.venue.specials.length;b++) {
			var special_type=response.responseJSON.venue.specials[b].type;
			var special_msg=response.responseJSON.venue.specials[b].message;
			var special_kind=response.responseJSON.venue.specials[b].kind;
			var unlock_msg="";
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/smallcrown.png\" width=\"22\" height=\"22\" /> Mayor Special";
					if(!this.nomayor){
						if(response.responseJSON.venue.stats.mayor.user.id==_globals.uid){
							//user is or just became the mayor
							this.ismayor=true;
							unlock_msg='<div class="special-unlocked">You\'ve unlocked this special!</div>';
						}else{
							this.ismayor=false;
							unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
						}
					}else{
						this.ismayor=false;
						unlock_msg='<div class="special-locked">You have not unlocked this special.</div>';
					}
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			var special_venue="";

			if(special_kind=="nearby"){
				spt=spt+" Nearby";
				special_venue="@ "+response.responseJSON.venue.specials[b].venue.name;
				
				this.controller.get('special_content').innerHTML += '<div class="special-wrapper" id="special'+response.responseJSON.venue.specials[b].id+'"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class=""><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>';
				logthis("id="+response.responseJSON.venue.specials[b].id);
				logthis("spt="+spt);
				logthis("special_msg="+special_msg);
				logthis("special_venue="+special_venue);
				logthis("----------------------------------");
				
				this.vv=response.responseJSON.venue.specials[b].venue;
				this.nearbys.push({id: response.responseJSON.venue.specials[b].id, venue:response.responseJSON.venue.specials[b].venue});
				

			}else{
				if(response.responseJSON.venue.specials[b].id!=lastHereSpecial){
					this.controller.get('special_content').innerHTML = '<div class="special-wrapper"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class=""><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>'+this.controller.get('special_content').innerHTML;			

					lastHereSpecial=response.responseJSON.venue.specials[b].id;
				}
			}
			
			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
		}//end of for
		
		logthis("special content="+this.controller.get('special_content').innerHTML);
		
		this.controller.get('special_content').innerHTML+='<br class="breaker">';
		var showbutton=false;
		
		logthis("special-break1");
		
		if(lastHereSpecial!=0){
			this.controller.get("nearby-special").addClassName("here-button");
			showbutton=true;
			logthis("here-button");
		}else if(response.responseJSON.venue.specials.length>0){
			this.controller.get("nearby-special").addClassName("nearby-button2");			
			showbutton=true;
			logthis("nearby-button");
		}
			logthis("special-break2");

		this.controller.get("nearbySpecials").hide();
		if(!nearbyShown && showbutton){
				logthis("special-break3");

			this.controller.get("nearby-special").show();
			Mojo.Event.listen(this.controller.get("nearby-special"),Mojo.Event.tap,function(){
				this.controller.get("special_overlay").toggle();
			}.bind(this));
			Mojo.Animation.animateStyle(this.controller.get("nearby-special"),"top","linear",{from: -53, to: 0, duration: 1});
			nearbyShown=true;
		}

		logthis("special-break4");

		
		for(var g=0;g<this.nearbys.length;g++){
				Mojo.Event.listen(this.controller.get('special'+this.nearbys[g].id),Mojo.Event.tap,function(e,g){
					this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},this.nearbys[g].venue,_globals.username,_globals.password,_globals.uid,false,undefined,undefined,this,false,true);
				}.bindAsEventListener(this,g));		
		}
				logthis("special-break5");
				
		var nodelist=this.controller.document.querySelectorAll(".special-wrapper");
		var elements=[];
		for(var i=0;i<nodelist.length;i++){
			elements.push(nodelist[i]);
		}
		logthis(elements);
		this.scroll3Model.snapElements={x:elements};
		this.controller.modelChanged(this.scroll3Model);

		logthis("special-break6");

	}else{
				logthis("special-break7");

		this.controller.get("snapSpecials").hide();
		
	}
	
	
			logthis("special-break8");
*/

	
	//tips stuff
	if(j.venue.tips.count>0){
		this.tipsModel.items=[];
		this.userCount=0;
		this.friendCount=0;
		logthis("has tips!");
		var tipsText='';
		var tipsstuff=j.venue.tips;
		
		var vTips=response.responseJSON.response.responses[1].response.tips.items;
		this.tipsModel.items=vTips;
		try{
			this.controller.modelChanged(this.tipsModel);
		}catch(e){
			logthis("error: "+e);
		}
		logthis("nmber groups="+tipsstuff.groups.length);
		for(var tg=0;tg<tipsstuff.groups.length;tg++){
			/*var tipsArray=tipsstuff.groups[tg].items;
			this.tipsModel.items.concat(tipsArray);
			try{
				this.controller.modelChanged(this.tipsModel);
			}catch(e){
				logthis("error: "+e);
			}
			
			switch(tipsstuff.groups[tg].type){
				case "friends":
					this.friendCount=tipsArray.length;
					break;
				default:
					this.userCount+=tipsArray.length;
					for(var ot=0;ot<tipsArray.length;ot++){
						
					}
					break;
			}*/
			var count=tipsstuff.groups[tg].count;
			var name=tipsstuff.groups[tg].name;
			
			if(tg==0){ //first group
				logthis("first group");
				tipsText+=count+" "+name;
			}else if(tg==tipsstuff.groups.length-1){ //last group
				logthis("last group");
				tipsText+=' and '+count+" "+name;
			}else{ 
				logthis("middle group");
				tipsText+=", "+count+" "+name;
			}
			logthis("tipstext="+tipsText);
			
		}
		logthis("usercount="+this.userCount+", friendcount="+this.friendCount);
		this.controller.get("friend-tips").update(tipsText);
		this.controller.get("others-tips").update('');		
	}else{
		logthis("no tips!");
		var tips='<div id="notice" style="margin-top: 75px">No tips have been left here yet.</div>';
		this.controller.get("venueTips").update(tips);
		
		this.controller.get("friend-tips").update('No tips have been left here');
		this.controller.get("others-tips").update('Leave a tip and let others know your secret!');	
	}
	
	
	/*var boldtips='No tips have been left here';
	var greytips='Leave a tip and let others know your secret!';
	if(this.friendCount==0){
		var s=(this.userCount==1)? ' has': 's have';
		boldtips=this.userCount+' tip'+s+' been left here';
		greytips='Be the first of your friends to leave one!';
	}else if(this.friendCount>0){
		var s=(this.friendCount==1)? '': 's';
		boldtips=this.friendCount+' tip'+s+' from friends';
		if(this.userCount>0){
			greytips=this.userCount+' left by other people';
		}else{
			greytips='';
		}
	}

	this.controller.get("friend-tips").update(boldtips);
	this.controller.get("others-tips").update(greytips);*/


/*	if(response.responseJSON.venue.tips != undefined) {
		this.controller.get("venueTips").update("");
		logthis("venue.tips="+Object.toJSON(response.responseJSON.venue.tips));
		this.controller.get("snapTips").show();
		var tips='';
		this.friendCount=0;
		this.userCount=0;
		this.tipsModel.items=[];
			
		logthis("tips-break1");

		this.tipsModel.items=response.responseJSON.venue.tips;
		logthis("tips-break2");
		try{
			this.controller.modelChanged(this.tipsModel);
		}catch(e){
			logthis("error: "+e);
		}
		logthis("tips-break2.5");
		for (var t=0;t<response.responseJSON.venue.tips.length;t++) {
				//fidn out if it's a friend...
			if(isFriend(response.responseJSON.venue.tips[t].user.id)){
				this.friendCount++;
			}else{
				this.userCount++;
			}
			Mojo.doNothing();
		}
		logthis("tips-break2.75");
		/*for (var t=0;t<response.responseJSON.venue.tips.length;t++) {
			try{
			var tip=response.responseJSON.venue.tips[t].text;
			var tipid=response.responseJSON.venue.tips[t].id;
			var created=response.responseJSON.venue.tips[t].created;
			var tlname=(response.responseJSON.venue.tips[t].user.lastname != undefined)? response.responseJSON.venue.tips[t].user.lastname : '';
			var username=response.responseJSON.venue.tips[t].user.firstname.replace("✈","")+" "+tlname.replace("✈","");
			//logthis("loop6");
			var photo=response.responseJSON.venue.tips[t].user.photo;
			//logthis("loop7");
			var uid=response.responseJSON.venue.tips[t].user.id;
			//logthis("loop8");
			var usersdone=response.responseJSON.venue.tips[t].stats.donecount;
			//logthis("loop9");
			var userstodo=response.responseJSON.venue.tips[t].stats.todocount;
			//logthis("loop10");
			var isfriend=isFriend(uid);
			}catch(e){
				logthis("error");
				logthis(e);
			}

		logthis("tips-break2");
			
			if(isfriend){
				friendCount++;
			}else{
				userCount++;
			}
			
			if(response.responseJSON.venue.tips[t].created != undefined) {
				var now = new Date;
				var later = new Date(response.responseJSON.venue.tips[t].created);
				var offset = later.getTime() - now.getTime();
				var when=this.relativeTime(offset) + " ago";
			}else{
			   	var when="";
			}
		logthis("tips-break3");
		/*logthis("photo: "+photo);
		logthis("uid: "+uid);
		logthis("username: "+username);
		logthis("text: "+tip);
		logthis("t: "+t);
		logthis("url: "+response.responseJSON.venue.tips[t].url);
		logthis("id: "+response.responseJSON.venue.tips[t].id);
		logthis("user: "+response.responseJSON.venue.tips[t].user);
		logthis("stats: "+response.responseJSON.venue.tips[t].stats);
		logthis("tipid: "+tipid);
		/*logthis("status: "+response.responseJSON.venue.tips[t].status);*/
		/*logthis("timeago: "+when);
		logthis("usersdone: "+usersdone);
		logthis("userstodo: "+userstodo);*/
		
		/*try{
			var tipHash={
				photo: photo,
				uid: uid,
				username: username,
				text: tip,
				t: t,
				url: response.responseJSON.venue.tips[t].url,
				id: response.responseJSON.venue.tips[t].id,
				user: response.responseJSON.venue.tips[t].user,
				venue: response.responseJSON.venue,
				stats: response.responseJSON.venue.tips[t].stats,
				tipid: tipid,
				timeago: when,
				usersdone: usersdone,
				userstodo: userstodo
			};
	}else{
			logthis("tips-break6");

		var tips='<div id="notice" style="margin-top: 75px">No tips have been left here yet.</div>';
		this.controller.get("venueTips").update(tips);
		
		this.controller.get("friend-tips").update('No tips have been left here');
		this.controller.get("others-tips").update('Leave a tip and let others know your secret!');

	}
		logthis("tips-break7");
*/


	//photos stuff
//	this.venuePhotos=j.venue.photos;
//	logthis(Object.toJSON(response.responseJSON.response.responses[3].meta));
//	logthis(Object.toJSON(response.responseJSON.response.responses[2].meta));
	this.venuePhotos={
		count: j.venue.photos.count,
		groups: [
			{type: 'checkin',
			name: 'friends\' checkin photos',
			count: response.responseJSON.response.responses[3].response.photos.count,
			items: response.responseJSON.response.responses[3].response.photos.items
			},
			{type: 'venue',
			name: 'venue photos',
			count: response.responseJSON.response.responses[2].response.photos.count,
			items: response.responseJSON.response.responses[2].response.photos.items
			}
		]
	};
	if(j.venue.photos.count>0){
		this.controller.get("photos-row").show();
		this.userCountP=0;
		this.friendCountP=0;
		logthis("has photos!");
		var photosText='';
		var photosThumbs='';
		var photosstuff=j.venue.photos;
		var thumbCount=0;
		
		logthis("nmber groups="+photosstuff.groups.length);
		for(var pg=0;pg<photosstuff.groups.length;pg++){
			var count=photosstuff.groups[pg].count;
			var name=photosstuff.groups[pg].name;
			
			if(pg==0 && count>0){ //first group
				logthis("first group");
				photosText+=count+" "+name;
			}else if(pg==photosstuff.groups.length-1 && count>0){ //last group
				logthis("last group");
				photosText+=' and '+count+" "+name;
			}else{ 
				logthis("middle group");
				if(count>0){photosText+=", "+count+" "+name;}
			}
			logthis("photostext="+photosText);
			logthis(photosText.substring(0,5));
			if(photosText.substring(0,5)==" and "){
				photosText=photosText.replace(" and ","");
			}
			if(photosText.substring(0,1)==", "){
				photosText=photosText.replace(", ","");
			}
			
			//create thumbnails
			if(thumbCount<6){
				logthis("thumbCount<6");
				for(var p=0;p<photosstuff.groups[pg].items.length;p++){
					logthis("in photo loop");
					if(thumbCount<6){
						logthis("building thumbs");
						var photo=photosstuff.groups[pg].items[p];
						logthis(Object.toJSON(photo));
						var purl=photo.sizes.items[photo.sizes.items.length-1].url; //sizes are largest to smallest in array, use smallest possible image for thumb
						photosThumbs+='<img src="'+purl+'" width="32" height="32" class="venue-photo-thumb"/>';
						thumbCount++;
						
						logthis("pt="+photosThumbs);
					}			
				}
			}
			
		}
		logthis("usercountP="+this.userCountP+", friendcountP="+this.friendCountP);
		this.controller.get("photos-here").update(photosText);
		this.controller.get("photos-thumbnails").update(photosThumbs);
	}else{
		logthis("no photos!");
		this.controller.get("photos-row").hide();
	}


	//who's here? stuff
	var herestuff=j.venue.hereNow;
	var herestufffull=response.responseJSON.response.responses[4].response.hereNow;
//	logthis(Object.toJSON(response.responseJSON.response.responses[4].meta));
//	logthis(Object.toJSON(herestuff));
	if(herestuff.count>0){
		this.controller.get("snapUsers").show();
		this.controller.get("whoshere-row").show();
		var friendsPics='';
		var usersPics='';
		var users='';
		
		for(var hg=0;hg<herestuff.groups.length;hg++){

			switch(herestuff.groups[hg].type){
				case "friends":

					var friendsHere=herestuff.groups[hg].items;
					var friendCount=friendsHere.length;
					for(var fh=0;fh<friendsHere.length;fh++){
							logthis("herestuff-friends2 loop");

						//get date since checked-in
						var now = new Date;
						var later = new Date(friendsHere[fh].createdAt*1000);
						var offset = later.getTime() - now.getTime();
						var when=this.relativeTime(offset) + " ago";

						//find the source
						if(friendsHere[fh].source !=undefined){
							var sourceName=friendsHere[fh].source.name;
							var sourceURL=friendsHere[fh].source.url;
							
							var source='via <a href="'+sourceURL+'" class="source-link">'+sourceName+'</a>';
						}
						
						//parse links in shouts
						if(friendsHere[fh].shout!=undefined){
							var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
							var shout=friendsHere[fh].shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
						}else{
							var shout='';
						}
						
						//create images to display
						if(fh<6){
							friendsPics+='<img width="32" height="32" src="'+friendsHere[fh].user.photo+'" data="'+friendsHere[fh].user.id+'" class="friend-avatar">';
						}
						

						

						/*//join name
						var fName=friendsHere[fh].user.firstName;
						var lName=(friendsHere[fh].user.lastName)? " "+friendsHere[fh].user.lastName: "";
						var username=fName+lName;
						
						//create object for template
						var userHash={
							photo: friendsHere[fh].user.photo,
							uid: friendsHere[fh].user.id,
							t: fh,
							username: username,
							timeago: when,
							shout: shout,
							source: source
						};
						
						if(shout!=undefined && shout!=""){
							users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere-shout'});
						}else{
							users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere'});			
						}*/
						


					}
					break;
				default:
					var usersHere=herestuff.groups[hg].items;
					var userCount=herestuff.groups[hg].count;//usersHere.length;
					for(var uh=0;uh<usersHere.length;uh++){
						logthis(Object.toJSON(usersHere[uh]));
						
						//get date since checked-in
						var now = new Date;
						var later = new Date(usersHere[uh].createdAt*1000);
						var offset = later.getTime() - now.getTime();
						var when=this.relativeTime(offset) + " ago";
						logthis("when="+when);
						
						//find the source
						if(usersHere[uh].source !=undefined){
							var sourceName=usersHere[uh].source.name;
							var sourceURL=usersHere[uh].source.url;
							
							var source='via <a href="'+sourceURL+'" class="source-link">'+sourceName+'</a>';
						}
						
						//parse links in shouts
						if(usersHere[uh].shout!=undefined){
							var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
							var shout=usersHere[uh].shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
						}else{
							var shout='';
						}
						
						//create images to display
						if(uh<6){
							usersPics+='<img width="32" height="32" src="'+usersHere[uh].user.photo+'" data="'+usersHere[uh].user.id+'" class="friend-avatar">';
						}
						
						//join name
						/*var fName=usersHere[uh].user.firstName;
						var lName=(usersHere[uh].user.lastName)? " "+usersHere[uh].user.lastName: "";
						var username=fName+lName;
						
						//create object for template
						var userHash={
							photo: usersHere[uh].user.photo,
							uid: usersHere[uh].user.id,
							t: uh,
							username: username,
							timeago: when,
							shout: shout,
							source: source
						};
						
						if(shout!=undefined && shout!=""){
							users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere-shout'});
						}else{
							users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere'});			
						}*/
						


					}
					break;
			}
		}
		
		//handle full list
		for(var wh=0;wh<herestufffull.items.length;wh++){
			//join name
			var fName=herestufffull.items[wh].user.firstName;
			var lName=(herestufffull.items[wh].user.lastName)? " "+herestufffull.items[wh].user.lastName: "";
			var username=fName+lName;
			
			logthis("when="+when);
			//get date since checked-in
			var now = new Date;
			var later = new Date(herestufffull.items[wh].createdAt*1000);
			var offset = later.getTime() - now.getTime();
			var when=this.relativeTime(offset) + " ago";
			
			//create object for template
			var userHash={
				photo: herestufffull.items[wh].user.photo,
				uid: herestufffull.items[wh].user.id,
				t: uh,
				username: username,
				timeago: when,
				shout: shout,
				source: source
			};
			
			if(shout!=undefined && shout!=""){
				users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere-shout'});
			}else{
				users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere'});			
			}
		
		}
		
		
		if(friendCount==0 && userCount==0){
			this.controller.get("snapUsers").hide();
			this.controller.get("whoshere-row").hide();	
		}else{	
			var whosehere;
			if(friendCount>0 && userCount>0){
				var fs=(friendCount==1)? 'friend': 'friends';
				var ps=(userCount==1)? 'person is': 'people are';
				whosehere=friendCount+' '+fs+' and '+userCount+' other '+ps+' here';
			}else if(friendCount>0 && userCount==0){
				var fs=(friendCount==1)? 'friend is': 'friends are';
				whosehere=friendCount+' '+fs+' here';
			}else if(friendCount==0 && userCount>0){
				var ps=(userCount==1)? 'person is': 'people are';
				whosehere=userCount+' '+ps+' here';
			}
			
			this.controller.get("people-here").update(whosehere);
			this.controller.get("whoshere-avatars").update(friendsPics+usersPics);
			
			this.controller.get("venueUsers").update(users);
		}

	}else{
		this.controller.get("snapUsers").hide();
		this.controller.get("whoshere-row").hide();	
	}
	
	logthis("passed commented out stuff");
	
	//venue info stuff
	var totalcheckins=j.venue.stats.checkinsCount;
	var totalusers=j.venue.stats.usersCount;
	var beenhere=j.venue.beenHere.count;
	var twitter=(j.venue.contact.twitter)? j.venue.contact.twitter: undefined;
	var phone=(j.venue.contact.phone)? j.venue.contact.phone: undefined;
	var venueurl=(j.venue.url)? j.venue.url: undefined;
	var tags=j.venue.tags;
	//var venuelinks=response.responseJSON.venue.links;
		logthis("phone="+phone);

	this.info=[];
	
	//venue category
	if(j.venue.categories.length>0){
		var itm={};
		itm.icon=j.venue.categories[0].icon;
		itm.caption=j.venue.categories[0].name;
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
	}

logthis("6");


	var vinfo='';
	var s=(totalcheckins != 1)? "s" :"";
	if (totalcheckins>0) {
		vinfo='<span class="capitalize">'+j.venue.name+'</span> has been visited '+totalcheckins+' time'+s+' ';
		vinfo+=(beenhere)? 'and you\'ve been here before': 'but you\'ve never been here';
		vinfo+='.<br/>';
logthis("7");
		
		var people=(totalusers!=1)? "People": "Person";
		
		var itm={};
		itm.icon="images/marker_32.png";
		itm.caption=totalcheckins+" Check-in"+s+" Here from "+totalusers+" "+people;
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
logthis("8");

		var itm={};
		itm.icon="images/beenhere_32.png";
		itm.caption=(beenhere>0)? "You've been here":"You've never been here";
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
logthis("9");

	}else{
		vinfo='<span class="capitalize">'+j.venue.name+'</span> has never been visited! Be the first to check-in!<br/>';	
logthis("10");

		var itm={};
		itm.icon="images/marker_32.png";
		itm.caption="No one has checked-in here";
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
logthis("11");
	}
	



	vinfo+=(twitter != undefined)? '<img src="images/bird.png" width="20" height="20" /> <a href="http://twitter.com/'+twitter+'">@'+twitter+'</a><br/>': '';

	if(twitter != undefined){
		var itm={};
		itm.icon="images/twitter_32.png";
		itm.caption="Twitter ("+twitter+")";
		itm.action="twitter";
		itm.url='http://mobile.twitter.com/'+twitter;
		itm.username=twitter;
		itm.highlight="momentary";
		this.info.push(itm);
	}

	if(venueurl != undefined){
		var itm={};
		itm.icon="images/web_32.png";
		itm.caption=venueurl.replace('http://','');
		itm.action="url";
		itm.url=venueurl;
		itm.highlight="momentary";
		this.info.push(itm);
	}


	vinfo+=(phone != undefined)? '<img src="images/phone.png" width="20" height="20" /> <a href="tel://'+phone+'">'+phone+'</a><br/>': '';
	if(phone != undefined){
		var itm={};
		itm.icon="images/call_32.png";
		itm.caption="Call ("+phone+")";
		itm.action="url";
		itm.url='tel://'+phone;
		itm.highlight="momentary";
		this.info.push(itm);
	}

	//logthis("vnfo="+vinfo);
	//this.controller.get("venueInfo").innerHTML=vinfo;
	
	//tags
	if(tags != undefined) {
		var vtags='';
		for(var t=0;t<tags.length;t++) {
			vtags+='<span class="vtag" id="tag'+t+'">'+tags[t]+'</span> ';
		}
		this.controller.get("venueTags").innerHTML=vtags;
		this.tagsCount=tags.length;
		for(var t=0;t<tags.length;t++) {
		 	Mojo.Event.listen(this.controller.get("tag"+t),Mojo.Event.tap, this.tagTappedBound);
		}

	}else{
		this.controller.get("snapTags").hide();
	}
	

	
	
/*	//links
	if(venuelinks != undefined) {
		var vlinks='';
		for(var l=0;l<venuelinks.length;l++) {
			if(venuelinks[l].type=="yelp") { //only handling yelp links
				vlinks+='<a style="margin-left: 4px;" href="'+venuelinks[l].url+'"><img src="images/yelp.png" width="42" border="0"/></a>';
			}
		}
		this.controller.get("yelpbutton").innerHTML=vlinks;
	}*/
	
		/*var itm={};
		itm.icon="images/photos_32.png";
		itm.caption="Photos";
		itm.action="photos";
		itm.highlight="momentary";
		this.info.push(itm);*/

		var itm={};
		itm.icon="images/banks_32.png";
		itm.caption="Nearby Banks and ATMs";
		itm.action="banks";
		itm.highlight="momentary";
		this.info.push(itm);

		var itm={};
		itm.icon="images/parking_32.png";
		itm.caption="Nearby Parking";
		itm.action="parking";
		itm.highlight="momentary";
		this.info.push(itm);

		/*var itm={};
		itm.icon="images/todo_32.png";
		itm.caption="Add Place to Your To Do List";
		itm.action="todo";
		itm.highlight="";
		this.info.push(itm);*/

	
	
	this.controller.get("venueScrim").hide();
	this.controller.get("venueSpinner").mojo.stop();
	this.controller.get("venueSpinner").hide();
	this.infoModel.items=this.info;
	this.controller.modelChanged(this.infoModel);



	
	//attach events to any new user links
	//var userlinks=zBar.getElementsByClassName("userLink",this.controller.get("main-venuedetail"));
	var userlinks=this.controller.get("main-venuedetail").querySelectorAll(".userLink");
	this.userlinks=userlinks;
	this.ulinks_len=userlinks.length;
	
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e];
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showUserInfoBound);
		logthis("#########added event to "+eid)
	}

}



VenuedetailAssistant.prototype.getVenueInfoFailed = function(response) {
	logthis("############error! "+response.status);
	logthis("############error! "+response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the venue's info", {source: 'notification'});
}
var checkinDialog;


VenuedetailAssistant.prototype.promptCheckin = function(event) {
	
	this.controller.stageController.pushScene({name: "checkin", transition: Mojo.Transition.zoomFade},this.venue);

}

VenuedetailAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
	if (_globals.auth) {
		sf=(sf==0)? 1: 0;
		var url = 'https://api.foursquare.com/v1/checkin.json';
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
	} else {
	}
}
VenuedetailAssistant.prototype.markClosed = function() {
/*	if (_globals.auth) {
		var url = 'https://api.foursquare.com/v1/venue/flagclosed.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.venue.id,
			},
			onSuccess: this.markClosedSuccess.bind(this),
			onFailure: this.markClosedFailed.bind(this)
		});
	} else {
	}*/
		foursquarePost(this, {
			endpoint: 'venues/'+this.venue.id+'/flag',
			requiresAuth: true,
			parameters: {problem:'closed'},
			debug:true,
			onSuccess: this.markClosedSuccess.bind(this),
			onFailure: this.markClosedFailed.bind(this)
			
		});
	
	
}
VenuedetailAssistant.prototype.markMislocated = function() {
/*	if (_globals.auth) {
		var url = 'https://api.foursquare.com/v1/venue/flagmislocated.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.venue.id,
			},
			onSuccess: this.markMislocatedSuccess.bind(this),
			onFailure: this.markMislocatedFailed.bind(this)
		});
	} else {
	}*/
		foursquarePost(this, {
			endpoint: 'venues/'+this.venue.id+'/flag',
			requiresAuth: true,
			debug:true,
			parameters: {problem:'mislocated'},
			onSuccess: this.markMislocatedSuccess.bind(this),
			onFailure: this.markMislocatedFailed.bind(this)
			
		});

}
VenuedetailAssistant.prototype.markDuplicate = function() {
/**	if (_globals.auth) {
		var url = 'https://api.foursquare.com/v1/venue/flagduplicate.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.venue.id,
			},
			onSuccess: this.markDuplicateSuccess.bind(this),
			onFailure: this.markDuplicateFailed.bind(this)
		});
	} else {
	}*/
		foursquarePost(this, {
			endpoint: 'venues/'+this.venue.id+'/flag',
			requiresAuth: true,
			debug:true,
			parameters: {problem:'duplicate'},
			onSuccess: this.markDuplicateSuccess.bind(this),
			onFailure: this.markDuplicateFailed.bind(this)
			
		});

}

VenuedetailAssistant.prototype.showBanks = function(event) {
	this.controller.stageController.pushScene("meta-list","banks",this.vgeolat,this.vgeolong,this.vaddress,this.vcity,this.vstate);
}


VenuedetailAssistant.prototype.showParking = function(event) {
	this.controller.stageController.pushScene("meta-list","parking",this.vgeolat,this.vgeolong,this.vaddress,this.vcity,this.vstate);

}


VenuedetailAssistant.prototype.showFlickr = function(event) {
	this.controller.stageController.pushScene({name: "photos", transition: Mojo.Transition.zoomFade},this.venue);

	
}



VenuedetailAssistant.prototype.tryflickrUpload = function(event) {
	//gotta get the file:
			this.controller.stageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,this.venue.id,this.venue.name,null,this.imgfileName);

}

VenuedetailAssistant.prototype.doUpload = function(event) {
	var fn=event.fullPath;
	var appController = Mojo.Controller.getAppController();
  	var cardStageController = appController.getStageController("mainStage");
	cardStageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,fn,this.venue.id);
}

VenuedetailAssistant.prototype.handleFlickrTap = function(event) {
	var url=event.target.getAttribute("link");
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
	    method: 'open',
	    parameters: {
			target: url
		}
	});
}

VenuedetailAssistant.prototype.markClosedSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue has been marked closed!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markClosedFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error marking venue as closed!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markMislocatedSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue has been marked as mislocated!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markMislocatedFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error marking venue as mislocated!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markDuplicateSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue has been marked as a duplicate!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markDuplicateFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error marking venue as a duplicate!", {source: 'notification'});
}


VenuedetailAssistant.prototype.reshowTip=function(event) {

	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"tip",this.tipText,this.tipURL,this.tipfileName)
	});

}

VenuedetailAssistant.prototype.doAddTip = function() {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"tip",'','',this.tipfileName)
	});

};

VenuedetailAssistant.prototype.handleAddTip=function(event) {
	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
					this.tipfileName=fn.fullPath;
					this.tiphasPhoto=true;
					this.doAddTip();
			
				}.bind(this)},this.controller.stageController);
			}else{
				this.tiphasPhoto=false;
				this.tipfileName=undefined;
				this.doAddTip();
			}
		}.bind(this),
		title:this.venue.name,
		message:"Do you want to attach a photo to your new tip?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});




}
VenuedetailAssistant.prototype.handleAddTodo=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"todo")
	});

}

VenuedetailAssistant.prototype.uploadPhoto = function(event) {
	this.controller.stageController.pushScene("attach-photo",{type:'venue',item:this.venue});
};

VenuedetailAssistant.prototype.handleMarkClosed=function(event) {
this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.markClosed();
			}
		},
		title:this.venue.name,
		message:"Do you want to mark this venue as closed?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});
}
VenuedetailAssistant.prototype.handleMarkMislocated=function(event) {
this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.markMislocated();
			}
		},
		title:this.venue.name,
		message:"Do you want to mark this venue as mislocated?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});
}
VenuedetailAssistant.prototype.handleMarkDupe=function(event) {
this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				this.markDuplicate();
			}
		},
		title:this.venue.name,
		message:"Do you want to mark this venue as a duplicate?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});
}
VenuedetailAssistant.prototype.handleProposeEdit=function(event) {
	var thisauth=auth;
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},thisauth,true,this.venue);
}

VenuedetailAssistant.prototype.showUserInfo = function(event) {
	var thisauth=auth;
	var uid=event.target.readAttribute("data");
	var uname=event.target.readAttribute("user");
	

	this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,uid,this,true);


}
VenuedetailAssistant.prototype.activate = function(event) {
	NavMenu.setup(this,{buttons:'navOnly',class:'trans'});
	if(this.gotInfo){this.getVenueInfo();}
	
}


VenuedetailAssistant.prototype.handleCommand = function(event) {
		var s=this.controller.stageController.getScenes();
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);					
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
					}
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
					}
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
                	if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);					
					}
					break;
                case "do-Shout":
                	var thisauth=_globals.auth;
                	if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
                	if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);	
					}
                	break;
                case "do-Todos":
                	var thisauth=_globals.auth;
                	if(s[0].sceneName=="venuedetail"){
						this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}else{
						this.controller.stageController.popScene();
						this.prevScene.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
					}
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade},this);
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade},this);
                	break;
                case "do-Refresh":
					this.controller.get("venueScrim").show();
					this.controller.get("venueSpinner").mojo.start();
					this.controller.get("venueSpinner").show();
					this.getVenueInfo();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
      			case "show-Details":
      				this.swapTabs(1);
      				break;
      			case "show-People":
      				this.swapTabs(2);
      				break;
      			case "show-Tips":
      				this.swapTabs(3);
      				break;
      			case "add-Tip":
      				this.handleAddTip();
      				break;
      			case "add-Todo":
      				this.handleAddTodo();
      				break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
                case "add-Photo":
                	this.uploadPhoto();
                	break;
      			case "flag-venue":
				    this.controller.popupSubmenu({
		                items: [{label: $L('Suggest an Edit'), command: 'edit', icon: 'status-available-dark'},
		                    {label: $L('Flag as Closed'), command: 'closed'},
		                    {label: $L('Flag as Mislocated'), command: 'mislocated'},
		                    {label: $L('Flag as Duplicate'), command: 'duplicate'}
		                ],
		                onChoose: function(arg) {
		                   switch(arg) {
		                   		case "edit":
		       						this.handleProposeEdit();
		                   			break;
		                   		case "closed":
		                   			this.handleMarkClosed();
		                   			break;
		                   		case "mislocated":
		                   			this.handleMarkMislocated();
		                   			break;
		                   		case "duplicate":
		                   			this.handleMarkDupe();
		                   			break;
		                   }
		                }.bind(this)
				    });
					break;
      			case "share-venue":
				    this.controller.popupSubmenu({
		                items: [{label: $L('E-mail Venue Info'), command: 'email'},
		                    {label: $L('SMS Venue Info'), command: 'sms'}
		                ],
		                onChoose: function(arg) {
		                   switch(arg) {
		                   		case "email":
		                   			var address=(this.venue.location.address!=undefined)? this.venue.location.address+"<br>": '';
		                   			var city=(this.venue.location.city!=undefined)? this.venue.location.city+", ": '';
		                   			var state=(this.venue.location.state!=undefined)? this.venue.location.state+" ":'';
		                   			var zip=(this.venue.location.postalCode!=undefined)? this.venue.location.postalCode: '';
		                   			var phone=(this.venue.contact.phone!=undefined)? "<br>"+this.venue.contact.phone: '';
		                   			var shorturl=(this.vshorturl!=undefined)? "<br>"+this.vshorturl: '';
		                   		
		                   			var body=this.venue.name+"\n"+address+city+state+zip+phone;
									this.controller.serviceRequest(
									    "palm://com.palm.applicationManager", {
									        method: 'open',
									        parameters: {
									            id: "com.palm.app.email",
									            params: {
									                summary: this.venue.name,
									                text: this.venue.name+"<br>"+address+city+state+zip+phone+shorturl
									            }
									        }
									    }
									);
 		                   			break;
		                   		case "sms":
		                   			var address=(this.venue.location.address!=undefined)? " "+this.venue.location.address: '';
		                   			var shorturl=(this.vshorturl!=undefined)? " "+this.vshorturl: '';

									this.controller.serviceRequest('palm://com.palm.applicationManager', {
									     method: 'launch',
									     parameters: {
									         id: 'com.palm.app.messaging',
									         params: {
										         messageText: this.venue.name+address+shorturl
									         }
									     }
									 });
 		                   			break;
		                   }
		                }.bind(this)
				    });
					break;
            }
            
            
        }else if(event.type===Mojo.Event.back){
        	if(this.inOverview==false){
	        	logthis("back");
				event.preventDefault();
				event.stopPropagation();
				event.stop();
		        this.swapTabs(0);        	
        	}else if(this.controller.get("special_overlay").style.display!="none"){
	        	logthis("back2");
				event.preventDefault();
				event.stopPropagation();
				event.stop();
		        this.controller.get("special_overlay").hide();
        	}else if(this.fromMap==true){
	        	logthis("back3");
				event.preventDefault();
		        var thisauth=_globals.auth;
				this.controller.stageController.popScene();
        	}
        }
        
        
        
}

VenuedetailAssistant.prototype.tagTapped = function(event) {
	var q=event.target.innerHTML;
	var s=this.controller.stageController.getScenes();
	if(s[0].sceneName=="nearby-venues"){
		this.controller.stageController.popScenesTo("nearby-venues",{transition: Mojo.Transition.crossFade,search:true,query:q});
	}else{
		logthis("not nv scene");
		s[0].stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},'',_globals.userData,this.username,this.password,this.uid);
		this.controller.stageController.popScenesTo("nearby-venues",{transition: Mojo.Transition.crossFade,search:true,query:q});		
	}
	
}



VenuedetailAssistant.prototype.deactivate = function(event) {
}

VenuedetailAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("checkinButton"),Mojo.Event.tap,this.promptCheckinBound);
 	Mojo.Event.stopListening(this.controller.get("venueMap"),Mojo.Event.tap, this.showGoogleMapsBound);
	Mojo.Event.stopListening(this.controller.get("overlay-closer"),Mojo.Event.tap, this.overlayCloserBound);
	Mojo.Event.stopListening(this.controller.get('infoList'),Mojo.Event.listTap, this.infoTappedBound);
	Mojo.Event.stopListening(this.controller.get("todohere"),Mojo.Event.tap,this.showTodoBound);


	Mojo.Event.stopListening(this.controller.get("mayor-row"),Mojo.Event.tap,this.flipMayorBound);
	Mojo.Event.stopListening(this.controller.get("whoshere-row"),Mojo.Event.tap,this.flipPeopleBound);
	Mojo.Event.stopListening(this.controller.get("tips-row"),Mojo.Event.tap,this.flipTipsBound);
	Mojo.Event.stopListening(this.controller.get("more-row"),Mojo.Event.tap,this.flipMoreBound);

	Mojo.Event.stopListening(this.controller.get('tips-list'),Mojo.Event.listTap, this.tipListTappedBound);
	Mojo.Event.stopListening(this.controller.get("specialScroller"), Mojo.Event.propertyChange, this.specialScrollBound);

	for(var e=0;e<this.ulinks_len;e++) {
		var eid=this.userlinks[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showUserInfoBound);
	}
	for(var t=0;t<this.tagsCount;t++) {
	 	Mojo.Event.stopListening(this.controller.get("tag"+t),Mojo.Event.tap, this.tagTappedBound);
	}
}

