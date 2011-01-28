function WalkthroughAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

WalkthroughAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});

	this.topicsModel = {items: [], listTitle: $L('Info')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('topicList', 
					      {itemTemplate:'listtemplates/infoItems'},
					      this.topicsModel);

    this.controller.setupWidget("userSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });


	var url = 'http://zhephree.com/foursquare/walkthrough.php';
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   parameters: {action: "list"},
	   onSuccess: function(r){
	   		var j=r.responseJSON;
	   		/*for(var t=0;t<j.length;t++){
	   			
	   		}*/
	   		
	   		this.topicsModel.items=j;
	   		this.controller.modelChanged(this.topicsModel);
			this.controller.get("userSpinner").mojo.stop();
			this.controller.get("userSpinner").hide();
	   		
	   }.bind(this),
	   onFailure: function(r){
	   			this.controller.showAlertDialog({
				    onChoose: function(value) {this.controller.stageController.popScene();},
				    title: $L("Error!"),
				    message: $L("There was an error grabbing the topic list. Please try again."),
				    choices:[
				        {label:$L("D'oh!"), value:"med"}
				    ]
				}); 	   
	   
	   }.bind(this)
	 });

	this.listTappedBound=this.listTapped.bind(this);
	Mojo.Event.listen(this.controller.get("topicList"),Mojo.Event.listTap,this.listTappedBound);
};

WalkthroughAssistant.prototype.listTapped = function(event) {
	this.controller.stageController.pushScene({name:"view-walkthrough",transition:Mojo.Transition.zoomFade},event.item);
};

WalkthroughAssistant.prototype.activate = function(event) {

};

WalkthroughAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

WalkthroughAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("topicList"),Mojo.Event.listTap,this.listTappedBound);
};
