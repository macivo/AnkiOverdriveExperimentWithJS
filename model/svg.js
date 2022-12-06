/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  svg.js: SVG Service
 *
 *  Using: Original code parts of Bachelor-thesis from Dominique Marc Hofmann.
 *  Purpose: Generate a track piece as PNG image.
 *  Source: https://github.com/hofdo/track_editor_backend
 *
 */
const XLINK = "http://www.w3.org/1999/xlink";
const SVG_LINK = "http://www.w3.org/2000/svg";

// Default Height and Width of one Track Piece Element.
const HEIGHT_IMAGE = 4292;
const WIDTH_IMAGE = 4292;
// Default Lane.
const LANES = 9;
/**
 * Create a svg. Then add PNG picture as embedded base64code.
 * @param type - String: type of track piece.
 * @param trackId - Number: track id.
 * @returns {SVGSVGElement} - HTML-Elements:SVG with created track piece.
 */
function createSvg(type, trackId){
    const svg = document.createElementNS(SVG_LINK, "svg");
    svg.setAttribute("viewBox", "0 0 "+WIDTH_IMAGE+" "+HEIGHT_IMAGE);
    svg.setAttribute("xmlns", SVG_LINK);
    svg.setAttribute("xmlns:xlink", XLINK);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    // Default rotate
    svg.setAttribute("rotate", "270deg");
    svg.id = "trackId" + trackId.toString();
    svg.style.transform = "rotate(270deg)";
    svg.setAttribute("tracktype", type);

    const image = document.createElementNS('http://www.w3.org/2000/svg','image');
    image.setAttribute("width", "100%");
    image.setAttribute("height", "100%");
    image.setAttribute("x", "0");
    image.setAttribute("y", "0");
    switch (type) {
        case "straight":
            image.setAttributeNS('http://www.w3.org/1999/xlink','href', drawStraightTrack(trackId, LANES).toDataURL());
            image.setAttribute("alt", type+" "+trackId);
            break;
        case "curve":
            image.setAttributeNS('http://www.w3.org/1999/xlink','href', drawCurveTrack(trackId, LANES).toDataURL());
            image.setAttribute("alt", type+" "+trackId);
            break;
        case "intersection":
            image.setAttributeNS('http://www.w3.org/1999/xlink','href', drawInterSectionTrack(LANES).toDataURL());
            image.setAttribute("alt", type+" "+trackId);
            break;
        case "junction":
            image.setAttributeNS('http://www.w3.org/1999/xlink','href',
                drawJunctionTrack(trackId, LANES, Math.floor(LANES/2), Math.floor(LANES/2)).toDataURL());
            image.setAttribute("alt", type+" "+trackId);
            break;
    }
    svg.append(image);
    return svg;
}

/**
 * Draw a car on digital-twins board.
 * @param car - String: name of car.
 */
function drawDigitalTwinCar(car){
    const svg = document.querySelector("#trackId"+car.tracePieceID);
    const dtCarWidth = 450;
    const dtCarHeight = 900;
    let x; let y;
    if (typeof(svg) === "undefined") return;
    const type = svg.getAttribute("tracktype");
    switch (type){
        case "straight":
            switch (car.traceLocationID%3){
                case 0:
                    x = (WIDTH_IMAGE-dtCarWidth)/2;
                    y = (WIDTH_IMAGE-dtCarHeight)/2-(WIDTH_IMAGE/2*0.59);
                    break;
                case 1:
                    x = (WIDTH_IMAGE-dtCarWidth)/2;
                    y = (WIDTH_IMAGE-dtCarHeight)/2;
                    break;
                case 2:
                    x = (WIDTH_IMAGE-dtCarWidth)/2;
                    y = (WIDTH_IMAGE-dtCarHeight)/2+(WIDTH_IMAGE/2*0.59);
                    break;
            }
            break;
        case "curve":
            switch (car.traceLocationID%3){
                case 0:
                    x = (WIDTH_IMAGE-dtCarWidth)/2-(WIDTH_IMAGE/2*0.35);
                    y = (WIDTH_IMAGE-dtCarHeight)-(WIDTH_IMAGE/2*0.35);
                    break;
                case 1:
                    x = dtCarWidth/2;
                    y = (WIDTH_IMAGE-dtCarHeight)/2;
                    break;
                case 2:
                    x = (WIDTH_IMAGE-dtCarWidth)/2;
                    y = (WIDTH_IMAGE-dtCarHeight);
                    break;
            }
            break;
        case "intersection":
            x = (WIDTH_IMAGE-dtCarWidth)/2;
            y = (WIDTH_IMAGE-dtCarHeight)/2;
            break;
        case "junction":
            x = (WIDTH_IMAGE-dtCarWidth)/2;
            y = (WIDTH_IMAGE-dtCarHeight);
            break;
    }
    // remove car from digital-twins board before add a new one.
    const oldCar = document.querySelector("#dt_"+car.name);
    if (oldCar !== null) oldCar.remove();

    let carImg = document.createElementNS('http://www.w3.org/2000/svg','image');
    carImg.id = "dt_"+car.name;
    carImg.setAttributeNS(null,'height',dtCarHeight.toString());
    carImg.setAttributeNS(null,'width',dtCarWidth.toString());
    carImg.setAttributeNS('http://www.w3.org/1999/xlink','href', 'src/pics/dtCar.png');
    carImg.setAttributeNS(null,'x',x.toString());
    carImg.setAttributeNS(null,'y',y.toString());
    carImg.setAttributeNS(null, 'visibility', 'visible');
    svg.append(carImg);
}

/**
 *  Public interface
 **/
export default {
    getSvg: function (type, trackId) {
        return createSvg(type, trackId);
    },
    updateDTCar: function (car){
        drawDigitalTwinCar(car);
    },
    carStop: function (carName){
        const oldCar = document.querySelector("#dt_"+carName);
        if (oldCar !== null) oldCar.remove();
    }
}

/*
 * Generate an image as png-format.
 * Original code parts of Bachelor-thesis from Dominique Marc Hofmann.
 * Source: https://github.com/hofdo/track_editor_backend
 *
 */

/**
 * This function draws a straight track piece based on the parameters
 * @param track_id: Which track id the track piece should have
 * @param lanes: How many lanes the track piece should have
 * @returns {string} : Will be returned as a Buffer
 */

function drawStraightTrack(track_id, lanes) {
    let binary = (track_id >>> 0).toString(2).split("");
    binary.reverse()

    let straight

    //Calculate distance to outer part of the track
    let outer_distance = ((4292 - ((lanes * 90) + 80)) / 2)

    //x value where the first lane starts
    let start_x = WIDTH_IMAGE - outer_distance - 170
    let side_line_start = start_x

//    let canvas = createCanvas(WIDTH_IMAGE, HEIGHT_IMAGE)
    let canvas = document.createElement("CANVAS");
    canvas.width = WIDTH_IMAGE;
    canvas.height = HEIGHT_IMAGE;
    canvas.data = 0;
    let ctx = canvas.getContext('2d')


    for (let i = 0; i < lanes; i++) {

        straight = straight_track_piece(start_x, outer_distance, side_line_start)

        let lane = i

        ctx = drawStraightStartLine(ctx, straight)

        ctx = drawStraightLineWithCodes(ctx, binary, straight, lane)

        ctx.drawImage(canvas, 0, 0)
        start_x -= 90
    }

    ctx = drawStraightSideLines(ctx, straight)

    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(Math.PI / 2);

    return canvas
}

