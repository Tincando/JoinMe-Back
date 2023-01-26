"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _db = _interopRequireDefault(require("./db.js"));
var _auth = _interopRequireDefault(require("./auth.js"));
_dotenv["default"].config();
var moment = require("moment");
var mongo = require("mongodb");
var app = (0, _express["default"])(); // instanciranje aplikacije
var PORT = process.env.PORT || 3000; // port na kojem će web server slušati

app.use((0, _cors["default"])(), _express["default"].json());
app.get("/tajna", [_auth["default"].verify], /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // nakon što se izvrši auth.verify middleware, imamo dostupan req.jwt objekt
            res.status(200).send("tajna korisnika " + req.jwt.username);
          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.patch("/user", [_auth["default"].verify], /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var changes, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            changes = req.body;
            if (!(changes.new_password && changes.old_password)) {
              _context2.next = 8;
              break;
            }
            _context2.next = 4;
            return _auth["default"].changeUserPassword(req.jwt.username, changes.old_password, changes.new_password);
          case 4:
            result = _context2.sent;
            if (result) {
              res.status(201).send();
            } else {
              res.status(500).json({
                error: "cannot change password"
              });
            }
            _context2.next = 9;
            break;
          case 8:
            res.status(400).json({
              error: "unrecognized request"
            });
          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
app.post("/auth", /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var user, username, password, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            user = req.body;
            username = user.username;
            password = user.password;
            _context3.prev = 3;
            _context3.next = 6;
            return _auth["default"].authenticateUser(username, password);
          case 6:
            result = _context3.sent;
            res.status(201).json(result);
            _context3.next = 13;
            break;
          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](3);
            res.status(500).json({
              error: _context3.t0.message
            });
          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[3, 10]]);
  }));
  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
app.post("/user", /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var user, result;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            user = req.body;
            _context4.prev = 1;
            _context4.next = 4;
            return _auth["default"].registerUser(user);
          case 4:
            result = _context4.sent;
            res.status(201).send();
            _context4.next = 11;
            break;
          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](1);
            res.status(500).json({
              error: _context4.t0.message
            });
          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 8]]);
  }));
  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());

//Dohvat evenata uz filtere za grad, raspon godina i raspon dana

app.get("/events", /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var db, query, filter, cursor, results;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _db["default"])();
          case 2:
            db = _context5.sent;
            query = req.query;
            console.log(query);
            filter = {}; // search za grad
            if (query._city) {
              filter = {
                city: {
                  $regex: query._city,
                  $options: "i"
                }
              };
            }
            //filter za kateogriju,grad,godine i datum
            if (query._category || query._city || query._age || query._day) {
              filter.$and = [];
              if (query._category) {
                filter.$and.push({
                  category: {
                    $regex: query._category,
                    $options: "i"
                  }
                });
              }
              if (query._city) {
                filter.$and.push({
                  city: {
                    $regex: query._city,
                    $options: "i"
                  }
                });
              }

              // Za raspon godina
              if (query._age) {
                if (query._age == "18") {
                  filter.$and.push({
                    age: {
                      $gte: 18,
                      $lt: 30
                    }
                  });
                } else if (query._age == "30") {
                  filter.$and.push({
                    age: {
                      $gte: 30,
                      $lt: 50
                    }
                  });
                } else if (query._age == "50") {
                  filter.$and.push({
                    age: {
                      $gte: 50,
                      $lt: 60
                    }
                  });
                } else if (query._age == "60") {
                  filter.$and.push({
                    age: {
                      $gte: 60,
                      $lt: 100
                    }
                  });
                }
              }

              // Filter po danu,tjednu,mjesecu i godini
              if (query._day) {
                if (query._day == "day") {
                  filter.$and.push({
                    eventDate: {
                      $gte: moment().startOf("day").toDate(),
                      $lt: moment().endOf("day").toDate()
                    }
                  });
                } else if (query._day == "week") {
                  filter.$and.push({
                    eventDate: {
                      $gte: moment().startOf("week").toDate(),
                      $lt: moment().endOf("week").toDate()
                    }
                  });
                } else if (query._day == "month") {
                  filter.$and.push({
                    eventDate: {
                      $gte: moment().startOf("month").toDate(),
                      $lt: moment().endOf("month").toDate()
                    }
                  });
                } else if (query._day == "year") {
                  filter.$and.push({
                    eventDate: {
                      $gte: moment().startOf("year").toDate(),
                      $lt: moment().endOf("year").toDate()
                    }
                  });
                }
              }
            }
            console.log("Filter za Mongo", filter);
            _context5.next = 11;
            return db.collection("events").find(filter).sort({
              postedAt: -1
            });
          case 11:
            cursor = _context5.sent;
            _context5.next = 14;
            return cursor.toArray();
          case 14:
            results = _context5.sent;
            results.forEach(function (e) {
              e.id = e._id;
              delete e._id;
            });
            res.json(results);
          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());

