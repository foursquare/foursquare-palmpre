function ViewTipAssistant(t,v,sv) {
	this.todos=t;	
	this.venue=v;
	this.showVenue=sv;
	this.metatap=false;
	logthis(Object.toJSON(t));
}

ViewTipAssistant.prototype.setup = function() {
	//NavMenu.setup(this,{buttons:'empty'});
	NavMenu.setup(this,{buttons:'checkindetail'});

  this.controller.setupWidget("buttonRemove",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.removeModel = {
      buttonLabel: "Remove from My To-Do List",
      disabled: false,
      buttonClass: 'secondary'
    }
  );
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
	
	 foursquareGet(this,{
	 	endpoint: 'tips/'+this.todo.tip.id,
	 	requiresAuth: true,
	 	debug: true,
	   parameters: {},
	   onSuccess: this.tipSuccess.bind(this),
	   onFailure: this.tipFailed.bind(this)		 	
	 });

	
	
	this.photoTapBound=this.photoTap.bind(this);
	Mojo.Event.listen(this.controller.get("tip-photo"),Mojo.Event.tap,this.photoTapBound);
	this.keyDownHandlerBound=this.keyDownHandler.bind(this);
	this.keyUpHandlerBound=this.keyUpHandler.bind(this);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyDownHandlerBound);
	this.doc=this.controller.document;
    this.doc.addEventListener("keyup", this.keyUpHandlerBound, true);

};

ViewTipAssistant.prototype.tipFailed = function(r) {
	logthis(r.responseText);
};

ViewTipAssistant.prototype.photoTap = function(event) {
     var stageArguments = {name: "photoStage"+this.todo.tip.id, lightweight: true};
     var pushMainScene=function(stage){
     	this.metatap=false;
		stage.pushScene("view-photo",{photo:this.todo.tip.photo.url, index:0, array:[this.todo.tip.photo.url]});
        
     };
    var appController = Mojo.Controller.getAppController();
	appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");

};

