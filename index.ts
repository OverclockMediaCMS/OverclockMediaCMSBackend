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
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Users Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
}

export const GetUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const result = await sequelize.GetUserById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 404,
      response : "Error - User Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
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
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Posts Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const GetMediaHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllMedia();
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Media Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const GetMediaContainsNameHandler = async (req: express.Request, res: express.Response) => {
  let name = req.params.like;
  let result = await sequelize.GetMediaThatContains(name as string);
  res.json(result);
};

export const GetTagsHandler = async (req: express.Request, res: express.Response) => {
  let result = await sequelize.GetAllTags();
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Tags Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const GetPostByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const result = await sequelize.GetPostById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Post Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const PostUserHandler = async (req: express.Request, res: express.Response) => {
  const { FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role } = req.body;
  const result = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role);
  if (!result) {
    const response = {
      status : 500,
      response : "Internal Error - Cannot Create User"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const PostCommentHandler = async (req: express.Request, res: express.Response) => {
  const { Description, UserId, PostId } = req.body;
  const result = await sequelize.PostComment(Description, UserId, PostId);
  if (!result) {
    const response = {
      status : 500,
      response : "Internal Error - Cannot Create Post"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
}

export const SearchPostByNameHandler = async (req: express.Request, res: express.Response) => {
  let name = req.params.like;
  let result = await sequelize.GetPostThatContains(name as string);
  res.json(result);
};

export const GetCommentsByPostIdHandler = async (req: express.Request, res: express.Response) => {
  const { postid } = req.params;
  const result = await sequelize.GetCommentsByPostId(parseInt(postid as string));
  if (!result) {
    const response = {
      status : 404,
      response : "Error - Cannot Get Comments"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const RegisterUserHandler = async (req: express.Request, res: express.Response) => {
  const { Email, FirstName, LastName, Password } = req.body;
  const result = await sequelize.RegisterUser(Email, FirstName, LastName, Password);
  if (!result) {
    const response = {
      status : 500,
      response : "Internal Error - Cannot Create User or User already exists"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
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
  const result = await sequelize.DeleteUserById(parseInt(id as string));
  if (!result) {
    const response = {
      status : 500,
      response : "Internal Error - Cannot Delete User"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
};

export const UpdateUserByIdHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { FirstName, LastName, Email, Role, MobilePhone, InternalPhone } = req.body;
  try {
    const result = await sequelize.UpdateUserById(parseInt(id as string), {
      FirstName,
      LastName,
      Email,
      Role,
      MobilePhone,
      InternalPhone
    });
    if (!result) {
    const response = {
      status : 404,
      response : "Error - User Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status : 200,
      response : result
    }
    res.status(200).json(response);
  }
  } catch (error) {
    console.error(error);
    const response = {
      status : 500,
      response : "Server Error"
    }
    res.status(500).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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
    res.status(200).json(response);
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