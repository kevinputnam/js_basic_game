
class Game extends GameContainer {

  constructor(data) {
    super(data);

    this.type = "Game";

    this.game = this;
    this.author = "";
    this.scenes = {};
    this.things = {};
    this.callbacks = {};
    var cb = new Callback({'parent':this,'game':this.game});
    cb.name = "on_select_button";
    cb.description = "Called when the game select button is pushed during normal play.";
    this.callbacks[cb.name]=cb;
    this.first_scene = null;
    this.start_player_pos = [0,0];
    this.screenDimensions = [360,240];
    this.canvas = null;
    this.playContext = null;
    this.ctxScaling = 2;
    this.currentScene = null;
    this.addingCollisions = false;
    this.removingCollisions = false;
    this.messageBoxDimensions = [200,100];
    this.messageImageDimensions = [60,100];
    this.textFontSize = 10;
    this.textFont = this.textFontSize + "px courier";
    this.currentMessage = null;
    this.currentMessageImage = null;

    var editor = false;
    if (data && "editor" in data){
      editor = data["editor"];
    }
    this.createPlayContext(editor);
    this.runStack = [];
    this.variables = {};
    this.runStackPaused = false;
    this.stackRunnerInterval = null;
    this.running = false;
    this.disable_editing = null;
    this.enable_editing = null;
    this.currentAction = null;
    this.controlKeys = ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","a","s"];
    this.buttonEventHandler = "default";
    this.player = new Player({'parent':null,'game':this.game});
    this.collisionListener = null;
    this.controller = {
      "ArrowDown": false,
      "ArrowUp": false,
      "ArrowLeft": false,
      "ArrowRight": false,
      "a": false,
      "s": false
    }
  }

  chooseButtonHandler(key){
    switch(this.buttonEventHandler){
      case "message":
        this.messageButtonHandler(key);
        break;
      case "menu":
        this.menuButtonHandler(key);
        break;
      default:
        console.log("default");
    }
  }

  handleEvent(event){
    if (event.defaultPrevented){
      return;
    }
    if(this.buttonEventHandler == 'default'){
      if(this.controlKeys.includes(event.key)){
        if (event.type == "keydown"){
          this.controller[event.key]=true;
        }else{
          this.controller[event.key]=false;
        }
      }
    }else{
      this.controller[event.key] = false;
      if(event.type == "keydown"){
        this.chooseButtonHandler(event.key);
      }
    }
    event.preventDefault();
  }

  defaultButtonHandler(keys){
    var moveX = 0;
    var moveY = 0;
    var moveDistance = 1;
    for (const [key,pressed] of Object.entries(keys)){
      if (pressed){
        switch (key) {
          case "ArrowDown":
            moveY += 1;
            this.player.direction = "down";
            break;
          case "ArrowUp":
            moveY -= 1;
            this.player.direction = "up";
            break;
          case "ArrowLeft":
            moveX -= 1;
            this.player.direction = "left";
            break;
          case "ArrowRight":
            moveX += 1;
            this.player.direction = "right";
            break;
          case "a":
            // select button
            this.select_pushed();
            break;
          case "s":
            console.log('dismiss pushed');
            break;
          default:
            console.log('nothing');
        }
      }
    }
    if(moveX != 0 && moveY != 0){
      moveX = moveX * 0.7071;
      moveY = moveY * 0.7071;
    }
    this.player.dx = moveX * moveDistance;
    this.player.dy = moveY * moveDistance;

  }

  messageButtonHandler(key){
    if (key == 's' || key == 'a'){
      this.dismissMessage();
    }
  }

