import { Sequelize, DataTypes, Op } from 'sequelize';
import SQLite from 'sqlite3';
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
class OverclockSequelize extends Sequelize {
  async tryConnect() {
    try {
      await this.authenticate();
      console.log("Successfully connected");
    } catch (error) {
      console.error("Unable to connect to database", error);
    }
  }
  // calling this will seed the database tables
  async createModels() {

  }
  //calling this will seed the DB with some dummy data
  async seedDummyData() {
    await this.sync({ force: true });
    const u1 = User.build(
      {
        FirstName: 'u1',
        LastName: 'u1',
        Email: 'u1@email.com',
        PasswordHash: 'password'
      }
    );
    const u2 = User.build(
      {
        FirstName: 'u2',
        LastName: 'u2',
        Email: 'u2@email.com',
        PasswordHash: 'password'
      }
    );
    await u1.save();
    await u2.save();
    const tag1 = Tag.build(
      {
        Title: "Urgent"
      }
    )
    const tag2 = Tag.build(
      {
        Title: "Update"
      }
    )
    await tag2.save();
    await tag1.save();
    const p1 = Post.build(
      {
        Title: "This is a post",
        Body: "This is the body",
        isDraft: false,
        Date: new Date(),
        UserId: u1.dataValues.id
      }
    );
    const p2 = Post.build(
      {
        Title: "This is another post",
        Body: "This is the body",
        isDraft: false,
        Date: new Date(),
        UserId: u2.dataValues.id
      }
    );
    const m1 = Media.build(
      {
        Title: "photo1",
        FilePath : "media/photos/photo1",
        FileExtension: "jpg", 
        UserId: u1.dataValues.id,
        Date: new Date(),
      }
    );
    const m2 = Media.build(
      {
        Title: "video1",
        FilePath : "media/videos/video1",
        FileExtension: "mp4", 
        UserId: u1.dataValues.id,
        Date: new Date(),
      }
    );
    await m1.save();
    await m2.save();
    await p1.save();
    await p2.save();
    await (p1 as any).addTags(tag1);
    await (p2 as any).addTags(tag2);

  }
  async GetUserById(ID: number) {
    let user = await User.findOne({
      where: { id: ID },
      attributes: ['id',
        'FirstName',
        'LastName',
        'Email'
      ]
    });
    return user;
  }
  async GetAllUsers() {
    let users = await User.findAll({
      attributes: ['id',
        'FirstName',
        'LastName',
        'Email'
      ]
    });
    return users;
  }
  async GetPostById(ID: number) {
    let post = await Post.findOne({
      where: { id: ID },
      attributes: ['id',
          'Title',
          'Body',
          'isDraft',
          'Date',
        ],
      include: [{
        model: User,
        attributes: ['id',
          'FirstName',
          'LastName',
          'Email'
        ]
      },
    {model: Comment, include: [{model: User, attributes: ['id', 'FirstName', 'LastName']}]},
    {model: Tag}]
    });
    return post;
  }
  async GetAllPosts() {
    let posts = await Post.findAll({
      order : [['Date', 'DESC']],
      limit: 5,
      attributes: ['id',
          'Title',
          'Body',
          'isDraft',
          'Date',
        ],
      include: [{
        model: User,
        attributes: ['id',
          'FirstName',
          'LastName',
          'Email'
        ]
      },
      { model: Tag},
      { model : Comment}],
    });
    return posts;
  }
  async GetMediaById(ID: number) {
    let media = await Media.findOne({
      where: { id: ID }
    });
    return media;
  }
  async GetAllMedia() {
    let media = await Media.findAll({
      include: {
        model: User,
        attributes: ['id',
          'FirstName',
          'LastName',
          'Email',
        ]
      }
    });
    return media;
  }

  async SearchUsers(filters: { FirstName?: string; LastName?: string; Email?: string }) {
      const whereClause: any = {};

      if (filters.FirstName) {
        whereClause.FirstName = { [Op.like]: `%${filters.FirstName}%` };
      }
      if (filters.LastName) {
        whereClause.LastName = { [Op.like]: `%${filters.LastName}%` };
      }
      if (filters.Email) {
        whereClause.Email = { [Op.like]: `%${filters.Email}%` };
      }

      let users = await User.findAll({
          where: whereClause,
          attributes: ['id', 'FirstName', 'LastName', 'Email'],
          raw: true
      });

      return users;
  }

  async GetAllTags() {
    let tags = await Tag.findAll({});
    return tags;
  }
  async GetCommentsByPostId(id : number){
    let c = await Comment.findAll({
      where : { PostId : id},
      include: [{model: User, attributes: ['id', 'FirstName', 'LastName']}]
    });
    return c;
  }
  async GetMediaThatContains(word : string) {
    let media = await Media.findAll({
      where : {
        Title : {
          [Op.substring] : word
        }
      },
      include: {
        model: User,
        attributes: ['id',
          'FirstName',
          'LastName',
          'Email'
        ]
      }
    });
    return media;
  }
  async GetPostThatContains(word : string) {
    let p = await Post.findAll({
      where : {
        Title : {
          [Op.substring] : word
        }
      },
      include: [
        {
          model: User,
          attributes: ['id',
            'FirstName',
            'LastName',
            'Email'
          ]
        },
        {model: Tag },
        {model: Comment}
    ],
    });
    return p;
  }
  async PostUser(fName: string, lName: string, email: string, passwordHash: string, internalPhone : number, mobilePhone: number, role: string) {
    const u = await User.create({
      FirstName: fName,
      LastName: lName,
      Email: email,
      PasswordHash: passwordHash,
      InternalPhone : internalPhone,
      MobilePhone : mobilePhone,
      Role : role
    });
    return u.toJSON();
  }
  async PostPost(title : string, body : string, is_draft : boolean, date : string){
    const p = await Post.create({
        Title : title,
        Body : body,
        isDraft : is_draft,
        Date : date
    });
    return p.toJSON();
  }
  async PostMedia(title : string, filePath : string, fileExtension : string){
        const m = await Media.create({
            Title : title,
            FilePath : filePath,
            fileExtension : fileExtension
        });
        return m.toJSON();
  }
  async PostTag(title : string){
      const t = await Tag.create({
          Title : title
      });
      return t.toJSON();
  }

