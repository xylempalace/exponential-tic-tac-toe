const textInputs = [];
const log = document.getElementById("values");
let gameCanvas;
let connected = false;
let typingUsername = "";
let userMessage = "";
let username = "";
let userPlayer;

class TextInput {
    
	textInput;
	textButton;
	textDiv;
	sendFunction;
    static textInputs = [];

    constructor(div, placeholder, func, hasButton, reqConnection) {
		this.sendFunction = func;
        
        this.textDiv = div;
        this.textDiv.setAttribute("class", "inputDiv");
        
        this.textInput = document.createElement("input");
        this.textInput.setAttribute("placeholder", placeholder);
        this.textInput.setAttribute("class", "inputText");
		this.textInput.addEventListener("keyup", () => {this.updateText(event)});

        this.textDiv.append(this.textInput);
        
        if (hasButton) {
            this.textButton = document.createElement("button");
            this.textButton.setAttribute("class", "inputButton");
			this.textButton.addEventListener("click", () => {this.sendText()});

            this.textButton.textContent = "🠊";
            this.textDiv.append(this.textButton);
        }
        
        this.constructor.textInputs.push(this);
    }

	updateText(e) {
		if (e.key=="Enter") {
			this.sendText();
		}
	}

	sendText() {
        console.log("send");
		if (this.textInput.value.length > 0) {
			eval(this.sendFunction+"(this.textInput.value, this)");
		}
	}

	clearTextbox() {
		this.textInput.value = "";
	}

    setDisabled(state) {
        if (state) {
            this.textInput.setAttribute("disabled", true);
            this.textButton.setAttribute("disabled", true);
        } else {
            this.textInput.removeAttribute("disabled");
            this.textButton.removeAttribute("disabled");
        }
    }

    static findInputByID(id) {
        return textInputs.find((element) => element.textDiv.getAttribute("id")==id);
    }
}

class Player {

    static playerSizeX = 100;
    static playerSizeY = 100;
    posX;
    posY;
    speechBubbles = [];

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }

    sayMessage(message) {
        var newBubble = new SpeechBubble(message);
		this.speechBubbles.push(newBubble);
    }

    drawSpeechBubbles(cnv) {
        var curBubble;
        for (let i = 0; i < this.speechBubbles.length; i++) {

            curBubble = this.speechBubbles[i];
            if (curBubble.isOld) {
                this.speechBubbles.splice(i,i);
            } else {

                //Centering the bubble and making sure the bubbles aren't on top of eachother
                var bubbleCenterX = this.posX+(this.constructor.playerSizeX/2);
                var bubbleCenterY = this.posY-((this.constructor.playerSizeY*0.25)*(i+1));

                curBubble.drawBubble(cnv, bubbleCenterX, bubbleCenterY);

            }
        }
    }

    drawPlayer(cnv) {
        var ctx = cnv.getContext("2d");
        ctx.fillRect(this.posX, this.posY, this.constructor.playerSizeX, this.constructor.playerSizeY);
    }
}

class SpeechBubble {
    static font = "30px Arial";
    static lifeTime = 200;
    message;
    spawnTime;
    deathTime;

    constructor (message) {
        this.message = message;
        this.spawnTime = Date.now();
        this.deathTime = this.spawnTime+this.constructor.lifeTime;
    }

    isOld() {
        return (Date.now() > this.deathTime);
    }

    drawBubble(cnv, posX, posY) {
        var ctx = cnv.getContext("2d");
        ctx.textAlign = 'center';
        ctx.font = this.speechBubbles.constructor.font;
        
        ctx.fillText(this.message, bubbleCenterX, bubbleCenterY);
    }
}

document.addEventListener("readystatechange", (e) => {
    if (e.target.readyState === "complete") {
        const foundInputs = document.getElementsByClassName("inputDiv");
        for (let i = 0; i < foundInputs.length; i++) {
			let tI = new TextInput(
                foundInputs[i],
                foundInputs[i].getAttribute("placeholder"),
                foundInputs[i].getAttribute("func"),
                foundInputs[i].getAttribute("hasButton"),
                foundInputs[i].getAttribute("reqConnection")
            );
            textInputs.push(tI);
        }

        let chatInput = TextInput.findInputByID("chatInput");
        chatInput.setDisabled(true);
		
		addCanvas();
		drawText(100, 100, "Connecting...");
    }

});

function connect() {
    userPlayer = new Player(250, 250);
    startAnimating();
    connected = true;
}

function sendMessage(msg, textbox) {
    if (msg.length > 0) {
        log.textContent += username+" "+msg+"\n";
        textbox.clearTextbox();
		if (connected) {
			userPlayer.sayMessage(gameCanvas, msg);
		}
    }
}

function printMessage(msg) {
    log.textContent += msg+"\n";
}

function recieveMessage(msg) {
    log.textContent += msg+"\n";
}

function updateUser(e) {
    if (e.key=="Enter") {
        setUser();
    }
    typingUsername = e.target.value;
}

function setUser(usr, textbox) {
    if (!connected) {
        if (usr.length > 0) {
            username = "<"+usr+">";
            recieveMessage("Username set to "+username);
            textbox.setDisabled(true);
            TextInput.findInputByID("chatInput").setDisabled(false);
            
            connect();
        }
    }
}

function addCanvas() {
    var canvas = document.createElement('canvas');
    canvas.id     = "gameCanvas";
    canvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
    canvas.height = document.getElementById('gameSpace').clientHeight;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";
    canvas.style.borderColor = "black";
    gameCanvas = canvas;
    document.getElementById("gameSpace").appendChild(canvas);
}

function drawText(x, y, msg) {
	var c = document.getElementById("gameCanvas");
    var ctx = c.getContext("2d");
    ctx.font = "30px Arial";
    ctx.fillText(msg, x, y);
}

function startAnimating() {
    startTime = Date.now(); 
    console.log(startTime); 
    drawScreen();
}

function drawScreen() {
    setTimeout(() => { 
        requestAnimationFrame(drawScreen);

        var c = document.getElementById("gameCanvas");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        userPlayer.drawPlayer(gameCanvas);
        userPlayer.drawSpeechBubbles(gameCanvas);
    }, 500);
}