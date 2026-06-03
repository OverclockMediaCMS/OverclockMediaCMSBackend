import express from 'express';
import {sequelize} from './db.ts'
import cors from 'cors';

//instructions for setting up connection in db.ts
await sequelize.tryConnect();
await sequelize.seedDummyData();

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());


export const IndexRequestHandler = (req: express.Request, res: express.Response) => {
  console.log(req, res);
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
}

export const GetUserHandler = async (req: express.Request, res: express.Response)=> {
  const result = await sequelize.GetAllUsers();
  res.json(result);
}

export const GetUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const obj = await sequelize.GetUserById(parseInt(id as string));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
}

export const SearchUsersHandler = async (req: express.Request, res: express.Response) => {
  const { FirstName, LastName, Email } = req.query;

  const obj = await sequelize.SearchUsers({
    FirstName: FirstName as string,
    LastName: LastName as string,
    Email: Email as string
  });

  res.json(obj);
};

app.get("/", IndexRequestHandler);

app.get("/users", GetUserHandler);

app.get("/users/:id", GetUserByIdHandler);

app.get("/users/search", SearchUsersHandler);

app.get("/posts", async (req, res)=> {
  let result = await sequelize.GetAllPosts();
  res.json(result);
});

app.get("/media", async (req, res)=> {
  let result = await sequelize.GetAllMedia();
  res.json(result);
});

app.get("/media/:like", async (req, res)=> {
  let name = req.params.like;
  let result = await sequelize.GetMediaThatContains(name);
  res.json(result);
});


app.get("/tags", async (req, res)=> {
  let result = await sequelize.GetAllTags();
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