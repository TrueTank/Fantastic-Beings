"use strict";

let game = {
    rowsCount: 5,
    colsCount: 5,
    beings: ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'],
    cells: {},
    renderMap(rowsCount, colsCount) {
        if (rowsCount !== colsCount) {
            return 'Error!';
        }
        if (rowsCount < 0 || colsCount < 0) {
            return 'Error!';
        }
        if (isNaN(rowsCount) || isNaN(colsCount) < 0) {
            return 'Error!';
        }
        let table = document.getElementById('map');
        table.innerHTML = '';

        for (let row = 0; row < rowsCount; row++) {
            let tr = document.createElement('tr');
            tr.classList.add('row');
            table.appendChild(tr);

            for (let col = 0; col < colsCount; col++) {
                let td = document.createElement('td');
                td.classList.add('cell');
                tr.appendChild(td);
                this.cells[`x${col}_y${row}`] = td;
            }
        }
    },
    renderBeings() {
        for (let cell in this.cells) {
            if(!this.cells[cell].dataset.being) {
                let being = this.beings[Math.floor(Math.random() * this.beings.length)];
                this.addBeingToCell(being, cell);
            }
        }
    },
    addBeingToCell(being, coords) {
        let beingImg = document.createElement('img');
        beingImg.dataset.coords = coords;
        beingImg.classList.add('being');
        beingImg.src = `images/${being}.png`;
        this.cells[coords].appendChild(beingImg);
        this.cells[coords].dataset.being = being;
    },
    init() {
        this.renderMap(this.rowsCount, this.colsCount);
        this.renderBeings();
    }
};

window.onload = function () {
    game.init();
};
