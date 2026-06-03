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

export const GetPostsHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllPosts();
  res.json(result);
};

export const GetMediaHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllMedia();
  res.json(result);
};

export const GetMediaContainsNameHandler = async (req: express.Request, res: express.Response) => {
  let name = req.params.like;
  let result = await sequelize.GetMediaThatContains(name as string);
  res.json(result);
};

export const GetTagsHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllTags();
  res.json(result);
};

export const GetPostByIdHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const obj = await sequelize.GetPostById(parseInt(id as string));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
};

export const PostUserHandler = async (req: express.Request, res: express.Response) => {
  const { FirstName, LastName, Email, PasswordHash } = req.body;
  const obj = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash);
  res.json(obj);
};

export const DeleteUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const obj = await sequelize.DeleteUserById(parseInt(id as string));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
};

app.get("/", IndexRequestHandler);

app.get("/users", GetUserHandler);

app.get("/users/:id", GetUserByIdHandler);

app.get("/users/search", SearchUsersHandler);

app.get("/posts", GetPostsHandler);

app.get("/media", GetMediaHandler);

app.get("/media/:like", GetMediaContainsNameHandler);

app.get("/tags", GetTagsHandler);

app.get("/posts/:id", GetPostByIdHandler);

app.post("/users/create", PostUserHandler);

app.delete("/users/:id", DeleteUserByIdHandler);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});