async function getWeatherData() {
    const apiUrl = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-065';
    const authorization = 'CWA-716C81E0-A44B-4EE8-87ED-F98C8D407220';
 
    
    const url = `${apiUrl}?Authorization=${authorization}`;

    try {
        console.log('正在從以下 URL 獲取天氣數據:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('收到的數據:', JSON.stringify(data, null, 2));

        if (data.success === "true") {
            const weatherElements = data.records.locations[0].location[0].weatherElement;
            console.log('天氣元素:', weatherElements);

            const temperature = weatherElements.find(el => el.elementName === 'T');
            const weatherDescription = weatherElements.find(el => el.elementName === 'Wx');
            const rainProbability = weatherElements.find(el => el.elementName === 'PoP12h');

            if (!temperature || !weatherDescription || !rainProbability) {
                throw new Error('無法找到所需的天氣元素');
            }

            // 獲取當前時間的預報
            const currentTime = new Date();
            const forecast = temperature.time[0];  // 使用第一個預報時間

            return {
                temp: forecast.elementValue[0].value,
                description: weatherDescription.time[0].elementValue[0].value,
                rainProb: rainProbability.time[0]?.elementValue[0].value || '無資料',
                startTime: forecast.startTime,
                endTime: forecast.endTime
            };
        } else {
            throw new Error('API 返回失敗狀態');
        }
    } catch (error) {
        console.error('獲取天氣數據時出錯:', error);
        throw error;
    }
}

function displayWeather(weatherData) {
    console.log('顯示天氣數據:', weatherData);
    const weatherForecast = document.getElementById('weather-forecast');
    if (!weatherForecast) {
        console.error('找不到 weather-forecast 元素');
        return;
    }

    const weatherIcon = getWeatherIcon(weatherData.description);

    const weatherHtml = `
        <div class="weather-card">
            <div class="weather-icon">${weatherIcon}</div>
            <div class="weather-info">
                <h3>高雄天氣預報</h3>
                <p class="weather-description">${weatherData.description}</p>
                <p class="temperature">${weatherData.temp}°C</p>
                <p class="rain-probability">降雨機率: ${weatherData.rainProb}%</p>
            </div>
            <p class="forecast-time">${new Date(weatherData.startTime).toLocaleString().split(' ')[0]}</p>
        </div>
    `;

    weatherForecast.innerHTML = weatherHtml;
}

function getWeatherIcon(description) {
    // 這裡可以根據不同的天氣描述返回不同的圖標
    // 這只是一個簡單的示例，你可以根據需要擴展它
    if (description.includes('晴')) return '☀️';
    if (description.includes('雨')) return '🌧️';
    if (description.includes('雲')) return '☁️';
    return '🌤️';  // 默認圖標
}

document.addEventListener('DOMContentLoaded', async function() {
    const weatherForecast = document.getElementById('weather-forecast');
    if (!weatherForecast) {
        console.error('找不到 weather-forecast 元素');
        return;
    }

    try {
        console.log('DOM 已加載，正在獲取天氣數據...');
        const weatherData = await getWeatherData();
        console.log('收到天氣數據:', weatherData);
        displayWeather(weatherData);
    } catch (error) {
        console.error('獲取或顯示天氣數據時出錯:', error);
        weatherForecast.innerHTML = '無法獲取天氣預報數據';
    }
});