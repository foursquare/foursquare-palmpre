function ViewTipAssistant(t,v,sv) {
	this.todos=t;	
	this.venue=v;
	this.showVenue=sv;
	this.metatap=false;
	logthis(Object.toJSON(t));
}

ViewTipAssistant.prototype.setup = function() {
NavMenu.setup(this,{buttons:'empty'});

  this.controller.setupWidget("buttonRemove",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.removeModel = {
      buttonLabel: "Remove from My To-Do List",
      disabled: false,
      buttonClass: 'secondary'
    }
  );

  this.controller.setupWidget("buttonDone",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.doneModel = {
      buttonLabel: "I've Done This!",
      disabled: false,
      buttonClass: 'fsq-button'
    }
  );
  
  this.tipRemoveBound=this.tipRemove.bind(this);
  this.tipDoneBound=this.tipDone.bind(this);
 	Mojo.Event.listen(this.controller.get("buttonRemove"),Mojo.Event.tap,this.tipRemoveBound);
	Mojo.Event.listen(this.controller.get("buttonDone"),Mojo.Event.tap,this.tipDoneBound);

  
  
  
  	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("wrapper").style.minHeight="275px;"; //247
	}
	else{
	   this.controller.get("wrapper").style.minHeight="327px"; //372
	}


	_globals.ammodel.items[0].disabled=true;

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);


	//pick a random todo to share
	var randomnumber=Math.floor(Math.random()*this.todos.length);
	logthis("len="+this.todos.length+", rand="+randomnumber);
	this.todo=this.todos[randomnumber];
	
	if(this.todo.tip.venue==undefined){
		this.todo.tip.venue=this.venue;
	}
	if(this.todo.tip.link){
		var todourl="<br/><br/>"+this.todo.tip.link.link();
	}else if(this.todo.tip.url){
		var url=this.todo.tip.url;
		if(url.indexOf("http://")==-1){url="http://"+url;}
		var todourl='<br/><div class="small-text"><br/>'+url.link(url)+'</div>';
	}else {
		var todourl='';
	}
	this.controller.get("todo-text").update(this.todo.tip.text+todourl);
	
	var todofooter='added ';
	var todouser=this.todo.tip.user;
	if(todouser.friendstatus){
		if(todouser.friendstatus=="self"){
			var username="You";
		}else{
			var username=todouser.firstname;
			if(todouser.lastname){
				username+=" "+todouser.lastname;
			}
		}
	}else{
		var username=todouser.firstname;
		if(todouser.lastname){
			username+=" "+todouser.lastname;
		}	
	}

	if(this.todo.created != undefined) {
		var now = new Date;
		var later = new Date(this.todo.created);
		var offset = later.getTime() - now.getTime();
		var when=this.relativeTime(offset) + " ago";
	}else{
	   	var when="";
	}

	todofooter+=when+' by ';
	todofooter+='<a data="'+this.todo.tip.user.id+'" class="userlink" user="'+username+'">'+username+'</a><br/>';
	var p=(parseInt(this.todo.tip.stats.donecount)==1)? " person has": " people have";
	todofooter+=this.todo.tip.stats.donecount+p+' done this';
	
	this.controller.get("todo-footer").update(todofooter);
	
	
	if(this.todo.tip.status!=undefined){ //from a tip
		switch(this.todo.tip.status){
			case "done":
				this.doneModel.disabled=true;
				this.controller.modelChanged(this.doneModel);
				break;
			case "todo":
				break;
		}
	}else{
		  this.controller.get("buttonAdd").show();
		  this.controller.get("buttonRemove").hide();
		  this.controller.setupWidget("buttonAdd",
		    this.attributes = {type : Mojo.Widget.activityButton},
		    this.doneModel = {
		      buttonLabel: "Add to My To-Do List",
		      disabled: false,
		      buttonClass: 'primary'
		    }
		  );
		  
		  this.tipAddBound=this.tipAdd.bind(this);
		  Mojo.Event.listen(this.controller.get("buttonAdd"),Mojo.Event.tap,this.tipAddBound);
		
	}
	

	var userlinks=this.controller.document.querySelectorAll(".userlink");
	this.userlinks=userlinks;
	this.ulinks_len=userlinks.length;
	for(var e=0;e<userlinks.length;e++) {
		var eid=userlinks[e];
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo);
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.showUserInfo.bind(this));
		logthis("#########added event to "+eid)
	}

	if(this.showVenue){
		this.controller.get("todo-venue").update('<a id="venue-link">'+this.todo.tip.venue.name+'<br/>'+this.todo.tip.venue.address+'</a>');
		this.controller.get("venue-wrap").show();
		Mojo.Event.listen(this.controller.get("venue-wrap"),Mojo.Event.tap,this.showVenueInfo.bind(this));
	}
	
	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	this.keyUpHandlerBound=this.keyUpHandler.bind(this);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
	this.doc=this.controller.document;
    this.doc.addEventListener("keyup", this.keyUpHandlerBound, true);

};

