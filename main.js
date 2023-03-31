/**
 * KeyMap: KeyCode data for controls
 * 0 - Left (Left Arrow)
 * 1 - Right (Right Arrow)
 * 2 - Rotate Counter Clockwise (A)
 * 3 - Rotate Clockwise (D)
 * 4 - Soft Drop (Down Arrow)
 * 5 - Hard Drop (Space)
 * 6 - Hold (Up Arrow)
 * 7 - Pause (P)
 * 8 - Continue (Enter)
 */
var keyMap = [37,39,65,68,40,32,38,80,13];


window.addEventListener('keydown', function(event) {
    if ([32,37,38,39,40].indexOf(event.keyCode) !== -1) {
        event.preventDefault();
    }
}, false);


var keys = [];
function keyPressed() {
    keys[keyCode] = true;
};
function keyReleased() {
    keys[keyCode] = false;
};

var mouseTapped = false;
function mousePressed() {
    mouseTapped = true;
}

var validObject = function(input) {
    if (Object.prototype.toString.call(input) === '[object Object]') {
        return true;
    }
    return false;
};

var coords = function(x, y) {
  return {
    x: x,
    y: y
  }
}

var new1DArray = function(maxLength,fillVal) {
    var newArray = [];
    for (var i = 0; i < maxLength; i++) {
        newArray[i] = fillVal;
    }
    return newArray;
};
var new2DArray = function(yMax,xMax,fillVal) {
    var newArray = [];
    var insideArray = new1DArray(xMax,fillVal);

    for (var i = 0; i < yMax; i++) {
        newArray[i] = insideArray.slice();
    }

    return newArray;
};
var copyDimensionalArray = function(array) {
    var newArray = [];

    for(var i = 0; i < array.length; i++) {
        if (array[i] !== null && validObject(array[0])) {
            array[i] = copyDimensionalArray(array[0]);
        } else {
            newArray[i] = array[i].slice();
        }
    }

    return newArray;
};

