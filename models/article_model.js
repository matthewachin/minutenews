const fs = require('fs');
const UserModel = require('./user_model.js')
exports.isExists = (id) => {
  const l = JSON.parse(fs.readFileSync('data/articleList.json'))
  
  return l.includes(id)
}

exports.deleteArticle = (id)=>{
  let list = JSON.parse(fs.readFileSync('data/articleList.json'))
  list.splice(list.indexOf(id), 1)
  fs.writeFileSync("data/articleList.json", JSON.stringify(list))
  const authorID = JSON.parse(fs.readFileSync(`data/articles/${id}.json`)).authorID
  fs.unlinkSync(`data/articles/${id}.json`)
  let user = UserModel.getUser(authorID)
  delete user.write[id]
  UserModel.saveUser(authorID, user)
}

exports.saveArticle = function(id, data){
  fs.writeFileSync(`data/articles/${id}.json`, JSON.stringify(data))
  return
}

exports.saveArticleList = function(list){
  fs.writeFileSync(`data/articleList.json`, JSON.stringify(list))
  return
}

exports.getArticle = function(id){
  return JSON.parse(fs.readFileSync(`data/articles/${id}.json`))
}

exports.getArticles = () =>{
  return JSON.parse(fs.readFileSync('data/articleList.json'))
}

exports.createArticle = function(title, author, authorID, content, type, image=null, description=null, source=null){
  
  let articleList = JSON.parse(fs.readFileSync(`data/articleList.json`))
  const id = generateID(articleList, 16)
  articleList.push(id)
  let userData = UserModel.getUser(authorID)
  userData.write[id] = true
  UserModel.saveUser(authorID, userData)
  fs.writeFileSync(`data/articleList.json`, JSON.stringify(articleList))

  fs.writeFileSync(`data/articles/${id}.json`, JSON.stringify({
    id: id,
    title: title, 
    authorID: authorID,
    content: content,
    image: image, 
    description: description,
    source: source,
    type: type,
    published: getDate(),
    views: 0,
    viewers: 0,
  }))
  return 
}

function generateID(list, length=16){
  const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNMM1234567890'
  const availChars= chars.length
  let id = ''
  while(true){
    for(let i =0; i < length; i++){
      id+=chars[Math.floor(Math.random() * availChars)]
    }
    if(list.includes(id)){
      id = ''
    }else{
      return id
    }
  }
}
function getDate() {
  const date = new Date();
  const dayOfMonth = date.getDate();
  const ordinalNumbers = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    6: "6th",
    7: "7th",
    8: "8th",
    9: "9th",
    10: "10th",
    11: "11th",
    12: "12th",
    13: "13th",
    14: "14th",
    15: "15th",
    16: "16th",
    17: "17th",
    18: "18th",
    19: "19th",
    20: "20th",
    21: "21st",
    22: "22nd",
    23: "23rd",
    24: "24th",
    25: "25th",
    26: "26th",
    27: "27th",
    28: "28th",
    29: "29th",
    30: "30th",
    31: "31st",
  };
  const ordinalDayOfMonth = ordinalNumbers[dayOfMonth];
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${dayOfWeek}, ${month} ${ordinalDayOfMonth}, ${year}`;
}