/**
 * This function draws a intersection track piece based on the parameters
 * @param lanes: How many lanes the intersection should have
 * @returns {HTMLElement}: Will be returned as a buffer
 */

function drawInterSectionTrack(lanes) {
    let track_id = 10
    let binary = track_id.toString(2).split("")

    let intersection

//    let canvas = createCanvas(WIDTH_IMAGE, HEIGHT_IMAGE)
    let canvas = document.createElement("CANVAS");
    canvas.width = WIDTH_IMAGE;
    canvas.height = HEIGHT_IMAGE;
    let ctx = canvas.getContext('2d')

    //Calculate distance to outer part of the track
    let outer_distance = ((4292 - ((lanes * 90) + 80)) / 2)

    //x value where the first lane starts
    let start_val = WIDTH_IMAGE - outer_distance - 170

    for (let i = 0; i < lanes; i++) {

        intersection = intersection_track_piece(start_val)

        drawIntersectionStartLineWithCode(ctx, intersection, binary)

        drawIntersectionLineWithIntersectionCode(ctx, intersection)

        ctx.drawImage(canvas, 0, 0)

        start_val -= 90
    }

    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(90 * Math.PI / 180);

    return canvas
}

/**
 * This function draws a curve track piece based on the parameters
 * @param track_id: Which track id the track piece should have
 * @param lanes: How many lanes the track piece should have
 * @returns {HTMLElement} : Will be returned as a Buffer
 */

function drawCurveTrack(track_id, lanes) {

    let binary = (track_id >>> 0).toString(2).split("");
    binary.reverse()

    let curve

    let canvas = document.createElement("CANVAS");
    canvas.width = WIDTH_IMAGE;
    canvas.height = HEIGHT_IMAGE;
    let ctx = canvas.getContext('2d')

    //Define the start point of the arc in radiant
    let start = Math.PI * 3 / 2
    //Define the end point of the arc in radiant
    let end = 0
    //Calculate distance to outer part of the track
    let outer_distance = ((4292 - ((lanes * 90) + 80)) / 2) + 85
    let outer_distance_sideline = outer_distance
    let loc_code_counter = -1


    for (let i = 0; i < lanes; i++) {
        //Calculate the circumference of the whole circle
        const quarter_circumference = (outer_distance * Math.PI) / 2

        //Percentage length of the code piece
        const code_length_percent = (76 / quarter_circumference)
        const code_length_rad = code_length_percent * Math.PI / 2

        //Percentage length of the squares at the beginning and in the end
        const start_length_percent = (100 / quarter_circumference)
        const start_length_rad = start_length_percent * Math.PI / 2

        //Start Position for the code pieces
        let start_code = start + code_length_rad * 1.8

        //Calculate how many codes will fit on the arc
        let amount_of_codes = (quarter_circumference - 190) / (76 * 1.7)

        //Calculate how many numbered codes will be on the arc
        let amount_of_nub_codes = amount_of_codes - (amount_of_codes % 8)

        amount_of_codes = Math.floor(amount_of_codes)

        curve = curve_track_piece(start, end, outer_distance, outer_distance_sideline, start_code, code_length_rad, start_length_rad)

        let res = drawCurveArcCode(ctx, curve, amount_of_codes, amount_of_nub_codes, outer_distance, start_code, code_length_rad, binary, loc_code_counter)
        ctx = res.ctx
        loc_code_counter = res.counter

        ctx = drawCurveStartArc(ctx, curve, outer_distance, end, start_length_rad, start)

        //Iterate distance for next lane
        outer_distance += 90
    }
    ctx = drawCurveSideLine(ctx, curve)

    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(90 * Math.PI / 180);

    return canvas
}

/**
 * This function draws a junction track piece based on the parameters
 * @param track_id: Which track id the track piece should have
 * @param lanes: How many lanes the track piece should have
 * @param left: How many lanes should be on the left side of the junction
 * @param right: How many lanes should be on the right side of the junction
 * @returns {HTMLElement} : Will be returned as a Buffer
 */

function drawJunctionTrack(track_id, lanes, left, right) {
    right = lanes - left

    let binary = track_id.toString(2).split("")
    binary.reverse()

//    let canvas = createCanvas(WIDTH_IMAGE, HEIGHT_IMAGE)
    let canvas = document.createElement("CANVAS");
    canvas.width = WIDTH_IMAGE;
    canvas.height = HEIGHT_IMAGE;
    let ctx = canvas.getContext('2d')

    //Define the start point of the arc in radiant
    let start = Math.PI * 3 / 2
    //Define the end point of the left arc in radiant
    let end_left = 0
    //Define the end point of the right arc in radiant
    let end_right = Math.PI

    //Calculate distance to outer part of the track
    let outer_distance_right = ((4292 - ((lanes * 90) + 80)) / 2) + 85
    let outer_distance_left = outer_distance_right

    let junction_sidebar = junction_track_piece_side_line(outer_distance_right, outer_distance_left, end_right, end_left, start)

    let loc_code_counter = -1

    ctx = drawJunctionSideLine(ctx, junction_sidebar)

    let res_left = drawJunctionArc(ctx, "left", left, outer_distance_left, start, end_left, loc_code_counter, binary)
    loc_code_counter = res_left.counter
    ctx = res_left.ctx
    let res_right = drawJunctionArc(ctx, "right", right, outer_distance_right, end_right, start, loc_code_counter, binary)
    loc_code_counter = res_right.counter
    ctx = res_right.ctx

    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(90 * Math.PI / 180);

    return canvas
}

/**
 * CURVE Functions
 */

/**
 * This function draws the arc of the current lane and the transition, track-id and location-id codes
 * @param ctx: The context of the canvas
 * @param curve: The configuration list of the curve track piece
 * @param amount_of_codes: How many code elements in total should be drawn
 * @param amount_of_nub_codes: How many code elements for the location- and track-id should be drawn
 * @param outer_distance: The outer distance from the start line to the edge of the picture
 * @param start_code: The coordination where the lane starts
 * @param code_length_rad: The radiant radius of a code element
 * @param binary: The binary value of the track_id
 * @param loc_code_counter: The counter for the location_id
 * @returns {{ctx, counter}}: Returns the context and the loc_code_counter
 */

