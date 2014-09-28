function dantest() {
    return "hii!!!!!!!!!11";
}


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

function toggle(id) {
    if (document.getElementById(id).style.display == "none") {
        $('#' +id + "_snippet").fadeOut(0);
        $('#' +id + "_link").fadeOut(0);
        document.getElementById(id + "_snippet_edit").value = document.getElementById(id + "_snippet").innerHTML;
        $('#' +id).fadeIn(fadeTimeIn);
    } else {
        $('#' +id).fadeOut(0);
        $('#' +id + "_link").fadeIn(fadeTimeIn);
        $('#' +id + "_snippet").fadeIn(fadeTimeIn);
    }
}

function saveSnippet(id, lang, trigger) {
    var snippet = document.getElementById(id + '_snippet_edit').value;
    var params = {"lang": lang, "trigger": trigger, "snippet": snippet};
    callRubyFunctionWithJsonParams('saveSnippetViaAjax', params);
    document.getElementById(id + "_snippet").innerHTML = params.snippet;
    toggle(id);
}

function cancelSnippetEdit(id, snippetId) {
    toggle(id);
}

function callRubyFunctionWithJsonParams(nameOfRubyFn, jsonParams) {
    $.getJSON(nameOfRubyFn, jsonParams);
}

//==============================================================================================
// AJAX
function ajax(method, url, async, query, calledFunction)
{
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            calledFunction;
        }
    };
    xmlhttp.open(method,url,async);
    xmlhttp.send(query);
}

//==============================================================================================
// EDIT TRAY DELETE
function edit_tray_delete(tid_etd, sid_etd, eid_etd, table_etd, urlGets_etd)
{
    var identifier_etd = tid_etd +"_" +sid_etd +"_" +eid_etd;
    var wholeId_etd = "wholeEntry" +identifier_etd;
    table_etd = encodeURI(table_etd); // should not be necessary, but just in case
    url_etd = "edit_tray_delete.php" +urlGets_etd;
    
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            // make the editTray invisible
            $("#editTray" +identifier_etd).fadeOut
            (fadeTimeOut,
                // fade the old entry to 0% opacity:
                function()
                {
                    $('#' +wholeId_etd).removeClass('wholeEntrySelected');
                    $('#' +wholeId_etd).addClass('wholeEntry');
                    $("#wholeEntry" +identifier_etd).fadeTo
                    (0,0,
                        // get the new entry we just made and then fade it in to 100% opacity:
                        function()
                        {
                            document.getElementById("wholeEntry" +identifier_etd).innerHTML=xmlhttp.responseText;
                            setTimeout(function(){$("#wholeEntry" +identifier_etd).fadeTo(fadeTimeIn,1)},100);
                        }
                    );
                }
            );
        }
    }
    
    xmlhttp.open("POST",url_etd,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("table=" +table_etd +"&eid=" +eid_etd);
}

//==============================================================================================
// EDIT TRAY RESTORE
function edit_tray_restore(urlGets_etr, ROW_etr, table_etr)
{
    var identifier_etr = ROW_etr.tid +"_" +ROW_etr.sid +"_" +ROW_etr.eid;
    table_etr = encodeURI(table_etr); // should not be necessary, but just in case
    var url_etr = "edit_tray_restore.php" +urlGets_etr;
    var trayClass_etr = "editTray" +identifier_etr;
    var wholeId_etr = "wholeEntry" +identifier_etr;
    
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            // store contents of the edit tray into a variable
            var trayContents_etr = $('#' +trayClass_etr).html();
            
            // I have to perform different actions depending on whether the editTray is empty...this is purely for aesthetics
            // to simplify the code, the contents of the if are needed and the contents of the else are not.
            if (trayContents_etr.length > 0)
            { // if there is something in the edit tray already, toggle the tray first
                // slide toggle the edit tray to make it invisible
                $("#editTray" +identifier_etr).fadeToggle
                (fadeTimeOut,
                    // fade the old entry to 0% opacity:
                    function()
                    {
                        $('#' +wholeId_etr).removeClass('wholeEntrySelected');
                        $('#' +wholeId_etr).addClass('wholeEntry');
                        $("#wholeEntry" +identifier_etr).fadeTo
                        (fadeTimeOut,0,
                            // get the new entry we just made and then fade it in to 100% opacity
                            function()
                            {
                                document.getElementById ("wholeEntry" +identifier_etr).innerHTML=xmlhttp.responseText;
                                setTimeout(function(){$("#wholeEntry" +identifier_etr).fadeTo(fadeTime,1)},100);
                            }
                        );
                    }
                );
            }
            else
            { // there's nothing in the tray, so don't toggle it
                // fade the old entry to 0% opacity:
                $("#wholeEntry" +identifier_etr).fadeTo
                (0,0,
                    // after done fading out, "callback" the next function to get the new entry we just made and then fade it in to 100% opacity:
                    function()
                    {
                        document.getElementById ("wholeEntry" +identifier_etr).innerHTML=xmlhttp.responseText;
                        setTimeout(function(){$("#wholeEntry" +identifier_etr).fadeTo(fadeTime,1)},100);
                    }
                );
            }
        }
    }
    
    xmlhttp.open("POST",url_etr,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("table=" +table_etr +"&tid=" +ROW_etr.tid +"&sid=" +ROW_etr.sid +"&eid=" +ROW_etr.eid);
}

