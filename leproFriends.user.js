// ==UserScript==
// @name         LeproFriends
// @namespace    http://tamtamchika.net/
// @version      0.3.1
// @description  Add friends to your Voyages page.
// @author       tamtamchik
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @include      http://mush.twinoid.com/me*
// @include      http://mush.twinoid.com/u/profile/*
// @include      http://mush.vg/me*
// @include      http://mush.vg/u/profile/*
// @downloadURL  https://github.com/tamtamchik/mush-scripts/raw/master/leproFriends.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Motion Twin Code ========================================================

    var HxOverrides = function () {};
    HxOverrides.__name__ = ["HxOverrides"];
    HxOverrides.strDate = function (s) {
        var _g = s.length;
        switch (_g) {
            case 8:
                var k = s.split(":");
                var d = new Date();
                d.setTime(0);
                d.setUTCHours(k[0]);
                d.setUTCMinutes(k[1]);
                d.setUTCSeconds(k[2]);
                return d;
            case 10:
                var k1 = s.split("-");
                return new Date(k1[0], k1[1] - 1, k1[2], 0, 0, 0);
            case 19:
                var k2 = s.split(" ");
                var y = k2[0].split("-");
                var t = k2[1].split(":");
                return new Date(y[0], y[1] - 1, y[2], t[0], t[1], t[2]);
            default:
                throw new js__$Boot_HaxeError("Invalid date format : " + s);
        }
    };
    HxOverrides.cca = function (s, index) {
        var x = s.charCodeAt(index);
        if (x != x) return undefined;
        return x;
    };
    HxOverrides.substr = function (s, pos, len) {
        if (pos != null && pos != 0 && len != null && len < 0) return "";
        if (len == null) len = s.length;
        if (pos < 0) {
            pos = s.length + pos;
            if (pos < 0) pos = 0;
        } else if (len < 0) len = s.length + len - pos;
        return s.substr(pos, len);
    };
    HxOverrides.indexOf = function (a, obj, i) {
        var len = a.length;
        if (i < 0) {
            i += len;
            if (i < 0) i = 0;
        }
        while (i < len) {
            if (a[i] === obj) return i;
            i++;
        }
        return -1;
    };
    HxOverrides.remove = function (a, obj) {
        var i = HxOverrides.indexOf(a, obj, 0);
        if (i == -1) return false;
        a.splice(i, 1);
        return true;
    };
    HxOverrides.iter = function (a) {
        return {
            cur: 0,
            arr: a,
            hasNext: function () {
                return this.cur < this.arr.length;
            },
            next: function () {
                return this.arr[this.cur++];
            }
        };
    };

    var haxe_ds_IntMap = function () {
        this.h = {};
    };
    haxe_ds_IntMap.__name__ = ["haxe", "ds", "IntMap"];
    haxe_ds_IntMap.prototype = {
        set: function (key, value) {
            this.h[key] = value;
        },
        get: function (key) {
            return this.h[key];
        },
        exists: function (key) {
            return this.h.hasOwnProperty(key);
        },
        keys: function () {
            var a = [];
            for (var key in this.h) {
                if (this.h.hasOwnProperty(key)) a.push(key | 0);
            }
            return HxOverrides.iter(a);
        },
        __class__: haxe_ds_IntMap
    };
    var tid_ContactDecoder = function (data) {
        if (data == null) this.data = "";
        else this.data = data;
        this.pos = 0;
        this.nbits = 0;
        this.bits = 0;
    };
    tid_ContactDecoder.__name__ = ["tid", "ContactDecoder"];
    tid_ContactDecoder.initInvChars = function () {
        var a = [];
        var _g = 0;
        while (_g < 64) {
            var i = _g++;
            a[HxOverrides.cca(tid_ContactDecoder.ENCODE, i)] = i;
        }
        return a;
    };
    tid_ContactDecoder.prototype = {
        _r: function (n) {
            while (this.nbits < n) {
                var c = tid_ContactDecoder.DECODE[(function ($this) {
                    var $r;
                    var index = $this.pos++;
                    $r = HxOverrides.cca($this.data, index);
                    return $r;
                }(this))];
                if (c == null) throw new js__$Boot_HaxeError("EOF");
                this.nbits += 6;
                this.bits <<= 6;
                this.bits |= c;
            }
            this.nbits -= n;
            return this.bits >> this.nbits & (1 << n) - 1;
        },
        read: function () {
            var len = this.data.length;
            var h = new haxe_ds_IntMap();
            while (this.pos < len) {
                var k = this._r(29);
                var v = this._r(1);
                h.h[k] = v;
            }
            return h;
        },
        __class__: tid_ContactDecoder
    };

    tid_ContactDecoder.ENCODE = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    tid_ContactDecoder.DECODE = tid_ContactDecoder.initInvChars();

    // Lepro Code ==============================================================

    function LeproFriends() {
        this.friends = [];
        this.games = [];
        this.username = '';
        this.me = '';
        this.$links = $('#cdTrips').find('a.butmini');
        this.$links.after('<img class="tid_loadingSearch" src="//data.twinoid.com/img/loading.gif">');
    }

    LeproFriends.prototype.getSessionData = function (data) {
        if (window.sessionStorage.tid_contact) {
            var contacts = new tid_ContactDecoder(window.sessionStorage.tid_contact);
            this.friends = contacts.read();
            this.username = $(window.sessionStorage.tid_bar).find('span.name').text();
            var href = (window.location.pathname != '/me') ?
                window.location.pathname :
                $('<div>').html(window.sessionStorage.tid_bar)
                    .contents().find('.twinoidAvatar').parent().attr('href');
            this.me = href.substr(href.lastIndexOf('/') + 1);
        } else {
            setTimeout($.proxy(this.getSessionData, this), 100);
        }
    };

    LeproFriends.prototype.getGames = function (data) {
        this.games = $.map(this.$links, function (el) {
            return $(el).attr('href').trim();
        });
    };

    LeproFriends.prototype.findGamesWithFriends = function () {
        var i = 0, self = this, promise = $.when();

        $.each(this.games, function (game) {
            promise = promise.then(function () {
                return $.get(self.games[game]);
            }).then(function (data) {
                var last = (game == self.games.length - 1);
                var num = self.games.length - i++;
                self.checkGame(data, self.games[game], num, last);
            });
        });
    };

    LeproFriends.prototype.checkGame = function (data, url, num, last) {
        var self    = this,
            $page   = $($.parseHTML(data)),
            els     = $page.find('.player a'),
            casting = $page.find('#producer'),
            $link   = $('.butmini[href="' + url + '"]');

        var $users = $.map(els, function (el) { return $(el); });

        var res = $users.filter(function ($el) {
            var href = $el.attr('href');
            var user = href.substr(href.lastIndexOf('/') + 1);
            if (user == self.me) return false;
            return self.friends.h.hasOwnProperty(user);
        });

        var $list = $('<div style="display:none">');
        $.each(res, function (i) {
            var uclass = (res[i].text() == self.username) ? 'tid_userUnknown' : 'tid_userFriend';
            res[i]
                .addClass('tid_user tid_userBg ' + uclass + ' tid_parsed')
                .css('margin', '2px')
                .css('display', 'inline-block');

            $list.append(res[i]).append('<br>');
        });

        $link.next().remove();

        // A bit crappy, but will do the job...
        if (casting.length) {
            $list.hide();
            var castingName = $(casting).find('a');
            var $toggler = $(castingName);
            $toggler
                .attr('href', '#')
                .on('click', $.proxy(self.toggleShow, self));
            $link.after($toggler);
            $toggler.after($list);
        } else {
            $list.show();
            $link.after($list);
        }
    };

    LeproFriends.prototype.toggleShow = function (event) {
        $(event.target).next().toggle();
        return false;
    };

    var lepro = new LeproFriends();
    var d = $.Deferred();

    d.then($.proxy(lepro.getSessionData, lepro))
        .then($.proxy(lepro.getGames, lepro))
        .then($.proxy(lepro.findGamesWithFriends, lepro));

    d.resolve();

})();
