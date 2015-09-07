/*
TODO http://javascriptcompressor.com/ - compress javascript
*/

var version = 'v1.0', gameName = 'Lose to win'

var canvas, ctx

var width = 32, height = 24, cellSize = 20
var levelMap = new Array(width*height)
var cells = new Array(width*height)

var player, game_timer
var cell = {wall : 1, empty : 0}

var units = [], objects = [], texts = []

var mapImage = undefined

var statuses = {
	stop: 0,
	move: 1,
	attack : 2
}

var objectTypes = {
	door: {id : 0, fontSize : 18, lineSize : 20, yshift : 0, desc : 'This is a door. Enter it to complete the level.'},
	healPotion: {id : 1, fontSize : 18, lineSize : 20, yshift : 0, desc : 'This is a heal potion. Drink it, it\'s useful.'},
	ThorsHammer: {id : 2, fontSize : 18, lineSize : 16, yshift : -2*cellSize, desc : 'The hammer of Thor'},
	fireball: {id : 3, fontSize : 18, lineSize : 20, yshift : 0, desc : 'Fireball'},
	item: {id : 4, fontSize : 18, lineSize : 20, yshift : 0, desc : 'Take it!'},
}

var yoffset = -3
var maxPlayerLevel = 16, playerLevel = maxPlayerLevel
var lowscore = 0, xpToNextLevel = 0
var worstLowscore = Number.POSITIVE_INFINITY
var basicSpeed = 5
var levelstartx = 0, levelstarty = 0
var playerArmor, playerWeapon
var healPotionProbability = 0.9, weaponProbability = 0.75, armorProbability = 0.75
var currentMap = 0, killed = 0, totalKilled = 0, castedSpells = 0, notKilledFlag = 0
var seeDist = 2, moveDist = 8, attackDist = 1.2
var gameCounter = 0

var wallCells = [
	[ //forest
		{color : 'black', txt : '1', p : 0.35, height : 16, line : 20, shift : 0},
		{color : '#B22222', txt : '#', p : 0.75, height : 18, line : 20, shift : 0},
		{color : '#007700', txt : '/|\\', p : 0.8, height : 18, line : 20, shift : 0},
		{color : 'green', txt : 'W', p : 0.84, height : 18, line : 20, shift : 0},
		{color : 'green', txt : '\\|/', p : 0.9, height : 18, line : 20, shift : 0},
		{color : '#00aa00', txt : '88\n888\n||', p : 0.95, height : 18, line : 12, shift : -cellSize},
		{color : '#708090', txt : '71\n3Y5\n||', p : 0.96, height : 18, line : 12, shift : -cellSize},
		{color : 'green', txt : '^\n/|\\\n//\\\\\n#', p : 1.0, height : 18, line : 14, shift : -1.5*cellSize},
	],
	[ //labyrinth
		{color : 'black', txt : '#|', p : 0.3, height : 18, line : 20, shift : 0},
		{color : 'black', txt : '|#|', p : 0.6, height : 18, line : 20, shift : 0},
		{color : '#B22222', txt : 'AA', p : 0.8, height : 18, line : 20, shift : 0},
		{color : 'grey', txt : 'LI', p : 1.0, height : 18, line : 20, shift : 0},
	],
	[ //water
		{color : 'blue', txt : '~', p : 0.5, height : 18, line : 20, shift : 0},
		{color : '#1020aa', txt : 'w', p : 0.7, height : 16, line : 20, shift : 0},
		{color : 'blue', txt : '\'', p : 0.95, height : 18, line : 20, shift : 0},
		{color : 'grey', txt : '.', p : 1.0, height : 18, line : 20, shift : 0},
	],
	[ //desert
		{color : '#B8860B', txt : '..', p : 0.5, height : 18, line : 20, shift : 0},
		{color : '#DAA520', txt : '.', p : 0.7, height : 16, line : 20, shift : 0},
		{color : '#FFD700', txt : '"', p : 0.9, height : 18, line : 20, shift : 0},
		{color : '#DAA520', txt : ',', p : 1.0, height : 18, line : 20, shift : 0},
	],
]

var emptyCells = [
	{color : 'black', txt : ' ', p : 1.0, height : 18, line : 20, shift : 0},
]

var weapons = [
	{id : 0, name : 'Wooden stick', damage : 0.2, speed : 4},
	{id : 1, name : 'Baseball bat', damage : 0.5, speed : 8},
	{id : 2, name : 'Wooden sword', damage : 0.75, speed : 8},
	{id : 3, name : 'Rusty axe', damage : 1, speed : 8},
	{id : 4, name : 'Rusty sword', damage : 1, speed : 6},
	{id : 5, name : 'Iron sword', damage : 1.2, speed : 6},
	{id : 6, name : 'Morning star', damage : 2, speed : 12},
	{id : 7, name : 'Silver sword', damage : 2.5, speed : 6},
	{id : 8, name : 'DEATH SCYTHE', damage : 4, speed : 8},
	{id : 9, name : 'Emerald Sword of the Power and Glory', damage : 8, speed : 8},
]

