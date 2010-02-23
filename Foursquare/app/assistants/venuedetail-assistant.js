function VenuedetailAssistant(venue,u,p,i,fui,ps) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.venue=venue;
	   this.username=_globals.username;
	   this.password=_globals.password;
	   this.uid=_globals.uid;
	   this.fromuserinfo=fui;
	   this.vgeolat=this.venue.geolat;
	   this.vgeolong=this.venue.geolong;
	   this.prevScene=ps;
}

VenuedetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	$("snapMayor").hide();
	//$("snapTips").hide(); //keep it visible -- that way the Add Tip button can be there
	$("checkinVenueName").innerHTML=this.venue.name;
	$("checkinVenueAddress").innerHTML=this.venue.address;
	if (this.venue.crossstreet) {
	 $("checkinVenueAddress").innerHTML += "<br/>("+this.venue.crossstreet+")";
	}
	var query=encodeURIComponent(this.venue.address+' '+this.venue.city+', '+this.venue.state);
	$("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+this.venue.geolat+","+this.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA"
	
	
	
	zBar.render("venue","");
	
	
	
	
	
	this.getVenueInfo();
	
			/* setup widgets here */
	    this.controller.setupWidget("detailScroller",
         this.scrollAttributes = {
             mode: 'vertical-snap'
         },
         this.scrollModel = {
            /* snapElements: {'y': [$("snapMap"),$("snapMayor"),$("snapTips"),$("snapTags"),$("snapInfo")]}*/
         });
	    this.controller.setupWidget("overlayScroller",
         this.scroll2Attributes = {
             mode: 'vertical-snap'
         },
         this.scroll2Model = {
            /* snapElements: {'y': [$("snapMap"),$("snapMayor"),$("snapTips"),$("snapTags"),$("snapInfo")]}*/
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
             open: false
         });

	this.controller.setupWidget("tagsDrawer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: false
         });
	this.controller.setupWidget("venueInfoContainer",
         this.attributes = {
             modelProperty: 'open',
             unstyled: true
         },
         this.model = {
             open: false
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
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('results-meta-list', 
					      {itemTemplate:'listtemplates/venueItems'},
					      this.resultsModel);

	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen($("docheckin"),Mojo.Event.tap,this.promptCheckin.bind(this));
	
	/*var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
	}*/
	
	Mojo.Event.listen($("buttonAddTip"),Mojo.Event.tap, this.handleAddTip.bind(this));
	Mojo.Event.listen($("buttonAddTodo"),Mojo.Event.tap, this.handleAddTodo.bind(this));
	Mojo.Event.listen($("buttonMarkClosed"),Mojo.Event.tap, this.handleMarkClosed.bind(this));
	Mojo.Event.listen($("buttonProposeEdit"),Mojo.Event.tap, this.handleProposeEdit.bind(this));
    /*this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'blue-command-nope'
        },*/
        /*this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Nothing"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing"
            }]
    }*//*_globals.cmmodel);*/

	Mojo.Event.listen($("mayorDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("tipsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("specialsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("tagsDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("infoDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("mapDivider"),Mojo.Event.tap, this.handleDividerTap.bind(this));
	Mojo.Event.listen($("flickr-button"),Mojo.Event.tap, this.showFlickr.bind(this));
	Mojo.Event.listen($("banks-button"),Mojo.Event.tap, this.showBanks.bind(this));
	Mojo.Event.listen($("parking-button"),Mojo.Event.tap, this.showParking.bind(this));
 	Mojo.Event.listen($("venueMap"),Mojo.Event.tap, this.showGoogleMaps.bind(this));
		Mojo.Event.listen($("overlay-closer"),Mojo.Event.tap, function(){$("meta-overlay").hide();}.bind(this));
		//Mojo.Event.listen($("venueMap"),Mojo.Event.tap, this.mapClicked.bind(this));


	//$("venueMap").setAttribute("data","maploc:("+this.venue.geolat+","+this.venue.geolong+")");
	$("meta-overlay").hide();
	$("results-meta-list").hide();
	
	
	this.flickrUpload='<span id="flickrUploader" class="vtip-black" style="white-space:nowrap;">Upload</span>';
}

var auth;

function make_base_auth(user, pass) {
  var tok = user + ':' + pass;
  var hash = Base64.encode(tok);
  //$('message').innerHTML += '<br/>'+ hash;
  return "Basic " + hash;
}

VenuedetailAssistant.prototype.showGoogleMaps = function() {
/*this.controller.serviceRequest('palm://com.palm.applicationManager', {
 	method: 'open',
 	parameters: {
 	id: 'com.palm.app.maps',
 	params: {
 		location: {lat: this.venue.geolat, lng: this.venue.geolong, acc: 1},
 		daddr: this.vgeolat+","+this.vgeolong
 		}
 	}
 });*/ 
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
	   requestHeaders: {Authorization:auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {vid:this.venue.id},
	   onSuccess: this.getVenueInfoSuccess.bind(this),
	   onFailure: this.getVenueInfoFailed.bind(this)
	 });
}
function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

VenuedetailAssistant.prototype.getVenueInfoSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	var th=this;
	Mojo.Log.error("this="+th.constructor.name);
	
	$("checkinVenueAddress").innerHTML=response.responseJSON.venue.address;
	
	
	if (response.responseJSON.venue.crossstreet) {
	 $("checkinVenueAddress").innerHTML += "<br/>("+response.responseJSON.venue.crossstreet+")";
	}
	if($("venueMap").src!="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA") {
		$("venueMap").src="http://maps.google.com/maps/api/staticmap?mobile=true&zoom=15&size=320x175&sensor=false&markers=color:blue|"+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+"&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxT50hbykH-f32yPesIURumAK58x-xSabNSSctTSap-7tI2Dm8GumOSqyA";
		//$("venueMap").setAttribute("data","maploc:("+response.responseJSON.venue.geolat+","+response.responseJSON.venue.geolong+")");
		this.venue.geolat=response.responseJSON.venue.geolat;
		this.venue.geolong=response.responseJSON.venue.geolong;
	}
	
	//mayorial stuff
	if(response.responseJSON.venue.stats.mayor != undefined) { //venue has a mayor
		$("snapMayor").show();
		var lname=(response.responseJSON.venue.stats.mayor.user.lastname != undefined)? response.responseJSON.venue.stats.mayor.user.lastname: '';

		$("mayorPic").src=response.responseJSON.venue.stats.mayor.user.photo;
		$("mayorPic").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		$("mayorPic").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		$("mayorPicBorder").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		$("mayorPicBorder").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
		
		$("mayorName").innerHTML=response.responseJSON.venue.stats.mayor.user.firstname+" "+lname;
		$("mayorName").setAttribute("data",response.responseJSON.venue.stats.mayor.user.id);
		$("mayorName").setAttribute("user",response.responseJSON.venue.stats.mayor.user.firstname+" "+lname);
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
		$("mayorInfo").innerHTML=mInfo;
		
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
			$('venueSpecials').innerHTML += '<div class="checkin-special"><div class="checkin-special-title" x-mojo-loc="">'+spt+'</div><div class="palm-list special-list"><div class="">'+special_msg+'<div class="checkin-venue">'+special_venue+'</div></div></div></div>';
		}
	}else{
		$("snapSpecials").hide();
	}

	
	//tips stuff
	if(response.responseJSON.venue.tips != undefined) {
		$("snapTips").show();
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

			tips+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink" user="'+username+'" data="'+uid+'"/> <span class="venueTipUser userLink" user="'+username+'" data="'+uid+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+tip+'</span><br class="breaker"/><div class="tip-buttons"><span class="vtip tipsave" id="tip-save-'+t+'" data="'+tipid+'">Save Tip</span> <span class="vtip-black tipdone" id="tip-done-'+t+'" data="'+tipid+'">I\'ve Done This</span></div></div>'+"\n";
		}
		$("venueTips").update(tips);
	}

	//who's here? stuff
	if(response.responseJSON.venue.checkins != undefined) {
		$("snapUsers").show();
		var users='';
		for (var t=0;t<response.responseJSON.venue.checkins.length;t++) {
			//<div class="palm-row single"><div class="checkin-score"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>
			var shout=(response.responseJSON.venue.checkins[t].shout != undefined)? response.responseJSON.venue.checkins[t].shout: "";
			var created=response.responseJSON.venue.checkins[t].created;
			var tlname=(response.responseJSON.venue.checkins[t].user.lastname != undefined)? response.responseJSON.venue.checkins[t].user.lastname : '';
			var username=response.responseJSON.venue.checkins[t].user.firstname+" "+tlname;
			var photo=response.responseJSON.venue.checkins[t].user.photo;
			var uid=response.responseJSON.venue.checkins[t].user.id;

			users+='<div class="palm-row single aTip"><img src="'+photo+'" id="tip-pic-'+uid+'-'+t+'" width="24" class="userLink"  user="'+username+'" data="'+uid+'"/>&nbsp; <span class="venueTipUser userLink" data="'+uid+'" user="'+username+'" id="tip-name-'+uid+'-'+t+'" >'+username+'</span><br/><span class="palm-info-text venueTip">'+shout+'</span></div>'+"\n";
		}
		$("venueUsers").update(users);
	}else{
		$("snapUsers").hide();
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
	$("venueInfo").innerHTML=vinfo;
	
	//tags
	if(tags != undefined) {
		var vtags='';
		for(var t=0;t<tags.length;t++) {
			vtags+='<span class="vtag" id="tag'+t+'">'+tags[t]+'</span> ';
		}
		$("venueTags").innerHTML=vtags;
		for(var t=0;t<tags.length;t++) {
		 	Mojo.Event.listen($("tag"+t),Mojo.Event.tap, this.tagTapped.bind(th));
		}

	}else{
		$("snapTags").hide();
	}
	

	
	
	//links
	if(venuelinks != undefined) {
		var vlinks='';
		for(var l=0;l<venuelinks.length;l++) {
			if(venuelinks[l].type=="yelp") { //only handling yelp links
				vlinks+='<a style="margin-left: 4px;" href="'+venuelinks[l].url+'"><img src="images/yelp.png" width="42" border="0"/></a>';
			}
		}
		$("yelpbutton").innerHTML=vlinks;
	}
	
	
	$("venueScrim").hide();
	$("venueSpinner").mojo.stop();
	$("venueSpinner").hide();
	
	
	
	//atatch events to any new user links
	var userlinks=$$(".userLink");
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.showUserInfo);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

	//atatch events to any new save tip links
	var savetips=$$(".tipsave");
	for(var e=0;e<savetips.length;e++) {
		var eid=savetips[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.tipTapped.bind(this));
		Mojo.Log.error("#########added event to "+eid)
	}

	var donetips=$$(".tipdone");
	for(var e=0;e<donetips.length;e++) {
		var eid=donetips[e].id;
		Mojo.Event.stopListening($(eid),Mojo.Event.tap,this.tipTapped);
		Mojo.Event.listen($(eid),Mojo.Event.tap,this.tipTapped.bind(this));
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
/*	this.controller.showAlertDialog({
		onChoose: function(value) {
			if (value) {
				Mojo.Log.error("#######click yeah");
				this.checkIn(this.venue.id, this.venue.name,'','','0');
			}
		},
		title:"Foursquare Check In",
		message:"Go ahead and check-in here?",
		cancelable:true,
		choices:[ {label:'Yeah!', value:true, type:'affirmative'}, {label:'Eh, nevermind.', value:false, type:'negative'} ]
	});*/
		checkinDialog = this.controller.showDialog({
		template: 'listtemplates/do-checkin',
		assistant: new DoCheckinDialogAssistant(this,this.venue.id,this.venue.name)
	});

}

VenuedetailAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
	Mojo.Log.error("###check in please??");
	if (_globals.auth) {
	Mojo.Log.error("ping="+sf);
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
		//$('message').innerHTML = 'Not Logged In';
	}
}
VenuedetailAssistant.prototype.markClosed = function() {
	Mojo.Log.error("###mark closed");
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
		//$('message').innerHTML = 'Not Logged In';
	}
}

