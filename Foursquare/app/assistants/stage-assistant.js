function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	zBar.activeScene=this.controller.activeScene();
	zBar.stageController=this.controller;
	//this.controller.listen(document, 'shakestart', this.handleShakeStart.bindAsEventListener(this));
	//this.controller.listen(document, 'shakeend', this.handleShakeEnd.bindAsEventListener(this));
	//Mojo.Event.listen(document, 'shaking', this.handleShaking.bindAsEventListener(this));
	//this.getUA();
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if (credentials /*&& 1==2*//*uncomment the comment before this to force the login dialog*/){
		this.username=credentials.username;
		_globals.auth=credentials.auth;
		this.gpsdata=new Mojo.Model.Cookie("gpsdata");
		var gps=this.gpsdata.get();
		_globals.gpsAccuracy=(gps)? gps.gpsAccuracy*-1: 0;
		
		this.venuecount=new Mojo.Model.Cookie("venuecount");
		var vc=this.venuecount.get();
		_globals.venueCount=(vc)? vc.venueCount: 15;

		this.units=new Mojo.Model.Cookie("units");
		var un=this.units.get();
		_globals.units=(un)? un.units: "si";

		this.hv=new Mojo.Model.Cookie("hiddenVenues");
		var hv=this.hv.get();
		_globals.hiddenVenues=(hv)? hv.hiddenVenues: [];


		this.flickr=new Mojo.Model.Cookie("flickr");
		var flickrinfo=this.flickr.get();
		_globals.flickr_token=(flickrinfo)? flickrinfo.token: undefined;
		_globals.flickr_username=(flickrinfo)? flickrinfo.username: undefined;
		_globals.flickr_fullname=(flickrinfo)? flickrinfo.fullname: undefined;
		_globals.flickr_nsid=(flickrinfo)? flickrinfo.nsid: undefined;

		
		
		this.controller.pushScene('main',true,credentials);
	}else{
		this.controller.pushScene('main',false);
	}
	
	
}

StageAssistant.prototype.handleShaking = function(event) {
	if(event.magnitude>2){
		switch(Mojo.Controller.stageController.getWindowOrientation()) {
			case "up":
				Mojo.Controller.stageController.setWindowOrientation("left");
				break;	
			case "left":
				Mojo.Controller.stageController.setWindowOrientation("down");
				break;	
			case "down":
				Mojo.Controller.stageController.setWindowOrientation("right");
				break;	
			case "right":
				Mojo.Controller.stageController.setWindowOrientation("up");
				break;	
		}
	}
}

function _globals() {
}

_globals.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/user_info.png", command: "do-Badges"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Venues",
            checkEnabled: true
            }]
    };

_globals.ammodel = {
	visible: true,
	items: [
		{label: "Refresh", command: "do-Refresh"},
		{label: "Preferences & Accounts", command: "do-Prefs"},
		Mojo.Menu.editItem,
		{label: "Check for Updates", command: "do-Update"},
		{label: "About", command: "do-About"}
	]
};
_globals.amattributes = {
	omitDefaultItems: true
};

//if you're using your own build, you should probably get your own
_globals.flickr_key="cd71e31678530ab09a2bf29622944c5c";
_globals.flickr_secret="d5d43120eee9eff8";

//in the future, will cache user info
_globals.userCache=[];


//this function renders our custom navigation across the bottom of each scene
//with the active argument, the function will know which button should be shown as active
//we'll have to define the different toolbars first
function zBar() {
}

zBar.toolbars=[
	{
		name: "main",
		buttons:[
			{name:"venues",caption:"Venues",kind:"button",icon:"images/venue_button.png",command:"do-Venues"},
			{name:"friends",caption:"Friends",kind:"button",icon:"images/friends_button.png",command:"do-Friends"},
			{name:"tips",caption:"Tips",kind:"button",icon:"images/todo_button.png",command:"do-Tips"},
			{name:"shout",caption:"Shout",kind:"button",icon:"images/shout_button.png",command:"do-Shout"},
			{name:"profile",caption:"Profile",kind:"button",icon:"images/user_info.png",command:"do-Badges"},
			{name:"leaderboard",caption:"Board",kind:"button",icon:"images/leader_button.png",command:"do-Leaderboard"}
		]
	},
	{
		name: "user",
		buttons:[
			{name:"email",caption:"E-mail",kind:"button",icon:"images/email_button.png",command:"do-Email",noActive:true},
			{name:"phone",caption:"Call",kind:"button",icon:"images/phone_button.png",command:"do-Phone",noActive:true},
			{name:"twitter",caption:"Tweet",kind:"button",icon:"images/twitter_button.png",command:"do-Twitter",noActive:true},
			{name:"facebook",caption:"FBook",kind:"button",icon:"images/facebook_button.png",command:"do-Facebook",noActive:true}
		]
	},
	{
		name: "venue",
		buttons: [
			{name:"checkin",caption:"Check-in",kind:"big-button",icon:"images/check.png",command:"do-Checkin"}/*,
			{name:"back",caption:"Back",kind:"button",icon:"images/back.png",command:"do-Venues"}*/
		]
	}
];

