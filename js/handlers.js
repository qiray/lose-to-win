
function handleKeyPress(event) {
	var digit = String.fromCharCode(event.which || event.keyCode)
	if (digit >= '1' && digit <= '8')
		player.castSpell(parseInt(digit) - 1)
}

function getMousePosition(event) {
	var clickY = 0, clickX = 0
	if (event.layerX || event.layerX == 0) { //Firefox
		clickX = event.layerX - canvas.offsetLeft
		clickY = event.layerY - canvas.offsetTop
	} else if (event.offsetX || event.offsetX == 0) { //Opera
		clickX = event.offsetX
		clickY = event.offsetY
	}
	if (navigator.userAgent.search(/Chrome/) > 0) { //Chrome
		clickX = event.offsetX
		clickY = event.offsetY
	}
	return {x : Math.floor(clickX/cellSize), y : Math.floor(clickY/cellSize)}
} 

function handleMouseMove(event) {
	var coords = getMousePosition(event)
	if (levelMap[coords.y*width + coords.x] == cell.empty)
		canvas.style.cursor = 'pointer'
	else
		canvas.style.cursor = 'default'
	for (var i in units)
		if(units[i] && units[i].x == coords.x && units[i].y == coords.y) {
			setStatus(units[i].name + ' level ' + units[i].level + ' (' + units[i].hp + ' hp, ' +  units[i].weapon.name + ', '  +  units[i].armorType.name + ')')
			return
		}
	for (var i in objects)
		if(objects[i] && objects[i].x == coords.x && objects[i].y == coords.y) {
			setStatus(objects[i].type.desc)
			return
		}
	setStatus(' ')
}

function handleMouseClick(event) {
	var coords = getMousePosition(event)
	if (levelMap[coords.y*width + coords.x] == cell.empty) {
		player.nexttargetx = coords.x
		player.nexttargety = coords.y
		player.status = statuses.move
		player.target = -1
	}
}
