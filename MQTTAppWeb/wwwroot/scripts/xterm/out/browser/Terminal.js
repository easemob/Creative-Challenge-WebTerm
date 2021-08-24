"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
var CompositionHelper_1 = require("browser/input/CompositionHelper");
var Viewport_1 = require("browser/Viewport");
var Clipboard_1 = require("browser/Clipboard");
var EscapeSequences_1 = require("common/data/EscapeSequences");
var InputHandler_1 = require("../common/InputHandler");
var Renderer_1 = require("browser/renderer/Renderer");
var Linkifier_1 = require("browser/Linkifier");
var SelectionService_1 = require("browser/services/SelectionService");
var Browser = require("common/Platform");
var Lifecycle_1 = require("browser/Lifecycle");
var Strings = require("browser/LocalizableStrings");
var SoundService_1 = require("browser/services/SoundService");
var MouseZoneManager_1 = require("browser/MouseZoneManager");
var AccessibilityManager_1 = require("./AccessibilityManager");
var DomRenderer_1 = require("browser/renderer/dom/DomRenderer");
var Keyboard_1 = require("common/input/Keyboard");
var EventEmitter_1 = require("common/EventEmitter");
var BufferLine_1 = require("common/buffer/BufferLine");
var ColorManager_1 = require("browser/ColorManager");
var RenderService_1 = require("browser/services/RenderService");
var Services_1 = require("browser/services/Services");
var CharSizeService_1 = require("browser/services/CharSizeService");
var MouseService_1 = require("browser/services/MouseService");
var Linkifier2_1 = require("browser/Linkifier2");
var CoreBrowserService_1 = require("browser/services/CoreBrowserService");
var CoreTerminal_1 = require("common/CoreTerminal");
var Color_1 = require("browser/Color");
var CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
var document = (typeof window !== 'undefined') ? window.document : null;
var Terminal = (function (_super) {
    __extends(Terminal, _super);
    function Terminal(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.browser = Browser;
        _this._keyDownHandled = false;
        _this._onCursorMove = new EventEmitter_1.EventEmitter();
        _this._onKey = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onSelectionChange = new EventEmitter_1.EventEmitter();
        _this._onTitleChange = new EventEmitter_1.EventEmitter();
        _this._onBell = new EventEmitter_1.EventEmitter();
        _this._onFocus = new EventEmitter_1.EventEmitter();
        _this._onBlur = new EventEmitter_1.EventEmitter();
        _this._onA11yCharEmitter = new EventEmitter_1.EventEmitter();
        _this._onA11yTabEmitter = new EventEmitter_1.EventEmitter();
        _this._setup();
        _this.linkifier = _this._instantiationService.createInstance(Linkifier_1.Linkifier);
        _this.linkifier2 = _this.register(_this._instantiationService.createInstance(Linkifier2_1.Linkifier2));
        _this.register(_this._inputHandler.onRequestBell(function () { return _this.bell(); }));
        _this.register(_this._inputHandler.onRequestRefreshRows(function (start, end) { return _this.refresh(start, end); }));
        _this.register(_this._inputHandler.onRequestReset(function () { return _this.reset(); }));
        _this.register(_this._inputHandler.onRequestWindowsOptionsReport(function (type) { return _this._reportWindowsOptions(type); }));
        _this.register(_this._inputHandler.onAnsiColorChange(function (event) { return _this._changeAnsiColor(event); }));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onCursorMove, _this._onCursorMove));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onTitleChange, _this._onTitleChange));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onA11yChar, _this._onA11yCharEmitter));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onA11yTab, _this._onA11yTabEmitter));
        _this.register(_this._bufferService.onResize(function (e) { return _this._afterResize(e.cols, e.rows); }));
        return _this;
    }
    Object.defineProperty(Terminal.prototype, "options", {
        get: function () { return this.optionsService.options; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._onCursorMove.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._onKey.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._onRender.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._onTitleChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBell", {
        get: function () { return this._onBell.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onFocus", {
        get: function () { return this._onFocus.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBlur", {
        get: function () { return this._onBlur.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yChar", {
        get: function () { return this._onA11yCharEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yTab", {
        get: function () { return this._onA11yTabEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype._changeAnsiColor = function (event) {
        var _a, _b;
        if (!this._colorManager) {
            return;
        }
        for (var _i = 0, _c = event.colors; _i < _c.length; _i++) {
            var ansiColor = _c[_i];
            var color = Color_1.rgba.toColor(ansiColor.red, ansiColor.green, ansiColor.blue);
            this._colorManager.colors.ansi[ansiColor.colorIndex] = color;
        }
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.setColors(this._colorManager.colors);
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.onThemeChange(this._colorManager.colors);
    };
    Terminal.prototype.dispose = function () {
        var _a, _b, _c;
        if (this._isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.dispose();
        this._customKeyEventHandler = undefined;
        this.write = function () { };
        (_c = (_b = this.element) === null || _b === void 0 ? void 0 : _b.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(this.element);
    };
    Terminal.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._customKeyEventHandler = undefined;
    };
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () {
            return this.buffers.active;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.focus = function () {
        if (this.textarea) {
            this.textarea.focus({ preventScroll: true });
        }
    };
    Terminal.prototype._updateOptions = function (key) {
        var _a, _b, _c, _d;
        _super.prototype._updateOptions.call(this, key);
        switch (key) {
            case 'fontFamily':
            case 'fontSize':
                (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.clear();
                (_b = this._charSizeService) === null || _b === void 0 ? void 0 : _b.measure();
                break;
            case 'cursorBlink':
            case 'cursorStyle':
                this.refresh(this.buffer.y, this.buffer.y);
                break;
            case 'drawBoldTextInBrightColors':
            case 'letterSpacing':
            case 'lineHeight':
            case 'fontWeight':
            case 'fontWeightBold':
            case 'minimumContrastRatio':
                if (this._renderService) {
                    this._renderService.clear();
                    this._renderService.onResize(this.cols, this.rows);
                    this.refresh(0, this.rows - 1);
                }
                break;
            case 'rendererType':
                if (this._renderService) {
                    this._renderService.setRenderer(this._createRenderer());
                    this._renderService.onResize(this.cols, this.rows);
                }
                break;
            case 'scrollback':
                (_c = this.viewport) === null || _c === void 0 ? void 0 : _c.syncScrollArea();
                break;
            case 'screenReaderMode':
                if (this.optionsService.options.screenReaderMode) {
                    if (!this._accessibilityManager && this._renderService) {
                        this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(this, this._renderService);
                    }
                }
                else {
                    (_d = this._accessibilityManager) === null || _d === void 0 ? void 0 : _d.dispose();
                    this._accessibilityManager = undefined;
                }
                break;
            case 'tabStopWidth':
                this.buffers.setupTabStops();
                break;
            case 'theme':
                this._setTheme(this.optionsService.options.theme);
                break;
        }
    };
    Terminal.prototype._onTextAreaFocus = function (ev) {
        if (this._coreService.decPrivateModes.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[I');
        }
        this.updateCursorStyle(ev);
        this.element.classList.add('focus');
        this._showCursor();
        this._onFocus.fire();
    };
    Terminal.prototype.blur = function () {
        var _a;
        return (_a = this.textarea) === null || _a === void 0 ? void 0 : _a.blur();
    };
    Terminal.prototype._onTextAreaBlur = function () {
        this.textarea.value = '';
        this.refresh(this.buffer.y, this.buffer.y);
        if (this._coreService.decPrivateModes.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[O');
        }
        this.element.classList.remove('focus');
        this._onBlur.fire();
    };
    Terminal.prototype._syncTextArea = function () {
        if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) {
            return;
        }
        var cursorY = this.buffer.ybase + this.buffer.y;
        var bufferLine = this.buffer.lines.get(cursorY);
        if (!bufferLine) {
            return;
        }
        var cursorX = Math.min(this.buffer.x, this.cols - 1);
        var cellHeight = this._renderService.dimensions.actualCellHeight;
        var width = bufferLine.getWidth(cursorX);
        var cellWidth = this._renderService.dimensions.actualCellWidth * width;
        var cursorTop = this.buffer.y * this._renderService.dimensions.actualCellHeight;
        var cursorLeft = cursorX * this._renderService.dimensions.actualCellWidth;
        this.textarea.style.left = cursorLeft + 'px';
        this.textarea.style.top = cursorTop + 'px';
        this.textarea.style.width = cellWidth + 'px';
        this.textarea.style.height = cellHeight + 'px';
        this.textarea.style.lineHeight = cellHeight + 'px';
        this.textarea.style.zIndex = '-5';
    };
    Terminal.prototype._initGlobal = function () {
        var _this = this;
        this._bindKeys();
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'copy', function (event) {
            if (!_this.hasSelection()) {
                return;
            }
            Clipboard_1.copyHandler(event, _this._selectionService);
        }));
        var pasteHandlerWrapper = function (event) { return Clipboard_1.handlePasteEvent(event, _this.textarea, _this._coreService); };
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'paste', pasteHandlerWrapper));
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'paste', pasteHandlerWrapper));
        if (Browser.isFirefox) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (event) {
                if (event.button === 2) {
                    Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
                }
            }));
        }
        else {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'contextmenu', function (event) {
                Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
            }));
        }
        if (Browser.isLinux) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'auxclick', function (event) {
                if (event.button === 1) {
                    Clipboard_1.moveTextAreaUnderMouseCursor(event, _this.textarea, _this.screenElement);
                }
            }));
        }
    };
    Terminal.prototype._bindKeys = function () {
        var _this = this;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keyup', function (ev) { return _this._keyUp(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keydown', function (ev) { return _this._keyDown(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keypress', function (ev) { return _this._keyPress(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionstart', function () { return _this._compositionHelper.compositionstart(); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionupdate', function (e) { return _this._compositionHelper.compositionupdate(e); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionend', function () { return _this._compositionHelper.compositionend(); }));
        this.register(this.onRender(function () { return _this._compositionHelper.updateCompositionElements(); }));
        this.register(this.onRender(function (e) { return _this._queueLinkification(e.start, e.end); }));
    };
    Terminal.prototype.open = function (parent) {
        var _this = this;
        if (!parent) {
            throw new Error('Terminal requires a parent element.');
        }
        if (!parent.isConnected) {
            this._logService.debug('Terminal.open was called on an element that was not attached to the DOM');
        }
        this._document = parent.ownerDocument;
        this.element = this._document.createElement('div');
        this.element.dir = 'ltr';
        this.element.classList.add('terminal');
        this.element.classList.add('xterm');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'document');
        parent.appendChild(this.element);
        var fragment = document.createDocumentFragment();
        this._viewportElement = document.createElement('div');
        this._viewportElement.classList.add('xterm-viewport');
        fragment.appendChild(this._viewportElement);
        this._viewportScrollArea = document.createElement('div');
        this._viewportScrollArea.classList.add('xterm-scroll-area');
        this._viewportElement.appendChild(this._viewportScrollArea);
        this.screenElement = document.createElement('div');
        this.screenElement.classList.add('xterm-screen');
        this._helperContainer = document.createElement('div');
        this._helperContainer.classList.add('xterm-helpers');
        this.screenElement.appendChild(this._helperContainer);
        fragment.appendChild(this.screenElement);
        this.textarea = document.createElement('textarea');
        this.textarea.classList.add('xterm-helper-textarea');
        this.textarea.setAttribute('aria-label', Strings.promptLabel);
        this.textarea.setAttribute('aria-multiline', 'false');
        this.textarea.setAttribute('autocorrect', 'off');
        this.textarea.setAttribute('autocapitalize', 'off');
        this.textarea.setAttribute('spellcheck', 'false');
        this.textarea.tabIndex = 0;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'focus', function (ev) { return _this._onTextAreaFocus(ev); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'blur', function () { return _this._onTextAreaBlur(); }));
        this._helperContainer.appendChild(this.textarea);
        var coreBrowserService = this._instantiationService.createInstance(CoreBrowserService_1.CoreBrowserService, this.textarea);
        this._instantiationService.setService(Services_1.ICoreBrowserService, coreBrowserService);
        this._charSizeService = this._instantiationService.createInstance(CharSizeService_1.CharSizeService, this._document, this._helperContainer);
        this._instantiationService.setService(Services_1.ICharSizeService, this._charSizeService);
        this._theme = this.options.theme || this._theme;
        this._colorManager = new ColorManager_1.ColorManager(document, this.options.allowTransparency);
        this.register(this.optionsService.onOptionChange(function (e) { return _this._colorManager.onOptionsChange(e); }));
        this._colorManager.setTheme(this._theme);
        this._characterJoinerService = this._instantiationService.createInstance(CharacterJoinerService_1.CharacterJoinerService);
        this._instantiationService.setService(Services_1.ICharacterJoinerService, this._characterJoinerService);
        var renderer = this._createRenderer();
        this._renderService = this.register(this._instantiationService.createInstance(RenderService_1.RenderService, renderer, this.rows, this.screenElement));
        this._instantiationService.setService(Services_1.IRenderService, this._renderService);
        this.register(this._renderService.onRenderedBufferChange(function (e) { return _this._onRender.fire(e); }));
        this.onResize(function (e) { return _this._renderService.resize(e.cols, e.rows); });
        this._compositionView = document.createElement('div');
        this._compositionView.classList.add('composition-view');
        this._compositionHelper = this._instantiationService.createInstance(CompositionHelper_1.CompositionHelper, this.textarea, this._compositionView);
        this._helperContainer.appendChild(this._compositionView);
        this.element.appendChild(fragment);
        this._soundService = this._instantiationService.createInstance(SoundService_1.SoundService);
        this._instantiationService.setService(Services_1.ISoundService, this._soundService);
        this._mouseService = this._instantiationService.createInstance(MouseService_1.MouseService);
        this._instantiationService.setService(Services_1.IMouseService, this._mouseService);
        this.viewport = this._instantiationService.createInstance(Viewport_1.Viewport, function (amount) { return _this.scrollLines(amount, true, 1); }, this._viewportElement, this._viewportScrollArea);
        this.viewport.onThemeChange(this._colorManager.colors);
        this.register(this._inputHandler.onRequestSyncScrollBar(function () { return _this.viewport.syncScrollArea(); }));
        this.register(this.viewport);
        this.register(this.onCursorMove(function () {
            _this._renderService.onCursorMove();
            _this._syncTextArea();
        }));
        this.register(this.onResize(function () { return _this._renderService.onResize(_this.cols, _this.rows); }));
        this.register(this.onBlur(function () { return _this._renderService.onBlur(); }));
        this.register(this.onFocus(function () { return _this._renderService.onFocus(); }));
        this.register(this._renderService.onDimensionsChange(function () { return _this.viewport.syncScrollArea(); }));
        this._selectionService = this.register(this._instantiationService.createInstance(SelectionService_1.SelectionService, this.element, this.screenElement, this.linkifier2));
        this._instantiationService.setService(Services_1.ISelectionService, this._selectionService);
        this.register(this._selectionService.onRequestScrollLines(function (e) { return _this.scrollLines(e.amount, e.suppressScrollEvent); }));
        this.register(this._selectionService.onSelectionChange(function () { return _this._onSelectionChange.fire(); }));
        this.register(this._selectionService.onRequestRedraw(function (e) { return _this._renderService.onSelectionChanged(e.start, e.end, e.columnSelectMode); }));
        this.register(this._selectionService.onLinuxMouseSelection(function (text) {
            _this.textarea.value = text;
            _this.textarea.focus();
            _this.textarea.select();
        }));
        this.register(this._onScroll.event(function (ev) {
            _this.viewport.syncScrollArea();
            _this._selectionService.refresh();
        }));
        this.register(Lifecycle_1.addDisposableDomListener(this._viewportElement, 'scroll', function () { return _this._selectionService.refresh(); }));
        this._mouseZoneManager = this._instantiationService.createInstance(MouseZoneManager_1.MouseZoneManager, this.element, this.screenElement);
        this.register(this._mouseZoneManager);
        this.register(this.onScroll(function () { return _this._mouseZoneManager.clearAll(); }));
        this.linkifier.attachToDom(this.element, this._mouseZoneManager);
        this.linkifier2.attachToDom(this.element, this._mouseService, this._renderService);
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (e) { return _this._selectionService.onMouseDown(e); }));
        if (this._coreMouseService.areMouseEventsActive) {
            this._selectionService.disable();
            this.element.classList.add('enable-mouse-events');
        }
        else {
            this._selectionService.enable();
        }
        if (this.options.screenReaderMode) {
            this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(this, this._renderService);
        }
        this._charSizeService.measure();
        this.refresh(0, this.rows - 1);
        this._initGlobal();
        this.bindMouse();
    };
    Terminal.prototype._createRenderer = function () {
        switch (this.options.rendererType) {
            case 'canvas': return this._instantiationService.createInstance(Renderer_1.Renderer, this._colorManager.colors, this.screenElement, this.linkifier, this.linkifier2);
            case 'dom': return this._instantiationService.createInstance(DomRenderer_1.DomRenderer, this._colorManager.colors, this.element, this.screenElement, this._viewportElement, this.linkifier, this.linkifier2);
            default: throw new Error("Unrecognized rendererType \"" + this.options.rendererType + "\"");
        }
    };
    Terminal.prototype._setTheme = function (theme) {
        var _a, _b, _c;
        this._theme = theme;
        (_a = this._colorManager) === null || _a === void 0 ? void 0 : _a.setTheme(theme);
        (_b = this._renderService) === null || _b === void 0 ? void 0 : _b.setColors(this._colorManager.colors);
        (_c = this.viewport) === null || _c === void 0 ? void 0 : _c.onThemeChange(this._colorManager.colors);
    };
    Terminal.prototype.bindMouse = function () {
        var _this = this;
        var self = this;
        var el = this.element;
        function sendEvent(ev) {
            var pos = self._mouseService.getRawByteCoords(ev, self.screenElement, self.cols, self.rows);
            if (!pos) {
                return false;
            }
            var but;
            var action;
            switch (ev.overrideType || ev.type) {
                case 'mousemove':
                    action = 32;
                    if (ev.buttons === undefined) {
                        but = 3;
                        if (ev.button !== undefined) {
                            but = ev.button < 3 ? ev.button : 3;
                        }
                    }
                    else {
                        but = ev.buttons & 1 ? 0 :
                            ev.buttons & 4 ? 1 :
                                ev.buttons & 2 ? 2 :
                                    3;
                    }
                    break;
                case 'mouseup':
                    action = 0;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'mousedown':
                    action = 1;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'wheel':
                    if (ev.deltaY !== 0) {
                        action = ev.deltaY < 0 ? 0 : 1;
                    }
                    but = 4;
                    break;
                default:
                    return false;
            }
            if (action === undefined || but === undefined || but > 4) {
                return false;
            }
            return self._coreMouseService.triggerMouseEvent({
                col: pos.x - 33,
                row: pos.y - 33,
                button: but,
                action: action,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                shift: ev.shiftKey
            });
        }
        var requestedEvents = {
            mouseup: null,
            wheel: null,
            mousedrag: null,
            mousemove: null
        };
        var eventListeners = {
            mouseup: function (ev) {
                sendEvent(ev);
                if (!ev.buttons) {
                    _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                    if (requestedEvents.mousedrag) {
                        _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                    }
                }
                return _this.cancel(ev);
            },
            wheel: function (ev) {
                sendEvent(ev);
                ev.preventDefault();
                return _this.cancel(ev);
            },
            mousedrag: function (ev) {
                if (ev.buttons) {
                    sendEvent(ev);
                }
            },
            mousemove: function (ev) {
                if (!ev.buttons) {
                    sendEvent(ev);
                }
            }
        };
        this.register(this._coreMouseService.onProtocolChange(function (events) {
            if (events) {
                if (_this.optionsService.options.logLevel === 'debug') {
                    _this._logService.debug('Binding to mouse events:', _this._coreMouseService.explainEvents(events));
                }
                _this.element.classList.add('enable-mouse-events');
                _this._selectionService.disable();
            }
            else {
                _this._logService.debug('Unbinding from mouse events.');
                _this.element.classList.remove('enable-mouse-events');
                _this._selectionService.enable();
            }
            if (!(events & 8)) {
                el.removeEventListener('mousemove', requestedEvents.mousemove);
                requestedEvents.mousemove = null;
            }
            else if (!requestedEvents.mousemove) {
                el.addEventListener('mousemove', eventListeners.mousemove);
                requestedEvents.mousemove = eventListeners.mousemove;
            }
            if (!(events & 16)) {
                el.removeEventListener('wheel', requestedEvents.wheel);
                requestedEvents.wheel = null;
            }
            else if (!requestedEvents.wheel) {
                el.addEventListener('wheel', eventListeners.wheel, { passive: false });
                requestedEvents.wheel = eventListeners.wheel;
            }
            if (!(events & 2)) {
                _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                requestedEvents.mouseup = null;
            }
            else if (!requestedEvents.mouseup) {
                requestedEvents.mouseup = eventListeners.mouseup;
            }
            if (!(events & 4)) {
                _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                requestedEvents.mousedrag = null;
            }
            else if (!requestedEvents.mousedrag) {
                requestedEvents.mousedrag = eventListeners.mousedrag;
            }
        }));
        this._coreMouseService.activeProtocol = this._coreMouseService.activeProtocol;
        this.register(Lifecycle_1.addDisposableDomListener(el, 'mousedown', function (ev) {
            ev.preventDefault();
            _this.focus();
            if (!_this._coreMouseService.areMouseEventsActive || _this._selectionService.shouldForceSelection(ev)) {
                return;
            }
            sendEvent(ev);
            if (requestedEvents.mouseup) {
                _this._document.addEventListener('mouseup', requestedEvents.mouseup);
            }
            if (requestedEvents.mousedrag) {
                _this._document.addEventListener('mousemove', requestedEvents.mousedrag);
            }
            return _this.cancel(ev);
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (!requestedEvents.wheel) {
                if (!_this.buffer.hasScrollback) {
                    var amount = _this.viewport.getLinesScrolled(ev);
                    if (amount === 0) {
                        return;
                    }
                    var sequence = EscapeSequences_1.C0.ESC + (_this._coreService.decPrivateModes.applicationCursorKeys ? 'O' : '[') + (ev.deltaY < 0 ? 'A' : 'B');
                    var data = '';
                    for (var i = 0; i < Math.abs(amount); i++) {
                        data += sequence;
                    }
                    _this._coreService.triggerDataEvent(data, true);
                }
                return;
            }
        }, { passive: true }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (requestedEvents.wheel)
                return;
            if (!_this.viewport.onWheel(ev)) {
                return _this.cancel(ev);
            }
        }, { passive: false }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchstart', function (ev) {
            if (_this._coreMouseService.areMouseEventsActive)
                return;
            _this.viewport.onTouchStart(ev);
            return _this.cancel(ev);
        }, { passive: true }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchmove', function (ev) {
            if (_this._coreMouseService.areMouseEventsActive)
                return;
            if (!_this.viewport.onTouchMove(ev)) {
                return _this.cancel(ev);
            }
        }, { passive: false }));
    };
    Terminal.prototype.refresh = function (start, end) {
        var _a;
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.refreshRows(start, end);
    };
    Terminal.prototype._queueLinkification = function (start, end) {
        var _a;
        (_a = this.linkifier) === null || _a === void 0 ? void 0 : _a.linkifyRows(start, end);
    };
    Terminal.prototype.updateCursorStyle = function (ev) {
        var _a;
        if ((_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.shouldColumnSelect(ev)) {
            this.element.classList.add('column-select');
        }
        else {
            this.element.classList.remove('column-select');
        }
    };
    Terminal.prototype._showCursor = function () {
        if (!this._coreService.isCursorInitialized) {
            this._coreService.isCursorInitialized = true;
            this.refresh(this.buffer.y, this.buffer.y);
        }
    };
    Terminal.prototype.scrollLines = function (disp, suppressScrollEvent, source) {
        if (source === void 0) { source = 0; }
        _super.prototype.scrollLines.call(this, disp, suppressScrollEvent, source);
        this.refresh(0, this.rows - 1);
    };
    Terminal.prototype.paste = function (data) {
        Clipboard_1.paste(data, this.textarea, this._coreService);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._customKeyEventHandler = customKeyEventHandler;
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        var matcherId = this.linkifier.registerLinkMatcher(regex, handler, options);
        this.refresh(0, this.rows - 1);
        return matcherId;
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        if (this.linkifier.deregisterLinkMatcher(matcherId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Terminal.prototype.registerLinkProvider = function (linkProvider) {
        return this.linkifier2.registerLinkProvider(linkProvider);
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        if (!this._characterJoinerService) {
            throw new Error('Terminal must be opened first');
        }
        var joinerId = this._characterJoinerService.register(handler);
        this.refresh(0, this.rows - 1);
        return joinerId;
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        if (!this._characterJoinerService) {
            throw new Error('Terminal must be opened first');
        }
        if (this._characterJoinerService.deregister(joinerId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () {
            return this.buffer.markers;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.addMarker = function (cursorYOffset) {
        if (this.buffer !== this.buffers.normal) {
            return;
        }
        return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._selectionService ? this._selectionService.hasSelection : false;
    };
    Terminal.prototype.select = function (column, row, length) {
        this._selectionService.setSelection(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._selectionService ? this._selectionService.selectionText : '';
    };
    Terminal.prototype.getSelectionPosition = function () {
        if (!this._selectionService || !this._selectionService.hasSelection) {
            return undefined;
        }
        return {
            startColumn: this._selectionService.selectionStart[0],
            startRow: this._selectionService.selectionStart[1],
            endColumn: this._selectionService.selectionEnd[0],
            endRow: this._selectionService.selectionEnd[1]
        };
    };
    Terminal.prototype.clearSelection = function () {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.clearSelection();
    };
    Terminal.prototype.selectAll = function () {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.selectAll();
    };
    Terminal.prototype.selectLines = function (start, end) {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.selectLines(start, end);
    };
    Terminal.prototype._keyDown = function (event) {
        this._keyDownHandled = false;
        if (this._customKeyEventHandler && this._customKeyEventHandler(event) === false) {
            return false;
        }
        if (!this._compositionHelper.keydown(event)) {
            if (this.buffer.ybase !== this.buffer.ydisp) {
                this._bufferService.scrollToBottom();
            }
            return false;
        }
        var result = Keyboard_1.evaluateKeyboardEvent(event, this._coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
        this.updateCursorStyle(event);
        if (result.type === 3 || result.type === 2) {
            var scrollCount = this.rows - 1;
            this.scrollLines(result.type === 2 ? -scrollCount : scrollCount);
            return this.cancel(event, true);
        }
        if (result.type === 1) {
            this.selectAll();
        }
        if (this._isThirdLevelShift(this.browser, event)) {
            return true;
        }
        if (result.cancel) {
            this.cancel(event, true);
        }
        if (!result.key) {
            return true;
        }
        if (result.key === EscapeSequences_1.C0.ETX || result.key === EscapeSequences_1.C0.CR) {
            this.textarea.value = '';
        }
        this._onKey.fire({ key: result.key, domEvent: event });
        this._showCursor();
        this._coreService.triggerDataEvent(result.key, true);
        if (!this.optionsService.options.screenReaderMode) {
            return this.cancel(event, true);
        }
        this._keyDownHandled = true;
    };
    Terminal.prototype._isThirdLevelShift = function (browser, ev) {
        var thirdLevelKey = (browser.isMac && !this.options.macOptionIsMeta && ev.altKey && !ev.ctrlKey && !ev.metaKey) ||
            (browser.isWindows && ev.altKey && ev.ctrlKey && !ev.metaKey);
        if (ev.type === 'keypress') {
            return thirdLevelKey;
        }
        return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
    };
    Terminal.prototype._keyUp = function (ev) {
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return;
        }
        if (!wasModifierKeyOnlyEvent(ev)) {
            this.focus();
        }
        this.updateCursorStyle(ev);
    };
    Terminal.prototype._keyPress = function (ev) {
        var key;
        if (this._keyDownHandled) {
            return false;
        }
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return false;
        }
        this.cancel(ev);
        if (ev.charCode) {
            key = ev.charCode;
        }
        else if (ev.which === null || ev.which === undefined) {
            key = ev.keyCode;
        }
        else if (ev.which !== 0 && ev.charCode !== 0) {
            key = ev.which;
        }
        else {
            return false;
        }
        if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !this._isThirdLevelShift(this.browser, ev))) {
            return false;
        }
        key = String.fromCharCode(key);
        this._onKey.fire({ key: key, domEvent: ev });
        this._showCursor();
        this._coreService.triggerDataEvent(key, true);
        return true;
    };
    Terminal.prototype.bell = function () {
        var _a;
        if (this._soundBell()) {
            (_a = this._soundService) === null || _a === void 0 ? void 0 : _a.playBellSound();
        }
        this._onBell.fire();
    };
    Terminal.prototype.resize = function (x, y) {
        if (x === this.cols && y === this.rows) {
            if (this._charSizeService && !this._charSizeService.hasValidSize) {
                this._charSizeService.measure();
            }
            return;
        }
        _super.prototype.resize.call(this, x, y);
    };
    Terminal.prototype._afterResize = function (x, y) {
        var _a, _b;
        (_a = this._charSizeService) === null || _a === void 0 ? void 0 : _a.measure();
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.syncScrollArea(true);
    };
    Terminal.prototype.clear = function () {
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = 1;
        this.buffer.ydisp = 0;
        this.buffer.ybase = 0;
        this.buffer.y = 0;
        for (var i = 1; i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this.refresh(0, this.rows - 1);
        this._onScroll.fire({ position: this.buffer.ydisp, source: 0 });
    };
    Terminal.prototype.reset = function () {
        var _a, _b;
        this.options.rows = this.rows;
        this.options.cols = this.cols;
        var customKeyEventHandler = this._customKeyEventHandler;
        this._setup();
        _super.prototype.reset.call(this);
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.reset();
        this._customKeyEventHandler = customKeyEventHandler;
        this.refresh(0, this.rows - 1);
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.syncScrollArea();
    };
    Terminal.prototype._reportWindowsOptions = function (type) {
        if (!this._renderService) {
            return;
        }
        switch (type) {
            case InputHandler_1.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                var canvasWidth = this._renderService.dimensions.scaledCanvasWidth.toFixed(0);
                var canvasHeight = this._renderService.dimensions.scaledCanvasHeight.toFixed(0);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[4;" + canvasHeight + ";" + canvasWidth + "t");
                break;
            case InputHandler_1.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                var cellWidth = this._renderService.dimensions.scaledCellWidth.toFixed(0);
                var cellHeight = this._renderService.dimensions.scaledCellHeight.toFixed(0);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[6;" + cellHeight + ";" + cellWidth + "t");
                break;
        }
    };
    Terminal.prototype.cancel = function (ev, force) {
        if (!this.options.cancelEvents && !force) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    };
    Terminal.prototype._visualBell = function () {
        return false;
    };
    Terminal.prototype._soundBell = function () {
        return this.options.bellStyle === 'sound';
    };
    return Terminal;
}(CoreTerminal_1.CoreTerminal));
exports.Terminal = Terminal;
function wasModifierKeyOnlyEvent(ev) {
    return ev.keyCode === 16 ||
        ev.keyCode === 17 ||
        ev.keyCode === 18;
}
//# sourceMappingURL=Terminal.js.map