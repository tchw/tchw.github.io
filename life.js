const SStarted = 0;
const SPaused = 1;

var state;
var cellsCanvas, plotCanvas;
var size, nrows, ncolumns;
var cells;
var density;
var cnt;

function drawCells() {
	var ctx = cellsCanvas.getContext("2d");
	ctx.clearRect(0, 0, cellsCanvas.width, cellsCanvas.height);

	ctx.fillStyle = "#FF0000";
	for (i = 0; i < cells.length; ++i) {
		for (j = 0; j < cells[i].length; ++j) {
			if (cells[i][j] == 1) {
				ctx.fillRect(i * size, j * size, size, size);
			}
		}
	}

	ctx.fillStyle = "#000000";
	for (i = 1; i < cells.length; ++i) {
		for (j = 1; j < cells[i].length; ++j) {
			ctx.fillRect(i * size - 1, j * size - 1, 2, 2);
		}
	}
}

function updateCells() {
	function get(cells, i, j) {
		if (i < 0)
			i = cells.length - 1;
		if (i > cells.length - 1)
			i = 0;
		if (j < 0)
			j = cells[i].length - 1;
		if (j > cells[i].length - 1)
			j = 0;
		return cells[i][j];
	}

	for (i = 0; i < cells.length; ++i) {
		for (j = 0; j < cells[i].length; ++j) {
			n = get(cells, i + 1, j) + get(cells, i + 1, j + 1)
					+ get(cells, i, j + 1) + get(cells, i - 1, j + 1)
					+ get(cells, i - 1, j) + get(cells, i - 1, j - 1)
					+ get(cells, i, j - 1) + get(cells, i + 1, j - 1);

			if (cells[i][j] == 0 && n == 3) {
				cells[i][j] = 1;
			} else if (cells[i][j] == 1 && n != 2 && n != 3) {
				cells[i][j] = 0;
			}
		}
	}
}

function drawPlot() {
	function getY(i) {
		return plotCanvas.height - (density[i] / (nrows * ncolumns))
				* (plotCanvas.height - 1) - 1;
	}

	var ctx = plotCanvas.getContext("2d");
	ctx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);

	ctx.fillStyle = "#000000";
	var k = cnt - density.length;
	for (i = 10 - k % 10; i < plotCanvas.width; i += 10) {
		for (j = 10; j < plotCanvas.height; j += 10) {
			if ((((k + i) % 100) == 0) || ((j % 100) == 0)) {
				ctx.fillRect(i - 1, j - 1, 2, 2);
			} else {
				ctx.fillRect(i, j, 1, 1);
			}
		}
	}

	ctx.beginPath();
	ctx.moveTo(0, getY(0) + 1);
	for (i = 1; i < density.length; ++i) {
		ctx.lineTo(i + 1, getY(i) + 1);
	}

	ctx.stroke();
}

function updatePlot() {
	var d = 0;
	for (i = 0; i < cells.length; ++i) {
		for (j = 0; j < cells[i].length; ++j) {
			d = d + cells[i][j];
		}
	}

	density.push(d);
	++cnt;
	while (density.length > plotCanvas.width) {
		density.shift();
	}
}

function init() {
	function createGrid(m, n, p) {
		var cells = new Array();
		for (i = 0; i < m; i++) {
			cells[i] = new Array();
			for (j = 0; j < n; j++) {
				if (Math.random() < p) {
					cells[i][j] = 1;
				} else {
					cells[i][j] = 0;
				}
			}
		}

		return cells;
	}

	state = SPaused;
	cellsCanvas = document.getElementById("cellsCanvas");
	plotCanvas = document.getElementById("plotCanvas");
	size = 10;
	nrows = Math.floor((cellsCanvas.width + 1) / size);
	ncolumns = Math.floor((cellsCanvas.height + 1) / size);
	var d_ = parseFloat(document.getElementById("densityInput").value);
	cells = createGrid(nrows, ncolumns, isNaN(d_) ? 0.1 : d_);
	density = [];
	cnt = 0;

	updatePlot();

	console.log(nrows);
	console.log(ncolumns);

	drawCells();
	drawPlot();
}

function step() {
	updateCells();
	updatePlot();
	drawCells(10);
	drawPlot();
}

function run() {
	init();

	var resetButton = document.getElementById("resetButton");
	resetButton.onclick = function() {
		init();
	};

	var startButton = document.getElementById("startButton");
	startButton.onclick = function() {
		function loop() {
			var dt_ = parseInt(document.getElementById("timeStepInput").value);
			setTimeout(function() {
				if (state == SStarted) {
					step();
					loop();
				}
			}, isNaN(dt_) ? 100 : dt_);
		}

		if (state == SPaused) {
			state = SStarted;
			loop();
		}
	};

	var pauseButton = document.getElementById("pauseButton");
	pauseButton.onclick = function() {
		state = SPaused;
	};

	var stepButton = document.getElementById("stepButton");
	stepButton.onclick = function() {
		if (state == SPaused) {
			step();
		}
	};
}

run();
