/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  home.js: Homepage
 *
 */
import track from "./track.js";
import util from "../model/util.js";
import router from "../router.js";

/**
 * Generate a view for Homepage.
 * @param $comp - Object: template.
 * @returns {*} - Object: a generated view.
 */
function renderHome ($comp) {
    const $editor = $comp.get(0);
    $editor.append(track.getEditorBoard());
    const $editorFunction = $comp.get(4);
    $editorFunction.append(createZoomFunction());
    $editorFunction.append(createEditorTools());

    // responsible navigations
    const setting = document.querySelector(".setting");
    setting.setAttribute("isClicked", "false");
    setting.getElementsByTagName('span')[0].innerText = "Setting";

    let lastPage;
    window.onload = function (){
        let navi = document.getElementsByClassName("naviClick")[0];
        navi.addEventListener("click", function (){
            if(navi.getAttribute("isChecked") === "true"){
                router.go("/home");
                navi.setAttribute("isChecked", "false");
            } else {
                router.go("/digital-twin");
                navi.setAttribute("isChecked", "true");
            }
        });
        let setting = document.getElementsByClassName("setting")[0];
        setting.addEventListener("click", function (){
            if(setting.getAttribute("isClicked") === "false"){
                setting.getElementsByTagName('span')[0].innerText = "CLOSE(X)";
                setting.setAttribute("isClicked", "true");
                lastPage = document.URL.split("/").pop();
                router.go("/setting");
            } else {
                setting.getElementsByTagName('span')[0].innerText = "Setting";
                setting.setAttribute("isClicked", "false");
                router.go("/"+lastPage);
            }
        });
    }
    return $comp;
}

/**
 * Create the editors tools. User use the tool to generate a track-piece.
 * @returns {HTMLDivElement} - HTML-Elements: all tools.
 */
function createEditorTools(){
    const allTools = document.createElement("div");
    allTools.className = "editorTools";
    allTools.append(createTrackPieceTool("straight"));
    allTools.append(createTrackPieceTool("curve"));
    allTools.append(createTrackPieceTool("intersection"));
    allTools.append(createTrackPieceTool("junction"));
    return allTools;
}

/**
 * Helper function to create each editors tool.
 * @param name - String: name of the tool.
 * @returns {HTMLDivElement} - HTML-Elements: a created tool.
 */
function createTrackPieceTool(name){
    // 1 to 127 id numbers allowed by Anki Overdrive
    const MIN_ID = "1";
    const MAX_ID = "127";
    const div = document.createElement("div");
    div.className = "tool"
    const straight = document.createElement("img");
    straight.setAttribute("src", "src/pics/"+name+".png");
    straight.setAttribute("alt", name+" pic");
    straight.setAttribute("width", "100vh");
    const divForm = document.createElement("div");
    const form = document.createElement("form");
    const idLabel = document.createElement("label");
    const idInput = document.createElement("input");
    idLabel.setAttribute("for", "id");
    idLabel.innerText = "Track ID";
    idInput.setAttribute("type", "number");
    idInput.setAttribute("name", "id");
    idInput.setAttribute("value", MIN_ID);
    idInput.setAttribute("min", MIN_ID);
    idInput.setAttribute("max", MAX_ID);
    const addButton = document.createElement("button");
    addButton.innerText = "+";
    addButton.addEventListener("click", function (){
        track.addTrackPiece(parseInt(idInput.value), name);
    });
    form.append(idLabel, idInput);
    divForm.append(form, addButton);
    div.append(straight, divForm);
    return div;
}

/**
 * Create a zooming function for editors board.
 * @returns {HTMLDivElement} - HTML-Elements: zoom-in and zoom-out buttons.
 */
function createZoomFunction(){
    const div = document.createElement("div");
    div.innerText = "Editor: ";
    const btnIn = document.createElement("button");
    btnIn.innerText = "Zoom in +";
    const utilBoard = util.getBoard();
    btnIn.addEventListener("click", function (){
        const board = document.getElementsByClassName("editorBoard")[0];
        board.style.width = utilBoard.setWidth(utilBoard.width += 2)+"vh";
        }
    );
    const btnOut = document.createElement("button");
    btnOut.innerText = "Zoom out -";
    btnOut.addEventListener("click", function (){
            const board = document.getElementsByClassName("editorBoard")[0];
        board.style.width = utilBoard.setWidth(utilBoard.width -= 2)+"vh";
        }
    );
    div.append(btnIn,btnOut);
    return div;
}

/**
 *  Public interface
 **/
export default {
    getTitle: function () {
        return "Track Editor";
    },
    render: function () {
        const test = {};
        const $comp = $($('#tpl-home').html());
        return renderHome($comp);
    }
}