const DESTINATION = 'https://affan-shaikh.pages.dev';

const redirectWorker = {
  fetch(request: Request): Response {
    const incoming = new URL(request.url);
    const destination = new URL(DESTINATION);
    destination.pathname = incoming.pathname;
    destination.search = incoming.search;

    return Response.redirect(destination.toString(), 308);
  },
};

export default redirectWorker;
