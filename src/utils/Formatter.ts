// Number and text formatting helpers.
export function fmt(n: number): string{
    if(Number.isInteger(n)){
        return '' + n;
    }
    return '' + Math.round(n*10)/10;
}
export function fmtCredits(n: number): string{
    return fmt(n) + ' Cr';
}
export function shortName(s: string, max: number): string{
    if(s.length<=max){
        return s;
    }
    return s.slice(0, max);
}
export function plural(n: number, one: string, many: string): string{
    if(n===1){
        return one;
    }
    else{
        return many;
    }
}
export function hypeStr(n: number): string{
    return fmt(n) + ' ' + plural(n, 'Hype', 'Hype');
}
