
class Game extends GameContainer {

  constructor(data) {
    super(data);

    this.type = "Game";

    this.author = "";
    this.scenes = {};
    this.things = {};
    this.first_scene = null;
    this.start_player_pos = [0,0];
    this.game = this;
    this.screenDimensions = [360,240];
    this.canvas = null;
    this.playContext = null;
    this.ctxScaling = 2;
    this.currentScene = null;
    this.messageBoxDimensions = [200,100];
    this.textFontSize = 10;
    this.textFont = this.textFontSize + "px courier";
    this.currentMessage = null;
    this.createPlayContext();
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
            console.log('select');
            break;
          case "s":
            console.log('dismiss');
            break;
          default:
            console.log('nothing');
        }
      }
      this.player.dx = moveX * moveDistance;
      this.player.dy = moveY * moveDistance;
    }
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

    window.addEventListener("keydown", this, false);
    window.addEventListener("keyup",this,false);

    this.running = true;
    this.runStack = this.runStack.concat(this.actions);
    this.stackLoop();
    this.viewLoop();
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
    if (this.player.dx != 0 && this.player.dy != 0){

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
      player_rect[2] += this.player.dx;
      player_rect[3] += this.player.dy;

      var dx_rect = this.player.getRect();
      dx_rect[0] += this.player.dx;
      dx_rect[2] += this.player.dx;

      var dy_rect = this.player.getRect();
      dy_rect[1] += this.player.dy;
      dy_rect[3] += this.player.dy;

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

  createPlayContext(){
    var playView = document.getElementById('mapview');
    if (this.canvas){
      this.playContext.remove;
      this.canvas.remove;
    }
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute('id','map');
    this.canvas.setAttribute('width','720');
    this.canvas.setAttribute('height','480');
    playView.append(this.canvas);
    this.playContext = this.canvas.getContext("2d");
    this.playContext.scale(this.ctxScaling,this.ctxScaling);
    this.playContext.imageSmoothingEnabled = false;
    this.playContext.font = this.textFont;
  }

  updatePlayView(){
    if (this.currentScene){
      if(this.currentScene.backgroundImage){
        this.playContext.drawImage(this.currentScene.backgroundImage, 0,0);
      }

      for (const thing_id of this.currentScene.things){
        var thing = game.things[thing_id];
        thing.draw(this.playContext);
      }
      if(this.currentScene.draw_player){
        this.player.draw(this.playContext);
      }
      this.drawMessage();
      this.drawMenu();
    }else{
      this.playContext.clearRect(0,0,this.screenDimensions[0],this.screenDimensions[1]);
    }
  }

  editCollisions(){
    var me = this;
    if (this.currentScene){
      if(this.currentScene.backgroundImage){
        if(this.playContext){
          this.collisionListener = this.canvas.addEventListener(
            "click",
            function (event) {
              var collisions = me.currentScene.collisions;
              var collisionLocScale = me.ctxScaling * me.currentScene.collisionDimensions;
              var collClickX = Math.floor(event.offsetX/collisionLocScale);
              var collClickY = Math.floor(event.offsetY/collisionLocScale);
              if(!Object.keys(collisions).includes(collClickX.toString())){
                collisions[collClickX] = [collClickY];
              }else if (!collisions[collClickX].includes(collClickY)){
                collisions[collClickX].push(collClickY);
              }else{
                collisions[collClickX].splice(collisions[collClickX].indexOf(collClickY),1);
              }
              me.drawCollisions();
            },
            false,
          );
          this.drawCollisions();
        }
      }
    }
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
        this.playContext.fillRect(thing.location[0],thing.location[1],thing.dimensions[0],thing.dimensions[1]);
      }
    }
  }

  drawMessage(){
    if (this.currentMessage){
      var lineNum = 0;
      //draw rectangle
      this.playContext.fillStyle = 'rgb(100,100,100)';
      this.playContext.fillRect(80, 0, this.messageBoxDimensions[0], this.messageBoxDimensions[1])
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

  displayMessage(text_lines){
    this.currentMessage = text_lines;
    this.buttonEventHandler = 'message';
    this.runStackPaused = true;
  }

  dismissMessage(){
    this.runStackPaused = false;
    this.currentMessage = null;
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

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>'+this.name+ ':</b> ' + this.description;
  }

  display() {
    var node = super.display();

    var thingNodes = this.getChildContainer(node,'things');
    if (this.things){
      for (const [id,thing] of Object.entries(this.things)){
        var thingNode = thing.display('game');
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
      var playerNode = this.player.display('game');
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
        var sceneNode = scene.display();
        sceneNodes.append(sceneNode);
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

    return data;
  }

  addNewScene(){
    var scene = new Scene({'parent':this,'game':this});
    this.scenes[scene.id]=scene;
    var sceneNodes = this.getChildContainer(this.nodes[0],'scenes');
    sceneNodes.append(scene.display());
  }

  addNewThing(thing){
    this.things[thing.id]=thing;
    var thingNodes = this.getChildContainer(this.nodes[0],'things');
    thingNodes.append(thing.display('game'));
    this.edit(this.currentNode);
  }
}