VenuedetailAssistant.prototype.showBanks = function(event) {
Mojo.Log.error("##getting banks");
$("meta-overlay").show();
$("overlaySpinner").mojo.start();
$("overlaySpinner").show();
$("overlay-content").innerHTML="";
$("overlay-title").innerHTML="Banks & ATMs";

		//var url = 'http://api.flickr.com/services/feeds/photos_public.gne?&tagmode=any&format=json&jsoncallback=?&tags=foursquare:venue='+this.venue.id;
		var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22financial:banks%22}}],%22radius%22:%221km%22,%22limit%22:20}';
		Mojo.Log.error("url="+url);
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.banksSuccess.bind(this),
			onFailure: this.banksFailed.bind(this)
		});
}

VenuedetailAssistant.prototype.banksSuccess = function(response) {
	Mojo.Log.error("banks="+response.responseText);
	$("meta-overlay").show();
	$("overlaySpinner").mojo.stop();
	$("overlaySpinner").hide();

	//$("overlay-content").innerHTML='No Flickr images found for this venue.';
	$("overlay-title").innerHTML="Banks & ATMs";

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	Mojo.Log.error(Object.toJSON(j));
	var entities=j.entity;
	if(entities.length>0) {
		var banks=[];
		for(var e=0;e<entities.length;e++) {
			Mojo.Log.error("in loop");
			var thisbank={};
			thisbank.address=entities[e].viewlisting.address[0];
			thisbank.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			Mojo.Log.error("distance="+entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisbank.distance=dist;
			thisbank.unit=unit;
			banks.push(thisbank);
			Mojo.Log.error("##entity: "+thisbank.name);
		}
		Mojo.Log.error("banks="+banks.length);
		this.resultsModel.items=banks;
		this.controller.modelChanged(this.resultsModel);
		$("results-meta-list").show();
	}else{
		$("results-meta-list").hide();
		$("overlay-content").innerHTML='There are no nearby banks or ATMs.';
	}
	
}
VenuedetailAssistant.prototype.banksFailed = function(response) {
$("meta-overlay").show();
$("overlaySpinner").mojo.stop();
$("overlaySpinner").hide();
$("results-meta-list").hide();

	$("overlay-content").innerHTML='Error loading nearby banks and ATMs.';
	$("overlay-title").innerHTML="Banks & ATMs";

}

VenuedetailAssistant.prototype.showParking = function(event) {
Mojo.Log.error("##getting parking");
$("meta-overlay").show();
$("overlaySpinner").mojo.start();
$("overlaySpinner").show();
$("overlay-content").innerHTML="";
$("overlay-title").innerHTML="Parking";

		//var url = 'http://api.flickr.com/services/feeds/photos_public.gne?&tagmode=any&format=json&jsoncallback=?&tags=foursquare:venue='+this.venue.id;
		var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&pretty=1&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22tourist-center:parking%22}}],%22radius%22:%221km%22,%22limit%22:20}';
		Mojo.Log.error("url="+url);
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.parkingSuccess.bind(this),
			onFailure: this.parkingFailed.bind(this)
		});
}

