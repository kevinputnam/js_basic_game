var game = new Game();
game.name = "The Greatest Game in the World!"
game.description = "Play the game for all the fun you never knew you needed."
var the_thing = new Thing();
var thing1 = new Thing();
var thing2 = new Thing();
var if_action = new Action_if_eval();
if_action.load({name: "Action_if_eval", actions: [{name: "Action_message", actions: null, text_lines: ["Enough is enough, you craven fool!"]},{name: "Action_start_timer", actions: null, milliseconds: 0, variable: "global_timer"},{name: "Action_set_var", actions: null, variable: "global_timer", value: "500"}], val1: "$visits", val2: "3", operator: ">"});
var message = new Action_message();
var timer = new Action_start_timer();
the_thing.name = 'First Thing';
the_thing.description = 'The first thing we ever made!';
the_thing.actions.push(if_action,message,timer);
thing1.name = 'Rock';
thing1.description = 'It might be granite?';
thing2.name = 'Book';
thing2.description = 'I, Robot by Isaac Asimov';
game.things[the_thing.id]=the_thing;
game.things[thing1.id]=thing1;
game.things[thing2.id]=thing2;
the_thing.things.push(1);
var the_scene = new Scene();
the_scene.name = "Logo Splash";
the_scene.description = "First screen of the game."
the_scene.things.push(0);
game.scenes[the_scene.id] = the_scene;
var gameview = document.getElementById('gamedata');
gameview.replaceChildren(game.display());
console.log(JSON.stringify(game.save(),null,'  '));
//sceneview.replaceChildren(if_action.display(),message.display(),timer.display());

