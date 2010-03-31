function VenuedetailAssistant(venue,u,p,i,fui,ps,fm) {
	   this.venue=venue;
	   this.username=_globals.username;
	   this.password=_globals.password;
	   this.uid=_globals.uid;
	   this.fromuserinfo=fui;
	   this.vgeolat=this.venue.geolat;
	   this.vgeolong=this.venue.geolong;
	   this.prevScene=ps;
	   this.fromMap=fm;
}

VenuedetailAssistant.prototype.setup = function() {
	this.controller.get("snapMayor").hide();
	this.controller.get("checkinVenueName").innerHTML=this.venue.name;
	this.controller.get("checkinVenueAddress").innerHTML=this.venue.address;
	if (this.venue.crossstreet) {
		this.controller.get("checkinVenueAddress").innerHTML += " ("+this.venue.crossstreet+")";
	}

	var query=encodeURIComponent(this.venue.address+' '+this.venue.city+', '+this.venue.state);
	this.controller.get("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x125&sensor=false&markers=color:blue|"+this.venue.geolat+","+this.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	//zBar.render("venue","");
	this.getVenueInfo();
	
    this.controller.setupWidget("detailScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
         });
	this.controller.setupWidget("overlayScroller",
         this.scroll2Attributes = {
             mode: 'vertical-snap'
         },
         this.scroll2Model = {
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
    this.controller.setupWidget("buttonAddTip",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add Tip",
            disabled: false
        });
    this.controller.setupWidget("buttonAddTodo",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Add To-do",
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
    this.controller.setupWidget("tabButtons",
        this.tabAttributes = {
            choices: [
                {label: "Details", value: 1},
                {label: "People", value: 2},
                {label: "Tips", value: 3}
            ]
        },
        this.tabModel = {
            value: 1,
            disabled: false
        }
    );
	
	Mojo.Event.listen(this.controller.get("checkinButton"),Mojo.Event.tap,this.promptCheckin.bind(this));
	Mojo.Event.listen(this.controller.get("buttonAddTip"),Mojo.Event.tap, this.handleAddTip.bind(this));
	Mojo.Event.listen(this.controller.get("buttonAddTodo"),Mojo.Event.tap, this.handleAddTodo.bind(this));
	Mojo.Event.listen(this.controller.get("buttonMarkClosed"),Mojo.Event.tap, this.handleMarkClosed.bind(this));
	Mojo.Event.listen(this.controller.get("buttonProposeEdit"),Mojo.Event.tap, this.handleProposeEdit.bind(this));
//	Mojo.Event.listen(this.controller.get("mayorDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
//	Mojo.Event.listen(this.controller.get("tipsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
//	Mojo.Event.listen(this.controller.get("specialsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
//	Mojo.Event.listen(this.controller.get("tagsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
//	Mojo.Event.listen(this.controller.get("infoDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	//Mojo.Event.listen(this.controller.get("mapDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen(this.controller.get("flickr-button"),Mojo.Event.tap, this.showFlickr.bind(this));
	Mojo.Event.listen(this.controller.get("banks-button"),Mojo.Event.tap, this.showBanks.bind(this));
	Mojo.Event.listen(this.controller.get("parking-button"),Mojo.Event.tap, this.showParking.bind(this));
 	Mojo.Event.listen(this.controller.get("venueMap"),Mojo.Event.tap, this.showGoogleMaps.bind(this));
	Mojo.Event.listen(this.controller.get("overlay-closer"),Mojo.Event.tap, function(){this.controller.get("docheckin-fields").hide();this.controller.get("overlay-content").innerHTML="";this.controller.get("meta-overlay").hide();}.bind(this));
	Mojo.Event.listen(this.controller.get("tabButtons"), Mojo.Event.propertyChange, this.swapTabs.bind(this));

	this.controller.get("meta-overlay").hide();
	this.controller.get("results-meta-list").hide();
	
	
	this.flickrUpload='<span id="flickrUploader" class="vtip-black" style="white-space:nowrap;">Upload</span>';
	//this.setupCheckin();
}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

VenuedetailAssistant.prototype.swapTabs = function(event) {
	this.controller.get("detailScroller").mojo.revealTop();
	switch(this.tabModel.value){
		case 1:
			this.controller.get("people-group").hide();
			this.controller.get("tips-group").hide();
			this.controller.get("details-group").show();
			break;
		case 2:
			this.controller.get("people-group").show();
			this.controller.get("tips-group").hide();
			this.controller.get("details-group").hide();		
			break;
		case 3:
			this.controller.get("people-group").hide();
			this.controller.get("tips-group").show();
			this.controller.get("details-group").hide();
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
	var url = 'http://api.foursquare.com/v1/venue.json';
	auth = _globals.auth;
	Mojo.Log.error("un="+this.username);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:auth},
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




VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	var th=this;
	this.controller.get("vcategory").innerHTML=(response.responseJSON.venue.primarycategory)? 
		'<img src="'+response.responseJSON.venue.primarycategory.iconurl+'"><br/>'+response.responseJSON.venue.primarycategory.nodename: '';
	
	
	this.controller.get("checkinVenueAddress").innerHTML=(this.controller.get("checkinVenueAddress").innerHTML=="")? response.responseJSON.venue.address: this.controller.get("checkinVenueAddress").innerHTML;
	
	
	if (response.responseJSON.venue.crossstreet && !this.venue.crossstreet) {
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

		this.controller.get("mayorPic").src=response.responseJSON.venue.stats.mayor.user.photo;
		this.controller.get("mayorPic").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorPic").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		this.controller.get("mayorPicBorder").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorPicBorder").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		this.controller.get("mayorAvatar").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorAvatar").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		
		this.controller.get("mayorName").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		this.controller.get("mayorName").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		this.controller.get("mayorName").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
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
		
	}
	
		//specials!
	if(response.responseJSON.venue.specials != undefined) {
		for(var b = 0; b < response.responseJSON.venue.specials.length;b++) {
			var special_type=response.responseJSON.venue.specials[b].type;
			var special_msg=response.responseJSON.venue.specials[b].message;
			switch(special_type) { //can be 'mayor','count','frequency','other' we're just gonna lump non-mayor specials into one category
				case "mayor":
					var spt="<img src=\"images/smallcrown.png\" width=\"22\" height=\"22\" /> Mayor Special";
					break;
				default:
					var spt="<img src=\"images/starburst.png\" width=\"22\" height=\"22\" /> Foursquare Special";
					break;
			}
			var special_venue="";
			
			if(response.responseJSON.venue.specials[b].venue != undefined) { //not at this venue, but nearby
				spt=spt+" Nearby";
				special_venue="@ "+response.responseJSON.venue.specials[b].venue.name;
			}
			//spt="Mayor Special";
			//special_msg="There's a special text thing here. There's a special text thing here. There's a special text thing here. ";
			//special_venue="@ Venue Name (123 Venue St.)";
			this.controller.get('venueSpecials').innerHTML += '<div class="checkin-special"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class="palm-list special-list"><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>';
		}
	}else{
		this.controller.get("snapSpecials").hide();
	}

	
	//tips stuff
	if(response.responseJSON.venue.tips != undefined) {
		this.controller.get("snapTips").show();
		var tips='';
		for (var t=0;t<response.responseJSON.venue.tips.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var tip=response.responseJSON.venue.tips[t].text;
			var tipid=response.responseJSON.venue.tips[t].id;
			var created=response.responseJSON.venue.tips[t].created;
			var tlname=(response.responseJSON.venue.tips[t].user.lastname != undefined)? response.responseJSON.venue.tips[t].user.lastname : '';
			var username=response.responseJSON.venue.tips[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.tips[t].user.photo;
			var uid=response.responseJSON.venue.tips[t].user.id;

			tips+='<div class="palm-row single aTip">';
			tips+='<img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="48" class="userLink friend-avatar" user="'+username+'" data="'+uid+'" style="display: block;float:left;"/>';
			tips+='<div style="float:right;width:240px;margin-right: 4px;"><span class="venueTip" style="">'+tip+'</span><br/>';
			tips+='<span class="venueTipUser userLink" user="'+username+'" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >by '+username+'</span>';
			tips+='<br class="breaker"/><div class="tip-buttons" style="width:100%;margin:5px auto 5px -20px">';
			tips+='<span class="vtip tipsave" id="tip-save-'+t+'" data="'+tipid+'">Save Tip</span> ';
			tips+='<span class="vtip-black tipdone" id="tip-done-'+t+'" data="'+tipid+'">I\'ve Done This</span></div></div></div>'+"\n";
			tips+='<br class="breaker"/>';
		}
		this.controller.get("venueTips").update(tips);
	}

	//who's here? stuff
	if(response.responseJSON.venue.checkins != undefined) {
		this.controller.get("snapUsers").show();
		var users='';
		for (var t=0;t<response.responseJSON.venue.checkins.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var shout=(response.responseJSON.venue.checkins[t].shout != undefined)? response.responseJSON.venue.checkins[t].shout: "";
			var created=response.responseJSON.venue.checkins[t].created;
			var tlname=(response.responseJSON.venue.checkins[t].user.lastname != undefined)? response.responseJSON.venue.checkins[t].user.lastname : '';
			var username=response.responseJSON.venue.checkins[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.checkins[t].user.photo;
			var uid=response.responseJSON.venue.checkins[t].user.id;
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


			users+='<div class="palm-row single aTip">';
			users+='<img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="48" class="userLink friend-avatar"  user="'+username+'" data="'+uid+'" style="display: block;float:left;"/>'; 
			if(shout!=undefined && shout!=""){
				users+='<div style="float:right;width:240px;margin-right: 4px;"><span class="venueTip">'+shout+'</span>';
				users+='<br/><span class="venueTipUser fakelink userLink" data="'+uid+'" user="'+username+'" id="tip-name-'+uid+'-'+t+'" >'+username+' '+when+'</span></div></div>'+"\n";
			}else{
				users+='<div style="float:right;width:240px;margin-right: 4px;">';
				users+='<span class="venueTip fakelink userLink" data="'+uid+'" user="'+username+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="venueTipUser">'+when+'</span></div></div>'+"\n";			
			}
		}
		this.controller.get("venueUsers").update(users);
	}else{
		this.controller.get("snapUsers").hide();
	}
	
	
	//venue info stuff
	var totalcheckins=response.responseJSON.venue.stats.checkins;
	var beenhere=response.responseJSON.venue.stats.beenhere.me;
	var twitter=response.responseJSON.venue.twitter;
	var phone=response.responseJSON.venue.phone;
	var tags=response.responseJSON.venue.tags;
	var venuelinks=response.responseJSON.venue.links;
		Mojo.Log.error("phone="+phone);

	var vinfo='';
	var s=(totalcheckins != 1)? "s" :"";
	if (totalcheckins>0) {
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has been visited '+totalcheckins+' time'+s+' ';
		vinfo+=(beenhere)? 'and you\'ve been here before': 'but you\'ve never been here';
		vinfo+='.<br/>';
	}else{
		vinfo='<span class="capitalize">'+response.responseJSON.venue.name+'</span> has never been visited! Be the first to check-in!<br/>';	
	}
	vinfo+=(twitter != undefined)? '<img src="images/bird.png" width="20" height="20" /> <a href="http://twitter.com/'+twitter+'">@'+twitter+'</a><br/>': '';
	vinfo+=(phone != undefined)? '<img src="images/phone.png" width="20" height="20" /> <a href="tel://'+phone+'">'+phone+'</a><br/>': '';
	Mojo.Log.error("vnfo="+vinfo);
	this.controller.get("venueInfo").innerHTML=vinfo;
	
	//tags
	if(tags != undefined) {
		var vtags='';
		for(var t=0;t<tags.length;t++) {
			vtags+='<span class="vtag" id="tag'+t+'">'+tags[t]+'</span> ';
		}
		this.controller.get("venueTags").innerHTML=vtags;
		for(var t=0;t<tags.length;t++) {
		 	Mojo.Event.listen(this.controller.get("tag"+t),Mojo.Event.tap, this.tagTapped.bind(th));
		}

	}else{
		this.controller.get("snapTags").hide();
	}
	

	
	
	//links
	if(venuelinks != undefined) {
		var vlinks='';
		for(var l=0;l<venuelinks.length;l++) {
			if(venuelinks[l].type=="yelp") { //only handling yelp links
				vlinks+='<a style="margin-left: 4px;" href="'+venuelinks[l].url+'"><img src="images/yelp.png" width="42" border="0"/></a>';
			}
		}
		this.controller.get("yelpbutton").innerHTML=vlinks;
	}
	
	
	this.controller.get("venueScrim").hide();
	this.controller.get("venueSpinner").mojo.stop();
	this.controller.get("venueSpinner").hide();
	
	
	
	//attach events to any new user links
	var userlinks=zBar.getElementsByClassName(".userLink",this.controller.get("main-venuedetail"));
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo);
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}
		Mojo.Event.listen(this.controller.get("mayorAvatar"),Mojo.Event.tap,this.showUserInfo.bind(this));


	//attach events to any new save tip links
	var savetips=zBar.getElementsByClassName(".tipsave",this.controller.get("snapTips"));
	for(var e=0;e<savetips.length;e++) {
		var eid=savetips[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.tipTapped.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

	var donetips=zBar.getElementsByClassName(".tipdone",this.controller.get("snapTips"));
	for(var e=0;e<donetips.length;e++) {
		var eid=donetips[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.tipTapped.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

}



VenuedetailAssistant.prototype.getVenueInfoFailed = function(response) {
	Mojo.Log.error("############error! "+response.status);
	Mojo.Log.error("############error! "+response.responseText);
	Mojo.Controller.getAppController().showBanner("Error getting the venue's info", {source: 'notification'});
}
var checkinDialog;


VenuedetailAssistant.prototype.promptCheckin = function(event) {
/*	this.controller.get("overlay-title").innerHTML="Check-in";
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("docheckin-fields").show();
	this.controller.get("results-meta-list").hide();
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	window.setTimeout('this.controller.get("shout").mojo.focus();',300);*/
	
	this.controller.stageController.pushScene({name: "checkin", transition: Mojo.Transition.zoomFade},this.venue);

}

VenuedetailAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
	if (_globals.auth) {
		sf=(sf==0)? 1: 0;
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
	} else {
	}
}
VenuedetailAssistant.prototype.markClosed = function() {
	if (_globals.auth) {
		var url = 'http://api.foursquare.com/v1/venue/flagclosed.json';
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

VenuedetailAssistant.prototype.showBanks = function(event) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.start();
	this.controller.get("overlaySpinner").show();
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("overlay-title").innerHTML="Banks & ATMs";

	var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22financial:banks%22}}],%22radius%22:%221km%22,%22limit%22:20}';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.banksSuccess.bind(this),
			onFailure: this.banksFailed.bind(this)
	});
}

