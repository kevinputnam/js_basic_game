function createElementWithAttributes(type,att_dict){
  var el = document.createElement(type);
  for (const [key,value] of Object.entries(att_dict)){
    el.setAttribute(key,value);
  }
  return el;
}

function createEditorStringInput(view,labelText,valueKey,parent){
  var label = document.createElement('label');
  label.innerHTML = labelText;
  var inputField = createElementWithAttributes('input',{'type':'text','maxlength':'25','size':'17'});
  inputField.value = parent[valueKey];
  inputField.addEventListener("change", (event)=> {
    parent[valueKey] = event.target.value;
    parent.updateNodes();
  })
  view.append(label,inputField);
}

function createEditorOptionSelector(view,labelText,optionDict,valueKey,parent){
  var label = document.createElement("label")
  label.innerHTML = labelText;

  var selector = document.createElement('select');
  for (const [id,name] of Object.entries(optionDict)){
    var s = new Option;
    s.value = id;
    s.innerHTML = name + "[" + id + "]";
    selector.appendChild(s);
    if (id == parent[valueKey]){
      s.setAttribute('selected','true');
    }
  }
  selector.addEventListener("change", (event)=> {
    parent[valueKey] = event.target.value;
    parent.updateNodes();
  })
  view.append(label,selector)
}

function createEditorCoordsInput(view,labelText,valueKey,parent){
  var label = document.createElement("label")
  label.innerHTML = labelText;

  var xInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':'10000'});
  xInputField.value = parent[valueKey][0];
  xInputField.addEventListener("change", (event)=> {
    parent[valueKey][0] = event.target.value;
    parent.updateNodes();
    parent.game.updatePlayView();
  });

  var yInputField = createElementWithAttributes('input',{'type':'number','min':'0','max':'10000'});
  yInputField.value = parent[valueKey][1];
  yInputField.addEventListener("change", (event)=> {
    parent[valueKey][1] = event.target.value;
    parent.updateNodes();
    parent.game.updatePlayView();
  });

  view.append(label,xInputField,yInputField);

}

function flipCaret(tag){
      tag.parentElement.querySelector(".nested").classList.toggle("active");
      tag.classList.toggle("caret-down");
}

function toggleHighlight(nodeSpan){
  var highlighted_divs = document.getElementsByClassName('select-highlight');
  for (const d of highlighted_divs){
    d.classList.remove('select-highlight');
  }
  nodeSpan.classList.add('select-highlight');
}

function outOfBounds(dx,dy,rect,boundaries){
  var d={'x':dx,'y':dy};
  if(rect[0]+rect[2] > boundaries[0]+boundaries[2] || rect[0] < boundaries[0]){
    d.x = 0;
  }

  if(rect[1]+rect[3] > boundaries[1] + boundaries[3] || rect[1] < boundaries[1]){
    d.y = 0;
  }

  return d;
}

function collision(rect1,rect2){
  var dx = Math.min(rect1[0]+rect1[2], rect2[0]+rect2[2]) - Math.max(rect1[0], rect2[0]);
  var dy = Math.min(rect1[1]+rect1[3], rect2[1]+rect2[3]) - Math.max(rect1[1], rect2[1]);
  if (dx > 0 && dy > 0){
    return true;
  }
  return false;
}

function collisionRect(dim,x,y){
  var x_coord = x*dim;
  var y_coord = y*dim;
  return [x_coord,y_coord,dim,dim]
}

function listOfListsString(lists){
  var output = "[";
  for (const l of lists){
    output += "[" + l.toString() + "],";
  }
  if (lists.length != 0){
    output = output.slice(0,-1);
  }
  output += "]";
  return output;
}

