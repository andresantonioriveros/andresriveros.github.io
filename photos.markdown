---
layout: page
title: Photos
permalink: /photos/
---

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<div class="photo-page">
  <section class="photo-section" aria-label="Photos gallery">
    <div class="photo-section__shell">
      <div class="photo-tabs" role="tablist" aria-label="Photos view">
        <button role="tab" class="photo-tabs__tab is-active" aria-selected="true" aria-controls="photo-grid-panel" id="photo-grid-tab" data-tab="grid" aria-label="Grid view">
          <i class="fa-solid fa-grip" aria-hidden="true"></i>
          <span class="photo-tabs__label">Grid</span>
        </button>
        <button role="tab" class="photo-tabs__tab" aria-selected="false" aria-controls="photo-map-panel" id="photo-map-tab" data-tab="map" aria-label="Map view">
          <i class="fa-regular fa-map" aria-hidden="true"></i>
          <span class="photo-tabs__label">Map</span>
        </button>
      </div>
      <div id="photo-grid-panel" role="tabpanel" aria-labelledby="photo-grid-tab" class="photo-tabs__panel is-active">
        <div class="photo-grid" aria-label="Featured photos">
          {% for photo in site.data.photos %}
          {% include photo-card.html image=photo.image local_image=photo.local_image title=photo.title number=photo.number date=photo.date camera=photo.camera lens=photo.lens settings=photo.settings instagram_url=photo.instagram_url object_position=photo.object_position original_image=photo.original_image local_original_image=photo.local_original_image lat=photo.lat lon=photo.lon %}
          {% endfor %}
        </div>
      </div>
      <div id="photo-map-panel" role="tabpanel" aria-labelledby="photo-map-tab" class="photo-tabs__panel" hidden>
        <div id="photo-map" class="photo-map"></div>
      </div>
    </div>
  </section>
</div>

{% include photo-map-popup-template.html %}

<script>
(() => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.photo-tabs__panel')];
  const mapPanel = document.getElementById('photo-map-panel');
  const photoTriggers = [...document.querySelectorAll('[data-photo-trigger]')];
  const popupTemplate = document.getElementById('photo-map-popup-template');
  let photoMap;

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
    if (!popupTemplate) return '';

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

  if (mapPanel) {
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
  }

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

  function initPhotoMap() {
    const mapEl = document.getElementById('photo-map');
    if (!mapEl || photoMap) return;

    photoMap = L.map('photo-map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(photoMap);

    const bounds = [];

    photoTriggers.forEach((trigger, index) => {
      const lat = parseFloat(trigger.dataset.photoLat);
      const lon = parseFloat(trigger.dataset.photoLon);
      
      if (!isNaN(lat) && !isNaN(lon)) {
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
      }
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

    if (mapPanel && !mapPanel.hidden) refreshMapLayout();
  }

  window.addEventListener('resize', refreshMapLayout);
})();
</script>

{% include photo-modal.html %}
