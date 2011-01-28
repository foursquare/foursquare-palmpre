function BadgesAssistant(p) {
	this.params=p;
}
BadgesAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

BadgesAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'badges'});

   	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
       
    this.controller.get("username").update(this.params.username.toUpperCase());
   
    this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('overlaySpinner', this.spinnerAttr, this.spinnerModel);
	this.controller.get("overlaySpinner").show();
	this.badgeTappedBound=this.badgeTapped.bindAsEventListener(this);
	this.getBadges();
};

BadgesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

BadgesAssistant.prototype.getBadges = function(){
 	foursquareGet(this,{
 		endpoint: 'users/'+this.params.id+'/badges',
 		requiresAuth: true,
 		debug:true,
 		parameters: {sort:'recent'},
   		onSuccess: this.getBadgesSuccess.bind(this),
   		onFailure: this.getBadgesFailed.bind(this)
 	});

};

BadgesAssistant.prototype.getBadgesSuccess = function(r){
	var j=r.responseJSON.response;
	if(r.responseJSON.meta.code==200){
		//get all of the groups of badges
		this.badgeGroups=j.sets.groups;
		this.badges=j.badges;
		this.menuList=[];
		for(var g=0;g<this.badgeGroups.length;g++){
			//keep track of "all badges" group
			if(this.badgeGroups[g].type=='all'){
				this.allBadgesId=g;
			}
		
			var bg={
				label: this.badgeGroups[g].name,
				command: 'change-'+g
			};
			//handle any subgroups
			if(this.badgeGroups[g].groups.length>0){
				bg.items=[];
				for(var sg=0;sg<this.badgeGroups[g].groups.length;sg++){
					var sub={
						label: this.badgeGroups[g].groups[sg].name,
						command: 'subchange-'+g+'-'+sg
					};
					bg.items.push(sub);
				}
			}
			this.menuList.push(bg);
		}
		
		//load all badges by default
		this.loadBadges(this.badgeGroups[this.allBadgesId]);
		
	}
};

BadgesAssistant.prototype.loadBadges = function(group){
	//yeah, i'm using a table for this. get over it.
	if(group.type=="all"){
		var name="";
	}else{
		var name=group.name.toUpperCase();
	}
	this.controller.get("badgetype").update(name);
	var html='';
	html += '<table border=0 cellspacing=0 cellpadding=2 width="100%">';
	html += '<tr><td width="25%"></td><td width="25%"></td><td width="25%"></td><td width="25%"></td></tr>';
	var id=0
	for(var b=0;b<group.items.length;b++){
		id++;
		
		if(id==1) {
			html += '<tr>';
		}
		
		//get badge:
		var badge=this.badges[group.items[b]];
		
		html+='<td valign="top" align="center" badgeid="'+badge.id+'" class="badge-cell"  x-mojo-tap-highlight="momentary"><img src="'+badge.image.prefix+badge.image.sizes[0]+badge.image.name+'" badgeid="'+badge.id+'">';
		html+='<br><span class="small-text-line" badgeid="'+badge.id+'">'+badge.name+'</span></td>';
		if(id==4) {
			html += '</tr>';
			id=0;
		}
		
	}
	html+='</table>';
	logthis(html);
	
	this.controller.get("badge-holder").update(html);
	this.controller.get("overlaySpinner").hide();
	this.controller.get("badge-holder").show();
	var td=this.controller.document.querySelectorAll(".badge-cell");
	for(var t=0;t<td.length;t++){
		Mojo.Event.listen(this.controller.get(td[t]),Mojo.Event.tap,this.badgeTappedBound);
	}
};

BadgesAssistant.prototype.getBadgesFailed = function(r){

};

BadgesAssistant.prototype.badgeTapped = function(event){
//	logthis("badge tapped");
//	logthis(event.target.readAttribute("badgeid"));
	
	this.controller.stageController.pushScene("view-badge",{badge: this.badges[event.target.readAttribute("badgeid")]});
};
/*
					this.controller.popupSubmenu({
			             onChoose:this.popupChoose,
            			 placeNear:this.controller.get('menuhere'),
			             items: [{secondaryIconPath: 'images/radar-dark.png',label: 'Nearby', command: 'nearby-venues'},
				           {secondaryIconPath: 'images/marker-icon.png',label: 'Map', command: 'venue-map'},
            	           {secondaryIconPath: 'images/search-black.png',label: 'Search', command: 'venue-search'},
                	       {secondaryIconPath: 'images/plus.png',label: 'Add Venue', command: 'venue-add'}]
		             });

*/

BadgesAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.scrollTo(0,0,true);
					break;
				case "swap-group":
					logthis("swap group");
					this.controller.popupSubmenu({
						 placeNear: this.controller.get("badge-header"),
			             onChoose:function(c){
				            //handle changes to group displayed
				            if(c!=undefined){
					            if(c.indexOf("change-")==0){
					            	var gid=c.split("-")[1];
					            	
					            	this.loadBadges(this.badgeGroups[gid]);
					            }
					            
					            if(c.indexOf("subchange-")==0){
					            	logthis("command="+c);
					            	var gid=c.split("-")[1];
					            	var sgid=c.split("-")[2];
					            	logthis("gid="+gid+", sgid="+sgid);
					            	
					            	this.loadBadges(this.badgeGroups[gid].groups[sgid]);
					            }
							}			             
			             }.bind(this),
			             items: this.menuList
		             });
					break;					
            }
            var scenes=this.controller.stageController.getScenes();
            
            
            
            
        }else if(event.type===Mojo.Event.back && this.inOverview==false) {
        	logthis("back");
			event.preventDefault();
			event.stopPropagation();
			event.stop();
	        this.showOverview();
	    }
};

BadgesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BadgesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
