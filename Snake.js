class main{
    constructor(){
        this.gameRun = false;
        this.events = [];
        this.start_btn = document.getElementById("button");
        this.container = document.getElementById("game");
        this.canvas_html = document.getElementById("canvas");
        this.canvas = this.canvas_html.getContext("2d");
        this.close_btn = document.getElementById("close");
        this.collect = new Audio("./Sounds/Collect.wav");
        this.music = new Audio("./Sounds/Background.wav");
        this.die = new Audio("./Sounds/Lose.wav");
    }
    
    start_game(){
        if(!this.gameRun){
            this.start_btn.setAttribute("disabled", "");
            this.close_btn.setAttribute("disabled", "");
            this.container.style.display = "block";
            this.snake_i = new snake();
            this.apples_i = new apples(this.collect);
            this.gameRun = true;
            window.scrollTo(0, document.body.scrollHeight);
            this.music.currentTime = 0;
            this.music.play();
            this.music.addEventListener("ended", this.background_music);
            this.die.pause();
            this.tick();
        }
    }
    
    background_music(){
        this.currentTime = 0;
        this.play();
    }
    
    tick(){
        if(this.gameRun){
            let scope = this;
            this.snake_i.start_events();
            for(let i = 0;i < this.events.length;i++){
                this.snake_i.change_dir(this.events[i]);
            }
            this.events = [];
            this.snake_i.tick(this.apples_i);
            let list = this.snake_i.get_body();
            this.canvas.clearRect(0, 0, this.canvas_html.width, this.canvas_html.height);
            this.canvas.fillStyle = "red";
            this.canvas.fillRect(this.apples_i.pos()[0], this.apples_i.pos()[1], this.apples_i.width, this.apples_i.height);
            this.canvas.fillStyle = "yellow";
            for(let block = 0;block < list.length;block++){
                this.canvas.fillRect(list[block][0] + 1, list[block][1] + 1, this.snake_i.width - 2, this.snake_i.height - 2);
            }
            if(this.snake_i.collision_check()){
                this.gameRun = false;
                this.death("Hitting your own tail");
            }else if(this.snake_i.out_of_bounds()){
                this.gameRun = false;
                this.death("Hitting the wall");
            }else{
                setTimeout(function(){scope.tick()}, 40);
            }
        }
    }
    
    death(cause){
        this.music.removeEventListener("ended", this.background_music);
        this.music.pause();
        this.canvas.font = "30px Comic Sans MS";
        this.canvas.fillStyle = "rgb(102, 178, 255)";
        let msg = ["You Lose!", "Press the start button to restart.", "Cause of death:", cause];
        for(let line = 0;line < msg.length;line++){
            let x = Math.round(this.canvas_html.width / 2 - this.canvas.measureText(msg[line]).width / 2);
            let y = (this.canvas_html.height / 2 - (30 * msg.length / 2)) + 30 * line;
            this.canvas.fillText(msg[line], x, y);
        }
        this.die.currentTime = 0;
        this.die.play();
        this.start_btn.removeAttribute("disabled");
        this.close_btn.removeAttribute("disabled");
    }
    
    register_event(event){
        if(this.gameRun){
            event.preventDefault();
            this.events.push(event.keyCode);
        }
    }
    
    exit(){
        if(!this.gameRun){
            this.collect.pause();
            this.die.pause();
            this.container.style.display = "none";
        }
    }
}


class snake{
    constructor(){
        this.keyMap = {};
        this.body_pos = [];
        this.x = 330;
        this.y = 220;
        this.width = 10;
        this.height = 10;
        this.direction = 3;
        this.prev_dir;
        this.x_deltas = {1:-10, 2:0, 3:10, 4:0};
        this.y_deltas = {1:0, 2:-10, 3:0, 4:10};
        this.score = 0;
        this.score_element = document.getElementById("score");
        this.score_element.innerHTML = "0";
        for(var i = 37;i <= 40;i++){
            this.keyMap[i] = i - 36;
        }
        this.keyMap[65] = 1;
        this.keyMap[87] = 2;
        this.keyMap[68] = 3;
        this.keyMap[83] = 4;
        for(var i = 330;i >= 250;i -= 10){
            this.body_pos.push([i, this.y]);
        }
    }
    
    start_events(){
        this.prev_dir = this.direction;
    }
    
    change_dir(key){
        if(key in this.keyMap && Math.abs(this.keyMap[key] - this.prev_dir) != 2){
            this.direction = this.keyMap[key];
        }
    }
    
    tick(apple){
        this.x += this.x_deltas[this.direction];
        this.y += this.y_deltas[this.direction];
        this.body_pos.splice(0, 0, [this.x, this.y]);
        if(this.touching_apple(apple.pos())){
            this.score += 1;
            this.score_element.innerHTML = this.score;
            apple.relocate();
        }else{
            this.body_pos.pop();
        }
    }
    
    collision_check(){
        return this.body_pos.slice(1, this.body_pos.length).some((array) => {let [x, y] = array;return x == this.x && y == this.y});
    }
    
    out_of_bounds(){
        return (this.x < 0 || this.y < 0 || this.x > 690 || this.y > 490);
    }
    
    touching_apple(pos){
        return this.x == pos[0] && this.y == pos[1];
    }
    
    get_body(){
        return this.body_pos;
    }
}


class apples{
    constructor(sound){
        this.x = 70;
        this.y = 70;
        this.width = 10;
        this.height = 10;
        this.collect_wav = sound;
        this.relocate(true);
    }
    
    relocate(init=false){
        this.x = this.randint(0, 69) * 10;
        this.y = this.randint(0, 49) * 10;
        if(!init){
            this.collect_wav.pause();
            this.collect_wav.currentTime = 0;
            this.collect_wav.play();
        }
    }
    
    randint(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    pos(){
        return [this.x, this.y];
    }
}


let game = new main();
document.addEventListener("keydown", function(event){game.register_event(event)});
document.getElementById("button").addEventListener("click", function(){game.start_game()});
document.getElementById("close").addEventListener("click", function(){game.exit()});
