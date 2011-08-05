function CheckinAssistant(v) {
	this.venue=v;
	
	if(this.venue.id==undefined){
		this.venueless=true;
	}else{
		this.venueless=false;
	}
	this.urllen=0;
	this.uploading=false;
}

CheckinAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'empty'});
	this.imageHosts=[
                {label: "Flickr", value: "flickr"},
                {label: "Plixi (TweetPhoto)", value: "tweetphoto"},
                {label: "Pikchur", value: "pikchur"},
                {label: "FSPic", value: "fspic"}
            ];
    this.videoHosts=[
                {label: "Pikchur", value: "pikchur"}
            ];
	this.urlLengths={
		"flickr":24,
		"tweetphoto": 19,
		"pikchur":17,
		"fspic": 21
	};

  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	//var pings=(credentials.swf=="on")? '1': '0';
	var pings=_globals.swf;
	this.stt=(_globals.settings.sendToTwitter==true)? '1': '0';
	this.stf=(_globals.settings.sendToFacebook==true || _globals.settings.sendToFacebook=='true')? '1': '0';

//	Mojo.Log.error("stf: %i, stt: %i",this.stf,this.stt);

	this.lhc=new Mojo.Model.Cookie("photohost");
	var lh=this.lhc.get();
	_globals.lasthost=(lh)? lh.photohost: "pikchur";

	this.controller.setupWidget("okButton",
		this.attributes = {type : Mojo.Widget.activityButton},
		this.OKButtonModel = {
			buttonLabel: "Check-in",
			disabled: false
		}
	);

    this.controller.setupWidget("chkShowFriends",
         this.sfattributes = {
             trueValue: '1',
             trueLabel: 'Yes',
             falseValue: '0',
             falseLabel: 'No'
         },
         this.sfmodel = {
             value: pings,
             disabled: false
         });
	this.controller.setupWidget('shout', 
		this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true,focusMode:Mojo.Widget.focusSelectMode}, 
		this.tipModel = {value:'', disabled:false}
	);
    this.controller.setupWidget("photohostList",
    	this.phAttributes = {},
    	this.phModel = {
        	choices: this.imageHosts,
            value: _globals.lasthost,
            disabled: false
        }
    ); 

	if(Mojo.Environment.DeviceInfo.touchableRows < 8)
	{
	   this.controller.get("checkin-widgets").style.minHeight="247px;";
	}
	else{
	   this.controller.get("checkin-widgets").style.minHeight="327px"; //372
	}
	
	if(this.stf=="1"){
		this.controller.get('share-facebook').addClassName("pressed");
	}



	this.fbShareBound=function(){
		if(this.stf=="1"){
			this.stf="0";
			this.controller.get('share-facebook').removeClassName("pressed");
		}else{
			this.stf="1";
			this.controller.get('share-facebook').addClassName("pressed");
		}
	}.bindAsEventListener(this);


	if(this.stt=="1"){
		this.controller.get('share-twitter').addClassName("pressed");
	}

	this.twShareBound=function(){
		if(this.controller.get('share-twitter').hasClassName("pressed")){
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


	if(this.venueless){
		this.venue.location={};
		this.venue.location.address='';
	}
	this.controller.get("checkin-info").update("<b>"+this.venue.name+"</b><br/>"+this.venue.location.address);
	this.controller.get("photorow").hide();
	
	this.handlePhotohostBound=this.handlePhotohost.bind(this);
	this.handleCheckboxBound=this.handleCheckbox.bind(this);
	this.attachImageBound=this.attachImage.bindAsEventListener(this);
	this.removeImageBound=this.removeImage.bindAsEventListener(this);
	this.attachDownBound=function(){this.controller.get("attachicon").addClassName("pressed");}.bindAsEventListener(this);
	this.attachUpBound=function(){this.controller.get("attachicon").removeClassName("pressed");}.bindAsEventListener(this);
	this.okTappedBound=this.okTapped.bindAsEventListener(this);
	this.shoutKeyPressBound=this.shoutKeyPress.bindAsEventListener(this);
	
	Mojo.Event.listen(this.controller.get('share-facebook'), Mojo.Event.tap, this.fbShareBound);
	Mojo.Event.listen(this.controller.get('share-twitter'), Mojo.Event.tap, this.twShareBound);	
	Mojo.Event.listen(this.controller.get('share-flickr'), Mojo.Event.tap, this.frShareBound);	
	Mojo.Event.listen(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohostBound);
	Mojo.Event.listen(this.controller.get("chkShowFriends"), Mojo.Event.propertyChange, this.handleCheckboxBound);
	Mojo.Event.listen(this.controller.get('attach'), Mojo.Event.tap, this.attachImageBound);
	Mojo.Event.listen(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImageBound);
	Mojo.Event.listen(this.controller.get('attach'), "mousedown", this.attachDownBound);
	Mojo.Event.listen(this.controller.get('attach'), "mouseup", this.attachUpBound);
	Mojo.Event.listen(this.controller.get('okButton'), Mojo.Event.tap, this.okTappedBound);
	Mojo.Event.listen(this.controller.document, "keyup", this.shoutKeyPressBound);

};

CheckinAssistant.prototype.handleCheckbox = function(event) {
	if(this.sfmodel.value==0){
		this.stt="0";
		this.stf="0";
		this.controller.get('share-facebook').removeClassName("pressed");
		this.controller.get('share-twitter').removeClassName("pressed");
	}
};

CheckinAssistant.prototype.shoutKeyPress = function(event) {
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
};

CheckinAssistant.prototype.okTapped = function() {
		//before doing the actual shout, see if we have a photo. if so, handle that
		if(this.hasPhoto){
			//this.uploading=true;
			//Mojo.Controller.getAppController().showBanner("Uploading media...", {source: 'notification'});
			this.checkIn(this.venue.id,this.venue.name,this.tipModel.value,this.sfmodel.value,"0","0",true);
		}else{
			this.checkIn(this.venue.id,this.venue.name,this.tipModel.value,this.sfmodel.value,this.stt,this.stf,false);
		}	
}

CheckinAssistant.prototype.attachImage = function(event) {
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
		//this.controller.get("photorow").show();
		//this.controller.get("listborder").show();
		this.controller.get("shout").mojo.focus();
		this.controller.get('share-flickr').show();
		
		//this.urllen=this.urlLengths[this.phModel.value];	
		var charsLeft=140-this.tipModel.value.length;//this.controller.get("shout").mojo.getValue().length;
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

	}.bind(this)},this.controller.stageController);
}

