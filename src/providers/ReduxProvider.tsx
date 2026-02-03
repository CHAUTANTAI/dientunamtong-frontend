'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from '@/store';

interface Props {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <ConfigProvider>{children}</ConfigProvider>
    </Provider>
  );
}
