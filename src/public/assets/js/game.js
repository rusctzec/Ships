// game.js
var key = {}
var socket = io();
socket.emit("new player");

socket.on('message', function(data) {
  console.log(data);
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', (players) => {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});

// update server with player inputs
setInterval(function() {
  socket.emit("movement", movement);
}, 1000/60);

document.addEventListener('keydown', function(event) { // handle key presses
  key[event.code] = true;
  updateMovement();
});
document.addEventListener('keyup', function(event) { // handle key presses
  key[event.code] = false;
  updateMovement();
});

function updateMovement() {
    movement.up = key.KeyW;
    movement.down = key.KeyS;
    movement.left = key.KeyA;
    movement.right = key.KeyD;
}
// $(document).ready(function() {
//   // This file just does a GET request to figure out which user is logged in
//   // and updates the HTML on the page
//   $.get("/api/user_data").then(function(data) {
//     $(".member-name").text(data.email);
//   });
// });
