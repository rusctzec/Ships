// const health = document.getElementById("health"),
// armor = document.getElementById("armor");
const maxHealth = 20,
heart = "nes-icon heart",
half = "is-half",
empty = "is-transparent"
console.log(true)
module.exports = {
    orange: "true",
    // health: document.getElementById("health"),
    // armor: document.getElementById("armor"),
    updateHealth(health) {
        console.log(true)
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
        return healthBar;
        health.innerHTML = healthBar;
    },
    updateArmor(armor) {
        return armor;
    }
}