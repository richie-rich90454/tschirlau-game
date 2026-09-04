// Arcade-cabinet HTML overlay: neon HUD, scoreboard strip, modals, CRT scanlines.
import Phaser from 'phaser';
import type {GameScene} from './GameScene.ts';
import {TOKEN_COLORS} from './GameScene.ts';
import {BGMPlayer} from '../utils/BGMPlayer.ts';
const CSS: string=`.tsch-btn{font-family:'Noto Sans Mono',monospace;font-size:20px;background:#12082e;color:#fff;border:2px solid #22d3ee;padding:5px 12px;margin:2px;cursor:pointer;font-weight:700;text-shadow:0 0 6px #22d3ee;box-shadow:0 0 8px rgba(34,211,238,.45),inset 0 0 8px rgba(34,211,238,.15);transition:transform .08s,box-shadow .12s;}
.tsch-btn:hover:not(:disabled){box-shadow:0 0 16px rgba(34,211,238,.9),inset 0 0 10px rgba(34,211,238,.3);transform:translateY(-1px);}
.tsch-btn:active:not(:disabled){transform:scale(.95);}
.tsch-btn:disabled{opacity:.30;cursor:default;box-shadow:none;text-shadow:none;}
.tsch-glow{border-color:#ffd319 !important;text-shadow:0 0 8px #ffd319 !important;box-shadow:0 0 18px rgba(255,211,25,.85) !important;animation:tsch-blink 1s infinite;}
.tsch-in{font-family:'Noto Sans Mono',monospace;font-size:17px;background:#0a0420;color:#ffd319;border:2px solid #b026ff;margin:2px;padding:2px 6px;max-width:150px;}
.tsch-top{background:linear-gradient(180deg,#0a0420,#1a0533) !important;border-bottom:2px solid #ff2e88 !important;box-shadow:0 2px 18px rgba(255,46,136,.5) !important;font-family:'Noto Sans Mono',monospace !important;font-size:21px !important;color:#fff !important;text-shadow:0 0 8px #22d3ee !important;}
.tsch-cards{background:rgba(10,4,32,.93) !important;border-bottom:2px solid #b026ff !important;box-shadow:0 2px 14px rgba(176,38,255,.45) !important;font-family:'Noto Sans Mono',monospace !important;display:flex !important;gap:8px !important;padding:4px 10px !important;flex-wrap:wrap !important;}
.tsch-card{border:1px solid #444466;padding:0 8px;min-width:150px;line-height:1.05;}
.tsch-card-cur{border-color:#ffd319 !important;box-shadow:0 0 12px rgba(255,211,25,.65);}
.tsch-tab{opacity:0.75;}
.tsch-tabon{opacity:1 !important;border-color:#ffd319 !important;text-shadow:0 0 8px #ffd319 !important;box-shadow:0 0 14px rgba(255,211,25,.7) !important;}
.tsch-tabpage{width:100%;}
.tsch-side{position:absolute;top:40px;bottom:34px;width:250px;background:rgba(10,4,32,.94);border:2px solid #b026ff;box-shadow:0 0 16px rgba(176,38,255,.5);overflow-y:auto;padding:8px;pointer-events:auto;}
.tsch-right{right:6px;width:270px;border-color:#22d3ee;box-shadow:0 0 16px rgba(34,211,238,.5);}
.tsch-left{left:6px;}
.tsch-group{border:1px solid #444466;padding:4px 6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center;}
.tsch-glabel{width:100%;font-size:15px;color:#ff71ce;letter-spacing:3px;}
.tsch-insp{color:#22d3ee;font-size:21px;min-height:24px;white-space:nowrap;overflow:hidden;text-shadow:0 0 8px rgba(34,211,238,.6);}
.tsch-marq{animation:tsch-slide 7s linear infinite alternate;}
@keyframes tsch-slide{0%{transform:translateX(0);}100%{transform:translateX(var(--tsch-shift,0px));}}
.tsch-bot{background:linear-gradient(0deg,#0a0420,#1a0533) !important;border-top:2px solid #22d3ee !important;box-shadow:0 -2px 18px rgba(34,211,238,.4) !important;font-family:'Noto Sans Mono',monospace !important;}
.tsch-msg{color:#ffd319;font-size:21px;min-height:24px;white-space:nowrap;overflow:hidden;text-shadow:0 0 8px rgba(255,211,25,.6);}
.tsch-due{color:#ff5b5b !important;text-shadow:0 0 10px #ff0000 !important;animation:tsch-blink .6s infinite;}
.tsch-modal{position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);background:rgba(13,4,36,.97);color:#fff;padding:18px;pointer-events:auto;border:3px solid #ff2e88;box-shadow:0 0 28px rgba(255,46,136,.75);font-family:'Noto Sans Mono',monospace;font-size:21px;max-width:380px;z-index:60;animation:tsch-pop .18s ease-out;}
.tsch-rules{max-width:640px;max-height:80vh;overflow:auto;top:50%;}
.tsch-h{color:#ffd319;margin:12px 0 4px;font-size:22px;text-shadow:0 0 8px rgba(255,211,25,.6);}
.tsch-title{font-family:'Noto Sans Mono',monospace;font-weight:700;font-size:15px;color:#ffd319;text-shadow:0 0 10px #ff2e88;margin-bottom:10px;line-height:1.6;}
.tsch-ttl{font-weight:700;color:#ffd319;font-size:21px;text-shadow:0 0 10px #ff2e88;}
.tsch-sub{color:#22d3ee;margin-bottom:8px;}
.tsch-bubwrap{display:inline-block;width:100px;height:12px;border:1px solid #22d3ee;background:#0a0420;margin-left:6px;vertical-align:middle;}
.tsch-bubfill{display:inline-block;height:10px;background:linear-gradient(90deg,#22d3ee,#b026ff);box-shadow:0 0 8px #22d3ee;vertical-align:top;}
.tsch-bubhot{background:linear-gradient(90deg,#ff2e88,#ff0000) !important;box-shadow:0 0 8px #ff0000 !important;}
.tsch-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);z-index:50;}
.tsch-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.52) 100%);z-index:51;}
@keyframes tsch-blink{0%,100%{opacity:1;}50%{opacity:.30;}}
@keyframes tsch-pop{0%{transform:translate(-50%,-50%) scale(.7);opacity:0;}100%{transform:translate(-50%,-50%) scale(1);opacity:1;}}`;
export class UIScene extends Phaser.Scene{
    game2: GameScene|null=null;
    root: HTMLElement|null=null;
    topBar: HTMLElement|null=null;
    plist: HTMLElement|null=null;
    msg: HTMLElement|null=null;
    botEl: HTMLElement|null=null;
    lastInspector: string='';
    inspUntil: number=0;
    playersOpen: boolean=true;
    btns: Record<string, HTMLButtonElement>={};
    setupBox: HTMLElement|null=null;
    buyBox: HTMLElement|null=null;
    buildSel: HTMLSelectElement|null=null;
    deferBox: HTMLInputElement|null=null;
    loanIn: HTMLInputElement|null=null;
    repayIn: HTMLInputElement|null=null;
    bidIn: HTMLInputElement|null=null;
    jointSel: HTMLSelectElement|null=null;
    controlsOpen: boolean=true;
    leftEl: HTMLElement|null=null;
    rightEl: HTMLElement|null=null;
    activeTab: string='build';
    appliedTab: string='';
    prevDeal: boolean=false;
    tabBtns: Record<string, HTMLButtonElement>={};
    tabBuild: HTMLElement|null=null;
    tabBank: HTMLElement|null=null;
    tabDeals: HTMLElement|null=null;
    rulesBox: HTMLElement|null=null;
    bgmOn: boolean=false;
    constructor(){
        super('UIScene');
    }
    create(): void{
        this.game2=this.scene.get('GameScene') as unknown as GameScene;
        this.injectCss();
        this.buildRoot();
        this.buildSetup();
        this.buildRules();
        this.time.addEvent({delay: 300, loop: true, callback: ()=>{this.refresh();}});
        let key: (which: string)=>void=(which: string)=>{
            let a: Element|null=document.activeElement;
            if(a!==null&&(a.tagName==='INPUT'||a.tagName==='SELECT')){
                return;
            }
            if(which==='roll'&&!(this.btns['roll'] as HTMLButtonElement).disabled){
                this.g().rollAndMove();
            }
            if(which==='end'&&!(this.btns['end'] as HTMLButtonElement).disabled){
                this.g().endTurn();
            }
        };
        this.input.keyboard?.on('keydown-R', ()=>{key('roll');});
        this.input.keyboard?.on('keydown-E', ()=>{key('end');});
        this.input.keyboard?.on('keydown-M', ()=>{this.toggleBgm(this.btns['bgm'] as HTMLButtonElement);});
        this.input.keyboard?.on('keydown-B', ()=>{
            if(!(this.btns['build'] as HTMLButtonElement).disabled){
                let s2: HTMLSelectElement=this.buildSel as HTMLSelectElement;
                let d2: HTMLInputElement=this.deferBox as HTMLInputElement;
                this.g().buildOn(parseInt(s2.value, 10), d2.checked);
            }
        });
        this.playersOpen=window.innerWidth>=1100;
        (this.btns['players'] as HTMLButtonElement).textContent=this.playersOpen?'PLAYERS: HIDE':'PLAYERS: SHOW';
        this.controlsOpen=window.innerWidth>=1100;
        (this.btns['controls'] as HTMLButtonElement).textContent=this.controlsOpen?'CONTROLS: HIDE':'CONTROLS: SHOW';
        this.refresh();
    }
    injectCss(): void{
        let st: HTMLStyleElement=document.createElement('style');
        st.textContent=CSS;
        document.head.appendChild(st);
    }
    el(tag: string, css: string, parent: HTMLElement, text: string): HTMLElement{
        let e: HTMLElement=document.createElement(tag);
        e.setAttribute('style', css);
        e.textContent=text;
        parent.appendChild(e);
        return e;
    }
    btn(label: string, parent: HTMLElement, fn: ()=>void): HTMLButtonElement{
        let b: HTMLButtonElement=document.createElement('button');
        b.textContent=label;
        b.className='tsch-btn';
        b.addEventListener('click', fn);
        b.addEventListener('click', ()=>{
            BGMPlayer.instance().click();
        });
        parent.appendChild(b);
        return b;
    }
    buildRoot(): void{
        let r: HTMLElement=document.createElement('div');
        r.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;font-family:\'Noto Sans Mono\',monospace;z-index:10;');
        document.body.appendChild(r);
        this.root=r;
        let top: HTMLElement=document.createElement('div');
        top.className='tsch-top';
        top.setAttribute('style', 'position:absolute;top:0;left:0;right:0;padding:6px 10px;pointer-events:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;');
        r.appendChild(top);
        this.topBar=top;
        let left: HTMLElement=document.createElement('div');
        left.className='tsch-side tsch-left';
        left.setAttribute('style', 'color:#fff;font-size:18px;');
        r.appendChild(left);
        this.leftEl=left;
        let pl: HTMLElement=document.createElement('div');
        pl.className='tsch-cards';
        pl.setAttribute('style', 'color:#fff;font-size:18px;');
        left.appendChild(pl);
        this.plist=pl;
        let bot: HTMLElement=document.createElement('div');
        bot.className='tsch-bot';
        bot.setAttribute('style', 'position:absolute;bottom:0;left:0;right:0;color:#fff;padding:6px 10px;font-size:18px;pointer-events:auto;');
        r.appendChild(bot);
        this.botEl=bot;
        let brow: HTMLElement=document.createElement('div');
        brow.setAttribute('style', 'display:flex;gap:12px;');
        bot.appendChild(brow);
        let m: HTMLElement=document.createElement('div');
        m.className='tsch-msg';
        m.setAttribute('style', 'flex:1;min-width:0;');
        brow.appendChild(m);
        this.msg=m;
        let right: HTMLElement=document.createElement('div');
        right.className='tsch-side tsch-right';
        r.appendChild(right);
        this.rightEl=right;
        let row: HTMLElement=document.createElement('div');
        row.setAttribute('style', 'display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;');
        right.appendChild(row);
        let gCore: HTMLElement=document.createElement('div');
        gCore.className='tsch-group';
        row.appendChild(gCore);
        this.glabel(gCore, 'ALWAYS');
        this.btns['roll']=this.btn('ROLL DICE [R]', gCore, ()=>{this.g().rollAndMove();});
        this.btns['pay']=this.btn('PAY AMOUNT DUE', gCore, ()=>{this.g().payDue();});
        this.btns['end']=this.btn('END TURN [E]', gCore, ()=>{this.g().endTurn();});
        this.btns['bankrupt']=this.btn('DECLARE BANKRUPTCY', gCore, ()=>{this.g().declareBankruptcy();});
        let tb1: HTMLButtonElement=this.btn('BUILD', gCore, ()=>{this.setTab('build');});
        tb1.classList.add('tsch-tab');
        let tb2: HTMLButtonElement=this.btn('BANK', gCore, ()=>{this.setTab('bank');});
        tb2.classList.add('tsch-tab');
        let tb3: HTMLButtonElement=this.btn('DEALS', gCore, ()=>{this.setTab('deals');});
        tb3.classList.add('tsch-tab');
        this.tabBtns['build']=tb1;
        this.tabBtns['bank']=tb2;
        this.tabBtns['deals']=tb3;
        let tabBuild: HTMLElement=document.createElement('div');
        tabBuild.className='tsch-group tsch-tabpage';
        row.appendChild(tabBuild);
        this.tabBuild=tabBuild;
        this.glabel(tabBuild, 'BUILD');
        let bs: HTMLSelectElement=document.createElement('select');
        bs.className='tsch-in';
        tabBuild.appendChild(bs);
        this.buildSel=bs;
        let dl: HTMLElement=document.createElement('label');
        dl.setAttribute('style', 'font-size:17px;color:#ff71ce;');
        tabBuild.appendChild(dl);
        let dc: HTMLInputElement=document.createElement('input');
        dc.type='checkbox';
        dl.appendChild(dc);
        dl.appendChild(document.createTextNode('defer payment'));
        this.deferBox=dc;
        this.btns['build']=this.btn('BUILD LEVEL [B]', tabBuild, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            let d: HTMLInputElement=this.deferBox as HTMLInputElement;
            this.g().buildOn(parseInt(s.value, 10), d.checked);
        });
        this.btns['mort']=this.btn('MORTGAGE', tabBuild, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().mortgagePlot(parseInt(s.value, 10));
        });
        this.btns['unmort']=this.btn('LIFT MORTGAGE', tabBuild, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().repayMortgage(parseInt(s.value, 10));
        });
        this.btns['abandon']=this.btn('ABANDON GATE', tabBuild, ()=>{this.g().abandonGrandGate();});
        let tabBank: HTMLElement=document.createElement('div');
        tabBank.className='tsch-group tsch-tabpage';
        tabBank.setAttribute('style', 'display:none;');
        row.appendChild(tabBank);
        this.tabBank=tabBank;
        this.glabel(tabBank, 'BANK');
        let li: HTMLInputElement=document.createElement('input');
        li.placeholder='loan 1 to 20';
        li.className='tsch-in';
        li.setAttribute('style', 'width:110px;');
        tabBank.appendChild(li);
        this.loanIn=li;
        this.btns['loan']=this.btn('TAKE LOAN', tabBank, ()=>{this.g().takeLoan(parseInt((this.loanIn as HTMLInputElement).value || '0', 10));});
        let ri: HTMLInputElement=document.createElement('input');
        ri.placeholder='repayment amount';
        ri.className='tsch-in';
        ri.setAttribute('style', 'width:130px;');
        tabBank.appendChild(ri);
        this.repayIn=ri;
        this.btns['repay']=this.btn('REPAY DEBT', tabBank, ()=>{this.g().repayDebt(parseInt((this.repayIn as HTMLInputElement).value || '0', 10));});
        this.btns['sellC']=this.btn('SELL CONCRETE', tabBank, ()=>{this.g().sellMaterial('concrete', 1);});
        this.btns['sellS']=this.btn('SELL STEEL', tabBank, ()=>{this.g().sellMaterial('steel', 1);});
        this.btns['sellG']=this.btn('SELL GLASS', tabBank, ()=>{this.g().sellMaterial('glass', 1);});
        let tabDeals: HTMLElement=document.createElement('div');
        tabDeals.className='tsch-group tsch-tabpage';
        tabDeals.setAttribute('style', 'display:none;');
        row.appendChild(tabDeals);
        this.tabDeals=tabDeals;
        this.glabel(tabDeals, 'DEALS');
        let bi: HTMLInputElement=document.createElement('input');
        bi.placeholder='bid amount';
        bi.className='tsch-in';
        bi.setAttribute('style', 'width:100px;');
        tabDeals.appendChild(bi);
        this.bidIn=bi;
        this.btns['bid']=this.btn('PLACE BID', tabDeals, ()=>{this.g().placeBid(parseInt((this.bidIn as HTMLInputElement).value || '0', 10));});
        this.btns['pass']=this.btn('PASS BID', tabDeals, ()=>{this.g().passBid();});
        let js: HTMLSelectElement=document.createElement('select');
        js.className='tsch-in';
        js.setAttribute('style', 'max-width:150px;');
        tabDeals.appendChild(js);
        this.jointSel=js;
        this.btns['joint']=this.btn('START JOINT VENTURE', tabDeals, ()=>{this.g().startJoint(parseInt((this.jointSel as HTMLSelectElement).value || '0', 10));});
        this.btns['coop']=this.btn('COOPERATE', tabDeals, ()=>{this.jointPick('C');});
        this.btns['defect']=this.btn('DEFECT', tabDeals, ()=>{this.jointPick('D');});
        this.btns['declineJ']=this.btn('DECLINE VENTURE', tabDeals, ()=>{this.g().declineJoint();});
        let bg: HTMLButtonElement=this.btn('BGM: OFF', top, ()=>{this.toggleBgm(bg);});
        this.btns['bgm']=bg;
        this.btn('RULES', top, ()=>{this.showRules(true);});
        this.btns['players']=this.btn('PLAYERS: HIDE', top, ()=>{this.togglePlayers();});
        this.btns['controls']=this.btn('CONTROLS: HIDE', top, ()=>{this.toggleControls();});
        let bb: HTMLElement=document.createElement('div');
        bb.className='tsch-modal';
        bb.setAttribute('style', 'display:none;');
        r.appendChild(bb);
        this.buyBox=bb;
        let scan: HTMLElement=document.createElement('div');
        scan.className='tsch-scan';
        r.appendChild(scan);
        let vig: HTMLElement=document.createElement('div');
        vig.className='tsch-vig';
        r.appendChild(vig);
    }
    g(): GameScene{
        return this.game2 as GameScene;
    }
    toggleBgm(b: HTMLButtonElement): void{
        let p: BGMPlayer=BGMPlayer.instance();
        if(this.bgmOn){
            p.stop();
            this.bgmOn=false;
            b.textContent='BGM: OFF';
        }
        else{
            p.play();
            this.bgmOn=true;
            b.textContent='BGM: ON';
        }
    }
    togglePlayers(): void{
        this.playersOpen=!this.playersOpen;
        (this.btns['players'] as HTMLButtonElement).textContent=this.playersOpen?'PLAYERS: HIDE':'PLAYERS: SHOW';
    }
    toggleControls(): void{
        this.controlsOpen=!this.controlsOpen;
        (this.btns['controls'] as HTMLButtonElement).textContent=this.controlsOpen?'CONTROLS: HIDE':'CONTROLS: SHOW';
    }
    jointPick(mine: string): void{
        let gs: GameScene=this.g();
        if(gs.jointPartner===null){
            return;
        }
        let theirs: string=Math.random()<0.5?'C':'D';
        gs.resolveJoint(mine, theirs);
    }
    buildSetup(): void{
        let r: HTMLElement=this.root as HTMLElement;
        let b: HTMLElement=document.createElement('div');
        b.className='tsch-modal';
        r.appendChild(b);
        this.setupBox=b;
        this.el('div', '', b, '').className='tsch-title';
        (b.children[0] as HTMLElement).textContent='TSCHIRLAU';
        this.el('div', '', b, '').className='tsch-sub';
        (b.children[1] as HTMLElement).textContent='HOW MANY TYCOONS? (HOT-SEAT 2-6)';
        let s: HTMLSelectElement=document.createElement('select');
        s.className='tsch-in';
        for(let i=2;i<=6;i++){
            let o: HTMLOptionElement=document.createElement('option');
            o.value='' + i;
            o.textContent='' + i + ' PLAYERS';
            if(i===3){
                o.selected=true;
            }
            s.appendChild(o);
        }
        b.appendChild(s);
        this.btn('START (MUSIC ON)', b, ()=>{
            this.g().setupGame(parseInt(s.value, 10));
            b.style.display='none';
            if(!this.bgmOn){
                let p: BGMPlayer=BGMPlayer.instance();
                p.play();
                this.bgmOn=true;
                (this.btns['bgm'] as HTMLButtonElement).textContent='BGM: ON';
            }
        });
    }
    buildRules(): void{
        let r: HTMLElement=this.root as HTMLElement;
        let b: HTMLElement=document.createElement('div');
        b.className='tsch-modal tsch-rules';
        b.setAttribute('style', 'display:none;');
        r.appendChild(b);
        this.rulesBox=b;
        let t0: HTMLElement=this.el('div', '', b, 'HOW TO PLAY');
        t0.className='tsch-title';
        let h0: HTMLElement=this.el('div', '', b, 'GOAL');
        h0.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'LAST SOLVENT TYCOON WINS. 20 ROUNDS MAX. If several survive round 20, the highest net worth wins: credits minus debt, plus materials, plus plot values. The bank always wins more.');
        let h1: HTMLElement=this.el('div', '', b, 'YOUR TURN');
        h1.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, '1 ROLL [R]: move 2d6 spaces clockwise. Passing START pays the stipend. 2 RESOLVE the space you land on. 3 ACT: build, mortgage, use the bank, bid in auctions, pick joint partners. 4 END [E]: pay all bills. Short on cash? Mortgage plots, sell materials, then PAY DUE. Nothing left? Go BANKRUPT.');
        let h2: HTMLElement=this.el('div', '', b, 'STIPEND');
        h2.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Every time you pass START: +5 credits in BOOM, +2 in COOLING, +0 in CRASH. Landing exactly on START just rests.');
        let h3: HTMLElement=this.el('div', '', b, 'BILLS (END TURN)');
        h3.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Upkeep for every unfinished plot (levels 1-2 only) + bank interest + hype upkeep in CRASH. Interest = floor(debt x rate / 10). Rates: BOOM 1, COOLING 2, CRASH 5 / 3 / 2 for HARD / MEDIUM / SOFT. Upkeep levels 1 and 2: BOOM 1/2, COOLING 2/4, CRASH HARD 3/6, MEDIUM 2/4, SOFT 1/2. GOOD plots -1 upkeep, BAD plots +1. Hype upkeep = your hype x 2 / 1 / 0.5, rounded up.');
        let h4: HTMLElement=this.el('div', '', b, 'BUILDING');
        h4.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Build on any plot you own: Level 1 Gate costs 1 concrete + 1 steel + 2 credits. Level 2 Half-Built costs 2 concrete + 2 steel + 1 glass + 5 credits. Level 3 Tower costs 2 concrete + 2 steel + 2 glass + 8 credits. Level 4 Luxury costs 3 concrete + 3 steel + 3 glass + 12 credits. COOLING multiplies materials x1.5 (rounded up). DEFER borrows the credit part from the bank. Never on mortgaged plots, never on Gate 0, never during CRASH.');
        let h5: HTMLElement=this.el('div', '', b, 'RENT AND QUALITY');
        h5.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Finished towers charge visitors RENT: Level 3 pays 6, Level 4 pays 12, times 1.5 for GOOD, 1.0 for AVERAGE, 0.5 for BAD plots. Unfinished hulks charge nothing and give the visitor +1 HYPE instead. Gate 0 starts built, cannot be upgraded, pays its owner +1 HYPE every turn, mortgages for 0, and abandoning it pays +5 and removes it forever. On the board, the level line is green, amber or red for GOOD, AVERAGE or BAD plots.');
        let h6: HTMLElement=this.el('div', '', b, 'BUBBLE METER');
        h6.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Building Level 1 adds +1, Level 2 adds +2, finishing Level 3 or Level 4 removes 2. Repaying 5+ credits removes 1 per 5. At 15 during COOLING everyone pays 2 credits or loses 1 hype. At 20 the bubble bursts into an early HARD crash. A second 20 after the crash ends everything instantly and the richest ruin wins.');
        let h7: HTMLElement=this.el('div', '', b, 'THE CRASH');
        h7.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Strikes at round 16 unless the bubble bursts first. Severity is drawn: 40% HARD, 35% MEDIUM, 25% SOFT. Plot values drop 80% / 50% / 30%. Interest becomes 5 / 3 / 2 per 10 credits of debt. Every hype costs 2 / 1 / 0.5 credits per turn. Stipend is 0 and building is over. Qualities are public from round 11 on.');
        let h8: HTMLElement=this.el('div', '', b, 'SPACES');
        h8.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'PLOT: buy it for base price if free, pay rent if finished, gain hype if half-built. HYPE: draw a card of the current phase. MAINT: pay all upkeep immediately. PITCH: gain floor(hype / 2) credits, or lose 1 hype in CRASH. AUCTION: a random free plot goes clockwise from you, minimum = base price, pass anytime. RUMOR: a global event hits every player. BANK: loans of 1-20, repay debt, mortgage and lift, sell materials. JOINT: pick a partner, both secretly pick COOP or DEFECT.');
        let h9: HTMLElement=this.el('div', '', b, 'JOINT VENTURE PAYOFFS');
        h9.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Both COOP: +3 credits and +1 hype each. Both DEFECT: -1 credit and -1 hype each. You DEFECT: +5 credits and +2 hype for you, partner pays 2 credits and loses 1 material. You COOP alone: the reverse. Every venture adds +1 bubble. Declining costs 1 hype.');
        let h10: HTMLElement=this.el('div', '', b, 'MORTGAGE AND DEBT');
        h10.className='tsch-h';
        this.el('div', 'line-height:1.35;', b, 'Mortgaging pays 50% of market value (already crash-adjusted) but adds the same amount to your bank debt. Lift it by repaying the mortgage. Materials sell for 0.5 credits each (0.25 in CRASH). Bank loans of 1-20 anytime. Repay debt anytime to cut interest and calm the bubble.');
        let h11: HTMLElement=this.el('div', '', b, 'BANKRUPTCY');
        h11.className='tsch-h';
        this.el('div', 'line-height:1.35;margin-bottom:8px;', b, 'Your plots return to the market, your stats are zeroed, your debts die with you, and you are out. The others keep playing. Last solvent tycoon takes the city.');
        this.btn('CLOSE', b, ()=>{this.showRules(false);});
    }
    showRules(v: boolean): void{
        if(this.rulesBox!==null){
            this.rulesBox.style.display=v?'block':'none';
        }
    }
    glabel(parent: HTMLElement, text: string): void{
        let l: HTMLElement=document.createElement('div');
        l.className='tsch-glabel';
        l.textContent=text;
        parent.appendChild(l);
    }
    marq(e: HTMLElement|null): void{
        if(e===null){
            return;
        }
        let d: number=e.clientWidth-e.scrollWidth;
        if(d<-4){
            e.style.setProperty('--tsch-shift', '' + d + 'px');
            e.classList.add('tsch-marq');
        }
        else{
            e.classList.remove('tsch-marq');
        }
    }
    setTab(n: string): void{
        this.activeTab=n;
        this.applyTab();
    }
    applyTab(): void{
        if(this.appliedTab===this.activeTab){
            return;
        }
        this.appliedTab=this.activeTab;
        let pages: Record<string, HTMLElement|null>={build: this.tabBuild, bank: this.tabBank, deals: this.tabDeals};
        for(let k in pages){
            let pg: HTMLElement|null|undefined=pages[k];
            if(pg!==undefined&&pg!==null){
                pg.style.display=k===this.activeTab?'flex':'none';
            }
            let tb: HTMLButtonElement|undefined=this.tabBtns[k];
            if(tb!==undefined){
                if(k===this.activeTab){
                    tb.classList.add('tsch-tabon');
                }
                else{
                    tb.classList.remove('tsch-tabon');
                }
            }
        }
    }
    topBarHeight(): number{
        if(this.topBar!==null){
            return this.topBar.offsetHeight;
        }
        return 36;
    }
    bottomHeight(): number{
        if(this.botEl!==null){
            return this.botEl.offsetHeight;
        }
        return 190;
    }
    refresh(): void{
        if(this.game2===null){
            return;
        }
        let gs: GameScene=this.g();
        let s: ReturnType<GameScene['hudSnapshot']>=gs.hudSnapshot();
        this.registry.set('hudTop', this.topBarHeight());
        this.registry.set('hudBottom', this.bottomHeight());
        let wide: boolean=window.innerWidth>=1100;
        let lw: number=0;
        if(wide&&this.playersOpen&&this.leftEl!==null){
            lw=this.leftEl.offsetWidth;
        }
        let rw: number=0;
        if(wide&&this.controlsOpen&&this.rightEl!==null){
            rw=this.rightEl.offsetWidth;
        }
        this.registry.set('hudLeft', lw);
        this.registry.set('hudRight', rw);
        if(this.leftEl!==null){
            this.leftEl.style.display=this.playersOpen?'block':'none';
        }
        if(this.rightEl!==null){
            this.rightEl.style.display=this.controlsOpen?'block':'none';
        }
        let wantDeal: boolean=s.auction!==null||s.joint!==null;
        if(wantDeal&&!this.prevDeal){
            this.activeTab='deals';
        }
        if(!wantDeal&&this.prevDeal){
            this.activeTab='build';
        }
        this.prevDeal=wantDeal;
        this.applyTab();
        if(this.topBar!==null){
            this.topBar.textContent='';
            let ttl: HTMLElement=document.createElement('span');
            ttl.className='tsch-ttl';
            ttl.textContent='TSCHIRLAU · GRAND GATE MIRAGE';
            this.topBar.appendChild(ttl);
            let bg: HTMLButtonElement=this.btns['bgm'] as HTMLButtonElement;
            this.topBar.appendChild(bg);
            let rb: HTMLButtonElement=document.createElement('button');
            rb.textContent='RULES';
            rb.className='tsch-btn';
            rb.addEventListener('click', ()=>{this.showRules(true);});
            this.topBar.appendChild(rb);
            if(this.plist!==null){
                this.plist.style.top=this.topBar.offsetHeight + 'px';
            }
        }
        if(this.plist!==null){
            this.plist.style.display=this.playersOpen?'flex':'none';
            this.plist.textContent='';
            let gc: HTMLElement=document.createElement('div');
            gc.className='tsch-card';
            this.plist.appendChild(gc);
            this.el('div', 'font-size:20px;color:#ffd319;', gc, 'ROUND ' + s.round + ' OF 20 · ' + s.phase);
            let grow: HTMLElement=document.createElement('div');
            grow.setAttribute('style', 'display:flex;align-items:center;gap:6px;');
            gc.appendChild(grow);
            this.el('div', 'color:#c9c9e3;font-size:17px;', grow, 'BUBBLE ' + s.bubble);
            let wrap0: HTMLElement=document.createElement('span');
            wrap0.className='tsch-bubwrap';
            grow.appendChild(wrap0);
            let fill0: HTMLElement=document.createElement('span');
            fill0.className='tsch-bubfill' + (s.bubble>=15?' tsch-bubhot':'');
            fill0.setAttribute('style', 'width:' + Math.min(100, s.bubble*5) + 'px;');
            wrap0.appendChild(fill0);
            let pname: string='NOBODY';
            let pp: (typeof gs.state.players)[number]|undefined=gs.state.players[s.cur];
            if(pp!==undefined){
                pname=(pp as {name: string}).name.toUpperCase();
            }
            this.el('div', 'color:#c9c9e3;font-size:17px;', gc, pname + ' TO MOVE · ' + s.stage + ' · INTEREST ' + s.rate + ' PER 10 · STIPEND ' + s.stipend + ' · LAST ROLL ' + s.roll);
            for(let i=0;i<gs.state.players.length;i++){
                let p: (typeof gs.state.players)[number]=gs.state.players[i] as (typeof gs.state.players)[number];
                let hex: string='#' + (TOKEN_COLORS[i % TOKEN_COLORS.length] as number).toString(16).padStart(6, '0');
                let card: HTMLElement=document.createElement('div');
                card.className='tsch-card' + (i===s.cur?' tsch-card-cur':'');
                this.plist.appendChild(card);
                let head: HTMLElement=this.el('div', 'font-size:20px;color:' + hex + ';' + (i===s.cur?'text-shadow:0 0 10px ' + hex + ';':''), card, '');
                head.textContent=(i===s.cur?'> ':'') + p.name + (p.isBankrupt?' X BANKRUPT':'');
                this.el('div', 'color:#c9c9e3;font-size:17px;', card, '' + p.credits + ' CREDITS · DEBT ' + p.debtToBank + ' · HYPE ' + p.hype + ' · CONCRETE ' + p.concrete + ' · STEEL ' + p.steel + ' · GLASS ' + p.glass + ' · SPACE ' + p.position + ' · PLOTS ' + p.ownedPlots.length);
            }
        }
        let nowMs: number=Date.now();
        if(s.inspector!==this.lastInspector){
            this.lastInspector=s.inspector;
            this.inspUntil=nowMs+8000;
        }
        let showInsp: boolean=nowMs<this.inspUntil&&s.inspector!=='';
        if(this.msg!==null){
            this.msg.textContent=showInsp?s.inspector:s.msg;
            this.msg.className='tsch-msg' + (!showInsp&&s.mustPay>0?' tsch-due':'');
            if(showInsp){
                this.msg.style.setProperty('--tsch-shift', '0px');
                this.msg.classList.remove('tsch-marq');
            }
            this.marq(this.msg);
        }
        let canAct: boolean=s.stage==='ACTION'&&!s.over;
        let canRoll: boolean=s.stage==='ROLL'&&!s.over;
        (this.btns['roll'] as HTMLButtonElement).disabled=!canRoll;
        (this.btns['roll'] as HTMLButtonElement).className='tsch-btn' + (canRoll?' tsch-glow':'');
        (this.btns['end'] as HTMLButtonElement).disabled=!canAct;
        (this.btns['pay'] as HTMLButtonElement).disabled=!(canAct&&s.mustPay>0);
        (this.btns['build'] as HTMLButtonElement).disabled=!canAct;
        if(this.buildSel!==null){
            let sel: HTMLSelectElement=this.buildSel;
            let cur: string=sel.value;
            sel.textContent='';
            for(let i=0;i<gs.state.plots.length;i++){
                let pl: (typeof gs.state.plots)[number]=gs.state.plots[i] as (typeof gs.state.plots)[number];
                if(pl.ownerIndex===s.cur&&pl.constructionLevel>=0){
                    let o: HTMLOptionElement=document.createElement('option');
                    o.value='' + pl.id;
                    o.textContent=pl.name + ' L' + pl.constructionLevel + (pl.isMortgaged?' M':'');
                    sel.appendChild(o);
                }
            }
            if(sel.options.length===0){
                let o: HTMLOptionElement=document.createElement('option');
                o.value='-1';
                o.textContent='(no plots)';
                sel.appendChild(o);
            }
            else{
                let ok: boolean=false;
                for(let i=0;i<sel.options.length;i++){
                    if(sel.options[i]!==undefined&&(sel.options[i] as HTMLOptionElement).value===cur){
                        ok=true;
                    }
                }
                if(ok){
                    sel.value=cur;
                }
                if(s.selected!==null){
                    sel.value='' + s.selected;
                    this.g().selectedPlotId=null;
                }
            }
        }
        if(this.jointSel!==null){
            let js: HTMLSelectElement=this.jointSel;
            js.textContent='';
            for(let i=0;i<gs.state.players.length;i++){
                let p: (typeof gs.state.players)[number]=gs.state.players[i] as (typeof gs.state.players)[number];
                if(i!==s.cur&&!p.isBankrupt){
                    let o: HTMLOptionElement=document.createElement('option');
                    o.value='' + i;
                    o.textContent=p.name;
                    js.appendChild(o);
                }
            }
        }
        if(this.buyBox!==null){
            let bb: HTMLElement=this.buyBox;
            if(s.pendingBuy!==null&&canAct){
                let pl: (typeof gs.state.plots)[number]|undefined=undefined;
                for(let i=0;i<gs.state.plots.length;i++){
                    let q: (typeof gs.state.plots)[number]=gs.state.plots[i] as (typeof gs.state.plots)[number];
                    if(q.id===s.pendingBuy){
                        pl=q;
                    }
                }
                bb.style.display='block';
                bb.textContent='';
                this.el('div', '', bb, '').className='tsch-title';
                (bb.children[0] as HTMLElement).textContent='BUY ' + (pl as {name: string}).name + ' FOR ' + (pl as {baseCost: number}).baseCost + ' CREDITS?';
                this.el('div', 'margin-bottom:8px;', bb, (pl as {zone: string}).zone + ' ZONE · LEVEL 0 EMPTY LOT');
                this.btn('YES', bb, ()=>{gs.confirmBuy();});
                this.btn('NO', bb, ()=>{gs.declineBuy();});
            }
            else if(s.auction!==null&&canAct){
                let pl: (typeof gs.state.plots)[number]|undefined=undefined;
                for(let i=0;i<gs.state.plots.length;i++){
                    let q: (typeof gs.state.plots)[number]=gs.state.plots[i] as (typeof gs.state.plots)[number];
                    if(s.auction!==undefined&&s.auction!==null&&q.id===(s.auction as {plotId: number}).plotId){
                        pl=q;
                    }
                }
                bb.style.display='block';
                bb.textContent='';
                this.el('div', '', bb, '').className='tsch-title';
                (bb.children[0] as HTMLElement).textContent='AUCTION ' + (pl as {name: string}).name;
                let ab: string='NO BIDS YET';
                let auB: number|null=(s.auction as {bidder: number|null}).bidder;
                if(auB!==null){
                    let bp2: (typeof gs.state.players)[number]|undefined=gs.state.players[auB];
                    if(bp2!==undefined){
                        ab=(bp2 as {name: string}).name.toUpperCase();
                    }
                }
                let at: string='';
                let auT: number=(s.auction as {turn: number}).turn;
                let tp: (typeof gs.state.players)[number]|undefined=gs.state.players[auT];
                if(tp!==undefined){
                    at=(tp as {name: string}).name.toUpperCase();
                }
                this.el('div', 'margin-bottom:8px;', bb, 'TOP BID ' + (s.auction as {bid: number}).bid + ' CREDITS BY ' + ab + ' · TURN: ' + at + ' · PLACE A BID OR PASS.');
            }
            else{
                bb.style.display='none';
            }
        }
        if(s.over&&this.setupBox!==null){
            this.setupBox.style.display='block';
            this.setupBox.textContent='';
            this.el('div', '', this.setupBox, '').className='tsch-title';
            (this.setupBox.children[0] as HTMLElement).textContent='GAME OVER';
            this.el('div', 'margin-bottom:8px;', this.setupBox, s.msg);
            this.btn('REMATCH (SAME COUNT)', this.setupBox, ()=>{
                this.g().setupGame(this.g().state.players.length);
                (this.setupBox as HTMLElement).style.display='none';
            });
        }
    }
}
