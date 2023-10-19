//Weather
const container = document.querySelector('.container');
const search = document.querySelector('.search-container button');
const weatherContainer = document.querySelector('.weather-container');
const weatherDetails = document.querySelector('.weather-details');
const error = document.querySelector('.not-found');
const city = document.querySelector('.search-container input');

search.addEventListener('click', () => {
    const APIKey = '620ec1f2aee8e4f581a6681af29a791e';

    if (city === '') {
        return
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.value}&units=metric&appid=${APIKey}`).then(response => response.json())
        .then(json => {

            if (json.cod === '404') {
                container.style.height = '400px';
                weatherContainer.style.display = 'none';
                weatherDetails.style.display = 'none';
                error.style.display = 'block';
                error.classList.add('fadeIn');
                return;
            }

            error.style.display = 'none';
            error.classList.remove('fadeIn');

            const video = document.querySelector('.background video');
            const image = document.querySelector('.weather-container img');
            const temperature = document.querySelector('.weather-container .temperature');
            const description = document.querySelector('.weather-container .description');
            const humidity = document.querySelector('.weather-details .humidity span');
            const wind = document.querySelector('.weather-details .wind span');

            if (json.weather[0].main === 'Clear') {
                image.src = 'image/clear.png';
                video.style.display = 'block';
                video.src = 'video/clear.mp4';
            } else if (json.weather[0].main === 'Rain') {
                image.src = 'image/rain.png';
                video.style.display = 'block';
                video.src = 'video/rain.mp4'
            } else if (json.weather[0].main === 'Snow') {
                image.src = 'image/snow.png';
                video.style.display = 'block';
                video.src = 'video/snow.mp4';
            } else if (json.weather[0].main === 'Clouds') {
                image.src = 'image/clouds.png';
                video.style.display = 'block';
                video.src = 'video/clouds.mp4';
            } else if (json.weather[0].main === 'Mist') {
                image.src = 'image/haze.png';
                video.style.display = 'block';
                video.src = 'video/haze.mp4';
            } else {
                image.src = '';
                video.style.display = 'none';
                video.src = '';
            }

            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)}km/h`;

            weatherContainer.style.display = '';
            weatherDetails.style.display = '';
            weatherContainer.classList.add('fadeIn');
            weatherDetails.classList.add('fadeIn');
            container.style.height = '590px';
        });
});

//Map
const mapContainer = document.querySelector('.map-container');

apiMapKey = 'sJH69k05GshKgAfgU67VWqEAFNfwDAcg'

var state = {
    center: {
        lat: -8.05428,
        lng: -34.8813
    },
    coordinates: null,
    selectedAddress: null
};

var map = tt.map({
    key: apiMapKey,
    container: 'map',
    center: state.center,
    zoom: 2,
    dragPan: !isMobileOrTablet()
});
var roundLatLng = Formatters.roundLatLng;
map
    .addControl(new tt.FullscreenControl())
    .addControl(new tt.NavigationControl())
    .on('click', function (event) {
        var coordinates = {
            lng: roundLatLng(event.lngLat.lng),
            lat: roundLatLng(event.lngLat.lat)
        };
        state.coordinates = coordinates;
        update(state.coordinates, form.entityType());
    });
