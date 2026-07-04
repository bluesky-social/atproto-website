# Notes to add onto the account-migration guide

# Points covered not in the guide
- Talk about how the whole process does not have to be done now. I talk about how you can bail but prob need more


# still to be done

- Talk about client vs server 
- OAuth claims
- PLC token timeout?
- Manual PLC sign overs?
- Talk about the PLC does not validate all PLC opertions for this. Like double rotation keys (will need testing)
- Talk about dangers of migrations, and what isn't a danger. Like blob reuploads or repo uploads
- Talk about how some PDSs have account creation locked down and need an orginal account there (*cough bksy.social*, but kindly cause it is valid)
- Not sure if to talk about it?
- - Appview jail?
- - Sequence mixmatch
- - invalid.handle from the appview
- Explain how Bluesky(but say some applications) may still ahve you logged in and show a deactivated screen, this is normal and expected for you to manually log out


Rough resume draft
- Check if the account exists on the new PDS, check the plc for extra validation if you would like
- Login
- Always reupload repo (maybe give the since a try and see if that works? I think it might tbh)
- Recommended to use missing blogs, but list blobs on first run
- prefers are take all give all
- PLC signs the identity over to the new PDS's account


# talked about
- Talk about blob upload rate limits, explain how those show on headers and what they are
- Talk about upload fails because of ram, and cors (will need to check this)
- Maybe talk about how there are multiple accounts but one identity?
- Talk about how an account can be created with a signed verification token as well
- Talk about how a repo can be reuploaded.


# Repo notes
- The since flag import does work 
- "Failed to fetch" I assume it's the connection being dropped at the PDS level
- In a web browser this can appear as a CORS error