VenuedetailAssistant.prototype.parkingSuccess = function(response) {
	Mojo.Log.error("parking="+response.responseText);
	$("meta-overlay").show();
	$("overlaySpinner").mojo.stop();
	$("overlaySpinner").hide();

	//$("overlay-content").innerHTML='No Flickr images found for this venue.';
	$("overlay-title").innerHTML="Parking";

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	Mojo.Log.error(Object.toJSON(j));
	var entities=j.entity;
	if(entities.length>0) {
		var parking=[];
		for(var e=0;e<entities.length;e++) {
			Mojo.Log.error("in loop");
			var thisparking={};
			thisparking.address=entities[e].viewlisting.address[0];
			thisparking.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			Mojo.Log.error("distance="+entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisparking.distance=dist;
			thisparking.unit=unit;
			banks.push(thisbank);
			Mojo.Log.error("##entity: "+thisparking.name);
		}
		Mojo.Log.error("parking="+parking.length);
		this.resultsModel.items=parking;
		this.controller.modelChanged(this.resultsModel);
		$("results-meta-list").show();
	}else{
		$("results-meta-list").hide();
		$("overlay-content").innerHTML='There are no nearby <br/>parking lots.';
	}
	
}
VenuedetailAssistant.prototype.parkingFailed = function(response) {
$("meta-overlay").show();
$("overlaySpinner").mojo.stop();
$("overlaySpinner").hide();
$("results-meta-list").hide();

	$("overlay-content").innerHTML='Error loading nearby parking.';
	$("overlay-title").innerHTML="Parking";

}


VenuedetailAssistant.prototype.showFlickr = function(event) {
Mojo.Log.error("##getting flickr");
$("meta-overlay").show();
$("overlaySpinner").mojo.start();
$("overlaySpinner").show();
$("overlay-content").innerHTML="";
$("results-meta-list").hide();

		//var url = 'http://api.flickr.com/services/feeds/photos_public.gne?&tagmode=any&format=json&jsoncallback=?&tags=foursquare:venue='+this.venue.id;
		var url='http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&machine_tags=foursquare:venue="'+this.venue.id+'"&nojsoncallback=1&format=json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			/*requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				vid: this.venue.id,
			},*/
			onSuccess: this.flickrSuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
		});
}

