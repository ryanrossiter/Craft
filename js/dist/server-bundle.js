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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterCore; });\n/* harmony import */ var _entities_EntityTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entities/EntityTypes */ \"./src/entities/EntityTypes.js\");\n/* harmony import */ var _Defs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defs */ \"./src/Defs.js\");\n/* harmony import */ var _network_MasterServer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./network/MasterServer */ \"./src/network/MasterServer.js\");\n/* harmony import */ var _network_plugins_master_MasterCorePlugin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./network/plugins/master/MasterCorePlugin */ \"./src/network/plugins/master/MasterCorePlugin.js\");\n/* harmony import */ var _network_plugins_master_EntityPlugin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./network/plugins/master/EntityPlugin */ \"./src/network/plugins/master/EntityPlugin.js\");\n\n\n\n\n\nclass MasterCore {\n  constructor() {\n    this.server = new _network_MasterServer__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n    this.masterCorePlugin = new _network_plugins_master_MasterCorePlugin__WEBPACK_IMPORTED_MODULE_3__[\"default\"](this);\n    this.entities = new _network_plugins_master_EntityPlugin__WEBPACK_IMPORTED_MODULE_4__[\"default\"]();\n    this.server.addPlugin(this.masterCorePlugin);\n    this.server.addPlugin(this.entities);\n    this.server.init();\n  }\n\n  start() {\n    this.lastUpdate = Date.now();\n    this.updateInterval = setInterval(() => this.update(Date.now()), 50);\n  }\n\n  update(now) {\n    let delta = now - this.lastUpdate;\n    this.lastUpdate = now;\n    this.entities.update();\n    this.entities.sendUpdates();\n  }\n\n}\n\n//# sourceURL=webpack:///./src/MasterCore.js?");

/***/ }),

/***/ "./src/entities/Entity.js":
/*!********************************!*\
  !*** ./src/entities/Entity.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Entity; });\n/* harmony import */ var _util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/SerializedObject */ \"./src/util/SerializedObject.js\");\n/* harmony import */ var _EntityTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EntityTypes */ \"./src/entities/EntityTypes.js\");\n\n\nclass Entity extends Object(_util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(null, _EntityTypes__WEBPACK_IMPORTED_MODULE_1__[\"default\"].ENTITY, {\n  _static: [],\n  id: undefined,\n  player: null\n},\n/* onChangeData */\nfunction (k, v) {}) {\n  constructor(data) {\n    super(data);\n    this.dirty = false;\n    this.deleted = false;\n    this.clientControlled = false;\n  }\n\n  serverUpdate() {}\n\n  clientUpdate() {}\n\n}\n\n//# sourceURL=webpack:///./src/entities/Entity.js?");

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

/***/ "./src/entities/PhysicsEntity.js":
/*!***************************************!*\
  !*** ./src/entities/PhysicsEntity.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return PhysicsEntity; });\n/* harmony import */ var _util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/SerializedObject */ \"./src/util/SerializedObject.js\");\n/* harmony import */ var _Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Entity */ \"./src/entities/Entity.js\");\n/* harmony import */ var _EntityTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EntityTypes */ \"./src/entities/EntityTypes.js\");\n\n\n\nclass PhysicsEntity extends Object(_util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(_Entity__WEBPACK_IMPORTED_MODULE_1__[\"default\"], _EntityTypes__WEBPACK_IMPORTED_MODULE_2__[\"default\"].PHYSICS, {\n  x: 0,\n  y: 25,\n  z: 0,\n  rx: 0,\n  ry: 0,\n  rz: 0,\n  vx: 0,\n  vy: 0,\n  vz: 0\n}) {\n  constructor(data, physMem) {\n    super(data);\n    this.physMem = physMem;\n  }\n\n}\n\n//# sourceURL=webpack:///./src/entities/PhysicsEntity.js?");

/***/ }),

/***/ "./src/entities/Player.js":
/*!********************************!*\
  !*** ./src/entities/Player.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Player; });\n/* harmony import */ var _util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/SerializedObject */ \"./src/util/SerializedObject.js\");\n/* harmony import */ var _PhysicsEntity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PhysicsEntity */ \"./src/entities/PhysicsEntity.js\");\n/* harmony import */ var _EntityTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EntityTypes */ \"./src/entities/EntityTypes.js\");\n\n\n\nclass Player extends Object(_util_SerializedObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(_PhysicsEntity__WEBPACK_IMPORTED_MODULE_1__[\"default\"], _EntityTypes__WEBPACK_IMPORTED_MODULE_2__[\"default\"].PLAYER, {\n  name: \"Nemp\"\n}) {\n  constructor(data, mem) {\n    super(data, mem + 4 + 32);\n  }\n\n}\n\n//# sourceURL=webpack:///./src/entities/Player.js?");

