
namespace SpriteKind {
    export const Heart = SpriteKind.create()
    export const Portal = SpriteKind.create()
    export const Pinchos = SpriteKind.create()
    export const Fantasma = SpriteKind.create()
}




class JugadorKirby {
    invencible: Boolean
    nivel: number
    sprite: Sprite

    constructor() {
        this.invencible = false
        this.sprite = sprites.create(assets.image`Kirby-izquierda0`, SpriteKind.Player)
        scene.cameraFollowSprite(this.sprite)
        controller.player1.moveSprite(this.sprite, 80, 80)
        this.sprite.z = 10
        this.nivel = 0
        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            let vx = 0
            let vy = 0
            if (controller.right.isPressed()) vx = 100
            if (controller.left.isPressed()) vx = -100
            if (controller.up.isPressed()) vy = -100
            if (controller.down.isPressed()) vy = 100
            if (vx == 0 && vy == 0) {

                vx = randint(50, -50)
                vy = randint(50, -50)
            }
            let projectile = sprites.createProjectileFromSprite(assets.image`fuego`, Kirby.sprite, vx, vy)

        })
    }

    moverIzquierda() {
        animation.runImageAnimation(
            this.sprite,
            [assets.image`Kirby-izquierda0`, assets.image`Kirby-izquierda1`],
            100,
            true
        )
    }
    moverDerecha() {
        animation.runImageAnimation(
            this.sprite,
            [assets.image`Kirby-derecha0`, assets.image`Kirby-derecha1`],
            100,
            true
        )
    }

}
let Kirby: JugadorKirby



class Nivel {
    comidaRestante: number

    iniciar(cuantaComida: number, cuantosCorazones: number, cuantosPinchos: number, cuantosCanones: number) {
        this.comidaRestante = cuantaComida
        tiles.setCurrentTilemap(tilemap`nivel1`)
        for (let index = 0; index < cuantaComida; index++) {
            this.crearComida()
        }
        for (let index = 0; index < cuantosCorazones; index++) {
            this.crearCorazones()
        }
        for (let index = 0; index < cuantosPinchos; index++) {
            this.crearPinchos()
        }
        for (let index = 0; index < cuantosCanones; index++) {
            this.crearFantasma()
        }
        sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, comer)
        sprites.onOverlap(SpriteKind.Player, SpriteKind.Heart, curar)
    }

    crearComida() {
        let tipo = randint(1, 3)
        if (tipo == 1) {
            let comida = sprites.create(assets.image`comida-1`, SpriteKind.Food)
            this.poner(comida)
        }
        if (tipo == 2) {
            let comida2 = sprites.create(assets.image`comida-2`, SpriteKind.Food)
            this.poner(comida2)
        }
        if (tipo == 3) {
            let comida3 = sprites.create(assets.image`comida-3`, SpriteKind.Food)
            this.poner(comida3)
        }
    }
    crearCorazones() {
        let corazon = sprites.create(assets.image`corazon`, SpriteKind.Heart)
        this.poner(corazon)
    }
    crearPinchos() {
        let pinchos = sprites.create(assets.image`pinchos`, SpriteKind.Pinchos)
        this.poner(pinchos)
    }
    crearFantasma() {
        let fantasmas = sprites.create(assets.image`fantasmas`, SpriteKind.Fantasma)
        this.poner(fantasmas)
        animation.runImageAnimation(fantasmas, assets.animation`fantasmaAnim`, 500, true)
        fantasmas.follow(Kirby.sprite, 15)

    }
    poner(spr: Sprite) {
        tiles.placeOnTile(spr, tiles.getTileLocation(randint(1, 15), randint(1, 15)))
    }
    borrar() {
        sprites.destroyAllSpritesOfKind(SpriteKind.Fantasma)
        sprites.destroyAllSpritesOfKind(SpriteKind.Pinchos)
        sprites.destroyAllSpritesOfKind(SpriteKind.Heart)
    }
}
function borrarMundo() {
    music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
    portal.destroy()
}