VenuedetailAssistant.prototype.flickrFailed = function(response) {
Mojo.Log.error("##flickr failed: "+response.responseText);
$("meta-overlay").show();
$("overlaySpinner").mojo.stop();
$("overlaySpinner").hide();

	$("overlay-content").innerHTML='No Flickr images found for this venue.';
	$("overlay-title").innerHTML="Flickr "+this.flickrUpload;
	Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));
}

VenuedetailAssistant.prototype.flickrSuccess = function(response) {
Mojo.Log.error("##flickr succeeded: "+response.responseText);
	
		var j=eval("("+response.responseText+")");

	if(j.photos!=undefined && j.photos.photo.length!=0) {
		$("meta-overlay").show();
		$("overlay-title").innerHTML='Flickr '+this.flickrUpload;

		var html=$("overlay-content");
$("overlaySpinner").mojo.stop();
$("overlaySpinner").hide();
		html.update("");
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
		Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));


	}else{
		this.flickrNearby();
	}

}

VenuedetailAssistant.prototype.flickrNearby = function() {
Mojo.Log.error("######getting nearby flickr");
$("meta-overlay").show();
$("overlaySpinner").mojo.start();
$("overlaySpinner").show();

		var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&lat='+this.vgeolat+'&lon='+this.vgeolong+'&radius=5&radius_units=km&nojsoncallback=1&format=json';
		Mojo.Log.error("url="+url);
		//url="http://zhephree.com/foursquare/index.php";
		var requester = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.flickrNearbySuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
		});

}

