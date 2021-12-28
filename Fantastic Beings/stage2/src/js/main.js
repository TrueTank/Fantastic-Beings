"use strict";

const rowsCount = 5;
const colsCount = 5;

function renderMap(rowsCount, colsCount) {
    if(rowsCount !== colsCount) {
        return 'Error!';
    }
    if(rowsCount < 0 || colsCount < 0) {
        return 'Error!';
    }
    if(isNaN(rowsCount) || isNaN(colsCount) < 0) {
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
        }
    }
}

window.onload = function () {
    renderMap(rowsCount, colsCount);
};