//==============================================================================================
// TRAY
// new_t is 0 for edit entry, 1 for new entry
// Returns: n/a
function tray(urlGets_t, elementId_t, newEntry_t, ROW_t)
{
    var newTrayId_t = "newTray" +elementId_t;
    var editTrayId_t = "editTray" +elementId_t;
    var wholeId_t = "wholeEntry" +elementId_t;
    var url_t = "";
    
    var editTrayContents_t = $(document.getElementById(editTrayId_t)).html();
    var newTrayContents_t = $(document.getElementById(newTrayId_t)).html();
    
    // If the user clicked on the plus sign to enter a NEW entry...
    if (newEntry_t)
    {
        // Hide the editTray if it's open
        if (document.getElementById(editTrayId_t).style.display != "none")
        {
            $('#' +editTrayId_t).hide();
        }
        
        // Test to see if we have already pulled the entry data through MySQL.  If so, then just toggle the tray, don't reacquire the data from the database because doing so would overwrite any changes made by the user.
        if (newTrayContents_t.length > 0)
        {
            tray_toggle(wholeId_t, newTrayId_t);
        }
        else
        {
            url_t += "new_tray.php" +urlGets_t +"&tid=" +ROW_t.tid +"&sid=" +ROW_t.sid +"&eid=" +ROW_t.eid;
            url_t += "&volume=" +ROW_t.volume;
            url_t += "&issue=" +ROW_t.issue;
            url_t += "&part=" +ROW_t.part;
            url_t += "&prepreChapter=" +ROW_t.prepreChapter;
            url_t += "&preChapter=" +ROW_t.preChapter;
            url_t += "&chapter=" +ROW_t.chapter;
            url_t += "&section=" +ROW_t.section;
            url_t += "&subSection=" +ROW_t.subSection;
            url_t += "&subsubSection=" +ROW_t.subsubSection;
            url_t += "&nonNumbered=" +ROW_t.nonNumbered;
            
            tray_get(wholeId_t, newTrayId_t, url_t);
        }
    }
    else
    {
        // Hide the newTray if it's open
        if (document.getElementById(newTrayId_t).style.display != "none")
        {
            $('#' +newTrayId_t).hide();
        }
        
        // Test to see if we have already pulled the entry data through MySQL.  If so, then just toggle the tray, don't reacquire the data from the database because doing so would overwrite any changes made by the user.
        if (editTrayContents_t.length > 0)
        {
            tray_toggle(wholeId_t, editTrayId_t);
        }
        else
        { // pull the entry data from the MySQL database (through php file)
            url_t += "edit_tray.php" +urlGets_t +"&tid=" +ROW_t.tid +"&sid=" +ROW_t.sid +"&eid=" +ROW_t.eid;
            tray_get(wholeId_t, editTrayId_t, url_t);
        }
    }
}

//==============================================================================================
// TRAY GET
// Retrieves the contents of an entry via the MySQL database and returns the result to the page immediately via ajax
// Returns: n/a
function tray_get(wholeId_tg, trayId_tg, url_tg)
{
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            // retrieve the data
            document.getElementById(trayId_tg).innerHTML=xmlhttp.responseText;
            
            // format
            $('#' +wholeId_tg).removeClass('wholeEntry');
            $('#' +wholeId_tg).addClass('wholeEntrySelected');
            
            // fade in
            $('#' +trayId_tg).fadeIn(fadeTimeIn);
        }   
    }
    
    url_ntt = encodeURI(url_tg);
    xmlhttp.open("GET",url_tg,true);
    xmlhttp.send();
}