VenuedetailAssistant.prototype.flickrNearbySuccess = function(response) {
	Mojo.Log.error(response.responseText);
	var j=eval("("+response.responseText+")");

	if(j.photos!=undefined && j.photos.photo.length>0) {
		if(j.photos.total=="0"){this.flickrFailed(response);}

		$("meta-overlay").show();
		$("overlay-title").innerHTML='Flickr <span class="small-text">(Nearby)</span> '+this.flickrUpload;
$("overlaySpinner").mojo.stop();
$("overlaySpinner").hide();

		var html=$("overlay-content");
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
		Mojo.Event.listen(this.controller.get("flickrUploader"),Mojo.Event.tap, this.tryflickrUpload.bind(this));


	}else{
		this.flickrFailed(response);
	}
}

VenuedetailAssistant.prototype.tryflickrUpload = function(event) {
	//gotta get the file:
	Mojo.Log.error("trying to ask for file...");
//	Mojo.FilePicker.pickFile({'actionName':'Upload','kinds':['image'],'defaultKind':'image','onSelect':this.doUpload.bind(this)},this.controller.stageController);
	if(_globals.flickr_token){
		this.controller.stageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,this.venue.id);
	}else{
		this.controller.stageController.pushScene({name: "flickr-auth", transition: Mojo.Transition.crossFade});
	}
}

VenuedetailAssistant.prototype.doUpload = function(event) {
	var fn=event.fullPath;
	
	this.controller.stageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,fn,this.venue.id);
}

VenuedetailAssistant.prototype.handleFlickrTap = function(event) {
	Mojo.Log.error("trying flickr tap");
	var url=event.target.getAttribute("link");
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
	    method: 'open',
	    parameters: {
			target: url
		}
	});
}

VenuedetailAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
	
	var json=response.responseJSON;
		Mojo.Log.error("^^^^^^^^^^^^^^^^made it here...");
	//checkinDialog.mojo.close();
	//checkinDialog=null;
	//var dialog = this.controller.showDialog({
	//	template: 'listtemplates/checkin-info',
	//	assistant: new CheckInDialogAssistant(this, json,this.uid)
	//});
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
	Mojo.Log.error("############user info! the uid="+event.target.readAttribute("data")+",target="+event.target.id);
	var thisauth=auth;
	//this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,event.target.readAttribute("data"));
	var uid=event.target.readAttribute("data");
	var uname=event.target.readAttribute("user");
	

	Mojo.Log.error("##getting userinfo");
	$("meta-overlay").show();
	$("overlaySpinner").mojo.start();
	$("overlaySpinner").show();
	$("overlay-content").innerHTML="";
	$("overlay-title").innerHTML=uname;

		//var url = 'http://api.flickr.com/services/feeds/photos_public.gne?&tagmode=any&format=json&jsoncallback=?&tags=foursquare:venue='+this.venue.id;
		var url='http://api.foursquare.com/v1/user.json';
		Mojo.Log.error("url="+url);
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
	   		requestHeaders: {Authorization:_globals.auth}, 
	   		parameters: {uid: uid,badges: '1', mayor: '1'},
			onSuccess: this.userSuccess.bind(this),
			onFailure: this.userFailed.bind(this)
		});

}
VenuedetailAssistant.prototype.userSuccess = function(response) {
	Mojo.Log.error("userinfo="+response.responseText);
	$("meta-overlay").show();
	$("overlaySpinner").mojo.stop();
	$("overlaySpinner").hide();

	var j=response.responseJSON;
	//user info
	var pic='<img src="'+j.user.photo+'" width="75" height="75" class="friend-avatar blocky" />';
	var lname=(j.user.lastname != undefined)? j.user.lastname: "";
	var tw=(j.user.twitter != undefined)? '<span class="linefix"><img src="images/bird-light.png" width="16" height="16" /> <a class="vtag" href="http://twitter.com/'+j.user.twitter+'">'+j.user.twitter+'</a></span><br/>': "";
	var fb=(j.user.facebook != undefined)? '<span class="linefix"><img src="images/facebook.png" width="16" height="16" /> <a class="vtag" href="http://facebook.com/profile.php?id='+j.user.facebook+'">Facebook Profile</a></span><br/>': "";
	var ph=(j.user.phone != undefined)? '<span class="linefix"><img src="images/phone-light.png" width="16" height="16" /> <a class="vtag" href="tel://'+j.user.phone+'">'+j.user.phone+'</a></span><br/>': "";
	var em=(j.user.email != undefined)? '<span class="linefix"><img src="images/mail-light.png" width="16" height="16" /> <a class="vtag" href="mailto:'+j.user.email+'">Send E-mail</a></span><br/>': "";
	$("overlay-content").innerHTML='';
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		$("overlay-content").innerHTML +='<div class="small-text italic">'+ s + v + '</div>';
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
	
	//var uname=j.user.firstname+" "+lname+"";
	//$("userCity").innerHTML=j.user.city.name+"<br class=\"breaker\"/>";
	if(j.user.checkin != undefined) {
		var v=(j.user.checkin.venue != undefined)? " @ "+j.user.checkin.venue.name: "";
		var s=(j.user.checkin.shout)? j.user.checkin.shout: "";
		var checkin = s + v;
	}
	var html=pic+'<div class="uinfo">'+em+ph+tw+fb+'</div>';
	html+='<div class="breaker">'+fs+'</div>';
	$("overlay-content").innerHTML+=html;


	//handling loading mayorship and badge info
	if(j.user.badges != null) {
		var o='';
		o += '<table border=0 cellspacing=0 cellpadding=2 width="95%">';
		o += '<tr><td></td><td></td><td></td></tr>';
		var id=0
		for(var m=0;m<j.user.badges.length;m++) {
//			$("badges-box").innerHTML+='<div class="palm-row single"><div class="checkin-badge"><img src="'+j.user.badges[m].icon+'" width="48" height="48" style="float:left" /> <span>'+j.user.badges[m].name+'</span><br/><span class="palm-info-text" style="margin-left:0;padding-left:0">'+j.user.badges[m].description+'</span></div></div>';
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
			Mojo.Log.error("got badges stuff");

	$("overlay-content").innerHTML+='<br/><b>Badges</b><br/>'+html;





	if(j.user.mayor != null && j.user.mayor != undefined) {
		Mojo.Log.error("###got mayorships");
		var s=(j.user.mayor.length==1)? "":"s";
		var mayor_title=j.user.mayor.length+" Mayorship"+s;

		var mayorships="";
		for (var m=0;m<j.user.mayor.length;m++) {
			mayorships+=j.user.mayor[m].name+'<br/>';
		}
		html='<b>'+mayor_title+'</b><br/><div class="small-text">'+mayorships+'</div>';
	}else{
		Mojo.Log.error("###no mayorships");
		html='<b>'+mayor_title+'</b><br/><div class="small-text">'+j.user.firstname+' isn\'t the mayor of anything yet.</div>';
	}

	$("overlay-content").innerHTML+="<br/>"+html;
	if(friendstatus=="pendingyou") {
		Mojo.Event.listen($("approvefriend"),Mojo.Event.tap,this.approveFriend.bind(this));
		Mojo.Event.listen($("denyfriend"),Mojo.Event.tap,this.denyFriend.bind(this));
	}
	if(friendstatus=="") {
		Mojo.Log.error("added event to add friend "+$("addfriend").readAttribute("data"));
		Mojo.Event.listen($("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}
	
}
VenuedetailAssistant.prototype.userFailed = function(event) {
}
VenuedetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
	
}

VenuedetailAssistant.prototype.approveFriend = function(event) {

	var url = 'http://api.foursquare.com/v1/friend/approve.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.approveSuccess.bind(this),
	   onFailure: this.approveFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.approveSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request approved!", {source: 'notification'});
		$("friend_button").innerHTML='You\'re Friends!';
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
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.denySuccess.bind(this),
	   onFailure: this.denyFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.denySuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request denied!", {source: 'notification'});
		$("friend_button").innerHTML='<img src="images/addfriend.png" width="100" height="35" id="addfriend" data="'+event.target.getAttribute("data")+'" alt="Add Friend" />';
		Mojo.Event.listen($("addfriend"),Mojo.Event.tap,this.addFriend.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
	}
}
VenuedetailAssistant.prototype.denyFailed = function(response) {
	Mojo.Controller.getAppController().showBanner("Error denying friend request", {source: 'notification'});
}

VenuedetailAssistant.prototype.addFriend = function(event) {
Mojo.Log.error("##trying to add friend");
	var url = 'http://api.foursquare.com/v1/friend/sendrequest.json';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:_globals.auth}, //Not doing a search with auth due to malformed JSON results from it
	   parameters: {uid:event.target.getAttribute("data")},
	   onSuccess: this.addSuccess.bind(this),
	   onFailure: this.addFailed.bind(this)
	 });
}
VenuedetailAssistant.prototype.addSuccess = function(response) {
	if(response.responseJSON.user != undefined) {
		Mojo.Controller.getAppController().showBanner("Friend request sent!", {source: 'notification'});
		$("friend_button").innerHTML='<img src="images/pending.png" width="100" height="35" id="pendingfriend" alt="Pending" />';
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
					//this.prevScene.cmmodel.items[0].toggleCmd="do-Nothing";
				    //this.prevScene.controller.modelChanged(this.prevScene.cmmodel);

					//this.controller.stageController.popScene("user-info");
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
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
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
					$("venueScrim").show();
					$("venueSpinner").mojo.start();
					$("venueSpinner").show();
                	//_globals.friendList=undefined;
					this.getVenueInfo();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
            }
           // var scenes=this.controller.stageController.getScenes();
            //Mojo.Log.error("########this scene="+scenes[scenes.length-1].name+", below is "+scenes[scenes.length-2].name);
            //scenes[scenes.length-2].getSceneController().cmmodel.items[0].toggleCmd="do-Nothing";
            //scenes[scenes.length-2].getSceneController().modelChanged(scenes[scenes.length-2].getSceneController().cmmodel);
        }else if(event.type===Mojo.Event.back && this.fromuserinfo!=true) {
			event.preventDefault();
	        var thisauth=_globals.auth;
			this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
	    }

}

