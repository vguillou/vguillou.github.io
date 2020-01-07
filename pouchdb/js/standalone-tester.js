(function() {
    "use strict";

    // Find if we are in a commonJS environment, require dependencies if so
    var MODULE_NAME = 'StandaloneTester';
    var CONSOLE_PREFIX = '[' + MODULE_NAME + '] ';
    var _isModule = true;
    try {
        if (module && module.exports) console.trace('module');
    } catch(e) {
        if (!window) throw Error(CONSOLE_PREFIX + 'Not a browser environment');
        if (window[MODULE_NAME]) throw Error(CONSOLE_PREFIX + 'Module already defined in the global window');
        _isModule = false;
    }

    // The actual Standalone tester
    var standaloneTester = {
        /**
         * Prepare the tester and print the info
         * @param {HTMLElement=} hostHtmlElement (Optional) Host HTML element to display the tester informations (ex: `document.getElementById('StandaloneTesterHost')`)
         */
        start: function(hostHtmlElement) {
            if (!_isModule && hostHtmlElement) {
                hostHtmlElement.innerHTML = '<h3>Standalone tester:</h3>\n' +
                    '<ul>\n' +
                        '<li>iOS standalone mode: <b id="' + MODULE_NAME + '_ios">OFF</b></li>\n' +
                        '<li>W3C standalone mode: <b id="' + MODULE_NAME + '_manifest">OFF</b></li>\n' +
                    '</ul>';
            }

            // Detect IOS standalone mode
            var isIosStandaloneMode = !!window.navigator.standalone;
            if (!_isModule && hostHtmlElement) document.getElementById(MODULE_NAME + '_ios').innerHTML = isIosStandaloneMode ? 'ON' : 'OFF';
            console.info(CONSOLE_PREFIX + 'iOS standalone mode: ' + (isIosStandaloneMode ? 'ON' : 'OFF'));

            // Detect a Webapp defined via a standard manifest (using the parameter added in the `starturl`)
            var isStandardStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
            if (!_isModule && hostHtmlElement) document.getElementById(MODULE_NAME + '_manifest').innerHTML = isStandardStandaloneMode ? 'ON' : 'OFF';
            console.info(CONSOLE_PREFIX + 'W3C standalone mode: ' + (isStandardStandaloneMode ? 'ON' : 'OFF'));
        }
    }

    // Export as commonJs module or in the global window
    if (_isModule) {
        module.exports = standaloneTester;
    } else {
        window[MODULE_NAME] = standaloneTester;
    }
})();