zBar.options={
	textColor: "#fff",
	captionSize: "11px",
	captionSizeWide: "18px",
	fontSize: "14px",
	barHeight: "45px",
	barWidth: "320px",
	barPadding: "9px",
	buttonHeight: "45px",
	buttonWidth: "50px"	
};
zBar.currentBar="";
zBar.activeButton="";

zBar.getToolbar = function(toolbar) {
		//find the right toolbar. default to the first one
		var theToolbar=zBar.toolbars[0];
		for(var t=0;t<zBar.toolbars.length;t++) {
			if(zBar.toolbars[t].name==toolbar){
				var theToolbar=zBar.toolbars[t];
			}
		}

	return theToolbar;
};

zBar.getButton = function(toolbarName, buttonName) {
	var theToolbar = zBar.getToolbar(toolbarName);
	
	for(var b=0;b<theToolbar.buttons.length;b++){
		if(theToolbar.buttons[b].name==buttonName){
			theToolbar.buttons[b].index=b;
			var theButton=theToolbar.buttons[b];
		}
	}
	
	return theButton;
};

//hides button on the currentBar
zBar.hideButton = function(button) {
	var btn=zBar.getButton(zBar.currentBar,button);
	var theToolbar=zBar.getToolbar(zBar.currentBar);
	
	$("zButton-"+btn.index).hide();
	var usedSpace=0;
	for(var b=0;b<theToolbar.buttons.length;b++) {
		if(b != btn.index){
			var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
			usedSpace=usedSpace+parseInt(w);
		}
	}
	//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
	var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
	
	$("zBar").style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";
};

//unhides a button on the currentBar
zBar.showButton = function(button) {
	var btn=zBar.getButton(zBar.currentBar,button);
	var theToolbar=zBar.getToolbar(zBar.currentBar);
	
	$("zButton-"+btn.index).show();
	var usedSpace=0;
	for(var b=0;b<theToolbar.buttons.length;b++) {
		if(b != btn.index){
			var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
			usedSpace=usedSpace+parseInt(w);
		}
	}
	//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
	var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
	
	$("zBar").style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";
};