CheckinAssistant.prototype.removeImage = function(event) {
	this.controller.get("img").src="";
	this.hasPhoto=false;
	this.fileName="";
	this.controller.get("img-preview").hide();
	this.controller.get("shout").mojo.focus();
	this.controller.get("photorow").hide();
	//this.controller.get("listborder").hide();
	this.urllen=0;
	var charsLeft=140-this.urllen-this.controller.get("shout").mojo.getValue().length;
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

}

CheckinAssistant.prototype.checkIn = function(id, n, s, sf, t, fb,hasphoto) {
	if (_globals.token) {
		this.uploading=false;
		_globals.swf=sf;
		this.cookieData=new Mojo.Model.Cookie("credentials");
		this.cookieData.put({
			username: _globals.username,
			password: "",
			auth: _globals.auth,
			uid: _globals.uid,
			savetotwitter: t,
			savetofacebook: fb,
			swf: _globals.swf,
			cityid: 0,
			city: ""
		});
		//sf=(sf==0)? 1: 0;
		
		//handle broadcast settings
		var broadcastArray=[];
		if(!hasphoto){
			if(this.stt=="1"){broadcastArray.push("twitter");}
			if(this.stf=="1"){broadcastArray.push("facebook");}
		}else{
			this.hasphoto=true;
			logthis("has photo");
		}
		if(sf==1 || sf=="1"){
			broadcastArray.push("public");
		}else{
			broadcastArray.push("private");
		}
		var broadcast=broadcastArray.join(",");
		

		var params={
				shout: s,
				broadcast: broadcast,
				ll: _globals.lat+","+_globals.long,
				llAcc: _globals.hacc,
				alt: _globals.altitude,
				altAcc: _globals.vacc
			};
			
		if(!this.venueless){
			params.venueId=id;
		}else{
			params.venue=this.venue.name;
		}
		
		foursquarePost(this, {
			endpoint: 'checkins/add',
			requiresAuth: true,
			parameters: params,
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
			
		});
	} else {
		logthis("not loggedin");
	}
}
CheckinAssistant.prototype.checkInSuccess = function(response) {
	var json=response.responseJSON;
	logthis(response.responseText);
	//this.controller.get("docheckin-fields").hide();
	//this.controller.get("overlay-content").innerHTML="";
	//this.controller.get("meta-overlay").hide();
	
	if(this.hasphoto){
	logthis("yep, has a photo");
		//are we sharing to flickr?
		if(this.stfr=="1"){
			var ptitle=this.venue.name;
			var pdesc=this.tipModel.value;
			var ptags=(this.venueless)? this.venue.name: "foursquare:venue="+this.venue.id+", "+this.venue.name;
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
		var broadcast=broadcastArray.join(",");
		params.push({"key":"broadcast","data":broadcast,"contentType":"text/plain"});
		
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
					
					if(j.meta.code=="200" || j.meta.code==200){ //successful upload
						Mojo.Controller.getAppController().showBanner("Photo uploaded!", {source: 'notification'});
						this.controller.get("okButton").mojo.deactivate();
						this.controller.stageController.swapScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);
					}else{
						Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
						this.controller.get("okButton").mojo.deactivate();
						this.controller.stageController.swapScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);
					}
			 	}
		  	}.bind(this),
	        onFailure: function (e){
					Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
					this.controller.get("okButton").mojo.deactivate();
					logthis('Failure : ' + Object.toJSON(e));
					this.controller.stageController.swapScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);
		 	}.bind(this)
	    });
	
	
	
	}else{
		this.controller.stageController.swapScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);
	}
	
	

}

