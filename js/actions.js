

//register actions here, for add method.
const action_types = ['Action_else','Action_loop','Action_if_eval','Action_menu','Action_message','Action_start_timer','Action_set_var','Action_change_scene','Action_move_thing','Action_switch','Action_case','Action_has_thing','Action_put_thing','Action_save_game','Action_load_game','Action_illustrated_message'];


//prototype for all actions
class Action extends BuildingBlock{

  constructor(data) {
    super(data);

    this.type = "Action";
    this.description = "Action";
    this.actions = null;
  }

  load(data) {
    if (this.actions){
      for (const action of data['actions']){
        var new_action = eval("new " + action['name'] + "({'parent':this,'game':this.game})");
        new_action.load(action);
        this.actions.push(new_action);
      }
    }
  }

  save() {
    var data = {'name':this.name};
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

  getChildContainer(parent,name){
    for (const node of parent.childNodes){
      if (node.classList.contains(name)){
        return node;
      }
    }
  }

  replaceVariables(text){
    var bits = text.split('`');
    var returnString = '';
    for (var bit of bits){
      var newbit = bit;
      if(bit.startsWith('$')){
        var varName = bit.replace('$','');
        newbit = this.game.variables[varName];
      }
      returnString += newbit;
    }
    return returnString;
  }

  getNode() {
    var node = super.getNode();

    var actionNodes = document.createElement('div');
    actionNodes.setAttribute('class','actions');
    node.append(actionNodes);

    if (this.actions){
      for (var action of this.actions){
        actionNodes.append(action.getNode());
      }
    }
    return node;
  }

  run(args) {
    console.log("Run " + this.type + ": " + this.name);
  }

  add(action_type){
    var data = {'parent':this,'game':this.game};
    var new_action = eval("new " + action_type + "(data)");
    this.actions.push(new_action);
    for (const node of this.nodes){
      var actionNodes = this.getChildContainer(node,'actions');
      actionNodes.append(new_action.getNode());
    }
  }

  edit(node){
    super.edit(node);
    var editView = document.getElementById("editactionview");
    editView.replaceChildren();

    var title = document.createElement("span");
    var bold = document.createElement("b");
    bold.innerHTML = this.name + "<br>";
    title.append(bold);
    var description = document.createElement("p");
    description.innerHTML = this.description;
    editView.append(title,description,document.createElement('br'));

    var moveButtons = this.createUpAndDownButtons();
    editView.append(moveButtons[0],moveButtons[1],this.createRemoveButton(),document.createElement('br'),document.createElement('br'));

    var me = this;
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
          me.add(me.newActionSelector.value);
        },
        false,
      );
      editView.append(this.newActionSelector,addActionButton,document.createElement('br'),document.createElement('br'));
    }
  }

  remove(){

    // actions can only have one parent, so
    // remove all the instances of this node
    for (const node of this.nodes){
      node.remove();
    }

    // remove it from its parent's list of actions
    if(this.parent){
      this.parent.actions.splice(this.parent.actions.indexOf(this),1);
    }
    var editView = document.getElementById('editactionview');
    editView.replaceChildren();
  }

  moveUp(){
    super.moveUp();
    if(this.parent){
      var p_actions = this.parent.actions;
      if (p_actions.length > 1){
        var i = p_actions.indexOf(this);
        if (i != 0){
          p_actions.splice(i,1);
          p_actions.splice(i-1,0,this);
        }
      }
    }
  }

  moveDown(){
    super.moveDown();
    if(this.parent){
      var p_actions = this.parent.actions;
      if (p_actions.length > 1){
        var i = this.parent.actions.indexOf(this);
        if (i != p_actions.length - 1){
          p_actions.splice(i,1);
          p_actions.splice(i+1,0,this);
        }
      }
    }
  }
}

class Action_save_game extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_save_game";
    this.description = "Save the game progress.";
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Save game progress.</b>';
  }

  run(args){
    var data = this.game.save();
    data['current_scene'] = this.game.currentScene.id;
    data['variables'] = this.game.variables;
    localStorage.setItem('save-game', JSON.stringify(data,null,'  '));
  }
}

