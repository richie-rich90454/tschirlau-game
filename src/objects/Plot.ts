// Thin wrapper around PlotData with build, rent and value helpers.
import {BUILD_COSTS, maintFor, marketValueOf, mortgageValueOf, rentFor} from '../state/GameState.ts';
import type {Cost, CrashSeverity, Phase, PlotData, PlotQuality} from '../state/GameState.ts';
export class Plot{
    data: PlotData;
    constructor(data: PlotData){
        this.data=data;
    }
    get level(): number{
        return this.data.constructionLevel;
    }
    get isFinished(): boolean{
        return this.data.constructionLevel>=3;
    }
    get isUnfinished(): boolean{
        return this.data.constructionLevel===1||this.data.constructionLevel===2;
    }
    canBuild(phase: Phase): boolean{
        if(this.data.isMortgaged){
            return false;
        }
        if(this.data.id===0){
            return false;
        }
        if(phase==='CRASH'){
            return false;
        }
        if(this.data.constructionLevel>=4){
            return false;
        }
        return true;
    }
    nextCost(phase: Phase): Cost{
        let base: Cost=BUILD_COSTS[this.data.constructionLevel+1] as Cost;
        if(phase==='COOLING'){
            return {credits: base.credits, concrete: Math.ceil(base.concrete*1.5), steel: Math.ceil(base.steel*1.5), glass: Math.ceil(base.glass*1.5)};
        }
        return {credits: base.credits, concrete: base.concrete, steel: base.steel, glass: base.glass};
    }
    rent(): number{
        return rentFor(this.data.constructionLevel, this.data.quality);
    }
    maintenance(phase: Phase, sev: CrashSeverity|null): number{
        return maintFor(this.data.constructionLevel, phase, sev, this.data.quality);
    }
    marketValue(sev: CrashSeverity|null): number{
        return marketValueOf(this.data, sev);
    }
    mortgageValue(sev: CrashSeverity|null): number{
        return mortgageValueOf(this.data, sev);
    }
    quality(): PlotQuality|null{
        return this.data.quality;
    }
}
