// Thin wrapper around PlayerData with affordability and debt helpers.
import type {Cost, PlayerData} from '../state/GameState.ts';
export class Player{
    data: PlayerData;
    constructor(data: PlayerData){
        this.data=data;
    }
    canAfford(c: Cost): boolean{
        if(this.data.credits<c.credits){
            return false;
        }
        if(this.data.concrete<c.concrete){
            return false;
        }
        if(this.data.steel<c.steel){
            return false;
        }
        if(this.data.glass<c.glass){
            return false;
        }
        return true;
    }
    pay(c: Cost): boolean{
        if(!this.canAfford(c)){
            return false;
        }
        this.data.credits=this.data.credits-c.credits;
        this.data.concrete=this.data.concrete-c.concrete;
        this.data.steel=this.data.steel-c.steel;
        this.data.glass=this.data.glass-c.glass;
        return true;
    }
    addResources(credits: number, concrete: number, steel: number, glass: number, hype: number): void{
        this.data.credits=this.data.credits+credits;
        this.data.concrete=this.data.concrete+concrete;
        this.data.steel=this.data.steel+steel;
        this.data.glass=this.data.glass+glass;
        this.data.hype=this.data.hype+hype;
        if(this.data.hype<0){
            this.data.hype=0;
        }
        if(this.data.concrete<0){
            this.data.concrete=0;
        }
        if(this.data.steel<0){
            this.data.steel=0;
        }
        if(this.data.glass<0){
            this.data.glass=0;
        }
    }
    addDebt(amount: number): void{
        this.data.debtToBank=this.data.debtToBank+amount;
    }
    repay(amount: number): number{
        let pay: number=amount;
        if(pay>this.data.credits){
            pay=this.data.credits;
        }
        if(pay>this.data.debtToBank){
            pay=this.data.debtToBank;
        }
        if(pay<0){
            pay=0;
        }
        this.data.credits=this.data.credits-pay;
        this.data.debtToBank=this.data.debtToBank-pay;
        return pay;
    }
}
