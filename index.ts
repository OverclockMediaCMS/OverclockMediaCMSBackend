import express, { response } from 'express';
import { sequelize } from './db.ts'
import cors from 'cors';
import helmet from 'helmet';
import { parse } from 'node:path';
import jwt from 'jsonwebtoken'
import 'dotenv/config';

let SECRET_KEY = process.env.SECRET_KEY;
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { error } from 'node:console';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Saves files into the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generates a unique filename using timestamp to avoid overwriting duplicates
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Initialize Multer middleware
const upload = multer({ storage: storage });

//instructions for setting up connection in db.ts
await sequelize.tryConnect();
await sequelize.seedDummyData();

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(helmet());

function createToken(uId : number) : string | null {
  if(!SECRET_KEY){
    console.log("no secret key found");
    return null;
  }
  const token = jwt.sign({ userId: uId}, SECRET_KEY, {
    expiresIn: '15m'
  }); 
  return token;
}

function validateToken(req : express.Request, res : express.Response) : boolean {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token){
    res.status(401).json({error: "Invalid Token"});
    return false;
  }
  try{
    const decodedToken = jwt.verify(token, SECRET_KEY!);
  }catch(err){
    res.status(401).json({error: "Invalid Token"});
    return false;
  }
  return true;
}

app.use('/media-files', express.static('uploads', {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*'); 
  }
}));


export const IndexRequestHandler = (req: express.Request, res: express.Response) => {
  console.log(req, res);
  res.send("Hello Overclock Media Backend!");
  console.log("Response sent");
}

export const GetUsersHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const result = await sequelize.GetAllUsers();
  if (!result) {
    const response = {
      status: 404,
      response: "Error - Users Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const GetUserByIdHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { id } = req.params;
  const result = await sequelize.GetUserById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 404,
      response: "Error - User Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const SearchUsersHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { FirstName, LastName, Email } = req.query;

  const obj = await sequelize.SearchUsers({
    FirstName: FirstName as string,
    LastName: LastName as string,
    Email: Email as string
  });

  res.json(obj);
};

export const GetTagsHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  let result = await sequelize.GetAllTags();
  if (!result) {
    const response = {
      status: 404,
      response: "Error - Tags Not Found"
    }
    res.status(404).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
};


export const PostUserHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role } = req.body;
  const result = await sequelize.PostUser(FirstName, LastName, Email, PasswordHash, InternalPhone, MobilePhone, Role);
  if (!result) {
    const response = {
      status: 500,
      response: "Internal Error - Cannot Create User"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
};

export const PostCommentHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  const { Description, UserId, PostId } = req.body;
  const result = await sequelize.PostComment(Description, UserId, PostId);
  if (!result) {
    const response = {
      status: 500,
      response: "Internal Error - Cannot Create Post"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}


export const GetCommentsByPostIdHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { postid } = req.params;
  const result = await sequelize.GetCommentsByPostId(parseInt(postid as string));
  if (!result) {
    res.status(404).json(response);
  } else {
    res.status(200).json(result);
  }
};

export const RegisterUserHandler = async (req: express.Request, res: express.Response) => {
  const { Email, FirstName, LastName, Password } = req.body;
  const isSuccess = await sequelize.RegisterUser(Email, FirstName, LastName, Password);
  if (!isSuccess) {
    return res.status(409).json({ error: "This email address is already registered." });
  }
  res.status(200).end();
}

export const LoginUserHandler = async (req: express.Request, res: express.Response) => {
  const { Email, Password } = req.body;
  const user = await sequelize.LoginUser(Email, Password);
  if (user == undefined) {
    return res.status(401).json({ error: "Invaild Email or Password" });
  } else {
    const token = createToken(user.dataValues.id);
    if(token == null)
      return res.status(401).json({ error: "Login valid with server error" });
    console.log(user + token)
    res.status(200).json({user, token});
  }
}

export const DeleteUserByIdHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { id } = req.params;
  const result = await sequelize.DeleteUserById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 500,
      response: "Internal Error - Cannot Delete User"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
};

