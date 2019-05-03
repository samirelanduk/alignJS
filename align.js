var globalMatrix;

window.onload = function() {
  // Are there GET parameters?
  let params = parseGetParameters();

  if (Object.entries(params).length) {
    // Are the sequences suitable?
    let sequences = getSequences(params);
    let error = validateSequences(sequences);

    if (!error) {
      // We're good to go, make the results section visible
      activateResults();

      // Display dot matrix
      let matrix = new Matrix(sequences[0], sequences[1]);
      matrix.fillDotMatrix();
      document.getElementsByClassName("dot-matrix")[0].appendChild(matrix.toHtml());

      // Display global alignment matrix
      globalMatrix = new Matrix(sequences[0], sequences[1]);
      globalMatrix.fillNeedlemanWunsch();
      let htmlMatrix = globalMatrix.toHtml();
      document.getElementsByClassName("global-align")[0].appendChild(htmlMatrix);

      // Get global alignment
      let alignment = globalMatrix.getAlignment();
      globalMatrix.alignment = alignment;
      addAlignmentToHtml(alignment, htmlMatrix);
      let alignmentString = globalMatrix.alignmentString(alignment);
      document.getElementsByClassName("global-align-sequences")[0].innerHTML = alignmentString;
    }
  }
}


function parseGetParameters() {
  /**
   * Returns an object representation of any GET parameters sent. If there are
   * none then an empty object will be returned.
   */

  let params = window.location.search.substr(1).split("&");
  let paramsObject = {}
  if (params.length != 0 && params[0].length != 0) {
    for (var param of params) {
      let sections = param.split("=");
      paramsObject[sections[0]] = decodeURIComponent(sections[1].replace(/\+/g, " "));
    }
  }
  return paramsObject;
}


function getSequences(params) {
  /** Gets the actual sequences from the parameters object, and displays them in
   * the textareas. The sequences themselves are returned as a list.
   */

  let sequences = [];
  for (var n of [1, 2]) {
    let sequence = params["sequence" + n];
    document.getElementById("id_sequence" + n).value = sequence;
    sequence = sequence.replace(/(\r\n|\n|\r)/gm, "\n");
    let lines = sequence.split("\n");
    if (lines[0][0] == ">") {
      lines.shift()
    }
    sequence = lines.join("");
    sequences.push(sequence);
  }
  return sequences;
}


function validateSequences(sequences) {
  /**
   * Takes two sequences, and checks they are valid. If they are, they are
   * written to the page. If not, their input is errored. If any of them are
   * invalid, false is returned - otherwise true.
   */

  var error = false;
  for (var i = 0; i < 2; i++) {
    let sequence = sequences[i];
    if (!sequence.length) {
      document.getElementById("id_sequence" + (i + 1)).classList.add("error");
      document.getElementsByClassName("error-message")[i].innerHTML = "Enter a sequence"
      error = true;
    } else if (sequence.length > 30) {
      document.getElementById("id_sequence" + (i + 1)).classList.add("error");
      document.getElementsByClassName("error-message")[i].innerHTML = "Sequence can't be more than 30 characters - this is " + sequence.length;
      error = true;
    } else {
      document.getElementById("id_sequence" + (i + 1)).classList.remove("error");
      document.getElementsByClassName("sequence" + (i + 1))[0].getElementsByTagName("span")[0].innerHTML = sequences[i];
    }
  }
  return error;
}


function activateResults() {
  /**
   * Makes the results section visible, and scrolls to it.
   */

   let results = document.getElementsByClassName("results")[0];
   results.style.display = "block";
   document.getElementsByClassName("top-section")[0].style.height = "auto";
   results.scrollIntoView();
}


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


  this.toHtml = function() {
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
    return table;
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
  }


  this.getAlignment = function() {
    /**
     * Traverses the matrix filled with scores, and returns an alignment list representing
     * the optimal path.
     */

    let i = this.rows.length - 1;
    let j = this.rows[0].length - 1;
    let cells = [[i, j]];
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
      cells.push([i, j])
    }
    return cells;
  }


  this.alignmentString = function(alignment) {
    /**
     * Creates an alignment string from the matrix and a supplied alignment list.
     */

    let string1 = "";
    let middle = "";
    let string2 = "";
    for (var c = 0; c < alignment.length; c++) {
      if (c < alignment.length - 1 && alignment[c][1] == alignment[c + 1][1]) {
        string1 += "-";
      } else {
        string1 += this.rows[0][alignment[c][1]];
      }
      if (c < alignment.length - 1 && alignment[c][0] == alignment[c + 1][0]) {
        string2 += "-";
      } else {
        string2 += this.rows[alignment[c][0]][0];
      }
      if (string1[string1.length - 1] == string2[string2.length - 1]) {
        middle += "|";
      } else {
        middle += " ";
      }
    }
    return reversed(string1) + "\n" + reversed(middle).slice(1) + "\n" + reversed(string2);
  }
}


function addAlignmentToHtml(alignment, matrix) {
  /**
   * Takes an alignment list, and adds it to a HTML table.
   */

  for (var cell of alignment) {
    let td = matrix.getElementsByTagName("tr")[cell[0]].getElementsByTagName("td")[cell[1]];
    td.classList.add("in-alignment");
    td.setAttribute("draggable", "true");
  }
}


function reversed(string) {
  /**
   * Returns a reversed copy of a string.
   */

  return string.split("").reverse().join("")
}

document.addEventListener("dragstart", function(event) {
  
  // Fade out main alignment
  for (var cell of document.getElementsByClassName("in-alignment")) {
    cell.classList.add("in-alignment-fade");
  }

  // Get possible cells to move to
  dragged = event.target;
  let row = dragged.parentNode;
  let location = [
    [...row.parentNode.children].indexOf(row),
    [...row.children].indexOf(dragged)
  ]
  let previous = null;
  for (var i = 0; i < globalMatrix.alignment.length; i++) {
    if ((globalMatrix.alignment[i][0] == location[0]) && (globalMatrix.alignment[i][1] == location[1])) {
      previous = globalMatrix.alignment[i - 1];
      break;
    }
  }
  let nexts = [];
  if (previous) {
    nexts = [
      [previous[0] - 1, previous[1]],
      [previous[0] - 1, previous[1] - 1],
      [previous[0], previous[1] - 1]
    ]
  }
  for (var cell of nexts) {
    if ((cell[0] != location[0]) || (cell[1] != location[1])) {
      dragged.parentNode.parentNode.children[cell[0]].children[cell[1]].classList.add("possible");
    }
  }
  
}, false);

document.addEventListener("dragend", function(event) {
  for (var cell of document.getElementsByClassName("in-alignment")) {
    cell.classList.remove("in-alignment-fade");
  }
  let possibles = [...document.getElementsByClassName("possible")];
  for (var p = 0; p < possibles.length; p++) {
    possibles[p].classList.remove("possible");
  };
}, false);

document.addEventListener("dragenter", function(event) {
  // Is the entered thing a possible next cell?
  if (event.target.classList.contains("possible")) {
    // Calculate new alignment
  }
}, false);