class Action_load_game extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_load_game";
    this.description = "Load a saved game.";
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Load saved game.</b>';
  }

    run(args){
    var data = JSON.parse(localStorage.getItem('save-game'));
    var sceneID = data['current_scene'];
    if (data) {
      this.game.load(data);
      this.game.changeScene(sceneID);
      this.game.variables = data['variables'];
      this.game.movePlayer(this.game.player.location[0],this.game.player.location[1]);
    } else {
      console.log("no save game data");
    }
  }
}

class Action_set_var extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_set_var";
    this.description = "Set a variable.";

    this.variable = null;
    this.value = null;
  }

  run(args){
    this.game.variables[this.variable] = eval(this.replaceVariables(this.value));
  }

  load(data){
    super.load(data);
    this.variable = data['variable'];
    this.value = data['value'];
  }

  save(){
    var data = super.save();
    data['variable'] = this.variable;
    data['value'] = this.value;
    return data;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Set</b> $' + this.variable + ' <b>to</b> ' + this.value;
  }

  edit(node) {
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    createEditorStringInput(editView,"Variable name:", 'variable', this);
    createEditorStringInput(editView,"Value:",'value',this);
  }
}

class Action_move_thing extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_move_thing";
    this.description = "Move thing to an x,y location."

    this.thing_id = 0;
    this.location = [0,0];
  }

  load(data){
    super.load(data);
    this.thing_id = data['thing_id'];
    this.location = data['location'];
  }

  save(data){
    var data = super.save();
    data['thing_id'] = this.thing_id;
    data['location'] = this.location;
    return data;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = "<b>Move</b> " + this.game.things[this.thing_id].name + " to [" + this.location[0] + "," + this.location[1] + "]";
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");
    let newDict = {}
    for (const key in this.game.things){
      newDict[key] = this.game.things[key].name;
    }
    createEditorOptionSelector(editView,"Thing to move:",newDict,'thing_id',this);
    editView.append(document.createElement('br'));
    createEditorCoordsInput(editView,"Location [x,y]: ",'location',this);
  }

  run(){
    this.game.things[this.thing_id].location[0] = parseInt(this.location[0]);
    this.game.things[this.thing_id].location[1] = parseInt(this.location[1]);
  }
}

class Action_change_scene extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_change_scene";
    this.description = "Go to another scene.";

    this.scene_id = 0;
    this.player_pos = [0,0];
  }

  load(data){
    super.load(data);
    this.scene_id = data['scene_id'];
    this.player_pos[0] = parseInt(data['player_pos'][0]);
    this.player_pos[1] = parseInt(data['player_pos'][1]);
  }

  save(){
    var data = super.save();
    data['scene_id'] = this.scene_id;
    data['player_pos'] = [];
    data['player_pos'][0] = this.player_pos[0];
    data['player_pos'][1] = this.player_pos[1];
    return data;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = "<b>Change scene to </b> " + this.game.scenes[this.scene_id].name + "[" + this.scene_id + "]";
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    let newDict = {};
    for(const key in this.game.scenes){
      newDict[key] = this.game.scenes[key].name;
    }

    createEditorOptionSelector(editView,"Change to scene:",newDict,'scene_id',this);
    editView.append(document.createElement('br'));
    createEditorCoordsInput(editView,"Player position [x,y]:",'player_pos',this);
  }

  run(){
    this.game.changeScene(this.scene_id);
    this.game.player.location[0] = this.player_pos[0];
    this.game.player.location[1] = this.player_pos[1];
  }
}

