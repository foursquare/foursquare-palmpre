function DashboardAssistant(feedlist) {
    this.list = feedlist;
   // this.index = selectedFeedIndex;
   logthis("item 0="+Object.toJSON(this.list[0]));
   var lname=(this.list[0].user.lastname)? this.list[0].user.lastname: "";
    this.title = this.list[0].user.firstname + " " + lname;
    logthis("this.title="+this.title);
    if(this.list[0].venue != undefined){ //normal checkin
    	this.message="@ " + this.list[0].venue.name;
    }else if(this.list[0].shout!=undefined){ //just a shout
    	this.message='"'+this.list[0].shout+'"';
    }else{ //private checkin [off the grid]
    	this.message="Checked-in somewhere";
    }
    logthis("this.message="+this.message);
    this.count = this.list.length;
    
	this.autoclose=new Mojo.Model.Cookie("autoclose");
	var un=this.autoclose.get();
	_globals.autoclose=(un)? un.autoclose: "never";

}
 
DashboardAssistant.prototype.setup = function() {
	_globals.hasDashboard=true;
	this.controller.document.body.style="background-color: #000;";
    this.displayDashboard(this.title, this.message, this.count);
    this.switchHandler = this.launchMain.bindAsEventListener(this);
    this.controller.listen("dashboardinfo", Mojo.Event.tap, this.switchHandler);
    
    this.stageDocument = this.controller.stageController.document;
    this.activateStageHandler = this.activateStage.bindAsEventListener(this);
    Mojo.Event.listen(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
    this.deactivateStageHandler = this.deactivateStage.bindAsEventListener(this);
    Mojo.Event.listen(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);
        
    if(_globals.autoclose && _globals.autoclose!="never"){
	    this.controller.window.setTimeout(function(){
	    	this.controller.window.close();
	    }.bind(this),_globals.autoclose);
    }
};
 
DashboardAssistant.prototype.cleanup = function() {
    // Release event listeners
    _globals.hasDashboard=false;
    this.controller.stopListening("dashboardinfo", Mojo.Event.tap, this.switchHandler);
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);
};
 
DashboardAssistant.prototype.activateStage = function() {
    logthis("Dashboard stage Activation");
    this.storyIndex = 0;
    this.showStory();
};
 
DashboardAssistant.prototype.deactivateStage = function() {
    logthis("Dashboard stage Deactivation");
    this.stopShowStory();
};
 
// Update scene contents, using render to insert the object into an HTML template
DashboardAssistant.prototype.displayDashboard = function(title, message, count) {
    var info = {title: title, message: message, count: count};
    var renderedInfo = Mojo.View.render({object: info, template: "dashboard/item-info"});
    var infoElement = this.controller.get("dashboardinfo");
    infoElement.update(renderedInfo);
};
 
DashboardAssistant.prototype.launchMain = function() {
    logthis("Tap to Dashboard");
    var appController = Mojo.Controller.getAppController();
    appController.assistant.handleLaunch({action: "notification"});
    this.controller.window.close();
};
 
// showStory - rotates stories shown in dashboard panel, every 3 seconds.
// Only displays unread stories
DashboardAssistant.prototype.showStory = function() {
    logthis("Dashboard Story Rotation", this.timer, this.storyIndex);
 
    this.interval = 3000;
    // If timer is null, just restart the timer and use the most recent story
    // or the last one displayed;
    if (!this.timer) {
        this.timer = this.controller.window.setInterval(this.showStory.bind(this),
            this.interval);
    }
    
    // Otherwise, get next story in list and update the story in the dashboard display.
    else {
        // replace with test for unread story
        this.storyIndex = this.storyIndex+1;
        if(this.storyIndex >= this.list.length) {
            this.storyIndex = 0;
        }
    
    	var lname=(this.list[this.storyIndex].user.lastname)? this.list[this.storyIndex].user.lastname: "";
    	this.title = this.list[this.storyIndex].user.firstname + " " + lname;
	    if(this.list[this.storyIndex].venue != undefined){ //normal checkin
    		this.message="@ " + this.list[this.storyIndex].venue.name;
	    }else if(this.list[this.storyIndex].shout!=undefined){ //just a shout
    		this.message='"'+this.list[this.storyIndex].shout+'"';
	    }else{ //private checkin [off the grid]
    		this.message="Checked-in somewhere";
	    }
        this.displayDashboard(this.title, this.message, this.count);
    }
};
 
DashboardAssistant.prototype.stopShowStory = function() {
    if (this.timer) {
        this.controller.window.clearInterval(this.timer);
        this.timer = undefined;
    }
};
 
// Update dashboard scene contents - external method
DashboardAssistant.prototype.updateDashboard = function(newitems) {
	if(newitems){
		this.list=newitems;
	}
	var lname=(this.list[0].user.lastname)? this.list[0].user.lastname: "";
    this.title = this.list[0].user.firstname + " " + lname;
    if(this.list[0].venue != undefined){ //normal checkin
    	this.message="@ " + this.list[0].venue.name;
    }else if(this.list[0].shout!=undefined){ //just a shout
    	this.message='"'+this.list[0].shout+'"';
    }else{ //private checkin [off the grid]
    	this.message="Checked-in somewhere";
    }
    this.count = this.list.length;
    this.displayDashboard(this.title, this.message, this.count);
};