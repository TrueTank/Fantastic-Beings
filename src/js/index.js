"use strict";
import {Sound} from "./sound.js"
import {map} from "./map.js"
import {settings} from "./settings.js";
import '../style.css'
import soundClick from "../sounds/click.wav"
import soundMatch from "../sounds/match.wav"

export let game = {
    settings,
    map,
    selectedBeing: '',
    gameOver: false,
    soundClick: null,
    soundMatch: null,
    init() {
        this.map.renderMap(this.settings.rowsCount, this.settings.colsCount);
        this.map.renderBeings();
        this.map.initStatusBar();
        window.onclick = this.mouseClickHandler;
        this.soundClick = new Sound(soundClick);
        this.soundMatch = new Sound(soundMatch);
    },
    isWin() {
        let counter = 0;
        for(let being in settings.beingsForWin) {
            counter += settings.beingsForWin[being];
        }
        return counter <= 0;
    },
    //TODO Refactor!!!
    mouseClickHandler(e) {
        if(!this.gameOver) {
            let target = e.target;
            if (target.dataset.coords) {
                if (game.selectedBeing) {
                    if (game.isAdjacentCell(game.selectedBeing.dataset.coords, target.dataset.coords)) {
                        game.soundClick.play();
                        game.changeBeings(target, game.selectedBeing);
                        game.map.resetCell(game.selectedBeing.dataset.coords);
                        if (map.checkMatchesInMap()) {
                            map.shiftBeings();
                            map.renderBeings();
                            while (map.checkMatchesInMap()) {
                                map.shiftBeings();
                                map.renderBeings();
                            }
                        } else {
                            game.changeBeings(target, game.selectedBeing);
                        }
                        game.selectedBeing = '';
                        settings.numberOfMoves--;
                        map.updateStatusBar();
                        if (game.isWin()) {
                            map.gameResultObj.innerHTML = 'You won! Reload the page to start the game again.';
                            this.gameOver = true;
                            return;
                        }
                        if(settings.numberOfMoves === 0) {
                            map.gameResultObj.innerHTML = 'You lost! Reload the page to start the game again.';
                            this.gameOver = true;
                        }
                    }
                } else {
                    game.soundClick.play();
                    game.selectedBeing = target;
                    game.map.setSelectedCell(game.selectedBeing.dataset.coords);
                    return true;
                }
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
