import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { settingsSelector } from 'app/dim-api/selectors';
import BungieImage from 'app/dim-ui/BungieImage';
import { armorStats } from 'app/search/d2-known-values';
import { RootState } from 'app/store/types';
import { DestinyClass, DestinyStatDefinition } from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import React, { ReactElement, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSetting } from '../settings/actions';
import styles from './CustomStatTotal.m.scss';

export type StatHashListsKeyedByDestinyClass = Record<number, number[]>;

export function StatTotalToggle({
  forClass = DestinyClass.Unknown,
  readOnly = false,
  className,
}: {
  className?: string;
  forClass?: DestinyClass;
  readOnly?: boolean;
}) {
  const defs = useSelector<RootState, D2ManifestDefinitions | undefined>(
    (state) => state.manifest.d2Manifest
  );
  const customTotalStatsByClass = useSelector<RootState, StatHashListsKeyedByDestinyClass>(
    (state) => settingsSelector(state).customTotalStatsByClass
  );
  const dispatch = useDispatch();

  const toggleStat = (statHash: number) => {
    dispatch(
      setSetting('customTotalStatsByClass', {
        ...customTotalStatsByClass,
        ...{
          [forClass]: toggleArrayElement(statHash, customTotalStatsByClass[forClass] ?? []),
        },
      })
    );
  };

  const activeStats = customTotalStatsByClass[forClass]?.length
    ? customTotalStatsByClass[forClass]
    : [];

  if (!defs) {
    return null;
  }
  return (
    <div className={clsx(className)}>
      {addDividers(
        [
          { className: 'activeStatLabels', includesCheck: true },
          { className: 'inactiveStatLabels', includesCheck: false },
        ].map(({ className, includesCheck }) => (
          <span
            key={className}
            className={clsx(styles[className], { [styles.readOnly]: readOnly })}
          >
            {addDividers(
              armorStats
                .filter((statHash) => activeStats.includes(statHash) === includesCheck)
                .map((statHash) => (
                  <StatToggleButton
                    key={statHash}
                    stat={defs.Stat.get(statHash)}
                    toggleStat={toggleStat}
                    readOnly={readOnly}
                  />
                )),
              <span className={styles.divider} />
            )}
          </span>
        )),
        <span className={styles.divider} />
      )}
    </div>
  );
}

/**
 * this check shouldn't be necessary :|
 * maybe it isn't if we're just hardcoding armor stats
 */
function StatToggleButton({
  stat,
  toggleStat,
  readOnly = false,
}: {
  stat: DestinyStatDefinition;
  toggleStat: (statHash: number) => void;
  readOnly: boolean;
}) {
  return (
    <span
      onClick={
        !readOnly
          ? (e) => {
              e.stopPropagation();
              toggleStat(stat.hash);
            }
          : undefined
      }
      role="button"
    >
      {stat.displayProperties.hasIcon ? (
        <span title={stat.displayProperties.name} className={styles.inlineStatIcon}>
          <BungieImage src={stat.displayProperties.icon} />
        </span>
      ) : (
        stat.displayProperties.name
      )}
    </span>
  );
}

/** adds missing, or removes existing, element in arr */
function toggleArrayElement<T>(element: T, arr: T[]) {
  return arr.includes(element) ? arr.filter((v) => v !== element) : arr.concat(element);
}

/** places a divider between each element of arr */
function addDividers<T extends React.ReactNode>(arr: T[], divider: ReactElement): ReactNode[] {
  return arr
    .flatMap((e, index) => [e, React.cloneElement(divider, { key: `divider-${index}` })])
    .slice(0, -1);
}
