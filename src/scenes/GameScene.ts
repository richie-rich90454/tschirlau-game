// Core board rendering, movement, space resolution and all game rules.
import Phaser from 'phaser';
import {GameState, STARTING_CREDITS, START_CONCRETE, START_STEEL, START_GLASS, MAX_ROUNDS, COOLING_START_ROUND, CRASH_START_ROUND, interestFor, interestRateFor, stipendFor, maintFor, hypeUpkeepFor, rentFor, marketValueOf, mortgageValueOf, netWorthOf, roll2d6, rollSeverity, rollQuality, BUILD_COSTS} from '../state/GameState.ts';
import type {CrashSeverity, Phase, PlotData, PlayerData} from '../state/GameState.ts';
import {SPACE_TYPES, PLOT_DEFS, colorForSpace, labelForSpace} from '../data/boardData.ts';
import type {PlotDef} from '../data/boardData.ts';
import {hypeDeckFor, RUMORS} from '../data/cardData.ts';
import type {HypeCard, RumorCard} from '../data/cardData.ts';
import {crashEventFor} from '../data/crashData.ts';
import {Board} from '../objects/Board.ts';
import {Space} from '../objects/Space.ts';
export type TurnStage='SETUP'|'ROLL'|'MOVING'|'RESOLVE'|'ACTION'|'GAMEOVER';
export interface AuctionState{plotId: number, bid: number, bidder: number|null, turn: number, active: Array<boolean>}
export const TOKEN_COLORS: Array<number>=[0xef4444, 0x3b82f6, 0xeab308, 0x22c55e, 0xa855f7, 0xf97316];
export class GameScene extends Phaser.Scene{
    state: GameState=new GameState();
    stage: TurnStage='SETUP';
    statusMsg: string='Choose player count to start.';
    lastRoll: number=0;
    mustPay: number=0;
    mustPayTo: number|null=null;
    mustPayWhy: string='';
    pendingBuyPlotId: number|null=null;
    jointPartner: number|null=null;
    jointMine: string|null=null;
    auction: AuctionState|null=null;
    rects: Array<Phaser.GameObjects.Rectangle|null>=[];
    owners: Array<Phaser.GameObjects.Text|null>=[];
    tokens: Array<Phaser.GameObjects.Arc>=[];
    msgText: Phaser.GameObjects.Text|null=null;
    constructor(){
        super('GameScene');
    }
    create(): void{
        this.renderBoardStatic();
        this.msgText=this.add.text(12, this.scale.height-88, this.statusMsg, {fontSize: '13px', color: '#ffffff', wordWrap: {width: 640}});
        this.scene.launch('UIScene');
    }
    renderBoardStatic(): void{
        let w: number=this.scale.width;
        let h: number=this.scale.height-90;
        for(let i=0;i<40;i++){
            let p: {x: number, y: number}=Board.posFor(i, w, h);
            let c: number=colorForSpace(i);
            let r: Phaser.GameObjects.Rectangle=this.add.rectangle(p.x, p.y, 84, 46, c, 1);
            r.setStrokeStyle(2, 0x111111, 1);
            this.rects[i]=r;
            this.add.text(p.x, p.y-12, '' + i + ' ' + labelForSpace(i), {fontSize: '10px', color: '#000000'}).setOrigin(0.5);
            let o: Phaser.GameObjects.Text=this.add.text(p.x, p.y+11, '', {fontSize: '10px', color: '#000000'}).setOrigin(0.5);
            this.owners[i]=o;
        }
    }
    setupGame(n: number): void{
        if(n<2){
            n=2;
        }
        if(n>6){
            n=6;
        }
        let st: GameState=new GameState();
        st.roundNumber=1;
        st.phase='BOOM';
        st.bubbleMeter=0;
        st.crashSeverity=null;
        st.crashRound=null;
        st.developmentStipend=5;
        st.currentPlayerIndex=0;
        st.players=[];
        st.plots=[];
        st.qualitiesRevealed=false;
        st.gameOver=false;
        st.winnerIndex=null;
        st.secondBubbleDeath=false;
        for(let i=0;i<n;i++){
            st.players.push({name: 'Developer ' + (i+1), credits: STARTING_CREDITS, concrete: START_CONCRETE, steel: START_STEEL, glass: START_GLASS, hype: 0, debtToBank: 0, position: 0, isBankrupt: false, ownedPlots: []});
        }
        for(let i=0;i<PLOT_DEFS.length;i++){
            let d: PlotDef|undefined=PLOT_DEFS[i];
            if(d===undefined){
                continue;
            }
            let lvl: number=0;
            if(d.id===0){
                lvl=1;
            }
            st.plots.push({id: d.id, name: d.name, zone: d.zone, baseCost: d.baseCost, boardIndex: d.boardIndex, constructionLevel: lvl, quality: rollQuality(Math.random), isMortgaged: false, mortgageDebt: 0, ownerIndex: null});
        }
        this.state=st;
        this.stage='ROLL';
        this.mustPay=0;
        this.mustPayTo=null;
        this.mustPayWhy='';
        this.pendingBuyPlotId=null;
        this.auction=null;
        this.jointPartner=null;
        this.lastRoll=0;
        this.statusMsg='Round 1 BOOM. ' + (st.players[0] as PlayerData).name + ' to roll.';
        this.spawnTokens();
        this.refreshBoard();
        this.refreshMsg();
    }
    spawnTokens(): void{
        for(let i=0;i<this.tokens.length;i++){
            let t: Phaser.GameObjects.Arc|null=this.tokens[i] as Phaser.GameObjects.Arc|null;
            if(t!==undefined&&t!==null){
                t.destroy();
            }
        }
        this.tokens=[];
        for(let i=0;i<this.state.players.length;i++){
            let col: number=TOKEN_COLORS[i % TOKEN_COLORS.length] as number;
            let c: Phaser.GameObjects.Arc=this.add.circle(20+i*16, 40, 9, col, 1);
            c.setStrokeStyle(2, 0xffffff, 1);
            c.setDepth(10);
            this.tokens.push(c);
        }
        this.placeTokens();
    }
    placeTokens(): void{
        let w: number=this.scale.width;
        let h: number=this.scale.height-90;
        for(let i=0;i<this.state.players.length;i++){
            let p: PlayerData|undefined=this.state.players[i];
            let t: Phaser.GameObjects.Arc|undefined=this.tokens[i];
            if(p===undefined||t===undefined||t===null){
                continue;
            }
            if(p.isBankrupt){
                t.setVisible(false);
                continue;
            }
            t.setVisible(true);
            let bp: {x: number, y: number}=Board.posFor(p.position, w, h);
            let off: {x: number, y: number}=Board.tokenOffset(i);
            t.setPosition(bp.x+off.x, bp.y+off.y);
        }
    }
    refreshMsg(): void{
        if(this.msgText!==null){
            this.msgText.setText(this.statusMsg);
        }
    }
    say(s: string): void{
        this.statusMsg=s;
        this.refreshMsg();
    }
    plotById(id: number): PlotData|null{
        for(let i=0;i<this.state.plots.length;i++){
            let p: PlotData|undefined=this.state.plots[i];
            if(p!==undefined&&p.id===id){
                return p;
            }
        }
        return null;
    }
    plotByBoard(idx: number): PlotData|null{
        for(let i=0;i<this.state.plots.length;i++){
            let p: PlotData|undefined=this.state.plots[i];
            if(p!==undefined&&p.boardIndex===idx){
                return p;
            }
        }
        return null;
    }
    unfinishedCount(pi: number): number{
        let n: number=0;
        for(let i=0;i<this.state.plots.length;i++){
            let p: PlotData|undefined=this.state.plots[i];
            if(p!==undefined&&p.ownerIndex===pi&&(p.constructionLevel===1||p.constructionLevel===2)){
                n=n+1;
            }
        }
        return n;
    }
    maintTotal(pi: number): number{
        let t: number=0;
        for(let i=0;i<this.state.plots.length;i++){
            let p: PlotData|undefined=this.state.plots[i];
            if(p!==undefined&&p.ownerIndex===pi){
                t=t+maintFor(p.constructionLevel, this.state.phase, this.state.crashSeverity, p.quality);
            }
        }
        return t;
    }
    mandatoryTotal(pi: number): number{
        let p: PlayerData|undefined=this.state.players[pi];
        if(p===undefined){
            return 0;
        }
        let m: number=this.maintTotal(pi);
        let intr: number=interestFor(p.debtToBank, this.state.phase, this.state.crashSeverity);
        let h: number=0;
        if(this.state.phase==='CRASH'){
            h=Math.ceil(p.hype*hypeUpkeepFor(this.state.crashSeverity));
        }
        return m+intr+h;
    }
    refreshBoard(): void{
        for(let i=0;i<40;i++){
            let o: Phaser.GameObjects.Text|null=this.owners[i] as Phaser.GameObjects.Text|null;
            if(o===undefined||o===null){
                continue;
            }
            let pl: PlotData|null=this.plotByBoard(i);
            if(pl===null){
                o.setText('');
                continue;
            }
            if(pl.constructionLevel<0){
                o.setText('REMOVED');
                continue;
            }
            if(pl.ownerIndex===null){
                if(this.state.qualitiesRevealed){
                    o.setText('cost ' + pl.baseCost);
                }
                else{
                    o.setText('cost ' + pl.baseCost);
                }
                continue;
            }
            let q: string='';
            if(this.state.qualitiesRevealed||pl.ownerIndex===this.state.currentPlayerIndex){
                if(pl.quality==='GOOD'){
                    q=' G';
                }
                else if(pl.quality==='BAD'){
                    q=' B';
                }
                else{
                    q=' A';
                }
            }
            else{
                q=' ?';
            }
            let mort: string='';
            if(pl.isMortgaged){
                mort=' M';
            }
            o.setText('P' + (pl.ownerIndex+1) + ' L' + pl.constructionLevel + q + mort);
        }
        this.placeTokens();
    }
    rollAndMove(): void{
        if(this.stage!=='ROLL'){
            return;
        }
        if(this.state.gameOver){
            return;
        }
        let p: PlayerData=this.state.getCurrentPlayer();
        if(p.isBankrupt){
            this.advanceTurn();
            return;
        }
        let roll: number=roll2d6(Math.random);
        this.lastRoll=roll;
        this.stage='MOVING';
        this.say(p.name + ' rolled ' + roll + '. Moving...');
        let steps: number=roll;
        let idx: number=0;
        let stepFn: ()=>void=()=>{
            if(idx>=steps){
                this.afterMove();
                return;
            }
            p.position=(p.position+1)%40;
            if(p.position===0){
                let st: number=stipendFor(this.state.phase);
                if(st>0){
                    p.credits=p.credits+st;
                    this.say(p.name + ' passed START +' + st + ' Cr.');
                }
            }
            this.placeTokens();
            idx=idx+1;
            this.time.delayedCall(140, stepFn);
        };
        stepFn();
    }
    afterMove(): void{
        let p: PlayerData=this.state.getCurrentPlayer();
        this.placeTokens();
        this.stage='RESOLVE';
        this.resolveSpace(p.position);
    }
    resolveSpace(boardIdx: number): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let t: string=SPACE_TYPES[boardIdx] as string;
        if(t==='START'){
            this.say(p.name + ' rests at START.');
            this.toAction();
            return;
        }
        if(t==='PLOT'){
            this.resolvePlot(boardIdx);
            return;
        }
        if(t==='HYPE'){
            this.applyHype();
            return;
        }
        if(t==='MAINTENANCE'){
            let m: number=this.maintTotal(pi);
            if(m<=0){
                this.say(p.name + ' has no upkeep. Lucky.');
                this.toAction();
                return;
            }
            if(p.credits>=m){
                p.credits=p.credits-m;
                this.say(p.name + ' paid ' + m + ' Cr upkeep (MAINT space).');
                this.refreshBoard();
                this.toAction();
                return;
            }
            this.mustPay=m;
            this.mustPayTo=null;
            this.mustPayWhy='MAINT space upkeep';
            this.say(p.name + ' cannot pay ' + m + ' Cr upkeep. Mortgage, sell, or go bankrupt, then Pay Due.');
            this.refreshBoard();
            this.stage='ACTION';
            return;
        }
        if(t==='INVESTOR_PITCH'){
            if(st.phase==='CRASH'){
                if(p.hype>0){
                    p.hype=p.hype-1;
                }
                this.say(p.name + ' pitched to empty chairs. -1 Hype.');
            }
            else{
                let g: number=Math.floor(p.hype/2);
                p.credits=p.credits+g;
                this.say(p.name + ' pitched! +' + g + ' Cr for ' + p.hype + ' Hype.');
            }
            this.refreshBoard();
            this.toAction();
            return;
        }
        if(t==='AUCTION'){
            this.startAuction();
            return;
        }
        if(t==='RUMOR'){
            this.applyRumor();
            return;
        }
        if(t==='BANK'){
            this.say(p.name + ' visits the BANK. Use Bank menu: loan, repay, mortgage.');
            this.toAction();
            return;
        }
        if(t==='JOINT_VENTURE'){
            this.say(p.name + ' landed on JOINT VENTURE. Pick a partner in the panel (or Decline).');
            this.toAction();
            return;
        }
        this.toAction();
    }
    resolvePlot(boardIdx: number): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let pl: PlotData|null=this.plotByBoard(boardIdx);
        if(pl===null||pl.constructionLevel<0){
            this.say(p.name + ' found rubble. Nothing happens.');
            this.toAction();
            return;
        }
        if(pl.ownerIndex===null){
            this.pendingBuyPlotId=pl.id;
            this.say(p.name + ' may buy ' + pl.name + ' for ' + pl.baseCost + ' Cr. Confirm in panel.');
            this.stage='ACTION';
            this.refreshBoard();
            return;
        }
        if(pl.ownerIndex===pi){
            this.say(p.name + ' owns ' + pl.name + '. Build in the panel if you like.');
            this.toAction();
            return;
        }
        let owner: PlayerData=st.players[pl.ownerIndex] as PlayerData;
        if(pl.constructionLevel>=3){
            let rent: number=rentFor(pl.constructionLevel, pl.quality);
            if(p.credits>=rent){
                p.credits=p.credits-rent;
                owner.credits=owner.credits+rent;
                this.say(p.name + ' paid ' + rent + ' Cr rent to ' + owner.name + ' for ' + pl.name + '.');
                this.refreshBoard();
                this.toAction();
                return;
            }
            this.mustPay=rent;
            this.mustPayTo=pl.ownerIndex;
            this.mustPayWhy='rent for ' + pl.name;
            this.say(p.name + ' cannot pay ' + rent + ' Cr rent to ' + owner.name + '. Mortgage, sell, or go bankrupt, then Pay Due.');
            this.stage='ACTION';
            this.refreshBoard();
            return;
        }
        p.hype=p.hype+1;
        this.say(p.name + ' smirks at ' + owner.name + '’s half-built ' + pl.name + '. +1 Hype.');
        this.refreshBoard();
        this.toAction();
    }
    applyHype(): void{
        let st: GameState=this.state;
        let p: PlayerData=st.getCurrentPlayer();
        let deck: Array<HypeCard>=hypeDeckFor(st.phase);
        let c: HypeCard=deck[Math.floor(Math.random()*deck.length)] as HypeCard;
        p.credits=p.credits+c.credits;
        p.hype=p.hype+c.hype;
        p.concrete=p.concrete+c.concrete;
        p.steel=p.steel+c.steel;
        p.glass=p.glass+c.glass;
        if(p.hype<0){
            p.hype=0;
        }
        if(p.concrete<0){
            p.concrete=0;
        }
        if(p.steel<0){
            p.steel=0;
        }
        if(p.glass<0){
            p.glass=0;
        }
        if(p.credits<0){
            p.credits=0;
        }
        let b: string=st.addBubble(c.bubbleDelta);
        this.say('HYPE [' + c.name + ']: ' + c.text);
        this.handleBubbleSide(b);
        this.refreshBoard();
        this.toAction();
    }
    applyRumor(): void{
        let st: GameState=this.state;
        let c: RumorCard=RUMORS[Math.floor(Math.random()*RUMORS.length)] as RumorCard;
        if(c.kind==='all-hype-minus1'){
            for(let i=0;i<st.players.length;i++){
                let p: PlayerData|undefined=st.players[i];
                if(p!==undefined&&!p.isBankrupt&&p.hype>0){
                    p.hype=p.hype-1;
                }
            }
            this.say('RUMOR [' + c.name + ']: ' + c.text);
        }
        else if(c.kind==='all-pay1'){
            for(let i=0;i<st.players.length;i++){
                let p: PlayerData|undefined=st.players[i];
                if(p!==undefined&&!p.isBankrupt){
                    if(p.credits>=1){
                        p.credits=p.credits-1;
                    }
                    else{
                        p.credits=0;
                    }
                }
            }
            this.say('RUMOR [' + c.name + ']: ' + c.text);
        }
        else if(c.kind==='all-plus1'){
            for(let i=0;i<st.players.length;i++){
                let p: PlayerData|undefined=st.players[i];
                if(p!==undefined&&!p.isBankrupt){
                    p.hype=p.hype+1;
                    p.credits=p.credits+1;
                }
            }
            this.say('RUMOR [' + c.name + ']: ' + c.text);
        }
        else if(c.kind==='pay-per-unfinished'){
            for(let i=0;i<st.players.length;i++){
                let p: PlayerData|undefined=st.players[i];
                if(p!==undefined&&!p.isBankrupt){
                    let n: number=this.unfinishedCount(i);
                    if(p.credits>=n){
                        p.credits=p.credits-n;
                    }
                    else{
                        p.credits=0;
                    }
                }
            }
            this.say('RUMOR [' + c.name + ']: ' + c.text);
        }
        else{
            let best: number=-1;
            let worst: number=-1;
            let bn: number=-1;
            let wn: number=9999;
            for(let i=0;i<st.players.length;i++){
                let p: PlayerData|undefined=st.players[i];
                if(p===undefined||p.isBankrupt){
                    continue;
                }
                let n: number=this.unfinishedCount(i);
                if(n>bn){
                    bn=n;
                    best=i;
                }
                if(n<wn){
                    wn=n;
                    worst=i;
                }
            }
            if(best>=0){
                let bp: PlayerData|undefined=st.players[best];
                if(bp!==undefined){
                    bp.hype=bp.hype+2;
                }
            }
            if(worst>=0&&worst!==best){
                let wp: PlayerData|undefined=st.players[worst];
                if(wp!==undefined&&wp.hype>0){
                    wp.hype=wp.hype-1;
                }
            }
            this.say('RUMOR [' + c.name + ']: ' + c.text);
        }
        this.refreshBoard();
        this.toAction();
    }
    handleBubbleSide(b: string): void{
        if(b==='early-crash'){
            this.say('BUBBLE 20! Early HARD crash! Assets collapse. Stipend 0.');
        }
        else if(b==='second-death'){
            this.say('BUBBLE 20 after crash. Total collapse! Game over.');
            this.finishByNetWorth();
        }
        else if(b==='warn'){
            this.say(this.statusMsg + ' WARNING: Bubble 15! All pay 2 Cr or lose 1 Hype (auto: paid if possible).');
            for(let i=0;i<this.state.players.length;i++){
                let p: PlayerData|undefined=this.state.players[i];
                if(p!==undefined&&!p.isBankrupt){
                    if(p.credits>=2){
                        p.credits=p.credits-2;
                    }
                    else if(p.hype>0){
                        p.hype=p.hype-1;
                    }
                }
            }
        }
    }
    toAction(): void{
        if(this.state.gameOver){
            this.stage='GAMEOVER';
            return;
        }
        this.stage='ACTION';
        this.refreshBoard();
        this.refreshMsg();
    }
    confirmBuy(): void{
        if(this.pendingBuyPlotId===null){
            return;
        }
        let st: GameState=this.state;
        let p: PlayerData=st.getCurrentPlayer();
        let pl: PlotData|null=this.plotById(this.pendingBuyPlotId);
        if(pl===null||pl.ownerIndex!==null){
            this.pendingBuyPlotId=null;
            return;
        }
        if(p.credits<pl.baseCost){
            this.say(p.name + ' cannot afford ' + pl.name + ' (' + pl.baseCost + ' Cr).');
            return;
        }
        p.credits=p.credits-pl.baseCost;
        pl.ownerIndex=st.currentPlayerIndex;
        p.ownedPlots.push(pl.id);
        this.say(p.name + ' bought ' + pl.name + ' for ' + pl.baseCost + ' Cr.');
        this.pendingBuyPlotId=null;
        this.refreshBoard();
        this.refreshMsg();
    }
    declineBuy(): void{
        this.pendingBuyPlotId=null;
        this.say(this.state.getCurrentPlayer().name + ' passed on the plot.');
    }
    buildOn(id: number, defer: boolean): void{
        let st: GameState=this.state;
        if(this.stage!=='ACTION'){
            return;
        }
        if(st.phase==='CRASH'){
            this.say('No building in CRASH. Too late.');
            return;
        }
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let pl: PlotData|null=this.plotById(id);
        if(pl===null||pl.ownerIndex!==pi||pl.isMortgaged||pl.id===0||pl.constructionLevel>=4||pl.constructionLevel<0){
            this.say('Cannot build there.');
            return;
        }
        let base: {credits: number, concrete: number, steel: number, glass: number}=BUILD_COSTS[pl.constructionLevel+1] as {credits: number, concrete: number, steel: number, glass: number};
        let needC: number=base.concrete;
        let needS: number=base.steel;
        let needG: number=base.glass;
        if(st.phase==='COOLING'){
            needC=Math.ceil(needC*1.5);
            needS=Math.ceil(needS*1.5);
            needG=Math.ceil(needG*1.5);
        }
        if(p.concrete<needC||p.steel<needS||p.glass<needG){
            this.say('Need ' + needC + '/' + needS + '/' + needG + ' C/S/G.');
            return;
        }
        if(p.credits<base.credits){
            if(!defer){
                this.say('Need ' + base.credits + ' Cr. Tick defer to borrow it.');
                return;
            }
            p.concrete=p.concrete-needC;
            p.steel=p.steel-needS;
            p.glass=p.glass-needG;
            p.debtToBank=p.debtToBank+base.credits;
            pl.constructionLevel=pl.constructionLevel+1;
            this.afterBuild(pl);
            return;
        }
        p.concrete=p.concrete-needC;
        p.steel=p.steel-needS;
        p.glass=p.glass-needG;
        p.credits=p.credits-base.credits;
        pl.constructionLevel=pl.constructionLevel+1;
        this.afterBuild(pl);
    }
    afterBuild(pl: PlotData): void{
        let st: GameState=this.state;
        let lvl: number=pl.constructionLevel;
        let d: number=0;
        if(lvl===1){
            d=1;
        }
        else if(lvl===2){
            d=2;
        }
        else if(lvl===3){
            d=-2;
        }
        else if(lvl===4){
            d=-2;
        }
        let b: string=st.addBubble(d);
        this.say(st.getCurrentPlayer().name + ' built ' + pl.name + ' to L' + lvl + '. Bubble ' + st.bubbleMeter + '.');
        this.handleBubbleSide(b);
        this.refreshBoard();
    }
    abandonGrandGate(): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let pl: PlotData|null=this.plotById(0);
        if(pl===null||pl.ownerIndex!==pi){
            return;
        }
        pl.ownerIndex=null;
        pl.constructionLevel=-1;
        pl.isMortgaged=false;
        pl.mortgageDebt=0;
        let k: number=p.ownedPlots.indexOf(0);
        if(k>=0){
            p.ownedPlots.splice(k, 1);
        }
        p.credits=p.credits+5;
        this.say(p.name + ' abandoned the Grand Gate. +5 Cr cleanup grant. Plot removed.');
        this.refreshBoard();
    }
    mortgagePlot(id: number): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let pl: PlotData|null=this.plotById(id);
        if(pl===null||pl.ownerIndex!==pi||pl.isMortgaged||pl.constructionLevel<0){
            this.say('Cannot mortgage that.');
            return;
        }
        let v: number=mortgageValueOf(pl, st.crashSeverity);
        pl.isMortgaged=true;
        pl.mortgageDebt=v;
        p.credits=p.credits+v;
        p.debtToBank=p.debtToBank+v;
        this.say(p.name + ' mortgaged ' + pl.name + ' for +' + v + ' Cr (debt +' + v + ').');
        this.refreshBoard();
    }
    repayMortgage(id: number): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let pl: PlotData|null=this.plotById(id);
        if(pl===null||pl.ownerIndex!==pi||!pl.isMortgaged){
            return;
        }
        if(p.credits<pl.mortgageDebt){
            this.say('Need ' + pl.mortgageDebt + ' Cr to lift mortgage.');
            return;
        }
        p.credits=p.credits-pl.mortgageDebt;
        if(p.debtToBank>=pl.mortgageDebt){
            p.debtToBank=p.debtToBank-pl.mortgageDebt;
        }
        else{
            p.debtToBank=0;
        }
        pl.isMortgaged=false;
        pl.mortgageDebt=0;
        this.say(p.name + ' lifted mortgage on ' + pl.name + '.');
        this.refreshBoard();
    }
    sellMaterial(kind: string, n: number): void{
        let st: GameState=this.state;
        let p: PlayerData=st.getCurrentPlayer();
        if(n<=0){
            return;
        }
        let unit: number=0.5;
        if(st.phase==='CRASH'){
            unit=0.25;
        }
        if(kind==='concrete'){
            if(p.concrete<n){
                return;
            }
            p.concrete=p.concrete-n;
        }
        else if(kind==='steel'){
            if(p.steel<n){
                return;
            }
            p.steel=p.steel-n;
        }
        else{
            if(p.glass<n){
                return;
            }
            p.glass=p.glass-n;
        }
        p.credits=p.credits+Math.floor(n*unit*10)/10;
        this.say(p.name + ' sold ' + n + ' ' + kind + '.');
        this.refreshBoard();
    }
    takeLoan(n: number): void{
        let st: GameState=this.state;
        let p: PlayerData=st.getCurrentPlayer();
        if(n<=0||n>20){
            this.say('Loans are 1..20 Cr.');
            return;
        }
        p.credits=p.credits+n;
        p.debtToBank=p.debtToBank+n;
        let b: string=st.addBubble(0);
        this.say(p.name + ' borrowed ' + n + ' Cr from the BANK. Debt ' + p.debtToBank + '.');
        this.handleBubbleSide(b);
        this.refreshBoard();
    }
    repayDebt(n: number): void{
        let st: GameState=this.state;
        let p: PlayerData=st.getCurrentPlayer();
        if(n<=0){
            return;
        }
        let pay: number=n;
        if(pay>p.credits){
            pay=p.credits;
        }
        if(pay>p.debtToBank){
            pay=p.debtToBank;
        }
        p.credits=p.credits-pay;
        p.debtToBank=p.debtToBank-pay;
        if(pay>=5){
            let b: string=st.addBubble(-Math.floor(pay/5));
            this.handleBubbleSide(b);
        }
        this.say(p.name + ' repaid ' + pay + ' Cr. Debt ' + p.debtToBank + '. Bubble ' + st.bubbleMeter + '.');
        this.refreshBoard();
    }
    payDue(): void{
        if(this.mustPay<=0){
            return;
        }
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        if(p.credits<this.mustPay){
            this.say('Still short ' + (this.mustPay-p.credits) + ' Cr. Mortgage, sell, or bankrupt.');
            return;
        }
        p.credits=p.credits-this.mustPay;
        if(this.mustPayTo!==null){
            let o: PlayerData|undefined=st.players[this.mustPayTo];
            if(o!==undefined){
                o.credits=o.credits+this.mustPay;
            }
        }
        this.say(p.name + ' paid due ' + this.mustPay + ' Cr (' + this.mustPayWhy + ').');
        this.mustPay=0;
        this.mustPayTo=null;
        this.mustPayWhy='';
        this.refreshBoard();
    }
    declareBankruptcy(): void{
        let st: GameState=this.state;
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        for(let i=0;i<st.plots.length;i++){
            let pl: PlotData|undefined=st.plots[i];
            if(pl!==undefined&&pl.ownerIndex===pi){
                pl.ownerIndex=null;
                pl.isMortgaged=false;
                pl.mortgageDebt=0;
            }
        }
        p.ownedPlots=[];
        p.credits=0;
        p.concrete=0;
        p.steel=0;
        p.glass=0;
        p.hype=0;
        p.debtToBank=0;
        p.isBankrupt=true;
        this.mustPay=0;
        this.mustPayTo=null;
        this.mustPayWhy='';
        this.pendingBuyPlotId=null;
        this.auction=null;
        this.say(p.name + ' went BANKRUPT! Assets liquidated at 10%. Debts forgiven. The bank always wins.');
        this.refreshBoard();
        let w: number|null=st.checkVictory();
        if(st.gameOver){
            this.finishGame(w);
            return;
        }
        this.advanceTurn();
    }
    endTurn(): void{
        if(this.stage!=='ACTION'){
            return;
        }
        let st: GameState=this.state;
        if(st.gameOver){
            return;
        }
        if(this.mustPay>0){
            this.payDue();
            if(this.mustPay>0){
                return;
            }
        }
        let pi: number=st.currentPlayerIndex;
        let p: PlayerData=st.players[pi] as PlayerData;
        let due: number=this.mandatoryTotal(pi);
        if(p.credits<due){
            this.mustPay=due;
            this.mustPayTo=null;
            this.mustPayWhy='end-turn bills';
            this.say(p.name + ' owes ' + due + ' Cr (upkeep+interest+hype). Short ' + (due-p.credits) + '. Mortgage, sell, or bankrupt, then End Turn.');
            return;
        }
        let m: number=this.maintTotal(pi);
        let intr: number=interestFor(p.debtToBank, st.phase, st.crashSeverity);
        let hh: number=0;
        if(st.phase==='CRASH'){
            hh=Math.ceil(p.hype*hypeUpkeepFor(st.crashSeverity));
        }
        p.credits=p.credits-due;
        if(due>0){
            this.say(p.name + ' paid bills: upkeep ' + m + ' + interest ' + intr + ' + hype ' + hh + '.');
        }
        let w: number|null=st.checkVictory();
        if(st.gameOver){
            this.finishGame(w);
            return;
        }
        this.advanceTurn();
    }
    advanceTurn(): void{
        let st: GameState=this.state;
        let nxt: number=st.nextAlive(st.currentPlayerIndex);
        if(nxt<=st.currentPlayerIndex){
            st.roundNumber=st.roundNumber+1;
        }
        st.currentPlayerIndex=nxt;
        if(st.roundNumber>MAX_ROUNDS){
            this.finishByNetWorth();
            return;
        }
        let isNewRound: boolean=true;
        let changed: boolean=st.applyPhaseForRound();
        if(changed&&st.phase==='COOLING'){
            this.say('ROUND 11: COOLING. Stipend 2. Costs x1.5. Qualities revealed.');
        }
        if(changed&&st.phase==='CRASH'&&st.crashSeverity===null){
            let sev: CrashSeverity=rollSeverity(Math.random);
            st.crashSeverity=sev;
            st.crashRound=st.roundNumber;
            st.bubbleMeter=0;
            let ev: ReturnType<typeof crashEventFor>=crashEventFor(sev);
            this.say('ROUND ' + st.roundNumber + ' CRASH [' + ev.name + ']: ' + ev.text);
        }
        let p: PlayerData=st.getCurrentPlayer();
        let g0: PlotData|null=this.plotById(0);
        if(g0!==null&&g0.ownerIndex===st.currentPlayerIndex&&g0.constructionLevel>=0){
            p.hype=p.hype+1;
        }
        this.pendingBuyPlotId=null;
        this.auction=null;
        this.jointPartner=null;
        this.mustPay=0;
        this.mustPayTo=null;
        this.mustPayWhy='';
        this.stage='ROLL';
        let w: number|null=st.checkVictory();
        if(st.gameOver){
            this.finishGame(w);
            return;
        }
        if(isNewRound){
            this.say('Round ' + st.roundNumber + ' ' + st.phase + '. ' + p.name + ' to roll. Bubble ' + st.bubbleMeter + '.');
        }
        else{
            this.say(p.name + ' to roll. Bubble ' + st.bubbleMeter + '.');
        }
        this.refreshBoard();
    }
    startAuction(): void{
        let st: GameState=this.state;
        let avail: Array<PlotData>=[];
        for(let i=0;i<st.plots.length;i++){
            let pl: PlotData|undefined=st.plots[i];
            if(pl!==undefined&&pl.ownerIndex===null&&pl.constructionLevel>=0){
                avail.push(pl);
            }
        }
        if(avail.length===0){
            this.say('AUCTION: no plots left.');
            this.toAction();
            return;
        }
        let pick: PlotData=avail[Math.floor(Math.random()*avail.length)] as PlotData;
        let active: Array<boolean>=[];
        for(let i=0;i<st.players.length;i++){
            let pp: PlayerData|undefined=st.players[i];
            active.push(pp!==undefined&&!pp.isBankrupt);
        }
        this.auction={plotId: pick.id, bid: 0, bidder: null, turn: st.currentPlayerIndex, active: active};
        this.say('AUCTION: ' + pick.name + ' (base ' + pick.baseCost + '). Bidding from ' + (st.players[st.currentPlayerIndex] as PlayerData).name + '. Min ' + pick.baseCost + '.');
        this.stage='ACTION';
        this.refreshBoard();
    }
    placeBid(n: number): void{
        if(this.auction===null){
            return;
        }
        let st: GameState=this.state;
        let a: AuctionState=this.auction;
        let pl: PlotData|null=this.plotById(a.plotId);
        if(pl===null){
            this.auction=null;
            return;
        }
        let min: number=a.bid>0?a.bid+1:pl.baseCost;
        if(n<min){
            this.say('Bid at least ' + min + ' Cr.');
            return;
        }
        let p: PlayerData|undefined=st.players[a.turn];
        if(p===undefined||p.isBankrupt||p.credits<n){
            this.say((p as PlayerData).name + ' cannot bid ' + n + '.');
            return;
        }
        a.bid=n;
        a.bidder=a.turn;
        this.say((p as PlayerData).name + ' bids ' + n + ' Cr on ' + pl.name + '.');
        this.nextBidder();
    }
    passBid(): void{
        if(this.auction===null){
            return;
        }
        let st: GameState=this.state;
        let a: AuctionState=this.auction;
        a.active[a.turn]=false;
        this.say((st.players[a.turn] as PlayerData).name + ' passes.');
        this.nextBidder();
    }
    nextBidder(): void{
        if(this.auction===null){
            return;
        }
        let st: GameState=this.state;
        let a: AuctionState=this.auction;
        let left: number=0;
        let last: number=-1;
        for(let i=0;i<a.active.length;i++){
            if(a.active[i]){
                left=left+1;
                last=i;
            }
        }
        if(left<=1){
            this.closeAuction();
            return;
        }
        let n: number=st.players.length;
        for(let k=1;k<=n;k++){
            let j: number=(a.turn+k)%n;
            if(a.active[j]){
                a.turn=j;
                break;
            }
        }
        this.say('Auction: ' + (st.players[a.turn] as PlayerData).name + ' to bid (top ' + a.bid + ').');
    }
    closeAuction(): void{
        if(this.auction===null){
            return;
        }
        let st: GameState=this.state;
        let a: AuctionState=this.auction;
        let pl: PlotData|null=this.plotById(a.plotId);
        this.auction=null;
        if(pl===null){
            this.toAction();
            return;
        }
        if(a.bidder===null||a.bid<=0){
            this.say('Auction: no bids for ' + pl.name + '.');
            this.toAction();
            return;
        }
        let w: PlayerData=st.players[a.bidder] as PlayerData;
        w.credits=w.credits-a.bid;
        pl.ownerIndex=a.bidder;
        w.ownedPlots.push(pl.id);
        this.say(w.name + ' won ' + pl.name + ' for ' + a.bid + ' Cr.');
        this.refreshBoard();
        this.toAction();
    }
    startJoint(partner: number): void{
        let st: GameState=this.state;
        if(partner===st.currentPlayerIndex){
            return;
        }
        let op: PlayerData|undefined=st.players[partner];
        if(op===undefined||op.isBankrupt){
            return;
        }
        this.jointPartner=partner;
        this.jointMine=null;
        this.say(st.getCurrentPlayer().name + ' proposes JOINT with ' + (op as PlayerData).name + '. Both pick Cooperate/Defect.');
    }
    resolveJoint(mine: string, theirs: string): void{
        let st: GameState=this.state;
        if(this.jointPartner===null){
            return;
        }
        let me: PlayerData=st.getCurrentPlayer();
        let op: PlayerData=st.players[this.jointPartner] as PlayerData;
        if(mine==='C'&&theirs==='C'){
            me.credits=me.credits+3;
            op.credits=op.credits+3;
            me.hype=me.hype+1;
            op.hype=op.hype+1;
            this.say('JOINT: both cooperate! +3 Cr +1 Hype each.');
        }
        else if(mine==='D'&&theirs==='D'){
            if(me.credits>=1){
                me.credits=me.credits-1;
            }
            if(op.credits>=1){
                op.credits=op.credits-1;
            }
            if(me.hype>0){
                me.hype=me.hype-1;
            }
            if(op.hype>0){
                op.hype=op.hype-1;
            }
            this.say('JOINT: both defect. -1 Cr -1 Hype each.');
        }
        else if(mine==='D'){
            me.credits=me.credits+5;
            me.hype=me.hype+2;
            if(op.credits>=2){
                op.credits=op.credits-2;
            }
            else{
                op.credits=0;
            }
            if(op.concrete>0){
                op.concrete=op.concrete-1;
            }
            else if(op.steel>0){
                op.steel=op.steel-1;
            }
            else if(op.glass>0){
                op.glass=op.glass-1;
            }
            this.say('JOINT: you defect, ' + op.name + ' cooperates. You +5 Cr +2 Hype.');
        }
        else{
            op.credits=op.credits+5;
            op.hype=op.hype+2;
            if(me.credits>=2){
                me.credits=me.credits-2;
            }
            else{
                me.credits=0;
            }
            if(me.concrete>0){
                me.concrete=me.concrete-1;
            }
            else if(me.steel>0){
                me.steel=me.steel-1;
            }
            else if(me.glass>0){
                me.glass=me.glass-1;
            }
            this.say('JOINT: you cooperate, ' + op.name + ' defects. They +5 Cr +2 Hype.');
        }
        let b: string=st.addBubble(1);
        this.handleBubbleSide(b);
        this.jointPartner=null;
        this.refreshBoard();
    }
    declineJoint(): void{
        let p: PlayerData=this.state.getCurrentPlayer();
        if(p.hype>0){
            p.hype=p.hype-1;
        }
        this.jointPartner=null;
        this.say(p.name + ' declined joint venture. -1 Hype.');
    }
    finishByNetWorth(): void{
        let st: GameState=this.state;
        let alive: Array<number>=st.aliveIndices();
        let best: number|null=null;
        let bestV: number=-999999999;
        for(let i=0;i<alive.length;i++){
            let idx: number=alive[i] as number;
            let p: PlayerData|undefined=st.players[idx];
            if(p!==undefined){
                let v: number=netWorthOf(p, st.plots, st.crashSeverity);
                if(best===null||v>bestV){
                    best=idx;
                    bestV=v;
                }
            }
        }
        st.gameOver=true;
        st.winnerIndex=best;
        this.finishGame(best);
    }
    finishGame(w: number|null): void{
        this.stage='GAMEOVER';
        if(w===null||w===undefined){
            this.say('GAME OVER. No survivors. The bank always wins.');
        }
        else{
            let p: PlayerData=this.state.players[w] as PlayerData;
            let v: number=netWorthOf(p, this.state.plots, this.state.crashSeverity);
            this.say('GAME OVER. Winner: ' + p.name + ' (net ' + v + '). The bank always wins more.');
        }
        this.refreshBoard();
    }
    hudSnapshot(): {round: number, phase: Phase, bubble: number, cur: number, stage: TurnStage, msg: string, rate: number, stipend: number, roll: number, mustPay: number, pendingBuy: number|null, auction: AuctionState|null, joint: number|null, over: boolean, winner: number|null}{
        return {round: this.state.roundNumber, phase: this.state.phase, bubble: this.state.bubbleMeter, cur: this.state.currentPlayerIndex, stage: this.stage, msg: this.statusMsg, rate: interestRateFor(this.state.phase, this.state.crashSeverity), stipend: stipendFor(this.state.phase), roll: this.lastRoll, mustPay: this.mustPay, pendingBuy: this.pendingBuyPlotId, auction: this.auction, joint: this.jointPartner, over: this.state.gameOver, winner: this.state.winnerIndex};
    }
}
