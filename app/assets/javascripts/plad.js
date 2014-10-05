var xmlhttp;
if (window.XMLHttpRequest)
{ // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
}
else
{ // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

var fadeTime = 100; // milliseconds
var fadeTimeIn = 200; // milliseconds
var fadeTimeOut = 200; // milliseconds

function decodeHtml(html) {
    var str = html.replace('&lt;', '<');
    str = str.replace('&gt;', '>');
    return str;
}

function toggle(id) {
    if (document.getElementById(id).style.display == "none") {
        $('#' +id + "_snippet").fadeOut(0);
        $('#' +id + "_link").fadeOut(0);
        document.getElementById(id + "_snippet_edit").value = decodeHtml(document.getElementById(id + "_snippet").innerHTML);
        $('#' +id).fadeIn(fadeTimeIn);
        $('#' +id +"_snippet_edit").focus();
    } else {
        $('#' +id).fadeOut(0);
        $('#' +id + "_link").fadeIn(fadeTimeIn);
        $('#' +id + "_snippet").fadeIn(fadeTimeIn);
    }
}

function saveSnippet(id, lang, trigger) {
    var snippet = document.getElementById(id + '_snippet_edit').value;
    var params = {"lang": lang, "trigger": trigger, "snippet": snippet};
    var jsonResults = callRubyFunctionWithJsonParams('saveSnippetViaAjax', params, false);
    document.getElementById(id + "_snippet").innerHTML = jsonResults['snippetValue'];
    toggle(id);
}

function cancelSnippetEdit(id, snippetId) {
    toggle(id);
}

function callRubyFunctionWithJsonParams(nameOfRubyFn, jsonParams, async) {
    if (async) {
        return $.getJSON(nameOfRubyFn, jsonParams);
    } else {
        jsonResults = {};
        $.ajax({
            url: 'saveSnippetViaAjax',
            type: 'GET',
            async: false,
            dataType: "json",
            contentType: "application/json",
            data: jsonParams,
            success: function(data) {
                jsonResults = data;
                if (data['success'] == "false") {
                    alert('Save failed!');
                }
            },
            error: function(data) {
                alert('Save failed!');
            }
        });
        return jsonResults;
    }
}

/**
 * Grabs the contents of another page and inserts it into the specified page
 * ID.
 * 
 * @param {String} urlToInsert The URL of the page to fetch and insert.
 * @param {String} urlGetParamsAsString Example: "id=1&name=john".
 * @param {String} insertionLocationId The HTML ID of the element where the
 *      fetched page will appear.
 * @param {Function} addlLogicFn The function to call.
 *      addlLogicFn should NOT contain the following, because this
 *      function already contains it:
 *      <code>
 *      document.getElementById(wholeId_ts).innerHTML=xmlhttp.responseText;
 *      </code>
 * @param {Boolean} async If true, query asyncronously.
 * @param {String} httpMethod i.e. "POST", "GET".
 * @param xmlhttp The object used to communicate with the current document.
 */
function insertContentViaAjax(urlToInsert, urlGetParamsAsString, insertionLocationId, addlLogicFn, async, httpMethod, xmlhttp)
{
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            document.getElementById(insertionLocationId).innerHTML=xmlhttp.responseText;
            addlLogicFn;
        }
    };
    xmlhttp.open(httpMethod, urlToInsert, async);
    // xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(urlGetParamsAsString);
}

//==============================================================================================
// JSON STRING
// Takes a JSON encoded associative array and converts it to a string which can be read by PHP.
// Returns: n/a
function json_string(ROW_js) {
    var result = "{";
    for (var x in ROW_js) {
        result += "\"" +x +"\":\"" +ROW_js[x] +"\",";
    }

    if (result != "{") {
        result = result.substring(0,result.length-1);
        result += "}";
    } else {
        result = "";
    }
    
    return result;
}

//==============================================================================================
// IS INTEGER
// Returns: true/false
function is_integer(x) {
    return parseInt(x,10) === x;
}

// jQuery CSS for "newEntry" class
$(document).ready(function() {
    $(".newEntry").mouseover(function() {
        $(this).css({"background-color":"rgb(229,227,209)"});
    });
    
    $(".newEntry").mouseout(function() {
        $(this).css({"background-color":"transparent"});
    });
    
    $(".newEntry").mousedown(function() {
        $(this).css({"background-color":"transparent"});
    });
    
    $(".newEntry").mouseup(function() {
        $(this).css({"background-color":"rgb(229,227,209)"});
    });
});
