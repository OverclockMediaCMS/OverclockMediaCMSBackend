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

app.post("/users/create", (req, res) => {
  const { name } = req.body;
  res.send();
});

app.delete("/users/:id", (req, res) => {
  const {id} = req.params;
  res.send("Deleted id:" + id);  
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});