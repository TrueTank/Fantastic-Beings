"use strict";

let settings = {
    rowsCount: 5,
    colsCount: 5,
    beings: ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'],
    minLength: 3
};

function renderMap(rowsCount, colsCount) {
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
            renderer.cells[`x${col}_y${row}`] = td;
        }
    }
}

function clearMap() {
    let table = document.getElementById('map');
    table.innerHTML = '';
}

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
    renderMap(rows, rows);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < rows; col++) {
            if (!renderer.cells[`x${col}_y${row}`].dataset.being) {
                if (settings.beings.includes(map[row][col])) {
                    let being = map[row][col];
                    renderer.addBeingToCell(being, `x${col}_y${row}`);
                } else {
                    return false;
                }
            }
        }
    }
};

let renderer = {
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
                let being = settings.beings[Math.floor(Math.random() * settings.beings.length)];
                this.addBeingToCell(being, cell);
            }
        }
    },
    addBeingToCell(being, coords) {
        let beingImg = document.createElement('img');
        beingImg.dataset.coords = coords;
        beingImg.src = `images/${being}.png`;
        this.cells[coords].appendChild(beingImg);
        this.cells[coords].dataset.being = being;

        let hoverDiv = document.createElement('div');
        this.cells[coords].appendChild(hoverDiv);
    },
    setSelectedCell(coords) {
        this.cells[coords].classList.add('selected');
    },
    resetCell(coords) {
        this.cells[coords].classList.remove('selected');
    },
    clearCell(cell) {
        cell.innerHTML = '';
        cell.dataset.being = '';
    },
    checkMatchesInMap() {
        let hor = this.checkAndDeleteLinesForMatch();
        let vert = this.checkAndDeleteLinesForMatch(true);
        return hor || vert;
    },
    //TODO Refactor!!!
    checkAndDeleteLinesForMatch(isRows) {
        let deleteFlag = false;
        let group = [];
        let that = this;

        function dropGroup() {
            if (group.length >= settings.minLength) {
                that.deleteGroup(group);
                deleteFlag = true;
                return true;
            }
            return false;
        }

        for (let i = 0; i < settings.rowsCount; i++) {
            let currentBeing = '';
            group = [];
            for (let j = 0; j < settings.colsCount; j++) {
                let being = isRows ? this.cells[`x${i}_y${j}`] : this.cells[`x${j}_y${i}`];
                if (currentBeing !== being.dataset.being) {
                    if (!dropGroup()) {
                        currentBeing = being.dataset.being;
                        if (being.dataset.being) {
                            group = [being];
                        } else {
                            group = [];
                        }
                    }
                } else {
                    if (being.dataset.being) {
                        group.push(being);
                    }
                }
                if (j === settings.colsCount - 1) {
                    dropGroup();
                }
            }
        }
        return deleteFlag;
    },
    deleteGroup(group) {
        for (let g of group) {
            this.clearCell(g);
        }
    },
};

let game = {
    settings,
    renderer,
    selectedBeing: '',
    init() {
        this.renderer.renderMap(this.settings.rowsCount, this.settings.colsCount);
        this.renderer.renderBeings();
        window.onclick = this.mouseClickHandler;
    },
    //TODO Refactor!!!
    mouseClickHandler(e) {
        let target = e.target;
        if (target.dataset.coords) {
            if (game.selectedBeing) {
                if (game.isAdjacentCell(game.selectedBeing.dataset.coords, target.dataset.coords)) {
                    game.changeBeings(target, game.selectedBeing);
                    game.renderer.resetCell(game.selectedBeing.dataset.coords);
                    if (renderer.checkMatchesInMap()) {
                        /*renderer.renderBeings();
                        while(renderer.checkMatchesInMap()) {
                            renderer.renderBeings();
                        }*/
                    } else {
                        game.changeBeings(target, game.selectedBeing);
                    }
                    game.selectedBeing = '';
                }
            } else {
                game.selectedBeing = target;
                game.renderer.setSelectedCell(game.selectedBeing.dataset.coords);
                return true;
            }
        }
    },
    //TODO Refactor!!!
    isAdjacentCell(cell1, cell2) {
        if (cell1 && cell2) {
            if (cell1[1] === cell2[1]) {
                if (Math.abs(cell1[4] - cell2[4]) === 1) {
                    return true;

                }
            } else {
                if (cell1[4] === cell2[4]) {
                    if (Math.abs(cell1[1] - cell2[1]) === 1) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    //TODO Refactor!!!
    changeBeings(being1, being2) {
        let tmp = being1.src;
        let parent = being1.parentElement.dataset.being;
        being1.src = being2.src;
        being1.parentElement.dataset.being = being2.parentElement.dataset.being;
        being2.src = tmp;
        being2.parentElement.dataset.being = parent;
    }
};

window.onload = function () {
    game.init();
};
