import { currentAccountSelector } from 'app/accounts/selectors';
import { RootState } from 'app/store/types';
import { errorLog } from 'app/utils/log';
import { observeStore } from 'app/utils/redux-utils';
import { set } from 'idb-keyval';
import _ from 'lodash';

/**
 * Set up an observer on the store that'll save item infos to sync service (google drive).
 * We specifically watch the legacy state, not the new one.
 */
export const saveItemInfosOnStateChange = _.once(() => {
  // Sneak in another observer for saving new-items to IDB
  observeStore(
    (state: RootState) => state.inventory.newItems,
    _.debounce(async (_, newItems, rootState) => {
      const account = currentAccountSelector(rootState);
      if (account) {
        const key = `newItems-m${account.membershipId}-d${account.destinyVersion}`;
        try {
          return await set(key, newItems);
        } catch (e) {
          errorLog('new-items', "Couldn't save new items", e);
        }
      }
    }, 1000)
  );
});
