"use strict";
import {Sound} from "./sound.js"
import {map} from "./map.js"
import {settings} from "./settings.js";
import '../style.css'
import soundClick from "../sounds/click.wav"
import soundMatch from "../sounds/match.wav"

export let game = {
    map,
    selectedBeing: '',
    gameOver: false,
    soundClick: null,
    soundMatch: null,
    init() {
        this.map.renderMap(settings.rowsCount, settings.colsCount);
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
    handleLoss() {
        map.gameResultObj.innerHTML = 'You lost! Reload the page to start the game again.';
        this.gameOver = true;
        document.querySelector('#board').classList.add('loss');
    },
    handleWin() {
        map.gameResultObj.innerHTML = 'You won! Reload the page to start the game again.';
        game.gameOver = true;
        document.querySelector('#board').classList.add('win');
    },
    //TODO Refactor!!!
    mouseClickHandler(e) {
        if(!game.gameOver) {
            let target = e.target;
            if (target.dataset.coords) {
                if (game.selectedBeing) {
                    if (map.isAdjacentCell(game.selectedBeing.dataset.coords, target.dataset.coords)) {
                        game.soundClick.play();
                        map.changeBeings(target, game.selectedBeing);
                        game.map.resetCell(game.selectedBeing.dataset.coords);
                        if (map.findMatchGroup() === -1) {
                            map.changeBeings(target, game.selectedBeing);
                        } else {
                            map.removeAllMatches();
                        }
                        game.selectedBeing = '';
                        settings.numberOfMoves--;
                        map.updateStatusBar();
                        if (game.isWin()) {
                            game.handleWin();
                            return;
                        }
                        if(settings.numberOfMoves === 0) {
                            game.handleLoss();
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
    }
};

window.onload = function () {
    game.init();
};
