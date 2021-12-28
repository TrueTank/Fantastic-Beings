const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#1 - check count of tds
        this.node.execute(async () => {
            const tds = await this.page.findAllBySelector('td');

            return tds.length === 25 ?
                correct() :
                wrong(`The map must be 5x5.`);
        }),
        //Test#2 - check that map set class cell to the cells
        this.node.execute(async () => {
            const cells = await this.page.findAllBySelector('.cell');

            return cells.length === 25 ?
                correct() :
                wrong(`Each cell of the map must have a 'cell' class.`);
        }),
        //Test#3 - check rows count
        this.node.execute(async () => {
            const cells = await this.page.findAllBySelector('tr');

            return cells.length === 5 ?
                correct() :
                wrong(`The map must have 5 rows in the table.`);
        }),
        //Test#4 - check that map filled dynamically
        this.node.execute(async () => {
            let map = await this.page.findAllBySelector('#map');
            map.innerHTML = '';
            await this.page.evaluate(async () => {
                window.onload = function () {}
            });
            await this.page.refresh();
            const cells = await this.page.findAllBySelector('tr');

            return cells.length ?
                wrong(`The map must have 5 rows in the table.`) :
                correct()
        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
