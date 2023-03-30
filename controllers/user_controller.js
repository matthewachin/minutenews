const express = require('express'), router = express.Router()
const ArticleModel = require('../models/article_model.js'), UserModel = require('../models/user_model.js')

router.get('/users/new', (req,res)=>{
  // Require logged in
  try{
    const id = req.session.passport.user
    UserModel.createUser(id)
    res.render('user/create', {
      writer: UserModel.getUser(id).isWriter
    })
  }catch{
    res.redirect('/error?code=500')
  }

})

router.get('/users', isWriter, (req, res)=>{
  // Require writer
  let userList = UserModel.getUsers()

  res.render('user/list', {
    users: userList.map((u)=>{
      const userInfo = UserModel.getUser(u)
      return {
        id: u,
        username: userInfo.username,
        isWriter: userInfo.isWriter
      }
    })
  })
})
router.post('/users/new', isLogged, (req, res)=>{
  const id = req.session.passport.user
  let data =UserModel.getUser(id)
  data.username = req.body.username
  UserModel.saveUser(id, data)
  res.redirect('/articles')
})

// router.delete('/users/delete', isLogged, (req,res)=>{
//   // require logged in 
//   const id = req.session.passport.user
//   UserModel.deleteUser(id)
//   res.send(200)
// })

router.put('/users/:id/writer', isWriter, (req, res)=>{
  // require writer
  
    const id = req.params.id
    UserModel.convertWriter(id)
    
    res.send(200)
})

module.exports = router

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
    console.log('called')
    res.redirect('/error?code=401')
  }
}