function NearbyTipsAssistant(a) {
	   this.auth=a;
	   this.tipsItems=[];
	   this.todosItems=[];
}

NearbyTipsAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly'});
	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('results-tips-list', 
					      {itemTemplate:'listtemplates/tipsItems',swipeToDelete: true,dividerTemplate: 'listtemplates/dividertemplate',dividerFunction: this.groupTips,preventDeleteProperty:'candelete'},
					      this.resultsModel);

	Mojo.Event.listen(this.controller.get('results-tips-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.listen(this.controller.get('results-tips-list'),Mojo.Event.listDelete, this.listDelete.bind(this));

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
    
    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });
    /*this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
	    _globals.cmmodel
	);*/
    this.controller.setupWidget(Mojo.Menu.commandMenu,
    	this.attributes = {
	        spacerHeight: 0,
        	menuClass: 'fsq-fade'
    	},
		{
          	visible: true,
        	items: [ 
                 {
                 items: [
	                /* { icon: "search", command: "do-Search"},*/
	                	{},
    	             { label: "Tips", command: "show-Tips"},
    	             { label: "To-Dos", command: "show-Todos"},
    	             {}
    	         ],
    	         toggleCmd: 'show-Tips'
    	         }
                 
                 ]
    });


    
    _globals.ammodel.items[0].disabled=false;
	this.controller.modelChanged(_globals.ammodel);

    this.controller.get("notice").hide();
    this.getTips();

}

NearbyTipsAssistant.prototype.getTips = function() {
	if(_globals.tipsList==undefined || _globals.reloadTips==true) {
		_globals.reloadTips=false;
		_globals.tipsList=undefined;

		 foursquareGet(this,{
		 	endpoint: 'tips.json',
		 	requiresAuth: true,
		   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude},
		   onSuccess: this.getTipsSuccess.bind(this),
		   onFailure: this.getTipsFailed.bind(this)		 	
		 });
	}else{
		this.resultsModel.items=_globals.tipsList;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}
}

NearbyTipsAssistant.prototype.groupTips = function(data){
	var g=(data.grouping=="Me")? "My To-Dos": data.grouping;
	return g;
}
NearbyTipsAssistant.prototype.listWasTapped = function(event){
    this.controller.popupSubmenu({
                        items: [{label: $L('I want to do this'), command: 'todo', icon: 'status-available-dark'},
                            {label: $L('I\'ve done this!'), command: 'todone'}
                        ],
                        onChoose: function(arg) {
                           switch(arg) {
                           		case "todo":
                           			this.markTip(event.item.id,"todo");
                           			break;
                           		case "todone":
                           			this.markTip(event.item.id,"done");
                           			break;
                           }
                        }.bind(this)
    });
}

NearbyTipsAssistant.prototype.listDelete = function(event){
	var tip=event.item.id;
		var url = 'https://api.foursquare.com/v1/tip/unmark.json';
		var request = new Ajax.Request(url, {
		   method: 'post',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth},
		   parameters: {tid: tip},
		   onSuccess: this.unmarkTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });

}

NearbyTipsAssistant.prototype.markTip = function(tip,how){
		var url = 'https://api.foursquare.com/v1/tip/mark'+how+'.json';
		var request = new Ajax.Request(url, {
		   method: 'post',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth},
		   parameters: {tid: tip},
		   onSuccess: this.markTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });
}
NearbyTipsAssistant.prototype.markTipSuccess = function(response){
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Tip was marked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
	}
}
NearbyTipsAssistant.prototype.unmarkTipSuccess = function(response){
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Tip was unmarked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error unmarking tip!", {source: 'notification'});
	}
}
NearbyTipsAssistant.prototype.markTipFailed = function(response){
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
}



NearbyTipsAssistant.prototype.getTipsFailed = function(response){
	Mojo.Log.error("****error tips="+response.responseText);
}
NearbyTipsAssistant.prototype.relativeTime = function(offset){
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
  }


