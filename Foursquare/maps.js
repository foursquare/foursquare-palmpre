/*
GOOGLE MAPS HELPER OBJECT
Code obtained from: http://bchilds.com/blog/2009/10/06/dynamically-loading-google-maps-on-the-palm-pre

*/

function MapsHelper() {
    this.initialized = false;
    
}
MapsHelper.prototype.isLoaded = function()
{
    return this.initialized;
}
MapsHelper.prototype.mapsLoaded = function(id)
{
    try
    {
        logthis("Initializing Maps");
        
        // Load any map objects such as Icons that you will reuse later

        logthis("Maps Initialized");
        
        this.initialized = true;
        if(this.loadCallback != undefined)
        {
            this.loadCallback();
        }
        
    
    } catch(error) {
        logthis("Error Initializing Maps: " + error);
    }
};

MapsHelper.prototype.createMap = function(id)
{
//    var map = new GMap2($(id));
   	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
		var doc=cardStageController.document;

    var map = new google.maps.Map(doc.getElementById(id));
	//map.enableContinuousZoom();
    return map;
};


MapsHelper.prototype.loadedCallback = function(callback)
{
    this.loadCallback = callback;
}

var Maps = new MapsHelper();

function loadMaps () {
    
    logthis("Initializing Google Maps");
    google.load("maps", "2", {"callback" : Maps.mapsLoaded.bind(Maps),"other_params":"sensor=true"});
}

function initLoader() {
   /*	    var appController = Mojo.Controller.getAppController();
  	  	var cardStageController = appController.getStageController("mainStage");
		var doc=cardStageController.document;

    logthis("Initializing Google Loader");
    // Code from Google Sample
    var script = doc.createElement("script");
    script.src = "http://www.google.com/jsapi?key=ABQIAAAAfKBxdZJp1ib9EdLiKILvVxTDKxkGVU7_DJQo4uQ9UVD-uuNX9xRhyapmRm_kPta_TaiHDSkmvypxPQ&callback=mapLoaded";
    script.type = "text/javascript";
    doc.getElementsByTagName("head")[0].appendChild(script);*/
}