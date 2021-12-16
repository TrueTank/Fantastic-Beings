const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        this.page.execute(() => {
            this.board = document.getElementById('board');

            return this.board ?
                correct() :
                wrong(`You need to create a game board with the ID "board"`)
        }),
        this.page.execute(() => {
            let boardChilds = this.board.children;
            for(let i of boardChilds) {
                if(i.tagName === 'TABLE') {
                    return correct();
                }
            }

            return wrong(`You need to create a table element for map in your board`)
        }),
        this.page.execute(() => {
            this.map = document.getElementById('map');

            return this.map ?
                correct() :
                wrong(`You need to create a game board with the ID "board"`)
        }),
        this.page.execute(() => {
            let rows = this.map.rows.length;

            return rows === 10 ?
                correct() :
                wrong(`You need to create a map with 10 rows, found ${rows}`)
        }),
        this.page.execute(() => {
            let tds = document.getElementsByTagName('td').length;
            let cells = document.getElementsByClassName('cell').length;

            return cells === 100 && tds === 100 ?
                correct() :
                wrong(`You need to create a map with 100 cells, found ${cells} cells and ${tds} 'td' elements`)
        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
