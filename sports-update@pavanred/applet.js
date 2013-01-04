/*
 *
 *  Cinnamon applet - sports-update
 *  - Displays a list of all live score udpates	
 *  - Live score updates available for :
 * 	  	- Basketball (NBA, WNBA, NCAA basketball)
 * 		- American football (NFL)
 * 		- Baseball (MLB)
 *      - Ice hocky (NHL)
 *
 *  Author
 *	 Pavan Reddy <pavankumar.kh@gmail.com>
 *
 * This file is part of sports-update.
 *
 * sports-update is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * sports-update is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with sports-update.  If not, see <http://www.gnu.org/licenses/>.
 */

/*------------------------
 * Imports
 * ------------------------*/
imports.searchPath.push( imports.ui.appletManager.appletMeta["sports-update@pavanred"].path );

const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Applet = imports.ui.applet;
const Clutter = imports.gi.Clutter;
const Gettext = imports.gettext;
const _ = Gettext.gettext;
const Lang = imports.lang;
const AppletDir = imports.ui.appletManager.appletMeta['sports-update@pavanred'].path;
const AppletMeta = imports.ui.appletManager.applets['sports-update@pavanred'];
const AppSettings = AppletMeta.settings.Values;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

const LiveScore = imports.liveScore;
const conf_script = GLib.build_filenamev([global.userdatadir, 'applets/sports-update@pavanred/settings.js']);

/*------------------------
 * Constants
 * ------------------------*/

const UUID = 'sports-update@pavanred';
const PANEL_TOOL_TIP = "Live score udpates";
const NO_UPDATES = "No live score updates";
const SETTINGS = "Settings";
const LIVE = "LIVE";

//icons
const FOOTBALL_ICON = "/icon-football.png";
const BASKETBALL_ICON = "/icon-basketball.png";
const AFOOTBALL_ICON = "/icon-americanfootball.png";
const BASEBALL_ICON = "/icon-baseball.png";
const ICEHOCKEY_ICON = "/icon-icehockey.png";
const GOLF_ICON = "/icon-golf.png";
const TENNIS_ICON = "/icon-tennis.png";
const MOTORSPORT_ICON = "/icon-racing.png";


