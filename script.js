import * as THREE from "three";


/* =====================================================
   PENGATURAN GAME
===================================================== */

const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyc9ixdiGsdEnW950fbqTGQbqG9F28kZYAngQds7kuYYlGUeCELiiBYvsE0UnZuHVDPoA/exec";


/* =====================================================
   LEVEL
===================================================== */

const levels = [

    {
        apple: [15, 3],

        portal: [15, 9],

        walls: [
            [7,2],
            [7,3],
            [7,4],

            [11,7],
            [12,7],
            [13,7]
        ],

        spikes: [
            [9,5],
            [10,5],
            [9,9]
        ]
    },

    {
        apple: [14,2],

        portal: [16,10],

        walls: [
            [5,3],
            [6,3],
            [7,3],

            [10,8],
            [11,8],
            [12,8],

            [3,9]
        ],

        spikes: [
            [8,5],
            [9,5],
            [10,5],
            [14,6]
        ]
    },

    {
        apple: [15,5],

        portal: [15,9],

        walls: [
            [4,2],
            [4,3],
            [4,4],

            [13,2],
            [13,3],
            [13,4],

            [8,8],
            [9,8],
            [10,8]
        ],

        spikes: [
            [6,6],
            [7,6],
            [11,6],
            [12,6]
        ]
    }

];


/* =====================================================
   VARIABLE
===================================================== */

let scene;
let camera;
let renderer;

let snakeMeshes = [];
let wallMeshes = [];
let spikeMeshes = [];

let appleMesh;
let portalMesh;

let snake = [];

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let level = 1;
let score = 0;
let appleCount = 0;

let running = false;
let paused = false;

let timer = 0;
let lastTime = 0;

let playerName =
    localStorage.getItem("snake_player") ||
    "Player";


/* =====================================================
   ELEMENT HTML
===================================================== */

const gameElement =
    document.getElementById("game");

const levelText =
    document.getElementById("level");

const scoreText =
    document.getElementById("score");

const appleText =
    document.getElementById("apple");

const bestText =
    document.getElementById("best");

const statusText =
    document.getElementById("status");


/* =====================================================
   THREE.JS
===================================================== */

function init() {

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x9bdfea);


    camera =
        new THREE.OrthographicCamera(
            -GRID_WIDTH / 2,
             GRID_WIDTH / 2,
             GRID_HEIGHT / 2,
            -GRID_HEIGHT / 2,
            0.1,
            100
        );

    camera.position.z = 20;


    renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });


    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );


    renderer.setSize(
        gameElement.clientWidth,
        gameElement.clientHeight
    );


    gameElement.appendChild(
        renderer.domElement
    );


    createBackground();

    createLevel();

    resize();

    requestAnimationFrame(gameLoop);
}


/* =====================================================
   BACKGROUND
===================================================== */

function createBackground() {

    const background =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                GRID_WIDTH,
                GRID_HEIGHT
            ),

            new THREE.MeshBasicMaterial({
                color: 0x9bdfea
            })

        );


    background.position.z = -5;

    scene.add(background);


    /*
       Awan
    */

    for(let i = 0; i < 5; i++) {

        const cloud =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    .7,
                    16
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xe1f7f9,
                    transparent: true,
                    opacity: .7
                })

            );


        cloud.position.set(
            -7 + i * 3.5,
            4,
            -4
        );


        scene.add(cloud);

    }

}


/* =====================================================
   KONVERSI GRID
===================================================== */

function worldPosition(x, y) {

    return {

        x:
            x -
            GRID_WIDTH / 2 +
            .5,

        y:
            y -
            GRID_HEIGHT / 2 +
            .5

    };

}


/* =====================================================
   CLEAR OBJECT
===================================================== */

function clearObjects() {

    snakeMeshes.forEach(
        mesh => mesh.removeFromParent()
    );

    wallMeshes.forEach(
        mesh => mesh.removeFromParent()
    );

    spikeMeshes.forEach(
        mesh => mesh.removeFromParent()
    );


    snakeMeshes = [];
    wallMeshes = [];
    spikeMeshes = [];


    if(appleMesh)
        appleMesh.removeFromParent();


    if(portalMesh)
        portalMesh.removeFromParent();

}


