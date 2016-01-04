/*
Jive - Content Lookup

Copyright (c) 2015 Fidelity Investments
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

FILE DESCRIPTION
This Javascript library supports the Content Lookup widget.

WIDGET DESCRIPTION
This Jive HTML widget allows users to search for content and returns relevant information for each search result.
*/

var fidosreg_id = 'b764a0a9536448345dc227af95e192521d337b5e4c3560c859b89ecd0407004a';
var userID = -1;
var $j = jQuery.noConflict();

/*
 * Jive AJAX JSON return packets will all have a first line that makes it an invalid JSON packet.  This must be stripped off.
 */
$j.ajaxSetup({
	dataFilter: function(data, type) {
		return type === 'json' ? jQuery.trim(data.replace(/^throw [^;]*;/, '')) : data;
	}
});

/*
 * Performs the search given the search terms.
 */
function getContent(searchTerms){
	$j('#search').attr('disable', true); // disable the search button to prevent multiple simultaneous searches
	$j('#content').html('<br/><br/>...SEARCHING...<br/><br><br/>');
	resizeWidget();

	// Format the search api url
	var api = '/api/core/v3/search/contents'
			+ '?collapse=true'
			+ '&fields=contentID%2CrootType%2Ctype%2CcontentType%2Csubject%2Cauthor%2Csize%2ClikeCount%2CviewCount%2CbinaryURL'
			+ '&directive=include_rtc'
			+ '&filter=search(' + searchTerms.replace(/ /g,"+") + ')';
	if ( $j('#author').attr('checked') ) {
		api += '&filter=author(/api/core/v3/people/' + userID + ')';
	}
	// Call the search api
	$j.ajax({
		type: 'GET',
		url: api,
		dataType: 'json',
		success: function (data) {
			// Build a table with the header formatted based on the search options
			var content = '<table class="contentList"><tr><th style="width: 3%;">#</th><th style="width: 15%;">Subject</th>';
			if ( ! $j('#author').attr('checked') ) {
				content += '<th style="width: 10%;">Author</th><th style="width: 7%;">Content ID</th>';
			} else {
				content += '<th style="width: 10%;">Content ID</th>';
			}
			content += '<th style="width: 8%;">Views</th><th style="width: 8%;">Likes</th><th style="width: 25%;">binaryURL</th>';
			if ( ! $j('#author').attr('checked') ) {
				content += '<th style="width: 5%;">Size</th><th style="width: 5%;">Type</th>';
			} else {
				content += '<th style="width: 10%;">Size</th><th style="width: 10%;">Type</th>';
			}
			content += '<th style="width: 15%;">File Type</th></tr>';
			var rows = 0
			// Go through the return of the search to fill in the table
			$j(data.list).each(function(index, opt){
				if ( this.type == 'event') {
					console.log(this);
				}
				if ( ! $j('#limit').attr('checked') || this.type == 'file') {
					rows += 1;
					content += '<tr';
					if (rows % 2 == 0) {
						content += ' class="evenrow"';
					}
					content += '><td>' + rows + '</td><td>';
					if (  this.type == 'document' || this.type == 'file' ) {
						content += '<a href="/docs/DOC-' + this.id + '">' + this.subject + '</a>';
					} else {
						content += this.subject;
					}
					content += '</td>';
					if ( ! $j('#author').attr('checked') ) {
						content += '<td>' + this.author.displayName + '</td>';
					}
					if ( this.contentID != undefined ) {
						content += '<td>' + this.contentID + '</td>';
					} else {
						content += '<td></td>';
					}
					content += '<td>' + this.viewCount + '</td>';
					content += '<td>' + this.likeCount + '</td>';
					if (this.binaryURL != undefined) {
						content += '<td>' + this.binaryURL + '</td>';
					} else {
						content += '<td></td>';
					}
					if (this.size != undefined) {
						content += '<td>' + this.size + '</td>';
					} else {
						content += '<td></td>';
					}
					if ( this.type != undefined ) {
						content += '<td>' + this.type + '</td>';
					}else {
						content += '<td></td>';
					}
					if (this.contentType != undefined ) {
						content += '<td>' + this.contentType + '</td>';
					} else {
						content += '<td></td>';
					}
					content += '</tr>';
				}
			});
			content += '</table>';
			if (rows > 0) {
				if (rows >= 25) {
					// Lots of rows returned, so put a message to narrow the search
					content += '<p><h3>Too many results.  Add search terms to narrow the search</h3></p>';
				}
				// Display the search return
				$j('#content').html(content);
			} else {
				$j('#content').html('<p>No matches found</p>');
			}
		},
		error: function (xhr, ajaxOptions, contentError){
			alert(contentError);
		},
		complete: function(){
			// enable the search button
			$j('#search').attr('disable', false);
			resizeWidget();
		}
	});
} //getContent

/*
 * Resizes the widget.  This should be called whenever we change the interior widget content.
 */
function resizeWidget(){
	resizeMe();
}

/*
 * This executes once the widget is loaded and ready to go.
 */
$j(document).ready(function() {
	// Get the information for the current user
	userID = window.parent._jive_current_user.ID;
});