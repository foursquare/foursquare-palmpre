function ViewCheckinAssistant(p) {
	this.params=p;
	this.loaded=false;
}

ViewCheckinAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'checkindetail'});
	this.controller.setupWidget('txtComment', this.attributes = {hintText:'Add a comment...'}, this.commentModel = {value:'', disabled:false});

	this.deleteCommentBound= this.deleteComment.bind(this);	
	this.flagPhotoBound= this.flagPhoto.bind(this);	
	this.venueTapBound= this.venueTap.bind(this);	
	this.userTapBound= this.userTap.bind(this);	
	this.onKeyPressHandlerBound= this.onKeyPressHandler.bindAsEventListener(this);	
	Mojo.Event.listen(this.controller.document, "keyup", this.onKeyPressHandlerBound,true);
	
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
	
	foursquareGet(this,{
	 	endpoint: 'checkins/'+this.params.checkin,
	 	requiresAuth: true,
	 	debug: true,
	   parameters: {},
	   onSuccess: this.checkinSuccess.bind(this),
	   onFailure: this.checkinFailed.bind(this)		 	
	});

};

ViewCheckinAssistant.prototype.relativeTime = function(offset){
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

ViewCheckinAssistant.prototype.onKeyPressHandler = function(event) {
//	logthis("keyup");
	var key=event.keyCode;

	if(Mojo.Char.isEnterKey(key)){
		setTimeout(function(){
			this.controller.get("overlaySpinner").show();
			foursquarePost(this,{
				endpoint: 'checkins/'+this.params.checkin+'/addcomment',
				parameters: {text:this.controller.get("txtComment").mojo.getValue()},
				requiresAuth: true,
				debug: true,
				onSuccess: this.commentSuccess.bind(this),
				onFailure: this.checkinFailed.bind(this)
			});
		}.bind(this),10);
		
	}
};
ViewCheckinAssistant.prototype.commentSuccess = function(r) {
	var j=r.responseJSON.response;
	this.controller.get("txtComment").mojo.setValue('');
	
	if(j.comment.createdAt != undefined) {
		var now = new Date;
		var later = new Date(j.comment.createdAt*1000);
		var offset = later.getTime() - now.getTime();
		j.comment.when=this.relativeTime(offset).replace("about ","") + " ago";
	}else{
		j.comment.when="";
	}
	
	var html=Mojo.View.render({object:j.comment, template: 'listtemplates/commentItem'});
	this.controller.get("commentBank").innerHTML+=html;
	this.controller.getSceneScroller().mojo.revealBottom(0);	
	
	this.controller.get("overlaySpinner").hide();
};


ViewCheckinAssistant.prototype.deleteComment = function(event){
	var cid=event.target.readAttribute("data");

	this.controller.showAlertDialog({
		onChoose: function(value) {
			if(value){
				this.controller.get("overlaySpinner").show();
				foursquarePost(this,{
					endpoint: 'checkins/'+this.params.checkin+'/deletecomment',
					parameters: {commentId:cid},
					requiresAuth: true,
					debug: true,
					onSuccess: this.checkinSuccess.bind(this),
					onFailure: this.checkinFailed.bind(this)
				});
			}
		}.bind(this),
		title:"Delete Comment",
		message:"Are you sure you want to delete this comment?",
		cancelable:true,
		choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
	});
};

ViewCheckinAssistant.prototype.venueTap = function(event) {
	//var vid=event.target.readAttribute("data");
	
	this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},this.venue,_globals.username,_globals.password,_globals.uid,true,this);


};

ViewCheckinAssistant.prototype.userTap = function(event) {
	var vid=event.target.readAttribute("data");
	
	this.controller.stageController.pushScene({name: "user-info", transition: Mojo.Transition.zoomFade, disableSceneScroller: false},_globals.auth,vid,this,true);


};

ViewCheckinAssistant.prototype.flagPhoto = function(event){
	var pid=event.target.readAttribute("data");
	
    this.controller.popupSubmenu({
        items: [{label: $L('Spam / Scam'), command: 'spam_scam', icon: 'status-available-dark'},
            {label: $L('Nudity'), command: 'nudity'},
            {label: $L('Hate / Violence'), command: 'hate_violence'},
            {label: $L('Illegal'), command: 'illegal'},
            {label: $L('Unrelated'), command: 'unrelated'}
        ],
        onChoose: function(arg) {
			this.controller.get("overlaySpinner").show();
			if(arg!==undefined){
				foursquarePost(this,{
					endpoint: 'photos/'+pid+'/flag',
					parameters: {problem:arg},
					requiresAuth: true,
					debug: true,
					onSuccess: function(r){
						this.controller.get("overlaySpinner").hide();
						if(r.responseJSON.meta.code==200 || r.responseJSON.meta.code=="200"){
							Mojo.Controller.getAppController().showBanner("Photo flagged!", {source: 'notification'});
						}else{
							Mojo.Controller.getAppController().showBanner("Error flagging photo!", {source: 'notification'});
						}
					}.bind(this),
					onFailure: function(r){
						this.controller.get("overlaySpinner").hide();
						Mojo.Controller.getAppController().showBanner("Error flagging photo!", {source: 'notification'});
					}.bind(this)
				});
			}else{
				this.controller.get("overlaySpinner").hide();			
			}
        }.bind(this)
    });

};

