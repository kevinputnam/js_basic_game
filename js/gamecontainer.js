

class GameContainer extends BuildingBlock{

  constructor(data) {
    super(data);

    this.name = ''; //text name of thing
    this.description = ''; //text description of thing
    this.actions = []; //list of action objects
    this.things = []; //list of thing ids

  }

  getChildContainer(parent,name){
    for (const child of parent.childNodes){
      if (child.tagName == 'DIV'){
        for (const grand of child.childNodes){
          if (grand.classList.contains(name)){
            return(grand);
          }
        }
      }
    }
  }

 updateDisplay(nodeSpan){
  nodeSpan.innerHTML = '<b>'+this.name+'[' + this.id + ']:</b> ' + this.description;
  }

  getNode(info) {
    var node = super.getNode(info);

    if (this.type != "Callback"){
      var thing_sp = document.createElement('span')
      var thing_tv = document.createElement('div');
      thing_sp.setAttribute('class','caret');
      thing_sp.setAttribute('onclick','flipCaret(this)');
      thing_sp.innerHTML = 'Things';
      thing_tv.append(thing_sp);

      var thingNodes = document.createElement('div');
      thingNodes.setAttribute('class','nested things');
      thing_tv.append(thingNodes);
      node.append(thing_tv);

      // allows the Game class to use this prototype
      if (Array.isArray(this.things)){
        if (this.things){
          for (var thing_id of this.things){
            this.game.things[thing_id].parent = this;
            thingNodes.append(this.game.things[thing_id].getNode());
          }
        }
      }
    }

    return node;
  }

  load(data){
    this.name = data['name'];
    this.description = data['description'];
    if (Array.isArray(this.things)){
      for (const thing_id of data['things']){
        this.things.push(parseInt(thing_id));
        this.game.things[thing_id].parent=this;
      }
    }
    if (this.actions){
      for (const action of data['actions']){
        var new_action = eval("new " + action['name'] + "({'parent':this,'game':this.game})");
        new_action.load(action);
        this.actions.push(new_action);
      }
    }
  }

  save(data){
    var data = {'name':this.name};
    data['description'] = this.description;
    if(Array.isArray(this.things)){
      data['things'] = this.things.concat();
    }
    var actions = null;
    if (this.actions){
      actions = [];
      for (const action of this.actions){
        actions.push(action.save());
      }
    }
    data['actions'] = actions;
    return data;
  }

  run(args){
    console.log(this.actions);
  }

  buildThingSelector(thingDict){
    var thingSelector = document.createElement('select');
    for (var [t_id,t] of Object.entries(thingDict)){
      if (t.parent.type == "Game"){
        if (this.type != "Thing" || parseInt(t_id) != parseInt(this.id)){
          var opt = new Option;
          opt.value = t_id;
          opt.innerHTML = t.name + '['+t.id+']';
          thingSelector.appendChild(opt);
        }
      }
    }
    return thingSelector;
  }

  addAction(action_type){
    var data = {'parent':this,'game':this.game};
    var new_action = eval("new " + action_type + "(data)");
    this.actions.push(new_action);
    var actionNodes = this.getChildContainer(document.getElementById('actionview'),'actions');
    actionNodes.append(new_action.getNode());
  }

  addThing(thing_id){
    var thing_str = thing_id.toString();
    if(Object.keys(this.game.things).includes(thing_str)){
      this.things.push(parseInt(thing_id));
      this.game.things[thing_id].parent = this;
      for (const node of this.nodes){
        var thingNodes = this.getChildContainer(node,'things');
        thingNodes.append(this.game.things[thing_id].getNode());
      }
    }
    //this.edit(this.currentNode);
  }

  newThing(){
    var data = {'parent':this,'game':this.game};
    var newT = new Thing(data);
    if (this.type != 'Game'){
      this.things.push(newT.id);
      for (var node of this.nodes){
        var thingNodes = this.getChildContainer(node,'things');
       thingNodes.append(newT.getNode());
      }
    }
    this.game.addNewThing(newT);
    this.edit(this.currentNode);
  }

