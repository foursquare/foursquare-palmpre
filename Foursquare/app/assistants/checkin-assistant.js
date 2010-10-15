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
	this.stt=(credentials.savetotwitter==true)? '1': '0';
	this.stf=(credentials.savetofacebook==true || credentials.savetofacebook=='true')? '1': '0';

	Mojo.Log.error("stf: %i, stt: %i",this.stf,this.stt);

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
		logthis("before: stf: %i, stt: %i",this.stf,this.stt);
		if(this.stf=="1"){
			this.stf="0";
			this.controller.get('share-facebook').removeClassName("pressed");
		}else{
			this.stf="1";
			this.controller.get('share-facebook').addClassName("pressed");
		}
		logthis("after: stf: %i, stt: %i",this.stf,this.stt);
	}.bindAsEventListener(this);


	if(this.stt=="1"){
		this.controller.get('share-twitter').addClassName("pressed");
	}

	this.twShareBound=function(){
		Mojo.Log.error("before: stf: %i, stt: %i",this.stf,this.stt);
		if(this.controller.get('share-twitter').hasClassName("pressed")){
			this.stt="0";
			this.controller.get('share-twitter').removeClassName("pressed");
		}else{
			this.stt="1";
			this.controller.get('share-twitter').addClassName("pressed");		
		}
		Mojo.Log.error("after: stf: %i, stt: %i",this.stf,this.stt);
	}.bindAsEventListener(this);


	if(this.venueless){
		this.venue.address='';
	}
	this.controller.get("checkin-info").update("<b>"+this.venue.name+"</b><br/>"+this.venue.address);
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
};

