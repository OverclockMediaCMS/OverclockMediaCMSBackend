import { Sequelize, DataTypes, Op } from 'sequelize';

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
  }
  async GetAllTags() {
    let tags = await Tag.findAll({});
    return tags;
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
  async PostUser(fName: string, lName: string, email: string, passwordHash: string) {
    const u = await User.create({
      FirstName: fName,
      LastName: lName,
      Email: email,
      PasswordHash: passwordHash
    });
    return u.toJSON();
  }
  async PostPost(title: string, body: string, isDraft: boolean, date: string) {
    const p = await Post.create({
      
    });
  }
}
/* need to create new user in mssql, you can do this in the GUI in SSMS or using this query, check policy just stop it from enforcing password rules

CREATE LOGIN [NewUser] WITH PASSWORD = 'password', CHECK_POLICY = OFF;
GO

I believe there is a CLI command to create the DB but it isnt automatically created when you run the program
You can also just manually create the DB in SSMS and make the owner your user! otherwise you wont be able to access it.

*/
export const sequelize = new OverclockSequelize("OverclockMediaCMS", "rory", "Password123!", {
  host: "localhost",
  dialect: "mssql",
  dialectOptions: {
    options: {
      trustServerCertificate: true
    }
  }
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
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    InternalPhone: {
      type: DataTypes.INTEGER,
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