function drawCurveArcCode(ctx, curve, amount_of_codes, amount_of_nub_codes, outer_distance, start_code, code_length_rad, binary, loc_code_counter) {

    //Draw the codes the car reads for information
    for (let j = 0; j < amount_of_codes; j++) {

        ctx.strokeStyle = "black"

        //Get the binary string of the current location code
        let binary_loc = (loc_code_counter >>> 0).toString(2).split("");
        binary_loc.reverse()

        //When the max amount of codes that carry information is drawn the rest of the codes will be drawn as the extra thick code, which signal the end of a section
        if (amount_of_nub_codes > 0) {
            //Every 8th code will signal the end of the 7 Bit long array
            if (j % 8 === 0) {
                //Draw the code that signals the car that a new section begins
                ctx.beginPath();
                ctx.lineWidth = curve.curve_code.transition.type_3.width
                ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.transition.type_3.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                ctx.stroke();

                //Draw the code that signals the car that a new section begins
                ctx.beginPath();
                ctx.lineWidth = curve.curve_code.transition.type_1.width
                ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.transition.type_1.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                ctx.stroke();
                loc_code_counter++
            } else {
                //Drawing the location ID code
                if (binary_loc[(j % 8) - 1] === "1") {
                    //Draw the location code for the binary value one
                    ctx.beginPath();
                    ctx.lineWidth = curve.curve_code.location.type_2.width
                    ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.location.type_2.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                    ctx.stroke();
                } else {
                    //Draw the location code for the binary value zero
                    ctx.beginPath();
                    ctx.lineWidth = curve.curve_code.location.type_1.width
                    ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.location.type_1.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                    ctx.stroke();
                }
                //Drawing the track ID Code
                if (binary[(j % 8) - 1] === "1") {
                    //draw the track id code for the binary value one
                    ctx.beginPath();
                    ctx.lineWidth = curve.curve_code.track.type_2.width
                    ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.track.type_2.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                    ctx.stroke();
                } else {
                    //Draw code at the side of the arc that the car follows
                    ctx.beginPath();
                    ctx.lineWidth = curve.curve_code.track.type_1.width
                    ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.track.type_1.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
                    ctx.stroke();
                }
            }
        } else {
            //Draw code at the side of the arc that the car follows
            ctx.beginPath();
            ctx.lineWidth = curve.curve_code.transition.type_3.width
            ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.transition.type_3.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = curve.curve_code.transition.type_1.width
            ctx.arc(curve.curve_code.common_data.cord_x, curve.curve_code.common_data.cord_y, curve.curve_code.transition.type_1.radius, curve.curve_code.common_data.start, curve.curve_code.common_data.end, curve.curve_code.common_data.anti_clockwise);
            ctx.stroke();
        }
        //start_code += code_length_rad * 1.7
        curve.curve_code.common_data.start += code_length_rad * 1.7
        curve.curve_code.common_data.end += code_length_rad * 1.7
        amount_of_nub_codes--
    }
    return {
        ctx: ctx,
        counter: loc_code_counter
    }
}

/**
 * This function draws the start code for the current lane
 * @param ctx: The context of the canvas
 * @param curve: the configuration list of the curve track piece
 * @returns {*}
 */

function drawCurveStartArc(ctx, curve) {

    for (const [key, value] of Object.entries(curve.start)) {
        if (key !== "common_data"){
            ctx.beginPath();
            ctx.lineWidth = value.width
            ctx.strokeStyle = value.color
            ctx.arc(curve.start.common_data.cord_x, curve.start.common_data.cord_y, value.radius, value.start, value.end, value.anti_clockwise);
            ctx.stroke();
        }
    }
    return ctx
}

/**
 * This function draws the side lines of the curve on the left and right side
 * @param ctx: The context of the canvas
 * @param curve: the configuration list of the curve track piece
 * @returns {*}
 */

function drawCurveSideLine(ctx, curve) {
    for (const [key, value] of Object.entries(curve.side_line)) {
        if (key !== "common_data"){
            ctx.beginPath();
            ctx.lineWidth = value.width
            ctx.strokeStyle = value.color
            ctx.arc(curve.side_line.common_data.cord_x, curve.side_line.common_data.cord_y, value.radius, value.start, value.end, value.anti_clockwise);
            ctx.stroke();
        }
    }

    return ctx
}

/**
 * Straight Functions
 */

/**
 * This function draws the start code for the current lane
 * @param ctx: The context of the canvas
 * @param straight: the configuration list of the straight track piece
 * @returns {*}
 */

function drawStraightStartLine(ctx, straight) {

    for (const [key, value] of Object.entries(straight)) {
        if (key !== "follow_line" && key !== "side_line"){
            if (key !== "middle"){
                //Draw both squares
                ctx.fillRect(value.square.left.cord_x, value.square.left.cord_y, value.square.left.width_x, value.square.left.height_y)
                ctx.fillRect(value.square.right.cord_x, value.square.right.cord_y, value.square.right.width_x, value.square.right.height_y)
            }
            //Drawing the Code that tells the car where the track starts or stops
            ctx.fillRect(value.transition_code_1.type_1.cord_x, value.transition_code_1.type_1.cord_y, value.transition_code_1.type_1.width_x, value.transition_code_1.type_1.height_y)
            ctx.fillRect(value.transition_code_1.type_3.cord_x, value.transition_code_1.type_3.cord_y, value.transition_code_1.type_3.width_x, value.transition_code_1.type_3.height_y)

            ctx.fillRect(value.transition_code_2.type_1.cord_x, value.transition_code_2.type_1.cord_y, value.transition_code_2.type_1.width_x, value.transition_code_2.type_1.height_y)
            ctx.fillRect(value.transition_code_2.type_3.cord_x, value.transition_code_2.type_3.cord_y, value.transition_code_2.type_3.width_x, value.transition_code_2.type_3.height_y)
        }
        else {
            //Draw the line the car follows
            ctx.fillRect(value.cord_x, value.cord_y, value.width_x, value.height_y)
        }
    }
    return ctx
}

/**
 * This function draws the lane and the different sections with the transition, track-id and location-id codes
 * @param ctx: The context of the canvas
 * @param binary: The binary value of the track_id
 * @param straight: the configuration list of the straight track piece
 * @param lane: Current lane
 * @returns {*}
 */

function drawStraightLineWithCodes(ctx, binary, straight, lane) {

    let default_location_id_code_top = 0
    let default_location_id_code_middle = 1
    let default_location_id_code_bottom = 2
    let loc_binary

    for (const [key, value] of Object.entries(straight)) {
        if (key !== "follow_line" && key !== "side_line"){
            switch (key){
                case "top":
                    let location_code_top = default_location_id_code_top + (lane * 3)
                    loc_binary = location_code_top.toString(2).split("").reverse()
                    break
                case "middle":
                    let location_code_middle = default_location_id_code_middle + (lane * 3)
                    loc_binary = location_code_middle.toString(2).split("").reverse()
                    break
                case "bottom":
                    let location_code_bottom = default_location_id_code_bottom + (lane * 3)
                    loc_binary = location_code_bottom.toString(2).split("").reverse()
                    break
            }
            //Draw the track ids and locations ids for the track at the top
            for (let k = 6; k >= 0; k--) {
                if (binary[k] === '1') {
                    ctx.fillRect(value.track_code.type_2.cord_x, value.track_code.common_data.cord_y, value.track_code.type_2.width_x, value.track_code.type_2.height_y)
                } else {
                    ctx.fillRect(value.track_code.type_1.cord_x, value.track_code.common_data.cord_y, value.track_code.type_1.width_x, value.track_code.type_1.height_y)
                }
                value.track_code.common_data.cord_y += 152
            }

            for (let k = 6; k >= 0; k--) {
                if (loc_binary[k] === '1') {
                    ctx.fillRect(value.location_code.type_2.cord_x, value.location_code.common_data.cord_y, value.location_code.type_2.width_x, value.location_code.type_2.height_y)
                } else {
                    ctx.fillRect(value.location_code.type_1.cord_x, value.location_code.common_data.cord_y, value.location_code.type_1.width_x, value.location_code.type_1.height_y)
                }
                value.location_code.common_data.cord_y += 152
            }

        }
    }

    return ctx
}

