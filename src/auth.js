import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
// Kreiranje indeksa pri pokretanju aplikacije (ukoliko već ne postoji)
(async () => {
  let db = await connect();
  db.collection("users").createIndex({ username: 1 }, { unique: true });
})();
export default {
  async registerUser(userData) {
    let db = await connect();
    let result;
    try {
      let doc = {
        username: userData.username,
        // lozinku ćemo hashirati pomoću bcrypta
        password: await bcrypt.hash(userData.password, 8),
        name: userData.name,
      };
      result = await db.collection("users").insertOne(doc);
    } catch (e) {
      if (e.name == "MongoError") {
        if (e.code == 11000) {
          throw new Error("Username already exists");
        }
      }
    }
    if (result && result.insertedCount == 1) {
      return result.insertedId;
    } else {
      throw new Error("Cannot register user");
    }
  },
  async authenticateUser(username, password) {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: username });
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password; // ne želimo u tokenu, token se sprema na klijentu
      let token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return {
        token,
        username: user.username,
      };
    } else {
      throw new Error("Cannot authenticate");
    }
  },

  verify(req, res, next) {
    if (req.headers["authorization"]) {
      try {
        let authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send(); // HTTP invalid requets
        } else {
          let token = authorization[1];
          // spremi uz upit rezultat JWT provjere tokena (rezultat su podaci o tokenu)
          // verify baca grešku(exception) ako ne uspije provjera
          req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET);
          return next(); // Sve je ok, možemo prijeći na konkretan upit
        }
      } catch (err) {
        return res.status(403).send(); // HTTP not-authorized
      }
    } else {
      return res.status(401).send(); // HTTP invalid request
    }
  },
};
