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

/**
 * Find cells for match for founded sequence
 * @param being - name of creature in sequence
 * @param group - sequence of objects with creature's coordinates
 * @param map - array of names of creatures
 * @param isCol - working mode; if true - function check vertical lines, if false - check horizontal lines
 * @returns {*} - array of two objects with coordinates of creatures
 */
function findCellForMatch(being, group, map, isCol) {
    let leftOffsets, rightOffsets, adjLeftCell, adjRightCell, adjLeftCellName, adjRightCellName;
    let leftCell = group[0];
    let rightCell = group[group.length-1];
    if(isCol) {
        leftOffsets = [{x: 0, y: -2}, {x: -1, y: -1}, {x: -1, y: 1}];
        rightOffsets = [{x: 1, y: 1}, {x: 2, y: 0}, {x: 1, y: -1},];
        if(map[leftCell.x - 1]) {
            adjLeftCell = {x: leftCell.x - 1, y: leftCell.y};
            adjLeftCellName = map[adjLeftCell.x][adjLeftCell.y];
        }
        if(map[rightCell.x + 1]) {
            adjRightCell = {x: rightCell.x + 1, y: rightCell.y};
            adjRightCellName = map[adjRightCell.x][adjRightCell.y];
        }
    } else {
        leftOffsets = [{x: 0, y: -2}, {x: -1, y: -1}, {x: 1, y: -1}];
        rightOffsets = [{x: 1, y: 1}, {x: 0, y: 2}, {x: -1, y: 1},];
        adjLeftCell = {x: leftCell.x, y: leftCell.y - 1};
        adjLeftCellName = map[adjLeftCell.x][adjLeftCell.y];
        adjRightCell = {x: rightCell.x, y: rightCell.y + 1};
        adjRightCellName = map[adjRightCell.x][adjRightCell.y];
    }

    if(adjLeftCellName) {
        for(let c of leftOffsets) {
            if(map[leftCell.x+c.x]) {
                if (map[leftCell.x + c.x][leftCell.y + c.y] === being) {
                    return [{x: adjLeftCell.x, y: adjLeftCell.y}, {x: leftCell.x + c.x, y: leftCell.y + c.y}];
                }
            }
        }
    }
    if(adjRightCellName) {
        for (let c of rightOffsets) {
            if (map[rightCell.x + c.x]) {
                if (map[rightCell.x + c.x][rightCell.y + c.y] === being) {
                    return [{x: adjRightCell.x, y: adjRightCell.y}, {x: rightCell.x + c.x, y: rightCell.y + c.y}];
                }
            }
        }
    }
    return false;
}

/**
 * Get cells for match
 * @param isCol - working mode; if true - function check vertical lines, if false - check horizontal lines
 * @param beingName - name of creature in sequence
 * @param groupLength - length of sequence of creatures for match
 * @param map - array of names of creatures
 * @returns {*} - array of two objects with coordinates of creatures
 */
function getCellsForSwap(isCol, beingName, groupLength, map) {
    for (let i = 0; i < 5; i++) {
        let currentBeing = '';
        group = [];
        for (let j = 0; j < 5; j++) {
            let being = isCol ? map[j][i] : map[i][j];
            let coord = isCol ? {x: j, y: i} : {x: i, y: j};
            if (currentBeing !== being) {
                if (group.length < groupLength) {
                    currentBeing = being;
                    if (being && (beingName && being === beingName || !beingName)) {
                        group = [coord];
                    } else {
                        group = [];
                    }
                } else {
                    let res = findCellForMatch(currentBeing, group, map, isCol);
                    if (res) {
                        return res;
                    }
                    group = [];
                    currentBeing = being;
                }
            } else {
                if (being && (beingName && being === beingName || !beingName)) {
                    group.push(coord);
                }
            }
            if (j === 4) {
                if (group.length >= groupLength) {
                    let res = findCellForMatch(currentBeing, group, map, isCol);
                    if(res) {
                        return res;
                    }
                    group = [];
                }
            }
        }
    }
    return [];
}

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#1 - check existence of map element
        this.page.execute(() => {
            this.map = document.getElementById('map');

            return this.map ?
                correct() :
                wrong(`You need to create a table with the ID "map"`)
        }),
        //Test#2 - check that map set class cell to the cells
        this.node.execute(async () => {
            const cells = await this.page.findAllBySelector('.cell');

            return cells.length === 25 ?
                correct() :
                wrong(`Each cell of the map must have a 'cell' class.`);
        }),
        //Test#3 - check renderBeings function work
        this.node.execute(async () => {
            this.imgs = await this.page.findAllBySelector('img[data-coords]');
            this.cells = await this.page.findAllBySelector('.cell[data-being]');

            return this.imgs.length === 25 && this.cells.length === 25  ?
                correct() :
                wrong(`Beings rendering method must fill all empty cells of the map.`);
        }),
        //Test#4 - check .cell[data-being] property
        this.page.execute(() => {
            let beings = ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'];
            let cellObjects = document.getElementsByClassName('cell');
            for(let c of cellObjects) {
                if(!beings.includes(c.dataset.being)) {
                    return wrong(`Each cell must have a dataset.being property, the value of which must be equal to the name of a random creature from a list of 5 possible creatures.
                    We see that the property of one of the cells is equal to the value: ${c.dataset.being}`);
                }
            }
            return correct();
        }),
        //Test#5 - check img[data-coords] property
        this.page.execute(() => {
            let imgObjs = document.querySelectorAll('img[data-coords]');
            return imgObjs[5].dataset.coords === 'x0_y1' ?
                correct() :
                wrong(`Img objects inside the table have an invalid dataset.coords property.`)
        }),
        //Test#6 - check background of selected being
        this.node.execute(async () => {
            const being = await this.page.findBySelector('img[data-coords=x0_y0]');
            await being.click();

            const cell = await this.page.findBySelector('.cell');
            let style = await cell.getComputedStyles();

            return style.backgroundImage.includes('cell-hover-bg')  ?
                correct() :
                wrong(`The clicked cell must have a background image.`);
        }),
        //Test#7 - check click on non-neighboring cells
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
        //Test#8 - looking for a possible replacement, click on the found elements, check that the elements have been replaced by others
        this.node.execute(async () => {
            await this.page.refresh();
            sleep(500);
            let map = [];
            let str = '';
            let cellsForSwap = [];
            while(cellsForSwap.length === 0) {
                await this.page.refresh();
                sleep(500);
                this.cells = await this.page.findAllBySelector('.cell');
                map = [];
                str = '';
                for (let i = 0; i < 5; i++) {
                    map[i] = [];
                    for (let j = 0; j < 5; j++) {
                        map[i][j] = await this.cells[5 * i + j].getAttribute('data-being');
                        str += map[i][j].substr(0, 3) + ' ';
                    }
                    str += '\n';
                }
                cellsForSwap = getCellsForSwap(false, false, 2, map);
                if (cellsForSwap.length === 0) {
                    cellsForSwap = getCellsForSwap(true, false, 2, map);
                }
            }

            console.log(str);
            for(let g of group) {
                console.log(g)
            }
            console.log(`x=${cellsForSwap[0].x}_y=${cellsForSwap[0].y}`)
            console.log(`x=${cellsForSwap[1].x}_y=${cellsForSwap[1].y}`)

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
                    break;
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
