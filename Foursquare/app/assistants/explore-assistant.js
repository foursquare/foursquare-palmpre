function ExploreAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   
	   this.exploreRadius=6093;
}

ExploreAssistant.prototype.setup = function() {
	NavMenu.setup(this,{buttons:'explore'});

	var examples=[
		"grilled cheese",
		"fat free",
		"free wifi",
		"sculpture"
	];
	var randomnumber=Math.floor(Math.random()*examples.length);

    this.ecookieData=new Mojo.Model.Cookie("radiusexplore");
	var explore=this.ecookieData.get();
	this.exploreRadius=(explore!=undefined)? explore.radius: 3219;
	
	
	
    this.ecookieData=new Mojo.Model.Cookie("sourceexplore");
	var explore=this.ecookieData.get();	
	this.exploreSource=(explore!=undefined)? explore.source: '';
	
	logthis("source="+this.exploreSource);
	
	var dist=this.exploreRadius;
	if(_globals.units=="si") {					
		var amile=0.000621371192;
		dist=roundNumber(dist*amile,2);
		var unit="";
		if(dist==1){unit="mi";}else{unit="mi";}
	}else if(_globals.units=="metric") {
		dist=roundNumber(dist/1000,2);
		var unit="";
		if(dist==1){unit="km";}else{unit="km";}						
	}else{
		if(dist==1){unit="m";}else{unit="m";}						
	}
	
	this.controller.get("explore-settings-distance").update(dist);
	this.controller.get("explore-settings-unit").update(unit);



	this.controller.setupWidget("explore-distance-slider",
    	this.slideattributes = {
        	minValue: 30,
			maxValue: 16093,
        	round: true,
        	updateInterval: 0.5
	    },
 
		this.slidemodel = {
        	value: this.exploreRadius,
	        disabled: false
    	});
	

    this.controller.setupWidget("explore-source-radio",
        this.attributes = {
            choices: [
                {label: "Everyone", value: ''},
                {label: "Only Friends", value: 'friends'},
                {label: "Only Me", value: 'me'}
            ]
        },
        this.radioModel = {
            value: this.exploreSource,
            disabled: false
        }
    ); 

	this.controller.setupWidget('q', this.attributes = {hintText:'Try "'+examples[randomnumber]+'"',textCase: Mojo.Widget.steModeLowerCase,			changeOnKeyPress: true}, this.qModel = {value:'', disabled:false});

    this.controller.setupWidget("keywordScroller",
        {            mode: 'horizontal'        },
        {        }
    ); 
	this.resultsModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('results-explore', 
					      {itemTemplate:'listtemplates/venueItems',dividerTemplate: 'listtemplates/dividertemplate',dividerFunction: this.groupVenues.bind(this)},
					      this.resultsModel);


	this.exploreModel = {items: [], listTitle: $L('Results')};
    
	this.controller.setupWidget('explore-venues', 
					      {itemTemplate:'listtemplates/exploreItems',dividerTemplate: 'listtemplates/dividertemplate',dividerFunction: this.groupExploreVenues.bind(this)},
					      this.exploreModel);


	this.loadFoodBound=this.loadFood.bind(this);
	this.loadCoffeeBound=this.loadCoffee.bind(this);
	this.loadNightlifeBound=this.loadNightlife.bind(this);
	this.loadShopsBound=this.loadShops.bind(this);
	this.loadArtsBound=this.loadArts.bind(this);
	this.exploreTappedBound=this.exploreTapped.bind(this);
	this.trendingTappedBound=this.trendingTapped.bind(this);
	this.keywordTappedBound=this.keywordTapped.bind(this);
	this.handleSliderBound=this.handleSlider.bind(this);
	this.handleRadioBound=this.handleRadio.bind(this);
	this.explore=this.exploreFunc.bind(this);
	this.stageActivateBound=this.stageActivate.bind(this);
	
	Mojo.Event.listen(this.controller.stageController.document,Mojo.Event.activate, this.stageActivateBound);
	Mojo.Event.listen(this.controller.get('category-food'),Mojo.Event.tap,this.loadFoodBound);
	Mojo.Event.listen(this.controller.get('category-coffee'),Mojo.Event.tap,this.loadCoffeeBound);
	Mojo.Event.listen(this.controller.get('category-nightlife'),Mojo.Event.tap,this.loadNightlifeBound);
	Mojo.Event.listen(this.controller.get('category-shops'),Mojo.Event.tap,this.loadShopsBound);
	Mojo.Event.listen(this.controller.get('category-arts'),Mojo.Event.tap,this.loadArtsBound);
	Mojo.Event.listen(this.controller.get('keywords'),Mojo.Event.tap,this.keywordTappedBound);
	Mojo.Event.listen(this.controller.get('explore-venues'),Mojo.Event.listTap, this.exploreTappedBound);
	Mojo.Event.listen(this.controller.get('results-explore'),Mojo.Event.listTap, this.trendingTappedBound);
	this.onKeyPressHandlerBound= this.onKeyPressHandler.bindAsEventListener(this);	
	Mojo.Event.listen(this.controller.document, "keyup", this.onKeyPressHandlerBound,true);
	Mojo.Event.listen(this.controller.get("explore-distance-slider"), Mojo.Event.propertyChange, this.handleSliderBound);
	Mojo.Event.listen(this.controller.get("explore-source-radio"), Mojo.Event.propertyChange, this.handleRadioBound);
				    
    var loadTrending=false;
   	this.cookieData=new Mojo.Model.Cookie("exploreWelcome");
	var welcome=this.cookieData.get();
	if(welcome){
		if(welcome.saw){
			this.controller.get("explore-welcome").hide();
			loadTrending=true;
		}else{
			this.controller.get("explore-welcome").show();
			this.cookieData=new Mojo.Model.Cookie("exploreWelcome");
			this.cookieData.put({
				saw: true
			});
			
		}
	}else{
		this.controller.get("explore-welcome").show();
		this.cookieData=new Mojo.Model.Cookie("exploreWelcome");
		this.cookieData.put({
			saw: true
		});
	}
	
	if(loadTrending){
		foursquareGet(this,{
			endpoint: 'venues/trending',
			parameters: {ll: _globals.lat+","+_globals.long, limit: 10, radius: this.exploreRadius},
			requiresAuth: true,
			ignoreErrors: false,
			debug: true,
			onSuccess: this.trendingSuccess.bind(this),
			onFailure: this.trendingFailed.bind(this)
		});
	}

};

