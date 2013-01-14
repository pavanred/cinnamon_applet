/*------------------------
 * Imports
 * ------------------------*/
const Soup = imports.gi.Soup;

function LiveScore(a_params){

	this.apiRoot=undefined;
	this.icon=undefined;
	this.displayCancelled = undefined;
	this.displayDelayed = undefined;
	this.displayFinal = undefined;
	this.displaySchedule = undefined;

	this.callbacks={
		onError:undefined,
		onScoreUpdate:undefined
	};

	if (a_params != undefined){
		
		this.apiRoot = a_params.apiRoot;
		this.icon = a_params.icon;
		this.displayCancelled = a_params.displayCancelled;
		this.displayDelayed = a_params.displayDelayed;
		this.displayFinal = a_params.displayFinal;
		this.displaySchedule = a_params.displaySchedule;
		
		if (a_params.callbacks!=undefined){
			this.callbacks.onError=a_params.callbacks.onError;
			this.callbacks.onScoreUpdate=a_params.callbacks.onScoreUpdate;
		}
	}
	try {
		this.httpSession = new Soup.SessionAsync();
	} catch (e){ throw 'LiveScore: Creating SessionAsync failed: ' + e; }
	
	try {
		Soup.Session.prototype.add_feature.call(this.httpSession, new Soup.ProxyResolverDefault());
	} catch (e){ throw 'LiveScore: Adding ProxyResolverDefault failed: ' + e; }
}

LiveScore.prototype.initialised = function(){
	
	return this.apiRoot != undefined 
		&& this.callbacks.onError != undefined 
		&& this.callbacks.onScoreUpdate != undefined;
}

LiveScore.prototype.loadScores = function(){
	var url = this.apiRoot;
	
	let this_ = this;
	let message = Soup.Message.new('GET', url);	
	this.httpSession.queue_message(message, function(session,message){this_.onHandleResponse(session,message)});	
}

LiveScore.prototype.onHandleResponse = function(session, message) {
	
	if (message.status_code !== 200) {
		this.callbacks.onError(message.status_code);
		return;
	}
	
	var response = this.parseResponse(message.response_body.data);

	try {
		if (this.callbacks.onScoreUpdate != undefined){			
			this.callbacks.onScoreUpdate(response);
		}else{
			global.log("sports-update@pavanred : exception onScoreUpdate callback NOT FOUND!");
		}
	} catch (e){
		global.log("sports-update@pavanred : exception triggering score update "  + e);
	}
}

LiveScore.prototype.parseResponse = function(response){
	
	try {
			var splits = response.split("&");
	
			var count = 1;
			var leftText = "_left";
			var rightText = "_right";
			var urlText = "_url";
			
			var scorelist = [];
			
			while(response.indexOf(leftText + count) !== -1){
				count = count + 1;		
			}
			
			for(var i = 1; i < count; i++){	
				
				var summary = "";
				var type = 1;
				var url = "";
				var details = [];
				
				for(var j = 0; j < splits.length; j++){
			
					if(splits[j].indexOf(leftText + i) !== -1){
						
						var tempSummary = splits[j];
						
						var equalpos = tempSummary.indexOf("=");
						tempSummary = tempSummary.substring(equalpos + 1);
						tempSummary = tempSummary.replace("^","");
						summary = decodeURIComponent(tempSummary);
						
						if(summary.indexOf("FINAL") !== -1 || summary.indexOf("Full-time") !== -1){
							type = 2;
							//summary = summary.replace("(FINAL)","");
							//summary = summary.replace("(Full-time)","");
						}
						else if(summary.indexOf("CANCELLED") !== -1){
							type = 4;
							//summary = summary.replace("(CANCELLED)","");
							
						}
						else if(summary.indexOf("DELAYED") !== -1 || summary.indexOf("Postponed") !== -1){
							type = 3;
							//summary = summary.replace("(Postponed)","");
							//summary = summary.replace("(DELAYED)","");
						}
						else if(summary.indexOf("AM") !== -1 || summary.indexOf("PM") !== -1)
							type = 5;
					}	
					
					if(splits[j].indexOf(urlText + i)  !== -1 ){
						
						var tempUrl = splits[j];
						
						var equalpos = tempUrl.indexOf("=");
						tempUrl = tempUrl.substring(equalpos + 1);
						tempUrl = tempUrl.replace("^","");
						url = decodeURIComponent(tempUrl);
					}
	
					if(splits[j].indexOf(rightText + i) !== -1 && splits[j].indexOf("_count=") == -1){
						
						var tempDetails = splits[j];
						
						var equalpos = tempDetails.indexOf("=");
						tempDetails = tempDetails.substring(equalpos + 1);
						tempDetails = tempDetails.replace("^","");
						tempDetails = decodeURIComponent(tempDetails);
												
						details[details.length] = tempDetails;
					}					
				}
				
				if((summary.indexOf("FINAL") !== -1 || summary.indexOf("Full-time") !== -1) && this.displayFinal){				
					scorelist[scorelist.length] = 
						{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
				}
				else if(summary.indexOf("CANCELLED") !== -1 && this.displayCancelled){
					scorelist[scorelist.length] = 
						{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
				}
				else if((summary.indexOf("DELAYED") !== -1 || summary.indexOf("Postponed") !== -1) && this.displayDelayed){
					scorelist[scorelist.length] = 
						{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
				}
				else if(summary.indexOf("DELAYED") == -1 && summary.indexOf("CANCELLED") == -1 
					&& summary.indexOf("FINAL") == -1 && summary.indexOf("Full-time") == -1 && summary.indexOf("Postponed") == -1){
					
					scorelist[scorelist.length] = 
						{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
				}
			}
			
			return scorelist;
						
		} catch (e){
		global.log("sports-update@pavanred : Error parsing score updates "  + e);
		return scorelist;
	} 
}
