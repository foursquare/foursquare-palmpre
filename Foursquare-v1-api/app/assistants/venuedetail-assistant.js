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
	this.controller.get("checkinVenueAddress").innerHTML=this.venue.address;
	if (this.venue.crossstreet) {
		this.controller.get("checkinVenueAddress").innerHTML += " "+this.venue.crossstreet+"";
	}

	var query=encodeURIComponent(this.venue.address+' '+this.venue.city+', '+this.venue.state);
	this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+this.venue.geolat+","+this.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
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

    this.controller.setupWidget("venueSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

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
					      		"user":this.fmtTipUser.bind(this),
					      		"created":this.fmtTipWhen.bind(this)
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


	if(this.venue.address==undefined || this.venue.address==""){
		logthis("no addy:");
		logthis("at "+this.venue.geolat+", "+this.venue.geolong);
		this.controller.serviceRequest('palm://com.palm.location', {
				method: "getReverseLocation",
				parameters: {latitude: this.venue.geolat, longitude:this.venue.geolong},
				onSuccess: function(address){
					logthis("got approx addy");
					//logthis("addy="+Object.toJSON(address));
					this.controller.get("checkinVenueAddress").innerHTML="Near "+address.substreet+" "+address.street;
					logthis("set html addy thing");
					this.venue.address="Near "+address.substreet+" "+address.street;
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
	 foursquareGet(this, {
	 	endpoint: 'venue.json',
	 	requiresAuth: true,
	 	debug: true,
  	    parameters: {vid:this.venue.id},
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
				   try{
				      this.controller.serviceRequest("palm://com.palm.applicationManager", {
				         method: 'launch',
				         parameters: {
				            id: 'com.superinhuman.badkitty',
				            params: {action: 'user', name: event.item.username}
				         },
				         onSuccess:function(){
				         }.bind(this),
				         onFailure:function(){
				            this.controller.serviceRequest('palm://com.palm.applicationManager', {
				                method:'open',
				                   parameters:{
				                   target: event.item.url
				                        }
				             });
				         }.bind(this)
				      })
				   }catch(e){
				   }
				
					break;
				case "tweetme":
					logthis("tweetme");
				   try{
				      this.controller.serviceRequest("palm://com.palm.applicationManager", {
				         method: 'launch',
				         parameters: {
				            id: 'com.catalystmediastudios.tweetme',
				            params: {action: 'user', name: event.item.username}
				         },
				         onSuccess:function(){
				         }.bind(this),
				         onFailure:function(){
				            this.controller.serviceRequest('palm://com.palm.applicationManager', {
				                method:'open',
				                   parameters:{
				                   target: event.item.url
				                        }
				             });
				         }.bind(this)
				      })
				   }catch(e){
				   }
				
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
		var later = new Date(cre);
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


VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	logthis("success");
	var th=this;
	
	this.gotInfo=true;
	
	if((this.venue.hasTodo==true || this.venue.hasTodo=="true")){
		this.infoFired=true;
		logthis("has todo");
		this.todoArray=response.responseJSON.venue.todos; //todoArray;
		this.controller.get("todohere").show();
	}


	//logthis("num specials="+response.responseJSON.venue.specials.length);
	this.controller.get("vcategory").innerHTML=(response.responseJSON.venue.primarycategory)? 
		'<img src="'+response.responseJSON.venue.primarycategory.iconurl+'"><br/>'+response.responseJSON.venue.primarycategory.nodename: '';
	
	
	this.controller.get("checkinVenueAddress").innerHTML=(this.controller.get("checkinVenueAddress").innerHTML=="")? response.responseJSON.venue.address: this.controller.get("checkinVenueAddress").innerHTML;
	
	
	this.vaddress=response.responseJSON.venue.address;
	this.vcity=response.responseJSON.venue.city;
	this.vstate=response.responseJSON.venue.state;
	
	if(this.fromLaunch){
		this.controller.get("checkinVenueName").innerHTML=response.responseJSON.venue.name;
		this.controller.get("checkinVenueAddress").innerHTML=response.responseJSON.venue.address;
		if (response.responseJSON.venue.crossstreet) {
			this.controller.get("checkinVenueAddress").innerHTML += " ("+response.responseJSON.venue.crossstreet+")";
		}
	
		var query=encodeURIComponent(response.responseJSON.venue.address+' '+response.responseJSON.venue.city+', '+response.responseJSON.venue.state);
		this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	}
	
	
	Mojo.Log.error("vadd=%i, vcity=%i, vstate=%i",this.vaddress,this.vcity,this.vstate);
	
	if (response.responseJSON.venue.crossstreet && !this.venue.crossstreet && !this.fromLaunch) {
	 this.controller.get("checkinVenueAddress").innerHTML += " ("+response.responseJSON.venue.crossstreet+")";
	}
	if(this.controller.get("venueMap").src!="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA") {
		this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";
		this.venue.geolat=response.responseJSON.venue.geolat;
		this.venue.geolong=response.responseJSON.venue.geolong;
	}
	
	//mayorial stuff
	if(response.responseJSON.venue.stats.mayor != undefined) { //venue has a mayor
		this.controller.get("snapMayor").show();
		var lname=(response.responseJSON.venue.stats.mayor.user.lastname != undefined)? response.responseJSON.venue.stats.mayor.user.lastname: '';
		this.mayorId=response.responseJSON.venue.stats.mayor.user.id;

		this.controller.get("mayorPic").src=response.responseJSON.venue.stats.mayor.user.photo;
		this.controller.get("mayorPic").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorPic").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
//		this.controller.get("mayorPicBorder").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
//		this.controller.get("mayorPicBorder").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
//		this.controller.get("mayorAvatar").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
//		this.controller.get("mayorAvatar").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		
		this.controller.get("mayorName").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		this.controller.get("mayorName").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorName").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);



		this.controller.get("mayorPic2").src=response.responseJSON.venue.stats.mayor.user.photo;
		this.controller.get("mayorPic2").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorPic2").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		this.controller.get("mayorPicBorder2").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorPicBorder2").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		this.controller.get("mayorAvatar2").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorAvatar2").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		
		this.controller.get("mayorName2").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		this.controller.get("mayorName2").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorName2").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		var mInfo;
		switch(response.responseJSON.venue.stats.mayor.user.gender) {
			case "male":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="He's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			case "female":
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="She's checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
			default:
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="They've checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";
				break;
				
		}
		if(response.responseJSON.venue.stats.mayor.user.id==_globals.uid){
				var s=(response.responseJSON.venue.stats.mayor.count!=1)? "s": ""; 
				mInfo="You've checked in here "+response.responseJSON.venue.stats.mayor.count+" time"+s+".";			
		}
		this.controller.get("mayorInfo").innerHTML=mInfo;
		this.controller.get("mayorInfo2").innerHTML=mInfo;
		this.nomayor=false;
	}else{
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
	

	
		//specials!
	if(response.responseJSON.venue.specials != undefined) {
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


	
	//tips stuff
	if(response.responseJSON.venue.tips != undefined) {
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
				/*status: response.responseJSON.venue.tips[t].status, */
			
		/*	logthis("tiphash="+Object.toJSON(tipHash));
		}catch(e){
			logthis("tip error:"+e);
		}
		logthis("tip-break3.5");
			//tips+=Mojo.View.render({object: tipHash, template: 'listtemplates/vtipsitem'});
			
			this.tipsModel.items.push(tipHash);
					logthis("tips-break4");

		}
		
		var boldtips='';
		var greytips='';
		if(this.friendCount==0){
			var s=(this.userCount==1)? ' has': 's have';
			boldtips=this.userCount+' tip'+s+' been left here';
			greytips='Be the first of your friends to leave one!';
		}else if(this.friendCount>0){
			var s=(this.friendCount==1)? '': 's';
			boldtips=this.friendCount+' tip'+s+' from friends';
			if(this.userCount>0){
				greytips=this.userCount+' left by other people';
			}
		}
				logthis("tips-break5");
			logthis("bt="+boldtips+", gt="+greytips);

		this.controller.get("friend-tips").update(boldtips);
		logthis("tips-break5.5");
		this.controller.get("others-tips").update(greytips);
		logthis("tips-break5.75");
		//this.controller.modelChanged(this.tipsModel);
		logthis("tips=break5.9");*/
	}else{
			logthis("tips-break6");

		var tips='<div id="notice" style="margin-top: 75px">No tips have been left here yet.</div>';
		this.controller.get("venueTips").update(tips);
		
		this.controller.get("friend-tips").update('No tips have been left here');
		this.controller.get("others-tips").update('Leave a tip and let others know your secret!');

	}
		logthis("tips-break7");

	//who's here? stuff
	if(response.responseJSON.venue.checkins != undefined) {
		//logthis("************************checkins: "+Object.toJSON(response.responseJSON.venue.checkins));
		this.controller.get("snapUsers").show();
		this.controller.get("whoshere-row").show();
		var users='';
		var friendsPics='';		
		var usersPics='';
		var friendCount=0;
		var userCount=0;
		
		for (var t=0;t<response.responseJSON.venue.checkins.length;t++) {
			var shout=(response.responseJSON.venue.checkins[t].shout != undefined)? response.responseJSON.venue.checkins[t].shout: "";
			var created=response.responseJSON.venue.checkins[t].created;
			var tlname=(response.responseJSON.venue.checkins[t].user.lastname != undefined)? response.responseJSON.venue.checkins[t].user.lastname : '';
			var username=response.responseJSON.venue.checkins[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.checkins[t].user.photo;
			var uid=response.responseJSON.venue.checkins[t].user.id;
			//logthis("we're here"+t);
			var isfriend=isFriend(uid);
			
			
			if(response.responseJSON.venue.checkins[t].created != undefined) {
				var now = new Date;
				var later = new Date(response.responseJSON.venue.checkins[t].created);
				var offset = later.getTime() - now.getTime();
				var when=this.relativeTime(offset) + " ago";
			}else{
			   	var when="";
			}
			var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			shout=shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');

			if(isfriend){
				if(parseInt(friendCount)+parseInt(userCount)<6){			
					friendsPics+='<img width="32" height="32" src="'+photo+'" data="'+uid+'" class="friend-avatar">';
				}
				friendCount++;
			}else{
				if(parseInt(friendCount)+parseInt(userCount)<6){			
					usersPics+='<img width="32" height="32" src="'+photo+'" data="'+uid+'" class="friend-avatar">';
				}
				userCount++;			
			}
			//logthis("counts="+friendCount+userCount);
			
			
			var userHash={
				photo: photo,
				uid: uid,
				t: t,
				username: username,
				timeago: when,
				shout: shout
			};
			if(shout!=undefined && shout!=""){
				users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere-shout'});
			}else{
				users+=Mojo.View.render({object: userHash, template: 'listtemplates/whoshere'});			
			}
			Mojo.doNothing();
		}
		
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

	}else{
		this.controller.get("snapUsers").hide();
		this.controller.get("whoshere-row").hide();
	}
	
	
	//venue info stuff
	var totalcheckins=response.responseJSON.venue.stats.checkins;
	var beenhere=response.responseJSON.venue.stats.beenhere.me;
	var twitter=response.responseJSON.venue.twitter;
	var phone=response.responseJSON.venue.phone;
	var tags=response.responseJSON.venue.tags;
	var venuelinks=response.responseJSON.venue.links;
		logthis("phone="+phone);

	this.info=[];
	
	//venue category
	if(response.responseJSON.venue.primarycategory){
		var itm={};
		itm.icon=response.responseJSON.venue.primarycategory.iconurl;
		itm.caption=response.responseJSON.venue.primarycategory.nodename;
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
	}

	var vinfo='';
	var s=(totalcheckins != 1)? "s" :"";
	if (totalcheckins>0) {
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has been visited '+totalcheckins+' time'+s+' ';
		vinfo+=(beenhere)? 'and you\'ve been here before': 'but you\'ve never been here';
		vinfo+='.<br/>';
		
		var itm={};
		itm.icon="images/marker_32.png";
		itm.caption=totalcheckins+" Check-in"+s+" Here";
		itm.action="";
		itm.highlight="";
		this.info.push(itm);

		var itm={};
		itm.icon="images/beenhere_32.png";
		itm.caption=(beenhere)? "You've been here":"You've never been here";
		itm.action="";
		itm.highlight="";
		this.info.push(itm);

	}else{
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has never been visited! Be the first to check-in!<br/>';	

		var itm={};
		itm.icon="images/marker_32.png";
		itm.caption="No one has checked-in here";
		itm.action="";
		itm.highlight="";
		this.info.push(itm);
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



	var boldtips='No tips have been left here';
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
	this.controller.get("others-tips").update(greytips);

	
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
	if (_globals.auth) {
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
	}
}
VenuedetailAssistant.prototype.markMislocated = function() {
	if (_globals.auth) {
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
	}
}
VenuedetailAssistant.prototype.markDuplicate = function() {
	if (_globals.auth) {
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
	}
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


VenuedetailAssistant.prototype.handleAddTip=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"tip")
	});

}
VenuedetailAssistant.prototype.handleAddTodo=function(event) {
	var thisauth=auth;
	var dialog = this.controller.showDialog({
		template: 'listtemplates/add-tip',
		assistant: new AddTipDialogAssistant(this,thisauth,this.venue.id,"todo")
	});

}
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
		                   			var address=(this.venue.address!=undefined)? this.venue.address+"<br>": '';
		                   			var city=(this.venue.city!=undefined)? this.venue.city+", ": '';
		                   			var state=(this.venue.state!=undefined)? this.venue.state+" ":'';
		                   			var zip=(this.venue.zip!=undefined)? this.venue.zip: '';
		                   			var phone=(this.venue.phone!=undefined)? "<br>"+this.venue.phone: '';
		                   		
		                   			var body=this.venue.name+"\n"+address+city+state+zip+phone;
									this.controller.serviceRequest(
									    "palm://com.palm.applicationManager", {
									        method: 'open',
									        parameters: {
									            id: "com.palm.app.email",
									            params: {
									                summary: this.venue.name,
									                text: this.venue.name+"<br>"+address+city+state+zip+phone
									            }
									        }
									    }
									);
 		                   			break;
		                   		case "sms":
		                   			var address=(this.venue.address!=undefined)? " "+this.venue.address: '';
									this.controller.serviceRequest('palm://com.palm.applicationManager', {
									     method: 'launch',
									     parameters: {
									         id: 'com.palm.app.messaging',
									         params: {
										         messageText: this.venue.name+address
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