/**
 *  This function draws the sideline of the straight track piece on the right and left side
 * @param ctx: The context of the canvas
 * @param straight: the configuration list of the straight track piece
 * @returns {*}
 */

function drawStraightSideLines(ctx, straight) {
    //
    for (const [key, value] of Object.entries(straight.side_line.lines)) {
        if (key !== "common_data"){
            //Draw the Sideline
            ctx.fillRect(value.left.cord_x, straight.side_line.lines.common_data.cord_y, value.left.width_x, straight.side_line.lines.common_data.height_y)
            ctx.fillRect(value.right.cord_x, straight.side_line.lines.common_data.cord_y, value.right.width_x,straight.side_line.lines.common_data.height_y)
        }
    }
    //
    for (const [key, value] of Object.entries(straight.side_line.square)) {
        if (key !== "common_data"){
            //Draw 3 side line squares at the top
            ctx.fillRect(straight.side_line.square.common_data.first.cord_x, value.cord_y, straight.side_line.square.common_data.first.width_x, straight.side_line.square.common_data.height_y)
            ctx.fillRect(straight.side_line.square.common_data.second.cord_x, value.cord_y, straight.side_line.square.common_data.second.width_x, straight.side_line.square.common_data.height_y)

            ctx.fillRect(straight.side_line.square.common_data.third.cord_x, value.cord_y, straight.side_line.square.common_data.third.width_x, straight.side_line.square.common_data.height_y)
            ctx.fillRect(straight.side_line.square.common_data.fourth.cord_x, value.cord_y, straight.side_line.square.common_data.fourth.width_x, straight.side_line.square.common_data.height_y)
        }
    }

    return ctx
}

/**
 * INTERSECTION Functions
 */

/**
 * This function draws the start code of the intersection
 * @param ctx: The context of the canvas
 * @param intersection: the configuration list of the intersection
 * @param binary
 * @returns {*}
 */

function drawIntersectionStartLineWithCode(ctx, intersection, binary) {

    for (const [key, value] of Object.entries(intersection)) {
        if (key !== "connection_left_right" && key !== "connection_bottom_top") {
            //Draw both squares
            ctx.fillRect(value.square.cord_x_1, value.square.cord_y_1, value.square.width_x, value.square.height_y)
            ctx.fillRect(value.square.cord_x_2, value.square.cord_y_2, value.square.width_x, value.square.height_y)
            //Draw the lines for the car to follow
            ctx.fillRect(value.line.cord_x, value.line.cord_y, value.line.width_x, value.line.height_y)

            //Draw the codes for the track_id and location_id
            for (let i = 0; i < 4; i++) {
                if (binary[i] === "1") {
                    ctx.fillRect(value.code.track.bin_1.cord_x, value.code.track.bin_1.cord_y, value.code.track.bin_1.width_x, value.code.track.bin_1.height_y)
                } else {
                    ctx.fillRect(value.code.track.bin_0.cord_x, value.code.track.bin_0.cord_y, value.code.track.bin_0.width_x, value.code.track.bin_0.height_y)
                }
                ctx.fillRect(value.code.location.cord_x, value.code.location.cord_y, value.code.location.width_x, value.code.location.height_y)
                switch (key) {
                    case "top":
                        value.code.track.bin_1.cord_y += 152
                        value.code.track.bin_0.cord_y += 152
                        value.code.location.cord_y += 152
                        break
                    case "bottom":
                        value.code.track.bin_1.cord_y -= 152
                        value.code.track.bin_0.cord_y -= 152
                        value.code.location.cord_y -= 152
                        break
                    case "left":
                        value.code.track.bin_1.cord_x += 152
                        value.code.track.bin_0.cord_x += 152
                        value.code.location.cord_x += 152
                        break
                    case "right":
                        value.code.track.bin_1.cord_x -= 152
                        value.code.track.bin_0.cord_x -= 152
                        value.code.location.cord_x -= 152
                        break
                }
            }
        }
    }
    return ctx
}

/**
 *
 * @param ctx: The context of the canvas
 * @param intersection: the configuration list of the intersection
 * @returns {*}
 */

function drawIntersectionLineWithIntersectionCode(ctx, intersection) {

    for (const [key, value] of Object.entries(intersection)) {
        /**
         * Drawing the 3 codes that tell the car that the current track a intersection is and where it is
         */
        if (key === "connection_left_right" || key === "connection_bottom_top") {
            //Draw connection line between left and right intersection code
            ctx.fillRect(value.cord_x, value.cord_y, value.width_x, value.height_y)
        } else {
            //Drawing the intersection code at the bottom
            value.intersection_code.bottom.diff_arr.forEach((diff, index) => {
                if (key === "bottom" || key === "top") {
                    ctx.fillRect(value.intersection_code.bottom.cord_x + diff, value.intersection_code.bottom.cord_y, value.intersection_code.bottom.width_x_main, value.intersection_code.bottom.height_y)
                } else {
                    ctx.fillRect(value.intersection_code.bottom.cord_x, value.intersection_code.bottom.cord_y + diff, value.intersection_code.bottom.height_y, value.intersection_code.bottom.width_x_main)
                }
            })

            //Drawing the intersection code in the middle
            value.intersection_code.middle.diff_arr.forEach((diff, index) => {
                if (key === "bottom" || key === "top") {
                    if (index === 2) {
                        ctx.fillRect(value.intersection_code.middle.cord_x + diff, value.intersection_code.middle.cord_y, value.intersection_code.middle.width_x_main, value.intersection_code.middle.height_y)
                    } else {
                        ctx.fillRect(value.intersection_code.middle.cord_x + diff, value.intersection_code.middle.cord_y, value.intersection_code.middle.width_x_side, value.intersection_code.middle.height_y)
                    }
                } else {
                    if (index === 2) {
                        ctx.fillRect(value.intersection_code.middle.cord_x, value.intersection_code.middle.cord_y + diff, value.intersection_code.middle.height_y, value.intersection_code.middle.width_x_main)
                    } else {
                        ctx.fillRect(value.intersection_code.middle.cord_x, value.intersection_code.middle.cord_y + diff, value.intersection_code.middle.height_y, value.intersection_code.middle.width_x_side)
                    }
                }
            })

            //Drawing the intersection code at the top
            value.intersection_code.top.diff_arr.forEach((diff, index) => {
                if (key === "bottom" || key === "top") {
                    ctx.fillRect(value.intersection_code.top.cord_x + diff, value.intersection_code.top.cord_y, value.intersection_code.top.width_x_main, value.intersection_code.top.height_y)
                } else {
                    ctx.fillRect(value.intersection_code.top.cord_x, value.intersection_code.top.cord_y + diff, value.intersection_code.top.height_y, value.intersection_code.top.width_x_main)
                }
            })
            //Draw connection line between top and middle
            ctx.fillRect(value.intersection_code.line_1.cord_x, value.intersection_code.line_1.cord_y, value.intersection_code.line_1.width_x, value.intersection_code.line_1.height_y)
            //Draw connection line between middle and bottom
            ctx.fillRect(value.intersection_code.line_2.cord_x, value.intersection_code.line_2.cord_y, value.intersection_code.line_2.width_x, value.intersection_code.line_2.height_y)
        }
    }
    return ctx
}

