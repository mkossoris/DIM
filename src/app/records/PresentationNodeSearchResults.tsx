import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { settingsSelector } from 'app/dim-api/selectors';
import { RootState } from 'app/store/types';
import { DestinyProfileResponse } from 'bungie-api-ts/destiny2';
import React from 'react';
import { useSelector } from 'react-redux';
import { DimPresentationNodeSearchResult } from './presentation-nodes';
import PresentationNodeLeaf from './PresentationNodeLeaf';
import PresentationNodeRoot from './PresentationNodeRoot';
import styles from './PresentationNodeSearchResults.m.scss';

export default function PresentationNodeSearchResults({
  searchResults,
  defs,
  ownedItemHashes,
  profileResponse,
}: {
  searchResults: DimPresentationNodeSearchResult[];
  defs: D2ManifestDefinitions;
  ownedItemHashes?: Set<number>;
  profileResponse: DestinyProfileResponse;
}) {
  // TODO: make each node in path linkable

  const completedRecordsHidden = useSelector<RootState, boolean>(
    (state) => settingsSelector(state).completedRecordsHidden
  );
  const redactedRecordsRevealed = useSelector<RootState, boolean>(
    (state) => settingsSelector(state).redactedRecordsRevealed
  );

  return (
    <div>
      {searchResults.map((sr) => (
        <div key={sr.path.map((p) => p.nodeDef.hash).join('.')}>
          <ul className={styles.path}>
            {sr.path.map(
              (p, index) =>
                index > 0 && <li key={p.nodeDef.hash}>{p.nodeDef.displayProperties.name}</li>
            )}
          </ul>
          <div>
            {!sr.collectibles &&
              !sr.records &&
              !sr.metrics &&
              (() => {
                const node = sr.path[sr.path.length - 1];
                return node.childPresentationNodes ? (
                  <PresentationNodeRoot
                    presentationNodeHash={node.nodeDef.hash}
                    defs={defs}
                    ownedItemHashes={ownedItemHashes}
                    profileResponse={profileResponse}
                  />
                ) : (
                  <PresentationNodeLeaf
                    node={node}
                    defs={defs}
                    ownedItemHashes={ownedItemHashes}
                    completedRecordsHidden={completedRecordsHidden}
                    redactedRecordsRevealed={redactedRecordsRevealed}
                  />
                );
              })()}
            <PresentationNodeLeaf
              node={sr}
              defs={defs}
              ownedItemHashes={ownedItemHashes}
              completedRecordsHidden={completedRecordsHidden}
              redactedRecordsRevealed={redactedRecordsRevealed}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
