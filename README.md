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
   max_ping: 800,
   max_errors_streak: 10,
   messages: {
      timeout: 'Server does not respond',
      not_found: 'Wrong url',
      high_ping: 'Ping is %s ms above the maximum',
      wrong_body_size: 'Wrong response body size: %s bytes',
      init_failed: 'Initialization failed, the file is not available'
   }
})

health.on('update', (data) => {
   // => { date: "2020-01-23 22:37:15", status: "error", details: [ "404" ], ping: 2503 }
})

health.on('alarm', () => {
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
   console.log('  ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM ALARM  ');
   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
})


health.schedule();
```


If you dont't want to calculate `body_size` of your reference file, you can call `init()` method, that will do that for you:

```js
health.on('init', ({ size }) => {
   health.schedule();
   console.log('size:', size);
}); 

health.init();
```

Received `body_size` will be saved to a '.cache' file.

