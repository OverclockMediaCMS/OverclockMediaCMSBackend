import express, { json } from 'express';
import {sequelize} from './db.ts'

await sequelize.tryConnect();
await sequelize.seedDummyData();
const app = express();
const PORT = "3000";

app.use((req, res, next) => {
  const reqApp =req as any;
  reqApp.db = { hello: "Hello World!" };
  next();
});

app.get("/", (req, res) => {
  const reqApp = req as any;
  const db = reqApp.db;
  console.log(db);
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
});

app.use(express.json());

const users = [
  { "id" : "1","name" : "Tim" },
  { "id" : "2","name" : "Tom" },
  { "id" : "3","name" : "Tem" },
]

const posts = [
  { "id" : '1', "userId" : "1", "post" : "Hello, this is my first post"},
  { "id" : '2', "userId" : "1", "post" : "Hello, this is my second post"},
  { "id" : '3', "userId" : "1", "post" : "Hello, this is my third post"},
]

app.get("/users", (req, res)=> {
  const { name, orderBy } = req.query;
  let obj = users;
  if (name){
    obj = obj.filter((u) => u.name.includes(name.toString()));
  }
  if (orderBy) {
    if (orderBy === "dsc"){
      obj = obj.toReversed();
    }
  }
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

app.get("/users/:id/posts", (req, res) => {
  const {id} = req.params;
  const obj = posts.filter((p) => p.userId === id);
  if (!obj){
    return res.status(404).send("not found");
  }
  res.send(obj);
});

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.get("/posts/:id", (req, res) => {
  const {id} = req.params;
  const obj = posts.find((p) => p.id === id);
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

app.post("/users/:id/posts/create", (req, res) => {
  const { id, post } = req.body;
  const postId = parseInt(post[post.length-1].id) + 1;
  const obj = { "id" : postId.toString(), "userId" : id.toString(), "post" : post};
  posts.push(obj);
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

app.delete("/post/:id", (req, res) => {
  const {id} = req.params;
  const index = posts.findIndex((p) => p.id === id);
  if (index < 0){
    return res.status(404).send("not found");
  }
  posts.splice(index,1);
  res.send("Deleted id:" + id);  
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});