class Action_menu extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_menu";
    this.description = "Display a modal menu and save the selection value to a variable.";

    this.prompt = [];
    this.choices = [];
    this.variable = null;
    this.useValue = false;
  }

  run(args){
    var processedChoices = [];
    var procssedPrompt = [];
    for (var line of this.choices){
      processedChoices.push(this.replaceVariables(line));
    }
    for (var l of this.prompt){
      procssedPrompt.push(this.replaceVariables(l));
    }
    this.game.displayMenu(processedChoices,procssedPrompt,this.variable,this.useValue);
  }

  load(data){
    super.load(data);
    this.choices = data['choices'];
    this.prompt = data['prompt'];
    this.variable = data['variable'];
    this.useValue = data['useValue'];
  }

  save(){
    var data = super.save();
    data['choices'] = this.choices;
    data['prompt'] = this.prompt;
    data['variable'] = this.variable;
    data['useValue'] = this.useValue;
    return data;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Menu</b> choice <b>returns</b> $' + this.variable;
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement('label');
    inputLabel.innerHTML = "Result varaible: ";

    var variableInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    variableInputField.value = this.variable;
    variableInputField.addEventListener("change", (event)=> {
      me.variable = event.target.value;
      me.updateNodes();
    })

    editView.append(inputLabel,variableInputField,document.createElement('br'));

    var inputLabel1 = document.createElement("label");
    inputLabel1.innerHTML = "Menu prompt: ";

    var promptText = '';
    for (const line of this.prompt){
      promptText += line + "\n";
    }
    promptText = promptText.trim();

    var promptInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'25'});
    promptInputField.value = promptText;
    promptInputField.addEventListener("change", (event)=> {
      me.prompt = event.target.value.split('\n');
    })

    editView.append(inputLabel1,promptInputField,document.createElement('br'));

    var useValueCheckbox = createElementWithAttributes('input',{'type':'checkbox'});
    useValueCheckbox.checked = this.useValue;
    useValueCheckbox.addEventListener("change", (event)=>{
      me.useValue = event.target.checked;
    })

    var inputLabel3 = document.createElement("label");
    inputLabel3.innerHTML = "use value instead of index to set variable"

    editView.append(useValueCheckbox,inputLabel3,document.createElement('br'));

    var inputLabel2 = document.createElement("label");
    inputLabel2.innerHTML = "Menu choices: ";

    var menuInputField = createElementWithAttributes('textarea',{'rows':'8','cols':'30'});

    var text = '';
    for (const line of this.choices){
      text += line + "\n";
    }
    text = text.trim();

    menuInputField.value = text;
    menuInputField.addEventListener("change", (event)=> {
      me.choices = event.target.value.split('\n');
    })

    editView.append(inputLabel2,document.createElement("br"),menuInputField);
  }
}

class Action_illustrated_message extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_illustrated_message";
    this.description = "Display a modal message with an image.";

    this.text_lines = [];
    this.image_path = "";
    this.image = document.createElement('img');
  }

  run(args){
    var processedLines = [];
    for (var line of this.text_lines){
      processedLines.push(this.replaceVariables(line));
    }
    this.game.displayMessage(processedLines,this.image);
  }

  load(data){
    super.load(data);
    this.text_lines = data['text_lines'];
    this.image_path = data['image_path'];
    this.image.setAttribute('src',this.image_path);
  }

  save(){
    var data = super.save();
    data['text_lines'] = this.text_lines;
    data['image_path'] = this.image_path;
    return data;
  }

  updateDisplay(nodeSpan){
    if (this.text_lines.length > 0){
      if (this.text_lines[0].length >= 21){
        nodeSpan.innerHTML = '<b>Illus. Message</b> "' + this.text_lines[0].slice(0,20) + '..."';
      }else{
        nodeSpan.innerHTML = '<b>Illus. Message</b> "' + this.text_lines[0] + '"';
      }
    }else{
      nodeSpan.innerHTML = '<b>Illus. Message</b>';
    }
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Message: ";

    var messageInputField = createElementWithAttributes('textarea',{'rows':'8','cols':'30'});

    var text = '';
    for (const line of this.text_lines){
      text += line + "\n";
    }
    text = text.trim();

    messageInputField.value = text;
    messageInputField.addEventListener("change", (event)=> {
      me.text_lines = event.target.value.split('\n');
      me.updateNodes();
    })

    editView.append(inputLabel,document.createElement("br"),messageInputField,document.createElement("br"));

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Image: ";

    var imageThumbnail = document.createElement('img');
    imageThumbnail.setAttribute('style','width:50;');
    if(this.image_path){
      imageThumbnail.setAttribute('src',this.image_path);
    }

    var imageFileInputField = createElementWithAttributes('input',{'type':'text','maxlength':'100','size':'60'});
    imageFileInputField.value = this.image_path;
    imageFileInputField.addEventListener("change", (event)=> {
      me.image_path = event.target.value;
      imageThumbnail.setAttribute('src',event.target.value);
    })

    var imageAttrLabel = document.createElement("label")
    imageAttrLabel.innerHTML = "Image width: " + this.image.width + " Image height: " + this.image.height;

    editView.append(inputLabel,imageFileInputField,document.createElement('br'),imageThumbnail,document.createElement('br'),imageAttrLabel,document.createElement('br'));
    editView.append(this.createRemoveButton(),document.createElement('br'),document.createElement('br'));
  }
}

