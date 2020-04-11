const htmlCanvas = document.getElementById("health"),
armor = document.getElementById("armor");
const maxHealth = 20,
heart = "nes-icon heart",
half = "is-half",
empty = "is-transparent"
function updateHealth(health) {
    var healthBar = "";
    for (var i = 0; i < Math.floor((health)/2); i++) {
        healthBar += `<i class='${heart}'></i>`;
    }
    if (health % 2) {
        healthBar += `<i class='${heart} ${half}'></i>`;
    }
    for (var i = 0; i < ((maxHealth/2) - Math.round((health)/2)); i++) {
        healthBar += `<i class='${heart} ${empty}'></i>`;
    }
    console.log(healthBar)
}
function update(armor) {
    armor.value = armor;
}
updateHealth(9)