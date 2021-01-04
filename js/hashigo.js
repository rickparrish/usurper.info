// hashigo is somewhat of a stripped down version of Navigo -- https://github.com/krasimir/navigo
// Requires jquery, because I use bootstrap so already have jquery loading for that

function hashigo() {
    // Check whether the hashchange event is available (with extra IE7-fixing check from http://benalman.com/projects/jquery-hashchange-plugin/)
    this.isHashChangeAvailable = typeof window !== "undefined" && "onhashchange" in window && (document.documentMode === undefined || document.documentMode > 7);
}

hashigo.prototype = {
    // Called when a request for a page fails
    error: function(status, statusText) {
        if (status == '404') {
            $('#hashigo').html('<div class="alert alert-danger">Sorry, the requested page could not be found.  Try a different link from the menu above.</div>');
        } else {
            $('#hashigo').html('<div class="alert alert-danger">Sorry, there was an error loading the requested page: ' + status + " " + statusText + '</div>');
        }
    },
    
    // Call(ed) to make a request for a new page in the pages subdirectory
    loadPage: function(hash) {
        var originalHash = hash;

        // Handle special cases, which should map to index page
        if ((hash == '') || (hash == '#') || (hash == '#/')) {
            hash = 'index';
        } else {
            // Trim hash, leading forward slash and trailing forward slash to standardize string
            hash = hash.replace(/^[#]/, '');
            hash = hash.replace(/^[/]/, '');
            hash = hash.replace(/[/]$/, '');
        }

        var url = 'pages/' + hash + '.html';

        this.log('requesting "' + originalHash + '" aka "' + hash + '" aka "' + url + '"');

        var that = this;
        $('#hashigo').load(url, function(responseText, textStatus, jqXHR) {
            if (textStatus == 'error') {
                that.log('error requesting "' + url + '": ' + jqXHR.status + " " + jqXHR.statusText);
                that.error(jqXHR.status, jqXHR.statusText);
            }
        });
    },
    
    // Called to log messages
    log: function(text) {
        console.log('[hashigo] ' + text);
    },

    // Call to start the event listener and load the first page
    start: function() {
        // Handle HTTP to HTTPS redirect, if necessary
        if (location.protocol !== 'https:') {
            var newUrl = 'https:' + location.href.substring(location.protocol.length);
            this.log('redirecting to https url: "' + newUrl + '"');
            location.replace(newUrl);
            return;
        }

        // Setup a handler for navigation changes (ie back/forward) based on the available features
        var that = this;
        if (this.isHashChangeAvailable) {
            this.log('listening for hashchange');
            
            var handleHashChange = function() {
                that.log('handling hashchange event');
                that.loadPage(window.location.hash);
            };
            
            if (window.addEventListener) {
                window.addEventListener("hashchange", handleHashChange);
            } else {
                window.attachEvent("onhashchange", handleHashChange);
            }
        } else {
            this.log('starting hash check timer');
            var oldHash = window.location.hash;
            
            var timer = function() {
                var newHash = window.location.hash;
                if (oldHash != newHash) {
                    that.log('handling timer event');
                    oldHash = newHash;
                    that.loadPage(newHash);
                }
                setTimeout(timer, 200);
            };
            
            timer();
        }

        // Load the content for the current page
        this.log('loading start page');
        this.loadPage(window.location.hash);
    }
};
