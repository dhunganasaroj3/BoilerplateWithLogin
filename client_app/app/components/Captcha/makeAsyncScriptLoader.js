/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';

const SCRIPT_MAP = new Map();

// A counter used to generate a unique id for each component that uses the function
let idCount = 0;

const makeAsyncScript = (Component, scriptURL, options = {}) => {
  const wrappedComponentName = Component.displayName || Component.name || 'Component';
  class AsyncScriptLoader extends React.Component {
    state = {};
    componentDidMount() {
      const key = this.asyncScriptLoaderGetScriptLoaderID();
      const { globalName, callbackName } = options;
      if (globalName && typeof window[globalName] !== 'undefined') {
        SCRIPT_MAP.set(scriptURL, { loaded: true, observers: new Map() });
      }

      if (SCRIPT_MAP.has(scriptURL)) {
        const entry = SCRIPT_MAP.get(scriptURL);
        if (entry && (entry.loaded || entry.errored)) {
          this.asyncScriptLoaderHandleLoad(entry);
          return;
        }
        entry.observers.set(key, (e) => this.asyncScriptLoaderHandleLoad(e));
        return;
      }

      const observers = new Map();
      observers.set(key, (entry) => this.asyncScriptLoaderHandleLoad(entry));
      SCRIPT_MAP.set(scriptURL, {
        loaded: false,
        observers,
      });

      const script = document.createElement('script');

      script.src = scriptURL;
      script.async = 1;

      const callObserverFuncAndRemoveObserver = (func) => {
        if (SCRIPT_MAP.has(scriptURL)) {
          const mapEntry = SCRIPT_MAP.get(scriptURL);
          const observersMap = mapEntry.observers;
          for (const [obsKey, observer] of observersMap) { // eslint-disable-line no-restricted-syntax
            if (func(observer)) {
              observersMap.delete(obsKey);
            }
          }
        }
      };

      if (callbackName && typeof window !== 'undefined') {
        window[callbackName] = AsyncScriptLoader.asyncScriptLoaderTriggerOnScriptLoaded;
      }

      script.onload = () => {
        const mapEntry = SCRIPT_MAP.get(scriptURL);
        if (mapEntry) {
          mapEntry.loaded = true;
          callObserverFuncAndRemoveObserver((observer) => {
            if (callbackName) {
              return false;
            }
            observer(mapEntry);
            return true;
          });
        }
      };
      script.onerror = () => {
        const mapEntry = SCRIPT_MAP.get(scriptURL);
        if (mapEntry) {
          mapEntry.errored = true;
          callObserverFuncAndRemoveObserver((observer) => {
            observer(mapEntry);
            return true;
          });
        }
      };

      // (old) MSIE browsers may call "onreadystatechange" instead of "onload"
      script.onreadystatechange = () => {
        if (this.readyState === 'loaded') {
          // wait for other events, then call onload if default onload hadn't been called
          window.setTimeout(() => {
            const mapEntry = SCRIPT_MAP.get(scriptURL);
            if (mapEntry && mapEntry.loaded !== true) {
              script.onload();
            }
          }, 0);
        }
      };

      document.body.appendChild(script);
    }
    componentWillUnmount() {
      // Remove tag script
      if (options.removeOnUnmount === true) {
        const allScripts = document.getElementsByTagName('script');
        for (let i = 0; i < allScripts.length; i += 1) {
          if (allScripts[i].src.indexOf(scriptURL) > -1) {
            if (allScripts[i].parentNode) {
              allScripts[i].parentNode.removeChild(allScripts[i]);
            }
          }
        }
      }
      // Clean the observer entry
      const mapEntry = SCRIPT_MAP.get(scriptURL);
      if (mapEntry) {
        mapEntry.observers.delete(this.asyncScriptLoaderGetScriptLoaderID());
        if (options.removeOnUnmount === true) {
          SCRIPT_MAP.delete(scriptURL);
        }
      }
    }

    getComponent = () => this.childComponent;
    asyncScriptLoaderGetScriptLoaderID = () => {
      if (!this.__scriptLoaderID) {
        this.__scriptLoaderID = `async-script-loader-${idCount}`;
        idCount += 1;
      }
      return this.__scriptLoaderID;
    };
    asyncScriptLoaderHandleLoad = (state) => {
      this.setState(state, this.props.asyncScriptOnLoad);
    };
    render() {
      const globalName = options.globalName;
      const { asyncScriptOnLoad, ...childProps } = this.props;
      if (globalName && typeof window !== 'undefined') {
        childProps[globalName] = typeof window[globalName] !== 'undefined' ? window[globalName] : undefined;
      }
      return <Component ref={(comp) => { this.childComponent = comp; }} {...childProps} />;
    }
  }
  AsyncScriptLoader.displayName = `AsyncScriptLoader(${wrappedComponentName})`;
  AsyncScriptLoader.propTypes = {
    asyncScriptOnLoad: PropTypes.func,
  };
  AsyncScriptLoader.asyncScriptLoaderTriggerOnScriptLoaded = function () { // eslint-disable-line func-names
    const mapEntry = SCRIPT_MAP.get(scriptURL);
    if (!mapEntry || !mapEntry.loaded) {
      throw new Error('Script is not loaded.');
    }
    for (const observer of mapEntry.observers.values()) { // eslint-disable-line no-restricted-syntax
      observer(mapEntry);
    }
    delete window[options.callbackName];
  };

  if (options.exposeFuncs) {
    for (const funcToExpose of options.exposeFuncs) { // eslint-disable-line no-restricted-syntax
      /* eslint-disable no-loop-func */
      AsyncScriptLoader.prototype[funcToExpose] = function () { // eslint-disable-line func-names
        return this.getComponent()[funcToExpose](...arguments); // eslint-disable-line prefer-rest-params
      };
      /* eslint-enable no-loop-func */
    }
  }
  return AsyncScriptLoader;
};

export default makeAsyncScript;
