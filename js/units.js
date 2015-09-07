
function Unit(id, startx, starty, level, unitType, weapon) {
	this.id = id
	this.x = this.startx = startx
	this.y = this.starty = starty
	this.drawx = startx*cellSize
	this.drawy = (starty + 1)*cellSize
	this.targetx = this.targety = this.nexttargetx = this.nexttargety = this.target = -1
	this.level = level
	this.maxhp = this.hp = Math.floor(unitType.factors.hp*xpA*100*Math.exp(xpB*0.1*level))
	this.damage = Math.floor(unitType.factors.damage*xpA*10*Math.exp(xpB*0.1*level))
	this.attackSpeed = this.wayIndex = 0
	this.speed = basicSpeed*unitType.factors.speed
	this.xp = Math.floor(unitType.factors.xp*xpA*0.1*(Math.exp(xpB*(maxPlayerLevel - level + 1))))
	this.way = []
	this.status = statuses.stop
	this.color = unitType.color
	this.string = unitType.string
	this.name = unitType.name
	this.weapon = weapons[unitType.weapons[Math.floor(Math.random()*(unitType.weapons.length))]]
	this.armorType = armors[unitType.armors[Math.floor(Math.random()*(unitType.armors.length))]]
	this.armor = this.armorType.armor
}

Unit.prototype.draw = function() {
	ctx.fillStyle = this.color
	drawText(18, 20, this.string, this.drawx + cellSize/2, this.drawy)
	ctx.fillStyle = 'black'
}

Unit.prototype.possibleMoves = function(result, searchFinish, finish) {
	var list = [], list_next = []
	var lengths = new Array(width*height)
	list_next.push ({x: this.x, y: this.y})
	var d = 0
	var finish_found = 0
	for (var i = 0; i < width*height; i++)
		lengths[i] = levelMap[i] == cell.wall ? 10000 : -1
	lengths[this.x + width*this.y] = d
	while (!finish_found && list_next.length) {
		list = list_next
		list_next = []
		d++
		for (var i in list) {
			if (searchFinish && finish_found)
				break
			var x = list[i].x, y = list[i].y
			var tmp = [{x: x - 1, y: y}, {x: x + 1, y: y}, {x: x, y: y - 1}, {x: x, y: y + 1}]
			for (var j in tmp) {
				if (tmp[j].x < 0 || tmp[j].x >= width || tmp[j].y < 0 || tmp[j].y >= height || lengths[tmp[j].x + width*tmp[j].y] >= 0)
					continue
				list_next.push(tmp[j])
				lengths[tmp[j].x + width*tmp[j].y] = d
				if (searchFinish && tmp[j].x == this.targetx && tmp[j].y == this.targety) {
					finish_found = 1
					break
				}
			}
		}
	}
	for (var i = 0; i < width*height; i++)
		if (lengths[i] != 10000 && lengths[i] >= 0)
			result.push(i)
	if (finish)
		finish.found = finish_found
	return lengths
}

Unit.prototype.generateWay = function () {
	this.way = []
	if (this.x == this.targetx && this.y == this.targety) {
		this.way.push({x: this.x, y: this.y})
		return this.way
	}
	var tmp = [], finish = {found: false}
	var lengths = this.possibleMoves(tmp, 1, finish)
	if (finish.found) {
		d = lengths[this.targetx + width*this.targety] 
		var current = {x: this.targetx, y: this.targety}
		this.way.push(current)
		while (current.x != this.x || current.y != this.y) {
			var x = current.x, y = current.y
			var tmp = [{x: x - 1, y: y}, {x: x + 1, y: y}, {x: x, y: y - 1}, {x: x, y: y + 1}]
			shuffle(tmp)
			for (var j in tmp) {
				if (tmp[j].x < 0 || tmp[j].x >= width || tmp[j].y < 0 || tmp[j].y >= height || lengths[tmp[j].x + width*tmp[j].y] < 0)
					continue
				if (lengths[tmp[j].x + width*tmp[j].y] == d - 1) {
					current = {x: tmp[j].x, y: tmp[j].y}
					this.way.push(current)
					d--
					break
				}
			}
		}
		this.way.reverse()
	}
	this.wayIndex = 1
	return this.way
}

Unit.prototype.die = function() {
	units[this.id].hp = 0
	units[this.id] = undefined
	if (this.id == 0)
		lose()
	else {
		decreaseLowscore(Math.floor(this.xp/Math.exp(xpB*(maxPlayerLevel - (player.level + this.level) + 1))))
		killed++
		totalKilled++
	}
	if (Math.random() > healPotionProbability) {
		objects.push(new GameObject(objects.length, this.x, this.y, objectTypes.healPotion, 'red', 'y'))
		return
	}
	if (Math.random() > weaponProbability && this.weapon.id > player.weapon.id) {
		var o = new GameObject(objects.length, this.x, this.y, objectTypes.item, 'silver', '<==I-')
		o.itemType = 'weapon'
		o.itemObject = this.weapon
		objects.push(o)
		return
	}
	if (Math.random() > armorProbability && this.armorType.id > player.armorType.id) {
		var o = new GameObject(objects.length, this.x, this.y, objectTypes.item, 'silver', '"U"')
		o.itemType = 'armor'
		o.itemObject = this.armorType
		objects.push(o)
		return
	}	
}