var randInt = function (min,max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

//The Knuth Fisher-Yates algorithm
var shuffleArray = function (array) {
    for (var i = array.length-1; i >= 0; i--) {
        var rndIndex = randInt(0,i);

        var temporaryVal = array[i];
        array[i] = array[rndIndex];
        array[rndIndex] = temporaryVal;
    }
    return array;
};
var randIntNoRep = function (maxLength) {
    var numArray = [];
    for (var i = 0; i < maxLength; i++) {
        numArray[i] = i;
    }
    return shuffleArray(numArray);
};

var drawMatrix = function(Xmin,Xmax,Ymin,Ymax,colorData,matrixData) {
    rectMode(CORNER);

    var VerticalPxls = matrixData.length;
    for (var counterY = 0; counterY < VerticalPxls; counterY++) {

        var HorizontalPxls = matrixData[counterY].length;
        for (var counterX = 0; counterX < HorizontalPxls; counterX++) {

            fill(colorData[matrixData[counterY][counterX]]);

            var pxlX = map(counterX,0,HorizontalPxls,Xmin,Xmax);
            var pxlY = map(counterY,0,VerticalPxls,Ymin,Ymax);
            var pxlWidth = (Xmax - Xmin) / HorizontalPxls;
            var pxlHeight = (Ymax - Ymin) / VerticalPxls;
            rect(pxlX,pxlY,pxlWidth,pxlHeight);
        }
    }

};

var Polymino = function(config) {
    this.blockData = config.Block;
    this.offsetData = config.Offsets;
    this.colorIndex = config.ColorIndex;

    this.spawn = config.Spawn;
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.state = 0;
};
Polymino.prototype.get = function() {
    return new Polymino({
        Spawn: this.spawn,
        ColorIndex: this.colorIndex,

        Block: this.blockData,
        Offsets: this.offsetData
    });
};
Polymino.prototype.getBlock = function() {
    return this.blockData[this.state];
};
Polymino.prototype.getTestData = function(toState) {
    var difference = [];

    for (var i = 0; i < this.offsetData[0].length; i++) {
        difference[i] = [
            this.offsetData[this.state][i][0] - this.offsetData[toState][i][0],
            this.offsetData[this.state][i][1] - this.offsetData[toState][i][1]
        ];
    }

    return difference;
};
Polymino.prototype.testPos = function(relX,relY,state,board) {
    var block = this.blockData[state];

    for (var i = 0; i < block.length; i++) {
        for (var j = 0; j < block[i].length; j++) {
            if (block[i][j] === 1) {
                var bx = this.x + relX + j;
                var by = this.y - relY + i;
                if (bx>=0 && bx<board[0].length && by>=0 && by<board.length) {
                    if (board[by][bx] >= 2) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
    }
    return true;
};
Polymino.prototype.rotate = function(toState,board) {
    var tests = this.getTestData(toState);

    for (var i = 0; i < tests.length; i++) {
        var tx = tests[i][0];
        var ty = tests[i][1];
        if (this.testPos(tx,ty,toState,board)) {
            this.x += tx;
            this.y -= ty;
            this.state = toState;
            return true;
        }
    }
    return false;
};
Polymino.prototype.move = function(relX,relY,board) {
    if (this.testPos(relX,relY,this.state,board)) {
        this.x += relX;
        this.y -= relY;
        return true;
    }
    return false;
};
Polymino.prototype.place = function(board) {
    var block = this.getBlock();
    var newBoard = copyDimensionalArray(board);

    for (var i = 0; i < block.length; i++) {
        for (var j = 0; j < block[i].length; j++) {
            if (block[i][j] === 1) {
                newBoard[this.y+i][this.x+j] = this.colorIndex;
            }
        }
    }

    return newBoard;
};
Polymino.prototype.lineClear = function(board) {
    var block = this.getBlock();
    var newBoard = copyDimensionalArray(board);

    var lines = [];
    for (var i = 0; i < block.length; i++) {
        var selector = 0;
        var j = 0;
        do {
            selector = block[i][j];
            j++;
        } while (j < block[i].length && selector === 0);
        lines.push(selector);
    }

    for (var i = 0; i < lines.length; i++) {
        if (lines[i] === 1) {
            var j = 0;
            while (j < board[0].length && board[this.y+i][j]>=2) {
                j++;
            }
            if (j === board[0].length) {
                newBoard.splice(this.y+i,1);
                newBoard.unshift(new1DArray(board[0].length,0));
            }
        }
    }
    return newBoard;
};

var blockColors;
var canvasPadding = 40;
var canvasSize;

function setup() {
    canvasSize = Math.max(400, Math.min(window.innerWidth, window.innerHeight) - canvasPadding);
    var canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent('sketch-wrapper');

    window.addEventListener('resize', function() {
        canvasSize = Math.max(400, Math.min(window.innerWidth, window.innerHeight) - canvasPadding);
        resizeCanvas(canvasSize, canvasSize);
    }, true);

    blockColors = [
        color(32),              //  0: Blank - Grey
        color(64),              //  1: Ghost - Light Grey

        color(128,255,255),     //  2: I - Light Cyan
        color(64,255,255),      //  3: Cyan

        color(255,224,128),     //  4: U - Light Yellow
        color(255,192,64),      //  5: V - Yellow
        color(255,160,32),      //  6: W - Dark Yellow

        color(255,128,255),     //  7: Y - Light Purple
        color(255,64,255),      //  8: T - Purple
        color(128,32,128),      //  9: K - Dark Purple
        color(64,16,64),         // 10: X - Darkest Purple

        color(255,160,128),     // 11: L - Light Orange
        color(255,128,64),      // 12: Z - Orange
        color(128,64,32),       // 13: R - Dark Orange

        color(128,128,255),     // 14: J - Light Blue
        color(64,64,255),       // 15: S - Blue
        color(32,32,128),       // 16: F - Dark Blue

        color(128,255,128),     // 17: Q - Light Green
        color(64,255,64),       // 18: _ - Green
        color(32,128,32),       // 19: N - Dark Green

        color(255,128,128),     // 20: P - Light Red
        color(255,64,64),       // 21: _ - Red
        color(128,32,32)        // 22: H - Dark Red
    ];
};

/*
var tetris = [
    new Polymino({
        Spawn: coords(4,1),
        Block: [
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ]
        ],
        Offsets: [
            [
                [0,0],
            ],
            [
                [0,0],
            ],
            [
                [0,0],
            ],
            [
                [0,0],
            ]
        ],

        ColorIndex: 5
    }),
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [0,0,1],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,0],
                [0,1,1]
            ],
            [
                [0,0,0],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,0],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 12
    }),
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [1,0,0],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,1],
                [0,1,0],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1,0],
                [0,1,0],
                [1,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 15
    }),
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [0,1,0],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,0],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 8
    }),
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [0,1,1],
                [1,1,0],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,0,1]
            ],
            [
                [0,0,0],
                [0,1,1],
                [1,1,0]
            ],
            [
                [1,0,0],
                [1,1,0],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 18
    }),
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [1,1,0],
                [0,1,1],
                [0,0,0]
            ],
            [
                [0,0,1],
                [0,1,1],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,0],
                [0,1,1]
            ],
            [
                [0,1,0],
                [1,1,0],
                [1,0,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 21
    }),
    new Polymino({
        Spawn: coords(2,0),
        Block: [
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,1,1,1,1],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [1,1,1,1,0],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,0,0,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [-1,0],
                [0,0],
                [0,0],
                [0,1],
                [0,-2]
            ],
            [
                [-1,1],
                [1,1],
                [-2,1],
                [1,0],
                [-2,0]
            ],
            [
                [0,1],
                [0,1],
                [0,1],
                [0,-1],
                [0,2]
            ]
        ],

        ColorIndex: 3
    })
];
*/

var pentris = [
    new Polymino({
        Spawn: coords(3,0),
        Block: [
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [1,1,1,1,1],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0]
            ],
            [
                [0,0,0,0,0],
                [0,0,0,0,0],
                [1,1,1,1,1],
                [0,0,0,0,0],
                [0,0,0,0,0]
            ],
            [
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,1],
                [-1,1],
                [2,2],
                [-2,-2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,1],
                [1,1],
                [-2,2],
                [2,-2]
            ]
        ],

        ColorIndex: 2
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [1,0,0,0],
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,1,1,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0]
            ],
            [
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,1],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,0,1,0],
                [0,0,1,0],
                [0,1,1,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 14
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [0,0,0,1],
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,1,0]
            ],
            [
                [0,0,0,0],
                [1,1,1,1],
                [1,0,0,0],
                [0,0,0,0]
            ],
            [
                [0,1,1,0],
                [0,0,1,0],
                [0,0,1,0],
                [0,0,1,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 11
    }),

    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [1,1,0,0],
                [0,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,1,1,0],
                [0,1,0,0],
                [0,1,0,0]
            ],
            [
                [0,0,0,0],
                [1,1,1,0],
                [0,0,1,1],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,0,1,0],
                [0,1,1,0],
                [0,1,0,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 22
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [0,0,1,1],
                [1,1,1,0],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,0,0],
                [0,1,1,0],
                [0,0,1,0]
            ],
            [
                [0,0,0,0],
                [0,1,1,1],
                [1,1,0,0],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,1,0],
                [0,0,1,0],
                [0,0,1,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 19
    }),

    new Polymino({
        Spawn: coords(4,1),
        Block: [
            [
                [1,0,1],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,1],
                [0,1,0],
                [0,1,1]
            ],
            [
                [0,0,0],
                [1,1,1],
                [1,0,1]
            ],
            [
                [1,1,0],
                [0,1,0],
                [1,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 4
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,1],
                [0,0,1],
                [1,1,1]
            ],
            [
                [1,0,0],
                [1,0,0],
                [1,1,1]
            ],
            [
                [1,1,1],
                [1,0,0],
                [1,0,0]
            ],
            [
                [1,1,1],
                [0,0,1],
                [0,0,1]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 5
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,1],
                [0,1,1],
                [1,1,0]
            ],
            [
                [1,0,0],
                [1,1,0],
                [0,1,1]
            ],
            [
                [0,1,1],
                [1,1,0],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,1],
                [0,0,1]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 6
    }),

    new Polymino({
        Spawn: coords(4,1),
        Block: [
            [
                [0,1,1],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,0],
                [0,1,1],
                [0,1,1]
            ],
            [
                [0,0,0],
                [1,1,1],
                [1,1,0]
            ],
            [
                [1,1,0],
                [1,1,0],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 17
    }),
    new Polymino({
        Spawn: coords(4,1),
        Block: [
            [
                [1,1,0],
                [1,1,1],
                [0,0,0]
            ],
            [
                [0,1,1],
                [0,1,1],
                [0,1,0]
            ],
            [
                [0,0,0],
                [1,1,1],
                [0,1,1]
            ],
            [
                [0,1,0],
                [1,1,0],
                [1,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 20
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [1,0,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,1],
                [1,1,0],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1,0],
                [0,1,1],
                [1,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 16
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,1],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,0],
                [0,1,1]
            ],
            [
                [0,1,0],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,1],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 13
    }),

    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [1,0,0],
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1,1],
                [0,1,0],
                [1,1,0]
            ],
            [
                [1,0,0],
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1,1],
                [0,1,0],
                [1,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 15
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,1],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,0],
                [0,1,1]
            ],
            [
                [0,0,1],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,0],
                [0,1,0],
                [0,1,1]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 12
    }),

    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,1,0],
                [0,1,0],
                [1,1,1]
            ],
            [
                [1,0,0],
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1,1],
                [0,1,0],
                [0,1,0]
            ],
            [
                [0,0,1],
                [1,1,1],
                [0,0,1]
            ]
        ],
        Offsets: [
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [1,0],
                [1,-1],
                [0,2],
                [1,2]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,0],
                [0,0]
            ],
            [
                [0,0],
                [-1,0],
                [-1,-1],
                [0,2],
                [-1,2]
            ]
        ],

        ColorIndex: 8
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [0,0,1,0],
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,0,0],
                [0,1,1,0],
                [0,1,0,0]
            ],
            [
                [0,0,0,0],
                [1,1,1,1],
                [0,1,0,0],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,1,1,0],
                [0,0,1,0],
                [0,0,1,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 7
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,0,0,0],
                [0,1,0,0],
                [1,1,1,1],
                [0,0,0,0]
            ],
            [
                [0,1,0,0],
                [0,1,1,0],
                [0,1,0,0],
                [0,1,0,0]
            ],
            [
                [0,0,0,0],
                [1,1,1,1],
                [0,0,1,0],
                [0,0,0,0]
            ],
            [
                [0,0,1,0],
                [0,0,1,0],
                [0,1,1,0],
                [0,0,1,0],
            ]
        ],
        Offsets: [
            [
                [0,0],
                [2,0],
                [-1,0],
                [2,-1],
                [-1,-1]
            ],
            [
                [0,0],
                [0,0],
                [0,0],
                [0,-2],
                [0,1]
            ],
            [
                [0,0],
                [-1,0],
                [2,0],
                [-1,0],
                [2,0]
            ],
            [
                [0,0],
                [1,0],
                [1,0],
                [1,1],
                [1,-2]
            ]
        ],

        ColorIndex: 9
    }),
    new Polymino({
        Spawn: coords(4,0),
        Block: [
            [
                [0,1,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1,0],
                [1,1,1],
                [0,1,0]
            ]
        ],
        Offsets: [
            [
                [0,0]
            ],
            [
                [0,0]
            ],
            [
                [0,0]
            ],
            [
                [0,0]
            ]
        ],

        ColorIndex: 10
    }),
];

