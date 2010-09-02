function RecommendAssistant(venues) {
	this.venues=venues;
}

RecommendAssistant.prototype.setup = function() {
	if(this.venues.length<50){
		var url = 'https://api.foursquare.com/v1/venues.json';
		auth = _globals.auth;
		var request = new Ajax.Request(url, {
		   method: 'get',
		   evalJSON: 'force',
		   requestHeaders: {Authorization: auth}, 
		   parameters: {geolat:_globals.lat, geolong:_globals.long, geohacc:_globals.hacc,geovacc:_globals.vacc, geoalt:_globals.altitude, l:50},
		   onSuccess: this.venuesSuccess.bind(this),
		   onFailure: this.venuesFailed.bind(this)
		 });
	}else{
		this.venuesSuccess();
	}

};

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function checkCategory(cat) {
	var badcats=["College & Education","Home / Work / Other","Baseball Field","Bridge","Cemetery","Farm","Field","Bank / Financial","Drug Store / Pharmacy","Furniture / Home", "Gas Station / Garage","Gift Shop","Hardware","Laundry","Paper / Office","Post Office","Salon / Barbarshop","Services","Travel"];
	var path=cat.fullpathname.split(":"); //array of path
	
	//cross out full category branches by parents node
	var inArray=false;
	for(var c=0;c<badcats.length;c++){
		if(path[0]==badcats[c]){
			inArray=true;
		}
	}
	if(inArray){
		return false; //if banned category, return false
	}else{ //otherwise, keep looking
		inArray=false;
		for(var c=0;c<badcats.length;c++){
			if(path[1]==badcats[c]){
				inArray=true;
			}
		}
		if(inArray){
			return false;
		}else{
			return true;
		}
	}
}

RecommendAssistant.prototype.venuesSuccess = function(response) {
	if(response){
		this.venueList = [];

		
		if(response.responseJSON.groups[0] != undefined) { //actually got some venues
			this.setvenues=true;
			for(var g=0;g<response.responseJSON.groups.length;g++) {
				var varray=response.responseJSON.groups[g].venues;
				var grouping=response.responseJSON.groups[g].type;
				for(var v=0;v<varray.length;v++) {
					if(varray[v].primarycategory!=undefined){ //only worry about places with categories
						if(checkCategory(varray[v].primarycategory)){ //and categories we want
							this.venueList.push(varray[v]);
							var dist=this.venueList[this.venueList.length-1].distance;
							
							if(_globals.units=="si") {					
								var amile=0.000621371192;
								dist=roundNumber(dist*amile,2);
								var unit="";
								if(dist==1){unit="Mi.";}else{unit="Mi.";}
							}else{
								dist=roundNumber(dist/1000,2);
								var unit="";
								if(dist==1){unit="KM";}else{unit="KM";}						
							}
							
							//handle people here
							var herenow=(this.venueList[this.venueList.length-1].stats)? this.venueList[this.venueList.length-1].stats.herenow: 0;
							if(herenow>0){
								this.venueList[this.venueList.length-1].peopleicon="on";
							}else{
								this.venueList[this.venueList.length-1].peopleicon="off";
							}
							
							//handle ismayor
							if(this.venueList[this.venueList.length-1].ismayor){
								this.venueList[this.venueList.length-1].mayoricon='<img src="images/crown_smallgrey.png"/>';
							}
							
							//handle empty category
							if(this.venueList[this.venueList.length-1].primarycategory==undefined){
								this.venueList[this.venueList.length-1].primarycategory={};
								this.venueList[this.venueList.length-1].primarycategory.iconurl="images/no-cat.png";
							}
							
							this.venueList[this.venueList.length-1].distance=dist;
							this.venueList[this.venueList.length-1].unit=unit;
							if(_globals.hiddenVenues.inArray(varray[v].id)){
						  		//hide it!
						  		this.venueList[this.venueList.length-1].grouping="Hidden";
							}else{
								this.venueList[this.venueList.length-1].grouping=grouping;
							}
							
							if(grouping.indexOf("Matching")>-1) {  //searching
								this.setvenues=false;
							}
						}
					}
				}
			}
			this.lastId=this.venueList[this.venueList.length-1].id;
		}
		
	}else{
		this.venueList=this.venues;
	}
	
	logthis("venue count="+this.venueList.length);
	//logthis(Object.toJSON(this.venueList));
	
	//now that we have venues, loop through them and score them
	//to do this, we must do a /venue call for each one.
	//we'll do a pseudo-loop because of the async nature of ajax
	this.currentVenue=-1;
	this.getVenue();
	

}

