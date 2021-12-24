const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class FantasticBeingsTest extends StageTest {

    page = this.getPage(pagePath);

    tests = [
        //Test#1 - check game object
        this.node.execute(async () => {
            this.game = await this.page.evaluate(async () => {
                return game;
            });

            return this.game ?
                correct() :
                wrong(`You need to create game object`);
        }),
        //Test#2 - check renderMap in game object
        this.node.execute(async () => {
            return this.game.renderMap ?
                correct() :
                wrong(`You need to put renderMap() method in game object`);
        }),
        //Test#3 - check init in game object
        this.node.execute(async () => {
            return this.game.init ?
                correct() :
                wrong(`You need to put init() method in game object`);
        }),
        //Test#4 - check cells object in game object
        this.node.execute(async () => {
            return this.game.cells ?
                correct() :
                wrong(`You need to put cells object in game object`);
        }),
        //Test#5 - check beings array in game object
        this.node.execute(async () => {
            return this.game.beings && this.game.beings.length === 5  ?
                correct() :
                wrong(`You need to put beings array in game object and length of this must be 5 elements`);
        }),
        //Test#6 - check addBeingToCell function in game object
        this.node.execute(async () => {
            return this.game.addBeingToCell  ?
                correct() :
                wrong(`You need to put addBeingToCell method in game object`);
        }),
        //Test#7 - check renderBeings function in game object
        this.node.execute(async () => {
            return this.game.renderBeings  ?
                correct() :
                wrong(`You need to put renderBeings method in game object`);
        }),
        //Test#8 - check renderBeings function in game.init
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                game.renderMap(0,0);
                game.init();
            });
            const td = await this.page.findBySelector('.cell');
            let being = '';
            if(td) {
                being = await td.innerHtml();
            }
            return being  ?
                correct() :
                wrong(`You need to put renderMap and renderBeings methods in game.init method`);
        }),
        //Test#8 - check cells object content
        this.node.execute(async () => {
            let cells = this.game.cells;
            for (let row = 0; row < this.game.rowsCount; row++) {
                for (let col = 0; col < this.game.colsCount; col++) {
                    if(!cells[`x${col}_y${row}`]) {
                        return wrong(`You must fill the cells object as described in the Examples section.
                        Your cells object does not have this field: x${col}_y${row}`);
                    }
                }
            }
            return correct();
        }),
        //Test#9 - check beings array content
        this.node.execute(async () => {
            let beings = ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'];
            for(let b of beings) {
                if(!this.game.beings.includes(b)) {
                    return wrong(`Your beings array does not contain an element ${b}.`);
                }
            }
            return correct();
        }),
        //Test#10 - check addBeingToCell function work
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                game.renderMap(5,5);
                game.addBeingToCell('zouwu', 'x2_y2');
            });
            let cell = await this.page.findBySelector('.cell[data-being="zouwu"]');
            let beingImg = await this.page.findBySelector('img[data-coords="x2_y2"]');

            return beingImg && cell  ?
                correct() :
                wrong(`After adding a creature to the cell, it should have a dataset.being property with the name of the creature (now dataset.being=${cell.dataset.being}),
                 and the img object inside the cell should have a dataset.coords with a key from the cells object now dataset.coords=${beingImg.dataset.coords}.`);
        }),
        //Test#11 - check addBeingToCell function work
        this.node.execute(async () => {
            let errorMsg = await this.page.evaluate(async () => {
                game.renderMap(5,5);
                return game.addBeingToCell('zouwu', 'x10_y2');
            });

            return errorMsg === 'Error!'  ?
                correct() :
                wrong(`The method game.addBeingToCell should return an error string if incorrect parameters were passed there.`);
        }),
        //Test#12 - check addBeingToCell function work
        this.node.execute(async () => {
            let errorMsg = await this.page.evaluate(async () => {
                game.renderMap(5,5);
                return game.addBeingToCell('qwe', 'x1_y2');
            });

            return errorMsg === 'Error!'  ?
                correct() :
                wrong(`The method game.addBeingToCell should return an error string if incorrect parameters were passed there.`);
        }),
        //Test#13 - check renderBeings function work
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                game.renderMap(5,5);
                game.renderBeings();
            });

            let imgs = await this.page.findAllBySelector('img[data-coords]');
            let cells = await this.page.findAllBySelector('.cell[data-being]');

            return imgs.length === 25 && cells.length === 25  ?
                correct() :
                wrong(`The method game.renderBeings must fill all empty cells of the card with creatures.`);
        }),
        //Test#14 - check renderBeings function work
        this.node.execute(async () => {
            await this.page.evaluate(async () => {
                game.renderMap(5,5);
                game.addBeingToCell('zouwu', 'x2_y2');
                game.renderBeings();
            });

            let imgs = await this.page.findAllBySelector('img[data-coords]');
            let cells = await this.page.findAllBySelector('.cell[data-being]');

            return imgs.length === 25 && cells.length === 25  ?
                correct() :
                wrong(`The method game.renderBeings must place only one creature in each cell.`);
        }),
    ]

}

jest.setTimeout(30000);
test("Test stage", async () => {
        await new FantasticBeingsTest().runTests()
    }
);
