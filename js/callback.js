class Callback extends GameContainer {
  static next_id = 0;

  constructor(data) {
    super(data);

    this.id = Callback.next_id;
    Callback.next_id += 1;
    this.type = "Callback";
    this.things = null;
  }

  run(){
    this.game.runStackInsert(this.actions);
  }

/*  edit(){

  }

  load(){

  }

  save(){

  }*/

}