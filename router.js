/*
 *  Anki Overdrive -- Track Editor Portable Version
 *  Project 2 (BTI3041) 21, Bern University of Applied Sciences
 *  Developer: Mac Müller
 *
 *  router.js:  Getting html-Elements from a controller.
 *              <main> element of homepage(index.html) will be replaced.
 *
 */
const routes = Object.create(null);
const $main = $('main');

/**
 * <main> element of index.html will be replaced by a view.
 * @param $view
 */
function setView($view) {
    $main.fadeOut(150, function(){ $main.empty().append($view).fadeIn(300); });
}

/**
 * Get a view from a controller.
 */
function render() {
    const hash = decodeURI(location.hash).replace('#/', '').split('/');
    const path = '/' + (hash[0] || '');
    if(!routes[path]) {
        setView($("<h2>404 Not Found</h2><p>Sorry, page not found!</p>"));
        return;
    }
    const component = routes[path];
    const param = hash.length > 1 ? hash[1] : '';
    const $view = component.render(param);
    setView($view);
    document.title = "Anki Overdrive: " + (component.getTitle ? " " + component.getTitle() : " ");
}
$(window).on('hashchange', render);

/**
 * Public interface
 * */
export default {
    register: function (path, component) {
        routes[path] = component;
    },
    go: function(path, param) {
         path += param ? '/' + param : '';
         if (location.hash !== '#' + path) {
             location.hash = path;
         } else {
            render();
         }
    }
};