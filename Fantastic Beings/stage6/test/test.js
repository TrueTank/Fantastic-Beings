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
        //Test#0 - проверяем тег audio в html и атрибут src
        this.node.execute(async () => {

        }),
        //Test#1 - проверяем !paused у audio после клика
        this.node.execute(async () => {

        }),
        //Test#2 - проверяем !paused у audio после клика на несоседние элементы
        this.node.execute(async () => {

        }),
        //Test#3 - проверяем !paused у audio после исчезновения элементов
        this.node.execute(async () => {

        }),
        //Test#4 - проверяем увеличение картинки существа при наведении
        this.node.execute(async () => {

        }),
        //Test#5 - проверяем keyframes при уничтожении
        this.node.execute(async () => {

        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
