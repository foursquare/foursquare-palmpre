function ShoutAssistant(a) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   this.auth=a;
}

ShoutAssistant.prototype.setup = function() {
  Mojo.Log.error("################shouting?");
  //this.initData(this.data);
  
  // Setup button and event handler
  this.controller.setupWidget("okButtonShout",
    this.attributes = {type : Mojo.Widget.activityButton},
    this.OKButtonModel = {
      buttonLabel: "Shout!",
      disabled: false
    }
  );
  Mojo.Event.listen(this.controller.get('okButtonShout'), Mojo.Event.tap, this.okTappedShout.bindAsEventListener(this));
  Mojo.Event.listen(this.controller.get('attach'), Mojo.Event.tap, this.attachImage.bindAsEventListener(this));
  Mojo.Event.listen(this.controller.get('img-preview'), Mojo.Event.tap, this.removeImage.bindAsEventListener(this));
  Mojo.Event.listen(this.controller.get('attach'), "mousedown", function(){this.controller.get("attachicon").addClassName("pressed");}.bindAsEventListener(this));
  Mojo.Event.listen(this.controller.get('attach'), "mouseup", function(){this.controller.get("attachicon").removeClassName("pressed");}.bindAsEventListener(this));

  
  	this.cookieData=new Mojo.Model.Cookie("credentials");
	var credentials=this.cookieData.get();
	var pings=(credentials.ping=="on")? '0': '1';
	var stt=(credentials.savetotwitter==true)? '1': '0';
	var stf=(credentials.savetofacebook==true || credentials.savetofacebook=='true')? '1': '0';
  
	this.controller.setupWidget(Mojo.Menu.appMenu,
       _globals.amattributes,
       _globals.ammodel);

    this.controller.setupWidget("chkTwitter",
         this.twattributes = {
             trueValue: '1',
             falseValue: '0', 
             trueLabel: 'On',
             falseLabel: 'Off'
         },
         this.twmodel = {
             value: stt,
             disabled: false
         });
    this.controller.setupWidget("chkFacebook",
         this.fbattributes = {
             trueValue: '1',
             falseValue: '0',
             trueLabel: 'On',
             falseLabel: 'Off'
         },
         this.fbmodel = {
             value: stf,
             disabled: false
         });
	Mojo.Log.error("twittersave:"+credentials.savetotwitter);
  		
  		
  		this.lhc=new Mojo.Model.Cookie("photohost");
		var lh=this.lhc.get();
		_globals.lasthost=(lh)? lh.photohost: "pikchur";
Mojo.Log.error("ph="+_globals.lasthost);
//_globals.lasthost="flickr";
  
      this.controller.setupWidget("photohostList",
        this.phAttributes = {
            choices: [
                {label: "Flickr", value: "flickr"},
                {label: "TweetPhoto", value: "tweetphoto"},
                {label: "Pikchur", value: "pikchur"},
                {label: "FSPic", value: "fspic"}

            ]},
        this.phModel = {
            value: _globals.lasthost,
            disabled: false
        }
    ); 
	  Mojo.Event.listen(this.controller.get("photohostList"), Mojo.Event.propertyChange, this.handlePhotohost);
	this.controller.setupWidget('shout', this.tipAttributes = {hintText:'Add a shout',multiline:true,focus:true}, this.tipModel = {value:'', disabled:false});

    /*this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmattributes = {
           spacerHeight: 0,
           menuClass: 'no-fade'
        },
        this.cmmodel = {
          visible: true,
          items: [{
          	items: [ 
                 { iconPath: "images/venue_button.png", command: "do-Venues"},
                 { iconPath: "images/friends_button.png", command: "do-Friends"},
                 { iconPath: "images/todo_button.png", command: "do-Tips"},
                 { iconPath: "images/shout_button.png", command: "do-Shout"},
                 { iconPath: "images/badges_button.png", command: "do-Nothing"},
                 { iconPath: 'images/leader_button.png', command: 'do-Leaderboard'}
                 ],
            toggleCmd: "do-Nothing"
            }]
    }_globals.cmmodel);*/
_globals.ammodel.items[0].disabled=true;
this.controller.modelChanged(_globals.ammodel);
  this.controller.get("photohostList").hide();

//	this.init();
}

ShoutAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.get('shout').mojo.focus();
}