function cleanLayers() {
    var previousFillLayer = fillLayerManager.getPreviousLayer();
    if (fillLayerManager.hasLayer(previousFillLayer)) {
        fillLayerManager.removeLayer(previousFillLayer);
    }
    var previousOutlineLayer = outlineLayerManager.getPreviousLayer();
    if (outlineLayerManager.hasLayer(previousOutlineLayer)) {
        outlineLayerManager.removeLayer(previousOutlineLayer);
    }
}
function update(coordinates, selectedEntityType) {
    if (!(coordinates && selectedEntityType)) {
        return;
    }
    loadingHint.setMessage('Carregando');
    marker.setLngLat(coordinates);
    popup.remove()
        .setLngLat(coordinates)
        .setHTML('Carregando...')
        .addTo(map);
    fetchAddress(coordinates, selectedEntityType)
        .then(function (reverseGeocodeResponse) {
            var chosenPlace = reverseGeocodeResponse.addresses[0];
            var freeFormAddress = chosenPlace && chosenPlace.address.freeformAddress;
            if (!freeFormAddress) {
                popup.setHTML('Sem endereço');
                state.selectedAddress = undefined;
                return;
            }
            var geometryId = chosenPlace.dataSources.geometry.id;
            state.selectedAddress = freeFormAddress;
            return Promise.all([
                reverseGeocodeResponse,
                fetchPolygon(geometryId)
            ]);
        })
        .then(function (aggregatedResponse) {
            if (!state.selectedAddress) {
                return cleanLayers();
            }
            var reverseGeocodeResponse = aggregatedResponse[0],
                additionalDataResponse = aggregatedResponse[1];
            var address = reverseGeocodeResponse.addresses[0];
            var boundingBox = address.address.boundingBox;
            var geometryData = additionalDataResponse.additionalData[0].geometryData;
            var geoJSON = geometryData.features[0];
            if (state.selectedAddress === address.address.freeformAddress) {
                if (geoJSON) {
                    var fillLayer = createLayer(geoJSON, 'fill');
                    var outlineLayer = createLayer(geoJSON, 'line');
                    const bBox = new tt.LngLatBounds(boundingBox.southWest, boundingBox.northEast);
                    map.fitBounds(bBox, { padding: 100, linear: true });
                    var fillLayerPromise = fillLayerManager.updateLayer(fillLayer),
                        outlineLayerPromise = outlineLayerManager.updateLayer(outlineLayer);
                    return Promise.all([fillLayerPromise, outlineLayerPromise])
                        .then(function () {
                            popup.setHTML(address.address.freeformAddress);
                            city.value = address.address.freeformAddress;
                            search.click();
                        });
                } else {
                    popup.setHTML(address.address.freeformAddress );
                    errorHint.setMessage('Não encontrado');
                    cleanLayers();
                }
            }
        })
        .catch(function (error) {
            var message = error;
            if (error.data) {
                message = message.data;
                var re = /<h1>(.*?)<\/h1>/;
                if (re.test(error.data)) {
                    message = re.exec(message)[1];
                }
            } else if (error.message) {
                message = message.message;
            }
            popup.setHTML('Sem endereço');
            errorHint.setMessage(message);
            cleanLayers();
        })
        .finally(function () {
            loadingHint.hide();
        });
}
//-- Fetches
var fetchAddress = function (coordinates, entityType) {
    return tt.services.reverseGeocode({
        key: apiMapKey,
        position: coordinates,
        entityType: entityType,
        language: 'en-GB'
    });
};
var fetchPolygon = function (geometry) {
    return tt.services.additionalData({
        key: apiMapKey,
        geometries: [geometry]
    });
};
/**
 * createLayer
 * @param {object} geoJSON
 * @param {number} geometryZoom
 * @param {string} type
 * @return {object}
 */
var createLayer = function (geoJSON, type) {
    var layerObject = {
        id: geoJSON.id + '|' + type,
        type: type,
        source: {
            type: 'geojson',
            data: geoJSON
        },
        layout: {},
        paint: {}
    };
    if (type === 'line') {
        layerObject.paint['line-color'] = '#004B7F';
        layerObject.paint['line-width'] = 1;
    } else {
        layerObject.paint['fill-color'] = '#ffffff';
        layerObject.paint['fill-opacity'] = 0.25;
    }
    return layerObject;
};
//-- Instances
var fillLayerManager = new LayerManager(map);
var outlineLayerManager = new LayerManager(map);
var form = {
    entityType: function () {
        return document.querySelector('.tt-buttons-group__button.-active').getAttribute('data-id');
    }
};
var marker = (function () {
    var markerElement = document.createElement('div');
    markerElement.className = 'tt-marker -start';
    return new tt.Marker(markerElement)
        .setLngLat(state.center)
        .addTo(map);
})();
var popup = new tt.Popup({ className: 'tt-popup', closeOnClick: false })
    .setLngLat(state.center)
    .setHTML('Clique para obter a localização')
    .addTo(map);
var errorHint = new InfoHint('error', 'bottom-center', 5000)
    .addTo(map.getContainer());
var loadingHint = new InfoHint('info', 'bottom-center', 3000)
    .addTo(map.getContainer());
new Foldable('.js-foldable', 'top-right');
//-- Form
    counterElement = document.querySelector('.tt-counter'),
    buttonGroupElement = document.querySelector('.tt-buttons-group');

var buttonGroup = new ButtonsGroup(buttonGroupElement);
buttonGroup.onSelect(function (target) {
    update(state.coordinates, target.textContent);
});