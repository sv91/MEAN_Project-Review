/**
* @ngdoc function
* @name updateBubble
* @description
* # updateBubble
* Update the shown information in the bubble and its position.
* Used by the Review part.
* @param {Object} refDev  The reference element for the position of the bubble.
*/
function updateBubble(refDiv){
  'use strict';
  var model = refDiv.id;
  var html = "<label>Comment:</label><br /><textarea class='form-control' ng-model="+ model +"></textarea>";
  updateBubble(refDiv, html);
}

/**
* @ngdoc function
* @name updateBubble
* @description
* # updateBubble
* Update the shown information in the bubble and its position.
* Used by the Proposal part.
* @param {Object} refDev  The reference element for the position of the bubble.
* @param {String} html    The html code that will be in the bubble.
*/
function updateBubble(refDiv, html){
  'use strict';
  var containerRect = document.getElementById("form-views").getBoundingClientRect();
  var divRect = refDiv.getBoundingClientRect();
  var offset = divRect.top - containerRect.top;

  var div = document.getElementById('bubble');
  if(div.style.display=="none"){
    div.style.display="";
  }
  div.style.marginTop = offset + 'px';
  div.innerHTML = html;
}

/**
* @ngdoc function
* @name resetBubble
* @description
* # resetBubble
* Hide the bubble.
*/
function resetBubble(){
  'use strict';
  document.getElementById('bubble').style.display="none";
}