VenuedetailAssistant.prototype.banksSuccess = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("overlay-title").innerHTML="Banks & ATMs";

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	var entities=j.entity;
	if(entities.length>0) {
		var banks=[];
		for(var e=0;e<entities.length;e++) {
			var thisbank={};
			thisbank.address=entities[e].viewlisting.address[0];
			thisbank.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisbank.distance=dist;
			thisbank.unit=unit;
			banks.push(thisbank);
		}
		this.resultsModel.items=banks;
		this.controller.modelChanged(this.resultsModel);
		this.controller.get("results-meta-list").show();
	}else{
		this.controller.get("results-meta-list").hide();
		this.controller.get("overlay-content").innerHTML='There are no nearby banks or ATMs.';
	}
	
}
VenuedetailAssistant.prototype.banksFailed = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("results-meta-list").hide();
	this.controller.get("overlay-content").innerHTML='Error loading nearby banks and ATMs.';
	this.controller.get("overlay-title").innerHTML="Banks & ATMs";

}

VenuedetailAssistant.prototype.showParking = function(event) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.start();
	this.controller.get("overlaySpinner").show();
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("overlay-title").innerHTML="Parking";

	var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&pretty=1&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22tourist-center:parking%22}}],%22radius%22:%221km%22,%22limit%22:20}';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.parkingSuccess.bind(this),
			onFailure: this.parkingFailed.bind(this)
	});
}

