/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./server.js":
/*!*******************!*\
  !*** ./server.js ***!
  \*******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_MasterCore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/MasterCore */ \"./src/MasterCore.js\");\n\nconsole.log(\"Starting server...\");\nlet core = new _src_MasterCore__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\ncore.start();\n\n//# sourceURL=webpack:///./server.js?");

/***/ }),

/***/ "./src/Defs.js":
/*!*********************!*\
  !*** ./src/Defs.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst Defs = {\n  PORT: 50788\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (Defs);\n\n//# sourceURL=webpack:///./src/Defs.js?");

/***/ }),

/***/ "./src/MasterCore.js":
/*!***************************!*\
  !*** ./src/MasterCore.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterCore; });\n/* harmony import */ var _entities_EntityTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entities/EntityTypes */ \"./src/entities/EntityTypes.js\");\n/* harmony import */ var _Defs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defs */ \"./src/Defs.js\");\n/* harmony import */ var _network_MasterServer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./network/MasterServer */ \"./src/network/MasterServer.js\");\n/* harmony import */ var _network_plugins_MasterCorePlugin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./network/plugins/MasterCorePlugin */ \"./src/network/plugins/MasterCorePlugin.js\");\n\n\n\n\nclass MasterCore {\n  constructor() {\n    this.server = new _network_MasterServer__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n    this.masterCorePlugin = new _network_plugins_MasterCorePlugin__WEBPACK_IMPORTED_MODULE_3__[\"default\"](this);\n    this.server.addPlugin(this.masterCorePlugin);\n    this.server.init();\n  }\n\n  start() {\n    this.lastUpdate = Date.now();\n    this.updateInterval = setInterval(() => this.update(Date.now()), 50);\n  }\n\n  update(now) {\n    let delta = now - this.lastUpdate;\n    this.lastUpdate = now; // do updates\n  }\n\n}\n\n//# sourceURL=webpack:///./src/MasterCore.js?");

/***/ }),

/***/ "./src/entities/EntityTypes.js":
/*!*************************************!*\
  !*** ./src/entities/EntityTypes.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst ENTITY_TYPES = {\n  ENTITY: 0,\n  PHYSICS: 1,\n  PLAYER: 2\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (ENTITY_TYPES);\n\n//# sourceURL=webpack:///./src/entities/EntityTypes.js?");

/***/ }),

/***/ "./src/network/MasterServer.js":
/*!*************************************!*\
  !*** ./src/network/MasterServer.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterServer; });\n/* harmony import */ var _Defs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Defs */ \"./src/Defs.js\");\n/* harmony import */ var _Server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Server */ \"./src/network/Server.js\");\n/* harmony import */ var socket_io__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io */ \"socket.io\");\n/* harmony import */ var socket_io__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(socket_io__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _plugins_ServerLogPlugin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./plugins/ServerLogPlugin */ \"./src/network/plugins/ServerLogPlugin.js\");\n\n\n\n\nclass MasterServer extends _Server__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor(config) {\n    super(config);\n    this.addPlugin(new _plugins_ServerLogPlugin__WEBPACK_IMPORTED_MODULE_3__[\"default\"]());\n    this.io = new socket_io__WEBPACK_IMPORTED_MODULE_2___default.a({\n      transports: [\"websocket\"],\n      serveClient: false\n    });\n  }\n\n  init() {\n    this.io.on('connect', socket => {\n      this.registerHandlersOnSocket(socket);\n    });\n    this.io.listen(_Defs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].PORT); // start listening\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/MasterServer.js?");

/***/ }),

/***/ "./src/network/Server.js":
/*!*******************************!*\
  !*** ./src/network/Server.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Server; });\nclass Server {\n  constructor(config) {\n    this.config = {\n      isMaster: true,\n      ...config\n    };\n    this.handlers = {};\n    this.plugins = [];\n  }\n\n  init() {\n    /* Override in client, create sockets */\n  }\n\n  addPlugin(plugin) {\n    this.plugins.push(plugin);\n    plugin.onAddToServer((key, handler) => {\n      if (key in this.handlers) {\n        this.handlers[key].push(handler);\n      } else {\n        this.handlers[key] = [handler];\n      }\n    });\n  }\n\n  registerHandlersOnSocket(socket) {\n    for (let key in this.handlers) {\n      for (let handler of this.handlers[key]) {\n        socket.on(key, handler);\n      }\n    }\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/Server.js?");

/***/ }),

/***/ "./src/network/ServerPlugin.js":
/*!*************************************!*\
  !*** ./src/network/ServerPlugin.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ServerPlugin; });\nclass ServerPlugin {\n  constructor() {\n    this.emit = null;\n  }\n\n  onAddToServer(registerHandler) {\n    this.registerHandlers(...arguments);\n  }\n\n  registerHandlers(registerHandler) {\n    /* override in child class */\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/ServerPlugin.js?");

/***/ }),

/***/ "./src/network/plugins/MasterCorePlugin.js":
/*!*************************************************!*\
  !*** ./src/network/plugins/MasterCorePlugin.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterCorePlugin; });\n/* harmony import */ var _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ServerPlugin */ \"./src/network/ServerPlugin.js\");\n/* harmony import */ var _util_UUID__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/UUID */ \"./src/util/UUID.js\");\n\n\nclass MasterCorePlugin extends _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  constructor(masterCore) {\n    super();\n    this.masterCore = masterCore;\n    this.players = {};\n  }\n\n  getPlayer(playerId) {\n    return this.players[playerId];\n  }\n\n  registerHandlers(registerHandler) {\n    registerHandler('join', ({\n      name\n    }, cb) => {\n      let uuid = Object(_util_UUID__WEBPACK_IMPORTED_MODULE_1__[\"generateUuid\"])();\n      this.players[uuid] = {\n        name\n      };\n      cb(uuid);\n    });\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/plugins/MasterCorePlugin.js?");

/***/ }),

/***/ "./src/network/plugins/ServerLogPlugin.js":
/*!************************************************!*\
  !*** ./src/network/plugins/ServerLogPlugin.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ServerLogPlugin; });\n/* harmony import */ var _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ServerPlugin */ \"./src/network/ServerPlugin.js\");\n\nclass ServerLogPlugin extends _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  registerHandlers(registerHandler) {\n    registerHandler('connect', () => {\n      console.log(\"Socket connected.\");\n    });\n    registerHandler('disconnect', () => {\n      console.log(\"Socket disconnected.\");\n    });\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/plugins/ServerLogPlugin.js?");

/***/ }),

/***/ "./src/util/UUID.js":
/*!**************************!*\
  !*** ./src/util/UUID.js ***!
  \**************************/
/*! exports provided: generateUuid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"generateUuid\", function() { return generateUuid; });\nconst s4 = () => {\n  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);\n};\n\nfunction generateUuid() {\n  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();\n}\n\n//# sourceURL=webpack:///./src/util/UUID.js?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ })

/******/ });