ViewTipAssistant.prototype.keyDownHandler = function(event) {
		var key=event.originalEvent.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = true;
		}
}

ViewTipAssistant.prototype.keyUpHandler = function(event) {
		var key=event.keyCode;
		logthis("key="+key);
		if (key == 57575) {
			this.metatap = false;
		}
}


ViewTipAssistant.prototype.showVenueInfo = function(event) {
	if(!this.metatap){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: true},this.todo.tip.venue,_globals.username,_globals.password,_globals.uid,true);
	}else{
         var stageArguments = {name: "mainStage"+this.todo.tip.venue.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: true},this.todo.tip.venue,_globals.username,_globals.password,_globals.uid,true);         
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");	
	}

};

ViewTipAssistant.prototype.showUserInfo = function(event) {
	logthis("show user info");
	var thisauth=auth;
	var uid=event.target.readAttribute("data");
	var uname=event.target.readAttribute("user");
	
	if(!this.metatap){
		this.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,uid,this,true);
	}else{
         var stageArguments = {name: "mainStage"+uid, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,uid,this,false);      
         };
        var appController = Mojo.Controller.getAppController();
		appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");		
	}


};


ViewTipAssistant.prototype.tipRemove = function(event){
		foursquarePost(this,{
			endpoint: 'tip/unmark.json',
			parameters: {tid: this.todo.tip.id},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				var todo=j.tip;
				if(todo){
					this.controller.stageController.popScene();
				}else{
					Mojo.Controller.getAppController().showBanner("Error removing todo", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error removing todo", {source: 'notification'});
			}.bind(this)
		});

};

ViewTipAssistant.prototype.tipAdd = function(event){
		foursquarePost(this,{
			endpoint: 'tip/marktodo.json',
			parameters: {tid: this.todo.tip.id},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				var todo=j.tip;
				if(todo){
					this.controller.stageController.popScene();
				}else{
					Mojo.Controller.getAppController().showBanner("Error marking as todo", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error marking as todo", {source: 'notification'});
			}.bind(this)
		});

};

ViewTipAssistant.prototype.tipDone = function(event){
		foursquarePost(this,{
			endpoint: 'tip/markdone.json',
			parameters: {tid: this.todo.tip.id},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON;
				logthis(j);
				var todo=j.tip;
				if(todo){
					this.controller.stageController.popScene();
				}else{
					Mojo.Controller.getAppController().showBanner("Error marking todo as done", {source: 'notification'});
				}
			}.bind(this),
			onFailure: function(r){
				logthis("todo fail");
				logthis(r.responseText);
				Mojo.Controller.getAppController().showBanner("Error marking todo as done", {source: 'notification'});
			}.bind(this)
		});

};

ViewTipAssistant.prototype.relativeTime = function(offset){
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

ViewTipAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();
};

ViewTipAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ViewTipAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewTipAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
