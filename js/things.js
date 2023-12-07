

class Thing extends GameContainer {
  static next_id = 0;

  constructor(data) {
    super(data);

    if(data['type'] != 'Player'){
      this.id = Thing.next_id;
      Thing.next_id += 1;
      this.type = "Thing";
    }

    this.hidden = false;
    this.trigger = false;
    this.triggered = false;

    this.spriteImage= document.createElement('img');
    this.spritePath = "";
    this.location = [0,0];
    this.dimensions = [0,0];
    this.animate = false;
    this.currentFrame = 0;
    this.spriteRows = 1;
    this.spritesPerRow = 1;
    this.spriteDim = [0,0];
    this.animations = {"up":[],"down":[],"left":[],"right":[]};
  }

  load(data) {
    super.load(data);

    if ('id' in data){
      this.id = data['id'];
      Thing.next_id = this.id + 1;
    }

    var me = this;
    this.hidden = data['hidden'];
    this.trigger = data['trigger'];
    this.triggered = data['triggered'];

    //TODO add sprite handling this.sprite = ?
    this.location[0] = data['location'][0];
    this.location[1] = data['location'][1];
    this.dimensions[0] = data['dimensions'][0];
    this.dimensions[1] = data['dimensions'][1];

    var newcoords = []
    for(var item of this.location){
      item = parseInt(item);
      newcoords.push(item);
    }
    this.location = newcoords;

    newcoords = [];
    for(var item of this.dimensions){
      item = parseInt(item);
      newcoords.push(item);
    }
    this.dimensions = newcoords;

    this.spritePath = data['spritePath'];
    if(this.spritePath){
      this.spriteImage.setAttribute('src',this.spritePath);
      this.spriteImage.addEventListener("load", (e) => {
        me.game.drawCollisions();
      });
    }
    if ('animate' in data){
      this.animate = data['animate'];
      if (data['animate']){
        this.currentFrame = data['currentFrame'];
        this.spriteRows = data['spriteRows'];
        this.spritesPerRow = data['spritesPerRow'];
        this.animations = data['animations'];
        this.spriteDim = data['spriteDim'];
      }
    }
  }

  save() {
    var data = super.save();
    data['id'] = this.id;
    data['hidden'] = this.hidden;
    data['trigger'] = this.trigger;
    data['triggered'] = this.triggered;
    data['location'] = [];
    data['location'][0] = this.location[0];
    data['location'][1] = this.location[1];
    data['dimensions'] = [];
    data['dimensions'][0] = this.dimensions[0];
    data['dimensions'][1] = this.dimensions[1];
    data['spritePath'] = this.spritePath;
    data['animate'] = this.animate;
    if (this.animate){
      data['currentFrame'] = this.currentFrame;
      data['spriteRows'] = this.spriteRows;
      data['spritesPerRow'] = this.spritesPerRow;
      data['animations'] = this.animations;
      data['spriteDim'] = this.spriteDim;
    }

    return data;
  }

  getParentCanvasContext(){
    if (this.parent){
      if (this.parent.canvasContext){
        return this.parent.canvasContext;
      }
    }
    return null;
  }

