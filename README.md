# Birthday

A website to collect messages for your friend's upcoming birthday!

## Firebase Rules

**Realtime Database**

```JSON
{
	"rules": {
		".read": false,
		".write": false,
		"person": {
			".read": true,
			".write": false,
      "$url": {
				".read": true,
				".write": false,
        "messages": {
          ".read": true,
          "$pushKey": {
            ".read": true,
            ".write": "!data.exists()"
          }
        }
      }
		}
	}
}
```

**Storage**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write;
    }
  }
}
```
