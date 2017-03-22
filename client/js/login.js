/* login.js
** Created by Michael Albinson 11/24/16
*/

"use strict";

function getLoginContent() {
	return {username: $(netid).val(), secret: $(secret).val()};
}

function login() {
	$(signIn).prop("disabled", true);
	var content = getLoginContent();
	if (!content["username"] || !content["secret"]){
		$(signIn).prop("disabled", false);
		return console.warn("Please fill out required fields before attempting to log in")
	}

	$.ajax({
    	url: location.url,
    	type: 'POST',
    	contentType: 'application/json', 
    	data: JSON.stringify(content)
    }).done(function(data) {
    	if (data) {
            location.href = location.href.replace('/login?redirect=', '');
        }
        else {
            $(signIn).prop("disabled", false);

        }
    	
        
    }).fail(function(err) {
    	console.log(err);
    	$(signIn).prop("disabled", false);
    });
}