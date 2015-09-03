
function saveGame() {
	if ('localStorage' in window && window['localStorage'] !== null) {
		localStorage.setItem('lowscore', worstLowscore)
		var txt = ''
		for (var i in achievements)
			txt += achievements[i].have + ' '
		txt = txt.substring(0, txt.length - 1)
		localStorage.setItem('achievements', txt)
	}
}

function loadGame() {
	if ('localStorage' in window && window['localStorage'] !== null) {
		var tmp = localStorage.getItem('lowscore')
		worstLowscore = tmp ? tmp : Number.POSITIVE_INFINITY
		tmp = localStorage.getItem('achievements')
		if (tmp) {
			tmp = tmp.split(' ')
			for (var i in tmp)
				achievements[i].have = tmp[i] == 'true'
		}
	}
}
