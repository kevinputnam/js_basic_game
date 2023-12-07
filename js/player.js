class Player extends Thing {

  constructor(data) {
    data['type'] = "Player";
    super(data);

    this.type = "Player";

    this.hidden = false;
    this.trigger = false;
    this.triggered = false;

    this.spriteImage= document.createElement('img');
    this.spritePath = "";
    this.location = [0,0];
    this.dimensions = [0,0];
  }

  updateDisplay(nodeSpan){
    nodeSpan.innerHTML = '<b>'+this.name+'</b>: ' + this.description;
  }
}