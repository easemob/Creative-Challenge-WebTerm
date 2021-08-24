"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
var CellData_1 = require("common/buffer/CellData");
var Terminal_1 = require("../Terminal");
var Strings = require("../LocalizableStrings");
var EventEmitter_1 = require("common/EventEmitter");
var AddonManager_1 = require("./AddonManager");
var Terminal = (function () {
    function Terminal(options) {
        this._core = new Terminal_1.Terminal(options);
        this._addonManager = new AddonManager_1.AddonManager();
    }
    Terminal.prototype._checkProposedApi = function () {
        if (!this._core.optionsService.options.allowProposedApi) {
            throw new Error('You must set the allowProposedApi option to true to use proposed API');
        }
    };
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._core.onCursorMove; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onLineFeed", {
        get: function () { return this._core.onLineFeed; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._core.onSelectionChange; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onData", {
        get: function () { return this._core.onData; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBinary", {
        get: function () { return this._core.onBinary; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._core.onTitleChange; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBell", {
        get: function () { return this._core.onBell; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onScroll", {
        get: function () { return this._core.onScroll; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._core.onKey; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._core.onRender; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onResize", {
        get: function () { return this._core.onResize; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "element", {
        get: function () { return this._core.element; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "parser", {
        get: function () {
            this._checkProposedApi();
            if (!this._parser) {
                this._parser = new ParserApi(this._core);
            }
            return this._parser;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "unicode", {
        get: function () {
            this._checkProposedApi();
            return new UnicodeApi(this._core);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "textarea", {
        get: function () { return this._core.textarea; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "rows", {
        get: function () { return this._core.rows; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "cols", {
        get: function () { return this._core.cols; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () {
            this._checkProposedApi();
            if (!this._buffer) {
                this._buffer = new BufferNamespaceApi(this._core);
            }
            return this._buffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () {
            this._checkProposedApi();
            return this._core.markers;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.blur = function () {
        this._core.blur();
    };
    Terminal.prototype.focus = function () {
        this._core.focus();
    };
    Terminal.prototype.resize = function (columns, rows) {
        this._verifyIntegers(columns, rows);
        this._core.resize(columns, rows);
    };
    Terminal.prototype.open = function (parent) {
        this._core.open(parent);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._core.attachCustomKeyEventHandler(customKeyEventHandler);
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        this._checkProposedApi();
        return this._core.registerLinkMatcher(regex, handler, options);
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        this._checkProposedApi();
        this._core.deregisterLinkMatcher(matcherId);
    };
    Terminal.prototype.registerLinkProvider = function (linkProvider) {
        this._checkProposedApi();
        return this._core.registerLinkProvider(linkProvider);
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        this._checkProposedApi();
        return this._core.registerCharacterJoiner(handler);
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        this._checkProposedApi();
        this._core.deregisterCharacterJoiner(joinerId);
    };
    Terminal.prototype.registerMarker = function (cursorYOffset) {
        this._checkProposedApi();
        this._verifyIntegers(cursorYOffset);
        return this._core.addMarker(cursorYOffset);
    };
    Terminal.prototype.addMarker = function (cursorYOffset) {
        return this.registerMarker(cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._core.hasSelection();
    };
    Terminal.prototype.select = function (column, row, length) {
        this._verifyIntegers(column, row, length);
        this._core.select(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._core.getSelection();
    };
    Terminal.prototype.getSelectionPosition = function () {
        return this._core.getSelectionPosition();
    };
    Terminal.prototype.clearSelection = function () {
        this._core.clearSelection();
    };
    Terminal.prototype.selectAll = function () {
        this._core.selectAll();
    };
    Terminal.prototype.selectLines = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.selectLines(start, end);
    };
    Terminal.prototype.dispose = function () {
        this._addonManager.dispose();
        this._core.dispose();
    };
    Terminal.prototype.scrollLines = function (amount) {
        this._verifyIntegers(amount);
        this._core.scrollLines(amount);
    };
    Terminal.prototype.scrollPages = function (pageCount) {
        this._verifyIntegers(pageCount);
        this._core.scrollPages(pageCount);
    };
    Terminal.prototype.scrollToTop = function () {
        this._core.scrollToTop();
    };
    Terminal.prototype.scrollToBottom = function () {
        this._core.scrollToBottom();
    };
    Terminal.prototype.scrollToLine = function (line) {
        this._verifyIntegers(line);
        this._core.scrollToLine(line);
    };
    Terminal.prototype.clear = function () {
        this._core.clear();
    };
    Terminal.prototype.write = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeUtf8 = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeln = function (data, callback) {
        this._core.write(data);
        this._core.write('\r\n', callback);
    };
    Terminal.prototype.paste = function (data) {
        this._core.paste(data);
    };
    Terminal.prototype.getOption = function (key) {
        return this._core.optionsService.getOption(key);
    };
    Terminal.prototype.setOption = function (key, value) {
        this._core.optionsService.setOption(key, value);
    };
    Terminal.prototype.refresh = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.refresh(start, end);
    };
    Terminal.prototype.reset = function () {
        this._core.reset();
    };
    Terminal.prototype.loadAddon = function (addon) {
        return this._addonManager.loadAddon(this, addon);
    };
    Object.defineProperty(Terminal, "strings", {
        get: function () {
            return Strings;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype._verifyIntegers = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            if (value === Infinity || isNaN(value) || value % 1 !== 0) {
                throw new Error('This API only accepts integers');
            }
        }
    };
    return Terminal;
}());
exports.Terminal = Terminal;
var BufferApiView = (function () {
    function BufferApiView(_buffer, type) {
        this._buffer = _buffer;
        this.type = type;
    }
    BufferApiView.prototype.init = function (buffer) {
        this._buffer = buffer;
        return this;
    };
    Object.defineProperty(BufferApiView.prototype, "cursorY", {
        get: function () { return this._buffer.y; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "cursorX", {
        get: function () { return this._buffer.x; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "viewportY", {
        get: function () { return this._buffer.ydisp; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "baseY", {
        get: function () { return this._buffer.ybase; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "length", {
        get: function () { return this._buffer.lines.length; },
        enumerable: false,
        configurable: true
    });
    BufferApiView.prototype.getLine = function (y) {
        var line = this._buffer.lines.get(y);
        if (!line) {
            return undefined;
        }
        return new BufferLineApiView(line);
    };
    BufferApiView.prototype.getNullCell = function () { return new CellData_1.CellData(); };
    return BufferApiView;
}());
var BufferNamespaceApi = (function () {
    function BufferNamespaceApi(_core) {
        var _this = this;
        this._core = _core;
        this._onBufferChange = new EventEmitter_1.EventEmitter();
        this._normal = new BufferApiView(this._core.buffers.normal, 'normal');
        this._alternate = new BufferApiView(this._core.buffers.alt, 'alternate');
        this._core.buffers.onBufferActivate(function () { return _this._onBufferChange.fire(_this.active); });
    }
    Object.defineProperty(BufferNamespaceApi.prototype, "onBufferChange", {
        get: function () { return this._onBufferChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "active", {
        get: function () {
            if (this._core.buffers.active === this._core.buffers.normal) {
                return this.normal;
            }
            if (this._core.buffers.active === this._core.buffers.alt) {
                return this.alternate;
            }
            throw new Error('Active buffer is neither normal nor alternate');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "normal", {
        get: function () {
            return this._normal.init(this._core.buffers.normal);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "alternate", {
        get: function () {
            return this._alternate.init(this._core.buffers.alt);
        },
        enumerable: false,
        configurable: true
    });
    return BufferNamespaceApi;
}());
var BufferLineApiView = (function () {
    function BufferLineApiView(_line) {
        this._line = _line;
    }
    Object.defineProperty(BufferLineApiView.prototype, "isWrapped", {
        get: function () { return this._line.isWrapped; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferLineApiView.prototype, "length", {
        get: function () { return this._line.length; },
        enumerable: false,
        configurable: true
    });
    BufferLineApiView.prototype.getCell = function (x, cell) {
        if (x < 0 || x >= this._line.length) {
            return undefined;
        }
        if (cell) {
            this._line.loadCell(x, cell);
            return cell;
        }
        return this._line.loadCell(x, new CellData_1.CellData());
    };
    BufferLineApiView.prototype.translateToString = function (trimRight, startColumn, endColumn) {
        return this._line.translateToString(trimRight, startColumn, endColumn);
    };
    return BufferLineApiView;
}());
var ParserApi = (function () {
    function ParserApi(_core) {
        this._core = _core;
    }
    ParserApi.prototype.registerCsiHandler = function (id, callback) {
        return this._core.registerCsiHandler(id, function (params) { return callback(params.toArray()); });
    };
    ParserApi.prototype.addCsiHandler = function (id, callback) {
        return this.registerCsiHandler(id, callback);
    };
    ParserApi.prototype.registerDcsHandler = function (id, callback) {
        return this._core.registerDcsHandler(id, function (data, params) { return callback(data, params.toArray()); });
    };
    ParserApi.prototype.addDcsHandler = function (id, callback) {
        return this.registerDcsHandler(id, callback);
    };
    ParserApi.prototype.registerEscHandler = function (id, handler) {
        return this._core.registerEscHandler(id, handler);
    };
    ParserApi.prototype.addEscHandler = function (id, handler) {
        return this.registerEscHandler(id, handler);
    };
    ParserApi.prototype.registerOscHandler = function (ident, callback) {
        return this._core.registerOscHandler(ident, callback);
    };
    ParserApi.prototype.addOscHandler = function (ident, callback) {
        return this.registerOscHandler(ident, callback);
    };
    return ParserApi;
}());
var UnicodeApi = (function () {
    function UnicodeApi(_core) {
        this._core = _core;
    }
    UnicodeApi.prototype.register = function (provider) {
        this._core.unicodeService.register(provider);
    };
    Object.defineProperty(UnicodeApi.prototype, "versions", {
        get: function () {
            return this._core.unicodeService.versions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnicodeApi.prototype, "activeVersion", {
        get: function () {
            return this._core.unicodeService.activeVersion;
        },
        set: function (version) {
            this._core.unicodeService.activeVersion = version;
        },
        enumerable: false,
        configurable: true
    });
    return UnicodeApi;
}());
//# sourceMappingURL=Terminal.js.map