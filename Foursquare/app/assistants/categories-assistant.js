function CategoriesAssistant(ps) {
	this.prevScene=ps;
}

CategoriesAssistant.prototype.setup = function() {

	//generate categories. just render top level categories first for speed
	this.categoriesModel={items: [], listTitle: $L('Categories')};
	this.subitems=[];
	this.subsubitems=[];
	for(var i =0; i<_globals.categories.length; i++){
		var a={};
		a.label=$L(_globals.categories[i].nodename);
		a.id=_globals.categories[i].id;
		a.icon=_globals.categories[i].iconurl;
		a.index=i;
		a.level=0;
		this.categoriesModel.items.push(a);

		this.subitems[i]={items:[],listTitle:$L("Subcats")};
		for(var s=0;s<_globals.categories[i].categories.length;s++){
			var b={};
			b.label=$L(_globals.categories[i].categories[s].nodename);
			b.id=_globals.categories[i].categories[s].id;
			b.icon=_globals.categories[i].categories[s].iconurl;
			b.index=s;
			b.level=1;
			
			if(_globals.categories[i].categories[s].categories != undefined){
				this.subsubitems[s]={items:[],listTitle:$L("SubSubcats")};
				b.hasChildren=true;
				for(var t=0; t<_globals.categories[i].categories[s].categories.length; t++){
					var c={};
					c.label=$L(_globals.categories[i].categories[s].categories[t].nodename);
					c.id=_globals.categories[i].categories[s].categories[t].id;
					c.icon=_globals.categories[i].categories[s].categories[t].iconurl;
					c.level=2;
					c.index=t;
					c.hasChildren=false;
					this.subsubitems[s].items.push(c);
				}		
			}else{
				b.hasChildren=false;
			}
			this.subitems[i].items.push(b);
		}
	}
	this.rootItems=this.categoriesModel.items;

	this.controller.setupWidget('categories-list', 
					      {itemTemplate:'listtemplates/categories'},
					      this.categoriesModel);
	
	this.controller.setupWidget("categoryBack",
    	this.attributes = {},
	    this.catButtonModel = {
    	  buttonLabel: "Back to...",
	      disabled: false
    	}
	  );
	Mojo.Event.listen(this.controller.get('categoryBack'), Mojo.Event.tap, this.goBack.bindAsEventListener(this));
	
	this.controller.get("categoryBack").hide();

	this.controller.setupWidget("categorySelect",
    	this.attributes = {},
	    this.selButtonModel = {
    	  buttonLabel: "Just Use",
	      disabled: false
    	}
	  );
	Mojo.Event.listen(this.controller.get('categorySelect'), Mojo.Event.tap, this.useCat.bindAsEventListener(this));
	
	this.controller.get("categorySelect").hide();

	//this.controller.instantiateChildWidgets(this.controller.get('categories-list'));
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get('categories-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));

};

CategoriesAssistant.prototype.listWasTapped = function(event) {
	var i=event.item.index;
	Mojo.Log.error("i="+i+", level="+event.item.level+", label="+event.item.label);
	if (event.item.level==0){	//tapped root, show sub items
		this.catButtonModel.buttonLabel="Back to main categories...";
		this.controller.modelChanged(this.catButtonModel);
		this.controller.get("categoryBack").show();
		this.lastItems=this.rootItems;
		this.lastLevel=0;
		this.lastLabel=event.item.label;
		
		this.categoriesModel.items=this.subitems[i].items;
		this.controller.modelChanged(this.categoriesModel);
		this.controller.get("categories-list").mojo.noticeUpdatedItems(0,this.categoriesModel.items);
		this.controller.get("categorySelect").hide();
		this.controller.getSceneScroller().mojo.revealTop(0);
	}
	if(event.item.level>0 && event.item.hasChildren){ //tapped sub item with kids, show kids
		this.catButtonModel.buttonLabel="Back to "+this.lastLabel+"...";
		this.controller.modelChanged(this.catButtonModel);
		this.controller.get("categoryBack").show();

		this.selButtonModel.buttonLabel="Just use \""+event.item.label+"\"";
		this.controller.modelChanged(this.selButtonModel);
		this.controller.get("categorySelect").show();
		this.useID=event.item.id;
		this.useLabel=event.item.label;
		this.usePic=event.item.icon;
		
		this.lastItems=this.categoriesModel.items;
		this.lastLevel=event.item.level;

		this.categoriesModel.items=this.subsubitems[i].items;
		this.controller.modelChanged(this.categoriesModel);
		this.controller.get("categories-list").mojo.noticeUpdatedItems(0,this.categoriesModel.items);
		this.controller.getSceneScroller().mojo.revealTop(0);
	}
	
	if(event.item.level>0 && !event.item.hasChildren) { //tapped sub item with no children or child of sub item
		this.prevScene.controller.get("selectedCat").update('<img src="'+event.item.icon+'" align="top"/> '+event.item.label);
		_globals.selectedCat=event.item.id;
		this.controller.stageController.popScene();
	}
};

CategoriesAssistant.prototype.goBack = function(event) {
	switch(this.lastLevel){
		case 1:
			this.categoriesModel.items=this.lastItems;
			this.controller.modelChanged(this.categoriesModel);
			this.controller.get("categories-list").mojo.noticeUpdatedItems(0,this.categoriesModel.items);		
			this.lastLevel=0;
			this.catButtonModel.buttonLabel="Back to main categories...";
			this.controller.modelChanged(this.catButtonModel);
			this.controller.get("categorySelect").hide();
			this.controller.getSceneScroller().mojo.revealTop(0);
			break;
		case 0:
			this.categoriesModel.items=this.rootItems;
			this.controller.modelChanged(this.categoriesModel);
			this.controller.get("categories-list").mojo.noticeUpdatedItems(0,this.categoriesModel.items);		
			this.lastLevel=-1;
			this.controller.get("categoryBack").hide();		
			this.controller.get("categorySelect").hide();
			this.controller.getSceneScroller().mojo.revealTop(0);
			break;
	}
				
};

CategoriesAssistant.prototype.useCat = function(event) {
	this.prevScene.controller.get("selectedCat").update('<img src="'+this.usePic+'" align="top"/> '+this.useLabel);
	_globals.selectedCat=this.useID;
	this.controller.stageController.popScene();

};


CategoriesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

CategoriesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CategoriesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
