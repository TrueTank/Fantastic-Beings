"use strict";

let settings = {
    rowsCount: 5,
    colsCount: 5,
    beings: ['zouwu', 'swooping', 'salamander', 'puffskein', 'kelpie'],
    minLength: 3,
    numberOfMoves: 15,
    beingsForWin: {
        'zouwu': 10,
        'kelpie': 10
    },
    score: 0,
};

let renderer = {
    cells: {},
    movesObj: null,
    scoreObj: null,
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
        let b = group[0].dataset.being;
        if(settings.beingsForWin[b]) {
            settings.beingsForWin[b] -= group.length;
            settings.beingsForWin[b] = settings.beingsForWin[b] < 0 ? 0 : settings.beingsForWin[b];
            this.updateStatusBar();
        }
        settings.score += group.length * 10;
        for (let g of group) {
            this.clearCell(g);
        }
    },
    shiftBeings() {
        for (let col = 0; col < settings.rowsCount; col++) {
            let emptyIndex = -1;
            for (let row = settings.colsCount - 1; row >= 0; row--) {
                let cell = this.cells[`x${col}_y${row}`];
                if (!cell.dataset.being && emptyIndex === -1) {
                    emptyIndex = row;
                } else {
                    if (emptyIndex > -1 && cell.dataset.being) {
                        this.addBeingToCell(cell.dataset.being, `x${col}_y${emptyIndex}`);
                        this.clearCell(cell);
                        emptyIndex--;
                    }
                }
            }
        }
    },
    isWin() {
        let counter = 0;
        for(let being in settings.beingsForWin) {
            counter += settings.beingsForWin[being];
        }
        return counter <= 0;
    },
    initStatusBar() {
        this.movesObj = document.querySelector('#moves-value');
        this.scoreObj = document.querySelector('#score-value');
        let bfw = document.getElementById('beings-for-win');
        for(let b in settings.beingsForWin) {
            let spanObject = document.createElement('span');
            spanObject.classList.add(b);
            bfw.appendChild(spanObject);
        }
        this.updateStatusBar();
    },
    updateStatusBar() {
        this.movesObj.innerHTML = settings.numberOfMoves;
        this.scoreObj.innerHTML = settings.score;
        for(let b in settings.beingsForWin) {
            document.querySelector('#beings-for-win span.'+ b).innerHTML = settings.beingsForWin[b];
        }
    }
};

let game = {
    settings,
    renderer,
    selectedBeing: '',
    gameOver: false,
    init() {
        this.renderer.renderMap(this.settings.rowsCount, this.settings.colsCount);
        this.renderer.renderBeings();
        this.renderer.initStatusBar();
        window.onclick = this.mouseClickHandler;
    },
    //TODO Refactor!!!
    mouseClickHandler(e) {
        if(!this.gameOver) {
            let target = e.target;
            if (target.dataset.coords) {
                if (game.selectedBeing) {
                    if (game.isAdjacentCell(game.selectedBeing.dataset.coords, target.dataset.coords)) {
                        game.changeBeings(target, game.selectedBeing);
                        game.renderer.resetCell(game.selectedBeing.dataset.coords);
                        if (renderer.checkMatchesInMap()) {
                            renderer.shiftBeings();
                            renderer.renderBeings();
                            while (renderer.checkMatchesInMap()) {
                                renderer.shiftBeings();
                                renderer.renderBeings();
                            }
                        } else {
                            game.changeBeings(target, game.selectedBeing);
                        }
                        game.selectedBeing = '';
                        if (renderer.isWin()) {
                            alert('Ура! Победа!');
                            this.gameOver = true;
                            return;
                        }
                        settings.numberOfMoves--;
                        renderer.updateStatusBar();
                        if(settings.numberOfMoves === 0) {
                            alert('Вы проиграли:С Чтобы попробовать ещё раз, перезагрузите страницу.');
                            this.gameOver = true;
                        }
                    }
                } else {
                    game.selectedBeing = target;
                    game.renderer.setSelectedCell(game.selectedBeing.dataset.coords);
                    return true;
                }
            }
        } else {
            alert('Игра окончена! Чтобы попробовать ещё раз, перезагрузите страницу.');
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
