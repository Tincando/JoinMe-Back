import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connect from "./db.js";
import auth from "./auth.js";

var moment = require("moment");

var mongo = require("mongodb");

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors(), express.json());

app.get("/tajna", [auth.verify], async (req, res) => {
  // nakon što se izvrši auth.verify middleware, imamo dostupan req.jwt objekt
  res.status(200).send("tajna korisnika " + req.jwt.username);
});

app.patch("/user", [auth.verify], async (req, res) => {
  let changes = req.body;
  if (changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      req.jwt.username,
      changes.old_password,
      changes.new_password
    );
    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: "cannot change password" });
    }
  } else {
    res.status(400).json({ error: "unrecognized request" });
  }
});

app.post("/auth", async (req, res) => {
  let user = req.body;
  let username = user.username;
  let password = user.password;

  try {
    let result = await auth.authenticateUser(username, password);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

app.post("/user", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.registerUser(user);

    res.status(201).send();
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

//Dohvat evenata uz filtere za grad, raspon godina i raspon dana

app.get("/events", async (req, res) => {
  let db = await connect();
  let query = req.query;

  console.log(query);

  let filter = {};

  // search za grad
  if (query._city) {
    filter = {
      city: { $regex: query._city, $options: "i" },
    };
  }
  //filter za kateogriju,grad,godine i datum
  if (query._category || query._city || query._age || query._day) {
    filter.$and = [];

    if (query._category) {
      filter.$and.push({
        category: { $regex: query._category, $options: "i" },
      });
    }

    if (query._city) {
      filter.$and.push({
        city: { $regex: query._city, $options: "i" },
      });
    }

    // Za raspon godina
    if (query._age) {
      if (query._age == "18") {
        filter.$and.push({
          age: {
            $gte: 18,
            $lt: 30,
          },
        });
      } else if (query._age == "30") {
        filter.$and.push({
          age: {
            $gte: 30,
            $lt: 50,
          },
        });
      } else if (query._age == "50") {
        filter.$and.push({
          age: {
            $gte: 50,
            $lt: 60,
          },
        });
      } else if (query._age == "60") {
        filter.$and.push({
          age: {
            $gte: 60,
            $lt: 100,
          },
        });
      }
    }

    // Filter po danu,tjednu,mjesecu i godini
    if (query._day) {
      if (query._day == "day") {
        filter.$and.push({
          eventDate: {
            $gte: moment().startOf("day").toDate(),
            $lt: moment().endOf("day").toDate(),
          },
        });
      } else if (query._day == "week") {
        filter.$and.push({
          eventDate: {
            $gte: moment().startOf("week").toDate(),
            $lt: moment().endOf("week").toDate(),
          },
        });
      } else if (query._day == "month") {
        filter.$and.push({
          eventDate: {
            $gte: moment().startOf("month").toDate(),
            $lt: moment().endOf("month").toDate(),
          },
        });
      } else if (query._day == "year") {
        filter.$and.push({
          eventDate: {
            $gte: moment().startOf("year").toDate(),
            $lt: moment().endOf("year").toDate(),
          },
        });
      }
    }
  }

  console.log("Filter za Mongo", filter);

  let cursor = await db
    .collection("events")
    .find(filter)
    .sort({ postedAt: -1 });
  let results = await cursor.toArray();

  results.forEach((e) => {
    e.id = e._id;
    delete e._id;
  });

  res.json(results);
});

//Dohvat eventa po id-u
app.get("/events/:id", async (req, res) => {
  // parametri rute dostupni su u req.params
  let id = req.params.id;

  // spoji se na bazu
  let db = await connect();

  //dohvat eventa po id-u
  let document = await db
    .collection("events")
    .findOne({ _id: mongo.ObjectId(id) });

  res.json(document);
});

//Dodaj novi event
app.post("/events", async (req, res) => {
  let db = await connect();
  let doc = req.body;

  doc.eventDate = new Date(doc.eventDate);

  let result = await db.collection("events").insertOne(doc);
  if (result.insertedCount == 1) {
    res.json({
      status: "success",
      id: result.insertedId,
    });
  } else {
    res.json({
      status: "fail",
    });
  }
});

//Dodaj broj i osobu koja ide na event
app.patch("/event/:id", async (req, res) => {
  let doc = req.body;
  delete doc._id;
  let id = req.params.id;
  let db = await connect();

  let result = await db.collection("events").updateOne(
    { _id: mongo.ObjectId(id) },
    {
      $set: {
        people: doc.people,
      },
      $push: {
        going: doc.going,
      },
    }
  );
  if (result.modifiedCount == 1) {
    res.json({
      status: "success",
      id: result.insertedId,
    });
  } else {
    res.json({
      status: "fail",
    });
  }
});

// Dodaj novi komentar na event
app.post("/chat", async (req, res) => {
  let db = await connect();
  let doc = req.body;
  let result = await db.collection("chat").insertOne(doc);

  if (result.insertedCount == 1) {
    res.json({
      status: "success",
      id: result.insertedId,
    });
  } else {
    res.json({
      status: "fail",
    });
  }
});

// Dohvat svih chatova za određeni event
app.get("/chat/:id", async (req, res) => {
  // parametri rute dostupni su u req.params
  let id = req.params.id;

  // spoji se na bazu
  let db = await connect();

  const cursor = db
    .collection("chat")
    .find({ event_id: id })
    .sort({ postedAt: -1 });

  if ((await cursor.countDocuments) === 0) {
    console.log("No documents found!");
  }

  let results = await cursor.toArray();

  results.forEach((e) => {
    e.id = e._id;
    delete e._id;
  });

  res.json(results);
});

// dohvat svih evenat-a za određenog korisnika
app.get("/myevents/:email", async (req, res) => {
  let email = req.params.email;

  // dohvati sve evente koji je korisnik kreirao i na koje se prijavio
  let filter = {
    $or: [{ createdBy: email }, { going: email }],
  };

  // spoji se na bazu
  let db = await connect();

  const cursor = db.collection("events").find(filter).sort({ postedAt: -1 });

  if ((await cursor.countDocuments) === 0) {
    console.log("No documents found!");
  }

  let results = await cursor.toArray();

  results.forEach((e) => {
    e.id = e._id;
    delete e._id;
  });

  res.json(results);
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));
