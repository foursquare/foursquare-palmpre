function ShoutAssistant(a,u,ps,text) {
	   this.auth=a;
	   this.urllen=0;
	   this.prevScene=ps;
	   this.uploading=false;
	   this.text=(text!=undefined)? text: '';
	   
		if(text){
		   if(text.substr(text.length-1,1)=="*"){
		   	this.text=text.substr(0,text.length-1);
		   	this.autosend=true;
		   }else{
		   	this.autosend=false;
		   }
		
		}
}
ShoutAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();     //makes the setup behave like it should.
};

ShoutAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'navOnly'});

	this.imageHosts=[
                {label: "Flickr", value: "flickr", urlLen:23},
                {label: "Plixi (TweetPhoto)", value: "tweetphoto", urlLen: 18},
                {label: "Pikchur", value: "pikchur", urlLen: 16},
                {label: "FSPic", value: "fspic", urlLen: 20}
            ];
    this.videoHosts=[
                {label: "Pikchur", value: "pikchur", urlLen: 16}
            ];

	this.urlLengths={
		"flickr":24,
		"tweetphoto": 19,
		"pikchur":17,
		"fspic": 21
	};

	logthis("1");
  this.controller.setupWidget("okButtonShout",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Shout!",
      disabled: false
    }
  );
  
  this.okTappedShoutBound=this.okTappedShout.bindAsEventListener(this);
  this.attachImageBound=this.attachImage.bindAsEventListener(this);
  this.removeImageBound=this.removeImage.bindAsEventListener(this);
  this.attachDownBound=function(){this.controller.get("attachicon").addClassName("pressed");}.bindAsEventListener(this);
  this.attachUpBound=function(){this.controller.get("attachicon").removeClassName("pressed");}.bindAsEventListener(this);
  this.shoutKeyPressBound=this.shoutKeyPress.bindAsEventListener(this);
  
	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);

  	logthis("2");

  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	//var pings=(credentials.ping=="on")? '0': '1';
	this.stt=(_globals.settings.sendToTwitter==true)? '1': '0';
	this.stf=(_globals.settings.sendToFacebook==true || _globals.settings.sendToFacebook=='true')? '1': '0';
  	logthis("3");

	_globals.ammodel.items[0].disabled=true;

	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

	this.lhc=new Mojo.Model.Cookie("photohost");
	var lh=this.lhc.get();
	_globals.lasthost=(lh)? lh.photohost: "pikchur";
  
    this.controller.setupWidget("photohostList",
    	this.phAttributes = {},
    	this.phModel = {
        	choices: this.imageHosts,
            value: _globals.lasthost,
            disabled: false
        }
    ); 
    	logthis("4");


	this.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true}, this.tipModel = {value:this.text, disabled:false});

	this.controller.get("photohostList").hide();

	logthis("5");

	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("docheckingroup").style.minHeight="275px;"; //247
	}
	else{
	   this.controller.get("docheckingroup").style.minHeight="327px"; //372
	}
	if(this.stf=="1"){
		this.controller.get('share-facebook').addClassName("pressed");
	}



	this.handleFacebookBound=function(){
	logthis("stf: %i, stt: %i",this.stf,this.stt);
		if(this.stf=="1"){
			this.stf="0";
			this.controller.get('share-facebook').removeClassName("pressed");
		}else{
			this.stf="1";
			this.controller.get('share-facebook').addClassName("pressed");
		}
	}.bindAsEventListener(this);
	
	logthis("6");

	if(this.stt=="1"){
		this.controller.get('share-twitter').addClassName("pressed");
	}


	this.handleTwitterBound=function(){
	logthis("stf: %i, stt: %i",this.stf,this.stt);
		if(this.stt=="1"){
			this.stt="0";
			this.controller.get('share-twitter').removeClassName("pressed");
		}else{
			this.stt="1";
			this.controller.get('share-twitter').addClassName("pressed");		
		}
	}.bindAsEventListener(this);

	this.frShareBound=function(){
		if(this.controller.get('share-flickr').hasClassName("pressed")){
			this.stfr="0";
			this.controller.get('share-flickr').removeClassName("pressed");
		}else{
			this.stfr="1";
			if(_globals.flickr_token){
				this.controller.get('share-flickr').addClassName("pressed");		
			}else{
				this.controller.showAlertDialog({
					onChoose: function(value) {
						if (value) {
							this.controller.stageController.pushScene('flickr-auth',this);
						}else{
						}
					}.bind(this),
					title:'Share with Flickr',
					message:"You have not authorized foursquare to use your flickr account yet. Would you like to now?",
					cancelable:true,
					choices:[ {label:'Yep!', value:true, type:'affirmative'}, {label:'Nevermind', value:false, type:'negative'} ]
				});
			
			}

		}
	}.bindAsEventListener(this);
	
		logthis("7");

	
	this.handlePhotohostBound=this.handlePhotohost.bind(this);
	Mojo.Event.listen(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohostBound);
	Mojo.Event.listen(this.controller.get('share-twitter'), Mojo.Event.tap, this.handleTwitterBound);
	Mojo.Event.listen(this.controller.get('share-facebook'), Mojo.Event.tap, this.handleFacebookBound);
	Mojo.Event.listen(this.controller.get('share-flickr'), Mojo.Event.tap, this.frShareBound);	
	Mojo.Event.listen(this.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShoutBound);
	Mojo.Event.listen(this.controller.get('attach'), Mojo.Event.tap, this.attachImageBound);
	Mojo.Event.listen(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImageBound);
	Mojo.Event.listen(this.controller.get('attach'), "mousedown", this.attachDownBound);
	Mojo.Event.listen(this.controller.get('attach'), "mouseup", this.attachUpBound);
	Mojo.Event.listen(this.controller.document, "keyup", this.shoutKeyPressBound);


	logthis("8");



}
ShoutAssistant.prototype.stageActivate = function(event) {
			NavMenu.setup(this,{buttons: 'navOnly'});

};