  edit(node){
    super.edit(node);
    var editView = document.getElementById("editview");
    editView.replaceChildren();

    var me = this;

    var title = document.createElement("span");
    var bold = document.createElement("b");
    if (this.id || this.id==0){
      bold.innerHTML = this.type + ': ' + this.name + '<br>ID:' + this.id + '<br>';
    }else{
      bold.innerHTML = this.type + ': ' + this.name + '<br>';
    }
    title.append(bold);
    editView.append(title,document.createElement('br'));

    if (this.scenes){

      var newSceneBtn = document.createElement('button');
      newSceneBtn.innerHTML = "New Scene";
      newSceneBtn.addEventListener(
        "click",
        function (){
          me.addNewScene();
        },
        false,
      );

      editView.append(newSceneBtn,document.createElement('br'));
    }

    if (this.type != 'Callback'){
      if (this.type!='Game'){
        this.addThingSelector = this.buildThingSelector(this.game.things);

        var thingAddBtn = document.createElement("button");
        thingAddBtn.innerHTML = 'Add Thing';
        thingAddBtn.addEventListener(
          "click",
          function () {
            me.addThing(me.addThingSelector.value);
            me.game.updatePlayView();
          },
          false,
        );
        editView.append(this.addThingSelector,thingAddBtn)
      }
      var newThingBtn = document.createElement('button');
      newThingBtn.innerHTML = "New Thing";
      newThingBtn.addEventListener(
        "click",
        function (){
          me.newThing();
        },
        false,
      );

      editView.append(newThingBtn,document.createElement('br'));
    }

    var action_sp = document.createElement('span')
    var action_tv = document.createElement('div');
    action_sp.innerHTML = '<b>' + this.type + ': ' + this.name + ' - Actions </b>';
    action_tv.append(action_sp)

    var actionNodes = document.createElement('div');
    actionNodes.setAttribute('class','actions');
    action_tv.append(actionNodes);
    var actionView = document.getElementById("actionview");
    actionView.replaceChildren();
    var editActionView = document.getElementById("editactionview");
    editActionView.replaceChildren();
    actionView.append(action_tv);

    if (this.actions){
      this.newActionSelector = document.createElement('select');
      for (const aType of action_types){
        var opt = new Option;
        opt.value = aType;
        opt.innerHTML = aType.replace('Action_','');
        this.newActionSelector.appendChild(opt);
      }
      var addActionButton = document.createElement('button');
      addActionButton.innerHTML = "Add Action";
      addActionButton.addEventListener(
        "click",
        function () {
          me.addAction(me.newActionSelector.value);
        },
        false,
      );
      editView.append(this.newActionSelector,addActionButton,document.createElement('br'),document.createElement('br'));

      for (var action of this.actions){
        actionNodes.append(action.getNode());
      }
    }

    if (this.type == "Callback"){
      var descLabel = document.createElement("label");
      descLabel.innerHTML = this.description;
      editView.append(descLabel,document.createElement('br'));
    } else {
      var inputLabel = document.createElement("label")
      inputLabel.innerHTML = "Name: ";

      var nameInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
      nameInputField.value = this.name;
      nameInputField.addEventListener("change", (event)=> {
        me.name = event.target.value;
        bold.innerHTML = event.target.value + '[' + me.id + ']<br>';
        me.updateNodes();
      })

      editView.append(inputLabel,nameInputField,document.createElement('br'));

      var inputLabel2 = document.createElement("label");
      inputLabel2.innerHTML = "Description: ";

      var descInputField = createElementWithAttributes('input',{'type':'text','maxlength':'80','size':'80'});
      descInputField.value = this.description;
      descInputField.addEventListener("change", (event)=> {
        me.description = event.target.value;
        me.updateNodes();
      })
      editView.append(inputLabel2,descInputField,document.createElement('br'));
    }
  }
}