ViewTipAssistant.prototype.tipSuccess = function(r) {
logthis("got tip");
	this.todo.tip=r.responseJSON.response.tip;
logthis("@");

	if(this.todo.tip.user!=undefined){
		if(this.todo.tip.user.relationship=="self"){
			this.isself=true;
		}else{
			this.isself=false;
			this.controller.document.querySelector('.navbar-menu .palm-menu-group > div:nth-child(1) > .palm-menu-icon').style.background='';
		}
	}
	logthis("a");


	if(this.todo.tip.venue==undefined){
		this.todo.tip.venue=this.venue;
	}
	
	logthis("b");
	if(this.todo.tip.link){
		var todourl="<br/><br/>"+this.todo.tip.link.link();
	}else if(this.todo.tip.url){
		var url=this.todo.tip.url;
		if(url.indexOf("http://")==-1){url="http://"+url;}
		var todourl='<br/><div class="small-text"><br/>'+url.link(url)+'</div>';
	}else {
		var todourl='';
	}
	logthis("1");
	if(this.todo.tip.text==""){
		this.todo.tip.text="I want to visit this venue!";
	}
	
	logthis("2");
	this.todo.tip.text=this.todo.tip.text.replace("<","&lt;").replace(">","&gt;");
	
	this.controller.get("todo-text").update(this.todo.tip.text+todourl);
	logthis("3");
	
	var todofooter='added ';
	if(this.todo.tip.user){
		var todouser=this.todo.tip.user;
		if(todouser.relationship){
			if(todouser.relationship=="self"){
				var username="You";
			}else{
				var username=todouser.firstName;
				if(todouser.lastName){
					username+=" "+todouser.lastName;
				}
			}
		}else{
			var username=todouser.firstName;
			if(todouser.lastName){
				username+=" "+todouser.lastName;
			}	
		}
	}else{
		this.todo.tip.user={
			id: _globals.uid,
			firstName: 'You',
			lastName: ''
		};
		var username="You";
	}
	

	if(this.todo.tip.createdAt != undefined) {
		var now = new Date;
		var later = new Date(this.todo.tip.createdAt*1000);
		var offset = later.getTime() - now.getTime();
		var when=this.relativeTime(offset) + " ago";
	}else{
	   	var when="";
	}

	todofooter+=when+' by ';
	todofooter+='<a data="'+this.todo.tip.user.id+'" class="userlink" user="'+username+'">'+username+'</a><br/>';
	var p=(parseInt(this.todo.tip.done.count)==1)? " person has": " people have";
	todofooter+=this.todo.tip.done.count+p+' done this';
	
	this.controller.get("todo-footer").update(todofooter);
	
	if(this.todo.tip.photo!=undefined){
		this.controller.get("tip-photo").src=this.todo.tip.photo.url;
		this.controller.get("photo").show();
		
		if(this.todo.tip.photo.createdAt != undefined) {
			var now = new Date;
			var later = new Date(this.todo.tip.photo.createdAt*1000);
			var offset = later.getTime() - now.getTime();
			var when=this.relativeTime(offset).replace("about ","") + " ago";
		}else{
		   	var when="";
		}
		this.controller.get("whenfield").update(when);
		
		if(this.todo.tip.photo.source){
			if(this.todo.tip.photo.source.name.indexOf('foursquare for')>-1){
				var source=(this.todo.tip.photo.source)? 'via '+this.todo.tip.photo.source.name+'': '';			
			}else{
				var source=(this.todo.tip.photo.source)? 'via <a class="fakelink" href="'+this.todo.tip.photo.source.url+'">'+this.todo.tip.photo.source.name+'</a>': '';
			
			}
			this.controller.get("photosource").update(source);
		}
		if(this.todo.tip.user.relationship!="self"){
			this.controller.get("photoflag").update('<div class="friend-comments"><a id="flag-photo" class="flaglink" data="'+this.todo.tip.id+'">Flag</a></div>');
		}		
		
	}else{
		this.controller.document.querySelector('.navbar-menu .palm-menu-group > div:nth-child(1) > .palm-menu-icon').style.background='';
	}
	
	
	
	
	if(this.todo.tip.done.groups){
		if(this.todo.tip.done.groups.length>0){
			logthis("here");
			for(var dg=0;dg<this.todo.tip.done.groups.length;dg++){
				logthis("loop");
				if(this.todo.tip.done.groups[dg].type=="friends"){
					var avatars='';
					for(var df=0;df<this.todo.tip.done.groups[dg].items.length;df++){
						logthis("loop2");
						avatars+='<img src="'+this.todo.tip.done.groups[dg].items[df].photo+'" class="userlink" data="'+this.todo.tip.done.groups[dg].items[df].id+'" user="'+this.todo.tip.done.groups[dg].items[df].firstName+'" width="32" style="margin-right:5px;">';
					}
					if(this.todo.tip.done.groups[dg].items.length==1){
						var s=' has';
					}else{
						var s='s have';
					}
					this.controller.get("todo-friends").update(this.todo.tip.done.groups[dg].items.length+' friend'+s+' done this<br/>'+avatars);
					if(this.todo.tip.done.groups[dg].items.length>0){this.controller.get("friend-box").show();}
				}
			}
		}
	}
		
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
		
	}
	
	if(this.todo.tip.user.relationship!=undefined){
		if(this.todo.tip.user.relationship=="self"){
			this.controller.get("buttonAdd").hide();
			this.controller.get("buttonRemove").show();
		}
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
		var addy=(this.todo.tip.venue.location.address)? '<br/>'+this.todo.tip.venue.location.address: '';
		this.controller.get("todo-venue").update('<a id="venue-link">'+this.todo.tip.venue.name+addy+'</a>');
		this.controller.get("venue-wrap").show();
		Mojo.Event.listen(this.controller.get("venue-wrap"),Mojo.Event.tap,this.showVenueInfo.bind(this));
	}

	this.controller.get("elements").show();
	this.controller.get("overlaySpinner").hide();
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
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},this.todo.tip.venue,_globals.username,_globals.password,_globals.uid,true);
	}else{
         var stageArguments = {name: "mainStage"+this.todo.tip.venue.id, lightweight: true};
         var pushMainScene=function(stage){
         	this.metatap=false;
			stage.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},this.todo.tip.venue,_globals.username,_globals.password,_globals.uid,true);         
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
			endpoint: 'tips/'+this.todo.tip.id+'/unmark',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON.response;
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
			endpoint: 'tips/'+this.todo.tip.id+'/marktodo',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON.response;
				logthis(j);
				var todo=j.tip;
				if(r.responseJSON.meta.code==200){
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
			endpoint: 'tips/'+this.todo.tip.id+'/markdone',
			parameters: {},
			requiresAuth: true,
			debug: true,
			onSuccess: function(r){
				logthis("todo ok");
				var j=r.responseJSON.response;
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



ViewTipAssistant.prototype.handleCommand = function(event){
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case "friend-search":
					//get the scroller for your scene
					var scroller = this.controller.getSceneScroller();
					//call the widget method for scrolling to the top
					scroller.mojo.revealTop(0);
					this.controller.get("drawerId").mojo.toggleState();
					this.controller.modelChanged(this.drawerModel);
                	break;
				case "friend-map":
					this.controller.stageController.pushScene({name: "friends-map", transition: Mojo.Transition.crossFade,disableSceneScroller:true},this.lat,this.long,this.resultsModel.items,this.username,this.password,this.uid,this);
					break;
				case "friends-list":
					this.controller.get("drawerId").mojo.setOpenState(false);
					this.resultsModel.items =this.friendList;
					this.controller.modelChanged(this.resultsModel);
					break;
				case "do-Venues":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid);
					break;
				case "do-Friends":
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Shout":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Todos":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=auth;
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
                	_globals.friendList=undefined;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,this.username,this.password,this.uid,this.lat,this.long,this);
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.scrollTo(0,0,true);
					break;
				case "add-photo":
					if(this.isself){
						Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
							this.fileName=fn.fullPath;
							var params=[];
							params.push({"key":"tipId","data":this.todo.tip.id,"contentType":"text/plain"});	
							params.push({"key":"ll","data":_globals.lat+","+_globals.long,"contentType":"text/plain"});
							params.push({"key":"llAcc","data":_globals.hacc,"contentType":"text/plain"});
							params.push({"key":"alt","data":_globals.altitude,"contentType":"text/plain"});
							params.push({"key":"altAcc","data":_globals.vacc,"contentType":"text/plain"});
							params.push({"key":"oauth_token","data":_globals.token,"contentType":"text/plain"});
							
							params.push({"key":"broadcast","data":"public","contentType":"text/plain"});
							
						    var appController = Mojo.Controller.getAppController();
							var cardStageController = appController.getStageController("mainStage");
							var controller = cardStageController.activeScene();
						    // Queue the upload request with the download manager service.
						    controller.serviceRequest('palm://com.palm.downloadmanager/', {
								method: 'upload',
						        parameters: {
								    'url': "https://api.foursquare.com/v2/photos/add",
						            'fileLabel': 'photo',
								    'fileName': this.fileName,
						            'postParameters': params,
								    'subscribe': false
						        },
								onSuccess: function (resp,j){
									logthis("photo ok");
									logthis(Object.toJSON(resp));
									
								 	var r=resp.returnValue;
								 	logthis(r);
								 	if(r) {
										logthis(r);
										//var j=eval("("+r+")");
										
										if(r){ //successful upload
											Mojo.Controller.getAppController().showBanner("Photo uploaded!", {source: 'notification'});
											foursquareGet(this,{
											 	endpoint: 'checkins/'+this.params.checkin,
											 	requiresAuth: true,
											 	debug: true,
											   parameters: {},
											   onSuccess: this.checkinSuccess.bind(this),
											   onFailure: this.checkinFailed.bind(this)		 	
											});											
										}else{
											Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
										}
								 	}
							  	}.bind(this),
						        onFailure: function (e){
						        		logthis("photo fail");
										setTimeout(function(){Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});},1000);
							 	}.bind(this)
						    });
							
						}.bind(this)},this.controller.stageController);
						
					}
					break;
            }

        }else if(event.type===Mojo.Event.back){
			if(NavMenu.showing==true){
				event.preventDefault();
				NavMenu.hideMenu();
			}        
        }

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
