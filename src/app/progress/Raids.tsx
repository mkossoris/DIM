import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { DimStore } from 'app/inventory/store-types';
import { RAID_ACTIVITY_TYPE_HASH, RAID_MILESTONE_HASHES } from 'app/search/d2-known-values';
import { DestinyMilestone, DestinyProfileResponse } from 'bungie-api-ts/destiny2';
import _ from 'lodash';
import React from 'react';
import { Raid } from './Raid';

/**
 * Displays all of the raids available to a user as milestones
 * reverses raid release order for maximum relevance first
 */
export default function Raids({
  store,
  defs,
  profileInfo,
}: {
  store: DimStore;
  defs: D2ManifestDefinitions;
  profileInfo: DestinyProfileResponse;
}) {
  const profileMilestoneData = profileInfo?.characterProgressions?.data?.[store.id]?.milestones;
  const allMilestones: DestinyMilestone[] = profileMilestoneData
    ? Object.values(profileMilestoneData)
    : [];

  // filter to milestones with child activities that are raids
  const filteredMilestones = allMilestones.filter((milestone) => {
    const milestoneActivities = defs.Milestone.get(milestone.milestoneHash).activities;
    return (
      RAID_MILESTONE_HASHES.includes(milestone.milestoneHash) ||
      milestoneActivities?.some(
        (activity) =>
          defs.Activity.get(activity.activityHash)?.activityTypeHash === RAID_ACTIVITY_TYPE_HASH
        // prefer to use DestinyActivityModeType.Raid, but it appears inconsistently in activity defs
      )
    );
  });

  const raids = _.sortBy(filteredMilestones, (f) => f.order);

  return (
    <div className="progress-for-character" key={store.id}>
      {raids.map((raid) => (
        <Raid raid={raid} defs={defs} key={raid.milestoneHash} />
      ))}
    </div>
  );
}