/***/ }),

/***/ "./src/network/MasterServer.js":
/*!*************************************!*\
  !*** ./src/network/MasterServer.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterServer; });\n/* harmony import */ var _Defs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Defs */ \"./src/Defs.js\");\n/* harmony import */ var _Server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Server */ \"./src/network/Server.js\");\n/* harmony import */ var socket_io__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io */ \"socket.io\");\n/* harmony import */ var socket_io__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(socket_io__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _plugins_ServerLogPlugin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./plugins/ServerLogPlugin */ \"./src/network/plugins/ServerLogPlugin.js\");\n\n\n\n\nclass MasterServer extends _Server__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor(config) {\n    super(config);\n    this.io = new socket_io__WEBPACK_IMPORTED_MODULE_2___default.a({\n      transports: [\"websocket\"],\n      serveClient: false\n    });\n    this.addPlugin(new _plugins_ServerLogPlugin__WEBPACK_IMPORTED_MODULE_3__[\"default\"]());\n  }\n\n  addPlugin(plugin) {\n    plugin.emit = this.io.emit.bind(this.io);\n    super.addPlugin(plugin);\n  }\n\n  init() {\n    this.io.on('connect', socket => {\n      this.registerHandlersOnSocket(socket);\n    });\n    this.io.listen(_Defs__WEBPACK_IMPORTED_MODULE_0__[\"default\"].PORT); // start listening\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/MasterServer.js?");

/***/ }),

/***/ "./src/network/Server.js":
/*!*******************************!*\
  !*** ./src/network/Server.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Server; });\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nclass Server {\n  constructor(config) {\n    this.config = _objectSpread({\n      isMaster: true\n    }, config);\n    this.handlers = {};\n    this.plugins = [];\n  }\n\n  init() {\n    /* Override in client, create sockets */\n  }\n\n  addPlugin(plugin) {\n    this.plugins.push(plugin);\n    plugin.registerHandlers((key, handler) => {\n      let _handler = (...args) => {\n        try {\n          handler(...args);\n        } catch (e) {\n          console.error(`Error in socket handler ${key} from plugin ${plugin.constructor.name}:`);\n          console.error(e.stack);\n        }\n      };\n\n      if (key in this.handlers) {\n        this.handlers[key].push(_handler);\n      } else {\n        this.handlers[key] = [_handler];\n      }\n    }, this.config);\n  }\n\n  registerHandlersOnSocket(socket) {\n    for (let key in this.handlers) {\n      for (let handler of this.handlers[key]) {\n        socket.on(key, (...args) => handler(socket, ...args));\n      }\n    }\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/Server.js?");

/***/ }),

/***/ "./src/network/ServerPlugin.js":
/*!*************************************!*\
  !*** ./src/network/ServerPlugin.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ServerPlugin; });\nclass ServerPlugin {\n  constructor() {\n    this.emit = null;\n  }\n\n  registerHandlers(registerHandler, serverConfig) {\n    /* override in child class */\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/ServerPlugin.js?");

/***/ }),

/***/ "./src/network/plugins/ServerLogPlugin.js":
/*!************************************************!*\
  !*** ./src/network/plugins/ServerLogPlugin.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ServerLogPlugin; });\n/* harmony import */ var _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ServerPlugin */ \"./src/network/ServerPlugin.js\");\n\nclass ServerLogPlugin extends _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  registerHandlers(registerHandler, serverConfig) {\n    if (serverConfig.isMaster) {\n      // Print right away if on master server\n      console.log(\"Socket connected.\");\n    } else {\n      registerHandler('connect', () => {\n        console.log(\"Socket connected.\");\n      });\n    }\n\n    registerHandler('disconnect', () => {\n      console.log(\"Socket disconnected.\");\n    });\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/plugins/ServerLogPlugin.js?");

/***/ }),

