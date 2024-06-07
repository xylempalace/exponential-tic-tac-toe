function createConnect4(){
    var gameBoard = new Board(6,7);
for (var i = 0; i < 6; i++){
    gameBoard.setRow(i, [new Piece(0)], () => true);
}

function moveCondition(inSpot, turn){
return inSpot.value === 0 && Resources.order === turn;

} 
//return -1 if no winner found
// return 0 if red wins
//return 1 if yellow wins
//return 2 if tie

/*
1. Check if lastMove is null.
2. Check win from pos of lastMove, keep track if 0 is found.
3. Return who wins if someone does.
4. If 0 found, return -1, if not then return check entire gameboard for 0, if none found return 2.
*/

const winCondition = (gameBoard, turn, lastMove) => {
    if (lastMove === null) {
        return -1;
    }
   
    const checkFor4 = (arr) => {
        var count = 0;
        for (var i = 0; i < arr.length;i++){
            console.log(arr[i]);
            if (count === 0) {
                count++;
                
            } else if(i > 0){
                if(arr[i].value === arr[i-1].value){
                    count++;
                }
                else{
                    count = 1;
                }
            } 
            
            if(count === 4){
                return arr[i].value;
                console.log("Winner found!");
            }
        }
        return null;
    }


    console.log("Last Move: " + lastMove.y);
    let checkStart = new Vector2(lastMove.x, lastMove.y - 3);
    
    //MovedBy keeps track how much you go outside of the board.
    let movedBy = 0;

    let col = gameBoard.getColumn(checkStart, true);
    if(checkStart.y < 0){
        movedBy = checkStart.y;
        checkStart.y = 0;
    }

    if (movedBy > 0) {
        col.slice(0, 7 + movedBy);
    }


 
    console.log(col);
    let winner = checkFor4(col);

if (winner !== null){
    return winner -1; 

}
return -1; 
//Checkrow for 4 in a row. 
/*
checkStart = new Vector2(lastMove.x - 3, lastMove.y);
 movedBy= 0;
if(checkStart.y < 0){
    movedBy = 3 + checkStart.y;
    checkStart.x = 0;
}



winner = checkFor4(gameBoard.getColumn(checkStart, true));

if (winner !== null){
return winner -1; 

}




    return -1;
}

*/

}

const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var width = dimensions.x * activeCamera.zoom;
    var height = dimensions.y * activeCamera.zoom;
    var origin = new Vector2(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2)
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];
    var lastMove;

// In gameBoard, 1 is red and 2 is yellow. 
    for (var i = 0; i < 7; i++){
        let b = new Button(new Vector2(center.x + (-150 + i* 50)*activeCamera.zoom, center.y + -220 * activeCamera.zoom),40, 450, "#FFB6C1","",0,3,3,null, (a, b, obj, game, index) => {
            
            if(game.winner === -1){
            
            
            
            let col = game.gameBoard.getColumn(new Vector2(index, 6), false);
            let count = 0;


           while (col[count].value !== 0){
                count++;
            }

            let pos = new Vector2(index, 5-count);
            game.gameBoard.setPos(pos, new Piece(game.turn === 0 ? 1 : 2),game.rules[1], game.turn);
            if (game.gameBoard.get(pos).value !== 0 && game.gameBoard.get(pos).value === (game.turn === 0 ? 1: 2)) {
                game.switchTurn(Resources.playerNum);
                game.lastMove = pos;
                game.testWin();
                Resources.ws.send(JSON.stringify({
                    gameMove: [pos.x,pos.y,game.gameBoard.get(pos).value],
                    id: userPlayer.username,
                    roomID: Resources.currentRoomID
                }));
            }
        } 
        });
    
        buttons.push(b);    
    } 
    const displayBoard = (windowState, game) => {
        for (var i = 0 ; i < game.buttons.length; i++) {
            game.buttons[i].draw(windowState, game.minPlayers); 
         }
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.fillRect(center.x -180 * activeCamera.zoom, center.y - 140 * activeCamera.zoom, 550,450);
        for(var x = 0; x < 7; x++){
            for( var y = 0; y < 6; y++){
                if (gameBoard.get(new Vector2(x,y)).value === 0) {
                    ctx.fillStyle = "white";
                } else if(gameBoard.get(new Vector2(x,y)).value === 1) {
                    ctx.fillStyle = "red";
                }

                else{
             
                    ctx.fillStyle = "yellow";
                }
                ctx.beginPath();
                ctx.moveTo(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5);
                ctx.arc(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5, 20    , 0, 2* Math.PI, false);
                ctx.fill();
            }
        }        
    }




const processMove = (move,obj) => {
    let val = new Piece;
    val.value = move[2] 
obj.gameBoard.set(new Vector2(move[0],move[1]),val);
obj.switchTurn(Resources.playerNum);
obj.lastMove = new Vector2(move[0],move[1]);
obj.testWin();

}

    const winText = (win,origin, width) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(origin.x + width / 2 - 75 * activeCamera.zoom, origin.y + (200 - 28) * activeCamera.zoom, 150 * activeCamera.zoom, 40 * activeCamera.zoom);
        ctx.fillStyle = "black";
        ctx.font = `${25 * activeCamera.zoom}px Arial`;
        console.log("Win is from winText: " + win);
        ctx.fillText((win === 2 ? "Tie" : (win === 0 ? "Red wins" : "Yellow wins")), origin.x + width / 2, origin.y + 200 * activeCamera.zoom);
    }


return new Game("Connect Four", 2, 2, gameBoard, new Vector2(800, 400), [winCondition, moveCondition], buttons, processMove,displayBoard,winText);

}
