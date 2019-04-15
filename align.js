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

      // Add a dot matrix to the page
      createDotMatrix(sequences);

      createGlobalAlignmentMatrix(sequences);
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


function createSequenceMatrix(sequences, pad=false) {
  /**
   * Takes two sequences and creates a JS matrix, where the first row is
   * sequence 1, the first column is sequence 2, and the body is all zeroes.
   */

  let matrix = [];
  matrix.push([""]);
  for (var char of sequences[0]) {
    matrix[0].push(char);
  }
  for (var char of sequences[1]) {
    matrix.push([char])
    for (var _ of sequences[0]) {
      matrix[matrix.length - 1].push(0);
    }
  }
  if (pad) {
    for (var i = 0; i < matrix.length; i++) {
      matrix[i].splice(1, 0, i == 0 ? "" : 0);
    }
    matrix.splice(1, 0, ["", 0]);
    for (var char of sequences[0]) {
      matrix[1].push(0);
    }
  }
  return matrix;
}


function createHtmlMatrix(matrix) {
  /**
   * Takes a JS matrix, and creates a HTML table from it. The cells will be
   * empty if the contents are a Boolean value, but will have the match class
   * attached if true.
   */

  let table = document.createElement("TABLE");
  for (var row of matrix) {
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



function createDotMatrix(sequences) {
  /**
   * Adds a HTML dot matrix to the page, from two sequences.
   */

  let matrix = createSequenceMatrix(sequences);
  for (var i = 1; i < matrix.length; i++) {
    for (var j = 1; j < matrix[0].length; j++) {
      matrix[i][j] = matrix[0][j] == matrix[i][0];
    }
  }
  matrix = createHtmlMatrix(matrix);
  document.getElementsByClassName("dot-plot")[0].appendChild(matrix);
}


function createGlobalAlignmentMatrix(sequences) {
  let matrix = createSequenceMatrix(sequences, pad=true);
  for (var s = 0; s < sequences[0].length; s++) {
    matrix[1][s + 2] = -1 - s;
  }
  for (var s = 0; s < sequences[1].length; s++) {
    matrix[s + 2][1] = -1 - s;
  }

  const INDEL = -1
  const MISMATCH = -1
  const MATCH = 1

  for (var i=2; i < matrix.length; i++) {
    for (var j=2; j < matrix[0].length; j++) {
      let scores = [];
      let left = matrix[i][j - 1];
      let diagonal = matrix[i - 1][j - 1];
      let top = matrix[i - 1][j];
      scores.push(diagonal + (matrix[i][0] == matrix[0][j] ? MATCH : MISMATCH));
      scores.push(top + MISMATCH);
      scores.push(left + MISMATCH);
      matrix[i][j] = Math.max.apply(0, scores);
    }
  }
  let alignment = getGlobalAlignment(matrix);
  matrix = createHtmlMatrix(matrix);
  for (var cell of alignment) {
    matrix.getElementsByTagName("tr")[cell[0]].getElementsByTagName("td")[cell[1]].style.border="1px solid black"
  }
  document.getElementsByClassName("global-align")[0].appendChild(matrix);
}

function getGlobalAlignment(matrix) {
  let i = matrix.length - 1;
  let j = matrix[0].length - 1;
  let cells = [[i, j]];
  while (i > 1 || j > 1) {
    let options = [matrix[i - 1][j], matrix[i - 1][j - 1], matrix[i][j - 1]];
    console.log(options)
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
