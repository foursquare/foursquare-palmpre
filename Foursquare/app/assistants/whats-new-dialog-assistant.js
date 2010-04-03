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
	Mojo.Log.error("oktapped");
	this.cookieData=new Mojo.Model.Cookie("firstrun");
	this.cookieData.put({
		version: Mojo.appInfo.version
	});
	this.widget.mojo.close();
}

