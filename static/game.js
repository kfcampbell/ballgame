var socket = io();
var localPlayer;
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  shooting: false
}
document.addEventListener('keydown', function (event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
    case 32: // spacebar
      movement.shooting = true;
      break;
  }
});
document.addEventListener('keyup', function (event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 32: // spacebar
      movement.shooting = false;
      break;
  }
});

socket.emit('new player');
socket.on('player_assignment', function(player){
  localPlayer = player;
});

// give the server the current state of movement 60 times a second
setInterval(function () {
  socket.emit('movement', movement);
}, 1000 / 60);

setInterval(function () {
  if (!localPlayer) return;

  if (movement.left && !(localPlayer.x - 15 < 0)) {
    localPlayer.x -= 5;
  }
  if (movement.right && !(localPlayer.x + 15 > 800)) {
    localPlayer.x += 5;
  }
  if (movement.up && !(localPlayer.y - 15 < 0)) {
    localPlayer.y -= 5;
  }
  if (movement.down && !(localPlayer.y + 15 > 600)) {
    localPlayer.y += 5;
  }

  renderLocalPlayerPosition();
}, 1000 / 60);

function renderLocalPlayerPosition(){
  if(!localPlayer) return;
  var color = localPlayer.color;
  context.fillStyle = color;
  context.beginPath();
  context.arc(localPlayer.x, localPlayer.y, 10, 0, (2 * Math.PI));
  context.fill();
}

function renderLocalPlayerMisslePosition(){
    if (!localPlayer.missle) return;
    if (localPlayer.missle.x < 0 || localPlayer.missle.y < 0) return;
    context.fillStyle = localPlayer.color;
    context.beginPath();
    context.arc(localPlayer.missle.x, localPlayer.missle.y, 5, 0, (2 * Math.PI));
    context.fill();
}


socket.on('state', function (players) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {

    if(localPlayer && localPlayer.socketId === id){
      var serverLocalPlayer = players[id];
      localPlayer = serverLocalPlayer;
      renderLocalPlayerPosition();
      renderLocalPlayerMisslePosition();
      continue;
    }

    var player = players[id];
    var color = player.color;
    context.fillStyle = color;
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, (2 * Math.PI));
    context.fill();

    // render player's missle.
    var missle = player.missle;
    if (!missle) continue;
    if (missle.x < 0 || missle.y < 0) continue;
    context.fillStyle = color;
    context.beginPath();
    context.arc(missle.x, missle.y, 5, 0, (2 * Math.PI));
    context.fill();
  }
});