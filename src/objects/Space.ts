// Board space with type, index and optional plot reference.
import {colorForSpace, labelForSpace, plotDefForBoardIndex} from '../data/boardData.ts';
import {SPACE_TYPES} from '../data/boardData.ts';
import type {SpaceType} from '../state/GameState.ts';
export class Space{
    index: number;
    type: SpaceType;
    plotId: number|null;
    constructor(index: number){
        this.index=index;
        this.type=(SPACE_TYPES[index] as SpaceType) ?? 'HYPE';
        let def: ReturnType<typeof plotDefForBoardIndex>=plotDefForBoardIndex(index);
        if(this.type==='PLOT'&&def!==null){
            this.plotId=def.id;
        }
        else{
            this.plotId=null;
        }
    }
    color(): number{
        return colorForSpace(this.index);
    }
    label(): string{
        return labelForSpace(this.index);
    }
}
