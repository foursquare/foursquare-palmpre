function NearbyTipsAssistant(a) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.auth=a;
}

NearbyTipsAssistant.prototype.setup = function() {
	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('results-tips-list', 
					      {itemTemplate:'listtemplates/tipsItems',dividerTemplate: 'listtemplates/dividertemplate',dividerFunction: this.groupTips},
					      this.resultsModel);

    Mojo.Log.error("#########setup list");

	Mojo.Event.listen(this.controller.get('results-tips-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));


        
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
      _globals.cmmodel);
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
    
    
    Mojo.Log.error("#########setup menu");


    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });


    
    Mojo.Log.error("#########setup tips");
    _globals.ammodel.items[0].disabled=false;
this.controller.modelChanged(_globals.ammodel);

    $("message").hide();
   // this.requestList=[];
    	       this.getTips();

}

NearbyTipsAssistant.prototype.getTips = function() {
	if(_globals.tipsList==undefined || _globals.reloadTips==true) {
		_globals.reloadTips=false;
		_globals.tipsList=undefined;
	Mojo.Log.error("lat="+_globals.lat+", long="+_globals.long);
		var url = 'http://api.foursquare.com/v1/tips.json';
		Mojo.Log.error("###http://api.foursquare.com/v1/tips.json?geolat="+_globals.lat+"&geolong="+_globals.long);
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth}, //Not doing a search with auth due to malformed JSON results from it
		   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude},
		   onSuccess: this.getTipsSuccess.bind(this),
		   onFailure: this.getTipsFailed.bind(this)
		 });
	}else{
		Mojo.Log.error("tips exist!");
		this.resultsModel.items=_globals.tipsList;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}
}

NearbyTipsAssistant.prototype.groupTips = function(data){
	return data.grouping;
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
                        }.bind(this)/*,
                        placeNear:event.target,*/

    });
}
NearbyTipsAssistant.prototype.markTip = function(tip,how){
		var url = 'http://api.foursquare.com/v1/tip/mark'+how+'.json';
		var request = new Ajax.Request(url, {
		   method: 'post',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: _globals.auth}, //Not doing a search with auth due to malformed JSON results from it
		   parameters: {tid: tip},
		   onSuccess: this.markTipSuccess.bind(this),
		   onFailure: this.markTipFailed.bind(this)
		 });
}
NearbyTipsAssistant.prototype.markTipSuccess = function(response){
	Mojo.Log.error(response.responseText);
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Tip was marked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
	}
}
NearbyTipsAssistant.prototype.markTipFailed = function(response){
		Mojo.Controller.getAppController().showBanner("Error marking tip!", {source: 'notification'});
}



NearbyTipsAssistant.prototype.getTipsFailed = function(response){
	Mojo.Log.error("****error tips="+response.responseText);
}


NearbyTipsAssistant.prototype.getTipsSuccess = function(response) {
	Mojo.Log.error("****yay tips="+response.responseText);
	
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
		/*		Mojo.Log.error("****no tips");
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();

		$('message').innerHTML = 'There was an error parsing the results from Foursquare. Give it another shot later on.';
		$('message').show();*/
		var t=response.responseText;
		t=t.replace('"group":null,"type":"Nearby",',"");
		var j = eval("(" + t + ")");

	}else{
		var j=response.responseJSON;
	}
	
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.tipsList = [];
					Mojo.Log.error("****handling tips");

		if(j.groups[0] != undefined) { //actually got some tips
			Mojo.Log.error("****in tips group loop");
			for(var g=0;g<j.groups.length;g++) {
				var tarray=j.groups[g].tips;
				var grouping=j.groups[g].type;
				for(var t=0;t<tarray.length;t++) {
			Mojo.Log.error("****in tips loop");
					this.tipsList.push(tarray[t]);
					var dist=this.tipsList[this.tipsList.length-1].distance;
					if(_globals.units=="si") {					
						var amile=0.000621371192;
						dist=roundNumber(dist*amile,1);
						var unit="";
						if(dist==1){unit="mile";}else{unit="miles";}
					}else{
						dist=roundNumber(dist/1000,1);
						var unit="";
						if(dist==1){unit="KM";}else{unit="KM";}						
					}
					this.tipsList[this.tipsList.length-1].distance=dist;
					this.tipsList[this.tipsList.length-1].unit=unit;
					this.tipsList[this.tipsList.length-1].grouping=grouping;
				}
			}
		}

		_globals.tipsList=this.tipsList;
		this.resultsModel.items =this.tipsList; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		
	
		
		$("spinnerId").mojo.stop();
		$("spinnerId").hide();
		$("resultListBox").style.display = 'block';

}


NearbyTipsAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
            	case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,userData,_globals.username,_globals.password,_globals.uid);
					//this.prevScene.cmmodel.items[0].toggleCmd="do-Nothing";
				    //this.prevScene.controller.modelChanged(this.prevScene.cmmodel);

					//this.controller.stageController.popScene("friends-list");
					break;
				case "do-Friends":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},this.auth,userData,_globals.username,_globals.password,_globals.uid);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Refresh":
                	$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
                	_globals.tipsList=undefined;
					this.getTips();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;

			}
		}
}

NearbyTipsAssistant.prototype.activate = function(event) {
	   if(_globals.tipsList!=undefined){
			$("resultListBox").style.display = 'block';
	   		$("spinnerId").mojo.stop();
			$("spinnerId").hide();
	   }
	   
	   if(_globals.reloadTips) {
                	$("spinnerId").mojo.start();
					$("spinnerId").show();
					$("resultListBox").style.display = 'none';
                	_globals.tipsList=undefined;
					this.getTips();
	   }
}


NearbyTipsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NearbyTipsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
