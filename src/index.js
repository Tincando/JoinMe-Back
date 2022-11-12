import express from "express";
import storage from "./memory_storage";
import cors from "cors";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());

app.get("/posts", (req, res) => {
  let posts = storage.posts;
  let query = req.query;

  if (query.city) {
    console.log(`Treba pretražiti po 'gradu' = ${query.city}`);
    posts = posts.filter((x) => x.city == query.city);
  }

  res.json(posts);
});
app.listen(port, () => console.log(`Slušam na portu ${port}!`));
