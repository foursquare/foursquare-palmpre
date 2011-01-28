function ViewPhotoAssistant(p) {
	this.params=p;
	this.centerIndex=parseInt(this.params.index);
	this.endindex = this.params.array.length - 1;
	this.firstLoad=true;
}

ViewPhotoAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.stageController.setWindowOrientation('free');

    this.controller.setupWidget("imageViewer",
        this.attributes = {
            noExtractFS: true
        },
        this.model = {
            onLeftFunction: function() { this.updateImages(-1); }.bind(this),
            onRightFunction: function() { this.updateImages(1); }.bind(this)
        }
    ); 

    this.viewer=this.controller.get("imageViewer");
	this.infoTimer={};
	this.controller.listen(this.controller.document, 'orientationchange', this.handleOrientation.bindAsEventListener(this));    
	
	this.photoTappedBound=this.photoTapped.bind(this);
	Mojo.Event.listen(this.viewer,Mojo.Event.tap,this.photoTappedBound);

	this.flagTappedBound=this.flagTapped.bind(this);
	Mojo.Event.listen(this.controller.get("photo-flag"),Mojo.Event.tap,this.flagTappedBound);
};

ViewPhotoAssistant.prototype.handleOrientation = function(event){
	switch(event.position){
		case 2:
		case 3:
			this.viewer.mojo.manualSize(Mojo.Environment.DeviceInfo.screenWidth, Mojo.Environment.DeviceInfo.screenHeight);		
			break;
		case 4:
		case 5:
			this.viewer.mojo.manualSize(Mojo.Environment.DeviceInfo.screenHeight, Mojo.Environment.DeviceInfo.screenWidth);		
			break;
	}
};

ViewPhotoAssistant.prototype.photoTapped = function(event){
   this.showInfo(this.params.array[this.centerIndex]);
};

ViewPhotoAssistant.prototype.flagTapped = function(event){
	var pid=this.params.array[this.centerIndex].id;
    this.controller.popupSubmenu({
        items: [{label: $L('Spam / Scam'), command: 'spam_scam', icon: 'status-available-dark'},
            {label: $L('Nudity'), command: 'nudity'},
            {label: $L('Hate / Violence'), command: 'hate_violence'},
            {label: $L('Illegal'), command: 'illegal'},
            {label: $L('Unrelated'), command: 'unrelated'}
        ],
        onChoose: function(arg) {
			//this.controller.get("overlaySpinner").show();
			if(arg!==undefined){
				foursquarePost(this,{
					endpoint: 'photos/'+pid+'/flag',
					parameters: {problem:arg},
					requiresAuth: true,
					debug: true,
					onSuccess: function(r){
						//this.controller.get("overlaySpinner").hide();
						if(r.responseJSON.meta.code==200 || r.responseJSON.meta.code=="200"){
							Mojo.Controller.getAppController().showBanner("Photo flagged!", {source: 'notification'});
						}else{
							Mojo.Controller.getAppController().showBanner("Error flagging photo!", {source: 'notification'});
						}
					}.bind(this),
					onFailure: function(r){
						//this.controller.get("overlaySpinner").hide();
						Mojo.Controller.getAppController().showBanner("Error flagging photo!", {source: 'notification'});
					}.bind(this)
				});
			}else{
				//this.controller.get("overlaySpinner").hide();			
			}
        }.bind(this)
    });

};

ViewPhotoAssistant.prototype.activate = function(event) {
	if(this.firstLoad){
		this.firstLoad=false;
		this.updateImages(0);
	}
			this.viewer.mojo.manualSize(Mojo.Environment.DeviceInfo.screenWidth, Mojo.Environment.DeviceInfo.screenHeight);		


};

ViewPhotoAssistant.prototype.showInfo = function(photo){
logthis("showing info...");
	clearTimeout(this.infoTimer);
	var pi=this.controller.get("photo-info");
	pi.show();
	if(photo.hideFlag!=true){this.controller.get("photo-flag").show();}
	else{this.controller.get("photo-flag").hide();}
	
	if(photo.user){
		var fn=photo.user.firstName;
		var ln=(photo.user.lastName)? ' '+photo.user.lastName: '';
		var username="from "+fn+ln;
	}else{
		var username='';
	}
	
	if(photo.createdAt){
		var now = new Date;
		var later = new Date(photo.createdAt*1000);
		var offset = later.getTime() - now.getTime();
		var when=this.relativeTime(offset) + " ago";	
	}else{
		var when='';
	}
	//find the source
	if(photo.source !=undefined){
		var sourceName=photo.source.name;
		var sourceURL=photo.source.url;
		
		var source='via <a href="'+sourceURL+'" class="source-link">'+sourceName+'</a>';
	}else{
		var source='';
	}
	
	pi.update(username+' '+source+' '+when);
	
	this.infoTimer=setTimeout(function(){this.controller.get("photo-info").hide();this.controller.get("photo-flag").hide();}.bind(this),3000);
};