export const UpdateUserByIdHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
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
  if(!validateToken(req, res))
    return;  
  try {
    const { Title, Body, isDraft, UserId } = req.body;
    const files = (req.files as Express.Multer.File[]) || []; 
    const isDraftBoolean = isDraft === 'true' || isDraft === true;

    // 1. Create the only one parent Post row
    const createdPost = await sequelize.PostPost(Title, Body, isDraftBoolean, Number(UserId));
    
    if (!createdPost) {
      return res.status(500).json({ error: "Could not create post record." });
    }

    // 2. If files are attached, group their data into JSON arrays
    if (files.length > 0) {
      const filePaths: string[] = [];
      const fileExtensions: string[] = [];

      files.forEach(file => {
        filePaths.push(file.filename);
        fileExtensions.push(file.originalname.split('.').pop() || '');
      });
      
      // Save media as string in one row
      const mediaAsset = await sequelize.PostMedia(
        Title || files[0].originalname, 
        JSON.stringify(filePaths),       // Stores as: '["file1.png","file2.jpg"]'
        JSON.stringify(fileExtensions),  // Stores as: '["png","jpg"]'
        isDraftBoolean, 
        Number(UserId)
      );
      
      // Link post and media that it
      if (mediaAsset) {
        await sequelize.PostMediaPost(mediaAsset.id, createdPost.id);
      }
    }

    return res.status(200).json({ response: createdPost });

  } catch (err: any) {
    console.error("CreatePostHandler Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const DeletePostHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { id } = req.params;
  const result = await sequelize.DeletePostById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Delete Post - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const PostMediaHandler = async (req: express.Request, res: express.Response) => {
  // try {
  //   const files = req.files as Express.Multer.File[];

  //   if (!files || files.length === 0) {
  //     return res.status(400).json({ error: "No files uploaded" });
  //   }

  //   const { Title, isDraft, UserId } = req.body;
  //   const numberedUserId = Number(UserId);
  //   const isDraftBoolean = isDraft === 'true' || isDraft === true;
  //   const savedAssets = [];

  //   for (const file of files) {
  //     const filePath = file.path;
  //     const fileExtension = path.extname(file.originalname).replace('.', '');
  //     const finalTitle = Title || file.originalname;

  //     const result = await sequelize.PostMedia(finalTitle, filePath, fileExtension, isDraftBoolean, numberedUserId);
  //     if (result) {
  //       savedAssets.push(result);
  //     }
  //   }

  //   res.status(200).json({ status: 200, response: savedAssets[0] });
  // } catch (err) {
  //   console.error("PostMediaHandler Error:", err);
  //   res.status(500).json({ error: "Server upload error" });
  // }
  if(!validateToken(req, res))
    return;  
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const { Title, isDraft, UserId } = req.body;
    const numberedUserId = Number(UserId);
    const isDraftBoolean = isDraft === 'true' || isDraft === true;

    // APPROACH B COMPATIBLE: Group all files into arrays just like CreatePostHandler does
    const filePaths: string[] = [];
    const fileExtensions: string[] = [];

    files.forEach(file => {
      filePaths.push(file.filename);
      fileExtensions.push(file.originalname.split('.').pop() || '');
    });

    // Save exactly ONE row in your Media table with JSON arrays
    const result = await sequelize.PostMedia(
      Title || files[0].originalname, 
      JSON.stringify(filePaths),       // Stores as: '["file1.png","file2.jpg"]'
      JSON.stringify(fileExtensions),  // Stores as: '["png","jpg"]'
      isDraftBoolean, 
      numberedUserId
    );

    res.status(200).json({ status: 200, response: result });
  } catch (err) {
    console.error("PostMediaHandler Error:", err);
    res.status(500).json({ error: "Server upload error" });
  }
}

export const DeleteMediaHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  const { id } = req.params;
  const result = await sequelize.DeleteMediaById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Delete Media - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const PostTagHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { Title } = req.body;
  const result = await sequelize.PostTag(Title);
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Create Tag - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const DeleteTagHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  const { id } = req.params;
  const result = await sequelize.DeleteTagById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Delete Tag - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const DeleteCommentHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  const { id } = req.params;
  const result = await sequelize.DeleteCommentById(parseInt(id as string));
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Delete Comment - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const PostMediaPostHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  const { MediaId, PostId } = req.body;
  const result = await sequelize.PostMediaPost(MediaId, PostId);
  if (!result) {
    const response = {
      status: 500,
      response: "Cannot Create MediaPost - Internal Error"
    }
    res.status(500).json(response);
  } else {
    const response = {
      status: 200,
      response: result
    }
    res.status(200).json(response);
  }
}

