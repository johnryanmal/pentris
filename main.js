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
 */
var keyMap = [37,39,65,68,40,32,38,80];


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
        newArray[i] = insideArray;
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
    return(newBoard);
};

var blockColors;
var canvasPadding = 40;
var canvasSize;

function setup() {
  canvasSize = Math.min(window.innerWidth, window.innerHeight) - canvasPadding;
  var canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('sketch-wrapper');

  window.addEventListener('resize', function() {
    canvasSize = Math.min(window.innerWidth, window.innerHeight) - canvasPadding;
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
var keysPressed = [];
var keysTimer = [];
keysTimer.fill(0);

var softDropTime = 2;
var dropTime = 60;
var timer = dropTime;
var lockDelay = 30;
var lockDelayTimer = 0;
var DAS = 12;
var ARR = 3;
var place = false;
var next = false;

var paused = false;
var end = false;

draw = function() {
    
    for (var i = 0; i < keys.length; i++) {
        keysPressed[i] = !keysPrev[i]&&keys[i];
        if (keys[i]) {
            keysTimer[i] +=1;
        } else {
            keysTimer[i] = 0;
        }
    }
    keysPrev = keys.slice();
    
    if (keysPressed[keyMap[7]]) {
        paused = !paused;
    }
    
    if (!(paused||end)) {
        background(8);
        timer += 1;
        
        if (keysPressed[keyMap[0]]||(keysTimer[keyMap[0]]>DAS&&(keysTimer[keyMap[0]]-DAS)%ARR===0)) {
            keysTimer[[keyMap[1]]] = 0;
            if (cp.move(-1,0,board)) {
                lockDelayTimer = 0;
                if (!cp.testPos(0,-1,cp.state,board)) {
                    timer = 0;
                }
            }
        }
        if (keysPressed[keyMap[1]]||(keysTimer[keyMap[1]]>DAS&&(keysTimer[keyMap[1]]-DAS)%ARR===0)) {
            keysTimer[keyMap[0]] = 0;
            if (cp.move(1,0,board)) {
                lockDelayTimer = 0;
                if (!cp.testPos(0,-1,cp.state,board)) {
                    timer = 0;
                }
            }
        }
        if (keysPressed[keyMap[2]]) {
            if (cp.rotate((cp.state+3)%4,board)) {
                lockDelayTimer = 0;
            }
        }
        if (keysPressed[keyMap[3]]) {
            if(cp.rotate((cp.state+1)%4,board)) {
                lockDelayTimer = 0;
            }
        }
        if (keys[keyMap[4]] && keysTimer[keyMap[4]]>=softDropTime) {
            if (cp.move(0,-1,board)) {
                keysTimer[40] = 0;
                lockDelayTimer = 0;
            }
        }
        if (keysPressed[keyMap[5]]) {
            while (cp.move(0,-1,board)) {}
            place = true;
        }
        if (canHold && keysPressed[keyMap[6]]) {
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
            board  = cp.lineClear(board);
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
        
        stroke(48,48,48,64);
        drawMatrix(width/4,3*width/4,-above*height/bHeight,height,blockColors,cp.place(ghost.place(board)));
        
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
        
        
        if (end) {
            background(8, 8, 8, 128);
            /*
            fill(255);
            var msg = "You Lost.";
            textSize(Math.floor(canvasSize/20))
            text(msg, (width-textWidth(msg))/2, (height-textAscent())/2);
            */
        }
        
        
    }
};