  menuButtonHandler(key){
    switch (key) {
      case "ArrowDown":
        if(this.menuSelectorIndex < this.menuChoices.length -1){
          this.menuSelectorIndex += 1;
        }
        break;
      case "ArrowUp":
        if(this.menuSelectorIndex > 0){
          this.menuSelectorIndex -= 1;
        }
        break;
      case "a":
        console.log("$" + this.menuVariable + " set to " + this.menuSelectorIndex);
        this.variables[this.menuVariable] = this.menuSelectorIndex;
        if (this.menuUseValue){
          this.variables[this.menuVariable] = '"' + this.menuChoices[this.menuSelectorIndex] + '"';
        }
        this.dismissMenu();
        break;
      case "s":
        console.log('dismiss');
        this.variables[this.menuVariable] = null;
        this.dismissMenu();
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  }

  run(args){
    if(args){
      if(args['disable_editing']){
        this.disable_editing = args['disable_editing'];
        this.disable_editing();
      }
      if(args['enable_editing']){
        this.enable_editing = args['enable_editing'];
      }
    }

    if (args['cleanStart']){
      window.addEventListener("keydown", this, false);
      window.addEventListener("keyup",this,false);

      this.running = true;
      this.stackLoop();
      this.viewLoop();
    }
    this.runStack = [];
    this.runStack = this.runStack.concat(this.actions);
  }

  stop(){
    if (this.running){
      this.running = false;
    }
  }

  reset(){
    this.runStackPaused = false;
    this.runStack = [];
    this.variables = {};
    if (this.enable_editing){
      this.enable_editing();
    }
    this.currentMessage = null;
    this.currentScene = null;
    removeEventListener("keydown",this,false);
  }

  stackLoop(){
    setTimeout(() => this.stackRunner(),12);
  }

  viewLoop(){
    setTimeout(() => this.updatePlayLoop(),12);
  }

  stackRunner(){
    if(!this.runStackPaused){
      if (this.runStack.length > 0){
        this.currentAction = this.runStack.shift();
        this.currentAction.run();
      }
    }
    if (this.running){
      this.stackLoop();
    }else{
      console.log("Stopping run stack!");
      this.reset();
    }
  }

  updatePlayLoop(){
    if (this.buttonEventHandler == 'default'){
      this.defaultButtonHandler(this.controller);
    }
    if (this.player.dx != 0 || this.player.dy != 0){
      this.player.moved = true;
    }
    if (this.currentScene){
      this.movePlayer();
    }
    this.updatePlayView();

    if (this.running){
      this.viewLoop();
    }else{
      console.log("Stopping view updates!");
      this.reset();
    }
  }

  runStackClear(){
    this.runStack = [];
  }

  runStackInsert(actions){
    var actionsCopy = actions.concat();
    this.runStack.unshift(...actionsCopy);
  }

  changeScene(scene_id){
    this.runStackClear();
    this.currentScene = this.scenes[scene_id];
    this.currentScene.run();
  }

  movePlayer(moveX,moveY){
    if (this.currentScene.draw_player){

      var player_rect = this.player.getRect();
      player_rect[0] += this.player.dx;
      player_rect[1] += this.player.dy;

      var dx_rect = this.player.getRect();
      dx_rect[0] += this.player.dx;

      var dy_rect = this.player.getRect();
      dy_rect[1] += this.player.dy;

      //check if player exceeds scene boundary
      var screenBoundaries = [0,0,this.currentScene.backgroundImage.width,this.currentScene.backgroundImage.height];
      var d = outOfBounds(this.player.dx,this.player.dy,player_rect,screenBoundaries);
      this.player.dx = d.x;
      this.player.dy = d.y;

      //resolve collisions with things
      for(const thing_id of this.currentScene.things){
        var t = this.things[thing_id];
        if(t.collision(player_rect)){
          this.player.dx = 0;
          this.player.dy = 0;
        }
      }

      //resolve collisions with walls
      const collDim = this.currentScene.collisionDimensions;
      for(const [x_str,y_list] of Object.entries(this.currentScene.collisions)){
        for(var y of y_list){
          var coll_rect = collisionRect(collDim,parseInt(x_str),y);
          if (collision(dx_rect,coll_rect)){
            this.player.dx = 0;
          }
          if (collision(dy_rect,coll_rect)){
            this.player.dy = 0;
          }
        }
      }

      this.player.location[0] += this.player.dx;
      this.player.location[1] += this.player.dy;

    }
  }

  createPlayContext(editor){
    var playView = document.getElementById('mapview');
    if (this.canvas){
      this.playContext.remove;
      this.canvas.remove;
    }
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute('id','map');
    if (editor==true){
      this.canvas.setAttribute('width','4000');
      this.canvas.setAttribute('height','4000');
      this.screenDimensions = [2000,2000];
    }else{
      this.canvas.setAttribute('width','720');
      this.canvas.setAttribute('height','480');
    }
    playView.append(this.canvas);
    this.playContext = this.canvas.getContext("2d");
    this.playContext.scale(this.ctxScaling,this.ctxScaling);
    this.playContext.imageSmoothingEnabled = false;
    this.playContext.font = this.textFont;
    this.addCollisionListeners();
  }

  updatePlayView(){
    this.playContext.clearRect(0,0,this.screenDimensions[0],this.screenDimensions[1]);


    var map_offset_x = 0;
    var map_offset_y = 0;
    var player_offset_x = 0;
    var player_offset_y = 0;

    if (this.currentScene){
      if(this.currentScene.backgroundImage){

        if (this.running){
          //Calculate offsets to make sure camera stays centered on player during game play

          //max offsets for the map
          var max_map_x = this.screenDimensions[0] - this.currentScene.backgroundImage.width;
          var max_map_y = this.screenDimensions[1] - this.currentScene.backgroundImage.height;

          //shift map under player at center screen
          var map_offset_x = Math.round(this.screenDimensions[0]/2 - this.player.location[0]);
          var map_offset_y = Math.round(this.screenDimensions[1]/2 - this.player.location[1]);

          //if the map needs to move to the right - move player left (-)
          if (map_offset_x > 0){
            player_offset_x = -1* map_offset_x;
            map_offset_x = 0;
          //if the map can't move any further - move the player right (+)
          } else if (map_offset_x < max_map_x){
            player_offset_x = -1*(map_offset_x - max_map_x);
            map_offset_x = max_map_x;
          }

          //if the map needs to move down - move player up (-)
          if (map_offset_y > 0){
            player_offset_y = -1*map_offset_y;
            map_offset_y = 0;
          //if the map can't move any further - move the player down (+)
          } else if (map_offset_y < max_map_y){
            player_offset_y = -1*(map_offset_y - max_map_y);
            map_offset_y = max_map_y;
          }

        }

        this.playContext.drawImage(this.currentScene.backgroundImage, map_offset_x,map_offset_y);
      }

      for (const thing_id of this.currentScene.things){
        var thing = game.things[thing_id];
        var draw_x = thing.location[0] + map_offset_x;
        var draw_y = thing.location[1] + map_offset_y;
        thing.draw(this.playContext,draw_x,draw_y);
      }
      if(this.currentScene.draw_player){
        var draw_x = this.screenDimensions[0]/2 + player_offset_x;
        var draw_y = this.screenDimensions[1]/2 + player_offset_y;
        this.player.draw(this.playContext,draw_x,draw_y);
      }
      this.drawMessage();
      this.drawMenu();
    }
  }

  collisionMouseUpHandler = (event) => {
    if (this.currentScene){
      if(this.currentScene.backgroundImage){
        this.addingCollisions = false;
        this.removingCollisions = false;
      }
    }
  }

  collisionMouseDownHandler = (event) => {
    if (!this.running){
      if (this.currentScene){
        if(this.currentScene.backgroundImage){
          var collisions = this.currentScene.collisions;
          var collisionLocScale = this.ctxScaling * this.currentScene.collisionDimensions;
          if(event.offsetX/this.ctxScaling < this.currentScene.backgroundImage.width && event.offsetY/this.ctxScaling < this.currentScene.backgroundImage.height){
            var collClickX = Math.floor(event.offsetX/collisionLocScale);
            var collClickY = Math.floor(event.offsetY/collisionLocScale);
            if (!this.addingCollisions && !this.removingCollisions){
              if(!Object.keys(collisions).includes(collClickX.toString())){
                collisions[collClickX] = [collClickY];
                this.addingCollisions = true;
              }else if (!collisions[collClickX].includes(collClickY)){
                this.addingCollisions = true;
                collisions[collClickX].push(collClickY);
              }else{
                this.removingCollisions = true;
                collisions[collClickX].splice(collisions[collClickX].indexOf(collClickY),1);
              }
            }
          }
        }
      }
    }
  }

  collisionMouseMoveHandler = (event) => {
    var coordspan = document.getElementById("cursorcoords");
    if (!this.running){
      if (this.currentScene){
        if(this.currentScene.backgroundImage){
          var collisions = this.currentScene.collisions;
          var collisionLocScale = this.ctxScaling * this.currentScene.collisionDimensions;
          if(event.offsetX/this.ctxScaling < this.currentScene.backgroundImage.width && event.offsetY/this.ctxScaling < this.currentScene.backgroundImage.height){
            coordspan.innerHTML = Math.floor(event.offsetX/this.ctxScaling) + "," + Math.floor(event.offsetY/this.ctxScaling);
            var collClickX = Math.floor(event.offsetX/collisionLocScale);
            var collClickY = Math.floor(event.offsetY/collisionLocScale);
            if (this.addingCollisions){
              if(!Object.keys(collisions).includes(collClickX.toString())){
                collisions[collClickX] = [collClickY];
              } else if(!collisions[collClickX].includes(collClickY)){
                collisions[collClickX].push(collClickY);
              }
            }
            if (this.removingCollisions){
              if(Object.keys(collisions).includes(collClickX.toString())){
                if(collisions[collClickX].includes(collClickY)){
                  collisions[collClickX].splice(collisions[collClickX].indexOf(collClickY),1);
               }
              }
            }
            this.drawCollisions();
          }
        }
      }
    }
  }

  addCollisionListeners(){
    this.canvas.addEventListener("mouseup",this.collisionMouseUpHandler,false);
    this.canvas.addEventListener("mousedown",this.collisionMouseDownHandler,false);
    this.canvas.addEventListener("mousemove",this.collisionMouseMoveHandler,false,);
  }


  drawCollisions(){
    if (this.currentScene){
      this.updatePlayView();
      this.playContext.fillStyle='rgba(225,0,0,0.7)';
      const collDim = this.currentScene.collisionDimensions;
      for(const [x_str,y_list] of Object.entries(this.currentScene.collisions)){
        var x_coord = parseInt(x_str)*collDim;
        for(var y of y_list){
          var y_coord = y*collDim;
          this.playContext.fillRect(x_coord, y_coord, collDim, collDim);
        }
      }
      //call out the things
      this.playContext.fillStyle='rgba(225,225,225,0.7)';
      for (const thing_id of this.currentScene.things){
        const thing = this.things[thing_id];
        var tRect = thing.getRect()
        this.playContext.fillRect(tRect[0],tRect[1],tRect[2],tRect[3]);
      }
    }
  }

  drawMessage(){
    if (this.currentMessage){
      var lineNum = 0;
      //draw rectangle for text portion of message
      this.playContext.fillStyle = 'rgb(100,100,100)';
      this.playContext.fillRect(80, 0, this.messageBoxDimensions[0], this.messageBoxDimensions[1]);
      //draw rectangle for image portion of message
      if (this.currentMessageImage){
        this.playContext.fillRect(20, 0, this.messageImageDimensions[0], this.messageImageDimensions[1]);
        this.playContext.drawImage(this.currentMessageImage, 25, 5);
      }
      //draw text
      this.playContext.fillStyle = "white";
      for(const line of this.currentMessage){
        var y_coord = 10 + this.textFontSize*lineNum;
        var x_coord = 85;
        this.playContext.fillText(line,x_coord,y_coord);
        lineNum += 1;
      }
      lineNum = 9;
      this.playContext.fillText("B: Dismiss",215,5 + this.textFontSize*lineNum)
    }
  }

  drawMenu(){
    if (this.menuChoices){
      var lineNum = 0;
      var cursor = '>';
      var lines = this.menuPrompt.concat(); // make a copy
      var choiceIndex = 0;
      for(var line of this.menuChoices){
        if(choiceIndex == this.menuSelectorIndex){
          line = cursor + line;
        }else{
          line = ' ' + line;
        }
        choiceIndex += 1;
        lines.push(line);
      }
      //draw rectangle
      this.playContext.fillStyle = 'rgb(100,100,100)';
      this.playContext.fillRect(80, 0, this.messageBoxDimensions[0], this.messageBoxDimensions[1])
      //draw text
      this.playContext.fillStyle = "white";
      for(const line of lines){
        var y_coord = 10 + this.textFontSize*lineNum;
        var x_coord = 85;
        this.playContext.fillText(line,x_coord,y_coord);
        lineNum += 1;
      }
      lineNum = 9;
      this.playContext.fillText("A: Select B: Dismiss", 155, 5 + this.textFontSize*lineNum)
    }
  }

  displayMessage(text_lines,image){
    this.currentMessage = text_lines;
    this.currentMessageImage = image;
    this.buttonEventHandler = 'message';
    this.runStackPaused = true;
  }

  dismissMessage(){
    this.runStackPaused = false;
    this.currentMessage = null;
    this.currentMessageImage = null;
    this.buttonEventHandler = 'default';
  }

  displayMenu(choices,prompt,result_variable,useValue){
    this.menuChoices = choices;
    this.menuPrompt = prompt;
    this.menuSelectorIndex = 0;
    this.menuVariable = result_variable;
    this.menuUseValue = useValue;
    this.buttonEventHandler = 'menu';
    this.runStackPaused = true;
  }

  dismissMenu(){
    this.runStackPaused = false;
    this.menuChoices = null;
    this.menuPrompt = null;
    this.menuSelectorIndex = 0;
    this.menuVariable = null;
    this.menuUseValue = false;
    this.buttonEventHandler = 'default';
  }

  select_pushed(){
    this.callbacks["on_select_button"].run();
  }


  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>'+this.name+ ':</b> ' + this.description;
  }