zBar.render = function(toolbar,active) {
	if(toolbar!=zBar.currentBar) { //only render the bar if we haven't already
		zBar.activeButton=active;
		zBar.oldBar=zBar.currentBar;
		var gnav=$("zBar");
		if(gnav){Element.remove(gnav);}

		var theToolbar=zBar.getToolbar(toolbar);

		var nav=document.createElement("div");
		nav.id="zBar";
		nav.HEY="from Zhephree :)";
		nav.style.color=zBar.options.textColor;
		nav.style.height=zBar.options.barHeight;
		nav.style.fontSize=zBar.options.fontSize;
		
		var usedSpace=0;
		for(var b=0;b<theToolbar.buttons.length;b++) {
			if(theToolbar.buttons[b].kind=="big-button"){
				usedSpace=screen.width;
			}else{
				var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
				usedSpace=usedSpace+parseInt(w);
			}
		}
		//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
		var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
		nav.style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";


		nav.addClassName(toolbar);	
		document.body.appendChild(nav);
		zBar.currentBar=toolbar;
	
	
		//now we must loop through each toolbar and display its objects
		for(var b=0;b<theToolbar.buttons.length;b++) {
			switch(theToolbar.buttons[b].kind){
				case "button":
					var button=document.createElement("div");
					button.style.width=zBar.options.buttonWidth;
					button.style.height=zBar.options.buttonHeight;
					button.style.float="left";
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=document.createElement("div");
					caption.style.width="97%";
					caption.style.fontSize=zBar.options.captionSize;
					caption.style.textAlign="center";
					caption.style.margin="-4px 0 0 0";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
				
					//set up the event listeners
					Mojo.Event.listen($(button),Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen($(button),"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen($(button),"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
					
					
					Mojo.Log.error("id="+$(button).id);
					break;
				case "wide-button":
					var button=document.createElement("div");
					button.style.width=theToolbar.buttons[b].width;
					button.style.height=(theToolbar.buttons[b].height!=undefined)? theToolbar.buttons[b].height: zBar.options.buttonHeight;
					button.style.marginTop=(theToolbar.buttons[b].marginTop!=undefined)? theToolbar.buttons[b].marginTop: "0";					
					button.style.float="left";
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					button.addClassName("wide");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.style.float="left";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=document.createElement("div");
					caption.style.width=(parseInt(theToolbar.buttons[b].width)-37)+"px";
					caption.style.fontSize=zBar.options.captionSizeWide;
					caption.style.textAlign="center";
					var mt=Math.floor(parseInt(zBar.options.captionSizeWide)*1.4);
					caption.style.margin="-"+mt+"px 0 0 5px";
					caption.style.float="left";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
				
					//set up the event listeners
					Mojo.Event.listen($(button),Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen($(button),"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen($(button),"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
				
					break;
				case "html":
					break;
				case "big-button":
					var button=document.createElement("div");
					button.style.width="100%";
					button.style.height=zBar.options.buttonHeight;
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					//button.addClassName("big");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.style.float="left";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=document.createElement("div");
					//caption.style.width=(parseInt(theToolbar.buttons[b].width)-37)+"px";
					caption.style.fontSize=zBar.options.captionSizeWide;
					caption.style.textAlign="center";
					var mt=Math.floor(parseInt(zBar.options.captionSizeWide)*1.4);
					mt=0;
					caption.style.margin="-"+mt+"px 0 0 5px";
					caption.style.float="left";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
					
					//gotta center the icon and caption...
					var usedSpace=27+parseInt(caption.offsetWidth);
					var pad=Math.floor((parseInt(screen.width)-usedSpace)/2)-24;
					$("zButton-"+b).setStyle({paddingLeft:pad+"px",paddingTop:"6px"});		
					
					//set up the event listeners
					Mojo.Event.listen($(button),Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen($(button),"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen($(button),"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
				
					break;
			}
		}
	}
}

zBar.highlightButton = function(event) {
    //while the event is on the zButton element, the element returned will probably
    //be a child element (icon or caption), so we have to find the parent instead.
    //instead of finding the parent, we'll get the number from the element's id.
    //this fool-proofs the function in case the zButton itself gets returned
	var str=event.target.id.split("-");
	var id=str[1];
	var button=$("zButton-"+id);
    Mojo.Log.error("highlighting..."+id);
	if(!button.hasClassName("highlight")){
		Mojo.Log.error("~~~~no highlight");
		button.addClassName("highlight");
	}
};

zBar.dehighlightButton = function(event) {
	var str=event.target.id.split("-");
	var id=str[1];
	var button=$("zButton-"+id);
	if(button.hasClassName("highlight")){
		Mojo.Log.error("~~~~has highlight");
		button.removeClassName("highlight");
	}
};

zBar.setActive = function(buttonIndex) {
	Mojo.Log.error("setting active");
	if(zBar.activeButton!="") {
		var button=zBar.getButton(zBar.currentBar,zBar.activeButton);
		var b=button.index;
		var buttonDIV=$("zButton-"+b);
		buttonDIV.removeClassName("active");
	}
	
	var button=$("zButton-"+buttonIndex);
	button.addClassName("active");
	var tb=zBar.getToolbar(zBar.currentBar);
	zBar.activeButton=tb.buttons[buttonIndex].name;
};

zBar.hideToolbar = function() {
	Mojo.Animation.animateStyle($("zBar"),'opacity','bezier',{from:100,
																	to:0,
																	duration:0.5,
																	curve:'over-easy',
																	styleSetter:function(value){
																		$('zBar').style.opacity=value/100;
																	
																	},
																	onComplete:function(el){
																		el.hide();
																	}
																	
																	});
};

zBar.showToolbar = function() {
	$("zBar").show();
	Mojo.Animation.animateStyle($("zBar"),'opacity','bezier',{from:0,
																	to:100,
																	duration:0.5,
																	curve:'over-easy',
																	styleSetter:function(value){
																		$('zBar').style.opacity=value/100;
																	
																	}
																	
																	});
};

zBar.doCommand = function(event) {
	var str=event.target.id.split("-");
	var id=str[1];
	var tb=zBar.getToolbar(zBar.currentBar);
	if(tb.buttons[id].kind!="big-button" && !tb.buttons[id].noActive){
		zBar.setActive(id);
	}
	
	var command=$("zButton-"+id).readAttribute("command");
	Mojo.Log.error(command);
	
	
	/****************EDIT CODE BELOW FOR YOUR COMMAND HANDLING********************/
	switch(command) {
		case "do-Venues":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
			break;
		case "do-Friends":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,zBar.activeScene);
			break;
		case "do-Tips":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "do-Shout":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "do-Badges":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
			break;
		case "do-Leaderboard":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "popScene":
			zBar.stageController.popScene();
			break;
		case "do-Checkin":
			Mojo.Event.send($("docheckin"),Mojo.Event.tap);
			break;
		case "do-Email":
			Mojo.Event.send($("email_button"),"click");
			break;
		case "do-Phone":
			Mojo.Event.send($("phone_button"),"click");
			break;
		case "do-Twitter":
			Mojo.Event.send($("twitter_button"),"click");
			break;
		case "do-Facebook":
			Mojo.Event.send($("facebook_button"),"click");
			break;
	}		
};

//allows the update routine to run from anywhere
_globals.checkUpdate = function(as) {
	Mojo.Log.error("getting update...");
	var url="http://zhephree.com/foursquare/update.php";
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   onSuccess: function(t) {
	   			Mojo.Log.error("got info: "+t.responseText);
	   			var j=eval("("+t.responseText+")");
	   			Mojo.Log.error("got json");
	   			var v=j.latest;
	   			Mojo.Log.error("got version");
	   			var m=j.message;
	   			Mojo.Log.error("got message");
	   			var tv=Mojo.appInfo.version;
	   			Mojo.Log.error("got this version");
	   			var update=false;
	   			Mojo.Log.error("set update to false");
	   			if(v != tv) { // probably have a newer version available
	   				varray=v.split(".");
	   				tvarray=tv.split(".");
	   				//now we have arrays like [1,2,9] for 1.2.9
	   				Mojo.Log.error("versions are diff");
	   				if(varray[0]>tvarray[0]) { //if online major ver is bigger than this major ver...
	   					Mojo.Log.error("diff majors");
	   					update=true;
	   				}else if(varray[0]==tvarray[0]){ //same major versions. check minor ver
	   					Mojo.Log.error("same majors");
	   					if(varray[1]>tvarray[1]) { //bigger online minor ver
	   						Mojo.Log.error("diff minors");
	   						update=true;
	   					}else if(varray[1]==tvarray[1]){ //same major ver, same moinor ver. check revision.
	   						Mojo.Log.error("same minors");
	   						if(varray[2]>tvarray[2]) { //bigger online rev than this rev
	   							Mojo.Log.error("diff revs");
	   							update=true;
	   						}else{ //rev is the same or smaller
	   							Mojo.Log.error("same or smaller revs");
	   							update=false;
	   						}
	   					}else { //same major ver, tv is bigger minor ver
	   						Mojo.Log.error("same major, smaller minor");
	   						update=false;
	   					}
	   				}else{ //this version has a bigger major than online. only happens if user got github ver before app cat
	   					update=false;
	   				}
	   			
	   			}else { //same versions
	   				Mojo.Log.error("versions are the same");
					update=false;
	   			}
	   			Mojo.Log.error("gonna show dialog...");
	   			if(update){
	   				Mojo.Log.error("update is true");
	   				as.controller.showAlertDialog({
						onChoose: function(value) {
							if (value) {
								Mojo.Log.error("#######click yeah");
								as.controller.serviceRequest( "palm://com.palm.applicationManager", {
      								method: "open",
      								parameters:  {
         								target: "http://developer.palm.com/appredirect/?packageid=com.foursquare.foursquare"
      								}
   								});
							}
						},
						title:"Update Check",
						message:"Update available! You have "+tv+" and "+v+" is now available!",
						cancelable:true,
						choices:[ {label:'Update', value:true, type:'affirmative'}, {label:'Cancel', value:false, type:'dismiss'} ]
					});
				}else{
					Mojo.Log.error("update is false");
					as.controller.showAlertDialog({
						onChoose: function(value) {
							if (value) {
								//Mojo.Log.error("#######click yeah");
								//this.checkIn(this.venue.id, this.venue.name,'','','0');
							}
						},
						title:"Update Check",
						message:"You've got the latest version!",
						cancelable:true,
						choices:[ {label:'OK', value:true, type:'affirmative'}]
					});	   			

				}
	
	   	},
	   onFailure: function() {
	   			Mojo.Controller.getAppController().showBanner("Error getting update info", {source: 'notification'});
	   	}
	 });

};

Array.prototype.inArray = function (value)
// Returns true if the passed value is found in the
// array. Returns false if it is not.
{
var i;
for (i=0; i < this.length; i++) {
// Matches identical (===), not just similar (==).
if (this[i] === value) {
return true;
}
}
return false;
};



StageAssistant.prototype.getUA = function(event) {
		var request = new Ajax.Request("http://zhephree.com/foursquare/ua.php", {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {"User-Agent":"tetsing user agent"},
	   onSuccess: this.yay.bind(this)
	 });

}
StageAssistant.prototype.yay = function(event) {
	Mojo.Log.error(event.responseText);
}

