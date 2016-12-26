// ==UserScript==
// @name         LeproWatch
// @namespace    http://tamtamchika.net/
// @version      1.1.1
// @grant        unsafeWindow
// @description  Saves all logs.
// @author       tamtamchik
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://code.jquery.com/jquery-2.2.1.min.js
// @require      https://raw.githubusercontent.com/cowboy/jquery-throttle-debounce/v1.1/jquery.ba-throttle-debounce.min.js
// @include      http://mush.twinoid.com/
// @include      http://mush.vg/
// @downloadURL  https://github.com/tamtamchik/mush-scripts/raw/master/leproWatch.user.js
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

    const console = unsafeWindow.console;
    const Main = unsafeWindow.Main;

    Main.LeproWatch = createObjectIn(unsafeWindow.Main, {defineAs: 'LeproWatch'});
    Main.LeproWatch.version = GM_info.script.version || "1.1.1";
    Main.LeproWatch.indexedDB = unsafeWindow.indexedDB || unsafeWindow.mozIndexedDB || unsafeWindow.webkitIndexedDB || unsafeWindow.msIndexedDB;
    Main.LeproWatch.decs = 'Log collector by @tamtamchik. Leprosorium casting!';

    if (window.location.href.indexOf('mush.twinoid.com') !== -1) {
        Main.LeproWatch.language = 'en';
        Main.LeproWatch.lang = 2;
        Main.LeproWatch.urlMush = "mush.twinoid.com";
        Main.LeproWatch.roomNames = ['Bridge', 'Alpha Bay', 'Bravo Bay', 'Alpha Bay 2', 'Nexus', 'Medlab', 'Laboratory', 'Refectory', 'Hydroponic Garden', 'Engine Room',
            'Front Alpha Turret', 'Centre Alpha Turret', 'Rear Alpha Turret', 'Front Bravo Turret', 'Centre Bravo Turret', 'Rear Bravo Turret',
            'Patrol Ship Tomorrowland', 'Patrol Ship Olive Grove', 'Patrol Ship Yasmin', 'Patrol Ship Wolf', 'Patrol Ship E-Street', 'Patrol Ship Eponine', 'Patrol Ship Carpe Diem', 'Pasiphae',
            'Front Corridor', 'Central Corridor', 'Rear Corridor', 'Planet', 'Icarus Bay', 'Alpha Dorm', 'Bravo Dorm',
            'Front Storage', 'Centre Alpha Storage', 'Rear Alpha Storage', 'Centre Bravo Storage', 'Rear Bravo Storage', 'Outer Space', 'Limbo'];
    }
    else if (window.location.href.indexOf('mush.twinoid.es') !== -1) {
        Main.LeproWatch.language = 'es';
        Main.LeproWatch.lang = 3;
        Main.LeproWatch.urlMush = "mush.twinoid.es";
        Main.LeproWatch.roomNames = ['Puente de mando', 'Plataforma Alpha', 'Plataforma Beta', 'Plataforma Alpha 2', 'Nexus', 'Enfermería', 'Laboratorio', 'Comedor', 'Jardín Hidropónico', 'Sala de motores',
            'Cañón Alpha delantero', 'Cañón Alpha central', 'Cañón Alpha trasero', 'Cañón Beta delantero', 'Cañón Beta central', 'Cañón Beta trasero',
            'Patrullero Longane', 'Patrullero Jujube', 'Patrullero Tamarindo', 'Patrullero Sócrates', 'Patrullero Epicuro', 'Patrullero Platón', 'Patrullero Wallis', 'Pasiphae',
            'Pasillo delantero', 'Pasillo central', 'Pasillo trasero', 'Planeta', 'Icarus', 'Dormitorio Alpha', 'Dormitorio Beta',
            'Almacén delantero', 'Almacén Alpha central', 'Almacén Alpha trasero', 'Almacén Beta central', 'Almacén Beta trasero', 'Espacio infinito', 'El limbo'];
    }
    else {
        Main.LeproWatch.language = '';
        Main.LeproWatch.lang = 1;
        Main.LeproWatch.urlMush = "mush.vg";
        Main.LeproWatch.roomNames = ['Pont', 'Baie Alpha', 'Baie Beta', 'Baie Alpha 2', 'Nexus', 'Infirmerie', 'Laboratoire', 'Réfectoire', 'Jardin Hydroponique', 'Salle des moteurs',
            'Tourelle Alpha avant', 'Tourelle Alpha centre', 'Tourelle Alpha arrière', 'Tourelle Beta avant', 'Tourelle Beta centre', 'Tourelle Beta arrière',
            'Patrouilleur Longane', 'Patrouilleur Jujube', 'Patrouilleur Tamarin', 'Patrouilleur Socrate', 'Patrouilleur Epicure', 'Patrouilleur Planton', 'Patrouilleur Wallis', 'Pasiphae',
            'Couloir avant', 'Couloir central', 'Couloir arrière', 'Planète', 'Baie Icarus', 'Dortoir Alpha', 'Dortoir Beta',
            'Stockage Avant', 'Stockage Alpha centre', 'Stockage Alpha arrière', 'Stockage Beta centre', 'Stockage Beta arrière', 'Espace infini', 'Les Limbes'];
    }

    Main.LeproWatch.connectToDB = () => {
        console.log('[LeproWatch] Connecting to database...');
        Main.LeproWatch.db = Main.LeproWatch.indexedDB.open(`leprowatch_${Main.LeproWatch.language}`, 3);

        Main.LeproWatch.db.onerror = (e) => {
            console.error(e);
        };
        Main.LeproWatch.db.onsuccess = (c) => {
            Main.LeproWatch.connection = c.target.result;
            Main.LeproWatch.emitEvent('lw:connected');
        };
        Main.LeproWatch.db.onupgradeneeded = (e) => {
            const objectStore = e.target.result.createObjectStore('logs', {keyPath: 'id'});
            objectStore.createIndex('room', 'room', {unique: false});
            Main.LeproWatch.connectToDB();
        };
    };

    Main.LeproWatch.getRoomId = () => {
        console.log('[LeproWatch] Getting room id...');
        return Main.LeproWatch.roomNames.indexOf(document.querySelector('#input').attributes.d_name.value);
    };

    Main.LeproWatch.getSelectedRoomId = () => {
        console.log('[LeproWatch] Getting selected room id...');
        return parseInt($('.roomChanger').val());
    };

    Main.LeproWatch.parseLogs = () => {
        console.log('[LeproWatch] Getting logs...');
        if ( ! Main.LeproWatch.connection) return;

        const records = Array.from(document.querySelectorAll('#localChannel .cdChatLine')).reverse();

        const logs = records.map((el, index) => {

            const text = el.innerHTML
                .replace(/\s+/ig, ' ')
                .replace(/<span class="ago">.*?<\/span>/ig, '')
                .replace(/<img src="\/\/data\.mush\.twinoid\.com\/img\/icons\/ui\/recent\.png".*?>/ig, '');

            return {
                'id': parseInt(el.dataset.id),
                'cycle': parseInt(el.dataset.c),
                'room': Main.LeproWatch.getRoomId(),
                'text': text,
                'time': Date.now(),
                'index': index
            };
        });

        Main.LeproWatch.saveLogs(logs);
    };

    Main.LeproWatch.emitEvent = (name) => {
        console.log('[LeproWatch] Emitting event ' + name + '...');
        document.dispatchEvent(new Event(name));
    };

    Main.LeproWatch.saveLogs = (logs) => {
        console.log('[LeproWatch] Saving logs...');
        let transaction = Main.LeproWatch.connection.transaction(['logs'], 'readwrite');
        let logStore = transaction.objectStore('logs');
        for (let i in logs) {
            let req = logStore.get(parseInt(logs[i].id));
            req.onsuccess = function (e) {
                if (!e.target.result) {
                    let req2 = logStore.add(logs[i]);
                    req2.onerror = e => console.log(e);
                }
            };
            req.onerror = e => console.log(e);
        }
    };

    Main.LeproWatch.search = (text) => {
        console.log('[LeproWatch] Searching for "' + text + '"...');
        if (text === '') {
            Main.LeproWatch.loadLogs();
            return;
        }

        const transaction = Main.LeproWatch.connection.transaction(['logs'], 'readonly');
        const logStore = transaction.objectStore('logs');

        let rows = [];

        logStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.text.includes(text)) rows.push(cursor.value);
                cursor.continue();
            } else {
                Main.LeproWatch.renderLogs(rows, true);
            }
        }
    };

    Main.LeproWatch.loadLogs = (room) => {
        room = (Number.isInteger(room)) ? room : Main.LeproWatch.getSelectedRoomId();
        Main.LeproWatch.parseLogs();
        console.log('[LeproWatch] Loading logs for room ' + Main.LeproWatch.roomNames[room] + '...');

        const roomRange = IDBKeyRange.only(room);
        const transaction = Main.LeproWatch.connection.transaction(['logs'], 'readonly');
        const logStore = transaction.objectStore('logs').index('room');

        let rows = [];

        logStore.openCursor(roomRange).onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                rows.push(cursor.value);
                cursor.continue();
            } else {
                Main.LeproWatch.renderLogs(rows);
            }
        }
    };

    Main.LeproWatch.resetLogs = () => {
        console.log('[LeproWatch] Reset logs...');
        const transaction = Main.LeproWatch.connection.transaction(['logs'], 'readwrite');
        const logStore = transaction.objectStore('logs');
        logStore.clear();
        Main.LeproWatch.clearLogView();
    };

    // UI functions

    Main.LeproWatch.clearLogView = () => {
        console.log('[LeproWatch] Clearing log view...');
        $('#leprowatch_content').find('.logs').empty();
    };

    Main.LeproWatch.renderLogs = (logs, search = false) => {
        console.log('[LeproWatch] Rendering logs...');
        Main.LeproWatch.clearLogView();

        if (logs.length === 0) {
            setTimeout(Main.LeproWatch.loadLogs, 200);
            return;
        }

        let lastCycle = 0;
        let lastRoom = '';
        const content = $('#leprowatch_content').find('.logs');

        logs.sort((a, b) => {
            if (a.cycle !== b.cycle) return a.cycle > b.cycle ? -1 : 1;
            if (a.time !== b.time) return a.time > b.time ? -1 : 1;
            return a.index > b.index ? -1 : 1;
        });

        logs.forEach(log => {

            const roomName = Main.LeproWatch.roomNames[log.room];

            if (log.cycle !== lastCycle) {
                const row = $('<div>').addClass('day_cycle').append(`<strong>&nbsp;Cycle ${log.cycle}</strong>`);
                row.appendTo(content);
                lastCycle = log.cycle;
            }

            if (roomName !== lastRoom && search) {
                const row = $('<div>').addClass('day_cycle mush').append(`&nbsp;${roomName}`);
                row.appendTo(content);
                lastRoom = roomName;
            }

            const row = $('<div>').addClass('cdChatLine').append(log.text);
            row.appendTo(content);
        });
    };

    Main.LeproWatch.selectTab = (el) => {
        console.log('[LeproWatch] Selecting tab...');
        let $cdMainChat = $("#cdMainChat");

        if ($(el).attr('data-tab') !== undefined) {
            $("#leprowatch").removeClass("tabon").addClass("taboff");
            $("#leprowatch_content").hide();
            $cdMainChat.find(".cdInputBloc").show();
            return Main.selChat($(el).attr('data-tab'));
        }

        //Script tab
        $("#cdTabsChat").find("li").removeClass("tabon").addClass("taboff");
        $("#chatBlock > *").hide();
        $cdMainChat.find(".cdInputBloc").hide();

        $(el).removeClass("taboff").addClass("tabon");
        const scriptTab = $($(el).attr('data-script-tab'));
        if (scriptTab.length) {
            $(scriptTab).show();
        }
    };

    Main.LeproWatch.addButton = (src, text, hasText, func, parent) => {
        console.log('[LeproWatch] Adding button ' + text + '...');
        const button = $('<a>').addClass('butmini').append((hasText ? text : ''));
        button.on('click', func);
        button.appendTo(parent);
        $('<img>').attr({src: src, title: text}).appendTo(button);
    };

    Main.LeproWatch.fill = () => {
        console.log('[LeproWatch] Filling DOM...');
        const mainDiv = $('<div>').css("color", "rgb(9, 10, 97)").appendTo($("#leprowatch_content").empty());
        $('<div>').addClass('objtitle').html("<img src='http://twinoid.com/img/icons/archive.png'> LeproWatch archive! <img src='http://twinoid.com/img/icons/archive.png'>").appendTo(mainDiv);
        const menu = $('<div>').addClass('replybuttons').css({padding: '2px 7px 0'}).appendTo(mainDiv);
        const roomSelector = $('<select>').addClass('roomChanger').appendTo(mainDiv);
        const searchBox = $('<input type="text">').addClass('searchBox').appendTo(menu);
        const logs = $('<div>').addClass('logs').appendTo(mainDiv);

        roomSelector.css({
            right: '7px',
            position: 'relative',
            background: '#0070dd linear-gradient(to bottom, #008ee5 0%,#008ee5 50%,#0070dd 51%,#0070dd 100%)',
            border: '1px solid #000',
            padding: 0,
            fontSize: '10px',
            float: 'right',
            top: '2px',
            height: '16px',
            lineHeight: '16px',
            width: '150px'
        });

        searchBox.attr({
            placeholder: 'Search'
        });

        searchBox.css({
            width: '100px',
            margin: '0 10px 0 0',
            float: 'left',
            border: '1px solid black',
            color: 'black',
            height: '12px',
            fontSize: '12px',
            lineHeight: '12px'
        });

        const current = Main.LeproWatch.getRoomId();
        Main.LeproWatch.roomNames.forEach((i, index) => {
            const roomName = i;
            const room = index;
            const selected = (index === current) ? 'selected' : '';

            const option = $(`<option value="${room}" ${selected}>${roomName}</option>`);
            option.appendTo(roomSelector);
        });

        Main.LeproWatch.addButton('http://twinoid.com/img/icons/refresh.png', 'Reload', true, Main.LeproWatch.loadLogs, menu);
        Main.LeproWatch.addButton('/img/icons/ui/close.png', 'Reset', true, Main.LeproWatch.resetLogs, menu);

        roomSelector.on('change', e => Main.LeproWatch.loadLogs(e.target.value));
        searchBox.on('keyup', $.debounce(300, e => Main.LeproWatch.search(e.target.value)));
    };

    Main.LeproWatch.addArchiveTab = () => {
        console.log('[LeproWatch] Activating tab...');
        const tabschat = $("#cdTabsChat");
        const tab = $("<li>").addClass("tab taboff").css('margin-right', '3px').appendTo(tabschat);
        const content = $("<div>").addClass("cdLeptoWatchTab").attr("id", "leprowatch_content").appendTo($("#chatBlock"));
        content.hide();

        tab.attr({
            id: "leprowatch",
            'data-script-tab': '#leprowatch_content',
            'data-script-function': 'Main.LeproWatch.loadLogs'
        });

        $("<img>").attr("src", "http://twinoid.com/img/icons/archive.png").appendTo(tab);

        tab.on("mouseover", function () {
            Main.showTip($(this)[0], "<div class='tiptop'><div class='tipbottom'><div class='tipbg'><div class='tipcontent'> <h1>LeproWatch</h1> <p>" + Main.LeproWatch.decs + "</p> </div></div></div></div>");
        }).on("mouseout", function () {
            Main.hideTip();
        });

        tabschat.find("li").on("click", function () {
            Main.LeproWatch.selectTab(this);
        });
        Main.LeproWatch.fill();
    };

    // Init functions

    Main.LeproWatch.init = () => {
        console.log('[LeproWatch] Init...');
        Main.LeproWatch.currentRoom = Main.LeproWatch.getRoomId();
        Main.LeproWatch.connectToDB();
        Main.LeproWatch.addArchiveTab();

        document.addEventListener('lw:connected', Main.LeproWatch.parseLogs);

        setInterval(function () {
            if ( ! $('#leprowatch').length) { //If the page has been updated
                Main.LeproWatch.addArchiveTab();
                Main.LeproWatch.parseLogs();
            }
        }, 1000);
    };

    if ( ! window.indexedDB) {
        window.alert("This plugin will not work on your browser! Please use modern one!");
    } else {
        Main.LeproWatch.init();
    }

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
