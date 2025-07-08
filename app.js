// ========== 多语言支持 ==========
let currentLang = localStorage.getItem("language") || "en";
const i18n = {
  title: { en: "WorldView", zh: "世界视图", ja: "ワールドビュー" },
  inputPlaceholder: { en: "Enter city name", zh: "输入城市名称", ja: "都市名を入力" },
  search: { en: "Search", zh: "搜索", ja: "検索" },
  useLocation: { en: "📍 Use My Location", zh: "📍 使用当前位置", ja: "📍 現在地を使う" },
  save: { en: "⭐ Save this city", zh: "⭐ 收藏此城市", ja: "⭐ この都市を保存" },
  viewSaved: { en: "📂 View Saved Cities", zh: "📂 查看收藏城市", ja: "📂 保存都市を見る" },
  compare: { en: "🆚 Compare Cities", zh: "🆚 城市对比", ja: "🆚 都市比較" },
  nightMode: { en: "🌙 Toggle Night Mode", zh: "🌙 夜间模式", ja: "🌙 ナイトモード" },
  savedCitiesTitle: { en: "⭐ Saved Cities", zh: "⭐ 收藏城市", ja: "⭐ 保存都市" },
  close: { en: "✖ Close", zh: "✖ 关闭", ja: "✖ 閉じる" },
  cancelCompare: { en: "❌ Cancel Comparison", zh: "❌ 取消比较", ja: "❌ 比較をやめる" },
  footer: { en: "Made by Cai Jiacheng | Hosted on GitHub", zh: "制作：蔡嘉诚 | 托管于GitHub", ja: "作成：蔡嘉誠 | GitHubでホスト中" },
  weatherTitle: { en: "Weather in", zh: "天气：", ja: "天気：" },
  humidity: { en: "Humidity", zh: "湿度", ja: "湿度" },
  temp: { en: "Temperature", zh: "温度", ja: "気温" },
  description: { en: "Description", zh: "天气", ja: "説明" },
  culturalInfo: { en: "Cultural Info", zh: "文化信息", ja: "文化情報" },
  languageLabel: { en: "Official Language(s):", zh: "官方语言：", ja: "公用語：" },
  food: { en: "Famous Food:", zh: "代表食物：", ja: "名物料理：" },
  greeting: { en: "Greeting:", zh: "问候语：", ja: "挨拶：" },
  etiquette: { en: "Etiquette:", zh: "礼仪：", ja: "マナー：" },
  noData: { en: "No data available.", zh: "暂无数据。", ja: "データなし。" }
};

const WEATHER_KEY = "d0c82cf6ceae567537e0079215ab67dd";

// ========== 页面初始化 ==========
window.addEventListener("DOMContentLoaded", () => {
  bindLangSwitch();
  updateAllTexts();
  bindBtnEvents();
  setupTyping();
  hideCompareCards();
  hideLoading();
  initMap();

  // 夜间模式自动切换
  autoNightMode();

  // 支持分享城市自动加载
  const params = new URLSearchParams(window.location.search);
  const cityFromUrl = params.get("city");
  if (cityFromUrl) {
    getWeather(cityFromUrl);
    document.getElementById("cityInput").value = cityFromUrl;
  } else {
    getWeather("Tokyo");
  }

  // 按钮波纹、卡片音效绑定
  setupRippleAndSound();
});

function bindLangSwitch() {
  document.getElementById("langEn").onclick = () => setLanguage("en");
  document.getElementById("langZh").onclick = () => setLanguage("zh");
  document.getElementById("langJa").onclick = () => setLanguage("ja");
}
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);
  updateAllTexts();
  updateCardContents();
  updateCompareCardContents();
  updatePopupTexts();
  setupTyping();
}

