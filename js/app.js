var FORECAST = {
    
    mainContent : null,
    jsonData : null,
    today : true,
    degree : "c",
    
    /*main weather (current / tomorrow)*/
    createMainWeather : function(mainWeather, current){
        let weatherBox = document.createElement("div");
        
        weatherBox.classList.add("weather");
        weatherBox.classList.add("current");

        //header
        let divHeader = document.createElement("div");
        let headerText = document.createElement("h2");
        let headerHour = document.createElement("spam");
        divHeader.classList.add("header");

        if (current){
            headerText.textContent = "Current Conditions";
            headerHour.textContent = new Date().toLocaleTimeString('en-CA', {hour: '2-digit', minute:'2-digit'});
        } else{
            headerText.textContent = "Tomorrow's Weather";
        }

        divHeader.appendChild(headerText);
        divHeader.appendChild(headerHour);
        weatherBox.appendChild(divHeader);

        //content
        let divContent = document.createElement("div");
        divContent.classList.add("content");
        
        //icon
        let divIcon = document.createElement("div");
        let icon = document.createElement("i");
        icon.classList.add("wi");
        icon.classList.add(FORECAST.getIconValue(mainWeather.icon));
        divIcon.classList.add("icon");
        divIcon.appendChild(icon);
        divContent.appendChild(divIcon);

        //summary
        let divSummary = document.createElement("div");
        let temp = document.createElement("h2");
        let summary = document.createElement("spam");
        let apparentTemp = document.createElement("p");
        let precip = document.createElement("p");
        let wind = document.createElement("p");

        divSummary.classList.add("summary");
        summary.textContent = mainWeather.summary;
        
        if (current){
            temp.textContent = FORECAST.getDegree(mainWeather.temperature);
            apparentTemp.textContent = FORECAST.getDegree(mainWeather.apparentTemperature);
        }else{
            temp.textContent = FORECAST.getDegree(mainWeather.temperatureMin) + 
                                " ~ " +
                                FORECAST.getDegree(mainWeather.temperatureMax);
            apparentTemp.textContent = FORECAST.getDegree(mainWeather.apparentTemperatureMin) + 
                                " ~ " +
                                FORECAST.getDegree(mainWeather.apparentTemperatureMax);
        }
        
        apparentTemp.classList.add("appTemp");
        
        precip.textContent = FORECAST.roundPercentage(mainWeather.precipProbability);
        precip.classList.add("precip");
        wind.textContent = mainWeather.windSpeed;
        wind.classList.add("windSpeed");

        divSummary.appendChild(temp);
        divSummary.appendChild(summary);
        divSummary.appendChild(apparentTemp);
        divSummary.appendChild(precip);
        divSummary.appendChild(wind);
        divContent.appendChild(divSummary);
        weatherBox.appendChild(divContent);

        return weatherBox;
    },
    
    /*hourly weather*/
    createHourlyWeather : function(hourly, nFirst, nLast){
        let divHourly = document.createElement("div");
        divHourly.classList.add("hourly");
        for (let i = nFirst; i <= nLast; i++){

            let item = hourly.data[i];
            let weatherBox = document.createElement("div");
            let dateTime = new Date(item.time*1000);
            let dateHour = dateTime.toLocaleTimeString('en-CA',{hour: 'numeric', hour12: true}); //hour with AM/PM
            weatherBox.classList.add("weather");
            weatherBox.classList.add("time"+dateHour.replace(" ",""));

            //header
            let header = document.createElement("div");
            let temperature = document.createElement("h2");
            let hour = document.createElement("spam");
            header.classList.add("header");

            //header - icon
            let divIconHeader = document.createElement("div");
            let iconHeader = document.createElement("i");
            iconHeader.classList.add("wi");
            iconHeader.classList.add(FORECAST.getIconValue(item.icon));
            divIconHeader.classList.add("icon");
            divIconHeader.appendChild(iconHeader);
            header.appendChild(divIconHeader);

            //header - hour
            temperature.textContent = FORECAST.getDegree(item.temperature);
            hour.textContent = dateHour; //hour with AM/PM

            header.appendChild(temperature);
            header.appendChild(hour);
            weatherBox.appendChild(header);

            //content
            let content = document.createElement("div");
            content.classList.add("content");

            //icon
            let divIcon = document.createElement("div");
            let icon = document.createElement("i");
            icon.classList.add("wi");
            icon.classList.add(FORECAST.getIconValue(item.icon));
            divIcon.classList.add("icon");
            divIcon.appendChild(icon);
            content.appendChild(divIcon);

            //summary
            let divSummary = document.createElement("div");
            let summary = document.createElement("p");
            let apparentTemp = document.createElement("p");
            let precip = document.createElement("p");

            divSummary.classList.add("summary");
            summary.textContent = item.summary;
            apparentTemp.textContent = FORECAST.getDegree(item.apparentTemperature);
            apparentTemp.classList.add("appTemp");

            precip.textContent = FORECAST.roundPercentage(item.precipProbability);
            precip.classList.add("precip");

            divSummary.appendChild(summary);
            divSummary.appendChild(apparentTemp);
            divSummary.appendChild(precip);
            content.appendChild(divSummary);
            weatherBox.appendChild(content);

            divHourly.appendChild(weatherBox);   
        }
        return divHourly;
    },
    
    /*main function to create the mainContent*/
    buildResponse : function(){
        let body = document.querySelector("body");
        
        //clean mainContent
        while (FORECAST.mainContent.firstChild) {
            FORECAST.mainContent.removeChild(FORECAST.mainContent.firstChild);
        }

        //main weather
        if (FORECAST.today) {
            body.className = FORECAST.jsonData.currently.icon;
            FORECAST.mainContent.appendChild(FORECAST.createMainWeather(FORECAST.jsonData.currently, FORECAST.today));
        } else {
            let i = 0;
            
            //to be sure it is getting the next day
            while (i < FORECAST.jsonData.daily.data.length){
                if (new Date(FORECAST.jsonData.daily.data[i].time*1000).getDay() > new Date().getDay()) {
                    break;
                }
                i++;
            }
            
            body.className = FORECAST.jsonData.daily.data[i].icon;
            FORECAST.mainContent.appendChild(FORECAST.createMainWeather(FORECAST.jsonData.daily.data[i], FORECAST.today));
        }
            
        //next hours
        let divNextHours = document.createElement("div");
        let pNextHour = document.createElement("h3");

        divNextHours.classList.add("nextHours");
        if (FORECAST.today){
            pNextHour.textContent = "Next Hours";
        }else {
            pNextHour.textContent = "Over the Day";
        }
        divNextHours.appendChild(pNextHour);
        FORECAST.mainContent.appendChild(divNextHours);

        //weather hourly
        if (FORECAST.today) {
            FORECAST.mainContent.appendChild(FORECAST.createHourlyWeather(FORECAST.jsonData.hourly, 0, 23));
        }
        else {
            let i = 0;
            
            //to be sure it is getting the next day
            while (i < FORECAST.jsonData.hourly.data.length){
                if (new Date(FORECAST.jsonData.hourly.data[i].time*1000).getDay() > new Date().getDay()) {
                    break;
                }
                i++;
            }
            let max = i+23; //24h
            
            //to not choose an index higher than the length
            if (max >= FORECAST.jsonData.hourly.data.length){
                max = FORECAST.jsonData.hourly.data.length-1;
            }
            
            FORECAST.mainContent.appendChild(FORECAST.createHourlyWeather(FORECAST.jsonData.hourly, i, max));
        }
        
        let main = document.querySelector("main");
        main.appendChild(FORECAST.mainContent);
    },
    
    /*btbDay click event (toogles between today and tomorrow)*/
    btnDayClick : function() {
        let btn = document.getElementById("btnDay");
        
        if (FORECAST.today){ btn.textContent = "Today"; } 
        else{ btn.textContent = "Tomorrow"; }
        
        FORECAST.today = !FORECAST.today;
        
        FORECAST.buildResponse();
    },
    
    /*btbDegrees click event (toggles between Celsius and Fahrenheit)*/
    btnDegreesClick : function() {
        let btn = document.getElementById("btnDegrees");
        
        if (FORECAST.degree == "c"){ 
            btn.textContent = "ºC";
            FORECAST.degree = "f";
        } 
        else{ 
            btn.textContent = "ºF";
            FORECAST.degree = "c";
        }
        
        FORECAST.buildResponse();
    },
    
    /*returns the correct class value to icons*/
    getIconValue : function(apiValue){
        let result;
        switch(apiValue){
            case "clear-day": 
                result = "wi-day-sunny";
                break;
            case "clear-night": 
                result = "wi-night-clear";
                break;
            case "rain": 
                result = "wi-rain";
                break;
            case "snow": 
                result = "wi-snow";
                break;
            case "sleet": 
                result = "wi-sleet";
                break;
            case "wind": 
                result = "wi-windy";
                break;
            case "fog": 
                result = "wi-fog";
                break;
            case "cloudy": 
                result = "wi-cloudy";
                break;
            case "partly-cloudy-day": 
                result = "wi-day-sunny-overcast";
                break;
            case "partly-cloudy-night":
                result = "wi-night-alt-partly-cloudy";
                break;
            default:
                result = "wi-alien";
        }
        return result;
    },

    /*function to round all percentages*/
    roundPercentage : function(apiValue){       
        let result = apiValue*100;
        return result.toFixed(1);
    },
    
    /*retuns the tempeture in Celsius or Fahrenheit*/
    getDegree : function(apiValue){
        let degrees = "";
        apiValue = Math.round(apiValue);
        
        if (FORECAST.degree == "c"){
            degrees = "ºC";
        }else {
            apiValue = (apiValue * 1.8) + 32; //convert to fahrenheit
            apiValue = ( apiValue * 10 ) / 10; //round to 1 character after the decimal 
            degrees = "ºF";
        }
        return apiValue+degrees;
    },
    
    /*returns the current location and calls the forecast*/
    getLocation : function(){
        if( navigator.geolocation ){ 
            let params = {enableHighAccuracy: true, timeout:36000, maximumAge:60000};
            navigator.geolocation.getCurrentPosition(FORECAST.getForecastData, FORECAST.gpsError, params); 
        }
    },
    
    /*calls requestData parsing current position*/
    getForecastData : function(position){ 
        let coordinates = position.coords.latitude + "," + position.coords.longitude;
        //let coordinates = "45.3557993,-75.7219307";
        FORECAST.requestData(coordinates);
        
        //get location name
        let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ coordinates;
        
        fetch(url)  
            .then(function(response){
                return response.json(); 
            })
            .then(function(jsonResponse){
                let adress = document.getElementById("adress");
                if (jsonResponse.status == "OK"){
                    let adressName = jsonResponse.results[0].address_components[2].short_name;
                    if (adressName.indexOf("-") != -1){
                        adressName = adressName.substr(0,adressName.indexOf("-"));
                    }
                    adress.textContent = adressName;
                } else {
                    adress.textContent = "Forecast";
                }
             })
            .catch( function(error){
                let adress = document.getElementById("adress");
                adress.textContent = "Forecast";
                console.log("ERROR-Location Name:",error.message);
        });
        
    },
    
    /*calls requestData for default position*/
    gpsError : function(error){
        console.log("ERROR-Location", error.message);
        FORECAST.requestData(null);
    },
    
    /*request weather data*/
    requestData : function(location){
        let url = "https://riba0007.edumedia.ca/mad9014/weather/forecast.php";
        if (location != null){
            url += "?latlng="+location;    
        }
    
        let headers = new Headers();
        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");

        let options = {
            method: "Get",
            mode: "cors",
            headers: headers
        }

        let req = new Request(url,{method: "Get", options: options});
        fetch(req)  
            .then(function(response){
                return response.json(); 
            })
            .then(function(jsonResponse){
                FORECAST.jsonData = jsonResponse;
             })
            .then(function(){
                FORECAST.buildResponse();    
            })
            .catch( function(err){ 
                while (FORECAST.mainContent.firstChild) {
                    FORECAST.mainContent.removeChild(FORECAST.mainContent.firstChild);
                }
                let adress = document.getElementById("adress");
                adress.textContent = "Weather unavailable";
                
                console.log("ERROR:",err.message);
        });
    },
    
    /*init function*/
    init : function(){
        //init mainContent
        FORECAST.mainContent = document.getElementById("mainContent");
        FORECAST.mainContent.classList.add("main");
        
        //listeners
        document.getElementById("btnDay").addEventListener("click",FORECAST.btnDayClick);
        document.getElementById("btnDegrees").addEventListener("click",FORECAST.btnDegreesClick);
        
        //gps position and request data
        FORECAST.getLocation();
    }
}

document.addEventListener("DOMContentLoaded",FORECAST.init);