ShoutAssistant.prototype.okTappedShout = function() {

	Mojo.Log.error("###check in please??");
	if (_globals.auth) {
		Mojo.Log.error("###trying to shout");
	
		//before doing the actual shout, see if we have a photo. if so, handle that
		if(this.hasPhoto){
			Mojo.Controller.getAppController().showBanner("Uploading photo...", {source: 'notification'});
			switch(this.phModel.value){
				case "flickr":
					var ptitle=this.tipModel.value;
					var pdesc=this.tipModel.value;
					var ptags="";
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
					Mojo.Log.error("##set up params");
	
					var params=[];
					params.push({"key":"api_key","data":api_key,"contentType":"text/plain"});
					params.push({"key":"auth_token","data":auth_token,"contentType":"text/plain"});
					params.push({"key":"api_sig","data":api_sig,"contentType":"text/plain"});
					params.push({"key":"description","data":pdesc,"contentType":"text/plain"});
					params.push({"key":"format","data":format,"contentType":"text/plain"});
					params.push({"key":"nojsoncallback","data":nojsoncallback,"contentType":"text/plain"});
					params.push({"key":"tags","data":ptags,"contentType":"text/plain"});
					params.push({"key":"title","data":ptitle,"contentType":"text/plain"});
	
					Mojo.Log.error("##created params array");
	

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
						 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
						 	//gonna old school parse the xml since it's in plain etxt and not an object...
						 	var xml=resp.responseString;
						 	if(xml) {
							 	if(xml.indexOf('stat="ok"')>-1) {
							 		var ps=xml.indexOf("<photoid>")+9;
							 		var pe=xml.indexOf("</photoid>");
							 		var len=pe-ps;
							 		var photoid=parseInt(xml.substring(ps,pe));
							 		Mojo.Log.error("photoid="+photoid);
							 		var epid=this.base58_encode(photoid);
							 		Mojo.Log.error("epid="+epid);
						 			var extra="http://flic.kr/p/"+epid;
						 			
						 			this.doShout(extra);
						 		}
						 	}
						 	
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(resp));
					 	}.bind(this)
			        });
	 
					break;
				case "pikchur":
					var eauth=_globals.auth.replace("Basic ","");
					var plaintext=Base64.decode(eauth);//Njk1
					var creds=plaintext.split(":");
					var un=creds[0];
					var pw=creds[1];
					var params=[];
					params.push({"key":"api_key","data":"QTG1n51CVNEJNDkkiMQIXQ","contentType":"text/plain"});
					params.push({"key":"encodedAuth","data":eauth,"contentType":"text/plain"});
					params.push({"key":"message","data":this.tipModel.value,"contentType":"text/plain"});
					params.push({"key":"geolat","data":_globals.lat,"contentType":"text/plain"});
					params.push({"key":"geolon","data":_globals.long,"contentType":"text/plain"});
					params.push({"key":"service","data":"foursquare","contentType":"text/plain"});
					params.push({"key":"source","data":"Njk1","contentType":"text/plain"});
					Mojo.Log.error("params="+Object.toJSON(params));
				
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
						 	Mojo.Log.error('Success: '+Object.toJSON(resp));
						 	if(r != undefined) {
						 		//var json=eval("("+r+")");
						 		//var url=json.url;
						 		//this.doShout(url);
								this.checkInSuccess(r);
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
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
            			    'url': "http://tweetphotoapi.com/api/upload.aspx",
			                'fileLabel': 'media',
            			    'fileName': this.fileName,
			                'postParameters': params,
            			    'subscribe': true
			            },
            			onSuccess: function (resp,j){
						 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
						 	var r=resp.responseString;
						 	if(r != undefined && r != "") {
						 		var json=eval("("+r+")");
						 		var url=json.MediaUrl;
						 		Mojo.Log.error("longurl="+url);
						 		//shorten with bit.ly
						 		var url = 'http://is.gd/api.php?longurl='+url;
								var request = new Ajax.Request(url, {
								   method: 'get',
								   evalJSON: 'false',
								   onSuccess: function(r){
								   		var url=r.responseText;
								   		Mojo.Log.error("url="+url);
								   		this.doShout(url);
								   }.bind(this),
								   onFailure: function (e){
	  									Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 				}.bind(this)
								 });

						 	}else{
								//Mojo.Controller.getAppController().showBanner("Error uploading photo!", {source: 'notification'});
								//this.controller.get("okButtonShout").mojo.deactivate();

						 	}
//							if(resp.re)
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
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
						 	Mojo.Log.error('Success : ' + Object.toJSON(resp));
						 	var xml=resp.responseString;
						 	if(xml) {
							 	if(xml.indexOf('status="ok"')>-1) {
							 		var ps=xml.indexOf("<url>")+5;
							 		var pe=xml.indexOf("</url>");
							 		var len=pe-ps;
							 		var url=xml.substring(ps,pe);
						 			
						 			this.doShout(url);
						 		}
						 	}
					  	}.bind(this),
			            onFailure: function (e){
	  						Mojo.Log.error('Failure : ' + Object.toJSON(e));
					 	}.bind(this)
			        });

					break;
			}
		}else{
			this.doShout();
		}
		
	
	
	
	} else {
		Mojo.Controller.getAppController().showBanner("Not logged in!", {source: 'notification'});
	}
	//this.widget.mojo.close();
}