function updateAllTexts() {
  document.getElementById("dynamicTitle").innerText = i18n.title[currentLang];
  document.getElementById("cityInput").placeholder = i18n.inputPlaceholder[currentLang];
  document.getElementById("searchBtn").innerText = `🔍 ${i18n.search[currentLang]}`;
  document.getElementById("locationBtn").innerText = i18n.useLocation[currentLang];
  document.getElementById("saveBtn").innerText = i18n.save[currentLang];
  document.getElementById("viewSavedBtn").innerText = i18n.viewSaved[currentLang];
  document.getElementById("compareBtn").innerText = i18n.compare[currentLang];
  document.getElementById("shareBtn").innerText = "🔗 Share This City";
  document.getElementById("nightModeBtn").innerText = i18n.nightMode[currentLang];
  document.getElementById("savedCitiesTitle").innerText = i18n.savedCitiesTitle[currentLang];
  document.getElementById("closeSavedBtn").innerText = i18n.close[currentLang];
  document.getElementById("cancelCompareBtn").innerText = i18n.cancelCompare[currentLang];
  document.getElementById("footerText").innerText = i18n.footer[currentLang];
}
function updatePopupTexts() {
  document.getElementById("savedCitiesTitle").innerText = i18n.savedCitiesTitle[currentLang];
  document.getElementById("closeSavedBtn").innerText = i18n.close[currentLang];
}

function bindBtnEvents() {
  document.getElementById("searchBtn").onclick = () => getWeather();
  document.getElementById("locationBtn").onclick = () => getLocationWeather();
  document.getElementById("saveBtn").onclick = () => saveCurrentCity();
  document.getElementById("viewSavedBtn").onclick = () => showSavedCities();
  document.getElementById("closeSavedBtn").onclick = () => closeSavedCities();
  document.getElementById("compareBtn").onclick = () => compareCities();
  document.getElementById("cancelCompareBtn").onclick = () => cancelCompare();
  document.getElementById("shareBtn").onclick = () => shareCurrentCity();
  document.getElementById("nightModeBtn").onclick = () => toggleNightMode();
}

function setupTyping() {
  document.getElementById("typingText").innerText = i18n.inputPlaceholder[currentLang];
}

// ========== 动态天气背景和粒子 ==========
function setDynamicWeatherBackground(mainWeather) {
  document.body.classList.remove('sunny','rainy','snowy','cloudy','starry');
  let type = 'sunny';
  if (!mainWeather) type = 'sunny';
  else if (/cloud/i.test(mainWeather)) type = 'cloudy';
  else if (/rain/i.test(mainWeather)) type = 'rainy';
  else if (/snow/i.test(mainWeather)) type = 'snowy';
  else if (/storm|thunder/i.test(mainWeather)) type = 'rainy';
  else if (/clear|sun/i.test(mainWeather)) type = 'sunny';

  document.body.classList.add(type);
  startParticleEffect(type);
}

let currentParticleType = null;
function startParticleEffect(type) {
  if (currentParticleType === type) return;
  currentParticleType = type;
  window.PARTICLES && window.PARTICLES.stop && window.PARTICLES.stop();

  if (type === 'sunny') sunnyParticles();
  else if (type === 'rainy') rainParticles();
  else if (type === 'snowy') snowParticles();
  else if (type === 'cloudy') cloudParticles();
  else clearParticles();
}

