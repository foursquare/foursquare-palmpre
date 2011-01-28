function VenuePhotosAssistant(p) {
	this.params=p;
}

VenuePhotosAssistant.prototype.setup = function() {
	if(this.params.photos.count>0){
		var photosText='';
		var photosstuff=this.params.photos;
		var photosCount=0;
		var html='';
		this.fullsizePhotos=[];
		
		logthis("nmber groups="+photosstuff.groups.length);
		for(var pg=0;pg<photosstuff.groups.length;pg++){
			var count=photosstuff.groups[pg].count;
			var name=photosstuff.groups[pg].name;
			var photosThumbs='';
			
			if(photosstuff.groups[pg].count>0){
				var header='<div class="fsq-divider">'+count+' '+name+'</div>';
							
				//create thumbnails
				for(var p=0;p<photosstuff.groups[pg].items.length;p++){
					logthis("in photo loop");
					logthis("building thumbs");
					var photo=photosstuff.groups[pg].items[p];
					logthis(Object.toJSON(photo));
					var purl=photo.sizes.items[photo.sizes.items.length-2].url; //sizes are largest to smallest in array, use medium image for thumb
					this.fullsizePhotos.push(photo);
					var index=this.fullsizePhotos.length-1;
					photosThumbs+='<img src="'+purl+'" width="80" height="80" class="friend-avatar" x-fsq-fullsize="'+photo.url+'" x-fsq-index="'+index+'"/>';
				}
				
				html+=header+'<div class="photos">'+photosThumbs+'</div><br>';
			}
			
		}
		this.controller.get("venue-photos").update(html);
		
		//attach events
		this.photoTapBound=this.photoTap.bind(this);
		var photos=this.controller.document.querySelectorAll(".friend-avatar");
		for(var p=0;p<photos.length;p++){
			Mojo.Event.listen(photos[p],Mojo.Event.tap,this.photoTapBound);
		}
	}else{
		logthis("no photos!");
	}

};

VenuePhotosAssistant.prototype.photoTap = function(event){
	logthis(Object.toJSON(this.fullsizePhotos));
	this.controller.stageController.pushScene("view-photo",{photo:event.target.readAttribute("x-fsq-fullsize"), index:event.target.readAttribute("x-fsq-index"), array:this.fullsizePhotos});
};

VenuePhotosAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

VenuePhotosAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

VenuePhotosAssistant.prototype.cleanup = function(event) {
		var photos=this.controller.document.querySelectorAll(".friend-avatar");
		for(var p=0;p<photos.length;p++){
			Mojo.Event.stopListening(photos[p],Mojo.Event.tap,this.photoTapBound);
		}
};