class Action_message extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_message";
    this.description = "Display a modal message.";

    this.text_lines = [];
  }

  run(args){
    var processedLines = [];
    for (var line of this.text_lines){
      processedLines.push(this.replaceVariables(line));
    }
    this.game.displayMessage(processedLines);
  }

  load(data){
    super.load(data);
    this.text_lines = data['text_lines'];
  }

  save(){
    var data = super.save();
    data['text_lines'] = this.text_lines;
    return data;
  }

  updateDisplay(nodeSpan){
    if (this.text_lines.length > 0){
      if (this.text_lines[0].length >= 21){
        nodeSpan.innerHTML = '<b>Message</b> "' + this.text_lines[0].slice(0,20) + '..."';
      }else{
        nodeSpan.innerHTML = '<b>Message</b> "' + this.text_lines[0] + '"';
      }
    }else{
      nodeSpan.innerHTML = '<b>Message</b>';
    }
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Message: ";

    var messageInputField = createElementWithAttributes('textarea',{'rows':'8','cols':'30'});

    var text = '';
    for (const line of this.text_lines){
      text += line + "\n";
    }
    text = text.trim();

    messageInputField.value = text;
    messageInputField.addEventListener("change", (event)=> {
      me.text_lines = event.target.value.split('\n');
      me.updateNodes();
    })

    editView.append(inputLabel,document.createElement("br"),messageInputField);
  }
}


class Action_start_timer extends Action {

  constructor(data){
    super(data);

    this.name = "Action_start_timer";
    this.description = "Start a timer. Uses the variable field if set.";

    this.milliseconds = 0;
    this.variable = '';
  }

  run(args){
    var ms = this.milliseconds;
    if (this.variable.length > 0){
      ms = this.game.variables[this.variable];
    }
    this.game.runStackPaused = true;
    setTimeout(() => this.endTimer(),ms);
  }

  endTimer(){
    this.game.runStackPaused = false;
  }

  load(data){
    super.load(data);
    this.milliseconds = data['milliseconds'];
    this.variable = data['variable'];
  }

  save(){
    var data = super.save();
    data['milliseconds'] = this.milliseconds;
    data['variable'] = this.variable;
    return data;
  }

  updateDisplay(nodeSpan){
    if (this.variable.length > 0){
      nodeSpan.innerHTML = '<b>Timer:</b> $' + this.variable + ' ms';
    } else {
      nodeSpan.innerHTML = '<b>Timer:</b> ' + this.milliseconds + 'ms';
    }
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Milliseconds: ";

    var msInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':'10000'});
    msInputField.value = this.milliseconds;
    msInputField.addEventListener("change", (event)=> {
      me.milliseconds = event.target.value;
      me.updateNodes();
    })

    var inputLabel2 = document.createElement("label")
    inputLabel2.innerHTML = " or variable: ";

    var varInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    varInputField.value = this.variable;
    varInputField.addEventListener("change", (event)=> {
      me.variable = event.target.value;
      me.updateNodes();
    })

    editView.append(inputLabel,msInputField,inputLabel2,varInputField);
  }
}

class Action_else extends Action {

  constructor(data){
    super(data);

    this.name = "Action_else";
    this.description = "else. Does nothing unless it is the child of an If action.";
    this.actions = [];
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Else</b>';
  }
}

