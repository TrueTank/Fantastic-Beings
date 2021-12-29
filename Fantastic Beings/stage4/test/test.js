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

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#1 - check background of selected being
        this.node.execute(async () => {
            const being = await this.page.findBySelector('img[data-coords=x0_y0]');
            await being.click();

            const cell = await this.page.findBySelector('.cell');
            let style = await cell.getComputedStyles();

            return style.backgroundImage.includes('cell-hover-bg')  ?
                correct() :
                wrong(`The clicked cell must have a background image.`);
        }),
        //Test#2 - клик на несоседние клетки
        this.node.execute(async () => {
            await this.page.refresh();
            sleep(500);
            const being1 = await this.page.findBySelector('img[data-coords=x0_y0]');
            await being1.click();
            const being2 = await this.page.findBySelector('img[data-coords=x2_y0]');
            await being2.click();

            this.cells = await this.page.findAllBySelector('.cell');
            let style1 = await this.cells[0].getComputedStyles();
            let style2 = await this.cells[2].getComputedStyles();

            return style1.backgroundImage.includes('cell-selected-bg') &&
            style2.backgroundImage.includes('cell-hover-bg')  ?
                correct() :
                wrong(`When you click on one cell and the second click on another, non-adjacent cell, nothing should happen.`);
        }),
        //Test#3 - ищем возможную замену, кликаем на найденные элементы, проверяем, что элементы заменились другими
        this.node.execute(async () => {
            let group = [];
            let map = [];
            function findCellForMatch(being, group) {
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
            function getCellsForSwap(isRow) {
                for (let i = 0; i < 5; i++) {
                    let currentBeing = '';
                    group = [];
                    for (let j = 0; j < 5; j++) {
                        let being = isRow ? map[j][i] : map[i][j];
                        if (currentBeing !== being) {
                            if (group.length < 2) {
                                currentBeing = being;
                                if (being) {
                                    group = [{x: i, y: j}];
                                } else {
                                    group = [];
                                }
                            } else {
                                let res = findCellForMatch(currentBeing, group);
                                if(res) {
                                    return res;
                                }
                            }
                        } else {
                            if (being) {
                                group.push({x: i, y: j});
                            }
                        }
                        if (j === 4) {
                            if (group.length >= 2) {
                                let res = findCellForMatch(currentBeing, group);
                                if(res) {
                                    return res;
                                }
                            }
                        }
                    }
                }
                return [];
            }

            let cellsForSwap = [];
            while(cellsForSwap.length === 0) {
                await this.page.refresh();
                sleep(500);
                this.cells = await this.page.findAllBySelector('.cell');
                map = [];
                for (let i = 0; i < 5; i++) {
                    map[i] = [];
                    for (let j = 0; j < 5; j++) {
                        map[i][j] = await this.cells[5 * i + j].getAttribute('data-being');
                    }
                }
                cellsForSwap = getCellsForSwap();
                if (cellsForSwap.length === 0) {
                    cellsForSwap = getCellsForSwap(true);
                }
            }

            let being1 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[0].y}_y${cellsForSwap[0].x}]`);
            let being2 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[1].y}_y${cellsForSwap[1].x}]`);

            let groupNames = [];
            group.push(cellsForSwap[0]);
            for(let g of group) {
                groupNames.push(map[g.x][g.y]);
            }

            await being1.click();
            await being2.click();

            let cor = false;
            for(let g in group) {
                let cell = this.cells[5 * group[g].x + group[g].y];
                let attr = await cell.getAttribute('data-being');
                if(attr !== groupNames[g]) {
                    cor = true;
                }
            }

            return cor ? correct() :
                wrong('Matched items did not disappear after changing items.');

        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
