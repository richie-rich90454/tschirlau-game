// Crash narrative events and severity mapping.
import type {CrashSeverity} from '../state/GameState.ts';
export interface CrashEvent{severity: CrashSeverity, name: string, text: string}
export const CRASH_EVENTS: Array<CrashEvent>=[{severity: 'HARD', name: 'The Tschirlau Contagion', text: 'Banks freeze. Assets -80%. Interest 5 per 10. Hype costs 2 each turn.'}, {severity: 'MEDIUM', name: 'Global Credit Freeze', text: 'Money hides. Assets -50%. Interest 3 per 10. Hype costs 1 each turn.'}, {severity: 'SOFT', name: 'Oder Valley Correction', text: 'A mild panic. Assets -30%. Interest 2 per 10. Hype costs 0.5 each turn.'}];
export function crashEventFor(sev: CrashSeverity): CrashEvent{
    for(let i=0;i<CRASH_EVENTS.length;i++){
        let e: CrashEvent|undefined=CRASH_EVENTS[i];
        if(e!==undefined&&e.severity===sev){
            return e;
        }
    }
    return CRASH_EVENTS[1] as CrashEvent;
}