  async DeleteUserById(ID : number){
      let user = await User.findOne({
          where : {id: ID},
          attributes: [
              'id',
              'FirstName', 
              'LastName',
              'Email'
          ]
      });
      if (!user) return null;
  
      await user.destroy();
      return user;
  }
  
  async DeletePostById(ID : number){
      let post = await Post.findOne({
          where : {id : ID}
      });
      await post!.destroy();
      return post;
  }
  async LoginUser(email: string, password: string){
        //find user 
        const u = await User.findOne({
            where : {Email: email}
        })as any;
        //if user doesnt exist
        if(u == null){
            //return something saying user exists
            return false;
        }
        //hash password with the same salt
        const hashPass = crypto.scryptSync(password, u.Salt,  32).toString('hex');

        if(hashPass === u.hashedpassword){
            //logged in
            return true;
        }else{
            //not logged in
            return false;
        }
  }

  async RegisterUser(email: string, fname: string, lname: string, password: string){
        //check if user exists
        const u = await User.findOne({
            where : {Email: email}
        });
        if(u != null){
            //return something saying user exists
            return false;
        }
        //create password salt
        const uSalt = crypto.randomBytes(16).toString('hex');
        //create hashedpassword
        const hashPass = crypto.scryptSync(password, uSalt, 32).toString('hex');
        
        const newUser = User.build(
            {
                FirstName: fname,
                LastName: lname,
                Email: email,
                PasswordHash: hashPass,
                Salt: uSalt
            }
        );
        newUser.save();
        return true;
    }

  async PostComment(description: string, userid: number, postid: number ){
    const c = Comment.build(
      {
        Description: description,
        Date: new Date(),
        UserId: userid,
        PostId: postid,
      }
    );
    await c.save();
    return c.toJSON();
  }

  constructor(config: OverclockSequelizeConfig) {
    super(config.database, config.username, config.password, config.config);
  }
}

export type OverclockSequelizeConfig = {
    database: string,
    username: string,
    password: string,
    config: any
}

export const ProductionConfig = { 
    host: "localhost",
    dialect : "mssql",
    dialectOptions: {
        options:{
        trustServerCertificate: true
        }
    }
};

export const TestConfig = {

  dialect : "sqlite",
  storage: ':memory:',
  dialectOptions: {
      // Your sqlite3 options here
      // for instance, this is how you can configure the database opening mode:
      mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE | SQLite.OPEN_FULLMUTEX,
  },
}

/* need to create new user in mssql, you can do this in the GUI in SSMS or using this query, check policy just stop it from enforcing password rules

CREATE LOGIN [NewUser] WITH PASSWORD = 'password', CHECK_POLICY = OFF;
GO

I believe there is a CLI command to create the DB but it isnt automatically created when you run the program
You can also just manually create the DB in SSMS and make the owner your user! otherwise you wont be able to access it.

*/
// export const sequelize = new OverclockSequelize("OverclockMediaCMS", "rory", "Password123!", {
//   host: "localhost",
//   dialect: "mssql",
//   dialectOptions: {
//     options: {
//       trustServerCertificate: true
//     }
//   }
// });

export const sequelize = new OverclockSequelize(
  {
    database: "OverclockMediaCMS", username: "tim", password: "123", 
    config: TestConfig
  });

const User = sequelize.define(
  'User',
  {
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PasswordHash: {
      type: DataTypes.STRING,
    },
    FirstName: {
      type: DataTypes.STRING,
    },
    LastName: {
      type: DataTypes.STRING,
    },
    Role: {
      type: DataTypes.STRING,
    },
    MobilePhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    InternalPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false
  }
);

const Tag = sequelize.define(
  'Tag',
  {
    Title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false
  }
);
const Media = sequelize.define(
  'Media',
  {
    Title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    FilePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    FileExtension: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    timestamps: false
  }
);
const Post = sequelize.define(
  'Post',
  {
    Title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Body: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    timestamps: false
  }
);
const MediaPost = sequelize.define(
  'MediaPost',
  {
    MediaId: {
      type: DataTypes.INTEGER,
      references: {
        model: Media,
        key: 'id',
      },
    },
    PostId: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    timestamps: false
  }
);
const TagPost = sequelize.define(
  'TagPost',
  {
    TagId: {
      type: DataTypes.INTEGER,
      references: {
        model: Tag,
        key: 'id',
      },
    },
    PostId: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    timestamps: false
  }
);
const Comment = sequelize.define(
    'Comment',
  {
    Description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
)
Comment.belongsTo(User);
Post.hasMany(Comment);
User.hasMany(Post);
User.hasMany(Media);
Post.belongsTo(User);
Media.belongsTo(User);
Tag.belongsToMany(Post, { through: TagPost, foreignKey: "TagId" });
Post.belongsToMany(Tag, { through: TagPost, foreignKey: "PostId" });
Media.belongsToMany(Post, { through: MediaPost, foreignKey: "MediaId" });
Post.belongsToMany(Media, { through: MediaPost, foreignKey: "PostId" });