//==============================================================================================
// TRAY TOGGLE
// If the tray is hidden, show it.  If the tray is visible, hide it.
// Returns: n/a
function tray_toggle(wholeId_tt, trayId_tt)
{
    if (document.getElementById(trayId_tt).style.display == "none")
    { // tray is hidden
        // format
        $('#' +wholeId_tt).removeClass('wholeEntry');
        $('#' +wholeId_tt).addClass('wholeEntrySelected');
        
        // fade in
        $('#' +trayId_tt).fadeIn(fadeTimeIn);
        // $('#' +trayId_tt).fadeToggle(fadeTimeIn).toggleClass('displayNone');
    }
    else
    { // tray is visible
        // fade out
        $('#' +trayId_tt).fadeOut
        (fadeTimeOut,
            function()
            {
                // format
                $('#' +wholeId_tt).removeClass('wholeEntrySelected');
                $('#' +wholeId_tt).addClass('wholeEntry');
            }
        );
    }
}

//==============================================================================================
// TRAY SUBMIT
// 
// Returns: n/a
function tray_submit(urlGets_ts, table_ts, newEntry_ts, ROW_ts)
{
    var identifier_ts = ROW_ts.tid +"_" +ROW_ts.sid +"_" +ROW_ts.eid;
    var newTrayId_ts = "newTray" +identifier_ts;
    var editTrayId_ts = "editTray" +identifier_ts;
    var wholeId_ts = "wholeEntry" +identifier_ts;
    table_ts = encodeURI(table_ts); // should not be necessary, but just in case
    var url_ts;
    var editOrNew_ts;
    
    if (newEntry_ts)
    {
        url_ts = "new_tray_submit.php" +urlGets_ts;
        editOrNew = "New";
    }
    else
    {
        url_ts = "edit_tray_submit.php" +urlGets_ts;
        editOrNew = "Edit";
    }
    
    // Acquire each element from the html form into an associative array
        var query_ts = new Array();
        query_ts['page'] = escape(document.getElementById("page" +editOrNew +identifier_ts).value);
        query_ts['entry'] = escape(document.getElementById("entry" +editOrNew +identifier_ts).value);
        query_ts['tags'] = escape(document.getElementById("tags" +editOrNew +identifier_ts).value);
        query_ts['volume'] = document.getElementById("volume" +editOrNew +identifier_ts).value;
        query_ts['issue'] = document.getElementById("issue" +editOrNew +identifier_ts).value;
        query_ts['part'] = document.getElementById("part" +editOrNew +identifier_ts).value;
        if (document.getElementById("prepreChapter" +editOrNew +identifier_ts).checked) query_ts['prepreChapter'] = 1; else query_ts['prepreChapter'] = 0;
        if (document.getElementById("preChapter" +editOrNew +identifier_ts).checked) query_ts['preChapter'] = 1; else query_ts['preChapter'] = 0;
        query_ts['chapter'] = document.getElementById("chapter" +editOrNew +identifier_ts).value;
        query_ts['section'] = document.getElementById("section" +editOrNew +identifier_ts).value;
        query_ts['subSection'] = document.getElementById("subSection" +editOrNew +identifier_ts).value;
        query_ts['subsubSection'] = document.getElementById("subsubSection" +editOrNew +identifier_ts).value;
        if (document.getElementById("header" +editOrNew +identifier_ts).checked) query_ts['header'] = 1; else query_ts['header'] = 0;
        if (document.getElementById("nonNumbered" +editOrNew +identifier_ts).checked) query_ts['nonNumbered'] = 1; else query_ts['nonNumbered'] = 0;
    //--
    
    // Assemble each component of the associative array into a string variable, to be sent as GET or POST query
    var queryCombined_ts = "table=" +table_ts +"&tid=" +ROW_ts.tid +"&sid=" +ROW_ts.sid +"&eid=" +ROW_ts.eid;
    for (var x in query_ts)
    {
        queryCombined_ts += "&" +x +"=" +query_ts[x];
    }
    
    var forceRefresh_ts = false;
    
    // Compare this changed entry's header configuration with what it was before.
    // If the header info was changed (say from section 1 to section 3), set a boolean flag to update both of those sections on the page to reflect the changes accurately
        if (!newEntry_ts)
        {
            var newHeader_ts = "";
            var oldHeader_ts = "";
            
            newHeader_ts = query_ts['volume'] +"-" +query_ts['issue'] +"-" +query_ts['part'] +"-" +query_ts['prepreChapter'] +"-" +query_ts['preChapter'] +"-" +query_ts['chapter'] +"-" +query_ts['section'] +"-" +query_ts['subSection'] +"-" +query_ts['subsubSection'];
            oldHeader_ts = ROW_ts['volume'] +"-" +ROW_ts['issue'] +"-" +ROW_ts['part'] +"-" +ROW_ts['prepreChapter'] +"-" +ROW_ts['preChapter'] +"-" +ROW_ts['chapter'] +"-" +ROW_ts['section'] +"-" +ROW_ts['subSection'] +"-" +ROW_ts['subsubSection'];
            
            if (newHeader_ts != oldHeader_ts)
            {
                queryCombined_ts += "&oldHdrCfg=" +oldHeader_ts +"&newHdrCfg=" +newHeader_ts;
                forceRefresh_ts = true;
            }
        }
    //--
    
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            if (newEntry_ts || forceRefresh_ts)
            {
                ajax("POST", url_ts, true, queryCombined_ts, location.reload());
                // document.getElementById(wholeId_ts).innerHTML=xmlhttp.responseText;
            }
            else
            {
                // fade out the tray
                $('#' +editTrayId_ts).fadeOut(fadeTimeOut,function()
                {
                    // fade the old entry to 0% opacity, but do not remove it from the page
                    $('#' +wholeId_ts).fadeTo(fadeTime,0,function()
                    {
                        // get the new entry we just made, overwriting the old entry, and then fade in to 100% opacity
                        document.getElementById(wholeId_ts).innerHTML=xmlhttp.responseText;
                        $('#' +wholeId_ts).removeClass('wholeEntrySelected');
                        $('#' +wholeId_ts).addClass('wholeEntry');
                        setTimeout(function(){$('#' +wholeId_ts).fadeTo(fadeTime,1)},100);
                    });
                });
            }
        }
    }
    
    xmlhttp.open("POST",url_ts,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(queryCombined_ts);
}

