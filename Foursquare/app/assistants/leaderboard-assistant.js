function LeaderboardAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

LeaderboardAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	/*    this.controller.setupWidget("WebId",
        this.attributes = {
            url:    'http://foursquare.com/mobile/leaderboard',
            minFontSize:18
            },
        this.model = {
            }
    );*/
    	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
      _globals.cmmodel);


    this.controller.setupWidget(Mojo.Menu.viewMenu,
        this.menuAttributes = {
           spacerHeight: 0,
           menuClass: 'blue-view'
        },
        this.menuModel = {
            visible: true,
            items: [ {
                items: [
                { iconPath: 'images/friends_button_single.png', command: 'lb-friends', label: "  "},
                { label: "Leaderboard", width: 200},
                { iconPath: 'images/venue_button_single.png', command: 'lb-all', label: "  "}]
            }]
        });

	/* add event handlers to listen to events from widgets */
}

LeaderboardAssistant.prototype.activate = function(event) {
	/* OK, we're gonna do a for real leaderboard. I considered a webview, but that'll look assy.
		So instead, we'll download the HTML of the special URL and the parse the hell out of the response.
		Mmmmm.... parsing text... */
	
	//step one, get the HTML. let's start by displaying the friends leaderboard.
	var url = 'http://foursquare.com/iphone/me?uid='+_globals.uid+'&view=mini&geolat='+_globals.lat+'geolong='+_globals.long+'&scope=friends';
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
	this.friendBoard=(this.friendBoard.indexOf("<tr>")>-1)? this.friendBoard: "None of your friends have checked-in in "+_globals.city+" yet!";
		
	$("leaderboard").innerHTML=this.friendBoard; 
	
	
	
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
}

LeaderboardAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
                	break;
                case "do-Nothing":
                	break;
                case "lb-all":
                	$("leaderboard").innerHTML=this.cityBoard;
                	$$("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
                case "lb-friends":
                	$("leaderboard").innerHTML=this.friendBoard;
                	$$("#leaderboard td:nth-of-type(2)").addClassName("truncate");
                	break;
            }
        }
    }

LeaderboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

LeaderboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
