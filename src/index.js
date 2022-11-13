import express from "express";
import storage from "./memory_storage";
import cors from "cors";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors(), express.json());

app.get("/posts", (req, res) => {
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
