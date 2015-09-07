
function init() {
	canvas = document.getElementById("canvas")
	ctx = canvas.getContext('2d')
	var str = '<table><tr>'
	for (var i in spells)
		str += '<td id = "spell' + i + '" style = "cursor: pointer;text-align: center; border: 1px solid; width: 100px; height: 90px" onclick = "player.castSpell(' + i + ')" onmouseover = "setStatus(spells[' + i + '].desc)">' + spells[i].name + '</td>'
	str += '</tr></table>'
	elm('spells').innerHTML = str
	playerLevel = maxPlayerLevel
	spells = clone(etalonSpells)
	generateLevel(levelMap)
	redraw(cells)
	lowscore = currentMap = killed = 0
	xpToNextLevel = XPByLevel(maxPlayerLevel)
	for (var i = 1; i <= maxPlayerLevel; i++)
		lowscore += XPByLevel(i)
	gameCounter = totalKilled = castedSpells = 0
	game_timer = setInterval('game_cycle()', 100)
}

function startWay(map, x, y, obj, maxLen) {
	if (x < 0 || x >= width || y < 0 || y >= height || obj.len >= maxLen)
		return
	index = y*width + x
	if (map[index] == cell.empty)
		return
	map[index] = cell.empty
	obj.len++
	var dirs = [{x : x - 1, y : y}, {x : x + 1, y : y}, {x : x, y : y - 1}, {x : x, y : y + 1}]
	shuffle(dirs)
	for (var i in dirs)
		startWay(map, dirs[i].x, dirs[i].y, obj, maxLen)
}

function win() {
	saveGame()
	clearInterval(game_timer)
	showInfo('<br><br><br><h2>Wow! You\'ve won!</h2>Your lowscore is<br>' + lowscore)
	return
}

function lose() {
	saveGame()
	clearInterval(game_timer)
	showInfo('<br><br><br><h2>You have failed.</h2>Your lowscore is<br>' + lowscore)
	return
}

function randomUnit(arr) {
	return arr[Math.floor(Math.random()*arr.length)]
}

function generateLevel(map) {
	if (playerLevel == 0) {
		win()
		return
	}
	mapImage = undefined
	for (var i = 0; i < width*height; i++)
		map[i] = cell.wall
	var x = Math.floor(Math.random()*width), y =  Math.floor(Math.random()*height)
	player = new Player(0, x, y, playerLevel, unitTypes[0])
	levelstartx = x
	levelstarty = y
	startWay(map, x, y, {len : 0}, 100 + Math.floor(Math.random()*400))
	units = [player]
	var unitsForLevel = []
	for (var i = 1; i < unitTypes.length; i++)
		if (unitTypes[i].level < maxPlayerLevel - playerLevel + 1)
			unitsForLevel.push(unitTypes[i])
	var indexes = [x + y*width]
	for (var i = Math.floor(Math.random()*15); i >= 0; i--) {
		do {
			x = Math.floor(Math.random()*width)
			y = Math.floor(Math.random()*height)
		} while (map[x + y*width] == cell.wall || indexes.indexOf(x + y*width) != -1 || Math.abs(x - player.x) <= seeDist && Math.abs(y - player.y) <= seeDist)
		var npc = new Unit(units.length, x, y, maxPlayerLevel - playerLevel + 1, randomUnit(unitsForLevel), weapons[1])
		indexes.push(x + y*width)
		units.push(npc)
	}
	var tmp = [], lengths = player.possibleMoves(tmp, false), max = player.x + player.y*width
	for (var i in lengths)
		if (lengths[i] > lengths[max] && lengths[i] != 10000 && indexes.indexOf(i) == -1)
			max = i
	objects = [new GameObject(0, max%width, Math.floor(max/width), objectTypes.door, 'orange', '|U|')]
	var index = Math.floor(Math.random()*wallCells.length) 
	for (var i = 0; i < width*height; i++) {
		if (map[i] == cell.wall) {
			cells[i] = randomCell(wallCells[index])
			if (cells[i].shift < 0 && i - width >= 0)
				cells[i - width] = emptyCells[0]
		} else
			cells[i] =  randomCell(emptyCells)
	}
	notKilledFlag = killed == 0 ? 1 : 0
	killed = 0
	currentMap++
	texts = []
}

function randomCell(arr) {
	var tmp = Math.random()
	for (var i in arr)
		if (tmp <= arr[i].p)
			return arr[i]
	return arr[0]
}

function game_cycle() {
	if (lowscore <= 0) {
		lowscore = 0
		win()
		return
	}
	if (gameCounter++ % 25 == 24 && player.hp > 1) {
		player.hp--
		pushToTexts(new DisplayedText(0, player.drawx, player.drawy, 'red', '-1'))
	}
	for (var i in units) {
		if (units[i]) {
			units[i].act()
			if (gameCounter % 25 == 24 && player.hp < player.maxhp && units[i].target == 0) {
				player.hp++
				pushToTexts(new DisplayedText(0, player.drawx, player.drawy, 'green', '+1'))
			}
		}
	}
	for (var i in objects)
		if (objects[i])
			objects[i].process()
	checkAchievements()
	redraw(levelMap)
	for (var i in texts)
		if (texts[i])
			texts[i].process()
}