//score update urls
const NBA_APIROOT = "http://sports.espn.go.com/nba/bottomline/scores";
const NFL_APIROOT = "http://sports.espn.go.com/nfl/bottomline/scores";
const MLB_APIROOT = "http://sports.espn.go.com/mlb/bottomline/scores";
const NHL_APIROOT = "http://sports.espn.go.com/nhl/bottomline/scores";
const WNBA_APIROOT = "http://sports.espn.go.com/wnba/bottomline/scores";
const NCAA_APIROOT = "http://sports.espn.go.com/ncb/bottomline/scores";
const FB_US_APIROOT = "http://soccernet.espn.go.com/bottomline/scores/scores?scoresSource=usa";
const FB_UK_APIROOT = "http://soccernet.espn.go.com/bottomline/scores/scores?scoresSource=uk";
const FB_INT_APIROOT = "http://soccernet.espn.go.com/bottomline/scores/scores?scoresSource=inter";
const FB_EUR_APIROOT = "http://soccernet.espn.go.com/bottomline/scores/scores?scoresSource=euro";
const GOLF_APIROOT = "http://sports.espn.go.com/sports/golf/bottomLineGolfLeaderboard";
const TENNIS_APIROOT = "http://sports.espn.go.com/sports/tennis/bottomline/scores";
const MOTOR_APIROOT = "http://sports.espn.go.com/rpm/bottomline/race";

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
		__proto__: Applet.TextIconApplet.prototype,

		_init: function(orientation) {
			Applet.TextIconApplet.prototype._init.call(this, orientation);

			var sports = [];
			this.responseCount = 0;
			
			try {
				
				//removing code redudancies - apiroot and icons - v1.0.1
				
				//get configuration from settings.js				
				/*if(AppSettings.basketball_updates)
					sports[sports.length] = NBA_APIROOT;
				if(AppSettings.americanfootball_updates)
					sports[sports.length] = NFL_APIROOT;	
				if(AppSettings.baseball_updates)
					sports[sports.length] = MLB_APIROOT;	
				if(AppSettings.icehockey_updates)		
					sports[sports.length] = NHL_APIROOT;
				if(AppSettings.women_basketball_updates)
					sports[sports.length] = WNBA_APIROOT;	
				if(AppSettings.NCAA_basketball)		
					sports[sports.length] = NCAA_APIROOT;				
				if(AppSettings.golf_updates)
					sports[sports.length] = GOLF_APIROOT;	
				if(AppSettings.motorsports_updates)		
					sports[sports.length] = MOTOR_APIROOT;
				if(AppSettings.tennis_updates)
					sports[sports.length] = TENNIS_APIROOT;	
				if(AppSettings.football_europe_updates)		
					sports[sports.length] = FB_EUR_APIROOT;	
				if(AppSettings.football_international_updates)		
					sports[sports.length] = FB_INT_APIROOT;
				if(AppSettings.football_uk_updates)
					sports[sports.length] = FB_UK_APIROOT;	
				if(AppSettings.football_usa_updates)		
					sports[sports.length] = FB_US_APIROOT;*/
					
				if(AppSettings.basketball_updates){
					var sportItem = {Apiroot: NBA_APIROOT, Icon: BASKETBALL_ICON};
					sports[sports.length] = sportItem;
				}
				if(AppSettings.americanfootball_updates){
					var sportItem = {Apiroot: NFL_APIROOT, Icon: AFOOTBALL_ICON};
					sports[sports.length] = sportItem;
				}	
				if(AppSettings.baseball_updates){
					var sportItem = {Apiroot: MLB_APIROOT, Icon: BASEBALL_ICON};
					sports[sports.length] = sportItem;
				}
				if(AppSettings.icehockey_updates){		
					var sportItem = {Apiroot: NHL_APIROOT, Icon: ICEHOCKEY_ICON};
					sports[sports.length] = sportItem;
				}
				if(AppSettings.women_basketball_updates){
					var sportItem = {Apiroot: WNBA_APIROOT, Icon: BASKETBALL_ICON};
					sports[sports.length] = sportItem;
				}	
				if(AppSettings.NCAA_basketball){
					var sportItem = {Apiroot: NCAA_APIROOT, Icon: BASKETBALL_ICON};
					sports[sports.length] = sportItem;			
				}
				if(AppSettings.football_europe_updates){		
					var sportItem = {Apiroot: FB_EUR_APIROOT, Icon: FOOTBALL_ICON};
					sports[sports.length] = sportItem;		
				}
				if(AppSettings.football_international_updates){		
					var sportItem = {Apiroot: FB_INT_APIROOT, Icon: FOOTBALL_ICON};
					sports[sports.length] = sportItem;
				}
				if(AppSettings.football_uk_updates){
					var sportItem = {Apiroot: FB_UK_APIROOT, Icon: FOOTBALL_ICON};
					sports[sports.length] = sportItem;	
				}
				if(AppSettings.football_usa_updates){
					var sportItem = {Apiroot: FB_US_APIROOT, Icon: FOOTBALL_ICON};
					sports[sports.length] = sportItem;		
				}

				//in a future release 
				/*if(AppSettings.golf_updates){
					var sportItem = {Apiroot: GOLF_APIROOT, Icon: GOLF_APIROOT};
					sports[sports.length] = sportItem;	
				}
				if(AppSettings.motorsports_updates){
					var sportItem = {Apiroot: MOTOR_APIROOT, Icon: MOTORSPORT_ICON};
					sports[sports.length] = sportItem;	
				}
				if(AppSettings.tennis_updates){
					var sportItem = {Apiroot: TENNIS_APIROOT, Icon: MOTORSPORT_ICON};
					sports[sports.length] = sportItem;	
				}*/
				
					
				this.refreshInterval = parseInt(AppSettings.refresh_interval);
	
				//set panel icon and tool tip
				this.set_applet_tooltip(PANEL_TOOL_TIP);	
				this.set_applet_label("");
				this.set_applet_icon_path(AppletDir + FOOTBALL_ICON);
				
				//main menu
				this.menuManager = new PopupMenu.PopupMenuManager(this);
				this.menu = new MyMenu(this, orientation);
				this.menuManager.addMenu(this.menu);

				//settings menu 
                this.settingsMenu = new Applet.MenuItem(_(SETTINGS), 'system-run-symbolic',Lang.bind(this,this._settings));
                this._applet_context_menu.addMenuItem(this.settingsMenu);
				
				this.sports = sports;
				this.orientation = orientation;
				this.liveScores = [];
				
				//get and display scores
				this._getScores();

			}
			catch (e) {
				log("exception:"  + e);
			};
		},
		
		on_applet_clicked: function(event) {
			this.menu.toggle();
		},

		//add a score item to the menu
		_addScoreItem: function(updateText, icon) {
			
			try{
				let iconPath = AppletDir + icon;

				this.scoreItem = new MyPopupMenuItem(iconPath, _(updateText));

				this.menu.addMenuItem(this.scoreItem);
			} catch (e){
				log("exception: "  + e);}
		},
		
		//get score updates for all sports
		_getScores: function(){
			
			try{
				let _this = this;
				
				let sports = this.sports;
				let orientation = this.orientation;
				
				//flag sports list beginning and end to clear/remove items on menu refresh
				if(sports.length > 0){
					this.initCycle = sports[0].Apiroot;
				}
				else{
					this.initCycle = null;
				}
				
				this.endCycle = sports[sports.length - 1].Apiroot;
				
				
				for (var i = 0; i < sports.length; i++) {
					
						this.ls = new LiveScore.LiveScore({
						'apiRoot': sports[i].Apiroot,
						'icon': sports[i].Icon,						
						'callbacks':{
							'onError':function(status_code){_this._onLiveScoreError(status_code)},
							'onScoreUpdate':function(response){_this._onScoreUpdate(response);}
						}
					});
					
					if(!this.ls.initialised()){
						this._onSetupError(); 
						return;
					}
					
					//DEBUG
					//log("loading scores");		

					this.ls.loadScores();	
				}
				
				Mainloop.timeout_add_seconds(this.refreshInterval, Lang.bind(this, function() {
					//DEBUG
					//log("next iteration...");
					
					this._getScores();
				}));
				
			} catch (e){
				log("exception: "  + e);}		
		},	
		
		_settings: function(){
			//Open settings file
			Main.Util.spawnCommandLine("xdg-open " + conf_script);
		}, 
		
		_onSetupError: function() {
			try{
				this.set_applet_tooltip(_("Unable to refresh scores"));
				
				//DEBUG
				//log("Unable to refresh scores");	
				
				this.scoreItem = new MyPopupMenuItem(AppletDir + FOOTBALL_ICON, "sports-update@pavanred : Error. Unable to refresh scores");
				this.menu.addMenuItem(this.scoreItem);
			} catch (e){
				log("exception: "  + e);}
		},	
			
		_onLiveScoreError: function() {
			
			//DEBUG
			//log("status code: " + status_code);		
				
			this.onSetupError();
		},	
			
		_onScoreUpdate: function(response) {
						
			try{
				
				var apiRoot = response.Apiroot;
				var icon = response.Icon;
				var scorelist = response.Scores;
				
				//DEBUG		
				/*for (var i = 0; i < scorelist.length; i++) {
					global.log("sports-update@pavanred : "  + scorelist[i].Score);
				}*/
					
				//identifying no updates change - v1.0.1
					
				//if its the beginning of the sports list then clear menu and rebuild
				/*if(scorelist[0].Apiroot == this.initCycle){			
					this.set_applet_label("");
					this.menu.removeAll();
				}*/
				
				
				//identifying sport icons change - v1.0.1
		
				//score items list - set icons
				/*for (var i = 1; i < scorelist.length; i++) {
					
					var sportIcon;
									
					switch (scorelist[i].Sport){
					case "basketball":
						sportIcon = BASKETBALL_ICON;
						break;
					case "americanfootball":
						sportIcon = AFOOTBALL_ICON;
						break;
					case "baseball":
						sportIcon = BASEBALL_ICON;
						break;
					case "icehockey":
						sportIcon = ICEHOCKEY_ICON;
						break;
					case "golf":
						sportIcon = GOLF_ICON;
						break;
					case "football":
						sportIcon = FOOTBALL_ICON;
						break;
					case "motorsport":
						sportIcon = MOTORSPORT_ICON;
						break;
					case "tennis":
						sportIcon = TENNIS_ICON;
						break;
					default:
						sportIcon = FOOTBALL_ICON;
					}
					
					this.set_applet_label(LIVE);
					this._addScoreItem(scorelist[i].Score, sportIcon);
				}
				
				//DEBUG
				//log(this.menu.length);

				//no updates menu item
				if(this.menu.length <= 0 && scorelist[scorelist.length - 1].Apiroot == this.endCycle){
					//log("no updates");
					this._addScoreItem(NO_UPDATES, null);					
				}*/
				
				if(this.menu.length <= 0){
					this.liveScores = [];
					this._addScoreItem(NO_UPDATES, null);	
				}
				
				this.responseCount = this.responseCount + 1;
				
				if(this.responseCount == this.sports.length){
					
					this.responseCount = 0;
					this.menu.removeAll();
					
					if(this.liveScores.length <= 0){
							this._addScoreItem(NO_UPDATES, null);	
					}
					else{
						this.set_applet_label(LIVE);
						
						for (var i = 0; i < this.liveScores.length; i++) {							
							this._addScoreItem(this.liveScores[i].Score, this.liveScores[i].Icon);
						}
					}
					
					this.liveScores = [];
				}
				else{
					
					for (var i = 0; i < scorelist.length; i++) {							
						this.liveScores[this.liveScores.length] = {Score: scorelist[i],Icon: icon};
					}					
				}
			
			} catch (e){
				log("Error updating scores "  + e);}
		}
};