/* =====================================================
   CREATE LEVEL
===================================================== */

function createLevel() {

    clearObjects();


    const data =
        levels[
            (level - 1) %
            levels.length
        ];


    /*
       SNAKE
    */

    snake = [

        {x:2, y:6},

        {x:1, y:6},

        {x:0, y:6}

    ];


    direction = {
        x:1,
        y:0
    };


    nextDirection = {
        x:1,
        y:0
    };


    drawSnake();


    /*
       WALL
    */

    data.walls.forEach(
        ([x,y]) => {

            const p =
                worldPosition(x,y);


            const wall =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .95,
                        .95,
                        .6
                    ),

                    new THREE.MeshBasicMaterial({
                        color: 0x75452b
                    })

                );


            wall.position.set(
                p.x,
                p.y,
                .5
            );


            scene.add(wall);

            wallMeshes.push(wall);

        }
    );


    /*
       SPIKE
    */

    data.spikes.forEach(
        ([x,y]) => {

            const p =
                worldPosition(x,y);


            const spike =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        .42,
                        .8,
                        4
                    ),

                    new THREE.MeshBasicMaterial({
                        color: 0x3f424b
                    })

                );


            spike.position.set(
                p.x,
                p.y,
                .8
            );


            spike.rotation.z =
                Math.PI / 4;


            scene.add(spike);

            spikeMeshes.push(spike);

        }
    );


    /*
       APPLE
    */

    createApple(
        data.apple[0],
        data.apple[1]
    );


    /*
       PORTAL
    */

    createPortal(
        data.portal[0],
        data.portal[1]
    );


    updateHUD();

}


/* =====================================================
   SNAKE
===================================================== */

function drawSnake() {

    snakeMeshes.forEach(
        mesh => mesh.removeFromParent()
    );

    snakeMeshes = [];


    snake.forEach(
        (part,index) => {

            const p =
                worldPosition(
                    part.x,
                    part.y
                );


            const snakePart =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .9,
                        .72,
                        .55
                    ),

                    new THREE.MeshBasicMaterial({
                        color:
                            index === 0
                            ? 0x50d832
                            : 0x7be94c
                    })

                );


            snakePart.position.set(
                p.x,
                p.y,
                .7
            );


            scene.add(
                snakePart
            );


            snakeMeshes.push(
                snakePart
            );


            /*
               Mata
            */

            if(index === 0) {

                const eye1 =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            .08,
                            10,
                            10
                        ),

                        new THREE.MeshBasicMaterial({
                            color: 0xffffff
                        })

                    );


                const eye2 =
                    eye1.clone();


                eye1.position.set(
                    -.22,
                    .2,
                    .35
                );


                eye2.position.set(
                    .22,
                    .2,
                    .35
                );


                snakePart.add(
                    eye1,
                    eye2
                );

            }

        }
    );

}


/* =====================================================
   APPLE
===================================================== */

function createApple(x,y) {

    const p =
        worldPosition(x,y);


    appleMesh =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .36,
                20,
                16
            ),

            new THREE.MeshBasicMaterial({
                color: 0xf02f3f
            })

        );


    appleMesh.position.set(
        p.x,
        p.y,
        .8
    );


    scene.add(
        appleMesh
    );

}


/* =====================================================
   PORTAL
===================================================== */

function createPortal(x,y) {

    const p =
        worldPosition(x,y);


    portalMesh =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                .4,
                .11,
                10,
                24
            ),

            new THREE.MeshBasicMaterial({
                color: 0x292744
            })

        );


    portalMesh.position.set(
        p.x,
        p.y,
        .7
    );


    scene.add(
        portalMesh
    );

}


/* =====================================================
   COLLISION
===================================================== */

function isBlocked(x,y) {

    if(
        x < 0 ||
        x >= GRID_WIDTH ||
        y < 0 ||
        y >= GRID_HEIGHT
    ) {

        return true;

    }


    const data =
        levels[
            (level - 1) %
            levels.length
        ];


    const wall =
        data.walls.some(
            w =>
                w[0] === x &&
                w[1] === y
        );


    const spike =
        data.spikes.some(
            s =>
                s[0] === x &&
                s[1] === y
        );


    return wall || spike;

}


