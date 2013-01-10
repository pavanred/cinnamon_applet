
const Values = {
	
    //live score updates for sports
    //true or false
    
    //football
    football_usa_updates: true,
    football_uk_updates: true,			//Barclays Premier League
    football_international_updates: true,
    football_europe_updates: true,
    
    //basketball
	basketball_updates: true,  			//NBA - National Basketball Association (USA)
	women_basketball_updates: true,  	//WNBA - Women's National Basketball Association (USA)
	NCAA_basketball: false,   			//NCAA -  National Collegiate Athletic Association - Basketball (USA)	
	
	//Americanfootball	
	americanfootball_updates: true,  	//NFL - National Football League (USA)
	
	//baseball
	baseball_updates: true,  			//MLB - Major League Baseball (USA)
	
	//ice hockey
	icehockey_updates: true,  			//NHL - National Hockey League (USA)
	
	
	/*-----------------------------------------------------------*/
	
	
	refresh_interval: 60,				// seconds
	
	display_cancelled: true,			// Display games that are cancelled e.g. [Ice Hockey] Toronto at Detroit (CANCELLED)
	
	display_delayed: true,				// Display games that are delayed 
	
	display_finalscores: true,			/* Persist the display of final scores for a while after the game is complete
										   (till the scores are available in the input stream)
										   e.g Dallas 103  Washington 94 (FINAL)									*/
										
	display_upcoming_schedules: true,   // Display the schedule of upcoming games
	
};
