function Alignment(matrix, cells) {
    /**
     * Represents an alignment between two sequences by mapping the traversed
     * cells in an alignment matrix.
     */

    this.matrix = matrix;
    this.cells = cells;

    this.equalTo = function(other) {
        /**
         * Two alignments are equal if they have the same length and each
         * successive cell is equal.
         */

        if (this.cells.length != other.cells.length) {
            return false;
        }
        for (var i = 0; i < this.cells.length; i++) {
            if (this.cells[i][0] != other.cells[i][0] || this.cells[i][1] != other.cells[i][1]) {
                return false
            }
        }
        return true;
    }


    this.previousCell = function(cell) {
        /**
         * Given a cell in the alignment, what cell came before it? If the cell
         * is not in the alignment, or if the cell given is the first cell,
         * null will be returned.
         */

        let previous = null;
        for (var i = 0; i < this.cells.length; i++) {
            if ((this.cells[i][0] == cell[0]) && (this.cells[i][1] == cell[1])) {
                previous = this.cells[i - 1];
                break;
            }
        }
        return previous;
    }


    this.nextCell = function(cell) {
        /**
         * Given a cell in the alignment, what cell came after it? If the cell
         * is not in the alignment, or if the cell given is the last cell,
         * null will be returned.
         */

        let next = null;
        for (var i = 0; i < this.cells.length; i++) {
            if ((this.cells[i][0] == cell[0]) && (this.cells[i][1] == cell[1])) {
                next = this.cells[i + 1];
                break;
            }
        }
        return next;
    }


    this.string = function() {
        /** 
         * Creates a sequence alignment string from the alignment. There will be
         * three lines - one for the first sequence, one for showing matching
         * characters, and one for the second sequence.
         */

        let string1 = "";
        let middle = "";
        let string2 = "";
        for (var c = 0; c < this.cells.length; c++) {
            if (c < this.cells.length - 1 && this.cells[c][1] == this.cells[c + 1][1]) {
                string1 += "-";
            } else {
                string1 += this.matrix.rows[0][this.cells[c][1]];
            }
            if (c < this.cells.length - 1 && this.cells[c][0] == this.cells[c + 1][0]) {
                string2 += "-";
            } else {
                string2 += this.matrix.rows[this.cells[c][0]][0];
            }
            if (string1[string1.length - 1] == string2[string2.length - 1]) {
                middle += "|";
            } else {
                middle += " ";
            }
        }
        string1 = string1.split("").reverse().join("");
        middle = middle.split("").reverse().join("").slice(1);
        string2 = string2.split("").reverse().join("")
        let string =  string1 + "\n" + middle + "\n" + string2;
        return string;
    }


    this.score = function(string) {
        /**
         * Calculates the score of the alignment based on the scoring system
         * defined in the owning matrix. It requires a sequence string.
         */

        let lines = string.split("\n");
        let score = 0;
        for (var c = 0; c < lines[0].length; c++) {
            if (lines[0][c] == lines[2][c]) {
                score += this.matrix.match;
            } else if (lines[0][c] == "-" || lines[2][c] == "-") {
                score += this.matrix.indel;
            } else {
                score += this.matrix.mismatch;
            }
        }
        return score;
    }


    this.scoreString = function() {
        /**
         * Returns the same string as string(), but with a score label added in
         * too.
         */
        
        let string = this.string();
        return string + "  Score: " + this.score(string);
    }


    this.truncate = function(stopPoint) {
        /**
         * Creates a new alignment which is the same as this one, only stopping
         * at some given cell.
         */

        let truncated = [];
        for (var cell of this.cells) {
            truncated.push(cell);
            if (cell[0] == stopPoint[0] && cell[1] == stopPoint[1]) {
                return new Alignment(this.matrix, truncated);;
            }
        }
        throw "Stop point " + stopPoint + " not in this alignment"
    }


    this.push = function(cell) {
        /**
         * Adds a cell to the alignment
         */

        this.cells.push(cell);
    }


    this.render = function(className, temporary=false) {
        /**
         * Renders the alignment in HTML. The owing matrix's table element will
         * be used.
         * 
         * Black boxes will be placed around all cells in the alignment, and if
         * they had previously been faded, this will be removed. If the
         * rendering is temporary however, red boxes will be placed around the
         * cells, and only if they are not already highlighted.
         * 
         * The alignment's string representation will also be added to the div
         * specified.
         */

        for (var cell of this.cells) {
            let td = this.matrix.table.getElementsByTagName("tr")[cell[0]].getElementsByTagName("td")[cell[1]];
            if (temporary) {
                if (!td.classList.contains("in-alignment")) {
                    td.classList.add("in-alignment-temporary");
                }
            } else {
                td.classList.add("in-alignment");
                td.classList.remove("in-alignment-fade");
            }
            td.setAttribute("draggable", "true");  
        }
        document.getElementsByClassName(className)[0].innerHTML = this.scoreString();
    }

    
    this.highlightNextCells = function(cell) {
        /**
         * Determines what the next cells available to the given cell are,
         * after excluding the actual next cell in this alignment, and then
         * highlights them in HTML. Cells outside the numeric core are not
         * used.
         */

        let nexts = [];
        if (cell) {
            let possibles = [
                [cell[0] - 1, cell[1]],
                [cell[0] - 1, cell[1] - 1],
                [cell[0], cell[1] - 1]
            ]
            let actualNext = this.nextCell(cell);
            for (var cell of possibles) {
                if (cell[0] != actualNext[0] || cell[1] != actualNext[1]) {
                    if (cell[0] != 0 && cell[1] != 0) {
                        nexts.push(cell);
                    }
                }
            }
        }
        for (var cell of nexts) {
            let row = this.matrix.table.getElementsByTagName("tr")[cell[0]];
            row.getElementsByTagName("td")[cell[1]].classList.add("possible");
        }
    }
}

export default Alignment;