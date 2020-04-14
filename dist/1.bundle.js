webpackJsonp([1],{

/***/ 51:
/***/ (function(module, exports) {

// const health = document.getElementById("health"),
// armor = document.getElementById("armor");
var maxHealth = 20,
    heart = "nes-icon heart",
    half = "is-half",
    empty = "is-transparent";
console.log(true);
module.exports = {
  orange: "true",
  health: document.getElementById("health"),
  armor: document.getElementById("armor"),
  updateHealth: function updateHealth(health) {
    console.log(true);
    var healthBar = "";

    for (var i = 0; i < Math.floor(health / 2); i++) {
      healthBar += "<i class='".concat(heart, "'></i>");
    }

    if (health % 2) {
      healthBar += "<i class='".concat(heart, " ").concat(half, "'></i>");
    }

    for (var i = 0; i < maxHealth / 2 - Math.round(health / 2); i++) {
      healthBar += "<i class='".concat(heart, " ").concat(empty, "'></i>");
    }

    health.innerHTML = healthBar;
  },
  updateArmor: function updateArmor(armor) {
    armor.value = armor;
  }
};

/***/ })

});
//# sourceMappingURL=1.bundle.js.map