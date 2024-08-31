var game_file = "game_data.json";
var game = null;

function get_game_data(){
  console.log(game_file);
  fetch(game_file).then(response => response.text()).then(respText => start_game(respText));
}

function start_game(text){
  var cleanStart = false;
  if (!game){
    reset();
    game = new Game();
    cleanStart = true;
  }
  var jstuff = JSON.parse(text);
  game.variables = {};
  game.load(jstuff);
  game.run({'cleanStart':cleanStart});
}

function reset(){
  var mapView = document.getElementById('mapview');

  mapView.replaceChildren();

  //need to set id counters to zero
  Thing.next_id = 0;
  Scene.next_id = 0;

  game = null;
}

function do_nothing(){

}