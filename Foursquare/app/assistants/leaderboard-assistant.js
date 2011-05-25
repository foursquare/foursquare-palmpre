function LeaderboardAssistant() {
}

LeaderboardAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

LeaderboardAssistant.prototype.setup = function() {
	NavMenu.setup(this);

   	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
/*
    this.controller.setupWidget("WebId",
        this.attributes = {
            url:    'http://foursquare.com/iphone/me?uid='+_globals.uid+'&view=all&geolat='+_globals.lat+'geolong='+_globals.long+'&scope=friends',
            minFontSize:18
        },
        this.model = {
        }
    ); */
    

	this.leaderboardModel = {items: [], listTitle: $L('Info')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('leaderboard', 
					      {itemTemplate:'listtemplates/leaderboardItems'},
					      this.leaderboardModel);

	this.leaderboardTappedBound=this.leaderboardTapped.bind(this);
	Mojo.Event.listen(this.controller.get('leaderboard'),Mojo.Event.listTap, this.leaderboardTappedBound);
  	this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('userSpinner', this.spinnerAttr, this.spinnerModel);
    
	 	foursquareGet(this,{
	 		endpoint: 'users/leaderboard',
	 		requiresAuth: true,
	 		parameters: {},
	   		onSuccess: this.getLeaderboardSuccess.bind(this),
	   		onFailure: this.getLeaderboardFailed.bind(this)
	 	});

};

LeaderboardAssistant.prototype.leaderboardTapped = function(event) {
		this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,event.item.user.id,this,false);
};

LeaderboardAssistant.prototype.getLeaderboardSuccess = function(r) {
	var j=r.responseJSON.response;
	
	var lboard=j.leaderboard.items;
	
	var selfIndex=-1;
	
	for(var i=0;i<lboard.length;i++){
		var lname=(lboard[i].user.lastName)? lboard[i].user.lastName: '';
		var uname=lboard[i].user.firstName+' '+lname;
		var rankClass=(lboard[i].user.relationship=="self")? "bright": "dim";
		var id=(lboard[i].user.relationship=="self")? "self-listing": "";
		if(lboard[i].user.relationship=="self"){
			selfIndex=i;
		}
		
		lboard[i].uname=uname;
		lboard[i].rankClass=rankClass;
		lboard[i].id=id;
	}
	
	this.leaderboardModel.items=lboard;
	this.controller.modelChanged(this.leaderboardModel);
	this.controller.get("leaderboard").mojo.revealItem(selfIndex);
	
	this.controller.get("userSpinner").mojo.stop();
	this.controller.get("userSpinner").hide();

};

LeaderboardAssistant.prototype.getLeaderboardFailed = function(r) {

};

LeaderboardAssistant.prototype.activate = function(event) {


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
                case "do-Todos":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
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





LeaderboardAssistant.prototype.deactivate = function(event) {
}

LeaderboardAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('leaderboard'),Mojo.Event.listTap, this.leaderboardTappedBound);

}
