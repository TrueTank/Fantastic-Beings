const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

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
        //Test#3 - клик на соседние клетки с мэтчами
        /*this.node.execute(async () => {
            let map = [];
            for (let i = 0; i < 5; i++) {
                map[i] = [];
                for (let j = 0; j < 5; j++) {
                    map[i][j] = this.cells[5 * i + j];
                }
            }
            console.log(map[0][0])
        }),*/
        //Test#4 - клик на соседние клетки, но без мэтчей
        this.node.execute(async () => {

        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
