class RelativeToAbsoluteStaticFilesHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterRendered(pages) {
    Array.from(document.images).forEach((img) => {
      img.src = img.src; // yeah thats it... img.src always returns the absolute url
    });
    Array.from(document.styleSheets).forEach((styleSheet) => {
      styleSheet.ownerNode.href = styleSheet.ownerNode.href; // same here
    });
  }
}

Paged.registerHandlers(RelativeToAbsoluteStaticFilesHandler);
