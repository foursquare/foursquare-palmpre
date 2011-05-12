function TodosAssistant(a) {
	   this.auth=a;
	   this.tipsItems=[];
	   this.todosItems=[];
}

TodosAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

TodosAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly'});
	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('results-todos-list', 
					      {itemTemplate:'listtemplates/tipsItems',swipeToDelete: true,dividerTemplate: 'listtemplates/dividertemplate',dividerFunction: this.groupTips,preventDeleteProperty:'candelete'},
					      this.resultsModel);

	this.listWasTappedBound=this.listWasTapped.bind(this);
	this.listDeleteBound=this.listDelete.bind(this);

	Mojo.Event.listen(this.controller.get('results-todos-list'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.listen(this.controller.get('results-todos-list'),Mojo.Event.listDelete, this.listDeleteBound);

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);
    
/*    this.controller.setupWidget("spinnerId",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });*/
  	this.spinnerAttr = {
		superClass: 'fsq_spinner',
		mainFrameCount: 31,
		fps: 20,
		frameHeight: 50
	}
	this.spinnerModel = {
		spinning: true
	}
	this.controller.setupWidget('spinnerId', this.spinnerAttr, this.spinnerModel);

         
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
	                	{},
    	             { label: "Nearby", command: "show-nearby"},
    	             { label: "Recent", command: "show-recent"},
    	             {}
    	         ],
    	         toggleCmd: 'show-nearby'
    	         }
                 
                 ]
    });

	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);

    
    _globals.ammodel.items[0].disabled=false;
	this.controller.modelChanged(_globals.ammodel);

    this.controller.get("notice").hide();
    this.getTips();

}
TodosAssistant.prototype.stageActivate = function(event) {
			NavMenu.setup(this,{buttons: 'navOnly'});
	if(_globals.showShout){
    	var thisauth="";
		this.controller.stageController.pushScene({name: "shout", transition: Mojo.Transition.zoomFade},thisauth,"",this,_globals.jtShout);
	}


};


TodosAssistant.prototype.getTips = function() {
//	if(_globals.tipsList==undefined || _globals.reloadTips==true) {

		try{this.controller.get("spinnerId").mojo.start();}catch(e){}
		this.controller.get("spinnerId").show();
		this.controller.get("resultListBox").hide();
		this.controller.get("notice").hide();

		_globals.reloadTips=false;
		_globals.tipsList=undefined;
	this.get='nearby';
		 foursquareGet(this,{
		 	endpoint: 'users/'+_globals.uid+'/todos',
		 	requiresAuth: true,
		   parameters: {ll:_globals.lat+","+_globals.long, sort: 'nearby'},
		   onSuccess: this.getTipsSuccess.bind(this),
		   onFailure: this.getTipsFailed.bind(this)		 	
		 });
/*	}else{
		this.resultsModel.items=_globals.tipsList;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}*/
}

TodosAssistant.prototype.getRecentTodos = function() {
	//if(_globals.tipsList==undefined || _globals.reloadTips==true) {
		try{this.controller.get("spinnerId").mojo.start();}catch(e){}
		this.controller.get("spinnerId").show();
		this.controller.get("resultListBox").hide();
		this.controller.get("notice").hide();

		_globals.reloadTips=false;
		_globals.tipsList=undefined;

		this.get='friends';
		 foursquareGet(this,{
		 	endpoint: 'users/'+_globals.uid+'/todos',
		 	requiresAuth: true,
		   parameters: {ll:_globals.lat+","+_globals.long, sort: 'recent'},
		   onSuccess: this.getTipsSuccess.bind(this),
		   onFailure: this.getTipsFailed.bind(this)		 	
		 });
	/*}else{
		this.resultsModel.items=_globals.tipsList;
		this.controller.modelChanged(this.resultsModel);
		this.lat=_globals.lat;
		this.long=_globals.long;
	}*/
}

TodosAssistant.prototype.groupTips = function(data){
	var g=(data.grouping=="Me")? "My To-Dos": data.grouping;
	return g;
}
TodosAssistant.prototype.listWasTapped = function(event){
    
   	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item}],undefined,true);

}

TodosAssistant.prototype.listDelete = function(event){
	var tip=event.item.id;
	
		foursquarePost(this,{
			endpoint: 'tips/'+tip+'/unmark',
			parameters: {},
			requiresAuth: true,
			debug: false,
			onSuccess: this.unmarkTipSuccess.bind(this),
			onFailure: this.markTipFailed.bind(this)
		});

}

TodosAssistant.prototype.markTip = function(tip,how){
		var url = 'https://api.foursquare.com/v1/tip/mark'+how+'.json';
		foursquarePost(this,{
			endpoint: 'tip/mark'+how+'.json',
			parameters: {tid: tip},
			requiresAuth: true,
			debug: false,
			onSuccess: this.markTipSuccess.bind(this),
			onFailure: this.markTipFailed.bind(this)
		});
}
TodosAssistant.prototype.markTipSuccess = function(response){
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Todo was marked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error marking todo!", {source: 'notification'});
	}
}
TodosAssistant.prototype.unmarkTipSuccess = function(response){
	if(response.responseJSON.tip!=undefined){
		Mojo.Controller.getAppController().showBanner("Todo was unmarked!", {source: 'notification'});
	}else{
		Mojo.Controller.getAppController().showBanner("Error unmarking todo!", {source: 'notification'});
	}
}
TodosAssistant.prototype.markTipFailed = function(response){
		Mojo.Controller.getAppController().showBanner("Error marking todo!", {source: 'notification'});
}



