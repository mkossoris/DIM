import { t } from 'app/i18next-t';
import React, { useState } from 'react';
import BungieImage from '../../dim-ui/BungieImage';
import { D1GridNode, DimItem } from '../../inventory/item-types';
import { AppIcon, plusIcon } from '../../shell/icons';
import LoadoutBucketDropTarget from './LoadoutBuilderDropTarget';
import LoadoutBuilderItem from './LoadoutBuilderItem';
import LoadoutBuilderLocksDialog from './LoadoutBuilderLocksDialog';
import { ArmorTypes, D1ItemWithNormalStats, LockedPerkHash, PerkCombination } from './types';

interface Props {
  type: ArmorTypes;
  lockeditem: D1ItemWithNormalStats | null;
  lockedPerks: { [armorType in ArmorTypes]: LockedPerkHash };
  activePerks: PerkCombination;
  i18nItemNames: { [key: string]: string };
  onRemove({ type }: { type: string }): void;
  onPerkLocked(perk: D1GridNode, type: ArmorTypes, $event: React.MouseEvent): void;
  onItemLocked(item: DimItem): void;
}

export default function LoadoutBuilderLockPerk(
  this: void,
  {
    type,
    lockeditem,
    i18nItemNames,
    activePerks,
    lockedPerks,
    onRemove,
    onPerkLocked,
    onItemLocked,
  }: Props
) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const closeDialog = () => setDialogOpen(false);
  const addPerkClicked = () => setDialogOpen(true);

  const doOnPerkLocked = (perk: D1GridNode, type: ArmorTypes, $event: React.MouseEvent) => {
    closeDialog();
    onPerkLocked(perk, type, $event);
  };

  const firstPerk = lockedPerks[type][Object.keys(lockedPerks[type])[0]];
  const hasLockedPerks = Object.keys(lockedPerks[type]).length > 0;

  return (
    <div className="locked-item">
      <LoadoutBucketDropTarget bucketType={type} onItemLocked={onItemLocked}>
        {lockeditem === null ? (
          <div className="empty-item">
            <div className="perk-addition" onClick={addPerkClicked}>
              {hasLockedPerks ? (
                <div className="locked-perk-notification">
                  <BungieImage src={firstPerk.icon} title={firstPerk.description} />
                </div>
              ) : (
                <div className="perk-addition-text-container">
                  <AppIcon icon={plusIcon} />
                  <small className="perk-addition-text">{t('LB.LockPerk')}</small>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lock-container">
            <LoadoutBuilderItem item={lockeditem} />
            <div className="close" onClick={() => onRemove({ type })} role="button" tabIndex={0} />
          </div>
        )}
        <div className="label">{i18nItemNames[type]}</div>
        {dialogOpen && (
          <LoadoutBuilderLocksDialog
            activePerks={activePerks}
            lockedPerks={lockedPerks}
            type={type}
            onPerkLocked={doOnPerkLocked}
            onClose={closeDialog}
          />
        )}
      </LoadoutBucketDropTarget>
    </div>
  );
}
