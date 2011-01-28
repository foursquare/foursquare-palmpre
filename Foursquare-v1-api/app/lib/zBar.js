/******************************************************************
	zBar v1.0 by Geoffrey Gauchet (geoff@zhephree.com)
	This code is free to use as long as this comment block is
	retained with the code.
	
	this function renders our custom navigation across the bottom
	of each scene with the active argument, the function will know
	which button should be shown as active we'll have to define the
	different toolbars first.
	
	you'll want to modify the zBar.doCommand() function to handle
	the different commands it'll fire
	
	To show the zBar:
	zBar.render(toolbarname, activeButton);
	
	Once you do this, the zBar will be on every scene until you
	either zBar.hide(); it or render a new toolbar.

******************************************************************/
function zBar() {
}

zBar.toolbars=[
	{
		name: "main",
		buttons:[
			{name:"venues",caption:"Venues",kind:"button",icon:"images/venue_button.png",command:"do-Venues"},
			{name:"friends",caption:"Friends",kind:"button",icon:"images/friends_button.png",command:"do-Friends"},
			{name:"tips",caption:"Tips",kind:"button",icon:"images/todo_button.png",command:"do-Tips"},
			{name:"shout",caption:"Shout",kind:"button",icon:"images/shout_button.png",command:"do-Shout"},
			{name:"profile",caption:"Profile",kind:"button",icon:"images/user_info.png",command:"do-Badges"},
			{name:"leaderboard",caption:"Board",kind:"button",icon:"images/leader_button.png",command:"do-Leaderboard"}
		]
	},
	{
		name: "user",
		buttons:[
			{name:"email",caption:"E-mail",kind:"button",icon:"images/email_button.png",command:"do-Email",noActive:true},
			{name:"phone",caption:"Call",kind:"button",icon:"images/phone_button.png",command:"do-Phone",noActive:true},
			{name:"twitter",caption:"Tweet",kind:"button",icon:"images/twitter_button.png",command:"do-Twitter",noActive:true},
			{name:"facebook",caption:"FBook",kind:"button",icon:"images/facebook_button.png",command:"do-Facebook",noActive:true}
		]
	},
	{
		name: "venue",
		buttons: [
			{name:"checkin",caption:"Check-in",kind:"big-button",icon:"images/check.png",command:"do-Checkin"}/*,
			{name:"back",caption:"Back",kind:"button",icon:"images/back.png",command:"do-Venues"}*/
		]
	}
];

zBar.options={
	textColor: "#fff",
	captionSize: "11px",
	captionSizeWide: "18px",
	fontSize: "14px",
	barHeight: "45px",
	barWidth: "320px",
	barPadding: "9px",
	buttonHeight: "45px",
	buttonWidth: "50px"	
};
zBar.currentBar="";
zBar.activeButton="";

zBar.getToolbar = function(toolbar) {
		//find the right toolbar. default to the first one
		var theToolbar=zBar.toolbars[0];
		for(var t=0;t<zBar.toolbars.length;t++) {
			if(zBar.toolbars[t].name==toolbar){
				var theToolbar=zBar.toolbars[t];
			}
		}

	return theToolbar;
};

zBar.getButton = function(toolbarName, buttonName) {
	var theToolbar = zBar.getToolbar(toolbarName);
	
	for(var b=0;b<theToolbar.buttons.length;b++){
		if(theToolbar.buttons[b].name==buttonName){
			theToolbar.buttons[b].index=b;
			var theButton=theToolbar.buttons[b];
		}
	}
	
	return theButton;
};


zBar.get = function(id) {
	return zBar.document.getElementById(id);
};

//hides button on the currentBar
zBar.hideButton = function(button) {
	var btn=zBar.getButton(zBar.currentBar,button);
	var theToolbar=zBar.getToolbar(zBar.currentBar);
	
	zBar.activeScene.controller.get("zButton-"+btn.index).hide();
	var usedSpace=0;
	for(var b=0;b<theToolbar.buttons.length;b++) {
		if(b != btn.index){
			var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
			usedSpace=usedSpace+parseInt(w);
		}
	}
	//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
	var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
	
	zBar.activeScene.controller.get("zBar").style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";
};

//unhides a button on the currentBar
zBar.showButton = function(button) {
	var btn=zBar.getButton(zBar.currentBar,button);
	var theToolbar=zBar.getToolbar(zBar.currentBar);
	
	zBar.activeScene.controller.get("zButton-"+btn.index).show();
	var usedSpace=0;
	for(var b=0;b<theToolbar.buttons.length;b++) {
		if(b != btn.index){
			var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
			usedSpace=usedSpace+parseInt(w);
		}
	}
	//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
	var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
	
	zBar.activeScene.controller.get("zBar").style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";
};

