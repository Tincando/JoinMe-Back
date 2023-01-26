"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _require = require("mongodb"),
  MongoClient = _require.MongoClient;
_dotenv["default"].config();
var mongo = require("mongodb").MongoClient;
var connection_string = process.env.CONNECTION_STRING;
var client = new MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = null;

// eksportamo Promise koji resolva na konekciju
var _default = function _default() {
  return new Promise(function (resolve, reject) {
    // ako smo inicijalizirali bazu i klijent je još uvijek spojen
    if (db && client.connect) {
      resolve(db);
    } else {
      client.connect(function (err) {
        if (err) {
          reject("Spajanje na bazu nije uspjelo:" + err);
        } else {
          console.log("Database connected successfully!");
          db = client.db("JoinMe");
          resolve(db);
        }
      });
    }
  });
};
exports["default"] = _default;