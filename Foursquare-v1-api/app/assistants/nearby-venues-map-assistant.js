function NearbyVenuesMapAssistant(lat,long,v,u,p,uid,ps,q) {
	   this.lat=lat;
	   this.long=long;
	   this.venues=v;
	   this.username=u;
	   this.password=p;
	   this.uid=uid;
	   this.prevScene=ps;
	   this.query=q;
	   //this.what=what;
	   
	   _globals.curmap=this;
	   
	   this.infowindows=[];
}

NearbyVenuesMapAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

NearbyVenuesMapAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons: 'navOnly'});

    var appController = Mojo.Controller.getAppController();
  	var cardStageController = appController.getStageController("mainStage");
	var doc=cardStageController.document;

    // Code from Google Sample
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/api/js?sensor=true&key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);

	
	this.controller.setupWidget("mapSpinner",
         this.spinnerAttributes = {
             spinnerSize: 'large'
         },
         this.spinnerModel = {
             spinning: true 
    });
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
       

   this.handleGestureStartBound=this.handleGestureStart.bindAsEventListener(this);
   this.handleGestureChangeBound=this.handleGestureChange.bindAsEventListener(this);
   this.handleGestureEndBound=this.handleGestureEnd.bindAsEventListener(this);
   this.showVenueInfoBound=this.showVenueInfo.bind(this);
   
	Mojo.Event.listen(this.controller.document, 'gesturestart', this.handleGestureStartBound, false);
    Mojo.Event.listen(this.controller.document, 'gesturechange', this.handleGestureChangeBound, false);
    Mojo.Event.listen(this.controller.document, 'gestureend', this.handleGestureEndBound, false);
	Mojo.Event.listen(this.controller.get("map_info"),Mojo.Event.tap, this.showVenueInfoBound);

	_globals.ammodel.items[0].disabled=true;
	this.controller.modelChanged(_globals.ammodel);

	this.lastScale=0;
	this.inGesture=false;
	this.zoom=15;
	this.origZoom=15;
}

NearbyVenuesMapAssistant.prototype.handleGestureStart = function(e) {
	this.map.setOptions({draggable:false});
	this.previousScale=e.scale;


}
NearbyVenuesMapAssistant.prototype.handleGestureChange = function(e) {
	e.stop();
	var d=this.previousScale-e.scale;
	if(Math.abs(d)>0.25){
		var z=this.map.getZoom()+(d>0?-1:+1);
		this.map.setZoom(z);
		this.previousScale=e.scale;
	}
}
NearbyVenuesMapAssistant.prototype.handleGestureEnd = function(e) {
	e.stop();
	this.map.setOptions({draggable:true});     
}


NearbyVenuesMapAssistant.prototype.showVenueInfo = function(event) {
	var v=this.controller.get("map_info").readAttribute("data");
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: true},this.venues[v],this.username,this.password,this.uid,false,this,true);
}