ExploreAssistant.prototype.handleSlider = function(event){
	var dist=this.slidemodel.value;
	this.exploreRadius=dist;

	if(_globals.units=="si") {					
		var amile=0.000621371192;
		dist=roundNumber(dist*amile,2);
		var unit="";
		if(dist==1){unit="mi";}else{unit="mi";}
	}else if(_globals.units=="metric") {
		dist=roundNumber(dist/1000,2);
		var unit="";
		if(dist==1){unit="km";}else{unit="km";}						
	}else{
		if(dist==1){unit="m";}else{unit="m";}						
	}
	
	this.controller.get("explore-settings-distance").update(dist);
	this.controller.get("explore-settings-unit").update(unit);


	this.cookieData=new Mojo.Model.Cookie("radiusexplore");
	this.cookieData.put(
		{"radius":this.slidemodel.value}
	);

};

ExploreAssistant.prototype.handleRadio = function(event){
	//if(this.radioModel.value!=""){
		this.exploreSource=this.radioModel.value;
	//}


	this.cookieData=new Mojo.Model.Cookie("sourceexplore");
	this.cookieData.put(
		{
		"source":this.exploreSource}
	);

};


ExploreAssistant.prototype.trendingSuccess = function(r) {
	var j=r.responseJSON.response;
	
	var varray=j.venues;
	varray.sort(function(a, b){return (a.location.distance - b.location.distance);});
	this.venueList=[];
	
	if(j.venues.length==0){
		this.controller.get("explore-welcome").show();	
	}else{
		for(var v=0;v<varray.length;v++) {
		logthis("in loop");
			var tmp_venue=varray[v];
			var dist=tmp_venue.location.distance;
			var rawdist=tmp_venue.location.distance;
			logthis("1");
					
			if(_globals.units=="si") {					
				var amile=0.000621371192;
				dist=roundNumber(dist*amile,2);
				var unit="";
				if(dist==1){unit="miles";}else{unit="miles";}
			}else if(_globals.units=="metric") {
				dist=roundNumber(dist/1000,2);
				var unit="";
				if(dist==1){unit="km";}else{unit="km";}						
			}else{
				if(dist==1){unit="meters";}else{unit="meters";}						
			}
			
			logthis("2");
					
			//handle people here
			var herenow=(tmp_venue.hereNow)? tmp_venue.hereNow.count: 0;
			if(herenow>0){
				tmp_venue.peopleicon="on";
			}else{
				tmp_venue.peopleicon="off";
			}
			
			logthis("3");
					
			tmp_venue.herepeople=(herenow==1)? "person": "people";
					
			//handle empty category
			if(tmp_venue.categories.length==0){
				tmp_venue.primarycategory={};
				tmp_venue.primarycategory.icon="images/no-cat.png";
			}else{
				tmp_venue.primarycategory=tmp_venue.categories[0];	
			}
			
			logthis("4");
					
					
			if(tmp_venue.todos.count>0){
				tmp_venue.dogear="block";
			}else{
				tmp_venue.dogear="none";
			}
			
			logthis("5");
					
			if(tmp_venue.specials!=undefined){
				if(tmp_venue.specials.length>0){
					tmp_venue.specialimage='<img src="images/small-special.png" class="small-special">';
				}
			}
			
			logthis("6");
					
			if(tmp_venue.location.crossStreet!=undefined){
				if(tmp_venue.location.crossStreet!=""){
					tmp_venue.crossstreet=" ("+tmp_venue.location.crossStreet+")";
				}
			}
			
			logthis("7");
					
			tmp_venue.distance=dist;
			tmp_venue.unit=unit;
			tmp_venue.rawdistance=rawdist;
			
			logthis("8");
			
			this.venueList.push(tmp_venue);
		}
		this.resultsModel.items=this.venueList;
		this.controller.modelChanged(this.resultsModel);
		this.controller.get("resultListBox").show();	
	}
};