Unit.prototype.loseTarget = function() {
	this.target = this.targetx = this.targety = -1
	this.status = statuses.stop
}

Unit.prototype.attack = function() {
	if (this.target != -1) {
		if (!units[this.target]) {
			this.loseTarget()
			return
		}
		if (Math.abs(this.x - units[this.target].x) + Math.abs(this.y - units[this.target].y) > 1) {
			this.status = statuses.move
			return
		}
		if (this.attackSpeed == 0) {
			this.attackSpeed = this.weapon.speed
			var damage = Math.floor((1 - units[this.target].armor)*this.damage*this.weapon.damage)
			pushToTexts(new DisplayedText(0, units[this.target].drawx, units[this.target].drawy, 'red', '-' + damage))
			if ((units[this.target].hp -= damage) <= 0) { //destroy target
				units[this.target].die()
				this.loseTarget()
			}
			redrawPlayerInfo()
		}
		this.attackSpeed--
	}
}

Unit.prototype.setTarget = function() {
	if (this.nexttargetx != -1) {
		this.attackSpeed = this.attackSpeed > 0 ? this.attackSpeed - 1 : 0
		this.targetx = this.nexttargetx
		this.targety = this.nexttargety
		this.generateWay()
		this.nexttargetx = this.nexttargety = -1
		for (var i in units)
			if (units[i] && i != this.id && units[i].x == this.targetx && units[i].y == this.targety) {
				this.target = i
				break
			}
	}
}

Unit.prototype.move = function() {
	if (this.target != -1 && units[this.target] && unitsDist(this, units[this.target]) <= attackDist &&
	    Math.abs(this.drawx - this.x*cellSize) <= this.speed/2 && Math.abs(this.drawy - (this.y + 1)*cellSize) <= this.speed/2) {
		this.status = statuses.attack
		this.way = []
		return
	}
	if (this.wayIndex >= this.way.length) {
		this.setTarget()
		return
	}
	var nextx = this.wayIndex < this.way.length - 1 ? this.way[this.wayIndex].x : this.targetx
	var nexty = this.wayIndex < this.way.length - 1 ? this.way[this.wayIndex].y : this.targety
	if (Math.abs(this.drawx - nextx*cellSize) <= this.speed/2 && Math.abs(this.drawy - (nexty + 1)*cellSize) <= this.speed/2) {
		this.x = this.way[this.wayIndex].x
		this.y = this.way[this.wayIndex].y
		this.drawx = this.x*cellSize
		this.drawy = (this.y + 1)*cellSize
		this.wayIndex++
		this.setTarget()
		if (this.target != -1 && units[this.target] && units[this.target].x != this.targetx && units[this.target].y != this.targety) { //target moved
			this.nexttargetx = units[this.target].x
			this.nexttargety = units[this.target].y
			this.setTarget()
			return
		}
		if (this.target != -1 && units[this.target] && unitsDist(this, units[this.target]) <= attackDist) {
			this.status = statuses.attack
			this.way = []
			return
		}
	}
	if (this.wayIndex >= this.way.length) {
		this.status = this.target == -1 ? statuses.stop : statuses.attack
		return
	}
	
	var left = 1, right = 1, top = 1, bottom = 1
	for (var i in units)
		if (i != this.id && units[i] && units[i].target == this.id) {
			if (this.x - units[i].x > 0)
				left = top = bottom = 0.5
			if (this.x - units[i].x < 0)
				right = top = bottom = 0.5
			if (this.y - units[i].y > 0)
				top = left = right = 0.5
			if (this.y - units[i].y < 0)
				bottom = left = right = 0.5
		}
	if (this.way[this.wayIndex].x - this.x == 1)
		this.drawx += this.speed*right
	if (this.way[this.wayIndex].x - this.x == -1)
		this.drawx -= this.speed*left
	if (this.way[this.wayIndex].y - this.y == 1)
		this.drawy += this.speed*bottom
	if (this.way[this.wayIndex].y - this.y == -1)
		this.drawy -= this.speed*top
}

function unitsDist(u1, u2) {
	return Math.sqrt(Math.pow(u1.drawx - u2.drawx, 2) + Math.pow(u1.drawy - u2.drawy, 2))/cellSize
}

Unit.prototype.gotoStart = function() {
	this.target = -1
	this.nexttargetx = this.startx
	this.nexttargety = this.starty
	this.status = statuses.move
}

Unit.prototype.AI = function() {
	if (this.id != 0 && !player.spells[1].active) {
		var dist = unitsDist(this, player)
		if ((Math.abs(this.x - this.startx) >= moveDist || Math.abs(this.y - this.starty) >= moveDist) && dist > 1) {
			this.gotoStart()
		} else if (!(this.nexttargetx == this.startx && this.nexttargety == this.starty && this.status == statuses.move) && (dist <= seeDist + 0.95 || this.target != -1)) {
			if (!(this.nexttargetx == player.x && this.nexttargety == player.y)) {
				this.nexttargetx = player.x
				this.nexttargety = player.y
				this.status = statuses.move
			}
		}
	}
}

Unit.prototype.act = function() {
	this.AI()
	if (this.status == statuses.move)
		this.move()
	if (this.status == statuses.attack)
		this.attack()
}

var unit = new Unit(0, 0, 80, 5, unitTypes[0])
