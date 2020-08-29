var margin = {'top': 25, 'right': 25, 'bottom': 16, 'left': 25};

var brick_width = 84;
var brick_height = 24;
var brick_exists = {
    'red' : true,
    'blue' : true,
    'green' : true,
    'purple' : true,
    'yellow' : true
};

var firstrow_offset = 0;
var firstrow_spacing = 24;
var vertical_rowspacing = 16;
var secondrow_offset = 50;
var secondrow_spacing = 32;

var obstacle_width = 118;
var obstacle_height = 8;
var obstacle_offset = 60;
var obstacle_distanceto_bricks = 64;

var platform_width = 60;
var platform_height = 8;
var platform_startingoffset = 120;
var platform_distanceto_obstacle = 95;
var platformX = margin.left+platform_startingoffset;
var platformVelX = 0;
var platform_speed= 4;

// CANVAS SIZE
var canvas_width = margin.left+brick_width*3+firstrow_spacing*2+margin.right;
var canvas_height = margin.top+brick_height*2+vertical_rowspacing+obstacle_distanceto_bricks+obstacle_height+platform_distanceto_obstacle+platform_height+margin.bottom;

var ball_radius = 8;
var ball_startingoffset = 150
var ball_distanceto_platform = 12 // how much does center of ball sits above the platform
var ball_style = "#0095DD"; // some tone of lightblue
var ballX = margin.left+ball_startingoffset;
var ballY = canvas_height-(margin.bottom+platform_height+ball_distanceto_platform);
var ballVelX = 1.8;
var ballVelY = 2;

var game_started = false;
var game_paused = false;
var score = 0;

var canvas = document.getElementById("game-canvas");
var scorelbl = document.getElementById("score_label");
var ctx = canvas.getContext("2d");

//
// MECHANIC FUCNTIONS //

function coord(entity){
    // coordinates: center for ball, top-left corner for rectangles

    switch(entity){
        case "red":
            return brick_exists["red"] ? {'x': margin.left+firstrow_offset, 'y': margin.top,
                    'w': brick_width, 'h': brick_height} : null;
        case "blue":
            return brick_exists["blue"] ? {'x': margin.left+firstrow_offset+brick_width+firstrow_spacing,
                    'y': margin.top,
                    'w': brick_width, 'h': brick_height} : null;
        case "green":
            return brick_exists["green"] ? {'x': margin.left+firstrow_offset+brick_width*2+firstrow_spacing*2,
                    'y': margin.top,
                    'w': brick_width, 'h': brick_height} : null;
        case "purple":
            return brick_exists["purple"] ? {'x': margin.left+secondrow_offset,
                    'y': margin.top+brick_height+vertical_rowspacing,
                    'w': brick_width, 'h': brick_height} : null;
        case "yellow":
            return brick_exists["yellow"] ? {'x': margin.left+secondrow_offset+brick_width+secondrow_spacing,
                    'y': margin.top+brick_height+vertical_rowspacing,
                    'w': brick_width, 'h': brick_height} : null;
        case "obstacle":
            return {'x': margin.left+obstacle_offset,
                    'y': margin.top+brick_height*2+vertical_rowspacing+obstacle_distanceto_bricks,
                    'w': obstacle_width, 'h': obstacle_height};
        case "ball":
            return {'x': ballX, 'y': ballY};
        case "platform":
            return {'x': platformX,
                    'y': canvas_height-margin.bottom-platform_height,
                    'w': platform_width, 'h': platform_height};
        default:
            console.log("# No such entity as '"+entity+"'");
    }
}

function ball_intersects_with(rectangle){
    var deltaX = ballX-Math.max(rectangle.x, Math.min(ballX, rectangle.x+rectangle.w));
    var deltaY = ballY-Math.max(rectangle.y, Math.min(ballY, rectangle.y+rectangle.h));

    return (deltaX*deltaX + deltaY*deltaY) < (ball_radius*ball_radius);
}

function elastic_collision(obstacle){
    // Change direction of the ball on collision

    if(ballY<obstacle.y || ballY>obstacle.y+obstacle.h) // ball collides from above or below
        ballVelY = -ballVelY;

    if(ballX<obstacle.x || ballX>obstacle.x+obstacle.w) // ball collides from one of the sides
        ballVelX = -ballVelX;
}

var _input_handlers_assigned = false;
function assign_input_handlers(){
    if(!_input_handlers_assigned){
        document.addEventListener("keydown", function(e){
            if (e.key == "Right" || e.key == "ArrowRight")
                platformVelX = platform_speed;

            if (e.key == "Left" || e.key == "ArrowLeft")
                platformVelX = -platform_speed;
        });

        document.addEventListener("keyup", function(e){
            if (e.key == "Right" || e.key == "ArrowRight")
                if(platformVelX==platform_speed)
                    platformVelX = 0; // stop going right

            if (e.key == "Left" || e.key == "ArrowLeft")
                if(platformVelX==-platform_speed)
                    platformVelX = 0; // stop going left
        });

        _input_handlers_assigned = true;
    }
}

//
// DISPLAY FUNCTIONS //

function prepare_canvas(){
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    canvas.style = "border:1px solid";
}

