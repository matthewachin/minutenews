const fs = require('fs');

exports.createUser = (id)=>{
  let userList = JSON.parse(fs.readFileSync('data/userList.json'))
  if(userList.includes(id)){
    return
  }
  userList.push(id)
  fs.writeFileSync(`data/users/${id}.json`, JSON.stringify(
    {
      username: 'Default User',
      isWriter: true,
      write: {},
      read: {},
    }))
  fs.writeFileSync('data/userList.json', JSON.stringify(userList))
}
exports.isValidUser = (id)=>{
  return JSON.parse(fs.readFileSync('data/userList.json')).includes(id)
}
exports.getUsers = ()=>{
  return JSON.parse(fs.readFileSync('data/userList.json'))
}

exports.getUser = (id)=>{
  return JSON.parse(fs.readFileSync(`data/users/${id}.json`))
}

exports.saveUser = (userID, data)=>{
  fs.writeFileSync(`data/users/${userID}.json`, JSON.stringify(data))
}
exports.editName = (id, username)=>{
  let user = JSON.parse(fs.readFileSync(`data/users/${id}.json`))
  user.username = username
  fs.writeFileSync(`data/users/${id}.json`, JSON.stringify(user))
}

exports.convertWriter = function (id){
  let userData = JSON.parse(fs.readFileSync(`data/users/${id}.json`))
  userData['isWriter'] = !userData['isWriter']
  fs.writeFileSync(`data/users/${id}.json`, JSON.stringify(userData))
}

exports.deleteUser = (id)=>{
  let userList = JSON.parse(fs.readFileSync('data/userList.json'))
  for(let i = 0; i < userList.length; i++){
    if(userList[i] === id){
      userList.splice(i, 1)
      i--
    }
  }
  fs.unlinkSync(`data/users/${id}.json`)
  fs.writeFileSync('data/userList.json', JSON.stringify(userList))
}