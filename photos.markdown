---
layout: page
title: Photos
permalink: /photos/
---

<div class="photo-page">
  <section class="photo-section" aria-label="Photos gallery">
    <div class="photo-section__shell">
      <div class="photo-grid" aria-label="Featured photos">
        {% for photo in site.data.photos %}
        {% include photo-card.html image=photo.image local_image=photo.local_image title=photo.title number=photo.number date=photo.date camera=photo.camera lens=photo.lens settings=photo.settings instagram_url=photo.instagram_url object_position=photo.object_position original_image=photo.original_image local_original_image=photo.local_original_image %}
        {% endfor %}
      </div>
      {% include photo-modal.html %}
    </div>
  </section>
</div>
