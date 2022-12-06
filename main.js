/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  main.js contains
 *  - Import: List of controllers (templates).
 *  - Registration: All controllers muss be registered to page-router.
 *  - Navigation functions.
 *  - A homepage calling function.
 *
 */

import router from "./router.js";
import home from "./controller/home.js";
import dgt from "./controller/digital-twin.js";
import setting from "./controller/setting.js";
import util from "./model/util.js";

router.register("/home", home);
router.register("/digital-twin", dgt);
router.register("/setting", setting);
util.init();

/**
 * Go Home page
 */
router.go("/home");