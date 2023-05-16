const Sequelize = require ('sequelize');

var sequelize = new Sequelize('database','user','password',{
    host:'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl:{rejectUnauthorized: false}
    },
    query:{raw: true}
});

var Character = sequelize.define('Character',{
    CharId:{
        type: Sequelize.INTEGER,
        primarykey: true,
        autoIncrement: true
    },
    FirstName: Sequelize.STRING,
    LastName: Sequelize.STRING,
    email: Sequelize.STRING,
    isHero: Sequelize.BOOLEAN
});

module.exports.intialize = function() {
     return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            resolve();
         }).catch(()=>{
            reject("Unable to sync with database");
        });
    });
}

//select* from tablename
module.exports.getAllCharacters = function(){
     return new Promise((resolve,reject)=>{
        Character.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be diaplayed");
        })
    });      
};
// select * fom tablename where id = num
module.exports.getCharracterById = function (num) {
    return new Promise(function (resolve, reject) {
        Character.findAll({
            where:{
                charId: num
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("requqested Character can not be displayed");
        });
    });
};

// insert into tablename ...data
module.exports.addCharacter = function (characterData) {
    return new Promise(function (resolve, reject) {
        characterData.isHero = (characterData.isHero) ? true : false;
        for(var d in characterData){
            if(characterData[d]=='') characterData[d] = null;
        }
        Character.create(characterData).then(()=>{
        resolve();
    }).catch((err)=>{
        reject("Unable to create Character");
      });
   });
};

// seelct* from character where isHero = true
module.exports.getHeroes = function(){
     return new Promise(function(resolve,reject){
        Character.findAll({
            where:{
                isHero: true
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No heroes to be displayed");
        });
    });
}