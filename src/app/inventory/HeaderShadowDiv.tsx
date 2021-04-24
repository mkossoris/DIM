import { useSetCSSVarToHeight } from 'app/utils/hooks';
import React, { useRef } from 'react';
import styles from './HeaderShadowDiv.m.scss';

// Also sets `--store-header-height` to the height of `children`
export default React.memo(({ children, ...divProps }: React.HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);
  useSetCSSVarToHeight(ref, '--store-header-height');
  return (
    <>
      <div {...divProps} ref={ref}>
        {children}
      </div>
      <div className={styles.shadow}></div>
      <div className={styles.cover}></div>
    </>
  );
});
