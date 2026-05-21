import express, { json } from 'express';
import {sequelize} from './db.ts'
import cors from 'cors';

//instructions for setting up connection in db.ts
await sequelize.tryConnect();
await sequelize.seedDummyData();

const app = express();
const PORT = "3000";
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
});


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

app.get("/posts", async (req, res)=> {
  let result = await sequelize.GetAllPosts();
  res.json(result);
});

app.get("/posts/:id", async (req, res) => {
  const {id} = req.params;
  const obj = await sequelize.GetPostById(parseInt(id));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
});

app.post("/users/create", async (req, res) => {
  const { FirstName, LastName, Email, PasswordHash } = req.body;
  const obj = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash);
  res.json(obj);
});

app.delete("/users/:id", async (req, res) => {
  const {id} = req.params;
  const obj = await sequelize.DeleteUserById(parseInt(id));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});