class Action_if_eval extends Action {

  constructor(data) {
    super(data);

    this.name = "Action_if_eval";
    this.description = "if/then. Add an else action as a child to get that functionality.";
    this.actions = [];

    this.operators = ['>','<','>=','<=','==','!='];

    //initialization values for eval fields
    this.val1 = null;
    this.val2 = null;
    this.operator = this.operators[0];
  }

  load(data){
    super.load(data);
    this.val1 = data['val1'];
    this.val2 = data['val2'];
    this.operator = data['operator'];
  }

  save(){
    var data = super.save();
    data['val1'] = this.val1;
    data['val2'] = this.val2;
    data['operator'] = this.operator;
    return data;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>if </b> ' + this.val1 + " <b>" + this.operator + "</b> " + this.val2
  }

  run(){
    var val1 =this.replaceVariables(this.val1);
    var val2 = this.replaceVariables(this.val2);
    if (eval(val1+this.operator+val2)){
        this.game.runStackInsert(this.actions);
    } else {
        var else_actions = [];
        for(const a of this.actions){
          if (a.name == 'Action_else'){
            else_actions = a.actions;
          }
        }
        this.game.runStackInsert(else_actions);
    }
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel1 = document.createElement("label")
    inputLabel1.innerHTML = "Value 1: ";

    var val1InputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    val1InputField.value = this.val1;
    val1InputField.addEventListener("change", (event)=> {
      me.val1 = event.target.value;
      me.updateNodes();
    })

    var operatorSelector = document.createElement('select');
    var i = 0
    for (const operator of this.operators){
      var opt = new Option;
      opt.value = i;
      opt.innerHTML = operator;
      if (operator == this.operator){
        opt.setAttribute('selected','true');
      }
      operatorSelector.appendChild(opt);
      i += 1;
    }
    operatorSelector.addEventListener("change", (event)=> {
      me.operator = me.operators[event.target.value];
      me.updateNodes();
    })

    var inputLabel2 = document.createElement("label")
    inputLabel2.innerHTML = "Value 2: ";

    var val2InputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    val2InputField.value = this.val2;
    val2InputField.addEventListener("change", (event)=> {
      me.val2 = event.target.value;
      me.updateNodes();
    })

    editView.append(inputLabel1,val1InputField,operatorSelector,inputLabel2,val2InputField);
  }
}

class Action_loop extends Action_if_eval {

  constructor(data){
    super(data);

    this.name = "Action_loop";
    this.description = "Continue to run the actions until exit condition met."
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Do While </b>' + this.val1 + " <b>" + this.operator + "</b> " + this.val2;
  }

  run(){
    if (eval(this.replaceVariables(this.val1)+this.operator+this.replaceVariables(this.val2))){
      console.log("True!");
      var nextLoop = new Action_loop({'parent':this,'game':this.game});
      nextLoop.actions = nextLoop.actions.concat(this.actions);
      nextLoop.val1 = this.val1;
      nextLoop.val2 = this.val2;
      nextLoop.operator = this.operator;
      this.game.runStackInsert([nextLoop]);//add self until condition not met
      this.game.runStackInsert(this.actions);
    }
  }
}

class Action_switch extends Action {

  constructor(data){
    super(data);

    this.name = "Action_switch";
    this.description = "Switch/Case - add case actions as children with conditions. The other children of the switch action are the default actions if no case condition is met."
    this.actions = [];

    this.variable = null;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Switch</b> ($' + this.variable + ')';
  }

  run(){
  }

  load(data){
    super.load(data);
    this.variable = data['variable'];
  }

  save(){
    var data = super.save();
    data['variable'] = this.variable;
    return data;
  }

  run(){
    var variableValue = this.game.variables[this.variable];
    var runActions = this.actions; //by default run the switch's actions
    for(const a of this.actions){
      if (a.name == 'Action_case'){
        var aValue = eval(a.value);
        console.log(aValue);
        if (variableValue == aValue){
          runActions = a.actions;
        }
      }
    }
    this.game.runStackInsert(runActions);
  }