var blocks = pentris;

var above = 3;
var bWidth = 12;
var bHeight = 24;
var board = new2DArray(bHeight+above,bWidth,0);
/*var board = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,5,0,0,0,0,0,0,0,0],
    [1,7,0,5,0,6,6,6,0,0,0,0],
    [1,7,7,5,5,3,6,4,0,0,0,0],
    [1,7,2,5,2,3,6,4,4,0,0,0],
    [1,7,2,2,2,3,3,3,4,4,0,0]
];*/

var queueLength = 5;

var bag = randIntNoRep(blocks.length);
var cp = blocks[bag.shift()].get();
var queue = bag.splice(0,queueLength);
var hold = null;
var ghost;

var canHold = true;
var cdTimer = 0;

var keysPrev = [];
var keysDown = [];
var keysPressed = [];
var keysReleased = [];
var keysTimer = [];

var softDropTime = 2;
var dropTime = 60;
var timer = dropTime;
var lockDelay = 30;
var lockDelayTimer = 0;
var DAS = 12;
var ARR = 3;
var place = false;
var next = false;

var begin = true;
var paused = false;
var end = false;


var inCircle = function(x, y, cx, cy, r) {
    var dx = Math.abs(cx - x);
    var dy = Math.abs(cy - y);
    return dx*dx + dy*dy < r*r;
};

