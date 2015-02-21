# Name: Parse PLAD Snippets XLS
# Version: 0.50
# Description: desc
# Author: Dan Barrese (danbarrese.com)
# Date: February 24, 2014
# Update Log:
#   2014.02.24 [0.50][DRB] Initial version.  Supports output for Vim SnipMate.
# Sources/References:
# - None
# TODO:
# - create links based off of links column (C)
# - add support for Eclipse
# - add support for NetBeans
# - add support for IntelliJ IDEA
# - add support for AHK

# Imports. {{{
import os
import re
import sys
import xlrd
import re
from operator import itemgetter
import xml.etree.ElementTree as xml
#}}}

# Settings. {{{
COL_TRIGGER = 1 #B
COL_LANG_START = 6 #G
ROW_HEADER = 1
RX_EXPANDED_TAB = re.compile('    ')
RX_LINK = re.compile('.*@LINK{.+}')
RX_QUOT = re.compile('"')
SNIPPET_VARIATION_ID_PREFIX = '@@'
TYPE_SNIPMATE = "snipMate"
TYPE_AHK = "ahk"
TYPE_ECLIPSE = "eclipse"
TYPE_NETBEANS = "netbeans"
TYPE_INTELLIJ_IDEA = "idea"
TYPE = TYPE_INTELLIJ_IDEA
TAB_AS_SPACES = '    '
#}}}

def format_snippet(snippet, type=TYPE): #{{{
    """Formats a snippet, returns map of key=uniqueness (e.g. val or val+i, or key+val), val=snippet."""
    snips = { '':'' }
    if type == TYPE_SNIPMATE:
        global RX_EXPANDED_TAB
        global SNIPPET_VARIATION_ID_PREFIX
        uniqueness = ''
        sniplines = []
        for line in snippet.splitlines():
            if line.startswith(SNIPPET_VARIATION_ID_PREFIX):
                # We've encountered a new variation of the same snippet.
                # Save the accumulated lines of the previous variation and save.
                if uniqueness != '' and len(sniplines) > 0:
                    snippet = "\n\t".join(sniplines)
                    snippet = "\t" + RX_EXPANDED_TAB.sub("\t", snippet)
                    snips[uniqueness] = snippet
                    sniplines = []

                # Save the uniqueness string of the new variation.
                line = line.lstrip(SNIPPET_VARIATION_ID_PREFIX)
                uniqueness = ' ' + line
            else:
                # Add line to current snippet variation.
                sniplines.append(line)
        snippet = "\n\t".join(sniplines)
        snippet = "\t" + RX_EXPANDED_TAB.sub("\t", snippet)
        snips[uniqueness] = snippet
    elif type == TYPE_INTELLIJ_IDEA:
        global TAB_AS_SPACES
        pass #TODO: implement
    return snips
#}}}

def format_trigger(trigger, type=TYPE): #{{{
    """Formats a snippet trigger."""
    if type == TYPE_SNIPMATE:
        return 'snippet ' + trigger
    else:
        return trigger
#}}}

def snippet_is_link(snippet): #{{{
    """Determines if the given snippet is a link to another snippet."""
    global RX_LINK
    match=re.search(RX_LINK, snippet)
    return match is not None
#}}}

# Open workbook.
book = xlrd.open_workbook(
        filename='/home/dan/Dropbox/snippets.xls',
        logfile=sys.stdout,
        verbosity=0,
        file_contents=None,
        encoding_override=None,
        formatting_info=False,
        on_demand=False,
        ragged_rows=False
        )

# Find sheet with snippets.
for sh in book.sheets():
    if sh.name == "PLAD List":
        nrows = sh.nrows
        ncols = sh.ncols
        break

