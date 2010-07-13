function PhotosAssistant(v) {
	this.venue=v;
}

PhotosAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		NavMenu.setup(this,{buttons:'empty'});
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	    this.controller.setupWidget("flickrSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
    	this.controller.setupWidget("flickrnearbySpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
	    this.controller.setupWidget("tweetphotoSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
	    this.controller.setupWidget("pikchurSpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
	    this.controller.setupWidget("buttonUpload",
        this.buttonAttributes = {
            },
        this.buttonModel = {
            label : "Upload Photo",
            disabled: false
        });

	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("buttonUpload"),Mojo.Event.tap, this.tryflickrUpload.bind(this));


	var url='http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&machine_tags=foursquare:venue="'+this.venue.id+'"&nojsoncallback=1&format=json';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.flickrSuccess.bind(this),
			onFailure: this.flickrFailed.bind(this)
	});
	
	this.flickrNearby();
	this.tweetPhoto();
	this.pikchur();



};

PhotosAssistant.prototype.activate = function(event) {

};
PhotosAssistant.prototype.flickrFailed = function(response) {
//	this.controller.get("meta-overlay").show();
	this.controller.get("flickrSpinner").mojo.stop();
	this.controller.get("flickrSpinner").hide();
	this.controller.get("flickr-content").innerHTML='No Flickr images found for this venue.';
//	this.controller.get("overlay-title").innerHTML="Photos "+this.flickrUpload;
}
PhotosAssistant.prototype.flickrnearbyFailed = function(response) {
//	this.controller.get("meta-overlay").show();
	this.controller.get("flickrnearbySpinner").mojo.stop();
	this.controller.get("flickrnearbySpinner").hide();
	this.controller.get("flickrnearby-content").innerHTML='No nearby Flickr images found for this venue.';
//	this.controller.get("overlay-title").innerHTML="Photos "+this.flickrUpload;
}
PhotosAssistant.prototype.tweetphotoFailed = function(response) {
//	this.controller.get("meta-overlay").show();
	this.controller.get("tweetphotoSpinner").mojo.stop();
	this.controller.get("tweetphotoSpinner").hide();
	this.controller.get("tweetphoto-content").innerHTML='No TweetPhoto images found for this venue.';
//	this.controller.get("overlay-title").innerHTML="Photos "+this.flickrUpload;
}
PhotosAssistant.prototype.pikchurFailed = function(response) {
//	this.controller.get("meta-overlay").show();
	this.controller.get("pikchurSpinner").mojo.stop();
	this.controller.get("pikchurSpinner").hide();
	this.controller.get("pikchur-content").innerHTML='No Pikchur images found for this venue.';
//	this.controller.get("overlay-title").innerHTML="Photos "+this.flickrUpload;
}

PhotosAssistant.prototype.flickrSuccess = function(response) {
	var j=eval("("+response.responseText+")");
//	this.controller.get("overlay-title").innerHTML='Photos '+this.flickrUpload;

	if(j.photos!=undefined && j.photos.photo.length!=0) {
		//this.controller.get("meta-overlay").show();

		var html=this.controller.get("flickr-content");
		this.controller.get("flickrSpinner").mojo.stop();
		this.controller.get("flickrSpinner").hide();
		for(var i=0;i<j.photos.photo.length;i++) {
			var id=j.photos.photo[i].id;
			var secret=j.photos.photo[i].secret;
			var server=j.photos.photo[i].server;
			var farm=j.photos.photo[i].farm;
			var userid=j.photos.photo[i].owner;
			var url='http://farm'+farm+'.static.flickr.com/'+server+'/'+id+'_'+secret+'_s.jpg';
			var link='http://www.flickr.com/photos/'+userid+'/'+id;

			html.update(html.innerHTML+'<img src="'+url+'" id="flickr'+i+'" class="flickr-pic" width="80" link="'+link+'"/> ');
		}

		this.flickr_len=j.photos.photo.length;
		for(var i=0;i<j.photos.photo.length;i++) {
			Mojo.Event.listen(this.controller.get("flickr"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
		}
		html.show();

	}else{
		this.flickrFailed();
	}

}

PhotosAssistant.prototype.flickrNearby = function() {
//	this.controller.get("meta-overlay").show();
//	this.controller.get("overlaySpinner").mojo.start();
//	this.controller.get("overlaySpinner").show();

	var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+_globals.flickr_key+'&lat='+_globals.lat+'&lon='+_globals.long+'&radius=5&radius_units=km&nojsoncallback=1&format=json';
	var requester = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.flickrNearbySuccess.bind(this),
			onFailure: this.flickrnearbyFailed.bind(this)
	});
}

