// Preload: loading bar placeholder, then starts game scenes.
import Phaser from 'phaser';
export class PreloadScene extends Phaser.Scene{
    constructor(){
        super('PreloadScene');
    }
    create(): void{
        let w: number=this.scale.width;
        let h: number=this.scale.height;
        let g: Phaser.GameObjects.Graphics=this.add.graphics();
        g.fillStyle(0x222222, 1);
        g.fillRect(w/2-160, h/2-12, 320, 24);
        g.fillStyle(0x4ade80, 1);
        g.fillRect(w/2-160, h/2-12, 320, 24);
        this.add.text(w/2, h/2-40, 'Tschirlau: The Grand Gate Mirage', {fontSize: '20px', color: '#ffffff'}).setOrigin(0.5);
        this.time.delayedCall(250, ()=>{
            this.scene.start('GameScene');
        });
    }
}
