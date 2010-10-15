function WhatsNewDialogAssistant(sceneAssistant) {
  this.sceneAssistant = sceneAssistant;
}
WhatsNewDialogAssistant.prototype.setup = function(widget) {
  this.widget = widget;
  
  // Setup button and event handler
  this.sceneAssistant.controller.setupWidget("tipokButton",
    this.attributes = {type : Mojo.Widget.Button},
    this.OKButtonModel = {
      buttonLabel: "Okay",
      disabled: false
    }
  );
  Mojo.Event.listen(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTapped.bindAsEventListener(this));

}

WhatsNewDialogAssistant.prototype.activate = function() {
}


WhatsNewDialogAssistant.prototype.tipokTapped = function() {
	logthis("oktapped");
	this.cookieData=new Mojo.Model.Cookie("firstrun");
	this.cookieData.put({
		version: Mojo.appInfo.version
	});
	this.widget.mojo.close();
}

WhatsNewDialogAssistant.prototype.cleanup = function() {
		Mojo.Controller.getAppController().showBanner("To search, just start typing!", {source: 'notification'});
		  Mojo.Event.stopListening(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTapped.bindAsEventListener(this));
}