VenuedetailAssistant.prototype.tagTapped = function(event) {
	var q=event.target.innerHTML;
	this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},_globals.auth,_globals.userData,this.username,this.password,this.uid,true,q);
	
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
		   requestHeaders: {Authorization: _globals.auth}, //Not doing a search with auth due to malformed JSON results from it
		   parameters: {tid: tip},
		   onSuccess: this.markTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });
}
VenuedetailAssistant.prototype.markTipSuccess = function(response){
	Mojo.Log.error(response.responseText);
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
	Mojo.Log.error("divider tapped: "+event.target.id);
	switch(event.target.id) {
		case "mayorArrow":
		case "mayorLine":
			Mojo.Log.error("mayor divider");
			if($("mayorArrow").hasClassName("palm-arrow-closed")) {
				$("mayorArrow").removeClassName("palm-arrow-closed");
				$("mayorArrow").addClassName("palm-arrow-expanded");
				$("mayorDrawer").mojo.setOpenState(true);
			}else{
				$("mayorArrow").removeClassName("palm-arrow-expanded");
				$("mayorArrow").addClassName("palm-arrow-closed");
				$("mayorDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "tipsArrow":
		case "tipsLine":
			if($("tipsArrow").hasClassName("palm-arrow-closed")) {
				$("tipsArrow").removeClassName("palm-arrow-closed");
				$("tipsArrow").addClassName("palm-arrow-expanded");
				$("venueTipsContainer").mojo.setOpenState(true);
			}else{
				$("tipsArrow").removeClassName("palm-arrow-expanded");
				$("tipsArrow").addClassName("palm-arrow-closed");
				$("venueTipsContainer").mojo.setOpenState(false);
			
			}
			break;
		case "specialsArrow":
		case "specialsLine":
			if($("specialsArrow").hasClassName("palm-arrow-closed")) {
				$("specialsArrow").removeClassName("palm-arrow-closed");
				$("specialsArrow").addClassName("palm-arrow-expanded");
				$("venueSpecialsContainer").mojo.setOpenState(true);
			}else{
				$("specialsArrow").removeClassName("palm-arrow-expanded");
				$("specialsArrow").addClassName("palm-arrow-closed");
				$("venueSpecialsContainer").mojo.setOpenState(false);
			
			}
			break;
		case "tagsArrow":
		case "tagsLine":
			if($("tagsArrow").hasClassName("palm-arrow-closed")) {
				$("tagsArrow").removeClassName("palm-arrow-closed");
				$("tagsArrow").addClassName("palm-arrow-expanded");
				$("tagsDrawer").mojo.setOpenState(true);
			}else{
				$("tagsArrow").removeClassName("palm-arrow-expanded");
				$("tagsArrow").addClassName("palm-arrow-closed");
				$("tagsDrawer").mojo.setOpenState(false);
			
			}
			break;
		case "infoArrow":
		case "infoLine":
			if($("infoArrow").hasClassName("palm-arrow-closed")) {
				$("infoArrow").removeClassName("palm-arrow-closed");
				$("infoArrow").addClassName("palm-arrow-expanded");
				$("venueInfoContainer").mojo.setOpenState(true);
			}else{
				$("infoArrow").removeClassName("palm-arrow-expanded");
				$("infoArrow").addClassName("palm-arrow-closed");
				$("venueInfoContainer").mojo.setOpenState(false);
			
			}
			break;
		case "mapArrow":
		case "mapLine":
			if($("mapArrow").hasClassName("palm-arrow-closed")) {
				$("mapArrow").removeClassName("palm-arrow-closed");
				$("mapArrow").addClassName("palm-arrow-expanded");
				$("mapDrawer").mojo.setOpenState(true);
			}else{
				$("mapArrow").removeClassName("palm-arrow-expanded");
				$("mapArrow").addClassName("palm-arrow-closed");
				$("mapDrawer").mojo.setOpenState(false);
			
			}
			break;
	}
}


VenuedetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

VenuedetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   zBar.render(zBar.oldBar,"venues");
}