VenuedetailAssistant.prototype.parkingSuccess = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("overlay-title").innerHTML="Parking";

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	var entities=j.entity;
	if(entities.length>0) {
		var parking=[];
		for(var e=0;e<entities.length;e++) {
			var thisparking={};
			thisparking.address=entities[e].viewlisting.address[0];
			thisparking.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisparking.distance=dist;
			thisparking.unit=unit;
			banks.push(thisbank);
		}
		this.resultsModel.items=parking;
		this.controller.modelChanged(this.resultsModel);
		this.controller.get("results-meta-list").show();
	}else{
		this.controller.get("results-meta-list").hide();
		this.controller.get("overlay-content").innerHTML='There are no nearby <br/>parking lots.';
	}
	
}
VenuedetailAssistant.prototype.parkingFailed = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("results-meta-list").hide();
	this.controller.get("overlay-content").innerHTML='Error loading nearby parking.';
	this.controller.get("overlay-title").innerHTML="Parking";
}


VenuedetailAssistant.prototype.showFlickr = function(event) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.start();
	this.controller.get("overlaySpinner").show();
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("results-meta-list").hide();

	var url='http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&machine_tags=foursquare:venue="'+this.venue.id+'"&nojsoncallback=1&format=json';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.flickrSuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
	});
}

VenuedetailAssistant.prototype.flickrFailed = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("overlay-content").innerHTML='No Flickr images found for this venue.';
	this.controller.get("overlay-title").innerHTML="Photos "+this.flickrUpload;
	Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));
}

