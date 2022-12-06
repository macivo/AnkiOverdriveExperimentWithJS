/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  digital-twin.js: Simulate the physical of cars and track
 *
 */
import track from "./track.js";
import mqtt from "../model/mqtt.js";
import util from "../model/util.js";
import svg from "../model/svg.js";

let dtFunction;                 // Cars controller.
const carsSet = new Set();      // Set of online cars.

/**
 * Generate a view for digital-twin.
 * @param $comp - Object: template.
 * @returns {*} - Object: a generated view.
 */
function renderDT ($comp) {
    const board = util.getBoard();
    const digitalTwin = $comp.get(0);

    // reset the setting-navigation.
    const setting = document.querySelector(".setting");
    setting.setAttribute("isClicked", "false");
    setting.getElementsByTagName('span')[0].innerText = "Setting";

    //get only drawn nodes from editors board.
    const dtBoard = document.createElement("div");
    track.getEditorBoard().childNodes.forEach(e => {
         if (e.getAttribute("status") === "occupied") {
             dtBoard.append(e.cloneNode(true));
         }
    });
    for (let child of dtBoard.childNodes){
        child.className = "dtTrackPiece";
        child.getElementsByClassName("deleteButton")[0].remove();
        child.getElementsByClassName("rotationButton")[0].remove();
    }
    dtBoard.className = "dtBoard";
    dtBoard.style.gridTemplateColumns = "repeat("+board.column+", 2fr)";
    dtBoard.style.width = board.width.toString()+"vh";
    digitalTwin.append(dtBoard);

    dtFunction = $comp.get(4);

    // dtFunction losses all cars after switching to another page.
    // All cars will be added again after return to digital-twin page.
    if (dtFunction.childElementCount === 0) {
        carsSet.forEach(car => {
            dtFunction.append(addCar(car));
            mqtt.subscribeCar(car);
        });
    }

    mqtt.init(eventListener);
    return $comp;
}

/**
 * Observer: Create a new car controller, and add to dtFunction(Cars controller).
 * @param carName - String: name of car.
 */
function makeCars(carName){
    if (carsSet.has(carName)){
    } else {
        carsSet.add(carName);
        dtFunction.append(addCar(carName));
        mqtt.subscribeCar(carName);
    }
}

const drawMap = new Map(); // Update value of cars, for svg.js.
/**
 * Observer: Function to update the cars move on digital-twin.
 * @param message - Paho.MQTT.Message: mqtt-message.
 */
function update(message){
    const carName = message.destinationName.substr(9,12);
    const update = message.destinationName.substr(24);
    const value = JSON.parse(message.payloadString).value;
    if(!drawMap.has(carName)){
        drawMap.set(carName, { name:carName });
    }
    switch (update){
        case "track_location_id":
            document.getElementsByClassName(carName+"_traceLocation")[0].innerText =
                "Track Location: "+ value;
                drawMap.get(carName).traceLocationID = value;
                // update when received a value of track location id.
                svg.updateDTCar(drawMap.get(carName));
            break;
        case "track_piece_id":
            document.getElementsByClassName(carName+"_tracePiece")[0].innerText =
                "Track Piece: "+ value;
                drawMap.get(carName).tracePieceID = value;
            break;
    }
}

/**
 * EventListener for mqtt-subscribe in mqtt.js.
 * @param evenName - String: name of observer function.
 * @param value - Paho.MQTT.Message or String: mqtt-message or cars name.
 */
function eventListener(evenName, value){
    switch (evenName){
        case "makeCars":
            makeCars(value);
            break;
        case "update":
            update(value)
            break;
    }
}

/**
 * Create a car controller.
 * @param carName - String: name of car.
 * @returns {HTMLDivElement} - HTML-Elements: car controller.
 */
function addCar(carName) {
    const carController = document.createElement("div");
    carController.className = "carController";
    const carNameP = document.createElement("p");
    carNameP.className = "name";
    carNameP.innerText = "Name: " + carName;

    const img = document.createElement("img");
    img.setAttribute("src", "src/pics/car.png");
    img.setAttribute("alt", "car pic");

    const form = document.createElement("form");
    const speedLabel = document.createElement("label");
    const speedInput = document.createElement("input");
    speedLabel.innerText = "Speed: "
    speedInput.setAttribute("value", "0");
    speedInput.setAttribute("type", "number");
    form.append(speedLabel, speedInput);

    const speedUpdateBtt = document.createElement("button");
    speedUpdateBtt.innerText = "update";
    speedUpdateBtt.addEventListener("click", function (){
        mqtt.changeSpeed(carName, speedInput.value)
        if(speedInput.value === "0"){
            svg.carStop(carName);
        }
    });

    const lane = document.createElement("p");
    lane.className = carName+"_lane";
    lane.innerText = "Lane: 0";

    const tracePiece = document.createElement("p");
    tracePiece.className = carName+"_tracePiece";
    tracePiece.innerText = "Track Piece: 0";

    const traceLocation = document.createElement("p");
    traceLocation.className = carName+"_traceLocation";
    traceLocation.innerText = "Track Location: 0";

    carController.append(carNameP, img, form, speedUpdateBtt, tracePiece, traceLocation);
    return carController;
}

/**
 *  Public interface
 **/
export default {
    getTitle: function () {
        return "Digital Twin";
    },
    render: function () {
        const $comp = $($('#tpl-home').html());
        return renderDT($comp);
    }
}