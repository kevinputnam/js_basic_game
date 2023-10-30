function createElementWithAttributes(type,att_dict){
  var el = document.createElement(type);
  for (const [key,value] of Object.entries(att_dict)){
    el.setAttribute(key,value);
  }
  return el;
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

function collision(rect1,rect2){
  var dx = Math.min(rect1[2], rect2[2]) - Math.max(rect1[0], rect2[0]);
  var dy = Math.min(rect1[3], rect2[3]) - Math.max(rect1[1], rect2[1]);
  if (dx > 0 && dy > 0){
    return true;
  }
  return false;
}