
class Scene extends GameContainer {
  static next_id = 0;

  constructor(data) {
    super(data);

    this.id = Scene.next_id;
    Scene.next_id += 1;
    this.type = "Scene";

    this.background = "";
    this.backgroundImage = document.createElement('img');
    this.draw_player = false;
    this.map_size = [];
    this.grid_size = null;
    this.collisions = {};
    this.collisionDimensions = 8;
  }

  run(){
    this.game.runStackInsert(this.actions);
  }

  load(data) {
    super.load(data);

    if ('id' in data){
      this.id = data['id'];
      Scene.next_id = this.id + 1;
    }

    var me = this;
    this.background = data['background'];
    if(this.background){
      this.backgroundImage.setAttribute('src',this.background);
      this.backgroundImage.addEventListener("load", (e) => {
        me.game.drawCollisions();
      });
    }
    this.draw_player = data['draw_player'];
    this.map_size = data['map_size'];
    this.grid_size = data['grid_size'];
    this.collisions = data['collisions'];
  }

  save() {
    var data = super.save();
    data['id'] = this.id;
    data['background'] = this.background;
    data['draw_player'] = this.draw_player;
    data['map_size'] = this.map_size;
    data['grid_size'] = this.grid_size;
    data['collisions'] = this.collisions;

    return data;
  }

  edit(node){
    super.edit(node);
    this.game.currentScene = this;
    var me = this;
    var editView = document.getElementById('editview');

    var drawPlayerCheckbox = createElementWithAttributes('input',{'type':'checkbox'});
    drawPlayerCheckbox.checked = this.draw_player;
    drawPlayerCheckbox.addEventListener("change", (event)=>{
      me.draw_player = event.target.checked;
      me.game.drawCollisions();
    })

    var playerLabel = document.createElement("label");
    playerLabel.innerHTML = "Draw player";

    editView.append(drawPlayerCheckbox,playerLabel,document.createElement('br'));

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Background image: ";

    var backgroundThumbnail = document.createElement('img');
    backgroundThumbnail.setAttribute('style','width:100;');
    if(this.background){
      backgroundThumbnail.setAttribute('src',this.background);
    }

    var imageFileInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    imageFileInputField.value = this.background;
    imageFileInputField.addEventListener("change", (event)=> {
      me.background = event.target.value;
      backgroundThumbnail.setAttribute('src',event.target.value);
      me.backgroundImage.setAttribute('src',event.target.value);
    })

    var imageAttrLabel = document.createElement("label")
    imageAttrLabel.innerHTML = "Image width: " + this.backgroundImage.width + " Image height: " + this.backgroundImage.height;

    editView.append(inputLabel,imageFileInputField,document.createElement('br'),backgroundThumbnail,document.createElement('br'),imageAttrLabel,document.createElement('br'));
    editView.append(this.createRemoveButton(),document.createElement('br'),document.createElement('br'));

    this.game.drawCollisions();


  }

  remove(){
    super.remove();
    if(this.parent){
      delete this.parent.scenes[this.id];
    }
    var editView = document.getElementById('editview');
    editView.replaceChildren();
    this.game.currentScene = null;
    this.game.drawCollisions();
  }
}