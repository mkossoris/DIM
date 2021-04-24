import ShowPageLoading from 'app/dim-ui/ShowPageLoading';
import { t } from 'app/i18next-t';
import { useLoadStores } from 'app/inventory/store/hooks';
import { getCurrentStore } from 'app/inventory/stores-helpers';
import ErrorPanel from 'app/shell/ErrorPanel';
import { RootState, ThunkDispatchProp } from 'app/store/types';
import { useEventBusListener } from 'app/utils/hooks';
import { DestinyProfileResponse } from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { DestinyAccount } from '../accounts/destiny-account';
import { D2ManifestDefinitions } from '../destiny2/d2-definitions';
import Countdown from '../dim-ui/Countdown';
import ErrorBoundary from '../dim-ui/ErrorBoundary';
import { mergeCollectibles } from '../inventory/d2-stores';
import { InventoryBuckets } from '../inventory/inventory-buckets';
import {
  bucketsSelector,
  ownedItemsSelector,
  profileResponseSelector,
  storesSelector,
} from '../inventory/selectors';
import { DimStore } from '../inventory/store-types';
import { loadingTracker } from '../shell/loading-tracker';
import { refresh$ } from '../shell/refresh';
import { loadAllVendors } from './actions';
import { toVendor } from './d2-vendors';
import type { VendorsState } from './reducer';
import styles from './SingleVendor.m.scss';
import vendorStyles from './Vendor.m.scss';
import VendorItems from './VendorItems';

interface ProvidedProps {
  account: DestinyAccount;
  vendorHash: number;
}

interface StoreProps {
  stores: DimStore[];
  defs?: D2ManifestDefinitions;
  buckets?: InventoryBuckets;
  ownedItemHashes: Set<number>;
  profileResponse?: DestinyProfileResponse;
  vendors: VendorsState['vendorsByCharacter'];
}

function mapStateToProps() {
  const ownedItemSelectorInstance = ownedItemsSelector();
  return (state: RootState): StoreProps => ({
    stores: storesSelector(state),
    ownedItemHashes: ownedItemSelectorInstance(state),
    buckets: bucketsSelector(state),
    defs: state.manifest.d2Manifest,
    profileResponse: profileResponseSelector(state),
    vendors: state.vendors.vendorsByCharacter,
  });
}

type Props = ProvidedProps & StoreProps & ThunkDispatchProp;

/**
 * A page that loads its own info for a single vendor, so we can link to a vendor or show engram previews.
 */
function SingleVendor({
  account,
  stores,
  buckets,
  ownedItemHashes,
  defs,
  profileResponse,
  vendorHash,
  dispatch,
  vendors,
}: Props) {
  const { search } = useLocation();

  // TODO: get for all characters, or let people select a character? This is a hack
  // we at least need to display that character!
  const characterId =
    (search && new URLSearchParams(search).get('characterId')) ||
    (stores.length && getCurrentStore(stores)?.id);
  if (!characterId) {
    throw new Error('no characters chosen or found to use for vendor API call');
  }

  const vendorData = characterId ? vendors[characterId] : undefined;
  const vendorResponse = vendorData?.vendorsResponse;

  const returnWithVendorRequest = defs?.Vendor.get(vendorHash)?.returnWithVendorRequest;
  useEventBusListener(
    refresh$,
    useCallback(() => {
      if (returnWithVendorRequest) {
        loadingTracker.addPromise(dispatch(loadAllVendors(account, characterId)));
      }
    }, [account, characterId, dispatch, returnWithVendorRequest])
  );

  useEffect(() => {
    if (characterId && defs?.Vendor.get(vendorHash)?.returnWithVendorRequest) {
      dispatch(loadAllVendors(account, characterId));
    }
  }, [account, characterId, defs, dispatch, vendorHash]);

  useLoadStores(account, stores.length > 0);

  if (!defs || !buckets) {
    return <ShowPageLoading message={t('Manifest.Load')} />;
  }

  const vendorDef = defs.Vendor.get(vendorHash);
  if (!vendorDef) {
    return <ErrorPanel error={new Error(`No known vendor with hash ${vendorHash}`)} />;
  }

  if (vendorData?.error) {
    return <ErrorPanel error={vendorData.error} />;
  }
  if (vendorDef.returnWithVendorRequest) {
    if (!profileResponse) {
      return <ShowPageLoading message={t('Loading.Profile')} />;
    }
    if (!vendorResponse) {
      return <ShowPageLoading message={t('Loading.Vendors')} />;
    }
  }

  // TODO:
  // * featured item
  // * enabled
  // * filter by character class
  // * load all classes?
  const vendor = vendorResponse?.vendors.data?.[vendorHash];

  const destinationDef =
    vendor?.vendorLocationIndex && vendorDef.locations[vendor.vendorLocationIndex]
      ? defs.Destination.get(vendorDef.locations[vendor.vendorLocationIndex].destinationHash)
      : undefined;
  const placeDef = destinationDef && defs.Place.get(destinationDef.placeHash);

  const placeString = [destinationDef?.displayProperties.name, placeDef?.displayProperties.name]
    .filter((n) => n?.length)
    .join(', ');
  // TODO: there's a cool background image but I'm not sure how to use it

  const mergedCollectibles = profileResponse
    ? mergeCollectibles(profileResponse.profileCollectibles, profileResponse.characterCollectibles)
    : {};

  const d2Vendor = toVendor(
    vendorHash,
    defs,
    buckets,
    vendor,
    account,
    vendorResponse?.itemComponents[vendorHash],
    vendorResponse?.sales.data?.[vendorHash]?.saleItems,
    mergedCollectibles
  );

  if (!d2Vendor) {
    return <ErrorPanel error={new Error(`No known vendor with hash ${vendorHash}`)} />;
  }

  return (
    <div className={clsx(styles.page, 'dim-page')}>
      <ErrorBoundary name="SingleVendor">
        <div className={styles.featuredHeader}>
          <h1>
            {d2Vendor.def.displayProperties.name}{' '}
            <span className={vendorStyles.location}>{placeString}</span>
          </h1>
          <div>{d2Vendor.def.displayProperties.description}</div>
          {d2Vendor.component && (
            <div>
              Inventory updates in{' '}
              <Countdown endTime={new Date(d2Vendor.component.nextRefreshDate)} />
            </div>
          )}
        </div>
        <VendorItems
          defs={defs}
          vendor={d2Vendor}
          ownedItemHashes={ownedItemHashes}
          currencyLookups={vendorResponse?.currencyLookups.data?.itemQuantities ?? {}}
          characterId={characterId}
        />
      </ErrorBoundary>
    </div>
  );
}

export default connect<StoreProps>(mapStateToProps)(SingleVendor);
