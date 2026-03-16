---
layout: page
title: Projects
permalink: /projects/
---

{% assign projects = site.projects | default: empty | sort: "title" %}

{% if projects.size > 0 %}
<ul class="post-list">
  {% for project in projects %}
  <li>
    <h3>
      <a class="post-link" href="{{ project.url | relative_url }}">
        {{ project.title | escape }}
      </a>
    </h3>
    {{ project.excerpt }}
  </li>
  {% endfor %}
</ul>
{% else %}
<p>No projects published yet.</p>
{% endif %}