ExploreAssistant.prototype.trendingFailed = function(event) {
	this.controller.get("explore-welcome").show();
};

ExploreAssistant.prototype.groupVenues = function(data) {
	var dist=this.exploreRadius;
	if(_globals.units=="si") {					
		var amile=0.000621371192;
		dist=roundNumber(dist*amile,2);
		var unit="";
		if(dist==1){unit="mile";}else{unit="miles";}
	}else if(_globals.units=="metric") {
		dist=roundNumber(dist/1000,2);
		var unit="";
		if(dist==1){unit="km";}else{unit="km";}						
	}else{
		if(dist==1){unit="meter";}else{unit="meters";}						
	}

	return "Trending Places within "+dist+" "+unit;
};

ExploreAssistant.prototype.groupExploreVenues = function(data) {
	var dist=this.exploreRadius;
	if(_globals.units=="si") {					
		var amile=0.000621371192;
		dist=roundNumber(dist*amile,2);
		var unit="";
		if(dist==1){unit="mile";}else{unit="miles";}
	}else if(_globals.units=="metric") {
		dist=roundNumber(dist/1000,2);
		var unit="";
		if(dist==1){unit="km";}else{unit="km";}						
	}else{
		if(dist==1){unit="meter";}else{unit="meters";}						
	}

	return "Recommended Places within "+dist+" "+unit;
};

ExploreAssistant.prototype.loadFood = function(event) {
	this.exploreSection='food';
	this.explore({section:'food'});
};

ExploreAssistant.prototype.loadCoffee = function(event) {
	this.exploreSection='coffee';
	this.explore({section: 'coffee'});
};

ExploreAssistant.prototype.loadNightlife = function(event) {
	this.exploreSection='drinks';
	this.explore({section: 'drinks'});
};

ExploreAssistant.prototype.loadShops = function(event) {
	this.exploreSection='shops';
	this.explore({section: 'shops'});
};

ExploreAssistant.prototype.loadArts = function(event) {
	this.exploreSection='arts';
	this.explore({section: 'arts'});
};

ExploreAssistant.prototype.exploreTapped = function(event) {
	logthis(event.originalEvent.target.innerHTML);
	var thisParent=event.originalEvent.target.parentNode;
	if(event.originalEvent.target.hasClassName("venue-name")){
		logthis("yes");
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},event.item.venue,null,null,_globals.uid,false,this);
	}else if(thisParent.hasClassName('explore-tip') || thisParent.parentNode.hasClassName('explore-tip')){
		logthis("tip tapped");
	   	this.controller.stageController.pushScene({name:"view-tip",transition:Mojo.Transition.zoomFade},[{tip:event.item.tips[0]}],undefined,true);

	}
};

ExploreAssistant.prototype.stageActivate = function(event) {
			NavMenu.setup(this,{buttons: 'explore'});
};

ExploreAssistant.prototype.trendingTapped = function(event){
		this.controller.stageController.pushScene({name: "venuedetail", transition: Mojo.Transition.zoomFade},event.item,null,null,_globals.uid,false,this);	
};

ExploreAssistant.prototype.keywordTapped = function(event) {
	//logthis(event.originalEvent.target.innerHTML);
	logthis(event.target.innerHTML);
	if(event.target.hasClassName("explore-keyword")){
		this.explore({section: this.exploreSection, query:event.target.innerHTML});
	}
};

