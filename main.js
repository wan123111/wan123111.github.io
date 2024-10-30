const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor() {
    return (
        "rgb(" +
        random(0, 255) +
        ", " +
        random(0, 255) +
        ", " +
        random(0, 255) +
        ")"
    );
}

// 通用 Shape 类
function Shape(x, y, color, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
}

Shape.prototype.draw = function () {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
};

// Ball 类
function Ball(x, y, velX, velY, color, size) {
    Shape.call(this, x, y, color, size);
    this.velX = velX;
    this.velY = velY;
}

Ball.prototype = Object.create(Shape.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.update = function () {
    if (this.x + this.size >= width || this.x - this.size <= 0) {
        this.velX = -this.velX;
    }
    if (this.y + this.size >= height || this.y - this.size <= 0) {
        this.velY = -this.velY;
    }
    this.x += this.velX;
    this.y += this.velY;
};

Ball.prototype.collisionDetect = function () {
    for (let j = 0; j < balls.length; j++) {
        if (this !== balls[j]) {
            const dx = this.x - balls[j].x;
            const dy = this.y - balls[j].y;
            const distanceSquared = dx * dx + dy * dy;
            const radiiSum = this.size + balls[j].size;

            if (distanceSquared < radiiSum * radiiSum) {
                const newColor = randomColor();
                balls[j].color = this.color === newColor ? randomColor() : newColor;
                this.color = newColor;
            }
        }
    }
};

// DemonCircle 类（环状）
function DemonCircle(x, y, size) {
    Shape.call(this, x, y, "red", size);
    this.originalSize = size; // 记录初始大小
}

DemonCircle.prototype = Object.create(Shape.prototype);
DemonCircle.prototype.constructor = DemonCircle;

DemonCircle.prototype.draw = function () {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5; // 环的宽度
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke(); // 只绘制边框
};

DemonCircle.prototype.update = function (targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const angle = Math.atan2(dy, dx);
    const speed = 0.1; // 控制恶魔圈的移动速度
    this.x += Math.cos(angle) * speed * Math.sqrt(dx * dx + dy * dy);
    this.y += Math.sin(angle) * speed * Math.sqrt(dx * dx + dy * dy);
};

// 创建弹球
let balls = [];
function createBall() {
    let size = random(10, 20);
    return new Ball(
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-7, 7),
        random(-7, 7),
        randomColor(),
        size
    );
}

// 初始化弹球
while (balls.length < 25) {
    balls.push(createBall());
}

// 创建恶魔圈
const demonCircle = new DemonCircle(width / 2, height / 2, 30);

// 计分器
let score = balls.length;

function loop() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].update();
        balls[i].collisionDetect();
    }

    // 更新恶魔圈的位置
    demonCircle.update(mouseX, mouseY);
    demonCircle.draw();

    // 检测恶魔圈与弹球的碰撞
    for (let i = 0; i < balls.length; i++) {
        const dx = demonCircle.x - balls[i].x;
        const dy = demonCircle.y - balls[i].y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < (demonCircle.size + balls[i].size) * (demonCircle.size + balls[i].size)) {
            // 弹球被吃掉
            balls.splice(i, 1);
            demonCircle.size += 2; // 恶魔圈变大
            score--; // 更新分数
            i--;

            // 刷新弹球
            if (balls.length === 0) {
                for (let j = 0; j < 25; j++) {
                    balls.push(createBall());
                }
                score = balls.length; // 恢复分数
                demonCircle.size = demonCircle.originalSize; // 恶魔圈恢复到原始大小
            }
        }
    }

    // 绘制分数
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("剩余弹球数: " + score, 20, 30);

    requestAnimationFrame(loop);
}

// 玩家控制恶魔圈的位置
let mouseX = width / 2;
let mouseY = height / 2;

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

loop();