zBar.render = function(toolbar,active,activeScene) {
	if(toolbar!=zBar.currentBar) { //only render the bar if we haven't already
	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
  	  	zBar.stageController=cardStageController;
		var doc=cardStageController.document;
		zBar.document=doc;

		zBar.activeButton=active;
		zBar.oldBar=zBar.currentBar;
		logthis("rendering zBar");
		var gnav=zBar.document.getElementById("zBar");
		logthis("gnav="+gnav);
		if(gnav){Element.remove(gnav);}
		
		

//		var doc=activeScene.controller.get("main");


		var theToolbar=zBar.getToolbar(toolbar);

		var nav=zBar.document.createElement("div");
		nav.id="zBar";
		nav.HEY="from Zhephree :)";
		nav.style.color=zBar.options.textColor;
		nav.style.height=zBar.options.barHeight;
		nav.style.fontSize=zBar.options.fontSize;
		

		
		var usedSpace=0;
		for(var b=0;b<theToolbar.buttons.length;b++) {
			if(theToolbar.buttons[b].kind=="big-button"){
				usedSpace="320";//screen.width;
			}else{
				var w=(theToolbar.buttons[b].width==undefined)? zBar.options.buttonWidth: theToolbar.buttons[b].width;
				usedSpace=usedSpace+parseInt(w);
			}
		}
		//var usedSpace=theToolbar.buttons.length*parseInt(zBar.options.buttonWidth);
		var pad=Math.floor((parseInt(zBar.options.barWidth)-usedSpace)/2);
		nav.style.padding=zBar.options.barPadding+" 0 0 "+pad+"px";


		nav.addClassName(toolbar);	
		logthis("gonna atatch to body=");
		doc.body.appendChild(nav);
		zBar.currentBar=toolbar;
		logthis("atatched to body");
	
	
		//now we must loop through each toolbar and display its objects
		for(var b=0;b<theToolbar.buttons.length;b++) {
			switch(theToolbar.buttons[b].kind){
				case "button":
					var button=document.createElement("div");
					button.style.width=zBar.options.buttonWidth;
					button.style.height=zBar.options.buttonHeight;
					button.style.float="left";
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=document.createElement("div");
					caption.style.width="97%";
					caption.style.fontSize=zBar.options.captionSize;
					caption.style.textAlign="center";
					caption.style.margin="-4px 0 0 0";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
				
					//set up the event listeners
					Mojo.Event.listen(button,Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen(button,"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen(button,"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
					
					
					break;
				case "wide-button":
					var button=document.createElement("div");
					button.style.width=theToolbar.buttons[b].width;
					button.style.height=(theToolbar.buttons[b].height!=undefined)? theToolbar.buttons[b].height: zBar.options.buttonHeight;
					button.style.marginTop=(theToolbar.buttons[b].marginTop!=undefined)? theToolbar.buttons[b].marginTop: "0";					
					button.style.float="left";
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					button.addClassName("wide");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.style.float="left";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=document.createElement("div");
					caption.style.width=(parseInt(theToolbar.buttons[b].width)-37)+"px";
					caption.style.fontSize=zBar.options.captionSizeWide;
					caption.style.textAlign="center";
					var mt=Math.floor(parseInt(zBar.options.captionSizeWide)*1.4);
					caption.style.margin="-"+mt+"px 0 0 5px";
					caption.style.float="left";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
				
					//set up the event listeners
					Mojo.Event.listen(button,Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen(button,"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen(button,"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
				
					break;
				case "html":
					break;
				case "big-button":
					var button=zBar.document.createElement("div");
					button.style.width="100%";
					button.style.height=zBar.options.buttonHeight;
					button.id="zButton-"+b;
					button.writeAttribute("command",theToolbar.buttons[b].command);
					button.addClassName("zButton");
					//button.addClassName("big");
					if(theToolbar.buttons[b].name==active){
						button.addClassName("active");
					}
					nav.appendChild(button);
				
					var icon=zBar.document.createElement("div");
					icon.style.width="32px";
					icon.style.height="32px";
					icon.style.backgroundImage="url("+theToolbar.buttons[b].icon+")";
					icon.style.backgroundPosition="0 0";
					icon.style.margin="0 9px 0 9px";
					icon.style.float="left";
					icon.id="zIcon-"+b;
					icon.writeAttribute("command",theToolbar.buttons[b].command);
					icon.addClassName("zIcon");
					button.appendChild(icon);
				
					var caption=zBar.document.createElement("div");
					//caption.style.width=(parseInt(theToolbar.buttons[b].width)-37)+"px";
					caption.style.fontSize=zBar.options.captionSizeWide;
					caption.style.textAlign="center";
					var mt=Math.floor(parseInt(zBar.options.captionSizeWide)*1.4);
					mt=0;
					caption.style.margin="-"+mt+"px 0 0 5px";
					caption.style.float="left";
					caption.innerHTML=theToolbar.buttons[b].caption;
					caption.id="zCaption-"+b;
					caption.writeAttribute("command",theToolbar.buttons[b].command);
					caption.addClassName("zCaption");
					button.appendChild(caption);
					
					//gotta center the icon and caption...
					var usedSpace=27+parseInt(caption.offsetWidth);
					var pad=Math.floor((parseInt(320)-usedSpace)/2)-24;
					zBar.document.getElementById("zButton-"+b).setStyle({paddingLeft:pad+"px",paddingTop:"6px"});		
					
					//set up the event listeners
					Mojo.Event.listen(button,Mojo.Event.tap,zBar.doCommand.bindAsEventListener(this));
					Mojo.Event.listen(button,"mousedown",zBar.highlightButton.bindAsEventListener(zBar));
					Mojo.Event.listen(button,"mouseup",zBar.dehighlightButton.bindAsEventListener(zBar));
				
					break;
			}
		}
	}
}

zBar.highlightButton = function(event) {
    //while the event is on the zButton element, the element returned will probably
    //be a child element (icon or caption), so we have to find the parent instead.
    //instead of finding the parent, we'll get the number from the element's id.
    //this fool-proofs the function in case the zButton itself gets returned
	var str=event.target.id.split("-");
	var id=str[1];
	var button=zBar.document.getElementById("zButton-"+id);
	if(!button.hasClassName("highlight")){
		button.addClassName("highlight");
	}
};

zBar.dehighlightButton = function(event) {
	var str=event.target.id.split("-");
	var id=str[1];
	var button=zBar.document.getElementById("zButton-"+id);
	if(button.hasClassName("highlight")){
		button.removeClassName("highlight");
	}
};

zBar.setActive = function(buttonIndex) {
	if(zBar.activeButton!="") {
		var button=zBar.getButton(zBar.currentBar,zBar.activeButton);
		var b=button.index;
		var buttonDIV=zBar.document.getElementById("zButton-"+b);
		buttonDIV.removeClassName("active");
	}
	
	var button=zBar.document.getElementById("zButton-"+buttonIndex);
	button.addClassName("active");
	var tb=zBar.getToolbar(zBar.currentBar);
	zBar.activeButton=tb.buttons[buttonIndex].name;
};

zBar.hideToolbar = function() {
	Mojo.Animation.animateStyle(zBar.document.getElementById("zBar"),'opacity','bezier',{from:100,
																	to:0,
																	duration:0.5,
																	curve:'over-easy',
																	styleSetter:function(value){
																		zBar.document.getElementById('zBar').style.opacity=value/100;
																	
																	},
																	onComplete:function(el){
																		el.hide();
																	}
																	
																	});
};

zBar.showToolbar = function() {
	zBar.get("zBar").show();
	Mojo.Animation.animateStyle(zBar.document.getElementById("zBar"),'opacity','bezier',{from:0,
																	to:100,
																	duration:0.5,
																	curve:'over-easy',
																	styleSetter:function(value){
																		zBar.document.getElementById('zBar').style.opacity=value/100;
																	
																	}
																	
																	});
};


zBar.getElementsByClassName = function(classname,node){
	//function from: http://snipplr.com/view.php?codeview&id=1696
    if(!node) node = zBar.document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

zBar.doCommand = function(event) {
	var str=event.target.id.split("-");
	var id=str[1];
	var tb=zBar.getToolbar(zBar.currentBar);
	if(tb.buttons[id].kind!="big-button" && !tb.buttons[id].noActive){
		zBar.setActive(id);
	}
	
	var command=zBar.document.getElementById("zButton-"+id).readAttribute("command");
	
	
	/****************EDIT CODE BELOW FOR YOUR COMMAND HANDLING********************/
	switch(command) {
		case "do-Venues":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "nearby-venues", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid);
			break;
		case "do-Friends":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "friends-list", transition: Mojo.Transition.crossFade},thisauth,_globals.userData,_globals.username,_globals.password,_globals.uid,_globals.lat,_globals.long,zBar.activeScene);
			break;
		case "do-Tips":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "nearby-tips", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "do-Shout":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "shout", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "do-Badges":
            var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "user-info", transition: Mojo.Transition.crossFade},thisauth,"");
			break;
		case "do-Leaderboard":
			var thisauth=_globals.auth;
			zBar.stageController.swapScene({name: "leaderboard", transition: Mojo.Transition.crossFade},thisauth,"",zBar.activeScene);
			break;
		case "popScene":
			zBar.stageController.popScene();
			break;
		case "do-Checkin":
			Mojo.Event.send(zBar.document.getElementById("docheckin"),Mojo.Event.tap);
			break;
		case "do-Email":
			Mojo.Event.send(zBar.document.getElementById("email_button"),"click");
			break;
		case "do-Phone":
			Mojo.Event.send(zBar.document.getElementById("phone_button"),"click");
			break;
		case "do-Twitter":
			Mojo.Event.send(zBar.document.getElementById("twitter_button"),"click");
			break;
		case "do-Facebook":
			Mojo.Event.send(zBar.document.getElementById("facebook_button"),"click");
			break;
	}		
};



