import express, { response } from 'express';
import { sequelize } from './db.ts'
import cors from 'cors';
import helmet from 'helmet';
import { parse } from 'node:path';

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

export const GetUsersHandler = async (req: express.Request, res: express.Response) => {
  const result = await sequelize.GetAllUsers();
  res.json(result);
}

export const GetUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const obj = await sequelize.GetUserById(parseInt(id as string));
  if (!obj){
    res.status(404).send("not found");
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
  const { id } = req.params;
  const obj = await sequelize.GetPostById(parseInt(id as string));
  if (!obj){
    res.status(404).send("not found");
  }
  res.json(obj);
};

export const PostUserHandler = async (req: express.Request, res: express.Response) => {
  const { FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role } = req.body;
  const obj = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role);
  res.json(obj);
};

export const PostCommentHandler = async (req: express.Request, res: express.Response) => {
  const { Description, UserId, PostId } = req.body;
  const obj = await sequelize.PostComment(Description, UserId, PostId);
  res.json(obj);
}

export const SearchPostByNameHandler = async (req: express.Request, res: express.Response) => {
  let name = req.params.like;
  let result = await sequelize.GetPostThatContains(name as string);
  res.json(result);
};

export const GetCommentsByPostIdHandler = async (req: express.Request, res: express.Response) => {
  const { postid } = req.params;
  const obj = await sequelize.GetCommentsByPostId(parseInt(postid as string));
  if (!obj){
    res.status(404).send("not found");
  }
  res.json(obj);
};

export const RegisterUserHandler = async (req: express.Request, res: express.Response) => {
  const { Email, FirstName, LastName, Password } = req.body;
  const isSuccess = await sequelize.RegisterUser(Email, FirstName, LastName, Password);
  if (!isSuccess){
    res.status(409).send("This email address is already registered.");
  }
  res.status(200).send("Register user successful");
}

export const LoginUserHandler = async (req: express.Request, res: express.Response) => {
  const { Email, Password } = req.body;
  const isSuccess = await sequelize.LoginUser(Email, Password);
  if (!isSuccess){
    res.status(401).send("Invaild Email or Password");
  } else {
    res.status(200).send("Login successful");
  }
}

export const DeleteUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const obj = await sequelize.DeleteUserById(parseInt(id as string));
  if (!obj){
    return res.status(404).send("Not found");
  }
  res.json(obj);
};

export const UpdateUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { FirstName, LastName, Email, Role, MobilePhone, InternalPhone } = req.body;
  try {
    const obj = await sequelize.UpdateUserById(parseInt(id as string), {
      FirstName,
      LastName,
      Email,
      Role,
      MobilePhone,
      InternalPhone
    });
    if (!obj) {
      return res.status(404).send("User profile not found");
    }
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } 
};

export const CreatePostHandler = async (req: express.Request, res: express.Response) => {
  const { Title, Body, isDraft, UserId} = req.body;
  const result = await sequelize.PostPost(Title, Body, isDraft, UserId);
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Create Post - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const DeletePostHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const result = await sequelize.DeletePostById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Delete Post - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const PostMediaHandler = async (req: express.Request, res: express.Response) => {
  const {Title, FilePath, FileExtension} = req.body;
  const result = await sequelize.PostMedia(Title, FilePath, FileExtension);
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Create Media - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const DeleteMediaHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const result = await sequelize.DeleteMediaById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Delete Media - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const PostTagHandler = async (req: express.Request, res: express.Response) => {
  const {Title} = req.body;
  const result = await sequelize.PostTag(Title);
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Create Tag - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const DeleteTagHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const result = await sequelize.DeleteTagById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Delete Tag - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const DeleteCommentHandler = async (req: express.Request, res: express.Response) => {
  const {id} = req.params;
  const result = await sequelize.DeleteCommentById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Delete Comment - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

export const PostMediaPostHandler = async (req: express.Request, res: express.Response) => {
  const {MediaId , PostId} = req.body;
  const result = await sequelize.PostMediaPost(MediaId, PostId);
  if (!result) {
    const response = {
      status : 500,
      response : "Cannot Create MediaPost - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.send(200).json(response);
  }
}

app.get("/", IndexRequestHandler);

// User Endpoints
app.get("/users", GetUsersHandler);

app.get("/users/search", SearchUsersHandler);

app.get("/users/:id", GetUserByIdHandler);

app.put("/users/:id", UpdateUserByIdHandler);

app.post("/users/create", PostUserHandler);

app.post("/users/register", RegisterUserHandler);

app.post("/users/login", LoginUserHandler);

app.delete("/users/:id", DeleteUserByIdHandler);

// Post Endpoints
app.get("/posts", GetPostsHandler);

app.get("/posts/:id", GetPostByIdHandler);

app.get("/posts/:like", SearchPostByNameHandler);

app.post("/posts/create", CreatePostHandler);

app.delete("/posts/:id", DeletePostHandler);

// Media Endpoints
app.get("/media", GetMediaHandler);

app.get("/media/:like", GetMediaContainsNameHandler);

app.post("/media/create", PostMediaHandler);

app.delete("/media/:id", DeleteMediaHandler);

// Tag Endpoints
app.get("/tags", GetTagsHandler);

app.post("/tags/create", PostTagHandler);

app.delete("/tags/:id", DeleteTagHandler);

// Comment Endpoints
app.post("/comment", PostCommentHandler);

app.get("/comments/:postid", GetCommentsByPostIdHandler);

app.delete("/comments/:id", DeleteCommentHandler);

// TagPost Endpoints - TBD

// app.post("/tag-post/create", ); // TBD PostTagPost

// MediaPost Endpoints - TBD

app.post("/media-post/create", PostMediaPostHandler);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});