NearbyTipsAssistant.prototype.getTipsSuccess = function(response) {	
	/*these results are a little wonky
	if there are many groups available, the object looks like:
		{"groups":[{"type":"Nearby"...
	But if there's only one group, it looks like:
		{"groups":["group":null,"type":"Nearby",{"type":"Me"...
	So, if we don't get a JSON object, we can assume we got an effed up object and
		need to repair it. We'll do this by cutting out the junk JSON text
		then re-eval'ing the text as a JSON object.
		eval'ing isn't the most effective, safe way, but it's quick and works
	The cool thing about this is, if Foursquare fixes this issue in the API later
		it'll still work and just go to the code that handles proper JSON responses.
	*/
	
	
	if (response.responseJSON == undefined) {
		Mojo.Log.error("###tips are effed!");
		var t=response.responseText;
		t=t.replace('"group":null,"type":"Nearby",',"");
		var j = eval("(" + t + ")");

	}else{
		var j=response.responseJSON;
	}
	
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.tipsList = [];

		if(j.groups[0] != undefined) { //actually got some tips
			for(var g=0;g<j.groups.length;g++) {
				var tarray=j.groups[g].tips;
				var grouping=j.groups[g].type;
				for(var t=0;t<tarray.length;t++) {
					this.tipsList.push(tarray[t]);
					var dist=this.tipsList[this.tipsList.length-1].distance;
					if(_globals.units=="si") {					
						var amile=0.000621371192;
						dist=roundNumber(dist*amile,1);
						var unit="";
						if(dist==1){unit="mile";}else{unit="miles";}
					}else if(_globals.units=="metric"){
						dist=roundNumber(dist/1000,1);
						var unit="";
						if(dist==1){unit="KM";}else{unit="KM";}						
					}else{
						if(dist==1){unit="m";}else{unit="m";}						
					}
					this.tipsList[this.tipsList.length-1].distance=dist;
					this.tipsList[this.tipsList.length-1].unit=unit;
					this.tipsList[this.tipsList.length-1].grouping=grouping;
					
					var created=this.tipsList[this.tipsList.length-1].created;
					if(this.tipsList[this.tipsList.length-1].created != undefined) {
						var now = new Date;
						var later = new Date(this.tipsList[this.tipsList.length-1].created);
						var offset = later.getTime() - now.getTime();
						var when=this.relativeTime(offset) + " ago";
					}else{
					   	var when="";
					}
					this.tipsList[this.tipsList.length-1].when=when;

					
					
					if(grouping=="Me"){
						this.tipsList[this.tipsList.length-1].candelete=false;	
					}else{
						this.tipsList[this.tipsList.length-1].candelete=true;
					}
					if(this.tipsList[this.tipsList.length-1].user.id==_globals.uid){
						this.tipsList[this.tipsList.length-1].candelete=false;	
					}
					if(grouping=="Me"){
						this.todosItems.push(this.tipsList[this.tipsList.length-1]);
					}else{
						this.tipsItems.push(this.tipsList[this.tipsList.length-1]);
					}
				}
			}
		}


		_globals.tipsList=this.tipsItems;
		this.resultsModel.items =this.tipsItems; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		if(this.tipsItems.length==0){
			this.controller.get("notice").innerHTML="There aren't any tips near you.";
			this.controller.get("notice").show();
			logthis("notips");
		}else{
			this.controller.get("notice").hide();		
			logthis("tips");
		}
	
		
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get("resultListBox").style.display = 'block';

}


NearbyTipsAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
            	case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},this.auth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.zoomFade},thisauth,"");
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Donate":
                	_globals.doDonate();
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.zoomFade},this);
                	break;
                case "do-Refresh":
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.tipsList=undefined;
					this.getTips();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
				case "show-Tips":
					this.resultsModel.items =this.tipsItems; //update list with basic user info
					this.controller.modelChanged(this.resultsModel);
					if(this.tipsItems.length==0){
						this.controller.get("notice").innerHTML="There aren't any tips near you.";
						this.controller.get("notice").show();
					}else{
						this.controller.get("notice").hide();
					}
					
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.revealTop();
					break;
				case "show-Todos":
					this.resultsModel.items =this.todosItems; //update list with basic user info
					this.controller.modelChanged(this.resultsModel);
					if(this.todosItems.length==0){
						this.controller.get("notice").innerHTML="You haven't created any to-dos yet.";
						this.controller.get("notice").show();
					}else{
						this.controller.get("notice").hide();
					}

					var scroller=this.controller.getSceneScroller();
					scroller.mojo.revealTop();
					break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					//scroller.mojo.revealTop();
					scroller.mojo.scrollTo(0,0,true);
					break;
			}
		}
}

NearbyTipsAssistant.prototype.activate = function(event) {
		NavMenu.setThat(this);
	   if(_globals.tipsList!=undefined){
			this.controller.get("resultListBox").style.display = 'block';
	   		this.controller.get("spinnerId").mojo.stop();
			this.controller.get("spinnerId").hide();
	   }
	   
	   if(_globals.reloadTips) {
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.tipsList=undefined;
					this.getTips();
	   }
}


NearbyTipsAssistant.prototype.deactivate = function(event) {
}

NearbyTipsAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('results-tips-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	Mojo.Event.stopListening(this.controller.get('results-tips-list'),Mojo.Event.listDelete, this.listDelete.bind(this));
}
