const Applet = imports.ui.applet;

function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(orientation) {
        Applet.TextIconApplet.prototype._init.call(this, orientation);

        try {
		this.set_applet_tooltip(getCurrentDescription());	
		this.set_applet_label(getCurrentStatus());
		this.set_applet_icon_name("force-kill");
		//this.set_applet_icon_path(AppletDir + "/icon.png");
        }
        catch (e) {
            global.logError(e);
        }
     },

    on_applet_clicked: function(event) {
        
    }
};

function getCurrentStatus() {
    return "Live";
}

function getCurrentDescription() {
    return "Cricket Live: XXX 123/2";
}

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}
