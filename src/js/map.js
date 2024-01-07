import {settings} from "./settings.js";
import {game} from "./index.js"

const customDelay = delay => new Promise(resolve => setTimeout(resolve, delay));

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
                let counter = 5;
                do {
                    counter--;
                    let being = settings.beings[Math.floor(Math.random() * settings.beings.length)];
                    this.addBeingToCell(being, cell);
                } while(this.findMatchGroup() !== -1 && counter > 0)
            }
        }
    },
    addBeingToCell(being, coords) {
        let beingImg = document.querySelector(`img[data-coords="${coords}"]`);
        if (!beingImg) beingImg = document.createElement('img');
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
    findMatchGroup() {
        let group = [];
        let that = this;
        function checkLines(isRows) {
            for (let i = 0; i < settings.rowsCount; i++) {
                let currentBeing = '';
                group = [];
                for (let j = 0; j < settings.colsCount; j++) {
                    let being = isRows ? that.cells[`x${i}_y${j}`] : that.cells[`x${j}_y${i}`];
                    if (currentBeing === being.dataset.being) {
                        if (being.dataset.being) {
                            group.push(being);
                        }
                    } else {
                        if (group.length >= settings.minLength) {
                            return;
                        }
                        currentBeing = being.dataset.being;
                        group = [being];
                    }
                }
                if (group.length >= settings.minLength) {
                    return;
                }
            }
            group = [];
        }
        checkLines();
        if (group.length > 0) {
            return group;
        } else {
            checkLines(true);
            return group.length > 0 ? group : -1
        }
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
        for (let j = 0; j < settings.colsCount; j++) {
            let emptyIndex = -1;
            for (let i = settings.rowsCount - 1; i >= 0; i--) {
                let cell = this.cells[`x${i}_y${j}`];
                if (!cell.dataset.being && emptyIndex === -1) {
                    emptyIndex = i;
                } else {
                    if (emptyIndex > -1 && cell.dataset.being) {
                        this.addBeingToCell(cell.dataset.being, `x${emptyIndex}_y${j}`);
                        this.clearCell(cell);
                        emptyIndex--;
                    }
                }
            }
        }
    },
    removeAllMatches() {
        let groupForDeletion = this.findMatchGroup();
        while (groupForDeletion !== -1) {
            this.deleteGroup(groupForDeletion);
            this.shiftBeings();
            this.renderBeings();
            groupForDeletion = this.findMatchGroup();
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
