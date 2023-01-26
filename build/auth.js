"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _mongodb = _interopRequireDefault(require("mongodb"));
var _db = _interopRequireDefault(require("./db.js"));
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
// Kreiranje indeksa pri pokretanju aplikacije (ukoliko već ne postoji)
(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var db;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _db["default"])();
        case 2:
          db = _context.sent;
          db.collection("users").createIndex({
            username: 1
          }, {
            unique: true
          });
        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();
var _default = {
  registerUser: function registerUser(userData) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var db, result, doc;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _db["default"])();
            case 2:
              db = _context2.sent;
              _context2.prev = 3;
              _context2.t0 = userData.username;
              _context2.next = 7;
              return _bcrypt["default"].hash(userData.password, 8);
            case 7:
              _context2.t1 = _context2.sent;
              _context2.t2 = userData.name;
              _context2.t3 = userData.location;
              _context2.t4 = userData.age;
              _context2.t5 = userData.profil_image;
              doc = {
                username: _context2.t0,
                password: _context2.t1,
                name: _context2.t2,
                location: _context2.t3,
                age: _context2.t4,
                profil_image: _context2.t5
              };
              _context2.next = 15;
              return db.collection("users").insertOne(doc);
            case 15:
              result = _context2.sent;
              _context2.next = 23;
              break;
            case 18:
              _context2.prev = 18;
              _context2.t6 = _context2["catch"](3);
              if (!(_context2.t6.name == "MongoError")) {
                _context2.next = 23;
                break;
              }
              if (!(_context2.t6.code == 11000)) {
                _context2.next = 23;
                break;
              }
              throw new Error("Username already exists");
            case 23:
              if (!(result && result.insertedCount == 1)) {
                _context2.next = 27;
                break;
              }
              return _context2.abrupt("return", result.insertedId);
            case 27:
              throw new Error("Cannot register user");
            case 28:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 18]]);
    }))();
  },
  authenticateUser: function authenticateUser(username, password) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var db, user, token;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _db["default"])();
            case 2:
              db = _context3.sent;
              _context3.next = 5;
              return db.collection("users").findOne({
                username: username
              });
            case 5:
              user = _context3.sent;
              _context3.t0 = user && user.password;
              if (!_context3.t0) {
                _context3.next = 11;
                break;
              }
              _context3.next = 10;
              return _bcrypt["default"].compare(password, user.password);
            case 10:
              _context3.t0 = _context3.sent;
            case 11:
              if (!_context3.t0) {
                _context3.next = 17;
                break;
              }
              delete user.password; // ne želimo u tokenu, token se sprema na klijentu
              token = _jsonwebtoken["default"].sign(user, process.env.JWT_SECRET, {
                algorithm: "HS512",
                expiresIn: "1 week"
              });
              return _context3.abrupt("return", {
                token: token,
                username: user.username,
                profil_image: user.profil_image
              });
            case 17:
              throw new Error("Cannot authenticate");
            case 18:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }))();
  },
  verify: function verify(req, res, next) {
    if (req.headers["authorization"]) {
      try {
        var authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send(); // HTTP invalid requets
        } else {
          var token = authorization[1];
          // spremi uz upit rezultat JWT provjere tokena (rezultat su podaci o tokenu)
          // verify baca grešku(exception) ako ne uspije provjera
          req.jwt = _jsonwebtoken["default"].verify(authorization[1], process.env.JWT_SECRET);
          return next(); // Sve je ok, možemo prijeći na konkretan upit
        }
      } catch (err) {
        return res.status(403).send(); // HTTP not-authorized
      }
    } else {
      return res.status(401).send(); // HTTP invalid request
    }
  }
};
exports["default"] = _default;