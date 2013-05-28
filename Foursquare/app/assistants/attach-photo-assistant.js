function AttachPhotoAssistant(params) {
	this.params=params;
}

AttachPhotoAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});
	
  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	//var pings=(credentials.swf=="on")? '1': '0';
	var pings=_globals.swf;
	this.stt=(_globals.settings.sendToTwitter==true)? '1': '0';
	this.stf=(_globals.settings.sendToFacebook==true || _globals.settings.sendToFacebook=='true')? '1': '0';


	this.controller.setupWidget("okButton",
		this.attributes = {type : Mojo.Widget.activityButton},
		this.OKButtonModel = {
			buttonLabel: "Upload",
			disabled: false
		}
	);
	
	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("checkin-widgets").style.minHeight="247px;";
	}
	else{
	   this.controller.get("checkin-widgets").style.minHeight="327px"; //372
	}
	
	if(this.stf=="1"){
		this.controller.get('share-facebook').addClassName("pressed");
	}

	this.fbShareBound=function(){
		//logthis("before: stf: %i, stt: %i",this.stf,this.stt);
		if(this.stf=="1"){
			this.stf="0";
			this.controller.get('share-facebook').removeClassName("pressed");
		}else{
			this.stf="1";
			this.controller.get('share-facebook').addClassName("pressed");
		}
		//logthis("after: stf: %i, stt: %i",this.stf,this.stt);
	}.bindAsEventListener(this);


	if(this.stt=="1"){
		this.controller.get('share-twitter').addClassName("pressed");
	}

	this.twShareBound=function(){
		//Mojo.Log.error("before: stf: %i, stt: %i",this.stf,this.stt);
		if(this.controller.get('share-twitter').hasClassName("pressed")){
			this.stt="0";
			this.controller.get('share-twitter').removeClassName("pressed");
		}else{
			this.stt="1";
			this.controller.get('share-twitter').addClassName("pressed");		
		}
		//Mojo.Log.error("after: stf: %i, stt: %i",this.stf,this.stt);
	}.bindAsEventListener(this);


	var display='';
	var disclaimer='';
	switch(this.params.type){
		case "venue":
			display="<b>"+this.params.item.name+"</b><br/>"+this.params.item.location.address;
			disclaimer='Photos uploaded to a venue will be public and viewable by any foursquare user or anyone who visits the foursquare website.';
			break;
		case "tip":
			break;
		case "checkin":
			this.controller.get("share-fields").show();
			break;
	}
	this.controller.get("checkin-info").update(display);
	this.controller.get("disclaimer").update(disclaimer);

	this.okTappedBound=this.okTapped.bindAsEventListener(this);
	this.addPhotoBound=this.addPhoto.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('share-facebook'), Mojo.Event.tap, this.fbShareBound);
	Mojo.Event.listen(this.controller.get('share-twitter'), Mojo.Event.tap, this.twShareBound);	
	Mojo.Event.listen(this.controller.get('okButton'), Mojo.Event.tap, this.okTappedBound);
	Mojo.Event.listen(this.controller.get('add-photo'), Mojo.Event.tap, this.addPhotoBound);

};


AttachPhotoAssistant.prototype.okTapped = function(event){
	var params=[];
	switch(this.params.type){
		case "venue":
			params.push({"key":"venueId","data":this.params.item.id,"contentType":"text/plain"});	
			break;
		case "tip":
			break;
		case "checkin":
			break;
	}
	params.push({"key":"ll","data":_globals.lat+","+_globals.long,"contentType":"text/plain"});
	params.push({"key":"llAcc","data":_globals.hacc,"contentType":"text/plain"});
	params.push({"key":"alt","data":_globals.altitude,"contentType":"text/plain"});
	params.push({"key":"altAcc","data":_globals.vacc,"contentType":"text/plain"});
	params.push({"key":"oauth_token","data":_globals.token,"contentType":"text/plain"});
	
	var broadcast='';
	if(this.stt=="1" && this.stf=="1"){
		broadcast="twitter,facebook";
	}else if(this.stt=="1" && this.stf=="0"){
		broadcast="twitter";
	}else if(this.stt=="0" && this.stf=="1"){
		broadcast="facebook";
	}
	params.push({"key":"broadcast","data":broadcast,"contentType":"text/plain"});
	
    var appController = Mojo.Controller.getAppController();
	  	var cardStageController = appController.getStageController("mainStage");
	var controller = cardStageController.activeScene();
    // Queue the upload request with the download manager service.
    controller.serviceRequest('palm://com.palm.downloadmanager/', {
		method: 'upload',
        parameters: {
		    'url': "https://api.foursquare.com/v2/photos/add",
            'fileLabel': 'photo',
		    'fileName': this.fileName,
            'postParameters': params,
		    'subscribe': true
        },
		onSuccess: function (resp,j){
		 	var r=resp.responseString;
		 	if(r) {
				logthis(r);
				var j=eval("("+r+")");
				
				if(j.meta.code=="200" || j.meta.code==200){ //successful upload
					Mojo.Controller.getAppController().showBanner("Photo uploaded!", {source: 'notification'});
					this.controller.get("okButton").mojo.deactivate();
					this.controller.stageController.popScene({action:'reload-photos'});
				}else{
					Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
					this.controller.get("okButton").mojo.deactivate();
				}
		 	}
	  	}.bind(this),
        onFailure: function (e){
				Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
				this.controller.get("okButton").mojo.deactivate();
				logthis('Failure : ' + Object.toJSON(e));
	 	}.bind(this)
    });

};

AttachPhotoAssistant.prototype.addPhoto = function(event){
	Mojo.FilePicker.pickFile({'actionName':'Select','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
		var icon="/var/luna/data/extractfs"+encodeURIComponent(fn.fullPath)+":0:0:128:128:2"
		this.fileName=fn.fullPath;
		
		this.controller.get("add-photo").removeClassName("nophoto");
		this.controller.get("add-photo").addClassName("hasphoto");
		
		this.controller.get("add-photo").style.background="url("+icon+") no-repeat left top";
		
	}.bind(this)},this.controller.stageController);


};

AttachPhotoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

AttachPhotoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AttachPhotoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
