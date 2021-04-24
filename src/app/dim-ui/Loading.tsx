import React, { useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './Loading.scss';

export function Loading({ message }: { message?: string }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <section className="dim-loading">
      <div className="logo-container">
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
        <div className="logo-square" />
      </div>

      {message && (
        <TransitionGroup className="loading-text-container">
          <CSSTransition
            key={message}
            nodeRef={nodeRef}
            classNames="loading-text"
            timeout={{ enter: 200, exit: 200 }}
          >
            <div ref={nodeRef} className="loading-text">
              {message}
            </div>
          </CSSTransition>
        </TransitionGroup>
      )}
    </section>
  );
}