  getNode() {
    var node = super.getNode();

    var thingNodes = this.getChildContainer(node,'things');
    if (this.things){
      for (const [id,thing] of Object.entries(this.things)){
        var thingNode = thing.getNode('game');
        thingNodes.append(thingNode);
      }
    }

    var player_sp = document.createElement('span')
    var player_tv = document.createElement('div');
    player_sp.setAttribute('class','caret');
    player_sp.setAttribute('onclick','flipCaret(this)');
    player_sp.innerHTML = 'Player';
    player_tv.append(player_sp);

    var playerNodes = document.createElement('div');
    playerNodes.setAttribute('class','nested player');
    player_tv.append(playerNodes);
    node.append(player_tv);

    if (this.player){
      var playerNode = this.player.getNode('game');
      playerNodes.append(playerNode);
    }

    var scene_sp = document.createElement('span')
    var scene_tv = document.createElement('div');
    scene_sp.setAttribute('class','caret');
    scene_sp.setAttribute('onclick','flipCaret(this)');
    scene_sp.innerHTML = 'Scenes';
    scene_tv.append(scene_sp)

    var sceneNodes = document.createElement('div');
    sceneNodes.setAttribute('class','nested scenes');
    scene_tv.append(sceneNodes)
    node.append(scene_tv);
    if (this.scenes){
      for (const [id,scene] of Object.entries(this.scenes)){
        var sceneNode = scene.getNode();
        sceneNodes.append(sceneNode);
      }
    }

    var callback_sp = document.createElement('span')
    var callback_tv = document.createElement('div');
    callback_sp.setAttribute('class','caret');
    callback_sp.setAttribute('onclick','flipCaret(this)');
    callback_sp.innerHTML = 'Callbacks';
    callback_tv.append(callback_sp)

    var callbackNodes = document.createElement('div');
    callbackNodes.setAttribute('class','nested callbacks');
    callback_tv.append(callbackNodes)
    node.append(callback_tv);
    if (this.callbacks){
      for (const [callbacktype,callback] of Object.entries(this.callbacks)){
        var callbackNode = callback.getNode();
        callbackNodes.append(callbackNode);
      }
    }

    return node;
  }

