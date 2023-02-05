"use strict";

// define source cookie headers
const sourceMainCookie = "X-Source=main";
const sourceTestCookie = "X-Source=test";

// define response handler
export function handler(event, context, callback) {
  const request = event.Records[0].cf.request;
  const requestHeaders = request.headers;
  const response = event.Records[0].cf.response;

  // Look for Source cookie
  // A single cookie header entry may contains multiple cookies, so it looks for a partial match
  if (requestHeaders.cookie) {
    for (let i = 0; i < requestHeaders.cookie.length; i++) {
      // ...ugly but simple enough for now
      if (requestHeaders.cookie[i].value.indexOf(sourceTestCookie) >= 0) {
        console.log("Experiment Source cookie found");
        setCacheBehavior(response, sourceTestCookie);
        callback(null, response);
        return;
      }
      if (requestHeaders.cookie[i].value.indexOf(sourceMainCookie) >= 0) {
        console.log("Main Source cookie found");
        setCacheBehavior(response, sourceMainCookie);
        callback(null, response);
        return;
      }
    }
  }

  // If request contains no Source cookie, do nothing and forward the response as-is
  console.log("No Source cookie found");
  callback(null, response);
}

// Add set-cookie header
function setCacheBehavior(response, cookie) {
  console.log(`Cache behavior based off of cookie ${cookie}`);
  response.headers["set-cookie"] = [{ key: "Set-Cookie", value: cookie }];
}
