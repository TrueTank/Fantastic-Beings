const puppeteer = require('puppeteer');
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
        //Test#1 - проверяем тег audio в html
        this.node.execute(async () => {
            let being = await this.page.findBySelector('img[data-coords]');
            await being.click();
            let audioObj = await this.page.findBySelector('audio');
            return audioObj ?
                correct() :
                wrong('After clicking on the element, there should be an Audio object in the HTML.');
        }),
        //Test#2 - проверяем !paused у audio после клика
        this.node.execute(async () => {
            await this.page.refresh();
            sleep(700);
            let being = await this.page.findBySelector('img[data-coords]');
            await being.click();
            let audioObjs = await this.page.findAllBySelector('audio');
            let paused = 'true';
            for(let a of audioObjs) {
                paused = await a.getProperty('paused');
                if (paused === 'false') break;
            }

            return paused === 'false' ? correct() :
                wrong('After clicking on the creature, a sound should be played.');
        }),
        //Test#3 - проверяем paused у audio после клика на несоседние элементы
        this.node.execute(async () => {
            sleep(700);
            let beings = await this.page.findAllBySelector('img[data-coords]');
            await beings[2].click();
            let audioObjs = await this.page.findAllBySelector('audio');
            let paused = 'true';
            for(let a of audioObjs) {
                paused = await a.getProperty('paused');
                if (paused === 'false') break;
            }

            return paused === 'true' ? correct() :
                wrong('After clicking on non-adjacent creatures, the sound should not be played.');
        }),
        //Test#4 - проверяем !paused у audio после исчезновения элементов
        this.node.execute(async () => {
            await this.page.refresh();
            sleep(700);
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
                cellsForSwap = getCellsForSwap(false, false, 2, map);
                if (cellsForSwap.length === 0) {
                    cellsForSwap = getCellsForSwap(true, false, 2, map);
                }
            }
            let being1 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[0].y}_y${cellsForSwap[0].x}]`);
            let being2 = await this.page.findBySelector(`img[data-coords=x${cellsForSwap[1].y}_y${cellsForSwap[1].x}]`);

            await being1.click();
            await being2.click();

            sleep(700);

            let audioObjs = await this.page.findAllBySelector('audio');
            let paused = 'true';
            for(let a of audioObjs) {
                paused = await a.getProperty('paused');
                if (paused === 'false') break;
            }

            return paused === 'false' ? correct() :
                wrong('After the creatures disappear, the sound should play.');
        }),
        //Test#5 - проверяем keyframes при уничтожении (использован чистый puppeteer, так как без него не получилось пробросить переменную в evaluate)
        async () => {
            const browser = await puppeteer.launch({
                headless: true,
                defaultViewport: null,
                args: ['--start-maximized', '--disable-infobar'],
                ignoreDefaultArgs: ['--enable-automation'],
            });

            const page = await browser.newPage();
            await page.coverage.startCSSCoverage();
            await page.goto(pagePath);

            let map = [];
            let cellsForSwap = [];
            while(cellsForSwap.length === 0) {
                await page.reload();
                sleep(1000);
                this.cells = await page.$$('.cell');
                map = [];
                let str = '';
                for (let i = 0; i < 5; i++) {
                    map[i] = [];
                    for (let j = 0; j < 5; j++) {
                        map[i][j] = await page.evaluate(el => el.getAttribute("data-being"), this.cells[5 * i + j]);
                        str += map[i][j] + ' ';
                    }
                    str += '\n';
                }
                cellsForSwap = getCellsForSwap(false, false, 2, map);
                if (cellsForSwap.length === 0) {
                    cellsForSwap = getCellsForSwap(true, false, 2, map);
                }
            }
            const v = cellsForSwap;
            let animationEnd = await page.evaluate((cellsForSwap) => {
                let animated = document.querySelector('#map');
                let flag = false;
                animated.onanimationend = function () {
                    flag = true;
                };
                let being1 = document.querySelector(`img[data-coords=x${cellsForSwap[0].y}_y${cellsForSwap[0].x}]`);
                let being2 = document.querySelector(`img[data-coords=x${cellsForSwap[1].y}_y${cellsForSwap[1].x}]`);
                being2.click();
                sleep(500);
                being1.click();
                sleep(500);
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 2000);
                }).then(() => flag);
            }, v);
            console.log(animationEnd);

            await browser.close();
            return animationEnd ?
                correct() :
                wrong('When the creature disappears, the animation should start. Note that the animation must take place inside the map element.');
        },
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
