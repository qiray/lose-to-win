
function startNewGame() {
	init()
	elm('menu').style.display = 'none'
	elm('game').style.display = 'block'
}

function showAchievements() {
	var txt = '', txt2 = ''
	for (var i in achievements)
		if (achievements[i].have)
			txt2 += '<b>' + achievements[i].name + '</b> - ' + achievements[i].desc + '<br>'
	txt = txt2.length > 0 ? '<h2>Achievements</h2>' + txt2 : '<br><br><br><br>'
	txt += '<h2>Lowscore:</h2>' + worstLowscore
	showInfo(txt)
}

function showInfo(text) {
	var overlay = elm('popupOverlay')
	overlay.style.width = window.innerWidth
	overlay.style.height = window.innerHeight
	overlay.style.display = 'block'
	elm('popup').innerHTML = text
}

function hidePopup() {
	elm('popupOverlay').style.display = 'none'
}

function showHelp(){
	var text = '<br><br>You must reach best highscore in most games, but there is no highscore in this game. There is lowscore instead of it. And your main goal is to reach lowscore 0.<br><br> Click mouse to move your character, click enemy to attack it. Click spell to cast it (you can also use numerical keys 1 - 8). To complete the level you must enter the door.<br><br>Good luck!'
	showInfo(text)
}

function showAboutInfo() {
	var text = '<br><br>' + gameName + ' ' + version + '<br><br>(c) Yaroslav Zotov aka qiray, 2015<br> for js13kgames'
	showInfo(text)
}

function drawMenuButton(label) {
	var text =
"/= = = = = = = = = = = = = = = = = = = = =\\\n\
||                                         ||\n\
||%label||\n\
||                                         ||\n\
\\= = = = = = = = = = = = = = = = = = = = =/"
	var spaces = 43 - label.length, halfspaces = spaces >> 1, flag = spaces&1
	return text.replace('%label', Array(halfspaces + (flag? 1 : 0)).join(" ") + label + Array(halfspaces).join(" "))
}
