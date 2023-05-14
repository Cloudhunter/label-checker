import React from 'react';
import { AppProps } from 'next/app';

import '../css/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
