const Soup = imports.gi.Soup;

function LiveScore(a_params){

	this.apiRoot=undefined;

	this.callbacks={
		onError:undefined,
		onScoreUpdate:undefined
	};

	if (a_params != undefined){
		
		global.log("Setting apiRoot = " + a_params.apiRoot);		
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
	global.log("sports-update@pavanred :: liveScore.js :loading scores");
	let this_ = this;
	let message = Soup.Message.new('GET', url);	
	this.httpSession.queue_message(message, function(session,message){this_.onHandleResponse(session,message)});	
}

LiveScore.prototype.onHandleResponse = function(session, message) {
	
	global.log("sports-update@pavanred :: response handler:" + message.status_code);
	
	if (message.status_code !== 200) {
		global.log("sports-update@pavanred : Error status code of: " + message.status_code);
		this.callbacks.onError(message.status_code);
		return;
	}
	var responseJson = this.parseResponse(message);
	
	global.log("sports-update@pavanred :: response handler:" + responseJson);
	
	try {
		if (this.callbacks.onScoreUpdate != undefined){			
			this.callbacks.onScoreUpdate(responseJson);
		}else{
			global.log("sports-update@pavanred : Error onScoreUpdate callback NOT FOUND!");
		}
	} catch (e){
		global.log("sports-update@pavanred : Error triggering score update "  + e);
	}
}

LiveScore.prototype.parseResponse = function(request){
	return ["Score update 1..","Score update 2..","Score update 3.."];
}