PhotosAssistant.prototype.flickrNearbySuccess = function(response) {
	var j=eval("("+response.responseText+")");

	if(j.photos!=undefined && j.photos.photo.length>0) {
		if(j.photos.total=="0"){this.flickrFailed(response);}
		this.controller.get("flickrnearbySpinner").mojo.stop();
		this.controller.get("flickrnearbySpinner").hide();

		var html=this.controller.get("flickrnearby-content");
		//html.update(html.innerHTML+"<br/>Flickr (Nearby)<br/>");
		for(var i=0;i<j.photos.photo.length;i++) {
			var id=j.photos.photo[i].id;
			var secret=j.photos.photo[i].secret;
			var server=j.photos.photo[i].server;
			var farm=j.photos.photo[i].farm;
			var userid=j.photos.photo[i].owner;
			var url='http://farm'+farm+'.static.flickr.com/'+server+'/'+id+'_'+secret+'_s.jpg';
			var link='http://www.flickr.com/photos/'+userid+'/'+id;

			html.update(html.innerHTML+'<img src="'+url+'" id="flickrnearby'+i+'" class="flickr-pic" width="80" link="'+link+'"/> ');
		}

		this.flickrn_len=j.photos.photo.length;
		for(var i=0;i<j.photos.photo.length;i++) {
			Mojo.Event.listen(this.controller.get("flickrnearby"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
		}
		html.show();
	}else{
		this.flickrnearbyFailed(response);
	}
}

PhotosAssistant.prototype.tweetPhoto = function() {
	//this.controller.get("meta-overlay").show();

	var url = 'http://tweetphotoapi.com/api/tpapi.svc/json/photos/byvenue?vid='+this.venue.id;
	var requester = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.tweetPhotoSuccess.bind(this),
			onFailure: this.tweetphotoFailed.bind(this)
	});

}


PhotosAssistant.prototype.tweetPhotoSuccess = function(r) {
	var j=r.responseJSON;
	if(j) {
		if(j.Count!=undefined && j.Count!=0) {
			var pics=j.List;
			if(pics){
				this.controller.get("tweetphotoSpinner").mojo.stop();
				this.controller.get("tweetphotoSpinner").hide();
				var html=this.controller.get("tweetphoto-content");
				//html.update(html.innerHTML+"<br/>TweetPhoto<br/>");
				for(var p=0;p<pics.length;p++){
					var tn=pics[p].ThumbnailUrl;
					var url=pics[p].DetailsUrl;
					html.update(html.innerHTML+'<img src="'+tn+'" id="tweetphoto'+p+'" class="flickr-pic" width="80" link="'+url+'"/> ');
				}
			
				this.tp_len=pics.length;
				for(var p=0;p<pics.length;p++){
					Mojo.Event.listen(this.controller.get("tweetphoto"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
				}
			}
			html.show();
			
		}
	}else{
		this.tweetphotoFailed();
	}
	
}


PhotosAssistant.prototype.pikchur = function() {
	//this.controller.get("meta-overlay").show();

	var url = 'http://api.pikchur.com/geosocial/venue/json';
	var requester = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			parameters: {venue_id: this.venue.id, api_key: "QTG1n51CVNEJNDkkiMQIXQ", service:"foursquare"},
			onSuccess: this.pikchurSuccess.bind(this),
			onFailure: this.pikchurFailed.bind(this)
	});
}


PhotosAssistant.prototype.pikchurSuccess = function(r) {
	var j=eval("(" + r.responseText + ")");
	if(j) {
			var pics=j.feed;
		
			var html=this.controller.get("pikchur-content");
			this.controller.get("pikchurSpinner").mojo.stop();
			this.controller.get("pikchurSpinner").hide();
			//html.update(html.innerHTML+"<br/>Pikchur<br/>");
			for(var p=0;p<pics.length;p++){
				
				var img_base="http://img.pikchur.com/"; //http://img.pikchur.com/pic_lYd_t.jpg
				var typ=pics[p].media.type;
				var tn=img_base + typ + "_" + pics[p].media.short_code + "_t.jpg";
				
				var url="http://pk.gd/"+pics[p].media.short_code;
				html.update(html.innerHTML+'<img src="'+tn+'" id="pikchur'+p+'" class="flickr-pic" width="80" link="'+url+'"/> ');
			}
			
			this.pikchur_len=pics.length;
			for(var p=0;p<pics.length;p++){
				Mojo.Event.listen(this.controller.get("pikchur"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
			}
			html.show();
			
	}else{
		this.pikchurFailed();
	}
	
}
PhotosAssistant.prototype.handleFlickrTap = function(event) {
	var url=event.target.getAttribute("link");
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
	    method: 'open',
	    parameters: {
			target: url
		}
	});
}
PhotosAssistant.prototype.tryflickrUpload = function(event) {
	//gotta get the file:
			this.controller.stageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,this.venue.id,this.venue.name,null,this.imgfileName);

}

PhotosAssistant.prototype.doUpload = function(event) {
	var fn=event.fullPath;
	var appController = Mojo.Controller.getAppController();
  	var cardStageController = appController.getStageController("mainStage");
	cardStageController.pushScene({name: "flickr-upload", transition: Mojo.Transition.crossFade},this,fn,this.venue.id);
}


PhotosAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

PhotosAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */


	Mojo.Event.stopListening(this.controller.get("buttonUpload"),Mojo.Event.tap, this.tryflickrUpload.bind(this));
	for(var p=0;p<this.pikchur_len;p++){
		Mojo.Event.stopListening(this.controller.get("pikchur"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
	}
	for(var p=0;p<this.tp_len;p++){
		Mojo.Event.stopListening(this.controller.get("tweetphoto"+p),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
	}
	for(var i=0;i<this.flickrn_len;i++) {
		Mojo.Event.stopListening(this.controller.get("flickrnearby"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
	}
	for(var i=0;i<this.flickr_len;i++) {
		Mojo.Event.stopListening(this.controller.get("flickr"+i),Mojo.Event.tap, this.handleFlickrTap.bind(this));	
	}

};
