import dotenv from "dotenv";
dotenv.config();

import express from "express";
import storage from "./memory_storage";
import cors from "cors";
import connect from "./db.js";
import auth from "./auth.js";

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

app.get("/events", async (req, res) => {
  let db = await connect();
  let query = req.query;

  console.log(query);

  let filter = {};
  if (query._city) {
    filter = {
      city: { $regex: query._city, $options: "i" },
    };
  }
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

    if (query._age) {
      filter.$and.push({
        age: { $regex: query._age, $options: "i" },
      });
    }

    if (query._day) {
      filter.$and.push({
        day: { $regex: query._day, $options: "i" },
      });
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

app.get("/events/:id", async (req, res) => {
  // parametri rute dostupni su u req.params
  let id = req.params.id;
  // spoji se na bazu
  let db = await connect();
  // za dohvat jednog dokumenta koristimo `findOne()`
  let document = await db
    .collection("events")
    .findOne({ _id: mongo.ObjectId(id) });
  res.json(document);
});

app.get("/posts_memory", (req, res) => {
  let posts = storage.posts;
  let query = req.query;

  if (query.city) {
    console.log(`Treba pretražiti po 'gradu' = ${query.city}`);
    posts = posts.filter(
      (x) => x.city.toLocaleLowerCase() == query.city.toLocaleLowerCase()
    );
  }

  res.json(posts);
});

app.post("/posts", (req, res) => {
  let data = req.body;
  data.id = 1 + storage.posts.reduce((max, el) => Math.max(el.id, max), 0);
  console.log(data);
  storage.posts.push(data);

  res.json(data);
});

app.post("/events", async (req, res) => {
  let db = await connect();
  let doc = req.body;
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

app.patch("/event/:id", async (req, res) => {
  let doc = req.body;
  delete doc._id;
  let id = req.params.id;
  let db = await connect();
  let result = await db.collection("events").updateOne(
    { _id: mongo.ObjectId(id) },
    {
      $set: doc,
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

app.listen(port, () => console.log(`Slušam na portu ${port}!`));
