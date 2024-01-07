import {settings} from "./settings.js";
import {game} from "./index.js"

export let map = {
    cells: {},
    movesObj: null,
    scoreObj: null,
    gameResultObj: null,
    renderMap() {
        let table = document.getElementById('map');
        table.innerHTML = '';

        for (let row = 0; row < settings.rowsCount; row++) {
            let tr = document.createElement('tr');
            tr.classList.add('row');
            table.appendChild(tr);

            for (let col = 0; col < settings.colsCount; col++) {
                let td = document.createElement('td');
                td.classList.add('cell');
                tr.appendChild(td);
                this.cells[`x${row}_y${col}`] = td;
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
        beingImg.src = settings.beingsImgs[being];
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
                let being = isRows ? this.cells[`x${j}_y${i}`] : this.cells[`x${i}_y${j}`];
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
        game.soundMatch.play();
        let b = group[0].dataset.being;
        if (b) {
            if (settings.beingsForWin[b]) {
                settings.beingsForWin[b] -= group.length;
                settings.beingsForWin[b] = settings.beingsForWin[b] < 0 ? 0 : settings.beingsForWin[b];
                this.updateStatusBar();
            }
            settings.score += group.length * 10;
            for (let g of group) {
                g.classList.add('clear');
                this.clearCell(g);
                setTimeout(function() {
                    g.classList.remove('clear');
                }, 600);
            }
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
    initStatusBar() {
        this.movesObj = document.querySelector('#moves-value');
        this.scoreObj = document.querySelector('#score-value');
        this.gameResultObj = document.querySelector('#game-footer');
        this.gameResultObj.innerHTML = 'Swap animals to form a sequence of three in a row';
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