function clearParticles() {
  const c = document.getElementById("particle-canvas");
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  window.PARTICLES = { stop: ()=>{} };
}
function resizeCanvas() {
  const c = document.getElementById("particle-canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function sunnyParticles() {
  const c = document.getElementById("particle-canvas");
  const ctx = c.getContext("2d");
  let particles = [];
  for(let i=0;i<20;i++){
    particles.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      r: 25+Math.random()*15,
      o: 0.18+Math.random()*0.2,
      dx: 0.4+Math.random()*0.5
    });
  }
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    for(let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
      ctx.fillStyle=`rgba(255,255,210,${p.o})`;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#ffe066";
      ctx.fill();
      p.x += p.dx;
      if(p.x > c.width+80) { p.x = -80; p.y = Math.random()*c.height;}
    }
    if(window.PARTICLES && window.PARTICLES.type==='sunny') requestAnimationFrame(draw);
  }
  window.PARTICLES = { type: "sunny", stop: ()=>{window.PARTICLES=null;} };
  draw();
}
function rainParticles() {
  const c = document.getElementById("particle-canvas");
  const ctx = c.getContext("2d");
  let drops = [];
  for(let i=0;i<48;i++){
    drops.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      l: 16+Math.random()*18,
      o: 0.08+Math.random()*0.18,
      speed: 2.4+Math.random()*2.2
    });
  }
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    ctx.save();
    ctx.rotate(0.08);
    for(let p of drops) {
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x,p.y+p.l);
      ctx.strokeStyle=`rgba(122,186,240,${p.o})`;
      ctx.lineWidth=2;
      ctx.stroke();
      p.y += p.speed;
      if(p.y > c.height+24) { p.y = -24; p.x = Math.random()*c.width;}
    }
    ctx.restore();
    if(window.PARTICLES && window.PARTICLES.type==='rainy') requestAnimationFrame(draw);
  }
  window.PARTICLES = { type: "rainy", stop: ()=>{window.PARTICLES=null;} };
  draw();
}
function snowParticles() {
  const c = document.getElementById("particle-canvas");
  const ctx = c.getContext("2d");
  let snows = [];
  for(let i=0;i<38;i++){
    snows.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      r: 3+Math.random()*3,
      o: 0.09+Math.random()*0.12,
      dx: 0.2+Math.random()*0.3,
      dy: 0.7+Math.random()*1.2
    });
  }
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    for(let p of snows) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
      ctx.fillStyle=`rgba(255,255,255,${p.o})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#fff";
      ctx.fill();
      p.x += p.dx*(Math.sin(p.y*0.03));
      p.y += p.dy;
      if(p.y > c.height+8) { p.y = -8; p.x = Math.random()*c.width;}
    }
    if(window.PARTICLES && window.PARTICLES.type==='snowy') requestAnimationFrame(draw);
  }
  window.PARTICLES = { type: "snowy", stop: ()=>{window.PARTICLES=null;} };
  draw();
}
function cloudParticles() {
  clearParticles();
}

// ========== 夜间模式自动切换 ==========
function autoNightMode() {
  const hour = new Date().getHours();
  if (hour >= 19 || hour <= 6) {
    document.body.classList.add("night-mode");
  } else {
    document.body.classList.remove("night-mode");
  }
}
function toggleNightMode() {
  document.body.classList.toggle("night-mode");
}

// ========== 卡片交互音效/按钮波纹 ==========
function playSound(type) {
  let url;
  if (type === "flip") url = "https://cdn.pixabay.com/audio/2022/10/16/audio_12a3e83a48.mp3";
  if (type === "button") url = "https://cdn.pixabay.com/audio/2022/03/15/audio_115b3c4e36.mp3";
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = 0.16;
  audio.play();
}
function setupRippleAndSound() {
  document.body.addEventListener('click', function(e){
    if(e.target.tagName !== "BUTTON") return;
    const btn = e.target;
    const circle = document.createElement("span");
    circle.className = "ripple";
    circle.style.left = (e.offsetX - 10) + "px";
    circle.style.top = (e.offsetY - 10) + "px";
    btn.appendChild(circle);
    setTimeout(()=>circle.remove(),500);
    playSound('button');
  }, false);
  document.getElementById("mainCard").onclick = function() {
    document.getElementById("mainFlip").classList.toggle("flipped");
    playSound('flip');
  };
  document.getElementById("compareFlip1").onclick = function() {
    this.classList.toggle("flipped");
    playSound('flip');
  };
  document.getElementById("compareFlip2").onclick = function() {
    this.classList.toggle("flipped");
    playSound('flip');
  };
}

// ========== 地图 ==========
let map, marker, currentCoords;
function initMap() {
  map = L.map('map').setView([35.6895, 139.6917], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  map.on('click', function(e) {
    getWeatherByCoords(e.latlng.lat, e.latlng.lng);
  });
}
function setMapMarker(lat, lng) {
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng]).addTo(map);
  map.setView([lat, lng], 10);
}

// ========== 天气与文化API ==========
let currentCityInfo = null;
function getWeather(cityName) {
  showLoading();
  if (!cityName) cityName = document.getElementById("cityInput").value || "Tokyo";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_KEY}&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        currentCoords = [data.coord.lat, data.coord.lon];
        setMapMarker(data.coord.lat, data.coord.lon);
        fetchCultureAndRender(cityName, data);
      } else {
        renderMainCard({error: true});
        hideLoading();
      }
    }).catch(() => {
      renderMainCard({error: true});
      hideLoading();
    });
}
function getWeatherByCoords(lat, lng) {
  showLoading();
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        setMapMarker(lat, lng);
        fetchCultureAndRender(data.name, data);
      } else {
        renderMainCard({error: true});
        hideLoading();
      }
    }).catch(() => {
      renderMainCard({error: true});
      hideLoading();
    });
}
function getLocationWeather() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { alert("Location access denied."); hideLoading(); }
    );
  } else {
    alert("Geolocation not supported.");
  }
}
function fetchCultureAndRender(city, weatherData) {
  fetch(`https://restcountries.com/v3.1/alpha/${weatherData.sys.country}`)
    .then(res => res.json())
    .then(countries => {
      let country = countries[0] || {};
      currentCityInfo = {city, weather: weatherData, country};
      renderMainCard({city, weather: weatherData, country});
      hideLoading();
    }).catch(() => {
      renderMainCard({city, weather: weatherData});
      hideLoading();
    });
}

