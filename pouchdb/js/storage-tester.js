(function() {
    "use strict";

    // Find if we are in a commonJS environment, require dependencies if so
    var MODULE_NAME = 'StorageTester';
    var CONSOLE_PREFIX = '[' + MODULE_NAME + '] ';
    var _isModule = true;
    try {
        if (module && module.exports) console.trace('module');
    } catch(e) {
        if (!window) throw Error(CONSOLE_PREFIX + 'Not a browser environment');
        if (window[MODULE_NAME]) throw Error(CONSOLE_PREFIX + 'Module already defined in the global window');
        _isModule = false;
    }

    // The actual Storage tester
    var _persistentEl;
    var _estimateEl;
    var _detailsEl;

    // Print storage information
    function _bytesToString(bytesCount) {
        var kCoef = Math.pow(2, 10);
        var mCoef = Math.pow(kCoef, 2);
        var gCoef = Math.pow(kCoef, 3);
        if (bytesCount < kCoef) return bytesCount + 'b';
        if (bytesCount < mCoef) return (bytesCount / kCoef).toFixed(2) + 'kb';
        if (bytesCount < gCoef) return (bytesCount / mCoef).toFixed(2) + 'mb';
        return (bytesCount / gCoef).toFixed(2) + 'gb';
    }

    // Transforms usage details to an HTML string
    function _usageDetailsToString(usageDetails) {
        if (!usageDetails || !Object.keys(usageDetails).length) return 'No storage details';
        return Object.entries(usageDetails)
            .map(function([type, bytes]) { return '• ' + type + ': ' + _bytesToString(bytes); })
            .join('<br>');
    }

    // Updates the storage usage estimate on screen
    function _updateStorageEstimate() {
        if ('storage' in navigator) {
            if ('persist' in navigator.storage) {
                navigator.storage.persist().then(function(granted) {
                    _persistentEl.innerHTML = granted ? 'Yes' : 'No';
                });
            }
            if ('estimate' in navigator.storage) {
                navigator.storage.estimate()
                    .then(function(estimate) {
                        _estimateEl.innerHTML = 'Using ' + _bytesToString(estimate.usage) + ' out of ' + _bytesToString(estimate.quota);
                        if ('usageDetails' in estimate)
                            _detailsEl.innerHTML = _usageDetailsToString(estimate.usageDetails);
                    });
                }
            }
    }

    var storageTester = {
        /**
         * Prepare the tester and print the info
         * @param {HTMLElement=} hostHtmlElement (Optional) Host HTML element to display the tester informations (ex: `document.getElementById('StorageTesterHost')`)
         * @param {number} refreshInterval (Optional) Refresh interval to print info about the storage, in seconds
         */
        start: function(hostHtmlElement, refreshInterval) {
            if (!_isModule && hostHtmlElement) {
                hostHtmlElement.innerHTML = '<h3><u>Storage tester:</u></h3>\n' +
                    '<ul>\n' +
                        '<li style="margin-bottom: 10px;">Persistent : <b id="' + MODULE_NAME + '_persistent">Not available</b></li>\n' +
                        '<li style="margin-bottom: 10px;">Estimate : <b id="' + MODULE_NAME + '_estimate">Not available</b>\n' +
                            '<p id="' + MODULE_NAME + '_details"></p>\n'
                        '</li>\n' +
                    '</ul>';
            }

            _persistentEl = document.getElementById(MODULE_NAME + '_persistent');
            _estimateEl = document.getElementById(MODULE_NAME + '_estimate');
            _detailsEl = document.getElementById(MODULE_NAME + '_details');

            _updateStorageEstimate();
            setInterval(_updateStorageEstimate, refreshInterval * 1000);
        }
    }

    // Export as commonJs module or in the global window
    if (_isModule) {
        module.exports = storageTester;
    } else {
        window[MODULE_NAME] = storageTester;
    }
})();
