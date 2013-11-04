/*------------------------
 * Imports
 * ------------------------*/
imports.searchPath.push( imports.ui.appletManager.appletMeta["sports-update@pavanred"].path );

const Soup = imports.gi.Soup;
const Json = imports.json_parse;
const InternationalTeams = new Array("Australia","India","England","Pakistan","South Africa","New Zealand",
		"Sri Lanka","West Indies","Zimbabwe","Bangladesh","Kenya","Ireland","Canada","Netherlands",
		"Scotland","Afghanistan","USA");
const IPLTeams = new Array("Chennai Super Kings","Delhi Daredevils","Kings XI Punjab","Kolkata Knight Riders",
		"Mumbai Indians","Rajasthan Royals","Royal Challengers Bangalore","Sunrisers Hyderabad");

function LiveScore(a_params){

	this.apiRoot=undefined;
	this.icon=undefined;
	this.displayCancelled = undefined;
	this.displayDelayed = undefined;
	this.displayFinal = undefined;
	this.displaySchedule = undefined;
	this.sport= undefined;

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
		this.sport = a_params.sport;
		
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
	var sport = this.sport;
	
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
	
	var scorelist = [];
	
	try {
		if(this.sport == "cricket_international" || this.sport == "cricket_ipl" || this.sport == "cricket"){
			
			var criScores = parseCricketResponse(response, this.sport);
			
			global.log("final "  + this.displayFinal);
			global.log("schedule " + this.displaySchedule);
			
			
			for(var j = 0; j < criScores.length; j++){		
				
				if(criScores[j].Details[0].indexOf("Match over") !== -1){					
					
					if(this.displayFinal){
						scorelist[scorelist.length] = 
						{
								Summary: criScores[j].Summary, 
								Type: 2,	
								Details: criScores[j].Details, 
								Url: "http://www.espncricinfo.com/dummy/engine/current/match/" + criScores[j].Id + ".html", 	
								Icon: this.icon
						};
					}
				}
				else if(criScores[j].Details[0].match(/[A-Z][a-z][a-z] \d{1,2}, \d{4}/) !== null){
					
					if(this.displaySchedule){
						scorelist[scorelist.length] = 
						{
								Summary: criScores[j].Summary, 
								Type: 5,	
								Details: criScores[j].Details, 
								Url: "http://www.espncricinfo.com/dummy/engine/current/match/" + criScores[j].Id + ".html", 	
								Icon: this.icon
						};
					}
				}
				else{					
					scorelist[scorelist.length] = 
					{
							Summary: criScores[j].Summary, 
							Type: 1,	
							Details: criScores[j].Details, 
							Url: "http://www.espncricinfo.com/dummy/engine/current/match/" + criScores[j].Id + ".html", 	
							Icon: this.icon
					};
				}
			}
		}
		else{
			
			var splits = response.split("&");
	
			var count = 1;
			var leftText = "_left";
			var rightText = "_right";
			var urlText = "_url";
			
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
				
				var leaderboardStatus = false;
				
				if(details.length > 0){
					if(details[0].indexOf("Complete") !== -1){
						leaderboardStatus = true;
					}
				}
				
				if((summary.indexOf("FINAL") !== -1 || summary.indexOf("Full-time") !== -1 || leaderboardStatus) && this.displayFinal){				
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
				else if((summary.indexOf("AM") !== -1 || summary.indexOf("PM") !== -1) && this.displaySchedule){
					
					var tempSum = summary;
					var bracketStart = tempSum.indexOf("(");
					var bracketEnd = tempSum.indexOf(")");
					var summarybit = "";
					
					var summarybit = summary.substring(0,bracketStart - 1);
					
					var time = tempSum.substring(bracketStart + 1, bracketEnd);
					time = time.replace(" ET", "");
					var PM = false;
					
					if(time.indexOf("PM") != -1){
						PM = true;
						time = time.replace(" PM","");
					}
					
					if(time.indexOf("AM") != -1){
						PM = false;
						time = time.replace(" AM","");
					}
					
					var separator = time.indexOf(":");
					var hours = time.substring(0,separator);
					var minutes = time.substring(separator + 1);
					
					if(PM)
						hours = hours + 12 - 1;
														
					var today = new Date();
					global.log("today" + today.toString() + "-" + today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate() + "-" + hours + "-" + minutes);
					
					var et = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);

					var final = new Date(et.toUTCString());

					//summarybit = summarybit + " (" + final.getHours() + ":" + final.getMinutes() + ")";
					summarybit = summarybit + final.toString();

					scorelist[scorelist.length] = 
						{Summary: summarybit, Type: type, Details: details, Url: url, Icon: this.icon};
				}
				else if(summary.indexOf("DELAYED") == -1 && summary.indexOf("CANCELLED") == -1 
					&& summary.indexOf("FINAL") == -1 && summary.indexOf("Full-time") == -1 && summary.indexOf("Postponed") == -1
					&& summary.indexOf("AM") == -1 && summary.indexOf("PM") == -1){
					
					scorelist[scorelist.length] = 
						{Summary: summary, Type: type, Details: details, Url: url, Icon: this.icon};
				}
			}
		}
			
		return scorelist;
						
	} catch (e){
		global.log("sports-update@pavanred : Error parsing score updates "  + e);
		return scorelist;
	}	 
}