function comer(player1: Sprite, comida: Sprite) {
    info.changeScoreBy(1)
    comida.startEffect(effects.disintegrate)
    comida.destroy()
    music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)
    nivel.comidaRestante = nivel.comidaRestante - 1
    if (nivel.comidaRestante == 0) {
        nivel.borrar()
        if (Kirby.nivel < niveles.length)
            crearMundo()
        else
            game.gameOver(true)
    }
}
function curar(player1: Sprite, corazon: Sprite) {
    corazon.destroy()
    info.changeLifeBy(1)
    corazon.startEffect(effects.blizzard)
    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)

}
controller.left.onEvent(
    ControllerButtonEvent.Pressed,
    () => Kirby.moverIzquierda()
)
info.onCountdownEnd(function () {
    Kirby.invencible = false
})
controller.right.onEvent(
    ControllerButtonEvent.Pressed,
    () => Kirby.moverDerecha()
)
function crearMundo() {
    tiles.setCurrentTilemap(tilemap`mundo`)
    portal = sprites.create(assets.image`portal`, SpriteKind.Portal)
    tiles.placeOnTile(portal, tiles.getTileLocation(7, 7))
    music.play(music.melodyPlayable(music.powerDown), music.PlaybackMode.InBackground)
}
info.onLifeZero(function () {
    game.gameOver(false)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Pinchos, function (sprite, otherSprite) {
    if (!(Kirby.invencible)) {
        Kirby.invencible = true
        info.changeLifeBy(-1)
        info.startCountdown(1.5)
        sprite.startEffect(effects.fire, 1.5 * 1000)
        scene.cameraShake(4, 500)
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Fantasma, function (sprite, otherSprite) {
    if (!(Kirby.invencible)) {
        Kirby.invencible = true
        info.changeLifeBy(-1)
        info.startCountdown(1.5)
        sprite.startEffect(effects.fire, 1.5 * 1000)
        scene.cameraShake(4, 500)
        music.play(music.melodyPlayable(music.sonar), music.PlaybackMode.InBackground)
    }
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Fantasma, function (proyectil, enemigo) {
    let vx = -enemigo.vx
    let vy = -enemigo.vy
    enemigo.setVelocity(vx, vy)
    info.startCountdown(1)
})

game.setGameOverMessage(true, "¡Vete a jugar otra cosa!")
game.setGameOverMessage(false, "GAME OVER LOSER!")

let nombre = game.askForString("¿Cómo te llamas?")
let portal: Sprite = null
game.splash("¡Entra en el portal y come " + nombre)


info.setLife(3)
info.setScore(0)
crearMundo()
Kirby = new JugadorKirby()
let nivel = new Nivel()

let niveles = [
    [1, 1, 1, 1],
    [5, 0, 25, 0],
    [6, 1, 7, 1],
    [20, 0, 30, 3],
    [10, 0, 10, 10],
    [20, 2, 10, 5],
    [15, 0, 20, 7],
    [5, 0, 100, 10],
    [3, 3, 100, 35],
    [20, 5, 20, 20],
    [10, 2, 50, 10],
    [100, 3, 50, 5]
]
tiles.placeOnTile(Kirby.sprite, tiles.getTileLocation(2, 11))
sprites.onOverlap(SpriteKind.Player, SpriteKind.Portal, function (sprite, otherSprite) {
    borrarMundo()
    let cuantaComida = niveles[Kirby.nivel][0]
    let cuantosCorazones = niveles[Kirby.nivel][1]
    let cuantosPinchos = niveles[Kirby.nivel][2]
    let cuantosFantasmas = niveles[Kirby.nivel][3]
    nivel.iniciar(cuantaComida, cuantosCorazones, cuantosPinchos, cuantosFantasmas)
    Kirby.nivel++
})
function crearCorazon() {
    let corazon = sprites.create(assets.image`corazon`, SpriteKind.Heart)
}