//==============================================================================================
// JSON STRING
// Takes a JSON encoded associative array and converts it to a string which can be read by PHP.
// Returns: n/a
function json_string(ROW_js)
{
    var result = "{";
    for (var x in ROW_js)
    {
        result += "\"" +x +"\":\"" +ROW_js[x] +"\",";
    }
    if (result != "{")
    {
        result = result.substring(0,result.length-1);
        result += "}";
    }
    else
    {
        result = "";
    }
    
    return result;
}

//==============================================================================================
// NEW TRAY SUBMIT
// When the submit button is pressed on the edit tray, the data is written to MySQL
// Returns: n/a
function new_tray_submit(tid_nts, sid_nts, eid_nts, uid_nts, table_nts, urlGets_nts)
{
    var identifier_nts = tid_nts +"_" +sid_nts +"_" +eid_nts;
    table_nts = encodeURI(table_nts); // should not be necessary, but just in case
    var url_nts = "new_tray_submit.php" +urlGets_nts;
    
    // store values of each form field into memory
    var page_nts = escape(document.getElementById("pageNew" +identifier_nts).value);
    var entry_nts = escape(document.getElementById("entryNew" +identifier_nts).value);
    var tags_nts = escape(document.getElementById("tagsNew" +identifier_nts).value);
    var volume_nts = document.getElementById("volumeNew" +identifier_nts).value;
    var issue_nts = document.getElementById("issueNew" +identifier_nts).value;
    var part_nts = document.getElementById("partNew" +identifier_nts).value;
    var prepreChapter_nts = document.getElementById("prepreChapterNew" +identifier_nts).value;
    var preChapter_nts = document.getElementById("preChapterNew" +identifier_nts).value;
    var chapter_nts = document.getElementById("chapterNew" +identifier_nts).value;
    var section_nts = document.getElementById("sectionNew" +identifier_nts).value;
    var subSection_nts = document.getElementById("subSectionNew" +identifier_nts).value;
    var subsubSection_nts = document.getElementById("subsubSectionNew" +identifier_nts).value;
    var header_nts = document.getElementById("headerNew" +identifier_nts).value;
    var nonNumbered_nts = document.getElementById("nonNumberedNew" +identifier_nts).value;
    
    xmlhttp.open("POST",url_nts,false); // false: force syncronous execution.  This will ensure the following location.reload command executes AFTER this
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(
                "table=" +table_nts
                +"&page=" +page_nts
                +"&entry=" +entry_nts
                +"&tags=" +tags_nts
                +"&tid=" +tid_nts
                +"&sid=" +sid_nts
                +"&volume=" +volume_nts
                +"&issue=" +issue_nts
                +"&part=" +part_nts
                +"&prepreChapter=" +prepreChapter_nts
                +"&preChapter=" +preChapter_nts
                +"&chapter=" +chapter_nts
                +"&section=" +section_nts
                +"&subSection=" +subSection_nts
                +"&subsubSection=" +subsubSection_nts
                +"&header=" +header_nts
                +"&nonNumbered=" +nonNumbered_nts
                //uid not needed
                //date not needed
                //exp not needed
                +"&eid=" +eid_nts
                );
                
    location.reload();
}

