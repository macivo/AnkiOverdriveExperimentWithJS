/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  setting.js: Setting page
 *
 */
import util from "../model/util.js";
import track from "./track.js";
import mqtt from "../model/mqtt.js";

/**
 * Generate a view for Setting page.
 * @param $comp - Object: template.
 * @returns {*} - Object: a generated view.
 */
function renderSetting($comp) {
    const template = $comp[0];
    // MQTT setting.
    const MQTTHost = template.querySelector("#MQTTHost");
    const MQTTPort = template.querySelector("#MQTTPort");
    const MQTTBasepath = template.querySelector("#MQTTBasepath");
    const MQTTUsername = template.querySelector("#MQTTUsername");
    const MQTTPassword = template.querySelector("#MQTTPassword");
    MQTTHost.setAttribute("value", util.getBoard().MQTTHost);
    MQTTPort.setAttribute("value", util.getBoard().MQTTPort.toString());
    MQTTBasepath.setAttribute("value", util.getBoard().MQTTBasepath);
    MQTTUsername.setAttribute("value", util.getBoard().MQTTUsername);
    MQTTPassword.setAttribute("value", util.getBoard().MQTTPassword);
    template.querySelector("#MQTTSave").addEventListener("click", function () {
        util.getBoard().setMQTT(MQTTHost.value, MQTTPort.value, MQTTBasepath.value, MQTTUsername.value, MQTTPassword.value);
    });

    // Editor setting.
    const editorColumn = template.querySelector("#editorColumn");
    const editorRow = template.querySelector("#editorRow");
    editorColumn.setAttribute("value", util.getBoard().column);
    editorRow.setAttribute("value", util.getBoard().row);
    template.querySelector("#boardSetting").addEventListener("click", function () {
        util.getBoard().setBoard(editorColumn.value, editorRow.value);
        track.resetEditorBoard();
    });

    // Connection testing.
    template.querySelector("#refreshStatus").addEventListener("click", function () {
        mqtt.init(eventListener);
    });
    // Import Export Print.
    template.querySelector("#export").addEventListener("click", function () {
        util.export();
    });
    template.querySelector("#import").addEventListener("click", function () {
        util.import(template.querySelector("#fileImport"));
    });
    template.querySelector("#saveAsPng").addEventListener("click", function () {
        util.saveAsPng();
    });

 return $comp;
}
const carsSet = new Set();
/**
 * EventListener for MQTT-Subscribe in mqtt.js.
 * @param evenName - String: name of observer function.
 * @param value - Paho.MQTT.Message or String: mqtt-message or cars name.
 */
function eventListener(evenName, value){
    switch (evenName){
        case "makeCars":
            if (carsSet.has(value)){
            } else {
                carsSet.add(value);
            } // no break
        case "MQTTClientOK":
            document.getElementsByClassName("mqttStatus")[0].innerText =
                mqtt.getClientStatus() === true ? "connected" : "failed!";
            document.getElementsByClassName("hostStatus")[0].innerText =
                mqtt.getHostStatus().value === true ? "online" : "offline!";
            document.getElementsByClassName("carsStatus")[0].innerText = carsSet.size.toString() + " cars connected";
            break;
    }
}

/**
 *  Public interface
 **/
export default {
    getTitle: function () {
        return "Setting";
    },
    render: function () {
        const $comp = $($('#tpl-setting').html());
        return renderSetting($comp);
    }
}