var drawPlay = function(x, y, s) {
    // Icon SVG by fontawesome
    // ---
    // Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com
    // License - https://fontawesome.com/license (Commercial License)
    // Copyright 2023 Fonticons, Inc.
    // ---

    var w = 384;
    var h = 512;

    push();
    translate(x, y);
    scale(s, s);
    translate(28-w/2, -h/2);

    // Code generated from SVG using svg2p5 - https://svg2p5.com
    strokeCap(PROJECT);
    strokeJoin(MITER);
    beginShape();
    vertex(73,39);
    bezierVertex(58.2,29.9,39.6,29.6,24.5,38.1);
    bezierVertex(9.399999999999999,46.6,0,62.6,0,80);
    vertex(0,432);
    bezierVertex(0,449.4,9.4,465.4,24.5,473.9);
    bezierVertex(39.6,482.4,58.2,482,73,473);
    vertex(361,297);
    bezierVertex(375.3,288.3,384,272.8,384,256);
    bezierVertex(384,239.2,375.3,223.8,361,215);
    vertex(73,39);
    endShape();

    pop();
};

var drawPause = function(x, y, s) {
    // Icon SVG by fontawesome
    // ---
    // Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com
    // License - https://fontawesome.com/license (Commercial License)
    // Copyright 2023 Fonticons, Inc.
    // ---

    var w = 320;
    var h = 512;

    push();
    translate(x, y);
    scale(s, s);
    translate(-w/2, -h/2);

    // Code generated from SVG using svg2p5 - https://svg2p5.com
    strokeCap(PROJECT);
    strokeJoin(MITER);
    beginShape();
    vertex(48,64);
    bezierVertex(21.5,64,0,85.5,0,112);
    vertex(0,400);
    bezierVertex(0,426.5,21.5,448,48,448);
    vertex(80,448);
    bezierVertex(106.5,448,128,426.5,128,400);
    vertex(128,112);
    bezierVertex(128,85.5,106.5,64,80,64);
    vertex(48,64);
    endShape();
    beginShape();
    vertex(240,64);
    bezierVertex(213.5,64,192,85.5,192,112);
    vertex(192,400);
    bezierVertex(192,426.5,213.5,448,240,448);
    vertex(272,448);
    bezierVertex(298.5,448,320,426.5,320,400);
    vertex(320,112);
    bezierVertex(320,85.5,298.5,64,272,64);
    vertex(240,64);
    endShape();

    pop();
};

