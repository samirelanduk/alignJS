function align() {
  var sequences = getSequences();
  if (sequences.length) {
    console.log(sequences);
  }
}

function getSequences() {
  /**
  Tries to extract the two raw sequences from the inputs. If either of them has
  a problem, the input will be turned red and an empty list will be returned. If
  neither of them have a problem, the two sequences are returned.
  */

  var sequences = [];
  for (var i = 0; i < 2; i++) {
    var sequence = document.getElementById("id_sequence" + (i + 1));
    if (!sequence.value) {
      sequence.classList.add("error");
    } else {
      sequence.classList.remove("error");
      sequences.push(sequence.value);
    }
  }
  return sequences.length == 2 ? sequences : [];
}
