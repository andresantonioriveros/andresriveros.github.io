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
<script src="{{ '/assets/js/photos-map.js' | relative_url }}" defer></script>

{% include photo-modal.html %}
