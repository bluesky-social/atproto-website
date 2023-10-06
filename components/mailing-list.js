import React from 'react';

export default function DevMailingListSubscription({ isFooter }) {
  const containerClass = isFooter ? 'dev-subscription-footer' : 'dev-subscription';
  const inputClass = isFooter ? 'email-input-footer' : 'email-input';
  return (
    <div className={containerClass}>
      {!isFooter && <hr className="dev-subscription-bar"></hr>}
      <h3>To receive atproto updates in your inbox, subscribe to the developer mailing list.</h3>
      <form action="https://api.mailmodo.com/api/v1/at/f/-Ds0vhHmIT/bee5e09c-9924-5634-9dc1-16922d543ef3" method="post">
        <input className={inputClass} type="email" name="email" placeholder="Your email" required />
        <button className="subscribe-button" type="submit">Subscribe</button>
      </form>
    </div>
  );
}
