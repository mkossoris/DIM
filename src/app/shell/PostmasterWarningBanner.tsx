import { t } from 'app/i18next-t';
import { PullFromPostmaster } from 'app/inventory/PullFromPostmaster';
import { currentStoreSelector } from 'app/inventory/selectors';
import { postmasterAlmostFull, postmasterSpaceUsed, POSTMASTER_SIZE } from 'app/loadout/postmaster';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import styles from './PostmasterWarningBanner.m.scss';
import { isPhonePortraitSelector } from './selectors';

/** Shows a warning anywhere in the app if your active character's postmaster is low. */
export default React.memo(function PostmasterWarningBanner() {
  // if postmaster low on most recent character
  // and we're not on the inventory screen || isPhonePortrait
  // show collect button
  // animate in

  const store = useSelector(currentStoreSelector);

  const isPhonePortrait = useSelector(isPhonePortraitSelector);
  const { pathname } = useLocation();
  const onInventory = pathname.endsWith('inventory');

  // We don't show this on the desktop inventory page, you can already see it.
  if (!store || (!isPhonePortrait && onInventory)) {
    return null;
  }

  const storeIsDestiny2 = store?.destinyVersion === 2;
  const isPostmasterAlmostFull = store && postmasterAlmostFull(store);
  const postMasterSpaceUsed = store ? postmasterSpaceUsed(store) : 0;
  const showPostmasterFull = storeIsDestiny2 && isPostmasterAlmostFull;

  if (!showPostmasterFull) {
    return null;
  }

  const data = {
    number: postMasterSpaceUsed,
    postmasterSize: POSTMASTER_SIZE,
  };

  const text =
    postMasterSpaceUsed < POSTMASTER_SIZE
      ? t('PostmasterWarningBanner.PostmasterAlmostFull', data)
      : t('PostmasterWarningBanner.PostmasterFull', data);

  return (
    <div className={clsx(styles.banner)}>
      <PullFromPostmaster store={store} />
      <span>{text}</span>
    </div>
  );
});