//==============================================================================================
// FORM VALUE ADD
// Returns: n/a
function form_value_add(formId_fva, default_fva, addThis_fva)
{
    var currentValue_fva = parseInt(document.getElementById(formId_fva).value);
    if (is_integer(currentValue_fva))
    {
        if (currentValue_fva < 1)
        {
            if (addThis_fva == -1)
            {
                document.getElementById(formId_fva).value = 0;
            }
            else
            {
                document.getElementById(formId_fva).value = 1;
            }
        }
        else
        {
            document.getElementById(formId_fva).value = parseInt(document.getElementById(formId_fva).value) + addThis_fva;
        }
    }
    else
    {
        document.getElementById(formId_fva).value = default_fva;
    }
}

//==============================================================================================
// IS INTEGER
// Returns: true/false
function is_integer(x)
{
    return parseInt(x,10) === x;
}

//==============================================================================================
// "DISPLAYNONE" TOGGLE
// Toggles (and fades in/out) the css class "displayNone" on all page elements with the name specified, such as <td name='this'>
// Returns: n/a
function displayNone_toggle(names_dnt)
{
    $(document.getElementsByName(names_dnt)).fadeToggle(300, 'linear').toggleClass('displayNone');
}

//==============================================================================================
// RESET ENTRY PARAMS
// 
// Returns: n/a
function reset_entry_params(uniqueId_rep, ROW_rep)
{
    if (ROW_rep['header'] == 1) document.getElementById('header' +uniqueId_rep).checked = true; else document.getElementById('header' +uniqueId_rep).checked = false;
    if (ROW_rep['nonNumbered'] == 1) document.getElementById('nonNumbered' +uniqueId_rep).checked = true; else document.getElementById('nonNumbered' +uniqueId_rep).checked = false;
    if (ROW_rep['prepreChapter'] == 1) document.getElementById('prepreChapter' +uniqueId_rep).checked = true; else document.getElementById('prepreChapter' +uniqueId_rep).checked = false;
    if (ROW_rep['preChapter'] == 1) document.getElementById('preChapter' +uniqueId_rep).checked = true; else document.getElementById('preChapter' +uniqueId_rep).checked = false;
    
    document.getElementById('volume' +uniqueId_rep).value = ROW_rep['volume'];
    document.getElementById('issue' +uniqueId_rep).value = ROW_rep['issue'];
    document.getElementById('part' +uniqueId_rep).value = ROW_rep['part'];
    document.getElementById('chapter' +uniqueId_rep).value = ROW_rep['chapter'];
    document.getElementById('section' +uniqueId_rep).value = ROW_rep['section'];
    document.getElementById('subSection' +uniqueId_rep).value = ROW_rep['subSection'];
    document.getElementById('subsubSection' +uniqueId_rep).value = ROW_rep['subsubSection'];
}

//==============================================================================================
// TESTER
function tester()
{
    alert("tester javascript function");
}

// jQuery CSS for "entry" class
$(document).ready(function()
{
    $(".entry").mouseout(function()
    {
        $(this).css({"background-color":"transparent"});
    });
    
    $(".entry").mousedown(function()
    {
        $(this).css({"background-color":"rgb(210,220,230)"});
    });
    
    $(".entry").mouseup(function()
    {
        $(this).css({"background-color":"transparent"});
    });
});

// jQuery CSS for "header" class
$(document).ready(function()
{
    $("td.header").mouseout(function()
    {
        $(this).css({"background-color":"transparent"});
    });
    
    $("td.header").mousedown(function()
    {
        $(this).css({"background-color":"rgb(210,220,230)"});
    });
    
    $("td.header").mouseup(function()
    {
        $(this).css({"background-color":"transparent"});
    });
});

// jQuery CSS for "newEntry" class
$(document).ready(function()
{
    $(".newEntry").mouseover(function()
    {
        $(this).css({"background-color":"rgb(229,227,209)"});
    });
    
    $(".newEntry").mouseout(function()
    {
        $(this).css({"background-color":"transparent"});
    });
    
    $(".newEntry").mousedown(function()
    {
        $(this).css({"background-color":"transparent"});
    });
    
    $(".newEntry").mouseup(function()
    {
        $(this).css({"background-color":"rgb(229,227,209)"});
    });
});
