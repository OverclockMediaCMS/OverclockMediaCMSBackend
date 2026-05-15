import {Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize("OverclockMediaCMS", "rory", "Password123!", {
    host: "localhost",
    dialect : "mssql",
    dialectOptions: {
        options:{
            trustServerCertificate: true
        }
    }
});

try {
    await sequelize.authenticate();
    console.log("Successfully connected");
}catch(error){
    console.error("Unable to connect to database", error);
}

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
);
User.hasMany(Post);
User.hasMany(Media);
Post.belongsTo(User);
Media.belongsTo(User);
Tag.belongsToMany(Post, {through: 'TagPost', foreignKey : "TagId"});
Post.belongsToMany(Tag, {through: 'TagPost', foreignKey : "PostId"});
Media.belongsToMany(Post, {through: 'MediaPost', foreignKey : "MediaId"});
Post.belongsToMany(Media, {through: 'MediaPost', foreignKey : "PostId"});

await sequelize.sync({force : true});