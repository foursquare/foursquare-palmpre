function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
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
		{label: "About", command: "do-About"}
	]
};
_globals.amattributes = {
	omitDefaultItems: true
};

_globals.flickr_key="cd71e31678530ab09a2bf29622944c5c";
_globals.flickr_secret="d5d43120eee9eff8";

_globals.userCache=[];