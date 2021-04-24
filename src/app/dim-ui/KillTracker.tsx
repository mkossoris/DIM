import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { KillTracker } from 'app/utils/item-utils';
import React from 'react';
import BungieImage from './BungieImage';

/**
 * this renders an objective image, optionally a text label, then a kill count
 *
 * unfortunately class names can't be passed between sass modules because.... because they decided they can't.
 *
 * so this accepts a single className, and it contains 1 <img>, some label text, and 1 <span> (the kill count).
 * style appropriately for the component's environment, using that knowledge.
 */
export function KillTrackerInfo({
  tracker,
  showTextLabel,
  defs,
  className,
}: {
  tracker: KillTracker;
  showTextLabel?: boolean;
  defs: D2ManifestDefinitions;
  className?: string;
}) {
  const killTrackerObjective =
    (tracker.trackerDef.objectives &&
      defs.Objective.get(tracker.trackerDef.objectives.objectiveHashes[0])) ||
    null;

  return (
    killTrackerObjective && (
      <div className={className}>
        {<BungieImage src={killTrackerObjective.displayProperties.icon} />}{' '}
        {showTextLabel && killTrackerObjective.progressDescription}{' '}
        <span>{tracker.count.toLocaleString()}</span>
      </div>
    )
  );
}
