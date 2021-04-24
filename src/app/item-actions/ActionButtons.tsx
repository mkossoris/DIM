import { addCompareItem } from 'app/compare/actions';
import { t } from 'app/i18next-t';
import { showInfuse } from 'app/infuse/infuse';
import { DimItem } from 'app/inventory/item-types';
import { consolidate, distribute } from 'app/inventory/move-item';
import { sortedStoresSelector } from 'app/inventory/selectors';
import { amountOfItem, getStore } from 'app/inventory/stores-helpers';
import ActionButton from 'app/item-actions/ActionButton';
import LockButton from 'app/item-actions/LockButton';
import { hideItemPopup } from 'app/item-popup/item-popup';
import ItemTagSelector from 'app/item-popup/ItemTagSelector';
import { addItemToLoadout } from 'app/loadout/LoadoutDrawer';
import { addIcon, AppIcon, compareIcon } from 'app/shell/icons';
import { itemCanBeInLoadout } from 'app/utils/item-utils';
import clsx from 'clsx';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import arrowsIn from '../../images/arrows-in.png';
import arrowsOut from '../../images/arrows-out.png';
import d2Infuse from '../../images/d2infuse.png';
import styles from './ActionButton.m.scss';

interface ActionButtonProps {
  item: DimItem;
  label?: boolean;
}

export function CompareActionButton({ item, label }: ActionButtonProps) {
  const dispatch = useDispatch();

  const openCompare = () => {
    hideItemPopup();
    dispatch(addCompareItem(item));
  };

  if (!item.comparable) {
    return null;
  }

  return (
    <ActionButton onClick={openCompare}>
      <AppIcon icon={compareIcon} />
      {label && <span className={styles.label}>{t('Compare.Button')}</span>}
    </ActionButton>
  );
}

export function LockActionButton({ item, label }: ActionButtonProps) {
  if (!item.lockable && !item.trackable) {
    return null;
  }

  const type = item.lockable ? 'lock' : 'track';
  const title =
    type === 'lock'
      ? item.locked
        ? t('MovePopup.LockUnlock.Locked')
        : t('MovePopup.LockUnlock.Unlocked')
      : item.tracked
      ? t('MovePopup.TrackUntrack.Tracked')
      : t('MovePopup.TrackUntrack.Untracked');

  return (
    <LockButton className={styles.actionButton} item={item} type={type}>
      {label && <span className={styles.label}>{title}</span>}
    </LockButton>
  );
}

export function TagActionButton({
  item,
  label,
  hideKeys,
}: ActionButtonProps & { hideKeys?: boolean }) {
  if (!item.taggable) {
    return null;
  }

  return (
    <div
      className={clsx(styles.entry, {
        [styles.tagSelectorLabelHidden]: !label,
      })}
    >
      <ItemTagSelector item={item} hideButtonLabel={!label} hideKeys={hideKeys} />
    </div>
  );
}

export function ConsolidateActionButton({ item, label }: ActionButtonProps) {
  const stores = useSelector(sortedStoresSelector);
  const owner = getStore(stores, item.owner);
  const dispatch = useDispatch();

  if (!owner) {
    return null;
  }

  const canConsolidate =
    !item.notransfer &&
    item.location.hasTransferDestination &&
    item.maxStackSize > 1 &&
    stores.some((s) => s !== owner && amountOfItem(s, item) > 0);

  if (!canConsolidate) {
    return null;
  }

  const dispatchConsolidate = () => {
    if (owner) {
      dispatch(consolidate(item, owner));
      hideItemPopup();
    }
  };

  return (
    <ActionButton onClick={dispatchConsolidate}>
      <img src={arrowsIn} />
      {label && <span className={styles.label}>{t('MovePopup.Consolidate')}</span>}
    </ActionButton>
  );
}

export function DistributeActionButton({ item, label }: ActionButtonProps) {
  const dispatch = useDispatch();
  const canDistribute = item.destinyVersion === 1 && !item.notransfer && item.maxStackSize > 1;

  if (!canDistribute) {
    return null;
  }

  const dispatchDistribute = () => {
    dispatch(distribute(item));
    hideItemPopup();
  };

  return (
    <ActionButton onClick={dispatchDistribute}>
      <img src={arrowsOut} />
      {label && <span className={styles.label}>{t('MovePopup.DistributeEvenly')}</span>}
    </ActionButton>
  );
}

export function InfuseActionButton({ item, label }: ActionButtonProps) {
  if (!item.infusionFuel || item.owner === 'unknown') {
    return null;
  }

  const infuse = () => {
    showInfuse(item);
    hideItemPopup();
  };

  return (
    <ActionButton onClick={infuse}>
      <img src={d2Infuse} />
      {label && <span className={styles.label}>{t('MovePopup.Infuse')}</span>}
    </ActionButton>
  );
}

export function LoadoutActionButton({ item, label }: ActionButtonProps) {
  if (!itemCanBeInLoadout(item) || item.owner === 'unknown') {
    return null;
  }
  const addToLoadout = (e) => {
    hideItemPopup();
    addItemToLoadout(item, e);
  };

  return (
    <ActionButton onClick={addToLoadout}>
      <AppIcon icon={addIcon} />
      {label && <span className={styles.label}>{t('MovePopup.AddToLoadout')}</span>}
    </ActionButton>
  );
}
