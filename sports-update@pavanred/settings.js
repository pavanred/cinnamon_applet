
const Values = {
	
    //live score updates for sports
    //true or false
    
	//cricket
	cricket_international_updates:true,		
	cricket_india_updates:true,			//Indian Premier League
	cricket_all_updates:true,			//worldwide international, first class, county, college - men and women
		
    //football
    football_usa_updates: true,
    football_uk_updates: true,			//Barclays Premier League
    football_international_updates: true,
    football_europe_updates: true,
    
    //Tennis
    tennis_updates: true,
    
    //Motorsports
    motorsports_updates:true,
    
    //Golf
    golf_updates:false,
    
    //basketball
	basketball_updates: true,  			//NBA - National Basketball Association (USA)
	women_basketball_updates: true,  	//WNBA - Women's National Basketball Association (USA)
	NCAA_basketball: false,   			//NCAA -  National Collegiate Athletic Association - Basketball (USA)	
	
	//Americanfootball	
	americanfootball_updates: true,  	//NFL - National Football League (USA)
	
	//baseball
	baseball_updates: true,  			//MLB - Major League Baseball (USA)
	
	//ice hockey
	icehockey_updates: false,  			//NHL - National Hockey League (USA)
	
	
	/*-----------------------------------------------------------*/
	
	
	refresh_interval: 60,				// seconds
	
	display_cancelled: false,			// Display games that are cancelled e.g. [Ice Hockey] Toronto at Detroit (CANCELLED)
	
	display_delayed: false,				// Display games that are delayed 
	
	display_finalscores: false,			/* Persist the display of final scores for a while after the game is complete
										   (till the scores are available in the input stream)
										   e.g Dallas 103  Washington 94 (FINAL)									*/
										
	display_upcoming_schedules: false,   // Display the schedule of upcoming games
	
};
