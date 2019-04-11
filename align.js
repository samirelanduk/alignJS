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


function createSequenceMatrix(sequences) {
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
  return matrix;
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
      }
    }
  }
  return table;
}