var armors = [
	{id : 0, name : 'T-shirt', armor : 0},
	{id : 1, name : 'Leather jacket', armor : 0.1},
	{id : 2, name : 'Leather armor', armor : 0.15},
	{id : 3, name : 'Light armor', armor : 0.25},
	{id : 4, name : 'Сhain armor', armor : 0.35},
	{id : 5, name : 'Heavy armor', armor : 0.5},
	{id : 6, name : 'Diamond armor', armor : 0.7},
]

var unitTypes = [ 
	{name : 'Player', string : '\\o/', color : 'blue', factors : { hp : 1, speed : 1, damage : 1, xp : 1}, weapons : [0], armors : [0], level : 0},
	{name : 'Warrior', string : '\\o/', color : 'red', factors : { hp : 1, speed : 1, damage : 1, xp : 1}, weapons : [2, 3, 4, 5], armors : [2, 3, 4], level : 0},
	{name : 'Hunter', string : 'o}', color : '#B22222', factors : { hp : 0.9, speed : 1.2, damage : 0.95, xp : 0.9}, weapons : [0, 1, 2], armors : [1, 2], level : 0},
	{name : 'Knight', string : '\\n/', color : 'red', factors : { hp : 1.5, speed : 0.8, damage : 1.5, xp : 1.5}, weapons : [5, 6], armors : [4, 5], level : maxPlayerLevel*0.1},
	{name : 'Ogre', string : '\\Oo/', color : '#B8860B', factors : { hp : 2, speed : 0.5, damage : 2, xp : 2}, weapons : [6], armors : [5], level : maxPlayerLevel*0.2},
	{name : 'Berserk', string : '\\v/', color : 'red', factors : { hp : 0.5, speed : 1.5, damage : 1.5, xp : 1.5}, weapons : [5, 7], armors : [3, 4], level : maxPlayerLevel*0.4},
	{name : 'Death', string : 'J{', color : 'grey', factors : { hp : 1, speed : 1, damage : 3, xp : 2.5}, weapons : [8], armors : [0], level : maxPlayerLevel*0.6},
	{name : 'Glory knight', string : '\\T/', color : '#00C957', factors : { hp : 1, speed : 1, damage : 1, xp : 1}, weapons : [9], armors : [5,6], level : maxPlayerLevel*0.8},
]

