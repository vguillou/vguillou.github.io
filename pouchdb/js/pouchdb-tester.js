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
        if (!window) throw Error(CONSOLE_PREFIX + 'Not a browser environment');
        if (!window.PouchDB) throw Error(CONSOLE_PREFIX + 'PouchDB not found');
        if (window[MODULE_NAME]) throw Error(CONSOLE_PREFIX + 'Module already defined in the global window');
        _PouchDB = window.PouchDB;
        _isModule = false;
    }

    // The actual PourchDB tester
    var LOCAL_ACTION_DOC_COUNT = 1000;
    var REMOTE_ACTION_DOC_COUNT = 100;

    var _localDBPath;
    var _remoteDBPath;
    var _remoteDBOptions;
    var _hostHtmlElement;
    var _refreshInterval;
    var _localDB;
    var _remoteDB;
    var _localDBFirstDoc;
    var _remoteDBFirstDoc;
    var _liveSyncHandler;
    var _liveSyncChangeCount;
    var _syncReplicateRemoteToLocalDBBtn;
    var _syncReplicateLocalToRemoteDBBtn;
    var _syncStatusEl;
    var _modifyFirstDocOnLocalDBTxt;
    var _modifyFirstDocOnLocalDBBtn;
    var _modifyFirstDocOnRemoteDBTxt;
    var _modifyFirstDocOnRemoteDBBtn;
    var _addDocumentsToLocalDBBtn;
    var _addDocumentsToRemoteDBBtn;
    var _removeDocumentsFromLocalDBBtn;
    var _removeDocumentsFromRemoteDBBtn;
    var _destroyLocalDBBtn;
    var _destroyRemoteDBBtn;
    var _compactLocalDBBtn;
    var _stopPollingInfo = false;

    function _errorHandlerFactory(showAlert) {
        return function(e) {
            console.error(CONSOLE_PREFIX, e);
            if (showAlert) alert(CONSOLE_PREFIX + (e ? (e.reason || JSON.stringify(e)) : 'Unknown error'));
        }
    }

    function _uuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16));
    }

    function _lorem(prefix) {
        return (prefix ? prefix + ' - ' : '') + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eleifend mi sit amet nibh suscipit, a rhoncus diam pellentesque. In euismod eros et accumsan cursus. Suspendisse eu auctor ex. Mauris feugiat lacus metus, ac dictum odio lacinia vitae. Maecenas pretium metus nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse at metus id ante mollis scelerisque. In eu consequat est. Sed vel nibh in felis consectetur commodo. Sed et ultricies tortor, non suscipit nunc. Sed vitae cursus odio. Pellentesque luctus ante vitae quam vehicula, ac interdum felis fringilla. Suspendisse potenti. Donec eu libero nec leo auctor pellentesque sed vitae tellus. Vestibulum feugiat venenatis nisl. Cras in semper libero. Praesent eu risus id nunc tristique viverra. Quisque tristique diam velit, eu sollicitudin ligula aliquet non. Vivamus sagittis lorem libero, non elementum odio egestas a. Quisque libero eros, consequat et ipsum id, pretium convallis felis. Donec tincidunt mattis sem, eu rutrum sem suscipit nec. Aenean porttitor urna at imperdiet molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent feugiat ligula iaculis ex commodo scelerisque. Nulla facilisi. Suspendisse accumsan ut sem nec luctus. Nunc tempor commodo nisl quis fermentum. Sed tristique eget nunc in auctor. Nunc sodales nibh et augue efficitur mattis. Ut fermentum orci eget dignissim rhoncus. Cras sagittis risus nibh, eu bibendum nulla luctus et. Curabitur et eros et tellus bibendum dictum in nec urna. Phasellus quis dui imperdiet turpis tempus hendrerit. Duis vulputate tempor est vel viverra. Maecenas lacus neque, molestie at scelerisque et, tempor vel augue. Integer ex ipsum, ullamcorper non imperdiet vitae, placerat eu dolor. Donec non feugiat ex, nec tincidunt urna. Donec vel lobortis sem, id scelerisque felis. Ut consectetur pretium hendrerit. Cras a nisl ipsum. Aenean id ligula pulvinar, laoreet nisi eu, mattis augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Suspendisse ut cursus ante. Donec nisl mi, ultrices vitae justo quis, ultricies vestibulum felis. Curabitur vitae neque ut massa mattis aliquam fermentum eu odio. Donec faucibus ligula lorem, maximus aliquet orci pulvinar a. Donec eu mi pretium, cursus lacus ut, mollis lacus. Aenean augue nisi, elementum quis lorem vitae, viverra rutrum eros. Aliquam pellentesque tempus congue. Aliquam erat volutpat. Morbi ultricies elementum metus, ut scelerisque purus venenatis et. Etiam risus nunc, faucibus cursus odio ullamcorper, vestibulum ornare velit. Suspendisse rutrum rutrum justo, eget pharetra eros. Maecenas eget lectus eget dolor varius eleifend eget ut magna. Donec lobortis convallis egestas. Nulla rutrum est non nulla malesuada, vel eleifend mauris finibus. Pellentesque id nisi tellus. Nullam vitae risus lacinia, dignissim orci sit amet, gravida elit. Sed dapibus lorem arcu, eu feugiat mi imperdiet eu. Praesent est lectus, accumsan sed nulla vel, lobortis vehicula urna. Etiam diam massa, dignissim ac mollis sit amet, egestas quis arcu. Cras sit amet leo massa. Phasellus maximus, massa sit amet lobortis porttitor, justo odio cursus ante, sed porta neque tellus sed sapien. Proin aliquam cursus leo, vel tempus orci tincidunt quis. Suspendisse consequat massa non mi fermentum egestas. Morbi tristique venenatis urna id tempor. Nulla sollicitudin lacinia nunc, at dictum mi facilisis vitae. Sed ipsum ante, sodales eu molestie vel, pharetra sed ex. Nam vulputate accumsan volutpat. Mauris risus sem, auctor vitae ullamcorper a, mollis sit amet nisl. Praesent ac hendrerit lacus. Nam commodo mattis neque in porttitor. Mauris magna orci, sagittis at nibh nec, efficitur ultricies ex. Cras odio eros, aliquam non orci quis, tempor faucibus diam. Aenean aliquam velit sed justo tincidunt, in tincidunt est tempor. Donec nec nulla malesuada, molestie ipsum eu, scelerisque orci. Mauris non eros et eros malesuada euismod in nec ipsum. Fusce faucibus nulla in leo pellentesque elementum. Nam varius tincidunt sapien a rhoncus. Proin non ligula est. Suspendisse bibendum metus a ullamcorper interdum. Etiam sed volutpat dolor, eu maximus erat. Aliquam erat volutpat. Fusce pharetra tellus ut est ullamcorper fringilla. Mauris rutrum ultrices lacinia. Mauris viverra gravida porta. Quisque imperdiet cursus ultricies. Mauris tristique turpis sed nisl laoreet, sed blandit nulla venenatis. Quisque eu posuere metus. Mauris laoreet, risus eu semper efficitur, nisi sem interdum urna, non facilisis ante nibh a est. Cras quis arcu faucibus, commodo dolor ac, lobortis purus. Aliquam erat volutpat. Morbi mattis justo non consectetur blandit. Donec dictum nunc id enim blandit mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed finibus congue dolor sed mollis. Sed id sodales metus, eu egestas nisl. Nulla in velit vel eros euismod lobortis ac vel ipsum. Donec maximus tellus libero, ac gravida nisi semper vitae. Duis elit metus, pellentesque ac arcu nec, aliquam pharetra eros. Quisque pharetra purus at ex venenatis placerat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean hendrerit porttitor arcu, non efficitur metus. Nunc mattis erat sed dui auctor, a sodales est lobortis. Phasellus laoreet erat sed leo varius faucibus. Integer tincidunt pharetra lobortis. Integer cursus sem sit amet mattis iaculis. Nullam mi nunc, accumsan ac erat venenatis, malesuada vestibulum sem. Fusce efficitur leo metus, ac luctus metus semper nec. Donec semper, erat in dictum hendrerit, sapien elit tempus nisi, a semper nibh nunc nec libero. In tempor vel nulla ut elementum. Aliquam sit amet sem at elit aliquam dapibus. Curabitur posuere tempor porttitor. Proin et venenatis ipsum. Cras convallis nec augue at iaculis.';
    }

    function _bytesToString(bytesCount) {
        var kCoef = Math.pow(2, 10);
        var mCoef = Math.pow(kCoef, 2);
        var gCoef = Math.pow(kCoef, 3);
        if (bytesCount < kCoef) return bytesCount + 'b';
        if (bytesCount < mCoef) return (bytesCount / kCoef).toFixed(2) + 'kb';
        if (bytesCount < gCoef) return (bytesCount / mCoef).toFixed(2) + 'mb';
        return (bytesCount / gCoef).toFixed(2) + 'gb';
    }

    // Create DBs

    function _onStart() {
        var sizeSelect = document.getElementById(MODULE_NAME + '_localDBSizeSelect');
        var localDBSize = sizeSelect.options[sizeSelect.selectedIndex].value;

        document.getElementById(MODULE_NAME + '_testerStartFormEl').style.display = 'none';
        document.getElementById(MODULE_NAME + '_testerContainerEl').style.display = 'table';

        _localDB = _getLocalDB(localDBSize);
        if (_remoteDBPath) _remoteDB = _getRemoteDB();
        
        _refreshLocalDBInfo();
        _refreshRemoteDBInfo();
        if (_refreshInterval > 0) {
            setInterval(function() {
                if (!_stopPollingInfo) {
                    _refreshLocalDBInfo();
                    _refreshRemoteDBInfo()
                }
            }, _refreshInterval * 1000 );
        }
    }

    function _getLocalDB(size) {
        return new _PouchDB(_localDBPath, {
            auto_compaction: false,
            size: size
        });
    }

    function _getRemoteDB() {
        return new _PouchDB(_remoteDBPath, _remoteDBOptions);
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
                var infoStr = info.join('</br>');
                console.info(CONSOLE_PREFIX + db.name + ': ' + infoStr);
                if (!_isModule && _hostHtmlElement && htmlElementId) {
                    document.getElementById(htmlElementId).innerHTML = infoStr;
                }
            })
            .then(function() { return db.allDocs({ limit: 1, include_docs: true }) })
            .then(function(result) { return result && result.rows && result.rows.length ? result.rows[0].doc : undefined; })
            .catch(_errorHandlerFactory(false));
    }

    // Displays local DB info in console and HTML
    function _refreshLocalDBInfo() {
        _refreshDBInfo(_localDB, MODULE_NAME + '_local_info')
            .then(function(firstDoc) {
                if ((_localDBFirstDoc ? !firstDoc : firstDoc) || (_localDBFirstDoc && firstDoc && _localDBFirstDoc.text !== firstDoc.text)) {
                    _modifyFirstDocOnLocalDBTxt.value = firstDoc ? firstDoc.text : '';
                }
                _localDBFirstDoc = firstDoc;
            });
    };

    // Fetch and displays remote DB info in console and HTML
    function _refreshRemoteDBInfo() {
        if (_remoteDB) _refreshDBInfo(_remoteDB, MODULE_NAME + '_remote_info')
            .then(function(firstDoc) {
                if ((_remoteDBFirstDoc ? !firstDoc : firstDoc) || (_remoteDBFirstDoc && firstDoc && _remoteDBFirstDoc.text !== firstDoc.text)) {
                    _modifyFirstDocOnRemoteDBTxt.value = firstDoc ? firstDoc.text : '';
                }
                _remoteDBFirstDoc = firstDoc;
            });
    }

    // Sync DBs

    function _enableSyncButtons(enable) {
        if (_syncReplicateRemoteToLocalDBBtn) _syncReplicateRemoteToLocalDBBtn.disabled = !enable;
        if (_syncReplicateLocalToRemoteDBBtn) _syncReplicateLocalToRemoteDBBtn.disabled = !enable;
        _destroyLocalDBBtn.disabled = !enable;
        if (_destroyRemoteDBBtn) _destroyRemoteDBBtn.disabled = !enable;
        if (_compactLocalDBBtn) _compactLocalDBBtn.disabled = !enable;
    }

    function _onSyncChange(change) {
        // handle change
        var progress;
        if (change.pending) progress = ((change.docs_read / (change.docs_read + change.pending)) * 100).toFixed(0) + '%';
        else progress = 'Sent ' + change.docs_written + ' docs';
        console.info(CONSOLE_PREFIX + 'Replication change. progress: ' + progress, change);
        _syncStatusEl.innerHTML = 'Sync ongoing 💪 [' + progress + ']';
        _refreshLocalDBInfo();
        _refreshRemoteDBInfo();
    }

    function _onSyncPaused(info) {
        // replication paused (e.g. replication up to date, user went offline)
        console.warn(CONSOLE_PREFIX + 'Replication paused', info);
        _syncStatusEl.innerHTML = 'Sync paused! 😒';
    }

    function _onSyncActive(info) {
        // replicate resumed (e.g. new changes replicating, user went back online)
        console.info(CONSOLE_PREFIX + 'Replication active', info);
        _syncStatusEl.innerHTML = 'Sync active 😊';
    }

    function _onSyncDenied(err) {
        // a document failed to replicate (e.g. due to permissions)
        console.error(CONSOLE_PREFIX + 'Replication denied', err);
        _syncStatusEl.innerHTML = 'Sync denied! 😱';
        _enableSyncButtons(true);
    }

    function _onSyncComplete(info) {
        // handle complete
        console.info(CONSOLE_PREFIX + 'Replication complete', info);
        _syncStatusEl.innerHTML = 'Sync complete! 😍';
        _enableSyncButtons(true);
        _refreshLocalDBInfo();
        _refreshRemoteDBInfo();
    }

    function _onSyncError(err) {
        // handle error
        console.error(CONSOLE_PREFIX + 'Replication error', err);
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

    // Live Sync DBs

    function _startLiveSync() {
        if (_remoteDB) {
            _enableSyncButtons(false);
            _syncStatusEl.innerHTML = '🔄 Live Sync is on! 🤠';
            _liveSyncChangeCount = 0;
            _liveSyncHandler = _localDB.sync(_remoteDB, {
                    live: true,
                    retry: true
                }).on('change', function (change) {
                    _liveSyncChangeCount++;
                    console.info(CONSOLE_PREFIX + '🔄 Live Sync change n°' + _liveSyncChangeCount, change);
                    _syncStatusEl.innerHTML = '🔄 Live Sync change n°' + _liveSyncChangeCount + ' 😬';
                    _refreshLocalDBInfo();
                    _refreshRemoteDBInfo();
                }).on('paused', function (info) {
                    // replication was paused, usually because of a lost connection
                    console.info(CONSOLE_PREFIX + '🔄 Live Sync paused', info);
                    _syncStatusEl.innerHTML = '🔄 Live Sync waiting for changes... 😎 ('+ _liveSyncChangeCount +')';
                }).on('active', function (info) {
                    // replication was resumed
                    console.info(CONSOLE_PREFIX + '🔄 Live Replication active again', info);
                    _syncStatusEl.innerHTML = '🔄 Live Sync active again! 😊';
                }).on('error', function (err) {
                    // totally unhandled error (shouldn't happen)
                    console.error(CONSOLE_PREFIX + '🔄 Live Sync error', err);
                    _syncStatusEl.innerHTML = '🔄 Live Sync error! 😓';
                    _enableSyncButtons(true);
                });
            console.info(CONSOLE_PREFIX + '🔄 Live Sync started.');
        }
    }

    function _stopLiveSync() {
        if (_liveSyncHandler) _liveSyncHandler.cancel();
        _enableSyncButtons(true);
        console.info(CONSOLE_PREFIX + '🔄 Live Sync canceled.');
        _syncStatusEl.innerHTML = '🔄 Live Sync canceled! 🥶';
        _refreshLocalDBInfo();
        _refreshRemoteDBInfo();
    }

    function _onLiveSyncCbChanged(event) {
        if (event.target.checked) _startLiveSync();
        else _stopLiveSync();
    }

    // Update documents

    function _enableUpdateAddRemoveDocumentsButtons(enable) {
        _modifyFirstDocOnLocalDBTxt.disabled = !enable;
        _modifyFirstDocOnLocalDBBtn.disabled = !enable;
        if (_modifyFirstDocOnRemoteDBTxt) _modifyFirstDocOnRemoteDBTxt.disabled = !enable;
        if (_modifyFirstDocOnRemoteDBBtn) _modifyFirstDocOnRemoteDBBtn.disabled = !enable;
        _addDocumentsToLocalDBBtn.disabled = !enable;
        if (_addDocumentsToRemoteDBBtn) _addDocumentsToRemoteDBBtn.disabled = !enable;
        _removeDocumentsFromLocalDBBtn.disabled = !enable;
        if (_removeDocumentsFromRemoteDBBtn) _removeDocumentsFromRemoteDBBtn.disabled = !enable;
    }

    function _newDocument() {
        return {
            _id: _uuid(),
            text: 'hello world',
            lorem: _lorem(Math.random()),
            ipsum: _lorem(Math.random()),
        };
    }

    function _modifyDoc(db, docToUpdate) {
        _stopPollingInfo = true;
        _enableUpdateAddRemoveDocumentsButtons(false);

        return (docToUpdate ? db.put(docToUpdate) : Promise.resolve())
            .then(function() {
                console.info(CONSOLE_PREFIX + 'Done updating document.');
            })
            .catch(_errorHandlerFactory(true))
            .then(function() {
                _stopPollingInfo = false;
                _enableUpdateAddRemoveDocumentsButtons(true);
            })
    }

    function _modifyFirstDocOnLocalDB() {
        if (_localDBFirstDoc) _localDBFirstDoc.text = _modifyFirstDocOnLocalDBTxt.value;
        _modifyDoc(_localDB, _localDBFirstDoc)
            .then(_refreshLocalDBInfo);
    }

    function _modifyFirstDocOnRemoteDB() {
        if (_remoteDB) {
            if (_remoteDBFirstDoc) _remoteDBFirstDoc.text = _modifyFirstDocOnRemoteDBTxt.value;
            _modifyDoc(_remoteDB, _remoteDBFirstDoc)
                .then(_refreshRemoteDBInfo);
        }
    }

    // Add documents to DB

    function _addDocuments(db, documentCount) {
        var i = documentCount;
        _stopPollingInfo = true;
        _enableUpdateAddRemoveDocumentsButtons(false);

        var newDocs = [];
        while (i) {
            newDocs.push(_newDocument());
            i--;
        }

        return db.bulkDocs(newDocs)
            .then(function() {
                console.info(CONSOLE_PREFIX + 'Done adding documents.');
            })
            .catch(_errorHandlerFactory(true))
            .then(function() {
                _stopPollingInfo = false;
                _enableUpdateAddRemoveDocumentsButtons(true);
            });
    }

    function _addDocumentsToLocalDB(documentCount) {
        return _addDocuments(_localDB, documentCount)
            .then(_refreshLocalDBInfo);
    }
    
    function _addDocumentsToRemoteDB(documentCount) {
        if (_remoteDB) {
            return _addDocuments(_remoteDB, documentCount)
                .then(_refreshRemoteDBInfo);
        }
    }

    // Remove last documents from DB

    function _removeDocuments(db, documentCount) {
        _stopPollingInfo = true;
        _enableUpdateAddRemoveDocumentsButtons(false);

        return db.allDocs({ limit: documentCount, include_docs: true, descending: true })
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
                console.info(CONSOLE_PREFIX + 'Done removing documents.');
            })
            .catch(_errorHandlerFactory(true))
            .then(function() {
                _stopPollingInfo = false;
                _enableUpdateAddRemoveDocumentsButtons(true);
            })
    }

    function _removeDocumentsFromLocalDB(documentCount) {
        return _removeDocuments(_localDB, documentCount)
            .then(_refreshLocalDBInfo);
    }
    
    function _removeDocumentsFromRemoteDB(documentCount) {
        if (_remoteDB) {
            return _removeDocuments(_remoteDB, documentCount)
                .then(_refreshRemoteDBInfo);
        }
    }

    // Compact DB

    function _compactLocalDB() {
        console.debug(CONSOLE_PREFIX + 'Start compacting local DB.');
        _localDB.compact()
            .then(function (result) {
                console.info(CONSOLE_PREFIX + 'Done compacting local DB.', result);
            }).catch(_errorHandlerFactory(true));
    }

    // Destroy DBs

    function _destroy(db) {
        _stopPollingInfo = true;
        _enableUpdateAddRemoveDocumentsButtons(false);
        _enableSyncButtons(false);
        
        return db.destroy()
            .then(function() {
                console.info(CONSOLE_PREFIX + 'DB detroyed.');
            })
            .catch(_errorHandlerFactory(true))
            .then(function() {
                _stopPollingInfo = false;
                _enableUpdateAddRemoveDocumentsButtons(true);
                _enableSyncButtons(true);
            });
    }

    function _destroyLocalDB() {
        if (confirm('You are about to destroy your Local DB. Proceed?')) {
            _destroy(_localDB)
                .then(function() {
                    _localDB = _getLocalDB();
                })
                .catch(_errorHandlerFactory(true))
                .then(_refreshLocalDBInfo);
        }
    }

    function _destroyRemoteDB() {
        if ( confirm( 'You are about to destroy the Remote DB. Proceed?' ) ) {
            _destroy(_remoteDB)
                .then(function() {
                    if (_remoteDBPath) _remoteDB = _getRemoteDB();
                })
                .catch(_errorHandlerFactory(true))
                .then(_refreshRemoteDBInfo);
        }
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
            _localDBPath = localDBPath;
            _remoteDBPath = remoteDBPath;
            _remoteDBOptions = remoteDBOptions;
            _hostHtmlElement = hostHtmlElement;
            _refreshInterval = refreshInterval;
            if (!_isModule && _hostHtmlElement) {
                var html = '<h3>PouchDB tester:</h3>\n' +
                    '<div id="' + MODULE_NAME + '_testerStartFormEl" style="text-align: center;">\n' +
                    '    <span>Local DB size request:</span>\n' +
                    '    <select id="' + MODULE_NAME + '_localDBSizeSelect">\n' +
                    '        <option value="500">500 MB</option>\n' +
                    '        <option value="100">100 MB</option>\n' +
                    '        <option value="50">50 MB</option>\n' +
                    '        <option value="10">10 MB</option>\n' +
                    '        <option value="5">5 MB</option>\n' +
                    '    </select>\n' +
                    '    <button onclick="' + MODULE_NAME + '_onStart()" style="display: inline-block;">OK</button>\n' +
                    '</div>\n' +
                    '<table id="' + MODULE_NAME + '_testerContainerEl" style="display: none; width: 100%; text-align: center;">\n';
                if (_remoteDBPath) {
                    html += 
                        '   <thead>\n' +
                        '       <tr>\n' +
                        '            <th colspan="2" style="background-color: #333; color: #fff;">\n' +
                        '               <div id="' + MODULE_NAME + '_syncStatusEl">No Sync event</div>\n' +
                        '               <div style="margin-top: 5px;"><span style="margin: 5px; font-size: smaller;">Live Sync</span><input id="' + MODULE_NAME + '_syncReplicateLocalToRemoteDBCb" type="checkbox" onchange="' + MODULE_NAME + '_onLiveSyncCbChanged(event)"/></div>\n' +
                        '           </th>\n' +
                        '       </tr>\n';
                        '       </tr>\n';
                        '   </thead>\n';
                }
                _hostHtmlElement.innerHTML = html + 
                    '   <tbody>\n' +
                    '       <tr>\n' +
                    '                   <td style="font-weight: bolder; font-size: larger; color: green;">Local</td>\n' +
                    (_remoteDBPath ? '  <td style="font-weight: bolder; font-size: larger; color: red;">Remote</td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '                   <td><span id="' + MODULE_NAME + '_local_info" style="font-weight: bold;">Unknown</span></td>\n' +
                    (_remoteDBPath ? '  <td><span id="' + MODULE_NAME + '_remote_info" style="font-weight: bold;">Unknown</span></td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    (_remoteDBPath ? '  <td><button id="' + MODULE_NAME + '_syncReplicateLocalToRemoteDBBtn" onclick="' + MODULE_NAME + '_onSyncReplicateLocalToRemoteDBBtn()" style="min-width: 144px;">Sync Local ➡️ Remote</button></td>\n' : '') +
                    (_remoteDBPath ? '  <td><button id="' + MODULE_NAME + '_syncReplicateRemoteToLocalDBBtn" onclick="' + MODULE_NAME + '_onSyncReplicateRemoteToLocalDBBtn()" style="min-width: 144px;">Sync Local ⬅️ Remote</button></td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '               <td>\n' +
                    '                   <input id="' + MODULE_NAME + '_modifyFirstDocOnLocalDBTxt" type="text" value="" style="width: 80px;">\n' +
                    '                   <button id="' + MODULE_NAME + '_modifyFirstDocOnLocalDBBtn" onclick="' + MODULE_NAME + '_onModifyFirstDocOnLocalDB()" style="display: inline-block;" title="Modify 1st document on Local">✏️ 1st doc</button>\n' +
                    '               </td>\n' +
                    (_remoteDBPath ? '  <td>\n' : '') +
                    (_remoteDBPath ? '      <input id="' + MODULE_NAME + '_modifyFirstDocOnRemoteDBTxt" type="text" value="" style="width: 80px;">\n' : '') +
                    (_remoteDBPath ? '      <button id="' + MODULE_NAME + '_modifyFirstDocOnRemoteDBBtn" onclick="' + MODULE_NAME + '_onModifyFirstDocOnRemoteDB()" title="Modify 1st document on Remote" style="display: inline-block;">✏️ 1st doc</button>\n' : '') +
                    (_remoteDBPath ? '  </td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '                   <td><button id="' + MODULE_NAME + '_addDocumentsToLocalDBBtn" onclick="' + MODULE_NAME + '_onAddDocumentsToLocalDB(' + LOCAL_ACTION_DOC_COUNT + ')" style="min-width: 144px;">➕ ' + LOCAL_ACTION_DOC_COUNT + ' docs to Local</button></td>\n' +
                    (_remoteDBPath ? '  <td><button id="' + MODULE_NAME + '_addDocumentsToRemoteDBBtn" onclick="' + MODULE_NAME + '_onAddDocumentsToRemoteDB(' + REMOTE_ACTION_DOC_COUNT + ')" style="min-width: 144px;">➕ ' + REMOTE_ACTION_DOC_COUNT + ' docs to Remote</button></td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '                   <td><button id="' + MODULE_NAME + '_removeDocumentsFromLocalDBBtn" onclick="' + MODULE_NAME + '_onRemoveDocumentsFromLocalDB(' + LOCAL_ACTION_DOC_COUNT + ')" style="min-width: 144px;">❌ ' + LOCAL_ACTION_DOC_COUNT + ' docs from Local</button></td>\n' +
                    (_remoteDBPath ? '  <td><button id="' + MODULE_NAME + '_removeDocumentsFromRemoteDBBtn" onclick="' + MODULE_NAME + '_onRemoveDocumentsFromRemoteDB(' + REMOTE_ACTION_DOC_COUNT + ')" style="min-width: 144px;">❌ ' + REMOTE_ACTION_DOC_COUNT + ' docs from Remote</button></td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '                   <td><button id="' + MODULE_NAME + '_destroyLocalDBBtn" onclick="' + MODULE_NAME + '_onDestroyLocalDB()" style="min-width: 144px;">🗑 Destroy Local</button></td>\n' +
                    (_remoteDBPath ? '  <td><button id="' + MODULE_NAME + '_destroyRemoteDBBtn" onclick="' + MODULE_NAME + '_onDestroyRemoteDB()" style="min-width: 144px;">🗑 Destroy Remote</button></td>\n' : '') +
                    '       </tr>\n' +
                    '       <tr>\n' +
                    '               <td><button id="' + MODULE_NAME + '_compactLocalDBBtn" onclick="' + MODULE_NAME + '_onCompactLocalDB()" style="min-width: 144px;">👌 Compact Local</button></td>\n' +
                    '       </tr>\n' +
                    '   </tbody>\n' +
                    '</table>';
                
                window[MODULE_NAME + '_onStart'] = _onStart;
                
                _syncReplicateRemoteToLocalDBBtn = document.getElementById(MODULE_NAME + '_syncReplicateRemoteToLocalDBBtn');
                _syncReplicateLocalToRemoteDBBtn = document.getElementById(MODULE_NAME + '_syncReplicateLocalToRemoteDBBtn');
                _syncStatusEl = document.getElementById(MODULE_NAME + '_syncStatusEl');
                _modifyFirstDocOnLocalDBTxt = document.getElementById(MODULE_NAME + '_modifyFirstDocOnLocalDBTxt');
                _modifyFirstDocOnLocalDBBtn = document.getElementById(MODULE_NAME + '_modifyFirstDocOnLocalDBBtn');
                _modifyFirstDocOnRemoteDBTxt = document.getElementById(MODULE_NAME + '_modifyFirstDocOnRemoteDBTxt');
                _modifyFirstDocOnRemoteDBBtn = document.getElementById(MODULE_NAME + '_modifyFirstDocOnRemoteDBBtn');
                _addDocumentsToLocalDBBtn = document.getElementById(MODULE_NAME + '_addDocumentsToLocalDBBtn');
                _addDocumentsToRemoteDBBtn = document.getElementById(MODULE_NAME + '_addDocumentsToRemoteDBBtn');
                _removeDocumentsFromLocalDBBtn = document.getElementById(MODULE_NAME + '_removeDocumentsFromLocalDBBtn');
                _removeDocumentsFromRemoteDBBtn = document.getElementById(MODULE_NAME + '_removeDocumentsFromRemoteDBBtn');
                _destroyLocalDBBtn = document.getElementById(MODULE_NAME + '_destroyLocalDBBtn');
                _destroyRemoteDBBtn = document.getElementById(MODULE_NAME + '_destroyRemoteDBBtn');
                _compactLocalDBBtn = document.getElementById(MODULE_NAME + '_compactLocalDBBtn');
                window[MODULE_NAME + '_onSyncReplicateRemoteToLocalDBBtn'] = _syncReplicationRemoteToLocalDB;
                window[MODULE_NAME + '_onSyncReplicateLocalToRemoteDBBtn'] = _syncReplicationLocalToRemoteDB;
                window[MODULE_NAME + '_onLiveSyncCbChanged'] = _onLiveSyncCbChanged;
                window[MODULE_NAME + '_onModifyFirstDocOnLocalDB'] = _modifyFirstDocOnLocalDB;
                window[MODULE_NAME + '_onModifyFirstDocOnRemoteDB'] = _modifyFirstDocOnRemoteDB;
                window[MODULE_NAME + '_onAddDocumentsToLocalDB'] = _addDocumentsToLocalDB;
                window[MODULE_NAME + '_onAddDocumentsToRemoteDB'] = _addDocumentsToRemoteDB;
                window[MODULE_NAME + '_onRemoveDocumentsFromLocalDB'] = _removeDocumentsFromLocalDB;
                window[MODULE_NAME + '_onRemoveDocumentsFromRemoteDB'] = _removeDocumentsFromRemoteDB;
                window[MODULE_NAME + '_onDestroyLocalDB'] = _destroyLocalDB;
                window[MODULE_NAME + '_onDestroyRemoteDB'] = _destroyRemoteDB;
                window[MODULE_NAME + '_onCompactLocalDB'] = _compactLocalDB;
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
