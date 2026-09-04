// 80s arcade title screen: synthwave sun, starfield, scrolling grid, blinking start.
import Phaser from 'phaser';
const FONT_DISPLAY: string='"Press Start 2P","Courier New",monospace';
const FONT_BODY: string='"VT323","Courier New",monospace';
export class BootScene extends Phaser.Scene{
    started: boolean=false;
    constructor(){
        super('BootScene');
    }
    create(): void{
        this.started=false;
        let w: number=this.scale.width;
        let h: number=this.scale.height;
        let g: Phaser.GameObjects.Graphics=this.add.graphics();
        g.fillGradientStyle(0x05010f, 0x05010f, 0x2b0a54, 0x3b0f6e, 1, 1, 1, 1);
        g.fillRect(0, 0, w, h);
        this.add.text(w/2, h/2-10, 'LOADING...', {fontFamily: FONT_BODY, fontSize: '28px', color: '#22d3ee'}).setOrigin(0.5);
        let go: ()=>void=()=>{
            if(!this.scene.isActive('BootScene')){
                return;
            }
            this.buildTitle();
        };
        try{
            let ready: Promise<FontFaceSet>=(document as Document).fonts.ready;
            let wait: Promise<string>=new Promise((res)=>{window.setTimeout(()=>{res('t');}, 900);});
            void Promise.race([ready, wait]).then(go);
        }
        catch(e){
            go();
        }
        this.scale.on('resize', ()=>{
            this.scene.restart();
        });
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
    buildTitle(): void{
        this.children.removeAll();
        let w: number=this.scale.width;
        let h: number=this.scale.height;
        let cx: number=w/2;
        let horizon: number=h*0.60;
        let g: Phaser.GameObjects.Graphics=this.add.graphics();
        g.fillGradientStyle(0x05010f, 0x05010f, 0x2b0a54, 0x3b0f6e, 1, 1, 1, 1);
        g.fillRect(0, 0, w, h);
        for(let i=0;i<90;i++){
            let sx: number=Math.random()*w;
            let sy: number=Math.random()*horizon*0.9;
            let s: Phaser.GameObjects.Rectangle=this.add.rectangle(sx, sy, 2, 2, 0xffffff, 0.4+Math.random()*0.6);
            s.setDepth(1);
            this.tweens.add({targets: s, alpha: 0.1, duration: 400+Math.random()*900, yoyo: true, repeat: -1, delay: Math.random()*1200});
        }
        let sunX: number=cx;
        let sunY: number=horizon-120;
        let sunR: number=110;
        let glow: Phaser.GameObjects.Graphics=this.add.graphics();
        glow.fillStyle(0xff2e88, 0.14);
        glow.fillCircle(sunX, sunY, sunR+46);
        glow.fillStyle(0xff2e88, 0.16);
        glow.fillCircle(sunX, sunY, sunR+22);
        let sun: Phaser.GameObjects.Graphics=this.add.graphics();
        sun.fillGradientStyle(0xffd319, 0xffd319, 0xff2e88, 0xff2e88, 1, 1, 1, 1);
        sun.fillCircle(sunX, sunY, sunR);
        sun.fillStyle(0x05010f, 1);
        let yy: number=sunY+8;
        let hh: number=3;
        while(yy<sunY+sunR){
            sun.fillRect(sunX-sunR-2, yy, sunR*2+4, hh);
            yy=yy+hh+9;
            hh=hh+2;
        }
        let mtn: Phaser.GameObjects.Graphics=this.add.graphics();
        mtn.fillStyle(0x0d0424, 1);
        mtn.fillTriangle(-40, horizon, w*0.22, horizon-86, w*0.44, horizon);
        mtn.fillTriangle(w*0.56, horizon, w*0.80, horizon-110, w+40, horizon);
        mtn.lineStyle(2, 0xff2e88, 0.8);
        mtn.strokeTriangle(-40, horizon, w*0.22, horizon-86, w*0.44, horizon);
        mtn.strokeTriangle(w*0.56, horizon, w*0.80, horizon-110, w+40, horizon);
        let grid: Phaser.GameObjects.Graphics=this.add.graphics();
        grid.lineStyle(2, 0x22d3ee, 0.55);
        for(let i=0;i<=16;i++){
            let bx: number=(i/16)*w;
            grid.lineBetween(cx+(bx-cx)*0.12, horizon, bx, h);
        }
        for(let i=0;i<6;i++){
            let t: number=i/6;
            grid.lineBetween(0, horizon+t*t*(h-horizon), w, horizon+t*t*(h-horizon));
        }
        let sweep: Phaser.GameObjects.Rectangle=this.add.rectangle(cx, horizon, w, 3, 0x22d3ee, 0.9);
        this.tweens.add({targets: sweep, y: h, duration: 1600, repeat: -1, ease: 'Cubic.easeIn'});
        this.add.text(cx, 84, 'TSCHIRLAU SOFT PRESENTS', {fontFamily: FONT_BODY, fontSize: '24px', color: '#22d3ee'}).setOrigin(0.5);
        let title: Phaser.GameObjects.Text=this.add.text(cx, 190, 'TSCHIRLAU', {fontFamily: FONT_DISPLAY, fontSize: '64px', color: '#ffd319'});
        title.setOrigin(0.5);
        title.setStroke('#ff2e88', 8);
        title.setShadow(0, 6, '#ff2e88', 0, true, true);
        this.tweens.add({targets: title, y: 184, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'});
        this.add.text(cx, 268, 'THE GRAND GATE MIRAGE', {fontFamily: FONT_DISPLAY, fontSize: '20px', color: '#22d3ee'}).setOrigin(0.5);
        this.add.text(cx, 308, 'A REAL-ESTATE FEVER DREAM IN 40 SPACES', {fontFamily: FONT_BODY, fontSize: '24px', color: '#ff71ce'}).setOrigin(0.5);
        let press: Phaser.GameObjects.Text=this.add.text(cx, h-176, 'PRESS SPACE OR CLICK TO START', {fontFamily: FONT_DISPLAY, fontSize: '16px', color: '#ffffff'}).setOrigin(0.5);
        this.tweens.add({targets: press, alpha: 0.15, duration: 520, yoyo: true, repeat: -1});
        this.add.text(cx, h-132, '2-6 TYCOONS - HOT-SEAT - LAST SOLVENT WINS', {fontFamily: FONT_BODY, fontSize: '22px', color: '#b026ff'}).setOrigin(0.5);
        this.add.text(cx, h-96, '(C) 198X TSCHIRLAU SOFT - INSERT COIN', {fontFamily: FONT_BODY, fontSize: '20px', color: '#5b5b7a'}).setOrigin(0.5);
        for(let i=0;i<28;i++){
            let bw: number=w/30;
            let bar: Phaser.GameObjects.Rectangle=this.add.rectangle(8+i*(bw+3), h-8, bw, 30, i%2===0?0xff2e88:0x22d3ee, 0.85);
            bar.setOrigin(0.5, 1);
            this.tweens.add({targets: bar, scaleY: 0.15+Math.random()*0.85, duration: 160+Math.random()*220, yoyo: true, repeat: -1, delay: Math.random()*400, ease: 'Sine.easeInOut'});
        }
        let start: ()=>void=()=>{
            if(this.started){
                return;
            }
            this.started=true;
            this.cameras.main.flash(220, 255, 255, 255);
            this.scene.start('PreloadScene');
        };
        this.input.keyboard?.on('keydown-SPACE', start);
        this.input.keyboard?.on('keydown-ENTER', start);
        this.input.on('pointerdown', start);
        this.sharpen();
    }
}
