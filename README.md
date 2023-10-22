<p align="center">
	<img src="docs/logo.svg" alt="elliot logo" height="250px" />
</p>

# Elliot

Elliot is a web service that converts HTML to PDFs with [Paged.js](https://pagedjs.org).

## Demo

Check out the [demo](https://github.com/valentinschabschneider/elliot-demo).

## OpenAPI documentation

View the OpenAPI documentation of the hosted demo at https://elliot.up.railway.app/api or locally via http://localhost:3000/api with your browser.

## Configuration

### Environment variables

| Name                        | Description                                                                                          | Required | Default |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------- |
| REDIS_URL                   | Used for queue management.                                                                           | x        |         |
| NODE_ENV                    | Already set inside the docker image.                                                                 | x        |         |
| SECRET_KEY                  | Highly recomended if not run in a private network.                                                   |          |         |
| BROWSERLESS_ENDPOINT        | Not strictly required but it will not work without it with the docker image.                         |          |         |
| MAX_TIMEOUT                 | Maximum amount of miliseconds that the generation should last. Will cancel the request when reached. |          | 10000   |
| PERSIST_PERIOD              | How long the job result should be persisted in miliseconds                                           |          | 3600000 |
| ADDITIONAL_SCRIPTS          |                                                                                                      |          | []      |
| HTTP_HEADERS                |                                                                                                      |          | []      |
| CLEANUP_JOB_AFTER_COLLECTED |                                                                                                      |          | false   |
| ENABLE_DASHBOARDS           |                                                                                                      |          | false   |
| DEBUG                       |                                                                                                      |          | false   |

## Error handling

Set the header `X-JSON-ERROR-RESPONSE` to recieve errors as a JSON response.

## Contribute

Use the included `.devcontainer` as your dev environment..