ShoutAssistant.prototype.activate = function(event) {
	NavMenu.setup(this,{buttons: 'navOnly'});
	this.controller.get('shout').mojo.focus();

	if(event=="flickr-auth"){
		this.controller.get('share-flickr').addClassName("pressed");	
		this.stfr="1";
	}

}

ShoutAssistant.prototype.shoutKeyPress = function(event) {
logthis("keypress");
	if(this.hasPhoto){
	}
	try{
		var charsLeft=140-this.controller.get("shout").mojo.getValue().length;
		
		this.controller.get("charCount").innerHTML=charsLeft;
		if(charsLeft<0){
			if(!this.controller.get("charCount").hasClassName("negative")){
				this.controller.get("charCount").addClassName("negative");
			}
		}else{
			if(this.controller.get("charCount").hasClassName("negative")){
				this.controller.get("charCount").removeClassName("negative");
			}	
		}
	}catch(e){
	
	}
};
ShoutAssistant.prototype.handleCommand = function(event) {
	if(event.type===Mojo.Event.back){
		if( this.uploading==true){
			event.preventDefault();
			event.stop();				
			this.controller.showAlertDialog({
				onChoose: function(value) {
					if(value=="yes"){
						this.controller.stageController.popScene();
					}
				}.bind(this),
				title: $L("Cancel Upload?"),
				message: $L("Your media file is still uploading. Do you want to cancel uploading and the check-in?"),
				choices:[
					{label:$L('Yeah'), value:"yes", type:'primary'},
					{label:$L('No!'), value:"no", type:'negative'}
				]
			});
		}
		if(NavMenu.showing==true){
			event.preventDefault();
			NavMenu.hideMenu();
		}        
	}
};

ShoutAssistant.prototype.okTappedShout = function() {
	//before doing the actual shout, see if we have a photo. if so, handle that
	if(this.hasPhoto){
		this.doShout();
	}else{
		this.doShout();
	}
}

ShoutAssistant.prototype.getTheHeaders =function(r){
	var text=r.responseText;
	var ff = [];
	var mx = text.length;   
    var scc= String.fromCharCode;
    for (var z = 0; z < mx; z++) {
       ff[z] = scc(text.charCodeAt(z) & 255);
    }
    var b = ff.join("");
   
    var l =b.length;
}

ShoutAssistant.prototype.doShout = function(extra) {
	this.uploading=false;

	//handle broadcast settings
	var broadcastArray=[];
	if(!this.hasPhoto){
		if(this.stt=="1"){broadcastArray.push("twitter");}
		if(this.stf=="1"){broadcastArray.push("facebook");}
	}else{
		this.hasPhoto=true;
		logthis("has photo");
	}
	broadcastArray.push("public");
	var broadcast=broadcastArray.join(",");

	foursquarePost(this,{
		endpoint: 'checkins/add',
		parameters: {
				shout: this.tipModel.value,
				ll: _globals.lat+","+_globals.long,
				llAcc: _globals.hacc,
				alt: _globals.altitude,
				altAcc: _globals.vacc,
				broadcast: broadcast
			},
		requiresAuth: true,
		debug: false,
		onSuccess: this.checkInSuccess.bind(this),
		onFailure: this.checkInFailed.bind(this)
	});

}

