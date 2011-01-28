function ViewBadgeAssistant(p) {
	this.params=p;
}

ViewBadgeAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});

   	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
       
       
    //place badge content
    this.controller.get("badge-name").update(this.params.badge.name.toUpperCase()+' BADGE');
    this.controller.get("badge-name-big").update(this.params.badge.name);
    this.controller.get("badge-image").src=this.params.badge.image.prefix+this.params.badge.image.sizes[2]+this.params.badge.image.name;
    if(this.params.badge.description){
    	var d=this.params.badge.description;
    }else{
	    var d=this.params.badge.hint;
    }
    this.controller.get("badge-description").update(d);
    
    if(this.params.badge.unlocks.length>0){
    	var c=this.params.badge.unlocks[0].checkins[0];
    	logthis(Object.toJSON(this.params.badge));
    	logthis(Object.toJSON(c));
    	
    	if(c.type=="checkin"){
	    	var v='at <span class="fakelink" id="venuelink" venue="'+c.venue.id+'">'+c.venue.name+'</span>';
	    }else{
	    	var v='';
	    }
    	var ca=new Date(c.createdAt*1000);
    	var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    	
    	var mins=(ca.getMinutes()<10)? "0"+ca.getMinutes(): ca.getMinutes();
    	var hours=(ca.getHours()<10)? "0"+ca.getHours(): ca.getHours();
    	
    	var t=hours+':'+mins;
    	var d=months[ca.getMonth()]+' '+ca.getDate()+', '+(ca.getYear()+1900);
    	
    	this.controller.get("badge-unlock").update('Unlocked '+v+' at '+t+' on '+d);
    }
    this.controller.get("badge-holder").show();
    this.venueTappedBound=this.venueTapped.bind(this);
    this.loaded=false;
};

ViewBadgeAssistant.prototype.venueTapped = function(event) {
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},this.params.badge.unlocks[0].checkins[0].venue,_globals.username,_globals.password,_globals.uid,true);

};
ViewBadgeAssistant.prototype.activate = function(event) {
	if(!this.loaded){
		this.loaded=true;
	    Mojo.Event.listen(this.controller.get("venuelink"),Mojo.Event.tap,this.venueTappedBound);
	}
};

ViewBadgeAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewBadgeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
