import {parseGetParameters, getSequences, validateSequences, activateResults} from './validation.js';
import Matrix from './matrix.js';

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
      let dotMatrix = new Matrix(sequences[0], sequences[1]);
      dotMatrix.fillDotMatrix();
      dotMatrix.render("dot-matrix");
      
      // Display global alignment matrix
      globalMatrix = new Matrix(sequences[0], sequences[1]);
      globalMatrix.fillNeedlemanWunsch();
      globalMatrix.render("global-align");

      // Get global alignment
      let alignment = globalMatrix.createAlignment();
      alignment.render("global-align-sequences");
      globalMatrix.mainAlignment = alignment;
      globalMatrix.activeAlignment = alignment;
    }
  }
}


function getTdLocation(td) {
  let row = td.parentNode;
  return [
    [...row.parentNode.children].indexOf(row),
    [...row.children].indexOf(td)
  ]
}


document.addEventListener("dragstart", function(event) {
  // Fade out main alignment
  globalMatrix.fadeAlignment();

  // Highlight available cells
  let thisCell = getTdLocation(event.target);
  globalMatrix.mainAlignment.highlightNextCells(
    globalMatrix.mainAlignment.previousCell(thisCell)
  );

  // Tag start cell as the origin
  globalMatrix.originCell = getTdLocation(event.target)
}, false);


document.addEventListener("dragend", function(event) {
  // Get rid of current alignment and restore original
  globalMatrix.mainAlignment.render("global-align-sequences");
  globalMatrix.restore();
  globalMatrix.activeAlignment = globalMatrix.mainAlignment;
}, false);


document.addEventListener("dragenter", function(event) {
  // Is this a cell that can be moved to?
  if (event.target.classList.contains("possible")) {
    // Get rid of highlighted cells
    globalMatrix.restore();

    // Where are we right now?
    let thisCell = getTdLocation(event.target);

    // Where should the new alignment come from?
    let previousCell = globalMatrix.originCell;
    if (globalMatrix.mainAlignment.equalTo(globalMatrix.activeAlignment)) {
      previousCell = globalMatrix.activeAlignment.previousCell(
        globalMatrix.originCell
      );
    }
    let truncated = globalMatrix.activeAlignment.truncate(previousCell);
    truncated.push(getTdLocation(event.target));
    let newAlignment = globalMatrix.continueAlignment(truncated.cells);
    globalMatrix.activeAlignment = newAlignment;
    newAlignment.render("global-align-sequences", true);

    // Highlight new available cells
    newAlignment.highlightNextCells(thisCell);

    // Update origin
    globalMatrix.originCell = thisCell;
  }
}, false);