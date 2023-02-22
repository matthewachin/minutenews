const express = require('express'),
  router = express.Router();

const Game = require('../models/game_model');
const Opponent = require('../models/opponent_model');

router.get('/play', function(request, response) {
    let opponents = Opponent.getOpponents();
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("game/play", {
      data: opponents
    });
});

router.get('/results', function(request, response) {
    let opponentName = request.query.opponent;
    let playerThrow = request.query.throw;

    if(Opponent.isOpponent(opponentName)){
      let results = Game.playGame(opponentName, playerThrow);
      Opponent.updateOpponent(opponentName, results["outcome"]);
      results["photo"] = Opponent.getOpponent(opponentName)["photo"];
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render("game/results", {
        data: results
      });
    }else{
      response.redirect('/error?code=404');
    }
});

router.get('/recentGames', function(request, response) {
  let gamesArray = Game.getSortedGames();

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("game/recentGames",{
    games: gamesArray
  });
});

module.exports = router;
