
function Player(id, startx, starty, level, UnitType) {
	Unit.prototype.constructor.call(this, id, startx, starty, level, UnitType)
	if (playerArmor) {
		this.armorType = playerArmor
		this.armor = playerArmor.armor
	}
	if (playerWeapon) 
		this.weapon = playerWeapon
	this.spells = clone(spells)
}

Player.prototype = unit

Player.prototype.draw = function() {
	Unit.prototype.draw.call(this)
	if (this.targetx != -1 && this.status != statuses.stop) {
		ctx.strokeStyle = 'green'
		if (this.target > 0)
			ctx.strokeRect(units[this.target].drawx + 1, units[this.target].drawy - cellSize  + 1, cellSize - 2, cellSize - 2)
		else
			ctx.strokeRect(this.targetx*cellSize + 1, this.targety*cellSize + 1, cellSize - 2, cellSize - 2)
		ctx.strokeStyle = 'black'
	}
	ctx.fillStyle = 'black'
}

Player.prototype.castSpell = function (i) {
	if (i < this.spells.length && this.spells[i].timer >= spells[i].timer && this.spells[i].condition()) {
		this.spells[i].action()
		this.spells[i].timer = 0
		spells[i].timer = Math.floor(spells[i].timer*1.1)
		elm('spell' + i).style.cursor = 'default'
	}
}

Player.prototype.act = function() {
	Unit.prototype.act.call(this)
	for (var i in this.spells) {
		if (this.spells[i].timer < spells[i].timer)
			this.spells[i].timer++
		else
			elm('spell' + i).style.cursor = 'pointer'
		if (this.spells[i].active)
			this.spells[i].activeAction()
	}
}
