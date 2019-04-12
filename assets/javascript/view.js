var config = {
    apiKey: "AIzaSyBa1e0L-DemkmVuqWy1XrxsrI95fP59GC8",
    authDomain: "first-project-ac7aa.firebaseapp.com",
    databaseURL: "https://first-project-ac7aa.firebaseio.com",
    projectId: "first-project-ac7aa",
    storageBucket: "first-project-ac7aa.appspot.com",
    messagingSenderId: "1045492524479"
};

firebase.initializeApp(config);

var user = localStorage.getItem('a');
var favCities;
var database = firebase.database();
var userRef = database.ref("/favorites/" + user);

// Utility Functions
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

function tempConverter(num) {
    var temp = ((num-273.15)*1.8)+32;
    var round = Math.round(temp * 10) / 10
    return round;
}

function speedConverter(mps){
    var mph = (mps * 3600 / 1610.3*1000)/1000;
    var round = Math.round(mph * 10) / 10;
    return round;
}

function rounder(deg){
    var round = Math.round(deg * 10) / 10;
    return round;
}

function timeConverter(unix){
    var date = new Date(unix*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    if (hours > 12){
        hours = hours-12;
    }
    var time = hours + ':' + minutes.substr(-2);
    return time;
}

// Data Retrieval and Plotting Loop
userRef.on("value", function(snapshot) {
    if(snapshot.val() !== null){
        favCities = snapshot.val();
        for (var i=0; i<favCities.length; i++){
            var cityCode = favCities[i];
            $('.over').append(`<div class="popup" data="${favCities[i]}"></div>`)
            fetchData(cityCode);
        };
    };
});

function fetchData(arr){
        var cityCode = arr;
        $.ajax({
            url:'http://api.openweathermap.org/data/2.5/weather?id=' + cityCode + '&appid=ce6c4d281dc8a0dfa66efef63172fefe',
            method:'GET'  
        }).then(function(response){
            $(`[data="${cityCode}"]`).html(`<img id="popstar" src="./assets/images/icons/icon-star-gold.png" alt="Star">
            <span id="name" class="data">${response.name}</span>
            <span id="sunrise" class="data">${timeConverter(response.sys.sunrise)} AM</span>
            <span id="sunset" class="data">${timeConverter(response.sys.sunset)} PM</span>
            <span id="forecast" class="data">${titleCase(response.weather[0].description)}</span>
            <span id="humid" class="data">${response.main.humidity}%</span>
            <span id="wind" class="data">${speedConverter(response.wind.speed)} mph at ${rounder(response.wind.deg)}&#176;</span>
            <span id="cloud" class="data">${response.clouds.all}%</span>
            <span id="maxtemp" class="data">${tempConverter(response.main.temp_max)}&#176;F</span>
            <span id="mintemp" class="data">${tempConverter(response.main.temp_min)}&#176;F</span>
            `)
        });
};