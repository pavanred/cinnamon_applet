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
