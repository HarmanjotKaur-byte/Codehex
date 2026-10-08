import React from 'react';
import ReactDOMServer from 'react-dom/server';

globalThis.localStorage = {
  getItem: (k) => null,
  setItem: () => {},
  removeItem: () => {}
};

import { LanguageProvider } from './src/context/LanguageContext.jsx';
import NavBar from './src/components/NavBar.jsx';
import Header from './src/components/Header.jsx';

try {
  console.log("Rendering NavBar and Header...");
  ReactDOMServer.renderToString(
    React.createElement(LanguageProvider, null, 
      React.createElement(Header)
    )
  );
  console.log("Header OK");

  ReactDOMServer.renderToString(
    React.createElement(LanguageProvider, null, 
      React.createElement(NavBar, { role: 'FARMER', active: 'dashboard', onChange: () => {} })
    )
  );
  console.log("NavBar OK");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
