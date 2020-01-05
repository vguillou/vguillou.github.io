(function() {
    "use strict";

    // Find if we are in a commonJS environment, require dependencies if so
    var MODULE_NAME = 'PouchDBTester';
    var CONSOLE_PREFIX = '[' + MODULE_NAME + '] ';
    var _PouchDB;
    var _isModule = true;
    try {
        if (module && module.exports) {
            _PouchDB = require('pouchdb');
        }
    } catch(e) {
        if (!window) throw Error(CONSOLE_PREFIX + ' Not a browser environment');
        if (!window.PouchDB) throw Error(CONSOLE_PREFIX + 'PouchDB not found');
        if (window[MODULE_NAME]) throw Error(CONSOLE_PREFIX + 'Module already defined in the global window');
        _PouchDB = window.PouchDB;
        _isModule = false;
    }

    // The actual PourchDB tester
    var _localDB;
    var _remoteDB;
    var _hostHtmlElement;
    var _syncReplicateRemoteToLocalDBBtn;
    var _syncReplicateLocalToRemoteDBBtn;
    var _syncStatusEl;
    var _addDocumentsToLocalDBBtn;
    var _addDocumentsToRemoteDBBtn;
    var _removeDocumentsFromLocalDBBtn;
    var _removeDocumentsFromRemoteDBBtn;
    var _isAddingOrRemovingDocuments = false;

    function _errorHandler(e) {
        console.error(CONSOLE_PREFIX, e);
    }

    function _uuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16));
    }

    function _lorem(prefix) {
        return (prefix ? prefix + ' - ' : '') + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eleifend mi sit amet nibh suscipit, a rhoncus diam pellentesque. In euismod eros et accumsan cursus. Suspendisse eu auctor ex. Mauris feugiat lacus metus, ac dictum odio lacinia vitae. Maecenas pretium metus nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse at metus id ante mollis scelerisque. In eu consequat est. Sed vel nibh in felis consectetur commodo. Sed et ultricies tortor, non suscipit nunc. Sed vitae cursus odio. Pellentesque luctus ante vitae quam vehicula, ac interdum felis fringilla. Suspendisse potenti. Donec eu libero nec leo auctor pellentesque sed vitae tellus. Vestibulum feugiat venenatis nisl. Cras in semper libero. Praesent eu risus id nunc tristique viverra. Quisque tristique diam velit, eu sollicitudin ligula aliquet non. Vivamus sagittis lorem libero, non elementum odio egestas a. Quisque libero eros, consequat et ipsum id, pretium convallis felis. Donec tincidunt mattis sem, eu rutrum sem suscipit nec. Aenean porttitor urna at imperdiet molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent feugiat ligula iaculis ex commodo scelerisque. Nulla facilisi. Suspendisse accumsan ut sem nec luctus. Nunc tempor commodo nisl quis fermentum. Sed tristique eget nunc in auctor. Nunc sodales nibh et augue efficitur mattis. Ut fermentum orci eget dignissim rhoncus. Cras sagittis risus nibh, eu bibendum nulla luctus et. Curabitur et eros et tellus bibendum dictum in nec urna. Phasellus quis dui imperdiet turpis tempus hendrerit. Duis vulputate tempor est vel viverra. Maecenas lacus neque, molestie at scelerisque et, tempor vel augue. Integer ex ipsum, ullamcorper non imperdiet vitae, placerat eu dolor. Donec non feugiat ex, nec tincidunt urna. Donec vel lobortis sem, id scelerisque felis. Ut consectetur pretium hendrerit. Cras a nisl ipsum. Aenean id ligula pulvinar, laoreet nisi eu, mattis augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Suspendisse ut cursus ante. Donec nisl mi, ultrices vitae justo quis, ultricies vestibulum felis. Curabitur vitae neque ut massa mattis aliquam fermentum eu odio. Donec faucibus ligula lorem, maximus aliquet orci pulvinar a. Donec eu mi pretium, cursus lacus ut, mollis lacus. Aenean augue nisi, elementum quis lorem vitae, viverra rutrum eros. Aliquam pellentesque tempus congue. Aliquam erat volutpat. Morbi ultricies elementum metus, ut scelerisque purus venenatis et. Etiam risus nunc, faucibus cursus odio ullamcorper, vestibulum ornare velit. Suspendisse rutrum rutrum justo, eget pharetra eros. Maecenas eget lectus eget dolor varius eleifend eget ut magna. Donec lobortis convallis egestas. Nulla rutrum est non nulla malesuada, vel eleifend mauris finibus. Pellentesque id nisi tellus. Nullam vitae risus lacinia, dignissim orci sit amet, gravida elit. Sed dapibus lorem arcu, eu feugiat mi imperdiet eu. Praesent est lectus, accumsan sed nulla vel, lobortis vehicula urna. Etiam diam massa, dignissim ac mollis sit amet, egestas quis arcu. Cras sit amet leo massa. Phasellus maximus, massa sit amet lobortis porttitor, justo odio cursus ante, sed porta neque tellus sed sapien. Proin aliquam cursus leo, vel tempus orci tincidunt quis. Suspendisse consequat massa non mi fermentum egestas. Morbi tristique venenatis urna id tempor. Nulla sollicitudin lacinia nunc, at dictum mi facilisis vitae. Sed ipsum ante, sodales eu molestie vel, pharetra sed ex. Nam vulputate accumsan volutpat. Mauris risus sem, auctor vitae ullamcorper a, mollis sit amet nisl. Praesent ac hendrerit lacus. Nam commodo mattis neque in porttitor. Mauris magna orci, sagittis at nibh nec, efficitur ultricies ex. Cras odio eros, aliquam non orci quis, tempor faucibus diam. Aenean aliquam velit sed justo tincidunt, in tincidunt est tempor. Donec nec nulla malesuada, molestie ipsum eu, scelerisque orci. Mauris non eros et eros malesuada euismod in nec ipsum. Fusce faucibus nulla in leo pellentesque elementum. Nam varius tincidunt sapien a rhoncus. Proin non ligula est. Suspendisse bibendum metus a ullamcorper interdum. Etiam sed volutpat dolor, eu maximus erat. Aliquam erat volutpat. Fusce pharetra tellus ut est ullamcorper fringilla. Mauris rutrum ultrices lacinia. Mauris viverra gravida porta. Quisque imperdiet cursus ultricies. Mauris tristique turpis sed nisl laoreet, sed blandit nulla venenatis. Quisque eu posuere metus. Mauris laoreet, risus eu semper efficitur, nisi sem interdum urna, non facilisis ante nibh a est. Cras quis arcu faucibus, commodo dolor ac, lobortis purus. Aliquam erat volutpat. Morbi mattis justo non consectetur blandit. Donec dictum nunc id enim blandit mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed finibus congue dolor sed mollis. Sed id sodales metus, eu egestas nisl. Nulla in velit vel eros euismod lobortis ac vel ipsum. Donec maximus tellus libero, ac gravida nisi semper vitae. Duis elit metus, pellentesque ac arcu nec, aliquam pharetra eros. Quisque pharetra purus at ex venenatis placerat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean hendrerit porttitor arcu, non efficitur metus. Nunc mattis erat sed dui auctor, a sodales est lobortis. Phasellus laoreet erat sed leo varius faucibus. Integer tincidunt pharetra lobortis. Integer cursus sem sit amet mattis iaculis. Nullam mi nunc, accumsan ac erat venenatis, malesuada vestibulum sem. Fusce efficitur leo metus, ac luctus metus semper nec. Donec semper, erat in dictum hendrerit, sapien elit tempus nisi, a semper nibh nunc nec libero. In tempor vel nulla ut elementum. Aliquam sit amet sem at elit aliquam dapibus. Curabitur posuere tempor porttitor. Proin et venenatis ipsum. Cras convallis nec augue at iaculis.';
    }

    // Print storage information
    function _bytesToString(bytesCount) {
        const kCoef = Math.pow(2, 10);
        const mCoef = Math.pow(kCoef, 2);
        const gCoef = Math.pow(kCoef, 3);
        if (bytesCount < kCoef) return bytesCount + 'b';
        if (bytesCount < mCoef) return (bytesCount / kCoef).toFixed(2) + 'kb';
        if (bytesCount < gCoef) return (bytesCount / mCoef).toFixed(2) + 'mb';
        return (bytesCount / gCoef).toFixed(2) + 'gb';
    }

    // Fetch and displays DB info in console and HTML
    function _refreshDBInfo(db, htmlElementId) {
        return db.info()
            .then(function(result) {
                console.debug(CONSOLE_PREFIX, result);
                var info = [];
                if (result.adapter) info.push(result.adapter + ' adapter');
                if (typeof result.doc_count === 'number') info.push(result.doc_count + ' docs');
                if (typeof result.data_size === 'number') info.push(_bytesToString(result.data_size));
                var infoStr = info.join(' | ');
                console.info(CONSOLE_PREFIX + db.name + ': ' + infoStr);
                if (!_isModule && _hostHtmlElement && htmlElementId) {
                    document.getElementById(htmlElementId).innerHTML = infoStr;
                }
            })
            .catch(_errorHandler);
    }

    // Displays local DB info in console and HTML
    function _refreshLocalDBInfo() {
        _refreshDBInfo(_localDB, MODULE_NAME + '_local_info');
    };

    // Fetch and displays remote DB info in console and HTML
    function _refreshRemoteDBInfo() {
        if (_remoteDB) _refreshDBInfo(_remoteDB, MODULE_NAME + '_remote_info');
    }

    // Sync DBs

    function _enableSyncButtons(enable) {
        if (_syncReplicateRemoteToLocalDBBtn) _syncReplicateRemoteToLocalDBBtn.disabled = !enable;
        if (_syncReplicateLocalToRemoteDBBtn) _syncReplicateLocalToRemoteDBBtn.disabled = !enable;
    }

    function _onSyncChange(info) {
        // handle change
        var progress;
        // Remote => Local
        if (info.pending) progress = ((info.docs_read / (info.docs_read + info.pending)) * 100).toFixed(0) + '%';
        else progress = 'Sent ' + info.docs_written + ' docs';
        console.info('[pouchdb] Replication change. progress: ' + progress, info);
        _syncStatusEl.innerHTML = 'Sync ongoing 💪 [' + progress + ']';
    }

    function _onSyncPaused(err) {
        // replication paused (e.g. replication up to date, user went offline)
        console.info('[pouchdb] Replication paused', err);
        _syncStatusEl.innerHTML = 'Sync paused! 😒';
    }

    function _onSyncActive() {
        // replicate resumed (e.g. new changes replicating, user went back online)
        console.info('[pouchdb] Replication active');
        _syncStatusEl.innerHTML = 'Sync active 😊';
    }

    function _onSyncDenied(err) {
        // a document failed to replicate (e.g. due to permissions)
        console.info('[pouchdb] Replication denied', err);
        _syncStatusEl.innerHTML = 'Sync denied! 😱';
        _enableSyncButtons(true);
    }

    function _onSyncComplete(info) {
        // handle complete
        console.info('[pouchdb] Replication complete', info);
        _syncStatusEl.innerHTML = 'Sync complete! 😍';
        _enableSyncButtons(true);
    }

    function _onSyncError(err) {
        // handle error
        console.info('[pouchdb] Replication error', err);
        _syncStatusEl.innerHTML = 'Sync error! 😓';
        _enableSyncButtons(true);
    }

    function _syncReplicationRemoteToLocalDB() {
        if (_remoteDB) {
            _enableSyncButtons(false);
            _localDB.replicate.from(_remoteDB)
                .on('change', _onSyncChange)
                .on('paused', _onSyncPaused)
                .on('active', _onSyncActive)
                .on('denied', _onSyncDenied)
                .on('complete', _onSyncComplete)
                .on('error', _onSyncError);
        }
    }

    function _syncReplicationLocalToRemoteDB() {
        if (_remoteDB) {
            _enableSyncButtons(false);
            _localDB.replicate.to(_remoteDB)
                .on('change', _onSyncChange)
                .on('paused', _onSyncPaused)
                .on('active', _onSyncActive)
                .on('denied', _onSyncDenied)
                .on('complete', _onSyncComplete)
                .on('error', _onSyncError);
        }
    }

    // Add documents to DB

    function _newDocument() {
        return {
            _id: _uuid(),
            lorem: _lorem(Math.random()),
            ipsum: _lorem(Math.random()),
        };
    }

    function _enableAddingOrRemovingDocumentsButtons(enable) {
        _addDocumentsToLocalDBBtn.disabled = !enable;
        if (_addDocumentsToRemoteDBBtn) _addDocumentsToRemoteDBBtn.disabled = !enable;
        _removeDocumentsFromLocalDBBtn.disabled = !enable;
        if (_removeDocumentsFromRemoteDBBtn) _removeDocumentsFromRemoteDBBtn.disabled = !enable;
    }

    function _addDocuments(db, documentCount) {
        var i = documentCount;
        _isAddingOrRemovingDocuments = true;
        _enableAddingOrRemovingDocumentsButtons(false);

        var newDocs = [];
        while (i) {
            newDocs.push(_newDocument());
            i--;
        }

        return db.bulkDocs(deletedDocs)
            .then(function() {
                console.info(CONSOLE_PREFIX + ' Done adding documents.');
            })
            .catch(_errorHandler)
            .then(function() {
                _isAddingOrRemovingDocuments = false;
                _enableAddingOrRemovingDocumentsButtons(true);
            });
    }

    function _addDocumentsToLocalDB(documentCount) {
        return _addDocuments(_localDB, documentCount);
    }
    
    function _addDocumentsToRemoteDB(documentCount) {
        return _addDocuments(_remoteDB, documentCount);
    }

    // Remove random documents from DB

    function _removeDocuments(db, documentCount) {
        _isAddingOrRemovingDocuments = true;
        _enableAddingOrRemovingDocumentsButtons(false);

        db.allDocs({ limit: documentCount, include_docs: true })
            .then(function(result) {
                console.debug(CONSOLE_PREFIX, result);
                if (result && result.rows) {
                    var deletedDocs = result.rows.map(function(row) {
                        row.doc._deleted = true;
                        return row.doc;
                    });
                    return db.bulkDocs(deletedDocs);
                }
            })
            .then(function() {
                console.info(CONSOLE_PREFIX + ' Done removing documents.');
            })
            .catch(_errorHandler)
            .then(function() {
                _isAddingOrRemovingDocuments = false;
                _enableAddingOrRemovingDocumentsButtons(true);
            })
    }

    function _removeDocumentsFromLocalDB(documentCount) {
        return _removeDocuments(_localDB, documentCount);
    }
    
    function _removeDocumentsFromRemoteDB(documentCount) {
        return _removeDocuments(_remoteDB, documentCount);
    }

    var pouchDBTester = {
        /**
         * Prepare the tester and print the info about the local and remote DBs
         * @param {string} localDBPath Full local DB path (ex: `mydb`)
         * @param {string=} remoteDBPath (Optional) Full remote DB path (ex: `https://xxx-bluemix.cloudantnosqldb.appdomain.cloud/mydb`)
         * @param {PouchDB.Configuration.DatabaseConfiguration=} remoteDBOptions (Optional) Configuration for the remote DB, for instance credentials (ex: `{ auth: { username: 'my_cloudant_apikey', password: 'my_cloudant_password'} }`)
         * @param {HTMLElement=} hostHtmlElement (Optional) Host HTML element to display the tester informations (ex: `document.getElementById('PouchDBTesterHost')`)
         * @param {number} refreshInterval (Optional) Refresh interval to print info about the local and remote DBs, in seconds
         */
        start: function(localDBPath, remoteDBPath, remoteDBOptions, hostHtmlElement, refreshInterval) {
            _localDB = new _PouchDB(localDBPath, { auto_compaction: true });
            if (remoteDBPath) _remoteDB = new _PouchDB(remoteDBPath, remoteDBOptions);
            _hostHtmlElement = hostHtmlElement;
            if (!_isModule && _hostHtmlElement) {
                _hostHtmlElement.innerHTML = '<h2>PouchDB tester:</h2>\n' +
                    '<ul>\n' +
                        '<li style="list-style: none;">\n' +
                            (_remoteDB ? '<button id="' + MODULE_NAME + '_syncReplicateRemoteToLocalDBBtn" onclick="' + MODULE_NAME + '_onSyncReplicateRemoteToLocalDBBtn()">🔄 Sync Remote =&gt; Local</button>\n' : '') +
                            (_remoteDB ? '<button id="' + MODULE_NAME + '_syncReplicateLocalToRemoteDBBtn" onclick="' + MODULE_NAME + '_onSyncReplicateLocalToRemoteDBBtn()">🔄 Sync Remote &lt;= Local</button>\n' : '') +
                        '</li>\n' +
                        '<li style="list-style: none;">\n' +
                            '<b id="' + MODULE_NAME + '_syncStatusEl" style="color: blue;"></b>\n' +
                        '</li>\n' +
                        '<li>Local DB : <b id="' + MODULE_NAME + '_local_info">Unknown</b></li>\n' +
                        (_remoteDB ? '<li>Remote DB : <b id="' + MODULE_NAME + '_remote_info">Unknown</b></li>\n' : '') +
                        '<li style="list-style: none;">\n' +
                            '<button id="' + MODULE_NAME + '_addDocumentsToLocalDBBtn" onclick="' + MODULE_NAME + '_onAddDocumentsToLocalDB(1000)">➕ Add 1000 docs to Local</button>\n' +
                            (_remoteDB ? '<button id="' + MODULE_NAME + '_addDocumentsToRemoteDBBtn" onclick="' + MODULE_NAME + '_onAddDocumentsToRemoteDB(100)">➕ Add 100 docs to Remote</button>\n' : '') +
                        '</li>\n' +
                        '<li style="list-style: none;">\n' +
                            '<button id="' + MODULE_NAME + '_removeDocumentsFromLocalDBBtn" onclick="' + MODULE_NAME + '_onRemoveDocumentsFromLocalDB(100)">❌ Remove 100 docs from Local</button>\n' +
                            (_remoteDB ? '<button id="' + MODULE_NAME + '_removeDocumentsFromRemoteDBBtn" onclick="' + MODULE_NAME + '_onRemoveDocumentsFromRemoteDB(10)">❌ Remove 10 docs from Remote</button>\n' : '') +
                        '</li>\n' +
                    '</ul>';
                
                _syncReplicateRemoteToLocalDBBtn = document.getElementById(MODULE_NAME + '_syncReplicateRemoteToLocalDBBtn');
                _syncReplicateLocalToRemoteDBBtn = document.getElementById(MODULE_NAME + '_syncReplicateLocalToRemoteDBBtn');
                _syncStatusEl = document.getElementById(MODULE_NAME + '_syncStatusEl');
                _addDocumentsToLocalDBBtn = document.getElementById(MODULE_NAME + '_addDocumentsToLocalDBBtn');
                _addDocumentsToRemoteDBBtn = document.getElementById(MODULE_NAME + '_addDocumentsToRemoteDBBtn');
                _removeDocumentsFromLocalDBBtn = document.getElementById(MODULE_NAME + '_removeDocumentsFromLocalDBBtn');
                _removeDocumentsFromRemoteDBBtn = document.getElementById(MODULE_NAME + '_removeDocumentsFromRemoteDBBtn');
                window[MODULE_NAME + '_onSyncReplicateRemoteToLocalDBBtn'] = _syncReplicationRemoteToLocalDB;
                window[MODULE_NAME + '_onSyncReplicateLocalToRemoteDBBtn'] = _syncReplicationLocalToRemoteDB;
                window[MODULE_NAME + '_onAddDocumentsToLocalDB'] = _addDocumentsToLocalDB;
                window[MODULE_NAME + '_onAddDocumentsToRemoteDB'] = _addDocumentsToRemoteDB;
                window[MODULE_NAME + '_onRemoveDocumentsFromLocalDB'] = _removeDocumentsFromLocalDB;
                window[MODULE_NAME + '_onRemoveDocumentsFromRemoteDB'] = _removeDocumentsFromRemoteDB;
            }

            _refreshLocalDBInfo();
            _refreshRemoteDBInfo();
            if (refreshInterval > 0) {
                setInterval(function() {
                    if (!_isAddingOrRemovingDocuments) {
                        _refreshLocalDBInfo();
                        _refreshRemoteDBInfo()
                    }
                }, refreshInterval * 1000 );
            }
        }
    }

    // Export as commonJs module or in the global window
    if (_isModule) {
        module.exports = pouchDBTester;
    } else {
        window[MODULE_NAME] = pouchDBTester;
    }
})();
