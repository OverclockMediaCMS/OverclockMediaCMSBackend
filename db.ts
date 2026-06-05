import {Sequelize, DataTypes, } from 'sequelize';
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

/* need to create new user in mssql, you can do this in the GUI in SSMS or using this query, check policy just stop it from enforcing password rules

CREATE LOGIN [NewUser] WITH PASSWORD = 'password', CHECK_POLICY = OFF;
GO

I believe there is a CLI command to create the DB but it isnt automatically created when you run the program
You can also just manually create the DB in SSMS and make the owner your user! otherwise you wont be able to access it.

*/ 
class OverclockSequelize extends Sequelize {
    async tryConnect() {
        try {
        await sequelize.authenticate();
            console.log("Successfully connected");
        }catch(error){
            console.error("Unable to connect to database", error);
        }
    }
    // calling this will seed the database tables
    async createModels(){

    }
    //calling this will seed the DB with some dummy data
    async seedDummyData(){
        let users = await User.findAll();
        if(users.length > 0){
            return;
        }
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
        await p1.save();
        await p2.save();
    }
    async GetUserById(ID : number){
        let user = await User.findOne({
            where : {id: ID},
            attributes: ['id',
                         'FirstName', 
                         'LastName',
                         'Email'
            ]
        });
        return user;
    }
    async GetAllUsers(){
        let users = await User.findAll({
            attributes: ['id',
                         'FirstName', 
                         'LastName',
                         'Email'
            ]
        });
        return users;
    }
    async GetPostById(ID : number){
        let user = await Post.findOne({
            where : {id: ID},
            attributes: ['id',
                         'Title', 
                         'Body',
                         'isDraft',
            ],
            include : [{
                model: User,
                attributes: ['id',
                         'FirstName', 
                         'LastName',
                         'Email'
            ]
            }]
        });
        return user;
    }
    async GetAllPosts(){
        let users = await Post.findAll({
            attributes: ['id',
                         'Title', 
                         'Body',
                         'isDraft',
                        ],
            include : [{
                model: User,
            attributes: ['id',
                         'FirstName', 
                         'LastName',
                         'Email'
            ]
            }]
        });
        return users;
    }
    async GetMediaById(ID : number){
        let media = await Media.findOne({
            where : {id: ID}
        });
        return media;
    }
    async GetAllMedia(){
        let media = await Media.findAll();
        return media;
    }
    async PostUser(fName : string, lName : string, email : string, passwordHash : string){
        const u = await User.create({
            FirstName: fName,
            LastName: lName,
            Email : email,
            PasswordHash : passwordHash
        });
        return u.toJSON();
    }
    async PostPost(title : string, body : string, isDraft : boolean, date : string){
        const p = await Post.create({
            
        });
    }
        
    async LoginUser(email: string, password: string){
        //find user 
        const u = await User.findOne({
            where : {Email: email}
        })as any;
        //if user doesnt exist
        if(u == null){
            //return something saying user exists
            return;
        }
        //hash password with the same salt
        const hashPass = crypto.scryptSync(password, u.Salt,  32).toString('hex');

        if(hashPass === u.hashedpassword){
            //logged in
        }else{
            //not logged in
            return;
        }
    }
    
    async RegisterUser(email: string, fname: string, lname: string, password: string){
        //check if user exists
        const u = await User.findOne({
            where : {Email: email}
        });
        if(u != null){
            //return something saying user exists
            return;
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
    }
}

export const sequelize = new OverclockSequelize("OverclockMediaCMS", "tim", "123", {
    host: "localhost",
    dialect : "mssql",
    dialectOptions: {
        options:{
            trustServerCertificate: true
        }
    }
});

const User = sequelize.define(
            'User',
            {
                Email : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                PasswordHash : {
                    type: DataTypes.STRING,
                },
                FirstName : {
                    type: DataTypes.STRING,
                },
                LastName : {
                    type: DataTypes.STRING,
                },
                Salt : {
                    type: DataTypes.STRING,
                }
            },
            {
              timestamps : false  
            }
);
const Tag = sequelize.define(
            'Tag',
            {
                Title : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
              timestamps : false  
            }
);
const Media = sequelize.define(
            'Media',
            {
                Title : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                FilePath : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                FileExtension : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
              timestamps : false  
            }
);
const Post = sequelize.define(
            'Post',
            {
                Title : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                Body : {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                isDraft : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                Date: {
                    type: DataTypes.DATE,
                    allowNull: false,
                }
            },
            {
              timestamps : false  
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
              timestamps : false  
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
              timestamps : false  
            }
)
User.hasMany(Post);
User.hasMany(Media);
Post.belongsTo(User);
Media.belongsTo(User);
Tag.belongsToMany(Post, {through: 'TagPost', foreignKey : "TagId"});
Post.belongsToMany(Tag, {through: 'TagPost', foreignKey : "PostId"});
Media.belongsToMany(Post, {through: 'MediaPost', foreignKey : "MediaId"});
Post.belongsToMany(Media, {through: 'MediaPost', foreignKey : "PostId"});

await sequelize.sync();
