const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain('cinnamon-extensions');
const _ = Gettext.gettext;
const St = imports.gi.St; // http://developer.gnome.org/st/stable/
const AppletDir = imports.ui.appletManager.appletMeta['sports-update@pavanred'].path;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

const UUID = 'sports-update@pavanred';

function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(orientation) {
        Applet.TextIconApplet.prototype._init.call(this, orientation);

        try {
			this.set_applet_tooltip("Sports - Get live scores");	
			this.set_applet_label("");
			this.set_applet_icon_path(AppletDir + "/icon.png");
		
			this.menuManager = new PopupMenu.PopupMenuManager(this);
		    this.menu = new Applet.AppletPopupMenu(this, orientation);
		    this.menuManager.addMenu(this.menu); 		
        }    
	    catch (e) {
            global.logError(e);
        }
     },

    on_applet_clicked: function(event) {
        log(event);
		this.menu.toggle();
    },

    refreshScores: function refreshScores() {	
		log("in refreshScores()");
    }
};

function log(message) {
	global.log(UUID + "." + log.caller.name + "." + message);
}

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}