var spells = [
	{id: 0, name : 'Thor\'s hammer', desc : 'Attacks enemy with a lightning from the sky', timer : 180, active : false, object : -1,
		condition : function() { return player.target > 0 }, 
		action : function() {
			this.object = new GameObject(objects.length, units[player.target].x, units[player.target].y, objectTypes.ThorsHammer, '#FF8C00', '|\n/\nV')
			objects.push(this.object)
			var damage = Math.floor(0.5*units[player.target].maxhp)
			pushToTexts(new DisplayedText(0, units[player.target].drawx, units[player.target].drawy, '#FF8C00', '-' + damage))
			redrawPlayerInfo()
			if ((units[player.target].hp -= damage) <= 0) {//destroy unit
				units[player.target].die()
				player.loseTarget()
			}
			castedSpells |= 1
			this.active = true
		},
		activeAction : function() {
			if (this.timer >= 10) {
				objects[this.object.id] = undefined
				this.active = false
			}
		}
	},
	{id: 1, name : 'Invisibility', desc : 'Makes player invisible for a short time', timer : 450, active : false,
		condition : function() { return 1 }, 
		action : function() {
			player.color = "rgba(0, 0, 255, 0.5)"
			for (var i = 1; i < units.length; i++)
				if (units[i]&& units[i].target == 0)
					units[i].gotoStart()
			castedSpells |= 2
			this.active = true
		},
		activeAction : function() {
			if (this.timer >= 45) {
				player.color = unitTypes[0].color
				this.active = false
			}
		}
	},
	{id: 2, name : 'Berserc', desc : 'Makes player damage bigger for a short time but decreases hitpoints', timer : 300, active : false,
		condition : function() { return !player.spells[3].active }, 
		action : function() {
			player.string = '\\v/'
			player.damage *= 3
			player.hp = Math.floor(player.hp/2) + 1
			castedSpells |= 4
			this.active = true
		},
		activeAction : function() {
			if (this.timer >= 100) {
				player.string = unitTypes[0].string
				player.damage = Math.floor(player.damage/3)
				this.active = false
			}
		}
	},
	{id: 3, name : 'Heaven \'s shield', desc : 'Makes player armor bigger for a short time but decreases damage', timer : 300, active : false, damage : 0, armor : 0,
		condition : function() { return !player.spells[2].active }, 
		action : function() {
			player.string = '(o)'
			this.armor = player.armor
			this.damage = player.damage
			player.armor = 0.95
			player.damage = Math.floor(player.damage/2)
			castedSpells |= 8
			this.active = true
		},
		activeAction : function() {
			if (this.timer >= 100) {
				player.armor = this.armor
				player.string = unitTypes[0].string
				player.damage = this.damage
				this.active = false
			}
		}
	},
	{id: 4, name : 'Fast as a shark', desc : 'Makes player faster for a short time', timer : 300, speed : 0,
		condition : function() { return 1 }, 
		action : function() {
			this.speed = player.speed
			player.speed = Math.floor(player.speed*1.5)
			castedSpells |= 16
			this.active = true
		},
		activeAction : function() {
			if (this.timer >= 100) {
				player.speed = this.speed
				this.active = false
			}
		}
	},
	{id: 5, name : 'Fireball', desc : 'Cast a fireball to damage player\'s target', timer : 150, active : false, object : -1, target : -1, speed : cellSize,
		condition : function() { return player.target > 0 }, 
		action : function() {
			this.target = player.target
			this.object = new GameObject(objects.length, player.x, player.y, objectTypes.fireball, '#FF8C00', 'o')
			objects.push(this.object)
			castedSpells |= 32
			this.active = true
		},
		activeAction : function() {
			if (!units[this.target]) {
				objects[this.object.id] = undefined
				this.active = false
			}
			var diffX = this.object.drawx - units[this.target].drawx, diffY = this.object.drawy - units[this.target].drawy
			if (Math.abs(diffX) < cellSize/2 && Math.abs(diffY) < cellSize/2) {
				objects[this.object.id] = undefined
				var damage = Math.floor(0.5*player.damage)
				pushToTexts(new DisplayedText(0, units[this.target].drawx, units[this.target].drawy, '#FF8C00', '-' + damage))
				if ((units[this.target].hp -= damage) <= 0) {//destroy unit
					units[this.target].die()
					if (player.target == this.target)
						player.loseTarget()
				}
				redrawPlayerInfo()
				this.active = false
			} else {
				var dist = Math.sqrt(sqr(diffX) + sqr(diffY)), cos = diffX/dist, sin = diffY/dist
				var angle = Math.atan(Math.abs(diffY/diffX))
				if (diffX > 0)
					this.object.drawx -= this.speed*Math.cos(angle)
				else
					this.object.drawx += this.speed*Math.cos(angle)
				if (diffY > 0)
					this.object.drawy -= this.speed*Math.sin(angle)
				else
					this.object.drawy += this.speed*Math.sin(angle)
			}
		}
	},
	{id: 6, name : 'Teleport', desc : 'Teleports player to start position', timer : 900, 
		condition : function() { return 1 }, 
		action : function() {
			for (var i = 1; i < units.length; i++)
				if (units[i] && units[i].target == 0)
					units[i].gotoStart()
			player.x = levelstartx
			player.y = levelstarty
			player.drawx = levelstartx*cellSize
			player.drawy = (levelstarty + 1)*cellSize
			player.status = statuses.stop
			player.way = []
			player.wayIndex = 0
			player.nexttargetx = player.nexttargety = player.target = -1
			castedSpells |= 64
		}
	},
	{id: 7, name : 'Main menu', desc : 'Quit to main menu', timer : 1, 
		condition : function() { return 1 }, 
		action : showMenu,
	},
]

var achievements = [
	{name: 'First blood', have: false, desc: 'Kill 1 enemy', condition: function() { return killed > 0 }},
	{name: 'Destroyer', have: false, desc: 'Kill 50 enemies', condition: function() { return totalKilled >= 50 }},
	{name: 'Exterminatus', have: false, desc: 'Kill 100 enemies', condition: function() { return totalKilled >= 100 }},
	{name: 'This is only the beginning', have: false, desc: 'Complete 1 level', condition: function() { return currentMap > 0 }},
	{name: 'Pacifist or coward?', have: false, desc: 'Complete level without any murders', 
		condition: function() {	return notKilledFlag && currentMap > 0 }}, //door reached without murders
	{name: 'That\'s one small step for a man.', have: false, desc: 'Reach 15 level', condition: function() { return player.level <= 15 }},
	{name: 'One giant leap for mankind.', have: false, desc: 'Reach 10 level', condition: function() { return player.level <= 10 }},
	{name: 'How?', have: false, desc: 'Reach 5 level', condition: function() { return player.level <= 5 }},
	{name: 'The Wizzard', have: false, desc: 'Cast all spells', condition: function() { return castedSpells == 127 }},
	{name: 'Recursively', have: false, desc: 'Have all achievements', 
		condition: function() { 
			var tmp = 0
			for (var i in achievements) 
				if (achievements[i].have) 
					tmp++
			if (tmp == achievements.length - 1) 
				return true 
			else 
				return false
		}
	},
]

var etalonSpells = clone(spells)
