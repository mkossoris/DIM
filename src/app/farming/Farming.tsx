import { settingsSelector } from 'app/dim-api/selectors';
import { t } from 'app/i18next-t';
import { RootState, ThunkDispatchProp } from 'app/store/types';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { DimStore } from '../inventory/store-types';
import { setSetting } from '../settings/actions';
import { stopFarming } from './actions';
import './farming.scss';
import { farmingStoreSelector } from './selectors';

interface StoreProps {
  makeRoomForItems: boolean;
  store?: DimStore;
}

function mapStateToProps() {
  const storeSelector = farmingStoreSelector();
  return (state: RootState): StoreProps => ({
    makeRoomForItems: settingsSelector(state).farmingMakeRoomForItems,
    store: storeSelector(state),
  });
}

type Props = StoreProps & ThunkDispatchProp;

function Farming({ store, makeRoomForItems, dispatch }: Props) {
  const makeRoomForItemsChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked;
    dispatch(setSetting('farmingMakeRoomForItems', value));
  };

  const nodeRef = useRef<HTMLDivElement>(null);

  const onStopClicked = () => {
    dispatch(stopFarming());
  };

  return (
    <TransitionGroup component={null}>
      {store && (
        <CSSTransition nodeRef={nodeRef} classNames="farming" timeout={{ enter: 500, exit: 500 }}>
          <div
            ref={nodeRef}
            id="item-farming"
            className={clsx({ 'd2-farming': store.destinyVersion === 2 })}
          >
            {store.destinyVersion === 2 ? (
              <div>
                <p>
                  {t('FarmingMode.D2Desc', {
                    store: store.name,
                    context: store.genderName,
                  })}
                </p>
              </div>
            ) : (
              <div>
                <p>
                  {makeRoomForItems
                    ? t('FarmingMode.Desc', {
                        store: store.name,
                        context: store.genderName,
                      })
                    : t('FarmingMode.MakeRoom.Desc', {
                        store: store.name,
                        context: store.genderName,
                      })}
                </p>
                <p>
                  <input
                    name="make-room-for-items"
                    type="checkbox"
                    checked={makeRoomForItems}
                    onChange={makeRoomForItemsChanged}
                  />
                  <label htmlFor="make-room-for-items" title={t('FarmingMode.MakeRoom.Tooltip')}>
                    {t('FarmingMode.MakeRoom.MakeRoom')}
                  </label>
                </p>
              </div>
            )}

            <div>
              <button type="button" onClick={onStopClicked}>
                {t('FarmingMode.Stop')}
              </button>
            </div>
          </div>
        </CSSTransition>
      )}
    </TransitionGroup>
  );
}

export default connect<StoreProps>(mapStateToProps)(Farming);
