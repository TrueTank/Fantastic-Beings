"use strict";

let settings = {
    rowsCount: 10,
    colsCount: 10,
};

let renderer = {
    cells: {},
    renderMap(rowsCount, colsCount) {
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
    }
};

let game = {
    settings,
    renderer,
    init() {
        this.renderer.renderMap(this.settings.rowsCount, this.settings.colsCount);
    }
};

window.onload = function () {
    game.init();
};
