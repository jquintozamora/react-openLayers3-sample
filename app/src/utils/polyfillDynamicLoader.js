
// Loading polyfill only when needed: https://philipwalton.com/articles/loading-polyfills-only-when-needed/

//https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL

// Feature detection: 
//  https://addyosmani.com/blog/writing-polyfills/ 
//  https://hacks.mozilla.org/2014/11/an-easier-way-of-using-polyfills/
//  window.Element.prototype.hasOwnProperty('classList')
//  if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

// "URL" in window
// "requestAnimationFrame" in window
// "classList" in window.Element.prototype
// "Promise" in window

// Dynamic polyfill
//   https://github.com/PascalAOMS/dynamic-polyfill


// Support: 
//  http://caniuse.com/#search=lastIndexOf - Not supported IE8


export function browserSupportsAllFeatures(featureString) {

  // Split feature string
  var arrayFeatures = featureString.split(',');

  var supportAllFeatures = true;

  arrayFeatures.forEach( function (item) {
      // Get the feature and the container Object
      var feature = item.substring(item.lastIndexOf('.') + 1);
      var object = "window";
      var tempObject = item.substring(0,item.lastIndexOf('.'));
      if ( tempObject !== "" ) {
        object += "." + tempObject;
      }
      if(feature in eval(object) === false) {
        supportAllFeatures = false;
        return;
      }
  });
  return supportAllFeatures;
}

export function loadScript(src, done) {
  let js = document.createElement('script');
  js.src = src;
  js.onload = function () {
    done();
  };
  js.onerror = function () {
    done(new Error('Failed to load script ' + src));
  };
  document.head.appendChild(js);
}