ViewCheckinAssistant.prototype.checkinSuccess = function(r) {
	var pb=this.controller.get("photoBank");
	pb.innerHTML='';
	var cb=this.controller.get("commentBank");
	cb.innerHTML='';
	
	if(this.loaded==false){
		this.controller.get("txtComment").mojo.setValue('');
		this.loaded=true;
	}

	var j=r.responseJSON.response;
	
	if(j.checkin.user.relationship=="self"){
		this.isself=true;
	}else{
		this.isself=false;
		this.controller.document.querySelector('.navbar-menu .palm-menu-group > div:nth-child(1) > .palm-menu-icon').style.background='';
	}
	
//	this.commentModel.disabled=false;
//	this.controller.modelChanged(this.commentModel);
	
	var checkin={};
	checkin.firstname=j.checkin.user.firstName;
	checkin.lastname=j.checkin.user.lastName;
	checkin.photo=j.checkin.user.photo;
	
	switch(j.checkin.type){
		case "checkin":
			checkin.checkin=j.checkin.venue.name;
			checkin.geolat=j.checkin.venue.location.lat;
			checkin.geolong=j.checkin.venue.location.lng;
			checkin.at="@ ";
			break;
		case "shout":
			checkin.checkin="";
			checkin.geolat=(j.checkin.location.lat)? j.checkin.location.lat: 0;
			checkin.geolong=(j.checkin.location.lng)? j.checkin.location.lng: 0;
			checkin.at="";
			break;
		case "venueless":
			checkin.checkin=j.checkin.location.name;
			checkin.geolat=(j.checkin.location.lat)? j.checkin.location.lat: 0;
			checkin.geolong=(j.checkin.location.lng)? j.checkin.location.lng: 0;
			checkin.at="@ ";
			break;
	}
	
	this.venue=j.checkin.venue;
	checkin.user=j.checkin.user;
	
	checkin.shout=(j.checkin.shout != undefined)? "\n"+j.checkin.shout: "";
	var urlmatch=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	checkin.shout=checkin.shout.replace(urlmatch,'<a href="$1" class="listlink">$1</a>');
	
	checkin.mayorcrown=(j.checkin.isMayor=="true" || j.checkin.isMayor==true)? '<img src="images/crown_smallgrey.png"/> ': "";
	
	if(j.checkin.source){
		if(j.checkin.source.name.indexOf('foursquare for')>-1){
			checkin.source=(j.checkin.source)? 'via '+j.checkin.source.name+'': '';			
		}else{
			checkin.source=(j.checkin.source)? 'via <a class="fakelink" href="'+j.checkin.source.url+'">'+j.checkin.source.name+'</a>': '';
		
		}
	}
	
	
	
	
	//handle time
	if(j.checkin.createdAt != undefined) {
		var now = new Date;
		var later = new Date(j.checkin.createdAt*1000);
		var offset = later.getTime() - now.getTime();
		checkin.when=this.relativeTime(offset).replace("about ","") + " ago";
	}else{
		checkin.when="";
	}
	
	
	var content = Mojo.View.render({object: checkin, template: 'listtemplates/checkinItem'});
	
	this.controller.get("checkin").update(content);
	
	
	//now display photos
	if(j.checkin.photos){
		this.fullsizePhotos=[];
		for(var p=0;p<j.checkin.photos.items.length;p++){
			//var html='<div class="darkerbg" style="color:#fff;padding-bottom: 3px;margin-bottom: 7px;margin-top: 15px;"><img src="'+j.checkin.photos.items[p].url+'" style="width: 100%;"></div>';
			if(j.checkin.photos.items[p].createdAt != undefined) {
				var now = new Date;
				var later = new Date(j.checkin.photos.items[p].createdAt*1000);
				var offset = later.getTime() - now.getTime();
				j.checkin.photos.items[p].when=this.relativeTime(offset).replace("about ","") + " ago";
			}else{
				j.checkin.photos.items[p].when="";
			}

			if(j.checkin.photos.items[p].source){
				if(j.checkin.photos.items[p].source.name.indexOf('foursquare for')>-1){
					j.checkin.photos.items[p].source=(j.checkin.photos.items[p].source)? 'via '+j.checkin.photos.items[p].source.name+'': '';			
				}else{
					j.checkin.photos.items[p].source=(j.checkin.photos.items[p].source)? 'via <a class="fakelink" href="'+j.checkin.photos.items[p].source.url+'">'+j.checkin.photos.items[p].source.name+'</a>': '';
				
				}
			}
			this.fullsizePhotos.push(j.checkin.photos.items[p]);
			var index=this.fullsizePhotos.length-1;
			j.checkin.photos.items[p].index=index;

			if(j.checkin.photos.items[p].user.relationship!="self" || j.checkin.user.relationship!="self"){
				j.checkin.photos.items[p].flag='<div class="friend-comments"><a id="flag-'+p+'" class="flaglink" data="'+j.checkin.photos.items[p].id+'">Flag</a></div>';
			}			
			var html=Mojo.View.render({object: j.checkin.photos.items[p], template: 'listtemplates/photoTemplate'});
			pb.innerHTML+=html;
		}
	}else{
		this.controller.get("photoBank").hide();
	}
	
	if(j.checkin.comments){
		for(var c=0;c<j.checkin.comments.items.length;c++){
			if(j.checkin.comments.items[c].createdAt != undefined) {
				var now = new Date;
				var later = new Date(j.checkin.comments.items[c].createdAt*1000);
				var offset = later.getTime() - now.getTime();
				j.checkin.comments.items[c].when=this.relativeTime(offset).replace("about ","") + " ago";
			}else{
				j.checkin.comments.items[c].when="";
			}
			if(j.checkin.comments.items[c].user.relationship){
				if(j.checkin.comments.items[c].user.relationship=="self" || j.checkin.user.relationship=="self"){
					j.checkin.comments.items[c].deletebutton='<div class="friend-comments"><a id="delete-'+c+'" class="deletelink" data="'+j.checkin.comments.items[c].id+'">Delete</a></div>';
				}
			}
			var html=Mojo.View.render({object:j.checkin.comments.items[c], template: 'listtemplates/commentItem'});
			cb.innerHTML+=html;
		}
	}
	
	this.deletelinks=this.controller.document.querySelectorAll(".deletelink");
	for(var e=0;e<this.deletelinks.length;e++) {
		var eid=this.deletelinks[e].id;
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.deleteCommentBound);
	}

	this.flaglinks=this.controller.document.querySelectorAll(".flaglink");
	for(var e=0;e<this.flaglinks.length;e++) {
		var eid=this.flaglinks[e].id;
		Mojo.Event.listen(this.controller.get(eid),Mojo.Event.tap,this.flagPhotoBound);
	}

		//attach events
	this.photoTapBound=this.photoTap.bind(this);
	var photos=this.controller.document.querySelectorAll(".checkin-photo");
	for(var p=0;p<photos.length;p++){
		Mojo.Event.listen(photos[p],Mojo.Event.tap,this.photoTapBound);
	}

	Mojo.Event.listen(this.controller.document.querySelector(".venueLink"),Mojo.Event.tap,this.venueTapBound);
	Mojo.Event.listen(this.controller.document.querySelector(".userLink"),Mojo.Event.tap,this.userTapBound);
	
	this.controller.get("overlaySpinner").hide();
	this.controller.get("elements").show();
	
};