ViewPhotoAssistant.prototype.relativeTime = function(offset){
	// got this from: http://github.com/trek/thoughtbox/blob/master/js_relative_dates/src/relative_date.js
    var distanceInMinutes = (offset.abs() / 60000).round();
    if (distanceInMinutes == 0) { return 'less than a minute'; }
    else if ($R(0,1).include(distanceInMinutes)) { return 'about a minute'; }
    else if ($R(2,44).include(distanceInMinutes)) { return distanceInMinutes + ' minutes';}
    else if ($R(45,89).include(distanceInMinutes)) { return 'about 1 hour';}
    else if ($R(90,1439).include(distanceInMinutes)) { return 'about ' + (distanceInMinutes / 60).round() + ' hours'; }
    else if ($R(1440,2879).include(distanceInMinutes)) {return '1 day'; }
    else if ($R(2880,43199).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 1440).round() + ' days'; }
    else if ($R( 43200,86399).include(distanceInMinutes)) {return 'about a month' }
    else if ($R(86400,525599).include(distanceInMinutes)) {return 'about ' + (distanceInMinutes / 43200).round() + ' months'; }
    else if ($R(525600,1051199).include(distanceInMinutes)) {return 'about a year';}
    else return 'over ' + (distanceInMinutes / 525600).round() + ' years';
  };

ViewPhotoAssistant.prototype.updateImages = function(action){
logthis("action="+action);
logthis("centerIndex="+this.centerIndex);
logthis("centerIndex+1="+this.centerIndex+1);
logthis("index="+this.params.index);
logthis("arraylen="+this.params.array.length);
for(var f=0;f<this.params.array.length;f++){
	logthis("array["+f+"]="+this.params.array[f]);
}
   switch(action) {
      
      case 0: // just setting images, no swipe to calculate
            // in this case, the app is just being loaded - so the center image
            // is the first of the array and the left is non-existent (wrapping disabled for now)
            if(this.centerIndex==0){
            	this.viewer.mojo.leftUrlProvided();
            	logthis("no left");
            }else{
            	this.viewer.mojo.leftUrlProvided(this.params.array[this.centerIndex-1].url);
            }
            this.viewer.mojo.centerUrlProvided(this.params.array[this.centerIndex].url);
            this.showInfo(this.params.array[this.centerIndex]);
            if(this.centerIndex==this.endindex){
            	this.viewer.mojo.rightUrlProvided();
            	logthis("no right");
            }else{
            	if(this.params.array[this.centerIndex+1]){
	            	logthis("has right: "+this.params.array[this.centerIndex+1].url);
		            this.viewer.mojo.rightUrlProvided(this.params.array[this.centerIndex+1].url);
		        }
	        }
      break;
      
      case 1: // swiped to the left, so adding 1 to the indexes - wrapping has been disabled for now
      
            // if the center image isn't the last one, increment the index and update images
            if (this.centerIndex != this.endIndex) {
                  this.centerIndex++;
                  this.viewer.mojo.leftUrlProvided(this.params.array[this.centerIndex-1].url);
                  this.viewer.mojo.centerUrlProvided(this.params.array[this.centerIndex].url);
		          this.showInfo(this.params.array[this.centerIndex]);
                  // if the center image is still not the last one, update the right image
                  if (this.centerIndex != this.endindex) {
                     this.viewer.mojo.rightUrlProvided(this.params.array[this.centerIndex+1].url);
                  }
                  // otherwise, there is no right image
                  else {
                     this.viewer.mojo.rightUrlProvided();
                  }
            }
            // otherwise, do nothing, for now
            else {}
      break;
      
      case -1: // swiped to the right, so subtracting 1 from the indexes - wrapping has been disabled for now
      
            // if the center image isn't the first one, decrement the index and update images
            if (this.centerIndex != 0) {
                  this.centerIndex--;
                  // if the center image still isn't the first one, update the left image
                  if (this.centerIndex != 0) {
                     this.viewer.mojo.leftUrlProvided(this.params.array[this.centerIndex-1].url);
                  }
                  // otherwise, there is no left image
                  else {
                     this.viewer.mojo.leftUrlProvided();
                  }
                  this.viewer.mojo.centerUrlProvided(this.params.array[this.centerIndex].url);
		          this.showInfo(this.params.array[this.centerIndex]);
                  this.viewer.mojo.rightUrlProvided(this.params.array[this.centerIndex+1].url);
            
            }
            // otherwise, do nothing, for now
            else {}
      break;
      
   }
};

ViewPhotoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewPhotoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
