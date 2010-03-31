function FlickrAuthAssistant(ps) {
	   this.prevScene=ps;
}

FlickrAuthAssistant.prototype.setup = function() {
	//	zBar.hideToolbar();
	
		    this.controller.setupWidget("flickrWeb",
        this.webattributes = {
            url:    '',
            minFontSize:18
            },
        this.webmodel = {
            }
    );

	Mojo.Event.listen(this.controller.get("flickrWeb"),Mojo.Event.webViewTitleUrlChanged, this.handleWebUrl.bind(this));

	
	//gotta set up out app-sig first
	var presig=_globals.flickr_secret + "api_key" + _globals.flickr_key + "methodflickr.auth.getFrob";
	this.api_sig=hex_md5(presig);
	
	//now that we have an api_sig, gotta get the frob...
	var url="http://api.flickr.com/services/rest/?method=flickr.auth.getFrob&api_key="+_globals.flickr_key+"&api_sig="+this.api_sig;
	Mojo.Log.error("getfroburl="+url);
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   onSuccess: this.getFrobSuccess.bind(this),
	   onFailure: this.getFrobFailed.bind(this)
	 });

}

FlickrAuthAssistant.prototype.getFrobSuccess = function(response) {
	//now that we have our frob, sig, key, and secret, we have to build a login URL and send the user to it
	this.frob=response.responseXML.getElementsByTagName('frob')[0].lastChild.data;
	
	//gotta rebuild a sig
	var presig=_globals.flickr_secret+"api_key"+_globals.flickr_key+"frob"+this.frob+"permswrite";
	var api_sig=hex_md5(presig);
	
	var url="http://flickr.com/services/auth/?api_key="+_globals.flickr_key+"&perms=write&frob="+this.frob+"&api_sig="+api_sig;
	
	this.controller.get("flickrWeb").mojo.openURL(url);
	
}
FlickrAuthAssistant.prototype.getFrobFailed = function(response) {
	Mojo.Log.error("frob failed");

}

FlickrAuthAssistant.prototype.handleWebUrl = function(event,title,url) {
	
	if(event.title=="Flickr Services" && event.url=="http://www.flickr.com/services/auth/") {
		
		//got authorization, now we need a token.
		var presig=_globals.flickr_secret+"api_key"+_globals.flickr_key+"frob"+this.frob+"methodflickr.auth.getToken";
		var api_sig=hex_md5(presig);
		
		this.controller.get("flickrWeb").hide();
		this.controller.get("msg").innerHTML="Getting authorization token...";
		
		var url="http://api.flickr.com/services/rest/?method=flickr.auth.getToken&api_key="+_globals.flickr_key+"&frob="+this.frob+"&api_sig="+api_sig;
		var request = new Ajax.Request(url, {
	   		method: 'get',
	   		evalJSON: 'force',
	   		onSuccess: this.getTokenSuccess.bind(this),
	   		onFailure: this.getTokenFailed.bind(this)
	 	});


	}
}

FlickrAuthAssistant.prototype.getTokenSuccess = function(response) {
	//now that we have our frob, sig, key, and secret, we have to build a login URL and send the user to it
	Mojo.Log.error("##token="+response.responseText);
	this.token=response.responseXML.getElementsByTagName('token')[0].lastChild.data;
	this.user=response.responseXML.getElementsByTagName('user')[0];
	this.nsid=this.user.getAttribute("nsid");
	this.username=this.user.getAttribute("username");
	this.fullname=this.user.getAttribute("fullname");
	_globals.flickr_token=this.token;
	_globals.flickr_user=this.username;
	
	this.cookieData=new Mojo.Model.Cookie("flickr");
	this.cookieData.put(
		{
		"token":this.token,
		"nsid":this.nsid,
		"username":this.username,
		"fullname":this.fullname
		}
	)

	if(this.prevScene!=undefined){this.prevScene.controller.get("flickrInfo").innerHTML="Account: <b>"+this.username+"</b>";}
	this.controller.stageController.popScene("flickr-auth");
}
FlickrAuthAssistant.prototype.getTokenFailed = function(event) {
}

FlickrAuthAssistant.prototype.activate = function(event) {
}


FlickrAuthAssistant.prototype.deactivate = function(event) {
}

FlickrAuthAssistant.prototype.cleanup = function(event) {
   		var presig=_globals.flickr_secret+"api_key"+_globals.flickr_key+"frob"+this.frob+"methodflickr.auth.getToken";
		var api_sig=hex_md5(presig);
		
		this.controller.get("flickrWeb").hide();
		this.controller.get("msg").innerHTML="Getting authorization token...";
		
		var url="http://api.flickr.com/services/rest/?method=flickr.auth.getToken&api_key="+_globals.flickr_key+"&frob="+this.frob+"&api_sig="+api_sig;
		var request = new Ajax.Request(url, {
	   		method: 'get',
	   		evalJSON: 'force',
	   		onSuccess: this.getTokenSuccess.bind(this),
	   		onFailure: this.getTokenFailed.bind(this)
	 	});

	   
	  // zBar.showToolbar();
}
