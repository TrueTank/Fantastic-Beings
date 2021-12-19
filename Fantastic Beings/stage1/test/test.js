const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        this.node.execute(async () => {
            // this code will be executed in the Node.js context
            const board = await this.page.findById('board')
            return correct()
        }),
        // Test#1 - check existence of board element
        this.page.execute(() => {
            this.board = document.getElementById('board');

            return this.board ?
                correct() :
                wrong(`You need to create a game board with the ID "board"`)
        }),
        // Test#2 - check existence of table element
        this.page.execute(() => {
            let boardChilds = this.board.children;
            for(let i of boardChilds) {
                if(i.tagName === 'TABLE') {
                    return correct();
                }
            }

            return wrong(`You need to create a table element for map in your board`)
        }),
        // Test#3 - check existence of map element
        this.page.execute(() => {
            this.map = document.getElementById('map');

            return this.map ?
                correct() :
                wrong(`You need to create a game board with the ID "board"`)
        }),
        // Test#4 - check number of rows in table
        this.page.execute(() => {
            let rows = this.map.rows.length;

            return rows === 9 ?
                correct() :
                wrong(`You need to create a map with 10 rows, found ${rows}`)
        }),
        // Test#5 - check number of cells in map
        this.page.execute(() => {
            let tds = document.getElementsByTagName('td').length;
            let cells = document.getElementsByClassName('cell').length;

            return cells === 90 && tds === 90 ?
                correct() :
                wrong(`You need to create a map with 100 cells, found ${cells} cells and ${tds} 'td' elements`)
        }),
        // Test#6 - check borders of cells
        this.page.execute(() => {
            this.cells = document.getElementsByClassName('cell');
            let i = 0;
            for (let elem of this.cells) {
                i++;
                let currBorder = window.getComputedStyle(elem).border;
                if (currBorder.includes('0px') || !currBorder.includes('rgb(147, 112, 219)')) {
                    return wrong(`Looks like cell of game map #${i} ` +
                        `has no border. It should have a mediumpurple border.`);
                }
            }
            return correct()
        }),
        // Test#7 - check form of cells
        this.page.execute(() => {
            let i = 0;
            for (let elem of this.cells) {
                i++;
                let width = window.getComputedStyle(elem).width;
                let height = window.getComputedStyle(elem).height;
                if (width !== height) {
                    return wrong(`Looks like cell of game map #${i} ` +
                        `has invalid sizes.`);
                }
            }
            return correct()
        }),
        // Test#8 - check size of cells
        this.page.execute(() => {
            let i = 0;
            let bodyHeight = window.getComputedStyle(document.body).height;
            let requiredCellHeight = parseInt(0.06*bodyHeight.replace('px', ''));
            for (let elem of this.cells) {
                i++;
                let height = window.getComputedStyle(elem).height;
                if (parseInt(height.replace('px', '')) !== requiredCellHeight) {
                    return wrong(`Looks like cell of game map #${i} ` +
                        `has invalid sizes.`);
                }
            }
            return correct()
        }),
        // Test#9 - check position of map
        this.page.execute(() => {
            let mapStyle = window.getComputedStyle(this.map);
            let boardWidth = window.getComputedStyle(this.board).width.replace('px', '');
            let mapWidth = mapStyle.width.replace('px', '');
            let mapMarginLeft = mapStyle.marginLeft.replace('px', '');

            return (boardWidth - mapWidth - mapMarginLeft == mapMarginLeft) ?
                correct() :
                wrong(`You need to position the game map in the center relative to the horizontal`)
        }),
        // Test#10 - check height of board
        // Test#11 - check background images
        // Test#12 - check size of status-bar
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