/***/ "./src/network/plugins/master/EntityPlugin.js":
/*!****************************************************!*\
  !*** ./src/network/plugins/master/EntityPlugin.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return EntityPlugin; });\n/* harmony import */ var _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ServerPlugin */ \"./src/network/ServerPlugin.js\");\n/* harmony import */ var _entities_EntityTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../entities/EntityTypes */ \"./src/entities/EntityTypes.js\");\n/* harmony import */ var _entities_Player__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../entities/Player */ \"./src/entities/Player.js\");\n/* harmony import */ var _util_UUID__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../util/UUID */ \"./src/util/UUID.js\");\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\nclass EntityPlugin extends _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  constructor(time, onCreateEntity) {\n    super();\n    this.time = time;\n    this.onCreateEntity = onCreateEntity;\n    this.entities = {};\n    this.entityFactory = {\n      [_entities_EntityTypes__WEBPACK_IMPORTED_MODULE_1__[\"default\"].PLAYER]: _entities_Player__WEBPACK_IMPORTED_MODULE_2__[\"default\"]\n    };\n  }\n\n  registerHandlers(registerHandler) {\n    registerHandler('entity.update', (socket, {\n      entityData\n    }) => {\n      for (let data of entityData) {\n        if (this.entities.hasOwnProperty(data.id)) {\n          // Only allow update by controlling player\n          let entity = this.entities[data.id];\n\n          if (entity.player === socket.id) {\n            entity.updateData(data);\n            entity.dirty = true;\n          }\n        }\n      }\n    }); // registerHandler('entity.delete', (socket, { entityIds }) => {\n    //     for (let id of entityIds) {\n    //         if (this.entities.hasOwnProperty(id)) {\n    //             this.entities[id].onDelete();\n    //             delete this.entities[id];\n    //         }\n    //     }\n    // });\n  }\n\n  create(entityType, data = {}) {\n    if (entityType in this.entityFactory) {\n      let id = Object(_util_UUID__WEBPACK_IMPORTED_MODULE_3__[\"generateUuid\"])();\n      let EntityClass = this.entityFactory[entityType];\n      let entity = new EntityClass(_objectSpread({}, data, {\n        id\n      }));\n      this.entities[id] = entity;\n      this.sendUpdate(entity);\n    } else {\n      throw `Unregistered entity type ${entityType}.`;\n    }\n  }\n\n  update() {\n    for (let e of Object.values(this.entities)) {\n      e.serverUpdate();\n    }\n  }\n\n  sendUpdate(entity) {\n    if (entity.deleted) {\n      this.emit('entity.delete', {\n        entityIds: [entity.id]\n      });\n    } else {\n      this.emit('entity.update', {\n        entityData: [entity.toData()]\n      });\n    }\n  }\n\n  sendUpdates() {\n    let entityData = [];\n    let deletedEntityIds = [];\n\n    for (let e of Object.values(this.entities)) {\n      if (e.deleted) {\n        deletedEntityIds.push(e.id);\n        delete this.entities[e.id];\n      } else if (e.dirty) {\n        entityData.push(e.toData());\n        e.dirty = false;\n      }\n    }\n\n    if (entityData.length > 0) {\n      this.emit('entity.update', {\n        entityData\n      });\n    }\n\n    if (deletedEntityIds.length > 0) {\n      this.emit('entity.delete', {\n        entityIds: deletedEntityIds\n      });\n    }\n  }\n\n  sendAllEntities(socket) {\n    let entityData = [];\n\n    for (let e of Object.values(this.entities)) {\n      if (e.deleted) continue;\n      entityData.push(e.toData());\n    }\n\n    if (entityData.length > 0) {\n      socket.emit('entity.update', {\n        entityData\n      });\n    }\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/plugins/master/EntityPlugin.js?");

/***/ }),

/***/ "./src/network/plugins/master/MasterCorePlugin.js":
/*!********************************************************!*\
  !*** ./src/network/plugins/master/MasterCorePlugin.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MasterCorePlugin; });\n/* harmony import */ var _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ServerPlugin */ \"./src/network/ServerPlugin.js\");\n/* harmony import */ var _entities_EntityTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../entities/EntityTypes */ \"./src/entities/EntityTypes.js\");\n\n\nclass MasterCorePlugin extends _ServerPlugin__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  constructor(masterCore) {\n    super();\n    this.masterCore = masterCore;\n    this.players = {};\n  }\n\n  getPlayer(playerId) {\n    return this.players[playerId];\n  }\n\n  registerHandlers(registerHandler) {\n    registerHandler('client.join', (socket, {\n      name\n    }, cb) => {\n      this.players[socket.id] = {\n        name\n      };\n      cb({\n        playerId: socket.id\n      });\n      console.log(`Player ${name} joined.`);\n      this.masterCore.entities.sendAllEntities(socket);\n      this.masterCore.entities.create(_entities_EntityTypes__WEBPACK_IMPORTED_MODULE_1__[\"default\"].PLAYER, {\n        name,\n        player: socket.id\n      });\n    });\n  }\n\n}\n\n//# sourceURL=webpack:///./src/network/plugins/master/MasterCorePlugin.js?");

/***/ }),

/***/ "./src/util/ObjectHelpers.js":
/*!***********************************!*\
  !*** ./src/util/ObjectHelpers.js ***!
  \***********************************/
