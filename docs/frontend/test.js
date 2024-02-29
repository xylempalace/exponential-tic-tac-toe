//Text info
const textInputs = [];
const log = document.getElementById("values");
let isDark = false;

//Client information
let connected = false;
let userPlayer;
let otherPlayers = [];

// WebSocket Stuff
const webSocket = new WebSocket('ws://localhost:443/');

webSocket.onmessage = (event) => {
    var obj = JSON.parse(event.data);

    if ("msg" in obj) {
        receiveMessage(obj.msg);
    } else if ("posX" in obj && userPlayer.username != obj.id) {
        let p = otherPlayers.find((element) => {
            console.log(`${element.username}    obj id: ${obj.id}    Equal: ${element.username == obj.id}`);
            return element.username == obj.id;
        })
        console.log(p);

        if (p != null) {
            p.pos.x = obj.posX;
            p.pos.y = obj.posY; 
        } else {
            otherPlayers.push(new Player(obj.id, new Vector2(obj.posX, obj.posY), obj.id, "#FF0000"));
        }
    }
};
webSocket.addEventListener("open", () => {
    console.log("We are connected");
});

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

class World {
    static spawnPos = new Vector2(250, 250);
}

class Cosmetic extends GameObject {
    order;
    halfHeight;
    halfWidth;
    img;
    player;

    constructor(id, image, player) {
        super("COSMET-" + id, player.pos);
        this.img = image;
    }
}

class Player extends GameObject {
    static playerSizeX = 100;
    static playerSizeY = 100;
    static playerMoveSpeed = 15;
    destination = Vector2.zero;
    velX = 0;
    velY = 0;
    username;
    speechBubbles = [];
    color;
    cosmetics = [];

    constructor(id, pos, username, color) {
        super ("PLAYER-"+username, pos);
        this.username = username;
        this.color = color;
    }

    setCosmetics(cosmeticArr) {
        this.cosmetics = cosmeticArr;
    }
    
    warpTo(pos) {
        this.pos = pos;
    }
    
    walkTo(pos) {
        this.destination = pos;
        let angle = Math.atan2(this.destination.y-this.pos.y, this.destination.x-this.pos.x);
        this.velX = Math.cos(angle)*this.constructor.playerMoveSpeed;
        this.velY = Math.sin(angle)*this.constructor.playerMoveSpeed;
    }
    
    update(deltaTime) {
        if (this.velX != 0 && this.velY != 0) {
            let nextX = this.x + (this.velX*deltaTime);
            let nextY = this.y + (this.velY*deltaTime);

            // checks if current location is further than your "destination" 
            if (Math.abs(nextX-this.destination.x) > Math.abs(this.pos.x-this.destination.x)) {
                this.velX = 0;
                this.pos.x = this.destination.x;
            } else {
                this.pos.x = nextX;
            }
            
            if (Math.abs(nextY-this.destination.y) > Math.abs(this.pos.y-this.destination.y)) {
                this.velY = 0;
                this.pos.y = this.destination.y;
            } else {
                this.pos.y = nextY;
            }
        }
    }

    sayMessage(message) {
        var newBubble = new SpeechBubble(message);
        this.speechBubbles.unshift(newBubble);
    }

    drawSpeechBubbles() {
        var curBubble;
        let vertOffset = (this.constructor.playerSizeY * 1.25);
        
        for (let i = 0; i < this.speechBubbles.length; i++) {
            
            curBubble = this.speechBubbles[i];
            if (curBubble.isOld()) {
                this.speechBubbles.splice(i,i);
            } else {

                //Centering the bubble and making sure the bubbles aren't on top of eachother       
                var bubbleCenterX = this.pos.screenPos.x;
                var bubbleCenterY = this.pos.screenPos.y-(vertOffset);

                vertOffset += (curBubble.height);           
                
                curBubble.drawBubble(bubbleCenterX, bubbleCenterY);

            }
        }
    }

    drawPlayer() {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.pos.screenPos.x - (this.constructor.playerSizeX * activeCamera.zoom) / 2, 
            this.pos.screenPos.y - (this.constructor.playerSizeY * activeCamera.zoom) / 2, 
            this.constructor.playerSizeX * activeCamera.zoom, 
            this.constructor.playerSizeY * activeCamera.zoom
        );

        ctx.fillStyle = "#000000";
        ctx.textAlign = 'center';
        ctx.scale *= activeCamera.zoom;
        ctx.font = this.constructor.font;
    
        ctx.fillText("<" + this.username + ">", this.pos.screenPos.x, this.pos.screenPos.y + (this.constructor.playerSizeY * .75 * activeCamera.zoom));

        ctx.restore();
    }
}

class SpeechBubble {
    static font = "30px Arial";
    static fontHeight = 30;
    static lifeTime = 5000;
    static maxWidth = 200;
    message;
    spawnTime;
    deathTime;
    height;

