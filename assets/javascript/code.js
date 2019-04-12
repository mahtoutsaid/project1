// Icon Associations
var conditionsObj = {
	'01d': 'clear',
	'01n': 'clearnight',
	'02d': 'partlycloudy',
	'02n': 'cloudynight',
	'03d': 'cloudy',
	'03n': 'cloudynight',
	'04d': 'cloudy',
	'04n': 'cloudynight',
	'09d': 'lightrain',
	'09n': 'lightrain',
	'10d': 'heavyshowers',
	'10n': 'heavyshowers',
	'11d': 'thunderstorms',
	'11n': 'thunderstorms',
	'13d': 'hail',
	'13n': 'hail',
	'50d': 'fog',
	'50n': 'fog'
};

// Database Initiation 
var config = {
    apiKey: "AIzaSyBa1e0L-DemkmVuqWy1XrxsrI95fP59GC8",
    authDomain: "first-project-ac7aa.firebaseapp.com",
    databaseURL: "https://first-project-ac7aa.firebaseio.com",
    projectId: "first-project-ac7aa",
    storageBucket: "first-project-ac7aa.appspot.com",
    messagingSenderId: "1045492524479"
};

firebase.initializeApp(config);

var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        session = con.key;
        con.onDisconnect().remove();
    }
});

// Global Variables
var session;
var favCities = [];
var citiesOnMap = [];
var cityData = [];
var locGrab;
var nameGrab;

// Live Data on Page Load/Refresh
function createCitiesArray() {
	for (var i = 0; i < $('.bay').length; i++) {
	citiesOnMap.push($('.bay').eq(i).attr('data'));
	}
	fetchData(citiesOnMap);
}

createCitiesArray();

function inputCityValues(cityRes, i){
    $('.bay #temp').eq(i)[0].innerHTML = 
        cityRes.temp + '&#176';
    $('.bay .weathericon').eq(i)[0].src = 
        'assets/images/icons/icon-' + cityRes.icon + '.png';
}

function fetchData(arr){
    var j=0;
	for (var i =0; i < arr.length; i++) {
		$.ajax({
		url: "https://api.openweathermap.org/data/2.5/weather?id=" + 
      arr[i] + "&appid=3c972a1a313f1b25f997f4e0fe1a3549",
		Method: 'GET'
		}).then(function(response){
			cityData[response.name] = {
				name: response.name,
				sunrise: timeConverter(response.sys.sunrise) + 'AM',
				sunset: timeConverter(response.sys.sunset) + 'PM',
				forecast: response.weather[0].main,
				humidity: response.main.humidity + '%',
				wind: speedConverter(response.wind.speed) + ' mph at ' + response.wind.deg + '&#176;',
				cloudiness: response.clouds.all + '%',
				minTemp: tempConverter(response.main.temp_min) + '&#176;F',
				maxTemp: tempConverter(response.main.temp_max) + '&#176;F',
				temp: tempConverter(response.main.temp),
				icon: conditionsObj[response.weather[0].icon],
			};
			inputCityValues(cityData[response.name], j);
            j++;
		});
	}
}

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

// OnClick: City Name Divs and Popup Data
$('.clickable').on('click', function(){
    $(".popup").removeClass("hidden");
    var location = $(this).parent().attr('data');
    locGrab = location;
    $(".popup").attr('data', `${location}`);
    var queryUrl = 'http://api.openweathermap.org/data/2.5/weather?id=' + location + '&appid=ce6c4d281dc8a0dfa66efef63172fefe';
    $.ajax({
		url:queryUrl,
		method:'GET'  
	}).then(function(response){
        nameGrab = response.name;
        $('#datapop').html(`<span id="name" class="data">${response.name}</span>
        <span id="sunrise" class="data">${timeConverter(response.sys.sunrise)} AM</span>
        <span id="sunset" class="data">${timeConverter(response.sys.sunset)} PM</span>
        <span id="forecast" class="data">${titleCase(response.weather[0].description)}</span>
        <span id="humid" class="data">${response.main.humidity}%</span>
        <span id="wind" class="data">${speedConverter(response.wind.speed)} mph at ${rounder(response.wind.deg)}&#176;</span>
        <span id="cloud" class="data">${response.clouds.all}%</span>
        <span id="maxtemp" class="data">${tempConverter(response.main.temp_max)}&#176;F</span>
        <span id="mintemp" class="data">${tempConverter(response.main.temp_min)}&#176;F</span>
        `)
        if (favCities.includes(location)){
            $('#popstar').attr('src','./assets/images/icons/icon-star-gold.png')
        } else $('#popstar').attr('src','./assets/images/icons/icon-star-white.png')
    });
});