CheckinAssistant.prototype.checkInFailed = function(response) {
	logthis('Check In Failed: ' + repsonse.responseText);
	Mojo.Controller.getAppController().showBanner("Error checking in!", {source: 'notification'});
}
CheckinAssistant.prototype.handleCommand = function(event) {
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
	}
};


CheckinAssistant.prototype.base58_encode = function(num) {
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

CheckinAssistant.prototype.escape_and_sign= function(params, post) {
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

CheckinAssistant.prototype.escape_utf8= function(data, url) {
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



CheckinAssistant.prototype.handlePhotohost = function(event) {
		var ph=this.phModel.value;
		this.urllen=this.urlLengths[this.phModel.value];	
		var charsLeft=140-this.urllen-this.controller.get("shout").mojo.getValue().length;
		this.controller.get("charCount").innerHTML=charsLeft;

		this.cookieData=new Mojo.Model.Cookie("photohost");
		this.cookieData.put(
			{"photohost":ph}
		)
		_globals.lasthost=ph;

};

CheckinAssistant.prototype.activate = function(event) {
	if(event=="flickr-auth"){
		this.controller.get('share-flickr').addClassName("pressed");	
		this.stfr="1";
	}

};

CheckinAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CheckinAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('share-facebook'), Mojo.Event.tap, this.fbShareBound);
	Mojo.Event.stopListening(this.controller.get('share-twitter'), Mojo.Event.tap, this.twShareBound);	
	Mojo.Event.stopListening(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohostBound);
	Mojo.Event.stopListening(this.controller.get("chkShowFriends"), Mojo.Event.propertyChange, this.handleCheckboxBound);
	Mojo.Event.stopListening(this.controller.get('attach'), Mojo.Event.tap, this.attachImageBound);
	Mojo.Event.stopListening(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImageBound);
	Mojo.Event.stopListening(this.controller.get('attach'), "mousedown", this.attachDownBound);
	Mojo.Event.stopListening(this.controller.get('attach'), "mouseup", this.attachUpBound);
	Mojo.Event.stopListening(this.controller.get('okButton'), Mojo.Event.tap, this.okTappedBound);
	Mojo.Event.stopListening(this.controller.document, "keyup", this.shoutKeyPressBound);
};
