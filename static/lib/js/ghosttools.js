'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * ------------------------------------------------------------------------
 * Polyfills
 * ------------------------------------------------------------------------
 */

//http://stackoverflow.com/questions/8830839/javascript-dom-remove-element
(function () {
    var typesToPatch = ['DocumentType', 'Element', 'CharacterData'],
        remove = function remove() {
        // The check here seems pointless, since we're not adding this
        // method to the prototypes of any any elements that CAN be the
        // root of the DOM. However, it's required by spec (see point 1 of
        // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
        // theoretically make a difference if somebody .apply()ed this
        // method to the DOM's root node, so let's roll with it.
        if (this.parentNode != null) {
            this.parentNode.removeChild(this);
        }
    };

    for (var i = 0; i < typesToPatch.length; i++) {
        var type = typesToPatch[i];
        if (window[type] && !window[type].prototype.remove) {
            window[type].prototype.remove = remove;
        }
    }
})();

/**
 * ------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------
 */

var isArray = function () {
    if (typeof Array.isArray === 'undefined') {
        return function (value) {
            return toString.call(value) === '[object Array]';
        };
    }
    return Array.isArray;
}();

var Utils = {

    isArrey: function isArrey(obj) {
        return !!(obj && Array === obj.constructor);
    },

    isElement: function isElement(item) {
        return (item[0] || item).nodeType;
    },

    isObject: function isObject(value) {
        return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
    },

    normalizeElement: function normalizeElement(element) {
        if (this.isElement(element)) {
            return element;
        }
        if (typeof jQuery !== 'undefined') {
            if (element instanceof jQuery) return element[0];
        }
        if (typeof element === 'string') {
            return document.querySelector(element) || document.querySelector('#' + element) || document.querySelector('.' + element);
        }
    },

    setClass: function setClass(el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList) el.classList.add(className);else el.className += ' ' + className;
    },

    removeClass: function removeClass(el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    },

    fadeOutRemove: function fadeOutRemove(el) {
        el.style.transition = 'ease opacity 0.5s';
        el.style.webkitTransition = 'ease opacity 0.5s';
        el.style.opacity = 0;
        setTimeout(function () {
            el.remove();
        }, 500);
    },

    //extend Object
    extend: function extend() {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
            }
        }return arguments[0];
    },

    foreach: function foreach(arg, func) {
        if (this.isElement(arg)) {
            for (var i = 0; i < arg.length; i++) {
                if (isElement(arg[i])) func.call(window, arg[i], i, arg);
            }
            return false;
        }

        if (!isArray(arg) && !this.isObject(arg)) var arg = [arg];
        if (isArray(arg)) {
            for (var i = 0; i < arg.length; i++) {
                func.call(window, arg[i], i, arg);
            }
        } else if (this.isObject(arg)) {
            for (var key in arg) {
                func.call(window, arg[key], key, arg);
            }
        }
    },

    attemptJson: function attemptJson(str) {
        try {
            return JSON.parse(str);
        } catch (err) {
            return str;
        }
    },

    findAncestor: function findAncestor(el, cls) {
        if (el.classList.contains(cls)) return el;
        while ((el = el.parentElement) && !el.classList.contains(cls)) {}
        return el;
    },

    range: function range(n, offset, fill) {
        var a = [];
        offset = offset || 0;
        while (n) {
            if (fill > -1) {
                a.push(fill);
                --n;
            } else {
                a.push(--n + offset);
            }
        }
        return a.reverse();
    }
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ------------------------------------------------------------------------
 * Element generator check out the standalone version for docs
 * https://github.com/Andrinoid/ElementGenerator.js
 * ------------------------------------------------------------------------
 */