    edit(node) {
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement('label');
    inputLabel.innerHTML = "Variable name: ";
    var variableInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    variableInputField.value = this.variable;
    variableInputField.addEventListener("change", (event)=> {
      me.variable = event.target.value;
      me.updateNodes();
    });
    editView.append(inputLabel,variableInputField);
  }
}

class Action_case extends Action {

  constructor(data){
    super(data);

    this.name = "Action_case";
    this.description = "Case for Switch. Does nothing unless it is the child of a Switch action.";
    this.actions = [];
    this.value = null;
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>Case</b>: ' + this.value;
  }

  load(data){
    super.load(data);
    this.value = data['value'];
  }

  save(){
    var data = super.save();
    data['value'] = this.value;
    return data;
  }

  edit(node) {
    super.edit(node);
    var me = this;
    var editView = document.getElementById("editactionview");

    var inputLabel = document.createElement('label');
    inputLabel.innerHTML = "Value: ";
    var valueInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    valueInputField.value = this.value;
    valueInputField.addEventListener("change", (event)=> {
      me.value = event.target.value;
      me.updateNodes();
    });
    editView.append(inputLabel,valueInputField);
  }
}

class Action_has_thing extends Action {

  constructor(data){
    super(data);

    this.name = 'Action_has_thing';
    this.description = "Sets variable to true or false based on whether the chosen thing (or player) has another thing in its inventory";

    this.variable = null;
    this.possessor_id = -1; //-1 is reserved for the player.
    this.thing_id = 0;
  }

  updateDisplay(nodeSpan){
    var possessor_name = ''
    if (this.possessor_id == -1){
      possessor_name = this.game.player.name;
    }else{
      possessor_name = this.game.things[this.possessor_id];
    }
    nodeSpan.innerHTML = "$" + this.variable + "= <b>does</b> " + possessor_name + " <b>have</b> " + this.game.things[this.thing_id].name + "?";
  }

  load(data){
    super.load(data);
    this.variable = data['variable'];
    this.possessor_id = data['possessor_id'];
    this.thing_id = data['thing_id'];
  }

  save(){
    var data = super.save();
    data['variable'] = this.variable;
    data['possessor_id'] = this.possessor_id;
    data['thing_id'] = this.thing_id;
    return data;
  }

  run(){
    var returnValue = false;
    var possessor = null;
    if(this.possessor_id == -1){
      possessor = this.game.player;
    }else{
      possessor = this.game.things[this.possessor_id];
    }
    if(possessor.things.includes(parseInt(this.thing_id))){
      returnValue = true;
    }
    this.game.variables[this.variable] = returnValue;
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById('editactionview');

    var inputLabel = document.createElement('label');
    inputLabel.innerHTML = "Variable: ";
    var variableInputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
    variableInputField.value = this.variable;
    variableInputField.addEventListener("change", (event)=> {
      me.variable = event.target.value;
      me.updateNodes();
    });
    editView.append(inputLabel,variableInputField,document.createElement('br'));

    var inputLabel2 = document.createElement("label")
    inputLabel2.innerHTML = "Possessor: ";

    var thingSelector = document.createElement('select');
    var p = new Option;
    p.value = -1;
    p.innerHTML = this.game.player.name + "[player]";
    if(this.possessor_id == -1){
       p.setAttribute('selected','true');
    }
    thingSelector.appendChild(p);
    for (const [thing_id,thing] of Object.entries(this.game.things)){
      var s = new Option;
      s.value = thing_id;
      s.innerHTML = thing.name + "[" + thing_id + "]";
      if(this.possessor_id == thing_id){
        s.setAttribute('selected','true');
      }
      thingSelector.appendChild(s);
    }
    thingSelector.addEventListener("change", (event)=> {
      me.possessor_id = event.target.value;
      me.updateNodes();
    });
    editView.append(inputLabel2,thingSelector,document.createElement('br'));

    var inputLabel3 = document.createElement("label")
    inputLabel3.innerHTML = "Thing: ";

    var thingSelector2 = document.createElement('select');
    for (const [thing_id,thing] of Object.entries(this.game.things)){
      var s = new Option;
      s.value = thing_id;
      s.innerHTML = thing.name + "[" + thing_id + "]";
      if(this.thing_id == thing_id){
        s.setAttribute('selected','true');
      }
      thingSelector2.appendChild(s);
    }
    thingSelector2.addEventListener("change", (event)=> {
      me.thing_id = event.target.value;
      me.updateNodes();
    });
    editView.append(inputLabel3,thingSelector2,document.createElement('br'));
  }
}

