# InstaSEPA

InstaSEPA is a payment form storage app. The idea is to add your payment forms (either scanning their QR code or entering data manually), 
then a code can be recreated at any time. At the moment the app supports UPNQR standard used in Slovenia, but could be generalized to support 

The app is actually a single page webpage with support for PWA, so it can be added to your mobile phone or desktop. For me it was a practice project to 
explore modern JavaScript and NPM ecosystem. As such it uses only simple libraries (no React, etc.).

The app is officially deployed at [sepa.iqu.si](https://sepa.iqu.si), all information is stored on your local device.

## Using

TODO

## Building

Use NPM to install dependencies and build:

```
npm install && npm run build
```

If you would like to build a development version, use `npm run build`.

## Contributing

Sure, you are welcome. Bugs can be reported via issue tracker. Some planned features are:

 * More input validation
 * Monitor due date, show notifications
 * Archive, mark as payed
 * Split form into multiple
 * Better mobile support


