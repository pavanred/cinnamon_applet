## Cinnamon applet : applets for cinnamon shell
## sports-update@pavanred

sports-update is a simple applet for <a href="http://cinnamon.linuxmint.com/">Cinnamon</a> desktop. This applet displays the live score updates of sporting events across the world. This applet provides live score updates  for-

* Basketball (NBA)
* Basketball (WNBA)
* Basketball (NCAA)
* American football (NFL)
* Baseball (MLB)
* Ice hockey (NHL)

###Installation

copy the folder sports-update@pavanred/ to ~/.local/share/cinnamon/applets/

cp -a sports-update@pavanred/ ~/.local/share/cinnamon/applets/

###Usage

Live score updates for sports are displayed on clicking on the applet. The settings page can be accessed by right-clicking on the applet. This allows the user to select the sports for which the updates should be displayed and also allows the user to choose the refresh time interval. By default the applet by default displays score updates for all sports and the default refresh time interval is 60 seconds.

###Testing

This script was tested on Cinnamon 1.6.7 on Linux Mint 14 (Nadia)

###Todo

* Add more sports Football, Cricket, Formula 1. And, more sports if reliable sources are found.
* Add short details for score updates. For e.g. Top scorers.
* Provide a GUI for applet settings using <a href="http://www.pygtk.org/">PyGTK</a>

###Mailing list

<a href="https://groups.google.com/forum/?fromgroups=#!forum/cinnamon_sports-update">mailing list</a>
