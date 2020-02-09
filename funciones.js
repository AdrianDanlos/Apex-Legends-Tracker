$( document ).ready(function() {
    let allMyAccounts = 'N3Essential,N3EssentialSmurf,EssentialReborn,spacexfanboy,asiatristanvigo,thechinesesoul,thekoreansoul,thethaisoul,thevietsoul';
    let testingAccount = 'N3MachineSmurf';
    let api = `https://cors-anywhere.herokuapp.com/https://api.mozambiquehe.re/bridge?platform=PC&player=${allMyAccounts}&auth=`;
    let key = 'LPuQwxrvLY7hspWf1eST';

    //Proxies
    //https://secret-ocean-49799.herokuapp.com/
    //https://cors-anywhere.herokuapp.com/

    let ranks = [
        {'rank': 'bronze',
            'rpGap': 1200,
            'acumulatedRp': 1200},
        {'rank': 'silver',
            'rpGap': 1600,
            'acumulatedRp': 2800},
        {'rank': 'gold',
            'rpGap': 2000,
            'acumulatedRp': 4800},
        {'rank': 'platinum',
            'rpGap': 2400,
            'acumulatedRp': 7200},
        {'rank': 'diamond',
            'rpGap': 2800,
            'acumulatedRp': 10000},
        {'rank': 'apexpredator'}
    ];

    //Instantiating loading bar
    let bar = new ldBar(".myBar", {
        "stroke-width": 3,
        "preset": "rainbow",
        "data-fill": "blue"
    });

    //First call
    ajaxCall();
    //Repetitive calls
    setInterval(()=>{
        ajaxCall();
    }, 600000); //10min


    function ajaxCall(){
        $.ajax({
            url: api + key,
            contentType: "application/json",
            dataType: 'json',
            success: function(result){
                if(!(result instanceof Array)){
                    result = [result];
                }
                console.log(result);
                $('#loading').remove();
                let online = isOnline(result);
                let datosRanking = getRanking(result);
                let datosTotales = sumarDatos(result);
                let percentageToNextRank = calculatePercentToNextRank(result);
                let nextRankLogoUrl = getNextRankLogo(result);
                let favouriteLegendUrl = getFavouriteLegend(result);
                visualizarDatos(datosTotales, datosRanking, online, 'N3Essential', percentageToNextRank, nextRankLogoUrl, favouriteLegendUrl);
            }
        });
    }

    function isOnline(result) {
        let online = false;
        result.forEach((item, index) => {
            if(result[index]['realtime']['isOnline'] === 1){
                online = true;
            }
        });
        return online;
    }

    function getRanking(result){
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

    function sumarDatos(result){
        let datosTotales = {
            "kills": 0,
            "wins": 0,
            "top3": 0
        };
        //get stats from selected legend
        result.forEach((item, i) => {
            const selectedLegend = Object.values(result[i]['legends']['selected'])[0]; //constante dado que nunca le vamos a asignar otro valor durante la iteración actual. La volvemos a declarar en cada iteración.

            datosTotales.kills += selectedLegend['kills'] || 0;
            datosTotales.wins += selectedLegend['wins_season_3'] || 0;
            datosTotales.top3 += selectedLegend['top_3'] || 0;
            /*console.log('--------------SELECTED LEGEND-------------');
            console.log('Account number: ' + i);
            console.log('Selected legend: ' + Object.keys(result[i]['legends']['selected'])[0]);
            console.log('Kills: ' + selectedLegend['kills']);
            console.log('Wins: ' + selectedLegend['wins_season_3']);
            console.log('Top3: ' + selectedLegend['top_3']);
            console.log('Total Kills: ' + datosTotales.kills);
            console.log('Total wins: ' + datosTotales.wins);
            console.log('Total top3: ' + datosTotales.top3);*/
        });

        //get stats from all legends except the selected one to avoid duplicated data
        result.forEach((item, i)=>{ //iterate trough accounts
            let selectedLegendKey = Object.keys(result[i]['legends']['selected'])[0]; //legend selected in this account
            let allLegendsArray = result[i]['legends']['all']; //all legends array
            if(allLegendsArray){ //if the api gets 'all legends' object
                /*console.log('-------------ALL LEGENDS--------------');
                console.log('Account number: ' + i);*/
                Object.keys(allLegendsArray).forEach((key, x)=> { //iterate through 'all' legends
                    if(selectedLegendKey !== Object.keys(allLegendsArray)[x]){ //we keep adding data except if the legend found in 'all legends' section is the selected one.
                        let iteratingLegend = Object.values(allLegendsArray)[x]; //the legend we are iterating trhough
                        datosTotales.kills += parseInt(iteratingLegend['kills'], 10);
                        datosTotales.wins += parseInt(iteratingLegend['wins_season_3'], 10) || 0;
                        datosTotales.top3 += parseInt(iteratingLegend['top_3'], 10) || 0;
                        /*console.log('current legend in iteration: ' + Object.keys(allLegendsArray)[x]);
                        console.log('kills: ' + iteratingLegend['kills']);
                        console.log('Total Kills: ' + datosTotales.kills);*/
                    }
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
        if(online){
            $('#online-logo').attr('src', 'img/online.png');
        }
        else{
            $('#online-logo').attr('src', 'img/offline.png');
        }
        //Percentage left
        bar.set(
            Math.floor(percentageToNextRank),     /* target value. */
            true   /* enable animation. default is true */
        );
        $('#rankPercentage').css('display', 'flex');
        $('.baseline')[0].attr('stroke', 'white');
        $('.myBar').css('display', 'block');

        //Next rank logo
        $('#next-rank-logo').attr('src', nextRankLogoUrl);

        //Favorite legend banner
        $('#most-played img').attr('src', favouriteLegendUrl);
        $('#most-played').css('display', 'flex');

    }

    function romanize(number) {
        switch (number) {
            case 1: return 'I';
                break;
            case 2: return 'II';
                break;
            case 3: return 'III';
                break;
            case 4: return 'IV';
                break;
        }
    }

    function createDateNode() {
        let d = new Date();
        let refreshTime = $('#refresh-time');
        if(!refreshTime.length){
            $('footer').prepend('<span id="refresh-time"></span>');
            refreshTime = $('#refresh-time');
        }
        refreshTime.html("Last refresh: " + (d.getHours()<10?'0':'') + d.getHours() + ' : ' + (d.getMinutes()<10?'0':'') + d.getMinutes() + ' : ' + (d.getSeconds()<10?'0':'') + d.getSeconds() + '  GMT+1');
    }

    function getNextRankLogo(result) {
        let rankName = getCurrentRankName(result);
        let rankDivision = getCurrentRankDivision(result);

        if(rankDivision === 1){ //Make jump from leagues
            let indexOfCurrentRank = ranks.findIndex(item => item.rank === rankName); //Gets the index of the element that has the rankName passed
            rankName = ranks[indexOfCurrentRank + 1];
            rankDivision = 4;
        }

        return `http://api.apexlegendsstatus.com/assets/ranks/${rankName + rankDivision}.png`;
    }

    function getNextDivisionStartingRP(result) {

        let gapBetweenDivisions = getGapBetweenDivisions(result);
        let gapToNextLeague = ranks.find(item => item.rank === getCurrentRankName(result)).rpGap;
        let nextLeagueStartingRP = ranks.find(item => item.rank === getCurrentRankName(result)).acumulatedRp;
        let nextDivisionStartingRP = nextLeagueStartingRP - gapToNextLeague;

        do {
            nextDivisionStartingRP += gapBetweenDivisions;
        }while (nextDivisionStartingRP < result[0]['global']['rank']['rankScore']);

        return nextDivisionStartingRP;
    }

    function getCurrentRankName(result) {
        return result[0]['global']['rank']['rankName'].toLowerCase();
    }

    function getCurrentRankDivision(result) {
        return result[0]['global']['rank']['rankDiv'] - 1; //We get the next rankDivision
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
                if(highestKills < parseInt(allLegendsObject[key]['kills'])){
                    highestKills = allLegendsObject[key]['kills'];
                    favouriteLegend = key;
                }
            }
        }
        console.log(favouriteLegend);
        return `http://api.apexlegendsstatus.com/assets/icons/${favouriteLegend.toLowerCase()}.png`;
    }

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