ExploreAssistant.prototype.exploreFunc = function(params) {

	this.controller.get("resultListBox").hide();
	var p={ll:_globals.lat+","+_globals.long, radius:this.exploreRadius, basis: this.exploreSource}

	if(params.section!=undefined){
		p.section=params.section;
	}
	
	if(params.query!=undefined && params.query!=''){
		p.query=params.query;
	}

	foursquareGet(this,{
		endpoint: 'venues/explore',
		parameters: p,
		requiresAuth: true,
		ignoreErrors: false,
		debug: true,
		onSuccess: this.exploreSuccess.bind(this),
		onFailure: this.exploreFailed.bind(this)
	});
};

ExploreAssistant.prototype.exploreSuccess = function(r) {
	var j=r.responseJSON.response;
	var keywords=j.keywords.items;
	var warning=(j.warning!=undefined)? j.warning.text: "";
	
	
	if(j.groups.length>0){
		if(j.groups[0].items.length==0){
			this.controller.get("explore-welcome").hide();
			this.controller.get("exploreVenuesBox").hide();
			this.controller.get("notice").innerHTML=j.warning.text;
			this.controller.get("notice").show();
			this.controller.get("warning").hide();
		}else{
			this.controller.get("explore-welcome").hide();
			this.controller.get("notice").hide();
			if(warning!=""){
				this.controller.get("warning").update(warning);
				this.controller.get("warning").show();
			}else{
				this.controller.get("warning").hide();
			}
		}
	}

	
	
	this.controller.get("keywordScroller").show();
	var kw=this.controller.get("keywords");
	kw.innerHTML='';
	for(var k=0; k<keywords.length; k++){
		kw.innerHTML+='<span class="explore-keyword" x-mojo-tap-highlight="momentary" data="'+keywords[k].keyword+'">'+keywords[k].displayName+'</div>';
	}
	
	var words=this.controller.document.querySelectorAll(".explore-keyword");
	var wid=0;
	for(var w=0;w<words.length;w++){
		var d=this.controller.get(words[w]).getDimensions();
		logthis(Object.toJSON(d));
		logthis(d.width);
		wid=wid+parseInt(d.width);
		logthis("cur width="+wid);
	}
	logthis("wid="+wid);
	
	kw.style.width=(wid)+'px';
	//kw.style.height='50px';
	
	
	this.itemsArray=[];
	for(var g=0;g<j.groups.length;g++){
		logthis("in group loop");
		var grouping=j.groups[g].name;
		for(var v=0;v<j.groups[g].items.length;v++){
			logthis("in item loop");
			var tmp_item=j.groups[g].items[v];
		
			
			var reasons=tmp_item.reasons;
			logthis("1");
			switch(reasons.items[0].type){
				case "social":
					var topperclass="social";
					var topper=reasons.items[0].message;
					break;
				case "general":
					var topperclass="general";
					var topper=reasons.items[0].message;
					break;
				case "personal":
					var topperclass="personal";
					var topper=reasons.items[0].message;
					break;
			}
			
			logthis("2");
			tmp_item.topper=topper;
			tmp_item.topperclass=topperclass;
			tmp_item.grouping=grouping;
			logthis("3");
			
			var dist=tmp_item.venue.location.distance;
			var rawdist=tmp_item.venue.location.distance;
			logthis("4");
					
			if(_globals.units=="si") {					
				var amile=0.000621371192;
				dist=roundNumber(dist*amile,2);
				var unit="";
				if(dist==1){unit="miles";}else{unit="miles";}
			}else if(_globals.units=="metric") {
				dist=roundNumber(dist/1000,2);
				var unit="";
				if(dist==1){unit="km";}else{unit="km";}						
			}else{
				if(dist==1){unit="meters";}else{unit="meters";}						
			}
			tmp_item.venue.distance=dist;
			tmp_item.venue.unit=unit;
			
			//handle people here
			var herenow=(tmp_item.venue.hereNow)? tmp_item.venue.hereNow.count: 0;
			if(herenow>0){
				tmp_item.venue.peopleicon="on";
			}else{
				tmp_item.venue.peopleicon="off";
			}
			
			logthis("5");
					
			tmp_item.venue.herepeople=(herenow==1)? "person": "people";


			//handle empty category
			if(tmp_item.venue.categories.length==0){
				tmp_item.venue.primarycategory={};
				tmp_item.venue.primarycategory.icon="images/no-cat.png";
			}else{
				tmp_item.venue.primarycategory=tmp_item.venue.categories[0];	
			}
			
			logthis("6");

			if(tmp_item.venue.location.crossStreet!=undefined){
				if(tmp_item.venue.location.crossStreet!=""){
					tmp_item.venue.crossstreet=" ("+tmp_item.venue.location.crossStreet+")";
				}
			}
			
			logthis("7");
			
			//handle reasons
			if(tmp_item.reasons){
				logthis("7-1");
				var reasonsHTML='';
				for(var r=1;r<tmp_item.reasons.items.length;r++){
					logthis("in reason loop");
					reasonsHTML+='<div class="explore-reason">'+tmp_item.reasons.items[r].message+'</div>';
					logthis("7-2");
				}
				logthis("7-3");
				tmp_item.reasonsHTML=reasonsHTML;
				logthis("7-4");
			}
			
			//handle tip 
			if(tmp_item.tips){
				var tipsHTML='';
				logthis("7-5");
				var tip=tmp_item.tips[0];
				logthis("7-6");
				if(tip.user.relationship=="friend"){
					tip.tipPhoto=tip.user.photo;
				}else{
					tip.tipPhoto='images/explore-tips-icon.png';
				}
				logthis("7-7");
				var tipdate = new Date(tip.createdAt*1000);
				logthis("7-8");
				var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
				var days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
				var m=months[tipdate.getMonth()];
				logthis("7-9");
				var d=days[tipdate.getDay()];
				logthis("7-10");
				var dt=tipdate.getDate();
				logthis("7-11");
				var y=tipdate.getFullYear();
				logthis("7-12");
				
				tip.date=d+" "+m+" "+dt+" "+y;
				logthis("7-13");
				
				tipHTML=Mojo.View.render({object: tip, template:'listtemplates/exploreTip'});
				logthis("7-14");
				tmp_item.tipHTML=tipHTML;
				logthis("7-15");

			}
			
			
			logthis("8");
			
			this.itemsArray.push(tmp_item);
			logthis("9");
		}
	}
	logthis("10");
	
	this.exploreModel.items=this.itemsArray;
	logthis(Object.toJSON(this.itemsArray));
	logthis("11");
	this.controller.modelChanged(this.exploreModel);
	logthis("12");
	this.controller.get("exploreVenuesBox").show();
	logthis("13");
};


