
function checkAchievements() {
	if (elm('popupOverlay').style.display != 'none')
		return
	for (var i in achievements)
		if (!achievements[i].have && achievements[i].condition()) {
			achievements[i].have = true
			showInfo('<br><br><h2>New achievement!</h2><h3>' + achievements[i].name + '</h3>' + achievements[i].desc)
			return
		}
}

function showMenu() {
	var buttonYes = 
'+----------------------+\n\
|         yes          |\n\
+----------------------+'
	var buttonNo = 
'+----------------------+\n\
|          no          |\n\
+----------------------+'
	showInfo('<br><h2>Are you sure you want to quit?</h2><pre onclick = "elm(\'menu\').style.display = \'block\'; elm(\'game\').style.display = \'none\'">' + buttonYes + '</pre><pre onclick = "hidePopup()">' + buttonNo + '</pre>')
}

function sqr(val) {
	return val*val
}

function clone(obj) {
	var copy
	if (null == obj || "object" != typeof obj) 
		return obj
	if (obj instanceof Date) {
		copy = new Date()
		copy.setTime(obj.getTime())
		return copy
	}

	if (obj instanceof Array) {
		copy = []
		for (var i = 0, len = obj.length; i < len; i++)
			copy[i] = clone(obj[i])
		return copy
	}

	if (obj instanceof Object) {
		copy = {}
		for (var attr in obj)
			if (obj.hasOwnProperty(attr)) 
				copy[attr] = clone(obj[attr])
		return copy
	}

	throw new Error("Unable to copy obj! Its type isn't supported.")
}

function shuffle(o){
	for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o
}

var xpA = 1, xpB = 1.5

function XPByLevel(level) {
	return Math.floor(xpA*Math.exp(xpB*level))
}

function decreaseLowscore(value) {
	var diff = (xpToNextLevel -= value)
	if (diff <= 0)
		value = xpToNextLevel
	pushToTexts(new DisplayedText(0, player.drawx, player.drawy, 'blue', '-' + value + 'xp'))
	if (player.level > 0 && xpToNextLevel <= 0) {
		for (var i in objects)
			if (objects[i] && (objects[i].type == objectTypes.ThorsHammer || objects[i].type == objectTypes.fireball))
				objects[i] = undefined
		player = new Player(0, player.x, player.y, player.level - 1, unitTypes[0])
		units[0] = player
		playerLevel--
		xpToNextLevel = XPByLevel(player.level)
		showInfo('<br><br><br><br><br><h2>Level ' + player.level + ' reached!</h2>')
	}	
	if ((lowscore -= value) < worstLowscore)
		worstLowscore = lowscore
	redrawPlayerInfo()
}


function firstEmptySlot(array) {
	for (var i = 0; i < array.length; i++)
		if (array[i] == undefined)
			return i
	return array.length
}

function pushToTexts(obj) {
	var index = firstEmptySlot(texts)
	obj.id = index
	texts[index] = obj
}
