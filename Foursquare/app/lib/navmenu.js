var NavMenu={
	attach: function(that){
	
			},

	setup: function(that,params){
				if(params){
					var lc=(params.lastCommand)? params.lastCommand: undefined;
					var view_buttons=(params.buttons)? params.buttons: 'defaults';
					var class=(params.class)? ' '+params.class: '';
				}else{
					var lc=undefined;
					var view_buttons="defaults";
					var class='';
				}
				
				logthis("buttons="+view_buttons);
		logthis("setup nav");
				this.document=that.controller.document;
				this.stageController=that.controller.stageController;
				this.that=that;
				NavMenu.showing=false;
				NavMenu.theMenu=this.document.getElementById('fsq-navmenu');
				NavMenu.scrim=this.document.getElementById('menu-panel-scrim');
		logthis("setup vars");
				if(lc==undefined && NavMenu.lastCommand==undefined){NavMenu.lastCommand="do-Venues";}
				else if(lc!=undefined && NavMenu.lastCommand==undefined){NavMenu.lastCommand=lc;}
				
		logthis("lastcommand stuff");
				if(NavMenu.theMenu==undefined){
		logthis("menu undefined");
					var buttons='';
					for(var g=0;g<this.items.length;g++){
						if(g>0){
							buttons+='<div class="menu-row-spacer"></div>';
						}
						buttons+=Mojo.View.render({template:'listtemplates/menu-item', collection: this.items[g], separator: 'listtemplates/menu-spacer', formatters:{class: this.setClass.bind(this)}});				
					}
					var html=Mojo.View.render({template:'listtemplates/menu',object:{buttons: buttons,requests:_globals.requests}});
	
					var div=this.document.createElement("div");
					div.innerHTML=html;
					
					this.document.body.appendChild(div);
					
					for(var g=0;g<this.items.length;g++){
						for(var i=0;i<this.items[g].length;i++){
							Mojo.Event.listen(that.controller.get('menu-'+this.items[g][i].command),Mojo.Event.tap,this.buttonTapped.bindAsEventListener(this,this.items[g][i].command));	
//							Mojo.Event.listen(that.controller.get('menu-overlay-'+this.items[g][i].command),"mousedown",this.buttonHighlight.bind(this));	
//							Mojo.Event.listen(that.controller.get('menu-overlay-'+this.items[g][i].command),"mouseup",this.buttonUnHighlight.bind(this));	
						}
					}
					NavMenu.theMenu=this.document.getElementById('fsq-navmenu');

					var reqs=getElementsByClassName('friend-request',NavMenu.theMenu);
					for(var r=0;r<reqs.length;r++){
							Mojo.Event.listen(reqs[r],Mojo.Event.tap,this.userReqTapped.bindAsEventListener(this));						
					}

					Mojo.Event.listen(this.document.getElementById("help"),Mojo.Event.tap,this.showHelp.bindAsEventListener(this));						
					
			        NavMenu.menuPanelVisibleTop = NavMenu.theMenu.offsetTop;
			        NavMenu.theMenu.style.top = (0 - NavMenu.theMenu.offsetHeight - NavMenu.theMenu.offsetTop) + 'px';
			        NavMenu.menuPanelHiddenTop = NavMenu.theMenu.offsetTop;
			        NavMenu.theMenu.style.display="none";
				
				}else{
		logthis("menu exists");
					var buttons='';
					for(var g=0;g<this.items.length;g++){
						if(g>0){
							buttons+='<div class="menu-row-spacer"></div>';
						}
						buttons+=Mojo.View.render({template:'listtemplates/menu-item', collection: this.items[g], separator: 'listtemplates/menu-spacer', formatters:{class: this.setClass.bind(this)}});				
					}
					this.document.getElementById('fsq-menu-buttons').innerHTML=buttons;				

					for(var g=0;g<this.items.length;g++){
						for(var i=0;i<this.items[g].length;i++){
							Mojo.Event.listen(that.controller.get('menu-'+this.items[g][i].command),Mojo.Event.tap,this.buttonTapped.bindAsEventListener(this,this.items[g][i].command));	
							//Mojo.Event.listen(that.controller.get('menu-overlay-'+this.items[g][i].command),"mousedown",this.buttonHighlight.bind(this));	
							//Mojo.Event.listen(that.controller.get('menu-overlay-'+this.items[g][i].command),"mouseup",this.buttonUnHighlight.bind(this));	
						}
					}				

				}

				var scrim=this.document.querySelector("#menu-panel-scrim");
				Mojo.Event.listen(scrim,Mojo.Event.tap,this.hideMenu.bind(this));	
				scrim.hide();
		logthis("setup buttons and hid stuff");


				/*setup view menu widget*/				
			try{
		        that.controller.setupWidget(Mojo.Menu.viewMenu,
		        {
		            menuClass: 'no-fade navbar-menu'+class
		        },
		        {
		            visible: true,
		            items: [
		            {},
		            {
		                items: NavMenu.buttons[view_buttons]

		            },
		            {}
		            ]
		        });
		     }catch(e){
		     	logthis(Object.toJSON(e));
		     }
		logthis("viewmenu setup done");
			},
	items: [
			[
				{title: 'Places', command: 'do-Venues', icon: 'images/menu/button-places.png', class: 'normal'},
				{title: 'Check-ins', command: 'do-Friends', icon: 'images/menu/button-checkins.png', class: 'normal'},
				{title: 'Explore', command: 'do-Explore', icon: 'images/menu/button-explore.png', class: 'normal'}
/*				{title: 'Tips', command: 'do-Tips', icon: 'images/menu/button-tips.png', class: 'normal'}*/
			],
			[
				{title: 'Shout', command: 'do-Shout', icon: 'images/menu/button-shout.png', class: 'normal'},
				{title: 'Profile', command: 'do-Profile', icon: 'images/menu/button-profile.png', class: 'normal'},
				{title: 'To-Do', command: 'do-Todos', icon: 'images/menu/button-todo.png', class: 'normal'}
			]
			
			],
	buttonTapped: function(event,command){
			    var appController = Mojo.Controller.getAppController();
		  	  	var cardStageController = appController.getStageController("mainStage");
				var event={
					type: Mojo.Event.command,
					command: command
				};
				
				var buttonId='menu-'+command;
				this.document.getElementById(buttonId).removeClassName('normal');
				this.document.getElementById(buttonId).removeClassName('pressed');
				this.document.getElementById(buttonId).addClassName('active');
				this.hideMenu(function(){
					this.that.handleCommand(event);
				}.bind(this));


				NavMenu.lastCommand=command;
			},
	buttonHighlight: function(event){
				var button=event.target;
				var buttonId=button.id.replace('overlay-','');
				var command=button.id.replace('menu-overlay-','');

				if(NavMenu.lastCommand==command){
					this.document.getElementById(buttonId).removeClassName('active');
				}else{
					this.document.getElementById(buttonId).removeClassName('normal');
				}

				this.document.getElementById(buttonId).addClassName('pressed');
				
			},
	buttonUnHighlight: function(event){
				var button=event.target;
				var buttonId=button.id.replace('overlay-','');
				var command=button.id.replace('menu-overlay-','');

				this.document.getElementById(buttonId).removeClassName('pressed');
				if(NavMenu.lastCommand==command){
					this.document.getElementById(buttonId).addClassName('active');
				}else{
					this.document.getElementById(buttonId).addClassName('normal');
				}
				
			},
	setClass: function(value,model){
					if(NavMenu.lastCommand==model.command){
						return "active";
					}else{
						return "normal";
					}
				},
	hideMenu: function(callback){
					Mojo.Animation.animateStyle(NavMenu.theMenu,"top","linear",{from: NavMenu.menuPanelVisibleTop, to: NavMenu.menuPanelHiddenTop, duration: 0.05, onComplete: callback});
					this.hideScrim();
					var vm=this.document.querySelector('.navbar-menu .palm-menu-group');
					vm.removeClassName("grid");
//					if(callback!=undefined){callback();}
					NavMenu.showing=false;

				},
	showMenu: function(){
					NavMenu.theMenu.style.display="block";
					Mojo.Animation.animateStyle(NavMenu.theMenu,"top","linear",{from: NavMenu.menuPanelHiddenTop, to: NavMenu.menuPanelVisibleTop, duration: 0.1});
					this.showScrim();
					
					var vm=this.document.querySelector('.navbar-menu .palm-menu-group');
					vm.addClassName("grid");
					NavMenu.showing=true;
				},
	toggleMenu: function(){
					if(parseInt(NavMenu.theMenu.style.top)==NavMenu.menuPanelHiddenTop){
						NavMenu.showing=true;
						this.showMenu();
					}else{
						NavMenu.showing=false;
						this.hideMenu();
					}
				},
	showScrim: function(){
					var scrim=this.document.querySelector("#menu-panel-scrim");
					scrim.show();
					Mojo.Animation.animateStyle(scrim,'opacity','linear',{from:0,
																					to:100,
																					duration:0.2,
																					curve:'over-easy',
																					styleSetter:function(value){
																						scrim.style.opacity=value/100;
																					
																					}
																					
																					});
				},
	hideScrim: function(){
					var scrim=this.document.querySelector("#menu-panel-scrim");
					Mojo.Animation.animateStyle(scrim,'opacity','linear',{from:100,
																		to:0,
																		duration:0.2,
																		curve:'over-easy',
																		styleSetter:function(value){
																			scrim.style.opacity=value/100;
																		
																		},
																		onComplete:function(el){
																			el.hide();
																		}
																		
																		});
	
				},
	setThat: function(that){
					this.that=that;
				},
	userReqTapped: function(event){
					var w=event.target;
					var uid=w.readAttribute('userid');
					this.hideMenu(function(){
						this.that.controller.stageController.pushScene({name:"user-info",transition:Mojo.Transition.zoomFade},_globals.auth,uid,this,true);
					}.bind(this));


				},
	showHelp: function(event){
					this.hideMenu(function(){
				         var stageArguments = {name: "helpStage", lightweight: true};
				         var pushMainScene=function(stage){
				         	this.metatap=false;
							stage.pushScene({name:"help",transition:Mojo.Transition.zoomFade});
				         
				         };
				        var appController = Mojo.Controller.getAppController();
						appController.createStageWithCallback(stageArguments, pushMainScene.bind(this.that), "card");
					}.bind(this));


				},
	buttons: {
				defaults: [
							{
							    width: 80,
							    command: 'something',
							    iconPath: "navbar/notifications-menu-item"
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'toggleMenu',
							    iconPath: 'images/menu/grid-icon.png'
							}
							
							],
				venues: [
							{
							    width: 80,
							    command: 'do-Search',
							    iconPath: "images/search-blue.png"
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'toggleMenu',
							    iconPath: 'images/menu/grid-icon.png'
							}
							
							],
				
				navOnly: [
							{
							    width: 80,
							    command: 'nothing',
							    iconPath: "",
							    label: " "
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'toggleMenu',
							    iconPath: 'images/menu/grid-icon.png'
							}
							
							],
				empty: [
							{
							    width: 80,
							    command: 'nothing',
							    iconPath: "",
							    label: " "
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'nothing',
							    iconPath: "",
							    label: " "
							}
							
							],
				checkindetail: [
							{
							    width: 80,
							    command: 'add-photo',
							    iconPath: "images/menu/button-photo.png",
							    label: " "
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'nothing',
							    iconPath: "",
							    label: " "
							}
							
							],
				explore: [
							{
							    width: 80,
							    command: 'explore-settings',
							    iconPath: "images/settings.png",
							    label: " "
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'toggleMenu',
							    iconPath: "images/menu/grid-icon.png",
							    label: " "
							}
							
							],
				badges: [
							{
							    width: 80,
							    command: 'swap-group',
							    iconPath: "images/allbadges.png",
							    label: " "
							
							},
							{
							    command: 'gototop',
							    width: 158,
							    iconPath: 'images/menu/foursquare-logo.png'
							},
							{
							    width: 80,
							    command: 'nothing',
							    iconPath: "",
							    label: " "
							}
							
							]
				
			}
				
};