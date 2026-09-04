// Maps 40 board indices to pixel positions on a rectangular loop.
export interface BoardPos{x: number, y: number}
export class Board{
    static posFor(index: number, w: number, top: number, h: number): BoardPos{
        let cx: number=w/2;
        let cy: number=top+h/2;
        let rx: number=Math.min(w*0.44, 450);
        let ry: number=Math.min(h*0.368, 227);
        let per: number=10;
        let side: number=Math.floor(index/per);
        let k: number=index%per;
        let t: number=k/per;
        let x: number=cx;
        let y: number=cy;
        if(side===0){
            x=cx-rx+t*2*rx;
            y=cy+ry;
        }
        else if(side===1){
            x=cx+rx;
            y=cy+ry-t*2*ry;
        }
        else if(side===2){
            x=cx+rx-t*2*rx;
            y=cy-ry;
        }
        else{
            x=cx-rx;
            y=cy-ry+t*2*ry;
        }
        return {x: x, y: y};
    }
    static tokenOffset(playerIdx: number): BoardPos{
        let dx: number=(playerIdx%3)*12-12;
        let dy: number=Math.floor(playerIdx/3)*10-5;
        return {x: dx, y: dy};
    }
}
