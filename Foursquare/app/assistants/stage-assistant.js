//double check our global namespace
_globals=_globals || {};

///not used anymore, but hanging on to it
/*_globals.cmmodel = {
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
    };*/




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
	   			if(update){
	   				Mojo.Log.error("update is true");
	   				as.controller.showAlertDialog({
						onChoose: function(value) {
							if (value) {
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

function getProp(obj,n){
	var i=0;
	for(p in obj){
		if(i++==n) return p
	}
}


function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	
}


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

