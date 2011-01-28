function ViewWalkthroughAssistant(item,showSwipe) {
	this.item=item;
	this.showSwipe=showSwipe;
}

ViewWalkthroughAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});
	this.controller.setupWidget("pageScroller",
         this.scrollAttributes = {
             mode: 'horizontal-snap'
         },
         this.scrollModel = {
         });
    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
		this.cmModel={
          	visible: true,
        	items: [ 
                 { icon: "back", command: "previous", disabled:true},
                 {},
   	             { icon: "forward", command: "next"}                 
                 ]
    });
    


	this.controller.get("help-header").update(this.item.caption);
	
	
	this.controller.get("content").style.width=(this.item.pages.length*320)+"px";
	
	var html='';
	for(var p=0;p<this.item.pages.length;p++){
		html+='<div class="wt-page">'+this.item.pages[p]+'</div>';
	}
	
	this.controller.get("content").update(html);
	
	var nodelist=this.controller.document.querySelectorAll(".wt-page");
	this.elements=[];
	for(var i=0;i<nodelist.length;i++){
		this.elements.push(nodelist[i]);
	}
	this.scrollModel.snapElements={x:this.elements};
	this.controller.modelChanged(this.scrollModel);

	this.pageScrollBound=this.pageScroll.bind(this);
	Mojo.Event.listen(this.controller.get("pageScroller"), Mojo.Event.propertyChange, this.pageScrollBound);

	this.snapIndex=0;

	this.controller.get("page-number").update("1 of "+this.elements.length);
	if(this.showSwipe){
		this.controller.get("swipe-note").show();
	}
};


ViewWalkthroughAssistant.prototype.pageScroll = function(event) {
	var scroller=this.controller.getSceneScroller();
	scroller.mojo.scrollTo(0,0,true);

	this.snapIndex=event.value;
	logthis("property="+event.property+", value="+event.value);
	if(event.value==0){
		this.cmModel.items[0].disabled=true;
		this.controller.modelChanged(this.cmModel);
	}else{
		this.cmModel.items[0].disabled=false;
		this.controller.modelChanged(this.cmModel);					
	}
	if(event.value==this.elements.length-1){
		this.cmModel.items[2].disabled=true;
		this.controller.modelChanged(this.cmModel);
	}else{
		this.cmModel.items[2].disabled=false;
		this.controller.modelChanged(this.cmModel);					
	}
	var pg=this.snapIndex+1;
	this.controller.get("page-number").update(pg+" of "+this.elements.length);

};

ViewWalkthroughAssistant.prototype.handleCommand = function(event) {
	if (event.type === Mojo.Event.command) {
    	switch (event.command) {
			case "previous":
				logthis("previous. index="+this.snapIndex);
				if(this.snapIndex>0){
					logthis("is >0");
					this.snapIndex=this.snapIndex-1;
					this.controller.get("pageScroller").mojo.setSnapIndex(this.snapIndex,true);
					if(this.snapIndex==0){
						this.cmModel.items[0].disabled=true;
						this.controller.modelChanged(this.cmModel);
					}else{
						this.cmModel.items[0].disabled=false;
						this.controller.modelChanged(this.cmModel);					
					}
					if(this.snapIndex==this.elements.length-1){
						this.cmModel.items[2].disabled=true;
						this.controller.modelChanged(this.cmModel);
					}else{
						this.cmModel.items[2].disabled=false;
						this.controller.modelChanged(this.cmModel);					
					}
				}
				logthis("previous done. index="+this.snapIndex);				
				break;
			case "next":
				logthis("next. index="+this.snapIndex);
				if(this.snapIndex<this.elements.length){
					this.snapIndex=this.snapIndex+1;
					this.controller.get("pageScroller").mojo.setSnapIndex(this.snapIndex,true);
					if(this.snapIndex==this.elements.length-1){
						this.cmModel.items[2].disabled=true;
						this.controller.modelChanged(this.cmModel);
					}else{
						this.cmModel.items[2].disabled=false;
						this.controller.modelChanged(this.cmModel);					
					}
					if(this.snapIndex==0){
						this.cmModel.items[0].disabled=true;
						this.controller.modelChanged(this.cmModel);
					}else{
						this.cmModel.items[0].disabled=false;
						this.controller.modelChanged(this.cmModel);					
					}
				}
				logthis("next done. index="+this.snapIndex);
				break;
		}
		var pg=this.snapIndex+1;
		this.controller.get("page-number").update(pg+" of "+this.elements.length);

	}

};

ViewWalkthroughAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.get("pageScroller").mojo.setSnapIndex(this.snapIndex);
};

ViewWalkthroughAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewWalkthroughAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   
  	this.cookieData=new Mojo.Model.Cookie("firstrun");
	this.cookieData.put({
		version: Mojo.appInfo.version
	});

};
