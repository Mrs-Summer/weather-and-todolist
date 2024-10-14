'use strict';

/* Weather */
const weather = document.querySelector('.weather');
const btnWeather = document.querySelector('.btn-weather');
btnWeather.addEventListener('click', () => weather.classList.toggle('active'));

const getLocation = function () {
  const storedLocation = localStorage.getItem('location');

  const defaultLocation = {
    name: 'Краснодар',
    latitude: 45.0355,
    longitude: 38.975,
  };

  if (storedLocation) {
    const [latitude, longitude] = storedLocation.split(',').map(Number);
    getWeatherData(latitude, longitude);

    return;
  }

  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

  function successCallback(position) {
    localStorage.setItem(
      'location',
      `${position.coords.latitude}, ${position.coords.longitude}`
    );

    getWeatherData(position.coords.latitude, position.coords.longitude);
  }

  function errorCallback(error) {
    console.warn('Ошибка геолокации:', error.message);

    localStorage.setItem(
      'location',
      `${defaultLocation.latitude}, ${defaultLocation.longitude}`
    );

    getWeatherData(defaultLocation.latitude, defaultLocation.longitude);
  }
};
const getWeatherData = function (latitude, longitude) {
  const requestURL = `https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/forecast/daily?APPID=767a7cce68ed2b3098d41e24364ec56c&lat=${latitude}&lon=${longitude}&lang=ru&cnt=5`;
  fetch(requestURL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          `Произошла ошибка при подключении к API погоды (${response.statusText}).`
        );
      }

      return response.json();
    })
    .then(function (data) {
      displayWeather(data);
    })
    .catch((err) => {
      console.error('Ошибка:', err);
    });
};
const displayWeather = function (weatherData) {
  let weatherIconsMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-hail',
    '10n': 'wi-night-hail',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog',
  };

  const city = weatherData.city.name;
  const temp = `${Math.round(weatherData.list[0].temp.day - 273.15)}`;
  const clouds = `${weatherData.list[0].weather[0].description}`;
  const feelsLike = `${Math.round(
    weatherData.list[0].feels_like.day - 273.15
  )}`;
  const weatherIcon = `${weatherData.list[0].weather[0].icon}`;
  const humidity = `${weatherData.list[0].humidity}`;
  const maxTemp = `${Math.round(weatherData.list[0].temp.max - 273.15)}`;
  const minTemp = `${Math.round(weatherData.list[0].temp.min - 273.15)}`;
  const wind = `${Math.round(weatherData.list[0].speed)}`;

  btnWeather.innerHTML = ` 
      <i class="wi ${weatherIconsMap[weatherIcon]}"></i>
      <div class="degrees">${temp}&deg;C</div>
      <div class="city">${city}</div>`;

  weather.innerHTML = `
      <div class="flex gap-m">
        <div class="flex flex-column gap-m">
          <div class="flex flex-column">
            <div class="city">${city}</div>
            <div class="clouds">${clouds}</div>
          </div>
          <div class="flex flex-row gap-m align-items-center">
            <i class="wi ${weatherIconsMap[weatherIcon]}"></i>
            <div class="degrees">${temp}&deg;C</div>
          </div>
        </div>
        <div class="flex flex-column">
          <div>Ощущается как: ${feelsLike}&deg;C</div>
          <div>Влажность: ${humidity}%</div>
          <div>Ветер: ${wind} м/с</div>
          <div>Макс.: ${maxTemp}&deg;C</div>
          <div>Мин.: ${minTemp}&deg;C</div>
        </div>
      </div>
    `;
};

/* Todo list */
let localStorageTodoList = [];
const todoList = document.querySelector('.todo-list');
const btnTodoList = document.querySelector('.btn-todo-list');
const newTodoListItem_input = document.querySelector('.new-item');
const addTodoListItem_btn = document.querySelector('.add-new-item');
const incompleteListHolder_container =
  document.querySelector('.incomplete-tasks');
const completedListHolder_container =
  document.querySelector('.completed-tasks'); //completed-tasks

