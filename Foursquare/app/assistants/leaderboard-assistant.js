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
	    this.controller.setupWidget("WebId",
        this.attributes = {
            url:    'http://foursquare.com/mobile/leaderboard',
            minFontSize:18
            },
        this.model = {
            }
    );
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
      _globals.cmmodel);

	/* add event handlers to listen to events from widgets */
}

LeaderboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
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
                case "do-Nothing":
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
