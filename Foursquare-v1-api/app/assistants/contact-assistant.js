function ContactAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ContactAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});

    this.controller.setupWidget("sendMessage",
         this.attributes = {
         	type: Mojo.Widget.activityButton
             },
         this.model = {
             label : "Send Message",
             disabled: false
         }
     );
     
     this.controller.setupWidget("name",
        this.attributes = {
            hintText: $L("Enter your name"),
            multiline: false,
            enterSubmits: false,
            focus: true
         },
         this.nameModel = {
             value: "",
             disabled: false
         }
    ); 

     this.controller.setupWidget("email",
        this.attributes = {
            hintText: $L("Enter your e-mail address"),
            multiline: false,
            enterSubmits: false,
            focus: false,
            textCase: Mojo.Widget.steModeLowerCase
         },
         this.emailModel = {
             value: "",
             disabled: false
         }
    ); 

     this.controller.setupWidget("message",
        this.attributes = {
            hintText: $L("Enter a question or bug report"),
            multiline: true,
            enterSubmits: false,
            focus: false
         },
         this.messageModel = {
             value: "",
             disabled: false
         }
    ); 
    
    this.sendMessageBound=this.sendMessage.bind(this);
    
    Mojo.Event.listen(this.controller.get("sendMessage"), Mojo.Event.tap, this.sendMessageBound);

};

ContactAssistant.prototype.sendMessage = function(event) {
	var url = 'http://zhephree.com/mail/mail1.php';
	var request = new Ajax.Request(url, {
	   method: 'post',
	   evalJSON: 'force',
	   parameters: {name: this.nameModel.value, 
	   	from:this.emailModel.value, 
	   	message: this.messageModel.value,
	   	version: Mojo.appInfo.version,
	   	os: Mojo.Environment.build+" v"+Mojo.Environment.DeviceInfo.platformVersion,
	   	resolution: Mojo.Environment.DeviceInfo.screenWidth + " x " + Mojo.Environment.DeviceInfo.screenHeight,
	   	device: Mojo.Environment.DeviceInfo.modelNameAscii,
	   	carrier: Mojo.Environment.DeviceInfo.carrierName,
	   	locale: Mojo.Locale.getCurrentLocale()
	   	},
	   onSuccess: function(r){
	   		if(r.responseText=="[OK]"){
	   			this.controller.showAlertDialog({
				    onChoose: function(value) {this.controller.stageController.popScene();},
				    title: $L("Message Sent!"),
				    message: $L("Your message has been sent to the developer, Zhephree. You'll receive a response soon."),
				    choices:[
				        {label:$L("OK"), value:"med"}
				    ]
				}); 
	   		}else{
	   			this.controller.showAlertDialog({
				    onChoose: function(value) {this.controller.stageController.popScene();},
				    title: $L("Error!"),
				    message: $L("Your message has could not be sent. Please try again."),
				    choices:[
				        {label:$L("OK"), value:"med"}
				    ]
				}); 	   	   		
	   		}
	   }.bind(this),
	   onFailure: function(r){
	   			this.controller.showAlertDialog({
				    onChoose: function(value) {this.controller.stageController.popScene();},
				    title: $L("Error!"),
				    message: $L("Your message has could not be sent. Please try again."),
				    choices:[
				        {label:$L("OK"), value:"med"}
				    ]
				}); 	   
	   
	   }.bind(this)
	 });

};

ContactAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ContactAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ContactAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get("sendMessage"), Mojo.Event.tap, this.sendMessageBound);
};