/* =====================================================
   SNAKE COLLISION
===================================================== */

function snakeCollision(x,y) {

    return snake.some(
        part =>
            part.x === x &&
            part.y === y
    );

}


/* =====================================================
   MOVE
===================================================== */

function moveSnake() {

    direction =
        nextDirection;


    const head =
        snake[0];


    const next = {

        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y

    };


    /*
       Tabrak dinding
    */

    if(
        isBlocked(
            next.x,
            next.y
        )
    ) {

        gameOver();

        return;

    }


    /*
       Tabrak badan
    */

    if(
        snakeCollision(
            next.x,
            next.y
        )
    ) {

        gameOver();

        return;

    }


    snake.unshift(next);


    const data =
        levels[
            (level - 1) %
            levels.length
        ];


    /*
       Ambil apel
    */

    if(
        next.x === data.apple[0] &&
        next.y === data.apple[1]
    ) {

        score +=
            100 * level;

        appleCount++;


        createNewApple();

        saveGame();

    }
    else {

        snake.pop();

    }


    /*
       Portal
    */

    if(
        next.x === data.portal[0] &&
        next.y === data.portal[1] &&
        appleCount >= level
    ) {

        score += 250;

        level++;


        saveScoreToGoogleSheets();


        createLevel();

    }


    drawSnake();

    updateHUD();

}


/* =====================================================
   NEW APPLE
===================================================== */

function createNewApple() {

    let x;
    let y;


    do {

        x =
            Math.floor(
                Math.random() *
                GRID_WIDTH
            );

        y =
            Math.floor(
                Math.random() *
                GRID_HEIGHT
            );

    }
    while(
        isBlocked(x,y) ||
        snakeCollision(x,y)
    );


    appleMesh.position.set(
        worldPosition(x,y).x,
        worldPosition(x,y).y,
        .8
    );


    /*
       Update level apple
    */

    const data =
        levels[
            (level - 1) %
            levels.length
        ];


    data.apple = [
        x,
        y
    ];

}


/* =====================================================
   DIRECTION
===================================================== */

function changeDirection(name) {

    const directions = {

        up:
            {x:0,y:1},

        down:
            {x:0,y:-1},

        left:
            {x:-1,y:0},

        right:
            {x:1,y:0}

    };


    const newDirection =
        directions[name];


    if(!newDirection)
        return;


    /*
       Tidak boleh berbalik
    */

    if(
        newDirection.x ===
        -direction.x &&

        newDirection.y ===
        -direction.y
    ) {

        return;

    }


    nextDirection =
        newDirection;

}


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if(
            key === "arrowup" ||
            key === "w"
        ) {

            changeDirection("up");

        }


        if(
            key === "arrowdown" ||
            key === "s"
        ) {

            changeDirection("down");

        }


        if(
            key === "arrowleft" ||
            key === "a"
        ) {

            changeDirection("left");

        }


        if(
            key === "arrowright" ||
            key === "d"
        ) {

            changeDirection("right");

        }


        if(key === " ") {

            paused =
                !paused;

        }

    }
);


/* =====================================================
   TOUCH CONTROL
===================================================== */

document
    .querySelectorAll(
        "[data-direction]"
    )
    .forEach(button => {

        button.addEventListener(
            "pointerdown",
            () => {

                changeDirection(
                    button.dataset.direction
                );

            }
        );

    });


/* =====================================================
   GAME START
===================================================== */

function startGame() {

    level = 1;

    score = 0;

    appleCount = 0;

    running = true;

    paused = false;

    timer = 0;


    createLevel();


    statusText.textContent =
        "🎮 Game sedang berjalan.";

}


/* =====================================================
   PAUSE
===================================================== */

function pauseGame() {

    if(!running)
        return;


    paused =
        !paused;


    statusText.textContent =
        paused
        ? "⏸ Game di-pause."
        : "▶ Game dilanjutkan.";

}


/* =====================================================
   RESET
===================================================== */

function resetGame() {

    startGame();

}


/* =====================================================
   GAME OVER
===================================================== */