/*! exports provided: extend, mask */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"extend\", function() { return extend; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"mask\", function() { return mask; });\nfunction extend(target) {\n  for (var hOP = Object.prototype.hasOwnProperty, copy = function (key) {\n    if (!hOP.call(target, key)) {\n      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(this, key));\n    }\n  }, i = arguments.length; 1 < i--; Object.keys(arguments[i]).forEach(copy, arguments[i])) {}\n\n  return target;\n} // masks source1 with source2, result will be all of the properties in source1\n// with values replaced from source2 if it contains the property\n// if _static: [property keys] is provided, then properties in source2 that are in _static\n// will not be included\n\nfunction mask(source1, source2, excludeProtect) {\n  var destination = {};\n  var _static = [];\n\n  for (var property in source1) {\n    if (source1.hasOwnProperty(property)) {\n      if (property === \"_static\") {\n        _static = source1[property];\n\n        if (!excludeProtect) {\n          destination[property] = _static.slice(); // make a copy\n        }\n      } else {\n        destination[property] = source1[property];\n      }\n    }\n  }\n\n  for (var property in source2) {\n    if (source1.hasOwnProperty(property) && source2.hasOwnProperty(property) && _static.indexOf(property) === -1 && property != \"_protect\") {\n      // Changed from extend here (2 => 1)\n      destination[property] = source2[property];\n    }\n  }\n\n  return destination;\n}\n\n//# sourceURL=webpack:///./src/util/ObjectHelpers.js?");

/***/ }),

/***/ "./src/util/SerializedObject.js":
/*!**************************************!*\
  !*** ./src/util/SerializedObject.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ObjectHelpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ObjectHelpers */ \"./src/util/ObjectHelpers.js\");\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\nconst SerializedObject = (SuperClass, type, SCHEMA) => {\n  // generate a *unique* data symbol for each class\n  let _data = Symbol('data');\n\n  if (!SuperClass) {\n    SuperClass = Object;\n  }\n\n  return class extends SuperClass {\n    constructor() {\n      super(...arguments);\n\n      if (SuperClass !== Object && !super.updateData) {\n        throw \"Super class must implement updateData (Should inherit from SerializedObject)\";\n      }\n\n      if (SuperClass !== Object && !super.onUpdateData) {\n        throw \"Super class must implement onUpdateData (Should inherit from SerializedObject)\";\n      }\n\n      if (SuperClass !== Object && !super.onChangeData) {\n        throw \"Super class must implement onChangeData (Should inherit from SerializedObject)\";\n      }\n\n      this[_data] = Object(_ObjectHelpers__WEBPACK_IMPORTED_MODULE_0__[\"mask\"])(_objectSpread({\n        _static: []\n      }, SCHEMA), arguments[0]); // create getters and setters\n\n      for (let p in this[_data]) {\n        if (p == '_static') continue;\n        let o = this;\n        Object.defineProperty(this, p, {\n          get: () => this[_data][p],\n          set: v => {\n            if (this[_data]._static.includes(p)) {\n              throw `Property \"${p}\" is static and cannot be updated`;\n            }\n\n            this[_data][p] = v;\n            this.onChangeData(p, v);\n          }\n        });\n      }\n    }\n\n    get type() {\n      return type;\n    }\n\n    toData() {\n      return _objectSpread({}, super.toData ? super.toData() : {}, Object(_ObjectHelpers__WEBPACK_IMPORTED_MODULE_0__[\"mask\"])(SCHEMA, this[_data], true), {\n        type\n      });\n    }\n\n    refreshData() {\n      this.updateData(this.toData(), true);\n    }\n\n    updateData(data, triggerCallbacks = false) {\n      this[_data] = Object(_ObjectHelpers__WEBPACK_IMPORTED_MODULE_0__[\"mask\"])(this[_data], data);\n\n      if (triggerCallbacks === true) {\n        for (let k in this[_data]) {\n          this.onChangeData(k, this[k]);\n        }\n      }\n\n      if (SuperClass !== Object) {\n        super.updateData(...arguments);\n      } else {\n        // Only invoke callback in top-level class (after all data has been updated)\n        this.onUpdateData();\n      }\n    }\n\n    onUpdateData() {\n      if (SuperClass !== Object) {\n        super.onUpdateData();\n      }\n    }\n\n    onChangeData(k, v) {\n      if (SuperClass !== Object) {\n        super.onChangeData(...arguments);\n      }\n    }\n\n  };\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (SerializedObject);\n\n//# sourceURL=webpack:///./src/util/SerializedObject.js?");

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