# ![](https://www.bfh.ch/dam/jcr:36ac8a9a-6176-44fe-8e69-064cffb38e5b/logo_l-xs-home-und-footer_de.svg) Bern University of Applied Sciences
### BTI3041 Project2 HS2021/22: AnkiOverdrive
### Student: Mac Müller
### Advisor: Prof. Dr. Reto Koenig

------------
#### ![](http://twemoji.maxcdn.com/36x36/1f4e3.png) Introduction
This project redeveloped a web-based application "Track Editor", which integrates the existing system and works without installation. Furthermore, a scalable image format is used to experimente. With this new application, it is possible to create and print the track for AnkiOverdrive cars. The function "Digital Twin" represents a virtual representation of the physical track on which the cars are located.

#### ![](http://twemoji.maxcdn.com/36x36/1f4e3.png) Application starting guide
1. start the Anki Overdrive host as administrator with Node.js e.g. `$sudo node host.js`
2. power the station of the vehicles (plug in the power adapter)
3. publish the application on a webserver
4. call the main page of the web server (index.html)

##### ![](http://twemoji.maxcdn.com/36x36/1f6a7.png) Remarks:
1. user must not start the file "index.html" directly from the USB stick. 
The security settings of today's operating systems or browsers restrict some functions if the application is not located on the web server
2. recommended speed values are between 250 to 750

#### ![](http://twemoji.maxcdn.com/36x36/1f4e3.png) SPA & MVC
![Spa](/documents/spa.png)
| Name | Description|
|---|---|
|index.html|The main page of the application|
|main.css|The cascading style sheets of the application was set in this file|
|main.js|The first JavaScript file to be executed. In this file all paths to the controllers were registered to page-router.js|
|page-router.js|The router selects a corresponding controller from the web page selected by the user. The controller generates the contents of the web page as HTML elements and returns them to the router. Router overwrites the `<main>` element in index.html. Thus, the page does not have to be completely reloaded each time that user makes a request|
|setting.js|generates HTML elements and controls the functions from the "setting" page, which gives the user the editor board and MQTT settings. The other functions are export or import. The user can save or restore the state of the Track Editor to the local computer. The user is also able to download the tracks as PNG images for the printer |
|digital-twin.js|generates HTML elements and controls the functions from the "digital-twin" page, which visualizes the physical images of the track and vehicles to the user. The user can adjust the speed of the connected vehicles|
|home.js|generates HTML elements and controls the functions from the main track editor page|
|track.js|is the controller for the board of the track editor|
|mqtt.js|is responsible for MQTT communication|
|track-piece.js|is responsible for track-piece data on the board of the track editor|
|svg.js|is responsible for editing SVG data from track-piece|
|util.js|is responsible for the session data, settings, and import and export functions|

#### ![](http://twemoji.maxcdn.com/36x36/1f4e3.png) MQTT Topic from mqtt.js

| Topic | Description|
|---|---|
| Anki/WebClient/S/Status | Status of this application |
| Anki/Host/`name of host`/S/HostStatus | Status of AnkiOverdrive Host |
| Anki/Host/`name of host`/S/Cars | List of found cars |
| Anki/Host/`name of host`/I | To publish a connecting message (tell Host to discover the cars)|
| Anki/Car/`name of car`/E/track_piece_id| to subscribe Track piece ID|
| Anki/Car/`name of car`/E/track_location_id| to subscribe Track location ID|

  Function to update cars speed.
  ```
/**
 * Publish a MQTT-Message: change speed of a car.
 * @param carName - String: name of car.
 * @param speed - Integer/String: value of speed 200 till 1250.
 */
function changeSpeed(carName, speed){
    const STANDARD_ACCELERATION = 5000;
    client.send(TOPIC.Car+carName+'/I', JSON.stringify({
        speed: Number(speed),
        acceleration: STANDARD_ACCELERATION
    }), 0, false);
}

  ```