VenuedetailAssistant.prototype.flickrSuccess = function(response) {
	var j=eval("("+response.responseText+")");
	this.controller.get("overlay-title").innerHTML='Photos '+this.flickrUpload;

	if(j.photos!=undefined && j.photos.photo.length!=0) {
		this.controller.get("meta-overlay").show();

		var html=this.controller.get("overlay-content");
		this.controller.get("overlaySpinner").mojo.stop();
		this.controller.get("overlaySpinner").hide();
		html.update(html.innerHTML+"Flickr<br/>");
		for(var i=0;i<j.photos.photo.length;i++) {
			var id=j.photos.photo[i].id;
			var secret=j.photos.photo[i].secret;
			var server=j.photos.photo[i].server;
			var farm=j.photos.photo[i].farm;
			var userid=j.photos.photo[i].owner;
			var url='http://farm'+farm+'.static.flickr.com/'+server+'/'+id+'_'+secret+'_t.jpg';
			var link='http://www.flickr.com/photos/'+userid+'/'+id;

			html.update(html.innerHTML+'<img src="'+url+'" id="flickr'+i+'" class="flickr-pic" width="80" link="'+link+'"/> ');
		}

		for(var i=0;i<j.photos.photo.length;i++) {
			Mojo.Event.listen(this.controller.get("flickr"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
		}
		html.show();

		this.flickrNearby();
		Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));

	}else{
		this.flickrNearby();
		Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));
	}

}

VenuedetailAssistant.prototype.flickrNearby = function() {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.start();
	this.controller.get("overlaySpinner").show();

	var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&lat='+this.vgeolat+'&lon='+this.vgeolong+'&radius=5&radius_units=km&nojsoncallback=1&format=json';
	var requester = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.flickrNearbySuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
	});
}

VenuedetailAssistant.prototype.flickrNearbySuccess = function(response) {
	var j=eval("("+response.responseText+")");

	if(j.photos!=undefined && j.photos.photo.length>0) {
		if(j.photos.total=="0"){this.flickrFailed(response);}
		this.controller.get("overlaySpinner").mojo.stop();
		this.controller.get("overlaySpinner").hide();

		var html=this.controller.get("overlay-content");
		html.update(html.innerHTML+"<br/>Flickr (Nearby)<br/>");
		for(var i=0;i<j.photos.photo.length;i++) {
			var id=j.photos.photo[i].id;
			var secret=j.photos.photo[i].secret;
			var server=j.photos.photo[i].server;
			var farm=j.photos.photo[i].farm;
			var userid=j.photos.photo[i].owner;
			var url='http://farm'+farm+'.static.flickr.com/'+server+'/'+id+'_'+secret+'_t.jpg';
			var link='http://www.flickr.com/photos/'+userid+'/'+id;

			html.update(html.innerHTML+'<img src="'+url+'" id="flickrnearby'+i+'" class="flickr-pic" width="80" link="'+link+'"/> ');
		}

		for(var i=0;i<j.photos.photo.length;i++) {
			Mojo.Event.listen(this.controller.get("flickrnearby"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
		}
		html.show();
		this.tweetPhoto();
	}else{
		this.flickrFailed(response);
	}
}

VenuedetailAssistant.prototype.tweetPhoto = function() {
	this.controller.get("meta-overlay").show();

	var url = 'http://tweetphotoapi.com/api/tpapi.svc/json/photos/byvenue?vid='+this.venue.id;
	var requester = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.tweetPhotoSuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
	});

}


VenuedetailAssistant.prototype.tweetPhotoSuccess = function(r) {
	var j=r.responseJSON;
	if(j) {
		if(j.Count!=undefined && j.Count!=0) {
			var pics=j.List;
			if(pics){
				var html=this.controller.get("overlay-content");
				html.update(html.innerHTML+"<br/>TweetPhoto<br/>");
				for(var p=0;p<pics.length;p++){
					var tn=pics[p].ThumbnailUrl;
					var url=pics[p].DetailsUrl;
					html.update(html.innerHTML+'<img src="'+tn+'" id="tweetphoto'+p+'" class="flickr-pic" width="80" link="'+url+'"/> ');
				}
			
				for(var p=0;p<pics.length;p++){
					Mojo.Event.listen(this.controller.get("tweetphoto"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
				}
			}
			html.show();
			
		}
	}
	
	this.pikchur();
}


VenuedetailAssistant.prototype.pikchur = function() {
	this.controller.get("meta-overlay").show();

	var url = 'http://api.pikchur.com/geosocial/venue/json';
	var requester = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			parameters: {venue_id: this.venue.id, api_key: "QTG1n51CVNEJNDkkiMQIXQ", service:"foursquare"},
			onSuccess: this.pikchurSuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
	});
}