ShoutAssistant.prototype.checkInSuccess = function(response) {
	this.controller.get("okButtonShout").mojo.deactivate();
	logthis("deactivated button");
	var shouttext=this.tipModel.value;
	this.tipModel.value="";
	logthis("cleared tip");
	logthis("cleared filename");
	this.controller.get("img").src="";
	logthis("cleared image");
	logthis("hasimage=false");
	this.controller.get("charCount").innerHTML="140";
	
	this.controller.get("img-preview").hide();
	logthis("hidden image");
	this.controller.get("photohostList").hide();
	logthis("hid photohosts");

	this.controller.modelChanged(this.tipModel);
	//Mojo.Controller.getAppController().showBanner("Sent your shout to your friends!", {source: 'notification'});
	var json=response.responseJSON;

	if(this.hasPhoto){
	logthis("yep, has a photo");
		if(this.stfr=="1"){
			var ptitle=shouttext;
			var pdesc=shouttext;
			var ptags="foursquare";
			var format="xml";
			var nojsoncallback="1";
			var api_key=_globals.flickr_key;
			var auth_token=_globals.flickr_token;
			var presig=_globals.flickr_secret+"api_key"+api_key+"auth_token"+auth_token+"description"+pdesc+"format"+format+"nojsoncallback"+nojsoncallback+"tags"+ptags+"title"+ptitle;
			var api_sig=hex_md5(presig);
	
			var fparams={
				"title":ptitle,
				"description":pdesc,
				"tags":ptags
			};
	
			var fparams=[];
			fparams.push({"key":"api_key","data":api_key,"contentType":"text/plain"});
			fparams.push({"key":"auth_token","data":auth_token,"contentType":"text/plain"});
			fparams.push({"key":"api_sig","data":api_sig,"contentType":"text/plain"});
			fparams.push({"key":"description","data":pdesc,"contentType":"text/plain"});
			fparams.push({"key":"format","data":format,"contentType":"text/plain"});
			fparams.push({"key":"nojsoncallback","data":nojsoncallback,"contentType":"text/plain"});
			fparams.push({"key":"tags","data":ptags,"contentType":"text/plain"});
			fparams.push({"key":"title","data":ptitle,"contentType":"text/plain"});
	
	
	
		    var appController = Mojo.Controller.getAppController();
	  	  	var cardStageController = appController.getStageController("mainStage");
			var controller = cardStageController.activeScene();
	        // Queue the upload request with the download manager service.
	        controller.serviceRequest('palm://com.palm.downloadmanager/', {
	            method: 'upload',
	            parameters: {
				    'url': "http://api.flickr.com/services/upload/",
	                'fileLabel': 'photo',
				    'fileName': this.fileName,
	                'postParameters': fparams,
				    'subscribe': true
	            },
	            onSuccess: function (resp){
				 	//gonna old school parse the xml since it's in plain etxt and not an object...
				 	var xml=resp.responseString;
				 	if(xml) {
					 	if(xml.indexOf('stat="ok"')>-1) {
					 		var ps=xml.indexOf("<photoid>")+9;
					 		var pe=xml.indexOf("</photoid>");
					 		var len=pe-ps;
					 		var photoid=parseInt(xml.substring(ps,pe));
					 		var epid=this.base58_encode(photoid);
				 			var extra="http://flic.kr/p/"+epid;
				 		}
				 	}
				 	
			  	}.bind(this),
	            onFailure: function (e){
						logthis('Failure : ' + Object.toJSON(resp));
			 	}.bind(this)
	        });
		
		}


		var params=[];
		params.push({"key":"checkinId","data":json.response.checkin.id,"contentType":"text/plain"});	
		params.push({"key":"ll","data":_globals.lat+","+_globals.long,"contentType":"text/plain"});
		params.push({"key":"llAcc","data":_globals.hacc,"contentType":"text/plain"});
		params.push({"key":"alt","data":_globals.altitude,"contentType":"text/plain"});
		params.push({"key":"altAcc","data":_globals.vacc,"contentType":"text/plain"});
		params.push({"key":"oauth_token","data":_globals.token,"contentType":"text/plain"});
		
		//handle broadcast settings
		var broadcastArray=[];
		if(this.stt=="1"){broadcastArray.push("twitter");}
		if(this.stf=="1"){broadcastArray.push("facebook");}
		broadcastArray.push("public");
		var broadcast=broadcastArray.join(",");

		params.push({"key":"broadcast","data":broadcast,"contentType":"text/plain"});
		
		logthis(Object.toJSON(params));
		
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
			    'subscribe': true
	        },
			onSuccess: function (resp,j){
			 	var r=resp.responseString;
			 	if(r) {
					logthis(r);
					var j=eval("("+r+")");
					this.hasPhoto=false;
					this.fileName="";

					if(j.meta.code=="200" || j.meta.code==200){ //successful upload
						Mojo.Controller.getAppController().showBanner("Photo uploaded!", {source: 'notification'});
						this.controller.get("okButtonShout").mojo.deactivate();
						this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,_globals.uid,true);
					}else{
						Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
						this.controller.get("okButtonShout").mojo.deactivate();
						this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,_globals.uid,true);
					}
			 	}
		  	}.bind(this),
	        onFailure: function (e){
		        	this.hasPhoto=false;
					this.fileName="";

					Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
					this.controller.get("okButtonShout").mojo.deactivate();
					logthis('Failure : ' + Object.toJSON(e));
					this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,_globals.uid,true);
		 	}.bind(this)
	    });
	
	
	}else{
		this.hasPhoto=false;
		this.fileName="";
		this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,_globals.uid,true);
	}




