(function (global) {
  if (global.FormBuilderSDK && !global.FormBuilderSDK.__isProxyLoader) {
    return;
  }

  var sdkReadyPromise = null;
  var realSDK = null;
  var baseUrl = resolveBaseUrl();

  function resolveBaseUrl() {
    var scriptUrl = "";

    if (document.currentScript && document.currentScript.src) {
      scriptUrl = document.currentScript.src;
    } else {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i -= 1) {
        var src = scripts[i] && scripts[i].src ? scripts[i].src : "";
        if (src && src.indexOf("formbuilder-sdk.js") !== -1) {
          scriptUrl = src;
          break;
        }
      }
    }

    if (!scriptUrl) {
      return global.location.origin + "/";
    }

    return scriptUrl.replace(/\/[^/]*$/, "/");
  }

  function stripLeadingSlash(path) {
    return String(path || "").replace(/^\//, "");
  }

  function loadStylesheet(href) {
    if (!href) return;
    if (document.querySelector('link[data-formbuilder-sdk-css="' + href + '"]')) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-formbuilder-sdk-css", href);
    document.head.appendChild(link);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (!src) {
        reject(new Error("Missing SDK script URL"));
        return;
      }

      if (global.FormBuilderSDK && !global.FormBuilderSDK.__isProxyLoader) {
        resolve(global.FormBuilderSDK);
        return;
      }

      if (document.querySelector('script[data-formbuilder-sdk-js="' + src + '"]')) {
        var existing = document.querySelector('script[data-formbuilder-sdk-js="' + src + '"]');
        if (existing && existing.getAttribute("data-loaded") === "true" && global.FormBuilderSDK && !global.FormBuilderSDK.__isProxyLoader) {
          resolve(global.FormBuilderSDK);
          return;
        }
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.defer = false;
      script.setAttribute("data-formbuilder-sdk-js", src);
      script.onload = function () {
        script.setAttribute("data-loaded", "true");
        resolve(global.FormBuilderSDK);
      };
      script.onerror = function () {
        reject(new Error("Failed to load FormBuilder SDK bundle: " + src));
      };
      document.head.appendChild(script);
    });
  }

  async function ensureLoaded() {
    if (realSDK && !realSDK.__isProxyLoader) {
      return realSDK;
    }

    if (!sdkReadyPromise) {
      sdkReadyPromise = (async function () {
        var manifest = null;

        try {
          var manifestResponse = await fetch(baseUrl + "asset-manifest.json", { cache: "no-store" });
          if (manifestResponse.ok) {
            manifest = await manifestResponse.json();
          }
        } catch (error) {
          manifest = null;
        }

        if (manifest && manifest.files && manifest.files["main.js"]) {
          var mainCss = manifest.files["main.css"] || "";
          var mainJs = manifest.files["main.js"];
          loadStylesheet(mainCss ? baseUrl + stripLeadingSlash(mainCss) : "");
          await loadScript(baseUrl + stripLeadingSlash(mainJs));
        } else {
          await loadScript(baseUrl + "static/js/bundle.js");
        }

        realSDK = global.FormBuilderSDK;
        if (!realSDK || realSDK.__isProxyLoader) {
          throw new Error("FormBuilder SDK did not initialize correctly");
        }

        return realSDK;
      })();
    }

    return sdkReadyPromise;
  }

  function createDeferredInstance(target, options) {
    var instance = {
      __target: target,
      __options: Object.assign({}, options || {}),
      __destroyed: false,
      __instance: null,
      update: function (nextOptions) {
        if (instance.__destroyed) return instance;
        instance.__options = Object.assign({}, instance.__options, nextOptions || {});
        if (instance.__instance && typeof instance.__instance.update === "function") {
          instance.__instance.update(nextOptions || {});
        }
        return instance;
      },
      destroy: function () {
        instance.__destroyed = true;
        if (instance.__instance && typeof instance.__instance.destroy === "function") {
          instance.__instance.destroy();
        }
      },
      __bind: function (mountedInstance) {
        if (instance.__destroyed) {
          if (mountedInstance && typeof mountedInstance.destroy === "function") {
            mountedInstance.destroy();
          }
          return;
        }

        instance.__instance = mountedInstance;
        if (mountedInstance && instance.__options && typeof mountedInstance.update === "function") {
          mountedInstance.update(instance.__options);
        }
      },
    };

    return instance;
  }

  function mount(target, options) {
    var deferredInstance = createDeferredInstance(target, options);

    ensureLoaded()
      .then(function (sdk) {
        if (!sdk || deferredInstance.__destroyed) {
          return;
        }

        var mounted = sdk.mount(target, deferredInstance.__options || {});
        deferredInstance.__bind(mounted);
      })
      .catch(function (error) {
        console.error("FormBuilder SDK bootstrap failed:", error);
      });

    return deferredInstance;
  }

  function render(target, options) {
    return mount(target, options);
  }

  function unmount(target) {
    return ensureLoaded().then(function (sdk) {
      if (sdk && typeof sdk.unmount === "function") {
        return sdk.unmount(target);
      }
      return undefined;
    });
  }

  function loadSchema(schemaUrl, requestOptions) {
    return ensureLoaded().then(function (sdk) {
      if (!sdk || typeof sdk.loadSchema !== "function") {
        throw new Error("FormBuilder SDK is not ready");
      }
      return sdk.loadSchema(schemaUrl, requestOptions || {});
    });
  }

  function buildShareUrl(baseUrlValue, formId, queryParam) {
    return ensureLoaded().then(function (sdk) {
      if (!sdk || typeof sdk.buildShareUrl !== "function") {
        throw new Error("FormBuilder SDK is not ready");
      }
      return sdk.buildShareUrl(baseUrlValue, formId, queryParam);
    });
  }

  function createQrCodeDataUrl(text, options) {
    return ensureLoaded().then(function (sdk) {
      if (!sdk || typeof sdk.createQrCodeDataUrl !== "function") {
        throw new Error("FormBuilder SDK is not ready");
      }
      return sdk.createQrCodeDataUrl(text, options || {});
    });
  }

  function createShareArtifacts(options) {
    return ensureLoaded().then(function (sdk) {
      if (!sdk || typeof sdk.createShareArtifacts !== "function") {
        throw new Error("FormBuilder SDK is not ready");
      }
      return sdk.createShareArtifacts(options || {});
    });
  }

  var FormBuilderSDK = {
    __isProxyLoader: true,
    mount: mount,
    render: render,
    unmount: unmount,
    loadSchema: loadSchema,
    buildShareUrl: buildShareUrl,
    createQrCodeDataUrl: createQrCodeDataUrl,
    createShareArtifacts: createShareArtifacts,
    whenReady: ensureLoaded,
  };

  global.FormBuilderSDK = FormBuilderSDK;
})(window);
