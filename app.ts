import express, { json } from 'express';
import {sequelize} from './db.ts'


const app = express();
const PORT = "3000";

app.get("/", (req, res) => {
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
});

app.use(express.json());

const users = [
  { "id" : "1","name" : "Tim" },
  { "id" : "2","name" : "Tom" },
  { "id" : "3","name" : "Tem" },
]

app.get("/users", (req, res)=> {
  res.send(users);
});

app.get("/users/:id", (req, res) => {
  const {id} = req.params;
  const obj = users.find((u) => u.id === id);
  if (!obj){
    return res.status(404).send("not found");
  }
  res.send(obj);
});

app.post("/users/create", (req, res) => {
  const { name } = req.body;
  const id = parseInt(users[users.length-1].id) + 1;
  const obj = {"id" : id.toString(), "name" : name };
  users.push(obj);
  res.send(obj);
});

app.delete("/users/:id", (req, res) => {
  const {id} = req.params;
  const index = users.findIndex((u) => u.id === id);
  if (index < 0){
    return res.status(404).send("not found");
  }
  users.splice(index,1);
  res.send("Deleted id:" + id);  
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});