# Chart publication

Pushes to main and published releases deploy the themed Nuxt chart at https://stratigraphy.org/chart/.
Manual runs are also supported. Pull requests build without deploying.
Keep Settings → Pages configured for GitHub Actions; branch publishing would remove the archive.

The original published static chart is pinned at ead96618bc233d50ad5a7b9b4465b0b20af4c4a7.
The assembly script serves it under /chart/old/, rebasing local assets and its former /chart-data/ URLs.
The archived chart retains its original data and application bundle.

The shared ICS navigation, title, banner, colours and footer live in chart-ui/components and assets.
Theme styles are scoped to the page shell; chart colours, controls, data and print styles are retained.
Build with pnpm 10.28.2 in chart-ui, using the frozen lockfile and NUXT_APP_BASE_URL=/chart/.

Release events retain the PDF-generation workflow and supply the current chart artifact.
Run the archive tests with:

    ruby scripts/test_assemble_sites.rb
