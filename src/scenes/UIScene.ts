// HTML overlay HUD, buttons and modals. Polls GameScene and calls its methods.
import Phaser from 'phaser';
import type {GameScene} from './GameScene.ts';
import {BGMPlayer} from '../utils/BGMPlayer.ts';
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
        this.buildRoot();
        this.buildSetup();
        this.buildRules();
        this.time.addEvent({delay: 300, loop: true, callback: ()=>{this.refresh();}});
        this.refresh();
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
        b.setAttribute('style', 'margin:2px;padding:4px 8px;font-size:12px;cursor:pointer;');
        b.addEventListener('click', fn);
        parent.appendChild(b);
        return b;
    }
    buildRoot(): void{
        let r: HTMLElement=document.createElement('div');
        r.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;font-family:sans-serif;z-index:10;');
        document.body.appendChild(r);
        this.root=r;
        let top: HTMLElement=document.createElement('div');
        top.setAttribute('style', 'position:absolute;top:0;left:0;right:0;background:#111827;color:#fff;padding:6px 10px;font-size:13px;pointer-events:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;');
        r.appendChild(top);
        this.topBar=top;
        let pl: HTMLElement=document.createElement('div');
        pl.setAttribute('style', 'position:absolute;top:40px;right:0;width:230px;background:rgba(17,24,39,0.92);color:#fff;padding:8px;font-size:12px;pointer-events:auto;max-height:60vh;overflow:auto;');
        r.appendChild(pl);
        this.plist=pl;
        let bot: HTMLElement=document.createElement('div');
        bot.setAttribute('style', 'position:absolute;bottom:0;left:0;right:0;background:#111827;color:#fff;padding:6px 10px;font-size:12px;pointer-events:auto;');
        r.appendChild(bot);
        let m: HTMLElement=document.createElement('div');
        m.setAttribute('style', 'margin-bottom:4px;min-height:18px;');
        bot.appendChild(m);
        this.msg=m;
        let row: HTMLElement=document.createElement('div');
        row.setAttribute('style', 'display:flex;gap:4px;flex-wrap:wrap;align-items:center;');
        bot.appendChild(row);
        this.btns['roll']=this.btn('Roll Dice', row, ()=>{this.g().rollAndMove();});
        this.btns['pay']=this.btn('Pay Due', row, ()=>{this.g().payDue();});
        this.btns['end']=this.btn('End Turn', row, ()=>{this.g().endTurn();});
        this.btns['bankrupt']=this.btn('Bankrupt', row, ()=>{this.g().declareBankruptcy();});
        let bs: HTMLSelectElement=document.createElement('select');
        bs.setAttribute('style', 'margin:2px;font-size:12px;max-width:150px;');
        row.appendChild(bs);
        this.buildSel=bs;
        let dl: HTMLElement=document.createElement('label');
        dl.setAttribute('style', 'font-size:12px;');
        row.appendChild(dl);
        let dc: HTMLInputElement=document.createElement('input');
        dc.type='checkbox';
        dl.appendChild(dc);
        dl.appendChild(document.createTextNode('defer'));
        this.deferBox=dc;
        this.btns['build']=this.btn('Build', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            let d: HTMLInputElement=this.deferBox as HTMLInputElement;
            this.g().buildOn(parseInt(s.value, 10), d.checked);
        });
        this.btns['mort']=this.btn('Mortgage sel.', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().mortgagePlot(parseInt(s.value, 10));
        });
        this.btns['unmort']=this.btn('Lift mort.', row, ()=>{
            let s: HTMLSelectElement=this.buildSel as HTMLSelectElement;
            this.g().repayMortgage(parseInt(s.value, 10));
        });
        this.btns['abandon']=this.btn('Abandon Gate', row, ()=>{this.g().abandonGrandGate();});
        let li: HTMLInputElement=document.createElement('input');
        li.placeholder='loan 1-20';
        li.setAttribute('style', 'width:70px;margin:2px;font-size:12px;');
        row.appendChild(li);
        this.loanIn=li;
        this.btns['loan']=this.btn('Loan', row, ()=>{this.g().takeLoan(parseInt((this.loanIn as HTMLInputElement).value || '0', 10));});
        let ri: HTMLInputElement=document.createElement('input');
        ri.placeholder='repay N';
        ri.setAttribute('style', 'width:70px;margin:2px;font-size:12px;');
        row.appendChild(ri);
        this.repayIn=ri;
        this.btns['repay']=this.btn('Repay', row, ()=>{this.g().repayDebt(parseInt((this.repayIn as HTMLInputElement).value || '0', 10));});
        this.btns['sellC']=this.btn('+Cr: sell C', row, ()=>{this.g().sellMaterial('concrete', 1);});
        this.btns['sellS']=this.btn('+Cr: sell S', row, ()=>{this.g().sellMaterial('steel', 1);});
        this.btns['sellG']=this.btn('+Cr: sell G', row, ()=>{this.g().sellMaterial('glass', 1);});
        let bi: HTMLInputElement=document.createElement('input');
        bi.placeholder='bid N';
        bi.setAttribute('style', 'width:60px;margin:2px;font-size:12px;');
        row.appendChild(bi);
        this.bidIn=bi;
        this.btns['bid']=this.btn('Bid', row, ()=>{this.g().placeBid(parseInt((this.bidIn as HTMLInputElement).value || '0', 10));});
        this.btns['pass']=this.btn('Pass', row, ()=>{this.g().passBid();});
        let js: HTMLSelectElement=document.createElement('select');
        js.setAttribute('style', 'margin:2px;font-size:12px;max-width:110px;');
        row.appendChild(js);
        this.jointSel=js;
        this.btns['joint']=this.btn('Joint?', row, ()=>{this.g().startJoint(parseInt((this.jointSel as HTMLSelectElement).value || '0', 10));});
        this.btns['coop']=this.btn('Coop', row, ()=>{this.jointPick('C');});
        this.btns['defect']=this.btn('Defect', row, ()=>{this.jointPick('D');});
        this.btns['declineJ']=this.btn('Decline J', row, ()=>{this.g().declineJoint();});
        let bg: HTMLButtonElement=this.btn('BGM: Off', top, ()=>{this.toggleBgm(bg);});
        this.btns['bgm']=bg;
        this.btn('Rules', top, ()=>{this.showRules(true);});
        let bb: HTMLElement=document.createElement('div');
        bb.setAttribute('style', 'position:absolute;bottom:110px;left:8px;background:#fef3c7;color:#111;padding:8px;font-size:12px;pointer-events:auto;display:none;max-width:320px;border:2px solid #92400e;');
        r.appendChild(bb);
        this.buyBox=bb;
    }
    g(): GameScene{
        return this.game2 as GameScene;
    }
    toggleBgm(b: HTMLButtonElement): void{
        let p: BGMPlayer=BGMPlayer.instance();
        if(this.bgmOn){
            p.stop();
            this.bgmOn=false;
            b.textContent='BGM: Off';
        }
        else{
            p.play();
            this.bgmOn=true;
            b.textContent='BGM: On';
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
        b.setAttribute('style', 'position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);background:#fff;color:#111;padding:16px;pointer-events:auto;border:3px solid #111;');
        r.appendChild(b);
        this.setupBox=b;
        this.el('div', 'font-weight:bold;margin-bottom:8px;', b, 'Tschirlau: players? (hot-seat 2-6)');
        let s: HTMLSelectElement=document.createElement('select');
        for(let i=2;i<=6;i++){
            let o: HTMLOptionElement=document.createElement('option');
            o.value='' + i;
            o.textContent='' + i + ' players';
            if(i===3){
                o.selected=true;
            }
            s.appendChild(o);
        }
        b.appendChild(s);
        this.btn('Start (music on)', b, ()=>{
            this.g().setupGame(parseInt(s.value, 10));
            b.style.display='none';
            if(!this.bgmOn){
                let p: BGMPlayer=BGMPlayer.instance();
                p.play();
                this.bgmOn=true;
                (this.btns['bgm'] as HTMLButtonElement).textContent='BGM: On';
            }
        });
    }
    buildRules(): void{
        let r: HTMLElement=this.root as HTMLElement;
        let b: HTMLElement=document.createElement('div');
        b.setAttribute('style', 'position:absolute;top:8%;left:50%;transform:translateX(-50%);background:#fff;color:#111;padding:14px;pointer-events:auto;border:3px solid #111;display:none;max-width:560px;max-height:76vh;overflow:auto;font-size:12px;');
        r.appendChild(b);
        this.rulesBox=b;
        this.el('div', 'font-weight:bold;margin-bottom:6px;', b, 'Rules: last solvent wins. 20 rounds max.');
        this.el('div', '', b, 'Roll 2d6, move, resolve space. Passing START pays stipend (Boom 5, Cooling 2, Crash 0). End turn pays upkeep (L1/L2 only) + interest + hype upkeep in Crash. Cannot pay: mortgage plots (50% value, debt +), sell materials, or Bankrupt (assets freed at 10%, you are out). Build L1-L4 anytime on owned plots (not mortgaged, not Gate 0, never in Crash). Cooling x1.5 materials. Defer borrows credit-cost. Buy unowned plots on landing. Finished plots (L3/L4) charge rent; unfinished give visitor +1 Hype. Gate 0 starts L1, no upgrades, +1 Hype/turn to owner, mortgage 0, abandon +5 and removed. Bubble: L1 +1, L2 +2, L3/L4 -2, repay 5 -> -1. At 15 in Cooling all pay 2 or lose Hype. At 20 early HARD crash. Crash at round 16 random HARD/MEDIUM/SOFT: assets drop 80/50/30%, interest 5/3/2, hype upkeep 2/1/0.5. Second 20 ends game. Highest net worth wins at round 20.');
        this.btn('Close', b, ()=>{this.showRules(false);});
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
            this.el('span', '', this.topBar, 'Rd ' + s.round + '/20 | ' + s.phase + ' | Bubble ' + s.bubble + ' | Cur P' + (s.cur+1) + ' | ' + s.stage + ' | int ' + s.rate + '/10 | stip ' + s.stipend + ' | roll ' + s.roll + (s.mustPay>0?' | DUE ' + s.mustPay:''));
            let bg: HTMLButtonElement=this.btns['bgm'] as HTMLButtonElement;
            this.topBar.appendChild(bg);
            let rb: HTMLButtonElement=document.createElement('button');
            rb.textContent='Rules';
            rb.setAttribute('style', 'margin:2px;padding:4px 8px;font-size:12px;cursor:pointer;');
            rb.addEventListener('click', ()=>{this.showRules(true);});
            this.topBar.appendChild(rb);
        }
        if(this.plist!==null){
            this.plist.textContent='';
            for(let i=0;i<gs.state.players.length;i++){
                let p: (typeof gs.state.players)[number]=gs.state.players[i] as (typeof gs.state.players)[number];
                let line: string=(i===s.cur?'> ':'') + p.name + (p.isBankrupt?' X BANKRUPT':'') + ' | ' + p.credits + 'Cr D' + p.debtToBank + ' H' + p.hype + ' C' + p.concrete + ' S' + p.steel + ' G' + p.glass + ' @' + p.position + ' [' + p.ownedPlots.length + ']';
                this.el('div', i===s.cur?'color:#4ade80;':'', this.plist, line);
            }
        }
        if(this.msg!==null){
            this.msg.textContent=s.msg;
        }
        let canAct: boolean=s.stage==='ACTION'&&!s.over;
        let canRoll: boolean=s.stage==='ROLL'&&!s.over;
        (this.btns['roll'] as HTMLButtonElement).disabled=!canRoll;
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
                this.el('div', 'font-weight:bold;', bb, 'Buy ' + (pl as {name: string}).name + ' for ' + (pl as {baseCost: number}).baseCost + ' Cr?');
                this.btn('Yes', bb, ()=>{gs.confirmBuy();});
                this.btn('No', bb, ()=>{gs.declineBuy();});
            }
            else if(s.auction!==null&&canAct){
                let pl: (typeof gs.state.plots)[number]|undefined=undefined;
                for(let i=0;i<gs.state.plots.length;i++){
                    let q: (typeof gs.state.plots)[number]=gs.state.plots[i] as (typeof gs.state.plots)[number];
                    if(s.auction!==null&&q.id===(s.auction as {plotId: number}).plotId){
                        pl=q;
                    }
                }
                bb.style.display='block';
                bb.textContent='';
                this.el('div', 'font-weight:bold;', bb, 'Auction ' + (pl as {name: string}).name + ' top ' + (s.auction as {bid: number}).bid + ' by P' + (((s.auction as {bidder: number|null}).bidder??-1)+1) + '. Turn P' + ((s.auction as {turn: number}).turn+1) + '. Use Bid/Pass.');
            }
            else{
                bb.style.display='none';
            }
        }
        if(s.over&&this.setupBox!==null){
            this.setupBox.style.display='block';
            this.setupBox.textContent='';
            this.el('div', 'font-weight:bold;', this.setupBox, s.msg);
            this.btn('New game (same count)', this.setupBox, ()=>{
                this.g().setupGame(this.g().state.players.length);
                (this.setupBox as HTMLElement).style.display='none';
            });
        }
    }
}