/*------------------------
 * Menu
 * ------------------------*/
function MyMenu(launcher, orientation) {
	this._init(launcher, orientation);
}

MyMenu.prototype = {
		__proto__: PopupMenu.PopupMenu.prototype,

		_init: function(launcher, orientation) {
			this._launcher = launcher;

			PopupMenu.PopupMenu.prototype._init.call(this, launcher.actor, 0.0, orientation, 0);
			Main.uiGroup.add_actor(this.actor);
			this.actor.hide();
		}
};

/*------------------------
 * Menu Item - Icon + Text
 * ------------------------*/
function MyPopupMenuItem(){
	this._init.apply(this, arguments);
}

MyPopupMenuItem.prototype = {
		__proto__: PopupMenu.PopupBaseMenuItem.prototype,
		_init: function(iconPath, text, params)
		{
			PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

			this.imageWidget = new St.Bin({x_align: St.Align.MIDDLE});  

			let layout = new Clutter.BinLayout();
            let box = new Clutter.Box();
            let clutter = new Clutter.Texture({keep_aspect_ratio: true, filter_quality: 2, filename: iconPath});
            box.set_layout_manager(layout);            
            box.add_actor(clutter);

            this.imageWidget.set_child(box);
			this.addActor(this.imageWidget);    

			this.label = new St.Label({ text: text });
			this.addActor(this.label);
		}
};

/*------------------------
 * Main
 * ------------------------*/
function main(metadata, orientation) {
	let myApplet = new MyApplet(orientation);
	return myApplet;
};

/*------------------------
 * Logging
 * ------------------------*/
function log(message) {
	global.log(UUID + "::" + log.caller.name + ": " + message);
}