NearbyVenuesMapAssistant.prototype.initMap = function() {
  var myOptions = {
    zoom: 15,
    center: new google.maps.LatLng(_globals.lat, _globals.long),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  this.map = new google.maps.Map(this.controller.get("map_canvas"),
                                myOptions);

  this.setMarkers(this.map);
}



NearbyVenuesMapAssistant.prototype.setMarkers = function (map) {
	var cimage = new google.maps.MarkerImage('http://google-maps-icons.googlecode.com/files/leftthendown.png',
    new google.maps.Size(32, 37),
    new google.maps.Point(0,0),
    new google.maps.Point(0, 27));

	var shadow = new google.maps.MarkerImage('images/shadow.png',
    new google.maps.Size(51, 37),
    new google.maps.Point(0,0),
    new google.maps.Point(0, 37));
 
	var cmarker = new google.maps.Marker({
  		position: new google.maps.LatLng(_globals.lat,_globals.long),
	  	map: map,
	  	icon: cimage
	});
  
	for(var v=0;v<this.venues.length;v++) {
		var point = new google.maps.LatLng(this.venues[v].geolat,this.venues[v].geolong);
		if(this.venues[v].primarycategory==undefined){
			this.venues[v].primarycategory={};
			this.venues[v].primarycategory.iconurl="images/no-cat.png";
		}
		//'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=+|56739e'
		var image = new google.maps.MarkerImage(this.venues[v].primarycategory.iconurl,
	    new google.maps.Size(32, 32),
    	new google.maps.Point(0,0),
	    new google.maps.Point(0, 37));
			
			
		var marker=new google.maps.Marker({
			position: point,
			map: map,
			icon: image,
			shadow: shadow,
			venue: this.venues[v],
			vindex: v,
			username: this.username,
			password: this.password,
			uid: this.uid
		});
	
		this.attachBubble(marker, v);
	}



	Mojo.Event.listen(this.controller.get("map_canvas"),Mojo.Event.tap, function(){
		for(var i=0; i<this.venues.length;i++){
			this.infowindows[i].close();		
		}
	}.bindAsEventListener(this));
			    
	this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
	this.controller.get("mapSpinner").hide();

}


NearbyVenuesMapAssistant.prototype.attachBubble = function(marker,i) {


	this.infowindows[i] = new google.maps.InfoWindow(
      { content: '<div id="iw-'+this.venues[i].id+'" style="height:260px;font-size:16px;"  data="'+i+'"><b>'+this.venues[i].name+"</b><br/>" +
           					this.venues[i].address+"<br/>"/*+
           					'<a href="javascript:;" id="venue-'+this.venues[i].id+'" class="venueLink" data="'+i+'">Venue Info</a></div><br/>'*/
      });
  
	google.maps.event.addListener(marker, 'click', function() {
			 var html='<div class="mi-left-thin"><img src="'+this.venues[i].primarycategory.iconurl+'" width="32" height="32"></div>';
			 html+='<div class="mi-right"><b>'+this.venues[i].name+'</b><br/>'+this.venues[i].address+'</div>';

			 this.controller.get("map_info").innerHTML=html;
			 this.controller.get("map_info").writeAttribute("data",i);
			 this.controller.get("map_info").style.opacity=1;
			 this.controller.get("map_info").show();
			 window.clearTimeout(this.infoTimer);
			 this.infoTimer=window.setTimeout(function(){this.fadeInfo();}.bind(this),5000);
		
/*    	this.infowindows[i].open(this.map,marker);*/
	}.bind(this));
	google.maps.event.addListener(this.infowindows[i],"domready",function(){	
		Mojo.Event.listen(this.controller.get('iw-'+this.venues[i].id),Mojo.Event.tap, this.showVenueInfo.bind(this));
	}.bind(this));

}


NearbyVenuesMapAssistant.prototype.fadeInfo = function(){
	Mojo.Animation.animateStyle(this.controller.get("map_info"),'opacity','bezier',{from:100,
																	to:0,
																	duration:1,
																	curve:Mojo.Animation.easeIn,
																	styleSetter:function(value){
																		this.controller.get("map_info").style.opacity=value/100;
																	
																	}.bind(this),
																	onComplete:function(el){
																		el.hide();
																	}
																	
																	});
};






NearbyVenuesMapAssistant.prototype.activate = function(event) {
}


NearbyVenuesMapAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "venue-search":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,true);
                	break;
				case "nearby-venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					break;
				case "venue-map":
					break;
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,this.username,this.password,this.uid,this.lat,this.long,this);
					break;
                case "do-Tips":
                	var thisauth=_globals.auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Todos":
                	var thisauth=auth;
                	this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.popScene();
					this.prevScene.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
            }
        }else if(event.type===Mojo.Event.back){
			if(NavMenu.showing==true){
				event.preventDefault();
				NavMenu.hideMenu();
			}        
        }

    }


NearbyVenuesMapAssistant.prototype.deactivate = function(event) {
}

NearbyVenuesMapAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.document, 'gesturestart', this.handleGestureStartBound, false);
    Mojo.Event.stopListening(this.controller.document, 'gesturechange', this.handleGestureChangeBound, false);
    Mojo.Event.stopListening(this.controller.document, 'gestureend', this.handleGestureEndBound, false);
	Mojo.Event.stopListening(this.controller.get("map_info"),Mojo.Event.tap, this.showVenueInfoBound);
}






