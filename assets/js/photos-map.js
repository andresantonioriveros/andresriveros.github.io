(() => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.photo-tabs__panel')];
  const mapPanel = document.getElementById('photo-map-panel');
  const photoTriggers = [...document.querySelectorAll('[data-photo-trigger]')];
  const popupTemplate = document.getElementById('photo-map-popup-template');

  if (!tabs.length || !panels.length || !mapPanel || !photoTriggers.length || !popupTemplate || typeof L === 'undefined') {
    return;
  }

  let photoMap;
  let tileLayer;

  const mapThemes = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }
    }
  };

  const currentTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  const setTileTheme = theme => {
    if (!photoMap) return;

    if (tileLayer) photoMap.removeLayer(tileLayer);

    const mapTheme = mapThemes[theme] || mapThemes.dark;
    tileLayer = L.tileLayer(mapTheme.url, mapTheme.options).addTo(photoMap);
  };

  const photoMarkerIcon = L.divIcon({
    className: 'photo-map-marker',
    html: '<span class="photo-map-marker__pin"></span>',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -22]
  });

  const formatPopupDate = value => {
    if (!value) return '';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      year: 'numeric'
    }).format(parsed);
  };

  const refreshMapLayout = () => {
    if (!photoMap) return;

    window.requestAnimationFrame(() => {
      photoMap.invalidateSize({ pan: false });
      window.setTimeout(() => {
        if (photoMap) photoMap.invalidateSize({ pan: false });
      }, 180);
    });
  };

  const buildPopupContent = ({ index, title, src, popupDate }) => {
    const fragment = popupTemplate.content.cloneNode(true);
    const root = fragment.querySelector('.photo-map-popup');
    const image = fragment.querySelector('img');
    const titleEl = fragment.querySelector('.photo-map-popup__title');
    const dateEl = fragment.querySelector('.photo-map-popup__date');

    root.dataset.photoIndex = index;
    root.setAttribute('aria-label', `Open ${title}`);
    image.src = src;
    image.alt = title;
    titleEl.textContent = title;

    if (popupDate) {
      dateEl.textContent = popupDate;
    } else {
      dateEl.hidden = true;
    }

    return root;
  };

  mapPanel.addEventListener('click', event => {
    const closeButton = event.target.closest('[data-photo-map-close]');
    if (closeButton) {
      event.preventDefault();
      if (photoMap) photoMap.closePopup();
      return;
    }

    const preview = event.target.closest('[data-photo-map-open]');
    if (!preview) return;

    const index = Number(preview.dataset.photoIndex);
    const trigger = photoTriggers[index];

    if (!Number.isNaN(index) && trigger) {
      event.preventDefault();
      trigger.click();
    }
  });

  mapPanel.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const preview = event.target.closest('[data-photo-map-open]');
    if (!preview) return;

    const index = Number(preview.dataset.photoIndex);
    const trigger = photoTriggers[index];

    if (!Number.isNaN(index) && trigger) {
      event.preventDefault();
      trigger.click();
    }
  });

  const setActiveTab = target => {
    tabs.forEach(tab => {
      const isActive = tab.dataset.tab === target;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach(panel => {
      const isActive = panel.id === `photo-${target}-panel`;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });

    if (target === 'map') {
      initPhotoMap();
      refreshMapLayout();
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
  });

  const initPhotoMap = () => {
    const mapEl = document.getElementById('photo-map');
    if (!mapEl || photoMap) return;

    photoMap = L.map('photo-map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true
    });

    setTileTheme(currentTheme());

    const bounds = [];

    photoTriggers.forEach((trigger, index) => {
      const lat = parseFloat(trigger.dataset.photoLat);
      const lon = parseFloat(trigger.dataset.photoLon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) return;

      const marker = L.marker([lat, lon], { icon: photoMarkerIcon }).addTo(photoMap);
      const title = trigger.dataset.photoTitle;
      const src = trigger.dataset.photoSrc;
      const popupDate = formatPopupDate(trigger.dataset.photoDate);

      bounds.push([lat, lon]);

      marker.bindPopup(buildPopupContent({ index, title, src, popupDate }), {
        className: 'photo-map-popup-shell',
        offset: [0, -6],
        closeButton: false
      });

      marker.on('popupopen', () => {
        const markerEl = marker.getElement();
        if (markerEl) markerEl.classList.add('is-active');
      });

      marker.on('popupclose', () => {
        const markerEl = marker.getElement();
        if (markerEl) markerEl.classList.remove('is-active');
      });
    });

    if (bounds.length === 1) {
      photoMap.setView(bounds[0], 6);
    } else if (bounds.length > 1) {
      photoMap.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 3
      });
    }

    photoMap.whenReady(refreshMapLayout);

    if (!mapPanel.hidden) refreshMapLayout();
  };

  window.addEventListener('resize', refreshMapLayout);
  window.addEventListener('themechange', event => {
    setTileTheme(event.detail?.theme || currentTheme());
  });
})();
