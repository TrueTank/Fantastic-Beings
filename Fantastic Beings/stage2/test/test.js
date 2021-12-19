const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        // Test#1 - check that renderMap clean tag table before filling
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                return this.renderMap(0,0);
            });
            const map = await this.page.findById('map');
            let html = await map.innerHtml();

            return html === '' ?
                correct() :
                wrong(`You need to remove all elements inside the table tag before rendering the map.`);
        }),
        // Test#2 - check renderMap(1, 1)
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                return this.renderMap(1,1);
            });
            const tds = await this.page.findAllBySelector('td');

            return tds.length === 1 ?
                correct() :
                wrong(`The renderMap function should work correctly with different values.`);
        }),
        //Test#3 - check renderMap(100, 100)
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                return this.renderMap(100,100);
            });
            const tds = await this.page.findAllBySelector('td');

            return tds.length === 10000 ?
                correct() :
                wrong(`The renderMap function should work correctly with different values.`);
        }),
        //Test#4 - check renderMap(5, 2)
        this.node.execute(async () => {
            let errorMessage = await this.page.evaluate(async () => {
                return this.renderMap(5,2);
            });

            return errorMessage === 'Error!' ?
                correct() :
                wrong(`The renderMap function should return 'Error!' for incorrect parameters.`);
        }),
        //Test#5 - check that renderMap set class cell to the cells
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                return this.renderMap(5,5);
            });
            const cells = await this.page.findAllBySelector('.cell');

            return cells.length === 25 ?
                correct() :
                wrong(`The renderMap function should add class 'cell' to each cell.`);
        }),
        //Test#6 - check renderMap(-5, -5)
        this.node.execute(async () => {
            let errorMessage = await this.page.evaluate(async () => {
                return this.renderMap(-5,-5);
            });

            return errorMessage === 'Error!' ?
                correct() :
                wrong(`The renderMap function should return 'Error!' for incorrect parameters.`);
        }),
        //Test#7 - check renderMap('five', 'five')
        this.node.execute(async () => {
            let errorMessage = await this.page.evaluate(async () => {
                return this.renderMap('five', 'five');
            });

            return errorMessage === 'Error!' ?
                correct() :
                wrong(`The renderMap function should return 'Error!' for incorrect parameters.`);
        }),
        //Test#8 - check renderMap()
        this.node.execute(async () => {
            let errorMessage = await this.page.evaluate(async () => {
                return this.renderMap();
            });

            return errorMessage === 'Error!' ?
                correct() :
                wrong(`The renderMap function should return 'Error!' for incorrect parameters.`);
        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
