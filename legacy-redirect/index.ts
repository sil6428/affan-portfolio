const DESTINATION = 'https://affan-portfolio-a1n.pages.dev';

export default {
  fetch(request: Request): Response {
    const incoming = new URL(request.url);
    const destination = new URL(DESTINATION);
    destination.pathname = incoming.pathname;
    destination.search = incoming.search;

    return Response.redirect(destination.toString(), 308);
  },
};