class Action_put_thing extends Action {

  constructor(data){
    super(data);

    this.name = 'Action_put_thing';
    this.description = "Adds the thing to the designated target. It will remove it from it's current parent as well. Selecting 'none' will remove it from wherever it is. It will still be available to add from the master thing list. If the player is the parent, the scene and location values will be overridden with the current scene and player's location.";

    this.thing_id = 0;
    this.target_type = 'none';
    this.target_id = 0;
    this.location = [0,0];
  }

  updateDisplay(nodeSpan){
    var target = null;
    var target_name = 'none';
    var to_location_text = '';
    if (this.target_type == 'scene'){
      target = this.game.scenes[this.target_id];
      target_name = target.name + "[" + this.target_id + "]";
      to_location_text = ' <b>to</b> [' + this.location[0] + ',' + this.location[1] + ']';
    }else if(this.target_type == 'thing'){
      target = this.game.things[this.target_id];
      target_name = target.name + "[" + this.target_id + "]";
    }else if(this.target_type == 'player'){
      target = this.game.player;
      target_name = target.name + "[player]";
    }

    nodeSpan.innerHTML = "<b>Add</b> " + this.game.things[this.thing_id].name + " <b>to</b> " + target_name + to_location_text;
  }

  load(data){
    super.load(data);
    this.thing_id = data['thing_id'];
    this.target_type = data['target_type'];
    this.target_id = data['target_id'];
    this.location = data['location'];
  }

  save(){
    var data = super.save();
    data['thing_id'] = this.thing_id;
    data['target_type'] = this.target_type;
    data['target_id'] = this.target_id;
    data['location'] = this.location;
    return data;
  }

  run(args){
    var thing = this.game.things[this.thing_id];
    var target = null;
    thing.remove();
    if (this.target_type == 'scene'){
      target = this.game.scenes[this.target_id];
      if(thing.parent.type == "Player"){
        target = this.game.currentScene;
        thing.location[0] = thing.parent.location[0];
        thing.location[1] = thing.parent.location[1];
      }else{
        thing.location[0] = this.location[0];
        thing.location[1] = this.location[1];
      }
    }else if (this.target_type == 'thing'){
      target = this.game.things[this.target_id];
    }else if (this.target_type == 'player'){
      target = this.game.player;
    }else{
      return;
    }
    target.addThing(thing.id);
  }

