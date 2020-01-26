# Sava [![npm Package](https://img.shields.io/npm/v/sava.svg)](https://www.npmjs.org/package/sava)
A tiny module that lets you check whether the server is responding or not



## Usage

```javascript
const ServiceAvailability = require('sava');

let health = new ServiceAvailability({ 
   url: 'https://domain.com/content/ping.jpg',
   body_size: 276423,
   timeout: 30,
   interval: 60, 
   max_errors_streak: 10,
   messages: {
      OK: 'Works fine',
      TIMEOUT: '500',
      NOT_FOUND: '404',
      WRONG_BODY_SIZE: 'Wrong response size: %s bytes',
   }
})

health.on('update', (data) => {
   // => {"date":"2020-01-23T22:37:15.820Z","status":"error","message":"404","delay":2503}
})

health.on('alarm', () => {
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
   console.log('  ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM  ');
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
})


health.schedule();
```

