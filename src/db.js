const { MongoClient } = require("mongodb");

var mongo = require("mongodb").MongoClient;

let connection_string =
  "mongodb+srv://admin:admin@cluster0.hlvz389.mongodb.net/?retryWrites=true&w=majority";

let client = new MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;

// eksportamo Promise koji resolva na konekciju
export default () => {
  return new Promise((resolve, reject) => {
    // ako smo inicijalizirali bazu i klijent je još uvijek spojen
    if (db && client.connect) {
      resolve(db);
    } else {
      client.connect((err) => {
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
