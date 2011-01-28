var ServiceRequestWrapper = Class.create({
    initialize: function() 
    {
        this.requestId = 0;
        this.requests = {};       
    },

    request: function(url, optionsIn, resubscribe) 
    {        
        var options = Object.clone(optionsIn),
            requestId = this.requestId++;
        
        var serviceType;
        
        if(url === "palm://com.palm.downloadmanager/")
        {
          serviceType = "downloadmanager";
        }
        else if(resubscribe === true)
        {
          serviceType = "subscription";
        }
        else
        {
          serviceType = "generic";
        }
        
        options.onComplete = this.completeHandler.bind(this, optionsIn, requestId, serviceType);

        this.requests[requestId] = new Mojo.Service.Request(url, options, resubscribe);
        this.requests[requestId].cancel = this.cancelHandler.bind(this, optionsIn, requestId, this.requests[requestId].cancel);
        
        return this.requests[requestId];
    },

    completeHandler: function(optionsIn, requestId, serviceType, response) 
    {
        switch(serviceType)
        {
          case "generic":
            delete this.requests[requestId];  
          break;
            
          case "downloadmanager":
            if(response.completed)
            {          
              delete this.requests[requestId];
            }
          break;
          
          case "subscription":
            // do nothing, it is up to the user to call the cancel funtion.
          break;
          
          default:
            delete this.requests[requestId];
          break; 
        }
        
        optionsIn.onComplete && optionsIn.onComplete(response);
    },
    cancelHandler: function(optionsIn, requestId, original) 
    {
        return function() 
        {
            delete this.requests[requestId];

            original.apply(this, arguments);
        };
    }
});


var AjaxRequestWrapper = Class.create({
    initialize: function() 
    {
        this.requestId = 0;
        this.requests = {};
    },

    request: function(url, optionsIn) 
    {
        var options = Object.clone(optionsIn),
            requestId = this.requestId++;
        options.onComplete = this.completeHandler.bind(this, url, optionsIn, requestId);

        this.requests[requestId] = new Ajax.Request(url, options);
        return this.requests[requestId];
    },

    completeHandler: function(url, optionsIn, requestId, response) 
    {        
        delete this.requests[requestId];

        optionsIn.onComplete && optionsIn.onComplete(response);
    }
});