// ========== 卡片内容渲染 ==========
function renderMainCard({city, weather, country, error}) {
  const front = document.getElementById("mainCardFront");
  const back = document.getElementById("mainCardBack");
  if (error) {
    front.innerHTML = `<b>🚫 ${i18n.noData[currentLang]}</b>`;
    back.innerHTML = `<b>🚫 ${i18n.noData[currentLang]}</b>`;
    setDynamicWeatherBackground(null);
    return;
  }
  let weatherEmoji = weather && weather.weather && weather.weather[0] ? getWeatherEmoji(weather.weather[0].main) : "❓";
  front.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:0.4em">${weatherEmoji}</div>
    <div style="font-weight:bold;font-size:1.25rem;">${i18n.weatherTitle[currentLang]} <span style="color:#4b2e1e;">${city}</span></div>
    <div style="margin-top:0.4em;">
      <span style="margin:0 8px;">🌡️ <b>${i18n.temp[currentLang]}:</b> ${Math.round(weather.main.temp)}°C</span>
      <span style="margin:0 8px;">💧 <b>${i18n.humidity[currentLang]}:</b> ${weather.main.humidity}%</span>
    </div>
    <div style="margin-top:0.3em;">☁️ <b>${i18n.description[currentLang]}:</b> ${weather.weather[0].description}</div>
  `;
  back.innerHTML = `
    <div style="font-size:1.2rem;margin-bottom:0.5em;">🎎 <b>${i18n.culturalInfo[currentLang]}</b></div>
    <div style="margin-bottom:0.3em;">🗣️ <b>${i18n.languageLabel[currentLang]}</b> ${(country.languages ? Object.values(country.languages).join(", ") : "-")}</div>
    <div style="margin-bottom:0.3em;">🍽️ <b>${i18n.food[currentLang]}</b> ${country && country.name ? guessFood(country.name.common) : "-"}</div>
    <div style="margin-bottom:0.3em;">🤝 <b>${i18n.greeting[currentLang]}</b> ${countryTranslations[country.cca2]?.[currentLang]?.greeting || "-"}</div>
    <div style="margin-bottom:0.3em;">🎐 <b>${i18n.etiquette[currentLang]}</b> ${countryTranslations[country.cca2]?.[currentLang]?.etiquette || "-"}</div>
  `;
  setDynamicWeatherBackground(weather.weather[0].main);
}

// ========== 城市对比 ==========
let compareCityData = [null, null];
function compareCities() {
  if (!currentCityInfo) return alert("Get a city first!");
  compareCityData[0] = {...currentCityInfo};
  showLoading();
  const city2 = prompt("Enter the city to compare:");
  if (!city2) { hideLoading(); return; }
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city2}&appid=${WEATHER_KEY}&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.cod === 200) {
        fetch(`https://restcountries.com/v3.1/alpha/${data.sys.country}`)
          .then(r => r.json())
          .then(countries => {
            let country = countries[0] || {};
            compareCityData[1] = {
              city: city2,
              weather: data,
              country
            };
            renderCompareCards();
            hideMainCard();
            showCompareCards();
            hideLoading();
          }).catch(() => { hideLoading(); });
      } else {
        hideLoading();
        alert(i18n.noData[currentLang]);
      }
    }).catch(() => { hideLoading(); });
}