/**
 * JUNCTION Functions
 */

/**
 * This function draws the arc of the junction with the transition, track-id and location-id codes
 * @param ctx: The context of the canvas
 * @param direction: The direction the arc should be drawn
 * @param num: Number of Lanes
 * @param outer_distance: The outer distance from the start line to the edge of the picture
 * @param start: Start of the arc in radian
 * @param end: End of the arc in radian
 * @param loc_code_counter: Counter for the location-id codes
 * @param binary: Binary value of the track-id
 * @returns {{ctx, counter}}: Returns the context and the loc_code_counter
 */

function drawJunctionArc(ctx, direction, num, outer_distance, start, end, loc_code_counter, binary) {
    for (let i = 0; i < num; i++) {

        //Calculate the circumference of the whole circle
        const quarter_circumference = (outer_distance * Math.PI) / 2

        //Percentage length of the code piece
        const code_length_percent = (76 / quarter_circumference)
        const code_length_rad = code_length_percent * Math.PI / 2

        //Percentage length of the squares at the beginning and in the end
        const start_length_percent = (100 / quarter_circumference)
        const start_length_rad = start_length_percent * Math.PI / 2

        //Start Position for the code pieces
        let start_code = start + code_length_rad * 1.8

        let junction_direction
        let junction = junction_track_piece_code(outer_distance, start_code, code_length_rad)

        switch (direction) {
            case "left":
                junction_direction = junction_track_piece_left(outer_distance, end, start, start_length_rad)
                drawJunctionStartArc(ctx, junction_direction)
                break
            case "right":
                junction_direction = junction_track_piece_right(outer_distance, end, start, start_length_rad)
                drawJunctionStartArc(ctx, junction_direction)
                break
        }

        //Calculate how many codes will fit on the arc
        let amount_of_codes = (quarter_circumference - 190) / (76 * 1.7)

        //Calculate how many numbered codes will be on the arc
        let amount_of_nub_codes = amount_of_codes - (amount_of_codes % 8)

        amount_of_codes = Math.floor(amount_of_codes)

        //Draw the codes the car reads for information
        for (let j = 0; j < amount_of_codes; j++) {

            ctx.strokeStyle = "black"

            //Get the binary string of the current location code
            let binary_loc = (loc_code_counter >>> 0).toString(2).split("");
            binary_loc.reverse()

            //When the max amount of codes that carry information is drawn the rest of the codes will be drawn as the extra thick code, which signal the end of a section
            if (amount_of_nub_codes > 0) {
                //Every 8th code will signal the end of the 7 Bit long array
                if (j % 8 === 0) {
                    //Draw the code that signals the car that a new section begins
                    ctx.beginPath();
                    ctx.strokeStyle = "black"
                    ctx.lineWidth = junction.junction_code.transition.type_3.width
                    ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.transition.type_3.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                    ctx.stroke();

                    //Draw the code that signals the car that a new section begins
                    ctx.beginPath();
                    ctx.strokeStyle = "black"
                    ctx.lineWidth = junction.junction_code.transition.type_1.width
                    ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.transition.type_1.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                    ctx.stroke();
                    loc_code_counter++
                } else {
                    //Drawing the location ID code
                    if (binary_loc[(j % 8) - 1] === "1") {
                        //Draw the location code for the binary value one
                        ctx.beginPath();
                        ctx.strokeStyle = "black"
                        ctx.lineWidth = junction.junction_code.location.type_2.width
                        ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.location.type_2.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                        ctx.stroke();
                    } else {
                        //Draw the location code for the binary value zero
                        ctx.beginPath();
                        ctx.strokeStyle = "black"
                        ctx.lineWidth = junction.junction_code.location.type_1.width
                        ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.location.type_1.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                        ctx.stroke();
                    }
                    //Drawing the track ID Code
                    if (binary[(j % 8) - 1] === "1") {
                        //draw the track id code for the binary value one
                        ctx.beginPath();
                        ctx.strokeStyle = "black"
                        ctx.lineWidth = junction.junction_code.track.type_2.width
                        ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.track.type_2.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                        ctx.stroke();
                    } else {
                        //Draw code at the side of the arc that the car follows
                        ctx.beginPath();
                        ctx.strokeStyle = "black"
                        ctx.lineWidth = junction.junction_code.track.type_1.width
                        ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.track.type_1.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                        ctx.stroke();
                    }
                }
            } else {
                //Draw code at the side of the arc that the car follows
                ctx.beginPath();
                ctx.strokeStyle = "black"
                ctx.lineWidth = junction.junction_code.transition.type_3.width
                ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.transition.type_3.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = "black"
                ctx.lineWidth = junction.junction_code.transition.type_1.width
                ctx.arc(junction_direction.start.common_data.cord_x, junction.junction_code.common_data.cord_y, junction.junction_code.transition.type_1.radius, junction.junction_code.common_data.start, junction.junction_code.common_data.end, junction.junction_code.common_data.anti_clockwise);
                ctx.stroke();
            }
            //start_code += code_length_rad * 1.7
            junction.junction_code.common_data.start += code_length_rad * 1.7
            junction.junction_code.common_data.end += code_length_rad * 1.7
            amount_of_nub_codes--
        }
        outer_distance+=90
    }
    return {
        ctx: ctx,
        counter: loc_code_counter
    }
}

/**
 * This function draws the startcode of the junction
 * @param ctx: The context of the canvas
 * @param junction: the configuration list of the junction track piece
 * @returns {*}
 */

function drawJunctionStartArc(ctx, junction) {

    for (const [key, value] of Object.entries(junction.start)) {
        if (key !== "common_data"){
            ctx.beginPath();
            ctx.lineWidth = value.width
            ctx.strokeStyle = value.color
            ctx.arc(junction.start.common_data.cord_x, junction.start.common_data.cord_y, value.radius, value.start, value.end, value.anti_clockwise);
            ctx.stroke();
        }
    }
    return ctx
}

/**
 * This function draws the sidelines of the junction track piece on the left and right side
 * @param ctx: The context of the canvas
 * @param junction: the configuration list of the junction track piece
 * @returns {*}
 */