var Elm = function () {
    //Simple element generator. Mootools style
    //tries to find method for keys in options and run it
    function Elm(type, options, parent, injectType) {
        _classCallCheck(this, Elm);

        function isElement(obj) {
            return (obj[0] || obj).nodeType;
        }

        var args = arguments;
        if (isElement(args[1] || {}) || typeof args[1] === 'string') {
            options = {};
            parent = args[1];
        }

        this.element = null;
        if (type.indexOf('.') > -1) {
            var separated = type.split('.');
            var stype = separated[0];
            var clsName = separated[1];
            this.element = document.createElement(stype);
            this._setClass(this.element, clsName);
        } else {
            this.element = document.createElement(type);
        }
        this.options = options || {};

        for (var key in this.options) {
            if (!this.options.hasOwnProperty(key)) {
                continue;
            }
            var val = this.options[key];

            if (key === 'class') //fix for class name conflict
                key = 'cls';

            try {
                if (this[key]) {
                    this[key](val);
                } else {
                    //no special method found for key
                    this.tryDefault(key, val);
                }
            } catch (err) {
                //pass
            }

            this.injectType = injectType || null; // can be null, top
        }

        if (parent) {
            this.inject(parent);
        }

        return this.element;
    }

    _createClass(Elm, [{
        key: 'tryDefault',
        value: function tryDefault(key, val) {
            /*
            * In many cases the element property key is nice so we only pass it forward
            * e.q this.element.value = value
            */
            if (key.indexOf('data-') > -1) {
                this.attr(key, val);
            }
            this.element[key] = val;
        }
    }, {
        key: '_setClass',
        value: function _setClass(el, className) {
            //Method credit http://youmightnotneedjquery.com/
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        }
    }, {
        key: 'cls',
        value: function cls(value) {
            var _this = this;

            //Name can be comma or space separated values e.q 'foo, bar'
            //Even if one class name is given we clean the string and end up with array
            var clsList = value.replace(/[|&;$%@"<>()+,]/g, "").split(' ');

            clsList.forEach(function (name) {
                _this._setClass(_this.element, name);
            });
        }
    }, {
        key: 'html',
        value: function html(str) {
            this.element.innerHTML = str;
        }
    }, {
        key: 'attr',
        value: function attr(key, val) {
            this.element.setAttribute(key, val);
        }
    }, {
        key: 'text',
        value: function text(str) {
            this.element.innerText = str;
        }
    }, {
        key: 'css',
        value: function css(obj) {
            for (var prop in obj) {
                if (!obj.hasOwnProperty(prop)) {
                    continue;
                }
                this.element.style[prop] = obj[prop];
            }
        }
    }, {
        key: 'click',
        value: function click(fn) {
            this.element.addEventListener('click', function (e) {
                fn(e);
            });
        }
    }, {
        key: 'change',
        value: function change(fn) {
            this.element.addEventListener('change', function (e) {
                fn(e);
            });
        }
    }, {
        key: 'inject',
        value: function inject(to) {
            var parent = Utils.normalizeElement(to);
            if (this.injectType === 'top') {
                parent.insertBefore(this.element, parent.childNodes[0]);
            } else {
                parent.appendChild(this.element);
            }
        }
    }]);

    return Elm;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ------------------------------------------------------------------------
 * Modal
 * Creates Modal
 * ------------------------------------------------------------------------
 */
var Modalstyles = '\n        /* Modal styles */\n         body.modal-mode {\n             overflow: hidden !important\n         }\n         .modal-body,\n         .modal-title {\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             line-height: 1.42857143;\n             color: #333\n         }\n         .js_modal,\n         .modal-backdrop {\n             position: fixed;\n             top: 0;\n             right: 0;\n             bottom: 0;\n             left: 0\n         }\n         .modal-backdrop {\n             z-index: 1040;\n             background-color: #000;\n             opacity: .5\n         }\n\n         .js_modal {\n             pointer-events: none;\n             z-index: 10000;\n             overflow-y: scroll;\n             -webkit-overflow-scrolling: touch;\n             outline: 0\n         }\n         .js_dialog {\n             pointer-events: all;\n             position: relative;\n             width: auto;\n             margin: 10px\n         }\n         .modal-header .close {\n             margin-top: -2px;\n             position: static;\n             height: 30px;\n         }\n         .modal-theme-blue .close {\n             text-shadow: none;\n             opacity: 1;\n             font-size: 31px;\n             font-weight: normal;\n         }\n         .modal-theme-blue .close span {\n             color: white;\n         }\n         .modal-theme-blue .close span:hover {\n             color: #fbc217;\n         }\n         .close.standalone {\n             position: absolute;\n             right: 15px;\n             top: 13px;\n             z-index: 1;\n             height: 30px;\n         }\n         .modal-title {\n             margin: 0;\n             font-size: 18px;\n             font-weight: 500\n         }\n         button.close {\n             -webkit-appearance: none;\n             padding: 0;\n             cursor: pointer;\n             background: 0 0;\n             border: 0\n         }\n         .modal-content {\n             position: relative;\n             background-color: #fff;\n             background-clip: padding-box;\n             border-radius: 2px;\n             outline: 0;\n             box-shadow: 0 3px 9px rgba(0, 0, 0, .5)\n         }\n         .modal-theme-blue .modal-content {\n            background-color: #4a6173;\n         }\n         .modal-header {\n             min-height: 16.43px;\n             padding: 15px;\n             border-bottom: 1px solid #e5e5e5;\n             min-height: 30px\n         }\n         .modal-theme-blue .modal-header {\n            border-bottom: none;\n         }\n         .modal-body {\n             position: relative;\n             padding: 15px;\n             font-size: 14px\n         }\n         .close {\n             float: right;\n             font-size: 21px;\n             font-weight: 700;\n             line-height: 1;\n             color: #000;\n             text-shadow: 0 1px 0 #fff;\n             opacity: .2\n         }\n         .js_dialog.js_modal-full {\n            margin: 0;\n            height: 100%;\n            width: 100%;\n         }\n         .js_dialog.js_modal-full .modal-content {\n            border: none;\n            box-shadow: none;\n            border-radius: 0;\n            height: 100%;\n         }\n         @media (min-width: 768px) {\n             .js_dialog {\n                 width: 600px;\n                 margin: 30px auto\n             }\n             .modal-content {\n                 box-shadow: 0 5px 15px rgba(0, 0, 0, .5)\n             }\n             .js_modal-sm {\n                 width: 300px\n             }\n         }\n         @media (min-width: 992px) {\n             .js_modal-lg {\n                 width: 980px\n             }\n         }\n\n         .ghost-focus {\n             background: transparent;\n             z-index: 1000;\n         }\n\n\n         /*** Animations ***/\n         @-webkit-keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @-webkit-keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         .fadeInDown,\n         .fadeInLeft,\n         .fadeInRight,\n         .fadeInTop,\n         .fadeOutTop{\n             -webkit-animation-fill-mode: both;\n             -webkit-animation-duration: .5s;\n             animation-duration: .5s;\n             animation-fill-mode: both;\n         }\n         .fadeInDown {\n             -webkit-animation-name: fadeInDown;\n             animation-name: fadeInDown;\n         }\n         .fadeInLeft {\n             -webkit-animation-name: fadeInLeft;\n             animation-name: fadeInLeft;\n         }\n         .fadeInRight {\n             -webkit-animation-name: fadeInRight;\n             animation-name: fadeInRight;\n         }\n         .fadeInTop {\n             -webkit-animation-name: fadeInTop;\n             animation-name: fadeInTop;\n         }\n         .fadeOutTop {\n             -webkit-animation-name: fadeOutTop;\n             animation-name: fadeOutTop;\n         }';

var Modal = function () {
    function Modal(options) {
        _classCallCheck(this, Modal);

        this.defaults = {
            title: '',
            message: '',
            theme: 'classic',
            withBackdrop: true,
            size: 'normal', //large small full
            customClass: '',
            onClose: function onClose() {},
            onOpen: function onOpen() {},
            closeOthers: true,
            autoClose: false,
            autoCloseTime: 2000,
            type: 'modal',
            outsideClick: true,
            parent: document.body

        };
        this.defaults = Utils.extend(this.defaults, options);
        this.parent = this.defaults.parent; //TODO resolve jquery, array like objects or proper error message
        this.STYLES = Modalstyles;

        if (this.defaults.closeOthers) this.__proto__.closeAll();
        this.__proto__.instances.push(this);
        this.buildTemplate();
        this._injectTemplate();
        if (this.defaults.autoClose) this.autoClose();

        this._injectStyles();
    }

    _createClass(Modal, [{
        key: 'autoClose',
        value: function autoClose() {
            var _this = this;

            setTimeout(function () {
                _this.close();
            }, this.defaults.autoCloseTime);
        }
    }, {
        key: 'buildTemplate',
        value: function buildTemplate() {
            var _this2 = this;

            var sizeMap = {
                'small': 'js_modal-sm',
                'normal': '',
                'large': 'js_modal-lg',
                'full': 'js_modal-full'
            };
            var sizeClass = sizeMap[this.defaults.size];

            if (this.defaults.withBackdrop) {
                this.backdrop = new Elm('div.modal-backdrop', document.body);
                if (this.defaults.outsideClick) {
                    this.backdrop.onclick = function () {
                        _this2.close();
                    };
                }
            }

            var header = this.defaults.title ? '<div class="modal-header">\n                    <button type="button" class="close"><span>\xD7</span></button>\n                    <h4 class="modal-title" id="myModalLabel">' + this.defaults.title + '</h4>\n                </div>' : '<button type="button" class="close standalone"><span>×</span></button>';

            var main = '\n                <div class="js_modal fadeInDown">\n                    <div class="js_dialog ' + sizeClass + '">\n                        <div class="modal-content">\n                            ' + header + '\n                            <div class="modal-body">\n                                <div>' + this.defaults.message + '</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>';

            this.modal = new Elm('div', {
                html: main, 'class': 'modal-theme-' + this.defaults.theme,
                cls: this.defaults.customClass
            });

            var btn = this.modal.querySelectorAll('.close, .close-trigger');
            this.chainDialog = this.modal.querySelector('.js_dialog');

            for (var i = 0; i < btn.length; i++) {
                btn[i].addEventListener('click', function () {
                    _this2.close();
                }, false);
            }

            if (this.defaults.type === 'modal') {
                Utils.setClass(document.body, 'modal-mode');
            }
        }
    }, {
        key: '_injectTemplate',
        value: function _injectTemplate() {
            this.parent.appendChild(this.modal);
            this.defaults.onOpen();
        }
    }, {
        key: '_injectStyles',
        value: function _injectStyles() {
            if (!document.querySelector('.styleFallback')) {
                new Elm('style.styleFallback', {
                    html: this.STYLES
                }, document.querySelector('head'));
            }
        }
    }, {
        key: '_close',
        value: function _close() {
            var _this3 = this;

            var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

            if (this.defaults.withBackdrop) {
                Utils.fadeOutRemove(this.backdrop);
            }
            Utils.setClass(this.chainDialog, 'fadeOutTop');
            setTimeout(function () {
                _this3.modal.remove();
                Utils.removeClass(document.body, 'modal-mode');
                cb();
            }, 500);
        }
    }, {
        key: 'close',
        value: function close() {
            this._close(this.defaults.onClose); //TODO emmitter
        }

        // Remove modal without animation

    }, {
        key: '_remove',
        value: function _remove() {
            this.backdrop.remove();
            this.modal.remove();
            Utils.removeClass(document.body, 'modal-mode');
        }
    }]);

    return Modal;
}();

Modal.prototype.instances = [];
Modal.prototype.closeAll = function () {
    this.instances.forEach(function (item) {
        item._remove();
    });
    this.instances.length = 0;
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Alertsyles = '\n         .js_alerts .modal-body,\n         .js_alerts .modal-title {\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             line-height: 1.42857143;\n             color: #333,\n             text-align: left;\n         }\n         .js_alerts .js_modal,\n         .modal-backdrop {\n             position: fixed;\n             top: 0;\n             right: 0;\n             bottom: 0;\n             left: 0\n         }\n         .modal-backdrop {\n             z-index: 1040;\n             background-color: #000;\n             opacity: .5\n         }\n\n         .js_alerts .js_modal {\n             z-index: 10000;\n             overflow-y: scroll;\n             -webkit-overflow-scrolling: touch;\n             outline: 0\n         }\n         .js_alerts .js_dialog {\n             position: relative;\n             width: auto;\n             margin: 10px\n         }\n         .js_alerts .modal-header .close {\n             margin-top: -2px;\n             position: static;\n             height: 30px;\n         }\n         .js_alerts .modal-theme-blue .close {\n             text-shadow: none;\n             opacity: 1;\n             font-size: 31px;\n             font-weight: normal;\n         }\n         .js_alerts .modal-theme-blue .close span {\n             color: white;\n         }\n         .js_alerts .modal-theme-blue .close span:hover {\n             color: #fbc217;\n         }\n         .js_alerts .close.standalone {\n             position: absolute;\n             right: 15px;\n             top: 13px;\n             z-index: 1;\n             height: 30px;\n         }\n         .js_alerts .modal-title {\n             margin: 0;\n             font-size: 18px;\n             font-weight: 500\n         }\n         .js_alerts button.close {\n             -webkit-appearance: none;\n             padding: 0;\n             cursor: pointer;\n             background: 0 0;\n             border: 0\n         }\n         .js_alerts .modal-content {\n             position: relative;\n             background-color: #fff;\n             background-clip: padding-box;\n             border: 1px solid #999;\n             border-radius: 2px;\n             outline: 0;\n         }\n         .js_alerts .modal-theme-blue .modal-content {\n            background-color: #4a6173;\n         }\n         .js_alerts .modal-header {\n             min-height: 16.43px;\n             padding: 15px;\n             border-bottom: 1px solid #e5e5e5;\n             min-height: 30px\n         }\n         .js_alerts .modal-theme-blue .modal-header {\n            border-bottom: none;\n         }\n         .js_alerts .modal-body {\n             position: relative;\n             padding: 15px;\n             font-size: 14px;\n             color: #333;\n         }\n         .js_alerts .close {\n             float: right;\n             font-size: 21px;\n             font-weight: 700;\n             line-height: 1;\n             color: #000;\n             text-shadow: 0 1px 0 #fff;\n             opacity: .2\n         }\n         @media (min-width: 768px) {\n             .js_alerts .js_dialog {\n                 width: 600px;\n                 margin: 30px auto\n             }\n             .js_alerts .modal-content {\n                 box-shadow: 0 5px 15px rgba(0, 0, 0, .5)\n             }\n             .js_alerts .js_modal-sm {\n                 width: 300px\n             }\n         }\n         @media (min-width: 992px) {\n             .js_alerts .js_modal-lg {\n                 width: 900px\n             }\n         }\n\n         .ghost-focus {\n             background: transparent;\n             z-index: 1000;\n         }\n\n\n         /*** Animations ***/\n         @-webkit-keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @-webkit-keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         .fadeInDown,\n         .fadeInLeft,\n         .fadeInRight,\n         .fadeInTop,\n         .fadeOutTop{\n             -webkit-animation-fill-mode: both;\n             -webkit-animation-duration: .5s;\n             animation-duration: .5s;\n             animation-fill-mode: both;\n         }\n         .fadeInDown {\n             -webkit-animation-name: fadeInDown;\n             animation-name: fadeInDown;\n         }\n         .fadeInLeft {\n             -webkit-animation-name: fadeInLeft;\n             animation-name: fadeInLeft;\n         }\n         .fadeInRight {\n             -webkit-animation-name: fadeInRight;\n             animation-name: fadeInRight;\n         }\n         .fadeInTop {\n             -webkit-animation-name: fadeInTop;\n             animation-name: fadeInTop;\n         }\n         .fadeOutTop {\n             -webkit-animation-name: fadeOutTop;\n             animation-name: fadeOutTop;\n         }\n\n        /* Alert styles */\n        .js_alerts {\n            position: fixed;\n            top: 0;\n            left: 0;\n            bottom: 0;\n            right: 0;\n            pointer-events: none;\n            z-index: 10001;\n        }\n        .js_alerts .js_dialog {\n            pointer-events: all;\n        }\n        .js_alerts .js_alert .js_modal {\n            overflow-y: auto;\n            position: static;\n        }\n        .js_alerts .js_alert .modal-content {\n            padding: 10px;\n            margin: 0;\n            border: 1px solid #eeeeee;\n            border-left-width: 5px;\n            border-radius: 3px;\n            font: inherit;\n        }\n        .js_alerts .js_success .modal-content{\n            border-left-color: #5bc0de;\n        }\n        .js_alerts .js_danger .modal-content{\n            border-left-color: #d9534f;\n        }\n        .js_alerts .js_info .modal-content{\n            border-left-color: #f0ad4e;\n        }';

var STYLES = Alertsyles;

/**
 * ------------------------------------------------------------------------
 * Modal
 * Creates Modal
 * ------------------------------------------------------------------------
 */

var Alert = function () {
    function Alert(type, options) {
        _classCallCheck(this, Alert);

        var args = arguments;
        if (args[0] !== 'success' && args[0] !== 'info' && args[0] !== 'danger') {
            type = 'success';
            options = {
                message: args[0]
            };
        } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
            options = {
                message: args[1]
            };
        }
        this.type = type;
        this.defaults = {
            message: '',
            theme: 'classic',
            customClass: 'js_alert',
            withBackdrop: false,
            size: 'large', //large small
            closeOthers: 6,
            blockOthers: false,
            timer: 3000,
            title: '',
            onClose: function onClose() {},
            onOpen: function onOpen() {}
        };

        this.defaults = Utils.extend(this.defaults, options);
        this.parent = document.body;
        if (this.__proto__.instances.length && this.defaults.blockOthers) {
            return;
        }
        this.__proto__.instances.push(this);

        this.buildTemplate();
        this._injectTemplate();
        if (this.defaults.timer) this.autoClose();

        this._injectStyles();
    }

    _createClass(Alert, [{
        key: 'autoClose',
        value: function autoClose() {
            var _this = this;

            setTimeout(function () {
                _this.close();
            }, this.defaults.timer);
        }
    }, {
        key: 'buildTemplate',
        value: function buildTemplate() {
            var _this2 = this;

            var sizeMap = {
                'small': 'js_modal-sm',
                'normal': '',
                'large': 'js_modal-lg'
            };
            var sizeClass = sizeMap[this.defaults.size];

            if (this.defaults.withBackdrop) {
                this.backdrop = new Elm('div.modal-backdrop', document.body);
            }

            var header = this.defaults.title ? '<div class="modal-header">\n                    <button type="button" class="close"><span>\xD7</span></button>\n                    <h4 class="modal-title" id="myModalLabel">' + this.defaults.title + '</h4>\n                </div>' : '<button type="button" class="close standalone"><span>×</span></button>';

            var main = '\n                <div class="js_modal fadeInDown">\n                    <div class="js_dialog ' + sizeClass + '">\n                        <div class="modal-content">\n                            ' + header + '\n                            <div class="modal-body">\n                                <div>' + this.defaults.message + '</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>';

            this.modal = new Elm('div', {
                html: main, 'class': 'modal-theme-' + this.defaults.theme + ' js_' + this.type,
                cls: this.defaults.customClass
            });

            var btn = this.modal.querySelector('.close');
            this.chainDialog = this.modal.querySelector('.js_dialog');
            btn.onclick = function () {
                _this2.close();
            };
            if (this.defaults.type === 'modal') {
                Utils.setClass(document.body, 'modal-mode');
            }
        }
    }, {
        key: '_injectTemplate',
        value: function _injectTemplate() {
            this._closeIfCondition();
            this.parent = document.querySelector('.js_alerts') || new Elm('div.js_alerts', document.body);
            this.parent.insertBefore(this.modal, this.parent.firstChild);
        }
    }, {
        key: '_injectStyles',
        value: function _injectStyles() {
            if (!document.querySelector('.js-alert-styles')) {
                new Elm('style.js-alert-styles', {
                    html: STYLES
                }, document.body);
            }
        }
    }, {
        key: '_closeIfCondition',
        value: function _closeIfCondition() {
            if (this.defaults.closeOthers && typeof this.defaults.closeOthers === 'number') {
                var max = this.defaults.closeOthers;
                if (this.__proto__.instances.length > max) {
                    this.__proto__.instances[this.__proto__.instances.length - 1]._close();
                }
            } else if (this.defaults.closeOthers && typeof this.defaults.closeOthers === 'boolean') {
                this.__proto__.closeAll();
            }
        }
    }, {
        key: '_close',
        value: function _close() {
            var _this3 = this;

            var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

            if (this.defaults.withBackdrop) {
                Utils.fadeOutRemove(this.backdrop);
            }
            Utils.setClass(this.chainDialog, 'fadeOutTop');
            this.__proto__.instances.pop();
            setTimeout(function () {
                _this3.modal.remove();
                cb();
            }, 500);
        }
    }, {
        key: 'close',
        value: function close() {
            this._close(this.defaults.onClose);
        }
    }]);

    return Alert;
}();

Alert.prototype.instances = [];
Alert.prototype.closeAll = function () {
    this.instances.forEach(function (item) {
        item._close();
    });
    this.instances.length = 0;
};
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ------------------------------------------------------------------------
 * Form generator
 * Generates form from json schema
 * ------------------------------------------------------------------------
 */

//Demo form
//    var form = [
//        {
//            type: 'text',
//            label: 'Name',
//            value: '',
//            placeholder: 'testholder'
//        }, {
//            type: 'text',
//            label: 'Email',
//            value: 'halló',
//            placeholder: 'testholder'
//        },
//        {
//            type: 'select',
//            label: 'select menu',
//            childnodes: [
//                {
//                    type: 'option',
//                    label: 'Foo',
//                    value: '9'
//                },
//                {
//                    type: 'option',
//                    label: 'Foo2',
//                    value: '10'
//                }
//            ]
//        },
//        {
//            type: 'checkbox',
//            label: 'my checkbox',
//            value: ''
//        },
//        {
//            type: 'number',
//            label: 'number field',
//            value: '',
//            placeholder: 'any number is fine'
//        },
//        {
//            type: 'text',
//            label: 'Email',
//            value: 'halló',
//            placeholder: 'testholder'
//        }, {
//            type: 'submit',
//            value: 'Lets Go'
//        }
//        "images": [
//                {
//                    "type": "image",
//                    "label": "campaign image",
//                    "width": "auto",
//                    "height": "auto",
//                    "quality": 80,
//                    "value": ""
//                }
//            ],
//        ];
var typeModels = {
    text: {
        element: 'input',
        type: 'text',
        cls: 'form-control',
        value: '',
        placeholder: '',
        helpText: '',
        validation: []
    },
    hidden: {
        element: 'input',
        type: 'hidden',
        value: '',
        validation: []
    },
    number: {
        element: 'input',
        type: 'number',
        cls: 'form-control',
        value: '',
        placeholder: '',
        validation: []
    },
    color: {
        element: 'input',
        type: 'color',
        cls: 'form-control',
        value: '',
        placeholder: '',
        validation: []
    },
    date: {
        element: 'input',
        type: 'date',
        cls: 'form-control',
        value: '',
        placeholer: '',
        validation: []
    },
    textarea: {
        element: 'textarea',
        cls: 'form-control',
        rows: 5,
        validation: []
    },
    submit: {
        element: 'input',
        type: 'submit',
        cls: 'btn btn-info',
        validation: []
    },
    select: {
        element: 'select',
        label: '',
        cls: 'form-control',
        childnodes: [],
        validation: []
    },
    option: {
        element: 'option',
        label: '',
        value: ''
    },
    checkbox: {
        element: 'input',
        type: 'checkbox',
        label: '',
        value: ''
    },
    image: {
        element: 'div',
        label: 'imagefield',
        description: '',
        value: '',
        backgroundUrlPrefix: '',
        url: 'http://kotturinn.com/icloud/upload/test',
        backgroundImage: '',
        maxFilesize: 8, //in MB
        acceptedFiles: 'jpeg, jpg, png, gif'
    },
    element: {}
};

//TODO list
/**
 * add validation for types
 * remove instance
 *
 */

var FormGenerator = function () {
    function FormGenerator(form, parent) {
        _classCallCheck(this, FormGenerator);

        this.form = form;
        //remove private keys from output object

        this.firstLoop = true;
        this.currentKey = null;
        this.parent = parent || document.body;
        this.typeModels = typeModels;
        this.arrayIndex = null;
        this.buildAllItems(this.form, this.parent);

        this.validators = {
            email: function email(_email) {
                var emailReg = new RegExp('[a-zA-Z0-9]+(?:(\\.|_)[A-Za-z0-9!#$%&\'*+\\/=?^`{|}~-]+)*@(?!([a-zA-Z0-9]*\\.[a-zA-Z0-9]*\\.[a-zA-Z0-9]*\\.))(?:[A-Za-z0-9](?:[a-zA-Z0-9-]*[A-Za-z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?');
                return emailReg.test(_email);
            }
        };
    }
    /**
     * Events to overide
     */


    _createClass(FormGenerator, [{
        key: 'onChange',
        value: function onChange(e) {}

        /**
         * Climbs the dom tree and gathers the keychain for given element
         * returns keychain
         */

    }, {
        key: 'getKeychain',
        value: function getKeychain(el) {
            var raw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            //var keyList = ['value']; //list is reversed so this is the end key // reference for adding value to the end
            var keyList = []; //list is reversed so this is the end key
            while (el.parentNode && el.parentNode != document.body) {
                if ((' ' + el.className + ' ').indexOf(' ' + 'keypoint' + ' ') > -1) {
                    keyList.push(el.getAttribute('data-key'));
                }
                el = el.parentNode;
            }
            //keyList.push('form');

            return raw ? keyList.reverse() : keyList.reverse().join('.');
        }
    }, {
        key: 'getAllKeychains',
        value: function getAllKeychains() {
            var _this = this;

            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            prefix = prefix ? prefix += '.' : '';
            suffix = suffix ? '.' + suffix : '';
            var formElms = this.parent.querySelectorAll('[data-key]');
            var keychains = [];
            _.forEach(formElms, function (item) {
                var root = _this.getKeychain(item);
                var keychain = '' + prefix + root + suffix;
                keychains.push(keychain);
            });
            return keychains;
        }

        /**
         * Returns javascript valid keychain from the generated dot seperated
         * e.g foo.bar.4.bas -> foo.bar[4].baz
         */

    }, {
        key: 'jsKeychain',
        value: function jsKeychain(str) {
            try {
                return str.replace(new RegExp('\.[0-9]+'), '[' + str.match('\.[0-9]+')[0].slice(1) + ']');
            } catch (err) {
                return str;
            }
        }

        /**
         * if we are inside a loop prepend the index to the key
         * e.g if arrayIndex is 2 and key is foo we return 2
         */

    }, {
        key: 'getCycleKey',
        value: function getCycleKey(key) {
            var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (this.arrayIndex || this.arrayIndex === 0) {
                if (reverse) {
                    return key ? key + '.' + this.arrayIndex : this.arrayIndex;
                }
                return key ? this.arrayIndex + '.' + key : this.arrayIndex;
            }
            return key;
        }

        /**
         * Populate list n times with default object
         */

    }, {
        key: 'pushArrayObject',
        value: function pushArrayObject(keychain, list) {
            var self = this;
            var schemaList = eval('self.form.' + keychain);
            var item = schemaList[0];
            var isSubform = !item.hasOwnProperty('type');
            schemaList.pop();
            _.forEach(list, function (val) {
                var clone = _.clone(item);
                clone.value = val;
                schemaList.push(clone);
            });
        }

        /**
         * Returns the model for given form item
         */

    }, {
        key: 'getModel',
        value: function getModel(item) {
            var model = this.typeModels[item.type];
            var clone = _.clone(model);
            return Utils.extend(clone, item);
        }
    }, {
        key: 'getElementModel',
        value: function getElementModel(elm) {}

        /**
         * Returns wrapper element for the given form item
         * Default is for most cases. Exceptions must be dealt with
         */

    }, {
        key: 'defaultWrapper',
        value: function defaultWrapper(model, parent, key) {
            key = this.getCycleKey(key);
            var wrapper = new Elm('div.form-group', {
                'data-key': key,
                cls: 'keypoint'
            }, parent);
            var label = model.label && new Elm('label', {
                text: model.label,
                cls: 'control-label'
            }, wrapper);
            var description = model.description && new Elm('p', {
                html: model.description
            }, wrapper);
            var inputContainer = new Elm('div', wrapper);
            var helptext = model.helpText && new Elm('span.help-block', {
                text: model.helpText
            }, wrapper);
            return inputContainer;
        }

        /**
         * Returns wrapper element for checkbox
         */

    }, {
        key: 'checkboxWrapper',
        value: function checkboxWrapper(model, parent, key) {
            key = this.getCycleKey(key);
            var wrapper = new Elm('div.checkbox', {
                'data-key': key,
                cls: 'keypoint'
            }, parent);
            var label = new Elm('label', wrapper);
            model['checked'] = model.value; // We only use checkbox as bool so if value is true its checked
            new Elm('span', {
                text: model.label
            }, label);
            var helptext = model.helpText && new Elm('span.help-block', {
                text: model.helpText
            }, wrapper);
            return label;
        }

        /**
         * Returns wrapper element for subform or simply an bootstrap panel
         */

    }, {
        key: 'subFormWrapper',
        value: function subFormWrapper(parent) {
            var toggle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var key = this.getCycleKey(this.currentKey);
            var label = void 0;
            if (key) label = new Elm('h4', {
                html: key,
                style: 'text-transform: capitalize'
            }, parent);
            var cls = this.firstLoop ? '' : 'panel panel-default keypoint';
            var panel = new Elm('div', {
                cls: cls,
                'data-key': key
            }, parent);
            var body = new Elm('div.panel-body', panel);
            if (toggle) {

                var plus = new Elm('span', {
                    cls: 'glyphicon glyphicon-plus',
                    css: {
                        'margin-left': '10px',
                        'cursor': 'pointer',
                        'font-size': '16px'
                    }
                }, label);
                label.addEventListener('click', function (e) {
                    panel.style.display = 'block';
                    Utils.fadeOutRemove(plus);
                });
                panel.style.display = 'none';
            }

            return body;
        }

        /**
         * Returns wrapper element for array with plus button
         */

    }, {
        key: 'subFormWrapperPlus',
        value: function subFormWrapperPlus(parent) {
            var self = this;
            var key = this.getCycleKey(this.currentKey);
            //new Elm('h4', {html: key, style: 'text-transform: capitalize'}, parent);
            var panel = new Elm('div', {
                cls: 'panel panel-default keypoint',
                'data-key': key
            }, parent);
            var body = new Elm('div.panel-body', panel);

            var keychain = this.getKeychain(panel, true);
            keychain = keychain.join('.');

            this.addItemElm(panel, body, keychain);
            return body;
        }
    }, {
        key: 'removeItemElm',
        value: function removeItemElm(parent, keychain) {
            var _this2 = this;

            var self = this;
            var remove = new Elm('div.delSubForm', {
                cls: 'pull-right',
                html: '<i class="glyphicon glyphicon-remove"></i>',
                css: {
                    color: 'gray',
                    cursor: 'pointer'
                },
                'data-key': keychain,
                click: function click(e) {
                    var list = eval('self.form.' + _this2.jsKeychain(keychain));
                    var index = _this2.arrayIndex || 0;
                    var removed = list.splice(index, 1);
                    // removes only one item if removed is triggered in a row this.arrayIndex is fixed here
                    Utils.fadeOutRemove(parent);
                }
            }, parent);
        }
    }, {
        key: 'addItemElm',
        value: function addItemElm(parent, body, keychain) {
            var _this3 = this;

            var self = this;
            var plus = new Elm('div', {
                cls: 'btn btn-default',
                html: '<i class="glyphicon glyphicon-plus"></i> Add',
                style: 'margin:0 15px 15px',
                click: function click() {
                    var elmWrapper = new Elm('div', body);
                    var list = eval('self.form.' + keychain);
                    var clone = list[0];
                    clone.value = '';
                    list.push(clone);
                    _this3.arrayIndex = list.length - 1;
                    var isSubform = !clone.hasOwnProperty('type');
                    if (isSubform) {
                        _this3.buildSubForm(clone, body);
                    } else {
                        _this3.removeItemElm(elmWrapper, keychain);
                        _this3.buildOneItem(clone, elmWrapper);
                    }
                }
            }, parent);
        }
    }, {
        key: 'buildSubForm',
        value: function buildSubForm(subitem, parent) {
            var wrapper = new Elm('div.subform', parent);
            var keychain = this.getKeychain(wrapper, true);
            //keychain.pop();
            keychain = keychain.join('.');

            // No remove button on first item in array
            if (this.arrayIndex) {
                this.removeItemElm(wrapper, keychain);
            }
            this.buildAllItems(subitem, wrapper);
        }
    }, {
        key: 'buildOneItem',
        value: function buildOneItem(item, parent, key) {
            var _this4 = this;

            var self = this;
            /**
             * If item is array we need special wrapper
             */
            if (Utils.isArrey(item)) {
                //new Elm('hr', parent);
                new Elm('h4', {
                    html: key,
                    style: 'text-transform: capitalize'
                }, parent);
                parent = this.subFormWrapperPlus(parent, key);
                Utils.foreach(item, function (subitem, i) {
                    _this4.arrayIndex = i;
                    var isSubform = !subitem.hasOwnProperty('type');
                    if (isSubform) {
                        _this4.buildSubForm(subitem, parent, key);
                    } else {
                        _this4.buildOneItem(subitem, parent);
                    }
                    //new Elm('hr', parent);
                });
                this.arrayIndex = null;
                return;
            }

            /**
             * If item don't have type key it is treated as subform
             * this has a potential failure if the actual field name is type
             */

            var isSubform = !item.hasOwnProperty('type');
            if (isSubform) {
                //parent = this.subFormWrapper(parent, key);

                //new Elm('hr', parent);
                this.buildAllItems(item, parent);
                return false;
            }

            var model = this.getModel(item);
            console.log(model.type);
            var wrapper = null;
            var element = null;

            /**
             * Bellow are special model types. They either don't fit the defaultWrapper pattern
             * or need some special treatment e.g image will be converted to image Droppad
             * using our IMAGECLOUD service
             */

            /**
             * Checkboxes don't fit in the defaultWrapper
             */
            if (model.type === 'checkbox') {
                wrapper = this.checkboxWrapper(model, parent, key);
                model['data-keychain'] = this.getKeychain(wrapper);
                element = new Elm(model.element, model, wrapper, 'top'); //top because label comes after input
                //set value as attribute on change
                element.addEventListener('change', function (e) {
                    this.setAttribute('elm-value', this.checked);
                    self.onChange(e);
                });
            }

            /**
             * Image is converted to droppad using ImageCloud
             */
            else if (model.type === 'image') {
                    wrapper = this.defaultWrapper(model, parent, key);
                    model['data-keychain'] = this.getKeychain(wrapper);
                    element = new Elm(model.element, model, wrapper);
                    model.backgroundImage = model.value;

                    var droppad = new Droppad(element, model);

                    // onchange for images
                    droppad.on('success', function (data) {
                        Utils.removeClass(wrapper.parentNode, 'has-error');
                        element.setAttribute('elm-value', data.image);
                        _this4.onChange(data);
                    });
                } else if (model.type === 'element') {
                    console.log(model);
                    new Elm('div', { html: model.html }, parent);
                }

                /**
                 * No special treatment needed
                 * these elements are normal html inputs and should have onchange event
                 */
                else {
                        wrapper = this.defaultWrapper(model, parent, key);
                        model['data-keychain'] = this.getKeychain(wrapper);
                        element = new Elm(model.element, model, wrapper);

                        //set value as attribute on change
                        element.addEventListener('change', function (e) {
                            this.setAttribute('elm-value', this.value);
                            self.onChange(e);
                        });
                        element.addEventListener('blur', function () {
                            var _this5 = this;

                            /**
                            * return if no value. otherwise, loop through given validation on this model
                            * and collect those who return false and set error class on wrapper parent
                            */
                            var errors = [];
                            if (!this.value) {
                                return false;
                            }
                            if (model.validation) {
                                //dont fail if no validation id defined
                                model.validation.forEach(function (item) {
                                    !self.validators[item](_this5.value) && errors.push(item);
                                });
                            }

                            if (errors.length) {
                                var formGroup = Utils.findAncestor(this, 'form-group');
                                Utils.setClass(formGroup, 'has-error');
                            }
                        });
                        element.addEventListener('focus', function (e) {
                            Utils.removeClass(wrapper.parentNode, 'has-error');
                        });
                    }

            /**
             * If there is value defined on the model, we add it as elm-value attribute
             */
            if (model.value) {
                element.setAttribute('elm-value', model.value);
            } else {
                try {
                    element.setAttribute('elm-value', '');
                } catch (err) {}
            }

            if (model.toggle) {
                var label = wrapper.previousElementSibling;
                var plus = new Elm('span', {
                    cls: 'glyphicon glyphicon-plus',
                    css: {
                        'margin-left': '10px',
                        'cursor': 'pointer'
                    }
                }, label);
                label.addEventListener('click', function (e) {
                    wrapper.style.display = 'block';
                    Utils.fadeOutRemove(plus);
                });
                wrapper.style.display = 'none';
            }
            // Some form elements have children. E.g select menus
            try {
                if (model.childnodes.length) {
                    Utils.foreach(model.childnodes, function (item) {
                        var model = _this4.getModel(item);
                        new Elm(model.element, model, element);
                    });
                }
            } catch (err) {
                // No childnodes defined
            }

            if (model.type === 'select') {
                element.setAttribute('elm-value', element.options[element.selectedIndex].value);
            }
        }
    }, {
        key: 'buildAllItems',
        value: function buildAllItems(form, parent) {
            var _this6 = this;

            var orderKeys = form._order || [];
            var AllKeys = Object.keys(form);
            var diff = _.difference(AllKeys, orderKeys);
            var order = orderKeys.concat(diff);
            var toggle = form._toggle;

            var wrapper = this.subFormWrapper(parent, toggle);

            this.firstLoop = false;
            Utils.foreach(order, function (key) {
                if (!form.hasOwnProperty(key)) {
                    console.warn('Schema has no key: ' + key + '. Looks like _order list is outdated.');
                    return;
                }
                _this6.currentKey = key;
                var item = form[key];
                if (typeof item !== 'string') {
                    // Don't populate private keys
                    if (key.substring(0, 1) !== '_') {
                        _this6.buildOneItem(item, wrapper, key);
                    }
                }
            });
        }
    }, {
        key: 'getData',
        value: function getData() {
            var _this7 = this;

            // cleanup list of keys from object
            function deepRemoveKeys(obj, key) {
                var keys = typeof key === 'string' ? [key] : key;
                _.forEach(keys, function (key) {
                    if (obj && obj[key]) delete obj[key];
                });
                _.forEach(obj, function (item) {
                    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
                        _.forEach(keys, function (key) {
                            if (item && item[key]) delete item[key];
                        });
                        deepRemoveKeys(item, key);
                    }
                });
            }

            var self = this;
            var elms = this.parent.querySelectorAll('[data-keychain]');
            this.output = {};
            var isValid = true;
            _.forEach(elms, function (elm) {
                var errors = [];
                var keyList = elm.getAttribute('data-keychain').split('.');
                var lastKey = keyList.pop();
                var keyChain = keyList.join('.');
                var jsKeychain = _this7.jsKeychain(keyChain);

                var model = void 0;
                jsKeychain ? model = eval('self.form.' + jsKeychain) : model = _this7.form;
                model = model[lastKey];

                /**
                * Validation
                * TODO add validation for all types
                * TODO merge with onchange validation
                * return if no value. otherwise, loop through given validation on this model
                * and collect those who return false and set error class on wrapper parent
                */
                var val = elm.getAttribute('elm-value');

                if (model.required && !val) {
                    errors.push('required');
                }

                if (model.validation) {
                    model.validation.forEach(function (item) {
                        !self.validators[item](val) && errors.push(item);
                    });
                }
                if (errors.length) {
                    var formGroup = Utils.findAncestor(elm, 'form-group');
                    Utils.setClass(formGroup, 'has-error');
                    isValid = false;
                }
                // Locate the right object in the output and add the value to it
                // if no jsKeychain we are on the first level of the object so we just return the whole output object
                var parentObj = void 0;
                jsKeychain ? parentObj = eval('self.output.' + jsKeychain) : parentObj = _this7.output;
                parentObj[lastKey] = val;
            });

            deepRemoveKeys(this.output, ['_order', '_name', '_toggle']);
            if (!isValid) {
                return false;
            }
            return this.output;
        }
    }, {
        key: 'setData',
        value: function setData(obj) {

            //TODO consider saving orginal schema and use for set data to prevent doubles if setData is done twice
            var self = this;
            this.firstLoop = true;
            this.currentKey = null;

            // Get keychains from the populated form
            var keychains = this.getAllKeychains();

            // obj can have populated lists but schema only defines one item so...
            // Iterate through keychains. and update schema for array's
            for (var i = 0; i < keychains.length; i++) {
                var keyChain = keychains[i];
                var jsKeychain = this.jsKeychain(keyChain);
                var val = void 0;
                try {
                    val = eval('obj.' + jsKeychain);
                } catch (err) {
                    val = null;
                }
                if (Utils.isArrey(val)) {
                    this.pushArrayObject(keyChain, val);
                }
                if (val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== 'object') {
                    var parentObj = eval('self.form.' + jsKeychain);
                    parentObj['value'] = val;
                }
            }

            this.parent.innerHTML = '';
            this.buildAllItems(this.form, this.parent);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.setData({});
        }
    }]);

    return FormGenerator;
}();

var SchemaDiscover = function SchemaDiscover(json) {
    _classCallCheck(this, SchemaDiscover);
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Original - @Gozola. This is a reimplemented version (with a few bug fixes).
// edited https://gist.github.com/Raynos/1638059
var emitter = window.WeakMap ? new WeakMap() : function () {
    var privates = Name();

    return {
        get: function get(key, fallback) {
            var store = privates(key);
            return store.hasOwnProperty("value") ? store.value : fallback;
        },
        set: function set(key, value) {
            privates(key).value = value;
        },
        has: function has(key) {
            return "value" in privates(key);
        },
        "delete": function _delete(key) {
            return delete privates(key).value;
        }
    };

    function namespace(obj, key) {
        var store = { identity: key },
            valueOf = obj.valueOf;

        Object.defineProperty(obj, "valueOf", {
            value: function value(_value) {
                return _value !== key ? valueOf.apply(this, arguments) : store;
            },
            writable: true
        });

        return store;
    }

    function Name() {
        var key = {};
        return function (obj) {
            var store = obj.valueOf(key);
            return store && store.identity === key ? store : namespace(obj, key);
        };
    }
}();

// https://github.com/JFusco/es6-event-emitter/blob/master/src/emitter.js

var Emitter = function () {
    function Emitter() {
        _classCallCheck(this, Emitter);

        emitter.set(this, {
            events: {}
        });

        this.eventLength = 0;
    }

    _createClass(Emitter, [{
        key: "on",
        value: function on(event, cb) {
            if (typeof cb === 'undefined') {
                throw new Error('You must provide a callback method.');
            }

            if (typeof cb !== 'function') {
                throw new TypeError('Listener must be a function');
            }

            this.events[event] = this.events[event] || [];
            this.events[event].push(cb);

            this.eventLength++;

            return this;
        }
    }, {
        key: "off",
        value: function off(event, cb) {
            if (typeof cb === 'undefined') {
                throw new Error('You must provide a callback method.');
            }

            if (typeof cb !== 'function') {
                throw new TypeError('Listener must be a function');
            }

            if (typeof this.events[event] === 'undefined') {
                throw new Error("Event not found - the event you provided is: " + event);
            }

            var listeners = this.events[event];

            listeners.forEach(function (v, i) {
                if (v === cb) {
                    listeners.splice(i, 1);
                }
            });

            if (listeners.length === 0) {
                delete this.events[event];

                this.eventLength--;
            }

            return this;
        }
    }, {
        key: "trigger",
        value: function trigger(event) {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (typeof event === 'undefined') {
                throw new Error('You must provide an event to trigger.');
            }

            var listeners = this.events[event];

            if (typeof listeners !== 'undefined') {
                listeners = listeners.slice(0);

                listeners.forEach(function (v) {
                    v.apply(_this, args);
                });
            }

            return this;
        }
    }, {
        key: "events",
        get: function get() {
            return emitter.get(this).events;
        }
    }]);

    return Emitter;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Events
 * dragenter
 * dragover
 * ondragleave
 * drop
 * progress
 * success
 * error
 */
var Droppad = function () {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var STYLES = '\n        .imageCloud {\n            position: relative;\n            background-size: cover;\n            background-position: 50% 50%;\n            cursor: pointer;\n            font-family: arial, serif;\n            min-height: 200px;\n            display: flex;\n        }\n        .imageCloud input {\n            position: absolute;\n            top: 0;\n            right: 0;\n            bottom: 0;\n            left: 0;\n        }\n        .imageCloud .dropSheet {\n            position: absolute;\n            top: 0;\n            bottom: 0;\n            left: 0;\n            right: 0;\n            background: rgba(0, 0, 0, 0.5);\n            text-align: center;\n            padding: 10px;\n            opacity: 0;\n            transition: ease all 0.5s;\n            pointer-events: none;\n        }\n\n        .imageCloud .dropSheet.shown {\n            background: rgba(0, 0, 0, 0);\n            opacity: 1;\n        }\n\n        .imageCloud:hover .dropSheet {\n            background: rgba(0, 0, 0, 0.5);\n            opacity: 1;\n        }\n        .imageCloud:hover .dropSheet > div .dropLabel {\n            text-shadow: none;\n        }\n        .imageCloud.active {\n            background: rgba(0, 0, 0, 0.5);\n            background-size: cover;\n            background-position: center;\n        }\n\n        .imageCloud .dropSheet > div {\n            padding: 10px;\n            color: white;\n            border: dashed 2px #fff;\n            position: absolute;\n            top: 10px;\n            bottom: 10px;\n            left: 10px;\n            right: 10px;\n        }\n\n        .imageCloud .dropSheet > div .dropLabel {\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            transition: ease all 0.5s;\n            text-shadow: rgb(122, 122, 122) 1.5px 1.5px 0px, 0px 0px 9px rgba(0, 0, 0, 0.45);\n            width: 100%;\n        }\n\n        .imageCloud .dropSheet > div p {\n            font-size: 18px;\n        }\n\n        .imageCloud .fallBack {\n            flex-grow: 1;\n            pointer-events: none;\n            background-color: gray;\n            background-size: cover;\n            background-position: center;\n        }\n\n        .imageCloud .loadedImage {\n            flex-grow: 1;\n            pointer-events: none;\n            opacity: 0;\n            transition: ease opacity 0.5s;\n            background-size: cover;\n            background-position: center;\n            -webkit-filter: grayscale(100%); /* Chrome, Safari, Opera */\n            filter: grayscale(100%);\n        }\n        .imageCloud .progressbar {\n            position: absolute;\n            top: 0;\n            left: 0;\n            height: 6px;\n            width: 0%;\n            background: #4caf50;\n            z-index: 1;\n            transition: ease all 1s\n        }\n        .droppad-input {\n            position: absolute;\n            top: 0;\n            left: 0;\n            height: 0;\n            width: 0;\n            visibility: hidden;\n        }\n        .fillSpace {\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            display: flex;\n            pointer-events: none;\n        }\n    ';

    var Default = {
        backgroundUrlPrefix: '',
        url: '',
        backgroundImage: '',
        maxFilesize: 8, //in MB
        maxFiles: 20,
        paramName: "file", //TODO
        includeStyles: true,
        acceptedFiles: 'jpeg, jpg, png, gif',
        showErrors: true,
        title: 'Drop Image',
        subTitle: 'or click here',
        customHandler: false

        //Event triggers

        // start - Fires when an upload starts
        // success - Fires for success on each uploaded file
        // error
        // complete - Fires when all files have been uploaded

        // dragover
        // dragenter
        // dragleave
        // drop
        // progress
    };

    var Template = '\n        <div class="progressbar"></div>\n        <div class="fillSpace afterLoad">\n\n        </div>\n        <div class="fillSpace beforeLoad">\n\n        </div>\n        <div class="dropSheet shown">\n            <div>\n                <div class="dropLabel">\n                    <p>*|title|*</p>\n                    <p>\n                        <small>*|subTitle|*</small>\n                    </p>\n                </div>\n            </div>\n        </div>\n    ';

    var Droppad = function (_Emitter) {
        _inherits(Droppad, _Emitter);

        function Droppad(elm, options) {
            _classCallCheck(this, Droppad);

            var _this = _possibleConstructorReturn(this, (Droppad.__proto__ || Object.getPrototypeOf(Droppad)).call(this));

            var defaultOpt = JSON.parse(JSON.stringify(Default));
            _this.defaults = Utils.extend(defaultOpt, options);
            _this.droppad = elm;
            _this.currentImage = null;
            _this.beforeElmQue = [];
            _this.afterElmQue = [];
            _this.injectStyles();
            _this.createDOM();
            _this.setEvents();
            _this.droppadElements();
            _this.setBackground(); //TODO
            return _this;
        }
        // getters

        _createClass(Droppad, [{
            key: 'injectStyles',
            value: function injectStyles() {
                //if styles exists do nothing
                if (document.getElementById('imagecloudStyles')) return;
                var tag = document.createElement('style');
                tag.type = 'text/css';
                tag.id = 'imagecloudStyles';
                if (tag.styleSheet) {
                    tag.styleSheet.cssText = STYLES;
                } else {
                    tag.appendChild(document.createTextNode(STYLES));
                }
                document.getElementsByTagName('head')[0].appendChild(tag);
            }
        }, {
            key: 'createDOM',
            value: function createDOM() {
                var _this2 = this;

                Utils.setClass(this.droppad, 'imageCloud');
                Utils.setClass(this.droppad, 'active');
                Utils.setClass(this.droppad, 'droppad-clickable');
                var template = (' ' + Template).slice(1); //Force string copy for. Bug in some  chrome versions
                template = template.replace('*|title|*', this.defaults.title).replace('*|subTitle|*', this.defaults.subTitle);

                this.droppad.innerHTML = template;
                this.el_clickableInput = new Elm('input.droppad-input', {
                    type: 'file',
                    id: 'id-' + Math.floor(Math.random() * 100), //TODO remove
                    change: function change(e) {
                        //let file = e.target.files[0];
                        _this2.showAsBackground(e.target.files);
                        _this2.upload(e.target.files);
                    },
                    multiple: true
                }, this.droppad);
            }
        }, {
            key: 'setEvents',
            value: function setEvents() {
                var _this3 = this;

                function noPropagation(e) {
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                }
                this.droppad.ondragenter = function (e) {
                    noPropagation(e);
                    _this3.dragenter(e);
                };
                this.droppad.ondragover = function (e) {
                    noPropagation(e);
                    _this3.dragover(e);
                };
                this.droppad.ondragleave = function (e) {
                    noPropagation(e);
                    _this3.dragleave(e);
                };
                this.droppad.ondrop = function (e) {
                    noPropagation(e);
                    _this3.drop(e);
                };
                var self = this;
                // add event to document and listen for droppad-clickable elements
                if (!this.__proto__.isClickable) {
                    document.addEventListener('click', function (e) {
                        var clsList = Array.prototype.slice.call(e.target.classList);
                        if (clsList.indexOf('droppad-clickable') > -1) {
                            var droppad = Utils.findAncestor(e.target, 'imageCloud');
                            var input = droppad.querySelector('.droppad-input');
                            input.click();
                        }
                    });
                }
                this.__proto__.isClickable = true;
            }
        }, {
            key: 'droppadElements',
            value: function droppadElements() {
                this.el_fallback = this.droppad.querySelector('.fallBack');
                this.el_loadedImage = this.droppad.querySelector('.loadedImage');
                this.el_progressbar = this.droppad.querySelector('.progressbar');
            }
        }, {
            key: 'setBackground',
            value: function setBackground() {
                var prefix = this.defaults.backgroundUrlPrefix === '' ? '' : this.defaults.backgroundUrlPrefix.replace(/\/?$/, '/');
                var url = prefix + this.defaults.backgroundImage;
                this.droppad.style.backgroundImage = 'url(' + url + ')';
            }
        }, {
            key: 'showAsBackground',
            value: function showAsBackground(files) {
                var _this4 = this;

                /**
                 * let the images fade in 500ms
                 */
                Utils.removeClass(this.droppad, 'active');

                var _loop = function _loop(i) {
                    var elBefore = new Elm('div.loadedImage', {
                        css: {
                            'opacity': 1
                        }
                    }, _this4.droppad.querySelector('.beforeLoad'));
                    var elAfter = new Elm('div.fallBack', _this4.droppad.querySelector('.afterLoad'));
                    _this4.beforeElmQue.push(elBefore);
                    _this4.afterElmQue.push(elAfter);
                    var file = files[i];
                    reader = new FileReader();

                    reader.onload = function (event) {
                        elBefore.style.backgroundImage = 'url(' + event.target.result + ')';
                        elBefore.style.opacity = 1;
                        setTimeout(function () {
                            elAfter.style.backgroundImage = 'url(' + event.target.result + ')';
                        }, 500);
                    };
                    reader.readAsDataURL(file);
                };

                for (var i = 0; i < files.length; i++) {
                    var reader;

                    _loop(i);
                }
            }
        }, {
            key: 'dragenter',
            value: function dragenter(e) {
                Utils.setClass(this.droppad, 'dragenter');
                this.trigger('dragenter', e);
            }
        }, {
            key: 'dragover',
            value: function dragover(e) {
                Utils.removeClass(this.droppad, 'dragover');
                this.trigger('dragover', e);
            }
        }, {
            key: 'dragleave',
            value: function dragleave(e) {
                Utils.removeClass(this.droppad, 'dragover');
                this.trigger('dragleave', e);
            }
        }, {
            key: 'drop',
            value: function drop(e) {
                Utils.removeClass(this.droppad, 'dragover');
                this.trigger('drop', e);
                var files = e.target.files || e.dataTransfer.files;
                //var file = files[0];

                this.showAsBackground(files);
                this.upload(files);
            }
        }, {
            key: 'validate',
            value: function validate(_file) {
                var self = this;
                var errors = [];
                var tests = [function size(file) {
                    var maxFilesize = self.defaults.maxFilesize * 1024 * 1024;
                    if (file.size > maxFilesize) {
                        errors.push('File is ' + self.formatBytes(file.size).human + '. Thats larger than the maximum file size ' + self.formatBytes(maxFilesize).human);
                    }
                }, function type(file) {
                    var baseMimeType = file.type.split('/')[0];
                    var mimeType = file.type.split('/')[1];
                    var acceptedFiles = self.defaults.acceptedFiles.replace(/ /g, '').split(',');
                    // Check if mimeType is allowed
                    if (acceptedFiles.indexOf(mimeType) < 0) {
                        errors.push('File type ' + mimeType + ' is not allowed');
                    }
                }];

                Utils.foreach(tests, function (fn) {
                    fn(_file);
                });

                return errors;
            }
        }, {
            key: 'uploadSingle',
            value: function uploadSingle(file, id) {
                var _this5 = this;

                var headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': '*/*'
                };

                var formData = new FormData();

                var errors = this.validate(file);
                if (errors.length) {
                    Utils.foreach(errors, function (err) {
                        _this5.trigger('error', err);
                        if (_this5.defaults.showErrors) {
                            new Alert('danger', {
                                message: err,
                                timer: 6000
                            });
                        }
                    });
                    return;
                }
                formData.append('file', file, file.name); //file.name is not required Check server side implementation of this


                var xhr = new XMLHttpRequest();
                //add trailing slash if doesn't exists
                var url = this.defaults.url;
                xhr.open('POST', url, true);
                for (var key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }

                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState !== 4) return;
                    var data = Utils.attemptJson(xhr.responseText);
                    if (xhr.status === 200) {
                        _this5.uploadSuccess(data, file);
                    } else {
                        _this5.uploadError(data);
                        //TODO show this to the user
                    }
                };
                xhr.upload.addEventListener('progress', function (e) {
                    _this5.chunkTotal.totals[id] = e.total;
                    _this5.chunkTotal.loads[id] = e.loaded;
                    _this5.uploadProgress();
                }, false);

                xhr.send(formData);
            }
        }, {
            key: 'upload',
            value: function upload(files) {
                this.trigger('start');
                this.chunkTotal = {
                    totals: Utils.range(files.length, 0, 0),
                    loads: Utils.range(files.length, 0, 0) };

                this.filesLenght = files.length;

                if (this.defaults.customHandler) {
                    this.defaults.customHandler(files);
                    return;
                }

                if (files.length > this.defaults.maxFiles) {
                    var err = 'The maximum amount of files you can upload is ' + this.defaults.maxFiles;
                    this.trigger('error', err);
                    if (this.defaults.showErrors) {
                        new Alert('danger', {
                            message: err,
                            timer: 6000
                        });
                    }
                    return;
                }

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    this.uploadSingle(file, i);
                }
            }
        }, {
            key: 'uploadProgress',
            value: function uploadProgress() {
                var loaded = this.chunkTotal.loads.reduce(function (a, b) {
                    return a + b;
                }, 0); // returns sum of array values
                var total = this.chunkTotal.totals.reduce(function (a, b) {
                    return a + b;
                }, 0);
                var percentage = (loaded / total * 100).toFixed();
                this.trigger('progress', percentage);
                this.el_progressbar.style.width = percentage + '%';
            }
        }, {
            key: 'uploadSuccess',
            value: function uploadSuccess(data, file) {
                var _this6 = this;

                data['file'] = file;
                this.trigger('success', data);

                this.el_progressbar.style.display = 'none';
                this.el_progressbar.style.width = 0;

                var elBefore = this.beforeElmQue.shift();
                var elAfter = this.afterElmQue.shift();
                elAfter.style.opacity = 1;
                elBefore.style.opacity = 0;
                this.currentImage = data;
                setTimeout(function () {
                    _this6.el_progressbar.style.display = 'block';
                }, 400);

                this.successCounter = this.successCounter ? this.successCounter + 1 : 1;
                if (this.filesLenght === this.successCounter) {
                    this.trigger('complete');
                    this.successCounter = 0;
                    this.filesLenght = 0;
                }
            }
        }, {
            key: 'uploadError',
            value: function uploadError(data) {
                this.trigger('error', data);
                new Alert('danger', 'not successfull');
            }

            //add to Utils?

        }, {
            key: 'formatBytes',
            value: function formatBytes(bytes) {
                var kb = 1024;
                var ndx = Math.floor(Math.log(bytes) / Math.log(kb));
                var fileSizeTypes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                return {
                    size: +(bytes / kb / kb).toFixed(2),
                    type: fileSizeTypes[ndx],
                    human: +(bytes / kb / kb).toFixed(2) + fileSizeTypes[ndx]
                };
            }
        }, {
            key: 'STYLES',
            get: function get() {
                return STYLES;
            }
        }, {
            key: 'Template',
            get: function get() {
                return Template;
            }
        }], [{
            key: 'Default',
            get: function get() {
                return Default;
            }
        }]);

        return Droppad;
    }(Emitter);

    Droppad.prototype.isClickable = false;
    return Droppad;
}();

//TODO
//change imagecloud to droppad or somthing unique
//Check browser support
//change fallBack to more appropriate name
//add option for single multiple
//option to hide labels when active image
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ------------------------------------------------------------------------
 * Loading creates a full sheet overlay with hypnotic balls
 * ------------------------------------------------------------------------
 */
var Loader = function () {

    /**
     * ------------------------------------------------------------------------
     * Constants
     *
     * ------------------------------------------------------------------------
     */
    var Templates = [];
    Templates.push('\n      <div class="sl-container">\n         <style scoped>\n         .simpleLoader {\n             position: fixed;\n             top: 0;\n             left: 0;\n             right: 0;\n             bottom: 0;\n             background: rgba(0, 0, 0, 0.36);\n             z-index: 9999;\n         }\n         .simpleLoader .sl-container {\n             position: absolute;\n             top: 50%;\n             left: 50%;\n             -webkit-transform: translate(-50%, -50%);\n             transform: translate(-50%, -50%);\n         }\n         .simpleLoader .sl-dot {\n             width: 20px;\n             height: 20px;\n             border: 2px solid white;\n             border-radius: 50%;\n             float: left;\n             margin: 0 5px;\n             -webkit-transform: scale(0);\n             transform: scale(0);\n             -webkit-animation: fx 1000ms ease infinite 0ms;\n             animation: fx 1000ms ease infinite 0ms;\n         }\n         .simpleLoader .sl-dot:nth-child(2) {\n             -webkit-animation: fx 1000ms ease infinite 300ms;\n             animation: fx 1000ms ease infinite 300ms;\n         }\n         .simpleLoader .sl-dot:nth-child(3) {\n             -webkit-animation: fx 1000ms ease infinite 600ms;\n             animation: fx 1000ms ease infinite 600ms;\n         }\n         @-webkit-keyframes fx {\n             50% {\n                 -webkit-transform: scale(1);\n                 transform: scale(1);\n                 opacity: 1;\n             }\n             100% {\n                 opacity: 0;\n             }\n         }\n         @keyframes fx {\n             50% {\n                 -webkit-transform: scale(1);\n                 transform: scale(1);\n                 opacity: 1;\n             }\n             100% {\n                 opacity: 0;\n             }\n         }\n         </style>\n         <div class="sl-dot"></div>\n         <div class="sl-dot"></div>\n         <div class="sl-dot"></div>\n       </div>\n     ');

    // Material design circular activity spinner
    // This is the built in chrome spinner and might fail in other browsers
    Templates.push('\n    <div class="loaderWrapper">\n        <svg version="1" xmlns="http://www.w3.org/2000/svg"\n                         xmlns:xlink="http://www.w3.org/1999/xlink"\n             width="25px" height="25px" viewBox="0 0 16 16">\n            <style scoped>\n              .simpleLoader {\n                  position: absolute;\n                  left: 50%;\n                  top: 50%;\n                  transform: translate(-50%, -50%);\n                  z-index: 1000;\n              }\n              .qp-circular-loader {\n                width:16px;  /* 2*RADIUS + STROKEWIDTH */\n                height:16px; /* 2*RADIUS + STROKEWIDTH */\n              }\n              .qp-circular-loader-path {\n                stroke-dasharray: 32.4;  /* 2*RADIUS*PI * ARCSIZE/360 */\n                stroke-dashoffset: 32.4; /* 2*RADIUS*PI * ARCSIZE/360 */\n                                         /* hides things initially */\n              }\n              /* SVG elements seem to have a different default origin */\n              .qp-circular-loader, .qp-circular-loader * {\n                -webkit-transform-origin: 50% 50%;\n              }\n              /* Rotating the whole thing */\n              @-webkit-keyframes rotate {\n                from {transform: rotate(0deg);}\n                to {transform: rotate(360deg);}\n              }\n              .qp-circular-loader {\n                -webkit-animation-name: rotate;\n                -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\n                -webkit-animation-iteration-count: infinite;\n                -webkit-animation-timing-function: linear;\n              }\n              /* Filling and unfilling the arc */\n              @-webkit-keyframes fillunfill {\n                from {\n                  stroke-dashoffset: 32.3 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\n                                          /* 0.1 a bit of a magic constant here */\n                }\n                50% {\n                  stroke-dashoffset: 0;\n                }\n                to {\n                  stroke-dashoffset: -31.9 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\n                                           /* 0.5 a bit of a magic constant here */\n                }\n              }\n              @-webkit-keyframes rot {\n                from {\n                  transform: rotate(0deg);\n                }\n                to {\n                  transform: rotate(-360deg);\n                }\n              }\n              @-webkit-keyframes colors {\n                from {\n                  stroke: #4285f4;\n                }\n                to {\n                  stroke: #4285f4;\n                }\n              }\n              .qp-circular-loader-path {\n                -webkit-animation-name: fillunfill, rot, colors;\n                -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\n                -webkit-animation-iteration-count: infinite, infinite, infinite;\n                -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\n                -webkit-animation-play-state: running, running, running;\n                -webkit-animation-fill-mode: forwards;\n              }\n            </style>\n            <!-- 2.25= STROKEWIDTH -->\n            <!-- 8 = RADIUS + STROKEWIDTH/2 -->\n            <!-- 6.875= RADIUS -->\n            <!-- 1.125=  STROKEWIDTH/2 -->\n            <g class="qp-circular-loader">\n            <path class="qp-circular-loader-path" fill="none"\n                  d="M 8,1.125 A 6.875,6.875 0 1 1 1.125,8" stroke-width="2.25"\n                  stroke-linecap="round"></path>\n            </g>\n            </svg>\n        </div>\n    ');

    var Default = {
        template: '0', // 0 or 1
        parent: document.body,
        allowMany: false
    };

    var Loader = function () {
        function Loader(options) {
            _classCallCheck(this, Loader);

            this.id = 'loader-' + ++this.__proto__.counter;
            this.defaults = Utils.extend(Default, options);
            if (!this.defaults.allowMany) {
                this.__proto__.removeAll();
            }
            this.__proto__.instances[this.id] = this;
            this.createDOM();
        }

        _createClass(Loader, [{
            key: 'createDOM',
            value: function createDOM() {
                var wrapper = document.createElement('div');
                wrapper.id = this.id;
                wrapper.className = 'simpleLoader';
                wrapper.innerHTML = Templates[this.defaults.template];
                this.defaults.parent.appendChild(wrapper);
            }
        }, {
            key: 'remove',
            value: function remove() {
                var loader = document.querySelector('#' + this.id);
                loader.parentNode.removeChild(loader);
                delete this.__proto__.instances[this.id];
            }
        }]);

        return Loader;
    }();

    return Loader;
}();
Loader.prototype.instances = {};
Loader.prototype.counter = 0;
Loader.prototype.removeAll = function () {
    Utils.foreach(this.instances, function (item) {
        try {
            item.remove();
        } catch (err) {
            //pass
        }
    });
    this.instances.length = 0;
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ------------------------------------------------------------------------
 * Simple Backdrop
 * ------------------------------------------------------------------------
 */
var Backdrop = function () {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var STYLES = '\n    .ghost-backdrop {\n        position: fixed;\n        top: 0;\n        right: 0;\n        bottom: 0;\n        left: 0;\n        z-index: 1040;\n        background-color: #000;\n        opacity: 0;\n        transition: ease all 0.5s;\n    }\n     ';

    var Default = {
        removeDelay: 0,
        'zIndex': 2001,
        allowMany: false,
        closeOnClick: true };

    var Backdrop = function () {
        function Backdrop(options) {
            _classCallCheck(this, Backdrop);

            this.defaults = Utils.extend(Default, options);
            if (this.__proto__.instances.length && !this.defaults.allowMany) {
                return;
            }
            this.__proto__.instances.push(this);

            this.injectStyles();
            this.createDOM();
        }
        // getters


        _createClass(Backdrop, [{
            key: 'injectStyles',
            value: function injectStyles() {
                //if styles exists do nothing
                if (document.getElementById('backdropStyles')) return;
                var tag = document.createElement('style');
                tag.type = 'text/css';
                tag.id = 'backdropStyles';
                if (tag.styleSheet) {
                    tag.styleSheet.cssText = STYLES;
                } else {
                    tag.appendChild(document.createTextNode(STYLES));
                }
                document.getElementsByTagName('head')[0].appendChild(tag);
            }
        }, {
            key: 'createDOM',
            value: function createDOM() {
                // remove on click or not
                var ev = this.defaults.closeOnClick ? { click: this.__proto__.removeAll.bind(this) } : {};
                var elm = new Elm('div.ghost-backdrop', ev, document.body);
                elm.style.zIndex = this.defaults.zIndex;

                setTimeout(function () {
                    elm.style.opacity = 0.5;
                });
            }
        }, {
            key: 'remove',
            value: function remove() {
                setTimeout(function () {
                    var backdrops = document.querySelectorAll('.ghost-backdrop');

                    var _loop = function _loop() {
                        console.log('i', i);
                        var elm = backdrops[i];
                        elm.style.opacity = 0;
                        setTimeout(function () {
                            console.log(elm);
                            elm.parentNode.removeChild(elm);
                        }, 500);
                    };

                    for (var i = 0; i < backdrops.length; i++) {
                        _loop();
                    }
                }, this.defaults.removeDelay);
            }
        }, {
            key: 'STYLES',
            get: function get() {
                return STYLES;
            }
        }]);

        return Backdrop;
    }();

    Backdrop.prototype.instances = [];
    Backdrop.prototype.removeAll = function () {
        this.instances.forEach(function (item) {
            item.remove();
        });
        this.instances.length = 0;
    };
    return Backdrop;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ------------------------------------------------------------------------
 * Image preloader
 * example:
 *
 * a = new Preloader([
 * 'https://stopiniceland.is/icloud/images/bokundev/87l1477058801.jpeg?size=550x_',
 * 'https://stopiniceland.is/icloud/images/bokundev/37l1477058511.jpeg?size=550x_',
 * 'https://stopiniceland.is/icloud/images/bokundev/181l1477059083.jpeg?size=550x_'
 * ]);
 *
 * a.on('each', function(rsp) {console.log(rsp)})
 * a.on('done', function(rsp){ console.log(rsp)});
 * ------------------------------------------------------------------------
 */

var Preloader = function () {
    var Preloader = function (_Emitter) {
        _inherits(Preloader, _Emitter);

        function Preloader(pathList, options) {
            _classCallCheck(this, Preloader);

            var _this = _possibleConstructorReturn(this, (Preloader.__proto__ || Object.getPrototypeOf(Preloader)).call(this));

            _this.defaults = {
                prefix: null
            };
            _.extend(_this.defaults, options);

            _this.pathList = pathList;
            _this.loadedImages = [];
            _this.total = _this.pathList.length;
            _this.counter = 0;
            _this.percent = 0;

            _this.loadImages();
            return _this;
        }

        _createClass(Preloader, [{
            key: 'loadImages',
            value: function loadImages() {
                var _this2 = this;

                var self = this;
                for (var i = 0; i < this.pathList.length; i++) {
                    try {
                        var img = this.loadedImages[i] = document.createElement('img');
                        if (this.defaults.prefix) {
                            //add trailing slash if doesn't exists
                            var prefix = this.defaults.prefix.replace(/\/?$/, '/');
                        } else {
                            prefix = '';
                        }

                        img.onload = function () {
                            _this2.counter++;
                            _this2.percent = _this2.counter / _this2.total * 100;

                            _this2.trigger('each', _this2.counter, _this2.percent);
                            if (_this2.counter === _this2.total) {
                                _this2.trigger('done', _this2.loadedImages);
                            }
                        };

                        img.onerror = function (err) {
                            //prevent component from stoping if last image is not found
                            _this2.counter++;
                            if (_this2.total === _this2.counter) {
                                _this2.trigger('each', _this2.counter, 100);
                                _this2.trigger('done', _this2.loadedImages);
                            }
                        };
                        img.src = prefix + this.pathList[i];
                    } catch (err) {
                        console.warn(err);
                    }
                }
            }
        }]);

        return Preloader;
    }(Emitter);

    return Preloader;
}();