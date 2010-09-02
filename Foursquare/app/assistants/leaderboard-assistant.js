function LeaderboardAssistant() {
}

LeaderboardAssistant.prototype.setup = function() {
	NavMenu.setup(this);

   	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
/*    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
	    _globals.cmmodel
	);*/

//	Mojo.Event.listen(this.controller.get('fmenu'),Mojo.Event.tap, this.showMenu.bind(this));

    this.controller.setupWidget("WebId",
        this.attributes = {
            url:    'http://foursquare.com/iphone/me?uid='+_globals.uid+'&view=all&geolat='+_globals.lat+'geolong='+_globals.long+'&scope=friends',
            minFontSize:18
        },
        this.model = {
        }
    ); 
    
		//try and get the reverse location...
	/*this.controller.serviceRequest('palm://com.palm.location', {
			method: "getReverseLocation",
			parameters: {latitude: _globals.lat, longitude:_globals.long},
			onSuccess: this.gotLocation.bind(this),
			onFailure: this.failedLocation.bind(this)
	});*/

}

LeaderboardAssistant.prototype.activate = function(event) {


}

LeaderboardAssistant.prototype.failedLocation = function(event) {
	this.city="you";
	this.getLeaderboards();
}

LeaderboardAssistant.prototype.gotLocation = function(event) {
	//example response: 123 Abc Street ; Your Town, ST 12345 ; USA 
	//we're worried about the middle line, so we get to do some fun parsing.
	//no, seriously, parsing's the most fun part of programming.
	//i wish this whole app was just parsing text. boresquare, some would call it.
	var addylines=event.address.split(";");
	if(addylines.length>1) {
		var loca=addylines[1].split(", ");
		var city=trim(loca[0]);
		var statezip=loca[1].split(" ");
		var state=trim(statezip[0]);
		var zip=trim(statezip[1]);

		this.city=city;
	}

	this.getLeaderboards();
}
function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

LeaderboardAssistant.prototype.getLeaderboards = function() {
	/* OK, we're gonna do a for real leaderboard. I considered a webview, but that'll look assy.
		So instead, we'll download the HTML of the special URL and the parse the hell out of the response.
		Mmmmm.... parsing text... */
	
	//step one, get the HTML. let's start by displaying the friends leaderboard.
	var url = 'http://foursquare.com/iphone/me?uid='+_globals.uid+'&view=all&geolat='+_globals.lat+'geolong='+_globals.long+'&scope=friends';
	Mojo.Log.error("url="+url);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, 
	   parameters: {},
	   onSuccess: this.friendboardSuccess.bind(this),
	   onFailure: this.leaderboardFailed.bind(this)
	 });


}

LeaderboardAssistant.prototype.friendboardSuccess = function(response) {
	var html=response.responseText;
	Mojo.Log.error(response.responseText);
	
	var s=html.indexOf("<table");
	var e=html.indexOf("</table>");
	var l=(e+8);
	this.friendBoard=html.substring(s,l);
	this.friendBoard=this.friendBoard.replace(new RegExp('src="/img/bar_blue.gif"',"gi"),'src="images/bar_dark.png"');
	this.friendBoard=this.friendBoard.replace(new RegExp('src="/img/bar_red.gif"',"gi"),'src="images/bar_purple.png"');
	
	//make sure we have some things to display. if not, tell the user
	this.friendBoard=(this.friendBoard.indexOf('class="mini"')>-1)? this.friendBoard: "None of your friends have checked-in near "+this.city+" yet!";
		
	this.controller.get("leaderboard").innerHTML=this.friendBoard; 
	
	
	
	//step 2: download city leaderboard in background
	var url = 'http://foursquare.com/iphone/me?uid='+_globals.uid+'&view=all&geolat='+_globals.lat+'geolong='+_globals.long+'&scope=all';
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:this.auth}, 
	   parameters: {},
	   onSuccess: this.cityboardSuccess.bind(this),
	   onFailure: this.leaderboardFailed.bind(this)
	 });

}

LeaderboardAssistant.prototype.cityboardSuccess = function(response) {
	var html=response.responseText;
	Mojo.Log.error(response.responseText);
	
	var s=html.indexOf("<table");
	var e=html.indexOf("</table>");
	var l=(e+8);
	this.cityBoard=html.substring(s,l);
	this.cityBoard=this.cityBoard.replace(new RegExp('src="/img/bar_blue.gif"',"gi"),'src="images/bar_dark.png"');
	this.cityBoard=this.cityBoard.replace(new RegExp('src="/img/bar_red.gif"',"gi"),'src="images/bar_purple.png"');
		
	//make sure we have some things to display. if not, tell the user
	this.cityBoard=(this.cityBoard.indexOf("<tr>")>-1)? this.cityBoard: "No one has checked-in in "+_globals.city+" yet!";

}

LeaderboardAssistant.prototype.leaderboardFailed = function(response) {
Mojo.Log.error(response.responseText);
}

LeaderboardAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.zoomFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.zoomFade},this);
                	break;
                case "do-Refresh":
                	break;
                case "do-Nothing":
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "lb-all":
               		this.controller.get("fmenu-caption").update("City");
                	this.controller.get("leaderboard").innerHTML=this.cityBoard;
                	var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
                	$this.controller.get("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
                case "lb-friends":
                	this.controller.get("fmenu-caption").update("Friends");
                	this.controller.get("leaderboard").innerHTML=this.friendBoard;
                	var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
                	$this.controller.get("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
            }
        }
    }

LeaderboardAssistant.prototype.popUpChoose = function(event){
	switch(event) {
                case "lb-all":
               		this.controller.get("fmenu-caption").update("City");
                	this.controller.get("leaderboard").innerHTML=this.cityBoard;
                	var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
                	//$this.controller.get("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
                case "lb-friends":
                	this.controller.get("fmenu-caption").update("Friends");
                	this.controller.get("leaderboard").innerHTML=this.friendBoard;
                	var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
                	//$this.controller.get("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
	
	}
}

LeaderboardAssistant.prototype.showMenu = function(event){
					this.controller.popupSubmenu({
			             onChoose:this.popUpChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [
                	       {secondaryIconPath: 'images/friends-black.png',label: 'Friends', command: 'lb-friends'},
                    	   {secondaryIconPath: 'images/map.png',label: 'City', command: 'lb-all'}]
		             });
}




LeaderboardAssistant.prototype.deactivate = function(event) {
}

LeaderboardAssistant.prototype.cleanup = function(event) {
}
