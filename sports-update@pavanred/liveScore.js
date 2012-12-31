/*------------------------
 * Imports
 * ------------------------*/
const Soup = imports.gi.Soup;

function LiveScore(a_params){

	this.apiRoot=undefined;

	this.callbacks={
		onError:undefined,
		onScoreUpdate:undefined
	};

	if (a_params != undefined){
		
		//DEBUG
		//global.log("Setting apiRoot = " + a_params.apiRoot);		
		
		this.apiRoot = a_params.apiRoot;
		
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
	var scorelist = [];
	var dummyItem = {Sport: null, Score: null, Apiroot: this.apiRoot};
	scorelist[scorelist.length] = dummyItem;
	
	try {
	
		var tempStrings = response.split("&");
		
		//Identify sport			
		switch (this.apiRoot){
		case "http://sports.espn.go.com/nba/bottomline/scores":
			sport = "basketball";
			break;
		case "http://sports.espn.go.com/wnba/bottomline/scores":
			sport = "basketball";
			break;
		case "http://sports.espn.go.com/ncb/bottomline/scores":
			sport = "basketball";
			break;		
		case "http://sports.espn.go.com/nfl/bottomline/scores":
			sport = "americanfootball";
			break;
		case "http://sports.espn.go.com/mlb/bottomline/scores":
			sport = "baseball";
			break;
		case "http://sports.espn.go.com/nhl/bottomline/scores":
			sport = "icehockey";
			break;
		default:
			sport = "football";
		}
		
		//Parse response to get score details
		for (var i = 0; i < tempStrings.length; i++) {
			
			var temp = tempStrings[i];
			var scoreItem = undefined;
			
			//eliminate scores - DELAYED, CANCELLED and FINAL
			if(temp.indexOf("_left") !== -1 && temp.indexOf("DELAYED") == -1 && temp.indexOf("CANCELLED") == -1 && temp.indexOf("FINAL") == -1){
						
				var equalPos = temp.indexOf("=");
				
				if(equalPos != -1){
					temp = temp.substring(equalPos+1);
					
					temp = temp.replace("^","");
					temp = temp.replace(/%20/g," ");
					
					var startPos = temp.indexOf("(");
					
					if(startPos != -1){
						var status = temp.substring(startPos);
						
						if(status.indexOf("AM") == -1 && status.indexOf("PM") == -1){
							var scoreItem = {Sport: sport, Score: temp, Apiroot: null};
							scorelist[scorelist.length] = scoreItem;
						}	
					}	
				}
			}		
		}	

		//DEBUG
		/*for (var i = 0; i < scorelist.length; i++) {
			global.log("sports-update@pavanred : "  + scorelist[i].Score);
		}*/
		
		return scorelist;
		
	} catch (e){
		global.log("sports-update@pavanred : Error parsing score updates "  + e);
		return scorelist;
	} 
}


