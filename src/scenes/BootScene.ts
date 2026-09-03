// Boot: prepares registry defaults before preload.
import Phaser from 'phaser';
export class BootScene extends Phaser.Scene{
    constructor(){
        super('BootScene');
    }
    create(): void{
        this.registry.set('players', 3);
        this.scene.start('PreloadScene');
    }
}
