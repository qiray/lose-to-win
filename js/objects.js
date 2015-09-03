
function GameObject(id, x, y, type, color, string) {
	this.id = id
	this.x = x
	this.y = y
	this.drawx = x*cellSize
	this.drawy = (y + 1)*cellSize
	this.type = type
	this.string = string
	this.color = color
}

GameObject.prototype.draw = function() {
	ctx.fillStyle = this.color
	drawText(this.type.fontSize, this.type.lineSize, this.string, this.drawx + cellSize/2, this.drawy + this.type.yshift)
	ctx.fillStyle = 'black'
}

GameObject.prototype.process = function() {
	if (this.drawx == player.drawx && this.drawy == player.drawy && this.x == player.targetx && this.y == player.targety) {
		if (this.type == objectTypes.door) { //goto next level
			decreaseLowscore(Math.floor(0.1*xpA*(Math.exp(xpB*(player.level)))))
			generateLevel(levelMap)
		}
		if (this.type == objectTypes.healPotion) {
			player.hp = player.hp + Math.floor(0.1*player.maxhp)
			pushToTexts(new DisplayedText(0, player.drawx, player.drawy, 'green', '+' + Math.floor(0.1*player.maxhp)))
			if (player.hp > player.maxhp)
				player.hp = player.maxhp
			redrawPlayerInfo()
			objects[this.id] = undefined
		}
		if (this.type == objectTypes.item) {
			if (this.itemType == 'weapon' && player.weapon.id < this.itemObject.id) {
				player.weapon = this.itemObject
				playerWeapon = player.weapon
				showInfo('<br><br><br><br>You\'ve got a new weapon - <h2>' + player.weapon.name + '</h2>')
			}
			if (this.itemType == 'armor' && player.armorType.id < this.itemObject.id) {
				player.armorType = this.itemObject
				player.armor = this.itemObject.armor
				playerArmor = player.armorType
				showInfo('<br><br><br><br>You\'ve got a new armor - <h2>' + player.armorType.name + '</h2>')
			}
			objects[this.id] = undefined
		}
	}
}
