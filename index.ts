import express from 'express';
import {sequelize} from './db.ts'
import cors from 'cors';
import helmet from 'helmet';

//instructions for setting up connection in db.ts
await sequelize.tryConnect();
await sequelize.seedDummyData();

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(helmet());


export const IndexRequestHandler = (req: express.Request, res: express.Response) => {
  console.log(req, res);
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
}

export const GetPostsHandler = async (req: express.Request, res: express.Response) => {
  let result;
  const {id,contains} = req.query;
  
  if(id != undefined)
    result = await sequelize.GetPostById(parseInt(id as string));
  else if (contains != undefined)
    result = await sequelize.GetPostThatContains(contains as string);
  else
    result = await sequelize.GetMostRecentPosts();
  res.json(result);
};

export const GetUsersHandler = async (req: express.Request, res: express.Response)=> {
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

export const GetMediaHandler = async (req: express.Request, res: express.Response) => {
  let result;
  const {id,contains} = req.query;
  if(id != undefined)
    result = await sequelize.GetMediaById(parseInt(id as string));
  else if (contains != undefined)
    result = await sequelize.GetMediaThatContains(contains as string);
  else
    result = await sequelize.GetMostRecentMedia();
  res.json(result);
};

export const GetTagsHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllTags();
  res.json(result);
};

export const PostUserHandler = async (req: express.Request, res: express.Response) => {
  const { FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role } = req.body;
  const obj = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role);
  res.json(obj);
};

export const PostCommentHandler = async (req: express.Request, res: express.Response) => {
  const {Description, UserId, PostId} = req.body;
  const obj = await sequelize.PostComment(Description, UserId, PostId);
  res.json(obj);
}

export const GetCommentsHandler = async (req: express.Request, res: express.Response) => {
  const {postid} = req.params;
  const obj = await sequelize.GetCommentsByPostId(parseInt(postid as string));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
};

export const RegisterUserHandler = async (req: express.Request, res: express.Response) => {
  const {Email, FirstName, LastName, Password} = req.body;
  const isSuccess = await sequelize.RegisterUser(Email, FirstName, LastName, Password);
  if (!isSuccess){
    return res.status(409).json({error : "This email address is already registered."});
  }
  res.status(200).end();
}

export const LoginUserHandler = async (req: express.Request, res: express.Response) => {
  const {Email,Password} = req.body;
  const user = await sequelize.LoginUser(Email, Password);
  if (user == undefined){
    return res.status(401).json({error: "Invaild Email or Password"});
  } else {
    res.status(200).json(user);
  }
}

export const DeleteUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const obj = await sequelize.DeleteUserById(parseInt(id as string));
  if (!obj){
    return res.status(404).send("not found");
  }
  res.json(obj);
};


app.get("/", IndexRequestHandler);

app.get("/users", GetUsersHandler);

app.get("/users/search", SearchUsersHandler);

app.get("/users/:id", GetUserByIdHandler);

app.get("/posts", GetPostsHandler);

app.get("/media", GetMediaHandler);

app.get("/tags", GetTagsHandler);

app.post("/users/create", PostUserHandler);

app.post("/comment", PostCommentHandler);

app.post("/users/register", RegisterUserHandler);

app.post("/users/login", LoginUserHandler);

app.get("/comments/:postid", GetCommentsHandler);

app.delete("/users/:id", DeleteUserByIdHandler);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});