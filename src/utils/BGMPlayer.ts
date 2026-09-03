// Procedural 8-bit BGM player using Web Audio API. Cycles track 1 and 2.
import {TRACK1_MELODY, TRACK1_BASS, TRACK1_BPM, TRACK2_MELODY, TRACK2_BASS, TRACK2_BPM, midiToFreq} from '../data/bgmData.ts';
import type {BgmNote} from '../data/bgmData.ts';
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
}
