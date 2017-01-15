
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

// 

// Support: 
//  http://caniuse.com/#search=lastIndexOf - Not supported IE8


// Good programming with featureString: https://github.com/Financial-Times/polyfill-service/blob/master/service/PolyfillSet.js


function getDescendantProp(obj, desc) {
  var arr = desc.split(".");
  while (arr.length) {
    var name = arr.shift();
    //console.log('obj: ' + obj + ', name: ' + name);
    if (name in obj) {
      obj = obj[name];
    } else {
      console.warn('[browserSupportsAllFeatures] - ' +obj + ' has not ' + name + " property.");
      return undefined;
    }
  }
  return obj;
}

export function browserSupportsAllFeatures(featureString) {

  // Split feature string
  var arrayFeatures = featureString.split(',');

  var supportAllFeatures = true;

  arrayFeatures.forEach(function (item) {
    // Get the feature and the container Object
    var featureString = item.substring(item.lastIndexOf('.') + 1);
    var objectString = item.substring(0, item.lastIndexOf('.'));

    // Use property accessors intead using eval
    //  eval: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
    //  property accessors: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_Accessors
    // if(feature in eval(object) === false) {
    //   supportAllFeatures = false;
    //   return;
    // }
    var object = getDescendantProp(window, objectString);
    if (object !== undefined) {
      if (featureString in object === false) {
        supportAllFeatures = false;
        return;
      }
    } else {
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
