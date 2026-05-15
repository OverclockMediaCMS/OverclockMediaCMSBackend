import express, { json } from 'express';
import {sequelize} from './db.ts'

//instructions for setting up connection in db.ts
await sequelize.tryConnect();
//await sequelize.seedDummyData();

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

app.get("/users", async (req, res)=> {
  let result = await sequelize.GetAllUsers();
  res.json(result);
});

app.get("/users/:id", async (req, res) => {
  const {id} = req.params;
  const obj = await sequelize.GetUserById(parseInt(id));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
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