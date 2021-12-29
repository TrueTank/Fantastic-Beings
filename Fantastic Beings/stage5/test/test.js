const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

let group = [];

function findCellForMatch(being, group, map) {
    let leftOffsets = [
        {x: 0, y: -2}, {x: -1, y: -1}, {x: 1, y: -1},
    ];
    let rightOffsets = [
        {x: -1, y: 1}, {x: 0, y: 2}, {x: 1, y: 1},
    ];
    let leftCell = group[0];
    let rightCell = group[group.length-1];
    for(let c of leftOffsets) {
        if(map[leftCell.x+c.x]) {
            if (map[leftCell.x + c.x][leftCell.y + c.y] === being) {
                return [{x: leftCell.x, y: leftCell.y - 1}, {x: leftCell.x + c.x, y: leftCell.y + c.y}];
            }
        }
    }
    for(let c of rightOffsets) {
        if(map[rightCell.x+c.x]) {
            if (map[rightCell.x + c.x][rightCell.y + c.y] === being) {
                return [{x: rightCell.x, y: rightCell.y + 1}, {x: rightCell.x + c.x, y: rightCell.y + c.y}];
            }
        }
    }
    return false;
}
function getCellsForSwap(isRow, beingName, groupLength, map) {
    for (let i = 0; i < 5; i++) {
        let currentBeing = '';
        group = [];
        for (let j = 0; j < 5; j++) {
            let being = isRow ? map[j][i] : map[i][j];
            if (currentBeing !== being) {
                if (group.length < groupLength) {
                    currentBeing = being;
                    if (being && (beingName && being === beingName || !beingName)) {
                        group = [{x: i, y: j}];
                    } else {
                        group = [];
                    }
                } else {
                    let res = findCellForMatch(currentBeing, group, map);
                    if (res) {
                        return res;
                    }
                }
            } else {
                if (being && (beingName && being === beingName || !beingName)) {
                    group.push({x: i, y: j});
                }
            }
            if (j === 4) {
                if (group.length >= groupLength) {
                    let res = findCellForMatch(currentBeing, group, map);
                    if(res) {
                        return res;
                    }
                }
            }
        }
    }
    return [];
}

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#0 - проверяем game-footer
        this.node.execute(async () => {
            let gameResult = await this.page.findBySelector('#game-footer');
            let content = await gameResult.innerHtml();
            return content === 'Swap animals to form a sequence of three in a row' ?
                correct() :
                wrong(`The game-footer element should contain a line with game instruction (your line: ${content}.`);

        }),
        //Test#1 - проверяем победу
        this.node.execute(async () => {
            let map = [];

            let cellsForSwap = [];
            while(cellsForSwap.length === 0) {
                await this.page.refresh();
                sleep(1000);
                this.cells = await this.page.findAllBySelector('.cell');
                map = [];
                let str = '';
                for (let i = 0; i < 5; i++) {
                    map[i] = [];
                    for (let j = 0; j < 5; j++) {
                        map[i][j] = await this.cells[5 * i + j].getAttribute('data-being');
                        str += map[i][j] + ' ';
                    }
                    str += '\n';
                }
                console.log(str);
                cellsForSwap = getCellsForSwap(false, 'zouwu', 2, map);
                if (cellsForSwap.length === 0) {
                    cellsForSwap = getCellsForSwap(true, 'zouwu', 2, map);
                }
            }
            console.log(group[0].x + ' ' + group[0].y)
            console.log(group[1].x + ' ' + group[1].y)
            let being1 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[0].y}_y${cellsForSwap[0].x}]`);
            let being2 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[1].y}_y${cellsForSwap[1].x}]`);

            await being1.click();
            await being2.click();

            sleep(1000);

            let movesValue = await this.page.findBySelector('#moves-value');
            let zouwuCount = await this.page.findBySelector('#beings-for-win span.zouwu');
            let gameResult = await this.page.findBySelector('#game-footer');

            let moves = await movesValue.innerHtml();
            let zouwu = await zouwuCount.innerHtml();
            let res = await gameResult.innerHtml();

            return moves === '0' && zouwu === '0' && res === 'You won! Reload the page to start the game again.' ?
                correct() :
                wrong(`If you win, you should have 0 moves (you have ${moves} moves) 
                and 0 creatures named zouwu (you have ${zouwu} zouwu), 
                and the game-footer element should contain a line about the victory (your line: ${res}.`);

        }),
        //Test#2 - проверяем очки
        this.node.execute(async () => {
            let score = await this.page.findBySelector('#score-value');
            let content = await score.innerHtml();
            return parseInt(content) > 0 ?
                correct() :
                wrong(`For each creature matched, you must add 10 points to the score-value element.`);

        }),
        //Test#3 - проверяем проигрыш
        this.node.execute(async () => {
            let map = [];

            let zouwuCells = [];
            let cellsForSwap = [];

            while (cellsForSwap.length === 0) {
                do {
                    await this.page.refresh();
                    sleep(700);
                    this.cells = await this.page.findAllBySelector('.cell');
                    map = [];
                    let str = '';
                    for (let i = 0; i < 5; i++) {
                        map[i] = [];
                        for (let j = 0; j < 5; j++) {
                            map[i][j] = await this.cells[5 * i + j].getAttribute('data-being');
                            str += map[i][j] + ' ';
                        }
                        str += '\n';
                    }
                    console.log(str);
                    zouwuCells = getCellsForSwap(false, 'zouwu', 3, map);
                    if (zouwuCells.length === 0) {
                        zouwuCells = getCellsForSwap(true, 'zouwu', 3, map);
                    }
                } while (zouwuCells.length > 0);

                cellsForSwap = getCellsForSwap(false, '', 2, map);
                if (!cellsForSwap) {
                    cellsForSwap = getCellsForSwap(true, '', 2, map);
                }
            }

            console.log(group[0].x + ' ' + group[0].y)
            console.log(group[1].x + ' ' + group[1].y)
            let being1 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[0].y}_y${cellsForSwap[0].x}]`);
            let being2 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[1].y}_y${cellsForSwap[1].x}]`);

            await being1.click();
            await being2.click();

            sleep(1000);

            let movesValue = await this.page.findBySelector('#moves-value');
            let zouwuCount = await this.page.findBySelector('#beings-for-win span.zouwu');
            let gameResult = await this.page.findBySelector('#game-footer');

            let moves = await movesValue.innerHtml();
            let zouwu = await zouwuCount.innerHtml();
            let res = await gameResult.innerHtml();

            return moves === '0' && zouwu === '3' && res === 'You lost! Reload the page to start the game again.' ?
                correct() :
                wrong(`If you lost, you should have 0 moves (you have ${moves} moves) 
                and 3 creatures named zouwu (you have ${zouwu} zouwu), 
                and the game-footer element should contain a line about the loss (your line: ${res}.`);

        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);