RecommendAssistant.prototype.getVenue = function(r) {
	this.currentVenue++;
	
	//if we're getting data back from 4sq, handle it and grade the venue
	if(r){
		var j=r.responseJSON;
		var idx=this.currentVenue-1;
		var venue=j.venue;
		var stats=venue.stats;
		
		//constants for algorithm
		/* which is, btw:
			[(number_of_checkins/10)*checkins_x]+(friend_been_here*friends_x)+(has_mayor*mayor_x)+[(number_of_tips/2)*tips_x]+
				(has_special*specials_x)+[(checkins_for_category/total_category_checkins)*category_x]
		*/
		var checkins_x=5;
		var friends_x=10;
		var mayor_x=10;
		var tips_x=1;
		var specials_x=10;
		var category_x=10;
		
		
		if(stats.beenhere.me==true){
			this.venueList.splice(idx,1); //cut out any venues we've already been to
		}else{ //otherwise, continue grabbing info and tallying score
			this.venueList[idx].checkins=stats.checkins;
			this.veneuList[idx].checkin_score=Math.floor(this.venueList[idx].checkins/10)*checkin_x;
			this.venueList[idx].friendshere=stats.beenhere.friends;
			this.venueList[idx].friends_score=(this.venueList[idx].friendshere)? friends_x: 0;
			this.venueList[idx].hasmayor=(stats.mayor!=undefined)? true: false;
			this.venueList[idx].mayor_score=(this.venueList[idx].hasmayor)? mayor_x: 0;
			this.venueList[idx].tips=venue.tips.length;
			this.venueList[idx].tips_score=Math.floor(this.venueList[idx].tips/2)*tips_x;
			if(venue.specials!=undefined){
				if(venue.specials[0].kind=="here"){
					this.venueList[idx].specials=true;
				}else{
					this.venueList[idx].specials=false;
				}
			}else{
				this.venueList[idx].specials=false;
			}
			this.venueList[idx].specials_score=(this.venueList[idx].specials)? specials_x: 0;
			
			//now that we have our criteria, let's calculate!
			//anything that isn't in a top 5 category gets ignored
			var inArray=false;
			var cattotal=0;
			var totalcounts=0;
			for(var c=0;c<_globals.topCategories.length;c++){
				if(_globals.topCategories[c].name==this.venueList[idx].primarycategory.nodename){
					cattotal=_globals.topCategories[c].count;
				}
				totalcounts=totalcounts+_globals.topCategories[c].count;
			}
			
			//calculate percentage of checkins for this venue's category
			var checkin_percent=cattotal/totalcounts;
			this.venueList[idx].category_score=Math.floor(checkin_percent*category_x); //maximum of 10 points for category
			
			this.venueList[idx].total_score=this.venueList[idx].checkins_score+this.venueList[idx].friends_score+this.venueList[idx].mayor_score+this.venueList[idx].tips_score+this.venueList[idx].specials_score+this.venueList[idx].category_score;
		}
		
		//if this is the last venue
		if(idx==)
		
	}
	
	
	
	var url = 'https://api.foursquare.com/v1/venue.json';
	auth = _globals.auth;
	var request = new Ajax.Request(url, {
	   method: 'get',
	   evalJSON: 'force',
	   requestHeaders: {Authorization:auth},
	   parameters: {vid:this.venueList[this.currentVenue].id},
	   onSuccess: this.getVenue.bind(this),
	   onFailure: this.venuesFailed.bind(this)
	 });

}

RecommendAssistant.prototype.venuesFailed = function(event) {
	logthis(Object.toJSON(event));
}

RecommendAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

RecommendAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

RecommendAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
