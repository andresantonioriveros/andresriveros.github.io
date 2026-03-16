---
layout: page
title: Projects
permalink: /projects/
---

## Projects

I'm putting together a dedicated project archive for the site.

{% assign projects = site.projects | sort: "title" %}

{% if projects.size > 0 %}
{% for project in projects %}
- [{{ project.title }}]({{ project.url | relative_url }})
{% endfor %}
{% else %}
No projects published yet.
{% endif %}
