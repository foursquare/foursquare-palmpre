function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	if (credentials /*&& 1==2*//*uncomment the comment before this to force the login dialog*/){
		this.username=credentials.username;
		this.password=credentials.password;
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
		{label: "Preferences", command: "do-Prefs"},
		Mojo.Menu.editItem,
		{label: "About", command: "do-About"}
	]
};
_globals.amattributes = {
	omitDefaultItems: true
};