  load(data) {

    super.load(data);

    this.author= data['author'];

    var childData = {'parent':this,'game':this.game};

    this.things = {};
    for (const [thing_id,thing_data] of Object.entries(data['things'])){
      var newThing = new Thing(childData);
      newThing.load(thing_data);
      this.things[newThing.id] = newThing;
    }

    this.player = new Player(childData);
    if (data['player']){
      this.player.load(data['player']);
    }

    childData['parent'] = this;

    this.scenes = {};
    for (const [scene_id,scene_data] of Object.entries(data['scenes'])){
      var newScene = new Scene(childData);
      newScene.load(scene_data);
      this.scenes[newScene.id] = newScene;
    }

    if ("callbacks" in data){
      if ("on_select_button" in data["callbacks"]){
        this.callbacks["on_select_button"].load(data["callbacks"]["on_select_button"]);
      }
    }
  }

  save() {
    var data = super.save();
    data['author'] = this.author;

    var things = {}
    for (const [key,value] of Object.entries(this.things)){
      things[key] = value.save();
    }
    data['things'] = things;

    data['player'] = this.player.save();

    var scenes = {}
    for (const [key,value] of Object.entries(this.scenes)){
      scenes[key] = value.save();
    }
    data['scenes'] = scenes;

    var cbs = {}
    for (const [key,value] of Object.entries(this.callbacks)){
      cbs[key] = value.save();
    }
    data['callbacks'] = cbs;

    return data;
  }

  addNewScene(){
    var scene = new Scene({'parent':this,'game':this});
    this.scenes[scene.id]=scene;
    var sceneNodes = this.getChildContainer(this.nodes[0],'scenes');
    sceneNodes.append(scene.getNode());
  }

  addNewThing(thing){
    this.things[thing.id]=thing;
    var thingNodes = this.getChildContainer(this.nodes[0],'things');
    thingNodes.append(thing.getNode('game'));
    this.edit(this.currentNode);
  }
}