//	this.controller.stageController.pushScene({name: "checkin-result", transition: Mojo.Transition.zoomFade},response.responseJSON,_globals.uid,true);
}

ShoutAssistant.prototype.checkInFailed = function(response) {
	logthis(Object.toJSON(response));
		Mojo.Controller.getAppController().showBanner("Error sending your shout.", {source: 'notification'});
}


ShoutAssistant.prototype.base58_encode = function(num) {
	if(typeof num!=='number') {
		num=parseInt(num);
	}
	
	var encoded='';
	var alphabet='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	var div=num;
	var mod;
	while(num>=58){
		div=num/58;
		mod=num-(58*Math.floor(div));
		encoded=''+alphabet.substr(mod,1)+encoded;
		num=Math.floor(div);
	}
	
	return(div)?''+alphabet.substr(div,1)+encoded:encoded;
}

ShoutAssistant.prototype.escape_and_sign= function(params, post) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
	params.api_key = _globals.flickr_key;
	var sig = [];
	var esc_params = {api_key: '', api_sig: ''};
	for (var p in params) {
		if ('object' === typeof params[p]) {
			esc_params[p] = params[p];
		} else {
			sig.push(p);
			esc_params[p] = this.escape_utf8('' + params[p], !post).replace(/(^\s+|\s+$)/g, '');
		}
	}
	sig.sort();
	var calc = [];
	var ii = sig.length;
	for (var i = 0; i < ii; ++i) {
		calc.push(sig[i] + (post ? esc_params[sig[i]] : this.escape_utf8('' +params[sig[i]], false)));
    }
 
    var clear = _globals.flickr_secret + calc.join('');
    esc_params.api_sig = hex_md5(clear);
	return esc_params;
}

ShoutAssistant.prototype.escape_utf8= function(data, url) {
	//from: http://github.com/lmorchard/flickr-uploadr-webos/blob/master/src/javascripts/FlickrUploadr/API.js
        if (null === url) {
            url = false;
        }
        if ('' === data || null === data || undefined === data) {
            return '';
        }
            
        var chars = '0123456789abcdef';
        data = data.toString();
        var buffer = [];
        var ii = data.length;
        for (var i = 0; i < ii; ++i) {
            var c = data.charCodeAt(i);
            var bs = [];
            if (c > 0x10000) {
                bs[0] = 0xf0 | ((c & 0x1c0000) >>> 18);
                bs[1] = 0x80 | ((c & 0x3f000) >>> 12);
                bs[2] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[3] = 0x80 | (c & 0x3f);
            } else if (c > 0x800) {
                bs[0] = 0xe0 | ((c & 0xf000) >>> 12);
                bs[1] = 0x80 | ((c & 0xfc0) >>> 6);
                bs[2] = 0x80 | (c & 0x3f);
            } else if (c > 0x80) {
                bs[0] = 0xc0 | ((c & 0x7c0) >>> 6);
                bs[1] = 0x80 | (c & 0x3f);
            } else {
                bs[0] = c;
            }
            var j = 0, jj = bs.length;
            if (1 < jj) {
                if (url) {
                    for (j = 0; j < jj; ++j) {
                        var b = bs[j];
                        buffer.push('%' + chars.charAt((b & 0xf0) >>> 4) +
                            chars.charAt(b & 0x0f));
                    }
                } else {
                    for (j = 0; j < jj; ++j) {
                        buffer.push(String.fromCharCode(bs[j]));
                    }
                }
            } else {
                if (url) {
                    buffer.push(encodeURIComponent(String.fromCharCode(bs[0])));
                } else {
                    buffer.push(String.fromCharCode(bs[0]));
                }
            }
        }
        return buffer.join('');
}