  run(){
    this.game.runStackInsert(this.actions);
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById('editview');

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Sprite image: ";

    var spriteThumbnail = document.createElement('img');
    spriteThumbnail.setAttribute('style','width:30;');
    if(this.spritePath){
      spriteThumbnail.setAttribute('src',this.spritePath);
    }

    var imageFileInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    imageFileInputField.value = this.spritePath;
    imageFileInputField.addEventListener("change", (event)=> {
      me.spritePath = event.target.value;
      spriteThumbnail.setAttribute('src',event.target.value);
      me.spriteImage.setAttribute('src',event.target.value);
    })

    editView.append(inputLabel,imageFileInputField,document.createElement('br'))

    var inputLabel2 = document.createElement("label")
    inputLabel2.innerHTML = "Location [x,y]: ";

    var xInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':this.game.screenDimensions[0]});
    xInputField.value = this.location[0];
    xInputField.addEventListener("change", (event)=> {
      me.location[0] = parseInt(event.target.value);
      me.game.drawCollisions();
    })

    var yInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':this.game.screenDimensions[1]});
    yInputField.value = this.location[1];
    yInputField.addEventListener("change", (event)=> {
      me.location[1] = parseInt(event.target.value);
      me.game.drawCollisions();
    })

    editView.append(inputLabel2,xInputField,yInputField,document.createElement('br'));

    var inputLabel3 = document.createElement("label")
    inputLabel3.innerHTML = "Dimensions [x,y]: ";

    var xDimInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':'1000'});
    xDimInputField.value = this.dimensions[0];
    xDimInputField.addEventListener("change", (event)=> {
      me.dimensions[0] = parseInt(event.target.value);
      me.game.drawCollisions();
    })

    var yDimInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':'1000'});
    yDimInputField.value = this.dimensions[1];
    yDimInputField.addEventListener("change", (event)=> {
      me.dimensions[1] = parseInt(event.target.value);
      me.game.drawCollisions();
    })

    editView.append(inputLabel3,xDimInputField,yDimInputField,document.createElement('br'),spriteThumbnail,document.createElement('br'));

    var animateCheckbox = createElementWithAttributes('input',{'type':'checkbox'});
    animateCheckbox.checked = this.animate;
    animateCheckbox.addEventListener("change", (event)=>{
      me.animate = event.target.checked;
    })

    var animateLabel = document.createElement("label");
    animateLabel.innerHTML = "Animate sprite";

    editView.append(animateCheckbox,animateLabel,document.createElement('br'));

    var inputLabel4 = document.createElement("label")
    inputLabel4.innerHTML = "Frames per row: ";

    var framesPerRowInputField = createElementWithAttributes('input',{'type':'number','min':'1','max':'20'});
    framesPerRowInputField.value = this.spritesPerRow;
    framesPerRowInputField.addEventListener("change", (event)=> {
      me.spritesPerRow = parseInt(event.target.value);
      me.spriteDim[0] = me.spriteImage.width/me.spritesPerRow;
    })

    var inputLabel5 = document.createElement("label")
    inputLabel5.innerHTML = "Number of rows: ";

    var frameRowsInputField = createElementWithAttributes('input',{'type':'number','min':'1','max':'20'});
    frameRowsInputField.value = this.spriteRows;
    frameRowsInputField.addEventListener("change", (event)=> {
      me.spriteRows = parseInt(event.target.value);
      me.spriteDim[1] = me.spriteImage.height/me.spriteRows;
    })

    editView.append(inputLabel4,framesPerRowInputField,document.createElement('br'),inputLabel5,frameRowsInputField,document.createElement('br'));

    var downLabel = document.createElement("label");
    downLabel.innerHTML = "Down: ";

    var downInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    downInputField.value = listOfListsString(this.animations['down']);
    downInputField.addEventListener("change", (event)=> {
      me.animations['down'] = eval(event.target.value);
    })

    var upLabel = document.createElement("label");
    upLabel.innerHTML = "Up: ";

    var upInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    upInputField.value = listOfListsString(this.animations['up']);
    upInputField.addEventListener("change", (event)=> {
      me.animations['up'] = eval(event.target.value);
    })

    var leftLabel = document.createElement("label");
    leftLabel.innerHTML = "Left: ";

    var leftInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    leftInputField.value = listOfListsString(this.animations['left']);
    leftInputField.addEventListener("change", (event)=> {
      me.animations['left'] = eval(event.target.value);
    })

    var rightLabel = document.createElement("label");
    rightLabel.innerHTML = "Right: ";

    var rightInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    rightInputField.value = listOfListsString(this.animations['right']);
    rightInputField.addEventListener("change", (event)=> {
      me.animations['right'] = eval(event.target.value);
    })

    editView.append(downLabel, downInputField,document.createElement('br'),upLabel, upInputField,document.createElement('br'),
      leftLabel, leftInputField,document.createElement('br'),
      rightLabel, rightInputField,document.createElement('br'));

    if (node){
      if (!node.classList.contains('game'))
      {
        var editView = document.getElementById('editview');
        editView.append(this.createRemoveButton(),document.createElement('br'),document.createElement('br'));
      }
    }
  }

  getParentObjectOfNode(node){
    var parentName = node.parentElement.parentElement.parentElement.getAttribute('name');
    var parentNameBits = parentName.split("_");
    var parentType = parentNameBits[0];
    var parentID = parentNameBits[1];
    var parent = null;
    if (parentType == 'Thing'){
      parent = this.game.things[parentID];
    }else if (parentType == 'Scene'){
      parent = this.game.scenes[parentID];
    }
    return parent;
  }

  remove(){
    // find all of the instances that have the same parent node
    var new_nodes = [];
    for (const node of this.nodes){
      if(!node.classList.contains('game')){
        //remove the node from the DOM
        node.remove();
      }else{
        new_nodes.push(node); //only add the game node to list of nodes;
      }
    }

    this.nodes = new_nodes;
    // remove the thing id from its parent's list of things
    if(this.parent){
      console.log(this.parent);
      console.log(this.id);
      this.parent.things.splice(this.parent.things.indexOf(this.id),1);
    }
    this.parent = this.game;
    //var editView = document.getElementById('editview');
    //editView.replaceChildren();
    this.game.drawCollisions();
  }

}