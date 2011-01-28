function ExhibitionAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ExhibitionAssistant.prototype.setup = function() {

};
	


ExhibitionAssistant.prototype.activate = function(event) {
	this.controller.get('scene').style.backgroundColor = "black";
	this.controller.get('scene').style.color = "white";
};

