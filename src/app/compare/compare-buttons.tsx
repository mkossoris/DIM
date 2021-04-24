import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import ElementIcon from 'app/dim-ui/ElementIcon';
import { t } from 'app/i18next-t';
import { DimItem } from 'app/inventory/item-types';
import {
  getItemDamageShortName,
  getItemSpecialtyModSlotDisplayNames,
  getSpecialtySocketMetadatas,
} from 'app/utils/item-utils';
import { getWeaponArchetype } from 'app/utils/socket-utils';
import { DamageType } from 'bungie-api-ts/destiny2';
import { BucketHashes, StatHashes } from 'data/d2/generated-enums';
import _ from 'lodash';
import React from 'react';

/** A definition for a button on the top of the compare too, which can be clicked to show the given items. */
export interface CompareButton {
  buttonLabel: React.ReactNode;
  /** The query that results in this list of items */
  query: string;
}

/**
 * Generate possible comparisons for armor, given a reference item.
 */
export function findSimilarArmors(
  defs: D2ManifestDefinitions | undefined,
  exampleItem: DimItem
): CompareButton[] {
  const exampleItemElementIcon = <ElementIcon key={exampleItem.id} element={exampleItem.element} />;
  const exampleItemModSlotMetadatas = getSpecialtySocketMetadatas(exampleItem);
  const specialtyModSlotNames = defs && getItemSpecialtyModSlotDisplayNames(exampleItem, defs);

  let comparisonSets: CompareButton[] = _.compact([
    // same slot on the same class
    {
      buttonLabel: exampleItem.typeName,
      query: '', // since we already filter by itemCategoryHash, an empty query gives you all items matching that category
    },

    // above but also has to be armor 2.0
    exampleItem.destinyVersion === 2 && {
      buttonLabel: [t('Compare.Armor2'), exampleItem.typeName].join(' + '),
      query: 'is:armor2.0',
    },

    // above but also the same seasonal mod slot, if it has one
    exampleItem.destinyVersion === 2 &&
      exampleItem.element &&
      exampleItemModSlotMetadatas && {
        buttonLabel: specialtyModSlotNames?.join(' + '),
        query: `is:armor2.0 ${exampleItemModSlotMetadatas
          .map((m) => `modslot:${m.slotTag || 'none'}`)
          .join(' ')}`,
      },

    // armor 2.0 and needs to match energy capacity element
    exampleItem.destinyVersion === 2 &&
      exampleItem.element && {
        buttonLabel: [exampleItemElementIcon, exampleItem.typeName],
        query: `is:armor2.0 is:${getItemDamageShortName(exampleItem)}`,
      },

    // above but also the same seasonal mod slot, if it has one
    exampleItem.destinyVersion === 2 &&
      exampleItem.element &&
      exampleItemModSlotMetadatas && {
        buttonLabel: [exampleItemElementIcon, specialtyModSlotNames?.join(' + ')],
        query: `is:armor2.0 is:${getItemDamageShortName(
          exampleItem
        )} ${exampleItemModSlotMetadatas.map((m) => `modslot:${m.slotTag || 'none'}`).join(' ')}`,
      },

    // basically stuff with the same name & categories
    {
      buttonLabel: exampleItem.name,
      // TODO: I'm gonna get in trouble for this but I think it should just match on name which includes reissues. The old logic used dupeID which is more discriminating.
      query: `name:"${exampleItem.name}"`,
    },

    // above, but also needs to match energy capacity element
    exampleItem.element && {
      buttonLabel: [exampleItemElementIcon, exampleItem.name],
      query: `name:"${exampleItem.name}" is:${getItemDamageShortName(exampleItem)}`,
    },
  ]);

  comparisonSets = comparisonSets.reverse();
  return comparisonSets;
}

const bucketToSearch = {
  [BucketHashes.KineticWeapons]: `is:kinetic`,
  [BucketHashes.EnergyWeapons]: `is:energy`,
  [BucketHashes.PowerWeapons]: `is:heavy`,
};

// stuff for looking up weapon archetypes
const getRpm = (i: DimItem) => {
  const itemRpmStat = i.stats?.find(
    (s) =>
      s.statHash === (i.destinyVersion === 1 ? i.stats![0].statHash : StatHashes.RoundsPerMinute)
  );
  return itemRpmStat?.value || -99999999;
};

/**
 * Generate possible comparisons for weapons, given a reference item.
 */
export function findSimilarWeapons(exampleItem: DimItem): CompareButton[] {
  const intrinsic = getWeaponArchetype(exampleItem);
  const intrinsicName = intrinsic?.displayProperties.name || t('Compare.Archetype');
  const adeptStripped = exampleItem.name.replace(new RegExp(t('Filter.Adept'), 'gi'), '').trim();

  let comparisonSets: CompareButton[] = _.compact([
    // same weapon type
    {
      // TODO: replace typeName with a lookup of itemCategoryHash
      buttonLabel: exampleItem.typeName,
      query: '', // since we already filter by itemCategoryHash, an empty query gives you all items matching that category
    },

    // above, but also same (kinetic/energy/heavy) slot
    {
      buttonLabel: [exampleItem.bucket.name, exampleItem.typeName].join(' + '),
      query: bucketToSearch[exampleItem.bucket.hash],
    },

    // same weapon type plus matching intrinsic (rpm+impact..... ish)
    {
      buttonLabel: [intrinsicName, exampleItem.typeName].join(' + '),
      query:
        exampleItem.destinyVersion === 2 && intrinsic
          ? // TODO: add a search by perk hash? It'd be slightly different than searching by name
            `perkname:"${intrinsic.displayProperties.name}"`
          : `stat:rpm:${getRpm(exampleItem)}`,
    },

    // same weapon type and also matching element (& usually same-slot because same element)
    exampleItem.element &&
      // Don't bother with this for kinetic, since we also have "kinetic slot" as an option
      exampleItem.element.enumValue !== DamageType.Kinetic && {
        buttonLabel: [
          <ElementIcon key={exampleItem.id} element={exampleItem.element} />,
          exampleItem.typeName,
        ],
        query: `is:${getItemDamageShortName(exampleItem)}`,
      },

    // exact same weapon, judging by name. might span multiple expansions.
    {
      buttonLabel: adeptStripped,
      query: `name:"${adeptStripped}"`,
    },
  ]);

  comparisonSets = comparisonSets.reverse();
  return comparisonSets;
}
/**
 * Generate possible comparisons for non-armor/weapon, given a reference item
 */
export function defaultComparisons(exampleItem: DimItem): CompareButton[] {
  let comparisonSets: CompareButton[] = _.compact([
    // same item type
    {
      // TODO: replace typeName with a lookup of itemCategoryHash
      buttonLabel: exampleItem.typeName,
      query: '', // since we already filter by itemCategoryHash, an empty query gives you all items matching that category
    },

    // exact same item, judging by name. might span multiple expansions.
    {
      buttonLabel: exampleItem.name,
      query: `name:"${exampleItem.name}"`,
    },
  ]);

  comparisonSets = comparisonSets.reverse();
  return comparisonSets;
}
