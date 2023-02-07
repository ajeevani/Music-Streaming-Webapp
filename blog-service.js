const Sequelize = require('sequelize');

var sequelize = new Sequelize('gmybuebz', 'gmybuebz', 'C-q5dxXhioCVQxOtoiLpL5o6PFpW5mef', {
    host: 'jelani.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postdate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category', as: 'Category'});

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(resolve("Successful Sync"))
            .catch(reject("unable to sync the database"));
});
};

exports.getAllPosts = () =>{
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(resolve(Post.findAll()))
            .catch(reject("no results returned"));
});
};

exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
        .then(resolve(Post.findAll({where:{published:true}})))
        .catch(reject("no results returned"))
});
};

exports.getPublishedPostsByCategory = (Category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: Category
            }
        })
        .then(resolve(Post.findAll({where:{published:true,category:Category}})))
        .catch(reject("no results returned"))
});
};

exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(resolve(Category.findAll()))
        .catch(reject("no results returned"))
});
};

exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var i in postData)
        {
            if(postData[i] == "")
            {
                postData[i] = null;
            }
        }
        postData.postDate = new Date()
        Post.create(postData)
        .then(resolve(Post.findAll()))
        .catch(reject("unable to create post"))
    });
};

exports.getPostsByCategory = function(categoryid) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category: categoryid
            }
        })
        .then(resolve(Post.findAll({where:{category: categoryid}})))
        .catch(reject("no results returned"));
});
};

exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => resolve(data))
        .catch(reject("no results returned"));
});
};

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then( data => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (var i in categoryData)
        {
            if(categoryData[i] == "")
            {
                categoryData[i] = null;
            }
        }
        Category.create(categoryData)
        .then(resolve(Category.findAll()))
        .catch(reject("unable to create category"))
    })
};

exports.deleteCategoryById = (id) => {
    return new Promise((resolve,reject) =>{
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject("unable to delete category"))
    });
};

exports.deletePostById = (id) => {
    return new Promise((resolve,reject) =>{
        Post.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject("unable to delete post"))
    });
};