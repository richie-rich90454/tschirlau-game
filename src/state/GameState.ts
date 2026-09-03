// Central game state, types, constants and phase logic.
export type Phase='BOOM'|'COOLING'|'CRASH';
export type CrashSeverity='HARD'|'MEDIUM'|'SOFT';
export type PlotQuality='GOOD'|'AVERAGE'|'BAD';
export type SpaceType='START'|'PLOT'|'HYPE'|'MAINTENANCE'|'INVESTOR_PITCH'|'AUCTION'|'RUMOR'|'BANK'|'JOINT_VENTURE';
export interface Cost{credits: number, concrete: number, steel: number, glass: number}
export interface PlotData{id: number, name: string, zone: string, baseCost: number, boardIndex: number, constructionLevel: number, quality: PlotQuality|null, isMortgaged: boolean, mortgageDebt: number, ownerIndex: number|null}
export interface PlayerData{name: string, credits: number, concrete: number, steel: number, glass: number, hype: number, debtToBank: number, position: number, isBankrupt: boolean, ownedPlots: Array<number>}
export const STARTING_CREDITS: number=20;
export const START_CONCRETE: number=2;
export const START_STEEL: number=1;
export const START_GLASS: number=1;
export const BASE_INTEREST_RATE: number=1;
export const COOLING_INTEREST_RATE: number=2;
export const CRASH_INTEREST_HARD: number=5;
export const CRASH_INTEREST_MEDIUM: number=3;
export const CRASH_INTEREST_SOFT: number=2;
export const BOOM_STIPEND: number=5;
export const COOLING_STIPEND: number=2;
export const CRASH_STIPEND: number=0;
export const BOOM_MAINT_L1: number=1;
export const BOOM_MAINT_L2: number=2;
export const COOLING_MAINT_L1: number=2;
export const COOLING_MAINT_L2: number=4;
export const CRASH_MAINT_L1_HARD: number=3;
export const CRASH_MAINT_L2_HARD: number=6;
export const CRASH_MAINT_L1_MEDIUM: number=2;
export const CRASH_MAINT_L2_MEDIUM: number=4;
export const CRASH_MAINT_L1_SOFT: number=1;
export const CRASH_MAINT_L2_SOFT: number=2;
export const HYPE_UPKEEP_HARD: number=2;
export const HYPE_UPKEEP_MEDIUM: number=1;
export const HYPE_UPKEEP_SOFT: number=0.5;
export const MAX_ROUNDS: number=20;
export const COOLING_START_ROUND: number=11;
export const CRASH_START_ROUND: number=16;
export const BUBBLE_WARN: number=15;
export const BUBBLE_CRASH: number=20;
export const BUILD_COSTS: Array<Cost>=[{credits: 0, concrete: 0, steel: 0, glass: 0}, {credits: 2, concrete: 1, steel: 1, glass: 0}, {credits: 5, concrete: 2, steel: 2, glass: 1}, {credits: 8, concrete: 2, steel: 2, glass: 2}, {credits: 12, concrete: 3, steel: 3, glass: 3}];
export const RENT_BASE_L3: number=6;
export const RENT_BASE_L4: number=12;
export function qualityRentMult(q: PlotQuality|null): number{
    if(q==='GOOD'){
        return 1.5;
    }
    else if(q==='BAD'){
        return 0.5;
    }
    else{
        return 1;
    }
}
export function rentFor(level: number, q: PlotQuality|null): number{
    if(level===4){
        return Math.floor(RENT_BASE_L4*qualityRentMult(q));
    }
    else if(level===3){
        return Math.floor(RENT_BASE_L3*qualityRentMult(q));
    }
    else{
        return 0;
    }
}
export function interestRateFor(phase: Phase, sev: CrashSeverity|null): number{
    if(phase==='BOOM'){
        return BASE_INTEREST_RATE;
    }
    else if(phase==='COOLING'){
        return COOLING_INTEREST_RATE;
    }
    else{
        if(sev==='HARD'){
            return CRASH_INTEREST_HARD;
        }
        else if(sev==='SOFT'){
            return CRASH_INTEREST_SOFT;
        }
        else{
            return CRASH_INTEREST_MEDIUM;
        }
    }
}
export function stipendFor(phase: Phase): number{
    if(phase==='BOOM'){
        return BOOM_STIPEND;
    }
    else if(phase==='COOLING'){
        return COOLING_STIPEND;
    }
    else{
        return CRASH_STIPEND;
    }
}
export function maintFor(level: number, phase: Phase, sev: CrashSeverity|null, q: PlotQuality|null): number{
    let m: number=0;
    if(level===1){
        if(phase==='BOOM'){
            m=BOOM_MAINT_L1;
        }
        else if(phase==='COOLING'){
            m=COOLING_MAINT_L1;
        }
        else{
            if(sev==='HARD'){
                m=CRASH_MAINT_L1_HARD;
            }
            else if(sev==='SOFT'){
                m=CRASH_MAINT_L1_SOFT;
            }
            else{
                m=CRASH_MAINT_L1_MEDIUM;
            }
        }
    }
    else if(level===2){
        if(phase==='BOOM'){
            m=BOOM_MAINT_L2;
        }
        else if(phase==='COOLING'){
            m=COOLING_MAINT_L2;
        }
        else{
            if(sev==='HARD'){
                m=CRASH_MAINT_L2_HARD;
            }
            else if(sev==='SOFT'){
                m=CRASH_MAINT_L2_SOFT;
            }
            else{
                m=CRASH_MAINT_L2_MEDIUM;
            }
        }
    }
    else{
        return 0;
    }
    if(q==='GOOD'){
        m=m-1;
    }
    else if(q==='BAD'){
        m=m+1;
    }
    if(m<0){
        m=0;
    }
    return m;
}
export function hypeUpkeepFor(sev: CrashSeverity|null): number{
    if(sev==='HARD'){
        return HYPE_UPKEEP_HARD;
    }
    else if(sev==='SOFT'){
        return HYPE_UPKEEP_SOFT;
    }
    else{
        return HYPE_UPKEEP_MEDIUM;
    }
}
export function assetDropFor(sev: CrashSeverity|null): number{
    if(sev==='HARD'){
        return 0.8;
    }
    else if(sev==='SOFT'){
        return 0.3;
    }
    else{
        return 0.5;
    }
}
export function interestFor(debt: number, phase: Phase, sev: CrashSeverity|null): number{
    if(debt<=0){
        return 0;
    }
    return Math.floor(debt*interestRateFor(phase, sev)/10);
}
export function roll2d6(rng: ()=>number): number{
    let a: number=Math.floor(rng()*6)+1;
    let b: number=Math.floor(rng()*6)+1;
    return a+b;
}
export function rollSeverity(rng: ()=>number): CrashSeverity{
    let r: number=rng();
    if(r<0.4){
        return 'HARD';
    }
    else if(r<0.75){
        return 'MEDIUM';
    }
    else{
        return 'SOFT';
    }
}
export function rollQuality(rng: ()=>number): PlotQuality{
    let r: number=rng();
    if(r<0.25){
        return 'GOOD';
    }
    else if(r<0.65){
        return 'AVERAGE';
    }
    else{
        return 'BAD';
    }
}
export function netWorthOf(p: PlayerData, plots: Array<PlotData>, sev: CrashSeverity|null): number{
    let v: number=p.credits-p.debtToBank;
    v=v+(p.concrete+p.steel+p.glass);
    for(let i=0;i<plots.length;i++){
        let pl: PlotData|undefined=plots[i];
        if(pl!==undefined&&pl.ownerIndex!==null){
            if(p.ownedPlots.indexOf(pl.id)>=0){
                v=v+marketValueOf(pl, sev);
            }
        }
    }
    return v;
}
export function marketValueOf(pl: PlotData, sev: CrashSeverity|null): number{
    let mult: number=1;
    if(pl.constructionLevel===3){
        mult=1.5;
    }
    else if(pl.constructionLevel===4){
        mult=2;
    }
    let v: number=Math.floor(pl.baseCost*mult);
    if(sev!==null){
        v=Math.floor(v*(1-assetDropFor(sev)));
    }
    if(pl.id===0){
        v=0;
    }
    return v;
}
export function mortgageValueOf(pl: PlotData, sev: CrashSeverity|null): number{
    return Math.floor(marketValueOf(pl, sev)/2);
}
export class GameState{
    roundNumber: number=1;
    phase: Phase='BOOM';
    bubbleMeter: number=0;
    crashSeverity: CrashSeverity|null=null;
    crashRound: number|null=null;
    developmentStipend: number=5;
    currentPlayerIndex: number=0;
    players: Array<PlayerData>=[];
    plots: Array<PlotData>=[];
    qualitiesRevealed: boolean=false;
    gameOver: boolean=false;
    winnerIndex: number|null=null;
    secondBubbleDeath: boolean=false;
    constructor(){
    }
    getCurrentPlayer(): PlayerData{
        return this.players[this.currentPlayerIndex] as PlayerData;
    }
    aliveCount(): number{
        let n: number=0;
        for(let i=0;i<this.players.length;i++){
            let p: PlayerData|undefined=this.players[i];
            if(p!==undefined&&!p.isBankrupt){
                n=n+1;
            }
        }
        return n;
    }
    aliveIndices(): Array<number>{
        let out: Array<number>=[];
        for(let i=0;i<this.players.length;i++){
            let p: PlayerData|undefined=this.players[i];
            if(p!==undefined&&!p.isBankrupt){
                out.push(i);
            }
        }
        return out;
    }
    nextAlive(from: number): number{
        let n: number=this.players.length;
        for(let k=1;k<=n;k++){
            let j: number=(from+k)%n;
            let p: PlayerData|undefined=this.players[j];
            if(p!==undefined&&!p.isBankrupt){
                return j;
            }
        }
        return from;
    }
    applyPhaseForRound(): boolean{
        let changed: boolean=false;
        if(this.roundNumber>=CRASH_START_ROUND&&this.phase!=='CRASH'){
            this.phase='CRASH';
            this.developmentStipend=CRASH_STIPEND;
            this.qualitiesRevealed=true;
            changed=true;
        }
        else if(this.roundNumber>=COOLING_START_ROUND&&this.roundNumber<CRASH_START_ROUND&&this.phase==='BOOM'){
            this.phase='COOLING';
            this.developmentStipend=COOLING_STIPEND;
            this.qualitiesRevealed=true;
            changed=true;
        }
        return changed;
    }
    addBubble(d: number): string{
        this.bubbleMeter=this.bubbleMeter+d;
        if(this.bubbleMeter<0){
            this.bubbleMeter=0;
        }
        if(this.bubbleMeter>=BUBBLE_CRASH){
            if(this.phase!=='CRASH'){
                this.phase='CRASH';
                this.crashSeverity='HARD';
                this.crashRound=this.roundNumber;
                this.developmentStipend=CRASH_STIPEND;
                this.qualitiesRevealed=true;
                return 'early-crash';
            }
            else{
                this.secondBubbleDeath=true;
                this.gameOver=true;
                return 'second-death';
            }
        }
        if(this.bubbleMeter>=BUBBLE_WARN&&this.phase==='COOLING'){
            return 'warn';
        }
        return 'ok';
    }
    checkVictory(): number|null{
        let alive: Array<number>=this.aliveIndices();
        if(alive.length===1){
            this.gameOver=true;
            this.winnerIndex=alive[0] as number;
            return this.winnerIndex;
        }
        if(alive.length===0){
            this.gameOver=true;
            this.winnerIndex=null;
            return null;
        }
        if(this.roundNumber>MAX_ROUNDS||this.secondBubbleDeath){
            this.gameOver=true;
            let best: number|null=null;
            let bestV: number=-999999999;
            for(let i=0;i<alive.length;i++){
                let idx: number=alive[i] as number;
                let p: PlayerData|undefined=this.players[idx];
                if(p!==undefined){
                    let v: number=netWorthOf(p, this.plots, this.crashSeverity);
                    if(best===null||v>bestV){
                        best=idx;
                        bestV=v;
                    }
                }
            }
            this.winnerIndex=best;
            return best;
        }
        return null;
    }
}
