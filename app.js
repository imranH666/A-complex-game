const scoreElement = document.querySelector(".scoreText")
const canvas = document.querySelector(".canvas")
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.rotation = 0
        this.opacity = 1
        const image = new Image()
        image.src = './images/house.png'
        image.onload = () => {
            this.image = image
            this.width = image.width
            this.height = image.height
            this.position = {
                x: canvas.width / 2 - image.width / 2,
                y: canvas.height - this.height - 20,
            }
        }
    }
    draw() {
        // ctx.fillStyle = 'red'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.translate(player.position.x + player.width / 2, player.position.y + player.height / 2)
        ctx.rotate(this.rotation)
        ctx.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2)
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        ctx.restore()
    }
    update() {
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

class Projectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = "red"
        ctx.fill()
        ctx.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor({position, velocity, radius, color, fades}){
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.fades) {
            this.opacity -= 0.01
        }
        
    }
}

class InvaderProjectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10
    }
    draw() {
        ctx.fillStyle = "white"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0,
        }
        const image = new Image()
        image.src = './images/car.png'
        image.onload = () => {
            this.image = image
            this.width = image.width * 0.50
            this.height = image.height * 0.50
            this.position = {
                x: position.x,
                y: position.y,
            }
        }
    }
    draw() {
        // ctx.fillStyle = 'red'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update({velocity}) {
        if(this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    shoot(invaderProjectile) {
        invaderProjectile.push(new InvaderProjectile({
            position: {x: this.position.x + this.width / 2, y: this.position.y + this.height},
            velocity: {x: 0, y: 5}
        }))
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }
        this.invaders = []
        const columns = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 5 + 2)

        this.width = columns * 30

        for(let i = 0; i < columns; i++) {
            for(let j = 0; j < rows; j++) {
                this.invaders.push(new Invader({position: {x: i * 30, y: j * 30}}))
            }
        }
    }
    update() {
        this.velocity.y = 0
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        }
    }
}

const player = new Player()
let projectiles = []
let grids = []
let invaderProjectiles = []
let particles = []
let frems = 0
let game = {
    over: false,
    active: true,
}
let score = 0

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

for(let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 0.3
        },
        radius: Math.random() * 2,
        color: "white",
    }))
}

function createParticls({object, color, fades}) {
    for(let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || "yellow",
            fades
        }))
    }
}

function animate() {
    if(!game.active) return
    requestAnimationFrame(animate)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    particles.forEach((particle, particleIndex) => {
        if(particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        if(particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(particleIndex, 1)
            })
        }else {
            particle.update()
        }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0);
        }else {
            invaderProjectile.update()
        }
        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {

            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity =  0
                game.over = true
            }, 0);
            setTimeout(() => {
                game.active = false
            }, 2000);
            createParticls({object: player, color: "white", fades: true})
        }
    })

    projectiles.forEach((projectile, projectileIndex) => {
        if(projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0);
        }else {
            projectile.update()
        }
    })

    grids.forEach((grid) => {
        grid.update()
        if(frems % 100 === 0 && grid.invaders.length > 0 ){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})
            projectiles.forEach((projectile, j) => { 
                if(projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y){

                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
                        const projectileFound = projectiles.find((projectile2) => projectile2 === projectile)
                        if(invaderFound && projectileFound) {
                            score += 100
                            scoreElement.textContent = score

                            createParticls({object: invader, fades: true})

                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)
                        }
                    }, 0)
                }
            })
        })
    })

    if(keys.a.pressed && player.position.x >= 0){
        player.velocity.x = -5
        player.rotation = -0.15
    }else if(keys.d.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 5
        player.rotation = 0.15
    }else {
        player.velocity.x = 0
        player.rotation = 0
    }

    
    if(frems % 1000 === 0){
        grids.push(new Grid())
    }
    frems++
}


window.addEventListener("keydown", ({key}) => {
    if(game.over) return

    switch (key) {
        case 'a':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case 's':
            projectiles.push(new Projectile({position: {x: player.position.x + player.width / 2, y: player.position.y}, velocity: {x: 0, y: -5}}))
            break
    }
})

window.addEventListener("keyup", ({key}) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 's':
            break
    }
})


animate()