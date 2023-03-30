class ImageLoadingHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterRendered(pages) {
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            }),
        ),
    ).then(() => {
      console.log('images finished loading');
    });
  }
}

Paged.registerHandlers(ImageLoadingHandler);
