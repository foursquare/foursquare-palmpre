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
{label: "Search", command: "do-Search",disabled:true},
{label: "Preferences & Accounts", command: "do-Prefs"},
Mojo.Menu.editItem,
{label: "About", command: "do-About"},
{label: "DONATE",command: "do-Donate"}
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
	logthis("getting update...");
	//var url="http://zhephree.com/foursquare/update.php";
	var url="http://developer.palm.com/appredirect/?packageid=com.foursquare.foursquare";
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'true',
	   onSuccess: function(t) {
	   			logthis("got info: "+t.responseText);
	   			/*var j=eval("("+t.responseText+")");
	   			logthis("got json");
	   			var v=j.latest;
	   			logthis("got version");
	   			var m=j.message;*/
	   			
	   			var s=t.responseText.indexOf("Version: ")+9;
	   			var e=t.responseText.indexOf("<br/>",s);
	   			var v=t.responseText.substring(s,e)
	   			logthis("version: "+v);
	   			logthis("got message");
	   			var tv=Mojo.appInfo.version;
	   			logthis("got this version");
	   			var update=false;
	   			logthis("set update to false");
	   			if(v != tv) { // probably have a newer version available
	   				varray=v.split(".");
	   				tvarray=tv.split(".");
	   				//now we have arrays like [1,2,9] for 1.2.9
	   				logthis("versions are diff");
	   				if(varray[0]>tvarray[0]) { //if online major ver is bigger than this major ver...
	   					logthis("diff majors");
	   					update=true;
	   				}else if(varray[0]==tvarray[0]){ //same major versions. check minor ver
	   					logthis("same majors");
	   					if(varray[1]>tvarray[1]) { //bigger online minor ver
	   						logthis("diff minors");
	   						update=true;
	   					}else if(varray[1]==tvarray[1]){ //same major ver, same moinor ver. check revision.
	   						logthis("same minors");
	   						if(varray[2]>tvarray[2]) { //bigger online rev than this rev
	   							logthis("diff revs");
	   							update=true;
	   						}else{ //rev is the same or smaller
	   							logthis("same or smaller revs");
	   							update=false;
	   						}
	   					}else { //same major ver, tv is bigger minor ver
	   						logthis("same major, smaller minor");
	   						update=false;
	   					}
	   				}else{ //this version has a bigger major than online. only happens if user got github ver before app cat
	   					update=false;
	   				}
	   			
	   			}else { //same versions
	   				logthis("versions are the same");
					update=false;
	   			}
	   			if(update){
	   				logthis("update is true");
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
					logthis("update is false");
					/*as.controller.showAlertDialog({
						onChoose: function(value) {
							if (value) {
								//logthis("#######click yeah");
								//this.checkIn(this.venue.id, this.venue.name,'','','0');
							}
						},
						title:"Update Check",
						message:"You've got the latest version!",
						cancelable:true,
						choices:[ {label:'OK', value:true, type:'affirmative'}]
					});	   */			

				}
	
	   	},
	   onFailure: function() {
	   		/*	Mojo.Controller.getAppController().showBanner("Error getting update info", {source: 'notification'});*/
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
	logthis(event.responseText);
}

