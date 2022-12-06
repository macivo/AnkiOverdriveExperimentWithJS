import setting from "../application-setting.js";
import track from "../controller/track.js";
import router from "../router.js";
/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  util:   store the data for each browser session,
 *          any global function uses stored data could also be declared hier.
 *
 */
let board = {}; // Setting of editors board.
/**
 * Init: get the application-setting from application-setting.js
 */
function init(){
    Object.assign(board,setting.get());
    board.trackPieces = [];
    board.setWidth = function (width){
        board.width = width;
        return board.width;
    }
    board.setMQTT = function (MQTTHost, MQTTPort, MQTTBasepath, MQTTUsername, MQTTPassword){
        board.MQTTHost = MQTTHost;
        board.MQTTPort = Number(MQTTPort);
        board.MQTTBasepath = MQTTBasepath;
        board.MQTTUsername = MQTTUsername;
        board.MQTTPassword = MQTTPassword;
    }
    board.setBoard = function (column, row) {
        board.column = column;
        board.row = row;
    }
}

/**
 * Export board-setting and created track as JSON-File to users local-directory.
 */
function save(){
    let save = {};
    save.trackPieces = [];
    track.getEditorBoard().childNodes.forEach(e => {
        if (e.getAttribute("status") === "occupied") {
            const svg = e.firstChild;
            const trackPiece = {};
            trackPiece.id = svg.id.substr(7);
            trackPiece.trackType = svg.getAttribute("tracktype");
            trackPiece.rotate = svg.getAttribute("rotate");
            save.trackPieces.push(trackPiece);
        }
    });
    save.boardSetting = board;
    let blob = new Blob([JSON.stringify(save)], {type: "text/plain;charset=utf-8"});
    let url  = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.download = "save"+Date.now()+".json";
    a.href = url;
    a.click();
}

/**
 * Import board-setting and created track as JSON-File from users local-directory.
 */
function restore(file){
    let restore;
    let fReader = new FileReader();
    fReader.readAsText(file.files[0]);
    fReader.onloadend = function(event){
        Promise.resolve(JSON.parse(event.target.result)).then((restore)=>{
            Object.assign(board, restore.boardSetting);
            track.resetEditorBoard();
            track.restoreEditorBoard(restore.trackPieces);
            router.go("/home");
        });
    }
}

/**
 * Save all track pieces as PNG-Image to users local-directory.
 */
function saveAsPng(){
    track.getEditorBoard().childNodes.forEach(e => {
        if (e.getAttribute("status") === "occupied") {
            const png = e.firstChild.firstChild.href.baseVal;
            let a = document.createElement('a');
            a.href = png;
            a.download = e.firstChild.getAttribute("tracktype")+"_"+e.firstChild.id+".png";
            a.click();
        }
    });
}

/**
 *  Public interface
 **/
export default {
    init: function () {
        init();
    },
    getBoard: function (){
        return board;
    },
    setBoardWidth: function (width){
        board.width = width;
    },
    export: function (){
        save();
    },
    import: function (file){
        restore(file);
    },
    saveAsPng: function (){
        saveAsPng();
    }
}