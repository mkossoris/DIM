import { infoLog } from 'app/utils/log';
import { Observable } from 'app/utils/observable';
import { DimItem } from '../inventory/item-types';

export const showItemPopup$ = new Observable<
  | {
      item?: DimItem;
      element?: HTMLElement;
      extraInfo?: ItemPopupExtraInfo;
    }
  | undefined
>(undefined);

// Extra optional info for Vendors/Collectibles.
export interface ItemPopupExtraInfo {
  failureStrings?: string[];
  owned?: boolean;
  acquired?: boolean;
  mod?: boolean;
}

export function showItemPopup(
  item: DimItem,
  element?: HTMLElement,
  extraInfo?: ItemPopupExtraInfo
) {
  if (showItemPopup$.getCurrentValue()?.item === item) {
    hideItemPopup();
  } else {
    // Log the item so it's easy to inspect item structure by clicking on an item
    if ($DIM_FLAVOR !== 'release') {
      infoLog('clicked item', `https://data.destinysets.com/i/InventoryItem%3A${item.hash}`, item);
    }
    showItemPopup$.next({ item, element, extraInfo });
  }
}

export function hideItemPopup() {
  showItemPopup$.next(undefined);
}
