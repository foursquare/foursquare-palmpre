function FriendSearchDialogAssistant(sceneAssistant,a) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
}
FriendSearchDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  this.sceneAssistant.controller.setupWidget("searchButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.searchButtonModel = {
      buttonLabel: "Search",
      disabled: false
    }
  );
  
  this.searchTappedBound=this.searchTapped.bindAsEventListener(this);
  this.sceneAssistant.controller.setupWidget("twitterButton",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.twitterButtonModel = {
      buttonLabel: "Twitter",
      disabled: false
    }
  );
  this.twitterTappedBound=this.twitterTapped.bindAsEventListener(this);

  Mojo.Event.listen(this.sceneAssistant.controller.get('searchButton'), Mojo.Event.tap, this.searchTappedBound);
  Mojo.Event.listen(this.sceneAssistant.controller.get('twitterButton'), Mojo.Event.tap, this.twitterTappedBound);

  
  
	this.sceneAssistant.controller.setupWidget('query', this.tipAttributes = {hintText:'Name or phone...',multiline:false,focus:true}, this.tipModel = {value:'', disabled:false});

}

FriendSearchDialogAssistant.prototype.activate = function() {
	$('query').mojo.focus();
}


FriendSearchDialogAssistant.prototype.searchTapped = function() {
	var how;
  if (this.tipModel.value == parseFloat(this.tipModel.value)) {
  	//it's numeric
  	how="phone";
  }else{
  	//not numeric
  	how="name";
  }
  
	this.sceneAssistant.searchFriends(how,this.tipModel.value);
	this.sceneAssistant.controller.get("searchButton").mojo.deactivate();
	this.widget.mojo.close();
}

FriendSearchDialogAssistant.prototype.twitterTapped = function() {
	this.sceneAssistant.searchFriends("twitter");
	this.sceneAssistant.controller.get("twitterButton").mojo.deactivate();
	this.widget.mojo.close();
}




FriendSearchDialogAssistant.prototype.cancelTapped = function() {
	this.widget.mojo.close();
}

FriendSearchDialogAssistant.prototype.cleanup = function() {
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('searchButton'), Mojo.Event.tap, this.searchTappedBound);
  Mojo.Event.stopListening(this.sceneAssistant.controller.get('twitterButton'), Mojo.Event.tap, this.twitterTappedBound);

}