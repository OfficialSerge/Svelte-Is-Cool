"use strict";

// define source cookie headers
const sourceMainCookie = "X-Source=main";
const sourceExperimentCookie = "X-Source=experiment";

// test bucket domain information for requesting origin
const experimentBucketDomain = "myapp-green.s3.us-east-1.amazonaws.com";
const experimentBucketRegion = "us-east-1";

// origin request handler
export function handler(event, context, callback) {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const source = decideSource(headers);

  // if source is test, route request to test
  if (source === sourceExperimentCookie) {
    console.log("Setting Origin to experiment bucket");
    // Specify Origin
    request.origin = {
      s3: {
        authMethod: "none", // set this to none for OAC, "origin-access-identity" for OAI(legacy)
        domainName: experimentBucketDomain,

        // extra settings for OAI (legacy)
        // path: "",
        // region: experimentBucketRegion,
      },
    };

    // Also set Host header to prevent “The request signature we calculated does not match the signature you provided” error
    headers["host"] = [{ key: "host", value: experimentBucketDomain }];
  }
  // No need to change anything if Source was Main or undefined
  // default behavior is to route to main origin so we chillin
  callback(null, request);
}

// Decide source based on source cookie.
function decideSource(headers) {
  // Remember a single cookie header entry may contains multiple cookies
  if (headers.cookie) {
    // ...ugly but simple enough for now
    for (let i = 0; i < headers.cookie.length; i++) {
      if (headers.cookie[i].value.indexOf(sourceExperimentCookie) >= 0) {
        console.log("Experiment Source cookie found");
        return sourceExperimentCookie;
      }
      if (headers.cookie[i].value.indexOf(sourceMainCookie) >= 0) {
        console.log("Main Source cookie found");
        return sourceMainCookie;
      }
    }
  }
  console.log("No Source cookie found (Origin undecided)");
}