ShoutAssistant.prototype.getTheHeaders =function(r){
				Mojo.Log.error("success dude!: "+r.statusText);
				//var cl=r.getHeader("Content-Length");
				var text=r.responseText;
   var ff = [];
   var mx = text.length;   
   var scc= String.fromCharCode;
   for (var z = 0; z < mx; z++) {
       ff[z] = scc(text.charCodeAt(z) & 255);
   }
   var b = ff.join("");
   
   var l =b.length;
				Mojo.Log.error("length="+l);
				Mojo.Log.error(text);
}

ShoutAssistant.prototype.doShout = function(extra) {
	extra=(extra==undefined)? "": extra;
		var url = 'http://api.foursquare.com/v1/checkin.json';
		var request = new Ajax.Request(url, {
			method: 'post',
			evalJSON: 'true',
			requestHeaders: {
				Authorization: _globals.auth
			},
			parameters: {
				shout: this.tipModel.value+" "+extra,
				twitter: this.twmodel.value,
				facebook: this.fbmodel.value
			},
			onSuccess: this.checkInSuccess.bind(this),
			onFailure: this.checkInFailed.bind(this)
		});

}

ShoutAssistant.prototype.checkInSuccess = function(response) {
	Mojo.Log.error(response.responseText);
		this.controller.get("okButtonShout").mojo.deactivate();
	this.tipModel.value="";
	this.fileName="";
	this.controller.get("img").src="";
	this.hasPhoto=false;
	this.fileName="";
	this.controller.get("img-preview").hide();
	this.controller.get("photohostList").hide();
	this.controller.get("listborder").hide();

	this.controller.modelChanged(this.tipModel);
	Mojo.Controller.getAppController().showBanner("Sent your shout to your friends!", {source: 'notification'});
}

ShoutAssistant.prototype.checkInFailed = function(response) {
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
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,this);
					break;
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Tips":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                //	var checkinDialog = this.controller.showDialog({
				//		template: 'listtemplates/do-shout',
				//		assistant: new DoShoutDialogAssistant(this,auth)
				//	});
                	//var thisauth=auth;
				//	this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);

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
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
                case "do-Nothing":
                	break;
            }
        }
    }

ShoutAssistant.prototype.attachImage = function(event) {
	Mojo.FilePicker.pickFile({'actionName':'Attach','kinds':['image'],'defaultKind':'image','onSelect':function(fn){
	this.fileName=fn.fullPath;
	Mojo.Log.error(Object.toJSON(fn));
	this.hasPhoto=true;
	this.controller.get("img").src=this.fileName;
	this.controller.get("img-preview").show();
	this.controller.get("photohostList").show();
	this.controller.get("listborder").show();
	}.bind(this)},this.controller.stageController);
}

ShoutAssistant.prototype.removeImage = function(event) {
	this.controller.get("img").src="";
	this.hasPhoto=false;
	this.fileName="";
	this.controller.get("img-preview").hide();
	this.controller.get("shout").mojo.focus();
	this.controller.get("photohostList").hide();
	this.controller.get("listborder").hide();

}


ShoutAssistant.prototype.handlePhotohost = function(event) {
		var ph=this.phModel.value;
		this.cookieData=new Mojo.Model.Cookie("photohost");
		this.cookieData.put(
			{"photohost":ph}
		)
		_globals.lasthost=ph;

}

ShoutAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ShoutAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