ExploreAssistant.prototype.exploreFailed = function(event) {

};

ExploreAssistant.prototype.onKeyPressHandler = function(event) {
//	logthis("keyup");
	var key=event.keyCode;
	logthis(this.qModel.value);
	if(Mojo.Char.isEnterKey(key)){
		setTimeout(function(){
			logthis(this.qModel.value);
			
			if(this.section!=undefined && this.section!=''){
				var p={section: this.section, query: this.qModel.value};
			}else{
				var p={query: this.qModel.value};
			}
			this.explore(p);
		}.bind(this),10);
		
	}
}

ExploreAssistant.prototype.handleCommand = function(event) {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
            	case "do-Venues":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Friends":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},this.auth,_globals.userData,_globals.username,_globals.password,_globals.uid);
					break;
				case "do-Profile":
                case "do-Badges":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
                	break;
                case "do-Todos":
                	var thisauth=auth;
					this.controller.stageController.swapScene({name: "todos", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Shout":
                	var thisauth=_globals.auth;
					this.controller.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",this);
                	break;
                case "do-Leaderboard":
                	var thisauth=_globals.auth;
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
                	this.controller.get("spinnerId").mojo.start();
					this.controller.get("spinnerId").show();
					this.controller.get("resultListBox").style.display = 'none';
                	_globals.tipsList=undefined;
					this.getTips();
                	break;
                case "do-Update":
                	_globals.checkUpdate(this);
                	break;
      			case "do-Nothing":
      				break;
                case "toggleMenu":
                	NavMenu.toggleMenu();
                	break;
				case "show-nearby":
					/*this.resultsModel.items =this.tipsItems; //update list with basic user info
					this.controller.modelChanged(this.resultsModel);
					if(this.tipsItems.length==0){
						this.controller.get("notice").innerHTML="There aren't any tips near you.";
						this.controller.get("notice").show();
					}else{
						this.controller.get("notice").hide();
					}*/
					
					var scroller=this.controller.getSceneScroller();
					scroller.mojo.revealTop();
					this.getTips();
					break;
				case "explore-settings":
					logthis("source="+this.exploreSource);
					this.controller.get("fsq-settings-menu").toggle();
					break;
                case "gototop":
					var scroller=this.controller.getSceneScroller();
					//scroller.mojo.revealTop();
					scroller.mojo.scrollTo(0,0,true);
					break;
			}
		}else if(event.type===Mojo.Event.back){
			if(NavMenu.showing==true){
				event.preventDefault();
				NavMenu.hideMenu();
			}        
        }
};


ExploreAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	      NavMenu.setThat(this);

};

ExploreAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ExploreAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