  edit(node){
    super.edit(node);
    var me = this;
    var editView = document.getElementById('editactionview');

    var inputLabel = document.createElement("label")
    inputLabel.innerHTML = "Add thing: ";

    var thingSelector = document.createElement('select');
    for (const [thing_id,thing] of Object.entries(this.game.things)){
      var s = new Option;
      s.value = thing_id;
      s.innerHTML = thing.name + "[" + thing_id + "]";
      if(this.thing_id == thing_id){
        s.setAttribute('selected','true');
      }
      thingSelector.appendChild(s);
    }
    thingSelector.addEventListener("change", (event)=> {
      me.thing_id = event.target.value;
      me.updateNodes();
    })

    var targetLabel = document.createElement('label');
    targetLabel.innerHTML = 'to target: <br>'

    editView.append(inputLabel,thingSelector,document.createElement('br'),targetLabel);

    this.sceneDiv = createElementWithAttributes('div',{'class':'hidden'});

    var inputLabel2 = document.createElement("label")
    inputLabel2.innerHTML = "Scene: ";

    var sceneSelector2 = document.createElement('select');
    for (const [scene_id,scene] of Object.entries(this.game.scenes)){
      var s = new Option;
      s.value = scene_id;
      s.innerHTML = scene.name + "[" + scene_id + "]";
      if(this.target_id == scene_id){
        s.setAttribute('selected','true');
      }
      sceneSelector2.appendChild(s);
    }
    sceneSelector2.addEventListener("change", (event)=> {
      me.target_id = event.target.value;
      me.updateNodes();
    })

    var sceneLocationLabel = document.createElement('label');
    sceneLocationLabel.innerHTML = 'Location [x,y]: ';

    var xInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':this.game.screenDimensions[0]});
    xInputField.value = this.location[0];
    xInputField.addEventListener("change", (event)=> {
      me.location[0] = event.target.value;
      me.updateNodes();
    });

    var yInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':this.game.screenDimensions[1]});
    yInputField.value = this.location[1];
    yInputField.addEventListener("change", (event)=> {
      me.location[1] = event.target.value;
      me.updateNodes();
    });

    this.sceneDiv.append(inputLabel2,sceneSelector2,document.createElement('br'),sceneLocationLabel,xInputField,yInputField);

    this.thingDiv = createElementWithAttributes('div',{'class':'hidden'});

    var inputLabel3 = document.createElement("label")
    inputLabel3.innerHTML = "Thing: ";

    var thingSelector2 = document.createElement('select');
    for (const [thing_id,thing] of Object.entries(this.game.things)){
      var s = new Option;
      s.value = thing_id;
      s.innerHTML = thing.name + "[" + thing_id + "]";
      if(this.target_id == thing_id){
        s.setAttribute('selected','true');
      }
      thingSelector2.appendChild(s);
    }
    thingSelector2.addEventListener("change", (event)=> {
      me.target_id = event.target.value;
      me.updateNodes();
    })

    this.thingDiv.append(inputLabel3,thingSelector2);

    var radio1 = createElementWithAttributes('input',{'type':'radio','name':'target_type'});
    radio1.addEventListener("change", (event)=> {
      if (event.target.checked){
        me.target_type = 'scene';
        me.sceneDiv.setAttribute('class','');
        me.thingDiv.setAttribute('class','hidden');
        me.updateNodes();
      }
    })
    var radioLabel = document.createElement('label');
    radioLabel.innerHTML = 'Scene | ';

    var radio2 = createElementWithAttributes('input',{'type':'radio','name':'target_type'});
    radio2.addEventListener("change", (event)=> {
      if (event.target.checked){
        me.target_type = 'thing';
        me.sceneDiv.setAttribute('class','hidden');
        me.thingDiv.setAttribute('class','');
        me.updateNodes();
      }
    })
    var radioLabel2 = document.createElement('label');
    radioLabel2.innerHTML = 'Thing | ';

    var radio3 = createElementWithAttributes('input',{'type':'radio','name':'target_type'});
    radio3.addEventListener("change", (event)=> {
      if (event.target.checked){
        me.target_type = 'player';
        me.sceneDiv.setAttribute('class','hidden');
        me.thingDiv.setAttribute('class','hidden');
        me.updateNodes();
      }
    })
    var radioLabel3 = document.createElement('label');
    radioLabel3.innerHTML = 'Player | ';

    var radio4 = createElementWithAttributes('input',{'type':'radio','name':'target_type'});
    radio4.addEventListener("change", (event)=> {
      if (event.target.checked){
        me.target_type = 'none';
        me.sceneDiv.setAttribute('class','hidden');
        me.thingDiv.setAttribute('class','hidden');
        me.updateNodes();
      }
    })
    var radioLabel4 = document.createElement('label');
    radioLabel4.innerHTML = 'None';

    if(this.target_type == 'scene'){
      radio1.checked = true;
    }else if (this.target_type == 'thing'){
      radio2.checked = true;
    }else if (this.target_type == 'player'){
      radio3.checked = true;
    }else if (this.target_type == 'none'){
      radio4.checked = true;
    }

    editView.append(radio1,radioLabel,radio2,radioLabel2,radio3,radioLabel3,radio4,radioLabel4,document.createElement('br'),this.sceneDiv,this.thingDiv);
  }
}