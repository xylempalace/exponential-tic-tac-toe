class Board {
    board = [];
    rows;
    columns;

    constructor(r, c) {
        this.rows = r;
        this.columns = c;

        for (var i = 0; i < r; i++) {
            var emptyRow = [];
            for (var j = 0; j < c; j++) {
                emptyRow.push(null);
            }
            this.board.push(emptyRow);
        }
    }

    get(pos) {
        return this.board[pos.y][pos.x];
    }

    getRow(pos, right) {
        if (right) {
            return this.board[pos.y].slice(pos.x, this.board[pos.y].length);
        } else {
            return this.board[pos.y].slice(0, pos.x + 1).reverse();
        }
    }

    getColumn(pos, down) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result.push(this.board[i][pos.x]);
        }
        if (down) {
            return result.slice(pos.y, result.length);
        } else {
            return result.slice(0, pos.y + 1).reverse();
        }
    }

    getDiagonal(pos, x, y) {
        var result = [];
        var j = pos.x;
        for (var i = pos.y; i < this.rows && i >= 0; i += y) {
            if (j < this.columns && j >= 0) {
                result.push(this.get(new Vector2(j, i)));
            }
            j += x;
        }
        return result;
    }

    set(pos, obj) {
        this.board[pos.y][pos.x] = obj;
    }

    setPos(pos, obj, condition) {
        if (condition(this.get(pos))) {
            this.set(pos, obj);
        }
    }

    move(fromPos, toPos, condition) {
        if (condition(this.get(fromPos), this.get(toPos))) {
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, null);
        }
    }

    swap(fromPos, toPos, condition) {
        if (condition(this.get(fromPos), this.get(toPos))) {
            var temp = this.get(toPos);
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, temp);
        }
    }

    setRow(row, objs, condition) {
        for (var i = 0; i < this.columns; i++) {
            if (condition(this.get(new Vector2(i, row)))) {
                this.set(new Vector2(i, row), objs[i % objs.length]);
            }
        }
    }

    setColumn(column, objs, condition) {
        for (var i = 0; i < this.rows; i++) {
            if (condition(this.get(new Vector2(column, i)))) {
                this.set(new Vector2(column, i), objs[i % objs.length]);
            }
        }
    }
}

class Piece {
    value;

    constructor(value) {
        this.value = value;
    }
}

class Deck {
    cards = [];
    cardTypes = [];

    constructor(cards, hand = false) {
        if (hand) {
            this.cards = cards;
        } else {
            this.cardTypes = cards;
            for (var i = 0; i < this.cardTypes.length; i++) {
                for (var j = 0; j < this.cardTypes[i].amountInDeck; i++) {
                    this.cards.push(this.cardTypes[i]);
                }
            }
            this.shuffle();
        }
    }

    shuffle() {
        newDeck = [];
        while (this.cards.length > 0) {
            var i = Math.floor(Math.random()) * this.cards.length;
            newDeck.push(this.cards[i]);
            delete this.cards[i];
        }
        this.cards = newDeck;
    }

    draw() {
        returnCard = this.cards[0];
        delete this.cards[0];
        return returnCard;
    }
}

class Card {
    value;
    amountInDeck;

    constructor(value, amountInDeck) {
        this.value = value;
        this.amountInDeck = amountInDeck;
    }
}

class Game {
    maxPlayers;
    players;
    minPlayers;
    gameBoard;
    deck;
    turn = 0;

    constructor(maxPlayers, minPlayers, board) {
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.gameBoard = board;
    }

    startGame(players) {
        this.players = players;
    }

    switchTurn() {
        turn++;
        turn %= this.players;
    }

    testWin(rules) {
        return rules(this.board, this.players, this.turn);
    }
}

class GameProp extends Prop {
    interactionRange;
    game;

    constructor(sprite, pos, offset, size, interactionRange, game) {
        super(sprite, pos, offset, size);

        this.interactionRange = interactionRange;
        this.game = game;
    }

    interactPrompt(pos) {
        var display = distance(pos.x, this.pos.x + this.drawOffset.x, pos.y, this.pos.y + this.drawOffset.y) <= this.interactionRange;
        if (display) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = "white";
            ctx.fillRect(this.pos.screenPos.x + this.drawOffset.x + (-175 * activeCamera.zoom), this.pos.screenPos.y + this.drawOffset.y + (30 * activeCamera.zoom), 350 , 40)
            ctx.fillStyle = "black";
            ctx.fillText("PRESS SPACE TO PLAY", this.pos.screenPos.x + this.drawOffset.x, this.pos.screenPos.y + this.drawOffset.y + (60 * activeCamera.zoom));
            ctx.restore();
        }
        return display;
    }
}