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
		
		//DEBUG
		//global.log("Setting apiRoot = " + a_params.apiRoot);		
		
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
	//DEBUG
	//global.log("sports-update@pavanred :: GET " + url);
	
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
			
			global.log(this.apiRoot + " - " + count);
			
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
				
				scorelist[scorelist.length] = 
					{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
			}
			
			return scorelist;
						
		} catch (e){
		global.log("sports-update@pavanred : Error parsing score updates "  + e);
		return scorelist;
	} 
}

LiveScore.prototype.parseResponse_old = function(response){

	var sport;
	this.scorelist = [];

	try {
	
		var tempStrings = response.split("&");
						
		//Parse response to get score details
		for (var i = 0; i < tempStrings.length; i++) {
			
			var temp = tempStrings[i];		

			 if(temp.indexOf("_left") !== -1 && ((temp.indexOf("FINAL") !== -1 || temp.indexOf("Full%2dtime") !== -1) && this.displayFinal)){
				this.parseScoreText(temp, 2); //FINAL
			}
			else if(temp.indexOf("_left") !== -1 && temp.indexOf("CANCELLED") !== -1 && this.displayCancelled){
				this.parseScoreText(temp, 4);  //CANCELLED
			}
			else if(temp.indexOf("_left") !== -1 && ((temp.indexOf("DELAYED") !== -1 || temp.indexOf("Postponed") !== -1) && this.displayDelayed)){
				this.parseScoreText(temp, 3);  //DELAYED
			}
			else if(temp.indexOf("_left") !== -1 && temp.indexOf("DELAYED") == -1 && temp.indexOf("CANCELLED") == -1
			 && temp.indexOf("FINAL") == -1 && temp.indexOf("Full%2dtime") == -1 && temp.indexOf("Postponed") == -1){
				this.parseScoreText(temp, 1); //LIVE
			}
		}	

		//DEBUG
		/*for (var i = 0; i < scorelist.length; i++) {
			global.log("sports-update@pavanred : "  + scorelist[i].Score);
		}*/
		
		return {Apiroot: this.apiRoot, Icon: this.icon, Scores: this.scorelist};
		
	} catch (e){
		global.log("sports-update@pavanred : Error parsing score updates "  + e);
		return {Apiroot: this.apiRoot, Icon: this.icon, Scores: this.scorelist};
	} 
}

LiveScore.prototype.parseScoreText = function(temp, status){
	var equalPos = temp.indexOf("=");
				
	if(equalPos != -1){
		temp = temp.substring(equalPos+1);
					
		temp = temp.replace("^","");
		temp = temp.replace(/%20/g," ");
		temp = temp.replace(/%2d/g,"-");
		temp = temp.replace(/%3A/g,"-");
					
		var startPos = temp.indexOf("(");
					
		if(startPos != -1){
			var status = temp.substring(startPos);
					
			if(status.indexOf("AM") == -1 && status.indexOf("PM") == -1){	
				var item = {ScoreText: temp, Status: status}				
				this.scorelist[this.scorelist.length] = item;
			}
			else if(this.displaySchedule){
				var item = {ScoreText: temp, Status: 5}				
				this.scorelist[this.scorelist.length] = item;
			}	
		}	
	}
}
