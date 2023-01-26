const { MongoClient } = require("mongodb");
import dotenv from "dotenv";
dotenv.config();

var mongo = require("mongodb").MongoClient;

let connection_string = process.env.CONNECTION_STRING;

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
