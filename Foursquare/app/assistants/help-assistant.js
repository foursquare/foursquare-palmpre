function HelpAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

HelpAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});
	
	this.contactTappedBound=this.contactTapped.bind(this);
	this.walkthroughTappedBound=this.walkthroughTapped.bind(this);
	
	Mojo.Event.listen(this.controller.get("contact-button"),Mojo.Event.tap,this.contactTappedBound);
	Mojo.Event.listen(this.controller.get("walkthrough-button"),Mojo.Event.tap,this.walkthroughTappedBound);
};


HelpAssistant.prototype.contactTapped = function(event){
	this.controller.stageController.pushScene({name:"contact"});
};

HelpAssistant.prototype.walkthroughTapped = function(event){
	this.controller.stageController.pushScene({name:"walkthrough"});
};

HelpAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

HelpAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

HelpAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("contact-button"),Mojo.Event.tap,this.contactTappedBound);

};
