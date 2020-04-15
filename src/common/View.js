// const health = document.getElementById("health"),
// armor = document.getElementById("armor");
heart = "nes-icon heart",
half = "is-half",
empty = "is-transparent"
console.log(true)
module.exports = {
    orange: "true",
    updateHealth(health, maxHealth) {
        if (!this.healthContainer) this.healthContainer = document.getElementById("health");
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
        this.healthContainer.innerHTML = healthBar;
        return healthBar;
    },
    updateArmor(armor, maxArmor) {
        if (!this.armorBar) this.armorBar = document.getElementById("armor");
        this.armorBar.setAttribute("value", armor);
        this.armorBar.setAttribute("max", maxArmor);
        this.armorBar.style.width = maxArmor*4+"px";
        if (maxArmor == 0) {
            this.armorBar.style.display = "none";
        } else {
            this.armorBar.style.display = "block";
        }
    }
}