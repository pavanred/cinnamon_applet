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

const LiveScore = imports.liveScore;

const UUID = 'sports-update@pavanred';
const PANEL_TOOL_TIP = "Sports - Live score udpates";
const ICON_FILE_NAME = "/icon.png";
const REFRESH_SCORES = "Refresh Scores";
const SETTINGS = "Settings";
//const CONF_SCRIPT = "configuration-script";
const conf_script = GLib.build_filenamev([global.userdatadir, 'applets/sports-update@pavanred/settings.js']);

const NBA_APIROOT =  "http://sports.espn.go.com/nba/bottomline/scores";

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
		__proto__: Applet.TextIconApplet.prototype,

		_init: function(orientation) {
			Applet.TextIconApplet.prototype._init.call(this, orientation);

			try {
				//get configuration from settings.js
				this.scoreUpdatesOn = AppSettings.scoreUpdatesOn;
				this.newsUpdatesOn = AppSettings.newsUpdatesOn;				
				this.football_score = AppSettings.football_score;
				this.football_news = AppSettings.football_news;
				this.ESPN_API_KEY = AppSettings.ESPN_api_key;

				//set panel icon and tool tip
				this.set_applet_tooltip(PANEL_TOOL_TIP);	
				this.set_applet_label("");
				this.set_applet_icon_path(AppletDir + ICON_FILE_NAME);
				
				//main menu
				this.menuManager = new PopupMenu.PopupMenuManager(this);
				this.menu = new MyMenu(this, orientation);
				this.menuManager.addMenu(this.menu);

				//settings menu 
                this.settingsMenu = new Applet.MenuItem(_(SETTINGS), 'system-run-symbolic',Lang.bind(this,this._settings));
                this._applet_context_menu.addMenuItem(this.settingsMenu);
				
				log("getting scores");	
				this._getScores();
			}
			catch (e) {
				global.logError(e);
			};
		},
		
		on_applet_clicked: function(event) {
			this.menu.toggle();
		},
		
		//show main menu
		_display: function() {

			var scores = this._getScores();
			
			//score items
			for (var i = 0; i < scores.length; i++) {
				this._addScoreItem(scores[i].toString());
			}
		},

		//add a score item
		_addScoreItem: function(updateText) {
			let iconPath = AppletDir + ICON_FILE_NAME;

			this.scoreItem = new MyPopupMenuItem(iconPath, _(updateText));

			this.menu.addMenuItem(this.scoreItem);
		},
		
		//get score updates for NBA
		_getScores: function(){
			
			let _this = this;
				
			this.ls = new LiveScore.LiveScore({
				'apiRoot': NBA_APIROOT,
				'callbacks':{
					'onError':function(status_code){_this._onLiveScoreError(status_code)},
					'onScoreUpdate':function(jsonData){_this._onScoreUpdate(jsonData);}
				}
			});
			
			if(!this.ls.initialised()){
				this._onSetupError(); 
				return;
			}
			
			log("loading scores");		
			this.ls.loadScores();
					
			//log("loading test data here");		
			//test data
			//return ["Score update 1..","Score update 2..","Score update 3.."];
		},	
		
		_settings: function(){
			Main.Util.spawnCommandLine("xdg-open " + conf_script);
		}, 
		
		_onSetupError: function() {
			this.set_applet_tooltip(_("Unable to refresh scores"));				
			log("Unable to refresh scores");	
			this.scoreItem = new MyPopupMenuItem(AppletDir + ICON_FILE_NAME, "sports-update@pavanred : Error. Unable to refresh scores");
			this.menu.addMenuItem(this.scoreItem);
		},	
			
		_onLiveScoreError: function() {
			log("status code: " + status_code);
			//global.log("sports-update@pavanred : status code: " + status_code);
			this.onSetupError();
		},	
			
		_onScoreUpdate: function(jsonData) {
			//TODO: loop through json data and return scores array
			log("onScoreUpdate.jsonData");
			var scores = jsonData;
			
			//score items
			for (var i = 0; i < scores.length; i++) {
				this._addScoreItem(scores[i].toString());
			}	
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
		//Util.spawnCommandLine("notify-send --icon=mail-read \""+a_title+"\" \""+a_message+"\"");	

//logging
function log(message) {
	global.log(UUID + "::" + log.caller.name + ": " + message);
}
