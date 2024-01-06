"use strict";


window.renderMap = function(rowsCount, colsCount) {
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
            game.cells[`x${col}_y${row}`] = td;
        }
    }
}

window.clearMap = function() {
    let table = document.getElementById('map');
    table.innerHTML = '';
}

let game = {
    beings: ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'],
    cells: {},
    renderBeings() {
        for (let cell in this.cells) {
            if(!this.cells[cell].dataset.being) {
                let being = this.beings[Math.floor(Math.random() * this.beings.length)];
                this.addBeingToCell(being, cell);
            }
        }
    },
    addBeingToCell(being, coords) {
        if(this.cells[coords] && this.beings.includes(being)) {
            let beingImg = document.createElement('img');
            beingImg.dataset.coords = coords;
            beingImg.src = `images/${being}.png`;
            this.cells[coords].appendChild(beingImg);
            this.cells[coords].dataset.being = being;
        } else {
            return "Error!";
        }
    }
};

window.redrawMap = function (map) {
    let rows = map.length;
    if(rows < 3) {
        return false;
    }
    for(let r of map) {
        if(r.length !== rows) {
            return false;
        }
    }
    window.renderMap(rows, rows);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < rows; col++) {
            if (!game.cells[`x${col}_y${row}`].dataset.being) {
                if (game.beings.includes(map[row][col])) {
                    let being = map[row][col];
                    game.addBeingToCell(being, `x${col}_y${row}`);
                } else {
                    return false;
                }
            }
        }
    }
};

window.onload = function () {
    renderMap(5, 5);
    game.renderBeings();
};
