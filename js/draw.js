
function drawCell(map, i, j) {
	ctx.fillStyle = cells[i + j*width].color
	drawText(cells[i + j*width].height, cells[i + j*width].line, cells[i + j*width].txt, cellSize*i + cellSize/2, cellSize*(j + 1) + cells[i + j*width].shift)
}

function drawMap(map) {
	ctx.clearRect (0 ,0 , canvas.width, canvas.height)
	if (mapImage) {
		ctx.drawImage(mapImage, 0, 0)
		return
	}
	for (var i = 0; i < width; i++)
		for (var j = 0; j < height; j++)
			drawCell(map, i, j)
	mapImage = new Image()
	mapImage.src = canvas.toDataURL("image/png")
}

function hpToColor(unit) {
	if (unit.hp > 0.6*unit.maxhp)
		return '#228B22'
	if (unit.hp > 0.3*unit.maxhp)
		return '#DAA520'
	return 'red'
}

function redrawPlayerInfo() {
	elm('player_xp').innerHTML = 'xp to next level:<br>' + xpToNextLevel
	elm('playerLevel').innerHTML = player.name + ' level ' + player.level
	elm('playerImage').style.color = player.color
	elm('playerImage').innerHTML = player.string
	elm('player_hp').style.color = hpToColor(player)
	elm('player_hp').innerHTML = player.hp + '/' + player.maxhp
	elm('player_armor').innerHTML = 'Armor: ' + player.armor
	elm('player_damage').innerHTML = 'Damage: ' + Math.floor(player.damage*player.weapon.damage)
	if (player.target != -1 && units[player.target]) {
		elm('vs').innerHTML = 'VS'
		elm('target').style.opacity = '1'
		elm('target').style.display = 'table-cell'
		var u = units[player.target]
		elm('targetLevel').innerHTML = u.name + ' level ' + u.level
		elm('targetImage').style.color = u.color
		elm('targetImage').innerHTML = u.string
		elm('target_hp').style.color = hpToColor(u)
		elm('target_hp').innerHTML = u.hp + '/' + u.maxhp
		elm('target_armor').innerHTML = 'Armor: ' + u.armor
		elm('target_damage').innerHTML = 'Damage: ' + Math.floor(u.damage*u.weapon.damage)
	} else {
		elm('target').style.opacity = '0'
		elm('vs').innerHTML = ' '
	}
}

function redraw(map) {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawMap(map)
	for (var i in objects)
		if (objects[i])
			objects[i].draw()
	for (var i in units)
		if (units[i])
			units[i].draw()
	for (var i in player.spells)
		elm('spell' + i).innerHTML = player.spells[i].name + ' (' + player.spells[i].timer + '/' + spells[i].timer + ')'
	redrawPlayerInfo()
}

function drawText(fontSize, lineHeight, text, x ,y) {
	ctx.font = fontSize + 'px Arial'
	ctx.textAlign = 'center'
	var lines = text.split('\n')
	for (var k = 0; k < lines.length; k++)
		ctx.fillText(lines[k], x, y + k*lineHeight + yoffset)
}

function elm(id) {
	return document.getElementById(id)
}

function setStatus(text) {
	document.getElementById('status').innerHTML = text
}

function DisplayedText(id, x, y, color, text) {
	this.id = id
	this.x = x
	this.y = y
	this.color = color
	this.text = text
	this.timer = 10
}

DisplayedText.prototype.process = function() {
	if (--this.timer > 0) {
		ctx.fillStyle = this.color
		drawText(16, 18, this.text, this.x, this.y -= 10)
	} else
		texts[this.id] = undefined
}