ShoutAssistant.prototype.tipSuccess = function() {
	this.controller.get("okButtonShout").mojo.deactivate();
	this.sceneAssistant.getVenueInfo();
	this.widget.mojo.close();
}

ShoutAssistant.prototype.tipFailed = function() {

}
ShoutAssistant.prototype.cancelTappedShout = function() {
	this.widget.mojo.close();
}

ShoutAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
				case "do-Venues":
                	var thisauth=_globals.auth;
                	//this.controller.stageController.popScene();
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
                	
					//this.controller.stageController.popScene();
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					//this.controller.stageController.popScene();
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Todos":
                	var thisauth=_globals.auth;
					//this.controller.stageController.popScene();
					this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
					//this.controller.stageController.popScene();
					this.controller.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-About":
					this.controller.stageController.pushScene({name: "about", transition: Mojo.Transition.crossFade});
                	break;
                case "do-Prefs":
					this.controller.stageController.pushScene({name: "preferences", transition: Mojo.Transition.zoomFade},this);
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Nothing":
                	break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
            }
        }
    }

ShoutAssistant.prototype.attachImage = function(event) {
	Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
		this.fileName=fn.fullPath;
		this.hasPhoto=true;
		if(fn.attachmentType=="image"){
			var icon="/var/luna/data/extractfs"+encodeURIComponent(this.fileName)+":0:0:150:150:2"
			this.phModel.choices=this.imageHosts;
		}else{
			var icon=fn.iconPath;
			this.phModel.choices=this.videoHosts;	
		}
		this.controller.modelChanged(this.phModel);
		this.controller.get("img").src=icon;
		this.controller.get("img-preview").show();
		this.controller.get('share-flickr').show();

		if(charsLeft<0){
			if(!this.controller.get("charCount").hasClassName("negative")){
				this.controller.get("charCount").addClassName("negative");
			}
		}else{
			if(this.controller.get("charCount").hasClassName("negative")){
				this.controller.get("charCount").removeClassName("negative");
			}	
		}
//		this.controller.get("listborder").show();
	}.bind(this)},this.controller.stageController);
}

ShoutAssistant.prototype.removeImage = function(event) {
	this.controller.get("img").src="";
	this.hasPhoto=false;
	this.fileName="";
	this.controller.get("img-preview").hide();
	this.controller.get("shout").mojo.focus();
	this.controller.get("photohostList").hide();

}


ShoutAssistant.prototype.handlePhotohost = function(event) {
logthis("changed");
		var ph=this.phModel.value;
		this.urllen=this.urlLengths[this.phModel.value];	
		var charsLeft=140-this.urllen-this.controller.get("shout").mojo.getValue().length;
		this.controller.get("charCount").innerHTML=charsLeft;

		
		this.cookieData=new Mojo.Model.Cookie("photohost");
		this.cookieData.put(
			{"photohost":ph}
		)
		_globals.lasthost=ph;

}

ShoutAssistant.prototype.deactivate = function(event) {
}

ShoutAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohostBound);
	Mojo.Event.stopListening(this.controller.get('share-twitter'), Mojo.Event.tap, this.handleTwitterBound);
	Mojo.Event.stopListening(this.controller.get('share-facebook'), Mojo.Event.tap, this.handleFacebookBound);
	Mojo.Event.stopListening(this.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShoutBound);
	Mojo.Event.stopListening(this.controller.get('attach'), Mojo.Event.tap, this.attachImageBound);
	Mojo.Event.stopListening(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImageBound);
	Mojo.Event.stopListening(this.controller.get('attach'), "mousedown", this.attachDownBound);
	Mojo.Event.stopListening(this.controller.get('attach'), "mouseup", this.attachUpBound);
	Mojo.Event.stopListening(this.controller.document, "keyup", this.shoutKeyPressBound);
}
