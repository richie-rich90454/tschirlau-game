// Procedural 8-bit BGM player using Web Audio API. Cycles track 1 and 2.
// ponytail: soundtrack below is an original composition for this game.
// No transcribed material is stored anywhere in tracked files.
export interface BgmNote{midi: number, duration: number}
function seq(s: string): Array<BgmNote>{
    let out: Array<BgmNote>=[];
    let parts: Array<string>=s.split('|');
    for(let i=0;i<parts.length;i++){
        let chunk: string|undefined=parts[i];
        if(chunk===undefined){
            continue;
        }
        let toks: Array<string>=chunk.trim().split(' ');
        for(let j=0;j<toks.length;j++){
            let t: string|undefined=toks[j];
            if(t===undefined||t.length<5){
                continue;
            }
            let inner: string=t.slice(1, t.length-1);
            let kv: Array<string>=inner.split(':');
            let m: string|undefined=kv[0];
            let d: string|undefined=kv[1];
            if(m===undefined||d===undefined){
                continue;
            }
            out.push({midi: parseInt(m, 10), duration: parseFloat(d)});
        }
    }
    return out;
}
function midiToFreq(m: number): number{
    return 440*Math.pow(2, (m-69)/12);
}
const TRACK1_BPM: number=132;
const TRACK2_BPM: number=88;
const TRACK1_MELODY: Array<BgmNote>=seq('(69:0.5) (72:0.5) (76:0.5) (81:0.5) | (80:0.5) (76:0.5) (72:0.5) (76:0.5) | (74:0.5) (77:0.5) (81:0.5) (86:0.5) | (85:0.5) (81:0.5) (77:0.5) (74:0.5) | (69:0.5) (72:0.5) (76:0.5) (81:0.5) | (84:0.5) (81:0.5) (80:0.5) (76:0.5) | (74:1) (71:1) (72:2) | (0:2) (69:0.5) (72:0.5) (74:0.5) (76:0.5) |');
const TRACK1_BASS: Array<BgmNote>=[{midi: 45, duration: 4}, {midi: 45, duration: 4}, {midi: 41, duration: 4}, {midi: 43, duration: 4}];
const TRACK2_MELODY: Array<BgmNote>=seq('(74:1) (77:1) (81:2) | (80:1) (77:1) (74:2) | (72:1) (74:1) (77:2) | (76:1) (74:1) (72:2) | (74:1) (77:1) (81:2) | (86:2) (85:1) (81:1) | (80:4) | (0:4) |');
const TRACK2_BASS: Array<BgmNote>=[{midi: 38, duration: 4}, {midi: 34, duration: 4}, {midi: 36, duration: 4}, {midi: 33, duration: 4}];
export class BGMPlayer{
    ctx: AudioContext|null=null;
    master: GainNode|null=null;
    playing: boolean=false;
    muted: boolean=false;
    track: number=1;
    timer: number|null=null;
    stepIdx: number=0;
    bassIdx: number=0;
    nextTime: number=0;
    hatOn: boolean=true;
    static shared: BGMPlayer|null=null;
    static instance(): BGMPlayer{
        if(BGMPlayer.shared===null){
            BGMPlayer.shared=new BGMPlayer();
        }
        return BGMPlayer.shared as BGMPlayer;
    }
    ensureCtx(): boolean{
        if(this.ctx!==null){
            return true;
        }
        let AC: typeof AudioContext|undefined=(window as unknown as Record<string, typeof AudioContext>)['AudioContext'] as typeof AudioContext|undefined;
        if(AC===undefined){
            return false;
        }
        this.ctx=new AC();
        this.master=this.ctx.createGain();
        this.master.gain.value=0.16;
        this.master.connect(this.ctx.destination);
        return true;
    }
    melody(): Array<BgmNote>{
        if(this.track===1){
            return TRACK1_MELODY;
        }
        else{
            return TRACK2_MELODY;
        }
    }
    bass(): Array<BgmNote>{
        if(this.track===1){
            return TRACK1_BASS;
        }
        else{
            return TRACK2_BASS;
        }
    }
    bpm(): number{
        if(this.track===1){
            return TRACK1_BPM;
        }
        else{
            return TRACK2_BPM;
        }
    }
    play(): void{
        if(this.playing){
            return;
        }
        if(!this.ensureCtx()){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        if(c.state==='suspended'){
            void c.resume();
        }
        this.playing=true;
        this.muted=false;
        this.stepIdx=0;
        this.bassIdx=0;
        this.nextTime=c.currentTime+0.1;
        this.timer=window.setInterval(()=>{this.schedule();}, 80);
    }
    stop(): void{
        this.playing=false;
        if(this.timer!==null){
            window.clearInterval(this.timer);
            this.timer=null;
        }
    }
    toggle(): boolean{
        if(this.playing){
            this.stop();
            return false;
        }
        else{
            this.play();
            return true;
        }
    }
    setTrack(n: number): void{
        if(n!==1&&n!==2){
            return;
        }
        this.track=n;
        this.stepIdx=0;
        this.bassIdx=0;
    }
    schedule(): void{
        if(!this.playing||this.ctx===null||this.master===null){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        let spb: number=60/this.bpm();
        while(this.nextTime<c.currentTime+0.25){
            let mel: Array<BgmNote>=this.melody();
            let bas: Array<BgmNote>=this.bass();
            if(this.stepIdx>=mel.length){
                this.stepIdx=0;
                this.bassIdx=0;
                this.track=this.track===1?2:1;
                mel=this.melody();
                bas=this.bass();
                spb=60/this.bpm();
            }
            let mn: BgmNote=mel[this.stepIdx] as BgmNote;
            let bn: BgmNote=bas[this.bassIdx % bas.length] as BgmNote;
            this.playLead(mn, this.nextTime, spb);
            if(this.stepIdx % 2===0){
                this.playBass(bn, this.nextTime, spb);
            }
            this.playDrums(this.stepIdx, this.nextTime, spb);
            this.nextTime=this.nextTime+mn.duration*spb;
            this.stepIdx=this.stepIdx+1;
            if(this.stepIdx % 4===0){
                this.bassIdx=this.bassIdx+1;
            }
        }
    }
    playLead(n: BgmNote, t: number, spb: number): void{
        if(n.midi===0||this.ctx===null||this.master===null){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        let o: OscillatorNode=c.createOscillator();
        o.type='square';
        o.frequency.value=midiToFreq(n.midi);
        let g: GainNode=c.createGain();
        let dur: number=n.duration*spb*0.9;
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.01, t+dur);
        o.connect(g);
        g.connect(this.master as GainNode);
        o.start(t);
        o.stop(t+dur+0.02);
    }
    playBass(n: BgmNote, t: number, spb: number): void{
        if(n.midi===0||this.ctx===null||this.master===null){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        let o: OscillatorNode=c.createOscillator();
        o.type='triangle';
        o.frequency.value=midiToFreq(n.midi);
        let g: GainNode=c.createGain();
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.01, t+spb*1.8);
        o.connect(g);
        g.connect(this.master as GainNode);
        o.start(t);
        o.stop(t+spb*2);
    }
    playDrums(step: number, t: number, spb: number): void{
        if(this.ctx===null||this.master===null||!this.hatOn){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        let m: GainNode=this.master as GainNode;
        if(step % 2===0){
            let o: OscillatorNode=c.createOscillator();
            o.type='sine';
            o.frequency.setValueAtTime(step % 4===0?120:180, t);
            o.frequency.exponentialRampToValueAtTime(40, t+0.12);
            let g: GainNode=c.createGain();
            g.gain.setValueAtTime(step % 4===0?0.7:0.4, t);
            g.gain.exponentialRampToValueAtTime(0.01, t+0.12);
            o.connect(g);
            g.connect(m);
            o.start(t);
            o.stop(t+0.15);
        }
        let len: number=Math.floor(c.sampleRate*0.03);
        let buf: AudioBuffer=c.createBuffer(1, len, c.sampleRate);
        let d: Float32Array=buf.getChannelData(0);
        for(let i=0;i<len;i++){
            d[i]=(Math.random()*2-1)*0.25;
        }
        let src: AudioBufferSourceNode=c.createBufferSource();
        src.buffer=buf;
        let hg: GainNode=c.createGain();
        hg.gain.setValueAtTime(0.12, t);
        hg.gain.exponentialRampToValueAtTime(0.01, t+0.03);
        src.connect(hg);
        hg.connect(m);
        src.start(t);
    }
    tone(freq: number, dur: number, type: OscillatorType, vol: number, when: number): void{
        if(this.ctx===null||this.master===null){
            return;
        }
        let c: AudioContext=this.ctx as AudioContext;
        let m: GainNode=this.master as GainNode;
        let o: OscillatorNode=c.createOscillator();
        o.type=type;
        o.frequency.value=freq;
        let g: GainNode=c.createGain();
        g.gain.setValueAtTime(vol, when);
        g.gain.exponentialRampToValueAtTime(0.01, when+dur);
        o.connect(g);
        g.connect(m);
        o.start(when);
        o.stop(when+dur+0.02);
    }
    now(): number{
        if(this.ctx===null){
            return 0;
        }
        return (this.ctx as AudioContext).currentTime;
    }
    arp(notes: Array<number>, gap: number, type: OscillatorType, vol: number): void{
        if(!this.ensureCtx()){
            return;
        }
        let t: number=this.now()+0.01;
        for(let i=0;i<notes.length;i++){
            let f: number=notes[i] as number;
            this.tone(f, 0.12, type, vol, t+i*gap);
        }
    }
    click(): void{
        this.arp([880], 0.05, 'square', 0.22);
    }
    tick(): void{
        this.arp([660], 0.05, 'square', 0.14);
    }
    step(): void{
        this.arp([440], 0.05, 'square', 0.10);
    }
    dice(): void{
        this.arp([392, 523, 659], 0.06, 'square', 0.20);
    }
    coin(): void{
        this.arp([988, 1319], 0.07, 'square', 0.25);
    }
    land(): void{
        this.arp([220], 0.10, 'triangle', 0.30);
    }
    build(): void{
        this.arp([523, 659, 784], 0.07, 'square', 0.25);
    }
    card(): void{
        this.arp([330, 392], 0.08, 'square', 0.22);
    }
    crash(): void{
        this.arp([300, 150, 90, 55], 0.16, 'sawtooth', 0.35);
    }
    bankrupt(): void{
        this.arp([400, 300, 200, 120], 0.14, 'sawtooth', 0.30);
    }
    fanfare(): void{
        this.arp([523, 659, 784, 1047], 0.09, 'square', 0.28);
    }
}