function draw(){
    // DRAW BACKGROUND
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    // DRAW BRICKS
    var rectangle;

    if(brick_exists["red"]){
        rectangle= coord("red");
        ctx.fillStyle = "red";
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    if(brick_exists["blue"]){
        rectangle = coord("blue");
        ctx.fillStyle = "blue";
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    if(brick_exists["green"]){
        rectangle = coord("green");
        ctx.fillStyle = "green";
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    if(brick_exists["purple"]){
        rectangle = coord("purple");
        ctx.fillStyle = "purple";
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    if(brick_exists["yellow"]){
        rectangle = coord("yellow");
        ctx.fillStyle = "yellow";
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    // DRAW OBSTACLE
    rectangle = coord("obstacle");
    ctx.fillStyle = "black";
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);

    // DRAW BALL AND PADDLE
    var ball = coord("ball");
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball_radius, 0, Math.PI*2); // start pos & length in radians
    ctx.fillStyle = ball_style;
    ctx.fill();
    ctx.closePath();

    rectangle = coord("platform");
    ctx.fillStyle = "#0095DD"; //"lightblue";
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);

    // UPDATE SCORE LABEL
    scorelbl.innerHTML = "Score : "+score;
}

//
// MAIN LOOP //
function game_loop(){
    //
    // HANDLE INPUT //
    assign_input_handlers();

    //
    // MOVE BALL AND PADDLE //
    ballX += ballVelX;
    ballY += ballVelY;
    platformX += platformVelX;

    //
    // COLLUSION DETECTION //

    // walls are defines as 1px wide rectangles
    var topwall = {'x': 0, 'y': -1, 'w': canvas_width, 'h': 1};
    var rightwall = {'x': canvas_width, 'y': 0, 'w': 1, 'h': canvas_height};
    var bottomwall = {'x': 0, 'y': canvas_height, 'w': canvas_width, 'h': 1};
    var leftwall = {'x': -1, 'y': 0, 'w': 1, 'h': canvas_height};

    var platform = coord("platform");
    var obstacle = coord("obstacle");

    var redbrick = coord("red");
    var bluebrick = coord("blue");
    var greenbrick = coord("green");
    var purplebrick = coord("purple");
    var yellowbrick = coord("yellow");

    // Collusion with the paddle
    if(ball_intersects_with(platform)){
        //@ check left and right side collisions seperately to prevent
        //@ ball being stuck in the paddle and send the ball to appropriate
        //@ direction.

        if(ballX<platform.x){
            // ball collides from left
            ballVelX = -Math.abs(ballVelX);
            ballX += platformVelX;
        }

        if(ballX>platform.x+platform.w){
            // ball collides from right
            ballVelX = Math.abs(ballVelX);
            ballX += platformVelX;
        }

        if(ballY<platform.y)
            // ball collides from above
            // if it somehow manages to come from below with upwards velocity, let it pass..
            ballVelY = -Math.abs(ballVelY);
    }

    // Collusion with walls
    //@ left and right wall collusions need to explicitly directed
    //@ as paddle-pushing can make the ball out-of-bounds

    if(ball_intersects_with(leftwall))
        // push right
        ballVelX = Math.abs(ballVelX);

    if(ball_intersects_with(rightwall))
        // push left
        ballVelX = -Math.abs(ballVelX);

    if(ball_intersects_with(topwall))
        ballVelY = -ballVelY;

    if(ball_intersects_with(bottomwall)){
        // LOSE CONDITION
        game_paused = true;
        alert("GAME OVER!");
    }

    // Collusion with the obstacle
    if(ball_intersects_with(obstacle))
        elastic_collision(obstacle);

    // Collusion with bricks
    if(redbrick && ball_intersects_with(redbrick)){
        score += 20;
        brick_exists["red"] = false;
        ball_style = "red";

        elastic_collision(redbrick);
    }

    if(bluebrick && ball_intersects_with(bluebrick)){
        score += 40;
        brick_exists["blue"] = false;
        ball_style = "blue";

        elastic_collision(bluebrick);
    }

    if(yellowbrick && ball_intersects_with(yellowbrick)){
        score += 50;
        brick_exists["yellow"] = false;
        ball_style = "yellow";

        elastic_collision(yellowbrick);
    }

    if(purplebrick && ball_intersects_with(purplebrick)){
        score += 60;
        brick_exists["purple"] = false;
        ball_style = "purple";

        elastic_collision(purplebrick);
    }

    if(greenbrick && ball_intersects_with(greenbrick)){
        score += 80;
        brick_exists["green"] = false;
        ball_style = "green";

        elastic_collision(greenbrick);
    }

    if(score>=250){
        // WIN CONDITION
        game_paused = true;
        draw(); // to remove the last brick
        setTimeout(function(){alert("CONGRATULATIONS!")}, 100); // Chrome's alerts interrupts draw
    }

    // Paddle collusion detectection
    if(platformX<0 || platformX+platform_width>canvas_width) // collusion with side walls
        platformX -= platformVelX; // apply inverse velocity

    //
    // REDRAW //
    if(! game_paused){
        draw();
        requestAnimationFrame(game_loop);
    }
}

function start_screen(){
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    var text_x = canvas_width/6;
    var text_y = canvas_height/2;
    var text_width = canvas_width*2/3;

    ctx.font = "normal 32px Segoe UI, sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText("Press ANY key to start.", text_x, text_y, text_width);
}

prepare_canvas();
draw();

start_screen();

// Game is started as user presses a button.
document.addEventListener("keydown", function(e){
    if(! game_started){
        // Game starts
        requestAnimationFrame(game_loop);
        game_started = true;
    }
});