VenuedetailAssistant.prototype.pikchurSuccess = function(r) {
	var j=eval("(" + r.responseText + ")");
	if(j) {
			var pics=j.feed;
		
			var html=this.controller.get("overlay-content");
			html.update(html.innerHTML+"<br/>Pikchur<br/>");
			for(var p=0;p<pics.length;p++){
				
				var img_base="http://img.pikchur.com/"; //http://img.pikchur.com/pic_lYd_t.jpg
				var typ=pics[p].media.type;
				var tn=img_base + typ + "_" + pics[p].media.short_code + "_t.jpg";
				
				var url="http://pk.gd/"+pics[p].media.short_code;
				html.update(html.innerHTML+'<img src="'+tn+'" id="pikchur'+p+'" class="flickr-pic" width="80" link="'+url+'"/> ');
			}
			
			for(var p=0;p<pics.length;p++){
				Mojo.Event.listen(this.controller.get("pikchur"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
			}
			html.show();
			
	}
	
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

VenuedetailAssistant.prototype.checkInSuccess = function(response) {
	var json=response.responseJSON;
	this.controller.get("docheckin-fields").hide();
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("meta-overlay").hide();
	
	this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);

}

VenuedetailAssistant.prototype.checkInFailed = function(response) {
	Mojo.Log.error('Check In Failed: ' + repsonse.responseText);
	Mojo.Controller.getAppController().showBanner("Error checking in!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markClosedSuccess = function(response) {
	Mojo.Controller.getAppController().showBanner("Venue has been marked closed!", {source: 'notification'});
}
VenuedetailAssistant.prototype.markClosedFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error marking venue as closed!", {source: 'notification'});
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
VenuedetailAssistant.prototype.handleProposeEdit=function(event) {
	var thisauth=auth;
	this.controller.stageController.pushScene({name: "add-venue", transition: Mojo.Transition.crossFade},thisauth,true,this.venue);
}

VenuedetailAssistant.prototype.showUserInfo = function(event) {
	var thisauth=auth;
	var uid=event.target.readAttribute("data");
	var uname=event.target.readAttribute("user");
	

	/*this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.start();
	this.controller.get("overlaySpinner").show();
	this.controller.get("overlay-content").innerHTML="";
	this.controller.get("overlay-title").innerHTML=uname;

	var url='http://api.foursquare.com/v1/user.json';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
	   		requestHeaders: {Authorization:_globals.auth}, 
	   		parameters: {uid: uid,badges: '1', mayor: '1'},
			onSuccess: this.userSuccess.bind(this),
			onFailure: this.userFailed.bind(this)
	});*/
	
	this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,uid,this,true);


}
VenuedetailAssistant.prototype.userSuccess = function(response) {
	this.controller.get("meta-overlay").show();
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();

	var j=response.responseJSON;
	//user info
	var pic='<img src="'+j.user.photo+'" width="75" height="75" class="friend-avatar blocky" />';
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	var tw=(j.user.twitter != undefined)? '<span class="linefix"><img src="images/bird-light.png" width="16" height="16" /> <a class="vtag" href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a></span><br/>': "";
	var fb=(j.user.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a class="vtag" href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a></span><br/>': "";
	var ph=(j.user.phone != undefined)? '<span class="linefix"><img src="images/phone-light.png" width="16" height="16" /> <a class="vtag" href="tel://'+j.user.phone+'">'+j.user.phone+'</a></span><br/>': "";
	var em=(j.user.email != undefined)? '<span class="linefix"><img src="images/mail-light.png" width="16" height="16" /> <a class="vtag" href="mailto:'+j.user.email+'">Send E-mail</a></span><br/>': "";
	this.controller.get("overlay-content").innerHTML='';
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		this.controller.get("overlay-content").innerHTML +='<div class="small-text italic">'+ s + v + '</div>';
	}

	
	
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if(this.uid != j.user.id) { //only show friending options if it's not yourself
	var friendstatus=(j.user.friendstatus != undefined)? j.user.friendstatus: "";

	switch (friendstatus) {
		case "friend":
			var fs="You're friends!"
			break;
		case "pendingthem":
			var fs='<img src="images/pending.png" width="108" height="42" data="'+j.user.id+'" id="pendingfriend" alt="Pending" />';
			break;
		case "pendingyou":
			var fs='<img src="images/approve.png" width="108" height="42" data="'+j.user.id+'" id="approvefriend" alt="Approve" /> <img src="images/deny.png" width="108" height="42" id="denyfriend" data="'+j.user.id+'" alt="Deny" />';		
			break;
		default:
			var fs='<img src="images/addfriend.png" width="108" height="42" data="'+j.user.id+'" id="addfriend" alt="Add Friend" />';					
			break;
	}
	}else{
		var fs="";
	}	
	
	fs='<span id="friend_button">'+fs+'</span>';
	
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		var checkin = s + v;
	}
	var html=pic+'<div class="uinfo">'+em+ph+tw+fb+'</div>';
	html+='<div class="breaker">'+fs+'</div>';
	this.controller.get("overlay-content").innerHTML+=html;


	//handling loading mayorship and badge info
	if(j.user.badges != null) {
		var o='';
		o += '<table border=0 cellspacing=0 cellpadding=2 width="95%">';
		o += '<tr><td></td><td></td><td></td></tr>';
		var id=0
		for(var m=0;m<j.user.badges.length;m++) {
			id++;
			
			if(id==1) {
				o += '<tr>';
			}
			o += '<td align="center" width="33%" class="medium-text"><img src="'+j.user.badges[m].icon+'" width="48" height="48"/><br/>'+j.user.badges[m].name+'</td>';
			if(id==3) {
				o += '</tr>';
				id=0;
			}
		}
		html=o+"</table>";
	}else{
		html='<div class="small-text">'+j.user.firstname+' doesn\'t have any badges yet.</div>';
	}

	this.controller.get("overlay-content").innerHTML+='<br/><b>Badges</b><br/>'+html;





	if(j.user.mayor != null && j.user.mayor != undefined) {
		var s=(j.user.mayor.length==1)? "":"s";
		var mayor_title=j.user.mayor.length+" Mayorship"+s;

		var mayorships="";
		for (var m=0;m<j.user.mayor.length;m++) {
			mayorships+=j.user.mayor[m].name+'<br/>';
		}
		html='<b>'+mayor_title+'</b><br/><div class="small-text">'+mayorships+'</div>';
	}else{
		html='<b>'+mayor_title+'</b><br/><div class="small-text">'+j.user.firstname+' isn\'t the mayor of anything yet.</div>';
	}

	this.controller.get("overlay-content").innerHTML+="<br/>"+html;
	if(friendstatus=="pendingyou") {
		Mojo.Event.listen(this.controller.get("approvefriend"),Mojo.Event.tap,this.approveFriend.bind(this));
		Mojo.Event.listen(this.controller.get("denyfriend"),Mojo.Event.tap,this.denyFriend.bind(this));
	}
	if(friendstatus=="") {
		Mojo.Log.error("added event to add friend "+this.controller.get("addfriend").readAttribute("data"));
		Mojo.Event.listen(this.controller.get("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}
	
}
VenuedetailAssistant.prototype.userFailed = function(event) {
}
VenuedetailAssistant.prototype.activate = function(event) {
	
}

VenuedetailAssistant.prototype.approveFriend = function(event) {

	var url = 'http://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		this.controller.get("friend_button").innerHTML='You\'re Friends!';
	}else{
		Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.approveFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error approving friend request", {source: 'notification'});
}

VenuedetailAssistant.prototype.denyFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/deny.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth},
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.denySuccess.bind(this),
	   onFailure: this.denyFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.denySuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request denied!", {source: 'notification'});
		this.controller.get("friend_button").innerHTML='<img src="images/addfriend.png" width="100" height="35" id="addfriend" data="'+event.target.getAttribute("data")+'" alt="Add Friend" />';
		Mojo.Event.listen(this.controller.get("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.denyFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
}

VenuedetailAssistant.prototype.addFriend = function(event) {
	var url = 'http://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, 
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.addSuccess.bind(this),
	   onFailure: this.addFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.addSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request sent!", {source: 'notification'});
		this.controller.get("friend_button").innerHTML='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
	}else{
		Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.addFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error sending friend request", {source: 'notification'});
}


VenuedetailAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
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
            }
        }else if(event.type===Mojo.Event.back && this.fromuserinfo!=true && this.fromMap!=true) {
			event.preventDefault();
	        var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
        }else if(event.type===Mojo.Event.back && this.fromMap==true) {
			event.preventDefault();
	        var thisauth=_globals.auth;
			this.controller.stageController.popScene();
	    }

}

VenuedetailAssistant.prototype.tagTapped = function(event) {
	var q=event.target.innerHTML;
	//this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},_globals.auth,_globals.userData,this.username,this.password,this.uid,true,q);
	
}

VenuedetailAssistant.prototype.tipTapped = function(event) {
	
    switch(event.target.hasClassName("tipsave")) {
                           		case true:
                           			this.markTip(event.target.readAttribute("data"),"todo");
                           			break;
                           		case false:
                           			this.markTip(event.target.readAttribute("data"),"done");
                           			break;
    }



}
VenuedetailAssistant.prototype.markTip = function(tip,how){
		var url = 'http://api.foursquare.com/v1/tip/mark'+how+'.json';
		var request = new Ajax.Request(url, {
		   method: 'post',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth}, 
		   parameters: {tid: tip},
		   onSuccess: this.markTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });
}
VenuedetailAssistant.prototype.markTipSuccess = function(response){
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Tip was marked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.markTipFailed = function(response){
		Mojo.Log.error(response.responseText);
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
}


VenuedetailAssistant.prototype.handleDividerTap = function(event) {
	switch(event.target.id) {
		case "mayorArrow":
		case "mayorLine":
			Mojo.Log.error("mayor divider");
			if(this.controller.get("mayorArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("mayorArrow").removeClassName("palm-arrow-closed");
				this.controller.get("mayorArrow").addClassName("palm-arrow-expanded");
				this.controller.get("mayorDrawer").mojo.setOpenState(true);
			}else{
				this.controller.get("mayorArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("mayorArrow").addClassName("palm-arrow-closed");
				this.controller.get("mayorDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "tipsArrow":
		case "tipsLine":
			if(this.controller.get("tipsArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("tipsArrow").removeClassName("palm-arrow-closed");
				this.controller.get("tipsArrow").addClassName("palm-arrow-expanded");
				this.controller.get("venueTipsContainer").mojo.setOpenState(true);
			}else{
				this.controller.get("tipsArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("tipsArrow").addClassName("palm-arrow-closed");
				this.controller.get("venueTipsContainer").mojo.setOpenState(false);
			
			}
			break;
		case "specialsArrow":
		case "specialsLine":
			if(this.controller.get("specialsArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("specialsArrow").removeClassName("palm-arrow-closed");
				this.controller.get("specialsArrow").addClassName("palm-arrow-expanded");
				this.controller.get("venueSpecialsContainer").mojo.setOpenState(true);
			}else{
				this.controller.get("specialsArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("specialsArrow").addClassName("palm-arrow-closed");
				this.controller.get("venueSpecialsContainer").mojo.setOpenState(false);
			
			}
			break;
		case "tagsArrow":
		case "tagsLine":
			if(this.controller.get("tagsArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("tagsArrow").removeClassName("palm-arrow-closed");
				this.controller.get("tagsArrow").addClassName("palm-arrow-expanded");
				this.controller.get("tagsDrawer").mojo.setOpenState(true);
			}else{
				this.controller.get("tagsArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("tagsArrow").addClassName("palm-arrow-closed");
				this.controller.get("tagsDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "infoArrow":
		case "infoLine":
			if(this.controller.get("infoArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("infoArrow").removeClassName("palm-arrow-closed");
				this.controller.get("infoArrow").addClassName("palm-arrow-expanded");
				this.controller.get("venueInfoContainer").mojo.setOpenState(true);
			}else{
				this.controller.get("infoArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("infoArrow").addClassName("palm-arrow-closed");
				this.controller.get("venueInfoContainer").mojo.setOpenState(false);
			
			}
			break;
		case "mapArrow":
		case "mapLine":
			if(this.controller.get("mapArrow").hasClassName("palm-arrow-closed")) {
				this.controller.get("mapArrow").removeClassName("palm-arrow-closed");
				this.controller.get("mapArrow").addClassName("palm-arrow-expanded");
				this.controller.get("mapDrawer").mojo.setOpenState(true);
			}else{
				this.controller.get("mapArrow").removeClassName("palm-arrow-expanded");
				this.controller.get("mapArrow").addClassName("palm-arrow-closed");
				this.controller.get("mapDrawer").mojo.setOpenState(false);
			
			}
			break;
	}
}


VenuedetailAssistant.prototype.deactivate = function(event) {
}

VenuedetailAssistant.prototype.cleanup = function(event) {
	  // zBar.render(zBar.oldBar,"venues");
}

VenuedetailAssistant.prototype.okTapped = function() {
		//before doing the actual shout, see if we have a photo. if so, handle that
		if(this.hasPhoto){
			Mojo.Controller.getAppController().showBanner("Uploading photo...", {source: 'notification'});
			switch(this.phModel.value){
				case "flickr":
					var ptitle=this.tipModel.value;
					var pdesc=this.tipModel.value;
					var ptags="foursquare:venue="+this.venue.id+", "+this.venue.name;
					var format="xml";
					var nojsoncallback="1";
					var api_key=_globals.flickr_key;
					var auth_token=_globals.flickr_token;
					var presig=_globals.flickr_secret+"api_key"+api_key+"auth_token"+auth_token+"description"+pdesc+"format"+format+"nojsoncallback"+nojsoncallback+"tags"+ptags+"title"+ptitle;
					var api_sig=hex_md5(presig);
	
					var params={
						"title":ptitle,
						"description":pdesc,
						"tags":ptags
					};
	
					var params=[];
					params.push({"key":"api_key","data":api_key,"contentType":"text/plain"});
					params.push({"key":"auth_token","data":auth_token,"contentType":"text/plain"});
					params.push({"key":"api_sig","data":api_sig,"contentType":"text/plain"});
					params.push({"key":"description","data":pdesc,"contentType":"text/plain"});
					params.push({"key":"format","data":format,"contentType":"text/plain"});
					params.push({"key":"nojsoncallback","data":nojsoncallback,"contentType":"text/plain"});
					params.push({"key":"tags","data":ptags,"contentType":"text/plain"});
					params.push({"key":"title","data":ptitle,"contentType":"text/plain"});
	
	

				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
			            method: 'upload',
			            parameters: {
            			    'url': "http://api.flickr.com/services/upload/",
			                'fileLabel': 'photo',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
			            onSuccess: function (resp){
						 	//gonna old school parse the xml since it's in plain etxt and not an object...
						 	var xml=resp.responseString;
						 	if(xml) {
							 	if(xml.indexOf('stat="ok"')>-1) {
							 		var ps=xml.indexOf("<photoid>")+9;
							 		var pe=xml.indexOf("</photoid>");
							 		var len=pe-ps;
							 		var photoid=parseInt(xml.substring(ps,pe));
							 		var epid=this.base58_encode(photoid);
						 			var extra="http://flic.kr/p/"+epid;
						 			
									this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+extra,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);
						 		}
						 	}
						 	
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(resp));
					 	}.bind(this)
			        });
	 
					break;
				case "pikchur":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];
					var params=[];
					params.push({"key":"api_key","data":"QTG1n51CVNEJNDkkiMQIXQ","contentType":"text/plain"});
					params.push({"key":"encodedAuth","data":eauth,"contentType":"text/plain"});
					params.push({"key":"message","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"geolat","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"geolon","data":_globals.long,"contentType":"text/plain"});
					params.push({"key":"venue_id","data":this.venue.id,"contentType":"text/plain"});
					params.push({"key":"service","data":"foursquare","contentType":"text/plain"});
					params.push({"key":"source","data":"Njk1","contentType":"text/plain"});
				
				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://api.pikchur.com/geosocial/upload/json",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	var r=resp.responseString;
						 	if(r != undefined) {
								Mojo.Log.error("r="+r);
						 		var json=eval("("+r+")");
						 		var url=json.post.url;
								this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);
								//this.checkInSuccess(r);
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
				case "tweetphoto":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"78c45db0-e4eb-467c-9215-695072bcf85a","contentType":"text/plain"});
					params.push({"key":"tpservice","data":"Foursquare","contentType":"text/plain"});
					params.push({"key":"message","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"latitude","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"longitude","data":_globals.long,"contentType":"text/plain"});
					params.push({"key":"vid","data":this.venue.id,"contentType":"text/plain"});
					params.push({"key":"response_format","data":"JSON","contentType":"text/plain"});
					params.push({"key":"username","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});

				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://tweetphotoapi.com/api/upload.aspx",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
						 	var r=resp.responseString;
						 	if(r != undefined && r != "") {
						 		var json=eval("("+r+")");
						 		var url=json.MediaUrl;
						 		Mojo.Log.error("longurl="+url);
						 		//shorten with is.gd
						 		var url = 'http://is.gd/api.php?longurl='+url;
								var request = new Ajax.Request(url, {
								   method: 'get',
								   evalJSON: 'false',
								   onSuccess: function(r){
								   		var url=r.responseText;
								   		Mojo.Log.error("url="+url);
								   		this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);

								   }.bind(this),
								   onFailure: function (e){
	  									Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 				}.bind(this)
								 });


						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
				case "fspic":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"q9hpcah58aaqtd7pp40orr21rga1wi","contentType":"text/plain"});
					params.push({"key":"shout_text","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"phone_or_email","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});
					params.push({"key":"vid","data":this.venue.id,"contentType":"text/plain"});

				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://fspic.com/api/uploadPhoto",
			                'fileLabel': 'photo',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	var xml=resp.responseString;
						 	if(xml) {
							 	if(xml.indexOf('status="ok"')>-1) {
							 		var ps=xml.indexOf("<url>")+5;
							 		var pe=xml.indexOf("</url>");
							 		var len=pe-ps;
							 		var url=xml.substring(ps,pe);
						 			
									this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);
						 		}
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
			}
		}else{
			this.checkIn(this.venue.id,this.venue.name,this.tipModel.value,this.sfmodel.value,this.twmodel.value,this.fbmodel.value);
		}	
}

VenuedetailAssistant.prototype.cancelTapped = function() {

}


VenuedetailAssistant.prototype.setupCheckin = function() {

  this.controller.setupWidget("okButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Check-in",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('okButton'), Mojo.Event.tap, this.okTapped.bindAsEventListener(this));

  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	var pings=(credentials.ping=="on")? '1': '0';
	var stt=(credentials.savetotwitter==true)? '1': '0';
	var stf=(credentials.savetofacebook==true || credentials.savetofacebook=='true')? '1': '0';
  
  
    this.controller.setupWidget("chkShowFriends",
         this.sfattributes = {
             trueValue: '1',
             trueLabel: 'Yes',
             falseValue: '0',
             falseLabel: 'No'
         },
         this.sfmodel = {
             value: pings,
             disabled: false
         });
    this.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             trueLabel: 'On',
             falseLabel: 'Off',
             falseValue: '0' 
         },
         this.twmodel = {
             value: stt,
             disabled: false
         });
    this.controller.setupWidget("chkFacebook",
         this.fbattributes = {
             trueValue: '1',
             trueLabel: 'On',
             falseLabel: 'Off',
             falseValue: '0' 
         },
         this.fbmodel = {
             value: stf,
             disabled: false
         });
  
	this.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true,focusMode:Mojo.Widget.focusSelectMode}, this.tipModel = {value:'', disabled:false});
	
	Mojo.Event.listen(this.controller.get('attach'), Mojo.Event.tap, this.attachImage.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImage.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('attach'), "mousedown", function(){this.controller.get("attachicon").addClassName("pressed");}.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('attach'), "mouseup", function(){this.controller.get("attachicon").removeClassName("pressed");}.bindAsEventListener(this));

  		this.lhc=new Mojo.Model.Cookie("photohost");
		var lh=this.lhc.get();
		_globals.lasthost=(lh)? lh.photohost: "pikchur";
  
      this.controller.setupWidget("photohostList",
        this.phAttributes = {
            choices: [
                {label: "Flickr", value: "flickr"},
                {label: "TweetPhoto", value: "tweetphoto"},
                {label: "Pikchur", value: "pikchur"},
                {label: "FSPic", value: "fspic"}

            ]},
        this.phModel = {
            value: _globals.lasthost,
            disabled: false
        }
    ); 
	  Mojo.Event.listen(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohost);
  this.controller.get("photohostList").hide();

}



VenuedetailAssistant.prototype.base58_encode = function(num) {
	if(typeof num!=='number') {
		num=parseInt(num);
	}
	
	var encoded='';
	var alphabet='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	var div=num;
	var mod;
	while(num>=58){
		div=num/58;
		mod=num-(58*Math.floor(div));
		encoded=''+alphabet.substr(mod,1)+encoded;
		num=Math.floor(div);
	}
	
	return(div)?''+alphabet.substr(div,1)+encoded:encoded;
}

VenuedetailAssistant.prototype.escape_and_sign= function(params, post) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
	params.api_key = _globals.flickr_key;
	var sig = [];
	var esc_params = {api_key: '', api_sig: ''};
	for (var p in params) {
		if ('object' === typeof params[p]) {
			esc_params[p] = params[p];
		} else {
			sig.push(p);
			esc_params[p] = this.escape_utf8('' + params[p], !post).replace(/(^\s+|\s+$)/g, '');
		}
	}
	sig.sort();
	var calc = [];
	var ii = sig.length;
	for (var i = 0; i < ii; ++i) {
		calc.push(sig[i] + (post ? esc_params[sig[i]] : this.escape_utf8('' +params[sig[i]], false)));
    }
 
    var clear = _globals.flickr_secret + calc.join('');
    esc_params.api_sig = hex_md5(clear);
	return esc_params;
}

VenuedetailAssistant.prototype.escape_utf8= function(data, url) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
        if (null === url) {
            url = false;
        }
        if ('' === data || null === data || undefined === data) {
            return '';
        }
            
        var chars = '0123456789abcdef';
        data = data.toString();
        var buffer = [];
        var ii = data.length;
        for (var i = 0; i < ii; ++i) {
            var c = data.charCodeAt(i);
            var bs = [];
            if (c > 0x10000) {
                bs[0] = 0xf0 | ((c & 0x1c0000) >>> 18);
                bs[1] = 0x80 | ((c & 0x3f000) >>> 12);
                bs[2] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[3] = 0x80 | (c & 0x3f);
            } else if (c > 0x800) {
                bs[0] = 0xe0 | ((c & 0xf000) >>> 12);
                bs[1] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[2] = 0x80 | (c & 0x3f);
            } else if (c > 0x80) {
                bs[0] = 0xc0 | ((c & 0x7c0) >>> 6);
                bs[1] = 0x80 | (c & 0x3f);
            } else {
                bs[0] = c;
            }
            var j = 0, jj = bs.length;
            if (1 < jj) {
                if (url) {
                    for (j = 0; j < jj; ++j) {
                        var b = bs[j];
                        buffer.push('%' + chars.charAt((b & 0xf0) >>> 4) +
                            chars.charAt(b & 0x0f));
                    }
                } else {
                    for (j = 0; j < jj; ++j) {
                        buffer.push(String.fromCharCode(bs[j]));
                    }
                }
            } else {
                if (url) {
                    buffer.push(encodeURIComponent(String.fromCharCode(bs[0])));
                } else {
                    buffer.push(String.fromCharCode(bs[0]));
                }
            }
        }
        return buffer.join('');
}

VenuedetailAssistant.prototype.attachImage = function(event) {
	Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
		this.fileName=fn.fullPath;
		this.hasPhoto=true;
		this.controller.get("img").src=this.fileName;
		this.controller.get("img-preview").show();
		this.controller.get("photohostList").show();
		this.controller.get("listborder").show();
	}.bind(this)},this.controller.stageController);
}

VenuedetailAssistant.prototype.removeImage = function(event) {
	this.controller.get("img").src="";
	this.hasPhoto=false;
	this.fileName="";
	this.controller.get("img-preview").hide();
	this.controller.get("shout").mojo.focus();
	this.controller.get("photohostList").hide();
	this.controller.get("listborder").hide();

}


VenuedetailAssistant.prototype.handlePhotohost = function(event) {
		var ph=this.phModel.value;
		this.cookieData=new Mojo.Model.Cookie("photohost");
		this.cookieData.put(
			{"photohost":ph}
		)
		_globals.lasthost=ph;

}


