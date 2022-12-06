/***********************************************************************************************************************
*****  Default Setting for Anki-Overdrive ******
**********************************************************************************************************************/

const ApplicationSetting = {
    /* Editor */
    column:5,
    row:3,

    /* Editor-Zooming */
    width: 90,

    /* MQTT Setting */
    MQTTHost:"185.143.45.71",
    MQTTPort:9001,
    MQTTBasepath:"ws",
    MQTTUsername:"admin",
    MQTTPassword:"32-5#v3a1yoa9ekaI`<w+%;",
    MQTTClientID:"AnkiOverdriveWebsocket"
};

/**
 *  Public interface
 **/
export default {
    get: function (){
        return ApplicationSetting;
    }
}