function AddTipDialogAssistant(sceneAssistant,a,vid,t,text,url,photo) {
  this.sceneAssistant = sceneAssistant;
  this.auth=a;
  this.vid=vid;
  this.type=t;
  this.text=text;
  this.url=url;
  this.photo=photo;
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
  this.photoTappedBound=this.photoTapped.bindAsEventListener(this);


	Mojo.Event.listen(this.sceneAssistant.controller.get('tipokButton'), Mojo.Event.tap, this.tipokTappedBound);
	Mojo.Event.listen(this.sceneAssistant.controller.get('cancelButton'), Mojo.Event.tap, this.cancelTappedBound);
	Mojo.Event.listen(this.sceneAssistant.controller.get('tip-photo-row'), Mojo.Event.tap, this.photoTappedBound);
    Mojo.Event.listen(this.sceneAssistant.controller.document, "keyup", this.tipKeyPressBound);

  	if(this.type=="tip"){
  		var hint="Try the surf-n-turf!";
  	}else{
  		var hint="Add a note (optional)";
  		this.sceneAssistant.controller.get("urlrow").hide();
  		this.sceneAssistant.controller.get("tip-row").removeClassName("first");
  		this.sceneAssistant.controller.get("tip-row").addClassName("single");
  	}
  
	this.sceneAssistant.controller.setupWidget('newtip', this.tipAttributes = {hintText:hint,multiline:true,focus:true},
	 		this.tipModel = {value:'', disabled:false});
	this.sceneAssistant.controller.setupWidget('tipurl', this.tipURLAttributes = {hintText:'Optional related URL',multiline:false,focus:false},
	 		this.tipURLModel = {value:'', disabled:false});
	var t=(this.type=="todo")? "To-do": this.type;
	this.sceneAssistant.controller.get("addtip-title").innerHTML="Add a "+t;
	
	
	if(this.text){
		this.tipModel.value=this.text;
		this.sceneAssistant.controller.modelChanged(this.tipModel);
	}
	if(this.url){
		this.tipURLModel.value=this.url;
		this.sceneAssistant.controller.modelChanged(this.tipURLModel);
	}
	if(this.photo){
		var icon="/var/luna/data/extractfs"+encodeURIComponent(this.photo)+":0:0:32:32:2"
		this.sceneAssistant.controller.get("the-photo").src=icon;
		this.hasPhoto=true;
		this.fileName=this.photo;
	}else{
		this.sceneAssistant.controller.get("tip-photo-row").hide();
  		this.sceneAssistant.controller.get("urlrow").addClassName("last");
  		this.hasPhoto=false;

	}
}

AddTipDialogAssistant.prototype.activate = function() {
	this.sceneAssistant.controller.get('newtip').mojo.focus();
}

AddTipDialogAssistant.prototype.photoTapped = function(event) {

};

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

/*		if(this.tipModel.value==''){
			params.text='I want to visit this place.';
		}else{
			params.text=this.tipModel.value;
		}*/
	if(this.type=="tip"){		
		var params={
				venueId: this.vid,
				text: this.tipModel.value,
				url: this.tipURLModel.value
			};
		foursquarePost(this.sceneAssistant,{
			endpoint: 'tips/add',
			requiresAuth: true,
			debug:true,
			parameters: params,
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
			
		});
	}else{
		var params={
				venueId: this.vid,
				text: this.tipModel.value
			};
		foursquarePost(this.sceneAssistant,{
			endpoint: 'venues/'+this.vid+'/marktodo',
			requiresAuth: true,
			parameters: params,
			onSuccess: this.tipSuccess.bind(this),
			onFailure: this.tipFailed.bind(this)
			
		});
	
	}
}

AddTipDialogAssistant.prototype.tipSuccess = function(r) {
	Mojo.Controller.getAppController().showBanner("Successfully added your "+this.type+"!", {source: 'notification'});
	if(this.hasPhoto){
		var j=r.responseJSON;
		var tipid=j.response.tip.id;
		
		var params=[];
		params.push({"key":"tipId","data":tipid,"contentType":"text/plain"});	
		params.push({"key":"ll","data":_globals.lat+","+_globals.long,"contentType":"text/plain"});
		params.push({"key":"llAcc","data":_globals.hacc,"contentType":"text/plain"});
		params.push({"key":"alt","data":_globals.altitude,"contentType":"text/plain"});
		params.push({"key":"altAcc","data":_globals.vacc,"contentType":"text/plain"});
		params.push({"key":"oauth_token","data":_globals.token,"contentType":"text/plain"});
		
		
	    var appController = Mojo.Controller.getAppController();
		var cardStageController = appController.getStageController("mainStage");
		var controller = cardStageController.activeScene();
	    // Queue the upload request with the download manager service.
	    controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'upload',
	        parameters: {
			    'url': "https://api.foursquare.com/v2/photos/add",
	            'fileLabel': 'photo',
			    'fileName': this.photo,
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
						//this.controller.get("okButton").mojo.deactivate();
	
						this.sceneAssistant.getVenueInfo();
						this.widget.mojo.close();
					}else{
						Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
						//this.controller.get("okButton").mojo.deactivate();
	
						this.sceneAssistant.getVenueInfo();
						this.widget.mojo.close();
					}
			 	}
		  	}.bind(this),
	        onFailure: function (e){
					Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
					this.controller.get("okButton").mojo.deactivate();
					logthis('Failure : ' + Object.toJSON(e));
					this.widget.mojo.close();
		 	}.bind(this)
	    });
		
	}else{
	
		//this.sceneAssistant.controller.get("okButton").mojo.deactivate();
		this.sceneAssistant.getVenueInfo();
		this.widget.mojo.close();
	}
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
