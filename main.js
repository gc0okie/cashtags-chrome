console.log('main.js');

//test

var tickerWindow;
var tickerWindowPos;
var mousePos;
var boxWidth = 400;
var loadedTickers = new Map();

document.addEventListener("mouseover", function(event) {
    if (event.target.tagName.toLowerCase() == 'a'
        && event.target.href.includes('cashtag_click')) {
        
            var cashtag = event.target.innerHTML.replace("$","");
            var cnbcUrl = "https://www.cnbc.com/quotes/"+cashtag+"?tab=profile"
            
            initTickerWindow();
            
            mousePos = {top:event.pageY,left:event.pageX};
            calculatePosition();
            if (tickerWindowPos) {
                tickerWindow.css(tickerWindowPos)
            }

            tickerWindow.show();

            if (loadedTickers.has(cashtag))
            {
                var companyInfo = loadedTickers.get(cashtag);
                populateTickerWindow(companyInfo);
            } else {
                loadedTickers.set(cashtag, "Loading...");
                $.ajax({
                    url: cnbcUrl,
                    type: "GET",
                    datatype: "text",
                    success: function(data) {
                        var _price = extractInterior(data, '<div class="QuoteStrip-lastPriceStripContainer">', '</div>');
                        console.log(_price)
                        var _profile = extractInterior(data, '"businessSummary":','","address"')
                        console.log(_profile)

                        var companyInfo = {ticker:cashtag, price:_price, profile:_profile}
                        loadedTickers.set(cashtag, companyInfo);

                        populateTickerWindow(companyInfo);
                    },
                    statusCode: {
                        404: function() {
                            var companyInfo = {ticker: cashtag, price: '', profile: 'No company info found'}
                            loadedTickers.set(cashtag, companyInfo);
                            populateTickerWindow(companyInfo);
                        }
                    }
                });
            }

    } else {
        if (tickerWindow != null) {tickerWindow.hide();}
    }
})

function initTickerWindow() {
    if (!tickerWindow) {
        tickerWindow = $('<div id="tickerWindow"></div>').appendTo(document.body);
    }

    var css = {
        'border':'1px solid #ccd6dd',
		'padding':'10px',
		'margin':'1px',
		'max-width':boxWidth,
		'position':'absolute',
		'z-index':2147483647,
        'background-color':'#f5f8fa',
        'font-family':'"Gotham","Helvetica Neue","Helvetica",sans-serif',
        'box-shadow':'2px 2px 2px #ccd6dd',
        'width': '100%',
        'display': 'inline'
    }
    tickerWindow.css(css);
    tickerWindow.hide();
}

function calculatePosition()
{
	var top = mousePos.top;
	var left = mousePos.left;
	tickerWindowPos = {'top':top,'left':left};
}

function populateTickerWindow(companyInfo) {
    tickerWindow.empty();

    if (companyInfo.ticker == undefined) {
        var loading = $('<p>Loading...</p>');
		var loading_css = {'color':'#66757f','font-size':'12px'};
		loading.css(loading_css);
		tickerWindow.append(loading);
    } else {
        var ticker = $('<p><b>' + companyInfo.ticker.toUpperCase() + '</b></p>');
        var priceDiv = $('<div />');
        priceDiv.append(companyInfo.price);
        var profileParagraph = $('<p>' + companyInfo.profile + '</p>');
        tickerWindow.append(ticker);
        tickerWindow.append(priceDiv);
        tickerWindow.append(profileParagraph);
    }
}

// extracts and returns the string between beforeString and afterString from dataString
// for example:
// dataString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
// beforeString = "JKLMN"
// afterString = "STUVW"
// returns "OPQR"
function extractInterior(dataString, beforeString, afterString)
{
	var beforePosition = dataString.indexOf(beforeString)+beforeString.length;
	var afterPosition = dataString.indexOf(afterString,beforePosition);
	return dataString.substring(beforePosition,afterPosition);
}