# Process all snippets for all languages.
for langidx in range(COL_LANG_START, ncols):
    hdr = sh.cell_value(ROW_HEADER, langidx)
    #if hdr != '':
    if hdr == 'Java':
        if TYPE == TYPE_SNIPMATE:
            # Get snippets and links for this language.
            snippets = ['# > ' + hdr + ' language agnostic snippets {{' + '{']
            snippets.append('###############################################################################')
            snipsmap = {}
            linksmap = {}
            for i in range(1, nrows - 1):
                trigger = sh.cell_value(ROW_HEADER + i, COL_TRIGGER)
                snippet = sh.cell_value(ROW_HEADER + i, langidx)
                if trigger != '' and snippet != '':
                    trigger = format_trigger(trigger)

                    # Parse and format snippet(s).  Account for links.
                    snips = format_snippet(snippet)
                    for uniqueness, snippet in snips.items():
                        if snippet != '':
                            if snippet_is_link(snippet):
                                linksmap[trigger + uniqueness] = snippet
                            else:
                                snipsmap[trigger + uniqueness] = snippet

            # Add snippets then links.
            for trigger, snippet in sorted(snipsmap.items()):
                snippets.append(trigger)
                snippets.append(snippet)
            for trigger, link in sorted(linksmap.items()):
                snippets.append(trigger)
                snippets.append(link)

            # Print results.
            snippets.append('#}}' + '}')
            if len(snipsmap) > 0:
                print("\n".join(snippets))
        elif TYPE == TYPE_INTELLIJ_IDEA:
            # Get snippets and links for this language.
            snipsmap = {}
            linksmap = {}
            for i in range(1, nrows - 1):
                trigger = sh.cell_value(ROW_HEADER + i, COL_TRIGGER)
                snippet = sh.cell_value(ROW_HEADER + i, langidx)
                if trigger != '' and snippet != '':
                    trigger = format_trigger(trigger)

                    # Parse and format snippet(s).  Account for links.
                    snips = format_snippet(snippet)
                    for uniqueness, snippet in snips.items():
                        if snippet != '':
                            if snippet_is_link(snippet):
                                linksmap[trigger + uniqueness] = snippet
                            else:
                                snipsmap[trigger + uniqueness] = snippet

            # Add snippets then links.
            feed = xml.Element('{http://www.w3.org/2005/Atom}feed', attrib={'{http://www.w3.org/XML/1998/namespace}lang': 'en'})
            templateSet = xml.SubElement(feed, 'templateSet', attrib={'group':'plad'})
            for trigger, snippet in sorted(snipsmap.items()):
                templ = { '':'' }
                templ['name'] = RX_QUOT.sub('&quot;', trigger)
                templ['value'] = snippet
                templ['description'] = 'unknown'
                templ['toReformat'] = 'true'
                templ['toShortenFQNames'] = 'true'
                template = xml.SubElement(templateSet, 'template', attrib=templ)
                context = xml.SubElement(template, 'context')

                xml.SubElement(context, 'option', attrib={'name':'JAVA_CODE', 'value':'true'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_STATEMENT', 'value':'true'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_EXPRESSION', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_DECLARATION', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_COMMENT', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_STRING', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'COMPLETION', 'value':'false'})
            for trigger, link in sorted(linksmap.items()):
                templ = { '':'' }
                templ['name'] = RX_QUOT.sub('&quot;', trigger)
                templ['value'] = link
                templ['description'] = 'unknown'
                templ['toReformat'] = 'true'
                templ['toShortenFQNames'] = 'true'
                template = xml.SubElement(templateSet, 'template', attrib=templ)
                context = xml.SubElement(template, 'context')

                xml.SubElement(context, 'option', attrib={'name':'JAVA_CODE', 'value':'true'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_STATEMENT', 'value':'true'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_EXPRESSION', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_DECLARATION', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_COMMENT', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'JAVA_STRING', 'value':'false'})
                xml.SubElement(context, 'option', attrib={'name':'COMPLETION', 'value':'false'})

            # Print results.
            if len(snipsmap) > 0 or len(linksmap):
                print(xml.tostring(feed))