CheckinAssistant.prototype.okTapped = function() {
		//before doing the actual shout, see if we have a photo. if so, handle that
		if(this.hasPhoto){
			this.uploading=true;
			Mojo.Controller.getAppController().showBanner("Uploading media...", {source: 'notification'});
			switch(this.phModel.value){
				case "flickr":
					var ptitle=this.tipModel.value;
					var pdesc=this.tipModel.value;
					var ptags=(this.venueless)? this.venue.name: "foursquare:venue="+this.venue.id+", "+this.venue.name;
					var format="xml";
					var nojsoncallback="1";
					var api_key=_globals.flickr_key;
					var auth_token=_globals.flickr_token;
					var presig=_globals.flickr_secret+"api_key"+api_key+"auth_token"+auth_token+"description"+pdesc+"format"+format+"nojsoncallback"+nojsoncallback+"tags"+ptags+"title"+ptitle;
					var api_sig=hex_md5(presig);
	
					var params={
						"title":ptitle,
						"description":pdesc,
						"tags":ptags
					};
	
					var params=[];
					params.push({"key":"api_key","data":api_key,"contentType":"text/plain"});
					params.push({"key":"auth_token","data":auth_token,"contentType":"text/plain"});
					params.push({"key":"api_sig","data":api_sig,"contentType":"text/plain"});
					params.push({"key":"description","data":pdesc,"contentType":"text/plain"});
					params.push({"key":"format","data":format,"contentType":"text/plain"});
					params.push({"key":"nojsoncallback","data":nojsoncallback,"contentType":"text/plain"});
					params.push({"key":"tags","data":ptags,"contentType":"text/plain"});
					params.push({"key":"title","data":ptitle,"contentType":"text/plain"});
	
	

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
			                'postParameters': params,
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
						 			
									this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+extra,this.sfmodel.value,this.stt,this.stf);
						 		}
						 	}
						 	
					  	}.bind(this),
			            onFailure: function (e){
	  						logthis('Failure : ' + Object.toJSON(resp));
					 	}.bind(this)
			        });
	 
					break;
				case "pikchur":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];
					var params=[];
					params.push({"key":"api_key","data":"QTG1n51CVNEJNDkkiMQIXQ","contentType":"text/plain"});
					params.push({"key":"encodedAuth","data":eauth,"contentType":"text/plain"});
					params.push({"key":"message","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"geolat","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"geolon","data":_globals.long,"contentType":"text/plain"});
					if(!this.venueless){
						params.push({"key":"venue_id","data":this.venue.id,"contentType":"text/plain"});
					}
					params.push({"key":"service","data":"foursquare","contentType":"text/plain"});
					params.push({"key":"source","data":"Njk1","contentType":"text/plain"});
				
				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://api.pikchur.com/geosocial/upload/json",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	var r=resp.responseString;
						 	if(r != undefined) {
								logthis("r="+r);
						 		var json=eval("("+r+")");
						 		var url=json.post.url;
								this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.stt,this.stf);
								//this.checkInSuccess(r);
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						logthis('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
				case "tweetphoto":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"78c45db0-e4eb-467c-9215-695072bcf85a","contentType":"text/plain"});
					params.push({"key":"tpservice","data":"Foursquare","contentType":"text/plain"});
					params.push({"key":"message","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"latitude","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"longitude","data":_globals.long,"contentType":"text/plain"});
					if(!this.venueless){
						params.push({"key":"vid","data":this.venue.id,"contentType":"text/plain"});
					}
					params.push({"key":"response_format","data":"JSON","contentType":"text/plain"});
					params.push({"key":"username","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});

				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://api.plixi.com/api/upload.aspx",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	logthis('Success : ' + Object.toJSON(resp));
						 	var r=resp.responseString;
						 	if(r != undefined && r != "") {
						 		var json=eval("("+r+")");
						 		var url=json.MediaUrl;
						 		logthis("longurl="+url);
						 		//shorten with is.gd
						 		var url = 'http://is.gd/api.php?longurl='+url;
								var request = new Ajax.Request(url, {
								   method: 'get',
								   evalJSON: 'false',
								   onSuccess: function(r){
								   		var url=r.responseText;
								   		logthis("url="+url);
								   		this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.stt,this.stf);

								   }.bind(this),
								   onFailure: function (e){
	  									logthis('Failure : ' + Object.toJSON(e));
					 				}.bind(this)
								 });


						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						logthis('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
				case "fspic":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];

					var params=[];
					params.push({"key":"api_key","data":"q9hpcah58aaqtd7pp40orr21rga1wi","contentType":"text/plain"});
					params.push({"key":"shout_text","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"phone_or_email","data":un,"contentType":"text/plain"});
					params.push({"key":"password","data":pw,"contentType":"text/plain"});
					if(!this.venueless){
						params.push({"key":"vid","data":this.venue.id,"contentType":"text/plain"});
					}

				    var appController = Mojo.Controller.getAppController();
			  	  	var cardStageController = appController.getStageController("mainStage");
					var controller = cardStageController.activeScene();
			        // Queue the upload request with the download manager service.
			        controller.serviceRequest('palm://com.palm.downloadmanager/', {
            			method: 'upload',
			            parameters: {
            			    'url': "http://fspic.com/api/uploadPhoto",
			                'fileLabel': 'photo',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	var xml=resp.responseString;
						 	if(xml) {
							 	if(xml.indexOf('status="ok"')>-1) {
							 		var ps=xml.indexOf("<url>")+5;
							 		var pe=xml.indexOf("</url>");
							 		var len=pe-ps;
							 		var url=xml.substring(ps,pe);
						 			
									this.checkIn(this.venue.id,this.venue.name,this.tipModel.value+" "+url,this.sfmodel.value,this.stt,this.stf);
						 		}
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						logthis('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
			}
		}else{
			this.checkIn(this.venue.id,this.venue.name,this.tipModel.value,this.sfmodel.value,this.stt,this.stf);
		}	
}

CheckinAssistant.prototype.attachImage = function(event) {
	Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image','video'],'defaultKind':'image','onSelect':function(fn){
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
		this.controller.get("photorow").show();
		//this.controller.get("listborder").show();
		this.controller.get("shout").mojo.focus();
		
		this.urllen=this.urlLengths[this.phModel.value];	
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

CheckinAssistant.prototype.checkIn = function(id, n, s, sf, t, fb) {
	if (_globals.auth) {
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
		sf=(sf==0)? 1: 0;

		var params={
				shout: s,
				private: sf,
				twitter: t,
				facebook: fb
			};
			
		if(!this.venueless){
			params.vid=id;
		}else{
			params.venue=this.venue.name;
		}
		
		foursquarePost(this, {
			endpoint: 'checkin.json',
			requiresAuth: true,
			parameters: params,
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
			
		});
	} else {
	}
}
CheckinAssistant.prototype.checkInSuccess = function(response) {
	var json=response.responseJSON;
	//this.controller.get("docheckin-fields").hide();
	//this.controller.get("overlay-content").innerHTML="";
	//this.controller.get("meta-overlay").hide();
	
	this.controller.stageController.swapScene({name: "checkin-result", transition: Mojo.Transition.crossFade},json,this.uid);

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
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
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
