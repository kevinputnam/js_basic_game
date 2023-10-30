var game_file = "game_data.json";
var game = null;

function get_game_data(){
  console.log(game_file);
  fetch(game_file).then(response => response.text()).then(respText => load_game(respText));
}

function load_game(text){
  reset();
  var jstuff = JSON.parse(text);
  game = new Game();
  game.load(jstuff);
}

function run_game(){
  if(game){
    args = {};
    args['disable_editing'] = do_nothing;
    args['enable_editing'] = do_nothing;
    //disable editing
    game.run(args);
    //re-enable editing
  }
}

function stop_game(){
  if(game){
    game.stop();
  }
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