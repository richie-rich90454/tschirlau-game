// Fixed 40-space board layout and 20 plot definitions.
import type {SpaceType} from '../state/GameState.ts';
export const SPACE_TYPES: Array<SpaceType>=['START', 'PLOT', 'HYPE', 'PLOT', 'MAINTENANCE', 'PLOT', 'HYPE', 'PLOT', 'INVESTOR_PITCH', 'PLOT', 'HYPE', 'PLOT', 'MAINTENANCE', 'PLOT', 'HYPE', 'PLOT', 'INVESTOR_PITCH', 'PLOT', 'HYPE', 'PLOT', 'MAINTENANCE', 'PLOT', 'HYPE', 'PLOT', 'INVESTOR_PITCH', 'PLOT', 'HYPE', 'PLOT', 'MAINTENANCE', 'PLOT', 'HYPE', 'PLOT', 'INVESTOR_PITCH', 'PLOT', 'HYPE', 'PLOT', 'AUCTION', 'PLOT', 'BANK', 'JOINT_VENTURE'];
export interface PlotDef{id: number, boardIndex: number, name: string, zone: string, baseCost: number}
export const PLOT_DEFS: Array<PlotDef>=[{id: 0, boardIndex: 1, name: 'Das Große Trugbildtor', zone: 'GOLD', baseCost: 20}, {id: 1, boardIndex: 3, name: 'Oderblick Residenz', zone: 'GOLD', baseCost: 18}, {id: 2, boardIndex: 5, name: 'Neißeweg Palais', zone: 'GOLD', baseCost: 16}, {id: 3, boardIndex: 7, name: 'Lausitzer Prachtallee', zone: 'GOLD', baseCost: 14}, {id: 4, boardIndex: 9, name: 'Spreewald-Terrasse', zone: 'GOLD', baseCost: 12}, {id: 5, boardIndex: 11, name: 'Metro Hub Eins', zone: 'SILVER', baseCost: 12}, {id: 6, boardIndex: 13, name: 'Metro Hub Zwei', zone: 'SILVER', baseCost: 10}, {id: 7, boardIndex: 15, name: 'Skyline Terrasse', zone: 'SILVER', baseCost: 10}, {id: 8, boardIndex: 17, name: 'Wolkenkratzer-Tor', zone: 'SILVER', baseCost: 8}, {id: 9, boardIndex: 19, name: 'Diamantblick-Eingang', zone: 'SILVER', baseCost: 8}, {id: 10, boardIndex: 21, name: 'Tech Park Alpha', zone: 'BLUE', baseCost: 10}, {id: 11, boardIndex: 23, name: 'Tech Park Beta', zone: 'BLUE', baseCost: 8}, {id: 12, boardIndex: 25, name: 'Innovationsbogen', zone: 'BLUE', baseCost: 8}, {id: 13, boardIndex: 27, name: 'Zukunftsstadt-Tor', zone: 'BLUE', baseCost: 6}, {id: 14, boardIndex: 29, name: 'Silizium Oase', zone: 'BLUE', baseCost: 6}, {id: 15, boardIndex: 31, name: 'Datencenter-Auffahrt', zone: 'GREEN', baseCost: 4}, {id: 16, boardIndex: 33, name: 'Seeblick-Luxustor', zone: 'GREEN', baseCost: 8}, {id: 17, boardIndex: 35, name: 'Golf Estate Torbogen', zone: 'GREEN', baseCost: 6}, {id: 18, boardIndex: 37, name: 'Villa Venezia Eingang', zone: 'GREEN', baseCost: 6}, {id: 19, boardIndex: 39, name: 'Paradiesinsel-Brücke', zone: 'GREEN', baseCost: 4}];
export function plotDefForBoardIndex(idx: number): PlotDef|null{
    for(let i=0;i<PLOT_DEFS.length;i++){
        let d: PlotDef|undefined=PLOT_DEFS[i];
        if(d!==undefined&&d.boardIndex===idx){
            return d;
        }
    }
    return null;
}
export const ZONE_COLORS: Record<string, number>={GOLD: 0xE8B800, SILVER: 0x9AA0A6, BLUE: 0x3B82F6, GREEN: 0x4ADE80};
export const SPACE_COLORS: Record<string, number>={START: 0x16A34A, PLOT_GOLD: 0xE8B800, PLOT_SILVER: 0x9AA0A6, PLOT_BLUE: 0x3B82F6, PLOT_GREEN: 0x4ADE80, HYPE: 0xF97316, MAINTENANCE: 0xDC2626, INVESTOR_PITCH: 0x9333EA, AUCTION: 0xEC4899, RUMOR: 0x06B6D4, BANK: 0x92400E, JOINT_VENTURE: 0xD946EF};
export function colorForSpace(idx: number): number{
    let t: SpaceType|undefined=SPACE_TYPES[idx];
    if(t===undefined){
        return 0x333333;
    }
    if(t==='START'){
        return SPACE_COLORS['START'] as number;
    }
    if(t==='HYPE'){
        return SPACE_COLORS['HYPE'] as number;
    }
    if(t==='MAINTENANCE'){
        return SPACE_COLORS['MAINTENANCE'] as number;
    }
    if(t==='INVESTOR_PITCH'){
        return SPACE_COLORS['INVESTOR_PITCH'] as number;
    }
    if(t==='AUCTION'){
        return SPACE_COLORS['AUCTION'] as number;
    }
    if(t==='RUMOR'){
        return SPACE_COLORS['RUMOR'] as number;
    }
    if(t==='BANK'){
        return SPACE_COLORS['BANK'] as number;
    }
    if(t==='JOINT_VENTURE'){
        return SPACE_COLORS['JOINT_VENTURE'] as number;
    }
    let def: PlotDef|null=plotDefForBoardIndex(idx);
    if(def===null){
        return 0x333333;
    }
    if(def.zone==='GOLD'){
        return SPACE_COLORS['PLOT_GOLD'] as number;
    }
    if(def.zone==='SILVER'){
        return SPACE_COLORS['PLOT_SILVER'] as number;
    }
    if(def.zone==='BLUE'){
        return SPACE_COLORS['PLOT_BLUE'] as number;
    }
    return SPACE_COLORS['PLOT_GREEN'] as number;
}
export function labelForSpace(idx: number): string{
    let t: SpaceType|undefined=SPACE_TYPES[idx];
    if(t===undefined){
        return '?';
    }
    if(t==='START'){
        return 'START';
    }
    if(t==='HYPE'){
        return 'HYPE';
    }
    if(t==='MAINTENANCE'){
        return 'MAINT';
    }
    if(t==='INVESTOR_PITCH'){
        return 'PITCH';
    }
    if(t==='AUCTION'){
        return 'AUCTION';
    }
    if(t==='RUMOR'){
        return 'RUMOR';
    }
    if(t==='BANK'){
        return 'BANK';
    }
    if(t==='JOINT_VENTURE'){
        return 'JOINT';
    }
    let def: PlotDef|null=plotDefForBoardIndex(idx);
    if(def===null){
        return 'PLOT';
    }
    return def.name.slice(0, 10);
}