function parseCricketResponse(response, sport){
	try{		
		var games = Json.json_parse(response, null);

		var matchIds = [];
		
		for(var i=0; i < games.length; i++){
			
			if(sport == "cricket_international" && isInternational(games[i].t1,games[i].t2)){
				matchIds[matchIds.length] = games[i].id;
				continue;
			}
			if(sport == "cricket_ipl" && isIPL(games[i].t1,games[i].t2)){
				matchIds[matchIds.length] = games[i].id;				
				continue;
			}
			if(sport == "cricket"){
				matchIds[matchIds.length] = games[i].id;
				continue;
			}
		}
		
		return getCricketScoreDetails(matchIds);
		
	}
	catch (e){
		global.log("sports-update@pavanred : Error parsing cricket updates "  + e);
	
	}	
}

function getCricketScoreDetails(matchIds){
	try{		
		var url = "http://cricscore-api.appspot.com//csa?id=";
		var scores = [];

		for(var i = 0; i < matchIds.length; i++){
			
			var detail = [];
			
			var _httpSession = new Soup.SessionSync();			
			var msg = Soup.Message.new('GET',url + matchIds[i]);
			_httpSession.send_message (msg);			
			
			if (msg.status_code !== 200) {
				continue;
			}
			
			var matchDetails = Json.json_parse(msg.response_body.data, null);
			
			detail[detail.length] = matchDetails[0].de;
			
			scores[scores.length] =   
			{
					Summary: matchDetails[0].si, 				
					Details: detail, 
					Id: matchDetails[0].id, 	
			};
			
		}
		
		return scores;
	}
	catch (e){
		global.log("sports-update@pavanred : Error fetching cricket updates "  + e);
		return [];
	}	
}

function isInternational(team1,team2){
	var international = false;
	try{	
		for(var i = 0; i < InternationalTeams.length; i++){
			
			if(team1 == InternationalTeams[i] || team2 == InternationalTeams[i]){
				international = true;
				break;
			}
		}
		
		return international;
	}
	catch (e){
		global.log("sports-update@pavanred : Error parsing cricket updates "  + e);
		return international;
	}	
}

function isIPL(team1,team2){
	try{	
		var ipl = false;
		for(var i = 0; i < ipl.length; i++){
				
			if(team1 == ipl[i] || team2 == ipl[i]){
				ipl = true;
				break;
			}
		}
			
		return ipl;
	}
	catch (e){
		global.log("sports-update@pavanred : Error parsing cricket updates "  + e);
		return ipl;
	}	
}