var drawArrowRotateLeft = function(x, y, s) {
    // Icon SVG by fontawesome
    // ---
    // Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com
    // License - https://fontawesome.com/license (Commercial License)
    // Copyright 2023 Fonticons, Inc.
    // ---

    var w = 512;
    var h = 512;

    push();
    translate(x, y);
    scale(s, s);
    translate(-w/2, -h/2);

    // Code generated from SVG using svg2p5 - https://svg2p5.com
    strokeCap(PROJECT);
    strokeJoin(MITER);
    beginShape();
    vertex(125.7,160);
    vertex(176,160);
    bezierVertex(193.7,160,208,174.3,208,192);
    bezierVertex(208,209.7,193.7,224,176,224);
    vertex(48,224);
    bezierVertex(30.3,224,16,209.7,16,192);
    vertex(16,64);
    bezierVertex(16,46.3,30.3,32,48,32);
    bezierVertex(65.7,32,80,46.3,80,64);
    vertex(80,115.2);
    vertex(97.6,97.6);
    bezierVertex(185.1,10.099999999999994,326.9,10.099999999999994,414.4,97.6);
    bezierVertex(501.9,185.1,501.9,326.9,414.4,414.4);
    bezierVertex(326.9,501.9,185.09999999999997,501.9,97.59999999999997,414.4);
    bezierVertex(85.09999999999997,401.9,85.09999999999997,381.59999999999997,97.59999999999997,369.09999999999997);
    bezierVertex(110.09999999999997,356.59999999999997,130.39999999999998,356.59999999999997,142.89999999999998,369.09999999999997);
    bezierVertex(205.39999999999998,431.59999999999997,306.7,431.59999999999997,369.2,369.09999999999997);
    bezierVertex(431.7,306.59999999999997,431.7,205.29999999999995,369.2,142.79999999999995);
    bezierVertex(306.7,80.29999999999995,205.39999999999998,80.29999999999995,142.89999999999998,142.79999999999995);
    vertex(125.7,160);
    endShape();

    pop();
};

