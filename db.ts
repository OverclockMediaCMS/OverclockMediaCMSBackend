import { Sequelize, DataTypes, Op } from 'sequelize';
import SQLite from 'sqlite3';
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const SECRET_KEY = "sup3rs3cr3tk3y";

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
    if(User.name.length > 0) return;

    await this.sync({force:true})
    //await this.sync();
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
        Title: "A Guide to Urban Gardening",
        Body: `## Getting Started\n### Choosing Your Space\nWhether you have a balcony, rooftop, or small backyard, almost any space can be transformed into a productive garden. Start by assessing how much sunlight your space receives throughout the day.\n### Essential Tools\nYou don't need much to get started. A trowel, watering can, and some basic pots will get you a long way. Invest in quality soil before anything else.\n## Choosing What to Grow\n### Vegetables\nTomatoes, lettuce, and herbs are the best starting points for urban gardeners. They grow quickly, don't need much space, and are satisfying to harvest.\n### Herbs\nBasil, mint, and chives are nearly impossible to kill and incredibly useful in the kitchen. Keep them near a sunny window if space is tight.\n### Flowers\nMarigolds and nasturtiums are great companions for vegetables, deterring pests naturally while adding colour to your garden.\n## Soil and Nutrition\n### Picking the Right Soil\nNever use soil straight from the ground in containers — it compacts too easily. Use a quality potting mix designed for container gardening.\n### Composting\nEven in a small apartment you can maintain a worm farm or bokashi bin to turn food scraps into rich compost for your plants.\n## Watering and Maintenance\n### How Often to Water\nMost container plants need watering more frequently than garden beds since they dry out faster. Check the top inch of soil — if it's dry, water it.\n### Dealing with Pests\nAphids and fungus gnats are the most common urban garden pests. A diluted neem oil spray handles both without harsh chemicals.\n## Harvesting\n### Knowing When to Pick\nHarvesting at the right time encourages more growth. For most leafy greens, pick outer leaves first and let the centre keep producing.\n### Storing Your Produce\nFresh herbs last longest when stored upright in a glass of water in the fridge, loosely covered with a plastic bag.`,
        isDraft: false,
        Date: new Date(),
        UserId: u1.dataValues.id
      }
    );
    const p2 = Post.build(
      {
        Title: "post 2",
        Body: "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
        isDraft: false,
        Date: new Date(),
        UserId: u2.dataValues.id
      }
    );
    const p3 = Post.build(
      {
        Title: "post 3",
        Body: "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
        isDraft: false,
        Date: new Date(),
        UserId: u1.dataValues.id
      }
    );
    const p4 = Post.build(
      {
        Title: "post 4",
        Body: "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
        isDraft: false,
        Date: new Date(),
        UserId: u2.dataValues.id
      }
    );
    const p5 = Post.build(
      {
        Title: "post 5",
        Body: "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
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
        isDraft: false,
      }
    );
    const m2 = Media.build(
      {
        Title: "photo2",
        FilePath : "media/photos/photo1",
        FileExtension: "png", 
        UserId: u1.dataValues.id,
        Date: new Date(),
        isDraft: false,
      }
    );
    const m3 = Media.build(
      {
        Title: "video1",
        FilePath : "media/videos/video1",
        FileExtension: "mp4", 
        UserId: u1.dataValues.id,
        Date: new Date(),
        isDraft: false,
      }
    );
    const m4 = Media.build(
      {
        Title: "video2",
        FilePath : "media/videos/video1",
        FileExtension: "mp4", 
        UserId: u1.dataValues.id,
        Date: new Date(),
        isDraft: false,
      }
    );
    await m1.save();
    await m2.save();
    await m3.save();
    await m4.save();
    await p1.save();
    await p2.save();
    await p3.save();
    await p4.save();
    await p5.save();
    await (p1 as any).addTags(tag1);
    await (p2 as any).addTags(tag2);

  }
  async GetUserById(ID: number) {
    let user = await User.findOne({
      where: { id: ID },
      attributes: ['id',
        'FirstName',
        'LastName',
        'Email',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM [Posts] AS [post]
            WHERE [post].[UserId] = [User].[id]
          )`),
          'postCount'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Media AS media
            WHERE [media].[UserId] = [User].[id]
          )`),
          'mediaCount'
        ]
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
    {model: Tag},
    {model: Media, attributes: ['id', 'Title', 'FilePath', 'FileExtension']}
  ]
    });
    return post;
  }
  async GetMostRecentPosts() {
    let posts = await Post.findAll({
    where: { isDraft: false },
    order: [['Date', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['id', 'FirstName', 'LastName', 'Email']
      },
      { model: Tag },
      { model: Comment },
      { 
        model: Media, // Include media models
        attributes: ['id'] 
      }
    ],
  });

  // Filter out posts that contain media attachments
  return posts.filter((post: any) => !post.Media || post.Media.length === 0).slice(0, 5);
  }
  async GetMediaById(ID: number) {
    let media = await Media.findOne({
      where: { id: ID }
    });
    return media;
  }
  async GetMostRecentMedia() {
    let media = await Media.findAll({
      where: {isDraft: false},
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
  async GetMediaThatContains(word : string, fileExtension?: string) {
    const whereClause: any = {};

    if (word && word.trim() !== "") {
      whereClause.Title = {
        [Op.substring]: word
      };
    }
    if (fileExtension && fileExtension.trim() !== "") {
      whereClause.FileExtension = fileExtension; // Matches 'jpg', 'mp4', etc.
    }

    let media = await Media.findAll({
      where: whereClause,
      include: {
        model: User,
        attributes: ['id', 'FirstName', 'LastName', 'Email']
      }
    });
    return media;
  }
  async GetPostThatContains(word : string, tagId?: number) {
    const whereClause: any = {};

    if (word && word.trim() !== "") {
      whereClause.Title = {
        [Op.substring]: word
      };
    }
    const includeOptions: any[] = [
      {
        model: User,
        attributes: ['id', 'FirstName', 'LastName', 'Email']
      },
      {
        model: Tag,
        where: tagId ? { id: tagId } : undefined, 
        required: tagId ? true : false
      },
      {
        model: Comment,
        include: [{ model: User, attributes: ['id', 'FirstName', 'LastName'] }]
      }
    ];

    let p = await Post.findAll({
      where: whereClause,
      include: includeOptions,
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
  async PostPost(title : string, body : string, is_draft : boolean, userId : number){
    const p = await Post.create({
        Title : title,
        Body : body,
        isDraft : is_draft,
        Date : new (Date),
        UserId : userId,
    });
    return p.toJSON();
  }
  async PostMedia(title : string, filePath : string, fileExtension : string, isDraft : boolean, userId : number){
        const m = await Media.create({
            Title : title,
            FilePath : filePath,
            FileExtension : fileExtension,
            isDraft: isDraft,
            Date: new Date(),
            UserId: userId
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
      return user.toJSON();
  }

  async UpdateUserById(ID: number, updateData: { FirstName: string; LastName: string; Email: string; Role: string; MobilePhone: string; InternalPhone: string }) {
  // Find User in db by ID
  const user = await User.findOne({ where: { id: ID } });
  // If found then update
  if (user) {
    await user.update(updateData);
    return user.toJSON(); 
  }
  // If not found return null
  return null;
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
            return undefined;
        }
        //hash password with the same salt
        const hashPass = crypto.scryptSync(password, u.Salt,  32).toString('hex');

        if(hashPass === u.PasswordHash){
            //logged in
            const user = await this.GetUserById(u.id);
            const token = jwt.sign({ userId: u.id }, SECRET_KEY, {
              expiresIn: '1m'
            }); 
            return user;
        }else{
            //not logged in
            return undefined;
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

  async DeleteMediaById(ID : number){
    const m = await Media.findOne(
      {
        where : {id : ID}
      }
    );
    if (!m) return null;
  
    await m.destroy();
    return m.toJSON();
  }

  async DeleteTagById(ID : number) {
    const t = await Tag.findOne(
      {
        where : {id : ID}
      }
    );
    if (!t) return null;
    await t.destroy();
    return t.toJSON();
  }

  async DeleteCommentById(ID : number) {
    const c = await Comment.findOne(
      {
        where : {id : ID}
      }
    );
    if (!c) return null;
    await c.destroy();
    return c.toJSON();
  }

  async PostMediaPost(mediaId : number, postId : number){
    const mp = MediaPost.build(
      {
        MediaId : mediaId,
        PostId : postId
      }
    );
    await mp.save();
    return mp.toJSON();
  }

  async GetMediaDrafts(userId: number) {
    let mediaDrafts = await Media.findAll({
      where: {
        isDraft: true,
        UserId: userId
      },
      include: {
        model: User,
        attributes: ['id',
          'FirstName',
          'LastName',
          'Email',
        ]
      }
    });
    return mediaDrafts;
  }

  async GetDraftPosts(userId: number) {
    let posts = await Post.findAll({
      where: {
        isDraft: true,
        UserId: userId
      },
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
    database: "OverclockMediaCMS", username: "Sirawit", password: "1234", 
    config: ProductionConfig
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
    Salt : {
      type: DataTypes.STRING
    }
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
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
      type: DataTypes.TEXT,
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