TodosAssistant.prototype.getTipsFailed = function(response){
	logthis("****error tips="+response.responseText);
}
TodosAssistant.prototype.relativeTime = function(offset){
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


TodosAssistant.prototype.getTipsSuccess = function(response) {	
	logthis("todos are done");
	
	var j=response.responseJSON.response;
	
	logthis(Object.toJSON(j));
	
		//Got Results... JSON responses vary based on result set, so I'm doing my best to catch all circumstances
		this.tipsList = [];
		this.tipsItems=[];

	/*	if(j.groups[0] != undefined) { //actually got some tips
			logthis("1");
			for(var g=0;g<j.groups.length;g++) {
				var tarray=j.groups[g].tips;
				var grouping=j.groups[g].type;*/
				var tarray=j.todos.items;
				logthis("1");
				for(var t=0;t<tarray.length;t++) {
				logthis("2loop");
					this.tipsList.push(tarray[t].tip);
					var dist=this.tipsList[this.tipsList.length-1].venue.location.distance;
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
				logthis("3");
					this.tipsList[this.tipsList.length-1].distance=dist;
					this.tipsList[this.tipsList.length-1].unit=unit;
					//this.tipsList[this.tipsList.length-1].grouping=grouping;
					
					var created=this.tipsList[this.tipsList.length-1].created;
					if(this.tipsList[this.tipsList.length-1].createdAt != undefined) {
						var now = new Date;
						var later = new Date(this.tipsList[this.tipsList.length-1].createdAt*1000);
						var offset = later.getTime() - now.getTime();
						var when=this.relativeTime(offset) + " ago";
					}else{
					   	var when="";
					}
					this.tipsList[this.tipsList.length-1].when=when;
				logthis("4");
					if(this.tipsList[this.tipsList.length-1].photo!=undefined){
						this.tipsList[this.tipsList.length-1].hasphoto='inline';
					}else{
						this.tipsList[this.tipsList.length-1].hasphoto='none';
					}

					
					if(this.tipsList[this.tipsList.length-1].status){
						if(this.tipsList[this.tipsList.length-1].status=="todo"){
							this.tipsList[this.tipsList.length-1].dogear="block";
						}else{
							this.tipsList[this.tipsList.length-1].dogear="none";
						}
					}else{
						this.tipsList[this.tipsList.length-1].dogear="none";
					}
				logthis("5");

				/*	var fs=this.tipsList[this.tipsList.length-1].user.friendstatus;
					if(fs!=undefined){
						logthis("fs="+this.tipsList[this.tipsList.length-1].user.friendstatus);
					}else{
						logthis("nope! user="+this.tipsList[this.tipsList.length-1].user.firstname);
					}*/

				logthis("6");
					
					/*if(grouping=="Me"){
						this.tipsList[this.tipsList.length-1].candelete=false;	
					}else{
						this.tipsList[this.tipsList.length-1].candelete=true;
					}*/
					//if(this.tipsList[this.tipsList.length-1].user.id==_globals.uid){
						this.tipsList[this.tipsList.length-1].candelete=false;	
					//}
				logthis("7");
					
					/*if(grouping=="Me"){
						this.todosItems.push(this.tipsList[this.tipsList.length-1]);
					}else{*/
						this.tipsItems.push(this.tipsList[this.tipsList.length-1]);
					//}

				logthis("8");

				}
			/*}
		}*/
		logthis("");

		_globals.tipsList=this.tipsItems;
		this.resultsModel.items =this.tipsItems; //update list with basic user info
		this.controller.modelChanged(this.resultsModel);
		if(this.tipsItems.length==0){
			if(this.get=='nearby'){
				this.controller.get("notice").innerHTML="You don't have any nearby To-Do List items.";
			}else if(this.get=='friends'){
				this.controller.get("notice").innerHTML="You don't have any recent To-Do List items.";
			}
			this.controller.get("notice").show();
			logthis("notips");
		}else{
			this.controller.get("notice").hide();		
			logthis("tips");
		}
	
		
		this.controller.get("spinnerId").mojo.stop();
		this.controller.get("spinnerId").hide();
		this.controller.get("resultListBox").show();

}


TodosAssistant.prototype.handleCommand = function(event) {
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
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Explore":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "explore", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
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
				case "show-nearby":
					/*this.resultsModel.items =this.tipsItems; //update list with basic user info
					this.controller.modelChanged(this.resultsModel);
					if(this.tipsItems.length==0){
						this.controller.get("notice").innerHTML="There aren't any tips near you.";
						this.controller.get("notice").show();
					}else{
						this.controller.get("notice").hide();
					}*/
					
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.revealTop();
					this.getTips();
					break;
				case "show-recent":
					/*this.resultsModel.items =this.todosItems; //update list with basic user info
					this.controller.modelChanged(this.resultsModel);
					if(this.todosItems.length==0){
						this.controller.get("notice").innerHTML="You haven't created any to-dos yet.";
						this.controller.get("notice").show();
					}else{
						this.controller.get("notice").hide();
					}*/

					var scroller=this.controller.getSceneScroller();
					scroller.mojo.revealTop();
					_globals.reloadTips=true;
					this.getRecentTodos();
					break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					//scroller.mojo.revealTop();
					scroller.mojo.scrollTo(0,0,true);
					break;
			}
		}else if(event.type===Mojo.Event.back){
			if(NavMenu.showing==true){
				event.preventDefault();
				NavMenu.hideMenu();
			}        
        }

}

TodosAssistant.prototype.activate = function(event) {
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


TodosAssistant.prototype.deactivate = function(event) {
}

TodosAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('results-todos-list'),Mojo.Event.listTap, this.listWasTappedBound);
	Mojo.Event.stopListening(this.controller.get('results-todos-list'),Mojo.Event.listDelete, this.listDeleteBound);
}
