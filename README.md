# Sava [![npm Package](https://img.shields.io/npm/v/sava.svg)](https://www.npmjs.org/package/sava)

## Usage

```javascript
const ServiceAvailability = require('sava');

let health = new ServiceAvailability({ 
   url: 'https://domain.com/content/ping.jpg',
   body_size: 276423,
   timeout: 30,
   interval: 60, 
   max_errors_streak: 10,
})

health.on('update', (data) => {
   // => {"date":"2020-01-23T22:37:15.820Z","status":"error","message":"wrong url","delay":2503}
})

health.on('alarm', () => {
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
   console.log('  ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM  ');
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
})


health.schedule();

```