const addTodoListItem = function () {
  const listItemValue = newTodoListItem_input.value;
  let maxListItemId =
    localStorageTodoList.map((item) => item.id).sort((a, b) => b - a)[0] + 1 ||
    1;

  if (listItemValue !== '') {
    const listItemHtml = createTodoListItem({
      id: maxListItemId,
      value: listItemValue,
      done: false,
    });
    incompleteListHolder_container.insertAdjacentHTML(
      'beforeend',
      listItemHtml
    );
    const listItem = document.getElementById(`list-item-${maxListItemId}`);
    newTodoListItem_input.value = '';

    localStorageTodoList.push({
      id: maxListItemId,
      value: listItemValue,
      done: false,
    });

    localStorage.setItem('todoList', JSON.stringify(localStorageTodoList));
    bindTodoListItemEvents(listItem);
  }
};
const createTodoListItem = (item) => {
  const listItemHtml = `<div id="list-item-${item.id}" data-id="${
    item.id
  }" class="list-item flex gap-m">
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <label>${item.value}</label>
      <input type="text" value="${item.value}">
      <button class="edit"><i class="fa fa-pencil" aria-hidden="true"></i></button>
      <button class="delete"><i class="fa fa-trash" aria-hidden="true"></i></button>
    </div>`;

  return listItemHtml;
};
const getLocalStorageTodoList = () => {
  if (localStorage.getItem('todoList')) {
    localStorageTodoList = JSON.parse(localStorage.getItem('todoList'));

    if (Object.keys(localStorageTodoList).length > 0) {
      for (let i = 0; i < localStorageTodoList.length; i++) {
        const item = localStorageTodoList[i];
        const listItemHtml = createTodoListItem(item);

        if (item.done) {
          completedListHolder_container.insertAdjacentHTML(
            'beforeend',
            listItemHtml
          );
        } else {
          incompleteListHolder_container.insertAdjacentHTML(
            'beforeend',
            listItemHtml
          );
        }

        const listItem = document.getElementById(`list-item-${item.id}`);

        bindTodoListItemEvents(listItem);
      }
    }
  }
};
const bindTodoListItemEvents = function (taskListItem) {
  const checkBox = taskListItem.querySelector('input[type="checkbox"]');
  const editButton = taskListItem.querySelector('button.edit');
  const deleteButton = taskListItem.querySelector('button.delete');

  checkBox.onchange = checkBoxEventHandler;
  editButton.onclick = editListItem;
  deleteButton.onclick = deleteListItem;
};
const editListItem = function (e) {
  const listItem = this.parentNode;
  const listItemId = Number(listItem.attributes['data-id'].value);
  const editInput = listItem.querySelector('input[type=text]');
  const label = listItem.querySelector('label');
  const containsClass = listItem.classList.contains('editMode');

  if (containsClass) {
    label.innerText = editInput.value;
  } else {
    editInput.value = label.innerText;
  }

  localStorageTodoList = localStorageTodoList.map((item) => {
    if (item.id === Number(listItemId)) {
      item.value = editInput.value;
    }

    return item;
  });

  localStorage.setItem('todoList', JSON.stringify(localStorageTodoList));

  const editButton = e.target.childElementCount
    ? e.target.children[0]
    : e.target;
  if (editButton.classList.contains('fa-check')) {
    editButton.classList.remove('fa-check');
    editButton.classList.add('fa-pencil');
  } else if (editButton.classList.contains('fa-pencil')) {
    editButton.classList.remove('fa-pencil');
    editButton.classList.add('fa-check');
  }

  listItem.classList.toggle('editMode');
};
const deleteListItem = function () {
  const listItem = this.parentNode;
  const parentList = listItem.parentNode;
  const listItemId = Number(listItem.attributes['data-id'].value);

  parentList.removeChild(listItem);

  localStorageTodoList = localStorageTodoList.filter(
    (item) => item.id !== listItemId
  );
  localStorage.setItem('todoList', JSON.stringify(localStorageTodoList));
};
const checkBoxEventHandler = function () {
  const listItem = this.parentNode;
  const listItemId = Number(listItem.attributes['data-id'].value);
  const checkbox = listItem.querySelector('input[type="checkbox"]');

  if (checkbox.checked) {
    completedListHolder_container.appendChild(listItem);
  } else {
    incompleteListHolder_container.appendChild(listItem);
  }

  localStorageTodoList = localStorageTodoList.map((item) => {
    if (item.id === Number(listItemId)) {
      item.done = checkbox.checked;
    }

    return item;
  });

  localStorage.setItem('todoList', JSON.stringify(localStorageTodoList));
};

btnTodoList.addEventListener('click', () =>
  todoList.classList.toggle('active')
);
addTodoListItem_btn.addEventListener('click', addTodoListItem);

/* Day and time */
const dashboard = document.querySelector('.dashboard');
const dayTime = ['bg-night', 'bg-morning', 'bg-afternoon', 'bg-evening'];
const time = document.querySelector('.time');
const date = document.querySelector('.date');

const calcTime = function () {
  const now = new Date();
  const dayMonth = new Intl.DateTimeFormat('ru', {
    month: 'long',
    day: 'numeric',
  }).format(now);

  const weekday = now.toLocaleString('ru-RU', { weekday: 'long' });
  const hour = now.toLocaleString('ru-RU', { hour: 'numeric' });
  const min = now.toLocaleString('ru-RU', { minute: 'numeric' }).padStart(2, 0);
  const sec = `${now.getSeconds()}`.padStart(2, 0);
  const hourNum = Number(hour);

  time.textContent = `${hour}:${min}:${sec} `;
  date.textContent = `${dayMonth}, ${weekday}`;

  if (hourNum >= 0 && hour < 6)
    dashboard.setAttribute('class', `dashboard ${dayTime[0]}`);
  else if (hourNum >= 6 && hour < 12)
    dashboard.setAttribute('class', `dashboard ${dayTime[1]}`);
  else if (hourNum >= 12 && hour < 18)
    dashboard.setAttribute('class', `dashboard ${dayTime[2]}`);
  else if (hourNum >= 18 && hour < 24)
    dashboard.setAttribute('class', `dashboard ${dayTime[3]}`);
};

/* initialise app */

getLocalStorageTodoList();
getLocation();
calcTime();
setInterval(calcTime, 1000);
