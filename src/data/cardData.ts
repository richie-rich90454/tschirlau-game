// Hype and Rumor card decks per phase.
import type {Phase} from '../state/GameState.ts';
export interface HypeCard{id: number, name: string, text: string, phase: Phase, credits: number, hype: number, bubbleDelta: number, concrete: number, steel: number, glass: number}
export interface RumorCard{id: number, name: string, text: string, kind: string}
export const HYPE_BOOM: Array<HypeCard>=[{id: 0, name: 'Giralgeld Gala', text: 'Investors love renderings. +2 Hype.', phase: 'BOOM', credits: 0, hype: 2, bubbleDelta: 1, concrete: 0, steel: 0, glass: 0}, {id: 1, name: 'Renderings Lügen Nie', text: 'Sell the dream. +3 Credits, +1 Hype.', phase: 'BOOM', credits: 3, hype: 1, bubbleDelta: 1, concrete: 0, steel: 0, glass: 0}, {id: 2, name: 'Betongold Fieber', text: 'Concrete rains. +1 Concrete, +1 Hype.', phase: 'BOOM', credits: 0, hype: 1, bubbleDelta: 1, concrete: 1, steel: 0, glass: 0}, {id: 3, name: 'Stahlsegen', text: '+1 Steel, +1 Glass, +1 Hype.', phase: 'BOOM', credits: 0, hype: 1, bubbleDelta: 1, concrete: 0, steel: 1, glass: 1}, {id: 4, name: 'Tor-Hysterie', text: 'Everyone wants a gate. +2 Hype, bubble +1.', phase: 'BOOM', credits: 0, hype: 2, bubbleDelta: 1, concrete: 0, steel: 0, glass: 0}, {id: 5, name: 'Kran-Kult', text: 'Cranes are skyline jewelry. +1 Hype.', phase: 'BOOM', credits: 1, hype: 1, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}];
export const HYPE_COOLING: Array<HypeCard>=[{id: 10, name: 'Zinsschock Gerücht', text: 'Nervous market. -1 Hype.', phase: 'COOLING', credits: 0, hype: -1, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}, {id: 11, name: 'Baustopp Angst', text: 'Pay 2 Credits or lose 1 Hype.', phase: 'COOLING', credits: -2, hype: 0, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}, {id: 12, name: 'Letzte Runde Bier', text: 'One more push. +1 Hype, bubble +1.', phase: 'COOLING', credits: 0, hype: 1, bubbleDelta: 1, concrete: 0, steel: 0, glass: 0}, {id: 13, name: 'Gutachter Gnade', text: '+1 Concrete, costs 1 Credit.', phase: 'COOLING', credits: -1, hype: 0, bubbleDelta: 0, concrete: 1, steel: 0, glass: 0}];
export const HYPE_CRASH: Array<HypeCard>=[{id: 20, name: 'Geisterstadt Blues', text: 'Empty towers. -2 Hype.', phase: 'CRASH', credits: 0, hype: -2, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}, {id: 21, name: 'Zwangsversteigerung', text: 'Fire sale. +2 Credits, -1 Hype.', phase: 'CRASH', credits: 2, hype: -1, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}, {id: 22, name: 'Rost und Ruin', text: 'Lose 1 Steel.', phase: 'CRASH', credits: 0, hype: 0, bubbleDelta: 0, concrete: 0, steel: -1, glass: 0}, {id: 23, name: 'Tauben im Penthouse', text: '-1 Hype. Pigeons pay no rent.', phase: 'CRASH', credits: 0, hype: -1, bubbleDelta: 0, concrete: 0, steel: 0, glass: 0}];
export const RUMORS: Array<RumorCard>=[{id: 0, name: 'Bubble Fears', text: 'All lose 1 Hype.', kind: 'all-hype-minus1'}, {id: 1, name: 'Material Price Spike', text: 'All pay 1 Credit per unfinished project.', kind: 'pay-per-unfinished'}, {id: 2, name: 'New Metro Line Announced', text: 'All gain 1 Hype and 1 Credit.', kind: 'all-plus1'}, {id: 3, name: 'Ghost City Tour', text: 'Most unfinished gains 2 Hype, fewest loses 1 Hype.', kind: 'ghost-tour'}, {id: 4, name: 'Zampern Festival Disruption', text: 'All lose 1 Hype.', kind: 'all-hype-minus1'}, {id: 5, name: 'Spreewaldgurken Shortage', text: 'All pay 1 Credit.', kind: 'all-pay1'}];
export function hypeDeckFor(phase: Phase): Array<HypeCard>{
    if(phase==='BOOM'){
        return HYPE_BOOM;
    }
    else if(phase==='COOLING'){
        return HYPE_COOLING;
    }
    else{
        return HYPE_CRASH;
    }
}
