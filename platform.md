# OpenGameData Software Reference Platform

Below is a list of standard software libraries that make up the **OpenGameData Reference Platform**. This **reference platform** is meant as a *convention* for keeping new development coordinated with respect to the development and deployment environments.

## Justification

The bar for updating a package is relatively low, we only require some simple justification,
e.g. "we need a feature from a newer version to make X better,"
or "the current version is old and nobody uses it anymore,"
or "another library needs a newer version."

In general, we avoid allowing projects to become so oddly-specific as to be tied to a specific package/version. The onus is on us to keep OGD projects running on relatively recent library versions, to keep a low barrier for entry to new collaborators who want to start fresh.

However, any OpenGameData project should avoid using a different version of any of these libraries than what is listed. Instead, ask for a version bump and wait for an update to the platform, so we don’t have incompatibilities pop up at random.

We use this list for GitHub Actions, requirements.txt, and .devcontainer files.
Note: for some libraries, we use .* to indicate any patch version may be used (we only specify patch version for mission-critical dependencies, such as database libraries).

## External Packages Platform

### Python

- Python: 3.12

#### Python Libraries

- gitdb 4.0.*
- GitPython 3.1.*
- flask 2.3.3
- flask-cors 6.0.1
- flask-restful 0.3.10
- Flask-SocketIO 5.3.6
- google-auth 2.16.1
- google-cloud-bigquery 3.19.0
- ipywidgets 8.0.*
- matplotlib 3.9.*
- mysql-connector-python 9.1.0
- numpy 2.1.*
- pandas 2.2.*
- requests 2.32.*
- scikit-learn 1.5.*
- seaborn 0.13.*
- sshtunnel 0.4.0
- statsmodels 0.14.*
- tensorflow 2.17.*

#### Python Build Tools

- build 1.2.*
- setuptools 74.1.*
- setuptools-git-versioning 2.0.*
- twine 5.1.*
- wheel 0.44.*

### JavaScript

- nodejs v18

#### JS Libraries

- @heroicons/
  - react ^2.0.13
- @popperjs/
  - core ^2.11.6
- @tailwindcss/
  - forms ^0.5.3
- @testing-library/
  - jest-dom ^5.16.5
  - react ^13.4.0
  - user-event ^14.4.3
- @types/
  - node ^18.11.18
  - react ^18.0.26
  - react-dom ^18.0.10

- axios ^1.3.4
- bootstrap ^5.2.3
- browser-sync ^2.2.28.3
- c3 ^0.7.20
- chart.js ^4.2.1
- d3 ^7.8.0
- d3-selection-multi ^1.0.1
- gulp ^4.0.2
- gulp-sass ^5.1.0
- jsdoc-typeof-plugin ^1.0.0
- tailwindcss ^3.2.4
- typescript ^4.9.4
- react ^18.2.0
  - react-dom ^18.2.0
  - react-router-dom ^6.6.2
  - react-scripts ^5.0.1
- sass ^1.58.3
- web-vitals ^3.1.0

### LAMP packages

- Apache
  - mod_wsgi
- PHP v.8.1.32
- MariaDB 10.5.29 (compatible with MySQL 15.1)

### GitHub Actions

- actions/checkout@v4
- actions/cache/save@v4
- actions/cache/restore@v4
- actions/upload-artifact@v4
- actions/setup-node@v4.4.0
- actions/setup-python@v5.3
- burnett01/rsync-deployments@7.0.1
- google-github-actions/setup-gcloud@v2.1.4

## OpenGameData Tools & Libraries - Compatible with Platform

The following releases of tools, libraries, and APIs from the OpenGameData community are compatible with the platform version outlined above, and are recommended for use with any projects using this version of the platform:

- Libraries
  - opengamedata-core >= 0.0.14
  - opengamedata-common >= 1.2.0
  - OGDUtils >= 2.1.0
  - APIUtils >= 1.1.0
- Tools
- GitHub Actions
  - opengamedata/actions-openconnect-vpn >= v1.1
  - opengamedata/actions-setup-ogd-py-dependencies >= v1.2
  - opengamedata/actions-setup-ogd-py-build >= v2.0
  - opengamedata/actions-setup-fd-git >= v1.0