function renderCompareCards() {
  for (let i = 0; i < 2; i++) {
    const front = document.getElementById(`compareCard${i + 1}Front`);
    const back = document.getElementById(`compareCard${i + 1}Back`);
    const data = compareCityData[i];
    if (!data) {
      front.innerHTML = i18n.noData[currentLang];
      back.innerHTML = i18n.noData[currentLang];
      continue;
    }
    let weatherEmoji = data.weather && data.weather.weather && data.weather.weather[0] ? getWeatherEmoji(data.weather.weather[0].main) : "❓";
    front.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:0.4em">${weatherEmoji}</div>
      <div style="font-weight:bold;font-size:1.25rem;">${i18n.weatherTitle[currentLang]} <span style="color:#4b2e1e;">${data.city}</span></div>
      <div style="margin-top:0.4em;">
        <span style="margin:0 8px;">🌡️ <b>${i18n.temp[currentLang]}:</b> ${Math.round(data.weather.main.temp)}°C</span>
        <span style="margin:0 8px;">💧 <b>${i18n.humidity[currentLang]}:</b> ${data.weather.main.humidity}%</span>
      </div>
      <div style="margin-top:0.3em;">☁️ <b>${i18n.description[currentLang]}:</b> ${data.weather.weather[0].description}</div>
    `;
    back.innerHTML = `
      <div style="font-size:1.2rem;margin-bottom:0.5em;">🎎 <b>${i18n.culturalInfo[currentLang]}</b></div>
      <div style="margin-bottom:0.3em;">🗣️ <b>${i18n.languageLabel[currentLang]}</b> ${(data.country.languages ? Object.values(data.country.languages).join(", ") : "-")}</div>
      <div style="margin-bottom:0.3em;">🍽️ <b>${i18n.food[currentLang]}</b> ${data.country && data.country.name ? guessFood(data.country.name.common) : "-"}</div>
      <div style="margin-bottom:0.3em;">🤝 <b>${i18n.greeting[currentLang]}</b> ${countryTranslations[data.country.cca2]?.[currentLang]?.greeting || "-"}</div>
      <div style="margin-bottom:0.3em;">🎐 <b>${i18n.etiquette[currentLang]}</b> ${countryTranslations[data.country.cca2]?.[currentLang]?.etiquette || "-"}</div>
    `;
  }
}
function updateCardContents() {
  if (currentCityInfo) renderMainCard(currentCityInfo);
}
function updateCompareCardContents() {
  if (compareCityData[0] && compareCityData[1]) renderCompareCards();
}
function cancelCompare() {
  hideCompareCards();
  showMainCard();
}

// ========== 其它功能 ==========
const countryTranslations = {
  JP: {
    en: { greeting: "Hello (こんにちは Konnichiwa)", etiquette: "Take off shoes indoors" },
    zh: { greeting: "你好（こんにちは）", etiquette: "进屋脱鞋" },
    ja: { greeting: "こんにちは", etiquette: "家に入るとき靴を脱ぐ" }
  },
  CN: {
    en: { greeting: "Hello (你好 Nǐ hǎo)", etiquette: "Respect elders" },
    zh: { greeting: "你好", etiquette: "尊重长辈" },
    ja: { greeting: "ニーハオ", etiquette: "年長者を敬う" }
  }
};

function guessFood(name) {
  if (name === "Japan") return currentLang === "ja" ? "寿司・ラーメン" : currentLang === "zh" ? "寿司，拉面" : "Sushi, Ramen";
  if (name === "China") return currentLang === "ja" ? "餃子・火鍋" : currentLang === "zh" ? "饺子，火锅" : "Dumplings, Hotpot";
  if (name === "France") return currentLang === "ja" ? "パン・ワイン" : currentLang === "zh" ? "面包，红酒" : "Bread, Wine";
  if (name === "United States") return currentLang === "ja" ? "ハンバーガー" : currentLang === "zh" ? "汉堡包" : "Burger";
  return "-";
}

function getWeatherEmoji(main) {
  if (!main) return "❓";
  if (/cloud/i.test(main)) return "⛅️";
  if (/rain/i.test(main)) return "🌧️";
  if (/sun|clear/i.test(main)) return "☀️";
  if (/snow/i.test(main)) return "❄️";
  if (/storm|thunder/i.test(main)) return "⛈️";
  return "🌈";
}

function saveCurrentCity() {
  if (!currentCityInfo || !currentCityInfo.city) return;
  let saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  if (!saved.find(c => c.city === currentCityInfo.city)) {
    saved.push({ ...currentCityInfo, lang: currentLang });
    localStorage.setItem("savedCities", JSON.stringify(saved));
    alert("Saved!");
  } else {
    alert("Already saved.");
  }
}
function showSavedCities() {
  const popup = document.getElementById("savedCitiesPopup");
  const list = document.getElementById("savedCitiesList");
  list.innerHTML = "";
  let saved = JSON.parse(localStorage.getItem("savedCities") || "[]");
  saved.forEach(c => {
    const li = document.createElement("li");
    li.innerText = c.city;
    li.onclick = () => { getWeather(c.city); closeSavedCities(); };
    list.appendChild(li);
  });
  popup.classList.remove("hidden");
}
function closeSavedCities() {
  document.getElementById("savedCitiesPopup").classList.add("hidden");
}
function shareCurrentCity() {
  if (!currentCityInfo || !currentCityInfo.city) {
    alert("No city to share!");
    return;
  }
  const city = currentCityInfo.city;
  const temp = currentCityInfo.weather?.main?.temp;
  const desc = currentCityInfo.weather?.weather?.[0]?.description;
  const url = window.location.origin + window.location.pathname + "?city=" + encodeURIComponent(city);

  const shareText = `🌏 Check out the weather in ${city}!\nTemperature: ${Math.round(temp)}°C\nWeather: ${desc}\n${url}`;

  if (navigator.share) {
    navigator.share({
      title: `Weather in ${city}`,
      text: shareText,
      url: url
    }).catch(()=>{});
  } else {
    copyTextToClipboard(shareText);
    alert("Share content copied! Paste it to your friends.");
  }
}
function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const input = document.createElement("textarea");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}
function showMainCard() {
  document.getElementById("mainCard").style.display = "";
}
function hideMainCard() {
  document.getElementById("mainCard").style.display = "none";
}
function showCompareCards() {
  document.getElementById("compareCards").classList.remove("hidden");
}
function hideCompareCards() {
  document.getElementById("compareCards").classList.add("hidden");
  document.getElementById("compareFlip1").classList.remove("flipped");
  document.getElementById("compareFlip2").classList.remove("flipped");
}
function showLoading() {
  document.getElementById("loadingOverlay").classList.add("active");
}
function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("active");
}
