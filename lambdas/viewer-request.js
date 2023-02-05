"use strict";

// define source cookie headers
const sourceMainCookie = "X-Source=main";
const sourceTestCookie = "X-Source=test";

// a value used to split traffic between
// different versions of the site
const experimenttraffic = 0.5;

// define request handler
export async function handler(event, context, callback) {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // check for source cookie, leave this out if you want
  // a different version of the site for each request
  //
  // the request should include our x-source cookie along with a uri,
  // the cookie along with the uri are our cache keys, if they exist
  // we forward the request to cloudfront and forget about it
  if (headers.cookie) {
    for (let i = 0; i < headers.cookie.length; i++) {
      // ...ugly but simple enough for now
      if (headers.cookie[i].value.indexOf(sourceMainCookie) >= 0) {
        console.log("found source cookie, forwarding request as is");
        callback(null, request);
        return;
      }
      if (headers.cookie[i].value.indexOf(sourceTestCookie) >= 0) {
        console.log("found source cookie, forwarding request as is");
        callback(null, request);
        return;
      }
    }
  }

  // case for no cookie, okay we need to generate a new cookie and uri
  console.log("source cookie has not been found. throwing dice...");
  const cookie =
    Math.random() < experimenttraffic ? sourceTestCookie : sourceMainCookie;

  console.log(`cookie: ${cookie}`);

  // add cookie
  headers.cookie = headers.cookie || [];
  console.log(`adding cookie header: ${cookie}`);
  headers.cookie.push({ key: "cookie", value: cookie });

  // forwarding request
  callback(null, request);
}
