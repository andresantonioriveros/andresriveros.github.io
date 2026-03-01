---
layout: base
---

<section aria-label="Profile overview">
  <div>
    <h1>{{ site.title }}</h1>
    <p>{{ site.description }}</p>

    <nav aria-label="Social links">
      {%- include social.html -%}
    </nav>
  </div>
</section>
