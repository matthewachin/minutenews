const express = require('express'),
  router = express.Router();

router.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  let session = null;
  try{
    session = request.session.passport.user
    response.render("index", {
      writer: UserModel.getUser(session).isWriter
    });
  }catch{
    session = null
    response.render("index", {
      writer: false
    });
  }
});

router.get('/error', function(request, response) {
  const errorCode = request.query.code;
  if (!errorCode) errorCode = 400;
  const errors = {
    '400': "Unknown Client Error",
    '401': "Invalid Login",
    '404': "Resource Not Found",
    '500': "Server problem"
  }

  response.status(errorCode);
  response.setHeader('Content-Type', 'text/html')
  let session = null;
  try{
    session = request.session.passport.user
    response.render("error", {
      "errorCode": errorCode,
      "details": errors[errorCode],
      writer: UserModel.getUser(session).isWriter
    });
  }catch{
    session = null
    response.render("error", {
      "errorCode": errorCode,
      "details": errors[errorCode],
      writer: false
    });
  }
  
});

module.exports = router
