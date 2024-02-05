import React from 'react';

export default function DevMailingListSubscription({ isFooter }) {
  const containerClass = isFooter ? 'dev-subscription-footer' : 'dev-subscription';
  const inputClass = isFooter ? 'email-input-footer' : 'email-input';
  return (
    <div className={containerClass}>
      {!isFooter && <hr className="dev-subscription-bar"></hr>}
      <h3>To receive developer updates from Bluesky in your inbox, subscribe to the developer mailing list.</h3>
      <form action="https://api.mailmodo.com/api/v1/at/f/lQtwgpiir6/1b8faade-4671-5d62-9c1c-6cf4063b2bd4" method="post">
        <input className={inputClass} type="email" name="email" placeholder="Your email" required />
        <button className="subscribe-button" type="submit">Subscribe</button>
      </form>
    </div>
  );
}
