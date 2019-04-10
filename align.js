window.onload = function() {
  // Are there GET parameters?
  let params = parseGetParameters();

  if (Object.entries(params).length) {
    // Are the sequences suitable?
    let sequences = getSequences(params);
    let error = validateSequences(sequences);

    if (!error) {
      activateResults();
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
      paramsObject[sections[0]] = sections[1]
    }
  }
  return paramsObject;
}


function getSequences(params) {
  /** Gets the actual sequences from the parameters object, and displays them in
   * the textareas. The sequences themselves are returned as a list.
   */

  document.getElementById("id_sequence1").value = params.sequence1;
  document.getElementById("id_sequence2").value = params.sequence2;
  return [params.sequence1, params.sequence2]
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
    } else {
      document.getElementById("id_sequence" + (i + 1)).classList.remove("error");
      document.getElementsByClassName("sequence" + (i + 1))[0].getElementsByTagName("span")[0].innerHTML = sequences[i];
    }
  }
  return error;
}


function activateResults() {
  /**
   * Makes the results section viisble, and scrolls to it.
   */

   let results = document.getElementsByClassName("results")[0];
   results.style.display = "block";
   document.getElementsByClassName("top-section")[0].style.height = "auto";
   results.scrollIntoView();
}



function createDotMatrix(sequences) {
  var matrix = document.createElement("TABLE");
  for (var r = 0; r <= sequences[1].length; r ++) {
    matrix.insertRow();
    for (var c = 0; c <= sequences[0].length; c++) {
      matrix.rows[r].insertCell();
      if (r == 0 && c > 0) {
        matrix.rows[r].cells[c].innerHTML = sequences[0][c - 1];
      } else if (c == 0 && r != 0) {
        matrix.rows[r].cells[c].innerHTML = sequences[1][r - 1];
      } else if (r + c > 0 && sequences[0][c - 1] == sequences[1][r - 1]) {
        matrix.rows[r].cells[c].classList.add("match");
      }
    }
  }
  document.body.appendChild(matrix);
}
