// ==UserScript==
// @name         LeproWatch
// @namespace    http://tamtamchika.net/
// @version      1.3.3
// @grant        unsafeWindow
// @description  Saves all logs.
// @author       tamtamchik
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://code.jquery.com/jquery-2.2.1.min.js
// @require      https://raw.githubusercontent.com/cowboy/jquery-throttle-debounce/v1.1/jquery.ba-throttle-debounce.min.js
// @include      http://mush.twinoid.com/
// @include      http://mush.twinoid.com/play
// @include      http://mush.vg/
// @include      http://mush.vg/play
// @downloadURL  https://github.com/tamtamchik/mush-scripts/raw/master/leproWatch.user.js
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
    /* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

    // Base variables and configurations.

    //noinspection JSUnresolvedVariable
    const console = unsafeWindow.console;
    //noinspection JSUnresolvedVariable
    const Main = unsafeWindow.Main;

    //noinspection JSUnresolvedFunction, JSUnresolvedVariable
    Main.LeproWatch = createObjectIn(unsafeWindow.Main, { defineAs: 'LeproWatch' });
    //noinspection JSUnresolvedVariable
    Main.LeproWatch.version = GM_info.script.version || "1.3.3";
    //noinspection JSUnresolvedVariable
    Main.LeproWatch.indexedDB = unsafeWindow.indexedDB || unsafeWindow.mozIndexedDB || unsafeWindow.webkitIndexedDB || unsafeWindow.msIndexedDB;
    Main.LeproWatch.decs = 'Log collector by @tamtamchik. Leprosorium casting!';

    const info = (message) => console.log(message);
    const error = (message) => console.error(message);

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

    // Model layer.

    /**
     * Connect to the database.
     */
    Main.LeproWatch.connectToDatabase = () => {
        info('[LeproWatch] Connecting to database...');

        Main.LeproWatch.db = Main.LeproWatch.indexedDB.open(`leprowatch_${Main.LeproWatch.language}`, 3);
        Main.LeproWatch.db.onerror = (e) => error(e);
        Main.LeproWatch.db.onsuccess = (c) => {
            Main.LeproWatch.connection = c.target.result;
            Main.LeproWatch.emitEvent('lw:connected');
        };
        Main.LeproWatch.db.onupgradeneeded = (c) => {
            //noinspection JSUnresolvedFunction
            c.target.result
                .createObjectStore('logs', { keyPath: 'id' })
                .createIndex('room', 'room', { unique: false });
            Main.LeproWatch.connectToDatabase();
        };
    };

    Main.LeproWatch.getTimes = (time) => {
        let t, c, a;
        if (time == 'moments ago') {
            t = 0;
            c = 60000;
            a = '30 sec';
        } else if (time.indexOf('min') != -1) {
            t = parseInt(time.substring(0, time.length - 3));
            c = 60000;
            a = '30 sec';
        } else if (time.indexOf('h') != -1) {
            t = parseInt(time.substring(1, time.length - 1));
            c = 3600000;
            a = '30 min';
        } else if (time.indexOf('d') != -1) {
            t = parseInt(time.substring(1, time.length - 1));
            c = 86400000;
            a = '12 hours';
        } else {
            // something strange
            //debugger;
        }
        return { timestamp: t * c + (c / 2 | 0), accuracy: a };
    };

    Main.LeproWatch.setTimes = (time) => {
        const t = Date.now() - time;
        let result;

        if (t < 59999) {
            result = 'moments ago';
        } else if (t < 3600000) {
            result = (t / 60000 | 0) + 'min';
        } else if (t < 86400000) {
            result = '~' + (t / 3600000 | 0) + 'h';
        } else {
            result = '~' + (t / 86400000 | 0) + 'd';
        }
        return result;
    };

    Main.LeproWatch.formatTime = (time) => {
        const d = new Date(time);
        const year = d.getFullYear();

        let day = d.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        let month = d.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        let hours = d.getHours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        let minutes = d.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        let seconds = d.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
    };

    Main.LeproWatch.collectLogs = () => {
        console.log('[LeproWatch] Getting logs...');
        if (!Main.LeproWatch.connection) return;

        const records = Array.from(document.querySelectorAll('#localChannel .cdChatLine')).reverse();

        const logs = records.map((el, index) => {

            const html = el.innerHTML
                .replace(/\s+/ig, ' ')
                .replace(/<span class="ago">.*?<\/span>/ig, '')
                .replace(/<img src="\/\/data\.mush\.twinoid\.com\/img\/icons\/ui\/recent\.png".*?>/ig, '')
                .trim();

            const classes = Array.from(el.classList).filter(item => item !== 'not_read');
            const times = Main.LeproWatch.getTimes(el.getElementsByClassName("ago")[0].innerHTML);
            //noinspection JSUnresolvedVariable
            return {
                'id': parseInt(el.dataset.id),
                'cycle': parseInt(el.dataset.c),
                'room': Main.LeproWatch.getRoomId(),
                'html': html,
                'time': Date.now() - times.timestamp,
                'accuracy': times.accuracy,
                'text': el.textContent.trim(),
                'index': index,
                'classes': classes.join(' ')
            };
        });

        Main.LeproWatch.saveLogs(logs);
    };

    Main.LeproWatch.saveLogs = (logs) => {
        console.log('[LeproWatch] Saving logs...');

        //noinspection JSCheckFunctionSignatures
        let transaction = Main.LeproWatch.connection.transaction(['logs'], 'readwrite');
        //noinspection JSUnresolvedFunction
        let logStore = transaction.objectStore('logs');
        for (let i = 0; i < logs.length; i++) {
            const req = logStore.get(parseInt(logs[i].id));
            req.onsuccess = (e) => {
                if (!e.target.result) {
                    const req2 = logStore.add(logs[i]);
                    req2.onerror = e => error(e);
                }
            };
            req.onerror = e => error(e);
        }
    };

    Main.LeproWatch.search = (text) => {
        console.log('[LeproWatch] Searching for "' + text + '"...');

        if (text === '') {
            Main.LeproWatch.loadLogs();
            return;
        }

        //noinspection JSCheckFunctionSignatures
        const transaction = Main.LeproWatch.connection.transaction(['logs'], 'readonly');
        //noinspection JSUnresolvedFunction
        const logStore = transaction.objectStore('logs');

        let rows = [];

        //noinspection JSUnresolvedFunction
        logStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                //debugger;
                var regexp=new RegExp(text, "i");
                if (cursor.value.html.match(regexp)) {
                    rows.push(cursor.value);
                }
                //noinspection JSUnresolvedFunction
                cursor.continue();
            } else {
                if (rows.length === 0) {
                    Main.LeproWatch.clearLogView();
                    return;
                }
                Main.LeproWatch.renderLogs(rows, true);
            }
        };
    };

    // Helpers.

    Main.LeproWatch.getRoomId = () => {
        info('[LeproWatch] Getting room id...');

        //noinspection JSUnresolvedVariable
        return Main.LeproWatch.roomNames.indexOf(document.querySelector('#input').attributes.d_name.value);
    };

    Main.LeproWatch.getSelectedRoomId = () => {
        console.log('[LeproWatch] Getting selected room id...');

        return parseInt(document.querySelector('.roomChanger').value);
    };

    Main.LeproWatch.emitEvent = (name) => {
        console.log('[LeproWatch] Emitting event ' + name + '...');

        document.dispatchEvent(new Event(name));
    };

    Main.LeproWatch.loadLogs = (room) => {
        room = (Number.isInteger(room)) ? room : Main.LeproWatch.getSelectedRoomId();

        Main.LeproWatch.collectLogs();

        console.log('[LeproWatch] Loading logs for room ' + Main.LeproWatch.roomNames[room] + '...');

        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        const roomRange = IDBKeyRange.only(room);
        //noinspection JSCheckFunctionSignatures
        const transaction = Main.LeproWatch.connection.transaction(['logs'], 'readonly');
        //noinspection JSUnresolvedFunction
        const logStore = transaction.objectStore('logs').index('room');

        let rows = [];

        //noinspection JSUnresolvedFunction
        logStore.openCursor(roomRange).onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                rows.push(cursor.value);
                //noinspection JSUnresolvedFunction
                cursor.continue();
            } else {
                Main.LeproWatch.renderLogs(rows);
            }
        };
    };

    // UI functions

    Main.LeproWatch.resetLogs = () => {
        console.log('[LeproWatch] Reset logs...');

        //noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
        Main.LeproWatch.connection.transaction(['logs'], 'readwrite').objectStore('logs').clear();
        Main.LeproWatch.clearLogView();
    };

    Main.LeproWatch.clearLogView = () => {
        console.log('[LeproWatch] Clearing log view...');
        document.querySelector('#leprowatch_content .logs').innerHTML = '';
    };

    Main.LeproWatch.clearSearchInput = () => {
        console.log('[LeproWatch] Clearing search input...');
        document.querySelector('.searchBox').value = '';
    };

    Main.LeproWatch.renderLogs = (logs, search = false) => {
        Main.LeproWatch.clearLogView();
        if (!search) Main.LeproWatch.clearSearchInput();

        console.log('[LeproWatch] Rendering logs...');

        let lastCycle = -1;
        let lastRoom = '';
        const content = document.querySelector('#leprowatch_content .logs');

        logs.sort((a, b) => {
            if (a.cycle !== b.cycle) return a.cycle > b.cycle ? -1 : 1;
            if (a.room !== b.room) return a.room > b.room ? -1 : 1;
            if (a.time !== b.time) return a.time > b.time ? -1 : 1;
            return a.index > b.index ? -1 : 1;
        });

        logs.forEach(log => {

            const roomName = Main.LeproWatch.roomNames[log.room];

            if (log.cycle !== lastCycle) {
                const day = Math.floor((log.cycle) / 8) + 1;
                const cycle = Math.ceil((log.cycle) % 8) + 1;
                const row = $('<div>').addClass('day_cycle')
                    .append(`<strong>&nbsp;day ${day} Cycle ${cycle} (Cycle ${log.cycle})</strong>`);
                row.appendTo(content);
                lastCycle = log.cycle;
            }

            if (roomName !== lastRoom && search) {
                const row = $('<div>').addClass('day_cycle mush').append(`&nbsp;${roomName}`);
                row.appendTo(content);
                lastRoom = roomName;
            }
            // ----------------------------------------- Printing log item ----------------------------------------
            const time = Main.LeproWatch.formatTime(log.time);
            const timeAgo = Main.LeproWatch.setTimes(log.time);
            const timestamp = `<span class="ago" title="${time} ±${log.accuracy}">${timeAgo}</span>`;

            const row = $('<div>').addClass(log.classes).append(timestamp + log.html.trim());
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
        const functionTab = $($(el).attr('data-script-function'));
        if (functionTab.length) {
            functionTab();
        }
    };

    Main.LeproWatch.addButton = (src, text, hasText, func, parent) => {
        console.log('[LeproWatch] Adding button ' + text + '...');
        const button = $('<a>').addClass('butmini').append((hasText ? text : ''));
        button.on('click', func);
        button.appendTo(parent);
        $('<img>').attr({ src: src, title: text }).appendTo(button);
    };

    Main.LeproWatch.fill = () => {
        console.log('[LeproWatch] Filling DOM...');

        const mainDiv = $('<div>').css("color", "rgb(9, 10, 97)").appendTo($("#leprowatch_content").empty());

        $('<div>').addClass('objtitle').html("<img src='http://twinoid.com/img/icons/archive.png'> LeproWatch archive! <img src='http://twinoid.com/img/icons/archive.png'>").appendTo(mainDiv);

        const menu = $('<div>').addClass('replybuttons').css({ padding: '2px 7px 0' }).appendTo(mainDiv);
        const roomSelector = $('<select>').addClass('roomChanger').appendTo(mainDiv);

        const shortName={
            'wangchao':'Chao',
            'paolarinaldo':'Paola',
            'kimjinsu':'Jin Su',
            'laikuanti':'Kuan Ti',
            'friedabergmann':'Frieda',
            'rolandzuccali':'Roland',
            'stephenseagull':'Stephen',
            'gioelerinaldo':'Gioele',
            'ralucatomescu':'Raluca',
            'zhongchun':'Chun',
            'jianghua':'Hua',
            'finolakeegan':'Finola',
            'eleeshawilliams':'Eleesha',
            'janicekent':'Janice',
            'iansoulton':'Ian',
            'derekhogan':'Derek',
            'andiegraham':'Andie',
            'terrencearcher':'Terrence'
        };
        var preferredSearchList=['pic_hungry|pill'];
        for (var i=0;i<15;i++) {preferredSearchList.push(shortName[Main.charList(i)]);} // wrong function, returns something like "laikuanti" instead of "Kuan Ti"
        var preferredSearches = $('<datalist id="preferredSearches">');
        //preferredSearches.attr("id")="preferredSearches";
        preferredSearches.appendTo(menu);
        $.each(preferredSearchList,(i,x)=>$('<option value="'+x+'">').appendTo(preferredSearches));
        const searchBox = $('<input type="text" list="preferredSearches">').addClass('searchBox').appendTo(menu);
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
            width: '100px'
        });

        searchBox.attr({
            placeholder: 'Search (all rooms)'
        }).css({
            width: '120px',
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
        searchBox.on('input', $.debounce(300, e => Main.LeproWatch.search(e.target.value)));

    };

    Main.LeproWatch.addArchiveTab = () => {
        console.log('[LeproWatch] Activating tab...');
        const tabsChat = $("#cdTabsChat");
        const tab = $("<li>").addClass("tab taboff").css('margin-right', '3px').appendTo(tabsChat);
        const content = $("<div>").addClass("cdLeptoWatchTab").attr("id", "leprowatch_content").appendTo($("#chatBlock"));
        content.hide();

        tab.attr({
            id: "leprowatch",
            'data-script-tab': '#leprowatch_content',
            'data-script-function': 'Main.LeproWatch.loadLogs'
        });

        $("<img>").attr("src", "http://twinoid.com/img/icons/archive.png").appendTo(tab);

        tab.on("mouseover", function () {
            Main.showTip($(this)[0], `
    <div class='tiptop'><div class='tipbottom'><div class='tipbg'><div class='tipcontent'>
    <h1>LeproWatch</h1> <p> ${Main.LeproWatch.decs} </p>
    </div></div></div></div>
    `);
        }).on("mouseout", function () {
            Main.hideTip();
        });

        tabsChat.find("li").on("click", function () {
            Main.LeproWatch.selectTab(this);
        });
        Main.LeproWatch.fill();
    };

    // Init functions

    Main.LeproWatch.init = () => {
        console.log('[LeproWatch] Init...');
        Main.LeproWatch.currentRoom = Main.LeproWatch.getRoomId();
        Main.LeproWatch.connectToDatabase();
        Main.LeproWatch.addArchiveTab();

        document.addEventListener('lw:connected', Main.LeproWatch.collectLogs);

        setInterval(function () {
            if (!document.querySelectorAll('#leprowatch').length) { //If the page has been updated
                Main.LeproWatch.addArchiveTab();
                Main.LeproWatch.collectLogs();
            }
        }, 1000);
    };

    if (!Main.LeproWatch.indexedDB) {
        window.alert("LeproWatch plugin will not work on your browser! Please use modern one!");
    } else {
        Main.LeproWatch.init();
    }

    /* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
