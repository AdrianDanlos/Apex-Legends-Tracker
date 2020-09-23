$(document).ready(function () {
    const myAccounts = 'N3Essential,N3EssentialSmurf,EssentialReborn,spacexfanboy,asiatristanvigo,thechinesesoul,thekoreansoul,thethaisoul,thevietsoul,thephilipinesoul,themyanmarsoul';
    let playerAccount = 'thekoreansoul'; //wizard_of_gore
    let api = `https://cors-anywhere.herokuapp.com/https://api.mozambiquehe.re/bridge?platform=PC&player=${playerAccount}&auth=`;
    const key = 'LPuQwxrvLY7hspWf1eST';
    let xhr; //AjaxCall Object
    let refreshAvailable = true;
    let viewPortHeightOnFocus = 1000; //Max height value for mobiles height
    let isApexPredator;

    //Proxies
    //https://secret-ocean-49799.herokuapp.com/
    //https://cors-anywhere.herokuapp.com/

    //Activate tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    //Get Ranks from JSON
    let ranks;
    $.getJSON('data/ranks.json', function (json) {
        ranks = json;
    });

    //Instantiating loading bar
    let bar = new ldBar(".myBar", {
        "stroke-width": 3,
        "preset": "rainbow",
        "data-fill": "blue"
    });

    //First call (on page load)
    ajaxCall();


    function ajaxCall() {
        xhr = $.ajax({
            url: api + key,
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                if (!(result instanceof Array)) { //Si la busqueda es de un solo jugador envolvemos los datos deuveltos en un array
                    result = [result];
                }
                console.log(result);
                isApexPredator = result[0]['global']['rank']['rankName'] === 'Apex Predator';
                let online = isOnline(result);
                let datosRanking = getRanking(result);
                let datosTotales = sumarDatos(result);
                let percentageToNextRank = calculatePercentToNextRank(result);
                let nextRankLogoUrl = getNextRankLogo(result);
                let favouriteLegendUrl = getFavouriteLegend(result);
                let nameDisplayed = playerAccount.includes('N3Essential') ? 'N3Essential' : result[0]['global']['name']; //De esta manera cuando se realiza una busqueda masiva a nuestras smurfs solo sale N3essential
                visualizarDatos(datosTotales, datosRanking, online, nameDisplayed, percentageToNextRank, nextRankLogoUrl, favouriteLegendUrl);
            },
            error: function (error) {
                console.log('----ERROR----');
                if (error.status === 404) {
                    $('#notFoundText').fadeIn();
                }
            }
        });
    }


    function isOnline(result) {
        let online = false;
        result.forEach((item, index) => {
            if (result[index]['realtime']['isOnline'] === 1) {
                online = true;
            }
        });
        return online;
    }

    function getRanking(result) {
        let rankObject = result[0]['global']['rank'];
        let rankName = rankObject['rankName'];
        let rankScore = rankObject['rankScore'];
        let rankDiv = rankObject['rankDiv'];
        let rankImg = rankObject['rankImg'];

        return [rankName, rankDiv, rankScore, rankImg];
    }

    function calculatePercentToNextRank(result) {
        let nextDivisionStartingRP = getNextDivisionStartingRP(result);
        let remainingPoints = nextDivisionStartingRP - result[0]['global']['rank']['rankScore'];
        let gapBetweenDivisions = getGapBetweenDivisions(result);
        let percentageToNextRank = 100 - ((remainingPoints * 100) / gapBetweenDivisions);
        return percentageToNextRank;
    }

    function sumarDatos(result) {
        let datosTotales = {
            "kills": 0,
            "wins": 0,
            "top3": 0
        };

        //get stats from all legends
        result.forEach((item, i) => { //iterate trough accounts
            let allLegendsArray = result[i]['legends']['all']; //all legends array
            if (allLegendsArray) { //if the api gets 'all legends' object
                //console.log('Account number: ' + i);
                Object.keys(allLegendsArray).forEach((key, x) => { //iterate through 'all' legends
                    let iteratingLegend = Object.values(allLegendsArray)[x]; //the legend we are iterating trhough
                    datosTotales.kills += parseInt(iteratingLegend['kills'], 10) || 0;
                    datosTotales.wins += parseInt(iteratingLegend['wins_season_3'], 10) || 0;
                    datosTotales.wins += parseInt(iteratingLegend['wins_season_4'], 10) || 0;
                    datosTotales.top3 += parseInt(iteratingLegend['top_3'], 10) || 0;
                });
            }
        });
        return datosTotales;
    }

    function visualizarDatos(datosTotales, datosRanking, online, user, percentageToNextRank, nextRankLogoUrl, favouriteLegendUrl) {
        //Date
        createDateNode();
        //User
        $('#user-info').html(user);
        //Data
        let dataContainers = $('.data');
        for (let i = 0; i < dataContainers.length; i++) {
            dataContainers[i].innerHTML = datosTotales[Object.keys(datosTotales)[i]];
        }
        //Ranking
        $('#rank').html(datosRanking[0] + " " + romanize(datosRanking[1]) + " " + datosRanking[2]);
        $('#current-rank-logo').attr('src', datosRanking[3]);
        //Online status up
        if (online) {
            $('#online-logo').attr('src', 'assets/online.png');
        } else {
            $('#online-logo').attr('src', 'assets/offline.png');
        }

        //If he is not apex predator we render % and next rank logo
        if (!isApexPredator) {
            //Percentage left
            bar.set(
                Math.floor(percentageToNextRank), /* target value. */
                true /* enable animation. default is true */
            );
            $('#rankPercentage').css('display', 'flex');
            $('.baseline')[0].attr('stroke', 'white');
            $('.myBar').css('display', 'block');

            //Next rank logo
            $('#next-rank-logo').attr('src', nextRankLogoUrl);
        } else {
            $('#rankPercentage').css('display', 'none');
            $('.myBar').css('display', 'none');
        }
        //Favorite legend banner
        $('#most-played img').attr('src', favouriteLegendUrl);
        $('#most-played').css('display', 'flex');

    }

    function romanize(number) {
        switch (number) {
            case 1:
                return 'I';
            case 2:
                return 'II';
            case 3:
                return 'III';
            case 4:
                return 'IV';
        }
    }

    function createDateNode() {
        let d = new Date();
        let refreshTime = $('#refresh-time');
        if (!refreshTime.length) {
            $('footer').prepend('<span id="refresh-time"></span>');
            refreshTime = $('#refresh-time');
        }
        refreshTime.html("Last refresh: " + (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + '  <span class="timezone">GMT+1</span>');
    }

    function getNextRankLogo(result) {
        let rankName = getCurrentRankName(result);
        let rankDivision = getCurrentRankDivision(result);
        if (rankDivision === 1 && !isApexPredator) { //Make jump from leagues
            switch (rankName) {
                case 'diamond':
                    rankName = 'master';
                    rankDivision = "";
                    break;
                case 'master':
                    rankName = 'apexpredator';
                    rankDivision = "";
                    break;
                default:
                    let indexOfCurrentRank = ranks.findIndex(item => item.rank === rankName); //Gets the index of the element that has the rankName passed
                    rankName = ranks[indexOfCurrentRank + 1].rank;
                    rankDivision = 4;
                    break;
            }
        } else {
            rankDivision -= 1;
        }
        return `assets/ranks/${rankName + rankDivision}.png`;
    }

    function getNextDivisionStartingRP(result) {

        let gapBetweenDivisions = getGapBetweenDivisions(result);
        let gapToNextLeague = ranks.find(item => item.rank === getCurrentRankName(result)).rpGap;
        let nextLeagueStartingRP = ranks.find(item => item.rank === getCurrentRankName(result)).acumulatedRp;
        let nextDivisionStartingRP = nextLeagueStartingRP - gapToNextLeague;

        do {
            nextDivisionStartingRP += gapBetweenDivisions;
        } while (nextDivisionStartingRP < result[0]['global']['rank']['rankScore']);

        return nextDivisionStartingRP;
    }

    function getCurrentRankName(result) {
        return result[0]['global']['rank']['rankName'].toLowerCase();
    }

    function getCurrentRankDivision(result) {
        return result[0]['global']['rank']['rankDiv'];
    }

    function getGapBetweenDivisions(result) {
        return ranks.find(item => item.rank === getCurrentRankName(result)).rpGap / 4;
    }

    function getFavouriteLegend(result) {
        let allLegendsObject = result[0]['legends']['all'];
        let favouriteLegend;
        let highestKills = 0;
        for (let key in allLegendsObject) {
            if (allLegendsObject[key].hasOwnProperty('kills')) {
                if (highestKills < parseInt(allLegendsObject[key]['kills'])) {
                    highestKills = allLegendsObject[key]['kills'];
                    favouriteLegend = key;
                }
            }
        }

        if (favouriteLegend) {
            switch (favouriteLegend.toLowerCase()) {
                case 'loba':
                    return 'https://media.contentapi.ea.com/content/dam/apex-legends/images/2020/05/apex-grid-tile-legends-loba.png'
                case 'revenant':
                    return 'https://media.contentapi.ea.com/content/dam/apex-legends/images/2020/02/apex-legend-revenant-grid-tile.png'
                default:
                    return `https://media.contentapi.ea.com/content/dam/apex-legends/images/2019/01/legends-character-tiles/apex-grid-tile-legends-${favouriteLegend.toLowerCase()}.png`
            }

        }
        return 'assets/unknown.png'
    }

    function rotateRefreshIcon(refreshIcon) {
        refreshIcon.css('transform', 'rotate(180deg)');
        refreshIcon.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
            refreshIcon.css('transition', '0s');
            refreshIcon.css('transform', 'rotate(0deg)');
        });
        refreshIcon.css('transition', '1s');
    }

    //----EVENTS----

    let searchForm = $(".search-form");

    //Search for player on ENTER keypress
    searchForm.on('keyup', function (e) {
        if (e.key === 'Enter' && refreshAvailable) {
            playerAccount = $(this).val();
            if (playerAccount.toLowerCase() === 'n3essential') {
                playerAccount = myAccounts;
            }
            api = `https://cors-anywhere.herokuapp.com/https://api.mozambiquehe.re/bridge?platform=PC&player=${playerAccount}&auth=`;
            $('#notFoundText').fadeOut(0);
            xhr.abort(); //Stop previous ajax execution
            ajaxCall();
            refreshAvailable = false;
            setTimeout(() => {
                refreshAvailable = true;
            }, 1000) //Allow refresh 1 per second
        }
    });

    //MOBILE-> Hide cards containerwhen keyboard is displayed to avoid browser resizing messing up our view

    searchForm.on('click', function () {
        if ($(window).width() < 400) {
            setTimeout(() => { //Wait for mobile keyboard to deploy. Then get height
                viewPortHeightOnFocus = $(window).height();
            }, 500);

            $('.cards-container').css('visibility', 'hidden');
        }
    });

    searchForm.focusout(function () {
        if ($(window).width() < 400) {
            displayViewOnKeyboardOut();
        }
    });

    $(window).resize(function () {
        if ($(window).width() < 400 && viewPortHeightOnFocus < $(window).height() && searchForm.is(":focus")) {
            displayViewOnKeyboardOut();
        }
    });

    function displayViewOnKeyboardOut() {
        $('.cards-container')
            .hide()
            .fadeIn()
            .css('visibility', 'visible');
    }



    //Refresh
    $('#search-form-container i').on('click', function () {
        let refreshIcon = $('#search-form-container i');
        if (refreshAvailable) {
            xhr.abort();
            ajaxCall();
            rotateRefreshIcon(refreshIcon);
            refreshAvailable = false;
            setTimeout(() => {
                refreshAvailable = true;
            }, 1000) //Allow refresh 1 per second
        }
    });


    //Ajax loading logo
    $(document).ajaxStart(function () {
        let dataContainers = $('.data');
        for (let i = 0; i < dataContainers.length; i++) {
            dataContainers[i].innerHTML = '...';
        }
        $('#most-played').hide();
        $('#legend-container').hide();
        $('#loading').show();
    }).ajaxStop(function () {
        $('#loading').hide();
        if (xhr.status === 404) {
            $('#notFoundText').fadeIn();
        } else {
            $('#legend-container').css("display", "flex")
                .hide() //We hide first to be able to get the fadein animation
                .fadeIn();

            $('#most-played').css("display", "flex")
                .hide() //We hide first to be able to get the fadein animation
                .fadeIn();
        }
    });

    //To ouptut an object into a json file
    /*function download(content, fileName, contentType) {
            let a = document.createElement("a");
            let file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }
        download(JSON.stringify(result[0]['legends']['all']), 'json.txt', 'text/plain');*/
});