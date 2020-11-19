# Signature-Memo

A website to collectively sign a virtual card, whether it's for an upcoming birthday or just to say thank you!

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