export const GetPostsHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;
  let result;
  const { id, contains, tagId } = req.query;

  if (id != undefined) {
    result = await sequelize.GetPostById(parseInt(id as string));
  } else if (contains != undefined || tagId != undefined) {
    const parsedTagId = tagId ? parseInt(tagId as string) : undefined;
    result = await sequelize.GetPostThatContains((contains as string) || "", parsedTagId);
  } else {
    result = await sequelize.GetMostRecentPosts();
  }
  res.json(result);
};

export const GetMediaHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  let result;
  const { id, contains, fileExtension } = req.query;

  if (id != undefined) {
    result = await sequelize.GetMediaById(parseInt(id as string));
  } else if (contains != undefined || fileExtension != undefined) {
    // Pass both parameters directly to your clean database class method
    result = await sequelize.GetMediaThatContains(
      (contains as string) || "",
      fileExtension as string
    );
  } else {
    result = await sequelize.GetMostRecentMedia();
  }

  res.json(result);
};

export const GetDraftsHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;  
  const { id, userId } = req.query;

  if (id != undefined) {
    const result = await sequelize.GetPostById(parseInt(id as string));
    return res.json(result);
  }

  if (!userId) {
    return res.status(400).json();
  }

  const parsedUserId = parseInt(userId as string);

  const [postDrafts, mediaDrafts] = await Promise.all([
    sequelize.GetDraftPosts(parsedUserId),
    sequelize.GetMediaDrafts(parsedUserId)
  ]);

  const formattedPosts = postDrafts.map((p: any) => {
    const post = typeof p.toJSON === 'function' ? p.toJSON() : p;
    return { ...post, type: 'post' };
  });

  const formattedMedia = mediaDrafts.map((m: any) => {
    const media = typeof m.toJSON === 'function' ? m.toJSON() : m;
    return { ...media, type: 'media' };
  });

  const combined = [...formattedPosts, ...formattedMedia].sort(
    (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
  );

  res.json(combined);
};

export const DeleteDraftHandler = async (req: express.Request, res: express.Response) => {
  if(!validateToken(req, res))
    return;    
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400);
  }

  const targetId = parseInt(id as string);
  let result;

  try {
    if (type === 'post') {
      result = await sequelize.DeletePostById(targetId);
    } else if (type === 'media') {
      result = await sequelize.DeleteMediaById(targetId);
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'post' or 'media'" });
    }

    if (!result) {
      return res.status(404).json({ error: "Draft not found in database" });
    }

    res.status(200).json({ status: 200, response: result });
  } catch (error) {
    console.error("DeleteDraftHandler Error:", error);
    res.status(500).json({ error: "Cannot Delete Draft" });
  }
};



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

app.post("/posts/create", upload.array('media', 10), CreatePostHandler);

app.delete("/posts/:id", DeletePostHandler);

// Media Endpoints
app.get("/media", GetMediaHandler);

app.post("/media/create", upload.array('media', 10), PostMediaHandler);

app.delete("/media/:id", DeleteMediaHandler);



// Tag Endpoints
app.get("/tags", GetTagsHandler);

app.post("/tags/create", PostTagHandler);

app.delete("/tags/:id", DeleteTagHandler);

// Comment Endpoints
app.post("/comment", PostCommentHandler);

app.get("/comments/:postid", GetCommentsByPostIdHandler);

app.delete("/comments/:id", DeleteCommentHandler);

// Draft Endpoints
app.get("/drafts", GetDraftsHandler);

app.delete("/drafts", DeleteDraftHandler);



// TagPost Endpoints - TBD

// app.post("/tag-post/create", ); // TBD PostTagPost

// MediaPost Endpoints - TBD

app.post("/media-post/create", PostMediaPostHandler);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});