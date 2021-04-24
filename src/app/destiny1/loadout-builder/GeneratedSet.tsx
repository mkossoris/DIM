import { t } from 'app/i18next-t';
import { applyLoadout } from 'app/loadout/loadout-apply';
import { Loadout } from 'app/loadout/loadout-types';
import { editLoadout } from 'app/loadout/LoadoutDrawer';
import D1CharacterStats from 'app/store-stats/D1CharacterStats';
import _ from 'lodash';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { D1Item } from '../../inventory/item-types';
import { DimStore } from '../../inventory/store-types';
import ItemTalentGrid from '../../item-popup/ItemTalentGrid';
import { convertToLoadoutItem, newLoadout } from '../../loadout/loadout-utils';
import { AppIcon, faMinusSquare, faPlusSquare } from '../../shell/icons';
import './loadout-builder.scss';
import LoadoutBuilderItem from './LoadoutBuilderItem';
import { ArmorSet, SetType } from './types';

interface Props {
  store: DimStore;
  setType: SetType;
  activesets: string;
  excludeItem(item: D1Item): void;
}

export default function GeneratedSet({ setType, store, activesets, excludeItem }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const dispatch = useDispatch();

  const toggle = () => setCollapsed((collapsed) => !collapsed);

  const makeLoadoutFromSet = (set: ArmorSet): Loadout => {
    const items = Object.values(
      _.pick(set.armor, 'Helmet', 'Chest', 'Gauntlets', 'Leg', 'ClassItem', 'Ghost', 'Artifact')
    ).map((si) => si.item);

    const loadout = newLoadout(
      '',
      items.map((i) => convertToLoadoutItem(i, true))
    );
    loadout.classType = store.classType;
    return loadout;
  };

  const makeNewLoadout = (set: ArmorSet) => {
    editLoadout(makeLoadoutFromSet(set), {
      showClass: false,
    });
  };
  const equipItems = (set: ArmorSet) =>
    dispatch(applyLoadout(store, makeLoadoutFromSet(set), true));

  return (
    <div key={setType.set.setHash} className="section loadout">
      <div className="loadout-builder-controls">
        {setType.set.includesVendorItems ? (
          <span>{t('LB.ContainsVendorItems')}</span>
        ) : (
          <>
            <span className="dim-button" onClick={() => makeNewLoadout(setType.set)}>
              {t('Loadouts.Create')}
            </span>
            <span className="dim-button equip-button" onClick={() => equipItems(setType.set)}>
              {t('LB.Equip', { character: store.name })}
            </span>
          </>
        )}{' '}
        <div className="dim-stats">
          <D1CharacterStats stats={setType.tiers[activesets].stats} />
        </div>
      </div>
      <div className="loadout-builder-section">
        {_.map(setType.set.armor, (armorpiece, type) => (
          <div key={type} className="set-item">
            <LoadoutBuilderItem shiftClickCallback={excludeItem} item={armorpiece.item} />
            <div className="smaller">
              <ItemTalentGrid item={armorpiece.item} perksOnly={true} />
            </div>
            <div className="label">
              <small>
                {setType.tiers[activesets].configs[0][armorpiece.item.type] === 'int'
                  ? t('Stats.Intellect')
                  : setType.tiers[activesets].configs[0][armorpiece.item.type] === 'dis'
                  ? t('Stats.Discipline')
                  : setType.tiers[activesets].configs[0][armorpiece.item.type] === 'str'
                  ? t('Stats.Strength')
                  : t('Stats.NoBonus')}
              </small>
            </div>
            {setType.tiers[activesets].configs.map(
              (config, i) =>
                i > 0 &&
                !collapsed && (
                  <div key={i} className="other-configs">
                    <small>
                      {config[armorpiece.item.type] === 'int'
                        ? t('Stats.Intellect')
                        : config[armorpiece.item.type] === 'dis'
                        ? t('Stats.Discipline')
                        : config[armorpiece.item.type] === 'str'
                        ? t('Stats.Strength')
                        : t('Stats.NoBonus')}
                    </small>
                  </div>
                )
            )}
          </div>
        ))}
      </div>
      {setType.tiers[activesets].configs.length > 1 && (
        <div className="expand-configs" onClick={toggle}>
          {!collapsed ? (
            <div>
              <span title={t('LB.HideConfigs')}>
                <AppIcon icon={faMinusSquare} />
              </span>{' '}
              {t('LB.HideAllConfigs')}
            </div>
          ) : (
            <div>
              <span title={t('LB.ShowConfigs')}>
                <AppIcon icon={faPlusSquare} />
              </span>{' '}
              {t('LB.ShowAllConfigs')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
