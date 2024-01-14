import salamander from '../images/salamander.png';
import zouwu from '../images/zouwu.png';
import swooping from '../images/swooping.png';
import puffskein from '../images/puffskein.png';
import kelpie from '../images/kelpie.png';
export let settings = {
    rowsCount: 5,
    colsCount: 5,
    beings: ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'],
    beingsImgs: {
        'zouwu': zouwu,
        'swooping': swooping,
        'salamander': salamander,
        'puffskein': puffskein,
        'kelpie': kelpie
    },
    minLength: 3,
    numberOfMoves: 10,
    beingsForWin: {
        'zouwu': 12,
        'kelpie': 6
    },
    commonChanceSize: 10,
    score: 0,
};
