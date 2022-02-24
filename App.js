/**
 * App
 */
import React, {useEffect, useState} from 'react';
import {Provider, useDispatch} from 'react-redux';
import configureStore from './src/redux/store';
import * as userActions from './src/redux/actions/userInfo';
import Navigator from './src/navigation';
import {DefaultLanguage, setI18nConfig, strings} from './src/i18n';
import {LocalizationProvider} from './src/i18n/translations';
import {PersistGate} from 'redux-persist/integration/react';
import {loadLanguageCode, saveLanguage} from './src/utils/storage';
import {isNonEmptyString} from './src/utils/helper';
import FlashMessage from 'react-native-flash-message';
import {snackBarstyle} from './src/utils/styles/snackBar';
import NetInfo from '@react-native-community/netinfo';
import {SnackBar, HideSnackBar} from './src/components/snackBar';
import RNRestart from 'react-native-restart';
import {SCREEN_ORIENTATION_PORTRAIT} from './src/utils/constants/constants';

// Store
const {store, persistor} = configureStore();

/**
 * 
 * @returns
 */
function App() {
  const [loadUi, setLoadUi] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const _setNavigationRef = () => {};
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      userActions.actionZoomGalleryLastOrientPortrait({
        orient: SCREEN_ORIENTATION_PORTRAIT,
      }),
    );
    const getAppConfig = async () => {
      const userLanguage = await loadLanguageCode();
      const lang = isNonEmptyString(userLanguage)
        ? userLanguage
        : DefaultLanguage;
      setI18nConfig(lang);
      await saveLanguage(lang);
      setLoadUi(true);
      if (!userLanguage) {
        setTimeout(() => {
          RNRestart.Restart();
        }, 100);
      }
    };
    getAppConfig();
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    return () => {
      // Unsubscribe to network state updates
      unsubscribeNetInfo();
    };
  }, [setIsOnline]);

  useEffect(() => {
    if (!isOnline && loadUi) {
      SnackBar(strings('app.nointernet'), 4, strings('app.nointernetDesc'));
    } else if (isOnline) {
      HideSnackBar();
    }
  }, [isOnline, loadUi]);

  return (
    <>
      {loadUi && <Navigator setNavigationRef={_setNavigationRef} />}
      <FlashMessage position="top" titleStyle={snackBarstyle.flash} />
    </>
  );
}

const RootWrapper = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocalizationProvider>
          <App />
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootWrapper;
