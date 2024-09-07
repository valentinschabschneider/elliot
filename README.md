<p align="center">
	<img src="docs/logo.svg" alt="elliot logo" height="250px" />
</p>

# Elliot

Elliot is a web service that converts HTML to PDFs with [Paged.js](https://pagedjs.org).

## Demo

Check out the [repo (valentinschabschneider/elliot-demo)](https://github.com/valentinschabschneider/elliot-demo) or the hosted version at https://elliot-demo.pages.dev.

## OpenAPI documentation

View the OpenAPI documentation of the hosted demo at https://elliot.up.railway.app/api or locally via http://localhost:3000/api with your browser.

## Making requests

There are some things you should know before making requests to Elliot.
First of all there are two different ways to generate PDF's. Synchronous (`now`) and asynchronous (`soon`).
In the background they are basically doing the same thing, but the print `now` endpoints wait for the print job to finish and then returns the result.
The print `soon` endpoint returns a job id with whicht you can check the job status and collect the result later.

### Input types

URL's (file paths with the `file://` protocol as well) and raw HTML are supported.

### Output types

Elliot is able to output PDF's and HTML. The HTML output is a kind of preview of what the generated PDF would look like.

## Configuration

### Environment variables

| Name                        | Description                                                                                          | Default |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| REDIS_URL                   | Used for queue management. If not set, print soon feature is unavailable.                            |         |
| API_KEY                     | Highly recomended if not run in a private network.                                                   |         |
| BROWSERLESS_ENDPOINT        | Not strictly required but it will not work without it with the docker image.                         |         |
| MAX_TIMEOUT                 | Maximum amount of miliseconds that the generation should last. Will cancel the request when reached. | 10000   |
| PERSIST_PERIOD              | How long the job result should be persisted in miliseconds if not cleaned up on collect.             | 3600000 |
| ADDITIONAL_SCRIPTS          | Additional js code that will be run in every print. Very useful for handlers.                        | []      |
| HTTP_HEADERS                | HTTP headers that will be set on the get request for the page to be printed.                         | []      |
| CLEANUP_JOB_AFTER_COLLECTED | Clean up the job data after the result has been collected.                                           | false   |
| ENABLE_DASHBOARDS           | Enable the `/api` and `/bull-board` routes.                                                          | false   |
| DEBUG                       | This is passed to pagedjs-cli.                                                                       | false   |

## General info

This project is basically an api wrapper around the [pagedjs-cli](https://gitlab.coko.foundation/pagedjs/pagedjs-cli) package with a few additional tweaks and features.
The main difference is that you can skip the polyfill script injection. This allows you to have the polyfill import + additional handlers inside your HTML.

### Included static files

For your convenience Elliot exposes a view static files that can come in handy (preview styles / handlers / text rendering fixes). You can find them under [/src/static](/src/static) which is also exposed under `/static` when hosted. View the demo sources to see how to use them.

## Contribute

Use the included `.devcontainer` as your dev environment.
