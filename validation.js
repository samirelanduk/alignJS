export function parseGetParameters() {
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


export function getSequences(params) {
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


export function validateSequences(sequences) {
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


export function activateResults() {
    /**
     * Makes the results section visible, and scrolls to it.
     */

    let results = document.getElementsByClassName("results")[0];
    results.style.display = "block";
    document.getElementsByClassName("top-section")[0].style.height = "auto";
    results.scrollIntoView();
}