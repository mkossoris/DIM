import MenuAccounts from 'app/accounts/MenuAccounts';
import { currentAccountSelector } from 'app/accounts/selectors';
import Sheet from 'app/dim-ui/Sheet';
import { Hotkey } from 'app/hotkeys/hotkeys';
import { useHotkeys } from 'app/hotkeys/useHotkey';
import { t } from 'app/i18next-t';
import { accountRoute } from 'app/routes';
import { SearchFilterRef } from 'app/search/SearchBar';
import { RootState, ThunkDispatchProp } from 'app/store/types';
import { useSetCSSVarToHeight } from 'app/utils/hooks';
import { infoLog } from 'app/utils/log';
import clsx from 'clsx';
import logo from 'images/logo-type-right-light.svg';
import _ from 'lodash';
import Mousetrap from 'mousetrap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useSubscription } from 'use-subscription';
import { DestinyAccount } from '../accounts/destiny-account';
import ClickOutside from '../dim-ui/ClickOutside';
import ExternalLink from '../dim-ui/ExternalLink';
import { default as SearchFilter } from '../search/SearchFilter';
import WhatsNewLink from '../whats-new/WhatsNewLink';
import { setSearchQuery } from './actions';
import { installPrompt$ } from './app-install';
import AppInstallBanner from './AppInstallBanner';
import styles from './Header.m.scss';
//import './header.scss';
import { AppIcon, menuIcon, searchIcon, settingsIcon } from './icons';
import MenuBadge from './MenuBadge';
import PostmasterWarningBanner from './PostmasterWarningBanner';
import Refresh from './refresh';

const bugReport = 'https://github.com/DestinyItemManager/DIM/issues';

interface StoreProps {
  account?: DestinyAccount;
  isPhonePortrait: boolean;
}

const logoStyles = {
  beta: styles.beta,
  dev: styles.dev,
};

const transitionClasses = {
  enter: styles.dropdownEnter,
  enterActive: styles.dropdownEnterActive,
  exit: styles.dropdownExit,
  exitActive: styles.dropdownExitActive,
};

// TODO: finally time to hack apart the header styles!

type Props = StoreProps & ThunkDispatchProp;

function mapStateToProps(state: RootState): StoreProps {
  return {
    account: currentAccountSelector(state),
    isPhonePortrait: state.shell.isPhonePortrait,
  };
}

