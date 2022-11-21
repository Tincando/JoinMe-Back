import express from "express";
import storage from "./memory_storage";
import cors from "cors";

import connect from "./db.js";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors(), express.json());

app.get("/posts", async (req, res) => {
  let db = await connect();
  let query = req.query;

  let selekcija = {};

  if (query._any) {
    // za upit: /posts?_all=pojam1 pojam2
    let pretraga = query._any;
    let terms = pretraga.split(" ");

    let atributi = ["title", "createdBy"];

    selekcija = {
      $and: [],
    };

    terms.forEach((term) => {
      let or = {
        $or: [],
      };

      atributi.forEach((atribut) => {
        or.$or.push({
          [atribut.toLocaleLowerCase()]: new RegExp(term.toLocaleLowerCase()),
        });
      });
      selekcija.$and.push(or);
    });
  }
  console.log("Selekcija", selekcija);

  let cursor = await db.collection("events").find(selekcija);
  let results = await cursor.toArray();

  results.forEach((e) => {
    e.id = e._id;
    delete e._id;
  });

  res.json(results);
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
app.listen(port, () => console.log(`Slušam na portu ${port}!`));
