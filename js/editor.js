var game_files = ["game_data.json"];
var game = null;
var saveLink = null;
var game_data = null;

var savebtn = document.getElementById('savebutton');
var loadbtn = document.getElementById('loadbutton');
var newbtn  = document.getElementById('newbutton');
var runbtn  = document.getElementById('runbutton');

function populate_game_picker(){
  var gameselector = document.getElementById('gamefilepicker');
  for (const gamefile of game_files){
    var opt = new Option;
    opt.value = gamefile;
    opt.innerHTML = gamefile;
    gameselector.appendChild(opt);
  }
}

function get_game_data(){
  var gameselector = document.getElementById('gamefilepicker');
  fetch(gameselector.value).then(response => response.text()).then(respText => load_game(respText));
}

function load_game(text){
  reset();
  var gameView = document.getElementById('gamedata');
  var jstuff = JSON.parse(text);
  game = new Game({"editor":true});
  game.load(jstuff);
  gameView.replaceChildren(game.getNode());
}

function create_new_game(){
  reset();
  var gameView = document.getElementById('gamedata');
  game = new Game();
  gameView.replaceChildren(game.getNode());
}

function save_game(){
  saveLink = null;
  if (game){
    var gameJSON = JSON.stringify(game.save(),null,'  ');
    const downloadFile = new File([gameJSON], 'game_data.json');
    var fileURL = URL.createObjectURL(downloadFile);
    var saveLink = document.createElement('a');
    saveLink.innerHTML = 'Download save game.'
    saveLink.setAttribute('href',fileURL);
    saveLink.setAttribute('id','download_link');
    saveLink.setAttribute('download','game_data.json');
    saveLink.click();
  }
}

function disable_editing(){
  loadbtn.disabled = true;
  savebtn.disabled = true;
  newbtn.disabled = true;
  runbtn.disabled = true;
}

function enable_editing(){
  loadbtn.disabled = false;
  savebtn.disabled = false;
  newbtn.disabled = false;
  runbtn.disabled = false;
  var gameJSON = JSON.stringify(game_data,null,'  ');
  reset();
  load_game(gameJSON);
}

function reset(){
  var editView = document.getElementById('editview');
  var gameView = document.getElementById('gamedata');
  var mapView = document.getElementById('mapview');

  mapView.replaceChildren();

  //need to set id counters to zero
  Thing.next_id = 0;
  Scene.next_id = 0;

  editView.replaceChildren();
  gameView.replaceChildren();

  game = null;
}
