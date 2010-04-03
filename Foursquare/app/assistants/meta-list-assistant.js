function MetaListAssistant(w,la,lo,a,c,s) {
	this.what=w;
	this.vgeolat=la;
	this.vgeolong=lo;
	this.vaddress=a;
	this.vcity=c;
	this.vstate=s;
}

MetaListAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
    this.controller.setupWidget("overlaySpinner",
         this.attributes = {
             spinnerSize: 'large'
         },
         this.model = {
             spinning: true 
         });

	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('results-meta-list', 
					      {itemTemplate:'listtemplates/overlayItems'},
					      this.resultsModel);
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get('results-meta-list'),Mojo.Event.listTap, this.listTapped.bindAsEventListener(this));
	
	if(this.what=="banks"){
		this.controller.get("pagetitle").update("NEARBY BANKS AND ATMs");
		this.showBanks();
	}else if(this.what=="parking"){
		this.controller.get("pagetitle").update("NEARBY PARKING");
		this.showParking();
	}
};

MetaListAssistant.prototype.showBanks = function() {
	var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22financial:banks%22}}],%22radius%22:%221km%22,%22limit%22:20}';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.banksSuccess.bind(this),
			onFailure: this.banksFailed.bind(this)
	});
}

MetaListAssistant.prototype.banksSuccess = function(response) {
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	var entities=j.entity;
	if(entities.length>0) {
		var banks=[];
		for(var e=0;e<entities.length;e++) {
			var thisbank={};
			thisbank.address=entities[e].viewlisting.address[0];
			thisbank.city=entities[e].viewlisting.address[1];
			thisbank.zip=entities[e].viewlisting.address[2];
			thisbank.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisbank.distance=dist;
			thisbank.unit=unit;
			banks.push(thisbank);
		}
		this.resultsModel.items=banks;
		this.controller.modelChanged(this.resultsModel);
		this.controller.get("results-meta-list").show();
	}else{
		this.controller.get("results-meta-list").hide();
		this.controller.get("overlay-content").show();
		this.controller.get("overlay-content").innerHTML='There are no nearby banks or ATMs.';
	}
	
}
MetaListAssistant.prototype.banksFailed = function(response) {
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("results-meta-list").hide();
	this.controller.get("overlay-content").show();
	this.controller.get("overlay-content").innerHTML='Error loading nearby banks and ATMs.';

}


MetaListAssistant.prototype.showParking = function() {
	var url='http://api.geoapi.com/v1/q?apikey=3KbTrN2r4h&pretty=1&q={%22lat%22:'+this.vgeolat+',%22lon%22:'+this.vgeolong+',%22entity%22:[{%22guid%22:null,%22name%22:null,%22geom%22:null,%22distance-from-origin%22:null,%22type%22:%22business%22,%22view.listing%22:{%22*%22:null,%22verticals%22:%22tourist-center:parking%22}}],%22radius%22:%221km%22,%22limit%22:20}';
	var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'true',
			onSuccess: this.parkingSuccess.bind(this),
			onFailure: this.parkingFailed.bind(this)
	});
}

MetaListAssistant.prototype.parkingSuccess = function(response) {
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();

	//there's a stupid dot in one of the object properties that effs all this up. gotta fix it.
	var j=eval("("+response.responseText.replace(/view.listing/ig,"viewlisting").replace(/distance-from-origin/ig,"distance")+")");
	Mojo.Log.error(response.responseText);
	var entities=j.entity;
	
	if(entities.length>0) {
		var parking=[];
		for(var e=0;e<entities.length;e++) {
			var thisparking={};
			thisparking.address=entities[e].viewlisting.address[0];
			thisparking.name=entities[e].viewlisting.name;
			var dist=parseInt(entities[e].distance);
			var amile=0.000621371192;
			dist=roundNumber(dist*amile,1);
			var unit="";
			if(dist==1){unit="mile";}else{unit="miles";}
			thisparking.distance=dist;
			thisparking.unit=unit;
			banks.push(thisbank);
		}
		this.resultsModel.items=parking;
		this.controller.modelChanged(this.resultsModel);
		this.controller.get("results-meta-list").show();
	}else{
		Mojo.Log.error("no parking");
		this.controller.get("overlay-content").show();
		this.controller.get("results-meta-list").hide();
		this.controller.get("overlay-content").innerHTML='There are no nearby <br/>parking lots.';
	}
	
}
MetaListAssistant.prototype.parkingFailed = function(response) {
	this.controller.get("overlaySpinner").mojo.stop();
	this.controller.get("overlaySpinner").hide();
	this.controller.get("results-meta-list").hide();
	this.controller.get("overlay-content").show();
	this.controller.get("overlay-content").innerHTML='Error loading nearby parking.';
}





MetaListAssistant.prototype.listTapped = function(event) {
	var startaddr=(this.vaddress!="" && this.vaddress!=undefined)? this.vaddress+", "+this.vcity+","+this.vstate: "("+this.vgeolat+","+this.vgeolong+")";
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
      method: 'open',
      parameters: {
         id: 'com.palm.app.maps',
         params: {
 			saddr: startaddr,
 			daddr:  event.item.address+", "+ event.item.city+" "+ event.item.zip
         }
      }
   });

}





MetaListAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

MetaListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MetaListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
