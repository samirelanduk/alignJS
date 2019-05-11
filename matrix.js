import Alignment from './alignment.js';

function Matrix(sequence1, sequence2) {
    /**
     * A pairwise grid comparing one sequence with another.
     */

    this.rows = [];
    this.rows.push([""]);
    for (var char of sequence1) {
        this.rows[0].push(char);
    }
    for (var char of sequence2) {
        this.rows.push([char])
        for (var _ of sequence1) {
        this.rows[this.rows.length - 1].push(0);
        }
    }
    this.mainAlignment = [];


    // Matrix content methods
    this.pad = function() {
        /**
         * Creates an extra row and column near the top and left edges.
         */

        for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].splice(1, 0, i == 0 ? "" : 0);
        }
        this.rows.splice(1, 0, ["", 0]);
        for (var char of sequence1) {
        this.rows[1].push(0);
        }
    }


    this.fillDotMatrix = function() {
        /**
         * Fills the matrix with true and false markers, denoting matches.
         */
        for (var i = 1; i < this.rows.length; i++) {
            for (var j = 1; j < this.rows[0].length; j++) {
                this.rows[i][j] = this.rows[0][j] == this.rows[i][0];
            }
        }
        this.generateHtml();
    }


    this.fillNeedlemanWunsch = function() {
        /**
         * Fills the matrix with Needleman Wunsch scores, after padding out.
         */

        this.pad();
        for (var s = 1; s < this.rows[0].length; s++) {
        this.rows[1][s] = 1 - s;
        }
        for (var s = 1; s < this.rows.length; s++) {
        this.rows[s][1] = 1 - s;
        }

        const INDEL = -1
        const MISMATCH = -1
        const MATCH = 1

        for (var i=2; i < this.rows.length; i++) {
                for (var j=2; j < this.rows[0].length; j++) {
                    let scores = [];
                    let left = this.rows[i][j - 1];
                    let diagonal = this.rows[i - 1][j - 1];
                    let top = this.rows[i - 1][j];
                    scores.push(diagonal + (this.rows[i][0] == this.rows[0][j] ? MATCH : MISMATCH));
                    scores.push(top + MISMATCH);
                    scores.push(left + MISMATCH);
                    this.rows[i][j] = Math.max.apply(0, scores);
                }
        }
        this.generateHtml();
    }


    // Alignment methods
    this.createAlignment = function() {
        /**
         * Traverses the matrix filled with scores, and returns an alignment
         * list representing the optimal path. It does this by getting the
         * bottom right corner and just continuing it with the method for doing
         * that.
         */

        let i = this.rows.length - 1;
        let j = this.rows[0].length - 1;
        let alignment = [[i, j]];
        return this.continueAlignment(alignment);
    }


    this.continueAlignment = function(alignment) {
        /**
         * Takes a starting array of cells, and traverses the matrix filled with
         * scores from that point to get the optimal path. An Alignment object
         * will be returned.
         */

        let copy = [];
        for (var cell of alignment) {
            copy.push(cell);
        }
        let i = copy[copy.length - 1][0];
        let j = copy[copy.length - 1][1];
        while (i > 1 || j > 1) {
            let options = [this.rows[i - 1][j], this.rows[i - 1][j - 1], this.rows[i][j - 1]];
            if (i == 1) {
                j--;
            } else if (j == 1) {
                i--;
            } else if (options[1] >= options[0] && options[1] >= options[2]) {
                i--; j--;
            } else if (options[0] >= options[2]) {
                i--;
            } else {
                j--;
            }
            copy.push([i, j])
        }
        return new Alignment(this, copy);
    }


    // HTML methods
    this.generateHtml = function() {
        /**
         * Creates a HTML table from the matrix, color coded.
         */

        let table = document.createElement("TABLE");
        for (var row of this.rows) {
        let tableRow = table.insertRow();
        for (var cell of row) {
            let tableCell = tableRow.insertCell();
            if (typeof cell === "boolean") {
            if (cell) {
                tableCell.classList.add("match");
            }
            } else {
            tableCell.innerHTML = cell;
            if (Number.isInteger(cell)) {
                let opacity = (parseInt(255 / 30) * Math.abs(cell)).toString(16);
                let color = cell > 0 ? "#44bd32" : "#e84118";
                tableCell.style.backgroundColor = color + opacity;
            }
            }
        }
        }
        this.table = table;
    }


    this.render = function(className) {
        /**
         * Renders the matrix to the class name specified.
         */
        document.getElementsByClassName(className)[0].appendChild(this.table);
    }


    this.restore = function() {
        /**
         * Restores the matrix's table to its starting state, by removing
         * highlighted cells, and removing temporary alignments
         */

        let possibles = [...this.table.getElementsByClassName("possible")];
        for (var p = 0; p < possibles.length; p++) {
            possibles[p].classList.remove("possible");
        };
        let temps = [...this.table.getElementsByClassName("in-alignment-temporary")];
        for (var p = 0; p < temps.length; p++) {
            temps[p].classList.remove("in-alignment-temporary");
        };
    }


    this.fadeAlignment = function() {
        /**
         * Goes through all cells marked as being in an alignment and fades them
         */
        for (var cell of this.table.getElementsByClassName("in-alignment")) {
            cell.classList.add("in-alignment-fade");
        }
    }
}

export default Matrix;