function Header({ account, isPhonePortrait, dispatch }: Props) {
  // Hamburger menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownToggler = useRef<HTMLAnchorElement>(null);
  const toggleDropdown = useCallback((e) => {
    e.preventDefault();
    setDropdownOpen((dropdownOpen) => !dropdownOpen);
  }, []);

  const hideDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Mobile search bar
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => setShowSearch((showSearch) => !showSearch);
  const hideSearch = useCallback(() => {
    if (showSearch) {
      setShowSearch(false);
    }
  }, [showSearch]);

  // Install DIM as a PWA
  const [promptIosPwa, setPromptIosPwa] = useState(false);
  const installPromptEvent = useSubscription(installPrompt$);

  const showInstallPrompt = () => {
    setPromptIosPwa(true);
    setDropdownOpen(false);
  };

  const installDim = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          infoLog('install', 'User installed DIM to desktop/home screen');
        } else {
          infoLog('install', 'User dismissed the install prompt');
        }
        installPrompt$.next(undefined);
      });
    } else {
      showInstallPrompt();
    }
  };

  // Is this running as an installed app?
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  const iosPwaAvailable =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && !isStandalone;

  const installable = installPromptEvent || iosPwaAvailable;

  // Search filter
  const searchFilter = useRef<SearchFilterRef>(null);

  // Clear filter and close dropdown on path change
  const { pathname } = useLocation();
  useEffect(() => {
    setDropdownOpen(false);
    dispatch(setSearchQuery(''));
  }, [dispatch, pathname]);

  // Focus search when shown
  useEffect(() => {
    if (searchFilter.current && showSearch) {
      searchFilter.current.focusFilterInput();
    }
  }, [showSearch]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const bugReportLink = $DIM_FLAVOR !== 'release';

  // Generic links about DIM
  const dimLinks = (
    <>
      <NavLink to="/about" className={styles.menuItem} activeClassName={styles.active}>
        {t('Header.About')}
      </NavLink>
      <WhatsNewLink className={styles.menuItem} />
      {bugReportLink && (
        <ExternalLink className={styles.menuItem} href={bugReport}>
          {t('Header.ReportBug')}
        </ExternalLink>
      )}
      {isStandalone && (
        <a className={styles.menuItem} onClick={() => window.location.reload()}>
          {t('Header.ReloadApp')}
        </a>
      )}
    </>
  );

  let links: {
    to: string;
    text: string;
    badge?: React.ReactNode;
  }[] = [];
  if (account) {
    const path = accountRoute(account);
    links = _.compact([
      {
        to: `${path}/inventory`,
        text: t('Header.Inventory'),
      },
      account.destinyVersion === 2 && {
        to: `${path}/progress`,
        text: t('Progress.Progress'),
      },
      {
        to: `${path}/vendors`,
        text: t('Vendors.Vendors'),
      },
      account.destinyVersion === 2 && {
        to: `${path}/records`,
        text: t('Records.Title'),
      },
      {
        to: `${path}/optimizer`,
        text: t('LB.LB'),
      },
      {
        to: `${path}/organizer`,
        text: t('Organizer.Organizer'),
      },
      account.destinyVersion === 1 && {
        to: `${path}/record-books`,
        text: t('RecordBooks.RecordBooks'),
      },
      account.destinyVersion === 1 && {
        to: `${path}/activities`,
        text: t('Activities.Activities'),
      },
    ]);
  }

  const linkNodes = links.map((link) => (
    <NavLink className={styles.menuItem} key={link.to} to={link.to} activeClassName={styles.active}>
      {link.badge}
      {link.text}
    </NavLink>
  ));

  // Links about the current Destiny version
  const destinyLinks = <>{linkNodes}</>;
  const reverseDestinyLinks = <>{linkNodes.slice().reverse()}</>;

  const hotkeys: Hotkey[] = [
    {
      combo: 'm',
      description: t('Hotkey.Menu'),
      callback: toggleDropdown,
    },
    {
      combo: 'f',
      description: t('Hotkey.StartSearch'),
      callback: (event) => {
        if (searchFilter.current) {
          searchFilter.current.focusFilterInput();
          if (isPhonePortrait) {
            setShowSearch(true);
          }
        }
        event.preventDefault();
        event.stopPropagation();
      },
    },
    {
      combo: 'shift+f',
      description: t('Hotkey.StartSearchClear'),
      callback: (event) => {
        if (searchFilter.current) {
          searchFilter.current.clearFilter();
          searchFilter.current.focusFilterInput();
          if (isPhonePortrait) {
            setShowSearch(true);
          }
        }
        event.preventDefault();
        event.stopPropagation();
      },
    },
  ];
  useHotkeys(hotkeys);

  const showKeyboardHelp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    Mousetrap.trigger('?');
    setDropdownOpen(false);
  };

  // Calculate the true height of the header, for use in other things
  const headerRef = useRef<HTMLDivElement>(null);
  useSetCSSVarToHeight(headerRef, '--header-height');

  return (
    <header className={styles.container} ref={headerRef}>
      <div className={styles.header}>
        <a
          className={clsx(styles.menuItem, styles.menu)}
          ref={dropdownToggler}
          onClick={toggleDropdown}
          role="button"
          aria-haspopup="menu"
          aria-label={t('Header.Menu')}
          aria-expanded={dropdownOpen}
        >
          <AppIcon icon={menuIcon} />
          <MenuBadge />
        </a>
        <TransitionGroup component={null}>
          {dropdownOpen && (
            <CSSTransition
              nodeRef={dropdownRef}
              classNames={transitionClasses}
              timeout={{ enter: 500, exit: 500 }}
            >
              <ClickOutside
                ref={dropdownRef}
                extraRef={dropdownToggler}
                key="dropdown"
                className={styles.dropdown}
                onClickOutside={hideDropdown}
                role="menu"
              >
                {destinyLinks}
                <hr />
                <NavLink className={styles.menuItem} to="/settings" activeClassName={styles.active}>
                  {t('Settings.Settings')}
                </NavLink>
                {!isPhonePortrait && (
                  <a className={styles.menuItem} onClick={showKeyboardHelp}>
                    {t('Header.KeyboardShortcuts')}
                  </a>
                )}
                <ExternalLink
                  className={styles.menuItem}
                  href="https://destinyitemmanager.fandom.com/wiki/Category:User_Guide"
                >
                  {t('General.UserGuideLink')}
                </ExternalLink>
                {installable && (
                  <a className={styles.menuItem} onClick={installDim}>
                    {t('Header.InstallDIM')}
                  </a>
                )}
                {dimLinks}
                <MenuAccounts closeDropdown={hideDropdown} />
              </ClickOutside>
            </CSSTransition>
          )}
        </TransitionGroup>
        <Link to="/" className={clsx(styles.menuItem, styles.logoLink)}>
          <img
            className={clsx(styles.logo, logoStyles[$DIM_FLAVOR])}
            title={`v${$DIM_VERSION} (${$DIM_FLAVOR})`}
            src={logo}
            alt="DIM"
            aria-label="dim"
          />
        </Link>
        <div className={styles.headerLinks}>{reverseDestinyLinks}</div>
        <div className={styles.headerRight}>
          {account && !isPhonePortrait && (
            <span className="search-link">
              <SearchFilter onClear={hideSearch} ref={searchFilter} />
            </span>
          )}
          <Refresh className={clsx(styles.menuItem)} />
          {!isPhonePortrait && (
            <Link className={styles.menuItem} to="/settings" title={t('Settings.Settings')}>
              <AppIcon icon={settingsIcon} />
            </Link>
          )}
          <span className={clsx(styles.menuItem, 'search-button')} onClick={toggleSearch}>
            <AppIcon icon={searchIcon} />
          </span>
        </div>
      </div>
      {account && isPhonePortrait && showSearch && (
        <span className="mobile-search-link">
          <SearchFilter onClear={hideSearch} ref={searchFilter} />
        </span>
      )}
      <PostmasterWarningBanner />
      {isPhonePortrait && installable && <AppInstallBanner onClick={installDim} />}
      {promptIosPwa &&
        ReactDOM.createPortal(
          <Sheet header={<h1>{t('Header.InstallDIM')}</h1>} onClose={() => setPromptIosPwa(false)}>
            <p className={styles.pwaPrompt}>{t('Header.IosPwaPrompt')}</p>
          </Sheet>,
          document.body
        )}
    </header>
  );
}

export default connect(mapStateToProps)(Header);
