import { settingsSelector } from 'app/dim-api/selectors';
import { usePopper } from 'app/dim-ui/usePopper';
import { useHotkey } from 'app/hotkeys/useHotkey';
import { t } from 'app/i18next-t';
import { storesSelector } from 'app/inventory/selectors';
import { DimStore } from 'app/inventory/store-types';
import {
  CompareActionButton,
  ConsolidateActionButton,
  DistributeActionButton,
  InfuseActionButton,
  LoadoutActionButton,
  LockActionButton,
  TagActionButton,
} from 'app/item-actions/ActionButtons';
import ItemMoveLocations from 'app/item-actions/ItemMoveLocations';
import DesktopItemActions from 'app/item-popup/DesktopItemActions';
import ItemPopupHeader from 'app/item-popup/ItemPopupHeader';
import { RootState } from 'app/store/types';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { useSubscription } from 'use-subscription';
import ClickOutside from '../dim-ui/ClickOutside';
import Sheet from '../dim-ui/Sheet';
import { DimItem } from '../inventory/item-types';
import { setSetting } from '../settings/actions';
import { hideItemPopup, showItemPopup$ } from './item-popup';
import ItemPopupBody, { ItemPopupTab } from './ItemPopupBody';
import styles from './ItemPopupContainer.m.scss';
import ItemTagHotkeys from './ItemTagHotkeys';

interface ProvidedProps {
  boundarySelector?: string;
}

interface StoreProps {
  isPhonePortrait: boolean;
  itemDetails: boolean;
  stores: DimStore[];
}

function mapStateToProps(state: RootState): StoreProps {
  const settings = settingsSelector(state);
  return {
    stores: storesSelector(state),
    isPhonePortrait: state.shell.isPhonePortrait,
    itemDetails: settings.itemDetails,
  };
}

const mapDispatchToProps = {
  setSetting,
};
type DispatchProps = typeof mapDispatchToProps;

type Props = ProvidedProps & StoreProps & DispatchProps;

const tierClasses: { [key in DimItem['tier']]: string } = {
  Exotic: styles.exotic,
  Legendary: styles.legendary,
  Rare: styles.rare,
  Uncommon: styles.uncommon,
  Common: styles.common,
  Unknown: '',
  Currency: '',
} as const;

/**
 * A container that can show a single item popup/tooltip. This is a
 * single element to help prevent multiple popups from showing at once.
 */
function ItemPopupContainer({ isPhonePortrait, stores, boundarySelector }: Props) {
  const [tab, setTab] = useState(ItemPopupTab.Overview);
  const currentItem = useSubscription(showItemPopup$);
  const onTabChanged = (newTab: ItemPopupTab) => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  const onClose = () => hideItemPopup();

  const { pathname } = useLocation();
  useEffect(() => {
    onClose();
  }, [pathname]);

  const popupRef = useRef<HTMLDivElement>(null);
  usePopper({
    placement: 'right',
    contents: popupRef,
    reference: { current: currentItem?.element || null },
    boundarySelector,
    arrowClassName: styles.arrow,
  });

  useHotkey('esc', t('Hotkey.ClearDialog'), onClose);

  if (!currentItem?.item) {
    return null;
  }

  // Try to find an updated version of the item!
  const item = maybeFindItem(currentItem.item, stores);

  const body = (
    <ItemPopupBody
      item={item}
      key={`body${item.index}`}
      extraInfo={currentItem.extraInfo}
      tab={tab}
      onTabChanged={onTabChanged}
    />
  );

  return isPhonePortrait ? (
    <Sheet
      onClose={onClose}
      header={<ItemPopupHeader item={item} key={`header${item.index}`} />}
      sheetClassName={clsx(
        'item-popup',
        `is-${item.tier}`,
        tierClasses[item.tier],
        styles.movePopupDialog
      )}
      footer={
        <div className={styles.mobileMoveLocations}>
          <ItemMoveLocations key={item.index} item={item} />
        </div>
      }
    >
      <div className={styles.mobileItemActions}>
        <TagActionButton item={item} label={true} hideKeys={true} />
        <LockActionButton item={item} />
        <CompareActionButton item={item} />
        <ConsolidateActionButton item={item} />
        <DistributeActionButton item={item} />
        <LoadoutActionButton item={item} />
        <InfuseActionButton item={item} />
      </div>
      <div className={styles.popupBackground}>{body}</div>
    </Sheet>
  ) : (
    <div
      className={clsx(
        'item-popup',
        styles.movePopupDialog,
        tierClasses[item.tier],
        styles.desktopPopupRoot
      )}
      ref={popupRef}
      role="dialog"
      aria-modal="false"
    >
      <ClickOutside onClickOutside={onClose}>
        <ItemTagHotkeys item={item} />
        <div className={styles.desktopPopup}>
          <div className={clsx(styles.desktopPopupBody, styles.popupBackground)}>
            <ItemPopupHeader item={item} key={`header${item.index}`} />
            {body}
          </div>
          <div className={clsx(styles.desktopActions)}>
            <DesktopItemActions item={item} />
          </div>
        </div>
      </ClickOutside>
      <div className={clsx('arrow', styles.arrow, tierClasses[item.tier])} />
    </div>
  );
}

export default connect<StoreProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ItemPopupContainer);

/**
 * The passed in item may be old - look through stores to try and find a newer version!
 * This helps with items that have objectives, like Pursuits.
 *
 * TODO: This doesn't work for the synthetic items created for Milestones.
 */
function maybeFindItem(item: DimItem, stores: DimStore[]) {
  // Don't worry about non-instanced items
  if (item.id === '0') {
    return item;
  }

  for (const store of stores) {
    for (const storeItem of store.items) {
      if (storeItem.id === item.id) {
        return storeItem;
      }
    }
  }
  // Didn't find it, use what we've got.
  return item;
}
