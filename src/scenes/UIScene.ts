// Arcade-cabinet HTML overlay: neon HUD, scoreboard strip, modals, CRT scanlines.
import Phaser from 'phaser';
import type {GameScene} from './GameScene.ts';
import {TOKEN_COLORS} from './GameScene.ts';
import {BGMPlayer} from '../utils/BGMPlayer.ts';
const CSS: string=`.tsch-btn{font-family:'VT323',monospace;font-size:18px;background:#12082e;color:#fff;border:2px solid #22d3ee;padding:3px 10px;margin:2px;cursor:pointer;text-shadow:0 0 6px #22d3ee;box-shadow:0 0 8px rgba(34,211,238,.45),inset 0 0 8px rgba(34,211,238,.15);transition:transform .08s,box-shadow .12s;}
.tsch-btn:hover:not(:disabled){box-shadow:0 0 16px rgba(34,211,238,.9),inset 0 0 10px rgba(34,211,238,.3);transform:translateY(-1px);}
.tsch-btn:active:not(:disabled){transform:scale(.95);}
.tsch-btn:disabled{opacity:.30;cursor:default;box-shadow:none;text-shadow:none;}
.tsch-glow{border-color:#ffd319 !important;text-shadow:0 0 8px #ffd319 !important;box-shadow:0 0 18px rgba(255,211,25,.85) !important;animation:tsch-blink 1s infinite;}
.tsch-in{font-family:'VT323',monospace;font-size:17px;background:#0a0420;color:#ffd319;border:2px solid #b026ff;margin:2px;padding:2px 6px;max-width:150px;}
.tsch-top{background:linear-gradient(180deg,#0a0420,#1a0533) !important;border-bottom:2px solid #ff2e88 !important;box-shadow:0 2px 18px rgba(255,46,136,.5) !important;font-family:'VT323',monospace !important;font-size:21px !important;color:#fff !important;text-shadow:0 0 8px #22d3ee !important;}
.tsch-cards{background:rgba(10,4,32,.93) !important;border-bottom:2px solid #b026ff !important;box-shadow:0 2px 14px rgba(176,38,255,.45) !important;font-family:'VT323',monospace !important;display:flex !important;gap:8px !important;padding:4px 10px !important;flex-wrap:wrap !important;}
.tsch-card{border:1px solid #444466;padding:0 8px;min-width:150px;line-height:1.05;}
.tsch-card-cur{border-color:#ffd319 !important;box-shadow:0 0 12px rgba(255,211,25,.65);}
.tsch-bot{background:linear-gradient(0deg,#0a0420,#1a0533) !important;border-top:2px solid #22d3ee !important;box-shadow:0 -2px 18px rgba(34,211,238,.4) !important;font-family:'VT323',monospace !important;}
.tsch-msg{color:#ffd319;font-size:21px;min-height:24px;text-shadow:0 0 8px rgba(255,211,25,.6);}
.tsch-due{color:#ff5b5b !important;text-shadow:0 0 10px #ff0000 !important;animation:tsch-blink .6s infinite;}
.tsch-modal{position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);background:rgba(13,4,36,.97);color:#fff;padding:18px;pointer-events:auto;border:3px solid #ff2e88;box-shadow:0 0 28px rgba(255,46,136,.75);font-family:'VT323',monospace;font-size:21px;max-width:380px;z-index:60;animation:tsch-pop .18s ease-out;}
.tsch-rules{max-width:600px;max-height:78vh;overflow:auto;}
.tsch-title{font-family:'Press Start 2P',monospace;font-size:15px;color:#ffd319;text-shadow:0 0 10px #ff2e88;margin-bottom:10px;line-height:1.6;}
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
    btns: Record<string, HTMLButtonElement>={};
    setupBox: HTMLElement|null=null;
    buyBox: HTMLElement|null=null;
    buildSel: HTMLSelectElement|null=null;
    deferBox: HTMLInputElement|null=null;
    loanIn: HTMLInputElement|null=null;
    repayIn: HTMLInputElement|null=null;
    bidIn: HTMLInputElement|null=null;
    jointSel: HTMLSelectElement|null=null;
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
        r.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;font-family:\'VT323\',monospace;z-index:10;');
        document.body.appendChild(r);
        this.root=r;
        let top: HTMLElement=document.createElement('div');
        top.className='tsch-top';
        top.setAttribute('style', 'position:absolute;top:0;left:0;right:0;padding:6px 10px;pointer-events:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;');
        r.appendChild(top);
        this.topBar=top;
        let pl: HTMLElement=document.createElement('div');
        pl.className='tsch-cards';
        pl.setAttribute('style', 'position:absolute;top:34px;left:0;right:0;color:#fff;font-size:18px;pointer-events:auto;');
        r.appendChild(pl);
        this.plist=pl;
        let bot: HTMLElement=document.createElement('div');
        bot.className='tsch-bot';
        bot.setAttribute('style', 'position:absolute;bottom:0;left:0;right:0;color:#fff;padding:6px 10px;font-size:18px;pointer-events:auto;');
        r.appendChild(bot);
        let m: HTMLElement=document.createElement('div');
        m.className='tsch-msg';
        bot.appendChild(m);
        this.msg=m;
        let row: HTMLElement=document.createElement('div');
        row.setAttribute('style', 'display:flex;gap:4px;flex-wrap:wrap;align-items:center;');
        bot.appendChild(row);
        this.btns['roll']=this.btn('ROLL [R]', row, ()=>{this.g().rollAndMove();});
        this.btns['pay']=this.btn('PAY DUE', row, ()=>{this.g().payDue();});
        this.btns['end']=this.btn('END [E]', row, ()=>{this.g().endTurn();});
        this.btns['bankrupt']=this.btn('BANKRUPT', row, ()=>{this.g().declareBankruptcy();});
        let bs: HTMLSelectElement=document.createElement('select');
        bs.className='tsch-in';
        row.appendChild(bs);
        this.buildSel=bs;
        let dl: HTMLElement=document.createElement('label');
        dl.setAttribute('style', 'font-size:17px;color:#ff71ce;');
        row.appendChild(dl);
        let dc: HTMLInputElement=document.createElement('input');
        dc.type='checkbox';
        dl.appendChild(dc);
        dl.appendChild(document.createTextNode('defer'));
        this.deferBox=dc;
        this.btns['build']=this.btn('BUILD', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            let d: HTMLInputElement=this.deferBox as HTMLInputElement;
            this.g().buildOn(parseInt(s.value, 10), d.checked);
        });
        this.btns['mort']=this.btn('MORTGAGE', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().mortgagePlot(parseInt(s.value, 10));
        });
        this.btns['unmort']=this.btn('LIFT MORT', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().repayMortgage(parseInt(s.value, 10));
        });
        this.btns['abandon']=this.btn('ABANDON GATE', row, ()=>{this.g().abandonGrandGate();});
        let li: HTMLInputElement=document.createElement('input');
        li.placeholder='loan 1-20';
        li.className='tsch-in';
        li.setAttribute('style', 'width:80px;');
        row.appendChild(li);
        this.loanIn=li;
        this.btns['loan']=this.btn('LOAN', row, ()=>{this.g().takeLoan(parseInt((this.loanIn as HTMLInputElement).value || '0', 10));});
        let ri: HTMLInputElement=document.createElement('input');
        ri.placeholder='repay N';
        ri.className='tsch-in';
        ri.setAttribute('style', 'width:80px;');
        row.appendChild(ri);
        this.repayIn=ri;
        this.btns['repay']=this.btn('REPAY', row, ()=>{this.g().repayDebt(parseInt((this.repayIn as HTMLInputElement).value || '0', 10));});
        this.btns['sellC']=this.btn('SELL C', row, ()=>{this.g().sellMaterial('concrete', 1);});
        this.btns['sellS']=this.btn('SELL S', row, ()=>{this.g().sellMaterial('steel', 1);});
        this.btns['sellG']=this.btn('SELL G', row, ()=>{this.g().sellMaterial('glass', 1);});
        let bi: HTMLInputElement=document.createElement('input');
        bi.placeholder='bid N';
        bi.className='tsch-in';
        bi.setAttribute('style', 'width:64px;');
        row.appendChild(bi);
        this.bidIn=bi;
        this.btns['bid']=this.btn('BID', row, ()=>{this.g().placeBid(parseInt((this.bidIn as HTMLInputElement).value || '0', 10));});
        this.btns['pass']=this.btn('PASS', row, ()=>{this.g().passBid();});
        let js: HTMLSelectElement=document.createElement('select');
        js.className='tsch-in';
        js.setAttribute('style', 'max-width:120px;');
        row.appendChild(js);
        this.jointSel=js;
        this.btns['joint']=this.btn('JOINT?', row, ()=>{this.g().startJoint(parseInt((this.jointSel as HTMLSelectElement).value || '0', 10));});
        this.btns['coop']=this.btn('COOP', row, ()=>{this.jointPick('C');});
        this.btns['defect']=this.btn('DEFECT', row, ()=>{this.jointPick('D');});
        this.btns['declineJ']=this.btn('NO JOINT', row, ()=>{this.g().declineJoint();});
        let bg: HTMLButtonElement=this.btn('BGM: OFF', top, ()=>{this.toggleBgm(bg);});
        this.btns['bgm']=bg;
        this.btn('RULES', top, ()=>{this.showRules(true);});
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
        this.el('div', '', b, '').className='tsch-title';
        (b.children[0] as HTMLElement).textContent='HOW TO PLAY';
        this.el('div', 'margin-bottom:8px;color:#ffd319;', b, 'LAST SOLVENT TYCOON WINS. 20 ROUNDS MAX.');
        this.el('div', 'line-height:1.35;', b, 'ROLL 2d6, move, resolve the space. Passing START pays stipend (BOOM 5, COOLING 2, CRASH 0). END TURN pays upkeep (L1/L2 only) + bank interest + hype upkeep in CRASH. BROKE? Mortgage plots (50% value, debt rises), sell materials, or go BANKRUPT (assets freed, you are out). BUILD L1-L4 on owned plots (never mortgaged, never Gate 0, never in CRASH). COOLING x1.5 materials. DEFER borrows the credit cost. Unowned plots can be bought on landing. Finished towers (L3/L4) charge RENT; half-built hulks give visitors +1 HYPE. GATE 0 starts built, cannot upgrade, pays its owner +1 HYPE per turn, mortgages for 0, abandon pays +5 and removes it. BUBBLE: L1 +1, L2 +2, L3/L4 -2, repaying 5 credits -1. At 15 in COOLING everyone pays 2 or loses hype. At 20 the bubble bursts early (HARD). CRASH hits round 16 (random HARD/MEDIUM/SOFT): assets drop 80/50/30%, interest 5/3/2, hype upkeep 2/1/0.5. A second 20 ends everything. Highest net worth takes the ruins at round 20.');
        this.btn('CLOSE', b, ()=>{this.showRules(false);});
    }
    showRules(v: boolean): void{
        if(this.rulesBox!==null){
            this.rulesBox.style.display=v?'block':'none';
        }
    }
    refresh(): void{
        if(this.game2===null){
            return;
        }
        let gs: GameScene=this.g();
        let s: ReturnType<GameScene['hudSnapshot']>=gs.hudSnapshot();
        if(this.topBar!==null){
            this.topBar.textContent='';
            let info: HTMLElement=document.createElement('span');
            info.textContent='RD ' + s.round + '/20 | ' + s.phase + ' | BUB ' + s.bubble + ' | P' + (s.cur+1) + ' | ' + s.stage + ' | INT ' + s.rate + '/10 | STIP ' + s.stipend + ' | DICE ' + s.roll + (s.mustPay>0?' | !! DUE ' + s.mustPay + ' !!':'');
            this.topBar.appendChild(info);
            let wrap: HTMLElement=document.createElement('span');
            wrap.className='tsch-bubwrap';
            this.topBar.appendChild(wrap);
            let fill: HTMLElement=document.createElement('span');
            fill.className='tsch-bubfill' + (s.bubble>=15?' tsch-bubhot':'');
            fill.setAttribute('style', 'width:' + Math.min(100, s.bubble*5) + 'px;');
            wrap.appendChild(fill);
            let bg: HTMLButtonElement=this.btns['bgm'] as HTMLButtonElement;
            this.topBar.appendChild(bg);
            let rb: HTMLButtonElement=document.createElement('button');
            rb.textContent='RULES';
            rb.className='tsch-btn';
            rb.addEventListener('click', ()=>{this.showRules(true);});
            this.topBar.appendChild(rb);
        }
        if(this.plist!==null){
            this.plist.textContent='';
            for(let i=0;i<gs.state.players.length;i++){
                let p: (typeof gs.state.players)[number]=gs.state.players[i] as (typeof gs.state.players)[number];
                let hex: string='#' + (TOKEN_COLORS[i % TOKEN_COLORS.length] as number).toString(16).padStart(6, '0');
                let card: HTMLElement=document.createElement('div');
                card.className='tsch-card' + (i===s.cur?' tsch-card-cur':'');
                this.plist.appendChild(card);
                let head: HTMLElement=this.el('div', 'font-size:20px;color:' + hex + ';' + (i===s.cur?'text-shadow:0 0 10px ' + hex + ';':''), card, '');
                head.textContent=(i===s.cur?'> ':'') + p.name + (p.isBankrupt?' X BANKRUPT':'');
                this.el('div', 'color:#c9c9e3;font-size:17px;', card, '' + p.credits + 'CR DEBT' + p.debtToBank + ' H' + p.hype + ' C' + p.concrete + ' S' + p.steel + ' G' + p.glass + ' @' + p.position + ' PLOTS' + p.ownedPlots.length);
            }
        }
        if(this.msg!==null){
            this.msg.textContent=s.msg;
            this.msg.className='tsch-msg' + (s.mustPay>0?' tsch-due':'');
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
                (bb.children[0] as HTMLElement).textContent='BUY ' + (pl as {name: string}).name + ' FOR ' + (pl as {baseCost: number}).baseCost + ' CR?';
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
                this.el('div', 'margin-bottom:8px;', bb, 'TOP ' + (s.auction as {bid: number}).bid + ' BY P' + (((s.auction as {bidder: number|null}).bidder??-1)+1) + ' - TURN P' + ((s.auction as {turn: number}).turn+1) + '. BID OR PASS.');
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