function drawJunctionSideLine(ctx, junction) {
    for (const [key, value] of Object.entries(junction.side_line)) {
        if (key !== "common_data"){
            ctx.beginPath();
            ctx.lineWidth = value.width
            ctx.strokeStyle = value.color
            ctx.arc(value.cord_x, junction.side_line.common_data.cord_y, value.radius, value.start, value.end, value.anti_clockwise);
            ctx.stroke();
        }
    }

    return ctx
}

function curve_track_piece(start, end, outer_distance, outer_distance_sideline, start_code, code_length_rad, start_length_rad) {
    let curve;
    return curve = {
        curve_code: {
            transition: {
                type_3: {
                    radius: outer_distance - 22,
                    width: 16,
                },
                type_1: {
                    radius: outer_distance + 13,
                    width: 4,
                },
            },
            track: {
                type_2: {
                    radius: outer_distance + 16,
                    width: 10,
                },
                type_1: {
                    radius: outer_distance + 13,
                    width: 4,
                },
            },
            location: {
                type_2: {
                    radius: outer_distance - 16,
                    width: 10,
                },
                type_1: {
                    radius: outer_distance - 13,
                    width: 4,
                },
            },
            common_data: {
                cord_x: 0,
                cord_y: WIDTH_IMAGE,
                start: start_code,
                end: start_code + code_length_rad,
                anti_clockwise: false
            }
        },
        arc_line: {},
        start: {
            square_top_left: {
                radius: outer_distance - 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_top_right: {
                radius: outer_distance + 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_bottom_left: {
                radius: outer_distance - 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            square_bottom_right: {
                radius: outer_distance + 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            arc_main: {
                radius: outer_distance,
                start: start + start_length_rad,
                end: end - start_length_rad,
                anti_clockwise: false,
                width: 10,
                color: "black"
            },
            common_data: {
                cord_x: 0,
                cord_y: WIDTH_IMAGE,
            }
        },
        side_line: {
            outer_square_bottom_left: {
                radius: outer_distance_sideline - 135,
                start: end,
                end: end - ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            outer_square_top_left: {
                radius: outer_distance_sideline - 135,
                start: start,
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            inner_outline_left: {
                radius: outer_distance_sideline - 70,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            inner_outline_2_left: {
                radius: outer_distance_sideline - 89,
                start: end - ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            inner_outline_3_left: {
                radius: outer_distance_sideline - 105,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_3_left: {
                radius: outer_distance_sideline - 164,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_2_left: {
                radius: outer_distance_sideline - 183,
                start: end - ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_sideline * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            outer_outline_left: {
                radius: outer_distance_sideline - 200,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_square_bottom_right: {
                radius: outer_distance + 90 + 45,
                start: end,
                end: end - ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            outer_square_top_right: {
                radius: outer_distance + 90 + 45,
                start: start,
                end: start + ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            inner_outline_right: {
                radius: outer_distance + 90 - 20,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            inner_outline_2_right: {
                radius: outer_distance + 90 - 1,
                start: end - ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            inner_outline_3_right: {
                radius: outer_distance + 90 + 15,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_3_right: {
                radius: outer_distance + 90 + 74,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_2_right: {
                radius: outer_distance + 90 + 93,
                start: end - ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            outer_outline_right: {
                radius: outer_distance + 90 + 110,
                start: end,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            common_data: {
                cord_x: 0,
                cord_y: WIDTH_IMAGE
            }
        }
    }
}
function intersection_track_piece(start_val) {
    let intersection;

    const HEIGHT_IMAGE = 4292
    const WIDTH_IMAGE = 4292

    //Distances for the different track and location codes
    const track_id_code_zero_x = 67
    const track_id_code_one_x = 64
    const location_id_code_zero_x = 99
    const location_id_code_one_x = 96

    let start_y_top = 132
    let start_x_top = 132
    let start_y_bottom = 4090
    let start_x_bottom = 4090

    return intersection = {
        bottom: {
            square: {
                cord_x_1: start_val,
                cord_y_1: HEIGHT_IMAGE - 100,
                cord_x_2: start_val + 90,
                cord_y_2: HEIGHT_IMAGE - 100,
                width_x: 80,
                height_y: 100
            },
            line: {
                cord_x: start_val + 80,
                cord_y: WIDTH_IMAGE - 740,
                width_x: 10,
                height_y: 640
            },
            code: {
                track: {
                    bin_1: {
                        cord_x: start_val + location_id_code_one_x,
                        cord_y: start_y_bottom,
                        width_x: 10,
                        height_y: 76
                    },
                    bin_0: {
                        cord_x: start_val + location_id_code_zero_x,
                        cord_y: start_y_bottom,
                        width_x: 4,
                        height_y: 76
                    }
                },
                location: {
                    cord_x: start_val + track_id_code_zero_x,
                    cord_y: start_y_bottom,
                    width_x: 4,
                    height_y: 76
                }
            },
            intersection_code: {
                top: {
                    cord_x: start_val,
                    cord_y: HEIGHT_IMAGE - 816,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                middle: {
                    cord_x: start_val,
                    cord_y: HEIGHT_IMAGE - 968,
                    width_x_main: 14,
                    width_x_side: 12,
                    height_y: 76,
                    diff_arr: [42, 60, 78, 98, 116]
                },
                bottom: {
                    cord_x: start_val,
                    cord_y: HEIGHT_IMAGE - 1120,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                line_1: {
                    cord_x: start_val + 80,
                    cord_y: WIDTH_IMAGE - 892,
                    width_x: 10,
                    height_y: 76
                },
                line_2: {
                    cord_x: start_val + 80,
                    cord_y: WIDTH_IMAGE - 1044,
                    width_x: 10,
                    height_y: 76
                }
            }
        },
        top: {
            square: {
                cord_x_1: start_val,
                cord_y_1: 0,
                cord_x_2: start_val + 90,
                cord_y_2: 0,
                width_x: 80,
                height_y: 100
            },
            line: {
                cord_x: start_val + 80,
                cord_y: 100,
                width_x: 10,
                height_y: 640
            },
            code: {
                track: {
                    bin_1: {
                        cord_x: start_val + track_id_code_one_x,
                        cord_y: start_y_top,
                        width_x: 10,
                        height_y: 76
                    },
                    bin_0: {
                        cord_x: start_val + track_id_code_zero_x,
                        cord_y: start_y_top,
                        width_x: 4,
                        height_y: 76
                    }
                },
                location: {
                    cord_x: start_val + location_id_code_zero_x,
                    cord_y: start_y_top,
                    width_x: 4,
                    height_y: 76
                }
            },
            intersection_code: {
                top: {
                    cord_x: start_val,
                    cord_y: 740,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                middle: {
                    cord_x: start_val,
                    cord_y: 892,
                    width_x_main: 14,
                    width_x_side: 4,
                    height_y: 76,
                    diff_arr: [50, 64, 78, 100, 114]
                },
                bottom: {
                    cord_x: start_val,
                    cord_y: 1044,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                line_1: {
                    cord_x: start_val + 80,
                    cord_y: 816,
                    width_x: 10,
                    height_y: 76
                },
                line_2: {
                    cord_x: start_val + 80,
                    cord_y: 968,
                    width_x: 10,
                    height_y: 76
                }
            }
        },
        left: {
            square: {
                cord_x_1: 0,
                cord_y_1: start_val,
                cord_x_2: 0,
                cord_y_2: start_val + 90,
                width_x: 100,
                height_y: 80
            },
            line: {
                cord_x: 100,
                cord_y: start_val + 80,
                width_x: 640,
                height_y: 10
            },
            code: {
                track: {
                    bin_1: {
                        cord_x: start_x_top,
                        cord_y: start_val + location_id_code_one_x,
                        width_x: 76,
                        height_y: 10
                    },
                    bin_0: {
                        cord_x: start_x_top,
                        cord_y: start_val + location_id_code_zero_x,
                        width_x: 76,
                        height_y: 4
                    }
                },
                location: {
                    cord_x: start_x_top,
                    cord_y: start_val + track_id_code_zero_x,
                    width_x: 76,
                    height_y: 4
                }
            },
            intersection_code: {
                top: {
                    cord_x: 740,
                    cord_y: start_val,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                middle: {
                    cord_x: 892,
                    cord_y: start_val,
                    width_x_main: 4,
                    width_x_side: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                bottom: {
                    cord_x: 1044,
                    cord_y: start_val,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                line_1: {
                    cord_x: 816,
                    cord_y: start_val + 80,
                    width_x: 76,
                    height_y: 10
                },
                line_2: {
                    cord_x: 968,
                    cord_y: start_val + 80,
                    width_x: 76,
                    height_y: 10
                }
            }
        },
        right: {
            square: {
                cord_x_1: WIDTH_IMAGE - 100,
                cord_y_1: start_val,
                cord_x_2: WIDTH_IMAGE - 100,
                cord_y_2: start_val + 90,
                width_x: 100,
                height_y: 80
            },
            line: {
                cord_x: WIDTH_IMAGE - 740,
                cord_y: start_val + 80,
                width_x: 640,
                height_y: 10
            },
            code: {
                track: {
                    bin_1: {
                        cord_x: start_x_bottom,
                        cord_y: start_val + track_id_code_one_x,
                        width_x: 76,
                        height_y: 10
                    },
                    bin_0: {
                        cord_x: start_x_bottom,
                        cord_y: start_val + track_id_code_zero_x,
                        width_x: 76,
                        height_y: 4
                    }
                },
                location: {
                    cord_x: start_x_bottom,
                    cord_y: start_val + location_id_code_zero_x,
                    width_x: 76,
                    height_y: 4
                }
            },
            intersection_code: {
                top: {
                    cord_x: HEIGHT_IMAGE - 816,
                    cord_y: start_val,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                middle: {
                    cord_x: HEIGHT_IMAGE - 968,
                    cord_y: start_val,
                    width_x_main: 4,
                    width_x_side: 12,
                    height_y: 76,
                    diff_arr: [46, 64, 83, 92, 110]
                },
                bottom: {
                    cord_x: HEIGHT_IMAGE - 1120,
                    cord_y: start_val,
                    width_x_main: 4,
                    height_y: 76,
                    diff_arr: [55, 69, 83, 97, 111]
                },
                line_1: {
                    cord_x: WIDTH_IMAGE - 892,
                    cord_y: start_val + 80,
                    width_x: 76,
                    height_y: 10
                },
                line_2: {
                    cord_x: WIDTH_IMAGE - 1044,
                    cord_y: start_val + 80,
                    width_x: 76,
                    height_y: 10
                }
            }
        },
        connection_left_right: {
            cord_x: 1120,
            cord_y: start_val + 82,
            width_x: 2052,
            height_y: 6
        },
        connection_bottom_top: {
            cord_x: start_val + 79,
            cord_y: 1120,
            width_x: 12,
            height_y: 2052
        }
    }

}
function junction_track_piece_left(outer_distance, end, start, start_length_rad) {
    let junction_left;
    return junction_left = {
        start: {
            square_top_left: {
                radius: outer_distance - 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_top_right: {
                radius: outer_distance + 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_bottom_left: {
                radius: outer_distance - 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            square_bottom_right: {
                radius: outer_distance + 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            arc_main: {
                radius: outer_distance,
                start: start + start_length_rad,
                end: end - start_length_rad,
                anti_clockwise: false,
                width: 10,
                color: "black"
            },
            common_data: {
                cord_x: 0,
                cord_y: WIDTH_IMAGE,
            }
        }
    }
}
function junction_track_piece_right(outer_distance, end, start, start_length_rad) {
    let junction_right;
    return junction_right = {
        start: {
            square_top_left: {
                radius: outer_distance - 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_top_right: {
                radius: outer_distance + 45,
                start: start,
                end: start + start_length_rad,
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            square_bottom_left: {
                radius: outer_distance - 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            square_bottom_right: {
                radius: outer_distance + 45,
                start: end,
                end: end - start_length_rad,
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            arc_main: {
                radius: outer_distance,
                start: start + start_length_rad,
                end: end - start_length_rad,
                anti_clockwise: false,
                width: 10,
                color: "black"
            },
            common_data: {
                cord_x: HEIGHT_IMAGE,
                cord_y: WIDTH_IMAGE,
            }
        }
    }
}
function junction_track_piece_code(outer_distance, start_code, code_length_rad) {
    let junction_code;
    return junction_code = {
        junction_code: {
            transition: {
                type_3: {
                    radius: outer_distance - 22,
                    width: 16,
                },
                type_1: {
                    radius: outer_distance + 13,
                    width: 4,
                }
            },
            track: {
                type_2: {
                    radius: outer_distance + 16,
                    width: 10,
                },
                type_1: {
                    radius: outer_distance + 13,
                    width: 4,
                }
            },
            location: {
                type_2: {
                    radius: outer_distance - 16,
                    width: 10,
                },
                type_1: {
                    radius: outer_distance - 13,
                    width: 4,
                },
            },
            common_data: {
                cord_y: WIDTH_IMAGE,
                start: start_code,
                end: start_code + code_length_rad,
                anti_clockwise: false
            }
        }
    }
}
function junction_track_piece_side_line(outer_distance_right, outer_distance_left, end_right, end_left, start) {
    let sideline;
    return sideline = {
        side_line: {
            outer_square_bottom_left: {
                cord_x: 0,
                radius: outer_distance_left - 135,
                start: end_left,
                end: end_left - ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            outer_square_top_left: {
                cord_x: 0,
                radius: outer_distance_left - 135,
                start: start,
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            inner_outline_left: {
                cord_x: 0,
                radius: outer_distance_left - 70,
                start: end_left,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            inner_outline_2_left: {
                cord_x: 0,
                radius: outer_distance_left - 89,
                start: end_left - ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            inner_outline_3_left: {
                cord_x: 0,
                radius: outer_distance_left - 105,
                start: end_left,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_3_left: {
                cord_x: 0,
                radius: outer_distance_left - 164,
                start: end_left,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_outline_2_left: {
                cord_x: 0,
                radius: outer_distance_left - 183,
                start: end_left - ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                end: start + ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                anti_clockwise: true,
                width: 2,
                color: "black"
            },
            outer_outline_left: {
                cord_x: 0,
                radius: outer_distance_left - 200,
                start: end_left,
                end: start,
                anti_clockwise: true,
                width: 23,
                color: "black"
            },
            outer_square_bottom_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 135,
                start: end_right,
                end: end_right + ((Math.PI / 2) * (100 / ((outer_distance_right * Math.PI) / 2))),
                anti_clockwise: false,
                width: 80,
                color: "black"
            },
            outer_square_top_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 135,
                start: start,
                end: start - ((Math.PI / 2) * (100 / ((outer_distance_right * Math.PI) / 2))),
                anti_clockwise: true,
                width: 80,
                color: "black"
            },
            inner_outline_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 70,
                start: end_right,
                end: start,
                anti_clockwise: false,
                width: 23,
                color: "black"
            },
            inner_outline_2_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 89,
                start: end_right + ((Math.PI / 2) * (100 / ((outer_distance_right * Math.PI) / 2))),
                end: start - ((Math.PI / 2) * (100 / ((outer_distance_left * Math.PI) / 2))),
                anti_clockwise: false,
                width: 2,
                color: "black"
            },
            inner_outline_3_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 105,
                start: end_right,
                end: start,
                anti_clockwise: false,
                width: 23,
                color: "black"
            },
            outer_outline_3_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 164,
                start: end_right,
                end: start,
                anti_clockwise: false,
                width: 23,
                color: "black"
            },
            outer_outline_2_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 183,
                start: end_right + ((Math.PI / 2) * (100 / ((outer_distance_right * Math.PI) / 2))),
                end: start - ((Math.PI / 2) * (100 / ((outer_distance_right * Math.PI) / 2))),
                anti_clockwise: false,
                width: 2,
                color: "black"
            },
            outer_outline_right: {
                cord_x: WIDTH_IMAGE,
                radius: outer_distance_right - 200,
                start: end_right,
                end: start,
                anti_clockwise: false,
                width: 23,
                color: "black"
            },
            common_data: {
                cord_y: WIDTH_IMAGE
            }
        }
    }
}
function straight_track_piece(start_x, outer_distance, side_line_start) {

    const HEIGHT_IMAGE = 4292
    const WIDTH_IMAGE = 4292

    let straight;
    return straight = {
        top: {
            square: {
                left: {
                    cord_x: start_x,
                    cord_y: 0,
                    width_x: 80,
                    height_y: 100
                },
                right: {
                    cord_x: start_x + 90,
                    cord_y: 0,
                    width_x: 80,
                    height_y: 100
                }
            },
            transition_code_1: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: 132,
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: 132,
                    width_x: 16,
                    height_y: 76,
                }
            },
            transition_code_2: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: 284,
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: 284,
                    width_x: 16,
                    height_y: 76,
                }
            },
            track_code: {
                type_2: {
                    cord_x: start_x + 64,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 67,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 436,
                }
            },
            location_code: {
                type_2: {
                    cord_x: start_x + 96,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 99,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 436,
                }
            }
        },
        middle: {
            transition_code_1: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: HEIGHT_IMAGE - ((15 * 76) + 436),
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: HEIGHT_IMAGE - ((15 * 76) + 436),
                    width_x: 16,
                    height_y: 76,
                }
            },
            transition_code_2: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: 15 * 76 + 360,
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: 15 * 76 + 360,
                    width_x: 16,
                    height_y: 76,
                }
            },
            track_code: {
                type_2: {
                    cord_x: start_x + 64,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 67,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 1652
                }
            },
            location_code: {
                type_2: {
                    cord_x: start_x + 96,
                    cord_y: 1652,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 99,
                    cord_y: 1652,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 1652
                }
            }
        },
        bottom: {
            square: {
                left: {
                    cord_x: start_x,
                    cord_y: WIDTH_IMAGE - 100,
                    width_x: 80,
                    height_y: 100
                },
                right: {
                    cord_x: start_x + 90,
                    cord_y: WIDTH_IMAGE - 100,
                    width_x: 80,
                    height_y: 100
                }
            },
            transition_code_1: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: HEIGHT_IMAGE - 202,
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: HEIGHT_IMAGE - 202,
                    width_x: 16,
                    height_y: 76,
                }
            },
            transition_code_2: {
                type_1: {
                    cord_x: start_x + 67,
                    cord_y: HEIGHT_IMAGE - 354,
                    width_x: 4,
                    height_y: 76,
                },
                type_3: {
                    cord_x: start_x + 96,
                    cord_y: HEIGHT_IMAGE - 354,
                    width_x: 16,
                    height_y: 76,
                }
            },
            track_code: {
                type_2: {
                    cord_x: start_x + 64,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 67,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 2868
                }
            },
            location_code: {
                type_2: {
                    cord_x: start_x + 96,
                    width_x: 10,
                    height_y: 76,
                },
                type_1: {
                    cord_x: start_x + 99,
                    width_x: 4,
                    height_y: 76,
                },
                common_data: {
                    cord_y: 2868
                }
            }
        },
        follow_line: {
            cord_x: start_x + 80,
            cord_y: 100,
            width_x: 10,
            height_y: 4092,
        },
        side_line: {
            lines: {
                inner: {
                    left: {
                        cord_x: side_line_start + 154,
                        width_x: 16,
                    },
                    right: {
                        cord_x: outer_distance,
                        width_x: 16,
                    }
                },
                inner_2: {
                    left: {
                        cord_x: side_line_start + 185,
                        width_x: 3,
                    },
                    right: {
                        cord_x: outer_distance - 18,
                        width_x: 3,
                    }
                },
                inner_3: {
                    left: {
                        cord_x: side_line_start + 193,
                        width_x: 22,
                    },
                    right: {
                        cord_x: outer_distance - 45,
                        width_x: 22,
                    }
                },
                outer_3: {
                    left: {
                        cord_x: side_line_start + 238,
                        width_x: 22,
                    },
                    right: {
                        cord_x: outer_distance - 90,
                        width_x: 22,
                    }
                },
                outer_2: {
                    left: {
                        cord_x: side_line_start + 270,
                        width_x: 3,
                    },
                    right: {
                        cord_x: outer_distance - 103,
                        width_x: 3,
                    }
                },
                outer: {
                    left: {
                        cord_x: side_line_start + 278,
                        width_x: 20,
                    },
                    right: {
                        cord_x: outer_distance - 128,
                        width_x: 20,
                    }
                },
                common_data: {
                    cord_y: 100,
                    height_y: 4092
                }
            },
            square: {
                top: {
                    cord_y: 0
                },
                bottom: {
                    cord_y: HEIGHT_IMAGE - 100,
                },
                common_data: {
                    height_y: 100,
                    first: {
                        cord_x: side_line_start + 180,
                        width_x: 80,
                    },
                    second: {
                        cord_x: outer_distance - 90,
                        width_x: 80,
                    },
                    third: {
                        cord_x: side_line_start + 270,
                        width_x: 28,
                    },
                    fourth: {
                        cord_x: outer_distance - 128,
                        width_x: 28,
                    },
                }
            }
        }
    }
}