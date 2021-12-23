const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#1 - check game object
        //Test#2 - check renderMap in game object
        //Test#3 - check init in game object
        //Test#4 - check cells object in game object
        //Test#5 - check beings array in game object
        //Test#6 - check addBeingToCell function in game object
        //Test#7 - check renderBeings function in game object
        //Test#8 - check renderBeings function in game.init
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