function gameOver() {

    running = false;


    const oldBest =
        Number(
            localStorage.getItem(
                "snake_best"
            ) || 0
        );


    if(score > oldBest) {

        localStorage.setItem(
            "snake_best",
            score
        );

    }


    updateHUD();

    saveScoreToGoogleSheets();


    statusText.textContent =
        "💀 GAME OVER! Score: " +
        score;

}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    levelText.textContent =
        level;

    scoreText.textContent =
        score;

    appleText.textContent =
        appleCount;


    bestText.textContent =
        localStorage.getItem(
            "snake_best"
        ) || 0;

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveGame() {

    localStorage.setItem(

        "snake_game",

        JSON.stringify({

            player:
                playerName,

            level:
                level,

            score:
                score,

            apples:
                appleCount,

            time:
                Date.now()

        })

    );

}


/* =====================================================
   GOOGLE SHEETS
===================================================== */

function saveScoreToGoogleSheets() {

    saveGame();


    if(!GOOGLE_SHEETS_URL) {

        statusText.textContent =
            "✓ Data tersimpan di browser.";

        return;

    }


    fetch(
        GOOGLE_SHEETS_URL,
        {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type":
                    "text/plain"
            },

            body:
                JSON.stringify({

                    name:
                        playerName,

                    score:
                        score,

                    level:
                        level,

                    apples:
                        appleCount

                })

        }
    )
    .then(() => {

        statusText.textContent =
            "✓ Score tersimpan ke Google Sheets.";

    })
    .catch(() => {

        statusText.textContent =
            "⚠ Gagal koneksi Google Sheets.";

    });

}


/* =====================================================
   PLAYER NAME
===================================================== */

document
    .getElementById("saveName")
    .onclick = () => {

        const input =
            document.getElementById(
                "playerName"
            );


        playerName =
            input.value.trim() ||
            "Player";


        localStorage.setItem(
            "snake_player",
            playerName
        );


        statusText.textContent =
            "👤 Nama tersimpan: " +
            playerName;

    };


document
    .getElementById("playerName")
    .value =
    playerName;


/* =====================================================
   BUTTON
===================================================== */

document
    .getElementById("startBtn")
    .onclick =
    startGame;


document
    .getElementById("pauseBtn")
    .onclick =
    pauseGame;


document
    .getElementById("resetBtn")
    .onclick =
    resetGame;


/* =====================================================
   SOUND BUTTON
===================================================== */

document
    .getElementById("soundBtn")
    .onclick =
    function() {

        this.textContent =
            this.textContent === "🔊"
            ? "🔇"
            : "🔊";

    };


/* =====================================================
   RESPONSIVE
===================================================== */

function resize() {

    if(!renderer)
        return;


    renderer.setSize(
        gameElement.clientWidth,
        gameElement.clientHeight
    );


    const aspect =
        gameElement.clientWidth /
        gameElement.clientHeight;


    const base =
        GRID_WIDTH /
        GRID_HEIGHT;


    if(aspect > base) {

        camera.left =
            -GRID_HEIGHT *
            aspect / 2;

        camera.right =
            GRID_HEIGHT *
            aspect / 2;

        camera.top =
            GRID_HEIGHT / 2;

        camera.bottom =
            -GRID_HEIGHT / 2;

    }
    else {

        camera.left =
            -GRID_WIDTH / 2;

        camera.right =
            GRID_WIDTH / 2;

        camera.top =
            GRID_WIDTH /
            aspect / 2;

        camera.bottom =
            -GRID_WIDTH /
            aspect / 2;

    }


    camera.updateProjectionMatrix();

}


window.addEventListener(
    "resize",
    resize
);


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(time) {

    const delta =
        Math.min(
            .05,
            (time - lastTime) /
            1000 || 0
        );


    lastTime =
        time;


    if(
        running &&
        !paused
    ) {

        timer += delta;


        /*
           Kecepatan ular
        */

        if(timer >= .22) {

            timer = 0;

            moveSnake();

        }

    }


    /*
       Animasi apple
    */

    if(appleMesh) {

        appleMesh.rotation.y +=
            delta * 2;

    }


    /*
       Animasi portal
    */

    if(portalMesh) {

        portalMesh.rotation.z +=
            delta * 2;

    }


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   START THREE.JS
===================================================== */

init();
