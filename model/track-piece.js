/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  track-piece.js: Track piece service - manage data of each track piece
 *
 */
import svg from "../model/svg.js"

/**
 * Create a track piece and functions.
 * @param id - Number: track id.
 * @returns {HTMLDivElement} - HTML-Element: a track piece with rotation- and delete-function.
 */
function makeTrackPiece(id){
    const trackPiece = document.createElement("div");
    trackPiece.className = "trackPiece";
    trackPiece.setAttribute("status", "empty");

    const delButton = document.createElement("button");
    delButton.className = "deleteButton";
    delButton.innerText = "X";
    delButton.addEventListener("click", function(){
        const svg = trackPiece.getElementsByTagName("svg");
        if(svg.length !== 0) {
            svg[0].remove();
            trackPiece.setAttribute("status", "empty");
            document.querySelectorAll('.tool input').forEach(input =>{
                input.value = parseInt(input.value)+1;
            });
        }
    });
    const rotationButton = document.createElement("button");
    rotationButton.className = "rotationButton";
    rotationButton.addEventListener("click", function(){
        const svg = trackPiece.getElementsByTagName("svg");
        setRotation(svg);
    });

    trackPiece.append(delButton, rotationButton);
    trackPiece.setAttribute("draggable", "true");
    trackPiece.addEventListener('dragstart', handleDragStart);
    trackPiece.addEventListener('dragover', handleDragOver);
    trackPiece.addEventListener('dragenter', handleDragEnter);
    trackPiece.addEventListener('dragleave', handleDragLeave);
    trackPiece.addEventListener('dragend', handleDragEnd);
    trackPiece.addEventListener('drop', handleDrop);
    trackPiece.addEventListener('addSVG', createSvg);
    return trackPiece;
}

/**
 * Listeners of mouse events.
 *
 */
let dragSrcEl;
function createSvg(e) {
    // Add image to track piece.
    this.prepend(svg.getSvg(e.detail.name, e.detail.id));
    this.setAttribute("status", "occupied");
}
function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}
function handleDragEnd(e) {
    this.style.opacity = '1';
    let items = document.querySelectorAll('.editorBoard .trackPiece');
    items.forEach(function (item) {
        item.classList.remove('over');
    });
    // Add back a JS-function after dragEnd.
    items = document.querySelectorAll('.editorBoard .trackPiece .deleteButton');
    items.forEach(function (item) {
        item.addEventListener("click", function(){
            const svg = this.parentNode.getElementsByTagName("svg");
            if(svg.length !== 0) {
                svg[0].remove();
                this.parentNode.setAttribute("status", "empty");
                document.querySelectorAll('.tool input').forEach(input =>{
                    input.value = parseInt(input.value)+1;
                });
            }
        });
    });
    items = document.querySelectorAll('.editorBoard .trackPiece .rotationButton');
    items.forEach(function (item) {
        item.addEventListener("click", function () {
            const svg = this.parentNode.getElementsByTagName("svg");
            setRotation(svg);
        });
    });
}
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        let status = dragSrcEl.getAttribute("status");
        dragSrcEl.setAttribute("status", this.getAttribute("status"));
        this.setAttribute("status", status);
        this.innerHTML = e.dataTransfer.getData('text/html');
    }
    return false;
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } return false;
}
function handleDragEnter(e) {
    this.classList.add('over');
}
function handleDragLeave(e) {
    this.classList.remove('over');
}
// END: Listeners of mouse events.


/**
 * Set or change the rotation of a track piece.
 * @param svg - HTML-Elements: SVG-Grafik.
 */
function setRotation(svg){
    if (svg.length !== 0) {
        let transform = window.getComputedStyle(svg[0]).getPropertyValue('transform')//.parseInt(svg.style.transform);
        switch (transform) {
            case "matrix(1, 0, 0, 1, 0, 0)":
                svg[0].style.transform = "rotate(270deg)";
                svg[0].setAttribute("rotate", "270deg");
                break;
            case "matrix(0, 1, -1, 0, 0, 0)":
                svg[0].style.transform = "rotate(0deg)";
                svg[0].setAttribute("rotate", "0deg");
                break;
            case "matrix(-1, 0, 0, -1, 0, 0)":
                svg[0].style.transform = "rotate(90deg)";
                svg[0].setAttribute("rotate", "90deg");
                break;
            case "matrix(0, -1, 1, 0, 0, 0)":
                svg[0].style.transform = "rotate(180deg)";
                svg[0].setAttribute("rotate", "180deg");
                break;
        }
    }
}

/**
 *  Public interface
 **/
export default {
    makeTrackPiece: function (id) {
        return makeTrackPiece(id);
    }
}