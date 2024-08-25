
//prototype for all game objects
class BuildingBlock {

  constructor(data) {
    this.parent = null;
    this.game = null;
    if (data){
      if (data.parent){
        this.parent = data.parent;
      }
      if (data.game){
        this.game = data.game;
      }
    }
    this.type = 'BuildingBlock';
    this.name = 'undefined node';
    this.description = 'BuildingBlock';
    this.nodes = [];
    this.currentNode = null;
  }

  run(args) {
    console.log("Running " + this.type + "[" + this.name + "]");
  }

  updateNodes() {
    for (const node of this.nodes){
      var nodeSpan = node.firstChild;
      this.updateDisplay(nodeSpan);
    }
  }

  updateDisplay(nodespan) {
    nodeSpan.innerHTML = '<b>'+ this.name + ':</b> ' + this.description;
  }

  getNode(info) { //default display method

    var node = document.createElement("div");
    var nodeName = this.type;
    if (this.id || this.id == 0){
      nodeName += '_' + this.id;
    }
    node.setAttribute('name',nodeName);
    node.setAttribute("class","treeNode");
    node.classList.add(info);
    var nodeSpan = document.createElement("span");
    node.append(nodeSpan);

    var me = this;
    nodeSpan.addEventListener(
      "click", (event)=> {
        toggleHighlight(nodeSpan);
        me.edit(node);
      });
    this.nodes.push(node);
    this.updateNodes();
    return node;
  }

  edit(node){
    this.currentNode = node;
  }

  createRemoveButton(){
    var me = this;
    var removeButton = document.createElement('button');
    removeButton.innerHTML = 'Remove';
    removeButton.addEventListener(
      "click",
      function () {
        me.remove();
        if (me.type != 'Action'){
          var editView = document.getElementById('editview');
          editView.replaceChildren();
        }
      },
      false,
    );
    return removeButton;
  }

  createUpAndDownButtons(){
    var me = this;

    var moveDownButton = document.createElement('button');
    moveDownButton.innerHTML = '<i class="arrow down"></i>'
    var moveUpButton = document.createElement('button');
    moveUpButton.innerHTML = '<i class="arrow up"></i>'
    moveDownButton.addEventListener(
      "click",
      function () {
        me.moveDown();
      },
      false,
    );
    moveUpButton.addEventListener(
      "click",
      function () {
        me.moveUp();
      },
      false,
    );

    return [moveUpButton, moveDownButton];
  }

  remove(){
    //remove the node from the DOM
    this.currentNode.remove();

    //remove the node from list of nodes this object tracks
    var i = this.nodes.indexOf(this.currentNode);
    this.nodes.splice(i,1);
  }

  moveUp(){
    for (const node of this.nodes){
      var parent = node.parentElement;
      if (parent.children.length != 1){
        var index = Array.prototype.indexOf.call(parent.children, node);
        if (index != 0){
          parent.removeChild(node);
          parent.children[index - 1].before(node);
        }
      }
    }
  }

  moveDown(){
    for (const node of this.nodes){
      var parent = node.parentElement;
      if (parent.children.length != 1){
        var index = Array.prototype.indexOf.call(parent.children, node);
        if (index != parent.children.length - 1){
          parent.removeChild(node);
          parent.children[index].after(node);
        }
      }
    }
  }
}