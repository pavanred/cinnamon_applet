const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Applet = imports.ui.applet;
const Clutter = imports.gi.Clutter;
const Gettext = imports.gettext;
const _ = Gettext.gettext;
const Lang = imports.lang;
const AppletDir = imports.ui.appletManager.appletMeta['sports-update@pavanred'].path;
const Util = imports.misc.util;

const PANEL_TOOL_TIP = "Sports - Live score udpates";
const ICON_FILE_NAME = "/icon.png";
const REFRESH_SCORES = "Refresh Scores";
const SETTINGS = "Settings";
const CONF_SCRIPT = "configuration-script";

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
		__proto__: Applet.TextIconApplet.prototype,

		_init: function(orientation) {
			Applet.TextIconApplet.prototype._init.call(this, orientation);

			try {
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

				this._display();
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
		
		//get score updates from 3rd party service
		_getScores: function(){
			//test data
			return ["Score update 1..","Score update 2..","Score update 3.."];
		},

		_settings: function(){
			global.log("spawn conf script..");
			//Util.spawn([CONF_SCRIPT]);
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
function MyPopupMenuItem()
{
	this._init.apply(this, arguments);
}

MyPopupMenuItem.prototype =
{
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