    constructor (message) {
        this.spawnTime = Date.now();
        this.deathTime = this.spawnTime+this.constructor.lifeTime;

        // Checks if textbox is too long for one line, and, if so, breaks up into multiple lines
        if (ctx.measureText(message) < this.constructor.maxWidth) {
            this.message[0] = message;
        } else {
            let words = message.split(" ");
            let lines = [];
            let currentLine = words[0];

            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + " " + word).width;
                if (width < this.constructor.maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }

            lines.push(currentLine);

            this.message = lines;
        }
        
        this.height = this.message.length * this.constructor.fontHeight;
    }

    //Returns true if the bubble is past its expiry time
    isOld() {
        return (Date.now() > this.deathTime);
    }

    // Draws the current bubble object at the given coordinates
    drawBubble(posX, posY) {
        var prevAlign = ctx.textAlign;
        var prevFont = ctx.font;
        ctx.textAlign = 'center';
        ctx.font = this.constructor.font;
    
        for (let i = 0; i < this.message.length; i++) {
            ctx.fillText(this.message[i], posX, posY-(this.constructor.fontHeight*(this.message.length-(1+i))));
        }

        ctx.textAlign = prevAlign;
        ctx.font = prevFont;
    }
}

//Called when the page is finished loading
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

function sendMessage(msg, textbox) {
    if (msg.length > 0) {
        //log.textContent += userPlayer.username+" "+msg+"\n";
        textbox.clearTextbox();
        if (connected) {
            userPlayer.sayMessage(msg);
            webSocket.send(JSON.stringify({
                id: userPlayer.username,
                msg: `${msg}`
            }));
        }
    }
}

function printMessage(msg) {
    log.textContent += msg+"\n";
}

function receiveMessage(msg) {
    log.textContent += msg+"\n";
}

function updateUser(e) {
    if (e.key=="Enter") {
        setUser();
    }
}

function setUser(usr, textbox) {
    if (!connected) {
        if (usr.length > 0) {
            userPlayer = new Player(usr, World.spawnPos, usr, "#FF0000");
            console.log(JSON.stringify({
                id: `${userPlayer.username}`
            }));
            receiveMessage("Username set to "+userPlayer.username);
            cameraList.push(new Camera("playerCam", Vector2.zero, 0));
            activeCamera = cameraList[cameraList.length-1];
            textbox.setDisabled(true);
            TextInput.findInputByID("chatInput").setDisabled(false);
            
            connect();
            startAnimating();
        }
    }
}

function connect() {
    
    otherPlayers.push(new Player("(0, 0)", new Vector2(0, 0), "(0, 0)", "#00FF00"));

    let centerDist = 500;
    otherPlayers.push(new Player("(0, " + centerDist + ")", new Vector2(0, centerDist), "(0, " + centerDist + ")", "#FF0000"));
    otherPlayers.push(new Player("(0, -" + centerDist + ")", new Vector2(0, -centerDist), "(0, -" + centerDist + ")", "#FFFF00"));
    otherPlayers.push(new Player("(" + centerDist + ", 0)", new Vector2(centerDist, 0), "(" + centerDist + ", 0)", "#0000FF"));
    otherPlayers.push(new Player("(-" + centerDist + ", 0)", new Vector2(-centerDist, 0), "(-" + centerDist + ", 0)", "#00FFFF"));
    connected = true;
    serverUpdate();
}

function startAnimating() {
    startTime = Date.now(); 
    drawScreen();
}

function update() {
    activeCamera.follow(userPlayer.pos);

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    userPlayer.drawPlayer(gameCanvas);
    userPlayer.drawSpeechBubbles(gameCanvas);
    userPlayer.update((Date.now()-startTime) / fpms);
    
    otherPlayers.forEach((element) => {
        element.drawPlayer(gameCanvas);
        element.drawSpeechBubbles(gameCanvas);
        element.update((Date.now()-startTime)/fpms);
    });
}

function serverUpdate() {
    setTimeout(() => {
        serverUpdate();
    }, 20);
    webSocket.send(JSON.stringify({
        id: userPlayer.username,
        posX: userPlayer.pos.x,
        posY: userPlayer.pos.y
    }));
}

function rgb(r, g, b){
    return ["rgb(",r,",",g,",",b,")"].join("");
}
    
function ToggleDarkMode() {

    const chatBoxReference = document.getElementById("chatBox");
    if (!isDark) {
        /* enables dark mode flag */
        isDark = !isDark;

        /* changes color of webpage's background */
        document.body.style.background = rgb(54, 54, 54);

    }

    else {
        /* changes color of webpage's background */
        document.body.style.background = "white";

        /* changes color of the chatbox itself */
        chatBoxReference.style.background = "lightgrey";

        /* disables off dark mode */
        isDark = !isDark;
    }
}