// OnClick: Popup Star Functionality
$('#popstar').on('mouseover', function(){
    if ($('.container').find(`[data='${locGrab}']`).children().children().attr('fav') == 'n' && $(this).attr('src') == './assets/images/icons/icon-star-white.png'){
        $(this).attr('src', './assets/images/icons/icon-star-gold.png');
    } 
}).on('mouseleave', function(){
    if ($('.container').find(`[data='${locGrab}']`).children().children().attr('fav') == 'n' && $(this).attr('src') == './assets/images/icons/icon-star-gold.png'){
        $(this).attr('src', './assets/images/icons/icon-star-white.png');
    }
}).on('click', function(){
    divName = nameGrab.replace(/\s/g, '');
    if (favCities.includes(locGrab)){
        $(this).attr('src', './assets/images/icons/icon-star-white.png');
        favCities= favCities.filter(e => e != locGrab);
        database.ref("/favorites/" + session).set(favCities);
        $('.starred #'+divName).remove();
        $('.container').find(`[data='${locGrab}']`).children().children().attr('fav', 'n').attr('src','./assets/images/icons/icon-star.png');
    } else {favCities.push(locGrab);
        $(this).attr('src', './assets/images/icons/icon-star-gold.png')
        $('.container').find(`[data='${locGrab}']`).children().children().attr('fav', 'y').attr('src','./assets/images/icons/icon-star-gold.png');
        $('.starred').append(`<div id="${divName}" data="${locGrab}" class="citylist"><button class="delete">x</button><span class="listitems"> ${nameGrab}</span></div>`);
        database.ref("/favorites/" + session).set(favCities);
    }
});

// OnClick: Close Popup
$('#close').on('click', function(){
    $(".popup").addClass("hidden");
    $("#datapop").html(``);
});

// OnClick: City Name Divs Star Functionality
$('.staricon').on('mouseover', function(){
    if ($(this).attr('fav') == 'n'){
        $(this).attr('src', './assets/images/icons/icon-star-gold.png');
    }
}).on('mouseleave', function(){
    if ($(this).attr('fav') == 'n'){
        $(this).attr('src', './assets/images/icons/icon-star.png');
    }
}).on('click', function(){
    var cityName = $(this).parent().parent().attr('value');
    var cityCode = $(this).parent().parent().attr('data');
    divName = cityName.replace(/\s/g, '');
    if (favCities.includes(cityCode)){
        $(`[data="${cityCode}"]`).children().children().attr('src', './assets/images/icons/icon-star-white.png');
    } else {favCities.push(cityCode);
        $('.starred').append(`<div id="${divName}" data="${cityCode}" class="citylist"><button class="delete">x</button><span class="listitems"> ${cityName}</span></div>`);
        database.ref("/favorites/" + session).set(favCities);
        $('#popstar').attr('src', './assets/images/icons/icon-star-gold.png');
    }
    if ($(this).attr('fav') == 'n'){
        $(this).attr('src', './assets/images/icons/icon-star-gold.png');
        $(this).attr('fav', 'y');
    } else if ($(this).attr('fav') == 'y'){
        $(this).attr('src', './assets/images/icons/icon-star.png');
        favCities= favCities.filter(e => e != cityCode);
        database.ref("/favorites/" + session).set(favCities)
        $('.starred #'+divName).remove();
        $(this).attr('fav', 'n'); 
    }
});

// OnClick: Starred Places Delete Functionality
$(document).on('click', '.delete', function(){
    var cityName = $(this).parent().attr('data');
    $('.container').find(`[data='${cityName}']`).children().children().attr('fav','n').attr('src', './assets/images/icons/icon-star.png');
    if (cityName == locGrab){
        $('#popstar').attr('src', './assets/images/icons/icon-star-white.png');
    }
    favCities= favCities.filter(e => e != cityName);
    $(this).parent().remove();
    database.ref("/favorites/" + session).set(favCities)
});

// OnClick: Starred Places Names Popup
$(document).on('click', '.listitems', function(){
    $(".popup").removeClass("hidden");
    var location = $(this).parent().attr('data');
    locGrab = location;
    $(".popup").attr('data', `${location}`);
    var queryUrl = 'http://api.openweathermap.org/data/2.5/weather?id=' + location + '&appid=ce6c4d281dc8a0dfa66efef63172fefe';
    $.ajax({
		url:queryUrl,
		method:'GET'  
	}).then(function(response){
        nameGrab = response.name;
        $('#datapop').html(`<span id="name" class="data">${response.name}</span>
        <span id="sunrise" class="data">${timeConverter(response.sys.sunrise)} AM</span>
        <span id="sunset" class="data">${timeConverter(response.sys.sunset)} PM</span>
        <span id="forecast" class="data">${titleCase(response.weather[0].description)}</span>
        <span id="humid" class="data">${response.main.humidity}%</span>
        <span id="wind" class="data">${speedConverter(response.wind.speed)} mph at ${rounder(response.wind.deg)}&#176;</span>
        <span id="cloud" class="data">${response.clouds.all}%</span>
        <span id="maxtemp" class="data">${tempConverter(response.main.temp_max)}&#176;F</span>
        <span id="mintemp" class="data">${tempConverter(response.main.temp_min)}&#176;F</span>
        `)
        if (favCities.includes(location)){
            $('#popstar').attr('src','./assets/images/icons/icon-star-gold.png')
        } else $('#popstar').attr('src','./assets/images/icons/icon-star-white.png')
    });
});

// OnClick: Next Page Data Pass
$('.view').on('click', function(){
    localStorage.setItem('a', session);
});

