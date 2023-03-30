const express = require('express'), router = express.Router()
const ArticleModel = require('../models/article_model.js'), UserModel = require('../models/user_model.js')
const multer = require('multer');
const axios = require('axios');
const longitude = 40.7859, latitude = 73.9742
const weatherKey = require('../config/keys.json').weatherKey

let publicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/images')
  },
  filename: function (req, file, cb) {
   
    cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
  }
});
let publicUpload = multer({ storage: publicStorage });
router.get('/articles/history', isLogged, (req,res)=>{
  const userID = req.session.passport.user
  let userData = UserModel.getUser(userID)
  const userRead = userData.read
  const formatted = Object.keys(userRead).map((artID)=>{
    let article = ArticleModel.getArticle(artID)
    article.views += 1
    ArticleModel.saveArticle(artID, article)
    return {
      title: article.title, 
      content: article.content,
      description: article.description,
      author: UserModel.getUser(article.authorID).username,
      image: article.image ? `/images/${article.image}` : null,
      source:article.source,
      date: article.published,
    }
  })
  res.render('article/read-articles',{
    articles: formatted,
    writer: userData.isWriter,
    infinite: false,
    weather:false,
  })
})
router.get('/articles/new', isWriter, (req, res)=>{
  res.render('article/edit-articles', {
    title: null,
    description: null,
    content: null,
    source:null,
    views:null,
    viewers:null,
    US: null, 
    World: null,
    Politics: null,
    Opinion: null,
    author: UserModel.getUser(req.session.passport.user).username,
    image:null,
    id:null,
  })
})
router.post('/articles/new', publicUpload.single('myFile'), (req, res, next) => {
  let article = JSON.parse(JSON.stringify(req.body))
  let image;
  let file;
  try{
    article["description"] = "description" in article ? article.description : null
    file = JSON.parse(JSON.stringify(req.file))
    image = file ? file.filename : null
  }catch{
    image = null
    file = null
    article.description = null
  }
  const userID = req.session.passport.user
  const author = UserModel.getUser(userID).username
  let tags = []
  "US" in article ? tags.push("US") : null
  "World" in article ? tags.push("World") : null
  "Opinion" in article ? tags.push("Opinion") : null
  "Politics" in article ? tags.push("Politics") : null
  ArticleModel.createArticle(article.title, article.author, userID, article.content, tags, image, article.description, article.source ? article.source : null)

  
  
  
  
  // if (!file) {
  //   const error = {
  //   'httpStatusCode' : 400,
  //   'message':'Please upload a file'
  //    }
  //   res.send(error);
  // }
  // console.log('success')
  // const userID = req.session.passport.user
  // console.log(req)
  // let article = req.body
  // console.log(article)
  // ArticleModel.createArticle(article.title, article.author, userID, article.content, article.type, article.image, article.description, article.source)
  res.redirect('/articles/menu')
})
router.get('/articles/order',isWriter, (req, res)=>{
  
  let articles = ArticleModel.getArticles().reverse()
  let formatted = []
  for(const articleID of articles){
    let articleInfo = ArticleModel.getArticle(articleID)
    formatted.push({
      title: articleInfo.title,
      viewers: articleInfo.viewers,
      published: articleInfo.published,
      id: articleID,
    })
  }
  res.render('article/article-list', {
    data: formatted,
    global: true,
  })
})
router.post('/articles/order',isWriter, (req, res)=>{
  ArticleModel.saveArticleList(req.body)
  res.send(JSON.stringify('Successfully saved order.'))
})
router.get('/articles/menu', isWriter, (req, res)=>{
  // Required writer
  let userData = UserModel.getUser(req.session.passport.user)
  let articles = Object.keys(userData.write)
  let formatted = []
  for(const articleID of articles){
    let articleInfo = ArticleModel.getArticle(articleID)
    formatted.push({
      title: articleInfo.title,
      viewers: articleInfo.viewers,
      published: articleInfo.published,
      id: articleID,
    })
  }
  res.render('article/article-list', {
    data: formatted,
    global: false,
  })
})
router.get('/articles/:id/edit', isWriter, (req, res)=>{
  // Require writer 
  try{
    const articleID = req.params.id
    const userID = req.session.passport.user
    if(ArticleModel.isExists(articleID)){
      let current_article = ArticleModel.getArticle(articleID)
      const tags = current_article.type
      if(current_article.authorID == userID){
        res.render('article/edit-articles', {
          title:current_article.title,
          description:current_article.description,
          content:current_article.content,
          source:current_article.source,
          views:current_article.views,
          viewers:current_article.viewers,
          author:UserModel.getUser(req.session.passport.user).username,
          image:current_article.image,
          id:current_article.id,
          US: tags.includes('US'), 
          World: tags.includes('World'), 
          Politics: tags.includes('Politics'), 
          Opinion: tags.includes('Opinion'), 
        })
      }else{
        res.redirect('/error?code=401')
        //? Adjust redirect link accordingly
      }
    }
  }catch{
    res.redirect('/error?code=500')
  }
  
  // Redirect link
})
router.delete('/articles/:id/delete',(req, res)=>{
  // Require writer status
  
  const articleID = req.params.id
  const userID = req.session.passport.user
  if(ArticleModel.isExists(articleID)){
    let current_article = ArticleModel.getArticle(articleID)
    
    if(current_article.authorID == userID){

      ArticleModel.deleteArticle(articleID)
      res.redirect('/articles/menu')
      
    }else{
      res.redirect('/error?code=401')
    }
  }
})
router.post('/articles/:id/edit', publicUpload.single('myFile'), function(req,res){
  // Require writer status
  const articleID = req.params.id
  const userID = req.session.passport.user
  
  let article = JSON.parse(JSON.stringify(req.body))
  article.authorID = userID
  if(ArticleModel.isExists(articleID)){
    let current_article = ArticleModel.getArticle(articleID)
    if(current_article.authorID == userID){
      res.status(200)
      let file;
      try{
        file = JSON.parse(JSON.stringify(req.file))
        article.image = file ? file.filename : current_article.image
      }catch{
        article.image = current_article.image
      }
      article["description"] = "description" in article ? article.description : null
      article["source"] = "source" in article ? article.source : null
      article["title"] = "title" in article ? article.title : null
      article["content"] = "content" in article ? article.content : null
      const userID = req.session.passport.user
      let tags = []
      "US" in article ? tags.push("US") && delete article['US'] : null
      "World" in article ? tags.push("World") && delete article['World'] : null
      "Opinion" in article ? tags.push("Opinion") && delete article['Opinion'] : null
      "Politics" in article ? tags.push("Politics") && delete article['Politics'] : null
      article.type = tags
      article.published = current_article.published
      article.views = current_article.views

      article.viewers = current_article.viewers
      article.id = articleID
      ArticleModel.saveArticle(articleID, article)
      res.redirect('/articles/menu')
    }else{
      res.redirect('/error?code=401')
    }
  }
})
router.get('/articles', isLogged, async (req, res)=>{
  let requirement = null
  try{
    requirement = req.query.type
  }catch{
    requirement = null
  }
  let userData = UserModel.getUser(req.session.passport.user)
  let userRead = userData.read
  let articles = ArticleModel.getArticles()
  let available = []
  let satisfyRequire = []
  for(let i = articles.length-1; i > -1; i--){
    const articleID = articles[i]
    let satisfied; 
    if(requirement){
      satisfied = ArticleModel.getArticle(articleID).type.includes(requirement)
      if(satisfied){
        satisfyRequire.push(articleID)
      }
    }else{
      satisfyRequire.push(articleID)
    }
    if(articleID in userRead){
      
      continue
    }else{
      if(requirement){
        if(satisfied){
          available.push(articleID)
        }
      }else{
        available.push(articleID)
      }
      
      if(available.length >= 3 ){
        break
      }
    }
  }
  if(available.length < 3 ){
    satisfyRequire = satisfyRequire.filter(function(val) {
      return available.indexOf(val) == -1;
    });
    while(available.length < 3 && satisfyRequire.length){
      const sat = satisfyRequire.length
      const chosen = Math.floor(Math.random()*sat)
      available.push(satisfyRequire[chosen])
      satisfyRequire.splice(chosen, 1)
    }
  }
  let formatted = []
  for(const artID of available){
    let article = ArticleModel.getArticle(artID)
    if(!(artID in userRead)){
      article.viewers = article.viewers+1
      userRead[artID] = true
    }
    article.views += 1
    ArticleModel.saveArticle(artID, article)
    formatted.push({
      title: article.title, 
      content: article.content,
      description: article.description,
      author: UserModel.getUser(article.authorID).username,
      image: article.image ? `/images/${article.image}` : null,
      
      source:article.source,
      date: article.published,
    })
  }
  let weather;
  try {
    const resp = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=imperial`);
    weather = resp["data"]["weather"][0]["main"];
  } catch (err) {
    console.error(err);
    weather = ""
  }
  UserModel.saveUser(req.session.passport.user, userData)
  res.render('article/read-articles', {
    articles: formatted,
    infinite: true,
    writer:userData.isWriter,
    weather: weather,
  })
})

router.get('/articles/updateFeed', isLogged,(req,res)=>{
  let requirement = null
  try{
    requirement = req.query.type
  }catch{
    requirement = null
  }
  let userData = UserModel.getUser(req.session.passport.user)
  let userRead = userData.read
  let articles = ArticleModel.getArticles()
  let available = []
  let satisfyRequire = []
  for(let i = articles.length-1; i > -1; i--){
    const articleID = articles[i]
    let satisfied; 
    if(requirement){
      satisfied = ArticleModel.getArticle(articleID).type.includes(requirement)
      if(satisfied){
        satisfyRequire.push(articleID)
      }
    }else{
      satisfyRequire.push(articleID)
    }
    if(articleID in userRead){
      
      continue
    }else{
      if(requirement){
        if(satisfied){
          available.push(articleID)
        }
      }else{
        available.push(articleID)
      }
      
      if(available.length >= 3 ){
        break
      }
    }
  }
  if(available.length < 3 ){
    satisfyRequire = satisfyRequire.filter(function(val) {
      return available.indexOf(val) == -1;
    });
    while(available.length < 3 && satisfyRequire.length){
      const sat = satisfyRequire.length
      const chosen = Math.floor(Math.random()*sat)
      available.push(satisfyRequire[chosen])
      satisfyRequire.splice(chosen, 1)
    }
  }
  let formatted = []
  for(const artID of available){
    let article = ArticleModel.getArticle(artID)
    if(!(artID in userRead)){
      article.viewers = article.viewers+1
      userRead[artID] = true
    }
    article.views += 1
    ArticleModel.saveArticle(artID, article)
   
    formatted.push({
      title: article.title, 
      content: article.content,
      description: article.description,
      author: UserModel.getUser(article.authorID).username,
      image: article.image ? `/images/${article.image}` : null,
      
      source:article.source,
      date: article.published,
    })
  }
  UserModel.saveUser(req.session.passport.user, userData)
  
  res.send(JSON.stringify(formatted))
})

// router.post('/articles/:id/stats', isLogged,(req, res)=>{
//   // require logged in
//   // Proper request = {
//   //   likes: true,
//   //   views: true,
//   //   viewers: true,
//   // }
//   const id=req.params.id
//   let info = req.body
//   let articleData = getArticle(id)
//   for(category in info){
//     articleData[category] += info.category
//   }
//   res.send(200)
// })

//..............Start the server...............................//


function isLogged(req, res, next){
  try{
    const id = req.session.passport.user
    if(UserModel.isValidUser(id)){
      next()
      return
    }else{
      res.redirect('/error?code=401')
      throw 'Not logged in. Access not granted.'
    }
  }catch{
    res.redirect('/error?code=401')
    throw 'Not logged in. Access not granted.'
  }
}
function isWriter(req, res, next){
  try{
    const id = req.session.passport.user
    if(UserModel.isValidUser(id)){
      let u = UserModel.getUser(id)
      if(u.isWriter){
        try{
          next()
          return
        }catch{

        }
      }else{
        res.redirect('/error?code=401')
      }
    }else{
      res.redirect('/error?code=401')
    }
  }catch{
  
    res.redirect('/error?code=401')
  }
}



module.exports = router