var hover = false;

draw = function() {
    background(8);

    for (var i = 0; i < keyMap.length; i++) {
        var key = keyMap[i];
        var keyDown = keys[key];
        var keyDownPrev = keysPrev[key];

        keysDown[i] = keyDown;
        keysPressed[i] = !keyDownPrev&&keyDown;
        keysReleased[i] = keyDownPrev&&!keyDown;
        if (keys[key]) {
            keysTimer[i] +=1;
        } else {
            keysTimer[i] = 0;
        }
    }
    keysPrev = keys.slice();

    var stopped = begin || paused || end;
    if (!stopped) {
        timer += 1;

        if (keysReleased[7]) {
            paused = true;
        }

        if (keysPressed[0]||(keysTimer[0]>DAS&&(keysTimer[0]-DAS)%ARR===0)) {
            keysTimer[1] = 0;
            if (cp.move(-1,0,board)) {
                lockDelayTimer = 0;
                if (!cp.testPos(0,-1,cp.state,board)) {
                    timer = 0;
                }
            }
        }
        if (keysPressed[1]||(keysTimer[1]>DAS&&(keysTimer[1]-DAS)%ARR===0)) {
            keysTimer[0] = 0;
            if (cp.move(1,0,board)) {
                lockDelayTimer = 0;
                if (!cp.testPos(0,-1,cp.state,board)) {
                    timer = 0;
                }
            }
        }
        if (keysPressed[2]) {
            if (cp.rotate((cp.state+3)%4,board)) {
                lockDelayTimer = 0;
            }
        }
        if (keysPressed[3]) {
            if(cp.rotate((cp.state+1)%4,board)) {
                lockDelayTimer = 0;
            }
        }
        if (keysDown[4] && keysTimer[4]>=softDropTime) {
            if (cp.move(0,-1,board)) {
                keysTimer[4] = 0;
                lockDelayTimer = 0;
            }
        }
        if (keysPressed[5]) {
            while (cp.move(0,-1,board)) {}
            place = true;
        }
        if (canHold && keysPressed[6]) {
            var tempVal = cp.get();
            if (!validObject(hold)) {
                next = true;
            } else {
                cp = hold.get();
            }
            hold = tempVal;

            canHold = false;
        }

        if (timer>=dropTime) {
            if (cp.move(0,-1,board)) {
               timer = 0;
               lockDelayTimer = 0;
            }
        }
        if (!cp.testPos(0,-1,cp.state,board)) {lockDelayTimer+=1;}
        if (lockDelayTimer >= lockDelay) {place = true;}

        if (place) {
            board = cp.place(board);
            board = cp.lineClear(board);
            canHold = true;
            place = false;
            next = true;
        }

        if (next) {
            if (bag.length < 1) {
                bag = randIntNoRep(blocks.length);
            }
            queue.push(bag.shift());
            cp = blocks[queue.shift()].get();
            //timer = dropTime;
            lockDelayTimer = 0;
            next = false;

            if (!cp.testPos(0,0,cp.state,board)) {
                end = true;
            }
        }

        ghost = cp.get();
        ghost.x = cp.x;
        ghost.y = cp.y;
        ghost.state = cp.state;
        ghost.colorIndex = 1;
        while (ghost.move(0,-1,board)) {}

    }

    //draw board
    var drawboard = ghost ? ghost.place(board) : board;

    stroke(48,48,48,64);
    drawMatrix(width/4,3*width/4,-above*height/bHeight,height,blockColors,cp.place(drawboard));

    //draw hold
    fill(64);
    rect(width-5,width-5,80,80);

    fill(32);
    rect(0,0,80,80);
    if (validObject(hold)) {
        var hCenterX = 40;
        var hCenterY = 40;
        var hBlock = copyDimensionalArray(hold.getBlock());
        var hWidth = 14*hBlock[0].length;
        var hHeight = 14*hBlock.length;
        noStroke();
        drawMatrix(hCenterX-hWidth/2,hCenterX+hWidth/2,hCenterY-hHeight/2,hCenterY+hHeight/2,[color(255,255,255,0),blockColors[hold.colorIndex]],hBlock);
    }

    //draw queue
    for (var i = 0; i < queue.length; i++) {
        stroke(16);
        if (i === 0) {
            fill(64);
        } else {
            fill(16);
        }
        rect(width-80,80*i,80,80);

        var qCenterX = width-40;
        var qCenterY = 80*i+40;
        var qBlock = copyDimensionalArray(blocks[queue[i]].blockData[0]);
        var qWidth = 14*qBlock[0].length;
        var qHeight = 14*qBlock.length;
        noStroke();
        drawMatrix(qCenterX-qWidth/2,qCenterX+qWidth/2,qCenterY-qHeight/2,qCenterY+qHeight/2,[color(255,0,255,0),blockColors[blocks[queue[i]].colorIndex]],qBlock);
    }

    if (stopped) {
        background(8, 8, 8, 128);

        var PLAY = 1;
        var PAUSE = 2;
        var ARROW_ROTATE_LEFT = 3;

        var iconHighlight = hover || keysDown[8] || (paused && keysDown[7]);

        var icon;
        if (begin) {
            icon = PLAY;
        } else if (end) {
            icon = ARROW_ROTATE_LEFT;
        } else if (paused) {
            icon = PAUSE;
        }

        if (icon) {

            var drawIcon;
            var iconRadius;
            switch(icon) {
                case PLAY:
                    drawIcon = drawPlay;
                    iconRadius = 256;
                    break;
                case PAUSE:
                    drawIcon = drawPause;
                    iconRadius = 240;
                    break;
                case ARROW_ROTATE_LEFT:
                    drawIcon = drawArrowRotateLeft;
                    iconRadius = 320;
                    break;
            }

            var iconColor;
            var iconScale;
            if (iconHighlight) {
                iconColor = color(255, 255, 255, 192);
                iconScale = 0.8;
            } else {
                iconColor = color(255, 255, 255, 128);
                iconScale = 0.7;
            }

            var iconBase = canvasSize / 756;
            var iconSize = iconBase * iconScale;
            hover = inCircle(mouseX, mouseY, width/2, height/2, iconRadius*iconSize);
            if (hover) {
                cursor(HAND);
            } else {
                cursor(ARROW);
            }

            noStroke();
            fill(iconColor);
            //circle(width/2, height/2, 2*iconRadius*iconSize);
            drawIcon(width/2, height/2, iconSize);

            if ((hover && mouseTapped) || keysReleased[8] || (paused && keysReleased[7])) {
                if (end) {
                    end = false;
                    board = new2DArray(bHeight+above,bWidth,0);
                    bag = randIntNoRep(blocks.length);
                    cp = blocks[bag.shift()].get();
                    queue = bag.splice(0,queueLength);
                    hold = null;
                    place = false;
                    next = false;
                }
                begin = false;
                paused = false;
                hover = false;
                cursor(ARROW);
            }
        }
    }

    mouseTapped = false;
};
