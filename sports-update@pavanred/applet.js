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

const UUID = 'sports-update@pavanred';
const PANEL_TOOL_TIP = "Live score udpates";

const FOOTBALL_ICON = "/icon-football.png";
const BASKETBALL_ICON = "/icon-basketball.png";
const AFOOTBALL_ICON = "/icon-americanfootball.png";
const BASEBALL_ICON = "/icon-baseball.png";
const ICEHOCKEY_ICON = "/icon-icehockey.png";

const SETTINGS = "Settings";

const conf_script = GLib.build_filenamev([global.userdatadir, 'applets/sports-update@pavanred/settings.js']);

const NBA_APIROOT = "http://sports.espn.go.com/nba/bottomline/scores";
const NFL_APIROOT = "http://sports.espn.go.com/nfl/bottomline/scores";
const MLB_APIROOT = "http://sports.espn.go.com/mlb/bottomline/scores";
const NHL_APIROOT = "http://sports.espn.go.com/nhl/bottomline/scores";
const WNBA_APIROOT = "http://sports.espn.go.com/wnba/bottomline/scores";
const NCAA_APIROOT = "http://sports.espn.go.com/ncb/bottomline/scores";

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
		__proto__: Applet.TextIconApplet.prototype,

		_init: function(orientation) {
			Applet.TextIconApplet.prototype._init.call(this, orientation);

			var sports = [];

			try {
				//get configuration from settings.js				
				if(AppSettings.basketball_updates)
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
				
				this._getScores();
				
				Mainloop.timeout_add_seconds(15, Lang.bind(this, function() {
					//this.menu.removeAll();
					this._getScores();
				}));
			}
			catch (e) {
				global.logError(e);
			};
		},
		
		on_applet_clicked: function(event) {
			this.menu.toggle();
		},

		//add a score item
		_addScoreItem: function(updateText, icon) {
			let iconPath = AppletDir + icon;

			this.scoreItem = new MyPopupMenuItem(iconPath, _(updateText));

			this.menu.addMenuItem(this.scoreItem);
		},
		
		//get score updates for all sports
		_getScores: function(){
			//log("get scores");
			let _this = this;
			
			let sports = this.sports;
			let orientation = this.orientation;
			
			if(sports.length > 0){
				this.initCycle = sports[0];
			}
			else{
				this.initCycle = null;
			}
			
			
			for (var i = 0; i < sports.length; i++) {
				
					this.ls = new LiveScore.LiveScore({
					'apiRoot': sports[i],
					'callbacks':{
						'onError':function(status_code){_this._onLiveScoreError(status_code)},
						'onScoreUpdate':function(jsonData){_this._onScoreUpdate(jsonData);}
					}
				});
				
				if(!this.ls.initialised()){
					this._onSetupError(); 
					return;
				}
				
				//log("loading scores");		
				this.ls.loadScores();	
			}			
		},	
		
		_settings: function(){
			Main.Util.spawnCommandLine("xdg-open " + conf_script);
		}, 
		
		_onSetupError: function() {
			this.set_applet_tooltip(_("Unable to refresh scores"));				
			//log("Unable to refresh scores");	
			this.scoreItem = new MyPopupMenuItem(AppletDir + FOOTBALL_ICON, "sports-update@pavanred : Error. Unable to refresh scores");
			this.menu.addMenuItem(this.scoreItem);
		},	
			
		_onLiveScoreError: function() {
			//log("status code: " + status_code);			
			this.onSetupError();
		},	
			
		_onScoreUpdate: function(scorelist) {
						
						
			/*for (var i = 0; i < scorelist.length; i++) {
				global.log("sports-update@pavanred : "  + scorelist[i].Score);
			}*/
				
			if(scorelist[0].Apiroot == this.initCycle){				
				this.menu.removeAll();
			}
	
			//score items
			for (var i = 1; i < scorelist.length; i++) {
				
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
				default:
					sportIcon = FOOTBALL_ICON;
				}
				
				this._addScoreItem(scorelist[i].Score, sportIcon);
			}
			
			Mainloop.timeout_add_seconds(15, Lang.bind(this, function() {
				//this.menu.removeAll();
				this._getScores();
			}));
		}
};

//Menu
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

//menu items - Image and text
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

function main(metadata, orientation) {
	let myApplet = new MyApplet(orientation);
	return myApplet;
};

//logging
function log(message) {
	global.log(UUID + "::" + log.caller.name + ": " + message);
}
