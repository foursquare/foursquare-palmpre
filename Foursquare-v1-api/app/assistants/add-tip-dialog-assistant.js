function AddTipDialogAssistant(sceneAssistant,a,vid,t) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
  this.vid=vid;
  this.type=t;
}
AddTipDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("tipokButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Add",
      disabled: false
    }
  );
  this.tipokTappedBound=this.tipokTapped.bindAsEventListener(this);

  this.sceneAssistant.controller.setupWidget("cancelButton",
    this.cancelattributes = {},
    this.CancelButtonModel = {
      buttonLabel: "Nevermind",
      disabled: false
    }
  );
  
  this.cancelTappedBound=this.cancelTapped.bindAsEventListener(this);
  
  this.tipKeyPressBound=this.tipKeyPress.bindAsEventListener(this);


	Mojo.Event.listen(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTappedBound);
	Mojo.Event.listen(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTappedBound);
    Mojo.Event.listen(this.sceneAssistant.controller.document, "keyup", this.tipKeyPressBound);

  	if(this.type=="tip"){
  		var hint="Try the surf-n-turf!";
  	}else{
  		var hint="Add a note (optional)";
  	}
  
	this.sceneAssistant.controller.setupWidget('newtip', this.tipAttributes = {hintText:hint,multiline:true,focus:true},
	 		this.tipModel = {value:'', disabled:false});
	var t=(this.type=="todo")? "To-do": this.type;
	this.sceneAssistant.controller.get("addtip-title").innerHTML="Add a "+t;
}

AddTipDialogAssistant.prototype.activate = function() {
	this.sceneAssistant.controller.get('newtip').mojo.focus();
}

AddTipDialogAssistant.prototype.tipKeyPress = function(event) {
logthis("keypress");
	try{
		var charsLeft=200-this.sceneAssistant.controller.get("newtip").mojo.getValue().length;
		
		this.sceneAssistant.controller.get("charCount").innerHTML=charsLeft;
		if(charsLeft<0){
			if(!this.sceneAssistant.controller.get("charCount").hasClassName("negative")){
				this.sceneAssistant.controller.get("charCount").addClassName("negative");
			}
		}else{
			if(this.sceneAssistant.controller.get("charCount").hasClassName("negative")){
				this.sceneAssistant.controller.get("charCount").removeClassName("negative");
			}	
		}
	}catch(e){
	
	}
};


AddTipDialogAssistant.prototype.tipokTapped = function() {
logthis("oktapped");
		var params={
				vid: this.vid,
				type: this.type
			};

		if(this.tipModel.value==''){
			params.text='I want to visit this place.';
		}else{
			params.text=this.tipModel.value;
		}
			
		foursquarePost(this.sceneAssistant,{
			endpoint: 'addtip.json',
			requiresAuth: true,
			parameters: params,
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
			
		});
}

AddTipDialogAssistant.prototype.tipSuccess = function() {
	Mojo.Controller.getAppController().showBanner("Successfully added your "+this.type+"!", {source: 'notification'});
	//this.sceneAssistant.controller.get("okButton").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.tipFailed = function() {
	Mojo.Controller.getAppController().showBanner("Error adding your "+this.type, {source: 'notification'});

}
AddTipDialogAssistant.prototype.cancelTapped = function() {
	this.widget.mojo.close();
}

AddTipDialogAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTappedBound);
	Mojo.Event.stopListening(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTappedBound);
    Mojo.Event.stopListening(this.sceneAssistant.controller.document, "keyup", this.tipKeyPressBound);

}
