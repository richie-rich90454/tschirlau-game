// Neon NOW LOADING interlude with percent readout, then hands off to GameScene.
import Phaser from 'phaser';
const FONT_DISPLAY: string='"Noto Sans Mono",monospace';
const FONT_BODY: string='"Noto Sans Mono",monospace';
export class PreloadScene extends Phaser.Scene{
    constructor(){
        super('PreloadScene');
    }
    sharpen(): void{
        let kids: Array<Phaser.GameObjects.GameObject>=this.children.list;
        for(let i=0;i<kids.length;i++){
            let k: Phaser.GameObjects.GameObject|undefined=kids[i];
            if(k instanceof Phaser.GameObjects.Text){
                k.setResolution(2);
            }
        }
    }
    create(): void{
        this.scale.on('resize', ()=>{
            this.scene.restart();
        });
        let w: number=this.scale.width;
        let h: number=this.scale.height;
        let cx: number=w/2;
        let cy: number=h/2;
        let g: Phaser.GameObjects.Graphics=this.add.graphics();
        g.fillGradientStyle(0x05010f, 0x05010f, 0x1a0533, 0x1a0533, 1, 1, 1, 1);
        g.fillRect(0, 0, w, h);
        for(let i=0;i<50;i++){
            this.add.rectangle(Math.random()*w, Math.random()*h, 2, 2, 0xffffff, 0.25+Math.random()*0.4);
        }
        this.add.text(cx, cy-90, 'NOW LOADING', {fontFamily: FONT_DISPLAY, fontSize: '28px', color: '#ffd319'}).setOrigin(0.5);
        let blink: Phaser.GameObjects.Text=this.add.text(cx, cy-52, 'PLEASE WAIT...', {fontFamily: FONT_BODY, fontSize: '24px', color: '#ff2e88'}).setOrigin(0.5);
        this.tweens.add({targets: blink, alpha: 0.2, duration: 300, yoyo: true, repeat: -1});
        let bw: number=420;
        let frame: Phaser.GameObjects.Graphics=this.add.graphics();
        frame.lineStyle(3, 0x22d3ee, 1);
        frame.strokeRect(cx-bw/2-6, cy-6, bw+12, 32);
        frame.fillStyle(0x0d0424, 1);
        frame.fillRect(cx-bw/2-6, cy-6, bw+12, 32);
        let fill: Phaser.GameObjects.Rectangle=this.add.rectangle(cx-bw/2, cy+10, 0, 16, 0xff2e88, 1);
        fill.setOrigin(0, 0.5);
        let pct: Phaser.GameObjects.Text=this.add.text(cx, cy+44, '0%', {fontFamily: FONT_DISPLAY, fontSize: '16px', color: '#22d3ee'}).setOrigin(0.5);
        this.sharpen();
        let prog: {v: number}={v: 0};
        this.tweens.add({targets: prog, v: 100, duration: 750, ease: 'Cubic.easeIn', onUpdate: ()=>{
            fill.width=bw*(prog.v/100);
            pct.setText('' + Math.floor(prog.v) + '%');
        }, onComplete: ()=>{
            this.cameras.main.flash(180, 34, 211, 238);
            this.scene.start('GameScene');
        }});
    }
}