//Dohvat eventa po id-u
app.get("/events/:id", /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var id, db, document;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            // parametri rute dostupni su u req.params
            id = req.params.id; // spoji se na bazu
            _context6.next = 3;
            return (0, _db["default"])();
          case 3:
            db = _context6.sent;
            _context6.next = 6;
            return db.collection("events").findOne({
              _id: mongo.ObjectId(id)
            });
          case 6:
            document = _context6.sent;
            res.json(document);
          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());

//Dodaj novi event
app.post("/events", /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res) {
    var db, doc, result;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _db["default"])();
          case 2:
            db = _context7.sent;
            doc = req.body;
            doc.eventDate = new Date(doc.eventDate);
            _context7.next = 7;
            return db.collection("events").insertOne(doc);
          case 7:
            result = _context7.sent;
            if (result.insertedCount == 1) {
              res.json({
                status: "success",
                id: result.insertedId
              });
            } else {
              res.json({
                status: "fail"
              });
            }
          case 9:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());

//Dodaj broj i osobu koja ide na event
app.patch("/event/:id", /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res) {
    var doc, id, db, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            doc = req.body;
            delete doc._id;
            id = req.params.id;
            _context8.next = 5;
            return (0, _db["default"])();
          case 5:
            db = _context8.sent;
            _context8.next = 8;
            return db.collection("events").updateOne({
              _id: mongo.ObjectId(id)
            }, {
              $set: {
                people: doc.people
              },
              $push: {
                going: doc.going
              }
            });
          case 8:
            result = _context8.sent;
            if (result.modifiedCount == 1) {
              res.json({
                status: "success",
                id: result.insertedId
              });
            } else {
              res.json({
                status: "fail"
              });
            }
          case 10:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}());

// Dodaj novi komentar na event
app.post("/chat", /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res) {
    var db, doc, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _db["default"])();
          case 2:
            db = _context9.sent;
            doc = req.body;
            _context9.next = 6;
            return db.collection("chat").insertOne(doc);
          case 6:
            result = _context9.sent;
            if (result.insertedCount == 1) {
              res.json({
                status: "success",
                id: result.insertedId
              });
            } else {
              res.json({
                status: "fail"
              });
            }
          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}());

// Dohvat svih chatova za određeni event
app.get("/chat/:id", /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res) {
    var id, db, cursor, results;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            // parametri rute dostupni su u req.params
            id = req.params.id; // spoji se na bazu
            _context10.next = 3;
            return (0, _db["default"])();
          case 3:
            db = _context10.sent;
            cursor = db.collection("chat").find({
              event_id: id
            }).sort({
              postedAt: -1
            });
            _context10.next = 7;
            return cursor.countDocuments;
          case 7:
            _context10.t0 = _context10.sent;
            if (!(_context10.t0 === 0)) {
              _context10.next = 10;
              break;
            }
            console.log("No documents found!");
          case 10:
            _context10.next = 12;
            return cursor.toArray();
          case 12:
            results = _context10.sent;
            results.forEach(function (e) {
              e.id = e._id;
              delete e._id;
            });
            res.json(results);
          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}());

// dohvat svih evenat-a za određenog korisnika
app.get("/myevents/:email", /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res) {
    var email, filter, db, cursor, results;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            email = req.params.email; // dohvati sve evente koji je korisnik kreirao i na koje se prijavio
            filter = {
              $or: [{
                createdBy: email
              }, {
                going: email
              }]
            }; // spoji se na bazu
            _context11.next = 4;
            return (0, _db["default"])();
          case 4:
            db = _context11.sent;
            cursor = db.collection("events").find(filter).sort({
              postedAt: -1
            });
            _context11.next = 8;
            return cursor.countDocuments;
          case 8:
            _context11.t0 = _context11.sent;
            if (!(_context11.t0 === 0)) {
              _context11.next = 11;
              break;
            }
            console.log("No documents found!");
          case 11:
            _context11.next = 13;
            return cursor.toArray();
          case 13:
            results = _context11.sent;
            results.forEach(function (e) {
              e.id = e._id;
              delete e._id;
            });
            res.json(results);
          case 16:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}());
app.listen(PORT, function () {
  return console.log("Slu\u0161am na portu ".concat(PORT, "!"));
});