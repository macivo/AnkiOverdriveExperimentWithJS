/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  track.js: Controller for editors board
 *
 */
import util from "../model/util.js";
import trackPiece from "../model/track-piece.js";
import appSetting from "../application-setting.js";

let board = util.getBoard();    // board-setting.
const editorBoard = document.createElement("div"); // editors board.

/**
 * Create a editors board, if not exits.
 * Set the width of board.
 * @returns {HTMLDivElement} - HTML-Element: editors board.
 */
function getEditorBoard () {
    if (editorBoard.innerHTML === ""){
        for (let i = 0; i < board.column*board.row; i++){
            editorBoard.append(trackPiece.makeTrackPiece(i));
        }
        setBoardStyle();
    }
    return editorBoard;
}

/**
 * Set grid layout of editors board from board-setting.
 */
function setBoardStyle () {
    const BEGINN_WIDTH = 450;
    const SMALLER_FACT = 0.75;
    editorBoard.className = "editorBoard";
    editorBoard.style.gridTemplateColumns = "repeat("+board.column+", 2fr)";
    board.width = BEGINN_WIDTH/Math.max(
        Number(board.column),
        Number(board.row)+Math.abs(appSetting.get().row-appSetting.get().column));
    if(board.column <= board.row){
        board.width *= SMALLER_FACT;
    }
    if (board.row <= 2){
        board.width *= SMALLER_FACT;
    }
    editorBoard.style.width = board.width.toString()+"vh";
}

/**
 * Add a track piece to the board.
 * @param id - Number: track id.
 * @param name - String: type of track.
 */
function addTrackPiece(id, name){
    let trackPieces = Array.from(document.querySelectorAll('.editorBoard .trackPiece'));
    let emptySlot = trackPieces.find((trackP)=>{
        return trackP.getAttribute("status") === "empty";
    });

    if(typeof(emptySlot) != "undefined"){
        emptySlot.dispatchEvent(new CustomEvent('addSVG', { detail: {"id": id, "name": name}}));
        document.querySelectorAll('.tool input').forEach(input =>{
            input.value = parseInt(input.value)+1;
        });
        return emptySlot;
    } else {
        alert("Board already full!!");
    }
}

/**
 * Rebuild all track pieces from import.
 * @param trackPieces - Array: info of all imported track pieces.
 */
function restoreEditorBoard(trackPieces){
    // Promise is not working. Need setTimeOut-Function 0.5 second.
    setTimeout(()=>{
        trackPieces.forEach((trackPiece) => {
            addTrackPiece(trackPiece.id, trackPiece.trackType)
                .firstChild.style.transform = "rotate("+trackPiece.rotate+")";
        });
    }, 500);
    setBoardStyle();
}

/**
 *  Public interface
 **/
export default {
    getEditorBoard: function (){
        return getEditorBoard();
    },
    addTrackPiece: function (id, name) {
        addTrackPiece(id, name);
    },
    resetEditorBoard: function (){
        editorBoard.innerHTML = "";
    },
    restoreEditorBoard: function (trackPieces){
        getEditorBoard();
        restoreEditorBoard(trackPieces);
        return editorBoard;
    }
}