ViewCheckinAssistant.prototype.photoTap = function(event){
     var stageArguments = {name: "photoStage"+event.target.readAttribute("x-fsq-index"), lightweight: true};
     var pushMainScene=function(stage){
     	this.metatap=false;
		stage.pushScene("view-photo",{photo:event.target.readAttribute("x-fsq-fullsize"), index:event.target.readAttribute("x-fsq-index"), array:this.fullsizePhotos});
        
     };
    var appController = Mojo.Controller.getAppController();
	appController.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");

	//this.controller.stageController.pushScene("view-photo",{photo:event.target.readAttribute("x-fsq-fullsize"), index:event.target.readAttribute("x-fsq-index"), array:this.fullsizePhotos});
};


ViewCheckinAssistant.prototype.handleCommand = function(event){
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
							params.push({"key":"checkinId","data":this.params.checkin,"contentType":"text/plain"});	
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

ViewCheckinAssistant.prototype.checkinFailed = function(r) {

};

ViewCheckinAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ViewCheckinAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewCheckinAssistant.prototype.cleanup = function(event) {
	for(var e=0;e<this.deletelinks.length;e++) {
		var eid=this.deletelinks[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.deleteCommentBound);
	}


	for(var e=0;e<this.flaglinks.length;e++) {
		var eid=this.flaglinks[e].id;
		Mojo.Event.stopListening(this.controller.get(eid),Mojo.Event.tap,this.flagPhotoBound);
	}
};
